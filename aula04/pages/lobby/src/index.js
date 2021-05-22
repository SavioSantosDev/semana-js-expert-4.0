import { constants } from '../../shared/constants.js';
import LobbyController from './controller.js';
import LobbySocketBuilder from './utils/lobbySocketBuilder.js';
import View from './view.js';

const user = {
  username: 'User' + Date.now(),
  img: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-256.png'
}

const socketBuilder = new LobbySocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.lobby,
});

const dependencies = {
  socketBuilder,
  user,
  view: View,
}

// Alguns navegadores não possuem suporte ao top-level-await
LobbyController.initialize(dependencies)
  .catch(err => { alert(err.message) });