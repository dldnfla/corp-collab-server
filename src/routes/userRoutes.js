const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

router.post('/signup', userController.createUser);
router.post('/login',userController.authenticateUser);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
