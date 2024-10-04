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
