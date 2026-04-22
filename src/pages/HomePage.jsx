import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Building2, Users, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';
import JobCard from '../components/JobCard';
import { useState } from 'react';

const HomePage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('name', searchTerm);
        if (location) params.append('location', location);

        navigate(`/jobs?${params.toString()}`);
    };

    // Fetch featured jobs (just first page)
    const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
        queryKey: ['jobs', 'featured'],
        queryFn: async () => {
            const res = await axiosClient.get(`${ENDPOINTS.JOBS.ALL}?page=1&size=6&sort=createdAt,desc`);
            return res.data.data ? res.data.data : res.data;
        }
    });

    const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
        queryKey: ['companies', 'featured'],
        queryFn: async () => {
            const res = await axiosClient.get(`${ENDPOINTS.COMPANIES.PUBLIC}?page=1&size=4&sort=updatedAt,desc`);
            return res.data.data ? res.data.data : res.data;
        }
    });

    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-brand-900 rounded-3xl text-white isolate shadow-2xl shadow-brand-900/20 mx-4 mt-8">
                {/* Abstract Background Pattern - More Subtle */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(72,101,129,0.3),transparent)]"></div>
                </div>

                <div className="relative z-10 px-6 py-20 md:py-32 text-center max-w-5xl mx-auto space-y-10">
                    <div className="space-y-6 animate-slide-up">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-snug text-white">
                            Tìm Kiếm Cơ Hội Nghề Nghiệp <br className="hidden md:block" /> <span className="text-brand-300">Tốt Nhất Cho Bạn</span>
                        </h1>
                        <p className="text-lg md:text-xl text-brand-100/80 max-w-2xl mx-auto leading-relaxed font-light">
                            Khám phá hàng ngàn công việc IT hấp dẫn từ các công ty công nghệ hàng đầu. Phát triển sự nghiệp của bạn ngay hôm nay.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-2 animate-slide-up border border-white/10" style={{ animationDelay: '0.1s' }}>
                        <div className="flex-1 flex items-center px-4 py-3 bg-white rounded-xl shadow-sm transition-all border border-transparent focus-within:ring-2 focus-within:ring-brand-400">
                            <Search className="text-secondary-400 mr-3 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Tên công việc, kỹ năng..."
                                className="w-full text-secondary-900 placeholder:text-secondary-400 bg-transparent outline-none font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex-1 flex items-center px-4 py-3 bg-white rounded-xl shadow-sm transition-all border border-transparent focus-within:ring-2 focus-within:ring-brand-400">
                            <MapPin className="text-secondary-400 mr-3 h-5 w-5" />
                            <select
                                className="w-full text-secondary-900 bg-white outline-none font-medium cursor-pointer"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            >
                                <option value="">Tất cả địa điểm</option>
                                <option value="Hà Nội">Hà Nội</option>
                                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                <option value="Đà Nẵng">Đà Nẵng</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-brand-700 hover:bg-brand-800 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
                        >
                            <Search className="h-5 w-5" />
                            Tìm Kiếm
                        </button>

                    </div>

                    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-white/70 animate-slide-up pt-4" style={{ animationDelay: '0.2s' }}>
                        <span>Phổ biến:</span>
                        <div className="flex gap-3">
                            {['Java', 'ReactJS', 'Python', 'NodeJS'].map((tag) => (
                                <a key={tag} href="#" className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors border border-white/10 text-white/90 text-xs">
                                    {tag}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
                {[
                    { label: "Việc làm", value: "10k+", icon: Briefcase, color: "text-brand-900", bg: "bg-brand-50" },
                    { label: "Công ty", value: "500+", icon: Building2, color: "text-brand-900", bg: "bg-brand-50" },
                    { label: "Ứng viên", value: "1M+", icon: Users, color: "text-brand-900", bg: "bg-brand-50" },
                    { label: "Ứng tuyển", value: "50k+", icon: TrendingUp, color: "text-brand-900", bg: "bg-brand-50" },
                ].map((stat, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-2xl bg-white border border-secondary-100 shadow-sm hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-2 md:mb-0`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-2xl font-bold text-brand-900 tracking-tight">{stat.value}</p>
                            <p className="text-secondary-500 text-sm font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Featured Jobs */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">Việc Làm Mới Nhất</h2>
                        <p className="text-secondary-500 mt-2 text-lg">Những cơ hội nghề nghiệp tốt nhất được cập nhật liên tục.</p>
                    </div>
                    <Link to="/jobs" className="btn btn-outline group">
                        Xem tất cả <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoadingJobs ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-secondary-200 p-6 h-64 animate-pulse flex flex-col gap-4">
                                <div className="h-12 w-12 bg-secondary-100 rounded-lg"></div>
                                <div className="h-4 bg-secondary-100 rounded w-3/4"></div>
                                <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
                                <div className="mt-auto flex gap-2">
                                    <div className="h-6 w-20 bg-secondary-100 rounded-full"></div>
                                    <div className="h-6 w-20 bg-secondary-100 rounded-full"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        jobsData?.result?.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))
                    )}
                </div>
            </section>

            {/* Top Companies */}
            <section className="bg-secondary-50 py-20 mx-4 rounded-3xl relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary-200 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-3xl font-bold text-secondary-900">Nhà Tuyển Dụng Hàng Đầu</h2>
                        <p className="text-secondary-500 text-lg max-w-2xl mx-auto">Gia nhập các công ty công nghệ uy tín nhất với môi trường làm việc chuyên nghiệp và đãi ngộ hấp dẫn.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {isLoadingCompanies ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white h-64 rounded-xl animate-pulse shadow-sm"></div>
                            ))
                        ) : (
                            companiesData?.result?.map((company) => (
                                <Link
                                    to={`/companies/${company.id}`}
                                    key={company.id}
                                    className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group h-full justify-between"
                                >
                                    <div className="flex flex-col items-center w-full">
                                        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-secondary-100 shadow-sm p-4">
                                            {company.logo ? (
                                                <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <Building2 className="h-10 w-10 text-brand-500" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-secondary-900 group-hover:text-brand-600 transition-colors line-clamp-1 w-full">{company.name}</h3>
                                        <div className="flex items-center gap-1 text-secondary-500 mt-2 text-sm justify-center w-full">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[150px]">{company.address || 'Hanoi, Vietnam'}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 w-full pt-4 border-t border-secondary-50">
                                        <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-colors block w-max mx-auto">
                                            Đang tuyển dụng
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                    <div className="text-center">
                        <Link to="/companies" className="btn btn-primary px-8 shadow-lg shadow-brand-500/30">
                            Xem tất cả công ty
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
