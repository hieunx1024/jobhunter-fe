import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import { LockOutlined } from '@ant-design/icons';

const schema = yup.object().shape({
    name: yup.string().required('Tên hiển thị không được để trống'),
    age: yup.number().typeError('Tuổi phải là số').required('Tuổi không được để trống').min(18, 'Phải trên 18 tuổi').max(100, 'Tuổi không hợp lệ'),
    gender: yup.string().required('Vui lòng chọn giới tính'),
    address: yup.string().required('Địa chỉ không được để trống'),
});


const ProfilePage = () => {
    const { user, fetchAccount } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });


    useEffect(() => {
        if (user) {
            setValue('name', user.name);
            setValue('age', user.age);
            setValue('gender', user.gender); // Ensure gender matches user data (MALE/FEMALE)
            setValue('address', user.address);
        }
    }, [user, setValue]);

    const onSubmitInfo = async (data) => {
        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('name', data.name);
            submitData.append('address', data.address);
            submitData.append('age', data.age);
            submitData.append('gender', data.gender);

            await axiosClient.post(ENDPOINTS.PROFILE.BASE, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Cập nhật thông tin thành công!');
            await fetchAccount(); // Refresh user data
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };


    if (!user) return <div className="p-8 text-center">Đang tải thông tin...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Hồ sơ cá nhân</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'info' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Thông tin chung
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'password' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Đổi mật khẩu
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'info' ? (
                        <form onSubmit={handleSubmit(onSubmitInfo)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="text"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Email không thể thay đổi</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                                    <div className="w-full px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 font-medium">
                                        {user.role?.name ?? user.role ?? 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                    <input
                                        {...register('name')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Nhập tên hiển thị"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tuổi</label>
                                    <input
                                        type="number"
                                        {...register('age')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Nhập tuổi"
                                    />
                                    {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                                    <select
                                        {...register('gender')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                    {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                    <textarea
                                        {...register('address')}
                                        rows="3"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Nhập địa chỉ của bạn"
                                    ></textarea>
                                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-brand-900 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-200 font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang lưu...
                                        </>
                                    ) : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <LockOutlined style={{ fontSize: '48px', color: '#1890ff', opacity: 0.8 }} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Bảo mật tài khoản</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                Bạn nên sử dụng mật khẩu mạnh để bảo vệ tài khoản của mình khỏi những truy cập trái phép.
                            </p>
                            <button
                                onClick={() => setIsChangePasswordModalOpen(true)}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 font-bold transition-all shadow-lg shadow-indigo-100 flex items-center mx-auto"
                            >
                                <LockOutlined className="mr-2" />
                                Đổi mật khẩu ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ChangePasswordModal
                open={isChangePasswordModalOpen}
                onCancel={() => setIsChangePasswordModalOpen(false)}
            />
        </div>
    );
};

export default ProfilePage;
