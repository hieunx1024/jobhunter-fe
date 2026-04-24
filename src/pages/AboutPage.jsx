import React from 'react';
import { Shield, Target, Users } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="pb-20">
            {/* Header section styled with brand-900 to match the dark theme */}
            <div className="bg-brand-900 text-white py-20 round-b-3xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl text-white font-black mb-6 drop-shadow-md">Về JobHunter</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Nền tảng kết nối nhân tài với các nhà tuyển dụng hàng đầu, mang lại cơ hội phát triển sự nghiệp không giới hạn.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-zinc-800 space-y-16">
                <section>
                    <h2 className="text-3xl font-bold text-center mb-8">Sứ Mệnh</h2>
                    <p className="text-lg leading-relaxed text-center max-w-4xl mx-auto text-gray-600">
                        Tại JobHunter, chúng tôi không chỉ tìm việc làm, chúng tôi định hình sự nghiệp. Sứ mệnh của chúng tôi là minh bạch hoá thị trường tuyển dụng, mang lại quyền lợi tối ưu cho không chỉ ứng viên mà còn giúp doanh nghiệp tìm thấy mảnh ghép nhân sự hoàn hảo.
                    </p>
                </section>

                <section className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-700">
                            <Target className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Mục Tiêu</h3>
                        <p className="text-gray-600">Trở thành cầu nối tuyển dụng uy tín hàng đầu khu vực.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-700">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Cộng Đồng</h3>
                        <p className="text-gray-600">Xây dựng mạng lưới tri thức và việc làm rộng lớn chất lượng cao.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-700">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Cam Kết</h3>
                        <p className="text-gray-600">Bảo mật thông tin tối đa, ứng tuyển an toàn minh bạch.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
