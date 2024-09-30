// tests/api.test.js
const axios = require('axios');

// 사용자 생성 API 테스트
const createUser = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/signup', {
      userId: 'testUser',
      password: 'testPassword',
      username: 'test user',
      isStudy: false
    });
    console.log('createUser : ', response.data);
  } catch (error) {
    console.error('Error creating user:', error.response ? error.response.data : error.message);
  }
};

// 사용자 조회 API 테스트
const getUser = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users/testUser');
    console.log('getUser : ', response.data);
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
  }
};

const loginUser = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      userId: 'testUser',
      password: 'testPassword',
    });
    console.log('loginUser : ',response.data);
  } catch (error) {
    console.error('Error login', error.response ? error.response.data : error.message);
  }
};

const updateUser = async () => {
  try {
    const response = await axios.put('http://localhost:3000/api/users/testUser', {
      username: 'new test user',
      isStudy: true
    });
    console.log('updateUser : ', response.data);
  } catch (error) {
    console.error('Error updating user', error.response ? error.response.data : error.message);
  }
}

// 테스트 실행
const runTests = async () => {
  await createUser(); 
  await getUser();   
  await loginUser();
  await updateUser();

};

runTests();

