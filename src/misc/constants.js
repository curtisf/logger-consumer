exports.EVENT_LOGS = [
  'channelCreate',
  'channelUpdate',
  'channelDelete',
  'guildBanAdd',
  'guildBanRemove',
  'guildRoleCreate',
  'guildRoleDelete',
  'guildRoleUpdate',
  'guildUpdate',
  'messageDelete',
  'messageDeleteBulk',
  'messageReactionRemoveAll',
  'messageUpdate',
  'guildMemberAdd',
  'guildMemberKick',
  'guildMemberRemove',
  'guildMemberUpdate',
  'voiceChannelLeave',
  'voiceChannelJoin',
  'voiceStateUpdate',
  'voiceChannelSwitch',
  'guildEmojisUpdate',
  'guildMemberNickUpdate'
]

exports.EVENTS_USING_AUDITLOGS = [
  'channelCreate',
  'channelUpdate',
  'channelDelete',
  'guildBanAdd',
  'guildBanRemove',
  'guildRoleCreate',
  'guildRoleDelete',
  'guildRoleUpdate',
  'guildUpdate',
  'messageDeleteBulk',
  'guildMemberKick',
  'guildMemberRemove',
  'guildMemberUpdate',
  'voiceStateUpdate',
  'guildEmojisUpdate']

exports.ERIS_EVENTS_TO_RAW = {
  'channelCreate': 'CHANNEL_CREATE',
  'channelUpdate': 'CHANNEL_UPDATE',
  'channelDelete': 'CHANNEL_DELETE',
  'guildBanAdd': 'GUILD_BAN_ADD',
  'guildBanRemove': 'GUILD_BAN_REMOVE',
  'guildRoleCreate': 'GUILD_ROLE_CREATE',
  'guildRoleDelete': 'GUILD_ROLE_DELETE',
  'guildRoleUpdate': 'GUILD_ROLE_UPDATE',
  'guildUpdate': 'GUILD_UPDATE',
  'messageDelete': 'MESSAGE_DELETE',
  'messageDeleteBulk': 'MESSAGE_DELETE_BULK',
  'messageReactionRemoveAll': 'MESSAGE_REACTION_REMOVE_ALL',
  'messageUpdate': 'MESSAGE_UPDATE',
  'guildMemberAdd': 'GUILD_MEMBER_ADD',
  'guildMemberKick': 'GUILD_MEMBER_KICK',
  'guildMemberRemove': 'GUILD_MEMBER_REMOVE',
  'guildMemberUpdate': 'GUILD_MEMBER_UPDATE',
  'voiceChannelLeave': 'VOICE_CHANNEL_LEAVE',
  'voiceChannelJoin': 'VOICE_CHANNEL_JOIN',
  'voiceStateUpdate': 'VOICE_STATE_UPDATE',
  'voiceChannelSwitch': 'VOICE_CHANNEL_SWITCH',
  'guildEmojisUpdate': 'GUILD_EMOJIS_UPDATE',
  'guildMemberNickUpdate': 'GUILD_MEMBER_NICK_UPDATE'
}

exports.EVENT_LOGS_EMPTY_CAPS = {
  CHANNEL_CREATE: '',
  CHANNEL_UPDATE: '',
  CHANNEL_DELETE: '',
  GUILD_BAN_ADD: '',
  GUILD_BAN_REMOVE: '',
  GUILD_ROLE_CREATE: '',
  GUILD_ROLE_DELETE: '',
  GUILD_ROLE_UPDATE: '',
  GUILD_UPDATE: '',
  MESSAGE_DELETE: '',
  MESSAGE_DELETE_BULK: '',
  MESSAGE_REACTION_REMOVE_ALL: '',
  MESSAGE_UPDATE: '',
  GUILD_MEMBER_ADD: '',
  GUILD_MEMBER_KICK: '',
  GUILD_MEMBER_REMOVE: '',
  GUILD_MEMBER_UPDATE: '',
  VOICE_CHANNEL_LEAVE: '',
  VOICE_CHANNEL_JOIN: '',
  VOICE_STATE_UPDATE: '',
  VOICE_CHANNEL_SWITCH: '',
  GUILD_EMOJIS_UPDATE: '',
  GUILD_MEMBER_NICK_UPDATE: ''
}
