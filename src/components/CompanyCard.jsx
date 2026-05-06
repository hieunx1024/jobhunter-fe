import { Link } from 'react-router-dom';
import { MapPin, Building2, ArrowRight, Briefcase } from 'lucide-react';
import { getFileUrl } from '../utils/fileUtils';

const CompanyCard = ({ company }) => {
    return (
        <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
            <div className="flex items-start gap-4 mb-4 z-10">
                <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {company.logo ? (
                        <img src={getFileUrl(company.logo, 'company')} alt={company.name} className="w-full h-full object-contain p-2" />
                    ) : (
                        <Building2 className="w-8 h-8 text-brand-900" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <Link to={`/companies/${company.id}`} className="block">
                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-brand-900 transition-colors line-clamp-1 mb-1" title={company.name}>
                            {company.name}
                        </h3>
                    </Link>
                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <span className="truncate max-w-[180px]" title={company.address}>{company.address || 'Hanoi, Vietnam'}</span>
                    </div>
                </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow ">
                {company.description || 'Hiện chưa có mô tả chi tiết về công ty này.'}
            </p>

            <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center text-sm z-10">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-zinc-700">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Công nghệ
                </span>
                <Link
                    to={`/companies/${company.id}`}
                    className="text-brand-900 font-medium hover:text-blue-700 flex items-center group/link transition-colors"
                >
                    Xem chi tiết <ArrowRight className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Decorative gradient blob */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
    );
};

export default CompanyCard;
