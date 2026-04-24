
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { Users, Building, Briefcase, FileText, UserCheck, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const { user } = useAuth();

    // Fetch stats from backend
    const { data: statsData } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => axiosClient.get(`${ENDPOINTS.DASHBOARD.ADMIN}`).then(res => {
            console.log("Admin Dashboard API Response:", res.data);
            return res.data?.data || res.data;
        }).catch(err => {
            console.error("Admin Dashboard API Error:", err);
            throw err;
        })
    });

    const StatCard = ({ icon: Icon, label, value, color, iconColor }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
            <div className="overflow-hidden">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-brand-900 mt-1 truncate">{value !== undefined ? value : '...'}</p>
            </div>
        </div>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const chartData = [
        { name: 'Người dùng', value: statsData?.totalUsers || 0 },
        { name: 'Công ty', value: statsData?.totalCompanies || 0 },
        { name: 'Việc làm', value: statsData?.totalJobs || 0 },
        { name: 'Ứng tuyển', value: statsData?.totalResumes || 0 },
        { name: 'Đã mua gói', value: statsData?.totalSubscribedUsers || 0 },
    ];

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-3xl font-bold text-brand-900 tracking-tight m-0 uppercase">Tổng quan hệ thống</h1>
                <p className="text-gray-500 mt-1">Theo dõi các chỉ số vận hành chính của nền tảng JobHunter.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <StatCard
                    icon={Users}
                    label="Tổng người dùng"
                    value={statsData?.totalUsers}
                    color="bg-blue-50"
                    iconColor="text-brand-900"
                />
                <StatCard
                    icon={Building}
                    label="Hệ thống công ty"
                    value={statsData?.totalCompanies}
                    color="bg-blue-50"
                    iconColor="text-gray-600"
                />
                <StatCard
                    icon={Briefcase}
                    label="Tin tuyển dụng"
                    value={statsData?.totalJobs}
                    color="bg-blue-50"
                    iconColor="text-green-600"
                />
                <StatCard
                    icon={FileText}
                    label="Hồ sơ ứng tuyển"
                    value={statsData?.totalResumes}
                    color="bg-blue-50"
                    iconColor="text-yellow-600"
                />
                <StatCard
                    icon={UserCheck}
                    label="User trả phí"
                    value={statsData?.totalSubscribedUsers}
                    color="bg-brand-900/5"
                    iconColor="text-brand-900"
                />
                <StatCard
                    icon={DollarSign}
                    label="Doanh thu tổng"
                    value={statsData?.totalRevenue !== undefined ? formatCurrency(statsData.totalRevenue) : '...'}
                    color="bg-blue-50"
                    iconColor="text-red-600"
                />
            </div>

            {/* Component Biểu Đồ */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 mt-8">
                <header className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-bold text-brand-900 m-0">Biểu đồ tăng trưởng</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-900/80"></div>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Số lượng</span>
                        </div>
                    </div>
                </header>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#F8FAFC' }}
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    padding: '12px 16px'
                                }}
                                itemStyle={{ fontWeight: 700, color: '#2563eb' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#2563eb"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={48}
                                name="Giá trị"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
