const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const User = require('./user');  

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  follower: {
    type: DataTypes.INTEGER,
    references: {
      model: User,  
      key: 'id',
    },
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE', 
  },
  followee: {
    type: DataTypes.INTEGER,
    references: {
      model: User, 
      key: 'id',
    },
    onDelete: 'CASCADE',  
    onUpdate: 'CASCADE',  
  },
});

// 관계 설정: User와 Follow 관계 정의
User.hasMany(Follow, { foreignKey: 'follower', as: 'Followers', onDelete: 'CASCADE' });
User.hasMany(Follow, { foreignKey: 'followee', as: 'Followees', onDelete: 'CASCADE' });
Follow.belongsTo(User, { foreignKey: 'follower', as: 'Follower' });
Follow.belongsTo(User, { foreignKey: 'followee', as: 'Followee' });

module.exports = Follow;
