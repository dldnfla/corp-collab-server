const { Todo } = require('../models');

exports.createTodo = async (id, todoData) => {
  try {
    const newTodo = await Todo.create({
      title: todoData.title,
      contents: todoData.contents,
      isCheck: todoData.isCheck,
      userId: id,  
    });
    return newTodo;
  } catch (error) {
    throw new Error('Failed to create todo: ' + error.message);
  }
};

exports.getTodoList = async (id) => {
  try {
    const todolist = await Todo.findAll({ where: { userId:id } });
    if (!todolist) {
      return null;
    }
    return todolist;

  } catch (error) {
    throw new Error('Failed to get user: ' + error.message);
  }
};