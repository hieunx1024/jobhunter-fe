import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { Users, Building, Briefcase, FileText, UserCheck, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('time');

    const { data: statsData } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => axiosClient.get(`${ENDPOINTS.DASHBOARD.ADMIN}`).then(res => {
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
        return `${(amount || 0).toLocaleString('vi-VN')} VNĐ`;
    };

    const chartData = [
        { name: 'Người dùng', value: statsData?.totalUsers || 0 },
        { name: 'Công ty', value: statsData?.totalCompanies || 0 },
        { name: 'Việc làm', value: statsData?.totalJobs || 0 },
        { name: 'Ứng tuyển', value: statsData?.totalResumes || 0 },
        { name: 'Đã mua gói', value: statsData?.totalSubscribedUsers || 0 },
    ];

    const CHART_COLORS = ['#3b82f6', '#10b981', '#db2777', '#d97706', '#8b5cf6'];

    const timeSeriesData = [
        { name: 'T1', users: 5, companies: 2, jobs: 9, resumes: 7, sub: 0 },
        { name: 'T2', users: 6, companies: 3, jobs: 10, resumes: 8, sub: 0 },
        { name: 'T3', users: 7, companies: 3, jobs: 12, resumes: 10, sub: 1 },
        { name: 'T4', users: 8, companies: 4, jobs: 13, resumes: 11, sub: 1 },
        { name: 'T5', users: 9, companies: 4, jobs: 13, resumes: 12, sub: 1 },
        { name: 'T6', users: 11, companies: 5, jobs: 14, resumes: 13, sub: 2 },
    ];

    const pieData = [
        { name: 'Ứng viên', value: statsData?.totalCandidates || 0 },
        { name: 'Nhà tuyển dụng', value: statsData?.totalHRs || 0 },
    ];
    
    const PIE_COLORS = ['#0A65CC', '#10B981']; // primary and emerald

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 lg:col-span-2">
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-xl font-bold text-brand-900 m-0">Biểu đồ tăng trưởng</h2>
                        <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100">
                            <button 
                                onClick={() => setViewMode('category')}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'category' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Theo danh mục
                            </button>
                            <button 
                                onClick={() => setViewMode('time')}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'time' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Theo thời gian
                            </button>
                        </div>
                    </header>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#3b82f6]"></div><span className="text-xs font-medium text-gray-600">Người dùng</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#10b981]"></div><span className="text-xs font-medium text-gray-600">Công ty</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#db2777]"></div><span className="text-xs font-medium text-gray-600">Việc làm</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#d97706]"></div><span className="text-xs font-medium text-gray-600">Ứng tuyển</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#8b5cf6]"></div><span className="text-xs font-medium text-gray-600">Đã mua gói</span></div>
                    </div>

                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {viewMode === 'category' ? (
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} allowDecimals={false} />
                                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', color: '#1E293B', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <LineChart data={timeSeriesData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', color: '#1E293B', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="users" name="Người dùng" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                                    <Line type="monotone" dataKey="companies" name="Công ty" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#10b981' }} />
                                    <Line type="monotone" dataKey="jobs" name="Việc làm" stroke="#db2777" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4, fill: '#db2777' }} />
                                    <Line type="monotone" dataKey="resumes" name="Ứng tuyển" stroke="#d97706" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#d97706' }} />
                                    <Line type="monotone" dataKey="sub" name="Đã mua gói" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4, fill: '#8b5cf6' }} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
                    <header className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-brand-900 m-0">Tỉ lệ người dùng</h2>
                    </header>
                    <div className="h-64 w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ fontWeight: 700 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-2xl font-black text-gray-800 m-0">
                                {(statsData?.totalCandidates || 0) + (statsData?.totalHRs || 0)}
                            </p>
                            <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">Users</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-6">
                        {pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                                    <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Paid Users Table */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 mt-8">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-brand-900 m-0">Danh sách User trả phí gần đây</h2>
                        <p className="text-sm text-gray-500 mt-1">Các giao dịch đăng ký gói dịch vụ thành công mới nhất.</p>
                    </div>
                </header>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-gray-400 text-[11px] uppercase tracking-[0.15em] font-black">
                                <th className="px-4 py-3">Người dùng</th>
                                <th className="px-4 py-3">Gói dịch vụ</th>
                                <th className="px-4 py-3">Số tiền</th>
                                <th className="px-4 py-3">Ngày đăng ký</th>
                                <th className="px-4 py-3 text-right">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statsData?.recentPayments?.length > 0 ? (
                                statsData.recentPayments.map((payment, index) => (
                                    <tr key={index} className="group hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 bg-white border-y border-l border-gray-100 first:rounded-l-xl group-hover:border-blue-100 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{payment.userName}</span>
                                                <span className="text-xs text-gray-400 font-medium">{payment.userEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 bg-white border-y border-gray-100 group-hover:border-blue-100 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${payment.planName === 'Professional' ? 'bg-indigo-500' : payment.planName === 'Enterprise' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                                                <span className="text-sm font-semibold text-gray-700">{payment.planName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 bg-white border-y border-gray-100 group-hover:border-blue-100 transition-colors">
                                            <span className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                                        </td>
                                        <td className="px-4 py-4 bg-white border-y border-gray-100 group-hover:border-blue-100 transition-colors">
                                            <span className="text-sm font-medium text-gray-500">
                                                {new Date(payment.paymentDate).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 bg-white border-y border-r border-gray-100 last:rounded-r-xl text-right group-hover:border-blue-100 transition-colors">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                Thành công
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center text-gray-400 font-medium italic bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                        Chưa có giao dịch trả phí nào được ghi nhận.
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

export default AdminDashboard;
