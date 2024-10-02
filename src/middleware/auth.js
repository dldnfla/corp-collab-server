const jwt = require('jsonwebtoken');
const SECRET_KEY = crypto.randomBytes(64).toString('hex');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer 토큰에서 분리
  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;  // 토큰에서 추출한 유저 정보를 요청 객체에 추가
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
