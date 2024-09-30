const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

router.post('/signup', userController.createUser);
router.post('/login',userController.authenticateUser);
router.get('/users/:userId', userController.getUserById);
router.put('/users/:userId', userController.updateUser);
router.delete('/users/:userId', userController.deleteUser);

module.exports = router;
