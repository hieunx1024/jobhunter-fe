import { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Alert, Progress } from 'antd';
import { FileTextOutlined, AuditOutlined, CheckCircleOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons';
import axios from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { Link } from 'react-router-dom';

const HRDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalResumes: 0,
        pendingResumes: 0,
        approvedResumes: 0,
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch jobs
            const jobsResponse = await axios.get(ENDPOINTS.JOBS.BASE, {
                params: { current: 1, pageSize: 1 }
            });

            // Fetch resumes
            const resumesResponse = await axios.get(ENDPOINTS.RESUMES.BASE, {
                params: { current: 1, pageSize: 100 }
            });

            const resumes = resumesResponse.data?.data?.result || [];
            const pendingCount = resumes.filter(r => r.status === 'PENDING' || r.status === 'REVIEWING').length;
            const approvedCount = resumes.filter(r => r.status === 'APPROVED').length;

            setStats({
                totalJobs: jobsResponse.data?.data?.meta?.total || 0,
                totalResumes: resumesResponse.data?.data?.meta?.total || 0,
                pendingResumes: pendingCount,
                approvedResumes: approvedCount,
            });
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Không thể tải thống kê. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon className="rounded-xl shadow-sm"/>;
    }

    return (
        <div className="animate-fade-in pb-8">
            <div className="mb-8 p-8 rounded-[2rem] bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#312e81] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-white tracking-tight">HR Dashboard</h1>
                        <p className="text-indigo-100 text-base md:text-lg max-w-xl">
                            Chào mừng trở lại! Xem tổng quan hiệu suất tuyển dụng và quản lý hồ sơ ứng viên của bạn hôm nay.
                        </p>
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-lg transition-all duration-300 rounded-[1.5rem] overflow-hidden group h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Tin Tuyển Dụng</p>
                                <h3 className="text-4xl font-bold text-gray-800">{stats.totalJobs}</h3>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-indigo-500/30 group-hover:scale-110">
                                <AuditOutlined />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                            <span className="text-gray-400">Đang hoạt động</span>
                            <Link to="/hr/jobs" className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors">Xem chi tiết <RightOutlined className="text-[10px]" /></Link>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-lg transition-all duration-300 rounded-[1.5rem] overflow-hidden group h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Tổng Hồ Sơ</p>
                                <h3 className="text-4xl font-bold text-gray-800">{stats.totalResumes}</h3>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-blue-500/30 group-hover:scale-110">
                                <FileTextOutlined />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                            <span className="text-gray-400">Tất cả CV nhận được</span>
                            <Link to="/hr/resumes" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors">Xem chi tiết <RightOutlined className="text-[10px]" /></Link>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-lg transition-all duration-300 rounded-[1.5rem] overflow-hidden group h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Hồ Sơ Chờ Duyệt</p>
                                <h3 className="text-4xl font-bold text-gray-800">{stats.pendingResumes}</h3>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-amber-500/30 group-hover:scale-110">
                                <ClockCircleOutlined />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                            <span className="text-gray-400">Cần xử lý</span>
                            <Link to="/hr/resumes?status=PENDING" className="text-amber-500 hover:text-amber-600 font-semibold flex items-center gap-1 transition-colors">Xem chi tiết <RightOutlined className="text-[10px]" /></Link>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-lg transition-all duration-300 rounded-[1.5rem] overflow-hidden group h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Hồ Sơ Đã Duyệt</p>
                                <h3 className="text-4xl font-bold text-gray-800">{stats.approvedResumes}</h3>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-emerald-500/30 group-hover:scale-110">
                                <CheckCircleOutlined />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                            <span className="text-gray-400">Ứng viên tiềm năng</span>
                            <Link to="/hr/resumes?status=APPROVED" className="text-emerald-500 hover:text-emerald-600 font-semibold flex items-center gap-1 transition-colors">Xem chi tiết <RightOutlined className="text-[10px]" /></Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} className="mt-8">
                <Col xs={24} md={10} lg={8}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-[1.5rem] h-full" title={<span className="text-lg font-bold text-gray-800">Tỉ lệ xử lý hồ sơ</span>}>
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="relative">
                                <Progress
                                    type="dashboard"
                                    percent={stats.totalResumes > 0 ? Math.round((stats.approvedResumes / stats.totalResumes) * 100) : 0}
                                    strokeColor={{
                                        '0%': '#6366f1',
                                        '100%': '#10b981',
                                    }}
                                    width={220}
                                    strokeWidth={8}
                                    trailColor="#f1f5f9"
                                />
                            </div>
                            <div className="mt-8 text-center w-full px-4">
                                <p className="text-gray-500 mb-4 font-medium">Tỉ lệ hồ sơ đã được duyệt</p>
                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Đã duyệt</span>
                                        </div>
                                        <span className="text-xl font-bold text-gray-800">{stats.approvedResumes}</span>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Chờ xử lý</span>
                                        </div>
                                        <span className="text-xl font-bold text-gray-800">{stats.pendingResumes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} md={14} lg={16}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-[1.5rem] h-full" title={<span className="text-lg font-bold text-gray-800">Tổng quan trạng thái</span>}>
                        <div className="space-y-8 py-2">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-amber-100 hover:shadow-sm transition-all">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-1">Hồ sơ chờ xử lý</h4>
                                        <p className="text-xs text-gray-500">Cần xem xét từ nhà tuyển dụng</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-amber-500">{stats.pendingResumes}</span>
                                        <span className="text-gray-400 text-sm"> / {stats.totalResumes}</span>
                                    </div>
                                </div>
                                <Progress
                                    percent={stats.totalResumes > 0 ? Math.round((stats.pendingResumes / stats.totalResumes) * 100) : 0}
                                    status="active"
                                    strokeColor="#f59e0b"
                                    trailColor="#fef3c7"
                                    strokeWidth={10}
                                    showInfo={false}
                                />
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:shadow-sm transition-all">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-1">Hồ sơ đã duyệt</h4>
                                        <p className="text-xs text-gray-500">Ứng viên đáp ứng yêu cầu</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-emerald-500">{stats.approvedResumes}</span>
                                        <span className="text-gray-400 text-sm"> / {stats.totalResumes}</span>
                                    </div>
                                </div>
                                <Progress
                                    percent={stats.totalResumes > 0 ? Math.round((stats.approvedResumes / stats.totalResumes) * 100) : 0}
                                    status="success"
                                    strokeColor="#10b981"
                                    trailColor="#d1fae5"
                                    strokeWidth={10}
                                    showInfo={false}
                                />
                            </div>

                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                                <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>
                                    Hướng dẫn nhanh
                                </h3>
                                <ul className="text-sm text-indigo-800/80 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-500 text-[10px]">1</div>
                                        <span>Quản lý <strong>Tin tuyển dụng</strong> của bạn ở menu bên trái.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-500 text-[10px]">2</div>
                                        <span>Xem xét và phản hồi <strong>Hồ sơ ứng viên</strong> kịp thời để không bỏ lỡ nhân tài.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-500 text-[10px]">3</div>
                                        <span>Cập nhật <strong>Thông tin Công ty</strong> để tăng uy tín với ứng viên.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default HRDashboard;

