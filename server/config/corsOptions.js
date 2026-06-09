const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin) || localOriginPattern.test(origin);
};

const origin = (requestOrigin, callback) => {
  if (isAllowedOrigin(requestOrigin)) {
    return callback(null, requestOrigin || true);
  }

  return callback(new Error(`Origin ${requestOrigin} is not allowed by CORS.`));
};

module.exports = {
  allowedOrigins,
  corsOptions: {
    origin,
    credentials: true,
  },
  isAllowedOrigin,
  localOriginPattern,
};
