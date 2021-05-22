import { constants } from '../../shared/constants.js';
import Attendee from './entities/attendee.js';

export default class RoomController {
  constructor({
    roomInfo,
    socketBuilder,
    view,
    peerBuilder,
    roomService,
  }) {
    this.roomInfo = roomInfo;
    this.socketBuilder = socketBuilder;
    this.view = view;
    this.peerBuilder = peerBuilder;
    this.roomService = roomService;
    this.socket = {};
  }

  static async initialize(deps) {
    return new RoomController(deps)._initialize();
  }

  async _initialize() {
    this._setupViewEvents();
    this.roomService.init();

    this.socket = this._setSocket();
    this.roomService.setCurrentPeer(await this._setupWebRTC());
  }

  _setupViewEvents() {
    this.view.configureOnMicrophoneActivatedButton(this.onMicrophoneActivation());
    this.view.configureLeaveButton();
    this.view.configureClapButton(this.onClapPressed())
    this.view.updateUserImage(this.roomInfo.user);
    this.view.updateRoomTopic(this.roomInfo.room);
  }

  onMicrophoneActivation() {
    return async () => {
      await this.roomService.toggleAudioActivation();
    };
  }

  onClapPressed() {
    return () => {
      // Usuário que vai ser o attendee
      this.socket.emit(constants.events.SPEAK_REQUEST, this.roomInfo.user);
    }
  }

  _setSocket() {
    return this.socketBuilder
      .setOnUserConnected(this._onUserConnected())
      .setOnUserDiscoonnected(this._onUserDisconnected())
      .setOnRoomUpdated(this._onRoomUpdated())
      .setOnUserProfileUpgrade(this._onUserProfileUpgrade())
      .setOnSpeakRequested(this._onSpeakRequested())
      .build()
  }

  _onSpeakRequested() {
    return (data) => {
      const user = new Attendee(data);
      const result = prompt(`${user.username} pediu para falar, aceita? 1 sim, 0 não`);
      this.socket.emit(constants.events.SPEAK_ANSWER, { answer: !!Number(result), user})
    };
  }

  _onUserProfileUpgrade() {
    return (data) => {
      const attendee = new Attendee(data);
      console.log('onUserProfileUpgrade', attendee);
      if (attendee.isSpeaker) {
        this.roomService.upgradeUserPermission(attendee);
        this.view.addAttendeeOnGrid(attendee, true);
      }
      this.activateUserFeatures();
    };
  }
 
  _onRoomUpdated() {
    return (data) => {
      const users = data.map(item => new Attendee(item));
      console.log('Room list!', users);
      this.roomService.updateCurrentUserProfile(users);
      this.view.updateAttendeeOnGrid(users);
      this.activateUserFeatures();
    }
  }

  _onUserDisconnected() {
    return (data) => {
      const attendee = new Attendee(data); // para ganhar intelisense mas gasta um pouco mais de memória

      console.log(`${attendee.username} disconnected!`);
      this.view.removeItemFromGrid(attendee.id);

      this.roomService.disconnectPeer(attendee); 
    }
  }

  _onUserConnected() {
    return (user) => {
      console.log('User connected! ', user);
      this.view.addAttendeeOnGrid(user);

      this.roomService.callNewUser(user);
    }
  }

  async _setupWebRTC() {
    return this.peerBuilder
      .setOnError(this._onPeerError())
      .setOnConnectionOpenned(this._onPeerConnectionOppened())
      .setOnCallReceived(this._onCallReceived())
      .setOnCallError(this._onCallError())
      .setOnCallClose(this._onCallClose())
      .setOnStreamReceived(this._onStreamReceived())
      .build()
  }

  _onStreamReceived() {
    return (call, stream) => {
      console.log('_onStreamReceived', call, stream);
      const callerId = call.peer;
      const { isCurrentId } = this.roomService.addReceivedPeer(call);
      // Quero ouvir o audio apenas dos que não são meus
      this.view.renderAudioElement({
        callerId,
        stream,
        isCurrentId,
      })
    };
  }

  _onCallClose() {
    return (call) => {
      console.log('_onCallClose', call);
      const peerId = call.peer;
      this.roomService.disconnectPeer({ peerId });
    };
  }

  _onCallError() {
    return (call, error) => {
      console.log('_onCallError', call, error);
      const peerId = call.peer;
      this.roomService.disconnectPeer({ peerId });
    };
  }

  _onCallReceived() {
    return async (call) => {
      const stream = await this.roomService.getCurrentStream();
      console.log('answering call', call);
      call.answer(stream);
    };
  }

  // Quando a conexão for aberta ele pede para entrar na sala do scoket
  _onPeerConnectionOppened() {
    return (peer) => {
      console.log('peeeer', peer);
      this.roomInfo.user.peerId = peer.id;
      // Enviar uma mensagem para o server quando a conexão foi estabelecida
      this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo);
    };
  }

  _onPeerError() {
    return (error) => {
      console.log('deu ruim', error);
    };
  }

  activateUserFeatures() {
    const currentUser = this.roomService.getCurrentUser();
    this.view.showUserFeatures(currentUser.isSpeaker);
  }
}





