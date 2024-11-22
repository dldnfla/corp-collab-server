const AWS = require('@aws-sdk/client-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

// S3에 이미지 업로드
exports.postProfileImg = async (id, fileBuffer) => {
  try {
    const uploadResult = await s3
      .upload({
        Bucket: 'studybuddy-s3-bucket',
        Key: `profile_imgs/${id}.jpg`,
        Body: fileBuffer,
        ContentType: 'image/jpeg',
      })
      .promise();

    return uploadResult.Location;
  } catch (error) {
    throw new Error('Failed to upload file to S3: ' + error.message);
  }
};

// S3에서 이미지 URL 가져오기
exports.getProfileImg = async (id) => {
  try {
    const params = {
      Bucket: 'studybuddy-s3-bucket',
      Key: `profile_imgs/${id}.jpg`,
    };

    const headCode = await s3.headObject(params).promise(); // 파일이 존재하는지 확인
    if (!headCode) throw new Error('File not found');

    // S3 파일 URL 반환
    return s3.getSignedUrl('getObject', {
      ...params,
      Expires: 60 * 60, // 1시간 유효한 URL
    });
  } catch (error) {
    throw new Error('Failed to fetch file from S3: ' + error.message);
  }
};
