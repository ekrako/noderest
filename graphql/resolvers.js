const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = {
  createUser: async function({ userInput }, _req) {
    const email = userInput.email;
    const name = userInput.name;
    const password = userInput.password;
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: 'Email is invalid' });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: 'password should be at least 5 charaters' });
    }
    let user = await User.findOne({ email });
    if (user) {
      errors.push({ message: 'User already exist  found' });
    }
    if (errors.length > 0) {
      const error = new Error(
        'Validateion failed, incorrect Data was enetered'
      );
      error.statusCode = 422;
      error.data = errors;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user = new User({
      email,
      name,
      password: hashedPassword,
      posts: []
    });
    user.save();
    console.log({ ...user._doc, _id: user._id.toString() });
    return { ...user._doc, _id: user._id.toString() };
  }
};
