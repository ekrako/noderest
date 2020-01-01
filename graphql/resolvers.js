const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secret');

module.exports = {
  login: async function({ email, password }, _req) {
    let user = await User.findOne({ email });
    if (!user) {
      const error = new Error(
        'Validateion failed, incorrect Data was enetered'
      );
      error.status = 401;
      error.data = 'worng User passowrd combination';
      throw error;
    }
    const isAuth = await bcrypt.compare(password, user.password);

    if (!isAuth) {
      const error = new Error(
        'Validateion failed, incorrect Data was enetered'
      );
      error.status = 401;
      error.data = 'worng  passowrd combination';
      throw error;
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
    return { token, userId: user._id };
  },

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
  },

  createPost: async function({ title, content, userId, token }) {
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: 'title should be at least 5 charaters' });
    }
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: 'content should be at least 5 charaters' });
    }
    let user = await User.findById(userId);
    if (!user) {
      errors.push({ message: 'User not  found' });
    }
    const decodedToken = jwt.verify(token, secrets.jwtSecret, {});
    if (!decodedToken) {
      errors.push({ message: 'Token not Valid' });
    }
    if (errors.length > 0) {
      const error = new Error(
        'Validateion failed, incorrect Data was enetered'
      );
      error.statusCode = 422;
      error.data = errors;
      throw error;
    }

    const post = new Post({ title, content, imageUrl: null, userId });
    await post.save();
    user.posts.push(post);
    await user.save();
    return post;
  }
};
