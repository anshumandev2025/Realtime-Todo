import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ─── Axios Instance ──────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // always send cookies (refresh token)
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token Registry ──────────────────────────────────────────────────────────
// A lightweight module-level getter/setter so the interceptor can read the
// Zustand access token without importing the store (avoids circular deps).
let _tokenGetter: (() => string | null) = () => null;
let _authUpdater: ((user: any, token: string) => void) | null = null;
let _logoutHandler: (() => void) | null = null;

export const registerTokenGetter = (fn: () => string | null) => { _tokenGetter = fn; };
export const registerAuthUpdater  = (fn: (user: any, token: string) => void) => { _authUpdater  = fn; };
export const registerLogoutHandler = (fn: () => void) => { _logoutHandler = fn; };

// ─── Request Interceptor — attach Bearer token ───────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _tokenGetter();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — silent 401 → refresh → retry ────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Skip refresh loop for the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const { user, accessToken: newToken } = data.data;

        // Propagate new token back into auth store
        _authUpdater?.(user, newToken);
        processQueue(null, newToken);

        if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr);
        _logoutHandler?.();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
