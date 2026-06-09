import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("fmt-auth") || "null");
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const storedAuth = readStoredAuth();
  const [token, setToken] = useState(storedAuth?.token || null);
  const [user, setUser] = useState(storedAuth?.user || null);
  const [isBooting, setIsBooting] = useState(Boolean(storedAuth?.token));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("fmt-auth");
      return;
    }

    localStorage.setItem(
      "fmt-auth",
      JSON.stringify({
        token,
        user,
      })
    );
  }, [token, user]);

  useEffect(() => {
    const syncCurrentUser = async () => {
      if (!token) {
        setIsBooting(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (error) {
        setToken(null);
        setUser(null);
      } finally {
        setIsBooting(false);
      }
    };

    syncCurrentUser();
  }, [token]);

  const saveAuth = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      saveAuth(data);
      return data.user;
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (payload) => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      saveAuth(data);
      return data.user;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("fmt-auth");
  };

  const updateLocalUser = (nextUser) => {
    setUser((prev) => {
      if (!prev) return nextUser;
      if (nextUser && nextUser._id && nextUser.email) {
        return nextUser;
      }
      return { ...prev, ...nextUser };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isBooting,
        isSubmitting,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};

