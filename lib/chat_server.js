const socketio = require('socket.io');
let io;
let guestNumber = 1;
const nickNames = {};
const nameUsed = [];
const currentRoom = {};

exports.listen = (server) => {
  io = socketio.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', (socket) => {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, nameUsed);
    joinRoom(socket, 'Lobby');
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, nameUsed);
    handleRoomJoining(socket);

    socket.on('room', () => {
      socket.emit('room', io.sockets.manager.rooms)
    });

    handleClientDisConnection(socket, nickNames, nameUsed);
  });
};

// 分配昵称
const assignGuestName = (socket, guestNumber, nickNames, nameUsed) => {
  let name = 'Guest' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult', {
    success: true,
    name
  });
  nameUsed.push(name);
  return guestNumber + 1;
};

// 进入聊天室
const joinRoom = (socket, room) => {
  socket.join(room);
  currentRoom[socket.id] = room;

  socket.emit('joinResult', { room });

  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + 'has joined' + room + '.'
  });

  let usersInRoom = io.sockets.clients(room);
  if (usersInRoom.length > 1) {
    let usersInRoomSummary = ['Users currently in ', room, ': '].join('');
    for (let index in usersInRoom) {
      let userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', { text: usersInRoomSummary });
  }
};

// 昵称变更
const handleNameChangeAttempts = (socket, nickNames, nameUsed) => {
  socket.on('nameAttempt', (name) => {
    if (name.indexof('Guest') == 0) {
      socket.emit('nameResult', {
        success: false,
        text: 'Name cannot begin width "Guest".'
      });
    } else {
      if (nameUsed.indexof(name) == -1) {
        let previousName = nickName[socket.id];
        let previousNameIndex = nameUsed.index(previousName);
        nameUsed.push(name);
        delete nameUsed[previousNameIndex];
        socket.emit('nameResult', {
          success: true,
          name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + ' is now know as ' + name + '.'
        });
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use .'
        });
      }
    }
  });
};

// 发送消息
const handleMessageBroadcasting = (socket, nickNames) => {
  socket.on('message', (message) => {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
};

// 创建房间
const handleRoomJoining = (socket) => {
  socket.on('join', (room) => {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
};

// 断开连接
const handleClientDisConnection = (socket, nickNames, nameUsed) => {
  socket.on('disconnect', () => {
    let nameIndex = nameUsed.indexof(nickNames[socket.id]);
    delete nameUsed[nameIndex];
    delete nickNames[socket.id];
  });
};

