import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types.ts';

interface ChatViewProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatBotIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.486 2 2 5.589 2 10c0 2.908 1.897 5.515 4.582 6.843.082.042.164.086.248.13.11.059.221.119.333.178.11.058.222.115.334.172.113.058.225.117.34.174.113.058.228.114.343.169.115.056.23.11.346.163.116.053.233.104.35.154.118.05.236.098.354.145.118.047.237.092.356.136.118.044.237.086.356.127.12.04.24.078.36.115.12.037.24.072.362.106.12.034.242.066.363.097.12.03.242.058.364.084.122.027.245.05.368.072.122.022.245.04.368.057.123.017.247.03.37.042.124.012.248.02.372.026.124.006.248.009.372.009s.248-.003.372-.009c.124-.006.248-.014.372-.026.123-.012.247-.025.37-.042.123-.017.246-.035.368-.057.123-.022.246-.045.368-.072.122-.026.244-.054.364-.084.12-.031.242-.063.363-.097.122-.034.242-.069.362-.106.12-.037.24-.075.36-.115.119-.041.238-.083.356-.127.119-.044.238-.09.356-.136.118-.047.236-.095.354-.145.117-.05.232-.101.35-.154.116-.053.231-.107.346-.163.115-.055.229-.111.343-.169.115-.057.227-.116.34-.174.112-.057.222-.113.334-.172.112-.059.223-.119.333-.178.084-.044.166-.088.248-.13A7.954 7.954 0 0 0 22 10c0-4.411-4.486-8-10-8Zm0 14c-1.487 0-2.834-.65-3.772-1.69.172-.008.344-.021.513-.04.476-.054.942-.144 1.39-.271.444-.126.866-.288 1.261-.482.392-.193.753-.415 1.077-.662.324-.247.599-.52.818-.812.219-.292.375-.603.462-.928.087-.325.105-.66.053-1.002-.052-.342-.174-.668-.363-.972-.189-.304-.44-.578-.75-.812s-.672-.423-1.077-.561c-.405-.138-.846-.22-1.316-.243-.156-.008-.312-.012-.468-.012s-.312.004-.468.012c-.47.023-.911.105-1.316.243-.405.138-.765.327-1.077.561s-.561.508-.75.812c-.189.304-.311.63-.363.972-.052.342-.034.677.053 1.002.087.325.243.636.462.928.219.292.494.565.818.812.324.247.685.469 1.077.662.395.194.817.356 1.261.482.448.127.914.217 1.39.271.169.019.341.032.513.04C14.834 15.35 13.487 16 12 16Z" />
    </svg>
);

export const ChatView: React.FC<ChatViewProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if(isOpen) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [isOpen]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSendMessage(input);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 md:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="chat-heading">
            <div 
                className="bg-base-200 w-full max-w-lg h-[80vh] max-h-[700px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="bg-base-300 p-4 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <ChatBotIcon className="w-8 h-8 text-brand-accent"/>
                        <h2 id="chat-heading" className="text-xl font-bold text-text-primary">CineSuggest Chat</h2>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors" aria-label="Close chat">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role !== 'user' && <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0" aria-hidden="true"><ChatBotIcon className="w-5 h-5 text-base-100"/></div>}
                            <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                                msg.role === 'user' ? 'bg-brand-accent text-white rounded-br-none' : 
                                msg.role === 'error' ? 'bg-red-500/20 text-red-300 rounded-bl-none' : 
                                'bg-base-300 text-text-primary rounded-bl-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0" aria-hidden="true"><ChatBotIcon className="w-5 h-5 text-base-100"/></div>
                            <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-base-300 text-text-primary rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-base-300 flex-shrink-0">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about movies..."
                            className="w-full bg-base-300 text-text-primary px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            aria-label="Chat message input"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-accent text-white rounded-full p-3 hover:scale-105 transform transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send message">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </form>
                </footer>
            </div>
            <style>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                 .scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: #2a2a2a #1a1a1a;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #1a1a1a;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background-color: #2a2a2a;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};