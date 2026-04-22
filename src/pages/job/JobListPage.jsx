import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import JobCard from '../../components/JobCard';
import Pagination from '../../components/Pagination';
import { Search, MapPin, Filter, FileText, Sparkles, X, Briefcase, DollarSign } from 'lucide-react';
import { Select } from 'antd';
import { useSearchParams } from 'react-router-dom';

const JobListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read params from URL
    const initialLocation = searchParams.get('location') || '';
    const initialKeyword = searchParams.get('name') || '';
    const initialSkills = searchParams.get('skills') ? searchParams.get('skills').split(',').map(Number) : [];
    const initialLevel = searchParams.get('level') || '';
    const initialMinSalary = searchParams.get('minSalary') || '';

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    // Internal state for inputs
    const [location, setLocation] = useState(initialLocation);
    const [searchTerm, setSearchTerm] = useState(initialKeyword);
    const [selectedSkills, setSelectedSkills] = useState(initialSkills);
    const [level, setLevel] = useState(initialLevel);
    const [minSalary, setMinSalary] = useState(initialMinSalary);

    // Sync state when URL params change (e.g. back button)
    useEffect(() => {
        const loc = searchParams.get('location') || '';
        const name = searchParams.get('name') || '';
        const skills = searchParams.get('skills') ? searchParams.get('skills').split(',').map(Number) : [];
        const lvl = searchParams.get('level') || '';
        const salary = searchParams.get('minSalary') || '';
        
        setLocation(loc);
        setSearchTerm(name);
        setSelectedSkills(skills);
        setLevel(lvl);
        setMinSalary(salary);
        setPage(1);
    }, [searchParams]);

    // Fetch Skills for Dropdown
    const { data: skillsList } = useQuery({
        queryKey: ['skills'],
        queryFn: async () => {
            const res = await axiosClient.get(ENDPOINTS.SKILLS.BASE, { params: { page: 1, size: 100 } });
            return res.data.data?.result || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Prepare Skill Options for Antd Select
    const skillOptions = skillsList?.map(skill => ({
        label: skill.name,
        value: skill.id,
    })) || [];

    // Search Handler
    const handleSearch = () => {
        const params = {};
        if (location) params.location = location;
        if (searchTerm) params.name = searchTerm;
        if (selectedSkills.length > 0) params.skills = selectedSkills.join(',');
        if (level) params.level = level;
        if (minSalary) params.minSalary = minSalary;

        setSearchParams(params);
        setPage(1);
    };

    const handleClearSearch = () => {
        setLocation('');
        setSearchTerm('');
        setSelectedSkills([]);
        setLevel('');
        setMinSalary('');
        setSearchParams({});
        setPage(1);
    };

    // Build query fn
    const fetchJobs = async () => {
        const locationParam = searchParams.get('location');
        const nameParam = searchParams.get('name');
        const skillsParam = searchParams.get('skills');
        const levelParam = searchParams.get('level');
        const salaryParam = searchParams.get('minSalary');

        const params = {
            page: page,
            size: pageSize,
            sort: 'createdAt,desc',
        };

        let endpoint = ENDPOINTS.JOBS.ALL;

        if (locationParam || skillsParam || nameParam || levelParam || salaryParam) {
            endpoint = ENDPOINTS.JOBS.SEARCH;
            if (locationParam) params.location = locationParam;
            if (nameParam) params.name = nameParam;
            if (skillsParam) params.skills = skillsParam;
            if (levelParam) params.level = levelParam;
            if (salaryParam) params.minSalary = salaryParam;
        }

        const res = await axiosClient.get(endpoint, { params });
        return res.data.data ? res.data.data : res.data;
    };

    const { data: jobs, isLoading, isError, isFetching } = useQuery({
        queryKey: ['jobs', page, pageSize, searchParams.toString()],
        queryFn: fetchJobs,
        keepPreviousData: true,
    });

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header / Search Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6 md:p-8">
                <h1 className="text-2xl font-bold text-secondary-900 mb-6">Tìm kiếm việc làm</h1>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Search Input */}
                    <div className="md:col-span-12 lg:col-span-5 relative group">
                        <Search className="absolute left-3 top-3.5 text-secondary-400 group-focus-within:text-brand-500 transition-colors z-10" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên công việc..."
                            className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Location Select */}
                    <div className="md:col-span-6 lg:col-span-3 relative group">
                        <MapPin className="absolute left-3 top-3.5 text-secondary-400 group-focus-within:text-brand-500 transition-colors z-10" />
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            <option value="">Tất cả địa điểm</option>
                            <option value="Hà Nội">Hà Nội</option>
                            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                            <option value="Đà Nẵng">Đà Nẵng</option>
                            <option value="Cần Thơ">Cần Thơ</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </div>

                    {/* Skills Select (Ant Design) */}
                    <div className="md:col-span-6 lg:col-span-4 relative h-12">
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: '100%', height: '100%' }}
                            placeholder="Chọn kỹ năng..."
                            value={selectedSkills}
                            onChange={setSelectedSkills}
                            options={skillOptions}
                            maxTagCount="responsive"
                            className="custom-ant-select rounded-xl"
                        />
                    </div>

                    {/* Level Select */}
                    <div className="md:col-span-6 lg:col-span-3 relative group">
                        <Briefcase className="absolute left-3 top-3.5 text-secondary-400 group-focus-within:text-brand-500 transition-colors z-10" />
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            <option value="">Tất cả cấp bậc</option>
                            <option value="INTERN">Intern</option>
                            <option value="FRESHER">Fresher</option>
                            <option value="JUNIOR">Junior</option>
                            <option value="MIDDLE">Middle</option>
                            <option value="SENIOR">Senior</option>
                        </select>
                    </div>

                    {/* Salary Input */}
                    <div className="md:col-span-6 lg:col-span-3 relative group">
                        <DollarSign className="absolute left-3 top-3.5 text-secondary-400 group-focus-within:text-brand-500 transition-colors z-10" />
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer"
                            value={minSalary}
                            onChange={(e) => setMinSalary(e.target.value)}
                        >
                            <option value="">Tất cả mức lương</option>
                            <option value="5000000">Từ 5 triệu</option>
                            <option value="10000000">Từ 10 triệu</option>
                            <option value="15000000">Từ 15 triệu</option>
                            <option value="20000000">Từ 20 triệu</option>
                            <option value="30000000">Từ 30 triệu</option>
                            <option value="50000000">Từ 50 triệu</option>
                        </select>
                    </div>

                    {/* Search Button */}
                    <div className="md:col-span-12">
                        <button
                            onClick={handleSearch}
                            className="w-full h-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                        >
                            {isFetching ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" /> Tìm kiếm
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Active Filters */}
                {(location || searchTerm || selectedSkills.length > 0 || level || minSalary) && (
                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-secondary-500">Đang lọc theo:</span>
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-100">
                                <FileText className="w-3 h-3" /> "{searchTerm}"
                            </span>
                        )}
                        {location && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-100">
                                <MapPin className="w-3 h-3" /> {location}
                            </span>
                        )}
                        {level && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">
                                <Briefcase className="w-3 h-3" /> {level}
                            </span>
                        )}
                        {minSalary && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                                <DollarSign className="w-3 h-3" /> {Number(minSalary).toLocaleString('vi-VN')} VNĐ
                            </span>
                        )}
                        {selectedSkills.length > 0 && selectedSkills.map(id => {
                            const skill = skillOptions.find(s => s.value === id);
                            return skill ? (
                                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                                    <Sparkles className="w-3 h-3" /> {skill.label}
                                </span>
                            ) : null;
                        })}
                        <button onClick={handleClearSearch} className="text-sm text-red-500 hover:text-red-700 hover:underline ml-2 flex items-center gap-1">
                            <X className="w-3 h-3" /> Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content: Job List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-secondary-200 shadow-sm">
                        <h2 className="text-secondary-700 font-medium">
                            {jobs?.meta?.total ? (
                                <span>Tìm thấy <span className="font-bold text-brand-600">{jobs.meta.total}</span> việc làm phù hợp</span>
                            ) : (
                                'Danh sách việc làm'
                            )}
                        </h2>
                        {/* Sort logic can be added later */}
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-secondary-100 animate-pulse h-48"></div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                            <p className="text-red-600 font-medium">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
                        </div>
                    ) : jobs?.result?.length > 0 ? (
                        <div className="space-y-4">
                            {jobs.result.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}

                            <div className="pt-6">
                                <Pagination
                                    current={page}
                                    total={jobs?.meta?.total || 0}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-secondary-200 border-dashed">
                            <div className="bg-secondary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-secondary-300" />
                            </div>
                            <h3 className="text-lg font-bold text-secondary-900">Không tìm thấy việc làm nào</h3>
                            <p className="text-secondary-500 mt-2">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Suggested Box */}
                    <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm sticky top-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-brand-100 rounded-lg">
                                <Sparkles className="w-5 h-5 text-brand-600" />
                            </div>
                            <h3 className="font-bold text-secondary-900">Gợi ý cho bạn</h3>
                        </div>
                        <p className="text-sm text-secondary-500 mb-6 leading-relaxed">
                            Đăng nhập để nhận được các gợi ý việc làm phù hợp nhất với hồ sơ và kỹ năng của bạn.
                        </p>

                        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 rounded-xl text-white shadow-lg shadow-brand-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                            <div className="relative z-10">
                                <FileText className="w-8 h-8 mb-3 text-brand-200" />
                                <h3 className="font-bold text-lg mb-2">Tạo CV chuyên nghiệp</h3>
                                <p className="text-brand-100 text-sm mb-4">Tăng 80% cơ hội được nhà tuyển dụng chú ý với mẫu CV chuẩn.</p>
                                <button className="w-full bg-white text-brand-600 font-bold py-2.5 rounded-lg hover:bg-brand-50 transition-colors shadow-sm">
                                    Tạo CV Ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobListPage;
