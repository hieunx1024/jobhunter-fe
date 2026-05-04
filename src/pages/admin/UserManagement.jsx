import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Card, Tag, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UserOutlined, TeamOutlined, SolutionOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const UserManagement = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Pagination state
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch Users
    const { data, isLoading } = useQuery({
        queryKey: ['users', pagination.current, pagination.pageSize, searchText, roleFilter],
        queryFn: async () => {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
            };
            
            let filters = [];
            if (searchText) {
                filters.push(`(email~~'${searchText}' or name~~'${searchText}')`);
            }
            if (roleFilter !== 'ALL') {
                filters.push(`role.name:'${roleFilter}'`);
            }
            
            if (filters.length > 0) {
                params.filter = filters.join(' and ');
            }
            
            const res = await axiosClient.get(ENDPOINTS.USERS.BASE, { params });
            return res.data;
        },
    });

    // Create User
    const createMutation = useMutation({
        mutationFn: (values) => axiosClient.post(ENDPOINTS.USERS.BASE, values),
        onSuccess: () => {
            message.success('Tạo User thành công');
            handleCancel();
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    // Update User
    const updateMutation = useMutation({
        mutationFn: (values) => axiosClient.put(ENDPOINTS.USERS.BASE, { ...values, id: editingId }),
        onSuccess: () => {
            message.success('Cập nhật User thành công');
            handleCancel();
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    // Update User Status
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => axiosClient.put(`${ENDPOINTS.USERS.BASE}/${id}/status`, { status }),
        onSuccess: () => {
            message.success('Cập nhật trạng thái người dùng thành công');
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    // Handlers
    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleTabChange = (key) => {
        setRoleFilter(key);
        setPagination({ ...pagination, current: 1 });
    };

    const handleStatusToggle = (record) => {
        const newStatus = record.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        updateStatusMutation.mutate({ id: record.id, status: newStatus });
    };

    // Columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Người dùng',
            key: 'user_info',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-900 font-bold border border-blue-100">
                        {record.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{record.name}</span>
                        <span className="text-gray-500 text-xs">{record.email}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                if (!role) return <Tag>N/A</Tag>;
                const roleName = role.name;
                let color = "default";
                let icon = <UserOutlined />;
                
                if (roleName === 'SUPER_ADMIN') {
                    color = "purple";
                    icon = <SafetyCertificateOutlined />;
                } else if (roleName === 'HR') {
                    color = "blue";
                    icon = <TeamOutlined />;
                } else if (roleName === 'CANDIDATE') {
                    color = "green";
                    icon = <SolutionOutlined />;
                }
                
                return (
                    <Tag icon={icon} color={color} className="font-bold border-0 px-3 py-0.5 rounded-lg uppercase text-[11px] tracking-wide">
                        {roleName}
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = "default";
                let text = "Chưa xác định";
                if (status === 'ACTIVE') {
                    color = "success";
                    text = "Hoạt động";
                } else if (status === 'LOCKED') {
                    color = "error";
                    text = "Bị khóa";
                } else if (status === 'PENDING') {
                    color = "warning";
                    text = "Chờ xác thực";
                }
                return <Tag color={color} className="font-medium rounded-full px-3">{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => {
                // Don't allow locking yourself (Admin)
                if (record.email === 'admin@gmail.com' || record.role?.name === 'SUPER_ADMIN') return null;

                const isLocked = record.status === 'LOCKED';
                
                return (
                    <Space size="middle">
                        <Popconfirm
                            title={isLocked ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?"}
                            description={isLocked ? "Người dùng sẽ có thể đăng nhập lại vào hệ thống." : "Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa."}
                            onConfirm={() => handleStatusToggle(record)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                            okButtonProps={{ danger: !isLocked }}
                        >
                            <Button 
                                type={isLocked ? "primary" : "default"}
                                ghost={isLocked}
                                danger={!isLocked}
                                size="small"
                                icon={isLocked ? <SafetyCertificateOutlined /> : <DeleteOutlined />}
                                className="rounded-lg flex items-center font-medium"
                            >
                                {isLocked ? 'Mở khóa' : 'Khóa User'}
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const dataSource = data?.data?.result || [];
    const total = data?.data?.meta?.total || 0;

    const tabItems = [
        { key: 'ALL', label: 'Tất cả người dùng' },
        { key: 'SUPER_ADMIN', label: 'Admin' },
        { key: 'HR', label: 'HR' },
        { key: 'CANDIDATE', label: 'Candidate' },
    ];

    return (
        <Card 
            title={<span className="text-xl font-bold text-gray-800">Quản lý Tài khoản</span>} 
            className="shadow-sm rounded-2xl border-blue-100"
        >
            <div className="mb-2">
                <Tabs items={tabItems} activeKey={roleFilter} onChange={handleTabChange} />
            </div>

            <div className="mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:w-96 relative group">
                    <Input.Search
                        placeholder="Tìm kiếm tài khoản..."
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
                <div className="flex gap-4 items-center">
                    <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        Tổng số: <span className="text-brand-900 font-bold text-base ml-1">{total}</span>
                    </div>
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
                scroll={{ x: 800 }}
            />
        </Card>
    );
};

export default UserManagement;
