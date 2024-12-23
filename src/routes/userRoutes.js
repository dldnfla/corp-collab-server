const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { verifyToken } = require('../middleware/auth');


router.post('/signup', userController.createUser);
router.post('/login', userController.authenticateUser);
router.get('/users', verifyToken, userController.getUserById);
router.get('/allUsers', verifyToken, userController.getAllUsers);
router.get('/users/:searchUser', verifyToken,userController.searchUser);
router.put('/users/:userId',verifyToken, userController.updateUser);
router.put('/users/:userId/weeklyNote',verifyToken, userController.updateWeeklyNote);
router.delete('/users/:userId', verifyToken, userController.deleteUser);

module.exports = router;
