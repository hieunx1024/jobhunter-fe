import axiosClient from '../api/axiosClient';
import { message } from 'antd';

let isOpening = false;

/**
 * Open PDF file directly in a new browser tab or download if blocked
 * Supports direct Cloudinary URLs and legacy backend proxy URLs
 */
export const openPDFDirectly = async (fileName, folder = 'resume') => {
    if (!fileName) {
        message.warning('Không tìm thấy thông tin tệp tin');
        return;
    }

    if (isOpening) return;

    // CASE 1: Cloudinary URL (Direct access)
    // Check if it starts with http to identify as a cloud URL
    if (typeof fileName === 'string' && (fileName.startsWith('http://') || fileName.startsWith('https://'))) {
        console.log('>>> Opening direct Cloudinary URL:', fileName);
        const newWindow = window.open(fileName, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            message.warning('Trình duyệt đã chặn cửa sổ mới. Đang cố gắng tải về...');
            const link = document.createElement('a');
            link.href = fileName;
            link.download = fileName.split('/').pop();
            link.target = '_blank';
            link.click();
        } else {
            message.success('Đang mở CV...');
        }
        return;
    }

    // CASE 2: Local filename (Legacy proxy access)
    const hide = message.loading('Đang chuẩn bị tài liệu...', 0);
    isOpening = true;

    try {
        console.log('>>> Fetching local file via proxy:', fileName);
        const foldersToTry = [folder, 'resume', 'cv', 'resumes'].filter(v => v);
        let blobUrl = null;
        let lastError = null;

        for (const currentFolder of foldersToTry) {
            try {
                const response = await axiosClient.get('/files', {
                    params: { fileName, folder: currentFolder },
                    responseType: 'blob',
                    timeout: 30000, 
                });

                const blob = new Blob([response.data], { type: 'application/pdf' });
                blobUrl = window.URL.createObjectURL(blob);
                break; 
            } catch (error) {
                lastError = error;
                if (error.response?.status !== 404 && error.response?.status !== 400) break;
            }
        }

        if (blobUrl) {
            const newWindow = window.open(blobUrl, '_blank');
            if (!newWindow) {
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                link.click();
            }
            message.success('Đã mở tài liệu');
        } else {
            console.error('Error opening local PDF:', lastError);
            message.error('Không tìm thấy tệp tin trên máy chủ. Tệp có thể đã bị xóa.');
        }
    } catch (err) {
        console.error('Fatal error in openPDFDirectly:', err);
        message.error('Lỗi khi mở tệp tin');
    } finally {
        hide();
        isOpening = false;
    }
};
