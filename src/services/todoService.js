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

exports.getTodoById = async (userId, todoId) => {
  try {
    const todo = await Todo.findOne({ where: { userId:userId, id:todoId } });
    if (!todo) {
      throw new Error('Todo not found');
    }

    return todo;

  } catch (error) {
    throw new Error('Failed to get user: ' + error.message);
  }
};


exports.updateTodo = async (userId,todoId,NewTodoData) => {
  try {
    const todo = await Todo.findOne({ where: {userId:userId, id:todoId} });
    if (!todo) {
      throw new Error('todo not found');
    }

    await todo.update(NewTodoData);

    return todo;

  } catch (error) {
    throw new Error('Failed to update todo: ' + error.message);
  }
};


exports.deleteTodo = async (userId, todoId) => {
  try {
    const todo = await Todo.findOne({ where: { userId:userId, id: todoId } });
    if (!todo) {
      throw new Error('Todo not found');
    }
    
    await Todo.destroy({ where: { userId:userId, id: todoId } });
    
    console.log(`User with userId ${todoId} deleted successfully`);

  } catch (error) {
    console.error('Failed to delete user:', error.message);
    throw new Error('Failed to delete user: ' + error.message);
  }
};
