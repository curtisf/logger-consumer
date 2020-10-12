const send = require('../modules/webhooksender')
const { makeAvatarURL, idToTimeMs, makeGuildIconURL } = require('../../../lib/utils/userutils')
const guildSettingsCache = require('../guildSettingsCache')

// https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city because I'm lazy
const uppercaseFirstLetterOfWords = str => str.replace(/_/gi, ' ').toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')

function formatValue (value) {
  if (!value) return 'not set'
  if (!isNaN(parseInt(value))) return `<#${value}>`
  return `\`${value}\``
}

module.exports = {
  name: 'guildUpdate',
  type: 'on',
  handle: async guild => {
    const guildUpdateEvent = {
      guildID: guild.guild_id,
      eventName: 'guildUpdate',
      embed: {
        thumbnail: {
          url: makeGuildIconURL(guild.id, guild.icon)
        },
        description: `The server was updated. See below for changes.`,
        fields: [],
        color: 3553599
      }
    }
    const logs = await global.LoggerBot.requestClient.getAuditLogs(guild.guild_id, {
      limit: 1,
      actionType: 1 }).catch(() => {})
    if (!logs) return
    const log = logs.audit_log_entries[0]
    if (!log) return
    const perp = logs.users.find(u => u.id === log.user_id)
    if (Date.now() - ((log.id / 4194304) + 1420070400000) < 3000) { // if the audit log is less than 3 seconds off
      log.changes.forEach(change => {
        guildUpdateEvent.embed.fields.push({
          name: uppercaseFirstLetterOfWords(change.key),
          value: `Now: ${formatValue(change.new_value)}\nWas: ${formatValue(change.old_value)}`
        })
      })
      guildUpdateEvent.embed.author = {
        name: `${perp.username}#${perp.discriminator}`,
        iconUrl: makeAvatarURL(perp)
      }
      await send(guildUpdateEvent)
    }
  }
}
/*
toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
    */
