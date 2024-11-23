const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { User } = require('../models'); 
const multer = require('multer');
const express = require('express');
const router = express.Router(); 

// S3 클라이언트 생성
const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// S3에 이미지 업로드
exports.postProfileImg = async (id, fileBuffer) => {
  try {
    const params = {
      Bucket: 'studybuddy-s3-bucket',
      Key: `profile_imgs/${id}.jpg`,
      Body: fileBuffer,
      ContentType: 'image/jpeg',
    };

    const command = new PutObjectCommand(params);
    await s3.send(command); // S3에 파일 업로드

    // 업로드된 파일의 URL 생성
    const imageUrl = await this.getProfileImg(id); // 비동기 함수의 결과를 대기

    console.log(imageUrl); // URL 확인

    // User 모델에서 profileImage 업데이트
    await User.update(
      { profileImage: imageUrl }, // URL을 문자열로 업데이트
      { where: { id } } // 특정 사용자 ID
    );

    return imageUrl; // 클라이언트에 업로드된 이미지 URL 반환
  } catch (error) {
    throw new Error('Failed to upload file to S3: ' + error.message);
  }
};


exports.getProfileImg = async (id) => {
  try {
    const params = {
      Bucket: 'studybuddy-s3-bucket',
      Key: `profile_imgs/${id}.jpg`,
    };

    // 파일 존재 여부 확인
    const headCommand = new HeadObjectCommand(params);
    await s3.send(headCommand); // 에러 발생 시 예외 처리

    // 서명된 URL 생성
    const getObjectCommand = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, getObjectCommand, { expiresIn: 604800}); // 약 10년 유효

    return signedUrl;
  } catch (error) {
    if (error.name === 'NotFound') {
      throw new Error('File not found');
    }
    throw new Error('Failed to fetch file from S3: ' + error.message);
  }
};

// multer 설정: 비디오 업로드
const upload = multer({
  dest: './uploads/', // 업로드된 파일 저장 폴더
  limits: { fileSize: 100 * 1024 * 1024 }, // 최대 파일 크기 100MB
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(webm|mp4)$/)) {
      return cb(new Error('Only video files are allowed.'));
    }
    cb(null, true);
  }
});


router.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No video file uploaded.');
  }

  console.log(`File uploaded successfully: ${req.file.path}`);

  // 업로드된 파일의 경로
  const inputFilePath = req.file.path;
  const outputFilePath = `./uploads/timelapse-${Date.now()}.mp4`; // 타임랩스 비디오 출력 파일 경로

  // FFmpeg로 타임랩스 비디오 변환
  ffmpeg(inputFilePath)
    .output(outputFilePath)
    .videoFilters('setpts=0.25*PTS') // 타임랩스 효과 (프레임 속도 4배 빠르게)
    .on('end', async () => {
      console.log('Timelapse conversion finished.');

      // 변환된 비디오를 S3로 업로드
      const fileStream = fs.createReadStream(outputFilePath);
      const s3Params = {
        Bucket: 'studybuddy-s3-bucket',
        Key: `timelapse/timelapse-${Date.now()}.mp4`, // S3에 저장될 파일 이름
        Body: fileStream,
        ContentType: 'video/mp4',
      };

      const command = new PutObjectCommand(s3Params);
      await s3.send(command);
    })
    .on('error', (err) => {
      console.error('Error during FFmpeg process:', err);
      res.status(500).send('Error processing video.');
    })
    .run();
});
module.exports = router;
