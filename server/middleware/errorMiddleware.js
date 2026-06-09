const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Something went wrong.";

  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Poster or form data is too large. Use an image or video under 10MB.";
  } else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "Poster file is too large. Maximum size is 10MB.";
  } else if (err.statusCode) {
    statusCode = err.statusCode;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };

