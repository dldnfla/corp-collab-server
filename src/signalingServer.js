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

// 방 정보를 저장하기 위한 메모리 객체
const rooms = {};

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // 클라이언트 연결 확인 응답
    socket.emit('connection_success', { message: 'Connection established', socketId: socket.id });

    // 클라이언트가 방 생성 요청
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
            callback({ status: 'success', roomId });
        }
    });

    // 클라이언트가 방에 참여
    socket.on('join', (roomId) => {
        const selectedRoom = io.sockets.adapter.rooms.get(roomId);
        const numberOfClients = selectedRoom ? selectedRoom.size : 0;

        if (numberOfClients === 0) {
            console.log(`Room ${roomId} does not exist`);
            socket.emit('room_status', { message: 'Room does not exist', roomId });
        } else if (numberOfClients === 1) {
            console.log(`Client ${socket.id} joined room ${roomId}`);
            rooms[roomId].clients.push(socket.id); // 방의 클라이언트 목록에 추가
            socket.join(roomId);
            socket.emit('room_status', { message: 'Joined room successfully', roomId });
        } else {
            console.log(`Room ${roomId} is full`);
            socket.emit('room_status', { message: 'Room is full', roomId });
        }
    });

    // WebRTC Offer 처리
    socket.on('webrtc_offer', (event) => {
        console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`);
        socket.to(event.roomId).emit('webrtc_offer', event.sdp);
    });

    // WebRTC Answer 처리
    socket.on('webrtc_answer', (event) => {
        console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`);
        socket.to(event.roomId).emit('webrtc_answer', event.sdp);
    });

    // ICE Candidate 처리
    socket.on('webrtc_ice_candidate', (event) => {
        console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`);
        socket.to(event.roomId).emit('webrtc_ice_candidate', event);
    });

    // 클라이언트 연결 해제
    // 클라이언트 연결 해제
    socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id}`);

        // 방에서 클라이언트 제거 및 방 삭제 처리
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const clientIndex = room.clients.indexOf(socket.id);

            if (clientIndex !== -1) {
                const userId = room.userId; // 방에 저장된 userId 가져오기

                // 클라이언트를 방 목록에서 제거
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

                // isStudy 값을 false로 업데이트
                try {
                    const user = await User.findOne({ where: { userId } });
                    if (!user) {
                        throw new Error('User not found');
                    }

                    user.isStudy = false;
                    await user.save();

                    console.log(`User ${userId} isStudy updated to false`);
                    socket.emit('isStudy_update', { status: 'success', message: `User ${userId} isStudy updated to false` });
                } catch (error) {
                    console.error(`Error updating isStudy for user ${userId}:`, error.message);
                    socket.emit('isStudy_update', { status: 'error', message: `Error updating isStudy: ${error.message}` });
                }
            }
        }
    });
});

// 서버 시작
const port = process.env.PORT || 5001;
server.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
