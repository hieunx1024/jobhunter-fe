import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Space, Popconfirm, message, Card, Tabs, Tag } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, LockOutlined, UnlockOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const CompanyManagement = () => {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch Companies
    const { data, isLoading } = useQuery({
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

    const columns = [
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
                                <Button type="primary" className="bg-green-600 hover:bg-green-700" size="small" icon={<CheckCircleOutlined />}>Duyệt</Button>
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
                            <Button type="primary" size="small" className="bg-blue-600 hover:bg-blue-700" icon={<UnlockOutlined />}>Mở khóa</Button>
                        </Popconfirm>
                    );
                }
                if (status === 'REJECTED') {
                    return (
                        <Popconfirm title="Duyệt lại công ty này?" onConfirm={() => changeStatusMutation.mutate({ id: record.id, status: 'APPROVED' })}>
                            <Button type="primary" size="small" className="bg-blue-600 hover:bg-blue-700" icon={<ReloadOutlined />}>Duyệt lại</Button>
                        </Popconfirm>
                    );
                }
                return null;
            },
        },
    ];

    const dataSource = data?.data?.result || [];
    const total = data?.data?.meta?.total || 0;

    const tabItems = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'PENDING', label: 'Chờ duyệt' },
        { key: 'APPROVED', label: 'Đã duyệt' },
        { key: 'REJECTED', label: 'Từ chối' },
        { key: 'LOCKED', label: 'Bị khóa' },
    ];

    return (
        <Card 
            title={<span className="text-xl font-bold text-gray-800">Duyệt & Quản lý Công ty</span>} 
            className="shadow-sm rounded-2xl border-blue-100"
        >
            <div className="mb-2">
                <Tabs items={tabItems} activeKey={statusFilter} onChange={handleTabChange} />
            </div>

            <div className="mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:w-96 relative group">
                    <Input.Search
                        placeholder="Nhập tên công ty để tìm kiếm..."
                        onSearch={handleSearch}
                        enterButton={
                            <Button type="primary" className="bg-brand-900 flex items-center justify-center">
                                <SearchOutlined /> Tìm kiếm
                            </Button>
                        }
                        allowClear
                        size="large"
                    />
                </div>
                <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                    Tổng số: <span className="text-brand-900 font-bold text-base ml-1">{total}</span> công ty
                </div>
            </div>

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
        </Card>
    );
};

export default CompanyManagement;
