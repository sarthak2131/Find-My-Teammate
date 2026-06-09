const { Server } = require("socket.io");
const { allowedOrigins, isAllowedOrigin, localOriginPattern } = require("../config/corsOptions");

const initSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
    allowRequest: (req, callback) => {
      callback(null, isAllowedOrigin(req.headers.origin));
    },
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    socket.on("presence:online", (userId) => {
      if (!userId) {
        return;
      }

      const roomId = userId.toString();
      onlineUsers.set(roomId, socket.id);
      socket.join(roomId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("typing:start", ({ to, from, name }) => {
      if (to) {
        io.to(to.toString()).emit("typing:start", { from, name });
      }
    });

    socket.on("typing:stop", ({ to, from }) => {
      if (to) {
        io.to(to.toString()).emit("typing:stop", { from });
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

module.exports = initSocketServer;
