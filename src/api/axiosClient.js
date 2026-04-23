import axios from 'axios';
import { ENDPOINTS } from './endpoints';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api/v1',
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

        // Prevent infinite loop
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== ENDPOINTS.AUTH.REFRESH) {
            originalRequest._retry = true;

            try {
                // Call refresh token endpoint
                // Note: Refresh token is in HttpOnly cookie, so we just call the endpoint.
                const res = await axiosClient.get(ENDPOINTS.AUTH.REFRESH);

                if (res.data && res.data.data && res.data.data.access_token) {
                    const newAccessToken = res.data.data.access_token;
                    localStorage.setItem('access_token', newAccessToken);

                    // Update header for the original request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_info');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
