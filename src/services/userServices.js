const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const SECRET_KEY = crypto.randomBytes(64).toString('hex');

exports.createUser = async (userData) => {
  try {
    const existingUser = await User.findOne({ where: { userId: userData.userId } });
    if (existingUser) {
      throw new Error('User ID already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await User.create({
      userId: userData.userId,
      password: hashedPassword,
      username: userData.username,
      isStudy: userData.isStudy || false,
    });

    const { password, createdAt, updatedAt, ...userdata } = user.dataValues;
    return userdata;

  } catch (error) {
    throw new Error('Failed to create user: ' + error.message);
  }
};

exports.authenticateUser = async (userId, password) => {
  try {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const verified = await bcrypt.compare(password, user.password);
    if (!verified) {
      throw new Error('Not Authenticated');
    }

    const id = user.id;

    const token = jwt.sign(id, process.env.SECRET_KEY, { algorithm: 'HS256' });
    return token;

  } catch (error) {
    throw new Error('Failed to login: ' + error.message);
  }
};

exports.getUserById = async (userId) => {
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const { password, createdAt, updatedAt, ...userData } = user.dataValues;
    return userData;

  } catch (error) {
    throw new Error('Failed to get user: ' + error.message);
  }
};

exports.updateUser = async (userId, userData) => {
  try {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (userData.username !== undefined) {
      user.username = userData.username;
    }

    if (userData.isStudy !== undefined) {
      user.isStudy = userData.isStudy;
    }

    await user.save();

    const { password, createdAt, updatedAt, ...userdata } = user.dataValues;
    return userdata;

  } catch (error) {
    throw new Error('Failed to update user: ' + error.message);
  }
};

exports.updateWeeklyNote = async (userId, noteData) => {
  try {
    const user = await User.findOne({ where: { userId: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (noteData.weeklyNote !== undefined) {
      user.weeklyNote = noteData.weeklyNote;
    }

    await user.save();

    const { password, createdAt, updatedAt, ...userdata } = user.dataValues;
    return userdata;

  } catch (error) {
    throw new Error('Failed to update note: ' + error.message);
  }
};

exports.deleteUser = async (userId) => {
  try {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const affectedRows = await User.destroy({ where: { userId: userId } });

    if (affectedRows === 0) {
      throw new Error(`User with userId: ${userId} not found`);
    }

    console.log(`User with userId ${userId} deleted successfully`);

  } catch (error) {
    console.error('Failed to delete user:', error.message);
    throw new Error('Failed to delete user: ' + error.message);
  }
};

exports.searchUser = async (searchUser) => {
  try {
    const userList = await User.findAll({
      where: {
        userId: {
          [Op.like]: `%${searchUser}%`
        }
      }
    })

    if (userList.length === 0) {
      throw new Error(`${searchUser} not found`)
    }
    
    return userList;

  } catch (error) {
    console.error('Error searching for users:', error);
    throw error; // 오류 처리
  }
}