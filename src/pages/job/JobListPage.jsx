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
        <div className="max-w-screen-xl mx-auto px-6 pt-6 pb-12 flex flex-col lg:flex-row gap-8 bg-background min-h-screen">
            {/* Sidebar (Left) */}
            <div className="lg:w-72 flex-shrink-0 space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 sticky top-20 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Bộ lọc tìm kiếm</h2>

                    {/* Active Filters */}
                    {(location || searchTerm || selectedSkills.length > 0 || level || minSalary) && (
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Đang áp dụng</span>
                                <button onClick={handleClearSearch} className="text-sm text-danger hover:underline font-medium">Xóa bộ lọc</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-3 py-1 rounded-full font-medium">
                                        <FileText className="w-3 h-3" /> {searchTerm}
                                    </span>
                                )}
                                {location && (
                                    <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-3 py-1 rounded-full font-medium">
                                        <MapPin className="w-3 h-3" /> {location}
                                    </span>
                                )}
                                {level && (
                                    <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-3 py-1 rounded-full font-medium">
                                        <Briefcase className="w-3 h-3" /> {level}
                                    </span>
                                )}
                                {minSalary && (
                                    <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-3 py-1 rounded-full font-medium">
                                        <DollarSign className="w-3 h-3" /> {Number(minSalary).toLocaleString('vi-VN')} VNĐ
                                    </span>
                                )}
                                {selectedSkills.length > 0 && selectedSkills.map(id => {
                                    const skill = skillOptions.find(s => s.value === id);
                                    return skill ? (
                                        <span key={id} className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-3 py-1 rounded-full font-medium">
                                            <Sparkles className="w-3 h-3" /> {skill.label}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* Filter Forms */}
                    <div className="space-y-5">
                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Từ khóa</div>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Tên công việc..."
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Địa điểm</div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <select
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none cursor-pointer"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kỹ năng</div>
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="Chọn kỹ năng..."
                                value={selectedSkills}
                                onChange={setSelectedSkills}
                                options={skillOptions}
                                maxTagCount="responsive"
                            />
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cấp bậc</div>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <select
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none cursor-pointer"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="INTERN">Intern</option>
                                    <option value="FRESHER">Fresher</option>
                                    <option value="JUNIOR">Junior</option>
                                    <option value="MIDDLE">Middle</option>
                                    <option value="SENIOR">Senior</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mức lương tối thiểu</div>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <select
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none cursor-pointer"
                                    value={minSalary}
                                    onChange={(e) => setMinSalary(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="5000000">Từ 5 triệu</option>
                                    <option value="10000000">Từ 10 triệu</option>
                                    <option value="15000000">Từ 15 triệu</option>
                                    <option value="20000000">Từ 20 triệu</option>
                                    <option value="30000000">Từ 30 triệu</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSearch}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 active:scale-[0.98] flex justify-center items-center gap-2"
                        >
                            {isFetching ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" /> Tìm kiếm
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content (Right) */}
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                        {jobs?.meta?.total ? (
                            <span>Tìm thấy <span className="font-semibold text-gray-900">{jobs.meta.total}</span> việc làm</span>
                        ) : (
                            <span>Danh sách việc làm</span>
                        )}
                    </div>
                    {/* <Select defaultValue="newest" size="small" style={{ width: 120 }}>
                        <Select.Option value="newest">Mới nhất</Select.Option>
                        <Select.Option value="salary_desc">Lương cao nhất</Select.Option>
                    </Select> */}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse h-32"></div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-red-600 font-medium">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
                    </div>
                ) : jobs?.result?.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            {jobs.result.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>

                        <div className="flex justify-center mt-8">
                            <Pagination
                                current={page}
                                total={jobs?.meta?.total || 0}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                className="[&_.ant-pagination-item-active]:border-primary [&_.ant-pagination-item-active_a]:text-primary [&_.ant-pagination-item:hover]:border-primary [&_.ant-pagination-item:hover_a]:text-primary [&_.ant-pagination-item-active]:!bg-primary [&_.ant-pagination-item-active_a]:!text-white [&_.ant-pagination-item]:rounded-md"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100">
                        <svg className="w-[120px] h-[120px] text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-700 mt-6">Không tìm thấy việc làm phù hợp</h3>
                        <p className="text-sm text-gray-400 mt-2 max-w-xs">Thử thay đổi bộ lọc tìm kiếm hoặc từ khóa để có thêm kết quả.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListPage;
