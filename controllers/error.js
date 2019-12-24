exports.errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500
  return res.status(statusCode).json({
    message: error.message || 'General Error',
  });
};

exports.error404 = (req, res, _next) => {
  return res.status(404).json({
    message: 'Endpoint not Found',
    error: req.originalUrl
  });
};