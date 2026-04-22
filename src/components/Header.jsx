import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch registrations to check if HR has pending request
    const { data: myRegistrations } = useQuery({
        queryKey: ['my-registrations-header'],
        queryFn: async () => {
            const res = await axiosClient.get(ENDPOINTS.COMPANY_REGISTRATIONS.BASE);
            return res.data.data ? res.data.data : res.data;
        },
        enabled: !!user && user?.role?.name === 'HR' && !user?.company,
        staleTime: 60000 // Cache for 1 minute to avoid spamming
    });

    const hasPendingRegistration = myRegistrations?.result?.some(r => r.status === 'PENDING');
    const shouldShowRegisterCompany = user?.role?.name === 'HR' && !user?.company && !hasPendingRegistration;

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo & Navigation */}
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="bg-brand-600 p-1.5 rounded-lg group-hover:bg-brand-700 transition-colors">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-secondary-900 group-hover:text-brand-600 transition-colors">
                                JobHunter
                            </span>
                        </Link>

                        <nav className="hidden md:flex gap-8 h-16">
                            <Link
                                to="/jobs"
                                className={`text-sm font-bold transition-all hover:text-brand-600 flex items-center relative h-full group ${isActive('/jobs') ? 'text-brand-600' : 'text-secondary-600'}`}
                            >
                                Việc làm
                                {isActive('/jobs') && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                                )}
                                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 rounded-t-full transition-all duration-300 group-hover:w-full ${isActive('/jobs') ? 'hidden' : ''}`} />
                            </Link>

                            <Link
                                to="/companies"
                                className={`text-sm font-bold transition-all hover:text-brand-600 flex items-center relative h-full group ${isActive('/companies') ? 'text-brand-600' : 'text-secondary-600'}`}
                            >
                                Công ty
                                {isActive('/companies') && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                                )}
                                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 rounded-t-full transition-all duration-300 group-hover:w-full ${isActive('/companies') ? 'hidden' : ''}`} />
                            </Link>

                            {shouldShowRegisterCompany && (
                                <Link
                                    to="/hr/register-company"
                                    className={`text-sm font-bold transition-all hover:text-brand-600 flex items-center relative h-full group ${isActive('/hr/register-company') ? 'text-brand-600' : 'text-secondary-600'}`}
                                >
                                    Đăng ký Cty
                                    {isActive('/hr/register-company') && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                                    )}
                                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 rounded-t-full transition-all duration-300 group-hover:w-full ${isActive('/hr/register-company') ? 'hidden' : ''}`} />
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                {user?.role?.name === 'SUPER_ADMIN' && (
                                    <Link to="/admin" className="btn btn-secondary text-xs px-3 py-1.5">
                                        Admin
                                    </Link>
                                )}

                                {user?.role?.name === 'HR' && (
                                    <Link to="/hr" className="btn btn-primary text-xs px-3 py-1.5 shadow-brand-500/30">
                                        HR Dashboard
                                    </Link>
                                )}

                                {user?.role?.name === 'CANDIDATE' && (
                                    <Link to="/candidate" className="btn btn-primary text-xs px-3 py-1.5 shadow-brand-500/30">
                                        Dashboard
                                    </Link>
                                )}

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-secondary-200 hover:bg-secondary-50 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                                            {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                                        </div>
                                        <span className="text-sm font-medium text-secondary-700 hidden sm:block max-w-[100px] truncate">
                                            {user?.name}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 text-secondary-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-100 py-2 animate-fade-in origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="px-4 py-2 border-b border-secondary-100 mb-1">
                                                <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                                                <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
                                            </div>

                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-brand-600 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <User className="mr-3 h-4 w-4" /> Hồ sơ cá nhân
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-medium text-secondary-600 hover:text-brand-600 px-3 py-2 transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn btn-primary shadow-brand-500/30">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
