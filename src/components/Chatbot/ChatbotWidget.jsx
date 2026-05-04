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
                    className="relative w-[52px] h-[52px] bg-primary text-white rounded-full shadow-elevated transition-transform transform hover:scale-105 flex items-center justify-center before:absolute before:-inset-1 before:animate-ping before:bg-primary/30 before:rounded-full before:-z-10"
                >
                    <MessageCircle size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[380px] rounded-2xl shadow-elevated flex flex-col border border-gray-100 overflow-hidden"
                    style={{ height: '520px' }}>

                    {/* Header */}
                    <div className="bg-primary text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
                        <div>
                            <h3 className="font-medium text-base">AI Hỗ trợ tìm việc</h3>
                            <p className="text-[11px] text-blue-100 opacity-90 mt-0.5">Luôn sẵn sàng hỗ trợ bạn</p>
                        </div>
                        <button onClick={toggleChat} className="text-white/80 hover:text-white transition-colors focus:outline-none">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3 custom-scrollbar">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 text-sm ${msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm'
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
                                                    className="block bg-blue-50 border border-blue-100 p-3 rounded-xl hover:bg-blue-100 transition-colors no-underline group">
                                                    <p className="font-semibold text-primary m-0 leading-tight group-hover:underline">{job.title}</p>
                                                    <p className="text-[11px] text-gray-500 mt-1 mb-0">{job.company}</p>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    {msg.time && (
                                        <div className={`text-[10px] mt-1.5 font-medium ${msg.sender === 'user' ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center text-gray-400 h-10 w-16 justify-center">
                                    <MoreHorizontal className="animate-pulse" size={24} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Footer */}
                    <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-2 px-4 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none text-sm transition-all"
                            placeholder="Nhập yêu cầu tìm việc..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-primary text-white rounded-full hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center h-9 w-9 shrink-0 shadow-sm"
                        >
                            <Send size={16} className="-ml-0.5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;
