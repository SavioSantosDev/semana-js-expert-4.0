import Attendee from './entities/attendee.js';
import getTemplate from './templates/attendeeTemplate.js';

const imgUser = document.getElementById('imgUser');
const roomTopic = document.getElementById('pTopic');
const gridSpeakers = document.getElementById('gridSpeakers');
const gridAttendees = document.getElementById('gridAttendees');

export default class View {
  static updateUserImage({ img, username }) {
    imgUser.src = img;
    imgUser.alt = username;
  }

  static updateRoomTopic({ topic }) {
    roomTopic.innerHTML = topic;
  }

  static addAttendeeOnGrid(item, removeFirst = false) {
    const attendee = new Attendee(item);
    const id = attendee.id;
    const htmlTemplate = getTemplate(attendee);
    const baseElement = attendee.isSpeaker ? gridSpeakers : gridAttendees;
    
    if(removeFirst) {
      View.removeItemFromGrid(id);
      baseElement.innerHTML += htmlTemplate;
      return;
    }

    const existingItem = View._getExistingItemOnGrid({ id, baseElement })
    if (existingItem) {
      existingItem.innerHTML = htmlTemplate;
      return;
    }

    baseElement.innerHTML += htmlTemplate;
  }

  static _getExistingItemOnGrid({ id, baseElement = document }) {
    const existItem = baseElement.querySelector(`[id=${id}]`);
    return existItem;
  }

  static updateAttendeeOnGrid(users) {
    users.forEach(user => View.addAttendeeOnGrid(user));
  }

  static removeItemFromGrid(id) {
    const existingElement = View._getExistingItemOnGrid({ id });
    existingElement?.remove();
  }

  
}
