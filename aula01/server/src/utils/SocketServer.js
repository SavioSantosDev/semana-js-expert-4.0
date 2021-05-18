import http from 'http';
import { Server } from 'socket.io';
import { constants } from './constants.js';


export default class SocketServer {
  #io;

  constructor({ port }) {
    this.port = port;
    this.namespaces = {};
  }

  /*
    [
      {
        room: {
          events,
          eventEmitter,
        }
      }
    ]
  */
  attachEvents({ routeConfig }) {
    for(const routes of routeConfig) {
      for(const [namespace, { events, eventEmitter }] of Object.entries(routes)) {
        const route = this.namespaces[namespace] = this.#io.of(`/${namespace}`)
        route.on('connection', socket => {
          for(const [functionName, functionValue] of events) {
            socket.on(functionName, (...args) => functionValue(socket, ...args));
          }
          eventEmitter.emit(constants.events.USER_CONNECTED, socket);
        })
        // Validar se o que foi feito no front está funcionando
        // const room = this.#io.of('/room');
        // room.on('connection', socket => {
        //   socket.emit('userConnection', 'socket id se conectou ' + socket.id);
        //   socket.on('joinRoom', (dados) => {
        //     console.log('dados recebidos', dados);
        //   });
        // });
      }
    }
  }

  async start() {
    // web socket parte do principio que está se utilizando protocolo http
    const server = http.createServer((request, response) => {
      response.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      });
      response.end('Hey there');
    });

    this.#io = new Server(server, {
      cors: {
        origin: '*',
        credentials: false,
      },
    });

    return new Promise((resolve, reject) => {
      server.on('error', reject);
      server.listen(this.port, () => resolve(server));
    });
  }
}