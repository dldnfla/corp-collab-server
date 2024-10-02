const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { verifyToken } = require('../middleware/auth');

router.post('/todos', verifyToken, todoController.createTodo);  // 토큰 인증 후 Todo 생성

module.exports = router;
