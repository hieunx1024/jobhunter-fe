import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Space, Popconfirm, message, Card, Tabs, Tag, Tooltip, Modal } from 'antd';
import { 
    SearchOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    LockOutlined, 
    UnlockOutlined, 
    ReloadOutlined,
    CheckOutlined, 
    CloseOutlined, 
    EyeOutlined, 
    FileTextOutlined
} from '@ant-design/icons';
import { Building2, ClipboardCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { openPDFDirectly, getFileUrl } from '../../utils/fileUtils';

const CompanyManagement = () => {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Main Tab state ('list' or 'approvals')
    const activeMainTab = searchParams.get('tab') || 'list';

    // State for TAB 1: Company List
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // State for TAB 2: Registration Approvals
    const [approvalActiveTab, setApprovalActiveTab] = useState('PENDING');
    const [viewingRequest, setViewingRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedIdToReject, setSelectedIdToReject] = useState(null);
    const [approvalPagination, setApprovalPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // ----------------------------------------------------
    // TAB 1: Company List Queries & Mutations
    // ----------------------------------------------------
    // Fetch Companies
    const { data: companiesData, isLoading: isCompaniesLoading } = useQuery({
        queryKey: ['companies', pagination.current, pagination.pageSize, searchText, statusFilter],
        queryFn: async () => {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
            };
            
            let filters = [];
            if (searchText) {
                filters.push(`name~~'${searchText}'`);
            }
            if (statusFilter !== 'ALL') {
                filters.push(`status:'${statusFilter}'`);
            }
            
            if (filters.length > 0) {
                params.filter = filters.join(' and ');
            }
            
            const res = await axiosClient.get(ENDPOINTS.COMPANIES.BASE, { params });
            return res.data;
        },
        enabled: activeMainTab === 'list',
    });

    const changeStatusMutation = useMutation({
        mutationFn: ({ id, status }) => axiosClient.put(`${ENDPOINTS.COMPANIES.BASE}/${id}/status`, { status }),
        onSuccess: () => {
            message.success('Cập nhật trạng thái thành công');
            queryClient.invalidateQueries(['companies']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    // ----------------------------------------------------
    // TAB 2: Registration Approvals Queries & Mutations
    // ----------------------------------------------------
    // Fetch Registrations dynamically based on selected tab status
    const { data: approvalsData, isLoading: isApprovalsLoading } = useQuery({
        queryKey: ['company-registrations', approvalActiveTab, approvalPagination.current, approvalPagination.pageSize],
        queryFn: async () => {
            const params = {
                page: approvalPagination.current,
                size: approvalPagination.pageSize,
                filter: `status:'${approvalActiveTab}'`
            };
            const res = await axiosClient.get(ENDPOINTS.COMPANY_REGISTRATIONS.BASE, { params });
            return res.data;
        },
        enabled: activeMainTab === 'approvals',
    });

    const approvalStatusMutation = useMutation({
        mutationFn: ({ id, status, reason }) => axiosClient.put(ENDPOINTS.COMPANY_REGISTRATIONS.STATUS(id),
            reason ? { rejectionReason: reason } : {},
            { params: { status } }
        ),
        onSuccess: () => {
            message.success('Cập nhật trạng thái thành công');
            setIsRejectModalOpen(false);
            setRejectReason('');
            setViewingRequest(null);
            queryClient.invalidateQueries(['company-registrations']);
            // Also invalidate companies since a new company gets created/updated when approved
            queryClient.invalidateQueries(['companies']);
        },
        onError: (err) => message.error(err.response?.data?.message || 'Có lỗi xảy ra')
    });

    // Main Tab change handler
    const handleMainTabChange = (key) => {
        setSearchParams({ tab: key });
    };

    // TAB 1 Handlers
    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleTabChange = (key) => {
        setStatusFilter(key);
        setPagination({ ...pagination, current: 1 });
    };

    // TAB 2 Handlers
    const handleApprove = (id) => {
        approvalStatusMutation.mutate({ id, status: 'APPROVED' });
    };

    const handleRejectClick = (id) => {
        setSelectedIdToReject(id);
        setIsRejectModalOpen(true);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
        }
        approvalStatusMutation.mutate({ id: selectedIdToReject, status: 'REJECTED', reason: rejectReason });
    };

    const handleApprovalTableChange = (newPagination) => {
        setApprovalPagination(newPagination);
    };

    const handleApprovalTabChange = (key) => {
        setApprovalActiveTab(key);
        setApprovalPagination(prev => ({ ...prev, current: 1 }));
    };

    // TAB 1 Columns
    const companyColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Tên Công Ty',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-semibold text-gray-800">{text}</span>
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                switch (status) {
                    case 'PENDING':
                        return <Tag color="warning">Chờ duyệt</Tag>;
                    case 'APPROVED':
                        return <Tag color="success">Đã duyệt</Tag>;
                    case 'REJECTED':
                        return <Tag color="error">Từ chối</Tag>;
                    case 'LOCKED':
                        return <Tag color="default">Bị khóa</Tag>;
                    default:
                        return <Tag color="warning">Chờ duyệt</Tag>;
                }
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                const status = record.status || 'PENDING';
                
                if (status === 'PENDING') {
                    return (
                        <Space>
                            <Popconfirm title="Duyệt công ty này?" onConfirm={() => changeStatusMutation.mutate({ id: record.id, status: 'APPROVED' })}>
                                <Button type="primary" className="bg-green-600 hover:bg-green-700 border-none" size="small" icon={<CheckCircleOutlined />}>Duyệt</Button>
                            </Popconfirm>
                            <Popconfirm title="Từ chối công ty này?" onConfirm={() => changeStatusMutation.mutate({ id: record.id, status: 'REJECTED' })}>
                                <Button danger size="small" icon={<CloseCircleOutlined />}>Từ chối</Button>
                            </Popconfirm>
                        </Space>
                    );
                }
                if (status === 'APPROVED') {
                    return (
                        <Popconfirm title="Khóa công ty này?" onConfirm={() => changeStatusMutation.mutate({ id: record.id, status: 'LOCKED' })}>
                            <Button size="small" className="text-gray-500 border-gray-300" icon={<LockOutlined />}>Khóa</Button>
                        </Popconfirm>
                    );
                }
                if (status === 'LOCKED') {
                    return (
                        <Popconfirm title="Mở khóa công ty này?" onConfirm={() => changeStatusMutation.mutate({ id: record.id, status: 'APPROVED' })}>
                            <Button type="primary" size="small" className="bg-blue-600 hover:bg-blue-700 border-none" icon={<UnlockOutlined />}>Mở khóa</Button>
                        </Popconfirm>
                    );
                }
                if (status === 'REJECTED') {
                    return (
                        <Popconfirm title="Duyệt lại công ty này?" onConfirm={() => changeStatusMutation.mutate({ id: record.id, status: 'APPROVED' })}>
                            <Button type="primary" size="small" className="bg-blue-600 hover:bg-blue-700 border-none" icon={<ReloadOutlined />}>Duyệt lại</Button>
                        </Popconfirm>
                    );
                }
                return null;
            },
        },
    ];

    // TAB 2 Columns
    const approvalColumns = [
        {
            title: 'Tên Công Ty',
            dataIndex: 'companyName',
            key: 'companyName',
            render: (text, record) => (
                <div>
                    <div className="font-semibold text-brand-900">{text}</div>
                    <div className="text-gray-500 text-xs">{record.description?.substring(0, 50)}...</div>
                </div>
            )
        },
        {
            title: 'Người Gửi',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-800">{user?.name}</div>
                    <div className="text-gray-500 text-xs">{user?.email}</div>
                </div>
            )
        },
        {
            title: 'Tài liệu',
            dataIndex: 'verificationDocument',
            key: 'verificationDocument',
            render: (doc) => doc ? (
                <Button 
                    type="link" 
                    onClick={() => openPDFDirectly(doc, 'company')} 
                    className="text-brand-900 p-0 hover:underline flex items-center gap-1 font-medium"
                    icon={<FileTextOutlined />}
                >
                    Xem
                </Button>
            ) : <span className="text-gray-400">Không có</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                if (status === 'APPROVED') return <Tag color="success">Đã phê duyệt</Tag>;
                if (status === 'REJECTED') {
                    return (
                        <Tooltip title={record.rejectionReason || 'Không có lý do'}>
                            <Tag color="error" className="cursor-pointer">Bị từ chối</Tag>
                        </Tooltip>
                    );
                }
                return <Tag color="warning">Chờ phê duyệt</Tag>;
            }
        },
        {
            title: 'Ngày gửi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button icon={<EyeOutlined />} onClick={() => setViewingRequest(record)} />
                    </Tooltip>
                    {record.status === 'PENDING' && (
                        <>
                            <Tooltip title="Phê duyệt">
                                <Popconfirm
                                    title="Phê duyệt công ty này?"
                                    onConfirm={() => handleApprove(record.id)}
                                    okText="Có"
                                    cancelText="Không"
                                >
                                    <Button type="primary" className="bg-green-600 hover:bg-green-700 border-none animate-pulse" icon={<CheckOutlined />} />
                                </Popconfirm>
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button danger icon={<CloseOutlined />} onClick={() => handleRejectClick(record.id)} />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const companiesSource = companiesData?.data?.result || [];
    const companiesTotal = companiesData?.data?.meta?.total || 0;

    const approvalsSource = approvalsData?.data?.result || [];
    const approvalsTotal = approvalsData?.data?.meta?.total || 0;

    const companyTabItems = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'APPROVED', label: 'Đã duyệt / Hoạt động' },
        { key: 'LOCKED', label: 'Bị khóa' },
    ];

    const approvalTabItems = [
        { key: 'PENDING', label: 'Chờ phê duyệt' },
        { key: 'APPROVED', label: 'Đã phê duyệt' },
        { key: 'REJECTED', label: 'Bị từ chối' }
    ];

    const mainItems = [
        {
            key: 'list',
            label: (
                <span className="flex items-center gap-2 text-base font-semibold px-2 py-1">
                    <Building2 size={18} />
                    Danh sách Công ty
                </span>
            ),
            children: (
                <div className="space-y-4 pt-2">
                    <div className="mb-2">
                        <Tabs items={companyTabItems} activeKey={statusFilter} onChange={handleTabChange} />
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="w-full sm:w-96 relative group">
                            <Input.Search
                                placeholder="Nhập tên công ty để tìm kiếm..."
                                onSearch={handleSearch}
                                enterButton={
                                    <Button type="primary" className="bg-brand-900 hover:bg-brand-800 border-none flex items-center justify-center">
                                        <SearchOutlined /> Tìm kiếm
                                    </Button>
                                }
                                allowClear
                                size="large"
                            />
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                            Tổng số: <span className="text-brand-900 font-bold text-base ml-1">{companiesTotal}</span> công ty
                        </div>
                    </div>

                    <Table
                        columns={companyColumns}
                        dataSource={companiesSource}
                        rowKey="id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: companiesTotal,
                            showSizeChanger: true,
                        }}
                        loading={isCompaniesLoading}
                        onChange={handleTableChange}
                    />
                </div>
            )
        },
        {
            key: 'approvals',
            label: (
                <span className="flex items-center gap-2 text-base font-semibold px-2 py-1">
                    <ClipboardCheck size={18} />
                    Yêu cầu phê duyệt
                </span>
            ),
            children: (
                <div className="space-y-4 pt-2">
                    <Tabs activeKey={approvalActiveTab} items={approvalTabItems} onChange={handleApprovalTabChange} className="mb-2" />
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-600">
                            Danh sách các yêu cầu đăng ký kinh doanh/thương hiệu từ nhà tuyển dụng
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                            Tổng yêu cầu: <span className="text-brand-900 font-bold ml-1">{approvalsTotal}</span>
                        </div>
                    </div>

                    <Table
                        columns={approvalColumns}
                        dataSource={approvalsSource}
                        rowKey="id"
                        pagination={{
                            current: approvalPagination.current,
                            pageSize: approvalPagination.pageSize,
                            total: approvalsTotal,
                            showSizeChanger: true,
                        }}
                        loading={isApprovalsLoading}
                        onChange={handleApprovalTableChange}
                    />
                </div>
            )
        }
    ];

    return (
        <Card 
            title={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                    <span className="text-xl font-extrabold text-gray-800 tracking-tight">Cổng Quản lý & Phê duyệt Công ty</span>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Hệ thống JobHunter</span>
                </div>
            }
            className="shadow-md rounded-2xl border border-blue-50/80 bg-white"
        >
            <Tabs 
                activeKey={activeMainTab} 
                items={mainItems} 
                onChange={handleMainTabChange} 
                type="card"
                className="custom-main-tabs"
            />

            {/* Reject Modal */}
            <Modal
                title="Từ chối yêu cầu đăng ký"
                open={isRejectModalOpen}
                onCancel={() => setIsRejectModalOpen(false)}
                onOk={confirmReject}
                okText="Xác nhận từ chối"
                okButtonProps={{ danger: true, loading: approvalStatusMutation.isPending }}
            >
                <div className="space-y-2 pt-2">
                    <p className="text-sm text-gray-500">Vui lòng nhập lý do từ chối yêu cầu đăng ký này để nhà tuyển dụng có thể sửa đổi và gửi lại.</p>
                    <Input.TextArea
                        placeholder="Nhập lý do từ chối cụ thể..."
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="rounded-lg"
                    />
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu đăng ký công ty"
                open={!!viewingRequest}
                onCancel={() => setViewingRequest(null)}
                footer={viewingRequest?.status === 'PENDING' ? [
                    <Button key="reject" danger onClick={() => {
                        handleRejectClick(viewingRequest.id);
                        setViewingRequest(null);
                    }}>
                        Từ chối
                    </Button>,
                    <Button key="approve" type="primary" className="bg-green-600 hover:bg-green-700 border-none" onClick={() => {
                        handleApprove(viewingRequest.id);
                        setViewingRequest(null);
                    }}>
                        Phê duyệt
                    </Button>,
                ] : [
                    <Button key="close" onClick={() => setViewingRequest(null)}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {viewingRequest && (
                    <div className="space-y-4 pt-4 border-t mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Tên công ty</label>
                                <div className="font-bold text-lg text-brand-900">{viewingRequest.companyName}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Trạng thái phê duyệt</label>
                                <div className="mt-1">
                                    {viewingRequest.status === 'APPROVED' && <Tag color="success">Đã phê duyệt</Tag>}
                                    {viewingRequest.status === 'REJECTED' && <Tag color="error">Bị từ chối</Tag>}
                                    {viewingRequest.status === 'PENDING' && <Tag color="warning">Đang chờ</Tag>}
                                </div>
                            </div>
                        </div>

                        {viewingRequest.status === 'REJECTED' && (
                            <div className="bg-red-50 p-4 rounded-xl text-red-700 border border-red-100">
                                <label className="text-xs font-bold uppercase tracking-wider block mb-1">Lý do từ chối:</label>
                                <div className="whitespace-pre-wrap text-sm">{viewingRequest.rejectionReason || 'Không có lý do cụ thể'}</div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Địa chỉ</label>
                            <div className="font-medium text-gray-700">{viewingRequest.address}</div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Mô tả chi tiết</label>
                            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 whitespace-pre-wrap border border-gray-100 text-sm">
                                {viewingRequest.description || 'Không có mô tả.'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4 border-gray-100">
                            <div>
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Facebook</label>
                                <a href={viewingRequest.facebookLink} target="_blank" rel="noreferrer" className="text-brand-900 hover:underline truncate block text-sm">
                                    {viewingRequest.facebookLink || 'Không có'}
                                </a>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Github/Website</label>
                                <a href={viewingRequest.githubLink} target="_blank" rel="noreferrer" className="text-brand-900 hover:underline truncate block text-sm">
                                    {viewingRequest.githubLink || 'Không có'}
                                </a>
                            </div>
                        </div>

                        <div className="border-t pt-4 border-gray-100">
                            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">Tài liệu xác thực đăng ký</label>
                            {viewingRequest.verificationDocument ? (
                                <Button 
                                    type="link" 
                                    onClick={() => openPDFDirectly(viewingRequest.verificationDocument, 'company')} 
                                    className="text-brand-900 p-0 hover:underline flex items-center gap-1.5 font-bold text-sm"
                                    icon={<FileTextOutlined />}
                                >
                                    Xem tài liệu xác thực (PDF)
                                </Button>
                            ) : (
                                <span className="text-gray-400 text-sm">Không có tài liệu đính kèm</span>
                            )}
                        </div>

                        {viewingRequest.logo && (
                            <div className="border-t pt-4 border-gray-100">
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">Ảnh Logo Công ty</label>
                                <img src={getFileUrl(viewingRequest.logo, 'company')} alt="Company Logo" className="h-24 object-contain border border-gray-100 rounded-xl p-2 bg-white shadow-sm" />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default CompanyManagement;
