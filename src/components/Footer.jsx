import { Briefcase, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-brand-950 pt-16 pb-8 border-t border-brand-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4 group">
                            <div className="bg-brand-700 p-1.5 rounded-lg">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">JobHunter</span>
                        </Link>
                        <p className="text-secondary-400 text-sm leading-relaxed mb-6">
                            Nền tảng tuyển dụng hàng đầu Việt Nam. Kết nối nhân tài với những cơ hội nghề nghiệp tốt nhất.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Về JobHunter</h4>
                        <ul className="space-y-3 text-sm text-secondary-400">
                            <li><Link to="/about" className="hover:text-brand-300 transition-colors">Giới thiệu</Link></li>
                            <li><Link to="/contact" className="hover:text-brand-300 transition-colors">Liên hệ</Link></li>
                            <li><Link to="/careers" className="hover:text-brand-300 transition-colors">Tuyển dụng</Link></li>
                            <li><Link to="/blog" className="hover:text-brand-300 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Dành cho ứng viên</h4>
                        <ul className="space-y-3 text-sm text-secondary-400">
                            <li><Link to="/jobs" className="hover:text-brand-300 transition-colors">Việc làm mới nhất</Link></li>
                            <li><Link to="/companies" className="hover:text-brand-300 transition-colors">Danh sách công ty</Link></li>
                            <li><Link to="/profile" className="hover:text-brand-300 transition-colors">Hồ sơ của tôi</Link></li>
                            <li><Link to="/saved-jobs" className="hover:text-brand-300 transition-colors">Việc làm đã lưu</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Hỗ trợ & Pháp lý</h4>
                        <ul className="space-y-3 text-sm text-secondary-400">
                            <li><Link to="/faq" className="hover:text-brand-300 transition-colors">Câu hỏi thường gặp</Link></li>
                            <li><Link to="/privacy" className="hover:text-brand-300 transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link to="/terms" className="hover:text-brand-300 transition-colors">Điều khoản dịch vụ</Link></li>
                            <li><Link to="/complaint" className="hover:text-brand-300 transition-colors">Giải quyết khiếu nại</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-brand-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-secondary-500 text-sm">
                        &copy; {new Date().getFullYear()} JobHunter. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-secondary-500">
                        <Link to="/privacy" className="hover:text-secondary-300">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-secondary-300">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
