const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isStudy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  weeklyNote: {
    type: DataTypes.STRING,
    defaultValue: "",
    allowNull: true,
  }
},);

module.exports = User;
