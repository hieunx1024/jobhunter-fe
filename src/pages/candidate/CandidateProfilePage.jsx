import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { openPDFDirectly } from '../../utils/fileUtils';
import {
    User,
    Mail,
    MapPin,
    Calendar,
    Upload,
    FileText,
    Save,
    Eye,
    Download,
    Trash2,
    CheckCircle
} from 'lucide-react';

const CandidateProfilePage = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        age: '',
        gender: ''
    });
    const [cvFile, setCvFile] = useState(null);
    const [cvUrl, setCvUrl] = useState('');
    const [cvId, setCvId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadingCv, setUploadingCv] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                address: user.address || '',
                age: user.age || '',
                gender: user.gender || ''
            });
            
            // Fetch CV list from Backend (authContext does not include CVs to minimize payload size)
            const fetchProfile = async () => {
                try {
                    const response = await axiosClient.get(ENDPOINTS.PROFILE.BASE);
                    const profileData = response.data.data ? response.data.data : response.data;
                    if (profileData && profileData.cvs && profileData.cvs.length > 0) {
                        // Retrieve the most recent or default CV
                        const latestCv = profileData.cvs[profileData.cvs.length - 1];
                        setCvUrl(latestCv.url);
                        setCvId(latestCv.id);
                    }
                } catch (e) {
                    console.error("Failed to load CV profile data", e);
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCvFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Vui lòng chọn file PDF');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('File không được vượt quá 5MB');
                return;
            }
            setCvFile(file);
        }
    };

    const handleUploadCv = async () => {
        if (!cvFile) {
            alert('Vui lòng chọn file CV');
            return;
        }

        try {
            setUploadingCv(true);
            const formData = new FormData();
            formData.append('file', cvFile);
            formData.append('folder', 'resume');

            const response = await axiosClient.post(ENDPOINTS.FILES.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setCvUrl(response.data?.fileName || '');
            setSuccessMessage('CV đã được tải lên thành công!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error uploading CV:', error);
            alert('Không thể tải lên CV. Vui lòng thử lại.');
        } finally {
            setUploadingCv(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('address', formData.address);
            submitData.append('age', formData.age || '');
            submitData.append('gender', formData.gender);
            
            if (cvFile && !cvUrl) { 
                // Only append file if it's newly selected and not already uploaded via the separate button
                submitData.append('file', cvFile);
            }

            const response = await axiosClient.post(ENDPOINTS.PROFILE.BASE, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update user context
            if (response.data) {
                // Determine if backend wrapped it in .data
                const profileData = response.data.data ? response.data.data : response.data;
                setUser(prev => ({
                    ...prev,
                    ...profileData
                }));
                // Optionally update cvUrl if backend returns it
                if (profileData.cvs && profileData.cvs.length > 0) {
                    const latestCv = profileData.cvs[profileData.cvs.length - 1];
                    setCvUrl(latestCv.url);
                    setCvId(latestCv.id);
                }
            }

            setSuccessMessage('Cập nhật thông tin thành công!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Không thể cập nhật thông tin. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewCv = () => {
        if (cvUrl) {
            openPDFDirectly(cvUrl, 'resume');
        }
    };

    const handleDeleteCv = async () => {
        if (!cvId) {
            setCvFile(null);
            setCvUrl('');
            return;
        }
        if (window.confirm('Bạn có chắc muốn xóa CV này vĩnh viễn khỏi thư viện?')) {
            try {
                await axiosClient.delete(`${ENDPOINTS.PROFILE.BASE}/cv/${cvId}`);
                setCvFile(null);
                setCvUrl('');
                setCvId(null);
                setSuccessMessage('Xóa CV thành công!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                console.error(err);
                alert("Bạn không có quyền tương tác với CV của người khác hoặc có lỗi xảy ra");
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <p className="text-green-700 font-medium">{successMessage}</p>
                </div>
            )}

            {/* Header */}
            <div className="mb-10 p-10 rounded-[2.5rem] bg-white border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-blue-50/20 skew-x-[-20deg] translate-x-16"></div>
                <div className="relative z-10 flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-brand-900 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-600/20">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-brand-900 tracking-tight mb-1">Hồ sơ cá nhân</h1>
                        <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px]">Quản lý thông tin và CV của bạn</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                            <User className="w-6 h-6 text-brand-900" />
                            <span>Thông tin cá nhân</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập địa chỉ"
                                    />
                                </div>
                            </div>

                            {/* Age and Gender */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tuổi
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        min="18"
                                        max="100"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập tuổi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giới tính
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-brand-900 text-white rounded-2xl font-bold hover:bg-brand-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/10 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Cập nhật hồ sơ</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* CV Upload Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                            <FileText className="w-6 h-6 text-brand-900" />
                            <span>CV của bạn</span>
                        </h2>

                        {/* CV Upload */}
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-900 transition-all">
                                <input
                                    type="file"
                                    id="cv-upload"
                                    accept=".pdf"
                                    onChange={handleCvFileChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="cv-upload"
                                    className="cursor-pointer flex flex-col items-center space-y-3"
                                >
                                    <div className="p-4 bg-blue-50 rounded-full">
                                        <Upload className="w-8 h-8 text-brand-900" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                            {cvFile ? cvFile.name : 'Chọn file CV'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PDF, tối đa 5MB</p>
                                    </div>
                                </label>
                            </div>

                            {cvFile && (
                                <button
                                    onClick={handleUploadCv}
                                    disabled={uploadingCv}
                                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {uploadingCv ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Đang tải lên...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            <span>Tải lên CV</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Current CV */}
                            {cvUrl && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm font-semibold text-green-700 mb-3">✓ CV hiện tại</p>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={handleViewCv}
                                            className="flex-1 py-2 bg-brand-900 text-white rounded-lg hover:bg-brand-900 transition-all flex items-center justify-center space-x-2 text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>Xem</span>
                                        </button>
                                        <button
                                            onClick={handleDeleteCv}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center space-x-2 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tips */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-800 mb-2">💡 Lưu ý khi tải CV</h3>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• Chỉ chấp nhận file PDF</li>
                                    <li>• Kích thước tối đa 5MB</li>
                                    <li>• Đảm bảo CV rõ ràng, dễ đọc</li>
                                    <li>• Cập nhật CV thường xuyên</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Hoàn thiện hồ sơ để tăng cơ hội</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-gray-800">Thông tin đầy đủ</p>
                            <p className="text-sm text-gray-600">Điền đầy đủ thông tin cá nhân</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-gray-800">CV chuyên nghiệp</p>
                            <p className="text-sm text-gray-600">Tải lên CV được cập nhật</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-gray-800">Thông tin chính xác</p>
                            <p className="text-sm text-gray-600">Đảm bảo thông tin liên hệ đúng</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-gray-800">Cập nhật thường xuyên</p>
                            <p className="text-sm text-gray-600">Giữ hồ sơ luôn mới nhất</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfilePage;
