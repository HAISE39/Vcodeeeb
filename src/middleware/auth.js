const jwt = require('jsonwebtoken');

const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY_CHANGE_IN_PROD'; // In prod use ENV

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect(303, '/auth/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect(303, '/auth/login');
  }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access Denied');
    }
}

module.exports = { authenticate, isAdmin, JWT_SECRET };
