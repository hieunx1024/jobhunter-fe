
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useState } from 'react';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const schema = yup.object().shape({
    name: yup.string().required('Họ tên là bắt buộc'),
    email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
    password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    gender: yup.string().required('Giới tính là bắt buộc'),
    age: yup.number().typeError('Tuổi phải là số').required('Tuổi là bắt buộc').min(18, 'Phải trên 18 tuổi'),
    address: yup.string().required('Địa chỉ là bắt buộc'),
    role: yup.string().required('Vui lòng chọn vai trò'),
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const { loginGoogle } = useAuth();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            role: 'CANDIDATE' // Default role
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await axiosClient.post(ENDPOINTS.AUTH.REGISTER, data);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            const msg = error.response?.data?.message || 'Đăng ký thất bại.';
            toast.error(msg);
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
                    <h1 className="text-4xl font-bold mb-6 leading-tight">Khám phá cơ hội nghề nghiệp tuyệt vời</h1>
                    <p className="text-blue-100 text-lg">Hàng ngàn việc làm chất lượng cao đang chờ đón bạn. Tham gia ngay để xây dựng sự nghiệp mơ ước.</p>
                </div>
                
                <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-blue-100">
                    <span>10.000+ Việc làm</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>5.000+ Công ty</span>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-12 relative overflow-y-auto">
                {/* Decorative background element for mobile */}
                <div className="absolute top-0 left-0 w-full h-64 bg-primary lg:hidden rounded-b-[2.5rem]"></div>
                
                <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 relative z-10 border border-gray-100/50 my-auto">
                    <div className="text-center mb-8">
                        <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-xl font-bold text-gray-900 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                                J
                            </div>
                            JobHunter
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Đăng ký tài khoản
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Đã có tài khoản? <Link to="/login" className="font-semibold text-primary hover:underline">Đăng nhập</Link>
                        </p>
                    </div>

                    <div className="mb-6 flex justify-center">
                        <GoogleLogin
                            text="signup_with"
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    await loginGoogle(credentialResponse.credential);
                                    navigate('/');
                                } catch (error) {
                                    console.error(error);
                                    toast.error('Đăng ký bằng Google thất bại');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                toast.error('Đăng ký bằng Google thất bại');
                            }}
                        />
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-400 font-medium">Hoặc đăng ký bằng Email</span>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bạn là?</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className={`cursor-pointer rounded-xl p-3 text-center transition-all border ${selectedRole === 'CANDIDATE' ? 'border-primary bg-primary-light ring-1 ring-primary/50 shadow-sm shadow-primary/10' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
                                    onClick={() => setValue('role', 'CANDIDATE')}
                                >
                                    <p className="font-semibold text-gray-900 text-sm">Ứng viên</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Tôi đang tìm việc</p>
                                </div>
                                <div
                                    className={`cursor-pointer rounded-xl p-3 text-center transition-all border ${selectedRole === 'RECRUITER' ? 'border-primary bg-primary-light ring-1 ring-primary/50 shadow-sm shadow-primary/10' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
                                    onClick={() => setValue('role', 'RECRUITER')}
                                >
                                    <p className="font-semibold text-gray-900 text-sm">Nhà tuyển dụng</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Tôi muốn đăng tin</p>
                                </div>
                            </div>
                            <input type="hidden" {...register('role')} />
                            {errors.role && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.role.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
                            <input
                                {...register('name')}
                                type="text"
                                className={`w-full h-11 px-4 rounded-lg border ${errors.name ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                placeholder="Nguyễn Văn A"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className={`w-full h-11 px-4 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                placeholder="email@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
                            <input
                                {...register('password')}
                                type="password"
                                className={`w-full h-11 px-4 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tuổi</label>
                                <input
                                    {...register('age')}
                                    type="number"
                                    className={`w-full h-11 px-4 rounded-lg border ${errors.age ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                    placeholder="22"
                                />
                                {errors.age && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.age.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giới tính</label>
                                <select
                                    {...register('gender')}
                                    className={`w-full h-11 px-4 rounded-lg border ${errors.gender ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white appearance-none`}
                                >
                                    <option value="">Chọn</option>
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.gender.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ</label>
                            <input
                                {...register('address')}
                                type="text"
                                className={`w-full h-11 px-4 rounded-lg border ${errors.address ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                placeholder="Hà Nội"
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover active:scale-[0.99] transition-all mt-6 flex items-center justify-center disabled:opacity-70 shadow-sm shadow-primary/30"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Đăng ký'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
