export const constants = {
  socketUrl: 'http://localhost:3000',
  socketNamespaces: {
    room: 'room',
    lobby: 'lobby',
  },
  pages: {
    lobby: '/pages/lobby',
    login: '/pages/login',
  },
  // Em vez de [undefined] retornar isso abaixo para fins semanticos
  peerConfig: Object.values({
    id: undefined,
  }),
  events: {
    USER_CONNECTED: 'userConnection',
    USER_DISCONNECTED: 'userDisconnection',
    JOIN_ROOM: 'joinRoom',
    LOBBY_UPDATED: 'lobbyUpdated',
    UPDATE_USER_PERMISSION: 'upgradeUserPermission',

    SPEAK_REQUEST: 'speakRequest',
    SPEAK_ANSWER: 'speakAnswer',
  }
}
