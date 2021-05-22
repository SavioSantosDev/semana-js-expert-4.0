import { constants } from '../utils/constants.js';

export default class LobbyController {
  constructor({ activeRooms, roomsListener }) {
    this.activeRooms = activeRooms;
    this.roomsListener = roomsListener;
  }

  onNewConnection(socket) {
    const { id } = socket;
    console.log('Lobby connetion stablished with', id);
    this.#updateLobbyRooms(socket, [...this.activeRooms.values()]);
    this.#activatedEventProxy(socket);
  }

  #activatedEventProxy(socket) {
    this.roomsListener.on(constants.events.LOBBY_UPDATED, (rooms) => {
      this.#updateLobbyRooms(socket, rooms)
    })
  }

  #updateLobbyRooms(socket, activeRooms) {
    socket.emit(constants.events.LOBBY_UPDATED, activeRooms);
  }

  getEvents() {

    // Retorna um array com o nome das funções públicas desta classe
    const functions = Reflect.ownKeys(LobbyController.prototype)
      .filter((fn) => fn !== 'constructor')
      .map((fn) => [[fn], this[fn].bind(this)])

    return new Map(functions);
  }
}
