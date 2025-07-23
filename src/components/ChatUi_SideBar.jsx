// components/Sidebar.jsx
import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';

const ChatUi_SideBar = () => {
    const threads = [
        { id: 1, title: "what is prefD?", active: false },
        { id: 2, title: "please analyse t...", active: false },
        { id: 3, title: "please analyse t...", active: false },
        { id: 4, title: "please analyse t...", active: false },
        { id: 5, title: "TCS consistently...", active: false },
        { id: 6, title: "please analyse ...", active: true }
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">NEW CHAT</span>
                </button>
            </div>

            {/* Recent Threads */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Threads</h3>
                    <div className="space-y-1">
                        {threads.map((thread) => (
                            <div
                                key={thread.id}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${thread.active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm truncate">{thread.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Section */}
            <div className="p-3 border-t border-gray-100">
                <div className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">S</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium">SET</div>
                        <div className="text-xs text-gray-500">Beta</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatUi_SideBar;