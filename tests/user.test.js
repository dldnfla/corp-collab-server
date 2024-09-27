// tests/api.test.js
const axios = require('axios');

// 사용자 생성 API 테스트
const createUser = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/users', {
      userId: 'testUser',
      password: 'testPassword',
      username: 'Test User',
      isStudy: false
    });
    console.log('User created:', response.data);
  } catch (error) {
    console.error('Error creating user:', error.response ? error.response.data : error.message);
  }
};

// 사용자 조회 API 테스트
const getUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users/1');
    console.log('Users:', response.data);
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
  }
};

// 테스트 실행
const runTests = async () => {
  await createUser(); // 사용자 생성 테스트
  await getUsers();   // 사용자 조회 테스트
};

runTests();

