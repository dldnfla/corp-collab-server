const sequelize = require('../../db');
const User = require('./user');
const Todo = require('./todo');

// 모든 모델 동기화
const syncModels = async () => {
  try {
    await sequelize.sync({ force: true }); // 데이터베이스와 모델 동기화
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error syncing models:', error);
  }
};

syncModels();

module.exports = {
  User, Todo
};
