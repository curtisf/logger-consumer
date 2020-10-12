const { USER_AVATAR, DEFAULT_USER_AVATAR, CDN_URL } = require('../constants')

module.exports = {
  makeAvatarURL: user => {
    if (user.avatar) {
      return module.exports._formatImage(USER_AVATAR(user.id, user.avatar))
    } else {
      return DEFAULT_USER_AVATAR(user.discriminator)
    }
  },
  makeGuildIconURL: (guildID, iconStr) => {
    return `${CDN_URL}/icons/${guildID}/${iconStr}.jpg?size=128`
  },
  _formatImage (url, size = 128) {
    const format = url.includes('/a_') ? 'gif' : 'jpg'
    return `${url}.${format}?size=${size}`
  },
  idToTimeMs (id) {
    return Math.floor(id / 4194304) + 1420070400000
  }
}
