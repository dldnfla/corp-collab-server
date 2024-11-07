// followRoutes.js
const express = require('express');
const router = express.Router();
const followController = require('../controllers/followControllers');
const { verifyToken } = require('../middleware/auth');

router.post('/follow', verifyToken, followController.createFollow);
router.get('/followings', verifyToken, followController.getFollowings);
router.get('/followers', verifyToken, followController.getFollowers);
router.delete('/follow', verifyToken, followController.removeFollow);

module.exports = router;
