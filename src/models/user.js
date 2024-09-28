const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

// 사용자 모델 정의
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
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
},);

module.exports = User;
