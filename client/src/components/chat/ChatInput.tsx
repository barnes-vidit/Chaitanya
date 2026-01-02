import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { Send, Mic, Paperclip, StopCircle, File } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string, type?: 'text' | 'file', fileMetadata?: any) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const handleResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Append final transcript to message
                if (finalTranscript) {
                    setMessage(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
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
            // In a real app, upload here. For now, sending metadata.
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
        <div className="w-full">
            <div className="flex items-end gap-3">
                {/* Attachments */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 text-text-secondary hover:text-primary hover:bg-white/50 rounded-2xl transition-all border border-transparent hover:border-gray-200"
                    aria-label="Upload file"
                >
                    <Paperclip className="h-6 w-6" />
                </button>

                {/* Input Field */}
                <div className="flex-1 bg-white/50 hover:bg-white focus-within:bg-white rounded-[1.5rem] border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex items-end relative shadow-sm">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder="Type here or use voice..."
                        className="w-full bg-transparent border-none focus:ring-0 p-4 max-h-40 resize-none text-lg text-text-primary placeholder:text-gray-400 min-h-[3.5rem]"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleResize();
                        }}
                        onKeyDown={handleKeyDown}
                    />

                    {/* Voice Button */}
                    <button
                        onClick={toggleRecording}
                        className={`
                            p-2 m-2 rounded-xl transition-all duration-300
                            ${isRecording
                                ? 'bg-red-50 text-red-500 animate-pulse ring-1 ring-red-100'
                                : 'text-text-secondary hover:bg-gray-100 hover:text-primary'
                            }
                        `}
                        aria-label="Voice input"
                    >
                        {isRecording ? <StopCircle className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </button>
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    className={`
                        p-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95
                        ${message.trim() ? 'bg-primary text-white shadow-primary/30' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                    disabled={!message.trim()}
                    aria-label="Send message"
                >
                    <Send className="h-6 w-6" />
                </button>
            </div>

            {/* Helper Text */}
            <p className="text-center text-xs font-medium text-text-secondary mt-3 opacity-60">
                {isRecording ? 'Listening... Speak clearly.' : 'Chaitanya is here to listen and help.'}
            </p>
        </div>
    );
};

export default ChatInput;
