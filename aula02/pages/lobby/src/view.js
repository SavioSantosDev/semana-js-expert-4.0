import Room from './entities/room.js';
import getTemplate from './template/lobbyItem.js';

const roomGrid = document.getElementById('roomGrid');
const txtTopic = document.getElementById('txtTopic');
const btnCreateRoomWithoutTopic = document.getElementById('btnCreateRoomWithoutTopic');
const btnCreateRoomWithTopic = document.getElementById('btnCreateRoomWithTopic');

export default class View {
  static clearRoomList() {
    roomGrid.innerHTML = '';
  }

  static generateRoomLink({ id, topic }) {
    return `./../room/index.html?id=${id}&topic=${topic}`;
  }

  static redirectToRoom(topic = '') {
    const id = Date.now().toString(32) + Math.random().toString(36).substring(2);
    window.location = View.generateRoomLink({
      id, topic
    });
  }

  static configureCreateRoomButton() {
    btnCreateRoomWithTopic.addEventListener('click', () => {
      const topic = txtTopic.value;
      View.redirectToRoom(topic);
    })

    btnCreateRoomWithoutTopic.addEventListener('click', () => {
      View.redirectToRoom();
    })
  }

  static updateRoomList(rooms) {
    View.clearRoomList();

    rooms.forEach(room => {
      console.log('Room: ', room);
      const params = new Room({
        ...room,
        roomLink: View.generateRoomLink(room),
      });
      console.log('Params: ', params);
      const htmlTemplate = getTemplate(params);
      roomGrid.innerHTML += htmlTemplate;
    });
  }

  static updateUserImage({ img, username }) {
    imgUser.src = img;
    imgUser.alt = username;
  }
}