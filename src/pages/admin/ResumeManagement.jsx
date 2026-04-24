import { useState, useEffect } from 'react';
import { Modal, Select, message, Tag, Button, Space, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import AdminTable from '../../components/AdminTable';
import { openPDFDirectly } from '../../utils/fileUtils';
import axios from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import dayjs from 'dayjs';

const { Option } = Select;

const ResumeManagement = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);

    useEffect(() => {
        fetchResumes();
    }, [pagination.current, pagination.pageSize, filterStatus]);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(ENDPOINTS.RESUMES.BASE, {
                params: {
                    page: pagination.current,
                    size: pagination.pageSize,
                }
            });

            // Adjust based on the actual API pagination meta
            let resumes = response.data?.result || response.data?.data?.result || [];
            let total = response.data?.meta?.total || response.data?.data?.meta?.total || 0;

            if (filterStatus) {
                resumes = resumes.filter(r => r.status === filterStatus);
            }

            setData(resumes);
            setPagination(prev => ({
                ...prev,
                total: total
            }));
        } catch (error) {
            message.error('Không thể tải danh sách hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (record) => {
        setSelectedResume(record);
        setIsModalOpen(true);
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'orange',
            REVIEWING: 'blue',
            APPROVED: 'green',
            REJECTED: 'red',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            PENDING: 'Chờ xử lý',
            REVIEWING: 'Đang xem xét',
            APPROVED: 'Đã duyệt',
            REJECTED: 'Từ chối',
        };
        return texts[status] || status;
    };

    const handleViewCV = (fileName) => {
        openPDFDirectly(fileName, 'resume');
    };

    const columns = [
        {
            title: 'Ứng viên',
            dataIndex: ['user', 'name'],
            key: 'userName',
            render: (name) => name || 'N/A'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Công việc',
            dataIndex: ['job', 'name'],
            key: 'jobName',
            render: (name) => name || 'N/A'
        },
        {
            title: 'Công ty',
            dataIndex: ['job', 'company', 'name'],
            key: 'companyName',
            render: (name) => name || 'N/A'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A',
        },
        {
            title: 'CV',
            dataIndex: 'url',
            key: 'url',
            render: (url) => url ? (
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        handleViewCV(url);
                    }}
                    className="text-brand-900 hover:underline cursor-pointer"
                >
                    Xem CV
                </a>
            ) : 'N/A',
        },
    ];

    const renderActions = (record) => (
        <Space size="small">
            <Tooltip title="Xem chi tiết">
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                />
            </Tooltip>
        </Space>
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý Hồ Sơ (Resumes)</h1>
                <Space>
                    <Select
                        placeholder="Lọc theo trạng thái"
                        allowClear
                        style={{ width: 200 }}
                        onChange={setFilterStatus}
                        value={filterStatus}
                    >
                        <Option value="PENDING">Chờ xử lý</Option>
                        <Option value="REVIEWING">Đang xem xét</Option>
                        <Option value="APPROVED">Đã duyệt</Option>
                        <Option value="REJECTED">Từ chối</Option>
                    </Select>
                </Space>
            </div>

            <AdminTable
                columns={columns}
                data={data}
                loading={loading}
                meta={{ ...pagination, page: pagination.current }}
                onPageChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
                renderActions={renderActions}
            />

            <Modal
                title="Chi tiết hồ sơ ứng viên"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>
                        Đóng
                    </Button>
                ]}
            >
                {selectedResume && (
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded">
                        <div>
                            <p className="text-gray-600 text-sm">Ứng viên</p>
                            <p className="font-semibold">{selectedResume.user?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Email</p>
                            <p className="font-semibold">{selectedResume.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Công việc</p>
                            <p className="font-semibold">{selectedResume.job?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Công ty</p>
                            <p className="font-semibold">{selectedResume.job?.company?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Trạng thái</p>
                            <Tag color={getStatusColor(selectedResume.status)}>
                                {getStatusText(selectedResume.status)}
                            </Tag>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Ngày nộp</p>
                            <p className="font-semibold">
                                {selectedResume.createdAt ? dayjs(selectedResume.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-600 text-sm">Ghi chú từ HR</p>
                            <p className="font-semibold whitespace-pre-wrap">{selectedResume.note || 'Không có ghi chú'}</p>
                        </div>
                        <div className="col-span-2 mt-4 text-center">
                            {selectedResume.url ? (
                                <Button type="primary" onClick={() => handleViewCV(selectedResume.url)}>
                                    Tải / Xem CV
                                </Button>
                            ) : (
                                <span className="text-gray-500">Người dùng không tải lên CV</span>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ResumeManagement;
