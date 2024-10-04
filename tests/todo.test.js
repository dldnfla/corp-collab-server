const axios = require('axios');

token = "";

testUser = async () => {
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

  token = authorizedUser['data']['token'];
  console.log('AuthorizedUser Status: ', authorizedUser.status);
  console.log(token);
}


const createTodo = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/todos',
      {
        title: 'testTitle',
        contents: 'testContent',
        isCheck: true
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

const getTodoList = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/todos',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      },
    );
    console.log('getTodoList : ', response.data);
  } catch (error) {
    console.error('Error fetching todolist:', error.response ? error.response.data : error.message);
  }
};

const updateTodo = async () => {
  try {
    const response = await axios.put('http://localhost:3000/api/todos/1',
      {
        title: 'newTestTitle',
        contents: 'newTestContent',
        isCheck: false
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    console.log('updateTodo : ', response.data);
  } catch (error) {
    console.error('Error updating todo', error.response ? error.response.data : error.message);
  }
}


const runTests = async () => {
  await testUser();
  await createTodo();
  await getTodoList();
  await updateTodo();
};

runTests();
