const WebSocket = require('ws')

let lmdbWs

const responseMap = new Map()

function connect () {
  lmdbWs = new WebSocket(`ws://${process.env.LMDB_SERVICE_URL}:${process.env.LMDB_SERVICE_PORT}`)

  lmdbWs.on('close', e => {
    global.ConsoleLog.error('LMDB ws closed.', e)
    setTimeout(connect, 5000)
  })

  lmdbWs.on('error', e => {
    global.ConsoleLog.error('LMDB ws threw error', e)
  })

  lmdbWs.on('open', () => {
    global.ConsoleLog.info(`LMDB connection established at ${process.env.LMDB_SERVICE_URL}:${process.env.LMDB_SERVICE_PORT}`)
  })

  lmdbWs.on('message', m => {
    const uint8Response = new Uint8Array(m)
    const associatedResolve = responseMap.get(Buffer.from(uint8Response.subarray(0, 38)).toString())
    if (associatedResolve) {
      responseMap.delete(Buffer.from(uint8Response.subarray(0, 38)))
      const toParse = uint8Response.subarray(38)
      if (toParse.byteLength !== 0) {
        return associatedResolve(JSON.parse(Buffer.from(uint8Response.subarray(38)).toString()))
      } else return associatedResolve(null)
    }
    global.ConsoleLog.debug('Message received has no associated resolve', Buffer.from(m).toString())
  })
}

function sendWsMessage (key, object) {
  return new Promise((resolve, reject) => {
    responseMap.set(key, resolve)
    if (!object) { // user just wants to perform a GET
      lmdbWs.send(Buffer.from(key))
    } else {
      lmdbWs.send(Buffer.concat([Buffer.from(key), Buffer.from(JSON.stringify(object))]))
    }
    setTimeout(() => {
      reject(new Error('Payload with this key failed to get a response', key, object))
    }, 5000)
  })
}

connect()

const aes = require('../aes')
const { EVENT_LOGS } = require('../../misc/constants')
const { getMessageFromBatch, updateMessageInBatch } = require('../messagebatcher')
const keyValueEventLogs = EVENT_LOGS.reduce((ac, a) => ({ ...ac, [a]: '' }), {})

async function decryptMessageDoc (message) {
  message.content = aes.decrypt(message.content)
  if (message.attachment_b64) message.attachment_b64 = aes.decrypt(message.attachment_b64)
  return message
}

exports.getValue = async key => {
  const value = await sendWsMessage(key.padEnd(38))
  return value
}

exports.setValue = async (key, value) => {
  await sendWsMessage(key.padEnd(38), value)
}

exports.createGuild = async (guild) => {
  try {
    await module.exports.setValue(`guildDoc-${guild.id}`, {
      id: guild.id,
      owner_id: guild.owner_id,
      ignored_channels: [],
      disabled_events: [],
      event_logs: keyValueEventLogs,
      log_bots: false
    })
  } catch (e) {
    global.ConsoleLog.error(e)
  }
}

exports.getGuild = async guildID => {
  const doc = await module.exports.getValue(`guildDoc-${guildID}`)
  if (!doc) {
    const guild = await global.LoggerBot.getGuild(guildID)
    if (guild) {
      await module.exports.createGuild(guild)
      return module.exports.getGuild(guildID)
    }
  }
  return doc
}

exports.getGuildSettings = async guildID => {
  const doc = await module.exports.getValue(`guildSettings-${guildID}`)
  return doc
}

exports.getMessageById = async messageID => {
  let message = await module.exports.getValue(messageID)
  if (!message) return null
  message = await decryptMessageDoc(message)
  return message
}

exports.clearEventLog = async guildID => {
  const doc = await module.exports.getGuild(guildID)
  doc.event_logs = keyValueEventLogs
  await module.exports.setValue(`guildDoc-${guildID}`, doc)
}

exports.setEventLogIds = async (guildID, channelID, events = EVENT_LOGS) => {
  const doc = await module.exports.getGuild(guildID)
  events.forEach(event => {
    doc.event_logs[event] = channelID
  })
  await module.exports.setValue(`guildDoc-${guildID}`, doc)
}

exports.ignoreChannel = async (guildID, channelID) => {
  const doc = await module.exports.getGuild(guildID)
  let disabled = true
  if (doc.ignored_channels.includes(channelID)) {
    const index = doc.ignored_channels.indexOf(channelID)
    doc.ignored_channels.splice(index, 1)
    disabled = false
  } else {
    doc.ignored_channels.push(channelID)
  }
  return disabled
}

exports.toggleLogBots = async (guildID) => {
  const doc = await module.exports.getGuild(guildID)
  doc.log_bots = !doc.log_bots // wow much logic very good
  await module.exports.setValue(`guildDoc-${guildID}`, doc)
  return !doc.log_bots
}

exports.updateMessageByID = async (id, content) => {
  const batchMessage = await getMessageFromBatch(id)
  if (!batchMessage) {
    const message = await module.exports.getMessageById(id)
    message.content = aes.encrypt(content)
    await module.exports.setValue(id, message)
  } else {
    updateMessageInBatch(id, content)
  }
}
