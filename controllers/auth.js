const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secret');

exports.signup = (req, res, next) => {
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
  User.findOne({ email })
    .then(user => {
      if (user) {
        const error = new Error('User already exist  found');
        error.statusCode = 422;
        error.data = errors.array();
      }
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      const user = new User({
        email,
        name,
        password: hashedPassword,
        posts: []
      });
      return user.save();
    })
    .then(result => {
      return res.status(201).json({
        userId: result._id,
        message: 'user Created'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validateion failed, incorrect Data was enetered');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  let loginUser;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        const error = new Error('Wrong email and password combination');
        error.statusCode = 401;
      }
      loginUser = user;
      return bcrypt.compare(password, user.password);
    })

    .then(isAuth => {
      if (!isAuth) {
        const error = new Error('Wrong email and password combination');
        error.statusCode = 401;
      }
      const token = jwt.sign(
        {
          email: loginUser.email,
          userId: loginUser._id,
          name: loginUser.name
        },
        secrets.jwtSecret,
        { expiresIn: '1h' }
      );
      return res.status(200).json({
        userId: loginUser._id.toString(),
        status: loginUser.status,
        token,
        message: 'user Login successfully'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
