const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      // --- THIS IS THE NEW, IMPORTANT CHECK ---
      // If we decoded a token but that user ID no longer exists, block the request
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      // -----------------------------------------

      next(); // If user is found, proceed to the controller
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };