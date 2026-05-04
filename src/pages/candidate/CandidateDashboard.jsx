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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-900 tracking-tight uppercase m-0">Tổng quan cá nhân</h1>
                    <p className="text-gray-500 mt-1">Chào mừng bạn trở lại! Dưới đây là thống kê tình trạng ứng tuyển của bạn.</p>
                </div>
                <Link to="/jobs" className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20">
                    Tìm việc mới
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all hover:-translate-y-1">
                            <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                <Icon className={`w-6 h-6 text-primary`} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{card.title}</span>
                            <span className="text-2xl font-black text-gray-900 leading-none">{card.value}</span>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-brand-900 m-0">Lịch sử ứng tuyển gần đây</h2>
                        <p className="text-sm text-gray-400 mt-1">Bạn có {stats.total} đơn ứng tuyển đang được theo dõi.</p>
                    </div>
                    <Link to="/candidate/applications" className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 group">
                        Xem tất cả lịch sử <TrendingUp className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Vị trí công việc</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày ứng tuyển</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentApplications.length > 0 ? (
                                recentApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{app.job?.name || 'Công việc đã xóa'}</span>
                                                <span className="text-xs text-gray-500 font-medium">{app.job?.company?.name || 'Thông tin công ty'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(app.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getStatusBadge(app.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-8 py-16 text-center text-gray-400 italic">
                                        Bạn chưa ứng tuyển công việc nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;
