import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Lock, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';

const schema = yup.object().shape({
    password: yup.string().required('Mật khẩu không được để trống').min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
    confirmPassword: yup.string().required('Xác nhận mật khẩu không được để trống')
        .oneOf([yup.ref('password'), null], 'Mật khẩu xác nhận không khớp'),
});

const ResetPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        if (!token) {
            toast.error('Token xác minh không tồn tại hoặc không hợp lệ.');
            return;
        }

        try {
            setLoading(true);
            await axiosClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
                token: token,
                newPassword: data.password
            });
            setIsSuccess(true);
            toast.success('Mật khẩu của bạn đã được cập nhật thành công!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình thiết lập lại mật khẩu.');
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
                    <h1 className="text-4xl font-bold mb-6 leading-tight">Thiết lập mật khẩu an toàn và bảo mật</h1>
                    <p className="text-blue-100 text-lg">Mật khẩu mạnh giúp bảo vệ thông tin liên hệ, CV và hành trình tìm việc của bạn trước mọi truy cập trái phép.</p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-blue-100">
                    <span>Mã hóa chuẩn AES-256</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>An tâm tuyệt đối</span>
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
                    {!token ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-100 shadow-sm">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Link không hợp lệ
                            </h2>
                            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                                Đường dẫn khôi phục mật khẩu thiếu mã xác thực (token) hoặc liên kết đã hỏng. Vui lòng kiểm tra lại liên kết trong email của bạn hoặc tạo yêu cầu khôi phục mới.
                            </p>
                            <Link
                                to="/forgot-password"
                                className="inline-flex w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold items-center justify-center transition-all active:scale-[0.99] shadow-sm shadow-primary/30"
                            >
                                Gửi yêu cầu khôi phục mới
                            </Link>
                        </div>
                    ) : !isSuccess ? (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Thiết lập mật khẩu mới
                                </h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    Vui lòng nhập mật khẩu mới có tối thiểu 6 ký tự để bảo mật tài khoản của bạn.
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu mới</label>
                                    <div className="relative">
                                        <input
                                            {...register('password')}
                                            type="password"
                                            className={`w-full h-11 pl-10 pr-4 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                            placeholder="••••••••"
                                        />
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                                    <div className="relative">
                                        <input
                                            {...register('confirmPassword')}
                                            type="password"
                                            className={`w-full h-11 pl-10 pr-4 rounded-lg border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                            placeholder="••••••••"
                                        />
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover active:scale-[0.99] transition-all mt-6 flex items-center justify-center disabled:opacity-70 shadow-sm shadow-primary/30"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Cập nhật mật khẩu'
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
                                Thành công!
                            </h2>
                            <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-sm mx-auto">
                                Mật khẩu của bạn đã được thay đổi thành công. Bây giờ bạn có thể đăng nhập vào tài khoản của mình bằng mật khẩu mới này.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold items-center justify-center transition-all active:scale-[0.99] shadow-sm shadow-primary/30"
                            >
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
