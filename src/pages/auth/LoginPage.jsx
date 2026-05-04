
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
            const role = user.role?.name || user.role || '';
            if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER') {
                navigate('/admin');
            } else if (role === 'HR' || role === 'ROLE_HR') {
                navigate('/hr');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await login(data.username, data.password);
            const loggedInUser = res?.user || user;
            const role = loggedInUser?.role?.name || loggedInUser?.role || '';
            
            if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER') {
                navigate('/admin');
            } else if (role === 'HR' || role === 'ROLE_HR') {
                navigate('/hr');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
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
            <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-12 relative">
                {/* Decorative background element for mobile */}
                <div className="absolute top-0 left-0 w-full h-64 bg-primary lg:hidden rounded-b-[2.5rem]"></div>
                
                <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 relative z-10 border border-gray-100/50">
                    <div className="text-center mb-8">
                        <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-xl font-bold text-gray-900 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                                J
                            </div>
                            JobHunter
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Chào mừng trở lại
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Chưa có tài khoản? <Link to="/register" className="font-semibold text-primary hover:underline">Đăng ký ngay</Link>
                        </p>
                    </div>

                    <div className="mb-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    const res = await loginGoogle(credentialResponse.credential);
                                    const loggedInUser = res?.user || user;
                                    const role = loggedInUser?.role?.name || loggedInUser?.role || '';
                                    
                                    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER') {
                                        navigate('/admin');
                                    } else if (role === 'HR' || role === 'ROLE_HR') {
                                        navigate('/hr');
                                    } else {
                                        navigate('/');
                                    }
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

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-400 font-medium">Hoặc đăng nhập bằng Email</span>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email / Username</label>
                            <input
                                {...register('username')}
                                type="text"
                                className={`w-full h-11 px-4 rounded-lg border ${errors.username ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                placeholder="Nhập email của bạn"
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.username.message}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                                <a href="#" className="text-sm font-medium text-primary hover:underline">Quên mật khẩu?</a>
                            </div>
                            <input
                                {...register('password')}
                                type="password"
                                className={`w-full h-11 px-4 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-primary focus:ring-primary/20'} outline-none transition-all focus:ring-4 text-sm bg-gray-50/50 focus:bg-white`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover active:scale-[0.99] transition-all mt-6 flex items-center justify-center disabled:opacity-70 shadow-sm shadow-primary/30"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
