import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { MapPin, Globe, Users, ArrowLeft, Building, Mail, ExternalLink, Cpu, Heart, CheckCircle2, Facebook } from 'lucide-react';
import JobCard from '../../components/JobCard';
import { getFileUrl } from '../../utils/fileUtils';

const CompanyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch company info
    const { data: company, isLoading: isLoadingCompany } = useQuery({
        queryKey: ['company', id],
        queryFn: async () => {
            const res = await axiosClient.get(ENDPOINTS.COMPANIES.GET_ONE(id));
            return res.data.data ? res.data.data : res.data;
        }
    });

    // Fetch jobs of company
    const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
        queryKey: ['jobs', 'company', id],
        queryFn: async () => {
            const params = {
                page: 1,
                size: 20, // Get more for tech stack parsing
                filter: `company.id:${id}`
            };
            const res = await axiosClient.get(ENDPOINTS.JOBS.ALL, { params });
            return res.data.data ? res.data.data : res.data;
        },
        enabled: !!id
    });

    if (isLoadingCompany) return (
        <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#64748B] font-medium text-lg">Đang tải thông tin công ty...</p>
            </div>
        </div>
    );

    if (!company) return (
        <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-10 rounded-2xl shadow-sm border max-w-md">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <Building className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-[#1A202C] mb-2">Không tìm thấy công ty</h1>
                <p className="text-[#64748B] mb-8">Thông tin công ty bạn tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1B4F8A] transition-colors">
                    Quay lại
                </button>
            </div>
        </div>
    );

    // Parse Tech Stack from jobs
    const extractTechStack = (jobs) => {
        if (!jobs || jobs.length === 0) return [];

        const keywords = [
            'Java', 'Spring Boot', 'Spring', 'Hibernate', 'React', 'ReactJS', 'Vue', 'VueJS', 'Angular',
            'JavaScript', 'JS', 'TypeScript', 'TS', 'Node', 'NodeJS', 'Python', 'Django', 'Flask',
            'PHP', 'Laravel', 'C#', '.NET', 'ASP.NET', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
            'Cloud', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'NoSQL', 'Redis', 'Kafka', 'RabbitMQ',
            'Swift', 'Kotlin', 'Flutter', 'React Native', 'Android', 'iOS', 'AI', 'ML', 'Machine Learning',
            'Data Science', 'Big Data', 'UI/UX', 'Figma', 'DevOps', 'CI/CD'
        ];

        const allText = jobs.map(j => `${j.name} ${j.description}`).join(' ').toLowerCase();
        const found = keywords.filter(kw => {
            const regex = new RegExp(`\\b${kw.toLowerCase().replace('.', '\\.')}\\b`, 'i');
            return regex.test(allText);
        });

        return found.slice(0, 10); // Limit to 10 tags
    };

    const techStack = extractTechStack(jobsData?.result || []);

    // Placeholder Benefits
    const defaultBenefits = [
        { icon: '🏥', label: 'Bảo hiểm sức khỏe' },
        { icon: '💻', label: 'Thiết bị làm việc' },
        { icon: '📅', label: 'Nghỉ phép linh hoạt' },
        { icon: '🎓', label: 'Đào tạo & phát triển' }
    ];

    return (
        <div className="min-h-screen bg-[#F5F7FA] font-['Inter']">
            {/* Header / Banner */}
            <div className="h-[220px] bg-gradient-to-r from-[#0A2540] to-[#1B4F8A] relative rounded-b-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="max-w-[1100px] mx-auto h-full relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-4 lg:left-0 text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors z-20"
                    >
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </button>
                </div>
            </div>

            {/* Company Info Card Overlap */}
            <div className="max-w-[1100px] mx-auto px-4 relative z-10 -mt-[60px]">
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-gray-100 flex flex-col md:flex-row items-center md:items-end gap-6">
                    <div className="w-[80px] h-[80px] bg-white rounded-full border-[3px] border-white shadow-md -mt-[40px] md:mt-0 flex-shrink-0 overflow-hidden">
                        {company.logo ? (
                            <img src={getFileUrl(company.logo, 'company')} alt={company.name} className="w-full h-full object-contain p-2" />
                        ) : (
                            <div className="w-full h-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
                                <Building className="w-10 h-10" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-[26px] font-bold text-[#1A202C] leading-tight mb-3">
                            {company.name}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6 text-[14px] text-[#64748B]">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-[#2563EB]" />
                                {company.address || 'Hà Nội, Việt Nam'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-[#2563EB]" />
                                100-500 nhân viên
                            </div>
                        </div>
                    </div>

                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_32%] gap-[32px] mt-[32px] pb-[60px]">

                    {/* Left Column */}
                    <div className="flex flex-col gap-[20px]">

                        {/* 1. Giới thiệu công ty */}
                        <section className="bg-white rounded-2xl p-[28px] shadow-sm border border-gray-100">
                            <h2 className="text-[18px] font-semibold text-[#1A202C] mb-6 border-l-4 border-[#2563EB] pl-[12px] flex items-center">
                                Giới thiệu công ty
                            </h2>
                            <div className="text-[15px] text-[#1A202C] leading-[1.7] whitespace-pre-wrap">
                                {company.description ?
                                    company.description.replace(/\\n|\\r\\n/g, '\n') :
                                    'Công ty hiện chưa cập nhật thông tin giới thiệu. Vui lòng quay lại sau.'
                                }
                            </div>
                        </section>

                        {/* 2. Công nghệ sử dụng */}
                        <section className="bg-white rounded-2xl p-[28px] shadow-sm border border-gray-100">
                            <h2 className="text-[18px] font-semibold text-[#1A202C] mb-6 border-l-4 border-[#2563EB] pl-[12px] flex items-center">
                                Công nghệ sử dụng
                            </h2>
                            {techStack.length > 0 ? (
                                <div className="flex flex-wrap gap-[10px]">
                                    {techStack.map((tech, idx) => (
                                        <div
                                            key={idx}
                                            className="px-[16px] py-[6px] bg-[#EFF6FF] text-[#2563EB] text-[13px] font-medium rounded-full flex items-center gap-2 border border-[#DBEAFE]"
                                        >
                                            <Cpu className="w-3.5 h-3.5" />
                                            {tech}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[14px] text-[#64748B] italic">Đang cập nhật...</p>
                            )}
                        </section>

                        {/* 3. Phúc lợi */}
                        <section className="bg-white rounded-2xl p-[28px] shadow-sm border border-gray-100">
                            <h2 className="text-[18px] font-semibold text-[#1A202C] mb-6 border-l-4 border-[#2563EB] pl-[12px] flex items-center">
                                Phúc lợi
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {defaultBenefits.map((benefit, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-4 p-[16px_20px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:border-[#2563EB] hover:bg-white transition-all duration-200 group"
                                    >
                                        <span className="text-[32px] group-hover:scale-110 transition-transform">{benefit.icon}</span>
                                        <span className="text-[14px] font-medium text-[#1A202C]">{benefit.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. Danh sách tuyển dụng */}
                        <section id="jobs-section" className="bg-white rounded-2xl p-[28px] shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-[18px] font-semibold text-[#1A202C] border-l-4 border-[#2563EB] pl-[12px]">
                                    Vị trí đang tuyển dụng ({jobsData?.meta?.total || 0})
                                </h2>
                            </div>

                            <div className="flex flex-col gap-[16px]">
                                {isLoadingJobs ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-2xl"></div>
                                    ))
                                ) : jobsData?.result?.length > 0 ? (
                                    jobsData.result.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-[#94A3B8]" />
                                        </div>
                                        <p className="text-[#64748B] font-medium">Hiện tại công ty chưa có vị trí nào đang tuyển.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Sticky */}
                    <aside className="relative">
                        <div className="sticky top-6 flex flex-col gap-6">
                            {/* Contact Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-[18px] font-semibold text-[#1A202C] mb-6 flex items-center gap-2">
                                    Thông tin liên hệ
                                </h3>

                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-[#EFF6FF] rounded-lg flex items-center justify-center flex-shrink-0 text-[#2563EB]">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Email liên hệ</p>
                                            <p className="text-[14px] text-[#1A202C] truncate font-medium" title={jobsData?.result?.[0]?.createdBy || company.createdBy}>
                                                {jobsData?.result?.[0]?.createdBy || company.createdBy || 'hr@company.com'}
                                            </p>
                                        </div>
                                    </div>

                                    {company.githubLink && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#EFF6FF] rounded-lg flex items-center justify-center flex-shrink-0 text-[#2563EB]">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Website chính thức</p>
                                                <a href={company.githubLink} target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#2563EB] truncate font-medium hover:underline block">
                                                    {company.githubLink.replace(/^https?:\/\/(www\.)?/, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {company.facebookLink && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#EFF6FF] rounded-lg flex items-center justify-center flex-shrink-0 text-[#2563EB]">
                                                <Facebook className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Facebook Fanpage</p>
                                                <a href={company.facebookLink} target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#2563EB] truncate font-medium hover:underline block">
                                                    {company.facebookLink.replace(/^https?:\/\/(www\.)?facebook\.com\//, '') || 'Facebook'}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Card (Optional but looks professional) */}
                            <div className="bg-gradient-to-br from-[#1B4F8A] to-[#0A2540] rounded-2xl p-6 text-white shadow-md overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <h4 className="text-[16px] font-bold mb-4 relative z-10">Tại sao chọn chúng tôi?</h4>
                                <ul className="space-y-3 relative z-10">
                                    <li className="flex items-start gap-2 text-[13px] text-white/90">
                                        <CheckCircle2 className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
                                        Môi trường làm việc năng động, sáng tạo.
                                    </li>
                                    <li className="flex items-start gap-2 text-[13px] text-white/90">
                                        <CheckCircle2 className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
                                        Lộ trình thăng tiến rõ ràng, minh bạch.
                                    </li>
                                    <li className="flex items-start gap-2 text-[13px] text-white/90">
                                        <CheckCircle2 className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
                                        Chế độ đãi ngộ hấp dẫn, cạnh tranh.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailPage;

