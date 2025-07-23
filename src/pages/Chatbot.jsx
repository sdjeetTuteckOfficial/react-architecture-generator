// import React, { useState } from 'react';
// import { Send, Plus, ChevronDown, Settings, User, Archive, BarChart3, MessageSquare, FileText, Zap, Bot, UserCircle } from 'lucide-react';

// export default function ChatInterface() {
//     const [message, setMessage] = useState('');
//     const [showDropdown, setShowDropdown] = useState(false);
//     const [selectedOption, setSelectedOption] = useState('BRD');

//     const dropdownOptions = [
//         'BRD',
//         'KPI',
//         'Architecture Generator',
//         'SQL diagram Gen.',
//         'SQL query Gen.'
//     ];

//     const [messages, setMessages] = useState([
//         {
//             id: 1,
//             text: "Hi, what can I help with? V-3",
//             isBot: true,
//             subtitle: "Let me know how I can assist you today"
//         }
//     ]);

//     const [threads] = useState([
//         { id: 1, title: "what is prefD?", active: false },
//         { id: 2, title: "please analyse t...", active: false },
//         { id: 3, title: "please analyse t...", active: false },
//         { id: 4, title: "please analyse t...", active: false },
//         { id: 5, title: "TCS consistently...", active: false },
//         { id: 6, title: "please analyse ...", active: true }
//     ]);

//     const handleSendMessage = () => {
//         if (message.trim()) {
//             setMessages([...messages, {
//                 id: messages.length + 1,
//                 text: message,
//                 isBot: false
//             }]);
//             setMessage('');

//             // Simulate bot response
//             setTimeout(() => {
//                 setMessages(prev => [...prev, {
//                     id: prev.length + 1,
//                     text: "I'd be happy to help you with that. Could you provide more details about what you're looking for?",
//                     isBot: true
//                 }]);
//             }, 1000);
//         }
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             handleSendMessage();
//         }
//     };

//     return (
//         <div className="flex flex-col h-screen bg-gray-50">
//             {/* App Bar */}
//             <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
//                 <h1 className="text-xl font-bold text-blue-600">ChatBot</h1>

//                 <div className="relative">
//                     <button
//                         onClick={() => setShowDropdown(!showDropdown)}
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
//                     >
//                         <span>{selectedOption}</span>
//                         <ChevronDown className="w-4 h-4 ml-2" />
//                     </button>

//                     {showDropdown && (
//                         <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//                             {dropdownOptions.map((option, index) => (
//                                 <button
//                                     key={index}
//                                     onClick={() => {
//                                         setSelectedOption(option);
//                                         setShowDropdown(false);
//                                     }}
//                                     className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
//                                 >
//                                     {option}
//                                 </button>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <div className="flex flex-1">
//                 {/* Sidebar */}
//                 <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
//                     {/* Header */}
//                     <div className="p-4 border-b border-gray-200">
//                         <button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors">
//                             <Plus className="w-4 h-4" />
//                             <span className="text-sm font-medium">NEW CHAT</span>
//                         </button>
//                     </div>

//                     {/* Recent Threads */}
//                     <div className="flex-1 overflow-y-auto">
//                         <div className="p-3">
//                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Threads</h3>
//                             <div className="space-y-1">
//                                 {threads.map((thread) => (
//                                     <div
//                                         key={thread.id}
//                                         className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${thread.active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
//                                             }`}
//                                     >
//                                         <MessageSquare className="w-4 h-4 flex-shrink-0" />
//                                         <span className="text-sm truncate">{thread.title}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Workspace Section */}
//                         {/* <div className="p-3 border-t border-gray-100">
//                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
//                                 <ChevronDown className="w-3 h-3 mr-1" />
//                                 My Workspace
//                             </h3>
//                             <div className="space-y-1">
//                                 <div className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
//                                     <BarChart3 className="w-4 h-4" />
//                                     <span className="text-sm">Dashboard</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
//                                     <User className="w-4 h-4" />
//                                     <span className="text-sm">User Management</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
//                                     <Archive className="w-4 h-4" />
//                                     <span className="text-sm">Archive</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
//                                     <MessageSquare className="w-4 h-4" />
//                                     <span className="text-sm">Prompt Chain</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
//                                     <FileText className="w-4 h-4" />
//                                     <span className="text-sm">Pre-Prompt</span>
//                                 </div>
//                             </div>
//                         </div> */}
//                     </div>

