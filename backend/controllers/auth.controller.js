const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Create a new user in memory
    const user = await User.create({
      name,
      email,
      password, // The hashing will happen automatically because of our model
    });

    // 3. If user was created successfully, send a success response
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        message: 'User registered successfully!'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if the user exists
    const user = await User.findOne({ email });
   if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. If passwords match, create a JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d', // Token expires in 30 days
    });

    // 4. Send the user's info and the token back to the frontend
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
    });

  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

module.exports = { registerUser, loginUser };