const send = require('../modules/webhooksender')
// const { getMessageById, updateMessageByID } = require('../../database/interfaces/postgres')
const { getMessageById, updateMessageByID } = require('../../database/interfaces/lmdb')
const { getMessageFromBatch } = require('../../database/messagebatcher')
const { getGuildSettings } = require('../guildSettingsCache')
const { makeAvatarURL } = require('../../../lib/utils/userutils')

module.exports = {
  name: 'messageUpdate',
  type: 'on',
  handle: async (newMessage) => {
    if (!newMessage.guild_id || !newMessage.author) return
    if (newMessage.author.id === global.LoggerBot.user.id) return
    let oldMessage = await getMessageFromBatch(newMessage.id)
    if (!oldMessage) {
      oldMessage = await getMessageById(newMessage.id)
    }
    if (!oldMessage) return
    const guildSettings = await getGuildSettings(newMessage.guild_id)
    if (newMessage.author.bot) {
      if (guildSettings.log_bots) await processMessage(newMessage, oldMessage)
    } else if (newMessage.content !== oldMessage.content) {
      await processMessage(newMessage, oldMessage)
    }
    async function processMessage (newMessage, oldMessage) {
      const guild = await global.LoggerBot.getGuild(newMessage.guild_id)
      const channel = guild.channels.find(c => c.id === newMessage.channel_id)
      const messageUpdateEvent = {
        guildID: newMessage.guild_id,
        eventName: 'messageUpdate',
        embed: {
          author: {
            name: `${newMessage.author.username}#${newMessage.author.discriminator}`,
            iconUrl: makeAvatarURL(newMessage.author)
          },
          description: `**${newMessage.author.username}#${newMessage.author.discriminator}** updated their message in <#${channel.id}> (${channel.name}).`,
          fields: [{
            name: 'Channel',
            value: `<#${channel.id}> (${channel.name})\n[Go To Message](https://discordapp.com/channels/${newMessage.guild_id}/${newMessage.channel_id}/${newMessage.id})`
          }],
          color: 15084269
        }
      }
      const nowChunks = []
      const beforeChunks = []
      if (newMessage.content) {
        if (newMessage.content.length > 1024) {
          nowChunks.push(newMessage.content.replace(/\"/g, '"').replace(/`/g, '').substring(0, 1023))
          nowChunks.push(newMessage.content.replace(/\"/g, '"').replace(/`/g, '').substring(1024, newMessage.content.length))
        } else {
          nowChunks.push(newMessage.content)
        }
      } else {
        nowChunks.push('None')
      }
      if (oldMessage.content) {
        if (oldMessage.content.length > 1024) {
          beforeChunks.push(oldMessage.content.replace(/\"/g, '"').replace(/`/g, '').substring(0, 1023))
          beforeChunks.push(oldMessage.content.replace(/\"/g, '"').replace(/`/g, '').substring(1024, oldMessage.content.length))
        } else {
          beforeChunks.push(oldMessage.content)
        }
      } else {
        beforeChunks.push('None')
      }
      nowChunks.forEach((chunk, i) => {
        messageUpdateEvent.embed.fields.push({
          name: i === 0 ? 'Now' : 'Now Continued',
          value: chunk
        })
      })
      beforeChunks.forEach((chunk, i) => {
        messageUpdateEvent.embed.fields.push({
          name: i === 0 ? 'Previous' : 'Previous Continued',
          value: chunk
        })
      })
      messageUpdateEvent.embed.fields.push({
        name: 'ID',
        value: `\`\`\`ini\nUser = ${newMessage.author.id}\nMessage = ${newMessage.id}\`\`\``
      })
      await send(messageUpdateEvent)
      await updateMessageByID(newMessage.id, newMessage.content)
    }
  }
}
