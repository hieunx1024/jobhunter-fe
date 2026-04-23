import React, { useEffect, useState } from 'react';
import { Result, Button, Spin } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosClient';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const verifyPayment = async () => {
            const vnp_TxnRef = searchParams.get('vnp_TxnRef');
            const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');

            if (!vnp_TxnRef || !vnp_ResponseCode) {
                setStatus('error');
                return;
            }

            try {
                // Endpoint processing vnpay return
                const response = await axios.get('/payments/vnpay-return', {
                    params: {
                        vnp_TxnRef,
                        vnp_ResponseCode
                    }
                });

                if (response.status === 200 || response.data === 'Giao dịch thành công') {
                    setStatus('success');
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                setStatus('failed');
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (status === 'processing') {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Spin size="large" />
                <h2>Đang xử lý kết quả thanh toán...</h2>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <Result
                status="success"
                title="Thanh toán thành công gói dịch vụ!"
                subTitle="Cảm ơn bạn đã nâng cấp dịch vụ. Lượt đăng tin của bạn đã được cập nhật tự động."
                extra={[
                    <Button type="primary" key="console" onClick={() => navigate('/hr/jobs')}>
                        Tiếp tục Đăng Tin
                    </Button>,
                    <Button key="buy" onClick={() => navigate('/hr')}>
                        Về Bảng điều khiển
                    </Button>,
                ]}
            />
        );
    }

    return (
        <Result
            status="error"
            title="Thanh toán thất bại"
            subTitle="Giao dịch của bạn không thành công hoặc đã bị hủy. Vui lòng thử lại sau."
            extra={[
                <Button type="primary" key="console" onClick={() => navigate('/hr/pricing')}>
                    Thử lại
                </Button>
            ]}
        />
    );
};

export default PaymentSuccess;
