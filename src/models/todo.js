const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

// 사용자 모델 정의
const Todo = sequelize.define('Todo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
  },
  contents: {
    type: DataTypes.STRING,
  }
},);

module.exports = User;
