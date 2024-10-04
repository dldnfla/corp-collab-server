const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });
    console.log("decoded: " + decoded);
    req.user = decoded;  // 토큰에서 추출한 유저 정보를 요청 객체에 추가
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
