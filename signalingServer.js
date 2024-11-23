const express = require('express')
const { Server } = require('socket.io')
const https = require('https');
const fs = require('fs');

const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');


const options = {
  key: fs.readFileSync('/home/ubuntu/corp-collab-server/_wildcard.example.dev+3-key.pem'),
  cert: fs.readFileSync('/home/ubuntu/corp-collab-server/_wildcard.example.dev+3.pem'),
};

const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const app = express()
const server = https.createServer(options,app)
const io = new Server(server)

app.use('/', express.static('public'))


// multer 설정: 비디오 업로드
const upload = multer({
  dest: './uploads/', // 업로드된 파일 저장 폴더
  limits: { fileSize: 100 * 1024 * 1024 }, // 최대 파일 크기 100MB
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(webm|mp4)$/)) {
      return cb(new Error('Only video files are allowed.'));
    }
    cb(null, true);
  }
});


app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No video file uploaded.');
  }

  console.log(`File uploaded successfully: ${req.file.path}`);

  // 업로드된 파일의 경로
  const inputFilePath = req.file.path;
  const outputFilePath = `./uploads/timelapse-${Date.now()}.mp4`; // 타임랩스 비디오 출력 파일 경로

  // FFmpeg로 타임랩스 비디오 변환
  ffmpeg(inputFilePath)
    .output(outputFilePath)
    .videoFilters('setpts=0.25*PTS') // 타임랩스 효과 (프레임 속도 4배 빠르게)
    .on('end', async () => {
      console.log('Timelapse conversion finished.');

      // 변환된 비디오를 S3로 업로드
      const fileStream = fs.createReadStream(outputFilePath);
      const s3Params = {
        Bucket: 'studybuddy-s3-bucket',
        Key: `timelapse/timelapse-${Date.now()}.mp4`, // S3에 저장될 파일 이름
        Body: fileStream,
        ContentType: 'video/mp4',
      };

      const command = new PutObjectCommand(s3Params);
      await s3.send(command);
    })
    .on('error', (err) => {
      console.error('Error during FFmpeg process:', err);
      res.status(500).send('Error processing video.');
    })
    .run();
});


io.on('connection', (socket) => {
  socket.on('join', (roomId) => {
    const selectedRoom = io.sockets.adapter.rooms.get(roomId)
    const numberOfClients = selectedRoom ? selectedRoom.size : 0

    if (numberOfClients === 0) {
      console.log(`Creating room ${roomId} and emitting room_created socket event`)
      socket.join(roomId)
      socket.emit('room_created', roomId)
    } else if (numberOfClients === 1) {
      console.log(`Joining room ${roomId} and emitting room_joined socket event`)
      socket.join(roomId)
      socket.emit('room_joined', roomId)
    } else {
      console.log(`Can't join room ${roomId}, emitting full_room socket event`)
      socket.emit('full_room', roomId)
    }
  })

  // These events are emitted to all the sockets connected to the same room except the sender.
  socket.on('start_call', (roomId) => {
    console.log(`Broadcasting start_call event to peers in room ${roomId}`)
    socket.to(roomId).emit('start_call')
  })

  socket.on('webrtc_offer', (event) => {
    console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
    socket.to(event.roomId).emit('webrtc_offer', event.sdp)
  })

  socket.on('webrtc_answer', (event) => {
    console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
    socket.to(event.roomId).emit('webrtc_answer', event.sdp)
  })

  socket.on('webrtc_ice_candidate', (event) => {
    console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
    socket.to(event.roomId).emit('webrtc_ice_candidate', event)
  })
})

// START THE SERVER =================================================================
const port = process.env.PORT || 5001
server.listen(port,() => {
  console.log(`Express server listening on port ${port}`)
})