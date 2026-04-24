import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Home, RefreshCcw, Loader2 } from 'lucide-react';
import axios from '../../api/axiosClient';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            const vnp_TxnRef = searchParams.get('vnp_TxnRef');
            const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');

            if (!vnp_TxnRef || !vnp_ResponseCode) {
                setStatus('error');
                setErrorMsg('Không tìm thấy thông tin giao dịch.');
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl shadow-blue-600/5 overflow-hidden border border-gray-200">
                <div className={`h-3 ${status === 'success' ? 'bg-green-500' : status === 'failed' || status === 'error' ? 'bg-red-500' : 'bg-brand-900'}`}></div>
                
                <div className="p-8 md:p-12 text-center">
                    {status === 'processing' && (
                        <div className="animate-fade-in flex flex-col items-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 text-brand-900 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-black text-brand-900 mb-3 tracking-tight">Đang xác thực giao dịch...</h2>
                            <p className="text-gray-500">Hệ thống đang kết nối với cổng thanh toán VNPay. Vui lòng không đóng trình duyệt lúc này.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="animate-fade-in flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black text-brand-900 mb-4 tracking-tight">Thanh toán thành công!</h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                Cảm ơn bạn đã nâng cấp dịch vụ. Lượt đăng tin và các quyền lợi của bạn đã được cập nhật vào hệ thống tự động.
                            </p>

                            <div className="w-full space-y-4">
                                <button 
                                    onClick={() => navigate('/hr/jobs')}
                                    className="w-full bg-brand-900 hover:bg-brand-900 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
                                >
                                    Tiếp tục Đăng Tin
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button 
                                    onClick={() => navigate('/hr')}
                                    className="w-full bg-white border-2 border-gray-200 text-zinc-700 hover:bg-gray-50 hover:border-gray-300 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Home className="w-5 h-5" />
                                    Về Bảng điều khiển
                                </button>
                            </div>
                        </div>
                    )}

                    {(status === 'failed' || status === 'error') && (
                        <div className="animate-fade-in flex flex-col items-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <XCircle className="w-12 h-12 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-black text-brand-900 mb-4 tracking-tight">Thanh toán thất bại</h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                {errorMsg || 'Giao dịch của bạn không thành công hoặc đã bị người dùng hủy bỏ. Vui lòng thanh toán lại bằng phương thức khác.'}
                            </p>

                            <div className="w-full space-y-4">
                                <button 
                                    onClick={() => navigate('/hr/pricing')}
                                    className="w-full bg-brand-900 hover:bg-brand-900 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
                                >
                                    <RefreshCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform" />
                                    Thử lại giao dịch
                                </button>
                                <button 
                                    onClick={() => navigate('/hr')}
                                    className="w-full bg-white border-2 border-gray-200 text-zinc-700 hover:bg-gray-50 hover:border-gray-300 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Home className="w-5 h-5" />
                                    Về Bảng điều khiển
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
