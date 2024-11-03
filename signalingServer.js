const express = require('express');
const { Server } = require('socket.io');
const https = require('https');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// HTTPS 서버 설정
const options = {
    key: fs.readFileSync('/home/ubuntu/corp-collab-server/_wildcard.example.dev+3-key.pem'),
    cert: fs.readFileSync('/home/ubuntu/corp-collab-server/_wildcard.example.dev+3.pem'),
};

const app = express();
const server = https.createServer(options, app);
const io = new Server(server);

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 파일이 저장될 디렉토리
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // 파일 이름을 현재 시간 + 원래 이름으로 설정
    },
});

const upload = multer({ storage });

// 정적 파일 제공
app.use('/', express.static('public'));

// 업로드 엔드포인트
app.post('/upload', upload.single('video'), (req, res) => {
    if (req.file) {
        console.log('Received video file:');
        console.log(`Filename: ${req.file.filename}`);
        console.log(`Path: ${req.file.path}`);
        console.log(`Mimetype: ${req.file.mimetype}`);
        console.log(`Size: ${req.file.size} bytes`);
        res.status(200).send('Video uploaded successfully');
    } else {
        res.status(400).send('No file received');
    }
});

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
    socket.on('join', (roomId) => {
        const selectedRoom = io.sockets.adapter.rooms.get(roomId);
        const numberOfClients = selectedRoom ? selectedRoom.size : 0;

        if (numberOfClients === 0) {
            console.log(`Creating room ${roomId} and emitting room_created socket event`);
            socket.join(roomId);
            socket.emit('room_created', roomId);
        } else if (numberOfClients === 1) {
            console.log(`Joining room ${roomId} and emitting room_joined socket event`);
            socket.join(roomId);
            socket.emit('room_joined', roomId);
        } else {
            console.log(`Can't join room ${roomId}, emitting full_room socket event`);
            socket.emit('full_room', roomId);
        }
    });

    // 이 이벤트는 같은 방에 연결된 소켓에 전파됩니다.
    socket.on('start_call', (roomId) => {
        console.log(`Broadcasting start_call event to peers in room ${roomId}`);
        socket.to(roomId).emit('start_call');
    });

    socket.on('webrtc_offer', (event) => {
        console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`);
        socket.to(event.roomId).emit('webrtc_offer', event.sdp);
    });

    socket.on('webrtc_answer', (event) => {
        console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`);
        socket.to(event.roomId).emit('webrtc_answer', event.sdp);
    });

    socket.on('webrtc_ice_candidate', (event) => {
        console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`);
        socket.to(event.roomId).emit('webrtc_ice_candidate', event);
    });
});

// 서버 시작
const port = process.env.PORT || 5001;
server.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
