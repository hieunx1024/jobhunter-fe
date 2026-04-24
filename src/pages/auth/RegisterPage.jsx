
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Đăng ký tài khoản
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Đã có tài khoản? <Link to="/login"
                            className="font-medium text-brand-900 hover:text-blue-700">Đăng
                            nhập</Link>
                    </p>
                </div>

                <div className="mt-8">
                    <div className="flex justify-center">
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
                </div>

                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Hoặc đăng ký bằng Email</span>
                    </div>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bạn là?</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${selectedRole === 'CANDIDATE' ? 'border-brand-900 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
                                onClick={() => setValue('role', 'CANDIDATE')}
                            >
                                <p className="font-bold text-zinc-800">Ứng viên</p>
                                <p className="text-xs text-gray-500">Tôi đang tìm việc</p>
                            </div>
                            <div
                                className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${selectedRole === 'RECRUITER' ? 'border-brand-900 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
                                onClick={() => setValue('role', 'RECRUITER')}
                            >
                                <p className="font-bold text-zinc-800">Nhà tuyển dụng</p>
                                <p className="text-xs text-gray-500">Tôi muốn đăng tin</p>
                            </div>
                        </div>
                        <input type="hidden" {...register('role')} />
                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-brand-900 focus:outline-none"
                            placeholder="Nguyễn Văn A"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-brand-900 focus:outline-none"
                            placeholder="email@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            {...register('password')}
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-brand-900 focus:outline-none"
                            placeholder="******"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi</label>
                            <input
                                {...register('age')}
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-brand-900 focus:outline-none"
                            />
                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                            <select
                                {...register('gender')}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-brand-900 focus:outline-none"
                            >
                                <option value="">Chọn</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input
                            {...register('address')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-brand-900 focus:outline-none"
                            placeholder="Hà Nội"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-900 hover:bg-brand-900 disabled:opacity-50 transition-all duration-200"
                        >
                            {loading ? 'Đăng ký...' : 'Đăng ký'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
