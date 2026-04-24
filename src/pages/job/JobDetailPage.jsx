import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { MapPin, DollarSign, Calendar, Clock, Building2, ArrowLeft, CheckCircle, Share2, Briefcase, FileText, Send, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dropdown, Menu } from 'antd';
import { FacebookOutlined, LinkedinOutlined, MailOutlined, CopyOutlined } from '@ant-design/icons';

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [cvFile, setCvFile] = useState(null);
    const [selectedCvId, setSelectedCvId] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);

    const queryClient = useQueryClient();

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-brand-900 font-bold mb-8 group hover:text-brand-900 transition-colors"
            >
                <div className="p-3 rounded-xl bg-white border border-blue-100 group-hover:border-blue-200 mr-4 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-brand-900" />
                </div>
                Quay lại danh sách
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-blue-100 p-6 md:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-full bg-blue-50/20 skew-x-[-20deg] translate-x-32 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start mb-8 md:mb-10 text-center md:text-left">
                                <div className="w-20 h-20 md:w-32 md:h-32 bg-white border border-blue-100 shadow-xl shadow-blue-200/50 rounded-2xl md:rounded-3xl flex items-center justify-center p-3 md:p-4 shrink-0 overflow-hidden">
                                    {job.company?.logo ? (
                                        <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 className="w-10 h-10 md:w-12 md:h-12 text-blue-200" />
                                    )}
                                </div>
                                <div className="flex-1 w-full">
                                    <h1 className="text-2xl md:text-4xl font-black text-brand-900 mb-3 leading-tight tracking-tight uppercase px-2 md:px-0">{job.name}</h1>
                                    <Link to={`/companies/${job.company?.id}`} className="text-lg md:text-xl text-brand-900 font-black hover:text-blue-700 transition-colors inline-flex items-center gap-2 group">
                                        {job.company?.name || 'Công ty ẩn danh'}
                                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 rotate-180 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all font-bold" />
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
                                <div className="flex flex-col text-blue-700 bg-blue-50 p-4 md:px-6 md:py-4 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                        <p className="text-[9px] md:text-[10px] text-blue-400 font-black uppercase tracking-widest">Mức lương</p>
                                    </div>
                                    <p className="font-black text-brand-900 text-sm md:text-base">{job.salary ? `${job.salary.toLocaleString()} VND` : 'Thỏa thuận'}</p>
                                </div>
                                <div className="flex flex-col text-blue-700 bg-blue-50 p-4 md:px-6 md:py-4 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                                        <MapPin className="w-3.5 h-3.5 text-brand-900" />
                                        <p className="text-[9px] md:text-[10px] text-blue-400 font-black uppercase tracking-widest">Địa điểm</p>
                                    </div>
                                    <p className="font-black text-brand-900 text-sm md:text-base truncate">{job.location}</p>
                                </div>
                                <div className="flex flex-col text-blue-700 bg-blue-50 p-4 md:px-6 md:py-4 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                        <p className="text-[9px] md:text-[10px] text-blue-400 font-black uppercase tracking-widest">Cấp độ</p>
                                    </div>
                                    <p className="font-black text-brand-900 text-sm md:text-base">{job.level}</p>
                                </div>
                                <div className="flex flex-col text-blue-700 bg-blue-50 p-4 md:px-6 md:py-4 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                                        <p className="text-[9px] md:text-[10px] text-blue-400 font-black uppercase tracking-widest">Hạn nộp</p>
                                    </div>
                                    <p className="font-black text-brand-900 text-sm md:text-base">{job.endDate ? format(new Date(job.endDate), 'dd/MM/yyyy') : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-8 md:pt-10 border-t border-blue-50">
                                {isApplied ? (
                                    <div className="flex-1 bg-brand-900 text-white font-bold py-5 px-10 rounded-2xl flex items-center justify-center gap-3 cursor-default shadow-xl shadow-blue-900/20">
                                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                                        Ứng tuyển thành công
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
                                        className="flex-1 bg-brand-900 text-white font-black py-5 px-10 rounded-2xl shadow-2xl shadow-blue-900/30 hover:bg-brand-900 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        <Send className="w-6 h-6" />
                                        Ứng tuyển ngay
                                    </button>
                                )}
                                <Dropdown
                                    trigger={['click']}
                                    menu={{
                                        items: [
                                            {
                                                key: 'copy',
                                                icon: <CopyOutlined className="text-brand-900" />,
                                                label: 'Sao chép liên kết',
                                                onClick: () => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    toast.success('Đã sao chép liên kết!');
                                                }
                                            },
                                            {
                                                key: 'facebook',
                                                icon: <FacebookOutlined className="text-brand-900" />,
                                                label: 'Chia sẻ qua Facebook',
                                                onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
                                            },
                                            {
                                                key: 'linkedin',
                                                icon: <LinkedinOutlined className="text-blue-700" />,
                                                label: 'Chia sẻ qua LinkedIn',
                                                onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')
                                            },
                                            {
                                                key: 'email',
                                                icon: <MailOutlined className="text-rose-500" />,
                                                label: 'Gửi qua Email',
                                                onClick: () => window.location.href = `mailto:?subject=${encodeURIComponent(job.name)}&body=Xem việc làm này tại: ${encodeURIComponent(window.location.href)}`
                                            }
                                        ],
                                        className: "rounded-xl shadow-xl border border-blue-100 p-2 min-w-[180px]"
                                    }}
                                    placement="bottomRight"
                                >
                                    <button className="px-10 py-4 rounded-2xl border border-blue-200 text-brand-900 font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                                        <Share2 className="w-6 h-6" />
                                        Chia sẻ
                                    </button>
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-blue-100 space-y-8">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-brand-900 mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center text-brand-900 shadow-inner">
                                    <FileText className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                Chi tiết công việc
                            </h2>
                            <div className="text-sm md:text-base text-brand-900">
                                {formatText(job.description)}
                            </div>
                        </div>

                        {job.requirements && (
                            <>
                                <div className="h-px bg-blue-100 my-6 md:my-8"></div>

                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-brand-900 mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                                            <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        Yêu cầu ứng viên
                                    </h2>
                                    <div className="text-sm md:text-base text-brand-900">
                                        {formatText(job.requirements)}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-100 sticky top-24">
                        <h3 className="font-black text-brand-900 mb-8 text-xl uppercase tracking-tight">Thông tin công ty</h3>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-white shadow-xl shadow-blue-100 border border-blue-50 rounded-2xl flex items-center justify-center p-3 shrink-0 overflow-hidden">
                                {job.company?.logo ? (
                                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Building2 className="w-10 h-10 text-blue-200" />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-black text-brand-900 text-lg leading-tight mb-2 truncate" title={job.company?.name}>{job.company?.name}</p>
                                <Link to={`/companies/${job.company?.id}`} className="text-brand-900 text-sm font-bold hover:underline flex items-center gap-1">
                                    Xem hồ sơ công ty
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-6 text-sm text-brand-900 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                            <div>
                                <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest block mb-1">Địa chỉ</span>
                                <span className="font-medium text-blue-700 leading-relaxed block">{job.company?.address || 'Chưa cập nhật'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest block mb-1">Quy mô</span>
                                <span className="font-medium text-blue-700">50-500 nhân viên</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest block mb-1">Email liên hệ</span>
                                <span className="font-bold text-brand-900 truncate block" title={job.createdBy}>
                                    {job.createdBy || 'hr@company.com'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest block mb-1">Website / GitHub</span>
                                {job.company?.githubLink ? (
                                    <a 
                                        href={job.company.githubLink.startsWith('http') ? job.company.githubLink : `https://${job.company.githubLink}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-brand-900 font-bold hover:underline truncate block"
                                    >
                                        {job.company.githubLink.replace(/^https?:\/\//, '')}
                                    </a>
                                ) : (
                                    <span className="text-blue-400 italic">Chưa cập nhật</span>
                                )}
                            </div>
                            {job.company?.facebookLink && (
                                <div>
                                    <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest block mb-1">Facebook</span>
                                    <a 
                                        href={job.company.facebookLink.startsWith('http') ? job.company.facebookLink : `https://${job.company.facebookLink}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-brand-900 font-bold hover:underline truncate block text-xs"
                                    >
                                        {job.company.facebookLink.replace(/^https?:\/\/www.facebook.com\//, '')}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-scale-in">
                        <button
                            onClick={() => setShowApplyModal(false)}
                            className="absolute top-6 right-6 p-2.5 rounded-full hover:bg-blue-50 text-blue-400 hover:text-brand-900 transition-all border border-transparent hover:border-blue-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>

                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-blue-50 text-brand-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                                <Send className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-black text-brand-900 tracking-tight uppercase">Ứng tuyển công việc</h3>
                            <p className="text-brand-900 mt-2 font-medium italic">
                                Gửi hồ sơ của bạn tới <span className="font-bold text-brand-900">{job.company?.name}</span>
                            </p>
                        </div>

                        <form onSubmit={handleApply}>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-zinc-700 mb-3">CV ứng tuyển</label>

                                {profile?.cvs && profile.cvs.length > 0 && (
                                    <div className="mb-4">
                                        <select
                                            value={selectedCvId}
                                            onChange={(e) => {
                                                setSelectedCvId(e.target.value);
                                                if (e.target.value) setCvFile(null);
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-zinc-700"
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
                                    <div className="relative group">
                                        <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer ${cvFile ? 'border-emerald-500 bg-emerald-50' : 'border-blue-200 hover:border-brand-900 hover:bg-blue-50'}`}>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setCvFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {cvFile ? (
                                                <div className="flex flex-col items-center text-emerald-600 animate-fade-in">
                                                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-emerald-100 border border-emerald-100 mb-4">
                                                        <CheckCircle className="w-8 h-8" />
                                                    </div>
                                                    <span className="font-black text-brand-900 truncate max-w-[200px] block">{cvFile.name}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Click để thay đổi file</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-brand-900">
                                                    <div className="p-4 bg-blue-50 rounded-2xl mb-4 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-blue-200 transition-all">
                                                        <FileText className="w-8 h-8 text-blue-300 group-hover:text-brand-900 transition-colors" />
                                                    </div>
                                                    <span className="font-bold text-brand-900 tracking-tight group-hover:text-brand-900 transition-colors">Tải lên hồ sơ ứng tuyển</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-400 mt-2">Hỗ trợ PDF, DOC. Tối đa 5MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="flex-1 px-8 py-4 text-brand-900 bg-blue-50 hover:bg-blue-100 rounded-2xl font-bold transition-all active:scale-[0.98]"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isApplying}
                                    className="flex-1 px-8 py-4 bg-brand-900 text-white rounded-2xl font-black h-14 hover:bg-brand-900 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]"
                                >
                                    {isApplying ? (
                                        <>
                                            <div className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
