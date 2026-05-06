import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Building2, CalendarDays, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#2563EB] transition-all duration-200 p-5 flex flex-col h-full group/card relative">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {job.company?.logo ? (
                        <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain p-1.5" />
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
                    <div className="flex items-center gap-2 text-[14px] text-[#64748B]">
                        <Link to={`/companies/${job.company?.id}`} className="hover:text-[#2563EB] transition-colors font-medium">
                            {job.company?.name || 'Company Name'}
                        </Link>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]" title={job.location}>{job.location}</span>
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
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F0FDF4] text-[#16A34A] text-[13px] font-medium">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    {job.salary ? job.salary.toLocaleString() : 'Thỏa thuận'}
                </div>
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#475569] text-[13px] font-medium">
                    {job.type || 'Full-time'}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
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
