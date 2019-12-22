const { validationResult } = require('express-validator');

exports.getPosts = (req, res, _next) => {
  return res.status(200).json({
    posts: [{
      _id: '1',
      title: 'first post',
      content: 'hello world!',
      creator: {
        name: 'Eran Krakovsky'
      },
      createdAt: Date.now(),
      imageUrl: 'images/ducky.jpg'
    }], totalPosts: 1
  });
};

exports.createPost = (req, res, _next) => {
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'bad input, enter valid input',
      errors: errors.array()
    });
  }
  return res.status(201).json({
    message: 'Post created successfully',
    post: {
      _id: '1',
      title,
      content,
      creator: {
        name: 'Eran Krakovsky'
      },
      createdAt: Date.now(),
      imageUrl: 'images/ducky.jpg'
    }
  });
};
