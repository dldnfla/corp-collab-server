const todoService = require('../services/todoService');

exports.createTodo = async (req, res) => {
  try {
    const userId = req.user.id;  
    const newTodo = await todoService.createTodo(userId, req.body);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
