import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const CompanyManagement = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch Companies
    const { data, isLoading } = useQuery({
        queryKey: ['companies', pagination.current, pagination.pageSize, searchText],
        queryFn: async () => {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
            };
            if (searchText) {
                params.filter = `name~'${searchText}'`;
            }
            const res = await axiosClient.get(ENDPOINTS.COMPANIES.BASE, { params });
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (values) => axiosClient.post(ENDPOINTS.COMPANIES.BASE, values),
        onSuccess: () => {
            message.success('Tạo Công ty thành công');
            handleCancel();
            queryClient.invalidateQueries(['companies']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (values) => axiosClient.put(ENDPOINTS.COMPANIES.BASE, { ...values, id: editingId }),
        onSuccess: () => {
            message.success('Cập nhật Công ty thành công');
            handleCancel();
            queryClient.invalidateQueries(['companies']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosClient.delete(ENDPOINTS.COMPANIES.GET_ONE(id)),
        onSuccess: () => {
            message.success('Xóa Công ty thành công');
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

    const showModal = (record = null) => {
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue(record);
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
            updateMutation.mutate(values);
        } else {
            createMutation.mutate(values);
        }
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
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        type="text"
                        className="text-brand-900"
                    />
                    <Popconfirm
                        title="Xóa công ty này?"
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
        <Card title="Quản lý Công ty" extra={
            <Button type="primary" style={{ backgroundColor: "#102a43", borderColor: "#102a43" }} icon={<PlusOutlined />} onClick={() => showModal()}>
                Thêm mới
            </Button>
        }>
            <div className="mb-4">
                <Input.Search
                    placeholder="Tìm kiếm công ty..."
                    onSearch={handleSearch}
                    enterButton={<SearchOutlined />}
                    allowClear
                    className="max-w-md"
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
            />

            <Modal
                title={editingId ? "Cập nhật Công ty" : "Tạo Công ty mới"}
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
                        label="Tên Công ty"
                        rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CompanyManagement;
