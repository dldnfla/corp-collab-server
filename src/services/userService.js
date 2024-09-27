const { User } = require('../models');

// 사용자 생성
exports.createUser = async (userData) => {
  try {
    const user = await User.create(userData);
    return user;
  } catch (error) {
    throw new Error('Failed to create user: ' + error.message);
  }
};

// 사용자 조회
exports.getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error('Failed to get user: ' + error.message);
  }
};

// 사용자 업데이트
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

// 사용자 삭제
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
