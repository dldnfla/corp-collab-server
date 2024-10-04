const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const User = require('./user');

const Todo = sequelize.define('Todo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contents: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isCheck: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
});


module.exports = Todo;
