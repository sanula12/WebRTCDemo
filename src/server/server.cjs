const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('sendOffer', (offer) => {
    socket.broadcast.emit('receiveOffer', offer);
  });

  socket.on('sendAnswer', (answer) => {
    socket.broadcast.emit('receiveAnswer', answer);
  });

  socket.on('sendCandidate', (candidate) => {
    socket.broadcast.emit('receiveCandidate', candidate);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
