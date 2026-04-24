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
     * Verify if the current HR user is already associated with a company
     */
    const checkAndFetchCompany = async () => {
        try {
            setLoading(true);

            // Check user context first
            if (user?.company?.id) {
                // If user has an associated company, fetch its details
                await fetchCompanyDetails();
            } else {
                // Otherwise, verify via API call
                await fetchMyCompany();
            }
        } catch (error) {
            console.error('Error checking company:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch HR company data from API
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
            // 404 indicates the HR user does not have a registered company yet
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
     * Fetch detailed company info (used when company ID is already known)
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
     * Populate the form with company data
     */
    const populateForm = (companyData) => {
        form.setFieldsValue({
            name: companyData.name,
            address: companyData.address,
            description: companyData.description,
            logo: companyData.logo,
            githubLink: companyData.githubLink,
            facebookLink: companyData.facebookLink,
        });
    };

    /**
     * Handle new company registration (one-time process)
     */
    const handleRegisterCompany = async (values) => {
        try {
            setSubmitting(true);

            const response = await axios.post(ENDPOINTS.COMPANIES.REGISTER, values);
            const newCompany = response.data?.data || response.data;

            message.success('Đăng ký công ty thành công! Vui lòng chờ admin xác thực.');
            setCompany(newCompany);
            setHasCompany(true);

            // Fetch updated user info to capture the new company ID
            await fetchAccount();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Không thể đăng ký công ty';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Handle company info updates
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
     * Submit handler for both registration and updates
     */
    const handleSubmit = async (values) => {
        if (hasCompany) {
            await handleUpdateCompany(values);
        } else {
            await handleRegisterCompany(values);
        }
    };

    /**
     * Handle logo file upload
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
        <div className="animate-fade-in pb-8">
            <div className="mb-10 p-10 rounded-[2.5rem] bg-white border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-orange-50/20 skew-x-[-20deg] translate-x-16"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-brand-900 tracking-tight mb-2">
                        {hasCompany ? 'Quản lý Công ty' : 'Đăng ký Công ty'}
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl">
                        {hasCompany ? 'Cập nhật thông tin doanh nghiệp để thu hút nhiều ứng viên tiềm năng hơn.' : 'Điền thông tin doanh nghiệp của bạn để bắt đầu tuyển dụng.'}
                    </p>
                </div>
            </div>

            {/* Important Terms and Conditions Alert */}
            <Alert
                message={
                    <span className="font-bold text-blue-800">Quy định quan trọng</span>
                }
                description={
                    <span className="text-blue-700">Mỗi tài khoản HR chỉ được đại diện cho một doanh nghiệp duy nhất. Sau khi đăng ký, bạn chỉ có thể chỉnh sửa thông tin công ty đó, không thể chuyển sang công ty khác.</span>
                }
                type="info"
                icon={<InfoCircleOutlined className="text-brand-900 mt-1" />}
                showIcon
                className="mb-8 rounded-2xl border-blue-100 bg-blue-50"
            />

            {/* Display banner during pending registration state */}
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

            {/* Primary Form block - Rendered exclusively when no pending request is active */}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <Form.Item
                                    name="githubLink"
                                    label="Website / GitHub Link"
                                >
                                    <Input placeholder="https://github.com/your-company" size="large" />
                                </Form.Item>

                                <Form.Item
                                    name="facebookLink"
                                    label="Facebook Fanpage"
                                >
                                    <Input placeholder="https://facebook.com/your-company" size="large" />
                                </Form.Item>
                            </div>

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
