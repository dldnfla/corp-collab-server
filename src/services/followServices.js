// followServices.js
const db = require('../models');


exports.getUserByUserId = async (userId) => {
  return await db.User.findOne({ where: { userId } });
};


exports.createFollow = async (currentUserId, targetUserId) => {
  const newFollow = {
    follower: currentUserId, 
    followee: targetUserId,   
  };
  return await db.Follow.create(newFollow); 
};

exports.getFollowings = async (userId) => {
  const followings = await db.Follow.findAll({
    where: { follower: userId },
    include: {
      model: db.User,
      as: 'Followee',
      attributes: ['userId','username', 'isStudy'], // 가져올 컬럼만 선택 (username, isStudy)
    },
  });

  // 팔로잉된 유저만 반환 (Followee만)
  return followings.map(follow => follow.Followee);
};

// 팔로워 목록 가져오기 (userId를 팔로우하는 사용자들)
exports.getFollowers = async (userId) => {
  const followers = await db.Follow.findAll({
    where: { followee: userId },
    include: {
      model: db.User,
      as: 'Follower',
      attributes: ['userId','username', 'isStudy'], // 가져올 컬럼만 선택 (username, isStudy)
    },
  });

  // 팔로워된 유저만 반환 (Follower만)
  return followers.map(follow => follow.Follower);
};

// 팔로우 취소
exports.removeFollow = async (currentUserId, targetUserId) => {
  return await db.Follow.destroy({
    where: { follower: currentUserId, followee: targetUserId },
  });
};

// 팔로우 관계가 이미 존재하는지 확인
exports.checkIfFollowExists = async (currentUserId, targetUserId) => {
  return await db.Follow.findOne({
    where: { follower: currentUserId, followee: targetUserId },
  });
};

