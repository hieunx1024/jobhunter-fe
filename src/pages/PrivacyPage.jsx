import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="pb-20">
            {/* Header section */}
            <div className="bg-brand-900 text-white py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl text-white font-black mb-4 drop-shadow-md">Chính Sách Bảo Mật</h1>
                <p className="text-xl text-blue-100/90 max-w-2xl mx-auto">
                    Bảo vệ thông tin cá nhân của bạn là ưu tiên hàng đầu tại JobHunter. Vui lòng đọc kỹ các chính sách dưới đây.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-zinc-800">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 prose prose-brand max-w-none">
                    <h2 className="text-2xl font-bold text-brand-900 mb-4 border-b pb-4 border-gray-100">1. Thu thập thông tin cá nhân</h2>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        JobHunter thu thập thông tin cá nhân của bạn khi bạn đăng ký tài khoản, tạo hồ sơ (CV), ứng tuyển vào các vị trí công việc, hoặc điền vào các mẫu liên hệ trên hệ thống. 
                        Thông tin chúng tôi thu thập có thể bao gồm: Họ tên, email, số điện thoại, địa chỉ, lịch sử học tập, kinh nghiệm làm việc và các kỹ năng chuyên môn của bạn.
                    </p>

                    <h2 className="text-2xl font-bold text-brand-900 mb-4 border-b pb-4 border-gray-100">2. Mục đích sử dụng thông tin</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Chúng tôi sử dụng thông tin của bạn vào các mục đích:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-8 space-y-2">
                        <li>Cung cấp dịch vụ kết nối ứng viên và nhà tuyển dụng hiệu quả nhất.</li>
                        <li>Gợi ý các công việc phù hợp với năng lực và mục tiêu nghề nghiệp của bạn.</li>
                        <li>Thông báo các cơ hội việc làm tự động theo nhu cầu.</li>
                        <li>Nâng cao chất lượng dịch vụ khách hàng và chăm sóc người dùng.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-brand-900 mb-4 border-b pb-4 border-gray-100">3. Chia sẻ thông tin</h2>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        Hồ sơ trực tuyến của bạn có thể được chia sẻ cho các đối tác tuyển dụng, công ty đang có nhu cầu nhân sự phù hợp (trừ khi quá trình ứng tuyển yêu cầu chế độ bảo mật khắt khe). 
                        JobHunter cam kết KHÔNG bán hoặc cho thuê dữ liệu cá nhân của người dùng cho bên thứ ba vì các mục đích thương mại không liên quan.
                    </p>

                    <h2 className="text-2xl font-bold text-brand-900 mb-4 border-b pb-4 border-gray-100">4. Bảo mật dữ liệu</h2>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        JobHunter sử dụng nhiều quy chuẩn công nghệ tiên tiến (mã hóa SSL, JWT cho phiên đăng nhập) để bảo vệ thông tin người dùng khỏi các nguy cơ đánh cắp và xâm phạm bên ngoài. Mọi giao dịch thông qua nền tảng, kể cả đăng ký công ty, đều trải qua nhiều bước xác thực an toàn.
                    </p>

                    <h2 className="text-2xl font-bold text-brand-900 mb-4 border-b pb-4 border-gray-100">5. Liên hệ chúng tôi</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Nếu bạn có bất kỳ câu hỏi nào về chính sách này, xin vui lòng truy cập trang <a href="/contact" className="text-brand-900 hover:text-blue-700 font-bold underline">Liên Hệ</a> hoặc gửi email hỗ trợ đến team CSKH của chúng tôi.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
