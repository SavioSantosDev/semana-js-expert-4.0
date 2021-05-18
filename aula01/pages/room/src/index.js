import { constants } from '../../shared/constants.js'
import RoomSocketBuilder from './utils/RoomSocket.js';

const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
});

const socket = socketBuilder
  .setOnUserConnected((user) => console.log('User connected! ', user))
  .setOnUserDiscoonnected((user) => console.log('User disconnected! ', user))
  .setOnRoomUpdated((room) => console.log('Room list!', room))
  .build()

const room = {
  id: '0001',
  topic: 'Semana js expert!'
}

// Dados que virão do github
const user = {
  username: 'User' + Date.now(),
  img: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-256.png'
}

// Enviar uma mensagem para o server quando a conexão foi estabelecida
socket.emit(constants.events.JOIN_ROOM, {user, room});