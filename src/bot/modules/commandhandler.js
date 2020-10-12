const fs = require('fs')
const path = require('path')
const { memberChannelPerms } = require('../../../lib/utils/permissionCalculator')
const { v4 } = require('uuid')

const allCommands = fs.readdirSync(path.resolve('src', 'bot', 'commands')).map(f => require(path.resolve('src', 'bot', 'commands', f))).reduce((map, file) => { map[file.name] = file; return map }, {})
const creatorIds = process.env.CREATOR_IDS ? process.env.CREATOR_IDS.split('|') : ['212445217763229699']

module.exports = async message => {
  if (!!message.author.bot || !message.member) return
  if (message.content.startsWith(process.env.GLOBAL_BOT_PREFIX)) {
    const cmd = message.content.substring(process.env.GLOBAL_BOT_PREFIX.length).split(' ')[0].toLowerCase()
    const splitSuffix = message.content.substr(process.env.GLOBAL_BOT_PREFIX).split(' ')
    const suffix = splitSuffix.slice(1, splitSuffix.length).join(' ')
    await processCommand(message, cmd, suffix)
  }
}

async function processCommand (message, commandName, suffix) {
  const command = allCommands[commandName]
  if (!command) return
  const mp = await memberChannelPerms(message.channel_id, { ...message.member, ...message.author, guild_id: message.guild_id })
  const guild = await global.LoggerBot.getGuild(message.guild_id)
  const botMember = guild.members[global.LoggerBot.user.id]
  if (!botMember) return
  const bp = await memberChannelPerms(message.channel_id, { ...botMember, guild_id: guild.id })
  if (!bp.readMessages || !bp.sendMessages || !bp.manageWebhooks || !bp.viewAuditLogs) return
  if ((command.noDM || command.perm || command.type === 'admin') && !message.guild_id) {
    global.LoggerBot.requestClient.createMessage(message.channel_id, 'You cannot use this command in a DM!')
    return
  } else if (creatorIds.includes(message.author.id)) {
    global.ConsoleLog.command(`Developer override by ${message.author.username}#${message.author.discriminator} at ${new Date().toUTCString()} command ${commandName} with ${suffix}`)
    command.func(message, suffix)
    return
  } else if (command.type === 'creator' && !creatorIds.includes(message.author.id)) {
    return
  } else if (command.type === 'admin' && !mp.administrator) {
    global.LoggerBot.requestClient.createMessage(message.channel_id, 'That\'s an admin only command. You need the administrator permission to use it.')
    return
  } else if (command.perm && !(message.member.permission.has(command.perm) || message.author.id === message.channel.guild.ownerID)) {
    global.LoggerBot.requestClient.createMessage(message.channel_id, `This command requires you to be the owner of the server, or have the ${command.perm} permission.`)
    return
  }
  global.ConsoleLog.command(`${message.author.username}#${message.author.discriminator} (${message.author.id}) in ${message.channel_id} sent ${commandName} with the args "${suffix}". The guild is called uh oh, owned by uh oh and has uh oh members.`)
  command.func(message, suffix)
}
