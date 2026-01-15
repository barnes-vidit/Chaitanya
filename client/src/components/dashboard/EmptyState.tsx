import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center"
            >
                <Icon className="w-8 h-8 text-indigo-400" />
            </motion.div>
            <h4 className="text-white font-semibold mb-2">{title}</h4>
            <p className="text-gray-400 text-sm max-w-[200px] mb-4">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
