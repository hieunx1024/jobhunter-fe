import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Bookmark,
    MapPin,
    TrendingUp,
    Building2,
    Calendar,
    Trash2,
    ExternalLink,
    Briefcase
} from 'lucide-react';

const SavedJobsPage = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    // For now, we'll use localStorage to store saved jobs
    // In a real application, this would be stored in the backend
    useEffect(() => {
        loadSavedJobs();
    }, []);

    const loadSavedJobs = () => {
        try {
            const saved = localStorage.getItem('savedJobs');
            if (saved) {
                setSavedJobs(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved jobs:', error);
        }
    };

    const removeSavedJob = (jobId) => {
        const updated = savedJobs.filter(job => job.id !== jobId);
        setSavedJobs(updated);
        localStorage.setItem('savedJobs', JSON.stringify(updated));
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-10 p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-blue-50/20 skew-x-[-20deg] translate-x-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Việc làm đã lưu</h1>
                        <p className="text-slate-500 font-medium">Quản lý danh sách các công việc bạn quan tâm</p>
                    </div>
                    <div className="bg-slate-50 px-8 py-3 rounded-2xl border border-slate-100 text-center">
                        <p className="text-3xl font-black text-slate-900 leading-none mb-1">{savedJobs.length}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Việc làm đã lưu</p>
                    </div>
                </div>
            </div>

            {/* Saved Jobs List */}
            {savedJobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có việc làm nào được lưu</h3>
                    <p className="text-gray-500 mb-6">Hãy khám phá và lưu lại những công việc bạn quan tâm</p>
                    <Link
                        to="/jobs"
                        className="inline-block px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                    >
                        Khám phá việc làm
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {savedJobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            <div className="p-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Job Title */}
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <Briefcase className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                    {job.name}
                                                </h2>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Building2 className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-600 font-semibold">{job.company?.name || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Details */}
                                        <div className="flex flex-wrap gap-4 mb-4">
                                            {job.location && (
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{job.location}</span>
                                                </div>
                                            )}
                                            {job.salary && (
                                                <div className="flex items-center space-x-2 text-green-600 font-semibold">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span>{job.salary}</span>
                                                </div>
                                            )}
                                            {job.level && (
                                                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                                    {job.level}
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {job.description && (
                                            <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                                        )}

                                        {/* Skills */}
                                        {job.skills && job.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {job.skills.slice(0, 5).map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                                                    >
                                                        {skill.name || skill}
                                                    </span>
                                                ))}
                                                {job.skills.length > 5 && (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                                        +{job.skills.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Saved Date */}
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>Đã lưu ngày: {formatDate(job.savedAt || new Date())}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col space-y-2 ml-4">
                                        <Link
                                            to={`/jobs/${job.id}`}
                                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center"
                                            title="Xem chi tiết"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => removeSavedJob(job.id)}
                                            className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center"
                                            title="Xóa khỏi danh sách"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {job.startDate && (
                                            <div className="text-sm text-gray-600">
                                                <span className="font-semibold">Ngày bắt đầu:</span> {formatDate(job.startDate)}
                                            </div>
                                        )}
                                        {job.endDate && (
                                            <div className="text-sm text-gray-600">
                                                <span className="font-semibold">Hạn nộp:</span> {formatDate(job.endDate)}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                                    >
                                        Ứng tuyển ngay
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tips Section */}
            {savedJobs.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Mẹo tìm việc hiệu quả</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Kiểm tra danh sách việc làm đã lưu thường xuyên để không bỏ lỡ hạn nộp</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Chuẩn bị CV phù hợp với từng vị trí trước khi ứng tuyển</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Nghiên cứu kỹ về công ty và vị trí tuyển dụng</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Ứng tuyển sớm để tăng cơ hội được xem xét</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SavedJobsPage;
