const userService = require('../services/userServices');

exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.authenticateUser = async (req, res) => {
  try {
    const authtoken = await userService.authenticateUser(req.body);
    res.status(200).json({authtoken});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.status(204).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};