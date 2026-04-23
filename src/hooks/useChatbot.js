import { useState, useRef, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export const useChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Chào bạn! Mình là trợ lý AI từ JobHunter. Mình có thể giúp gì cho quá trình tìm việc của bạn?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessages = [...messages, { sender: 'user', text: userText, time: timestamp }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axiosClient.post('/chat', {
                message: userText
            });

            const resData = response.data.data ? response.data.data : response.data;
            setMessages([...newMessages, {
                sender: 'bot',
                text: resData.reply,
                jobs: resData.jobs,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error(error);
            setMessages([...newMessages, {
                sender: 'bot',
                text: 'Hệ thống AI đang bận hoặc quá tải, vui lòng thử lại sau.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isOpen, toggleChat,
        messages, input, setInput,
        isLoading, sendMessage, messagesEndRef
    };
};
