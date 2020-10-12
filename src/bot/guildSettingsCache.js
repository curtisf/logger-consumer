const redisClient = require('../database/clients/redis')
// const { getGuild } = require('../database/interfaces/postgres')
const { getGuild } = require('../database/interfaces/lmdb')

module.exports = {
  getGuildSettings: async guildID => {
    // const settingsString = await redisClient.get(`guildSettings-${guildID}`)
    const settings = await getGuild(guildID)
    if (settings) return settings
    const guildSettings = await module.exports.setGuildSettings(guildID)
    return guildSettings
  },
  setGuildSettings: async guildID => {
    console.log('SET gid', guildID)
    const guildDoc = await getGuild(guildID) // this will create the guild document if not already existing
    return guildDoc
  }
}
