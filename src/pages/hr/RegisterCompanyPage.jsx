
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Building2, MapPin, Link as LinkIcon, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterCompanyPage = () => {
    const navigate = useNavigate();
    const { user, fetchAccount } = useAuth();
    const [verificationMethod, setVerificationMethod] = useState('FILE');
    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            companyName: '',
            address: '',
            description: '',
            logo: '',
            verificationDocument: '',
            facebookLink: '',
            githubLink: ''
        }
    });

    const verificationDocument = watch('verificationDocument');
    const logo = watch('logo');

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            toast.error('Định dạng ảnh không hợp lệ! Chỉ cho phép: ' + allowedExtensions.join(', '));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'company');

        setUploadingLogo(true);
        try {
            const res = await axiosClient.post(ENDPOINTS.FILES.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const logoUrl = res.data.fileName;
            setValue('logo', logoUrl, { shouldValidate: true });
            toast.success('Tải logo công ty lên thành công!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải logo.');
        } finally {
            setUploadingLogo(false);
        }
    };

    // Check if user already has a pending registration or is already in a company
    const { data: myRegistrations, isLoading: checkingStatus } = useQuery({
        queryKey: ['my-registrations'],
        queryFn: async () => {
            const res = await axiosClient.get(ENDPOINTS.COMPANY_REGISTRATIONS.BASE);
            return res.data.data ? res.data.data : res.data;
        }
    });

    const isPending = myRegistrations?.result?.some(r => r.status === 'PENDING');
    const isApproved = myRegistrations?.result?.some(r => r.status === 'APPROVED');

    useEffect(() => {
        if (user?.company) {
            // User already belongs to a company
        }
    }, [user]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            toast.error('Định dạng file không hợp lệ! Chỉ cho phép: ' + allowedExtensions.join(', '));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'company'); // store in company folder

        setUploading(true);
        try {
            const res = await axiosClient.post(ENDPOINTS.FILES.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const fileName = res.data.fileName;
            setValue('verificationDocument', fileName, { shouldValidate: true });
            setUploadedFileName(file.name);
            toast.success('Tải tài liệu xác thực lên thành công!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải file.');
        } finally {
            setUploading(false);
        }
    };

    const mutation = useMutation({
        mutationFn: (data) => axiosClient.post(ENDPOINTS.COMPANY_REGISTRATIONS.BASE, data),
        onSuccess: async () => {
            toast.success('Gửi yêu cầu đăng ký thành công! Vui lòng chờ admin phê duyệt.');
            await fetchAccount();
            navigate('/hr');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
        }
    });

    const onSubmit = (data) => {
        if (!data.verificationDocument) {
            toast.warning('Vui lòng cung cấp tài liệu hoặc liên kết xác thực công ty.');
            return;
        }
        mutation.mutate(data);
    };

    if (user?.company) {
        return (
            <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Building2 className="w-16 h-16 text-brand-900 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn đã thuộc về một công ty</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                    Tài khoản của bạn đã được liên kết với công ty <strong>{user.company.name}</strong>.
                </p>
                <button onClick={() => navigate('/dashboard')} className="bg-brand-900 text-white px-6 py-2 rounded-full hover:bg-brand-900 transition">
                    Vào Dashboard
                </button>
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-yellow-100 p-4 rounded-full mb-4">
                    <CheckCircle className="w-12 h-12 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang chờ phê duyệt</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                    Yêu cầu đăng ký công ty của bạn đã được gửi và đang chờ Admin phê duyệt. Vui lòng quay lại sau.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-brand-900 px-8 py-6 text-white">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Building2 className="w-8 h-8" />
                        Đăng ký Công ty
                    </h1>
                    <p className="mt-2 text-blue-100 opacity-90">
                        Điền thông tin công ty của bạn để bắt đầu đăng tuyển dụng trên JobHunter.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty <span className="text-red-500">*</span></label>
                            <input
                                {...register('companyName', { required: 'Tên công ty là bắt buộc' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Ví dụ: Tech Solutions Inc."
                            />
                            {errors.companyName && <span className="text-red-500 text-xs mt-1">{errors.companyName.message}</span>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="Ví dụ: Tầng 5, Tòa nhà Landmark 72..."
                                />
                            </div>
                            {errors.address && <span className="text-red-500 text-xs mt-1">{errors.address.message}</span>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu ngắn</label>
                            <textarea
                                {...register('description')}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                                placeholder="Mô tả về quy mô, lĩnh vực hoạt động, văn hóa công ty..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-gray-500" />
                            Liên kết & Tài liệu
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo công ty</label>
                                {logo ? (
                                    <div className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                                        <img src={logo} alt="Logo Preview" className="w-16 h-16 object-contain rounded-lg border bg-white p-1" />
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Logo đã được tải lên Cloudinary</div>
                                            <button
                                                type="button"
                                                onClick={() => setValue('logo', '')}
                                                className="text-xs font-bold text-red-600 hover:underline"
                                            >
                                                Xóa logo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition duration-200">
                                        <div className="flex flex-col items-center text-center">
                                            <Building2 className={`w-8 h-8 mb-1.5 ${uploadingLogo ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                                            <span className="text-xs font-bold text-gray-700">
                                                {uploadingLogo ? 'Đang tải lên...' : 'Chọn ảnh làm logo công ty'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                PNG, JPG, JPEG (Tối đa 5MB)
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleLogoUpload}
                                            disabled={uploadingLogo}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức xác thực công ty</label>
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-3 w-fit">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVerificationMethod('FILE');
                                            setValue('verificationDocument', uploadedFileName ? verificationDocument : '');
                                        }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${verificationMethod === 'FILE' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        Tải tài liệu lên (.pdf, .png...)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVerificationMethod('LINK');
                                            setValue('verificationDocument', uploadedFileName ? '' : verificationDocument);
                                        }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${verificationMethod === 'LINK' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        Nhập liên kết (Drive/Dropbox...)
                                    </button>
                                </div>

                                {verificationMethod === 'FILE' ? (
                                    <div className="space-y-2">
                                        {uploadedFileName ? (
                                            <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-xl">
                                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    <div className="overflow-hidden">
                                                        <div className="font-semibold text-gray-800 text-xs truncate">{uploadedFileName}</div>
                                                        <div className="text-[10px] text-gray-500">Đã tải lên</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUploadedFileName('');
                                                        setValue('verificationDocument', '');
                                                    }}
                                                    className="text-[11px] font-bold text-red-600 hover:underline flex-shrink-0"
                                                >
                                                    Thay đổi
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition duration-200">
                                                <div className="flex flex-col items-center text-center">
                                                    <FileText className={`w-8 h-8 mb-1.5 ${uploading ? 'text-blue-500 animate-bounce' : 'text-gray-400'}`} />
                                                    <span className="text-xs font-bold text-gray-700">
                                                        {uploading ? 'Đang tải lên...' : 'Chọn file tài liệu pháp lý'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-0.5">
                                                        PDF, PNG, JPG, DOCX (Max 10MB)
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                />
                                            </label>
                                        )}
                                        {errors.verificationDocument && <span className="text-red-500 text-xs">{errors.verificationDocument.message}</span>}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                            <input
                                                {...register('verificationDocument', { required: 'Vui lòng nhập liên kết tài liệu xác thực' })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                placeholder="Link Google Drive chứa giấy phép kinh doanh..."
                                            />
                                        </div>
                                        {errors.verificationDocument && <span className="text-red-500 text-xs mt-1">{errors.verificationDocument.message}</span>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Fanpage</label>
                                <input
                                    {...register('facebookLink')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Github / Website</label>
                                <input
                                    {...register('githubLink')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={mutation.isPending || uploading}
                            className="bg-brand-900 text-white px-8 py-3 rounded-lg hover:bg-brand-900 transition font-medium shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center gap-2"
                        >
                            {mutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu đăng ký'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterCompanyPage;
