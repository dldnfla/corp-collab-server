const express = require('express');
const router = express.Router();
const followController = require('../controllers/followControllers');
const { verifyToken } = require('../middleware/auth');

router.post('/follow/request', verifyToken,followController.createFollow);
router.get('/follow/followers',verifyToken, followController.getFollower);
router.get('/follow/requests', verifyToken, followController.getFollowRequests);
router.put('/follow/accept', verifyToken, followController.putFollow);

module.exports = router;
