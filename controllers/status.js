const User = require('../models/user');

const { validationResult } = require('express-validator');

exports.getStatus = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId)
    if (!user) {
      const error = new Error('User was not found');
      error.statusCode = 422;
      throw error;
    }
    return res.status(200).json({ status: user.status });
  } catch (err) {
    next(err);
  }
};

exports.setStatus = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error('Status cannot be empty');
      error.statusCode = 422;
      throw error;
    }
    const userId = req.userId;
    const status = req.body.status;
    const user = await User.findById(userId)
    if (!user) {
      const error = new Error('User was not found');
      error.statusCode = 422;
      throw error;
    }
    user.status = status;
    await user.save();
    return res.status(200).json({ status: user.status });
  } catch (err) {
    next(err);
  }
};
