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
  return await db.Follow.findAll({ where: { follower: userId } });  // follower가 userId인 모든 팔로우 정보 조회
};

// 팔로우 목록 가져오기
exports.getFollowers = async (userId) => {
  return await db.Follow.findAll({ where: { followee: userId } });
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

