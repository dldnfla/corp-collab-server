const sequelize = require('../../db');
const User = require('./user');
const Todo = require('./todo');

const syncModels = async () => {
  try {
    await sequelize.sync({ force: true }); 
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error syncing models:', error);
  }
};

syncModels();

module.exports = {
  User, Todo
};
