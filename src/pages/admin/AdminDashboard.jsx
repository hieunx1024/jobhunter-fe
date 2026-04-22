
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

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{value !== undefined ? value : '...'}</p>
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
        </div>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const chartData = [
        { name: 'Tổng Users', value: statsData?.totalUsers || 0 },
        { name: 'Công Ty', value: statsData?.totalCompanies || 0 },
        { name: 'Việc Làm', value: statsData?.totalJobs || 0 },
        { name: 'Hồ Sơ', value: statsData?.totalResumes || 0 },
        { name: 'User Mua Gói', value: statsData?.totalSubscribedUsers || 0 },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={Users}
                    label="Tổng Users"
                    value={statsData?.totalUsers}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Building}
                    label="Tổng Công Ty"
                    value={statsData?.totalCompanies}
                    color="bg-orange-500"
                />
                <StatCard
                    icon={Briefcase}
                    label="Tổng Việc Làm"
                    value={statsData?.totalJobs}
                    color="bg-green-500"
                />
                <StatCard
                    icon={FileText}
                    label="Hồ Sơ Ứng Tuyển"
                    value={statsData?.totalResumes}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={UserCheck}
                    label="User Đã Mua Gói"
                    value={statsData?.totalSubscribedUsers}
                    color="bg-indigo-500"
                />
                <StatCard
                    icon={DollarSign}
                    label="Tổng Doanh Thu"
                    value={statsData?.totalRevenue !== undefined ? formatCurrency(statsData.totalRevenue) : '...'}
                    color="bg-red-500"
                />
            </div>

            {/* Component Biểu Đồ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Biểu đồ thống kê tổng quan</h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height={320} minHeight={320} minWidth={0}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 14 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 14 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#4F46E5"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={60}
                                name="Số lượng"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
