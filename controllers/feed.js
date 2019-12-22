exports.getPosts = (req, res, _next) => {
  return res.status(200).json({
    posts: [{ title: 'first post', content: 'hello world!' }]
  });
};

exports.createPost = (req, res, _next) => {
  const title = req.body.title;
  const content = req.body.content;
  return res.status(201).json({
    message: 'Post created successfully',
    post: { id: new Date().toISOString(), title, content }
  });
};
