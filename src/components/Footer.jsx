import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-brand-900 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white tracking-tight">JobHunter</span>
                </div>
                <div className="text-blue-100/70 text-sm font-medium">
                    &copy; {new Date().getFullYear()} JobHunter. All rights reserved.
                </div>
                <div className="flex gap-6 text-sm font-bold text-blue-100/80">
                    <Link to="/about" className="hover:text-white transition-colors">Giới thiệu</Link>
                    <Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link>
                    <Link to="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
