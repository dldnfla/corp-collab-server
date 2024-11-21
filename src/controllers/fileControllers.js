const fileService = require('../services/fileServices');

// 프로필 이미지 업로드
exports.uploadProfileImage = async (req, res) => {
  try {
    const id = req.user; // 사용자 ID (토큰에서 추출)
    const file = req.file; // Multer로 처리된 파일

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // S3에 파일 업로드
    const uploadedImageUrl = await fileService.postProfileImg(id, file.buffer);
    res.status(201).json({ success: true, imageUrl: uploadedImageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
};

// 프로필 이미지 다운로드 (URL 제공)
exports.downloadProfileImage = async (req, res) => {
  try {
    const id = req.user; // 사용자 ID (토큰에서 추출)
    const imageUrl = await fileService.getProfileImg(id);
    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Failed to fetch file' });
  }
};
