import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Reads a cookie value by name from document.cookie.
 * Used to retrieve tokens in cross-domain production deployments
 * where cookies live on the Vercel domain and need to be sent explicitly
 * to the AWS backend (different domain).
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

// ── Request interceptor ────────────────────────────────────────────────────
// In cross-domain production deployments, the browser does NOT send Vercel
// cookies to the AWS backend automatically. We read the access_token from
// document.cookie and attach it as "Authorization: Bearer <token>" on every
// outgoing API request so the backend JWT strategy can authenticate the user.
// On localhost, access_token is httpOnly so getCookieValue returns null and
// the cookie is sent automatically via withCredentials — no change in behaviour.
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getCookieValue('access_token');
    if (accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor (token refresh on 401) ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== API_ENDPOINTS.AUTH.REFRESH_TOKEN) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err: AxiosError) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // In cross-domain production, the refresh_token cookie (set on Vercel)
        // won't be sent automatically to the AWS backend. Read it from
        // document.cookie and pass it as "Authorization: Bearer <token>".
        const refreshToken = getCookieValue('refresh_token');
        
        // Prevent the secondary 401 network error if we know we don't have a token
        const isCrossDomain = typeof window !== 'undefined' && !API_BASE_URL.startsWith(window.location.origin) && !API_BASE_URL.startsWith('/');
        if (isCrossDomain && !refreshToken) {
          throw new AxiosError('No refresh token available', '401');
        }

        const refreshHeaders: Record<string, string> = {};
        if (refreshToken) {
          refreshHeaders['Authorization'] = `Bearer ${refreshToken}`;
        }
        await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {}, { headers: refreshHeaders });
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
