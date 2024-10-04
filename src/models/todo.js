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
});

User.hasMany(Todo); 
Todo.belongsTo(User);

module.exports = Todo;
