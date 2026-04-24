import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
    return (
        <div className="pb-20">
            {/* Header section styled to match the dark brand theme */}
            <div className="bg-brand-900 text-white py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl text-white font-black mb-4">Liên Hệ</h1>
                <p className="text-lg text-blue-100/80 max-w-xl mx-auto">
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Vui lòng để lại thông tin hoặc liên hệ trực tiếp qua các kênh dưới đây.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid md:grid-cols-2 gap-12">
                {/* Thông tin liên hệ */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-900 mb-6">Thông tin liên hệ</h2>
                        <p className="text-gray-600 mb-8">
                            Dù bạn là ứng viên đang tìm việc hay nhà tuyển dụng đang tìm nhân tài, JobHunter luôn đồng hành cùng bạn.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-700">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Địa chỉ</h4>
                                <p className="text-gray-600">298 Đường Cầu Diễn, Phường Tây Tựu, Quận Bắc Từ Liêm, TP. Hà Nội</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-700">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Điện thoại</h4>
                                <p className="text-gray-600">1900 1234 (Hỗ trợ 24/7)</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-700">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Email</h4>
                                <p className="text-gray-600">hieuakvip1024@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form liên hệ */}
                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-blue-600/5 border border-gray-100">
                    <h3 className="text-2xl font-bold mb-6 text-brand-900">Gửi lời nhắn</h3>
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Lời nhắn đã được gửi!"); }}>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-1">Họ và tên</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-900 focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50" placeholder="Nguyễn Văn A" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-900 focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50" placeholder="email@example.com" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-1">Tin nhắn</label>
                            <textarea rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-900 focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 resize-none" placeholder="Nhập nội dung lời nhắn..." required></textarea>
                        </div>
                        <button type="submit" className="w-full bg-brand-900 hover:bg-brand-900 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Send className="w-5 h-5" />
                            Gửi Lời Nhắn
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
