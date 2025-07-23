import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Bot, UserCircle } from 'lucide-react';

const MainChatArea = () => {
    const messages = useSelector((state) => state.chat?.messages || [
        {
            id: 1,
            text: "Hi, what can I help with? V-3",
            isBot: true,
            subtitle: "Let me know how I can assist you today"
        }
    ]);

    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-6 pb-28">
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-2xl flex items-start gap-3 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isBot ? 'bg-blue-600' : 'bg-gray-600'}`}>
                                {msg.isBot ? (
                                    <Bot className="w-5 h-5 text-white" />
                                ) : (
                                    <UserCircle className="w-5 h-5 text-white" />
                                )}
                            </div>

                            {/* Message */}
                            <div className={`${msg.isBot ? 'bg-white border border-gray-200' : 'bg-blue-600 text-white'} rounded-2xl px-6 py-4 ${msg.isBot ? 'rounded-bl-sm' : 'rounded-br-sm'}`}>
                                <p className={`${msg.isBot ? 'text-gray-800' : 'text-white'} font-medium`}>
                                    {msg.text}
                                </p>
                                {msg.subtitle && (
                                    <p className="text-gray-500 text-sm mt-2">{msg.subtitle}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Scroll anchor */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default MainChatArea;
