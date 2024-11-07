const followService = require('../services/followServices');

exports.createFollow = async (req, res) => {
  const currentUser = req.user; // 로그인한 유저 정보 사용
  const userId = req.body.followee;  // 팔로우할 유저의 userId

  console.log(currentUser,userId);

  try {
    const targetUser = await followService.getUserByUserId(userId);
    if (!targetUser) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const existingFollow = await followService.checkIfFollowExists(currentUser, targetUser.id);
    if (existingFollow) {
      return res.status(400).json({ detail: 'You are already following this user' });
    }

    const newFollow = await followService.createFollow(currentUser, targetUser.id);
    return res.status(201).json(newFollow);

  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

exports.getFollowings = async (req, res) => {
  const currentUser = req.user; // 로그인한 유저 정보 사용

  try {
    const followings = await followService.getFollowings(currentUser); // 내가 팔로우한 사람들 조회
    return res.status(200).json(followings);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  const currentUser = req.user; // 로그인한 유저 정보 사용

  try {
    const followers = await followService.getFollowers(currentUser);
    return res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

exports.removeFollow = async (req, res) => {
  const currentUser = req.user; 
  const userId = req.params.followee;  

  console.log("----------",currentUser,userId);

  try {
    const targetUser = await followService.getUserByUserId(userId);
    if (!targetUser) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const follow = await followService.checkIfFollowExists(currentUser, targetUser.id);
    if (!follow) {
      return res.status(400).json({ detail: 'You are not following this user' });
    }

    await followService.removeFollow(currentUser, targetUser.id);
    return res.status(200).json({ detail: 'Follow removed' });

  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

