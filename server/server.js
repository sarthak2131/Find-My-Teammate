require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
  override: true,
});

const express = require("express");
const http = require("http");

const connectDB = require("./config/db");
const { isAllowedOrigin } = require("./config/corsOptions");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const requestRoutes = require("./routes/requestRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const initSocketServer = require("./sockets/socketServer");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { ensureDemoUsers } = require("./config/seedDemoUsers");

const app = express();
const server = http.createServer(app);
const io = initSocketServer(server);

app.set("io", io);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (!requestOrigin) {
    return next();
  }

  if (!isAllowedOrigin(requestOrigin)) {
    return res.status(403).json({
      message: `Origin ${requestOrigin} is not allowed by CORS.`,
    });
  }

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] ||
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "find-my-teammate-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureDemoUsers();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Unable to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
