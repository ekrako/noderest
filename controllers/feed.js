const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const fileHelper = require('../util/file');
const ITEMS_PER_PAGE = 2;

exports.getPosts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Post.countDocuments()
    .then(total => {
      totalItems = total;
      return Post.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(posts => {
      return res.status(200).json({
        posts,
        totalItems
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('No post was found');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({
        post
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validateion failed, incorrect Data was enetered');
    error.statusCode = 422;
    throw error;
  }
  const image = req.file;
  if (!image) {
    const error = new Error('No image was loaded');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = image.path.replace(/\\/g, '/');
  const creator = req.userId;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator
  });
  post
    .save()
    .then(_result => {
      return User.findById(creator);
    })
    .then(user => {
      user.posts.push(post);
      return user.save();
    })
    .then(user => {
      return res.status(201).json({
        message: 'Post created successfully',
        post,
        creator: { _id: user._id, name: user.name }
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.editPost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validateion failed, incorrect Data was enetered');
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('No post was found');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Unauthorized to edit other users posts');
        error.statusCode = 403;
        throw error;
      }
      const title = req.body.title;
      const content = req.body.content;
      const imageUrl = req.file
        ? req.file.path.replace(/\\/g, '/')
        : req.body.image;
      const image = req.file;
      if (image) {
        fileHelper.deleteFile(post.imageUrl);
      }
      post.imageUrl = imageUrl;
      post.title = title;
      post.content = content;
      return post.save();
    })
    .then(post => {
      return res.status(200).json({
        post
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('No post was found');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Unauthorized to delete other users posts');
        error.statusCode = 403;
        throw error;
      }
      fileHelper.deleteFile(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts = user.posts.pull(postId);
      return user.save();
    })
    .then(() => {
      return res.status(200).json({ message: 'post deletes' });
    })
    .catch(err => {
      next(err);
    });
};
