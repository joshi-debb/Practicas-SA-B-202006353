const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

const cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(403).json({ message: 'No autorizado' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token inválido' });
      req.user = user;
      next();
  });
};

module.exports = cookieJwtAuth;