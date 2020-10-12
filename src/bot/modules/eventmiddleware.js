const { getGuildSettings } = require('../guildSettingsCache')

// I generally hate middleware associated with events, but this could potentially save
// a whole lot on resources and audit log fetching if pulled off correctly.
module.exports = async (event, type) => {
  if (type === 'on') {
    global.LoggerBot.on(event.name, async (...args) => {
      const guildId = getGuildIdByEvent(event.name, args)
      if (!guildId) {
        global.ConsoleLog.warn(`While executing event ${event.name}, a guild ID was not returned!`)
      } else if (guildId === true) { // when true, don't fetch event logs
        await event.handle.apply(this, args)
      } else {
        const guildSettingsCache = await getGuildSettings(guildId)
        if (guildId !== true && guildSettingsCache && !guildSettingsCache.event_logs[event.name]) return // true means skip guildsettings fetch
        await event.handle.apply(this, args)
      }
    })
  } else if (type === 'once') {
    global.bot.once(event.name, async (...args) => {
      await event.handle.apply(this, args)
    })
  }
}

// Return the id of the guild to prevent event processing if not configured by the user.
// IDs get checked for the presence of a configuration, while true is executed without a settings check.
function getGuildIdByEvent (type, args) {
  switch (type) {
    case 'channelCreate':
    case 'channelDelete':
    case 'channelUpdate':
    case 'guildBanAdd':
    case 'guildBanRemove':
    case 'guildEmojisUpdate':
    case 'guildMemberAdd':
    case 'guildMemberRemove':
    case 'guildMemberUpdate':
    case 'guildRoleCreate':
    case 'guildRoleDelete':
    case 'guildRoleUpdate':
    case 'guildUpdate':
    case 'inviteCreate':
    case 'voiceStateUpdate':
    case 'inviteDelete':
    case 'messageDeleteBulk': {
      return args[0].guild_id
    }
    default: {
      return true
    }
  }
}
