import { useState, useRef, useEffect } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import TaskLauncher from '../components/tasks/TaskLauncher';
import TaskModal from '../components/tasks/TaskModal';
import { Menu, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: number | string;
    sender: 'user' | 'ai';
    message: string;
    timestamp: string;
    suggestedTask?: {
        type: string;
        difficulty: string;
        completed?: boolean;
    };
}

const getInitialMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Namaste!";
    if (hour < 12) greeting = "Good morning!";
    else if (hour < 17) greeting = "Good afternoon!";
    else greeting = "Good evening!";

    return {
        id: 'init-1',
        sender: 'ai' as const,
        message: `${greeting} I am Chaitanya. How are you feeling today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
};

const INITIAL_MESSAGES: Message[] = [getInitialMessage()];

const ChatPage = () => {
    const { getToken } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [activeChatId, setActiveChatId] = useState<string | null>(() => localStorage.getItem('lastActiveChatId'));
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('isDarkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    useEffect(() => {
        if (activeChatId) localStorage.setItem('lastActiveChatId', activeChatId);
    }, [activeChatId]);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTask, setActiveTask] = useState<{ type: string; difficulty: string; sourceMessageId?: number | string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Smart Scroll Logic
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            const container = messagesEndRef.current.parentElement?.parentElement;
            if (container) {
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
                if (isNearBottom || messages.length <= 2) {
                    messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
                }
            } else {
                messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
            }
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [messages, isThinking]);

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
        setMessages([]);
        try {
            const token = await getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const formattedMessages = data.messages
                    .filter((m: any) => !m.metadata?.hidden)
                    .map((m: any) => ({
                        id: m._id,
                        sender: m.senderRole,
                        message: m.content,
                        timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        suggestedTask: m.metadata?.suggestedTask
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
        setMessages((prev) => [...prev, newMessage]);
        setIsThinking(true);

        try {
            const token = await getToken();
            let currentChatId = activeChatId;

            if (!currentChatId) {
                const createRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat`, {
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

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${currentChatId}/message`, {
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
                const aiMsg = newMessagesData.find((m: any) => m.senderRole === 'ai');
                if (aiMsg) {
                    const aiResponse: Message = {
                        id: aiMsg._id,
                        sender: 'ai',
                        message: aiMsg.content,
                        timestamp: new Date(aiMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        suggestedTask: aiMsg.metadata?.suggestedTask
                    };
                    setMessages((prev) => [...prev, aiResponse]);
                }
            }
        } catch (err) {
            console.error("Failed to send", err);
        } finally {
            setIsThinking(false);
        }
    };

    const handleTaskComplete = async (taskType: string, result: any) => {
        console.log("Submitting Task:", taskType, result);
        console.log("Active Task Context:", activeTask);

        // Optimistic / Local Update to disable button immediately (Sync)
        if (activeTask?.sourceMessageId) {
            console.log("Marking message as completed:", activeTask.sourceMessageId);
            setMessages(prev => prev.map(msg =>
                msg.id === activeTask.sourceMessageId && msg.suggestedTask
                    ? { ...msg, suggestedTask: { ...msg.suggestedTask, completed: true } }
                    : msg
            ));
        } else {
            console.warn("No sourceMessageId found in activeTask");
        }

        try {
            const token = await getToken();
            const chatId = activeChatId;
            if (!chatId) return;

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${chatId}/task-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    taskType,
                    score: result.score || 1.0,
                    data: result,
                    sourceMessageId: activeTask?.sourceMessageId
                })
            });

            if (res.ok) {
                const newMessagesData = await res.json();
                const formattedNewMessages = newMessagesData
                    .filter((m: any) => !m.metadata?.hidden)
                    .map((m: any) => ({
                        id: m._id,
                        sender: m.senderRole,
                        message: m.content,
                        timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        suggestedTask: m.metadata?.suggestedTask
                    }));

                setMessages((prev) => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = formattedNewMessages.filter((m: any) => !existingIds.has(m.id));
                    return [...prev, ...uniqueNew];
                });
            }
        } catch (err) {
            console.error("Failed to submit task result", err);
        }
    };

    return (
        <div className={`h-screen w-full ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50 light-mode'} flex overflow-hidden font-sans transition-colors duration-300`}>
            <ChatSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                chatId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                isDarkMode={isDarkMode}
            />

            <div className="flex-1 flex flex-col w-full relative h-full">
                {/* Header */}
                <div className={`flex items-center px-4 ${isDarkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-gray-100'} backdrop-blur border-b absolute top-0 left-0 right-0 z-30 justify-between md:static md:bg-transparent md:border-b-0 py-3 shrink-0`}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 -ml-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-text-secondary hover:text-primary'}`}>
                            <Menu className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`hidden md:flex p-2 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-text-secondary hover:text-primary hover:bg-gray-100'} transition-colors rounded-lg`}>
                            <Menu className="h-5 w-5" />
                        </button>
                        <span className={`font-display font-semibold ${isDarkMode ? 'text-white' : 'text-text-primary'} text-2xl md:text-3xl tracking-tight`}>Chaitanya AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-full transition-all ${isDarkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-400 hover:text-primary hover:bg-gray-100'}`}
                        >
                            <div className="relative w-5 h-5 flex items-center justify-center">
                                <motion.div animate={{ rotate: isDarkMode ? 0 : 90, scale: isDarkMode ? 1 : 0 }} transition={{ duration: 0.2 }} className="absolute">
                                    <Menu className="h-5 w-5 opacity-0" /> {/* Hacky placeholder to keep size */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                                </motion.div>
                                <motion.div animate={{ rotate: isDarkMode ? -90 : 0, scale: isDarkMode ? 0 : 1 }} transition={{ duration: 0.2 }} className="absolute">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                                </motion.div>
                            </div>
                        </button>

                        <a href="/" className={`hidden md:flex items-center gap-2 text-xs font-medium ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-text-secondary hover:text-primary hover:bg-gray-100'} px-3 py-1.5 rounded-full transition-all`}>
                            <span>Home</span>
                        </a>
                        <button onClick={toggleFullscreen} className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-text-secondary hover:text-primary hover:bg-gray-100'} rounded-full transition-all`}>
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} scroll-smooth w-full relative`}>
                    <div className="min-h-full flex flex-col items-center p-4 md:p-6 lg:p-8 pt-20 md:pt-4">
                        <div className="w-full max-w-3xl flex flex-col space-y-6 pb-2 relative min-h-[50vh]">
                            {/* Centered Hero Greeting (Initial State) */}
                            {messages.length <= 1 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-20 pointer-events-none">
                                    <motion.div
                                        layoutId="greeting-container"
                                        className={`flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                    >
                                        <div className={`p-4 rounded-2xl mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-white/50'} backdrop-blur-sm shadow-sm`}>
                                            <span className="text-4xl">👋</span>
                                        </div>
                                        <motion.h1
                                            className={`text-4xl md:text-5xl font-display font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 leading-tight`}
                                        >
                                            {(() => {
                                                const hour = new Date().getHours();
                                                if (hour < 12) return "Good morning";
                                                if (hour < 17) return "Good afternoon";
                                                return "Good evening";
                                            })()}
                                        </motion.h1>
                                        <motion.p
                                            className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-light max-w-md mx-auto leading-relaxed`}
                                        >
                                            I am Chaitanya. How are you feeling today?
                                        </motion.p>
                                    </motion.div>
                                </div>
                            )}

                            {/* Standard Chat List (Visible when started) */}
                            {messages.length > 1 && messages.map((msg, idx) => {
                                return (
                                    <motion.div
                                        key={msg.id}
                                        layout
                                        initial={idx === 1 ? { opacity: 0, y: 20 } : { opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="flex flex-col w-full"
                                    >
                                        {/* If it's the very first message (the greeting), we render it as a bubble now */}
                                        <MessageBubble
                                            message={msg.message}
                                            sender={msg.sender}
                                            timestamp={msg.timestamp}
                                            isDarkMode={isDarkMode}
                                        />
                                        {msg.suggestedTask && (
                                            <div className="mt-4 mb-2 mx-auto w-full max-w-sm transform transition-all duration-500 ease-out">
                                                <TaskLauncher
                                                    type={msg.suggestedTask.type}
                                                    difficulty={msg.suggestedTask.difficulty}
                                                    completed={msg.suggestedTask.completed}
                                                    onLaunch={() => setActiveTask({ ...msg.suggestedTask!, sourceMessageId: msg.id })}
                                                    isDarkMode={isDarkMode}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}

                            {/* AI Thinking Indicator */}
                            <AnimatePresence mode="popLayout">
                                {isThinking && (
                                    <motion.div
                                        layout
                                        layoutId="ai-activity-bubble"
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-start mb-4"
                                    >
                                        <div className={`p-4 rounded-2xl rounded-tl-none backdrop-blur-md shadow-sm border
                                            ${isDarkMode
                                                ? 'bg-white/5 border-white/10 text-gray-200'
                                                : 'bg-white/80 border-white/50 text-gray-700'
                                            } flex items-center gap-3`}
                                        >
                                            {/* Animated Sparkle Icon */}
                                            <div className="relative w-5 h-5 flex items-center justify-center">
                                                <motion.div
                                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                    className={`absolute inset-0 opacity-50 blur-sm rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-blue-300'}`}
                                                />
                                                <svg className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>

                                            {/* Animated Text */}
                                            <div className="flex gap-1 items-center h-4">
                                                <span className="text-sm font-medium opacity-90">Thinking</span>
                                                <div className="flex gap-0.5 pt-1.5 pl-0.5">
                                                    <motion.div
                                                        animate={{ y: [0, -3, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                        className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
                                                    />
                                                    <motion.div
                                                        animate={{ y: [0, -3, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                        className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
                                                    />
                                                    <motion.div
                                                        animate={{ y: [0, -3, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                        className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="w-full flex justify-center bg-transparent pointer-events-none z-20 pb-4 md:pb-6 pt-2">
                    <div className="w-full max-w-3xl px-4 pointer-events-auto">
                        <ChatInput onSendMessage={handleSendMessage} isDarkMode={isDarkMode} />
                    </div>
                </div>
            </div>

            {/* Task Modal - Rendered at root but handled by Portal logic in CSS if needed, nicely overlays here */}
            <TaskModal
                isOpen={!!activeTask}
                onClose={() => setActiveTask(null)}
                task={activeTask}
                onComplete={(result) => handleTaskComplete(activeTask!.type, result)}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};

export default ChatPage;
