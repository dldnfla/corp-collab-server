const axios = require('axios');

const createTodo = async () => {
  try {
    await axios.post('http://localhost:3000/api/signup', {
      userId: 'testUser',
      password: 'testPassword',
      username: 'test user',
      isStudy: false
    });
    const authorizedUser = await axios.post('http://localhost:3000/api/login', {
      userId: 'testUser',
      password: 'testPassword',
    });

    const token = authorizedUser['data']['token'];
    console.log('AuthorizedUser Status: ', authorizedUser.status);
    console.log(token);

    const response = await axios.post(
      'http://localhost:3000/api/todos',
      {
        title: 'testTitle',
        contents: 'testContent',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('createTodo : ', response.data);
  } catch (error) {
    console.error('Error creating todo:', error.response ? error.response.data : error.message);
  }
};

const runTests = async () => {
  await createTodo();
};

runTests();
