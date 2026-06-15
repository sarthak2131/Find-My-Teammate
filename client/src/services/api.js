import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("fmt-auth");

  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      localStorage.removeItem("fmt-auth");
    }
  }

  return config;
});

export const socketBaseUrl = API_URL.startsWith("/")
  ? undefined
  : API_URL.replace(/\/api\/?$/, "");

export default api;
