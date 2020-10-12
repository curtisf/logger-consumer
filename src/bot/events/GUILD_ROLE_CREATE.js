const send = require('../modules/webhooksender')
const { makeAvatarURL } = require('../../../lib/utils/userutils')
const { makeJSON } = require('../../../lib/utils/permissionCalculator')

// https://stackoverflow.com/questions/4149276/how-to-convert-camelcase-to-camel-case because e f f o r t
const toSentenceCase = str => str.replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
  .replace(/^./, function (str) { return str.toUpperCase() })

module.exports = {
  name: 'guildRoleCreate',
  type: 'on',
  handle: async data => {
    const guildRoleCreateEvent = {
      guildID: data.guild_id,
      eventName: 'guildRoleCreate',
      embed: {
        description: `A role was created${data.role.managed ? ' (bot role)' : ''}.`,
        fields: [{
          name: 'Name',
          value: data.role.name
        }],
        color: 3553599
      }
    }
    // {
    //   name: 'ID',
    //   value: `\`\`\`ini\nRole = ${data.role.id}\nPerpetrator = Unknown\`\`\``
    // }
    const json = makeJSON(data.role.permissions)
    const permsString = Object.keys(json).map(toSentenceCase).reduce((str, key) => str += `${key}: ✅\n`)
    guildRoleCreateEvent.embed.fields.push({
      name: 'Permissions',
      value: permsString
    })
    const logs = await global.LoggerBot.requestClient.getAuditLogs(data.guild_id, {
      limit: 1,
      actionType: 30 }).catch(() => {})
    if (!logs) return
    const log = logs.audit_log_entries[0]
    if (!log) return
    const perp = logs.users.find(u => u.id === log.user_id)
    if (Date.now() - ((log.id / 4194304) + 1420070400000) < 3000) { // if the audit log is less than 3 seconds off
      guildRoleCreateEvent.embed.fields.push({ name: 'ID', value: `\`\`\`ini\nRole = ${data.role.id}\nPerpetrator = ${perp.id}\`\`\`` })
      guildRoleCreateEvent.embed.footer = {
        text: `${perp.username}#${perp.discriminator}`,
        iconUrl: makeAvatarURL(perp)
      }
      await send(guildRoleCreateEvent)
    } else {
      guildRoleCreateEvent.embed.fields.push({
        name: 'ID',
        value: `\`\`\`ini\nRole = ${data.role.id}\`\`\``
      })
      await send(guildRoleCreateEvent)
    }
  }
}
