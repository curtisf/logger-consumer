const { memberChannelPerms, memberGuildPermsJSON } = require('../../../lib/utils/permissionCalculator')
const { idToTimeMs, makeAvatarURL } = require('../../../lib/utils/userutils')
const notablePermissions = [
  'kickMembers',
  'banMembers',
  'administrator',
  'manageChanneks',
  'manageGuilds',
  'manageMessages',
  'manageRoles',
  'manageEmojis',
  'manageWebhooks',
  'voicePrioritySpeaker'
]

module.exports = {
  func: async message => {
    let user = { member: message.member, ...message.author }
    if (message.mentions.length !== 0) user = message.mentions[0]
    const fields = []
    const perms = []
    let color = 12552203 // away color
    // Member status property missing???
    // if (member.status === 'online') {
    //   color = 8383059
    // } else if (member.status === 'offline') {
    //   color = 12041157
    // } else if (member.status === 'dnd') {
    //   color = 16396122
    // }
    const guild = await global.LoggerBot.getGuild(message.guild_id)
    if (!guild) return
    const memberPerms = await memberChannelPerms(message.channel_id, { ...user.member, id: user.id, guild_id: message.guild_id })
    Object.keys(memberPerms).forEach((perm) => {
      if (memberPerms[perm] === true && notablePermissions.indexOf(perm) !== -1) {
        perms.push(perm)
      }
    })
    if (perms.length === 0) {
      perms.push('None')
    }
    fields.push({
      name: 'Name',
      value: `**${user.username}#${user.discriminator}** ${user.member.nick ? `(**${user.member.nick}**)` : ''} (${user.id})`
    }, {
      name: 'Join Date',
      value: `**${new Date(user.member.joined_at)}** (${Math.round((new Date().getTime() - new Date(user.member.joined_at).getTime()) / (1000 * 60 * 60 * 24))} days)`
    }, {
      name: 'Creation Date',
      value: `**${new Date(idToTimeMs(user.id)).toString().substr(0, 21)}**`
    }, {
      name: 'Roles',
      value: `${user.member.roles.length !== 0 ? user.member.roles.map(r => `\`${guild.roles.find(gr => gr.id === r).name}\``).join(', ') : 'None'}`
    }, {
      name: 'Notable Permissions',
      value: `\`${perms.join(', ')}\``
    })
    global.LoggerBot.requestClient.createMessage(message.channel_id, {
      embed: {
        timestamp: new Date(message.timestamp),
        color: color,
        thumbnail: {
          url: makeAvatarURL(user)
        },
        fields: fields
      }
    }).catch(() => { })
  },
  name: 'userinfo',
  description: 'Use this with a mention to get info about a user.', // The restriction of using a mention is very intentional.
  type: 'any',
  category: 'General'
}
