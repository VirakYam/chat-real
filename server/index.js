const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: 'https://cautious-tribble-q79vx566r5xxf6jr-3000.app.github.dev',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

const PORT = process.env.PORT || 3001;

// Store connected users
const users = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle new user login
  socket.on('login', (username) => {
    users[username] = socket.id;
    io.emit('user list', Object.keys(users));
    console.log(`${username} logged in`);
  });

  // Handle chat message
  socket.on('chat message', (msg) => {
    console.log('Server received message:', msg);
    io.emit('chat message', msg); // Forward message to all clients
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Remove disconnected user from the list
    const user = Object.keys(users).find(key => users[key] === socket.id);
    if (user) {
      delete users[user];
      io.emit('user list', Object.keys(users)); // Update user list
      console.log(`${user} logged out`);
    }
  });
});

app.get('/', (req, res) => {
  res.send('Socket.IO server is running');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
