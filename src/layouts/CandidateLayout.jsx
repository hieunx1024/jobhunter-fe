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
            <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-sm border-r border-slate-100 z-50 flex flex-col">
                {/* Logo */}
                <div className="h-20 flex items-center px-8 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
                            <span className="text-white font-black text-lg">C</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 m-0 tracking-tight">
                            Candidate
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-6 flex-grow overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 ${active
                                            ? 'bg-slate-100 text-sky-600 font-bold border-r-4 border-sky-500'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-sky-600 font-medium'
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
                <div className="p-6 border-t border-slate-100 bg-white">
                     <div className="flex items-center justify-between mb-6">
                        <button className="relative p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-sky-500 border-2 border-white rounded-full"></span>
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                        <div className="p-0.5 rounded-full bg-slate-200 flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className="flex flex-col overflow-hidden text-left">
                            <span className="text-sm font-bold text-slate-800 truncate" title={user?.name}>{user?.name || 'User'}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight truncate">Ứng viên</span>
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
