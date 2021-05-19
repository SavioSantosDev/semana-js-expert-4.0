import { constants } from '../../shared/constants.js'
import RoomController from './controller.js';
import RoomSocketBuilder from './utils/RoomSocket.js';
import View from './view.js';

const urlParams = new URLSearchParams(window.location.search);
const keys = ['id', 'topic'];
// debugger
const urlData = keys.map((key) => [key, urlParams.get(key)]);


const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
});

// Dados que virão do github
const user = {
  username: 'User' + Date.now(),
  img: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-256.png'
}

const roomInfo = {
  user,
  room: {...Object.fromEntries(urlData)}
};

const dependencies = {
  view: View,
  socketBuilder,
  roomInfo
}

await RoomController.initialize(dependencies);

