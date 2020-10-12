const { getOverwritePermsJSON } = require('../../../lib/utils/permissionCalculator')
const { makeAvatarURL, idToTimeMs } = require('../../../lib/utils/userutils')
const send = require('../modules/webhooksender')
const CHANNEL_TYPE_MAP = {
  0: 'Text channel',
  2: 'Voice channel',
  4: 'Category'
}

module.exports = {
  name: 'channelDelete',
  type: 'on',
  handle: async channel => {
    if (channel.type === 1 || channel.type === 3) return
    const channelDeleteEvent = {
      guildID: channel.guild_id,
      eventName: 'channelDelete',
      embed: {
        author: {
          name: 'Unknown User',
          icon_url: 'http://laoblogger.com/images/outlook-clipart-red-x-10.jpg'
        },
        description: `${CHANNEL_TYPE_MAP[channel.type]} deleted (${channel.name})`,
        fields: [{
          name: 'Name',
          value: channel.name
        }, {
          name: 'Creation date',
          value: new Date(idToTimeMs(channel.id)).toString()
        },
        {
          name: 'Position',
          value: channel.position
        }, {
          name: 'ID',
          value: `\`\`\`ini\nUser = Unknown\nChannel = ${channel.id}\`\`\``
        }],
        color: 3553599
      }
    }
    const guild = await global.LoggerBot.getGuild(channel.guild_id)
    if (channel.permission_overwrites.length !== 0) {
      channel.permission_overwrites.forEach(overwrite => {
        if (overwrite.type === 'role') { // Should only be role anyways, but let's just be safe
          const role = guild.roles.find(r => r.id === overwrite.id)
          if (role.name === '@everyone') return
          const overwritePerms = getOverwritePermsJSON(overwrite)
          channelDeleteEvent.embed.fields.push({
            name: role.name,
            value: `Type: role\nPermissions: ${Object.keys(overwritePerms).filter(perm => overwritePerms[perm]).join(', ')}`
          })
        }
      })
    }
    const logs = await global.LoggerBot.requestClient.getAuditLogs(channel.guild_id, {
      limit: 1,
      actionType: 12 })
    if (!logs) return
    const log = logs.audit_log_entries[0]
    if (!log) return
    const user = logs.users.find(u => u.id === log.user_id)
    if (Date.now() - ((log.id / 4194304) + 1420070400000) < 3000) { // if the audit log is less than 3 seconds off
      channelDeleteEvent.embed.author.name = `${user.username}#${user.discriminator}`
      channelDeleteEvent.embed.author.iconUrl = makeAvatarURL(user)
      channelDeleteEvent.embed.thumbnail = {
        url: makeAvatarURL(user)
      }
      channelDeleteEvent.embed.fields[3].value = `\`\`\`ini\nUser = ${user.id}\nChannel = ${channel.id}\`\`\``
      await send(channelDeleteEvent)
    } else {
      await send(channelDeleteEvent)
    }
  }
}
