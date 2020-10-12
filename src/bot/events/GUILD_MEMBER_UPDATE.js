const { getOverwritePermsJSON } = require('../../../lib/utils/permissionCalculator')
const { makeAvatarURL, idToTimeMs } = require('../../../lib/utils/userutils')
const send = require('../modules/webhooksender')
const { getGuildSettings } = require('../guildSettingsCache')

// This module will probably be the death of this bot.
// Fetching audit logs after each guild member update is absolutely suicide at scale,
// but it beats storing members. Members will be stored if this proves to be unusable.
module.exports = {
  name: 'guildMemberUpdate',
  type: 'on',
  handle: async (member, oldMember) => {
    const guildMemberUpdate = {
      guildID: member.guild_id,
      eventName: 'guildMemberUpdate',
      embed: {
        author: {
          name: `${member.user.username}#${member.user.discriminator}`,
          iconUrl: makeAvatarURL(member.user)
        },
        description: `${member.user.username}#${member.user.discriminator} <@${member.user.id}> ${member.nick ? `(${member.nick})` : ''} was updated`,
        fields: [{
          name: 'Changes',
          value: 'Unknown. Look at the footer to see who updated the affected user.'
        }]
      }
    }
    const guild = await global.LoggerBot.getGuild(member.guild_id)
    if (oldMember && (member.roles.length !== oldMember.roles.length || member.roles.filter(r => !oldMember.roles.includes(r)).length !== 0)) {
      global.LoggerBot.requestClient.getAuditLogs(member.guild_id, {
        limit: 1,
        actionType: 25 }
      ).then(async (log) => {
        if (!log.audit_log_entries[0]) return
        let auditEntryDate = new Date((log.audit_log_entries[0].id / 4194304) + 1420070400000)
        if (new Date().getTime() - auditEntryDate.getTime() < 3000) {
          log.audit_log_entries[0].guild = []
          let user = log.users.find(u => u.id === log.audit_log_entries[0].user_id)
          const gsc = await getGuildSettings(member.guild_id)
          if (user.bot && !gsc.log_bots) return
          let added = []
          let removed = []
          let roleColor
          const changes = log.audit_log_entries[0].changes
          changes.forEach(c => {
            if (c.key === '$remove') {
              removed.push(c.new_value[0])
            } else if (c.key === '$add') {
              added.push(c.new_value[0])
            }
          })
          if (added.length !== 0) {
            roleColor = guild.roles.find(r => r.id === added[0].id).color
          } else if (removed.length !== 0) {
            roleColor = guild.roles.find(r => r.id === removed[0].id).color
          }
          // Add a + or - emoji when roles are manipulated for a user, stringify it, and assign a field value to it.
          guildMemberUpdate.embed.fields[0].value = `${added.map(role => `➕ **${role.name}**`).join('\n')}${removed.map((role, i) => `${i === 0 && added.length !== 0 ? '\n' : ''}\n:x: **${role.name}**`).join('\n')}`
          guildMemberUpdate.embed.color = roleColor
          guildMemberUpdate.embed.footer = {
            text: `${user.username}#${user.discriminator}`,
            iconUrl: makeAvatarURL(user)
          }
          guildMemberUpdate.embed.fields.push({
            name: 'ID',
            value: `\`\`\`ini\nUser = ${member.user.id}\nPerpetrator = ${user.id}\`\`\``
          })
          await send(guildMemberUpdate)
        }
      }).catch(console.error)
    } else if (oldMember && member.nick !== oldMember.nick) {
      guildMemberUpdate.eventName = 'guildMemberNickUpdate'
      guildMemberUpdate.embed.fields[0] = ({
        name: 'New name',
        value: `${member.nick ? member.nick : member.user.username}#${member.user.discriminator}`
      })
      guildMemberUpdate.embed.fields.push({
        name: 'Old name',
        value: `${oldMember.nick ? oldMember.nick : member.user.username}#${member.user.discriminator}`
      })
      guildMemberUpdate.embed.fields.push({
        name: 'ID',
        value: `\`\`\`ini\nUser = ${member.user.id}\`\`\``
      })
      await send(guildMemberUpdate)
    } else if (!oldMember) {
      // oh no, audit log fetching :sadcat:
      global.LoggerBot.requestClient.getAuditLogs(member.guild_id, {
        limit: 1,
        actionType: 25 }
      ).then(async (log) => {
        if (!log.audit_log_entries[0]) return
        let auditEntryDate = new Date((log.audit_log_entries[0].id / 4194304) + 1420070400000)
        if (new Date().getTime() - auditEntryDate.getTime() < 3000) {
          log.audit_log_entries[0].guild = []
          let user = log.users.find(u => u.id === log.audit_log_entries[0].user_id)
          const gsc = await getGuildSettings(member.guild_id)
          if (user.bot && !gsc.log_bots) return
          let added = []
          let removed = []
          let roleColor
          const changes = log.audit_log_entries[0].changes
          changes.forEach(c => {
            if (c.key === '$remove') {
              removed.push(c.new_value[0])
            } else if (c.key === '$add') {
              added.push(c.new_value[0])
            }
          })
          if (added.length !== 0) {
            roleColor = guild.roles.find(r => r.id === added[0].id).color
          } else if (removed.length !== 0) {
            roleColor = guild.roles.find(r => r.id === removed[0].id).color
          }
          // Add a + or - emoji when roles are manipulated for a user, stringify it, and assign a field value to it.
          guildMemberUpdate.embed.fields[0].value = `${added.map(role => `➕ **${role.name}**`).join('\n')}${removed.map((role, i) => `${i === 0 && added.length !== 0 ? '\n' : ''}\n:x: **${role.name}**`).join('\n')}`
          guildMemberUpdate.embed.color = roleColor
          guildMemberUpdate.embed.footer = {
            text: `${user.username}#${user.discriminator}`,
            iconUrl: makeAvatarURL(user)
          }
          guildMemberUpdate.embed.fields.push({
            name: 'ID',
            value: `\`\`\`ini\nUser = ${member.user.id}\nPerpetrator = ${user.id}\`\`\``
          })
          await send(guildMemberUpdate)
        }
      }).catch(console.error)
    }
  }
}
