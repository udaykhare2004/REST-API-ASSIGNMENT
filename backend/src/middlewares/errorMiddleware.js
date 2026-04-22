const ApiError = require("../utils/ApiError");

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || "Internal server error",
  };
  if (err.errors) {
    payload.errors = err.errors;
  }
  res.status(statusCode).json(payload);
};

module.exports = { notFound, errorHandler };
