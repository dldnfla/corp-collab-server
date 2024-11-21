const multer = require('multer');
const path = require('path');

// 파일 저장 설정
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Only .jpg, .jpeg, .png files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한: 5MB
});

module.exports = upload;
