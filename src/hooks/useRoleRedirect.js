import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useRoleRedirect = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoading) return;

        // 1. If logged in but no specific role, force selection
        if (
            isAuthenticated &&
            (!user?.role || user?.role?.name === 'USER') &&
            location.pathname !== '/select-role'
        ) {
            navigate('/select-role', { replace: true });
            return;
        }

        // 2. If Admin/Manager or HR tries to access public pages (MainLayout pages), force redirect to their respective Portal
        const isAdmin = user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'ADMIN' || user?.role?.name === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
        const isHR = user?.role?.name === 'HR' || user?.role?.name === 'ROLE_HR' || user?.role === 'HR';
        
        const isPublicPath = !location.pathname.startsWith('/admin') && 
                            !location.pathname.startsWith('/hr') && 
                            !location.pathname.startsWith('/candidate') &&
                            location.pathname !== '/login' &&
                            location.pathname !== '/register' &&
                            location.pathname !== '/select-role';

        if (isAuthenticated && isPublicPath) {
            if (isAdmin) {
                navigate('/admin', { replace: true });
            } else if (isHR) {
                navigate('/hr', { replace: true });
            }
            // Candidates are allowed to stay on public pages
        }
    }, [isLoading, isAuthenticated, user, navigate, location]);
};

export default useRoleRedirect;
