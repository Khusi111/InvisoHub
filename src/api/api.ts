import axios, {
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import JSONbig from "json-bigint";

// 🌍 Use env variable (falls back to local Django server if not set)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/";


const localApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data) => {
      if (!data) return data;
      try {
        return JSONbig.parse(data);
      } catch {
        return data;
      }
    },
  ],
});

let accessToken: string | null = null;

// Helper to decide which instance to use
const getApiInstance = () => localApi;

// Detect refresh endpoint
const isRefreshTokenEndpoint = (url: string): boolean =>
  url.includes("/api/token/refresh/");

// 🔹 Setup interceptors
const setupInterceptors = () => {
  // Request interceptor
  localApi.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (!accessToken) {
        accessToken = localStorage.getItem("accessToken");
      }
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );

  // Response interceptor
  localApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError): Promise<any> => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Refresh token on 401/403
      if (
        error.response?.status &&
        [401, 403].includes(error.response.status) &&
        !originalRequest._retry &&
        originalRequest.url &&
        !isRefreshTokenEndpoint(originalRequest.url)
      ) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available");

          const response = await localApi.post("/api/token/refresh/", {
            refresh: refreshToken,
          });

          if (response.data.access) {
            const newAccessToken = response.data.access;
            localStorage.setItem("accessToken", newAccessToken);
            accessToken = newAccessToken;

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return localApi(originalRequest);
          } else {
            throw new Error("Invalid refresh response");
          }
        } catch (err) {
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("accessToken");
          accessToken = null;
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors();

// 🔹 Export API wrapper
const api = {
  request: (config: AxiosRequestConfig) => getApiInstance().request(config),
  get: (url: string, config?: AxiosRequestConfig) =>
    getApiInstance().get(url, config),
  post: (url: string, data?: any, config?: AxiosRequestConfig) =>
    getApiInstance().post(url, data, config),
  put: (url: string, data?: any, config?: AxiosRequestConfig) =>
    getApiInstance().put(url, data, config),
  delete: (url: string, config?: AxiosRequestConfig) =>
    getApiInstance().delete(url, config),
};

export default api;
