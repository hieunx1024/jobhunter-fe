import axiosClient from '../api/axiosClient';
import { message } from 'antd';

/**
 * Mở file PDF trực tiếp trong tab mới của trình duyệt
 * @param {string} fileName Tên file
 * @param {string} folder Thư mục (cv hoặc resume)
 */
export const openPDFDirectly = async (fileName, folder) => {
    if (!fileName) {
        message.warning('Không tìm thấy tên file CV');
        return;
    }

    const hide = message.loading('Đang tải tài liệu...', 0);
    
    // Thử các thư mục tiềm năng nếu thư mục hiện tại không tìm thấy file
    const foldersToTry = [folder, 'resume', 'cv', 'resumes'].filter((v, i, a) => a.indexOf(v) === i);
    
    let lastError = null;
    let blobUrl = null;

    for (const currentFolder of foldersToTry) {
        try {
            const response = await axiosClient.get('/files', {
                params: {
                    fileName: fileName,
                    folder: currentFolder
                },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            blobUrl = window.URL.createObjectURL(blob);
            break; // Tìm thấy file, dừng thử
        } catch (error) {
            lastError = error;
            // Nếu lỗi 400 (thường là File Not Found), tiếp tục thử thư mục khác
            if (error.response?.status !== 400) {
                break;
            }
        }
    }

    hide();

    if (blobUrl) {
        // Mở trong tab mới
        const newWindow = window.open(blobUrl, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            message.error('Trình duyệt đã chặn popup. Vui lòng cho phép popup để xem CV.');
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            link.click();
        }

        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 1000 * 60);
    } else {
        console.error('Error opening PDF after trying multiple folders:', lastError);
        message.error('Không tìm thấy file CV trên máy chủ. Vui lòng liên hệ quản trị viên.');
    }
};
