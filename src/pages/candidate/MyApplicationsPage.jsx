import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import Pagination from '../../components/Pagination';
import {
    FileText,
    Calendar,
    TrendingUp,
    MapPin,
    Building2,
    ExternalLink,
    Filter,
    Search
} from 'lucide-react';

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [pagination.current, pagination.pageSize, filterStatus]);

    const fetchStats = async () => {
        try {
            const res = await axiosClient.get(ENDPOINTS.RESUMES.MY_STATS);
            const data = res.data?.data ? res.data.data : res.data;
            if (data) setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const queryParams = {
                page: pagination.current - 1,
                size: pagination.pageSize,
                sort: 'createdAt,desc'
            };

            if (filterStatus !== 'ALL') {
                queryParams.filter = `status:'${filterStatus}'`;
            }

            // Note: Search term implementation depends on backend support. 
            // For now, client-side search is removed because it conflicts with server-side pagination.
            // If search is needed, backend must support searching resumes by job name (requires join).

            const response = await axiosClient.get(ENDPOINTS.RESUMES.MY_HISTORY, {
                params: queryParams
            });

            const data = response.data?.data ? response.data.data : response.data;

            setApplications(data?.result || []);
            setPagination(prev => ({
                ...prev,
                total: data?.meta?.total || 0
            }));
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { label: 'Đã nộp', className: 'bg-blue-50 text-brand-900 border-blue-100' },
            REVIEWING: { label: 'Đang xem xét', className: 'bg-blue-50 text-blue-700 border-blue-100' },
            APPROVED: { label: 'Phỏng vấn', className: 'bg-green-50 text-green-700 border-green-100' },
            REJECTED: { label: 'Chưa phù hợp', className: 'bg-blue-50 text-gray-400 border-blue-100' }
        };

        const config = statusConfig[status] || statusConfig.PENDING;
        return (
            <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Client-side search (optional, if list is small) or remove. 
    // Since we use server-side pagination, client-side filtering is weird. 
    // For now, let's keep search simple or rely on the API result. 
    // The previous code filtered 'applications' which was only current page.
    const filteredApplications = applications;

    const statusFilters = [
        { value: 'ALL', label: 'Tất cả', count: stats.total },
        { value: 'PENDING', label: 'Chờ xử lý', count: stats.pending },
        { value: 'REVIEWING', label: 'Đang xem xét', count: stats.reviewing },
        { value: 'APPROVED', label: 'Đã chấp nhận', count: stats.approved },
        { value: 'REJECTED', label: 'Bị từ chối', count: stats.rejected },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-blue-100 p-10">
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-brand-900 tracking-tight mb-2">Đơn ứng tuyển</h1>
                        <p className="text-gray-500 font-medium">Theo dõi các công việc bạn đã gửi hồ sơ.</p>
                    </div>
                    <div className="bg-blue-50 px-6 py-2 rounded-xl border border-blue-100">
                        <span className="text-sm font-black text-gray-800">{pagination.total}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 ml-2 tracking-widest">tổng đơn nộp</span>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 font-bold" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm vị trí công việc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl focus:outline-none focus:border-brand-900/30 focus:bg-white transition-all text-gray-700 font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Status Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
                <div className="flex flex-wrap gap-2">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            className={`px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 ${filterStatus === filter.value
                                ? 'bg-brand-900 text-white shadow-md'
                                : 'bg-blue-50 text-gray-500 hover:bg-blue-100'
                                }`}
                        >
                            {filter.label} <span className="opacity-50 ml-1">({filter.count})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-4">Không tìm thấy đơn ứng tuyển nào</p>
                        <Link
                            to="/jobs"
                            className="inline-block px-10 py-4 bg-brand-900 text-white rounded-2xl font-bold hover:bg-brand-900 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                        >
                            Khám phá việc làm
                        </Link>
                    </div>
                ) : (
                    filteredApplications.map((application) => (
                        <div
                            key={application.id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                                            <h2 className="text-2xl font-black text-gray-800 group-hover:text-brand-900 transition-colors m-0">
                                                {application.job?.name || 'N/A'}
                                            </h2>
                                            <div>{getStatusBadge(application.status)}</div>
                                        </div>

                                        <div className="flex flex-wrap gap-6 text-gray-500 mb-6 font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-gray-400 font-bold">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <span className="text-gray-700 font-bold">{application.job?.company?.name || 'N/A'}</span>
                                            </div>
                                            {application.job?.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-400" />
                                                    <span>{application.job.location}</span>
                                                </div>
                                            )}
                                            {application.job?.salary && (
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                                    <span className="font-bold text-green-600">{application.job.salary}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Nộp ngày: {formatDate(application.createdAt)}</span>
                                        </div>

                                        {application.note && (
                                            <div className="mt-6 p-5 bg-blue-50 rounded-2xl border-l-4 border-blue-200">
                                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">Phản hồi từ HR:</p>
                                                <p className="text-sm text-gray-600 leading-relaxed italic">"{application.note}"</p>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        to={`/jobs/${application.job?.id}`}
                                        className="ml-4 w-12 h-12 flex items-center justify-center bg-blue-50 text-gray-400 rounded-2xl hover:bg-blue-50 hover:text-brand-900 transition-all border border-blue-100"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </Link>
                                </div>

                                {/* Application Timeline */}
                                <ApplicationTimeline status={application.status} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredApplications.length > 0 && (
                <div className="flex justify-center">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
                    />
                </div>
            )}
        </div>
    );
};

// Timeline Component
const ApplicationTimeline = ({ status }) => {
    const steps = [
        { key: 'PENDING', label: 'Nộp hồ sơ', description: 'Đơn đã được gửi' },
        { key: 'REVIEWING', label: 'Đang xem xét', description: 'HR đang xem xét' },
        { key: 'APPROVED', label: 'Chấp nhận', description: 'Chúc mừng!' },
    ];

    const getStepStatus = (stepKey) => {
        const statusOrder = ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'];
        const currentIndex = statusOrder.indexOf(status);
        const stepIndex = statusOrder.indexOf(stepKey);

        if (status === 'REJECTED') {
            return stepKey === 'PENDING' ? 'completed' : 'rejected';
        }

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Tiến trình ứng tuyển</h3>
            <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(step.key);

                    return (
                        <div key={step.key} className="flex-1 relative">
                            <div className="flex flex-col items-center">
                                {/* Circle */}
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 ${stepStatus === 'completed'
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : stepStatus === 'current'
                                            ? 'bg-brand-900 text-white shadow-lg'
                                            : stepStatus === 'rejected'
                                                ? 'bg-gray-200 text-gray-400'
                                                : 'bg-blue-50 text-gray-200 border border-blue-100'
                                        }`}
                                >
                                    {stepStatus === 'completed' ? '✓' : index + 1}
                                </div>

                                {/* Label */}
                                <div className="mt-3 text-center">
                                    <p className={`text-sm font-semibold ${stepStatus === 'current' ? 'text-brand-900' :
                                        stepStatus === 'completed' ? 'text-green-600' :
                                            stepStatus === 'rejected' ? 'text-red-600' :
                                                'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-300 ${getStepStatus(steps[index + 1].key) === 'completed' || getStepStatus(steps[index + 1].key) === 'current'
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                        }`}
                                    style={{ transform: 'translateY(-50%)' }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Rejected Status */}
            {status === 'REJECTED' && (
                <div className="mt-8 p-5 bg-blue-50 border-l-4 border-gray-300 rounded-2xl">
                    <p className="text-sm font-bold text-gray-600">📝 Trạng thái: Chưa phù hợp</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">Cảm ơn bạn đã quan tâm! Hãy tiếp tục duy trì đam mê và khám phá thêm nhiều cơ hội hấp dẫn khác trên JobHunter nhé.</p>
                </div>
            )}
        </div>
    );
};

export default MyApplicationsPage;
