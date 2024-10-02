const axios = require('axios');
const { userTest } = require('./user.test');

// 토큰을 변수로 저장
const token = 'YOUR_JWT_TOKEN';  // 로그인 후 받은 JWT 토큰

// Todo 생성 API 테스트
const createTodo = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/todos',
      {
        title: 'testTitle',
        contents: 'testContent',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Authorization 헤더에 토큰 추가
        },
      }
    );
    console.log('createTodo : ', response.data);
  } catch (error) {
    console.error('Error creating todo:', error.response ? error.response.data : error.message);
  }
};

// 테스트 실행
const runTests = async () => {
  await userTest.createUser();
  await createTodo();
};

runTests();
