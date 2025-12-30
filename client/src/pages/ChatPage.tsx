import { useState, useRef, useEffect } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import { Menu, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

interface Message {
    id: number | string;
    sender: 'user' | 'ai';
    message: string;
    timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: 'init-1',
        sender: 'ai',
        message: 'Namaste! I am Chaitanya. How can I help you?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
];

const ChatPage = () => {
    const { getToken } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        // Only scroll if there are messages and we aren't in the empty state
        if (messages.length > 0 && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        // Prevent scroll on initial load if it's just the greeting or empty
        if (messages.length > 1) {
            scrollToBottom();
        }
    }, [messages]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleSelectChat = async (id: string) => {
        setActiveChatId(id);
        setMessages([]); // Clear first preventing jump
        try {
            const token = await getToken();
            const res = await fetch(`http://localhost:5000/api/chat/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Transform backend messages to frontend format
                const formattedMessages = data.messages.map((m: any) => ({
                    id: m._id,
                    sender: m.senderRole,
                    message: m.content,
                    timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error("Failed to load chat", err);
        }
    };

    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages(INITIAL_MESSAGES);
    };

    const handleSendMessage = async (text: string, type: 'text' | 'file' = 'text', fileMetadata?: any) => {
        const tempId = Date.now();
        const newMessage: Message = {
            id: tempId,
            sender: 'user',
            message: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        // Optimistic update
        setMessages((prev) => [...prev, newMessage]);

        try {
            const token = await getToken();
            let currentChatId = activeChatId;

            // 1. If no active chat, create one first
            if (!currentChatId) {
                const createRes = await fetch('http://localhost:5000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ type: 'direct' })
                });

                if (createRes.ok) {
                    const newChat = await createRes.json();
                    currentChatId = newChat._id;
                    setActiveChatId(currentChatId as string);
                } else {
                    throw new Error("Failed to create chat");
                }
            }

            // 2. Send Message to Backend
            const res = await fetch(`http://localhost:5000/api/chat/${currentChatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: text,
                    type,
                    metadata: fileMetadata
                })
            });

            if (res.ok) {
                const newMessagesData = await res.json();

                // Convert backend response to frontend format
                const aiMsg = newMessagesData.find((m: any) => m.senderRole === 'ai');
                if (aiMsg) {
                    const aiResponse: Message = {
                        id: aiMsg._id,
                        sender: 'ai',
                        message: aiMsg.content,
                        timestamp: new Date(aiMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };
                    setMessages((prev) => [...prev, aiResponse]);
                }
            }

        } catch (err) {
            console.error("Failed to send", err);
            // Optionally remove the optimistic message or show error
        }
    };

    return (
        <div className="flex h-screen h-[100dvh] overflow-hidden bg-background">
            {/* Sidebar */}
            <ChatSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col w-full relative h-full">
                {/* Header (Mobile & Desktop) */}
                <div className="flex items-center p-4 bg-white/80 backdrop-blur border-b border-gray-100 absolute top-0 left-0 right-0 z-30 justify-between md:static md:bg-transparent md:border-b-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-text-secondary hover:text-primary"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Desktop History Toggle (New) */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden md:flex p-2 text-text-secondary hover:text-primary"
                            title={isSidebarOpen ? "Hide History" : "Show History"}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <span className="font-semibold text-text-primary text-lg">Chaitanya AI</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Home Link (Desktop) */}
                        <a href="/" className="hidden md:flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <span>Home</span>
                        </a>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                        >
                            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Messages List - Centered Container */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pt-20 md:pt-4 bg-gray-50/50 flex flex-col items-center">
                    <div className="w-full max-w-5xl flex flex-col space-y-6">
                        {messages.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12 text-gray-400 animate-fade-in">
                                <p className="text-xl font-light">Start a new conversation...</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg.message}
                                sender={msg.sender}
                                timestamp={msg.timestamp}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area - Centered */}
                <div className="w-full flex justify-center bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 pb-6 md:p-6 shadow-soft z-20">
                    <div className="w-full max-w-5xl">
                        <ChatInput onSendMessage={handleSendMessage} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
