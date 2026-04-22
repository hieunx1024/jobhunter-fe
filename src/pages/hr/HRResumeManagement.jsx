import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Tag, Button, Space, Popconfirm, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import AdminTable from '../../components/AdminTable';
import axios from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const HRResumeManagement = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [form] = Form.useForm();
    const [filterStatus, setFilterStatus] = useState(null);

    useEffect(() => {
        fetchResumes();
    }, [pagination.current, pagination.pageSize, filterStatus]);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(ENDPOINTS.RESUMES.BASE, {
                params: {
                    page: pagination.current - 1,
                    size: pagination.pageSize,
                }
            });

            let resumes = response.data?.result || response.data?.data?.result || [];
            let total = response.data?.meta?.total || response.data?.data?.meta?.total || 0;

            // Filter by status if selected (Client-side filtering mainly as backup)
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
        form.setFieldsValue({
            status: record.status,
            note: record.note || '',
        });
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (values) => {
        try {
            await axios.put(`${ENDPOINTS.RESUMES.BASE}/${selectedResume.id}`, {
                status: values.status,
                note: values.note,
            });
            message.success('Cập nhật trạng thái thành công');
            setIsModalOpen(false);
            fetchResumes();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const handleQuickStatusUpdate = async (id, status) => {
        try {
            await axios.patch(`${ENDPOINTS.RESUMES.BASE}/${id}/status`, {
                status: status
            });
            message.success(`Đã cập nhật hồ sơ`);
            fetchResumes();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
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
                    className="text-blue-600 hover:underline cursor-pointer"
                >
                    Xem CV
                </a>
            ) : 'N/A',
        },
    ];

    const handleViewCV = async (fileName) => {
        try {
            const url = ENDPOINTS.FILES.DOWNLOAD(fileName, 'resumes');
            const response = await axios.get(url, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                }
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
        } catch (error) {
            message.error('Không thể tải CV. Vui lòng thử lại.');
        }
    };

    const renderActions = (record) => (
        <Space size="small">
            <Tooltip title="Xem chi tiết">
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                />
            </Tooltip>

            {record.status !== 'APPROVED' && record.status !== 'REJECTED' && (
                <>
                    <Popconfirm
                        title="Phê duyệt hồ sơ"
                        description="Bạn có chắc chắn muốn phê duyệt hồ sơ này?"
                        onConfirm={() => handleQuickStatusUpdate(record.id, 'APPROVED')}
                        okText="Duyệt"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Phê duyệt">
                            <Button
                                type="text"
                                icon={<CheckCircleOutlined className="text-green-600" />}
                            />
                        </Tooltip>
                    </Popconfirm>

                    <Popconfirm
                        title="Từ chối hồ sơ"
                        description="Bạn có chắc chắn muốn từ chối hồ sơ này?"
                        onConfirm={() => handleQuickStatusUpdate(record.id, 'REJECTED')}
                        okText="Từ chối"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Tooltip title="Từ chối">
                            <Button
                                type="text"
                                icon={<CloseCircleOutlined className="text-red-600" />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </>
            )}
        </Space>
    );

    return (
        <div className="animate-fade-in pb-8">
            <div className="mb-8 p-8 rounded-[2rem] bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-2 text-white">Quản lý Ứng viên</h1>
                        <p className="text-emerald-100 max-w-xl">Kiểm duyệt và quản lý hồ sơ ứng viên đăng ký trực tuyến cho các vị trí tuyển dụng của công ty.</p>
                    </div>
                    <Space className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-sm">
                        <span className="text-emerald-50 font-medium whitespace-nowrap">Bộ lọc:</span>
                        <Select
                            placeholder="Tất cả trạng thái"
                            allowClear
                            style={{ width: 180 }}
                            onChange={setFilterStatus}
                            value={filterStatus}
                            className="rounded-xl shadow-sm [&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:border-transparent"
                            bordered={false}
                        >
                            <Option value="PENDING">Chờ xử lý</Option>
                            <Option value="REVIEWING">Đang xem xét</Option>
                            <Option value="APPROVED">Đã duyệt</Option>
                            <Option value="REJECTED">Từ chối</Option>
                        </Select>
                    </Space>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
            <AdminTable
                columns={columns}
                data={data}
                loading={loading}
                meta={{ ...pagination, page: pagination.current }}
                onPageChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
                renderActions={renderActions}
            />
            </div>

            <Modal
                title="Chi tiết hồ sơ ứng viên"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                width={700}
                okText="Cập nhật"
                cancelText="Đóng"
            >
                {selectedResume && (
                    <div className="mb-4">
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
                                <p className="text-gray-600 text-sm">Ngày nộp</p>
                                <p className="font-semibold">
                                    {selectedResume.createdAt ? dayjs(selectedResume.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">CV</p>
                                {selectedResume.url ? (
                                    <a
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleViewCV(selectedResume.url);
                                        }}
                                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                                    >
                                        Tải xuống CV
                                    </a>
                                ) : (
                                    <p className="font-semibold">Không có</p>
                                )}
                            </div>
                        </div>

                        <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="PENDING">Chờ xử lý</Option>
                                    <Option value="REVIEWING">Đang xem xét</Option>
                                    <Option value="APPROVED">Đã duyệt</Option>
                                    <Option value="REJECTED">Từ chối</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="note" label="Ghi chú">
                                <TextArea
                                    rows={4}
                                    placeholder="Nhập ghi chú về hồ sơ này..."
                                />
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HRResumeManagement;
