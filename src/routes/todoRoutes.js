const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoControllers');
const { verifyToken } = require('../middleware/auth');

router.post('/todos', verifyToken, todoController.createTodo);  // 토큰 인증 후 Todo 생성
router.get('/todos', verifyToken, todoController.getTodoList); 
router.get('/todos/:todoId', verifyToken, todoController.getTodoById); 
router.put('/todos/:todoId',verifyToken, todoController.updateTodo);
router.delete('/todos/:todoId',verifyToken, todoController.deleteTodo);

module.exports = router;
