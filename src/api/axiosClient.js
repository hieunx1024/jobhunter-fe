import axios from 'axios';
import { ENDPOINTS } from './endpoints';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Important for cookies (refresh token)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Access Token from local storage (or memory)
axiosClient.interceptors.request.use(
    (config) => {
        // We will store access token in localStorage for simplicity as requested, 
        // though HttpOnly cookie is better for security, the backend returns access token in body.
        // The requirement says "Lưu JWT vào HttpOnly / LocalStorage". 
        // Backend returns access_token in JSON, refresh_token in HttpOnly Cookie.
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthContext = originalRequest.url?.includes('/auth/login') || 
                              originalRequest.url?.includes('/auth/google') || 
                              originalRequest.url?.includes('/auth/register');

        // 1. If error is 401 and it's NOT a refresh request or a login/register request
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== ENDPOINTS.AUTH.REFRESH && !isAuthContext) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh token endpoint using global axios to avoid interceptor loop
                const res = await axios.get(ENDPOINTS.AUTH.REFRESH, { withCredentials: true });

                if (res.data && res.data.data && res.data.data.access_token) {
                    const newAccessToken = res.data.data.access_token;
                    localStorage.setItem('access_token', newAccessToken);

                    // Update headers
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);
                    isRefreshing = false;

                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed (cookie expired/missing) -> Logout
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_info');
                
                // Only redirect if NOT already on login/register page to avoid loops
                if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        // 2. If it's a 401 on the refresh endpoint itself, just logout
        if (error.response?.status === 401 && originalRequest.url === ENDPOINTS.AUTH.REFRESH) {
            localStorage.removeItem('access_token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
