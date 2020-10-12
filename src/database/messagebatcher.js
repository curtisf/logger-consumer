const format = require('pg-format')
const pool = require('./clients/postgres')
const aes = require('./aes')
const BATCH_SIZE = process.env.MESSAGE_BATCH_SIZE || 1
let batch = []

async function addItem (message) {
  if (!message.content) return
  message.content = aes.encrypt(message.content)
  batch.push(message)
  if (batch.length >= BATCH_SIZE) {
    await submitBatch()
  }
}

async function submitBatch () {
  const setValue = require('./interfaces/lmdb').setValue
  let toSubmit = batch.splice(0, BATCH_SIZE)
  // await pool.query(format('INSERT INTO messages (id, author_id, content, attachment_b64, ts) VALUES %L', toSubmit))
  toSubmit.forEach(async message => {
    await setValue(message.id, message)
  })
}

function getMessageFromBatch (messageID) {
  const message = batch.find(m => m[0] === messageID)
  return message
}

function updateMessageInBatch (messageID, content) {
  for (let i = 0; i < batch.length; i++) {
    if (batch[i][0] === messageID) {
      batch[i][2] = aes.encrypt(content || 'None')
      break
    }
  }
}

exports.getMessageFromBatch = getMessageFromBatch
exports.addItem = addItem
exports.updateMessageInBatch = updateMessageInBatch
exports.submitBatch = submitBatch
