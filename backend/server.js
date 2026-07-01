const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/authRoutes');
const meetingRoutes = require('./src/routes/meetingRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'IntellMeet Server chal raha hai! 🚀' });
});

// Socket.io
// Socket.io — WebRTC Signaling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id} ✅`)

  // Room join karo
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    
    // Baaki sab ko batao naya user aaya
    socket.to(roomId).emit('user-joined', { socketId: socket.id })
    
    console.log(`${socket.id} joined room: ${roomId}`)
  })

  // WebRTC Offer
  socket.on('webrtc-offer', ({ offer, to }) => {
    socket.to(to).emit('webrtc-offer', {
      offer,
      from: socket.id
    })
  })

  // WebRTC Answer
  socket.on('webrtc-answer', ({ answer, to }) => {
    socket.to(to).emit('webrtc-answer', {
      answer,
      from: socket.id
    })
  })

  // ICE Candidate
  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', {
      candidate,
      from: socket.id
    })
  })

  // Chat message
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data)
  })

  // Room leave
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId)
    socket.to(roomId).emit('user-left', { socketId: socket.id })
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server port ${PORT} pe chal raha hai ✅`);
});