const divEscapedContentElement = (message) => {
  return $('<div></div>').text(message);
};

const divSystemContentElement = (message) => {
  return $('<div></div>').html('<i>' + message + '</i>');
};

const processUserInput = (chatApp, socket) => {
  let message = $('#send-message').val();
  let systemMessage = null;
  console.log(chatApp)
  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
    console.log('1: ', $('#room').text(), '2', message)
    chatApp.sendMessage($('#room').text(), message);

    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    $('#send-message').val('');
  }
};

const socket = io.connect();

$(document).ready(function () {
  const chatApp = new Chat(socket);

  socket.on('nameResult', (result) => {
    let message = null;
    if (result.success) {
      message = 'You are now known as ' + result.name + ' .';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult', (result) => {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed'));
  });

  socket.on('message', (message) => {
    let dom = $('<div></div>').text(message.text);
    $('#messages').append(dom);
  });

  socket.on('rooms', (rooms) => {
    $('#room-list').empty();

    for (let room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    $('#room-list div').click(function () {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

  setInterval(() => {
    socket.emit('rooms')
  }, 1000);
  $('#send-message').focus();
  $('#send-form').submit(function () {
    processUserInput(chatApp, socket);
    return false;
  });
});
