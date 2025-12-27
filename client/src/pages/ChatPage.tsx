import React from 'react';
import { Mic, Send, Paperclip } from 'lucide-react';

const ChatPage = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                <div className="max-w-3xl mx-auto">
                    {/* Welcome Message */}
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">C</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                            <p className="text-gray-800">Namaste! I'm Chaitanya. I'm here to have a light-hearted talk with you today. Shall we begin with some simple memory games?</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100 p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="relative flex items-center">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                            <Paperclip className="h-5 w-5" />
                        </button>
                        <input
                            type="text"
                            placeholder="Type your message or speak..."
                            className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all ml-2"
                        />
                        <div className="flex items-center space-x-2 ml-2">
                            <button className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors">
                                <Mic className="h-5 w-5" />
                            </button>
                            <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Supports Hindi, Marathi, and English. Natural conversation powerd by AI.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
