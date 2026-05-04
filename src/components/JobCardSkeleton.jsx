const JobCardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 flex flex-col h-full animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0"></div>
                <div className="flex-1 w-full">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>

            <div className="mt-2 flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="w-2 h-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>

            <div className="mt-3 flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
        </div>
    );
};

export default JobCardSkeleton;
