import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Briefcase,
    Bookmark,
    User,
    LogOut,
    FileText,
    Bell,
    Home
} from 'lucide-react';

const CandidateLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

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
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 z-50 flex flex-col">
                {/* Logo */}
                <div className="h-24 flex items-center justify-center border-b border-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-3 px-4 mt-2">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-black text-xl">C</span>
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent m-0 tracking-tight">
                            Candidate
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 flex-grow overflow-y-auto mt-2">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${active
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 font-bold border-r-2 border-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 font-medium'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Info & Actions Bottom */}
                <div className="p-4 border-t border-gray-50 flex-shrink-0 bg-white">
                     <div className="flex justify-center mb-4 gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                        <div className="p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-gray-800 truncate" title={user?.name}>{user?.name || 'User'}</span>
                            <span className="text-xs font-medium text-gray-500 truncate" title={user?.email}>{user?.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-64 flex-1 flex flex-col min-h-screen">
                <main className="p-8 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CandidateLayout;
