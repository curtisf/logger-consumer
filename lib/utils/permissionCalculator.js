const { Permissions } = require('../constants')

module.exports = {
  makeJSON: (allow, deny) => {
    this._json = {}
    for (const perm in Permissions) {
      if (!perm.startsWith('all')) {
        if (allow & Permissions[perm]) {
          this._json[perm] = true
        } else if (deny & Permissions[perm]) {
          this._json[perm] = false
        }
      }
    }
    return this._json
  },
  _memberGuildPermsRaw: (guild, member) => {
    if (member.id === guild.owner_id) {
      return Permissions.all
    } else {
      let perms = guild.roles.find(r => r.id === member.guild_id).permissions
      for (let role of member.roles) {
        role = guild.roles.find(r => r.id === role) // get guild role from member role
        if (!role) {
          continue
        }

        const perm = role.permissions
        if (perm & Permissions.administrator) {
          perms = Permissions.all
          break
        } else {
          perms |= perm
        }
      }
      return perms
    }
  },
  memberGuildPermsJSON: (guild, member) => {
    const rawMemberGuildPerms = module.exports._memberGuildPermsRaw(guild, member)
    return module.exports.makeJSON(rawMemberGuildPerms)
  },
  memberChannelPerms: async (channelID, member) => {
    const guild = await global.LoggerBot.getGuild(member.guild_id)
    let permission = module.exports._memberGuildPermsRaw(guild, member)
    if (permission & Permissions.administrator) {
      return module.exports.makeJSON(Permissions.all)
    }
    const channelOverwrites = await module.exports.getChannelOverwrites(member.guild_id, channelID)
    let overwrite = channelOverwrites.find(o => o.id === member.guild_id)
    if (overwrite) {
      permission = (permission & ~overwrite.deny) | overwrite.allow
    }
    let allow = 0
    let deny = 0
    member.roles.forEach(roleID => {
      if ((overwrite = channelOverwrites.find(c => c.id === roleID))) {
        allow |= overwrite.allow
        deny |= overwrite.deny
      }
    })
    permission = (permission & ~deny) | allow
    overwrite = channelOverwrites.find(o => o.id === member.id)
    if (overwrite) {
      permission = (permission & ~overwrite.deny) | overwrite.allow
    }
    return module.exports.makeJSON(permission)
  },
  getChannelOverwrites: async (guildID, channelID) => {
    const g = await global.LoggerBot.getGuild(guildID)
    return g.channels.find(c => c.id === channelID).permission_overwrites
  },
  getOverwritePermsJSON: (overwrite) => {
    return module.exports.makeJSON(overwrite.allow, overwrite.deny)
  }
}
