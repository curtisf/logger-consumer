const send = require('../modules/webhooksender')
const { makeAvatarURL, idToTimeMs } = require('../../../lib/utils/userutils')

module.exports = {
  name: 'guildBanAdd',
  type: 'on',
  handle: async banPayload => {
    const guildBanAddEvent = {
      guildID: banPayload.guild_id,
      eventName: 'guildBanAdd',
      embed: {
        author: {
          name: `${banPayload.user.username}#${banPayload.user.discriminator} `,
          iconUrl: makeAvatarURL(banPayload.user)
        },
        thumbnail: {
          url: makeAvatarURL(banPayload.user)
        },
        description: `${banPayload.user.username}#${banPayload.user.discriminator} was banned`,
        fields: [{
          name: 'User Information',
          value: `${banPayload.user.username}#${banPayload.user.discriminator} (${banPayload.user.id}) <@${banPayload.user.id}> ${banPayload.user.bot ? '\nIs a bot' : ''}`
        }, {
          name: 'Reason',
          value: 'None provided'
        }, {
          name: 'ID',
          value: `\`\`\`ini\nUser = ${banPayload.user.id}\nPerpetrator = Unknown\`\`\``
        }],
        color: 3553599
      }
    }
    const logs = await global.LoggerBot.requestClient.getAuditLogs(banPayload.guild_id, {
      limit: 1,
      actionType: 22 }).catch(() => {})
    if (!logs) return
    const log = logs.audit_log_entries[0]
    if (!log) return
    console.log(logs, log)
    const perp = logs.users.find(u => u.id === log.user_id)
    if (Date.now() - ((log.id / 4194304) + 1420070400000) < 3000) { // if the audit log is less than 3 seconds off
      if (log.reason) guildBanAddEvent.embed.fields[1].value = log.reason
      guildBanAddEvent.embed.fields[2].value = `\`\`\`ini\nUser = ${banPayload.user.id}\nPerpetrator = ${perp.id}\`\`\``
      guildBanAddEvent.embed.footer = {
        text: `${perp.username}#${perp.discriminator}`,
        iconUrl: makeAvatarURL(perp)
      }
      await send(guildBanAddEvent)
    } else {
      await send(guildBanAddEvent)
    }
  }
}
