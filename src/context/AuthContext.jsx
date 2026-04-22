import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAccount = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get(ENDPOINTS.AUTH.GET_ACCOUNT);
            if (response.data && response.data.data && response.data.data.user) {
                setUser(response.data.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.log("Not authenticated or session expired");
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('access_token');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check if we have a token, then try to fetch account
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchAccount();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axiosClient.post(ENDPOINTS.AUTH.LOGIN, { username, password });

            // Backend response structure: { statusCode, message, data: { access_token, user: {...} } } based on typical Spring Boot response wrapper or direct DTO.
            // Need to verify standard response structure. Most vn.hieu.jobhunter responses seem to be wrapped or raw DTOs.
            // Looking at AuthController: return ResponseEntity.ok()...body(res);
            // ResLoginDTO has: user, accessToken.
            // Wait, standard Spring Boot default might not wrap in "data" unless configured.
            // I should assume the DTO is returned directly OR wrapped in a global response object.
            // User request says "Mapping 100% backend".
            // Let's assume standard object: { access_token, user: {...} }

            const data = response.data;
            // Safety check for wrapper
            const refinedData = data.data ? data.data : data;

            if (refinedData.access_token) {
                localStorage.setItem('access_token', refinedData.access_token);
                setUser(refinedData.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    };

    const loginGoogle = async (idToken) => {
        try {
            const response = await axiosClient.post(ENDPOINTS.AUTH.GOOGLE_LOGIN, { idToken });
            const data = response.data;
            // Assuming response structure same as email login
            const refinedData = data.data ? data.data : data;

            if (refinedData.access_token) {
                localStorage.setItem('access_token', refinedData.access_token);
                setUser(refinedData.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    };

    const selectRole = async (roleName) => {
        try {
            // Mapping frontend selection to backend expected values
            // Candidate -> CANDIDATE
            // Recruiter -> HR (Assuming backend uses HR based on previous user prompt context, or RECRUITER?)
            // The prompt says "2 lựa chọn: Candidate và Recruiter".
            // Backend UserService logic just passes the string to RoleService.fetchByName.
            // So I must ensure I send the correct Database Role Name.
            // Usually 'CANDIDATE' and 'HR' or 'RECRUITER'.
            // I'll send the raw value passed from component. Component will determine the string.

            const response = await axiosClient.post(ENDPOINTS.AUTH.SOCIAL_ONBOARDING, { role: roleName });

            // Handle response similar to login
            const data = response.data;
            const refinedData = data.data ? data.data : data;

            if (refinedData.access_token) {
                localStorage.setItem('access_token', refinedData.access_token);
                setUser(refinedData.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axiosClient.post(ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
            setIsAuthenticated(false);
            // Optional: Refresh page or navigate
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, isAuthenticated, login, loginGoogle, logout, isLoading, fetchAccount, selectRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
