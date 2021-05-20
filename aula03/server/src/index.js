import Event from 'events';

import RoomsController from './controllers/rooms.controller.js';
import SocketServer from './utils/SocketServer.js';
import { constants } from './utils/constants.js';
import LobbyController from './controllers/lobby.controller.js';

const port = process.env.PORT || 3000;
const socketServer = new SocketServer({ port });

// Não é necessário encapsular dentro de uma função pois
// já está presente o top-level-await nas versões mais recentes
// do node, 14.8 se não me engano.
const server = await socketServer.start();

const roomsPubSub = new Event();

const roomsController = new RoomsController({
  roomsPubSub
});
const lobbyController = new LobbyController({
  activeRooms: roomsController.rooms,
  roomsListener: roomsPubSub
});

// Cada tela terá uma namespace diferente
const namespaces = {
  room: { controller: roomsController, eventEmitter: new Event() },
  lobby: { controller: lobbyController, eventEmitter: roomsPubSub },
}

// namespaces.room.eventEmitter.on(
//   'userConnected',
//   namespaces.room.controller.onNewConnection(namespaces.room.controller)
// )
// namespaces.room.eventEmitter.emit('userConnected', { id: '001' });
// namespaces.room.eventEmitter.emit('userConnected', { id: '002' });
// namespaces.room.eventEmitter.emit('userConnected', { id: '003' });

const routeConfig = Object.entries(namespaces)
  .map(([namespace, { controller, eventEmitter }]) => {
    const controllerEvents = controller.getEvents();
    eventEmitter.on(
      constants.events.USER_CONNECTED,
      controller.onNewConnection.bind(controller)
    );

    return {
      [namespace]: { events: controllerEvents, eventEmitter }
    }
  })

socketServer.attachEvents({ routeConfig });

console.log('\nSocket server is running at', server.address().port);
 