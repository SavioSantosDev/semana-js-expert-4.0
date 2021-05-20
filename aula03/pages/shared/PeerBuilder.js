class CustomPeer extends globalThis.Peer {
  constructor({ config, onCall }) {
    super(config);
    this.onCall = onCall;

  }

  call(...args) {
    const originalCallResult = super.call(...args);
    this.onCall(originalCallResult);
    return originalCallResult;
  }
}

export default class PeerBuilder {
  constructor({ peerConfig }) {
    this.peerConfig = peerConfig;
    this.onError = () => {};
    this.onConnectionOpenned = () => {};
    this.onCallError = () => {};
    this.onCallClose = () => {};
    this.onCallReceived = () => {};
    this.onStreamReceived = () => {};
  }

  setOnError(fn) {
    this.onError = fn;
    return this;
  }

  setOnConnectionOpenned(fn) {
    this.onConnectionOpenned = fn;
    return this;
  }

  setOnCallError(fn) {
    this.onCallError = fn;
    return this;
  }

  setOnCallClose(fn) {
    this.onCallClose = fn;
    return this;
  }

  setOnCallReceived(fn) {
    this.onCallReceived = fn;
    return this;
  }

  setOnStreamReceived(fn) {
    this.onStreamReceived = fn;
    return this;
  }

  _prepareCallEvent(call) {
    call.on('stream', (stream) => this.onStreamReceived(call, stream));
    call.on('error', (error) => this.onCallError(call, error));
    call.on('close', () => this.onCallClose(call));
    this.onCallReceived(call);
  }

  build() {
    // peer recebe uma lista de argumentos
    // new Peer(id, config1, config2);
    
    const peer = new CustomPeer({
      config: [...this.peerConfig],
      onCall: this._prepareCallEvent.bind(this)
    });
    peer.on('error', this.onError);

    // Quando alguém está fazendo uma chamada
    peer.on('call', this._prepareCallEvent.bind(this));

    return new Promise((resolve) => peer.on('open', () => {
      this.onConnectionOpenned(peer);
      return resolve(peer);
    }));
  }
}