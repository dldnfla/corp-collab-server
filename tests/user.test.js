const axios = require('axios');

token = "";

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

const getUser = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
    },);
    token = response['data']['token'];
    console.log('AuthorizedUser Status: ',response.status);

    console.log('loginUser : ', response.data);
  } catch (error) {
    console.error('Error logging in user', error.response ? error.response.data : error.message);
  }
};

const updateUser = async () => {
  try {
    const response = await axios.put('http://localhost:3000/api/users/testUser', {
      username: 'new test user',
      isStudy: true
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('updateUser : ', response.data);
  } catch (error) {
    console.error('Error updating user', error.response ? error.response.data : error.message);
  }
}

const updateWeeklyNote = async () => {
  try {
    const response = await axios.put('http://localhost:3000/api/users/testUser/weeklyNote', {
      weeklyNote: "testNote"
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('updateWeeklyNote : ', response.data);
  } catch (error) {
    console.error('Error updating note', error.response ? error.response.data : error.message);
  }
}

const deleteUser = async () => {
  try {
    const response = await axios.delete('http://localhost:3000/api/users/testUser', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 204) {
      console.log('deleteUser : { User deleted successfully }');
    }
  } catch (error) {
    console.error('Error deleting users:', error.response ? error.response.data : error.message);
  }
};

exports.createUser;

const runTests = async () => {
  await createUser();
  await loginUser();
  await getUser();
  await updateUser();
  await updateWeeklyNote();
  await deleteUser();
};

runTests();

