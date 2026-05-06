import React, { useState } from 'react';
import { Modal, Form, Input, notification } from 'antd';
import { KeyRound, ShieldCheck, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const ChangePasswordModal = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const { currentPassword, newPassword, confirmPassword } = values;
            
            await axiosClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                currentPassword,
                newPassword,
                confirmPassword
            });

            notification.success({
                message: <span className="font-semibold text-gray-900">Thành công</span>,
                description: <span className="text-gray-600">Đổi mật khẩu thành công!</span>,
                placement: 'topRight',
                className: 'rounded-2xl border border-gray-100 shadow-lg',
            });

            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Change password error:', error);
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
            notification.error({
                message: <span className="font-semibold text-gray-900">Thất bại</span>,
                description: <span className="text-gray-600">{errorMsg}</span>,
                placement: 'topRight',
                className: 'rounded-2xl border border-gray-100 shadow-lg',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 py-2 border-b border-gray-100/50">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 m-0 leading-none mb-1">Đổi mật khẩu</h3>
                        <p className="text-sm font-normal text-gray-500 m-0">Đảm bảo tài khoản của bạn được an toàn</p>
                    </div>
                </div>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            footer={null}
            destroyOnHidden
            mask={{ closable: false }}
            className="modern-modal"
            width={500}
            closeIcon={<div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors mt-2 mr-2"><span className="text-gray-400 text-lg">&times;</span></div>}
        >
            <style>
                {`
                .modern-modal .ant-modal-content {
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                    border: 1px solid #f3f4f6;
                }
                .modern-modal .ant-modal-header {
                    margin-bottom: 24px;
                }
                .modern-modal .ant-form-item-label > label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 14px;
                }
                .modern-modal .ant-input-password {
                    padding: 10px 16px;
                    border-radius: 12px;
                    border-color: #e5e7eb;
                    background-color: #f9fafb;
                    transition: all 0.2s ease;
                }
                .modern-modal .ant-input-password:hover, .modern-modal .ant-input-password:focus-within {
                    border-color: #0A65CC;
                    background-color: #ffffff;
                }
                .modern-modal .ant-input-password .ant-input {
                    background-color: transparent;
                }
                `}
            </style>
            
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                className="mt-6"
            >
                <Form.Item
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" size="large" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
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
                    <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button 
                        type="button"
                        onClick={() => {
                            form.resetFields();
                            onCancel();
                        }}
                        className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 border border-gray-200 transition-all focus:ring-4 focus:ring-gray-100"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                        {loading ? 'Đang xử lý...' : 'Xác nhận đổi'}
                    </button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;
