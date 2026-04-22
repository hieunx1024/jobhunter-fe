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

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
            <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        </div>
    );

    if (isError || !job) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-red-50 p-6 rounded-full mb-6">
                <FileText className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Không tìm thấy công việc này</h2>
            <p className="text-secondary-500 mb-8 max-w-md">Công việc có thể đã hết hạn hoặc bị xóa. Vui lòng quay lại tìm kiếm công việc khác.</p>
            <button onClick={() => navigate('/jobs')} className="btn btn-primary">
                Quay lại danh sách việc làm
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Navigation */}
            <button onClick={() => navigate(-1)} className="group flex items-center text-secondary-500 hover:text-brand-600 mb-8 transition-colors font-medium">
                <div className="p-2 rounded-full bg-white border border-secondary-200 group-hover:border-brand-200 mr-3 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
                Quay lại danh sách
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-50 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none opacity-50"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-white border border-secondary-100 shadow-md rounded-2xl flex items-center justify-center p-3 shrink-0">
                                    {job.company?.logo ? (
                                        <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 className="w-10 h-10 text-brand-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2 leading-tight">{job.name}</h1>
                                    <Link to={`/companies/${job.company?.id}`} className="text-lg text-brand-600 font-medium hover:text-brand-700 transition-colors inline-flex items-center gap-1 group">
                                        {job.company?.name || 'Công ty ẩn danh'}
                                        <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1 transition-all" />
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center text-secondary-700 bg-secondary-50 px-4 py-3 rounded-xl border border-secondary-100">
                                    <DollarSign className="w-5 h-5 mr-3 text-emerald-500 shrink-0" />
                                    <div>
                                        <p className="text-xs text-secondary-400 font-medium uppercase tracking-wider mb-0.5">Mức lương</p>
                                        <p className="font-semibold">{job.salary ? `${job.salary.toLocaleString()} VNĐ` : 'Thỏa thuận'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-secondary-700 bg-secondary-50 px-4 py-3 rounded-xl border border-secondary-100">
                                    <MapPin className="w-5 h-5 mr-3 text-brand-500 shrink-0" />
                                    <div>
                                        <p className="text-xs text-secondary-400 font-medium uppercase tracking-wider mb-0.5">Địa điểm</p>
                                        <p className="font-semibold truncate">{job.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-secondary-700 bg-secondary-50 px-4 py-3 rounded-xl border border-secondary-100">
                                    <Briefcase className="w-5 h-5 mr-3 text-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-xs text-secondary-400 font-medium uppercase tracking-wider mb-0.5">Kinh nghiệm</p>
                                        <p className="font-semibold">{job.level}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-secondary-700 bg-secondary-50 px-4 py-3 rounded-xl border border-secondary-100">
                                    <Clock className="w-5 h-5 mr-3 text-orange-500 shrink-0" />
                                    <div>
                                        <p className="text-xs text-secondary-400 font-medium uppercase tracking-wider mb-0.5">Hạn nộp</p>
                                        <p className="font-semibold">{job.endDate ? format(new Date(job.endDate), 'dd/MM/yyyy') : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary-100">
                                {isApplied ? (
                                    <div className="flex-1 bg-emerald-50 text-emerald-600 font-bold py-3.5 px-8 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 cursor-default">
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
                                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-brand-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-5 h-5" />
                                        Ứng tuyển ngay
                                    </button>
                                )}
                                <button className="px-6 py-3.5 rounded-xl border border-secondary-200 text-secondary-600 font-bold hover:bg-secondary-50 transition-colors flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Chia sẻ
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-secondary-200 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                Chi tiết công việc
                            </h2>
                            <div className="prose prose-secondary max-w-none text-secondary-600 whitespace-pre-line leading-relaxed">
                                {job.description}
                            </div>
                        </div>

                        <div className="h-px bg-secondary-100"></div>

                        <div>
                            <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                Yêu cầu ứng viên
                            </h2>
                            <div className="prose prose-secondary max-w-none text-secondary-600 whitespace-pre-line leading-relaxed">
                                {job.requirements || (
                                    <p className="italic text-secondary-400">Vui lòng tham khảo phần mô tả chi tiết ở trên.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-secondary-200 sticky top-24">
                        <h3 className="font-bold text-secondary-900 mb-6 text-lg">Thông tin công ty</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-secondary-50 rounded-xl flex items-center justify-center border border-secondary-100 shrink-0">
                                {job.company?.logo ? (
                                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain p-1" />
                                ) : (
                                    <Building2 className="w-7 h-7 text-secondary-400" />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-secondary-900 truncate" title={job.company?.name}>{job.company?.name}</p>
                                <Link to={`/companies/${job.company?.id}`} className="text-brand-600 text-sm font-medium hover:underline flex items-center gap-1">
                                    Xem hồ sơ công ty
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm text-secondary-600 bg-secondary-50/50 p-4 rounded-xl border border-secondary-100/50">
                            <div>
                                <span className="font-semibold text-secondary-900 block mb-1">Địa chỉ</span>
                                <span className="leading-relaxed">{job.company?.address || 'Chưa cập nhật'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-secondary-900 block mb-1">Quy mô</span>
                                <span>50-100 nhân viên</span>
                            </div>
                            <div>
                                <span className="font-semibold text-secondary-900 block mb-1">Website</span>
                                <a href="#" className="text-brand-600 hover:underline truncate block">Visit website</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-scale-in">
                        <button
                            onClick={() => setShowApplyModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary-100 text-secondary-400 hover:text-secondary-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-secondary-900">Ứng tuyển công việc</h3>
                            <p className="text-secondary-500 mt-2">Gửi hồ sơ của bạn tới <span className="font-semibold text-secondary-900">{job.company?.name}</span></p>
                        </div>

                        <form onSubmit={handleApply}>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-secondary-700 mb-3">CV ứng tuyển</label>

                                {profile?.cvs && profile.cvs.length > 0 && (
                                    <div className="mb-4">
                                        <select
                                            value={selectedCvId}
                                            onChange={(e) => {
                                                setSelectedCvId(e.target.value);
                                                if (e.target.value) setCvFile(null); // Reset new file if selecting existing
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-secondary-700"
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
                                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${cvFile ? 'border-emerald-500 bg-emerald-50' : 'border-secondary-300 hover:border-brand-500 hover:bg-brand-50'}`}>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setCvFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {cvFile ? (
                                                <div className="flex flex-col items-center text-emerald-600 animate-fade-in">
                                                    <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                                        <CheckCircle className="w-8 h-8" />
                                                    </div>
                                                    <span className="font-bold text-secondary-900 truncate max-w-[200px] block">{cvFile.name}</span>
                                                    <span className="text-xs mt-1">Click để thay đổi file</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-secondary-500">
                                                    <div className="p-3 bg-secondary-100 rounded-full mb-3 group-hover:bg-white group-hover:shadow-sm transition-colors">
                                                        <FileText className="w-8 h-8 text-secondary-400 group-hover:text-brand-500 transition-colors" />
                                                    </div>
                                                    <span className="font-medium group-hover:text-brand-600 transition-colors">Click để chọn file hoặc kéo thả</span>
                                                    <span className="text-xs text-secondary-400 mt-2">Hỗ trợ PDF, DOC. Tối đa 5MB</span>
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
                                    className="flex-1 px-4 py-3 text-secondary-600 bg-secondary-100 hover:bg-secondary-200 rounded-xl font-bold transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isApplying}
                                    className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-brand-200"
                                >
                                    {isApplying ? (
                                        <>
                                            <Clock className="w-5 h-5 mr-2 animate-spin" />
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
