const redisClient = require('../../database/clients/redis')

module.exports = {
  setWebhook: (channelID, webhookID, webhookToken) => {
    return redisClient.set(`webhook-${channelID}`, `${webhookID}|${webhookToken}`, 'EX', 10800000)
  },
  getWebhook: channelID => {
    return redisClient.get(`webhook-${channelID}`)
  },
  deleteWebhook: channelID => {
    return redisClient.del(`webhook-${channelID}`)
  }
}
