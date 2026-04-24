import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Building2, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const JobCard = ({ job }) => {
    return (
        <div className="group relative bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-2xl hover:shadow-blue-200/40 hover:border-blue-200 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gray-100 group-hover:bg-brand-900 transition-colors"></div>
            <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                    {job.company?.logo ? (
                        <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain p-2" />
                    ) : (
                        <Building2 className="w-7 h-7 text-gray-400" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <Link to={`/jobs/${job.id}`} className="block">
                            <h3 className="text-lg font-bold text-brand-900 group-hover:text-brand-900 transition-colors line-clamp-1 mb-1" title={job.name}>
                                {job.name}
                            </h3>
                        </Link>
                        {job.hot && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 ml-2">
                                HOT
                            </span>
                        )}
                    </div>
                    <Link to={`/companies/${job.company?.id}`} className="text-sm text-gray-500 hover:text-brand-900 transition-colors line-clamp-1 flex items-center gap-1 font-medium">
                        {job.company?.name || 'Company Name'}
                    </Link>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    <DollarSign className="w-3.5 h-3.5 mr-1" />
                    {job.salary ? job.salary.toLocaleString() : 'Thỏa thuận'}
                </div>
                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span className="truncate max-w-[120px]" title={job.location}>{job.location}</span>
                </div>
                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {job.level}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi }) : 'Mới đăng'}
                </div>
                <span className="px-2 py-1 rounded bg-gray-50 text-gray-500 font-medium">
                    {job.type || 'Full-time'}
                </span>
            </div>

            {/* Hover Action */}
            <div className="hidden absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl group-hover:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <Link
                    to={`/jobs/${job.id}`}
                    className="bg-brand-900 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-brand-900 pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
                >
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
};

export default JobCard;
