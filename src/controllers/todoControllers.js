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
    const todoList = await todoService.getTodoList(id);
    res.status(200).json(todoList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodoById = async (req, res) => {
  try {
    const id = req.user;  
    const todo = await todoService.getTodoById(id,req.params.todoId);
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateTodo = async (req, res) => {
  try {
    const id = req.user;  
    const newTodo = await todoService.updateTodo(id,req.params.todoId,req.body);
    res.status(200).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const id = req.user;
    const result = await todoService.deleteTodo(id,req.params.todoId);
    res.status(204).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};