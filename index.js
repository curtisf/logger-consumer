const ConsumerClient = require('./lib/consumerclient')
const util = require('util')
const redisClient = require('./src/database/clients/redis')
const eventMiddleware = require('./src/bot/modules/eventmiddleware')

global.ConsoleLog = require('./src/misc/consolelogger')

async function init () {
  let connectURI = 'ws://localhost:8080'
  if (process.env.K8S_AUTOSCALE) {
    const k8s = require('./src/k8s')
    await k8s.init()
    const ipToConnectTo = await k8s.getSocketToConnectTo()
    console.log('Rancher DNS says to connect to this ip', ipToConnectTo)
    connectURI = `ws://${ipToConnectTo}:8080`
  }
  const client = new ConsumerClient({ uri: connectURI, redisClient: redisClient })
  global.LoggerBot = client

  client.on('connectionStarted', () => {
    console.log('Connection started')
  })

  client.on('connectionClosed', () => {
    console.log('Connection closed.')
  })

  client.on('connectionError', e => {
    console.error('Connection error', e)
  })

  const [on, once] = require('./src/bot/utils/listenerIndexer')()
  on.forEach(async event => eventMiddleware(event, 'on'))

  client.on('error', console.error)

  client.connect()
}

init()
