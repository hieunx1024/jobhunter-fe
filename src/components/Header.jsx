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
        <header className="h-[64px] fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between h-full">
                {/* Logo & Desktop Navigation */}
                <div className="flex items-center gap-10 h-full">
                    <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <img src="/logo.svg" alt="JobHunter" className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xl font-black tracking-tight text-primary">
                            JobHunter
                        </span>
                    </Link>

                    <nav className="hidden md:flex gap-8 h-full">
                        <NavLink to="/jobs" label="Việc làm" active={isActive('/jobs')} />
                        <NavLink to="/companies" label="Công ty" active={isActive('/companies')} />
                        <NavLink to="/about" label="Giới thiệu" active={isActive('/about')} />
                        <NavLink to="/contact" label="Liên hệ" active={isActive('/contact')} />
                        <NavLink to="/privacy" label="Chính sách" active={isActive('/privacy')} />
                        {shouldShowRegisterCompany && (
                            <NavLink to="/hr/register-company" label="Đăng ký Cty" active={isActive('/hr/register-company')} />
                        )}
                    </nav>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2">
                                {user?.role?.name === 'SUPER_ADMIN' && (
                                    <Link to="/admin" className="px-4 h-9 rounded-md flex items-center text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">Admin</Link>
                                )}
                                {user?.role?.name === 'HR' && (
                                    <Link to="/hr" className="px-4 h-9 rounded-md flex items-center text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors active:scale-[0.98]">HR Dashboard</Link>
                                )}
                                {user?.role?.name === 'CANDIDATE' && (
                                    <Link to="/candidate" className="px-4 h-9 rounded-md flex items-center text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors active:scale-[0.98]">Dashboard</Link>
                                )}
                            </div>

                            <div className="relative flex items-center gap-2" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <div className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm">
                                        {user?.name?.charAt(0)}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 top-12 min-w-[200px] bg-white rounded-lg shadow-elevated border border-gray-100 py-2 animate-fade-in origin-top-right z-50">
                                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setIsProfileOpen(false)}>
                                            <User className="mr-3 h-4 w-4" /> Hồ sơ cá nhân
                                        </Link>
                                        <div className="sm:hidden border-t border-gray-100 mt-1 pt-1">
                                            {user?.role?.name === 'HR' && (
                                                <Link to="/hr" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    Dashboard Nhà tuyển dụng
                                                </Link>
                                            )}
                                            {user?.role?.name === 'CANDIDATE' && (
                                                <Link to="/candidate" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    Dashboard Ứng viên
                                                </Link>
                                            )}
                                        </div>
                                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors">
                                            <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="h-9 flex items-center border border-gray-200 text-gray-700 rounded-md px-4 text-sm font-medium hover:bg-gray-50 transition-colors">Đăng nhập</Link>
                            <Link to="/register" className="h-9 flex items-center bg-primary text-white rounded-md px-4 text-sm font-medium hover:bg-primary-hover transition-colors active:scale-[0.98]">Đăng ký</Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors ml-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-elevated py-4 flex flex-col gap-2 px-4 absolute top-[64px] left-0 w-full z-40 animate-fade-in" ref={mobileMenuRef}>
                    <MobileNavLink to="/jobs" label="Việc làm" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/companies" label="Công ty" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/about" label="Giới thiệu" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/contact" label="Liên hệ" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/privacy" label="Chính sách bảo mật" onClick={() => setIsMobileMenuOpen(false)} />
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
        className={`text-[14px] font-medium transition-colors duration-150 flex items-center h-full border-b-2 ${active ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-primary'}`}
    >
        {label}
    </Link>
);

const MobileNavLink = ({ to, label, onClick }) => (
    <Link
        to={to}
        className="text-[14px] font-medium text-gray-600 hover:text-primary py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
        onClick={onClick}
    >
        {label}
    </Link>
);

export default Header;
