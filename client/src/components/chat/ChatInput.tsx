import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { Send, Mic, Paperclip, StopCircle, Loader2 } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string, type?: 'text' | 'file', fileMetadata?: any) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const handleResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 160); // Max height limit
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setMessage(prev => prev + (prev ? ' ' : '') + finalTranscript);
                    handleResize();
                }
            };

            recognitionRef.current.onend = () => setIsRecording(false);
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            onSendMessage(`Sent a file: ${file.name}`, 'file', { name: file.name, size: file.size, type: file.type });
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full relative group">
            {/* Unified Pill Container */}
            <div className={`
                relative flex items-end gap-2 p-2 rounded-[2rem] bg-white shadow-xl transition-all duration-300
                border-2 ${isFocused ? 'border-primary/20 ring-4 ring-primary/5' : 'border-gray-50 hover:border-gray-100'}
            `}>

                {/* File Attachment */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 mb-0.5 rounded-full text-gray-400 hover:text-primary hover:bg-primary/5 transition-all outline-none focus:bg-gray-100 shrink-0"
                    title="Attach file"
                >
                    <Paperclip className="w-5 h-5 -rotate-45" />
                </button>

                <div className="flex-1 py-3 min-h-[52px] relative flex items-center">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder={isRecording ? "Listening..." : "Type a message..."}
                        className="w-full bg-transparent border-0 outline-none focus:ring-0 focus:border-0 focus:outline-none shadow-none ring-0 p-0 text-gray-700 placeholder:text-gray-400 resize-none max-h-40 leading-relaxed scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-2"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleResize();
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        style={{ height: '24px', boxShadow: 'none' }}
                    />
                </div>

                {/* Voice Input (Inline) */}
                <button
                    onClick={toggleRecording}
                    className={`
                        p-3 mb-0.5 rounded-full transition-all shrink-0 outline-none
                        ${isRecording
                            ? 'bg-red-50 text-red-500 animate-pulse'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }
                    `}
                    title="Voice input"
                >
                    {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className={`
                        p-3 mb-0.5 rounded-full transition-all duration-300 shrink-0 flex items-center justify-center
                        ${message.trim()
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }
                    `}
                    title="Send message"
                >
                    <Send className={`w-5 h-5 ${message.trim() ? 'ml-0.5' : ''}`} />
                </button>
            </div>

            {/* Helper State Text */}
            <div className={`absolute -top-8 left-0 right-0 text-center transition-opacity duration-300 pointer-events-none ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium backdrop-blur-sm border border-red-500/20">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Recording...
                </span>
            </div>

            {/* Subtle Brand/Helper Text */}
            {!isRecording && (
                <p className="text-center text-[10px] items-center justify-center gap-1 font-medium text-gray-300 mt-2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-1000 select-none">
                    <span>Press</span> <kbd className="font-sans px-1 py-0.5 bg-gray-100 rounded text-gray-500 border border-gray-200">Enter</kbd> <span>to send</span>
                </p>
            )}
        </div>
    );
};

export default ChatInput;
