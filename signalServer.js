var os = require('os');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const fromatMessage = require('./message');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const Announcement = '공지';

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', fromatMessage(Announcement, '북적북적에 오신것을 환영합니다!!'));
        socket.broadcast.to(user.room).emit('message', fromatMessage(Announcement, `${user.username}님이 입장하셨습니다.`));
        
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', fromatMessage(user.username, msg));
    });
    
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room).emit('message', fromatMessage(Announcement, `${user.username}님이 퇴장하셨습니다.`));
        }
    });
});

const PORT = 5001 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server has been running..!`);
    console.log(`[Server address]\n- http://${getIp()}:${PORT}`);
    console.log(`- http://127.0.0.1:${PORT}`);
    console.log(`- http://localhost:${PORT}`);
});

function getIp() {
    var ifaces = os.networkInterfaces();
    var ip = '';
    for (var dev in ifaces) {
        var alias = 0;
        ifaces[dev].forEach(function(details) {
            if (details.family == 'IPv4' && details.internal === false) {
                ip = details.address;
                ++alias;
            }
        });
    }
    return ip;
}