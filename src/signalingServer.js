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
            console.debug(`Upload directory created at ${uploadDir}`);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        console.debug(`Generated filename: ${fileName}`);
        cb(null, fileName);
    },
});

const upload = multer({ storage });

app.post('/upload', upload.single('video'), (req, res) => {
    if (req.file) {
        console.log('Received video file:', req.file);
        res.status(200).send('Video uploaded successfully');
    } else {
        console.warn('No file received');
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
    logRoomState();

    socket.emit('connection_success', { message: 'Connection established', socketId: socket.id });

    socket.on('create_room', (roomInfo, callback) => {
        console.debug('Received create_room request:', roomInfo);

        const { roomId, userId } = roomInfo;

        if (!roomId || !userId) {
            console.error('Invalid roomInfo:', roomInfo);
            callback({ status: 'error', error: 'Invalid room info' });
            return;
        }

        if (rooms[roomId]) {
            console.warn(`Room ${roomId} already exists.`);
            callback({ status: 'error', error: 'Room already exists' });
        } else {
            rooms[roomId] = { roomId, userId, owner: socket.id, clients: [socket.id] };
            socket.join(roomId);
            console.info(`Room ${roomId} created by user ${userId}`);
            logRoomState();
            callback({ status: 'success', roomId });
        }
    });

    socket.on('join', (roomId) => {
        console.debug(`Client ${socket.id} attempting to join room ${roomId}`);
        const selectedRoom = io.sockets.adapter.rooms.get(roomId);
        const numberOfClients = selectedRoom ? selectedRoom.size : 0;

        if (numberOfClients === 0) {
            console.warn(`Room ${roomId} does not exist`);
            socket.emit('room_status', { message: 'Room does not exist', roomId });
        } else if (numberOfClients === 1) {
            console.info(`Client ${socket.id} joining room ${roomId}`);
            rooms[roomId].clients.push(socket.id);
            socket.join(roomId);
            logRoomState();
            socket.emit('room_status', { message: 'Joined room successfully', roomId });
        } else {
            console.warn(`Room ${roomId} is full`);
            socket.emit('room_status', { message: 'Room is full', roomId });
        }
    });

    socket.on('webrtc_offer', async (data) => {
        try {
            const { roomId, sdp } = data;
            console.debug(`Received webrtc_offer for room ${roomId}, SDP: ${JSON.stringify(sdp, null, 2)}`);

            if (!rooms[roomId]) {
                console.error(`Room ${roomId} does not exist.`);
                return;
            }

            console.info('Processing WebRTC offer...');
            const pc = new RTCPeerConnection(configuration);

            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            console.debug('Remote description set successfully.');

            const answer = await pc.createAnswer();
            console.debug('Answer created:', answer);

            await pc.setLocalDescription(answer);
            console.debug('Local description set successfully.');

            socket.emit('webrtc_answer', { roomId, sdp: answer });
            console.info(`Sent webrtc_answer for room ${roomId}`);
        } catch (error) {
            console.error('Error handling webrtc_offer:', error.message);
            socket.emit('webrtc_answer', { roomId, sdp: null });
        }
    });

    socket.on('webrtc_ice_candidate', (event) => {
        console.debug(`ICE Candidate received for room ${event.roomId}`);
        console.debug(`Candidate: ${JSON.stringify(event.candidate, null, 2)}`);

        if (!rooms[event.roomId]) {
            console.error(`Room ${event.roomId} does not exist.`);
            return;
        }

        socket.to(event.roomId).emit('webrtc_ice_candidate', event);
        console.info(`Broadcasted ICE Candidate to room ${event.roomId}`);
    });

    socket.on('leave', async () => {
        console.info(`Client ${socket.id} is leaving room...`);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const clientIndex = room.clients.indexOf(socket.id);

            if (clientIndex !== -1) {
                room.clients.splice(clientIndex, 1);

                if (room.owner === socket.id || room.clients.length === 0) {
                    delete rooms[roomId];
                    console.warn(`Room ${roomId} deleted`);
                    io.to(roomId).emit('room_deleted', { message: 'Room deleted', roomId });
                }

                logRoomState();

                try {
                    const user = await User.findOne({ where: { userId: room.userId } });
                    if (user) {
                        user.isStudy = false;
                        await user.save();
                        console.info(`User ${room.userId} isStudy updated to false`);
                    }
                } catch (error) {
                    console.error(`Error updating isStudy for user ${room.userId}:`, error.message);
                }
                break;
            }
        }
    });

    socket.on('disconnect', async () => {
        console.info(`Client disconnected: ${socket.id}`);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const clientIndex = room.clients.indexOf(socket.id);

            if (clientIndex !== -1) {
                room.clients.splice(clientIndex, 1);

                if (room.owner === socket.id || room.clients.length === 0) {
                    delete rooms[roomId];
                    console.warn(`Room ${roomId} deleted`);
                    io.to(roomId).emit('room_deleted', { message: 'Room deleted', roomId });
                }

                logRoomState();

                try {
                    const user = await User.findOne({ where: { userId: room.userId } });
                    if (user) {
                        user.isStudy = false;
                        await user.save();
                        console.info(`User ${room.userId} isStudy updated to false`);
                    }
                } catch (error) {
                    console.error(`Error updating isStudy for user ${room.userId}:`, error.message);
                }
                break;
            }
        }
    });
});

// 서버 시작
const port = process.env.PORT || 5001;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
