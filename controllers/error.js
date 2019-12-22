exports.error500 = (error, req, res, _next) => {
  return res.status(500).json({
    message: 'General Error',
    error
  });
};

exports.error404 = (req, res, _next) => {
  return res.status(404).json({
    message: 'Endpoint not Found',
    error: req.originalUrl
  });
};