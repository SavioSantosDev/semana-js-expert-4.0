export const constants = {
    socketUrl: 'http://localhost:3000',
    // socketUrl: 'https://as-socket-server.herokuapp.com',
    socketNamespaces: {
        room: 'room',
        lobby: 'lobby'
    },
    peerConfig: Object.values({
        id: undefined,
        // config: {
        //     host: 'as-peerjs-server.herokuapp.com',
        //     secure: true,
        //     path: '/',
        //     port: 9000,
        //     // host: 'localhost',
        // }
    }),
    pages: {
        lobby: '/pages/lobby',
        login: '/pages/login',
    },
    events: {
        USER_CONNECTED: 'userConnection',
        USER_DISCONNECTED: 'userDisconnection',

        JOIN_ROOM: 'joinRoom',
        LOBBY_UPDATED: 'lobbyUpdated',
        UPGRADE_USER_PERMISSION: 'upgradeUserPermission',

        SPEAK_REQUEST: 'speakRequest',
        SPEAK_ANSWER: 'speakAnswer'
    },
    firebaseConfig: {
        apiKey: "AIzaSyDBaZK24K5tkj-WtWzl9PDDxd1b3rr1U-0",
        authDomain: "semana-js-expert-04.firebaseapp.com",
        projectId: "semana-js-expert-04",
        storageBucket: "semana-js-expert-04.appspot.com",
        messagingSenderId: "804818956149",
        appId: "1:804818956149:web:dc253f42db11591c3d2d3c",
        measurementId: "G-NHBN8Q16LF"
    },
    storageKey: 'jsexpert:storage:user'
}