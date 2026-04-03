import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Spin, Upload, Alert } from 'antd';
import { UploadOutlined, SaveOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;

const HRCompanyManager = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [company, setCompany] = useState(null);
    const [hasCompany, setHasCompany] = useState(false);
    const { user, fetchAccount } = useAuth();

    useEffect(() => {
        checkAndFetchCompany();
    }, []);

    /**
     * Kiểm tra xem HR đã có công ty chưa
     */
    const checkAndFetchCompany = async () => {
        try {
            setLoading(true);

            // Kiểm tra từ user context trước
            if (user?.company?.id) {
                // Nếu user đã có company, fetch thông tin chi tiết
                await fetchCompanyDetails();
            } else {
                // Nếu chưa có, thử gọi API để kiểm tra
                await fetchMyCompany();
            }
        } catch (error) {
            console.error('Error checking company:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Lấy thông tin công ty của HR từ API
     */
    const fetchMyCompany = async () => {
        try {
            const response = await axios.get(ENDPOINTS.COMPANIES.MY_COMPANY);
            const companyData = response.data?.data || response.data;

            if (companyData) {
                setCompany(companyData);
                setHasCompany(true);
                populateForm(companyData);
            } else {
                setHasCompany(false);
                checkPendingRegistration();
            }
        } catch (error) {
            // 404 nghĩa là chưa có công ty
            if (error.response?.status === 404) {
                setHasCompany(false);
                setCompany(null);
                checkPendingRegistration();
            } else {
                console.error('Error fetching company:', error);
            }
        }
    };

    const checkPendingRegistration = async () => {
        try {
            const res = await axios.get(ENDPOINTS.COMPANY_REGISTRATIONS.BASE);
            const data = res.data?.data || res.data;
            const isPending = data?.result?.some(r => r.status === 'PENDING');
            if (isPending) {
                setCompany({ isPendingRegistration: true });
                setHasCompany(false);
            }
        } catch (error) {
            console.error("Error checking registrations", error);
        }
    }

    /**
     * Lấy thông tin chi tiết công ty (dùng khi đã có company ID)
     */
    const fetchCompanyDetails = async () => {
        try {
            const response = await axios.get(ENDPOINTS.COMPANIES.MY_COMPANY);
            const companyData = response.data?.data || response.data;

            setCompany(companyData);
            setHasCompany(true);
            populateForm(companyData);
        } catch (error) {
            message.error('Không thể tải thông tin công ty');
        }
    };

    /**
     * Điền dữ liệu vào form
     */
    const populateForm = (companyData) => {
        form.setFieldsValue({
            name: companyData.name,
            address: companyData.address,
            description: companyData.description,
            logo: companyData.logo,
        });
    };

    /**
     * Xử lý đăng ký công ty mới (chỉ 1 lần)
     */
    const handleRegisterCompany = async (values) => {
        try {
            setSubmitting(true);

            const response = await axios.post(ENDPOINTS.COMPANIES.REGISTER, values);
            const newCompany = response.data?.data || response.data;

            message.success('Đăng ký công ty thành công! Vui lòng chờ admin xác thực.');
            setCompany(newCompany);
            setHasCompany(true);

            // Cập nhật lại thông tin user để có company_id mới
            await fetchAccount();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Không thể đăng ký công ty';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Xử lý cập nhật thông tin công ty
     */
    const handleUpdateCompany = async (values) => {
        try {
            setSubmitting(true);

            const response = await axios.put(ENDPOINTS.COMPANIES.MY_COMPANY, values);
            const updatedCompany = response.data?.data || response.data;

            message.success('Cập nhật thông tin công ty thành công');
            setCompany(updatedCompany);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Không thể cập nhật thông tin công ty';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Xử lý submit form (đăng ký hoặc cập nhật)
     */
    const handleSubmit = async (values) => {
        if (hasCompany) {
            await handleUpdateCompany(values);
        } else {
            await handleRegisterCompany(values);
        }
    };

    /**
     * Xử lý upload logo
     */
    const handleUploadLogo = async (info) => {
        const formData = new FormData();
        formData.append('file', info.file);
        formData.append('folder', 'company');

        try {
            const response = await axios.post(ENDPOINTS.FILES.UPLOAD, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const logoUrl = response.data?.data?.fileName;
            form.setFieldsValue({ logo: logoUrl });
            message.success('Tải logo thành công');
        } catch (error) {
            message.error('Không thể tải logo');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">
                {hasCompany ? 'Quản lý Công ty' : 'Đăng ký Công ty'}
            </h1>

            {/* Thông báo quy định */}
            <Alert
                message="Quy định quan trọng"
                description="Mỗi tài khoản HR chỉ được đại diện cho một doanh nghiệp duy nhất. Sau khi đăng ký, bạn chỉ có thể chỉnh sửa thông tin công ty đó, không thể chuyển sang công ty khác."
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                className="mb-6"
            />

            {/* Hiển thị thông báo khi có yêu cầu đăng ký đang chờ duyệt */}
            {company?.isPendingRegistration && (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-yellow-200">
                    <div className="bg-yellow-50 p-4 rounded-full mb-4">
                        <InfoCircleOutlined className="text-4xl text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Đang chờ phê duyệt</h2>
                    <p className="text-gray-600 max-w-md text-center">
                        Yêu cầu đăng ký công ty của bạn đã được gửi và đang chờ Admin phê duyệt.
                        Vui lòng quay lại sau hoặc liên hệ Admin nếu cần hỗ trợ.
                    </p>
                </div>
            )}

            {/* Form đăng ký/cập nhật - Chỉ hiển thị khi KHÔNG có yêu cầu pending */}
            {!company?.isPendingRegistration && (
                <>


                    <Card>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                        >
                            <Form.Item
                                name="name"
                                label="Tên công ty"
                                rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
                            >
                                <Input placeholder="Nhập tên công ty" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                            >
                                <Input placeholder="Nhập địa chỉ công ty" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label="Mô tả công ty"
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="Nhập mô tả về công ty..."
                                />
                            </Form.Item>

                            <Form.Item
                                name="logo"
                                label="Logo công ty (URL)"
                            >
                                <Input placeholder="URL logo" size="large" />
                            </Form.Item>

                            <Form.Item label="Hoặc tải logo lên">
                                <Upload
                                    beforeUpload={() => false}
                                    onChange={handleUploadLogo}
                                    maxCount={1}
                                    accept="image/*"
                                >
                                    <Button icon={<UploadOutlined />}>Chọn file</Button>
                                </Upload>
                            </Form.Item>

                            {form.getFieldValue('logo') && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Xem trước logo:</p>
                                    <img
                                        src={form.getFieldValue('logo')}
                                        alt="Company Logo"
                                        className="w-32 h-32 object-contain border rounded"
                                    />
                                </div>
                            )}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={hasCompany ? <SaveOutlined /> : <PlusOutlined />}
                                    loading={submitting}
                                    size="large"
                                >
                                    {hasCompany ? 'Lưu thay đổi' : 'Đăng ký công ty'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </>
            )}
        </div>
    );
};

export default HRCompanyManager;
