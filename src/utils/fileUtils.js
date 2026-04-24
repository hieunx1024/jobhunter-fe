import axiosClient from '../api/axiosClient';
import { message } from 'antd';

/**
 * Open PDF file directly in a new browser tab
 * @param {string} fileName The file name
 * @param {string} folder The storage folder (e.g. cv or resume)
 */
export const openPDFDirectly = async (fileName, folder) => {
    if (!fileName) {
        message.warning('CV file name not found');
        return;
    }

    const hide = message.loading('Loading document...', 0);
    
    // Attempt fallback directories if the file is not found in the primary folder
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
            break; // File found, break loop
        } catch (error) {
            lastError = error;
            // If HTTP 400 error (File Not Found), proceed to the next fallback directory
            if (error.response?.status !== 400) {
                break;
            }
        }
    }

    hide();

    if (blobUrl) {
        // Open within new tab
        const newWindow = window.open(blobUrl, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            message.error('Browser blocked popup. Please allow popups to view the CV.');
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
        message.error('CV file not found on the server. Please contact an administrator.');
    }
};
