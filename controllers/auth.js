const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secret');

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validateion failed, incorrect Data was enetered');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    let user = await User.findOne({ email });
    if (user) {
      const error = new Error('User already exist  found');
      error.statusCode = 422;
      error.data = errors.array();
      throw error
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    user = new User({
      email,
      name,
      password: hashedPassword,
      posts: []
    });
    await user.save();

    return res.status(201).json({
      userId: user._id,
      message: 'user Created'
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validateion failed, incorrect Data was enetered');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email;
    const password = req.body.password;


    const user = await User.findOne({ email })

    if (!user) {
      const error = new Error('Wrong email and password combination');
      error.statusCode = 401;
      throw error

    }
    const isAuth = await bcrypt.compare(password, user.password);

    if (!isAuth) {
      const error = new Error('Wrong email and password combination');
      error.statusCode = 401;
      throw error
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
        name: user.name
      },
      secrets.jwtSecret,
      { expiresIn: '1h' }
    );
    return res.status(200).json({
      userId: user._id.toString(),
      status: user.status,
      token,
      message: 'user Login successfully'
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  }

};
