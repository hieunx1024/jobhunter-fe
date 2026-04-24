import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Card, DatePicker, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import dayjs from 'dayjs';

const JobManagement = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch Jobs
    const { data, isLoading } = useQuery({
        queryKey: ['admin-jobs', pagination.current, pagination.pageSize, searchText],
        queryFn: async () => {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
            };
            if (searchText) {
                params.filter = `name~'${searchText}'`;
            }
            const res = await axiosClient.get(ENDPOINTS.JOBS.BASE, { params });
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (values) => axiosClient.post(ENDPOINTS.JOBS.BASE, values),
        onSuccess: () => {
            message.success('Tạo Job thành công');
            handleCancel();
            queryClient.invalidateQueries(['admin-jobs']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (values) => axiosClient.put(ENDPOINTS.JOBS.BASE, { ...values, id: editingId }),
        onSuccess: () => {
            message.success('Cập nhật Job thành công');
            handleCancel();
            queryClient.invalidateQueries(['admin-jobs']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosClient.delete(ENDPOINTS.JOBS.GET_ONE(id)),
        onSuccess: () => {
            message.success('Xóa Job thành công');
            queryClient.invalidateQueries(['admin-jobs']);
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
            form.setFieldsValue({
                ...record,
                startDate: record.startDate ? dayjs(record.startDate) : null,
                endDate: record.endDate ? dayjs(record.endDate) : null,
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
        // Convert dates back to ISO string or whatever backend expects
        // Backend seems to expect ISO strings based on previous code
        const submitData = {
            ...values,
            startDate: values.startDate ? values.startDate.toISOString() : null,
            endDate: values.endDate ? values.endDate.toISOString() : null,
        };

        if (editingId) {
            updateMutation.mutate(submitData);
        } else {
            createMutation.mutate(submitData);
        }
    };

    const columns = [
        {
            title: 'Tên Job',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mức lương',
            dataIndex: 'salary',
            key: 'salary',
            render: (val) => val?.toLocaleString()
        },
        {
            title: 'Địa điểm',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            render: (level) => <Tag color="blue">{level}</Tag>
        },
        {
            title: 'Công ty',
            dataIndex: 'company',
            key: 'company',
            render: (company) => company?.name || 'N/A'
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
                        title="Xóa job này?"
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
        <Card title="Quản lý Việc Làm" extra={
            <Button type="primary" style={{ backgroundColor: "#102a43", borderColor: "#102a43" }} icon={<PlusOutlined />} onClick={() => showModal()}>
                Thêm mới
            </Button>
        }>
            <div className="mb-4">
                <Input.Search
                    placeholder="Tìm kiếm job..."
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
                scroll={{ x: 1000 }}
            />

            <Modal
                title={editingId ? "Cập nhật Job" : "Tạo Job mới"}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={form.submit}
                width={800}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="name"
                        label="Tên công việc"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="salary"
                            label="Mức lương"
                            rules={[{ required: true }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item
                            name="quantity"
                            label="Số lượng"
                            rules={[{ required: true }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="location"
                            label="Địa điểm"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="level"
                            label="Level"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Select.Option value="INTERN">Intern</Select.Option>
                                <Select.Option value="FRESHER">Fresher</Select.Option>
                                <Select.Option value="JUNIOR">Junior</Select.Option>
                                <Select.Option value="MIDDLE">Middle</Select.Option>
                                <Select.Option value="SENIOR">Senior</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="startDate"
                            label="Ngày bắt đầu"
                            rules={[{ required: true }]}
                        >
                            <DatePicker className="w-full" />
                        </Form.Item>
                        <Form.Item
                            name="endDate"
                            label="Ngày kết thúc"
                            rules={[{ required: true }]}
                        >
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default JobManagement;
