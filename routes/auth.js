const express = require('express');

const { body } = require('express-validator');
const User = require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth');

router.put(
  '/signup',
  [
    body('email')
      .normalizeEmail()
      .isEmail()
      .withMessage('Please enter valid email')
      .custom((email, { _req }) => {
        return User.findOne({ email }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-mail already exists');
          }
        });
      }),
    body(
      'password',
      'Minimum password length 6 characters and only alphanumeric characters'
    )
      .trim()
      .isLength({ min: 6 }),
    body('name')
      .trim()
      .notEmpty()
  ],
  authController.signup
);

router.post(
  '/login',
  [
    body('email')
      .normalizeEmail()
      .isEmail()
      .withMessage('Please enter valid email'),
    body(
      'password',
      'Minimum password length 6 characters and only alphanumeric characters'
    )
      .trim()
      .isLength({ min: 6 })
  ],
  authController.login
);

module.exports = router;
