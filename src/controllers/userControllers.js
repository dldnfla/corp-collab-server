const userService = require('../services/userServices');

exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.authenticateUser = async (req, res) => {
  try {
    const token = await userService.authenticateUser(req.body.userId, req.body.password);
    res.status(200).json({token});
  } catch (error) {
    res.status(401).json({message: error.message});
  }
}

exports.getUserById = async (req, res) => {
  try {
    const id = req.user;  
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const id = req.user
    const user = await userService.getAllUsers(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const result = await userService.updateUser(req.params.userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateWeeklyNote= async (req, res) => {
  try {
    const result = await userService.updateWeeklyNote(req.params.userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.userId);
    res.status(204).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.searchUser = async (req, res) => {
  try{
    const result = await userService.searchUser(req.params.searchUser);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}