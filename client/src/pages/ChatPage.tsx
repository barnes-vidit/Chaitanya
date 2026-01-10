import { useState, useRef, useEffect } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import TaskLauncher from '../components/tasks/TaskLauncher';
import TaskModal from '../components/tasks/TaskModal';
import { Menu, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
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
        setMessages([]);
        try {
            const token = await getToken();
            const res = await fetch(`http://localhost:5000/api/chat/${id}`, {
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

        try {
            const token = await getToken();
            let currentChatId = activeChatId;

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

            const res = await fetch(`http://localhost:5000/api/chat/${chatId}/task-result`, {
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
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans">
            <ChatSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                chatId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
            />

            <div className="flex-1 flex flex-col w-full relative h-full">
                {/* Header */}
                <div className="flex items-center px-4 bg-white/80 backdrop-blur border-b border-gray-100 absolute top-0 left-0 right-0 z-30 justify-between md:static md:bg-transparent md:border-b-0 py-2 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-text-secondary hover:text-primary">
                            <Menu className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-2 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-gray-100">
                            <Menu className="h-5 w-5" />
                        </button>
                        <span className="font-display font-semibold text-text-primary text-lg tracking-tight">Chaitanya AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href="/" className="hidden md:flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-primary px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all">
                            <span>Home</span>
                        </a>
                        <button onClick={toggleFullscreen} className="p-2 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-all">
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth w-full relative">
                    <div className="min-h-full flex flex-col items-center p-4 md:p-6 lg:p-8 pt-20 md:pt-4">
                        <div className="w-full max-w-3xl flex flex-col space-y-6 pb-2">
                            {messages.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12 text-gray-400 animate-fade-in">
                                    <h1 className="text-3xl font-display font-medium text-gray-700 mb-2">
                                        {(() => {
                                            const hour = new Date().getHours();
                                            if (hour < 12) return "Good morning";
                                            if (hour < 17) return "Good afternoon";
                                            return "Good evening";
                                        })()}
                                    </h1>
                                    <p className="text-lg font-light text-gray-500">
                                        Ready to continue your journey?
                                    </p>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex flex-col w-full animate-fade-in-up">
                                    <MessageBubble
                                        message={msg.message}
                                        sender={msg.sender}
                                        timestamp={msg.timestamp}
                                    />
                                    {msg.suggestedTask && (
                                        <div className="mt-4 mb-2 mx-auto w-full max-w-sm transform transition-all duration-500 ease-out">
                                            <div className="animate-fade-in-up">
                                                <TaskLauncher
                                                    type={msg.suggestedTask.type}
                                                    difficulty={msg.suggestedTask.difficulty}
                                                    completed={msg.suggestedTask.completed}
                                                    onLaunch={() => setActiveTask({ ...msg.suggestedTask!, sourceMessageId: msg.id })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="w-full flex justify-center bg-transparent pointer-events-none z-20 pb-0 pt-2">
                    <div className="w-full max-w-3xl px-4 pointer-events-auto">
                        <ChatInput onSendMessage={handleSendMessage} />
                    </div>
                </div>
            </div>

            {/* Task Modal - Rendered at root but handled by Portal logic in CSS if needed, nicely overlays here */}
            <TaskModal
                isOpen={!!activeTask}
                onClose={() => setActiveTask(null)}
                task={activeTask}
                onComplete={(result) => handleTaskComplete(activeTask!.type, result)}
            />
        </div>
    );
};

export default ChatPage;
