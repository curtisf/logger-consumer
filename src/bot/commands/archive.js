const sa = require('superagent')
const { makeAvatarURL, idToTimeMs } = require('../../../lib/utils/userutils')

module.exports = {
  func: async (message, suffix) => {
    if (isNaN(suffix)) return global.LoggerBot.requestClient.createMessage(message.channel_id, 'That isn\'t a valid suffix! Please provide any number between 5 and 1000 (10,000 if Patreon).')
    const num = parseInt(suffix)
    if (num < 5 || num > 1000) return global.LoggerBot.requestClient.createMessage(message.channel_id, 'That number is invalid! Please provide any number between 5 and 1000 (10,000 if Patreon)')
    global.LoggerBot.requestClient.getChannelMessages(message.channel_id, num).then(messages => {
      const pasteString = messages.reverse().map(m => `${m.author.username}#${m.author.discriminator} (${m.author.id}) | (${makeAvatarURL(m.author)}) | ${new Date(idToTimeMs(m.id))}: ${m.content ? m.content : ''} | ${m.embeds.length === 0 ? '' : `{"embeds": [${m.embeds.map(e => JSON.stringify(e))}]}`} | ${m.attachments.length === 0 ? '' : ` =====> Attachment: ${m.attachments[0].filename}:${m.attachments[0].url}`}`).join('\r\n')
      sa
        .post(process.env.PASTE_CREATE_ENDPOINT)
        .set('Authorization', process.env.PASTE_CREATE_TOKEN)
        .set('Content-Type', 'text/plain')
        .send(pasteString || 'No messages were able to be archived')
        .end(async (err, res) => {
          if (!err && res.statusCode === 200 && res.body.key) {
            await global.LoggerBot.requestClient.createMessage(message.channel_id, `<@${message.author.id}>, **${messages.length}** message(s) could be archived. Link: https://haste.lemonmc.com/${res.body.key}.txt`)
          } else {
            console.error(err, res.body)
            console.error('An error has occurred while posting to the paste website. Check logs for more.')
          }
        })
    })
  },
  name: 'archive',
  description: 'Makes a log of up to the last 1000 messages in a channel. Example: archive 100 | archive 1000. Patreon bot only: fetch 10,000 messages!',
  category: 'Utility',
  perm: 'manageMessages'
}

if (!process.env.PASTE_CREATE_ENDPOINT || !process.env.PASTE_CREATE_TOKEN) {
  global.ConsoleLog.warn('Paste site URI and/or token missing, disabling archive command')
  module.exports.func = () => {}
}
