const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { verifyToken } = require('../middleware/auth');


router.post('/signup', userController.createUser);
router.post('/login', userController.authenticateUser);
router.get('/users/:username', verifyToken, userController.getUserById);
router.put('/users/:username',verifyToken, userController.updateUser);
router.put('/users/:username/weeklyNote',verifyToken, userController.updateWeeklyNote);
router.delete('/users/:username', verifyToken, userController.deleteUser);

module.exports = router;
