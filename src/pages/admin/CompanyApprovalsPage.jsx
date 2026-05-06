import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Input, Space, Popconfirm, message, Card, Tooltip, Tag, Tabs } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { openPDFDirectly, getFileUrl } from '../../utils/fileUtils';

const CompanyApprovalsPage = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('PENDING');
    const [viewingRequest, setViewingRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedIdToReject, setSelectedIdToReject] = useState(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch Registrations dynamically based on selected tab status
    const { data, isLoading } = useQuery({
        queryKey: ['company-registrations', activeTab, pagination.current, pagination.pageSize],
        queryFn: async () => {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
                filter: `status:'${activeTab}'`
            };
            const res = await axiosClient.get(ENDPOINTS.COMPANY_REGISTRATIONS.BASE, { params });
            return res.data;
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status, reason }) => axiosClient.put(ENDPOINTS.COMPANY_REGISTRATIONS.STATUS(id),
            reason ? reason : {},
            { params: { status } }
        ),
        onSuccess: () => {
            message.success('Cập nhật trạng thái thành công');
            setIsRejectModalOpen(false);
            setRejectReason('');
            setViewingRequest(null);
            queryClient.invalidateQueries(['company-registrations']);
        },
        onError: (err) => message.error(err.response?.data?.message || 'Có lỗi xảy ra')
    });

    const handleApprove = (id) => {
        statusMutation.mutate({ id, status: 'APPROVED' });
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
        statusMutation.mutate({ id: selectedIdToReject, status: 'REJECTED', reason: rejectReason });
    };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const tabItems = [
        {
            key: 'PENDING',
            label: 'Chờ phê duyệt',
        },
        {
            key: 'APPROVED',
            label: 'Đã phê duyệt',
        },
        {
            key: 'REJECTED',
            label: 'Bị từ chối',
        }
    ];

    const columns = [
        {
            title: 'Tên Công Ty',
            dataIndex: 'companyName',
            key: 'companyName',
            render: (text, record) => (
                <div>
                    <div className="font-medium text-brand-900">{text}</div>
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
                    <div>{user?.name}</div>
                    <div className="text-gray-500">{user?.email}</div>
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
                    className="text-brand-900 p-0 hover:underline flex items-center gap-1"
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
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="primary" style={{ backgroundColor: "#102a43", borderColor: "#102a43" }} icon={<CheckOutlined />} className="bg-green-600" />
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

    const dataSource = data?.data?.result || [];
    const total = data?.data?.meta?.total || 0;

    return (
        <Card title="Phê duyệt Công ty">
            <Tabs activeKey={activeTab} items={tabItems} onChange={handleTabChange} className="mb-4" />
            
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: total,
                    showSizeChanger: true,
                }}
                loading={isLoading}
                onChange={handleTableChange}
            />

            {/* Reject Modal */}
            <Modal
                title="Từ chối yêu cầu"
                open={isRejectModalOpen}
                onCancel={() => setIsRejectModalOpen(false)}
                onOk={confirmReject}
                okText="Xác nhận từ chối"
                okButtonProps={{ danger: true, loading: statusMutation.isPending }}
            >
                <Input.TextArea
                    placeholder="Nhập lý do từ chối..."
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết đăng ký"
                open={!!viewingRequest}
                onCancel={() => setViewingRequest(null)}
                footer={viewingRequest?.status === 'PENDING' ? [
                    <Button key="reject" danger onClick={() => {
                        handleRejectClick(viewingRequest.id);
                        setViewingRequest(null);
                    }}>
                        Từ chối
                    </Button>,
                    <Button key="approve" type="primary" style={{ backgroundColor: "#102a43", borderColor: "#102a43" }} className="bg-green-600" onClick={() => {
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
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500 block">Tên công ty</label>
                                <div className="font-medium text-lg text-brand-900">{viewingRequest.companyName}</div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Trạng thái</label>
                                <div className="mt-1">
                                    {viewingRequest.status === 'APPROVED' && <Tag color="success">Đã phê duyệt</Tag>}
                                    {viewingRequest.status === 'REJECTED' && <Tag color="error">Bị từ chối</Tag>}
                                    {viewingRequest.status === 'PENDING' && <Tag color="warning">Đang chờ</Tag>}
                                </div>
                            </div>
                        </div>

                        {viewingRequest.status === 'REJECTED' && (
                            <div className="bg-red-50 p-4 rounded text-red-700 border border-red-100">
                                <label className="text-sm font-semibold block mb-1">Lý do từ chối:</label>
                                <div className="whitespace-pre-wrap">{viewingRequest.rejectionReason || 'Không có lý do cụ thể'}</div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm text-gray-500 block">Địa chỉ</label>
                            <div className="font-medium">{viewingRequest.address}</div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-500 block">Mô tả</label>
                            <div className="bg-gray-50 p-4 rounded text-gray-700 whitespace-pre-wrap border">
                                {viewingRequest.description || 'Không có mô tả.'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div>
                                <label className="text-sm text-gray-500 block">Facebook</label>
                                <a href={viewingRequest.facebookLink} target="_blank" rel="noreferrer" className="text-brand-900 hover:underline truncate block">
                                    {viewingRequest.facebookLink || 'N/A'}
                                </a>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Github/Website</label>
                                <a href={viewingRequest.githubLink} target="_blank" rel="noreferrer" className="text-brand-900 hover:underline truncate block">
                                    {viewingRequest.githubLink || 'N/A'}
                                </a>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <label className="text-sm text-gray-500 block">Tài liệu xác thực</label>
                            {viewingRequest.verificationDocument ? (
                                <Button 
                                    type="link" 
                                    onClick={() => openPDFDirectly(viewingRequest.verificationDocument, 'company')} 
                                    className="text-brand-900 p-0 hover:underline flex items-center gap-1.5 font-semibold text-sm"
                                    icon={<FileTextOutlined />}
                                >
                                    Xem tài liệu xác thực
                                </Button>
                            ) : (
                                <span className="text-gray-400">Không có</span>
                            )}
                        </div>

                        {viewingRequest.logo && (
                            <div className="border-t pt-4">
                                <label className="text-sm text-gray-500 block mb-2">Logo</label>
                                <img src={getFileUrl(viewingRequest.logo, 'company')} alt="Company Logo" className="h-24 object-contain border rounded p-2 bg-white" />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default CompanyApprovalsPage;
