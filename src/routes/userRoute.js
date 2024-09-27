const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 사용자 생성
router.post('/users', userController.createUser);

// 사용자 조회
router.get('/users/:id', userController.getUserById);

// 사용자 업데이트
router.put('/users/:id', userController.updateUser);

// 사용자 삭제
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
