const jwt = require("jsonwebtoken");

const config = process.env;

const authenticateToken = (req, res, next) => {
  
  const token = req.cookies['x-access-token'];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
    next()
} catch (err) {
    return res.redirect('/login');
  }
  return next();
};

module.exports = authenticateToken;
//app.use(authenticateToken);
