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
        return <Alert title="Lỗi" description={error} type="error" showIcon className="rounded-xl shadow-sm"/>;
    }

    return (
        <div className="animate-fade-in pb-8">
            <div className="mb-10 p-10 rounded-[2rem] bg-white border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-blue-50/30 skew-x-[-20deg] translate-x-16"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-3 text-brand-900 tracking-tight">HR Dashboard</h1>
                    <p className="text-gray-500 text-lg max-w-xl font-medium leading-relaxed">
                        Chào mừng bạn quay trở lại. Hãy quản lý các hoạt động tuyển dụng hiệu quả hơn.
                    </p>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group h-full border border-gray-50 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 font-bold mb-1 text-[10px] uppercase tracking-widest">Tin Tuyển Dụng</p>
                                <h3 className="text-3xl font-black text-brand-900 leading-none">{stats.totalJobs}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-900 flex items-center justify-center text-xl group-hover:bg-brand-900 group-hover:text-white transition-all duration-300">
                                <AuditOutlined />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Đang hoạt động</span>
                            <Link to="/hr/jobs" className="text-brand-900 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors">Chi tiết <RightOutlined className="text-[10px]" /></Link>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group h-full border border-gray-50 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 font-bold mb-1 text-[10px] uppercase tracking-widest">Tổng Hồ Sơ</p>
                                <h3 className="text-3xl font-black text-brand-900 leading-none">{stats.totalResumes}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-900 flex items-center justify-center text-xl group-hover:bg-brand-900 group-hover:text-white transition-all duration-300">
                                <FileTextOutlined />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Từ nguồn ứng tuyển</span>
                            <Link to="/hr/resumes" className="text-brand-900 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors">Chi tiết <RightOutlined className="text-[10px]" /></Link>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group h-full border border-gray-50 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 font-bold mb-1 text-[10px] uppercase tracking-widest">Hồ Sơ Chờ Duyệt</p>
                                <h3 className="text-3xl font-black text-brand-900 leading-none">{stats.pendingResumes}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-amber-500 flex items-center justify-center text-xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                <ClockCircleOutlined />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Cần xử lý</span>
                            <Link to="/hr/resumes?status=PENDING" className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 transition-colors">Chi tiết <RightOutlined className="text-[10px]" /></Link>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group h-full border border-gray-50 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 font-bold mb-1 text-[10px] uppercase tracking-widest">Hồ Sơ Đã Duyệt</p>
                                <h3 className="text-3xl font-black text-brand-900 leading-none">{stats.approvedResumes}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-emerald-500 flex items-center justify-center text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                <CheckCircleOutlined />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Ứng viên tiềm năng</span>
                            <Link to="/hr/resumes?status=APPROVED" className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors">Chi tiết <RightOutlined className="text-[10px]" /></Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} className="mt-8">
                <Col xs={24} md={10} lg={8}>
                    <Card variant="borderless" className="shadow-sm border border-blue-100 rounded-2xl h-full" title={<span className="text-lg font-bold text-gray-800">Tỉ lệ xử lý hồ sơ</span>}>
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="relative">
                                <Progress
                                    type="dashboard"
                                    percent={stats.totalResumes > 0 ? Math.round((stats.approvedResumes / stats.totalResumes) * 100) : 0}
                                    strokeColor="#3b82f6"
                                    size={180}
                                    railColor="#f8fafc"
                                />
                            </div>
                            <div className="mt-8 text-center w-full px-4">
                                <p className="text-gray-500 mb-4 font-medium text-sm">Hiệu quả duyệt hồ sơ ứng viên</p>
                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Đã duyệt</span>
                                        </div>
                                        <span className="text-xl font-black text-gray-800">{stats.approvedResumes}</span>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Đang chờ</span>
                                        </div>
                                        <span className="text-xl font-black text-gray-800">{stats.pendingResumes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} md={14} lg={16}>
                    <Card variant="borderless" className="shadow-sm border border-blue-100 rounded-2xl h-full" title={<span className="text-lg font-bold text-gray-800">Trạng thái hồ sơ</span>}>
                        <div className="space-y-6 py-2">
                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Chờ xử lý</span>
                                    <span className="text-lg font-black text-amber-600">{stats.pendingResumes}</span>
                                </div>
                                <Progress
                                    percent={stats.totalResumes > 0 ? Math.round((stats.pendingResumes / stats.totalResumes) * 100) : 0}
                                    strokeColor="#f59e0b"
                                    railColor="#fdf6e3"
                                    size={8}
                                    showInfo={false}
                                />
                            </div>

                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Đã duyệt</span>
                                    <span className="text-lg font-black text-emerald-600">{stats.approvedResumes}</span>
                                </div>
                                <Progress
                                    percent={stats.totalResumes > 0 ? Math.round((stats.approvedResumes / stats.totalResumes) * 100) : 0}
                                    strokeColor="#10b981"
                                    railColor="#ecfdf5"
                                    size={8}
                                    showInfo={false}
                                />
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200/50">
                                <h3 className="text-xs font-black text-gray-600 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    Tiêu điểm quản trị
                                </h3>
                                <ul className="text-sm text-gray-500 space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-900 flex-shrink-0"></div>
                                        <span>Quản lý <strong>Tin tuyển dụng</strong> của bạn ở menu bên trái.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-900 flex-shrink-0"></div>
                                        <span>Phản hồi <strong>Hồ sơ ứng viên</strong> kịp thời để tối ưu quy trình.</span>
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

