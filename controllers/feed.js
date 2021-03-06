const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const fileHelper = require('../util/file');
const ITEMS_PER_PAGE = 2;
const io = require('../socket');
exports.getPosts = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    const totalItems = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate('creator');
    return res.status(200).json({ posts, totalItems });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('No post was found');
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error(
        'Validateion failed, incorrect Data was enetered'
      );
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
    const post = new Post({ title, content, imageUrl, creator });
    await post.save();
    const user = await User.findById(creator);
    user.posts.push(post);
    await user.save();
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: creator, name: user.name } }
    });
    return res.status(201).json({
      message: 'Post created successfully',
      post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err) {
    next(err);
  }
};

exports.editPost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error('Validateion failed, incorrect Data ');
      error.statusCode = 422;
      throw error;
    }
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('No post was found');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Unauthorized to edit other users posts');
      error.statusCode = 403;
      throw error;
    }
    post.title = req.body.title;
    post.content = req.body.content;
    const image = req.file;
    if (image) {
      fileHelper.deleteFile(post.imageUrl);
    }
    post.imageUrl = req.file
      ? req.file.path.replace(/\\/g, '/')
      : req.body.image;

    await post.save();
    io.getIO().emit('posts', { action: 'update', post });
    return res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
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
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts = user.posts.pull(postId);
    await user.save();
    io.getIO().emit('posts', { action: 'delete', postId });
    return res.status(200).json({ message: 'post deletes' });
  } catch (err) {
    next(err);
  }
};
