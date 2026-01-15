import { Plus, MessageSquare, Calendar, Loader2, ArrowLeft, Trash2, Search, Pencil, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface ChatHistoryItem {
    _id: string;
    type: string;
    title?: string;
    lastMessageAt: string;
    messages: any[];
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    isDarkMode: boolean;
}

const ChatSidebar = ({ isOpen, onClose, chatId, onSelectChat, onNewChat, isDarkMode }: ChatSidebarProps) => {
    const { getToken } = useAuth();
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                }
            } catch (err) {
                console.error("Failed to fetch chat history", err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, getToken]);

    // Filter history based on search
    const filteredHistory = history.filter(chat =>
        (chat.title || `Chat ${new Date(chat.lastMessageAt).toLocaleDateString()}`).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRename = async (id: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        try {
            const token = await getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title: newTitle })
            });

            if (res.ok) {
                setHistory(prev => prev.map(chat =>
                    chat._id === id ? { ...chat, title: newTitle } : chat
                ));
            }
        } catch (err) {
            console.error("Failed to rename", err);
        } finally {
            setEditingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this chat?')) return;
        try {
            const token = await getToken();
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };


    // Group by date (Smart Grouping)
    const groupedHistory = filteredHistory.reduce((acc, chat) => {
        const chatDate = new Date(chat.lastMessageAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const checkDate = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

        let category = 'Older';
        if (checkDate.getTime() === today.getTime()) {
            category = 'Today';
        } else if (checkDate.getTime() === yesterday.getTime()) {
            category = 'Yesterday';
        } else if (checkDate > lastWeek) {
            category = 'Previous 7 Days';
        }

        if (!acc[category]) acc[category] = [];
        acc[category].push(chat);
        return acc;
    }, {} as Record<string, ChatHistoryItem[]>);

    // Sort categories order
    const categoryOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];
    const sortedCategories = Object.entries(groupedHistory).sort((a, b) => {
        return categoryOrder.indexOf(a[0]) - categoryOrder.indexOf(b[0]);
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <motion.aside
                initial={false}
                variants={{
                    open: {
                        width: window.innerWidth >= 768 ? 288 : 288,
                        x: 0,
                        transition: { type: "spring", stiffness: 300, damping: 30 }
                    },
                    closed: {
                        width: window.innerWidth >= 768 ? 0 : 288,
                        x: window.innerWidth >= 768 ? 0 : -300,
                        transition: { type: "spring", stiffness: 300, damping: 30 }
                    }
                }}
                animate={isOpen ? "open" : "closed"}
                className={`
                    fixed md:relative z-50 h-full 
                    ${isDarkMode ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-100'} 
                    border-r flex flex-col
                    overflow-hidden
                `}
            >
                {/* Header with Home & New Chat */}
                <div className="p-4 space-y-3">
                    <a href="/" className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-text-secondary hover:text-primary'} transition-colors mb-2 px-2`}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </a>

                    <button
                        onClick={() => {
                            onNewChat();
                            if (window.innerWidth < 768) onClose();
                        }}
                        className={`accessible-button w-full shadow-soft ${isDarkMode ? 'bg-white/10 text-white border-white/10 hover:bg-white/20' : 'bg-white text-primary border border-gray-100 hover:bg-gray-50'} flex items-center justify-start gap-3 px-4`}
                    >
                        <Plus className="h-6 w-6" />
                        <span>New Convo</span>
                    </button>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-9 pr-4 py-2 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-blue-500/50' : 'bg-gray-50 border-gray-100 text-text-primary placeholder:text-text-secondary focus:ring-primary/50'} border rounded-lg text-sm focus:outline-none focus:ring-1`}
                        />
                    </div>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        sortedCategories.map(([date, items]) => (
                            <div key={date} className="mb-6">
                                <h3 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-500' : 'text-text-secondary'} uppercase tracking-wider mb-3 px-2 flex items-center gap-2`}>
                                    <Calendar className="h-3 w-3" />
                                    {date}
                                </h3>
                                <div className="space-y-1">
                                    {items.map((item) => (
                                        <div key={item._id} className="group relative flex items-center pr-2">
                                            {editingId === item._id ? (
                                                <div className="flex-1 flex items-center gap-1 px-2 py-2">
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className={`flex-1 ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-white border-primary/30'} border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary`}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRename(item._id, editTitle);
                                                            if (e.key === 'Escape') setEditingId(null);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleRename(item._id, editTitle)}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        onSelectChat(item._id);
                                                        if (window.innerWidth < 768) onClose();
                                                    }}
                                                    className={`w-full text-left px-3 py-3 rounded-xl transition-colors flex items-center gap-3 pr-16 relative
                                                        ${chatId === item._id
                                                            ? (isDarkMode ? 'bg-blue-600/20 text-blue-200' : 'bg-blue-50 text-blue-700 font-medium')
                                                            : (isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-text-primary hover:bg-gray-50')
                                                        }
                                                    `}
                                                >
                                                    <MessageSquare className={`h-4 w-4 shrink-0 transition-colors ${chatId === item._id ? 'text-blue-500' : (isDarkMode ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-primary')}`} />
                                                    <span className="truncate text-sm font-medium">
                                                        {item.title || `Chat ${new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                                    </span>
                                                </button>
                                            )}

                                            {/* Action Buttons - Visible on Hover */}
                                            {editingId !== item._id && (
                                                <div className={`absolute right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'bg-gradient-to-l from-[#121212] via-[#121212] to-transparent' : 'bg-gradient-to-l from-white via-white to-transparent'} pl-4 z-10`}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingId(item._id);
                                                            setEditTitle(item.title || `Chat ${new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Rename"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item._id);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Chat"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Bottom Profile/Settings Placeholder */}
                <div className={`p-4 border-t ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50/50'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-text-secondary'} text-center`}>
                        All conversations are private.
                    </p>
                </div>
            </motion.aside>
        </>
    );
};

export default ChatSidebar;
