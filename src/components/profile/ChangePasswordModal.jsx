import React, { useState } from 'react';
import { Modal, Form, Input, Button, notification, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const ChangePasswordModal = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const { currentPassword, newPassword, confirmPassword } = values;
            
            // Call API Change Password
            await axiosClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                currentPassword,
                newPassword,
                confirmPassword
            });

            notification.success({
                message: 'Thành công',
                description: 'Đổi mật khẩu thành công!',
                placement: 'topRight',
            });

            // Reset form and close modal
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Change password error:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
            notification.error({
                message: 'Thất bại',
                description: errorMsg,
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LockOutlined style={{ color: '#1890ff' }} />
                    <span>Đổi mật khẩu</span>
                </div>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            footer={null}
            destroyOnClose
            maskClosable={false}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <Button onClick={onCancel}>Hủy bỏ</Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                    >
                        Đổi mật khẩu
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;
