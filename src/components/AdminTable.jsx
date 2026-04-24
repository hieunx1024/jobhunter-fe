import { Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminTable = ({
    columns,
    data,
    isLoading,
    meta,
    onPageChange,
    onEdit,
    onDelete,
    renderActions
}) => {
    if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                #
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col.key || col.title}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {col.title}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {(meta?.page - 1) * meta?.pageSize + index + 1}
                                    </td>
                                    {columns.map((col) => {
                                        const getValue = (obj, path) => {
                                            if (!path) return undefined;
                                            if (Array.isArray(path)) {
                                                return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
                                            }
                                            return obj[path];
                                        };
                                        const value = getValue(item, col.dataIndex);
                                        return (
                                            <td key={col.key || col.title} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {col.render ? col.render(value, item) : value}
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {renderActions ? renderActions(item) : (
                                            <>
                                                <button
                                                    onClick={() => onEdit && onEdit(item)}
                                                    className="text-brand-900 hover:text-brand-900 mr-4"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Bạn có chắc chắn muốn xóa?')) {
                                                            onDelete && onDelete(item.id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-500">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {meta && meta.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{(meta.page - 1) * meta.pageSize + 1}</span> đến <span className="font-medium">{Math.min(meta.page * meta.pageSize, meta.total)}</span> trong số <span className="font-medium">{meta.total}</span> kết quả
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => onPageChange(meta.page - 1)}
                                    disabled={meta.page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => onPageChange(meta.page + 1)}
                                    disabled={meta.page === meta.pages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTable;
