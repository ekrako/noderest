const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = {
  createUser: async function ({ userInput }, req) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error('Validateion failed, incorrect Data was enetered');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
      }
      const email = userInput.email;
      const name = userInput.name;
      const password = userInput.password;

      let user = await User.findOne({ email });
      if (user) {
        const error = new Error('User already exist  found');
        throw error
      }
      const hashedPassword = await bcrypt.hash(password, 12);

      user = new User({
        email,
        name,
        password: hashedPassword,
        posts: []
      });
      user.save();
      console.log({ ...user._doc, _id: user._id.toString() })
      return { ...user._doc, _id: user._id.toString() };
    } catch (err) {
      const error = new Error(err);
      throw error
    }

  }
};