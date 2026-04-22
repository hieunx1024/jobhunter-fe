const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api/v1';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        GOOGLE_LOGIN: `${API_BASE_URL}/auth/google`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
        REFRESH: `${API_BASE_URL}/auth/refresh`,
        GET_ACCOUNT: `${API_BASE_URL}/auth/account`,
        CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
        SOCIAL_ONBOARDING: `${API_BASE_URL}/auth/social-onboarding`,
    },
    USERS: {
        BASE: `${API_BASE_URL}/users`,
        GET_ONE: (id) => `${API_BASE_URL}/users/${id}`,
        SELECT_ROLE: `${API_BASE_URL}/users/select-role`,
        UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    },
    PROFILE: {
        BASE: `${API_BASE_URL}/profile`,
    },
    JOBS: {
        BASE: `${API_BASE_URL}/jobs`,
        GET_ONE: (id) => `${API_BASE_URL}/jobs/${id}`,
        BY_CREATED: (username) => `${API_BASE_URL}/jobs/by-created/${username}`,
        ALL: `${API_BASE_URL}/jobs/all`, // Public/Unfiltered
        SEARCH: `${API_BASE_URL}/jobs/search`,
        COUNT_BY_COMPANY: `${API_BASE_URL}/jobs/count-by-company`,
        POSTING_STATS: `${API_BASE_URL}/jobs/posting-stats`,
    },
    SKILLS: {
        BASE: `${API_BASE_URL}/skills`,
    },
    COMPANIES: {
        BASE: `${API_BASE_URL}/companies`,
        GET_ONE: (id) => `${API_BASE_URL}/companies/${id}`,
        PUBLIC: `${API_BASE_URL}/companies/public`,
        REGISTER: `${API_BASE_URL}/companies/register`, // HR registers their company
        MY_COMPANY: `${API_BASE_URL}/companies/my-company`, // HR gets/updates their company
    },
    RESUMES: {
        BASE: `${API_BASE_URL}/resumes`,
        GET_ONE: (id) => `${API_BASE_URL}/resumes/${id}`,
        BY_COMPANY: `${API_BASE_URL}/resumes`, // Used by HR
        MY_HISTORY: `${API_BASE_URL}/resumes/my-history`, // Candidate's application history
        MY_STATS: `${API_BASE_URL}/resumes/my-stats`,
    },
    FILES: {
        UPLOAD: `${API_BASE_URL}/files`,
        DOWNLOAD: (fileName, folder) => `${API_BASE_URL}/files?fileName=${fileName}&folder=${folder}`,
    },
    ROLES: {
        BASE: `${API_BASE_URL}/roles`,
        GET_ONE: (id) => `${API_BASE_URL}/roles/${id}`,
    },
    PERMISSIONS: {
        BASE: `${API_BASE_URL}/permissions`,
    },
    COMPANY_REGISTRATIONS: {
        BASE: `${API_BASE_URL}/company-registrations`,
        GET_ONE: (id) => `${API_BASE_URL}/company-registrations/${id}`,
        STATUS: (id) => `${API_BASE_URL}/company-registrations/${id}/status`,
    },
    DASHBOARD: {
        ADMIN: `${API_BASE_URL}/dashboard/admin`,
    }
};
