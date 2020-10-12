const EventEmitter = require('events')
const WebSocket = require('ws')
const permissionCalculator = require('./utils/permissionCalculator')
const Constants = require('./constants')
const { v4: uuidv4 } = require('uuid')

module.exports = class ConsumerClient extends EventEmitter {
  constructor (gatewayInstanceOptions) {
    super()
    if (!gatewayInstanceOptions.redisClient) {
      throw new Error('Missing redisClient parameter in constructor!')
    }
    this.guilds = new Map()
    this._waitingForWS = {}
    this.requestClient = require('./requestClient')
    this.requestClient.init(gatewayInstanceOptions.redisClient)
    this.options = Object.assign({
      uri: 'ws://localhost:8080',
      autoReconnect: true
    }, gatewayInstanceOptions)
  }

  connect () {
    /*
     * 0: CONNECTING
     * 1: OPEN
     * 2: CLOSING
     * 3: CLOSED
    */
    if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) return // Ignore all connect attempts if the websocket is open.
    this.ws = new WebSocket(this.options.uri)
    this.addListeners()
    this.emit('connectionStarted')
  }

  disconnect (reason = 'no reason defined') {
    if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) {
      this.ws.close(0, reason)
    }
  }

  addListeners () {
    this.ws.onclose = async closeEvent => {
      this.emit('connectionClosed', closeEvent)
      if (this.options.autoReconnect) {
        this.connect.bind(this)
        setTimeout(async () => {
          if (process.env.K8S_AUTOSCALE) {
            console.log('K8S', 'Getting new ip...')
            const k8s = require('../src/k8s')
            const newIp = await k8s.getSocketToConnectTo()
            console.log('K8S', 'New ip: ' + newIp)
            this.options.uri = `ws://${newIp}:8080`
            this.connect()
          } else this.connect()
        }, 10000)
      }
    }
    this.ws.onopen = async () => {
      this.user = await this.requestClient.whoAmI()
      console.log('I am ', this.user)
      this.emit('connectionOpened')
    }
    this.ws.onerror = error => this.emit('connectionError', error)
    this.ws.on('message', this._handleMessage.bind(this))
  }

  getChannelPermsForMember (channelID, memberID) {

  }

  getGuildPermsForMember (member) {
    if (member.id === this.guilds.get(member.guild_id).owner_id) {
      return permissionCalculator.makeJSON(Constants.Permissions.all)
    } else {
      let perms = this.guilds.get(member.guild_id).roles.find(r => r.id === member.guild_id).permissions
      for (let role of member.member.roles) {
        role = this.guilds.get(role) // get guild role from member role
        if (!role) {
          continue
        }

        const { allow: perm } = role.permissions
        if (perm & Constants.Permissions.administrator) {
          perms = Constants.Permissions.all
          break
        } else {
          perms |= perm
        }
      }
      return permissionCalculator.makeJSON(perms)
    }
  }

  async getGuild (id) {
    const g = await this.sendWSMessage({
      t: 'GET_GUILD',
      d: {
        id: id
      }
    })
    return g
  }

  sendWSMessage (payload) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4()
      payload.uuid = uuid
      payload = JSON.stringify(payload)
      this._waitingForWS[uuid] = resolve
      this.ws.send(payload)
      setTimeout(() => reject('WS request timed out'), 2000)
    })
  }

  _handleMessage (serializedPacket) {
    let message
    try {
      message = JSON.parse(serializedPacket)
    } catch (e) {
      this.emit('error', 'Error parsing websocket message', serializedPacket)
    }
    switch (message.t) {
      case 'READY': {
        this.emit('READY')
        break
      }
      // case 'GUILD_CREATE': {
      //   console.log('guild create')
      //   break
      // }
      case 'GUILD_ROLE_CREATE': {
        this.emit('guildRoleCreate', message.d)
        break
      }
      case 'MESSAGE_CREATE': {
        this.emit('messageCreate', message.d)
        break
      }
      case 'VOICE_STATE_UPDATE': {
        this.emit('voiceStateUpdate', message.d, message.additionalData)
        break
      }
      case 'MESSAGE_UPDATE': {
        this.emit('messageUpdate', message.d)
        break
      }
      case 'CHANNEL_UPDATE': {
        this.emit('channelUpdate', message.d, message.additionalData)
        break
      }
      case 'CHANNEL_CREATE': {
        this.emit('channelCreate', message.d)
        break
      }
      case 'GUILD_UPDATE': {
        this.emit('guildUpdate', message.d)
        break
      }
      case 'GUILD_MEMBER_UPDATE':
        this.emit('guildMemberUpdate', message.d, message.additionalData)
        break
      case 'CHANNEL_DELETE': {
        this.emit('channelDelete', message.d)
        break
      }
      case 'GUILD_BAN_ADD': {
        this.emit('guildBanAdd', message.d)
        break
      }
      case 'GUILD_BAN_REMOVE': {
        this.emit('guildBanRemove', message.d)
        break
      }
      case 'GUILD_CREATE': {
        this.emit('guildCreate', message.d)
        break
      }
      case 'GUILD_DELETE': {
        this.emit('guildDelete', message.d)
        break
      }
      case 'CACHE_REQUEST_RESPONSE': {
        if (this._waitingForWS[message.uuid]) {
          this._waitingForWS[message.uuid](message.d)
        }
        break
      }
    }
  }
}
