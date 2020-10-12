const send = require('../modules/webhooksender')
const { makeAvatarURL, idToTimeMs } = require('../../../lib/utils/userutils')

module.exports = {
  name: 'voiceStateUpdate',
  type: 'on',
  handle: async (voiceState, oldVoiceState) => {
    const guild = await global.LoggerBot.getGuild(voiceState.guild_id)
    const member = guild.members[voiceState.user_id]
    if (!member) return console.error('missing member ')
    if (!oldVoiceState.voiceState) {
      global.ConsoleLog.debug('old voice state does not contain voice data.')
    } else {
      const voiceStateUpdateEvent = {
        guildID: voiceState.guild_id,
        eventName: 'VOICE_STATE_UPDATE',
        embed: {
          thumbnail: {
            url: makeAvatarURL(guild.members[voiceState.user_id])
          },
          fields: [],
          color: 3553599
        }
      }
      const fields = []
      if (voiceState.deaf !== oldVoiceState.voiceState.deaf) {
        fields.push({
          name: 'Changes',
          value: voiceState.deaf ? 'was deafened' : 'was undeafened'
        })
      }
      if (voiceState.mute !== oldVoiceState.voiceState.mute) {
        fields.push({
          name: 'Changes',
          value: voiceState.mute ? 'was muted' : 'was unmuted'
        })
      }
      if (voiceState.channel_id !== oldVoiceState.voiceState.channel_id) {
        // channel id was changed
        if (voiceState.channel_id && oldVoiceState.voiceState.channel_id) {
          fields.push({
            name: 'Changes',
            value: `Now in <#${voiceState.channel_id}>\nWas in <#${oldVoiceState.voiceState.channel_id}>`
          })
          voiceStateUpdateEvent.eventName = 'voiceChannelSwitch'
        } else {
          fields.push({
            name: 'Changes',
            value: voiceState.channel_id ? `Joined <#${voiceState.channel_id}>` : `Left <#${oldVoiceState.channel_id}>`
          })
          voiceState.channel_id ? voiceStateUpdateEvent.eventName = 'voiceChannelJoin' : voiceStateUpdateEvent.eventName = 'voiceChannelLeave'
          // if voicestate channel id then: Joined <#id>
          // if oldvoicestate channel id then: Left <#id> (audit logs)
        }
      }
      voiceStateUpdateEvent.embed.fields = fields
      await send(voiceStateUpdateEvent)
    }
  }
}
