import React from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { MessageCircle, X, Send, MoreHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatbotWidget = () => {
    const {
        isOpen, toggleChat,
        messages, input, setInput,
        isLoading, sendMessage, messagesEndRef
    } = useChatbot();

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Bubble Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
                    style={{ height: '500px' }}>

                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Smart Job AI</h3>
                            <p className="text-xs text-blue-200">Luôn sẵn sàng hỗ trợ bạn</p>
                        </div>
                        <button onClick={toggleChat} className="text-white hover:text-gray-200 focus:outline-none">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 text-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm'
                                    }`}>
                                    <div className="prose prose-sm prose-blue max-w-none">
                                        {msg.sender === 'user' ? (
                                            msg.text
                                        ) : (
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        )}
                                    </div>

                                    {/* Render UI Cards when jobs exist */}
                                    {msg.jobs && msg.jobs.length > 0 && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            {msg.jobs.map(job => (
                                                <a href={job.url} key={job.id} target="_blank" rel="noreferrer"
                                                    className="block bg-blue-50 border border-blue-100 p-3 rounded-lg hover:bg-blue-100 transition-colors no-underline">
                                                    <p className="font-semibold text-blue-700 m-0 leading-tight">{job.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1 mb-0">{job.company}</p>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    {msg.time && (
                                        <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center text-gray-400 h-10 w-16 justify-center">
                                    <MoreHorizontal className="animate-pulse" size={24} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Footer */}
                    <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-100 border-none rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                            placeholder="Nhập yêu cầu tìm việc..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center h-10 w-10 shrink-0"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;
