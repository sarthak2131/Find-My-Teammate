import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import api, { socketBaseUrl } from "../services/api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  const mergeNotifications = (items) => {
    const uniqueNotifications = [];
    const seen = new Set();

    for (const notification of items) {
      if (!notification?._id || seen.has(notification._id)) {
        continue;
      }

      seen.add(notification._id);
      uniqueNotifications.push(notification);
    }

    return uniqueNotifications;
  };

  useEffect(() => {
    if (!token || !user) {
      setSocket(null);
      setOnlineUsers([]);
      setNotifications([]);
      setNotificationsLoaded(false);
      setLastMessage(null);
      setTypingUsers({});
      return undefined;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        if (isMounted) {
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        if (isMounted) {
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setNotificationsLoaded(true);
        }
      }
    };

    loadNotifications();

    const nextSocket = io(socketBaseUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    nextSocket.on("connect", () => {
      nextSocket.emit("presence:online", user._id);
    });

    nextSocket.on("online-users", (users) => {
      setOnlineUsers(users || []);
    });

    nextSocket.on("notification:new", (notification) => {
      setNotifications((current) => mergeNotifications([notification, ...current]));
    });

    nextSocket.on("message:new", (message) => {
      setLastMessage(message);
    });

    nextSocket.on("typing:start", ({ from, name }) => {
      setTypingUsers((current) => ({ ...current, [from]: name || "Typing..." }));
    });

    nextSocket.on("typing:stop", ({ from }) => {
      setTypingUsers((current) => {
        const next = { ...current };
        delete next[from];
        return next;
      });
    });

    setSocket(nextSocket);

    return () => {
      isMounted = false;
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [token, user]);

  const unreadNotificationsCount = notifications.filter(
    (notification) => notification && !notification.isRead
  ).length;

  const value = {
    socket,
    onlineUsers,
    notifications,
    notificationsLoaded,
    unreadNotificationsCount,
    lastMessage,
    typingUsers,
    clearLastMessage: () => setLastMessage(null),
    markNotificationRead: async (notificationId) => {
      const { data } = await api.put(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? data.notification : notification
        )
      );
    },
    markAllNotificationsRead: async () => {
      await api.put("/notifications/read-all");
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    },
    emitTyping: (to, isTyping) => {
      if (!socket || !user || !to) {
        return;
      }

      socket.emit(isTyping ? "typing:start" : "typing:stop", {
        to,
        from: user._id,
        name: user.name,
      });
    },
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketContext must be used inside SocketProvider.");
  }

  return context;
};
