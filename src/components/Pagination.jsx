import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ current, total, pageSize, onChange, className = "" }) => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        let start = Math.max(1, current - 2);
        let end = Math.min(totalPages, current + 2);

        if (totalPages > 5) {
            if (current <= 3) { end = Math.min(totalPages, 5); }
            if (current >= totalPages - 2) { start = Math.max(1, totalPages - 4); }
        }

        const visible = [];
        for (let i = start; i <= end; i++) {
            visible.push(i);
        }
        return visible;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className={`flex justify-center items-center space-x-2 mt-10 ${className}`}>
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {visiblePages[0] > 1 && (
                <span className="px-2 text-gray-400">...</span>
            )}

            {visiblePages.map((page) => (
                <button
                    key={page}
                    onClick={() => onChange(page)}
                    className={`min-w-[40px] h-10 flex items-center justify-center border rounded-lg font-medium transition-colors ${current === page
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/30'
                            : 'bg-white border-gray-200 text-zinc-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                >
                    {page}
                </button>
            ))}

            {visiblePages[visiblePages.length - 1] < totalPages && (
                <span className="px-2 text-gray-400">...</span>
            )}

            <button
                onClick={() => onChange(current + 1)}
                disabled={current === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Pagination;
