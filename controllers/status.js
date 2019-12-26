const User = require('../models/user');

const { validationResult } = require('express-validator');

exports.getStatus = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error('User was not found');
        error.statusCode = 422;
        throw error;
      }
      return res.status(200).json({ status: user.status });
    })
    .catch(err => {
      next(err);
    });
};

exports.setStatus = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Status cannot be empty');
    error.statusCode = 422;
    throw error;
  }
  const userId = req.userId;
  const status = req.body.status;
  User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error('User was not found');
        error.statusCode = 422;
        throw error;
      }
      user.status = status;
      return user.save();
    })
    .then(user => {
      return res.status(200).json({ status: user.status });
    })
    .catch(err => {
      next(err);
    });
};
