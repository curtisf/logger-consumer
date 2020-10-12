const util = require('util')

module.exports = {
  func: async (message, suffix) => {
    try { // This eval command is from https://github.com/TheSharks/WildBeast/ because I really like their method
      const returned = eval(suffix)
      let str = util.inspect(returned, {
        depth: 1
      })
      if (str.length > 1900) {
        str = `${str.substr(0, 1897)}...`
      }
      global.LoggerBot.requestClient.createMessage(message.channel_id, '```xl\n' + str + '\n```').then(ms => {
        if (returned !== undefined && returned !== null && typeof returned.then === 'function') {
          returned.then(() => {
            str = util.inspect(returned, {
              depth: 1
            })
            if (str.length > 1900) {
              str = str.substr(0, 1897)
              str = str + '...'
            }
            global.LoggerBot.requestClient.editMessage(message.channel_id, ms.id, '```xl\n' + str + '\n```')
          }, e => {
            str = util.inspect(e, {
              depth: 1
            })
            if (str.length > 1900) {
              str = str.substr(0, 1897)
              str = str + '...'
            }
            global.LoggerBot.requestClient.editMessage(message.channel_id, ms.id, '```xl\n' + str + '\n```')
          })
        }
      }).catch(() => { })
    } catch (e) {
      global.LoggerBot.requestClient.createMessage(message.channel_id, '```xl\n' + e + '\n```').catch(() => { })
    }
  },
  name: 'eval',
  description: 'Bot owner debug command.',
  type: 'creator',
  hidden: true
}
