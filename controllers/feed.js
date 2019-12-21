exports.getPosts = (req, res, _next) => {
  return res.status(200).json({
    posts: [{ title: 'first post', content: 'hello world!' }]
  });
};