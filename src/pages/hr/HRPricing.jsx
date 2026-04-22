import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Tag, message } from 'antd';
import { CheckCircleOutlined, StarFilled } from '@ant-design/icons';
import axios from '../../api/axiosClient';

const { Title, Text } = Typography;

const HRPricing = () => {
    const [loading, setLoading] = useState(false);

    const plans = [
        {
            id: 1, // Matches DB
            name: 'Free',
            price: 0,
            features: [
                'Đăng 2 tin tuyển dụng miễn phí',
                'Hiển thị tiêu chuẩn',
                'Quản lý hồ sơ cơ bản'
            ],
            type: 'free'
        },
        {
            id: 2,
            name: 'Professional',
            price: 500000,
            recommended: true,
            features: [
                'Đăng tối đa 20 tin tuyển dụng',
                'Đẩy Top tin trong 7 ngày',
                'Lưu trữ hồ sơ không giới hạn',
                'Hỗ trợ qua Email/Chat'
            ],
            type: 'pro'
        },
        {
            id: 3,
            name: 'Enterprise',
            price: 2000000,
            features: [
                'Không giới hạn tin đăng',
                'Đẩy Top tin thường xuyên',
                'Quản lý đánh giá kỹ năng tự động',
                'Hỗ trợ chuyên gia 24/7',
                'Gợi ý CV bằng AI'
            ],
            type: 'ent'
        }
    ];

    const handleBuyNow = async (plan) => {
        if (plan.price === 0) {
            message.info('Gói Free chỉ dành cho công ty mới tạo.');
            return;
        }

        try {
            setLoading(true);
            const returnUrl = `${window.location.origin}/hr/payment/return`;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
            const response = await axios.post(`${apiUrl}/payments/create`, null, {
                params: {
                    method: 'VNPAY',
                    subscriptionId: plan.id,
                    returnUrl: returnUrl
                }
            });

            if (response.data && response.data.data && response.data.data.paymentUrl) {
                window.location.href = response.data.data.paymentUrl;
            } else if (response.data && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                message.error('Không tìm thấy link thanh toán!');
            }
        } catch (error) {
            console.error('Lỗi khi tạo payment:', error);
            message.error('Có lỗi xảy ra khi tạo giao dịch. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in pb-12">
            <div className="mb-10 p-10 rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-32 h-full bg-indigo-50/20 skew-x-[-20deg] translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-full bg-purple-50/20 skew-x-[20deg] -translate-x-16"></div>
                
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">Nâng Tầm Tuyển Dụng</h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Chọn gói dịch vụ phù hợp nhất để tối ưu hóa quy trình tuyển dụng và tiếp cận nhân tài hiệu quả hơn.
                    </p>
                </div>
            </div>

            <Row gutter={[32, 32]} justify="center" className="px-4">
                {plans.map((plan) => (
                    <Col xs={24} md={8} key={plan.id}>
                        <div className={`relative h-full transition-all duration-300 rounded-[2rem] p-8 flex flex-col items-center bg-white ${plan.recommended ? 'shadow-2xl scale-105 border-2 border-indigo-500 z-10' : 'shadow-md hover:shadow-xl border border-gray-100 mt-4'}`}>
                            {plan.recommended && (
                                <div className="absolute -top-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-6 py-1.5 rounded-full text-sm shadow-md flex items-center gap-2">
                                    <StarFilled /> LỰA CHỌN TỐT NHẤT
                                </div>
                            )}
                            
                            <div className="text-center w-full mb-8">
                                <h3 className={`text-xl font-bold uppercase tracking-wider mb-4 ${plan.recommended ? 'text-indigo-600' : 'text-gray-500'}`}>{plan.name}</h3>
                                <div className="flex justify-center items-end gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900">{plan.price.toLocaleString()}</span>
                                    <span className="text-gray-500 font-medium mb-1 tracking-wider"> VND</span>
                                </div>
                                <p className="text-gray-400 mt-2 text-sm">/tháng</p>
                            </div>

                            <div className="w-full flex-grow space-y-4 mb-8">
                                {plan.features.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircleOutlined className={`mt-1 text-lg ${plan.recommended ? 'text-indigo-500' : 'text-emerald-500'}`} />
                                        <span className="text-gray-600 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type={plan.recommended ? "primary" : "default"}
                                size="large"
                                className={`w-full h-14 rounded-2xl text-lg font-bold border-0 transition-transform hover:scale-105 active:scale-95 ${
                                    plan.recommended 
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                                loading={loading}
                                onClick={() => handleBuyNow(plan)}
                            >
                                {plan.price === 0 ? 'Bắt đầu ngay' : 'Đăng ký ngay'}
                            </Button>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default HRPricing;
