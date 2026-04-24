import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { MapPin, Globe, Users, ArrowLeft, Building } from 'lucide-react';
import JobCard from '../../components/JobCard';

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
                size: 10,
                filter: `company.id:${id}`
            };
            const res = await axiosClient.get(ENDPOINTS.JOBS.ALL, { params });
            return res.data.data ? res.data.data : res.data;
        },
        enabled: !!id // Only run if ID exists
    });

    if (isLoadingCompany) return <div className="p-12 text-center">Đang tải thông tin công ty...</div>;
    if (!company) return <div className="p-12 text-center text-red-500">Không tìm thấy công ty.</div>;

    return (
        <div>
            {/* Back Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center text-gray-500 hover:text-brand-900 transition-colors font-medium"
                >
                    <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-blue-300 group-hover:shadow-md mr-3 transition-all">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    Quay lại
                </button>
            </div>

            {/* Cover Image */}
            <div className="h-64 bg-brand-900 rounded-b-3xl -mx-4 sm:-mx-6 lg:-mx-8 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -mr-48 -mt-48"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-24 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg border p-8 flex flex-col md:flex-row items-start gap-8">
                    <div className="w-32 h-32 bg-white rounded-xl shadow p-2 flex items-center justify-center -mt-16 md:mt-0 overflow-hidden">
                        {/* Logo */}
                        {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                        ) : (
                            <Building className="w-16 h-16 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-zinc-900 mb-2">{company.name}</h1>
                        <div className="flex flex-wrap gap-6 text-gray-600">
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                {company.address}
                            </div>
                            <div className="flex items-center">
                                <Globe className="w-4 h-4 mr-2 text-brand-900" />
                                <a href="#" className="hover:underline">Website</a>
                            </div>
                            <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                100-500 nhân viên
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {/* Left: Description */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 border-l-4 border-brand-900 pl-4">Giới thiệu công ty</h2>
                            <div className="prose text-zinc-700 whitespace-pre-wrap">
                                {company.description ? company.description.replace(/\\n|\\r\\n/g, '\n') : 'Chưa có thông tin giới thiệu.'}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border p-8">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 border-l-4 border-brand-900 pl-4">Tuyển dụng ({jobsData?.meta?.total || 0})</h2>

                            <div className="space-y-4">
                                {isLoadingJobs ? (
                                    <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
                                ) : jobsData?.result?.length > 0 ? (
                                    jobsData.result.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))
                                ) : (
                                    <p className="text-gray-500">Hiện tại công ty chưa có vị trí nào đang tuyển.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact or Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Vui lòng liên hệ qua email hoặc số điện thoại bên dưới.
                            </p>
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold">Email:</p>
                                <p className="text-brand-900 truncate" title={jobsData?.result?.[0]?.createdBy || company.createdBy}>
                                    {jobsData?.result?.[0]?.createdBy || company.createdBy || 'hr@company.com'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailPage;
