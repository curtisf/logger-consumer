const { makeAvatarURL } = require('../../../lib/utils/userutils')

module.exports = {
  func: async message => {
    global.LoggerBot.requestClient.createMessage(message.channel_id, { embed: {
      'description': `Invite me using [this link](https://discordapp.com/oauth2/authorize?client_id=${global.LoggerBot.user.id}&scope=bot&permissions=536988833). My configuration dashboard is [here](https://logger.bot).`,
      'color': 3553599,
      'timestamp': new Date(),
      'footer': {
        'iconUrl': makeAvatarURL(global.LoggerBot.user),
        'text': `${global.LoggerBot.user.username}#${global.LoggerBot.user.discriminator}`
      },
      'author': {
        'name': `${message.author.username}#${message.author.discriminator}`,
        'iconUrl': makeAvatarURL(message.author)
      }
    } })
  },
  name: 'invite',
  description: 'Get my invite link.',
  type: 'any',
  category: 'General'
}
