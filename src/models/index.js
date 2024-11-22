const sequelize = require('../../db');
const User = require('./user');
const Todo = require('./todo');
const Follow = require('./follow');

const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // alter: true
    console.log('Database & tables synchronized!');
  } catch (error) {
    console.error('Error syncing models:', error);
  }
};

syncModels();

module.exports = {
  User, Todo, Follow
};
