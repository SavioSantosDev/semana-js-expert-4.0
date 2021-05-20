export const constants = {
  socketUrl: 'http://localhost:3000',
  socketNamespaces: {
    room: 'room',
    lobby: 'lobby',
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
  }
}
