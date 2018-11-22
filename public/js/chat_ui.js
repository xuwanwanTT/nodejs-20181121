const divEscapedContentElement = (message) => {
  const dom = document.createElement('div');
  dom.innerText = message;
  return dom;
};

const divSystemContentElement = (message) => {
  const dom = document.createElement('div');
  const domMessage = document.createElement('li');
  domMessage.innerText = message;
  dom.appendChild(domMessage);
  return dom;
};

const processUserInput = (chatApp, socket) => {
  let message = document.querySelector('#send-message').value();
  let systemMessage = null;
  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      document.querySelector('#messages').appendChild(divSystemContentElement(systemMessage));
    }
  } else {
    chatApp.sendMessage(document.querySelector('#room').innerText(), message);

    let messageDom = document.querySelector('#messages');
    let height = messageDom.scrollHeight;
    messageDom.appendChild(divEscapedContentElement(message));
    messageDom.scrollTop = height;
    document.querySelector('#send-message').value = '';
  }
};

const socket = io.connect();

document.onload = () => {
  console.log(123)
  const chatApp = new Chat(socket);

  socket.on('nameResult', (result) => {
    let message = null;
    if (result.success) {
      message = 'You are now known as ' + result.name + ' .';
    } else {
      message = result.message;
    }
    document.querySelector('#messages').appendChild(divSystemContentElement(message));
  });

  socket.on('joinResult', (result) => {
    document.querySelector('#room').innerText = result.room;
    document.querySelector('#messages').appendChild(divSystemContentElement('Room changed'));
  });

  socket.on('message', (message) => {
    let dom = document.createElement('div');
    dom.innerText = message.text;
    document.querySelector('#messages').appendChild(dom);
  });

  socket.on('rooms', (rooms) => {
    let roomListDom = document.querySelector('#room-list')
    roomListDom.innerHTML = '';

    for (let room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        roomListDom.appendChild(divEscapedContentElement(room));
      }
    }

    document.querySelector('#room-list div').onclick = function () {
      chatApp.processCommand('/join ');
      document.querySelector('#send-message').focus();
    };
  });

  setInterval(() => {
    socket.emit('rooms')
  }, 1000);

  document.querySelector('#send-form').onsubmit = function () {
    processUserInput(chatApp, socket);
    return false;
  };
};
