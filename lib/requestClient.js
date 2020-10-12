const Queue = require('bee-queue')

let restQueue

function createJob (payload) {
  const j = restQueue.createJob(payload)
  j.save()
  return j
}

module.exports = {
  init: (redisClient) => {
    restQueue = new Queue('logger-rest-jobs', { redis: redisClient })
  },
  getChannelMessages: (channelID, count) => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'GET_CHANNEL_MESSAGES',
        d: {
          channelID,
          count
        }
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  },
  createMessage: (channelID, content) => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'CREATE_MESSAGE',
        d: {
          channelID,
          content
        }
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  },
  editMessage: (channelID, messageID, content) => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'EDIT_MESSAGE',
        d: {
          channelID,
          messageID,
          content
        }
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  },
  executeWebhook: (webhookID, webhookToken, content) => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'EXECUTE_WEBHOOK',
        d: {
          webhookID,
          webhookToken,
          content
        }
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  },
  createWebhook: (channelID, options) => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'CREATE_WEBHOOK',
        d: {
          channelID,
          options
        }
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  },
  getGuildWebhooks: (guildID) => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'GET_WEBHOOKS_GUILD',
        d: {
          guildID
        }
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  },
  getChannelWebhooks: (channelID) => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'GET_WEBHOOKS_CHANNEL',
        d: {
          channelID
        }
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  },
  getAuditLogs: (guildID, options) => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'GET_AUDIT_LOGS',
        d: {
          guildID,
          options
        }
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  },
  whoAmI: () => {
    return new Promise((resolve, reject) => {
      const j = createJob({
        op: 'WHO_AM_I'
      })
      j.on('succeeded', resolve)
      j.on('failed', reject)
    })
  }
}
