import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Switch } from 'antd';
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    EnvironmentOutlined, 
    CalendarOutlined, 
    UsergroupAddOutlined, 
    FileTextOutlined,
    CheckCircleOutlined,
    SolutionOutlined,
    CompassOutlined,
    TeamOutlined,
    TagOutlined
} from '@ant-design/icons';
import AdminTable from '../../components/AdminTable';
import axios from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;

const { Option } = Select;
const { RangePicker } = DatePicker;

const HRJobManagement = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [skills, setSkills] = useState([]);



    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(ENDPOINTS.JOBS.BASE, {
                params: {
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                }
            });
            setData(response.data?.data?.result || []);
            setPagination(prev => ({
                ...prev,
                total: response.data?.data?.meta?.total || 0
            }));
        } catch (error) {
            message.error('Không thể tải danh sách công việc');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await axios.get(ENDPOINTS.COMPANIES.PUBLIC, {
                params: { current: 1, pageSize: 100 }
            });
            setCompanies(response.data?.data?.result || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const fetchSkills = async () => {
        try {
            const response = await axios.get(ENDPOINTS.SKILLS.BASE, {
                params: { page: 1, size: 1000 }
            });
            setSkills(response.data?.data?.result || []);
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const [postingStats, setPostingStats] = useState({ usedPosts: 0, remainingPosts: 0, packageName: 'Free' });

    useEffect(() => {
        fetchJobs();
        fetchPostingStats();
        fetchCompanies();
        fetchSkills();

        // Listen for window focus to automatically update stats if they bought a package in another tab
        const handleFocus = () => {
            fetchPostingStats();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [pagination.current, pagination.pageSize]);

    const fetchPostingStats = async () => {
        try {
            const response = await axios.get(ENDPOINTS.JOBS.POSTING_STATS);
            setPostingStats(response.data?.data || response.data || { usedPosts: 0, remainingPosts: 0, packageName: 'Free' });
        } catch (error) {
            console.error('Error fetching posting stats:', error);
        }
    };

    const handleCreate = () => {
        if (postingStats.remainingPosts !== -1 && postingStats.remainingPosts <= 0) {
            Modal.confirm({
                title: 'Nâng cấp gói dịch vụ',
                content: 'Bạn đã hết lượt đăng tin trong gói hiện tại. Vui lòng nâng cấp gói dịch vụ để tiếp tục đăng tin.',
                okText: 'Nâng cấp ngay',
                cancelText: 'Hủy',
                onOk: () => {
                    navigate('/hr/pricing');
                }
            });
            return;
        }
        setEditingJob(null);
        form.resetFields();
        if (user?.company?.id) {
            form.setFieldsValue({ company: user.company.id });
        }
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingJob(record);
        form.setFieldsValue({
            name: record.name,
            location: record.location,
            salary: record.salary,
            quantity: record.quantity,
            level: record.level,
            company: record.company?.id,
            skills: record.skills?.map(s => s.id),
            dateRange: record.startDate && record.endDate ? [dayjs(record.startDate), dayjs(record.endDate)] : null,
            active: record.active !== undefined ? record.active : true,
            description: record.description || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${ENDPOINTS.JOBS.BASE}/${id}`);
            message.success('Xóa công việc thành công');
            fetchJobs();
            fetchPostingStats();
        } catch (error) {
            message.error('Không thể xóa công việc');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                startDate: values.dateRange?.[0]?.toDate().toISOString(),
                endDate: values.dateRange?.[1]?.toDate().toISOString(),
                company: { id: values.company },
                skills: values.skills?.map(id => ({ id })) || [],
            };
            delete payload.dateRange;

            if (editingJob) {
                await axios.put(ENDPOINTS.JOBS.BASE, { ...payload, id: editingJob.id });
                message.success('Cập nhật công việc thành công');
            } else {
                await axios.post(ENDPOINTS.JOBS.BASE, payload);
                message.success('Tạo công việc thành công');
            }
            setIsModalOpen(false);
            fetchJobs();
            fetchPostingStats();
        } catch (error) {
            // Handle specific backend error for limit exceeded if UI check fails
            if (error.response?.status === 402) { // Assuming 402 for Payment Required
                Modal.confirm({
                    title: 'Nâng cấp gói dịch vụ',
                    content: error.response?.data?.message || 'Bạn đã hết lượt đăng tin miễn phí.',
                    okText: 'Nâng cấp ngay',
                    cancelText: 'Hủy',
                    onOk: () => {
                        navigate('/hr/pricing');
                    }
                });
            } else {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        }
    };

    const columns = [
        { title: 'Tên công việc', dataIndex: 'name', key: 'name' },
        { title: 'Công ty', dataIndex: ['company', 'name'], key: 'company' },
        { title: 'Địa điểm', dataIndex: 'location', key: 'location' },
        {
            title: 'Mức lương',
            dataIndex: 'salary',
            key: 'salary',
            render: (salary) => salary ? `${salary.toLocaleString()} VNĐ` : 'Thỏa thuận'
        },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Cấp độ', dataIndex: 'level', key: 'level' },
        {
            title: 'Hạn đăng tuyển',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (endDate) => {
                if (!endDate) return 'Không giới hạn';
                const formattedDate = dayjs(endDate).format('DD/MM/YYYY');
                const isExpired = dayjs(endDate).isBefore(dayjs());
                return (
                    <span className={isExpired ? 'text-red-500 font-semibold flex items-center gap-1' : 'text-gray-600 font-medium'}>
                        {formattedDate}
                        {isExpired && (
                            <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wider font-bold">
                                Hết hạn
                            </span>
                        )}
                    </span>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active, record) => {
                const isExpired = record.endDate ? dayjs(record.endDate).isBefore(dayjs()) : false;
                return (
                    <span className={active && !isExpired ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {active && !isExpired ? 'Đang tuyển' : 'Đã đóng'}
                    </span>
                );
            }
        },
    ];

    const actions = [
        {
            icon: <EditOutlined />,
            onClick: handleEdit,
            tooltip: 'Chỉnh sửa',
        },
        {
            icon: <DeleteOutlined />,
            onClick: (record) => {
                Modal.confirm({
                    title: 'Xác nhận xóa',
                    content: 'Bạn có chắc chắn muốn xóa công việc này?',
                    onOk: () => handleDelete(record.id),
                });
            },
            tooltip: 'Xóa',
            danger: true,
        },
    ];

    return (
        <div className="animate-fade-in pb-8">
            <div className="mb-10 p-10 rounded-[2.5rem] bg-white border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-blue-50/20 skew-x-[-20deg] translate-x-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex-grow">
                        <h1 className="text-4xl font-black text-brand-900 tracking-tight mb-2">Quản lý Tin tuyển dụng</h1>
                        <p className="text-gray-500 font-medium mb-6">Tạo mới và theo dõi các tin đăng tuyển dụng của công ty bạn.</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-50 text-gray-400 border border-blue-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Đã đăng: {postingStats.usedPosts}
                            </div>
                            <div className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-50 text-gray-400 border border-blue-100 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${postingStats.remainingPosts > 0 || postingStats.remainingPosts === -1 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                Còn lại: {postingStats.remainingPosts === -1 ? 'Không giới hạn' : postingStats.remainingPosts}
                            </div>
                            <div className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-100 text-gray-500 border border-blue-200 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Gói: {postingStats.packageName}
                            </div>
                        </div>
                    </div>
                    <Button 
                        type="primary" 
                        style={{ backgroundColor: "#102a43", borderColor: "#102a43" }} 
                        icon={<PlusOutlined />} 
                        onClick={handleCreate} 
                        size="large"
                        className="rounded-2xl font-bold bg-brand-900 text-white hover:bg-brand-900 border-0 h-14 px-8 shadow-lg shadow-blue-600/20"
                    >
                        Đăng tin tuyển dụng
                    </Button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">

            <AdminTable
                columns={columns}
                data={data}
                isLoading={loading}
                meta={{
                    page: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    pages: Math.ceil(pagination.total / pagination.pageSize),
                }}
                onPageChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
                renderActions={(record) => (
                    <div className="flex gap-2 justify-end">
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => action.onClick(record)}
                                title={action.tooltip}
                                className={`p-1 rounded hover:bg-gray-100 ${action.danger ? 'text-red-500' : 'text-brand-900'}`}
                            >
                                {action.icon}
                            </button>
                        ))}
                    </div>
                )}
            />
            </div>

            <Modal
                title={
                    <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
                        <div className={`p-3 rounded-2xl flex items-center justify-center ${editingJob ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                            {editingJob ? <EditOutlined className="text-xl" /> : <PlusOutlined className="text-xl" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{editingJob ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}</h2>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Điền đầy đủ các thông tin chi tiết để thu hút những ứng viên tiềm năng tốt nhất</p>
                        </div>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                width={1000}
                footer={[
                    <Button 
                        key="cancel" 
                        onClick={() => setIsModalOpen(false)}
                        className="rounded-xl border-gray-300 hover:border-gray-400 text-gray-600 font-semibold px-6 h-11 transition-all"
                    >
                        Hủy bỏ
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        style={{ backgroundColor: "#102a43", borderColor: "#102a43" }}
                        className="rounded-xl font-bold px-8 h-11 bg-brand-900 text-white hover:opacity-90 shadow-lg shadow-blue-900/10 transition-all"
                        onClick={() => form.submit()}
                    >
                        {editingJob ? 'Cập nhật tin đăng' : 'Đăng tin ngay'}
                    </Button>
                ]}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                    <div className="space-y-6 pt-4">
                        {/* Phần trên: Chia thành 2 cột cân bằng (6/12 - 6/12) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Cột trái: Thông tin cơ bản */}
                            <div className="lg:col-span-6 space-y-5">
                                <Form.Item 
                                    name="name" 
                                    label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Tên vị trí công việc <span className="text-red-500">*</span></span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên công việc' }]}
                                >
                                    <Input 
                                        prefix={<SolutionOutlined className="text-gray-400 mr-1.5" />} 
                                        placeholder="Ví dụ: Senior Fullstack Engineer (React / Node.js)" 
                                        size="large"
                                        className="rounded-xl shadow-sm h-12"
                                    />
                                </Form.Item>

                                <Form.Item 
                                    name="company" 
                                    label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Doanh nghiệp tuyển dụng</span>}
                                    rules={[{ required: true, message: 'Vui lòng chọn công ty' }]}
                                >
                                    <Select 
                                        placeholder="Chọn công ty" 
                                        disabled={!!user?.company?.id}
                                        size="large"
                                        className="rounded-xl shadow-sm"
                                    >
                                        {companies.map(c => (
                                            <Option key={c.id} value={c.id}>{c.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="skills" label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Kỹ năng công nghệ yêu cầu</span>}>
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn các từ khóa kỹ năng"
                                        showSearch
                                        optionFilterProp="label"
                                        maxTagCount="responsive"
                                        size="large"
                                        className="rounded-xl w-full"
                                        options={skills.map(s => ({ label: s.name, value: s.id }))}
                                    />
                                </Form.Item>
                            </div>

                            {/* Cột phải: Chỉ số & Yêu cầu kỹ thuật trong Box xám nhạt */}
                            <div className="lg:col-span-6 space-y-5 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item 
                                        name="location" 
                                        label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Địa điểm làm việc <span className="text-red-500">*</span></span>} 
                                        rules={[{ required: true, message: 'Vui lòng chọn địa điểm' }]}
                                    >
                                        <Select 
                                            placeholder="Chọn tỉnh/thành" 
                                            showSearch 
                                            allowClear
                                            size="large"
                                            className="w-full rounded-xl"
                                            suffixIcon={<CompassOutlined className="text-gray-400" />}
                                            options={[
                                                {
                                                    label: 'Thành phố trọng điểm (IT Hubs)',
                                                    options: [
                                                        { label: 'Hà Nội', value: 'Hà Nội' },
                                                        { label: 'Hồ Chí Minh', value: 'Hồ Chí Minh' },
                                                        { label: 'Đà Nẵng', value: 'Đà Nẵng' },
                                                    ],
                                                },
                                                {
                                                    label: 'Hình thức làm việc linh hoạt',
                                                    options: [
                                                        { label: 'Làm việc từ xa (Remote)', value: 'Remote' },
                                                        { label: 'Làm việc linh hoạt (Hybrid)', value: 'Hybrid' },
                                                    ],
                                                },
                                                {
                                                    label: 'Các tỉnh thành có khu công nghệ / KCN',
                                                    options: [
                                                        { label: 'Bình Dương', value: 'Bình Dương' },
                                                        { label: 'Đồng Nai', value: 'Đồng Nai' },
                                                        { label: 'Bắc Ninh', value: 'Bắc Ninh' },
                                                        { label: 'Hải Phòng', value: 'Hải Phòng' },
                                                        { label: 'Cần Thơ', value: 'Cần Thơ' },
                                                        { label: 'Thừa Thiên Huế', value: 'Huế' },
                                                        { label: 'Khác', value: 'Khác' },
                                                    ],
                                                },
                                            ]}
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    </Form.Item>

                                    <Form.Item 
                                        name="level" 
                                        label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Cấp bậc chuyên môn <span className="text-red-500">*</span></span>} 
                                        rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
                                    >
                                        <Select placeholder="Chọn cấp bậc" size="large" className="w-full rounded-xl" suffixIcon={<TagOutlined className="text-gray-400" />}>
                                            <Option value="INTERN">Intern / Thực tập</Option>
                                            <Option value="FRESHER">Fresher / Mới ra trường</Option>
                                            <Option value="JUNIOR">Junior / Nhân viên</Option>
                                            <Option value="MIDDLE">Middle / Trung cấp</Option>
                                            <Option value="SENIOR">Senior / Cao cấp</Option>
                                            <Option value="LEADER">Leader / Trưởng nhóm</Option>
                                        </Select>
                                    </Form.Item>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item 
                                        name="salary" 
                                        label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Mức lương tối đa (VNĐ)</span>}
                                        className="mb-0"
                                    >
                                        <InputNumber 
                                            min={0} 
                                            className="w-full rounded-xl h-12 flex items-center overflow-hidden" 
                                            size="large" 
                                            placeholder="Thỏa thuận" 
                                            formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                            parser={value => value ? value.replace(/\s?|(,*)/g, '') : ''}
                                            addonAfter="VNĐ"
                                        />
                                    </Form.Item>

                                    <Form.Item 
                                        name="quantity" 
                                        label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Số lượng tuyển dụng <span className="text-red-500">*</span></span>} 
                                        rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                                        className="mb-0"
                                    >
                                        <InputNumber 
                                            min={1} 
                                            className="w-full rounded-xl h-12 flex items-center" 
                                            size="large" 
                                            prefix={<TeamOutlined className="text-gray-400 mr-1" />}
                                        />
                                    </Form.Item>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-1">
                                    <Form.Item name="dateRange" label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Hạn chót ứng tuyển</span>} className="mb-0">
                                        <RangePicker className="w-full rounded-xl h-12" size="large" format="YYYY-MM-DD" suffixIcon={<CalendarOutlined className="text-gray-400" />} />
                                    </Form.Item>

                                    <Form.Item name="active" valuePropName="checked" initialValue={true} className="mb-0">
                                        <div className="flex items-center justify-between p-2 px-3.5 bg-white border border-gray-200/80 rounded-xl h-12 shadow-sm">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Trạng thái</span>
                                            <Switch size="small" checkedChildren="Đang mở" unCheckedChildren="Đã đóng" />
                                        </div>
                                    </Form.Item>
                                </div>
                            </div>
                        </div>

                        {/* Phần dưới: Ô Mô tả chi tiết rộng toàn phần (Full Width 100%) */}
                        <div className="border-t border-gray-100 pt-6">
                            <Form.Item
                                name="description"
                                label={<span className="text-xs font-black uppercase tracking-wider text-gray-500">Mô tả chi tiết công việc <span className="text-red-500">*</span></span>}
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
                                className="mb-0"
                            >
                                <TextArea
                                    rows={8}
                                    placeholder="Nhập mô tả chi tiết về công việc, trách nhiệm chính, quyền lợi, chế độ đãi ngộ và lộ trình thăng tiến cho ứng viên..."
                                    className="rounded-2xl shadow-sm p-4 text-sm resize-none"
                                    style={{ minHeight: '180px' }}
                                />
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default HRJobManagement;
