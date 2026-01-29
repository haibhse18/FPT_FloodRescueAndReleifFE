import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * Token Manager - Lưu access token trong memory (không dùng localStorage)
 * Theo auth-flow.md: "Lưu accessToken vào memory/state"
 */
let accessToken: string | null = null;

export const tokenManager = {
  getToken: () => accessToken,
  setToken: (token: string | null) => {
    accessToken = token;
  },
  clearToken: () => {
    accessToken = null;
  },
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // Cho phép gửi cookies (refresh token) trong request
  // Theo auth-flow.md: "refreshToken được set HTTP-only cookie"
  withCredentials: true,
});

// Flag để tránh multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ memory (không phải localStorage)
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi và auto-refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Xử lý lỗi 401 - Token hết hạn
    // Theo auth-flow.md: "Khi access token hết hạn → gọi /api/auth/refresh"
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Không refresh cho các auth endpoints
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh, đợi và retry với token mới
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh endpoint - cookie refreshToken tự động gửi
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.accessToken;
        tokenManager.setToken(newToken);
        
        // Process queued requests
        processQueue(null, newToken);
        
        // Retry original request với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại - xóa token và redirect về login
        // Theo auth-flow.md: "Session không tồn tại → Redirect đến trang Login"
        processQueue(refreshError as AxiosError, null);
        tokenManager.clearToken();
        
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý lỗi 403 - Forbidden (không log)
    // if (error.response?.status === 403) {
    //   console.error("Không có quyền truy cập");
    // }

    // Xử lý lỗi 500 - Server Error (không log)
    // if (error.response?.status && error.response.status >= 500) {
    //   console.error("Lỗi server, vui lòng thử lại sau");
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;
