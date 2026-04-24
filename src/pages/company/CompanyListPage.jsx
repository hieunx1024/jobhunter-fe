import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import CompanyCard from '../../components/CompanyCard';
import Pagination from '../../components/Pagination';
import { Search, Building } from 'lucide-react';

const CompanyListPage = () => {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12); // Grid 3x4
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: companies, isLoading } = useQuery({
        queryKey: ['companies', page, pageSize, debouncedSearch],
        queryFn: async () => {
            const params = {
                page,
                size: pageSize,
                sort: 'updatedAt,desc'
            };
            if (debouncedSearch) {
                params.filter = `name~'${debouncedSearch}'`;
            }
            // Use PUBLIC endpoint
            const res = await axiosClient.get(ENDPOINTS.COMPANIES.PUBLIC, { params });
            return res.data.data ? res.data.data : res.data;
        },
        keepPreviousData: true,
    });

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-8 md:p-12 mb-12 text-center text-white shadow-xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-900/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-accent-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                        Khám Phá <span className="text-blue-400">Nhà Tuyển Dụng</span> Hàng Đầu
                    </h1>
                    <p className="text-gray-100 text-lg md:text-xl font-light">
                        Tìm hiểu văn hóa, môi trường làm việc và những cơ hội phát triển sự nghiệp tại các công ty công nghệ uy tín.
                    </p>

                    <div className="max-w-xl mx-auto mt-8 relative group">
                        <Search className="absolute left-5 top-4 text-gray-400 group-focus-within:text-brand-900 transition-colors h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Nhập tên công ty bạn muốn tìm..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white text-zinc-900 rounded-full shadow-lg border-2 border-transparent focus:outline-none focus:border-brand-900 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                        <Building className="text-brand-900 h-5 w-5" />
                        Danh sách công ty
                    </h2>
                    <span className="text-gray-500 text-sm">
                        Hiển thị <strong>{companies?.result?.length || 0}</strong> kết quả
                    </span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white h-72 rounded-xl border border-gray-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {companies?.result?.map((company) => (
                                <CompanyCard key={company.id} company={company} />
                            ))}
                        </div>

                        {companies?.result?.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Building className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900">Không tìm thấy công ty nào</h3>
                                <p className="text-gray-500 mt-2">Hãy thử tìm kiếm với từ khóa khác.</p>
                            </div>
                        )}

                        <div className="mt-10">
                            <Pagination
                                current={page}
                                total={companies?.meta?.total || 0}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanyListPage;
