import Attendee from '../entities/attendee.js';
import Room from '../entities/room.js';
import { constants } from '../utils/constants.js';
import CustomMap from '../utils/customMap.js';

export default class RoomsController {
  #users = new Map();

  constructor({ roomsPubSub }) {
    this.roomsPubSub = roomsPubSub;
    this.rooms = new CustomMap({
      observer: this.#roomObserver(),
      customMapper: this.#mapRoom.bind(this)
    });
  }

  // Sempre que alguém mexer na room este método será chamado
  #roomObserver() {
    return {
      notify: (rooms) => this.notifyRoomsSubscriber(rooms)
    }
  }

  speakAnswer(socket, { answer, user }) {
    const userId = user.id;
    const currentUser = this.#users.get(userId);
    const updatedUser = new Attendee({
      ...currentUser,
      isSpeaker: answer,
    });
    this.#users.set(userId, updatedUser);

    const roomId = user.roomId;
    const room = this.rooms.get(roomId);
    const userOnRoom = [...room.users.values()].find(({ id }) => id === userId);
    room.users.delete(userOnRoom);
    room.users.add(updatedUser);
    this.rooms.set(roomId, room);

    // Volta para ele mesmo
    socket.emit(constants.events.UPDATE_USER_PERMISSION, updatedUser);

    // Notifica a sala inteira para ligar para este novo speaker
    this.#notifyUserProfileUpgrade(socket, roomId, updatedUser);
  }

  speakRequest(socket) {
    const userId = socket.id;
    const user = this.#users.get(userId);

    const roomId = user.roomId;
    const owner = this.rooms.get(roomId)?.owner;
    socket.to(owner.id).emit(constants.events.SPEAK_REQUEST, user);
  }

  notifyRoomsSubscriber(rooms) {
    const event = constants.events.LOBBY_UPDATED;
    this.roomsPubSub.emit(event, [...rooms.values()]);
  }

  // Sempre que alguém se conectar será chamada este método
  onNewConnection(socket) {
    const { id } = socket;
    console.log('Connection stablished with', id);
    this.#updateGlobalUserData(id);
  }

  disconnect(socket) {
    console.log('Disconnect!!!', socket.id);
    this.#logoutUser(socket);
  }

  #logoutUser(socket) {
    const userId = socket.id;
    const user = this.#users.get(userId);
    const roomId = user.roomId;
    // Remover user da lista de usuários ativos
    this.#users.delete(userId);

    // Caso seja um usuário que estava em uma sala que não existe mais
    if (!this.rooms.has(roomId)) {
      return;
    }

    // Removendo usuário da sala
    const room = this.rooms.get(roomId);
    const toBeRemoved = [...room.users].find(({ id }) => id === userId);
    room.users.delete(toBeRemoved);

    // Se não tiver mais nenhum usuário na sala, mata a sala.
    if(!room.users.size) {
      this.rooms.delete(roomId);
      return;
    }

    // Verificar se o usuário desconctado era o dono da sala.
    const disconnetedUserWasOwner = userId === room.owner.id;

    // Verificar se havia apenas um usuário
    const onlyOneUserLeft = room.users.size === 1;

    // Validar se havia apenas um usuário ou se o usuário era o dono da sala
    if (disconnetedUserWasOwner || onlyOneUserLeft) {
      // Passando o socket para notificar mais targe que houve troca de liderança na sala.
      room.owner = this.#getNewRoomOwner(room, socket);
    }

    // Atualizar sala logo depois
    this.rooms.set(roomId, room);

    // Notifica a sala que o usuário foi desconectado
    socket.to(roomId).emit(constants.events.USER_DISCONNECTED, user);
  }

  #notifyUserProfileUpgrade(socket, roomId, user) {
    socket.to(roomId).emit(constants.events.UPDATE_USER_PERMISSION, user);
  }

  #getNewRoomOwner(room, socket) {
    const users = [...room.users.values()];
    // Find vai retornar o primeiro (mais velho)
    const activeSpeakers = users.find(user => user.isSpeaker);

    // Se quem desconectou era o dono, passa a liderança para o próximo.
    // Se não houver speaker, ele pega o attendee mais antigo (primeira posição);
    const [newOwner] = activeSpeakers ? [activeSpeakers] : users;
    newOwner.isSpeaker = true;
    const outdatedUser = this.#users.get(newOwner.id);

    // vai pegar tudo que tinha no antigo e tudo que tem atualizado no novo. No caso, apenas o isSpeaker;
    const updatedUser = new Attendee({
      ...outdatedUser,
      ...newOwner,
    });

    this.#users.set(newOwner.id, updatedUser);

    this.#notifyUserProfileUpgrade(socket, room.id, newOwner)
    return newOwner;
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