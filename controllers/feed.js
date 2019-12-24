const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fileHelper = require('../util/file');


exports.getPosts = (req, res, next) => {
  Post.find().then(posts => {
    return res.status(200).json({
      posts,
      totalPosts: posts.length
    });
  }).catch(err => {
    next(err);
  });

};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId).then(post => {
    if (!post) {
      const error = new Error('No post was found');
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({
      post
    });
  }).catch(err => {
    next(err);
  });

};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
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
  const imageUrl = image.path;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: { name: 'Eran' },
  });
  post.save()
    .then(result => {
      return res.status(201).json({
        message: 'Post created successfully',
        post: result
      })
    }).catch(err => {
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
  Post.findById(postId).then(post => {
    if (!post) {
      const error = new Error('No post was found');
      error.statusCode = 404;
      throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file ? req.file.path : req.body.image;
    const image = req.file;
    if (image) {
      fileHelper.deleteFile(post.imageUrl);
    }
    post.imageUrl = imageUrl;
    post.title = title;
    post.content = content;
    return post.save();
  }).then(post => {
    return res.status(200).json({
      post
    });
  }).catch(err => {
    next(err);
  });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId).then(post => {
    if (!post) {
      const error = new Error('No post was found');
      error.statusCode = 404;
      throw error;
    }

    fileHelper.deleteFile(post.imageUrl);
    return Post.findByIdAndRemove(postId)
  }).then(() => {
    return res.status(200).json({ message: 'post deletes' })
  }).catch(err => {
    next(err);
  });

};