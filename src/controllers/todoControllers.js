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


exports.getTodoList = async (req, res) => {
  try {
    const id = req.user;  
    const TodoList = await todoService.getTodoList(id);
    res.status(200).json(TodoList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
