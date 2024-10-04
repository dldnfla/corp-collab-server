const { Todo } = require('../models');

exports.createTodo = async (userId, todoData) => {
  try {
    const newTodo = await Todo.create({
      title: todoData.title,
      contents: todoData.contents,
      //userId: userId,  
    });
    return newTodo;
  } catch (error) {
    throw new Error('Failed to create todo: ' + error.message);
  }
};
