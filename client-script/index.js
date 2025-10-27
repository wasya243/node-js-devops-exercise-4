const axios = require('axios');

// Replace with your EC2 public IP or domain
const BASE_URL = 'http://ec2-34-255-206-123.eu-west-1.compute.amazonaws.com:3000';

async function fetchUsers() {
  try {
    const res = await axios.get(`${BASE_URL}/users`);
    console.log(`[GET /users] ${res.status} (${res.data.length} users)`);
  } catch (err) {
    console.error('Error fetching users:', err.message);
  }
}

async function createUser() {
  try {
    const randomId = Math.floor(Math.random() * 100000);
    const userData = {
      name: `User${randomId}`,
      email: `user${randomId}@example.com`,
      password: 'test123',
    };
    const res = await axios.post(`${BASE_URL}/users`, userData);
    console.log(`[POST /users] ${res.status} (${userData.email})`);
  } catch (err) {
    if (err.response) {
      console.error(`[POST /users] ${err.response.status}: ${err.response.data.error}`);
    } else {
      console.error('Error creating user:', err.message);
    }
  }
}

async function randomQuery() {
  // Randomly choose GET or POST
  const action = Math.random() < 0.5 ? 'GET' : 'POST';
  if (action === 'GET') {
    await fetchUsers();
  } else {
    await createUser();
  }
}

// Run every 1 second
setInterval(randomQuery, 10000);
