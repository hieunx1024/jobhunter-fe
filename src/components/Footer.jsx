import { Link } from 'react-router-dom';
import { Facebook, Linkedin, LogIn, UserPlus } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0D1421] text-white py-20 px-6 mt-auto border-t border-white/5">
            <div className="max-w-screen-xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Logo & Tagline */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.svg" alt="JobHunter" className="w-12 h-12 shadow-lg shadow-primary/20" />
                            <span className="text-2xl font-black text-white tracking-tight">JobHunter</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-medium">
                            Nền tảng tìm kiếm việc làm IT hàng đầu, kết nối nhân tài với các công ty công nghệ uy tín.
                        </p>
                    </div>

                    {/* DÀNH CHO ỨNG VIÊN */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Dành cho ứng viên</h4>
                        <ul className="space-y-4 flex flex-col">
                            <Link to="/jobs" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Việc làm IT</Link>
                            <Link to="/jobs" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Tìm kiếm việc làm</Link>
                            <Link to="/companies" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Công ty hàng đầu</Link>
                            <Link to="/candidate/applications" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Lịch sử ứng tuyển</Link>
                            <Link to="/register" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Tạo tài khoản</Link>
                        </ul>
                    </div>

                    {/* DÀNH CHO NHÀ TUYỂN DỤNG */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Dành cho nhà tuyển dụng</h4>
                        <ul className="space-y-4 flex flex-col">
                            <Link to="/hr/company" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Đăng ký công ty</Link>
                            <Link to="/hr/company" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Công ty của tôi</Link>
                            <Link to="/hr/resumes" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Tìm kiếm hồ sơ</Link>
                            <Link to="/hr" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 font-medium">Thống kê đăng bài</Link>
                        </ul>
                    </div>

                    {/* KẾT NỐI VỚI CHÚNG TÔI */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Kết nối với chúng tôi</h4>
                        <ul className="space-y-4 flex flex-col">
                            <a href="https://www.facebook.com/hieu.nguyenxuan.akvip2004" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white group transition-all font-medium">
                                <Facebook className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                <span>Facebook</span>
                            </a>
                            <a href="https://www.linkedin.com/in/hi%E1%BA%BFu-nguy%E1%BB%85n-732289391" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white group transition-all font-medium">
                                <Linkedin className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                <span>LinkedIn</span>
                            </a>
                            <Link to="/login" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white group transition-all font-medium pt-2 border-t border-white/5">
                                <LogIn className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                <span>Đăng nhập</span>
                            </Link>
                            <Link to="/register" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white group transition-all font-medium">
                                <UserPlus className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                <span>Đăng ký</span>
                            </Link>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-gray-500">
                    <div className="font-medium tracking-wide">
                        &copy; {new Date().getFullYear()} JobHunter. All rights reserved.
                    </div>
                    <div className="flex items-center gap-10">
                        <Link to="/candidate/profile" className="hover:text-white transition-colors font-semibold">Hồ sơ cá nhân</Link>
                        <Link to="/profile" className="hover:text-white transition-colors font-semibold">Đổi mật khẩu</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
