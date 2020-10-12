const ioredis = require('ioredis')

module.exports = ioredis.createClient(6379, process.env.REDIS_HOST || '127.0.0.1')
