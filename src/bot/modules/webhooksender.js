// const { EVENTS_USING_AUDITLOGS } = require('../../misc/constants')
const { getWebhook, deleteWebhook } = require('./webhookcache')
const { getGuildSettings } = require('../guildSettingsCache')
const { memberGuildPermsJSON } = require('../../../lib/utils/permissionCalculator')
const { makeAvatarURL } = require('../../../lib/utils/userutils')
const guildWebhookCacher = require('./guildwebhookcacher')

module.exports = async pkg => {
  if (!pkg.guildID) return console.error('No guildID was provided in an embed!')
  if (!pkg.embed.color) pkg.embed.color = 3553599
  const guild = await global.LoggerBot.getGuild(pkg.guildID)
  if (!guild) {
    console.warn(`Invalid guild ID sent in package! ${pkg.guildID} (I am not a member anymore!)`)
    return
  }
  const botMember = guild.members[global.LoggerBot.user.id]
  const botPerms = await memberGuildPermsJSON(guild, { ...botMember, guild_id: pkg.guildID })
  if (!botPerms['manageWebhooks'] || !botPerms['viewAuditLogs']) return
  const guildSettings = await getGuildSettings(pkg.guildID)
  if (!guildSettings) {
    // This should NOT happen?
    return
  }
  const webhook = await getWebhook(guildSettings.event_logs[pkg.eventName])
  let webhookID, webhookToken
  if (webhook) {
    const split = webhook.split('|')
    webhookID = split[0]
    webhookToken = split[1]
  }
  if (!webhook && guildSettings.event_logs[pkg.eventName]) {
    await guildWebhookCacher(pkg.guildID, guildSettings.event_logs[pkg.eventName])
  } else if (webhook && !guildSettings.disabled_events.includes(guildSettings.event_logs[pkg.eventName])) {
    if (!pkg.embed.footer) {
      pkg.embed.footer = {
        text: `${global.LoggerBot.user.username}#${global.LoggerBot.user.discriminator}`,
        iconUrl: makeAvatarURL(global.LoggerBot.user)
      }
    }
    if (!pkg.embed.timestamp) {
      pkg.embed.timestamp = new Date()
    }
    global.LoggerBot.requestClient.executeWebhook(webhookID, webhookToken, {
      file: pkg.file ? pkg.file : '',
      username: global.LoggerBot.user.username,
      avatarUrl: makeAvatarURL(global.LoggerBot.user),
      embeds: [pkg.embed]
    }).catch(async e => {
      console.error(e)
      console.warn(`Got ${e.code} while sending webhook to ${pkg.guildID} (${guild ? guild.name : 'Could not find guild!'})`)
      if (e.code == '10015') { // Webhook doesn't exist anymore.
        await deleteWebhook(`webhook-${guildSettings.event_logs[pkg.eventName]}`)
        await guildWebhookCacher(pkg.guildID, guildSettings.event_logs[pkg.eventName])
      } else {
        console.error('Error while sending a message over webhook!', e, pkg, pkg.embed.fields)
      }
    })
    // statAggregator.incrementEvent(pkg.eventName)
    // if (EVENTS_USING_AUDITLOGS.includes(pkg.eventName)) {
    //   statAggregator.incrementMisc('fetchAuditLogs')
    // }
  }
}
