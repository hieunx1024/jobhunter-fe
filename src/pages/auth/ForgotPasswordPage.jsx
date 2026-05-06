import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const schema = yup.object().shape({
    email: yup.string().required('Email không được để trống').email('Email không hợp lệ'),
});

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await axiosClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: data.email });
            setIsSent(true);
            toast.success('Yêu cầu khôi phục mật khẩu đã được gửi đến email của bạn!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-800 p-12 text-white flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                            J
                        </div>
                        JobHunter
                    </Link>
                </div>

                <div className="relative z-10 max-w-md mt-20">
                    <h1 className="text-4xl font-bold mb-6 leading-tight">Yên tâm tìm việc, bảo mật tuyệt đối</h1>
                    <p className="text-blue-100 text-lg">Chúng tôi luôn đặt an toàn thông tin tài khoản của bạn lên hàng đầu. Hãy khôi phục mật khẩu một cách an toàn và nhanh chóng.</p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-blue-100">
                    <span>Hệ thống bảo mật 2 lớp</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>Mã hóa SSL chuẩn hóa</span>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-12 relative">
                {/* Decorative background element for mobile */}
                <div className="absolute top-0 left-0 w-full h-64 bg-primary lg:hidden rounded-b-[2.5rem]"></div>

                <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 relative z-10 border border-gray-100/50">
                    {!isSent ? (
                        <>
                            <div className="mb-6">
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-6 group">
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    <span>Quay lại Đăng nhập</span>
                                </Link>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Quên mật khẩu?
                                </h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    Nhập địa chỉ email đăng ký của bạn bên dưới. Chúng tôi sẽ gửi một liên kết bảo mật để thiết lập lại mật khẩu của bạn.
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email tài khoản</label>
                                    <div className="relative">
                                        <input
                                            {...register('email')}
                                            type="text"
                                            className={`w-full h-11 pl-10 pr-4 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                            placeholder="example@email.com"
                                        />
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover active:scale-[0.99] transition-all mt-6 flex items-center justify-center disabled:opacity-70 shadow-sm shadow-primary/30"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Gửi link khôi phục'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-6 border border-green-100 shadow-sm">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Kiểm tra hòm thư của bạn!
                            </h2>
                            <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-sm mx-auto">
                                Chúng tôi đã gửi một email hướng dẫn thiết lập lại mật khẩu đến địa chỉ email của bạn. Vui lòng kiểm tra kỹ cả hộp thư rác (spam) nếu không tìm thấy.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold items-center justify-center transition-all active:scale-[0.99] shadow-sm shadow-primary/30"
                            >
                                Quay lại Đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
