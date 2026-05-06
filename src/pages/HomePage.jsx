import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Building2, Users, Briefcase, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';
import JobCard from '../components/JobCard';
import JobCardSkeleton from '../components/JobCardSkeleton';
import { useState } from 'react';
import { getFileUrl } from '../utils/fileUtils';

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
        <div className="space-y-0 pb-20 bg-background min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#0A65CC] to-[#1D4ED8] py-20 px-6">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center">
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Tìm việc làm phù hợp với bạn
                    </h1>
                    <p className="text-lg text-blue-100 mt-3 max-w-xl">
                        Khám phá hàng ngàn công việc IT hấp dẫn từ các công ty công nghệ hàng đầu. Phát triển sự nghiệp của bạn ngay hôm nay.
                    </p>

                    <div className="bg-white rounded-xl shadow-elevated p-2 flex flex-col md:flex-row gap-2 mt-8 w-full max-w-2xl">
                        <div className="flex-1 flex items-center">
                            <Search className="text-gray-400 w-5 h-5 ml-4" />
                            <input
                                type="text"
                                placeholder="Tên công việc, kỹ năng..."
                                className="flex-1 border-0 outline-none text-sm px-4 h-11"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="md:w-44 border-t md:border-t-0 md:border-l border-gray-200 flex items-center">
                            <MapPin className="text-gray-400 w-5 h-5 ml-4" />
                            <select
                                className="w-full border-0 outline-none text-sm px-4 h-11 bg-transparent cursor-pointer appearance-none"
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
                            className="bg-primary hover:bg-primary-hover text-white rounded-lg px-6 py-2.5 font-semibold text-sm transition-colors active:scale-[0.98] w-full md:w-auto mt-2 md:mt-0 h-11"
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    <div className="mt-4 flex gap-2 flex-wrap justify-center">
                        <span className="text-sm text-blue-100 py-1">Phổ biến:</span>
                        {['Java', 'ReactJS', 'Python', 'NodeJS'].map((tag) => (
                            <button key={tag} onClick={() => setSearchTerm(tag)} className="bg-white/15 text-white text-xs px-3 py-1 rounded-full hover:bg-white/25 cursor-pointer transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-white border-b border-gray-100 py-4">
                <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100">
                    {[
                        { label: "Việc làm", value: "10,000+" },
                        { label: "Công ty", value: "5,000+" },
                        { label: "Ứng viên", value: "1M+" },
                        { label: "Lượt ứng tuyển", value: "50,000+" },
                    ].map((stat, index) => (
                        <div key={index} className="text-center px-4">
                            <p className="text-2xl font-bold text-primary">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Jobs */}
            <section className="max-w-screen-xl mx-auto px-6 pt-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Việc Làm Mới Nhất</h2>
                        <p className="text-gray-500 mt-1 text-sm">Những cơ hội nghề nghiệp tốt nhất được cập nhật liên tục.</p>
                    </div>
                    <Link to="/jobs" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                        Xem tất cả
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoadingJobs ? (
                        [...Array(6)].map((_, i) => (
                            <JobCardSkeleton key={i} />
                        ))
                    ) : (
                        jobsData?.result?.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))
                    )}
                </div>
            </section>

            {/* Top Companies */}
            <section className="max-w-screen-xl mx-auto px-6 pt-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-900">Nhà Tuyển Dụng Hàng Đầu</h2>
                    <p className="text-gray-500 mt-1 text-sm">Gia nhập các công ty công nghệ uy tín nhất với đãi ngộ hấp dẫn.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {isLoadingCompanies ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white h-64 rounded-xl border border-gray-100 shadow-card animate-pulse"></div>
                        ))
                    ) : (
                        companiesData?.result?.map((company) => (
                            <Link
                                to={`/companies/${company.id}`}
                                key={company.id}
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center group h-full justify-between"
                            >
                                <div className="flex flex-col items-center w-full">
                                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-4 border border-gray-100 shadow-sm p-2 group-hover:border-primary/30 transition-colors">
                                        {company.logo ? (
                                            <img src={getFileUrl(company.logo, 'company')} alt={company.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <Building2 className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-base text-gray-900 group-hover:text-primary transition-colors line-clamp-1 w-full">{company.name}</h3>
                                    <div className="flex items-center gap-1 text-gray-500 mt-1 text-sm justify-center w-full">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[150px]">{company.address || 'Hanoi, Vietnam'}</span>
                                    </div>
                                </div>
                                <div className="mt-6 w-full pt-4 border-t border-gray-50">
                                    <span className="text-xs font-semibold text-primary bg-primary-light px-3 py-1.5 rounded-full transition-colors block w-max mx-auto group-hover:bg-primary group-hover:text-white">
                                        Đang tuyển dụng
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
