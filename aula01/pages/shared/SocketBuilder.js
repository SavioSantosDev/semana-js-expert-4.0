import { constants } from './constants.js'; // ES MODULES precisa por a extensão


/**
 * Design patter Builder - Construir objetos sob demanda.
 */

export default class SocketBuilder {

  constructor({ socketUrl, namespace }) {
    this.socketUrl = `${socketUrl}/${namespace}`;
    // Funções em branco caso não sejam chamados os métodos abaixo
    this.onUserConnected = () => {};
    this.onUserDiscoonnected = () => {};
  }

  setOnUserConnected(fn) {
    this.onUserConnected = fn;
    return this; // Para continuar chamando os sets 
  }

  setOnUserDiscoonnected(fn) {
    this.onUserDiscoonnected = fn;
    return this;
  }

  // Estamos partindo do principio de que irão chamar os métodos anteriores antes de chamar o build
  build() {
    // .io - Variável global inserida no template, pelo cdn do socket.io
    const socket = globalThis.io.connect(this.socketUrl, {
      withCredentials: false,
    });

    socket.on('connection', () => console.log('Conectei!'));
    socket.on(constants.events.USER_CONNECTED, this.onUserConnected);
    socket.on(constants.events.USER_DISCONNECTED, this.onUserDiscoonnected);

    return socket;
  }
}
