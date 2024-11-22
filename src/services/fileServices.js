const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { User } = require('../models'); 

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
    const signedUrl = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 }); // 1시간 유효한 URL 생성

    return signedUrl;
  } catch (error) {
    if (error.name === 'NotFound') {
      throw new Error('File not found');
    }
    throw new Error('Failed to fetch file from S3: ' + error.message);
  }
};