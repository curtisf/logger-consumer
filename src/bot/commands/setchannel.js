// const { setEventLogIds } = require('../../database/interfaces/postgres')
const { setEventLogIds } = require('../../database/interfaces/lmdb')
const { memberChannelPerms } = require('../../../lib/utils/permissionCalculator')
const { setGuildSettings } = require('../guildSettingsCache')
const { EVENT_LOGS, ERIS_EVENTS_TO_RAW } = require('../../misc/constants')

module.exports = {
  func: async (message, suffix) => {
    const guild = await global.LoggerBot.getGuild(message.guild_id)
    const botMember = guild.members[global.LoggerBot.user.id]
    const botPerms = await memberChannelPerms(message.channel_id, { ...botMember, guild_id: message.guild_id })
    if (!botPerms['manageWebhooks']) {
      await global.LoggerBot.requestClient.createMessage(message.channel_id, 'I lack the manage webhooks permission! This is necessary for me to send messages to your configured logging channel.')
      return
    }
    let events = suffix.split(', ')
    if (events.length === 0) events = suffix.split(',')
    events = cleanArray(events)
    if (events.length === 0 && suffix) {
      global.LoggerBot.requestClient.createMessage(message.channel_id, `<@${message.author.id}>, none of the provided events are valid. Look at ${process.env.GLOBAL_BOT_PREFIX}help to see what is valid OR visit the dashboard at <https://logger.bot>`)
    } else if (events.length === 0 && !suffix) {
      await setEventLogIds(message.guild_id, message.channel_id)
      await setGuildSettings(message.guild_id)
      global.LoggerBot.requestClient.createMessage(message.channel_id, `<@${message.author.id}>, I set all events to log here! You may have to trigger these events once or twice before the bot creates a message. Visit the dashboard at <https://logger.bot> for easier configuration.`)
    } else {
      await setEventLogIds(message.guild_id, message.channel_id, events)
      await setGuildSettings(message.guild_id)
      global.LoggerBot.requestClient.createMessage(message.channel_id, `<@${message.author.id}>, it has been done. You may have to trigger these events once or twice before the bot creates a message. Visit the dashboard at <https://logger.bot> for easier configuration!`)
    }
  },
  name: 'setchannel',
  description: `Use this in a log channel to make me log to here. setchannel without any suffix will set all events to the current channel. Otherwise, you can use *${EVENT_LOGS.toString(', ')}* any further components being comma separated. Example: \`${process.env.GLOBAL_BOT_PREFIX}setchannel messageDelete, messageUpdate\` OR visit <https://logger.bot> for an alternative to setchannel.`,
  perm: 'manageWebhooks',
  category: 'Logging'
}

function cleanArray (events) {
  const tempEvents = []
  events.forEach(event => {
    if (!EVENT_LOGS.includes(event)) return []
    EVENT_LOGS.forEach(validEvent => {
      const lowerEvent = validEvent.toLowerCase()
      const upperEvent = validEvent.toUpperCase()
      if (event === lowerEvent || event === upperEvent || event === validEvent) {
        tempEvents.push(ERIS_EVENTS_TO_RAW[event])
      }
    })
  })
  return tempEvents
}
