const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = async (req, res, next) => {
  try {
    let token;
    const headers = req.headers.authorization;
    if (headers && headers.startsWith('Bearer ')
    ) {
      token = headers.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: "Not authorized token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;