const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SECRET_KEY= crypto.randomBytes(64).toString('hex');

exports.createUser = async (userData) => {
  try {
    if (!userData.userId || !userData.password || !userData.username) {
      throw new Error('missing required fields');
    }  
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      userId: userData.userId,
      password: hashedPassword,
      username: userData.username,
      isStudy: userData.isStudy,
    });

    const { password, createdAt, updatedAt, ...userdata } = user.dataValues;
    return userdata;

  } catch (error) {
    throw new Error('Failed to create user: ' + error.message);
  }
};


exports.authenticateUser = async (userId, password) => {
  try {
    const inputPassword = password;
    //console.log('Attempting to login with userId:', userId, password); 
    const user = await User.findOne({ userId: userId });
    console.log(inputPassword);

    if (!user) {
      throw console.error('User not found');
    }
    console.log('Attempting to verify password:', inputPassword); 
    const verified = await bcrypt.compare(inputPassword, user.password);

    if (!verified) {
      throw new Error('Not Authenticated');
    }
 
    const token = jwt.sign({ id: user.id, userId: userId }, SECRET_KEY);
    return token;

  } catch (error) {
    throw new Error('Failed to login: ' + error.message);
  }
};

exports.getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId);
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
    const [affectedRows] = await User.update(userData, {
      where: { id: userId }
    });
    if (affectedRows === 0) {
      throw new Error('User not found');
    }
    return { message: 'User updated' };
  } catch (error) {
    throw new Error('Failed to update user: ' + error.message);
  }
};


exports.deleteUser = async (userId) => {
  try {
    const affectedRows = await User.destroy({
      where: { id: userId }
    });
    if (affectedRows === 0) {
      throw new Error('User not found');
    }
    return { message: 'User deleted' };
  } catch (error) {
    throw new Error('Failed to delete user: ' + error.message);
  }
};
