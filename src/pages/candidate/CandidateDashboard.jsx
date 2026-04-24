import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import {
    Briefcase,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    Eye,
    Calendar
} from 'lucide-react';

const CandidateDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [historyRes, statsRes] = await Promise.all([
                axiosClient.get(ENDPOINTS.RESUMES.MY_HISTORY, {
                    params: { page: 0, size: 5 }
                }),
                axiosClient.get(ENDPOINTS.RESUMES.MY_STATS)
            ]);

            // Robust data extraction (handle wrapped vs direct response)
            const historyData = historyRes.data?.data ? historyRes.data.data : historyRes.data;
            const applications = historyData?.result || [];

            setRecentApplications(applications);

            // Stats from backend
            const statsData = statsRes.data?.data ? statsRes.data.data : statsRes.data;
            if (statsData) {
                setStats(statsData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Tổng số đơn',
            value: stats.total,
            icon: FileText,
            accentColor: 'blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-gray-600'
        },
        {
            title: 'Chờ xử lý',
            value: stats.pending,
            icon: Clock,
            accentColor: 'amber-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-gray-600'
        },
        {
            title: 'Đang xem xét',
            value: stats.reviewing,
            icon: Eye,
            accentColor: 'blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-gray-600'
        },
        {
            title: 'Đã chấp nhận',
            value: stats.approved,
            icon: CheckCircle,
            accentColor: 'emerald-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-gray-600'
        },
        {
            title: 'Bị từ chối',
            value: stats.rejected,
            icon: XCircle,
            accentColor: 'gray-300',
            bgColor: 'bg-blue-50',
            textColor: 'text-gray-600'
        }
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
            REVIEWING: { label: 'Đang xem xét', className: 'bg-purple-100 text-purple-700 border-purple-200' },
            APPROVED: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-700 border-green-200' },
            REJECTED: { label: 'Bị từ chối', className: 'bg-red-100 text-red-700 border-red-200' }
        };

        const config = statusConfig[status] || statusConfig.PENDING;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Xin chào, {user?.name}! 👋</h1>
                <p className="text-blue-100">Chào mừng bạn quay trở lại với JobHunter. Hãy theo dõi tiến trình ứng tuyển của bạn.</p>
            </div> */}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300 overflow-hidden group"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${stat.bgColor} border border-blue-100`}>
                                        <Icon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-3xl font-black text-brand-900 leading-none">{stat.value}</p>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-brand-900 tracking-tight">Đơn ứng tuyển gần đây</h2>
                        <Link
                            to="/candidate/applications"
                            className="text-brand-900 hover:text-blue-700 transition-all font-bold text-sm"
                        >
                            Xem tất cả hồ sơ
                        </Link>
                    </div>
                </div>

                <div className="p-8">
                    {recentApplications.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Bạn chưa ứng tuyển công việc nào</p>
                            <Link
                                to="/jobs"
                                className="inline-block mt-6 px-10 py-4 bg-brand-900 text-white rounded-2xl font-bold hover:bg-brand-900 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                            >
                                Khám phá việc làm
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentApplications.map((application) => (
                                <div
                                    key={application.id}
                                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-brand-900 transition-colors">
                                                    {application.job?.name || 'N/A'}
                                                </h3>
                                                {getStatusBadge(application.status)}
                                            </div>
                                            <p className="text-gray-600 mb-3">
                                                <span className="font-semibold">{application.job?.company?.name || 'N/A'}</span>
                                                {application.job?.location && ` • ${application.job.location}`}
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Nộp ngày: {formatDate(application.createdAt)}</span>
                                                </div>
                                                {application.job?.salary && (
                                                    <div className="flex items-center space-x-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>{application.job.salary}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link
                    to="/jobs"
                    className="bg-white border border-blue-100 rounded-[2rem] p-10 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
                    <Briefcase className="w-12 h-12 mb-6 text-brand-900 relative z-10" />
                    <h3 className="text-2xl font-black mb-3 text-brand-900 relative z-10">Tìm việc làm mới</h3>
                    <p className="text-gray-500 font-medium relative z-10">Khám phá hàng nghìn cơ hội việc làm phù hợp với năng lực của bạn.</p>
                </Link>

                <Link
                    to="/candidate/profile"
                    className="bg-white border border-blue-100 rounded-[2rem] p-10 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
                    <FileText className="w-12 h-12 mb-6 text-gray-400 relative z-10" />
                    <h3 className="text-2xl font-black mb-3 text-brand-900 relative z-10">Cập nhật hồ sơ</h3>
                    <p className="text-gray-500 font-medium relative z-10">Hoàn thiện thông tin cá nhân và quản lý danh sách CV của bạn.</p>
                </Link>
            </div>
        </div>
    );
};

export default CandidateDashboard;
