import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    User,
    LogOut,
    FileText,
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
        { path: '/candidate', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/candidate/applications', icon: FileText, label: 'Ứng tuyển của tôi' },
        { path: '/candidate/profile', icon: User, label: 'Hồ sơ cá nhân' },
        { path: '/', icon: Home, label: 'Trang chủ', exact: true },
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Mobile Header Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed left-0 top-0 h-screen transition-all duration-300 bg-white shadow-sm border-r border-blue-100 z-50 flex flex-col ${
                    isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 ' + (isCollapsed ? 'w-24' : 'w-64')
                }`}
            >
                {/* Logo & Toggle */}
                <div className={`h-22 flex items-center border-b border-blue-50 flex-shrink-0 relative ${isCollapsed ? 'justify-center p-6' : 'px-8 p-6'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-2xl bg-brand-900 flex items-center justify-center shadow-lg shadow-blue-900/10 flex-shrink-0">
                            <span className="text-white font-black text-xl">C</span>
                        </div>
                        {!isCollapsed && (
                            <h1 className="text-xl font-black text-brand-900 m-0 tracking-tight animate-fade-in whitespace-nowrap">
                                Candidate
                            </h1>
                        )}
                    </div>
                    
                    {/* Toggle Button */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex absolute -right-3 top-8 bg-white border border-blue-100 rounded-full p-1 shadow-md text-blue-400 hover:text-blue-900 transition-all z-50"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden absolute right-4 top-8 text-gray-400 hover:text-red-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`py-8 flex-grow overflow-y-auto ${isCollapsed ? 'px-4' : 'px-6'}`}>
                    <ul className="space-y-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        title={isCollapsed ? item.label : ''}
                                        className={`flex items-center transition-all duration-300 relative group ${
                                            isCollapsed ? 'justify-center p-3.5 rounded-2xl' : 'space-x-4 px-5 py-3.5 rounded-2xl'
                                        } ${active
                                            ? 'bg-brand-900 text-white shadow-lg shadow-blue-900/10 font-bold'
                                            : 'text-brand-900 hover:bg-blue-50 hover:text-brand-900 font-medium'
                                        }`}
                                    >
                                        <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                                        {!isCollapsed && (
                                            <span className="animate-fade-in whitespace-nowrap">{item.label}</span>
                                        )}
                                        {active && !isCollapsed && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Info & Actions Bottom */}
                <div className={`p-4 mt-auto border-t border-blue-50 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-800 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-3 text-blue-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                title="Đăng xuất"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3 p-3.5 rounded-[1.5rem] bg-blue-50/50 border border-blue-100">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-2xl bg-blue-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex flex-col overflow-hidden text-left">
                                    <span className="text-sm font-bold text-brand-900 truncate" title={user?.name}>{user?.name || 'User'}</span>
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-tight">Ứng viên</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-blue-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title="Đăng xuất"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-24' : 'md:ml-64'}`}>
                {/* Mobile Top Bar */}
                <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">C</div>
                        <span className="font-bold text-blue-900">Candidate</span>
                    </div>
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 text-gray-600">
                        <Menu size={24} />
                    </button>
                </header>
                <main className={`p-4 md:p-8 flex-1 transition-all duration-300`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CandidateLayout;
