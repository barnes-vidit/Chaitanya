import { motion } from 'framer-motion';
import { User, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';

interface Attachment {
    type: 'image' | 'file';
    url: string;
    name: string;
}

interface MessageBubbleProps {
    message: string;
    sender: 'user' | 'ai';
    timestamp: string;
    attachments?: Attachment[];
}

const MessageBubble = ({ message, sender, timestamp, attachments }: MessageBubbleProps) => {
    const isAi = sender === 'ai';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 ${isAi ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`flex gap-3 ${isAi ? 'flex-row max-w-full' : 'flex-row-reverse max-w-[85%] md:max-w-[75%]'}`}>
                {/* Avatar */}
                <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105 cursor-default mt-1
                    ${isAi ? 'bg-white text-primary ring-1 ring-gray-100' : 'bg-primary text-white'}
                `}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble Content */}
                <div className={`flex flex-col gap-1 min-w-0 ${isAi ? 'items-start' : 'items-end'}`}>
                    <div className={`
                        rounded-2xl text-base leading-relaxed font-sans text-left break-words
                        ${isAi
                            ? 'bg-transparent text-text-primary px-0 py-1' // AI: No bg, minimal padding
                            : 'bg-primary text-white py-2 px-3 rounded-br-sm shadow-md shadow-primary/20' // User: tighter padding
                        }
                    `}>
                        {message}

                        {/* Attachments */}
                        {attachments && attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className={`
                                        flex items-center gap-3 p-3 rounded-xl 
                                        ${isAi ? 'bg-gray-50' : 'bg-white/20'}
                                    `}>
                                        {file.type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                        <span className="text-sm truncate opacity-90">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <span className={`
                        text-[10px] font-medium tracking-wide opacity-50
                        ${isAi ? 'pl-0' : 'pr-1'}
                    `}>
                        {timestamp}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
