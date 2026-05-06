import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import { User, Mail, ShieldCheck, MapPin, Calendar, Edit3, KeyRound, Loader2, Save } from 'lucide-react';

const schema = yup.object().shape({
    name: yup.string().required('Tên hiển thị không được để trống'),
    age: yup.number().typeError('Tuổi phải là số').required('Tuổi không được để trống').min(18, 'Phải trên 18 tuổi').max(100, 'Tuổi không hợp lệ'),
    gender: yup.string().required('Vui lòng chọn giới tính'),
    address: yup.string().required('Địa chỉ không được để trống'),
});

const HRProfilePage = () => {
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
            setValue('gender', user.gender);
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
            await fetchAccount();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return (
        <div className="flex justify-center items-center h-[80vh] bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="bg-transparent py-4 px-2">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="h-32 bg-gradient-to-r from-primary to-primary-hover relative">
                        <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    </div>
                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 z-10 relative group">
                                <div className="w-full h-full bg-primary-light flex items-center justify-center text-primary font-bold text-4xl">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                            </div>
                            <div className="text-center sm:text-left flex-1 pb-2">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.name}</h1>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-gray-500">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                    <span className="mx-2 px-2.5 py-0.5 rounded-full bg-primary-light text-primary text-xs font-semibold uppercase tracking-wide border border-primary/20">
                                        {user.role?.name ?? user.role ?? 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:col-span-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-200 font-medium ${activeTab === 'info' ? 'bg-white shadow-sm border border-gray-100 text-primary' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'}`}
                        >
                            <User className={`w-5 h-5 ${activeTab === 'info' ? 'text-primary' : 'text-gray-400'}`} />
                            Thông tin chung
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-200 font-medium ${activeTab === 'password' ? 'bg-white shadow-sm border border-gray-100 text-primary' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'}`}
                        >
                            <ShieldCheck className={`w-5 h-5 ${activeTab === 'password' ? 'text-primary' : 'text-gray-400'}`} />
                            Đổi mật khẩu
                        </button>
                    </div>

                    {/* Content Panel */}
                    <div className="md:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            {activeTab === 'info' ? (
                                <div className="animate-fade-in">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Edit3 className="w-5 h-5 text-primary" />
                                        Cập nhật thông tin
                                    </h2>
                                    <form onSubmit={handleSubmit(onSubmitInfo)} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                                                <input
                                                    {...register('name')}
                                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                                    placeholder="Nhập tên hiển thị"
                                                />
                                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" /> Tuổi
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('age')}
                                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.age ? 'border-red-500' : 'border-gray-200'}`}
                                                    placeholder="Nhập tuổi"
                                                />
                                                {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                                                <div className="flex gap-4">
                                                    {['MALE', 'FEMALE', 'OTHER'].map(g => (
                                                        <label key={g} className="relative flex items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all flex-1">
                                                            <input type="radio" value={g} {...register('gender')} className="peer sr-only" />
                                                            <div className="text-gray-600 font-medium peer-checked:text-primary">{g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác'}</div>
                                                            <div className="absolute inset-0 border-2 border-transparent peer-checked:border-primary rounded-xl pointer-events-none transition-all"></div>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" /> Địa chỉ
                                                </label>
                                                <textarea
                                                    {...register('address')}
                                                    rows="3"
                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                                                    placeholder="Nhập địa chỉ của bạn"
                                                ></textarea>
                                                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover focus:ring-4 focus:ring-primary/30 font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="animate-fade-in text-center py-8">
                                    <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                                        <KeyRound className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Bảo mật tài khoản</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                        Sử dụng mật khẩu mạnh với ít nhất 6 ký tự để bảo vệ tài khoản của bạn khỏi những truy cập trái phép.
                                    </p>
                                    <button
                                        onClick={() => setIsChangePasswordModalOpen(true)}
                                        className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 font-semibold transition-all shadow-md flex items-center gap-2 mx-auto"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        Đổi mật khẩu ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                open={isChangePasswordModalOpen}
                onCancel={() => setIsChangePasswordModalOpen(false)}
            />
        </div>
    );
};

export default HRProfilePage;
