const WebSocket = require('ws');

// WebSocket 서버 생성
const wss = new WebSocket.Server({ port: 5001 });

const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');

    // 클라이언트가 보내는 메시지 수신
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'join':
                clients.set(data.userId, ws);
                console.log(`${data.userId} joined the signaling server`);
                break;
            case 'offer':
            case 'answer':
            case 'candidate':
                // 상대방에게 메시지를 전송
                const targetClient = clients.get(data.targetUserId);
                if (targetClient) {
                    targetClient.send(JSON.stringify(data));
                }
                break;
            case 'leave':
                clients.delete(data.userId);
                console.log(`${data.userId} left the signaling server`);
                break;
        }
    });

    // 클라이언트 연결 종료 시 실행
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('Signaling server running on ws://localhost:5001');
