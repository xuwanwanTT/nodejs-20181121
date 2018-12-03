class Chat {
  constructor(socket) {
    this.socket = socket;
  }

  sendMessage(room, text) {
    this.socket.emit('message', { room, text });
  }

  changeRoom(room) {
    this.socket.emit('join', {
      newRoom: room
    });
  }

  processCommand(command) {
    let words = command.split(' ');
    command = words[0].substring(1, words[0].length).toLowerCase();
    let message = false;
    console.log(words);
    console.log(command);
    switch (command) {
      case 'join':
        words.shift();
        let room = words.join(' ');
        this.changeRoom(room);
        break;
      case 'nick':
        words.shift();
        let name = words.join(' ');
        console.log(this.socket.emit)
        this.socket.emit('nameAttempt', name);
        break;
      default:
        message = 'Unrecognized command .';
        break;
    }
    return message;
  }
};
