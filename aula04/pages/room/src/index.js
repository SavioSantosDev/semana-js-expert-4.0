import { constants } from '../../shared/constants.js'
import Media from '../../shared/media.js';
import PeerBuilder from '../../shared/PeerBuilder.js';
import RoomController from './controller.js';
import RoomService from './service.js';
import RoomSocketBuilder from './utils/RoomSocket.js';
import View from './view.js';

const urlParams = new URLSearchParams(window.location.search);
const keys = ['id', 'topic'];
const urlData = keys.map((key) => [key, urlParams.get(key)]);

const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
});

const peerBuilder = new PeerBuilder({
  peerConfig: constants.peerConfig,
})

// Dados que virão do github
const user = {
  username: 'User' + Date.now(),
  img: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-256.png'
}

const roomInfo = {
  user,
  room: {...Object.fromEntries(urlData)}
};

const roomService = new RoomService({
  media: Media,
});

const dependencies = {
  view: View,
  socketBuilder,
  roomInfo,
  peerBuilder,
  roomService
}

RoomController.initialize(dependencies)
  .catch(err => {
    alert(err.message)
  });
