import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useRoleRedirect from '../hooks/useRoleRedirect';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
    // We use the hook for side-effect redirect, but we also need local check to prevent rendering
    useRoleRedirect();
    const { isLoading, isAuthenticated, user } = useAuth();

    // Show loader while checking auth state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Role check logic matching useRoleRedirect
    const shouldRedirectToRoleSelection = isAuthenticated && (!user?.role || user?.role?.name === 'USER');

    if (shouldRedirectToRoleSelection) {
        // Return null or a loader while the useRoleRedirect hook pushes them away
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-zinc-800 overflow-x-hidden selection:bg-blue-100 selection:text-brand-900">
            <Header />
            <main className="flex-grow w-full pt-16">
                <Outlet />
            </main>
            <Footer />

            {/* Subtle Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[160px] transform translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
};

export default MainLayout;
