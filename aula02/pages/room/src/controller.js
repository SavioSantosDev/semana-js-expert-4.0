import Attendee from '../../../server/src/entities/attendee.js';
import { constants } from '../../shared/constants.js';

export default class RoomController {
  constructor({
    roomInfo,
    socketBuilder,
    view,
  }) {
    this.roomInfo = roomInfo;
    this.socketBuilder = socketBuilder;
    this.socket = {};
    this.view = view;
  }

  static async initialize(deps) {
    return new RoomController(deps)._initialize();
  }

  async _initialize() {
    this._setupViewEvents();
    this.socket = this._setSocket();

    // Enviar uma mensagem para o server quando a conexão foi estabelecida
    this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo);
  }

  _setupViewEvents() {
    this.view.updateUserImage(this.roomInfo.user);
    this.view.updateRoomTopic(this.roomInfo.room);
  }

  _setSocket() {
    return this.socketBuilder
      .setOnUserConnected(this._onUserConnected())
      .setOnUserDiscoonnected(this._onUserDisconnected())
      .setOnRoomUpdated(this._onRoomUpdated())
      .setOnUserProfileUpgrade(this._onUserProfileUpgrade())
      .build()
  }

  _onUserProfileUpgrade() {
    return (data) => {
      const attendee = new Attendee(data);
      console.log('onUserProfileUpgrade', attendee);
      if (attendee.isSpeaker) {
        this.view.addAttendeeOnGrid(attendee, true);
      }
    };
  }

  _onRoomUpdated() {
    return (room) => {
      console.log('Room list!', room);
      this.view.updateAttendeeOnGrid(room);
    }
  }

  _onUserDisconnected() {
    return (data) => {
      const attendee = new Attendee(data); // para ganhar intelisense mas gasta um pouco mais de memória

      console.log(`${attendee.username} disconnected!`);
      this.view.removeItemFromGrid(attendee.id);
    }
  }

  _onUserConnected() {
    return (user) => {
      console.log('User connected! ', user);
      this.view.addAttendeeOnGrid(user);
    }
  }
}





