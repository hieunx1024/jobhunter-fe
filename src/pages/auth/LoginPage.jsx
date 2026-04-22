
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

import { GoogleLogin } from '@react-oauth/google';

const schema = yup.object().shape({
    username: yup.string().required('Email/Username là bắt buộc'),
    password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

const LoginPage = () => {
    const { login, loginGoogle, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await login(data.username, data.password);
            // toast.success('Đăng nhập thành công!');
            // Chuyển hướng theo role hoặc trang trước đó
            // Tạm thời về trang chủ
            navigate('/');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
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
                        Đăng nhập
                    </h2>
                    <p className="mt-2 text-sm text-secondary-500">
                        Hoặc <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">đăng ký tài
                            khoản mới</Link>
                    </p>
                </div>

                <div className="mt-8">
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    await loginGoogle(credentialResponse.credential);
                                    navigate('/');
                                } catch (error) {
                                    console.error(error);
                                    toast.error('Đăng nhập Google thất bại');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                toast.error('Đăng nhập Google thất bại');
                            }}
                        />
                    </div>
                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng Email</span>
                        </div>
                    </div>
                </div>

                <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email / Username</label>
                            <input
                                {...register('username')}
                                type="text"
                                className={`appearance-none rounded relative block w-full px-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="admin@gmail.com"
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                            <input
                                {...register('password')}
                                type="password"
                                className={`appearance-none rounded relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="******"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-900 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200"
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
