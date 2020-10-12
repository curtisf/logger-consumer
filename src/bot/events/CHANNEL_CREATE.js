const { getOverwritePermsJSON } = require('../../../lib/utils/permissionCalculator')
const { makeAvatarURL } = require('../../../lib/utils/userutils')
const send = require('../modules/webhooksender')
const CHANNEL_TYPE_MAP = {
  0: 'Text channel',
  2: 'Voice channel',
  4: 'Category'
}

module.exports = {
  name: 'channelCreate',
  type: 'on',
  handle: async newChannel => { // If it's a DM or group channel, ignore the creation
    if (newChannel.type === 1 || newChannel.type === 3) return
    const guild = await global.LoggerBot.getGuild(newChannel.guild_id)
    const channelCreateEvent = {
      guildID: newChannel.guild_id,
      eventName: 'channelCreate',
      embed: {
        author: {
          name: 'Unknown User',
          icon_url: 'http://laoblogger.com/images/outlook-clipart-red-x-10.jpg'
        },
        description: `${CHANNEL_TYPE_MAP[newChannel.type]} created <#${newChannel.id}>`,
        fields: [{
          name: 'Name',
          value: newChannel.name
        }, {
          name: 'ID',
          value: `\`\`\`ini\nUser = Unknown\nChannel = ${newChannel.id}\`\`\``
        }],
        color: 3553599
      }
    }
    if (newChannel.permission_overwrites.length !== 0) {
      newChannel.permission_overwrites.forEach(overwrite => {
        if (overwrite.type === 'role') { // Should only be role anyways, but let's just be safe
          const role = guild.roles.find(r => r.id === overwrite.id)
          if (role.name === '@everyone') return
          const overwritePermsJSON = getOverwritePermsJSON(overwrite)
          if (channelCreateEvent.embed.fields.length > 15) return // don't make too many fields lol
          channelCreateEvent.embed.fields.push({
            name: role.name,
            value: `Type: role\nPermissions: ${Object.keys(overwritePermsJSON).filter(perm => overwritePermsJSON[perm]).join(', ')}`
          })
        }
      })
    }
    const logs = await global.LoggerBot.requestClient.getAuditLogs(newChannel.guild_id, {
      limit: 1,
      actionType: 10
    })
    if (!logs.audit_log_entries || logs.audit_log_entries.length === 0) return
    const log = logs.audit_log_entries[0]
    if (!log) return
    const user = logs.users.find(u => u.id === log.user_id)
    if (new Date().getTime() - new Date((log.id / 4194304) + 1420070400000).getTime() < 3000) { // if the audit log is less than 3 seconds off
      channelCreateEvent.embed.author.name = `${user.username}#${user.discriminator}`
      channelCreateEvent.embed.author.iconUrl = makeAvatarURL(user)
      channelCreateEvent.embed.thumbnail = {
        url: makeAvatarURL(user)
      }
      channelCreateEvent.embed.fields[1].value = `\`\`\`ini\nUser = ${user.id}\nChannel = ${newChannel.id}\`\`\``
      await send(channelCreateEvent)
    } else {
      await send(channelCreateEvent)
    }
  }
}
