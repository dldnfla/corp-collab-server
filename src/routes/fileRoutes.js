const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileControllers'); // 컨트롤러 경로 확인
const upload = require('../middleware/upload'); // Multer 미들웨어
const { verifyToken } = require('../middleware/auth'); // 인증 미들웨어

// 프로필 이미지 업로드
router.post('/profileImage', verifyToken, upload.single('profileImg'), fileController.uploadProfileImage);

// 프로필 이미지 가져오기
router.get('/profileImage', verifyToken, fileController.downloadProfileImage);

module.exports = router;
