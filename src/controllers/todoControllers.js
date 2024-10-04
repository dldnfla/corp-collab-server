const todoService = require('../services/todoService');

exports.createTodo = async (req, res) => {
  try {
    const id = req.user;  
    const newTodo = await todoService.createTodo(id, req.body);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
