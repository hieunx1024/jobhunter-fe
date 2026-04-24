import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Card, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const UserManagement = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');

    // Pagination state
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch Users
    const { data, isLoading } = useQuery({
        queryKey: ['users', pagination.current, pagination.pageSize, searchText],
        queryFn: async () => {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
            };
            if (searchText) {
                params.filter = `email~'${searchText}' or name~'${searchText}'`;
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

    // Delete User
    const deleteMutation = useMutation({
        mutationFn: (id) => axiosClient.delete(ENDPOINTS.USERS.GET_ONE(id)),
        onSuccess: () => {
            message.success('Xóa User thành công');
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

    const showModal = (record = null) => {
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue({
                ...record,
                password: '', // Don't show password
            });
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingId(null);
        form.resetFields();
    };

    const onFinish = (values) => {
        if (editingId) {
            if (!values.password) delete values.password;
            updateMutation.mutate(values);
        } else {
            createMutation.mutate(values);
        }
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
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => {
                let color = text === 'MALE' ? '#1e293b' : text === 'FEMALE' ? '#475569' : '#94a3b8';
                return <Tag color={color} className="uppercase font-bold text-[10px] tracking-wider">{text}</Tag>;
            }
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => role ? <Tag color="#0f172a" className="font-bold text-[10px] tracking-wider uppercase">{role.name}</Tag> : 'N/A',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        type="text"
                        className="text-gray-600 hover:text-indigo-900 transition-colors"
                    />
                    <Popconfirm
                        title="Xóa user này?"
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} type="text" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const dataSource = data?.data?.result || [];
    const total = data?.data?.meta?.total || 0;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-900 tracking-tight m-0">Quản lý người dùng</h1>
                    <p className="text-gray-500 mt-1">Quản lý tài khoản và phân quyền cho toàn bộ hệ thống.</p>
                </div>
                <Button 
                    type="primary" 
                    style={{ backgroundColor: "#102a43", borderColor: "#102a43" }} 
                    icon={<PlusOutlined />} 
                    onClick={() => showModal()}
                    className="bg-brand-900 hover:bg-brand-900 h-10 px-6 font-bold flex items-center gap-2 border-0"
                >
                    Thêm mới
                </Button>
            </header>

            <Card className="shadow-sm border-blue-100">
                <div className="mb-6">
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        onChange={(e) => handleSearch(e.target.value)}
                        prefix={<SearchOutlined className="text-gray-400" />}
                        allowClear
                        className="max-w-md h-10"
                    />
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

            <Modal
                title={editingId ? "Cập nhật User" : "Tạo User mới"}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={form.submit}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="name"
                        label="Họ tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input disabled={!!editingId} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: !editingId, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                        <Input.Password placeholder={editingId ? "Để trống nếu không đổi" : ""} />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="age"
                            label="Tuổi"
                            rules={[{ required: true, message: 'Nhập tuổi' }]}
                        >
                            <Input type="number" />
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[{ required: true, message: 'Chọn giới tính' }]}
                        >
                            <Select>
                                <Select.Option value="MALE">Nam</Select.Option>
                                <Select.Option value="FEMALE">Nữ</Select.Option>
                                <Select.Option value="OTHER">Khác</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
