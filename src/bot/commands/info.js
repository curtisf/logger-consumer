const { makeAvatarURL } = require('../../../lib/utils/userutils')

module.exports = {
  func: async message => {
    await global.LoggerBot.requestClient.createMessage(message.channel_id, {
      embed: {
        'title': 'Configuration dashboard',
        'description': `Hey, I'm ${global.LoggerBot.user.username}! My **only** purpose is to, at your command, log everything to your configured channels. Click "configuration dashboard" to login to my dashboard and configure me!`,
        'url': 'https://logger.bot',
        'color': 3553599,
        'timestamp': new Date(),
        'footer': {
          'iconUrl': makeAvatarURL(global.LoggerBot.user),
          'text': `${global.LoggerBot.user.username}#${global.LoggerBot.user.discriminator}`
        },
        'thumbnail': {
          'url': makeAvatarURL(global.LoggerBot.user)
        },
        'author': {
          'name': `${message.author.username}#${message.author.discriminator}`,
          'iconUrl': 'https://cdn.discordapp.com/avatars/212445217763229699/cd1fc2bfd445d98d839ba44f714900ec.jpg?size=128'
        },
        'fields': [
          {
            'name': 'Technical Details',
            'value': `${global.LoggerBot.user.username} is written in JavaScript utilizing the Node.js runtime. It uses the [eris](https://github.com/abalabahaha/eris) library to interact with the Discord API. PostgreSQL and Redis are used. I am OSS at https://github.com/caf203/loggerv3`
          },
          {
            'name': 'The Author',
            'value': 'Logger is developed and maintained by [James Bond#0007](https://github.com/caf203). You can contact him via my [home server](https://discord.gg/ed7Gaa3).'
          },
          {
            'name': 'Bot Info',
            'value': 'Click on the configuration dashboard link to learn more.'
          },
          {
            'name': 'Shard Info',
            'value': `Shard ID: 69\nWebsocket latency: lolidk\nStatus: clearly online`
          }
        ]
      }
    })
  },
  name: 'info',
  description: 'Get information about Logger and the current shard.',
  type: 'any',
  category: 'Information'
}
