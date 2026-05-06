import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Popconfirm, message, Card, Tag, Input } from 'antd';
import { DeleteOutlined, SearchOutlined, EnvironmentOutlined, BankOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const JobManagement = () => {
    const queryClient = useQueryClient();
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
                params.filter = `name~~'${searchText}'`;
            }
            const res = await axiosClient.get(ENDPOINTS.JOBS.BASE, { params });
            return res.data;
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

    const columns = [
        {
            title: 'Việc làm',
            key: 'job_info',
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-base">{record.name}</span>
                    <span className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                        <BankOutlined /> {record.company?.name || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            title: 'Mức lương',
            dataIndex: 'salary',
            key: 'salary',
            render: (val) => (
                <span className="inline-flex items-center text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/60 text-xs">
                    {val ? `${val.toLocaleString()} VNĐ` : 'Thỏa thuận'}
                </span>
            )
        },
        {
            title: 'Địa điểm',
            dataIndex: 'location',
            key: 'location',
            render: (text) => (
                <div className="flex items-center gap-1.5 text-gray-600">
                    <EnvironmentOutlined className="text-red-400" />
                    {text}
                </div>
            )
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            render: (level) => {
                let color = "default";
                if (level === 'SENIOR') color = "volcano";
                else if (level === 'MIDDLE') color = "blue";
                else if (level === 'JUNIOR') color = "cyan";
                else color = "green";
                
                return <Tag bordered={false} color={color} className="font-bold px-3 rounded-md">{level}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title="Xóa công việc này?"
                        description="Hành động này không thể hoàn tác. Các ứng tuyển liên quan có thể bị ảnh hưởng."
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Xác nhận xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            icon={<DeleteOutlined />} 
                            type="text" 
                            danger 
                            className="hover:bg-red-50 flex items-center justify-center h-9 w-9 rounded-lg"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const dataSource = data?.data?.result || [];
    const total = data?.data?.meta?.total || 0;

    return (
        <Card 
            title={<span className="text-xl font-bold text-gray-800">Quản lý Việc Làm</span>}
            className="shadow-sm rounded-2xl border-blue-100"
        >
            <div className="mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:w-96 relative group">
                    <Input.Search
                        placeholder="Tìm kiếm theo tiêu đề công việc..."
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
                    Đang hiển thị: <span className="text-brand-900 font-bold text-base ml-1">{total}</span> vị trí tuyển dụng
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
                scroll={{ x: 1000 }}
            />
        </Card>
    );
};

export default JobManagement;
