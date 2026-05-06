import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Coins, Clock, Building2, CalendarDays, Bookmark, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getFileUrl } from '../utils/fileUtils';

const JobCard = ({ job }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [savedJobs, setSavedJobs] = useState(() => {
        const saved = localStorage.getItem('savedJobs');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const handleSync = () => {
            const saved = localStorage.getItem('savedJobs');
            setSavedJobs(saved ? JSON.parse(saved) : []);
        };
        window.addEventListener('savedJobsUpdated', handleSync);
        return () => window.removeEventListener('savedJobsUpdated', handleSync);
    }, []);

    const isSaved = savedJobs.some(sj => sj.id === job?.id);

    const toggleSaveJob = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info("Vui lòng đăng nhập để lưu việc làm");
            navigate('/login', { state: { from: `/jobs/${job.id}` } });
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
        
        // Dispatch custom event to sync save states across other cards if they are on screen
        window.dispatchEvent(new Event('savedJobsUpdated'));
    };

    const isPremium = job.activeSubscriptionCount > 0;

    return (
        <div className={`rounded-2xl border shadow-sm transition-all duration-200 p-5 flex flex-col h-full group/card relative ${
            isPremium 
                ? 'border-[#F59E0B]/50 hover:border-[#F59E0B] bg-gradient-to-br from-amber-50/20 via-white to-amber-50/10 shadow-amber-50/40' 
                : 'bg-white border-gray-100 hover:shadow-md hover:border-[#2563EB]'
        }`}>
            {isPremium && (
                <div className="absolute top-0 left-6 -translate-y-1/2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10 select-none">
                    <Sparkles className="w-3 h-3 fill-white" /> Nổi bật
                </div>
            )}
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {job.company?.logo ? (
                        <img src={getFileUrl(job.company.logo, 'company')} alt={job.company.name} className="w-full h-full object-contain p-1.5" />
                    ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                    <Link to={`/jobs/${job.id}`} className="block">
                        <h3 className="text-[17px] font-semibold text-[#1A202C] line-clamp-1 mb-1 hover:text-[#2563EB] transition-colors" title={job.name}>
                            {job.name}
                        </h3>
                    </Link>
                    <div className="flex flex-col gap-0.5 mt-1 text-[13px] text-[#64748B]">
                        <Link to={`/companies/${job.company?.id}`} className="hover:text-[#2563EB] transition-colors font-medium truncate block text-[14px]" title={job.company?.name}>
                            {job.company?.name || 'Company Name'}
                        </Link>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                            <span className="truncate" title={job.location}>{job.location}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={toggleSaveJob}
                    className="absolute top-5 right-5 text-gray-400 hover:text-[#2563EB] transition-all duration-200 z-10"
                >
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'text-[#2563EB] fill-[#2563EB]' : 'hover:fill-[#2563EB]'}`} />
                </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F0FDF4] text-[#16A34A] text-[13px] font-semibold">
                    <Coins className="w-3.5 h-3.5 mr-1" />
                    {job.salary ? `${job.salary.toLocaleString()} VNĐ` : 'Thỏa thuận'}
                </div>
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#475569] text-[13px] font-medium">
                    {job.type || 'Full-time'}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[13px] text-[#64748B]">
                    <Clock className="w-3.5 h-3.5" />
                    {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi }) : 'Mới đăng'}
                </div>
                <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center justify-center px-5 py-2 bg-[#2563EB] hover:bg-[#1B4F8A] text-white text-[14px] font-medium rounded-lg transition-colors active:scale-[0.98]"
                >
                    Ứng tuyển
                </Link>
            </div>
        </div>
    );
};

export default JobCard;
