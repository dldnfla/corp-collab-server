// DOM elements.
const roomSelectionContainer = document.getElementById('room-selection-container');
const roomInput = document.getElementById('room-input');
const connectButton = document.getElementById('connect-button');
const endCallButton = document.getElementById('end-call-button'); // End call button

const videoChatContainer = document.getElementById('video-chat-container');
const localVideoComponent = document.getElementById('local-video');
const remoteVideoComponent = document.getElementById('remote-video');

// Variables.
const socket = io();
const mediaConstraints = {
  audio: true,
  video: { width: 1280, height: 720 },
};
let localStream;
let remoteStream;
let isRoomCreator;
let rtcPeerConnection; // Connection between the local device and the remote peer.
let roomId;
let mediaRecorder;
let recordedChunks = [];

// Free public STUN servers provided by Google.
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

// BUTTON LISTENERS ============================================================
connectButton.addEventListener('click', () => {
  joinRoom(roomInput.value);
});

endCallButton.addEventListener('click', () => {
  endCall(); // Handle end call
});

// SOCKET EVENT CALLBACKS =====================================================
socket.on('room_created', async () => {
  console.log('Socket event callback: room_created');

  await setLocalStream(mediaConstraints);
  isRoomCreator = true;
});

socket.on('room_joined', async () => {
  console.log('Socket event callback: room_joined');

  await setLocalStream(mediaConstraints);
  socket.emit('start_call', roomId);
});

socket.on('full_room', () => {
  console.log('Socket event callback: full_room');

  alert('The room is full, please try another one');
});

socket.on('start_call', async () => {
  console.log('Socket event callback: start_call');

  if (isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    addLocalTracks(rtcPeerConnection);
    rtcPeerConnection.ontrack = setRemoteStream;
    rtcPeerConnection.onicecandidate = sendIceCandidate;
    await createOffer(rtcPeerConnection);
  }
});

socket.on('webrtc_offer', async (event) => {
  console.log('Socket event callback: webrtc_offer');

  if (!isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    addLocalTracks(rtcPeerConnection);
    rtcPeerConnection.ontrack = setRemoteStream;
    rtcPeerConnection.onicecandidate = sendIceCandidate;
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    await createAnswer(rtcPeerConnection);
  }
});

socket.on('webrtc_answer', (event) => {
  console.log('Socket event callback: webrtc_answer');

  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});

socket.on('webrtc_ice_candidate', (event) => {
  console.log('Socket event callback: webrtc_ice_candidate');

  // ICE candidate configuration.
  const candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  });
  rtcPeerConnection.addIceCandidate(candidate);
});

// FUNCTIONS ==================================================================
function joinRoom(room) {
  if (room === '') {
    alert('Please type a room ID');
  } else {
    roomId = room;
    socket.emit('join', room);
    showVideoConference();
  }
}

function showVideoConference() {
  roomSelectionContainer.style.display = 'none';
  videoChatContainer.style.display = 'block';
}

async function setLocalStream(mediaConstraints) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    localVideoComponent.srcObject = localStream;
    startRecording(localStream);  // Start recording
  } catch (error) {
    console.error('Could not get user media', error);
  }
}

function addLocalTracks(rtcPeerConnection) {
  localStream.getTracks().forEach((track) => {
    rtcPeerConnection.addTrack(track, localStream);
  });
}

async function createOffer(rtcPeerConnection) {
  try {
    const sessionDescription = await rtcPeerConnection.createOffer();
    rtcPeerConnection.setLocalDescription(sessionDescription);
    
    socket.emit('webrtc_offer', {
      type: 'webrtc_offer',
      sdp: sessionDescription,
      roomId,
    });
  } catch (error) {
    console.error(error);
  }
}

async function createAnswer(rtcPeerConnection) {
  try {
    const sessionDescription = await rtcPeerConnection.createAnswer();
    rtcPeerConnection.setLocalDescription(sessionDescription);
    
    socket.emit('webrtc_answer', {
      type: 'webrtc_answer',
      sdp: sessionDescription,
      roomId,
    });
  } catch (error) {
    console.error(error);
  }
}

function setRemoteStream(event) {
  remoteVideoComponent.srcObject = event.streams[0];
  remoteStream = event.stream;
}

function sendIceCandidate(event) {
  if (event.candidate) {
    socket.emit('webrtc_ice_candidate', {
      roomId,
      label: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    });
  }
}

// MEDIA RECORDER FUNCTIONS ===================================================
function startRecording(stream) {
  const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp8') 
      ? 'video/webm; codecs=vp8'
      : MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
      ? 'video/webm; codecs=vp9'
      : MediaRecorder.isTypeSupported('video/mp4') 
      ? 'video/mp4'
      : '';

  if (mimeType === '') {
      console.error('No supported MIME type found for MediaRecorder');
      return; // Exit the function if no supported MIME type is found
  }

  mediaRecorder = new MediaRecorder(stream, { mimeType });

  // 데이터 청크가 준비될 때마다 저장
  mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
  };

  // 녹화 종료 시 서버로 전송
  mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      sendRecording(blob);
      recordedChunks = []; // 배열 초기화
  };

  mediaRecorder.start();
}

// 녹화 데이터를 서버에 업로드
async function sendRecording(blob) {
  const formData = new FormData();
  formData.append('video', blob, 'recording.webm');

  try {
      await fetch('/upload', { // 서버의 업로드 엔드포인트
          method: 'POST',
          body: formData,
      });
      console.log('Recording uploaded successfully');
  } catch (error) {
      console.error('Failed to upload recording', error);
  }
}

// WebRTC 연결 종료 시 녹화 중단
function endCall() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop(); // 녹화 중지
  }
  if (rtcPeerConnection) {
      rtcPeerConnection.close();
      rtcPeerConnection = null;
  }
}
