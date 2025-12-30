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
            className={`flex w-full mb-8 ${isAi ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`flex max-w-[90%] md:max-w-[75%] lg:max-w-[65%] gap-4 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`
                    w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105 cursor-default
                    ${isAi ? 'bg-white text-primary ring-1 ring-gray-100' : 'bg-primary text-white'}
                `}>
                    {isAi ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                {/* Bubble Content */}
                <div className="flex flex-col gap-1.5">
                    <div className={`
                        p-5 md:p-6 rounded-[2rem] shadow-sm text-base md:text-lg leading-relaxed font-sans
                        ${isAi
                            ? 'bg-white text-text-primary rounded-tl-none border border-gray-100 shadow-soft'
                            : 'bg-primary text-white rounded-tr-none shadow-md'
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
                        text-xs font-medium px-2 tracking-wide opacity-70
                        ${isAi ? 'text-text-secondary text-left' : 'text-text-secondary text-right'}
                    `}>
                        {timestamp}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
