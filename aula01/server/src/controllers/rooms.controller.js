import Attendee from '../entities/attendee.js';
import Room from '../entities/room.js';
import { constants } from '../utils/constants.js';

export default class RoomsController {
  #users = new Map();

  constructor() {
    this.rooms = new Map();
  }

  // Sempre que alguém se conectar será chamada este método
  onNewConnection(socket) {
    const { id } = socket;
    console.log('Connection stablished with', id);
    this.#updateGlobalUserData(id);
  }

  joinRoom(socket, { user, room }) {
    const userId = user.id = socket.id;
    const roomId = room.id;

    const updatedUserData = this.#updateGlobalUserData(userId, user, roomId);
    
    const updatedRoom = this.#joinUserRoom(socket, updatedUserData, room);
    this.#notifyUsersOnRoom(socket, roomId, updatedUserData);
    this.#replyWithActiveUsers(socket, updatedRoom.users);
  }

  #replyWithActiveUsers(socket, users) {
    const event = constants.events.LOBBY_UPDATED;
    socket.emit(event, [...users.values()]);
  }

  #notifyUsersOnRoom(socket, roomId, user) {
    const event = constants.events.USER_CONNECTED;
    // Notificar todos que estão naquela sala
    socket.to(roomId).emit(event, user);
  }

  #joinUserRoom(socket, user, room) {
    const roomId = room.id;
    const existingRoom = this.rooms.has(roomId);
    const currentRoom = existingRoom ? this.rooms.get(roomId) : {};
    const currentUser = new Attendee({
      ...user,
      roomId,
    });

    // Definir quem é o dono da sala
    const [owner, users] = existingRoom
      ? [currentRoom.owner, currentRoom.users]
      : [currentUser, new Set()];

    const updatedRoom = this.#mapRoom({
      ...currentRoom,
      ...room,
      owner,
      users: new Set([ ...users, ...[currentUser]])
    });
    this.rooms.set(roomId, updatedRoom);

    socket.join(roomId);

    return this.rooms.get(roomId);
  }

  #mapRoom(room) {
    const users = [...room.users.values()];
    const speakersCount = users.filter(user => user.isSpeaker).length;
    const featuredAttendees = users.slice(0, 3);
    const mappedRoom = new Room({
      ...room,
      speakersCount,
      featuredAttendees,
      attendeesCount: room.users.size,
    });

    return mappedRoom;
  }

  #updateGlobalUserData(userId, userData = {}, roomId = '') {
    const user = this.#users.get(userId) ?? {};
    const existingRoom = this.rooms.has(roomId);

    const updatedUserData = new Attendee({
      ...user,
      ...userData,
      roomId,
      // Se for o único na sala
      isSpeaker: !existingRoom,
    });
    this.#users.set(userId, updatedUserData);
    return this.#users.get(userId);
  }

  getEvents() {

    // O Socket pede obrigatoriamente uma string com o nome do evento e uma função
    // Então, o nome do método dentro desta classe será a string com o nome do evento no socket
    // e o corpo do método aqui será a função lá :)


    // Retorna um array com o nome das funções públicas desta classe
    const functions = Reflect.ownKeys(RoomsController.prototype)
      .filter((fn) => fn !== 'constructor')
      .map((fn) => [[fn], this[fn].bind(this)])

    /*
    [
      [onNewConnection, this.onNewConnection],
      [disconnect, this.disconnect].
    ]
    */

    return new Map(functions);
  }
}