const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the Authorization: Bearer <token> header and attaches
// the authenticated user (minus password) to req.user.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: 'Not authorized, token invalid or expired' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Server error during authentication',
      error: error.message,
    });
  }
};

module.exports = { protect };
