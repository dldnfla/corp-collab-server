const sequelize = require('../../db');
const User = require('./user');
const Todo = require('./todo');
const Follow = require('./follow');

const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // alter: true를 사용하여 기존 데이터를 보존하면서 필요한 경우 테이블을 수정
    console.log('Database & tables synchronized!');
  } catch (error) {
    console.error('Error syncing models:', error);
  }
};

syncModels();

module.exports = {
  User, Todo, Follow
};