//                     {/* User Section */}
//                     <div className="p-3 border-t border-gray-100">
//                         <div className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
//                             <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
//                                 <span className="text-xs text-white font-semibold">S</span>
//                             </div>
//                             <div className="flex-1">
//                                 <div className="text-sm font-medium">SET</div>
//                                 <div className="text-xs text-gray-500">Beta</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Main Chat Area */}
//                 <div className="flex-1 flex flex-col">
//                     {/* Chat Messages */}
//                     <div className="flex-1 overflow-y-auto p-6">
//                         <div className="max-w-3xl mx-auto space-y-6">
//                             {messages.map((msg) => (
//                                 <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
//                                     <div className={`max-w-2xl flex items-start gap-3 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
//                                         {/* Avatar */}
//                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isBot ? 'bg-blue-600' : 'bg-gray-600'
//                                             }`}>
//                                             {msg.isBot ? (
//                                                 <Bot className="w-5 h-5 text-white" />
//                                             ) : (
//                                                 <UserCircle className="w-5 h-5 text-white" />
//                                             )}
//                                         </div>

//                                         {/* Message */}
//                                         <div className={`${msg.isBot ? 'bg-white border border-gray-200' : 'bg-blue-600 text-white'} rounded-2xl px-6 py-4 ${msg.isBot ? 'rounded-bl-sm' : 'rounded-br-sm'}`}>
//                                             <p className={`${msg.isBot ? 'text-gray-800' : 'text-white'} font-medium`}>
//                                                 {msg.text}
//                                             </p>
//                                             {msg.subtitle && (
//                                                 <p className="text-gray-500 text-sm mt-2">{msg.subtitle}</p>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Input Area */}
//                     <div className="border-t border-gray-200 bg-white p-4">
//                         <div className="max-w-3xl mx-auto">
//                             <div className="flex items-center gap-2 mb-3">
//                                 {/* <div className="flex items-center gap-2 text-sm">
//                                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                                     <span className="text-gray-600">AI-added Prompt</span>
//                                     <span className="text-blue-600">AI is Active</span>
//                                     <Zap className="w-4 h-4 text-orange-500" />
//                                 </div> */}
//                             </div>

//                             <div className="relative">
//                                 <textarea
//                                     value={message}
//                                     onChange={(e) => setMessage(e.target.value)}
//                                     onKeyPress={handleKeyPress}
//                                     placeholder="Ask AI anything..."
//                                     className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     rows="2"
//                                 />
//                                 <button
//                                     onClick={handleSendMessage}
//                                     className="absolute right-3 top-3 p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                     disabled={!message.trim()}
//                                 >
//                                     <Send className="w-5 h-5" />
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


// pages/Chatbot.jsx
import React from 'react';
import AppBar from '../components/AppBar';
import ChatUi_SideBar from '../components/ChatUi_SideBar';
import MainChatArea from '../components/MainChatArea';
import InputArea from '../components/InputArea';

const Chatbot = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* App Bar */}
            <AppBar />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <ChatUi_SideBar />

                {/* Main Chat Area + Input */}
                <div className="flex-1 flex flex-col">
                    {/* Scrollable Chat Area */}
                    <div className="flex-1 overflow-y-auto">
                        <MainChatArea />
                    </div>

                    {/* Fixed Input Area */}
                    <div className="border-t border-gray-200 bg-white">
                        <InputArea />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
