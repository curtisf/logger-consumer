const { memberChannelPerms, memberGuildPermsJSON } = require('../../../lib/utils/permissionCalculator')
const { getGuildSettings } = require('../guildSettingsCache')
const { addItem } = require('../../database/messagebatcher')
const commandHandler = require('../modules/commandhandler')

module.exports = {
  name: 'messageCreate',
  type: 'on',
  handle: async message => {
    if (!global.LoggerBot.user.id || !!message.author.bot || !message.member || message.author.id === global.LoggerBot.user.id) return // no bots no thank you
    await commandHandler(message)
    const guildSettings = await getGuildSettings(message.guild_id)
    if (!guildSettings.ignored_channels.includes(message.channel_id)) {
      if (!guildSettings.log_bots && !!message.author.bot) return
      await addItem({
        id: message.id,
        author_id: message.author.id,
        content: message.content,
        date: new Date().toISOString()
      })
    }
  }
}
