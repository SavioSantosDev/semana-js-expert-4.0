import { constants } from '../../../shared/constants.js';
import SocketBuilder from '../../../shared/SocketBuilder.js';

export default class LobbySocketBuilder extends SocketBuilder {
  constructor({ socketUrl, namespace}) {
    super({ socketUrl, namespace })
    this.onLobbyUpdated = () => {};
    this.onUserProfileUpgrade = () => {};
  }

  setOnLobbyUpdated(fn) {
    this.onLobbyUpdated = fn;
    return this;
  }

  build() {
    const socket = super.build();

    socket.on(constants.events.LOBBY_UPDATED, this.onLobbyUpdated);

    return socket;
  }
}