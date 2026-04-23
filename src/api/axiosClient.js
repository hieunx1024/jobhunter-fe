import axios from 'axios';
import { ENDPOINTS } from './endpoints';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://job-matching-api-h3cs.onrender.com/api/v1',
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

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. If error is 401 and it's NOT a refresh request
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== ENDPOINTS.AUTH.REFRESH) {
            originalRequest._retry = true;

            try {
                // Call refresh token endpoint
                // Note: We use axios (global) or a separate instance to avoid this interceptor
                const res = await axios.get(ENDPOINTS.AUTH.REFRESH, { withCredentials: true });

                if (res.data && res.data.data && res.data.data.access_token) {
                    const newAccessToken = res.data.data.access_token;
                    localStorage.setItem('access_token', newAccessToken);

                    // Update header and retry
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
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
