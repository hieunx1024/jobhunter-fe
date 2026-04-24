import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

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
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
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
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo & Desktop Navigation */}
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="bg-brand-900 p-1.5 rounded-lg group-hover:bg-brand-900 transition-colors">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-brand-900">
                                JobHunter
                            </span>
                        </Link>

                        <nav className="hidden md:flex gap-8 h-16">
                            <NavLink to="/jobs" label="Việc làm" active={isActive('/jobs')} />
                            <NavLink to="/companies" label="Công ty" active={isActive('/companies')} />
                            {shouldShowRegisterCompany && (
                                <NavLink to="/hr/register-company" label="Đăng ký Cty" active={isActive('/hr/register-company')} />
                            )}
                        </nav>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="hidden sm:flex items-center gap-2">
                                    {user?.role?.name === 'SUPER_ADMIN' && (
                                        <Link to="/admin" className="btn btn-secondary text-xs px-3 py-1.5">Admin</Link>
                                    )}
                                    {user?.role?.name === 'HR' && (
                                        <Link to="/hr" className="btn btn-primary text-xs px-3 py-1.5">HR Dashboard</Link>
                                    )}
                                    {user?.role?.name === 'CANDIDATE' && (
                                        <Link to="/candidate" className="btn btn-primary text-xs px-3 py-1.5">Dashboard</Link>
                                    )}
                                </div>

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                                            {user?.name?.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700 hidden lg:block max-w-[100px] truncate">
                                            {user?.name}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in origin-top-right z-50">
                                            <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                                <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                            <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-gray-50 hover:text-brand-900" onClick={() => setIsProfileOpen(false)}>
                                                <User className="mr-3 h-4 w-4" /> Hồ sơ cá nhân
                                            </Link>
                                            {/* Mobile-only dashboard links in profile menu */}
                                            <div className="sm:hidden border-t border-gray-100 mt-1 pt-1">
                                                {user?.role?.name === 'HR' && (
                                                    <Link to="/hr" className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                        Dashboard Nhà tuyển dụng
                                                    </Link>
                                                )}
                                                {user?.role?.name === 'CANDIDATE' && (
                                                    <Link to="/candidate" className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                                        Dashboard Ứng viên
                                                    </Link>
                                                )}
                                            </div>
                                            <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-900 px-3 py-2">Đăng nhập</Link>
                                <Link to="/register" className="btn btn-primary px-4 md:px-6 py-2 text-sm">Đăng ký</Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button 
                            className="md:hidden p-2 text-gray-600 hover:text-brand-900 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl py-4 flex flex-col gap-2 px-4 absolute top-16 left-0 w-full z-40 animate-fade-in" ref={mobileMenuRef}>
                    <MobileNavLink to="/jobs" label="Việc làm" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/companies" label="Công ty" onClick={() => setIsMobileMenuOpen(false)} />
                    {shouldShowRegisterCompany && (
                        <MobileNavLink to="/hr/register-company" label="Đăng ký doanh nghiệp" onClick={() => setIsMobileMenuOpen(false)} />
                    )}
                </div>
            )}
        </header>
    );
};

const NavLink = ({ to, label, active }) => (
    <Link
        to={to}
        className={`text-sm font-bold transition-all hover:text-brand-900 flex items-center relative h-full group ${active ? 'text-brand-900' : 'text-gray-600'}`}
    >
        {label}
        {active && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-900 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
        )}
        <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-brand-900 rounded-t-full transition-all duration-300 group-hover:w-full ${active ? 'hidden' : ''}`} />
    </Link>
);

const MobileNavLink = ({ to, label, onClick }) => (
    <Link
        to={to}
        className="text-base font-bold text-gray-700 hover:text-brand-900 py-3 px-4 rounded-xl hover:bg-gray-50 flex items-center transition-all"
        onClick={onClick}
    >
        {label}
    </Link>
);

export default Header;
