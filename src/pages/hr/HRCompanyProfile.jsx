import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Spin, Upload } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import axios from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;

const HRCompanyProfile = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [company, setCompany] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            setLoading(true);

            // Get company ID from user
            if (!user?.company?.id) {
                message.warning('Bạn chưa được gán vào công ty nào');
                return;
            }

            const response = await axios.get(ENDPOINTS.COMPANIES.GET_ONE(user.company.id));
            const companyData = response.data?.data;

            setCompany(companyData);
            form.setFieldsValue({
                name: companyData.name,
                address: companyData.address,
                description: companyData.description,
                logo: companyData.logo,
            });
        } catch (error) {
            message.error('Không thể tải thông tin công ty');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            if (!company?.id) {
                message.error('Không tìm thấy thông tin công ty');
                return;
            }

            await axios.put(ENDPOINTS.COMPANIES.BASE, {
                id: company.id,
                ...values,
            });

            message.success('Cập nhật thông tin công ty thành công');
            fetchCompanyProfile();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể cập nhật thông tin công ty');
        } finally {
            setSubmitting(false);
        }
    };

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

    if (!company) {
        return (
            <Card>
                <div className="text-center py-8">
                    <p className="text-gray-500">Bạn chưa được gán vào công ty nào.</p>
                    <p className="text-gray-500 mt-2">Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="animate-fade-in pb-8">
            <div className="mb-10 p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-teal-50/20 skew-x-[-20deg] translate-x-16"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Hồ sơ Công ty</h1>
                    <p className="text-slate-500 font-medium">Quản lý thông tin hiển thị của doanh nghiệp trên hệ thống.</p>
                </div>
            </div>

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
                        label="Logo công ty"
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
                            icon={<SaveOutlined />}
                            loading={submitting}
                            size="large"
                        >
                            Lưu thay đổi
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default HRCompanyProfile;
