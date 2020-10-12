module.exports = {
  func: async message => {
    const start = new Date().getTime()
    const m = await global.LoggerBot.requestClient.createMessage(message.channel_id, 'Fetching...')
    global.LoggerBot.requestClient.editMessage(m.channel_id, m.id, `Done. RTT: ${new Date().getTime() - start}`)
  },
  name: 'ping',
  description: 'Get Logger\'s round-trip time to Discord.',
  type: 'any',
  category: 'General'
}
