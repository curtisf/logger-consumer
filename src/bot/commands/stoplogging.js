// const { setEventLogIds, clearEventLog } = require('../../database/interfaces/postgres')
const { setEventLogIds, clearEventLog } = require('../../database/interfaces/lmdb')
const { setGuildSettings } = require('../guildSettingsCache')
const eventList = require('../../misc/constants').EVENT_LOGS

module.exports = {
  func: async (message, suffix) => {
    let events = suffix.split(', ')
    if (events.length === 0) events = suffix.split(',')
    events = cleanArray(events)
    if (events.length === 0 && suffix) {
      global.LoggerBot.requestClient.createMessage(message.channel_id, `<@${message.author.id}>, none of the provided events are valid. Look at ${process.env.GLOBAL_BOT_PREFIX}help to see what is valid OR visit the dashboard at <https://logger.bot>`)
    } else if (events.length === 0 && !suffix) {
      await clearEventLog(message.guild_id)
      await setGuildSettings(message.guild_id)
      await global.LoggerBot.requestClient.createMessage(message.channel_id, `<@${message.author.id}>, no events will be logged to this channel anymore. To protect your webhooks, the webhook I'm using will not be deleted. You can safely delete it now (and should).`)
    } else {
      await setEventLogIds(message.guild_id, '', events)
      await setGuildSettings(message.guild_id)
      await global.LoggerBot.requestClient.createMessage(message.channel_id, `<@${message.author.id}>, it has been done. Visit the dashboard at <https://logger.bot> for easier configuration!`)
    } // Wow, the above code is await city
  },
  name: 'stoplogging',
  description: 'Use this in a log channel to stop me from logging to here. Used without any text after it, all events will cease to be logged in the channel it was sent in. You can pass event names like setchannel to individually unset events too.',
  type: 'admin',
  category: 'Logging'
}

function cleanArray (events) {
  const tempEvents = []
  events.forEach(event => {
    if (!eventList.includes(event)) return []
    eventList.forEach(validEvent => {
      const lowerEvent = validEvent.toLowerCase()
      const upperEvent = validEvent.toUpperCase()
      if (event === lowerEvent || event === upperEvent || event === validEvent) {
        tempEvents.push(validEvent)
      }
    })
  })
  return tempEvents
}
