const axios = require('axios');

let token = "";
let user1Id = "user1";
let user2Id = "user2";

// 유저 생성
const createUser = async (userId, username) => {
  try {
    const response = await axios.post('http://localhost:3000/api/signup', {
      userId,
      password: 'testPassword',
      username,
      isStudy: false
    });
    console.log(`${userId} created: `, response.data);
  } catch (error) {
    console.error(`Error creating ${userId}:`, error.response ? error.response.data : error.message);
  }
};

// 로그인
const loginUser = async (userId) => {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      userId,
      password: 'testPassword',
    });
    token = response.data.token;
    console.log(`${userId} logged in: `, response.status);
  } catch (error) {
    console.error('Error logging in user', error.response ? error.response.data : error.message);
  }
};

// 팔로우 추가
const followUser = async (targetUserId) => {
  try {
    const response = await axios.post('http://localhost:3000/api/follow', {
      followee: targetUserId
    },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(`Follow ${targetUserId}: `, response.data);
  } catch (error) {
    console.error(`Error following ${targetUserId}:`, error.response ? error.response.data : error.message);
  }
};


// 팔로우한 사용자 목록 조회
const getFollowings = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/followings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Followings: ', response.data);
  } catch (error) {
    console.error('Error fetching followings:', error.response ? error.response.data : error.message);
  }
};

// 팔로워 목록 조회
const getFollowers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/followers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Followers: ', response.data);
  } catch (error) {
    console.error('Error fetching followers:', error.response ? error.response.data : error.message);
  }
};

// 팔로우 취소
const removeFollow = async (targetUserId) => {
  try {
    const response = await axios.delete(`http://localhost:3000/api/follow/${targetUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`Unfollow ${targetUserId}: `, response.data);
  } catch (error) {
    console.error(`Error unfollowing ${targetUserId}:`, error.response ? error.response.data : error.message);
  }
};

// 유저 삭제
const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`http://localhost:3000/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 204) {
      console.log(`${userId} deleted successfully`);
    }
  } catch (error) {
    console.error(`Error deleting ${userId}:`, error.response ? error.response.data : error.message);
  }
};

const runTests = async () => {
  // 유저 2명 생성
  await createUser(user1Id, 'User 1');
  await createUser(user2Id, 'User 2');

  // 로그인
  await loginUser(user1Id);

  // 팔로우 테스트
  await followUser(user2Id);
  await getFollowings();  // 팔로우한 사용자 목록 조회
  await getFollowers();   // 팔로워 목록 조회

  // 팔로우 취소 테스트
  await removeFollow(user2Id);
  await getFollowings();  // 팔로우한 사용자 목록 조회

  // 유저 삭제
  await deleteUser(user1Id);
  await deleteUser(user2Id);
};

runTests();
