import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("twm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on any authenticated route means the token is missing/invalid/expired — bounce to
// login from anywhere in the app. Login/signup handle their own 401s locally (wrong password,
// duplicate email) and shouldn't trigger a hard redirect.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url: string = err?.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/signup");
    if (err?.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("twm_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
