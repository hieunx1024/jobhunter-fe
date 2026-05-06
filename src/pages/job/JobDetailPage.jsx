import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { MapPin, Coins, Calendar, Clock, Building2, ArrowLeft, CheckCircle, Share2, Briefcase, FileText, Send, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dropdown, Menu } from 'antd';
import { FacebookOutlined, LinkedinOutlined, MailOutlined, CopyOutlined } from '@ant-design/icons';
import { getFileUrl } from '../../utils/fileUtils';

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [cvFile, setCvFile] = useState(null);
    const [selectedCvId, setSelectedCvId] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);

    const queryClient = useQueryClient();

    const [savedJobs, setSavedJobs] = useState(() => {
        const saved = localStorage.getItem('savedJobs');
        return saved ? JSON.parse(saved) : [];
    });

    const { data: profile } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!isAuthenticated) return null;
            const res = await axiosClient.get(ENDPOINTS.PROFILE.BASE);
            return res.data.data ? res.data.data : res.data;
        },
        enabled: !!user?.id
    });

    const { data: job, isLoading, isError } = useQuery({
        queryKey: ['job', id],
        queryFn: async () => {
            const res = await axiosClient.get(ENDPOINTS.JOBS.GET_ONE(id));
            return res.data.data ? res.data.data : res.data;
        }
    });

    const { data: myResumes } = useQuery({
        queryKey: ['my-history', user?.id],
        queryFn: async () => {
            if (!isAuthenticated) return [];
            const role = user?.role?.name || user?.role || '';
            if (role !== 'CANDIDATE' && role !== 'ROLE_CANDIDATE') return [];
            const res = await axiosClient.get(ENDPOINTS.RESUMES.MY_HISTORY);
            return res.data?.data?.result || res.data?.result || res.data?.data || res.data || [];
        },
        enabled: isAuthenticated
    });

    const isApplied = myResumes?.some(resume => (resume.job?.id === Number(id)) || (resume.jobId === Number(id)) || (resume.job?.id === id) || (resume.jobId === id));

    const isSaved = savedJobs.some(sj => sj.id === job?.id || sj.id === Number(id));

    const toggleSaveJob = () => {
        if (!isAuthenticated) {
            toast.info("Vui lòng đăng nhập để lưu việc làm");
            navigate('/login', { state: { from: `/jobs/${id}` } });
            return;
        }

        if (!job) return;

        let updatedSavedJobs;
        if (isSaved) {
            updatedSavedJobs = savedJobs.filter(sj => sj.id !== job.id);
            toast.success("Đã bỏ lưu việc làm");
        } else {
            updatedSavedJobs = [...savedJobs, {
                ...job,
                savedAt: new Date().toISOString()
            }];
            toast.success("Đã lưu việc làm thành công!");
        }

        setSavedJobs(updatedSavedJobs);
        localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!selectedCvId && !cvFile) {
            toast.error('Vui lòng chọn CV để tải lên hoặc chọn từ thư viện của bạn.');
            return;
        }

        setIsApplying(true);
        try {
            const formData = new FormData();
            formData.append('jobId', job.id);
            if (selectedCvId) {
                formData.append('userCvId', selectedCvId);
            } else if (cvFile) {
                formData.append('file', cvFile);
            }

            await axiosClient.post(`${ENDPOINTS.RESUMES.BASE}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.');
            setShowApplyModal(false);
            setCvFile(null);
            setSelectedCvId('');
            queryClient.invalidateQueries({ queryKey: ['my-history'] });
        } catch (error) {
            console.error("Apply error:", error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi ứng tuyển. Vui lòng thử lại.');
        } finally {
            setIsApplying(false);
        }
    };

    const formatText = (text) => {
        if (!text) return null;
        // Strip out literal '\n' and also handle rogue '\' characters often left by improper escaping
        let formattedStr = text.replace(/\\n/g, '\n').replace(/\\r/g, '');
        // Remove rogue backslashes at end of lines or between lines
        formattedStr = formattedStr.replace(/\\\n/g, '\n').replace(/\\$/gm, '');
        
        const lines = formattedStr.split('\n');
        
        return lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) {
                // Collapse multiple empty lines but keep some spacing
                if (i > 0 && lines[i-1].trim() === '') return null;
                return <div key={i} className="h-3"></div>;
            }
            
            // Headings format (e.g. "Requirements:", "Benefits:")
            if (trimmed.endsWith(':') || (trimmed.length > 5 && trimmed === trimmed.toUpperCase() && !trimmed.includes('HTTP'))) {
                return <h3 key={i} className="font-black text-brand-900 mt-8 mb-4 text-lg border-l-4 border-brand-900 pl-3">{trimmed}</h3>;
            }
            
            // Bullets format
            if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('+')) {
                return (
                    <div key={i} className="flex items-start gap-3 mb-3 ml-1 md:ml-4 group">
                        <span className="text-brand-900 font-black mt-1 group-hover:scale-125 transition-transform text-lg leading-none">•</span>
                        <span className="text-brand-900 font-medium leading-relaxed">{trimmed.replace(/^[-•*+]\s*/, '')}</span>
                    </div>
                );
            }
            
            return <p key={i} className="text-brand-900 font-medium mb-3 leading-relaxed">{trimmed}</p>;
        }).filter(Boolean);
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
    );

    if (isError || !job) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-rose-50 p-6 rounded-full mb-6">
                <FileText className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-brand-900 mb-2">Không tìm thấy công việc này</h2>
            <p className="text-brand-900 mb-8">Công việc có thể đã bị xóa hoặc không tồn tại.</p>
            <button
                onClick={() => navigate(-1)}
                className="px-8 py-4 bg-brand-900 text-white rounded-2xl font-bold hover:bg-brand-900 transition-all"
            >
                Quay lại
            </button>
        </div>
    );

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-8 bg-background min-h-screen">
            {/* Breadcrumb / Back */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-primary transition-colors font-medium text-sm gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT — Nội dung */}
                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
                    {/* Header Info */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">{job.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {job.location || 'Chưa cập nhật'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                    {job.level || 'Chưa cập nhật'}
                                </span>
                                 <span className="flex items-center gap-1">
                                     <Coins className="w-4 h-4 text-gray-400" />
                                     {job.salary ? `${job.salary.toLocaleString()} VNĐ` : 'Thỏa thuận'}
                                 </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Ngày đăng: {job.createdAt ? format(new Date(job.createdAt), 'dd/MM/yyyy') : 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-8"></div>

                    {/* Job Details (Mô tả & Yêu cầu) */}
                    <div className="prose max-w-none text-gray-700 text-[15px] leading-7 space-y-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Mô tả công việc</h2>
                            <div className="space-y-2">
                                {formatText(job.description)}
                            </div>
                        </div>

                        {job.requirements && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">Yêu cầu ứng viên</h2>
                                <div className="space-y-2">
                                    {formatText(job.requirements)}
                                </div>
                            </div>
                        )}
                        
                        {job.skills && job.skills.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">Kỹ năng yêu cầu</h2>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {job.skills.map(skill => (
                                        <span key={skill.id} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-md">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT — Sidebar */}
                <div className="lg:w-80 flex-shrink-0 space-y-6">
                    {/* Apply card */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 sticky top-24">
                        <div className="mb-4">
                            <span className="text-sm text-gray-500 block mb-1">Mức lương</span>
                            <div className="text-xl font-bold text-accent">
                                {job.salary ? `${job.salary.toLocaleString()} VNĐ` : 'Thỏa thuận'}
                            </div>
                            <div className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Hạn nộp: {job.endDate ? format(new Date(job.endDate), 'dd/MM/yyyy') : 'N/A'}
                            </div>
                        </div>
                        
                        {isApplied ? (
                            <div className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg py-3 font-semibold flex items-center justify-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5" />
                                Đã ứng tuyển
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        toast.info("Vui lòng đăng nhập để ứng tuyển");
                                        navigate('/login', { state: { from: `/jobs/${id}` } });
                                        return;
                                    }
                                    const role = user?.role?.name || user?.role || '';
                                    if (role === 'HR' || role === 'ROLE_HR' || role === 'ADMIN' || role === 'ROLE_ADMIN') {
                                        toast.error("Tài khoản nhà tuyển dụng/quản trị viên không thể ứng tuyển công việc!");
                                        return;
                                    }
                                    setShowApplyModal(true);
                                }}
                                className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-3 font-semibold transition-colors flex items-center justify-center gap-2 mb-3 active:scale-[0.98]"
                            >
                                <Send className="w-5 h-5" />
                                Ứng tuyển ngay
                            </button>
                        )}
                        
                        <button 
                            onClick={toggleSaveJob}
                            className={`w-full border rounded-lg py-3 font-medium transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                                isSaved 
                                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100' 
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {isSaved ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Đã lưu việc làm
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    Lưu việc làm
                                </>
                            )}
                        </button>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                            <Dropdown
                                trigger={['click']}
                                menu={{
                                    items: [
                                        {
                                            key: 'copy',
                                            icon: <CopyOutlined />,
                                            label: 'Sao chép liên kết',
                                            onClick: () => {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast.success('Đã sao chép liên kết!');
                                            }
                                        },
                                        {
                                            key: 'facebook',
                                            icon: <FacebookOutlined />,
                                            label: 'Chia sẻ qua Facebook',
                                            onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
                                        },
                                        {
                                            key: 'linkedin',
                                            icon: <LinkedinOutlined />,
                                            label: 'Chia sẻ qua LinkedIn',
                                            onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')
                                        }
                                    ],
                                }}
                                placement="bottomRight"
                            >
                                <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 font-medium transition-colors">
                                    <Share2 className="w-4 h-4" /> Chia sẻ
                                </button>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Company card */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
                        <div className="flex gap-4 mb-4">
                            <div className="w-16 h-16 rounded-xl border border-gray-100 p-2 flex items-center justify-center shrink-0">
                                {job.company?.logo ? (
                                    <img src={getFileUrl(job.company.logo, 'company')} alt={job.company.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Building2 className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-semibold text-gray-900 text-base mb-1 truncate" title={job.company?.name}>{job.company?.name || 'Công ty ẩn danh'}</h3>
                                <Link to={`/companies/${job.company?.id}`} className="text-primary text-sm font-medium hover:underline">
                                    Xem công ty
                                </Link>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-500">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                <span>{job.company?.address || 'Chưa cập nhật địa chỉ'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <User className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                <span>50-500 nhân viên</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-elevated max-w-lg w-full p-8 relative animate-scale-in">
                        <button
                            onClick={() => setShowApplyModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-primary-light text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Send className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Ứng tuyển công việc</h3>
                            <p className="text-gray-500 mt-1 text-sm">
                                Gửi hồ sơ của bạn tới <span className="font-semibold text-gray-900">{job.company?.name}</span>
                            </p>
                        </div>

                        <form onSubmit={handleApply}>
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">CV ứng tuyển</label>

                                {profile?.cvs && profile.cvs.length > 0 && (
                                    <div className="mb-4">
                                        <select
                                            value={selectedCvId}
                                            onChange={(e) => {
                                                setSelectedCvId(e.target.value);
                                                if (e.target.value) setCvFile(null);
                                            }}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                                        >
                                            <option value="">-- Tải lên CV mới --</option>
                                            {profile.cvs.map(cv => (
                                                <option key={cv.id} value={cv.id}>
                                                    {cv.fileName} {cv.isDefault ? "(Mặc định)" : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {!selectedCvId && (
                                    <div className="relative group mt-2">
                                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${cvFile ? 'border-primary bg-primary-light/30' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}`}>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setCvFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {cvFile ? (
                                                <div className="flex flex-col items-center text-primary">
                                                    <CheckCircle className="w-8 h-8 mb-2" />
                                                    <span className="font-semibold text-sm truncate max-w-[200px] block">{cvFile.name}</span>
                                                    <span className="text-xs mt-1 text-gray-500">Nhấn để thay đổi file</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-500">
                                                    <FileText className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors mb-2" />
                                                    <span className="font-medium text-sm text-gray-700">Tải lên hồ sơ ứng tuyển</span>
                                                    <span className="text-xs text-gray-400 mt-1">Hỗ trợ PDF, DOC. Tối đa 5MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isApplying}
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm active:scale-[0.98]"
                                >
                                    {isApplying ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        'Gửi hồ sơ'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetailPage;
