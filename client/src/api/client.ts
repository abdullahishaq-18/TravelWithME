import axios from "axios";

// Normalizes VITE_API_URL to always end in exactly one "/api" segment, whether it was set to
// the bare backend origin (e.g. "https://api.example.com") or already includes "/api" — a 404 on
// every request (e.g. signup) is what you get if a deployment's env var is missing that suffix.
function resolveApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

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
