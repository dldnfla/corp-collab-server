const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { User } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { transports: ['websocket'] });

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir); // uploads 디렉토리가 없으면 생성
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.post('/upload', upload.single('video'), (req, res) => {
    if (req.file) {
        console.log('Received video file:', req.file);
        res.status(200).send('Video uploaded successfully');
    } else {
        res.status(400).send('No file received');
    }
});

// 방 정보를 저장하기 위한 메모리 객체
const rooms = {};

// 로그 출력 함수
function logRoomState() {
    console.log('Current rooms state:', JSON.stringify(rooms, null, 2));
}

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.emit('connection_success', { message: 'Connection established', socketId: socket.id });

    socket.on('create_room', (roomInfo, callback) => {
        console.log('Received create_room request:', roomInfo);

        const { roomId, userId } = roomInfo;

        if (!roomId || !userId) {
            console.error('Invalid roomInfo:', roomInfo);
            callback({ status: 'error', error: 'Invalid room info' });
            return;
        }

        if (rooms[roomId]) {
            console.log(`Room ${roomId} already exists.`);
            callback({ status: 'error', error: 'Room already exists' });
        } else {
            rooms[roomId] = { roomId, userId, owner: socket.id, clients: [socket.id] };
            socket.join(roomId);
            console.log(`Room ${roomId} created by user ${userId}`);
            console.log('Current rooms state:', rooms);  // 상태 출력 추가
            callback({ status: 'success', roomId });
        }
    });


    socket.on('join', (roomId) => {
        const selectedRoom = io.sockets.adapter.rooms.get(roomId);
        const numberOfClients = selectedRoom ? selectedRoom.size : 0;

        if (numberOfClients === 0) {
            console.log(`Room ${roomId} does not exist`);
            socket.emit('room_status', { message: 'Room does not exist', roomId });
        } else if (numberOfClients === 1) {
            console.log(`Client ${socket.id} joining room ${roomId}`);
            rooms[roomId].clients.push(socket.id); // 방에 클라이언트 추가
            socket.join(roomId);
            socket.emit('room_status', { message: 'Joined room successfully', roomId });
        } else {
            console.log(`Room ${roomId} is full`);
            socket.emit('room_status', { message: 'Room is full', roomId });
        }
    });


    socket.on('webrtc_offer', (event) => {
        console.log(`webrtc_offer received for room ${event.roomId}`);
        console.log(`Offer SDP: ${JSON.stringify(event.sdp, null, 2)}`);

        if (!rooms[event.roomId]) {
            console.error(`Room ${event.roomId} does not exist.`);
            return;
        }

        console.log(`Broadcasting webrtc_offer to peers in room ${event.roomId}`);
        socket.to(event.roomId).emit('webrtc_offer', event.sdp);
    });

    socket.on('webrtc_answer', (event) => {
        console.log(`Received webrtc_answer for room ${event.roomId}`);
        if (!rooms[event.roomId]) {
            console.error(`Room ${event.roomId} does not exist.`);
            return;
        }
        socket.to(event.roomId).emit('webrtc_answer', event.sdp);
    });

    socket.on('webrtc_ice_candidate', (event) => {
        console.log(`ICE Candidate received for room ${event.roomId}`);
        console.log(`Candidate: ${JSON.stringify(event.candidate, null, 2)}`);

        if (!rooms[event.roomId]) {
            console.error(`Room ${event.roomId} does not exist.`);
            return;
        }

        console.log(`Broadcasting ICE Candidate to room ${event.roomId}`);
        socket.to(event.roomId).emit('webrtc_ice_candidate', event);
    });

    socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id}`);

        // 방에서 클라이언트 제거 및 방 삭제 처리
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const clientIndex = room.clients.indexOf(socket.id);

            if (clientIndex !== -1) {
                console.log(`Removing client ${socket.id} from room ${roomId}`);

                room.clients.splice(clientIndex, 1);

                // 방 소유자가 나갔을 때 방 삭제
                if (room.owner === socket.id) {
                    delete rooms[roomId];
                    console.log(`Room ${roomId} deleted because owner disconnected.`);
                    io.to(roomId).emit('room_deleted', { message: 'Room deleted by owner', roomId });
                } else if (room.clients.length === 0) {
                    delete rooms[roomId];
                    console.log(`Room ${roomId} deleted (no clients left).`);
                }
            }
        }
    });
});

// 서버 시작
const port = process.env.PORT || 5001;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
