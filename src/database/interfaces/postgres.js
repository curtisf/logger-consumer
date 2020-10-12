const pool = require('../clients/postgres')
const aes = require('../aes')
const encryptBase = aes.encrypt(JSON.stringify(['placeholder']))
const { EVENT_LOGS } = require('../../misc/constants')
const { getMessageFromBatch, updateMessageInBatch } = require('../messagebatcher')
const keyValueEventLogs = EVENT_LOGS.reduce((ac, a) => ({ ...ac, [a]: '' }), {})

async function decryptUserDoc (userDoc) {
  userDoc.names = JSON.parse(aes.decrypt(userDoc.names))
  return userDoc
}

async function decryptMessageDoc (message) {
  message.content = aes.decrypt(message.content)
  if (message.attachment_b64) message.attachment_b64 = aes.decrypt(message.attachment_b64)
  return message
}

exports.createUserDocument = async (userID) => {
  try {
    await pool.query('INSERT INTO users (id, names) VALUES ($1, $2)', [userID, encryptBase]) // await cacheGuild(guild.id)
  } catch (e) {}
}

exports.createGuild = async (guild) => {
  try {
    await pool.query('INSERT INTO guilds (id, owner_id, ignored_channels, disabled_events, event_logs, log_bots) VALUES ($1, $2, $3, $4, $5, $6)', [guild.id, guild.owner_id, [], [], keyValueEventLogs, false]) // Regenerate the document if a user kicks and reinvites the bot.
  } catch (e) {}
}

exports.getGuild = async (guildID) => {
  const doc = await pool.query('SELECT * FROM guilds WHERE id=$1;', [guildID])
  if (doc.rows.length === 0) {
    const guild = await global.LoggerBot.getGuild(guildID)
    if (guild) {
      await module.exports.createGuild(guild)
      return await module.exports.getGuild(guildID)
    }
  }
  return doc.rows[0]
}

exports.getUser = async userID => {
  const doc = await pool.query('SELECT * FROM users WHERE id=$1', [userID])
  if (doc.rows.length === 0) {
    await module.exports.createUserDocument(userID)
    return module.exports.getUser(userID)
  }
  const decryptedDoc = await decryptUserDoc(doc.rows[0])
  return decryptedDoc
}

exports.getMessageById = async messageID => {
  let message = await pool.query('SELECT * FROM messages WHERE id=$1', [messageID])
  if (message.rows.length === 0) return null
  message = await decryptMessageDoc(message.rows[0])
  return message
}

exports.clearEventLog = async guildID => {
  // I'm sorry. https://stackoverflow.com/questions/54789406/convert-array-to-object-keys ez 1 liner
  await pool.query('UPDATE guilds SET event_logs=$1 WHERE id=$2', [keyValueEventLogs, guildID])
}

exports.setEventLogIds = async (guildID, channelID, events = EVENT_LOGS) => {
  const doc = await module.exports.getGuild(guildID)
  events.forEach(event => {
    doc.event_logs[event] = channelID
  })
  await pool.query('UPDATE guilds SET event_logs=$1 WHERE id=$2', [doc.event_logs, guildID])
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
  await pool.query('UPDATE guilds SET ignored_channels=$1 WHERE id=$2', [doc.ignored_channels, guildID])
  return disabled
}

exports.toggleLogBots = async (guildID) => {
  const doc = await module.exports.getGuild(guildID)
  await pool.query('UPDATE guilds SET log_bots=$1 WHERE id=$2', [!doc.log_bots, guildID])
  return !doc.log_bots
}

exports.updateNames = async (userID, name) => {
  const doc = await module.exports.getUser(userID)
  doc.names.push(name)
  doc.names = aes.encrypt(JSON.stringify(doc.names))
  await pool.query('UPDATE users SET names=$1 WHERE id=$2', [doc.names, userID])
}

exports.updateMessageByID = async (id, content) => {
  const batchMessage = await getMessageFromBatch(id)
  if (!batchMessage) {
    await pool.query('UPDATE messages SET content=$1 WHERE id=$2', [aes.encrypt(content || 'EMPTY STRING'), id])
  } else {
    updateMessageInBatch(id, content)
  }
}
