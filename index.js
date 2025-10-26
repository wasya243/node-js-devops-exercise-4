const express = require('express');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const { v4 } = require('uuid');
require('dotenv').config();
// const bcrypt = require('bcrypt');

const logger = require('./logger');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI; // replace with your MongoDB URI
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1);
});


const app = express();
app.use(express.json());

app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id'] || v4()
  })
);


app.get('/users', async (req, res) => {
  try {
    req.log.info('Fetching users...');
    const users = await User.find({}, '-password');
    req.log.info(`Fetched users, amount: ${users.length}`);
    res.json(users);
  } catch (err) {
    req.log.error({ err }, 'Error fetching users');
    res.status(500).json({ error: err.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.log.warn('Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      req.log.warn('User already exists');
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password });
    await user.save();

    req.log.info({ userId: user._id }, 'User created');
    res.status(201).json({ message: 'User created', user: { _id: user._id, name, email } });
  } catch (err) {
    req.log.error({ err }, 'Error creating user');
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));