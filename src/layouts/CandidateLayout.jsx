import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutGrid,
    UserCircle2,
    LogOut,
    ClipboardList,
    Home,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';

const CandidateLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/candidate', icon: LayoutGrid, label: 'Dashboard', exact: true },
        { path: '/candidate/applications', icon: ClipboardList, label: 'Ứng tuyển của tôi' },
        { path: '/candidate/profile', icon: UserCircle2, label: 'Hồ sơ cá nhân' },
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-background flex">
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen transition-all duration-300 bg-white border-r border-gray-100 z-50 flex flex-col ${isMobileOpen
                    ? 'w-64 translate-x-0'
                    : isCollapsed
                        ? 'w-0 -translate-x-full'
                        : '-translate-x-full md:translate-x-0 w-64'
                    }`}
            >
                <div className={`h-20 flex items-center border-b border-gray-100 flex-shrink-0 relative px-6 overflow-hidden`}>
                    <Link to="/" className="flex items-center gap-3 overflow-hidden group">
                        <img src="/logo.svg" alt="JobHunter" className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
                        <h1 className="text-xl font-black text-gray-900 m-0 tracking-tight whitespace-nowrap group-hover:text-primary transition-colors">
                            JobHunter
                        </h1>
                    </Link>

                    {/* Floating Toggle Button Removed */}
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden absolute right-4 top-7 text-gray-400 hover:text-red-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`py-6 flex-grow overflow-y-auto px-4`}>
                    <ul className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center transition-colors relative group text-sm font-medium gap-3 px-4 py-3 rounded-xl ${active
                                            ? 'bg-primary-light text-primary'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5`} />
                                        <span className="whitespace-nowrap">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Info & Actions Bottom */}
                <div className={`p-4 mt-auto border-t border-gray-100 transition-all duration-300`}>
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col overflow-hidden text-left">
                                <span className="text-sm font-semibold text-gray-900 truncate" title={user?.name}>{user?.name || 'User'}</span>
                                <span className="text-xs text-gray-500">Ứng viên</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-0' : 'md:ml-64'}`}>
                {/* Unified Header */}
                <header className={`h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 flex items-center justify-between fixed top-0 right-0 z-40 transition-all duration-300 ${isCollapsed ? 'left-0' : 'left-0 md:left-64'}`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (window.innerWidth >= 768) {
                                    setIsCollapsed(!isCollapsed);
                                } else {
                                    setIsMobileOpen(true);
                                }
                            }}
                            className="text-gray-500 hover:text-primary hover:bg-gray-100 h-10 w-10 flex items-center justify-center rounded-lg transition-all active:scale-95"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="flex items-center">
                            <span className="hidden sm:inline text-gray-400 text-sm font-medium italic">Chào mừng trở lại,</span>
                            <span className="text-gray-800 text-sm font-bold ml-1.5">{user?.name}</span>
                        </div>
                    </div>
                </header>

                <main className={`p-4 md:p-8 flex-1 transition-all duration-300 mt-16`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CandidateLayout;
