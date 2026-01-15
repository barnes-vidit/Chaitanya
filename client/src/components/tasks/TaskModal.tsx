import { X, Activity, HelpCircle } from 'lucide-react';
import { TaskRenderer } from './TaskRenderer';
import TaskTutorial from './TaskTutorial';
import { useEffect, useState } from 'react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: { type: string; difficulty: string } | null;
    onComplete: (result: any) => void;
    isDarkMode?: boolean;
}

const TaskModal = ({ isOpen, onClose, task, onComplete, isDarkMode = false }: TaskModalProps) => {
    const [showTutorial, setShowTutorial] = useState(false);

    // Reset/Check state when task opens
    useEffect(() => {
        if (isOpen && task) {
            const hasSeen = localStorage.getItem(`tutorial_seen_${task.type}`);
            setShowTutorial(!hasSeen);
        }
    }, [isOpen, task]);

    // Prevent background scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleTutorialComplete = () => {
        if (task) {
            localStorage.setItem(`tutorial_seen_${task.type}`, 'true');
        }
        setShowTutorial(false);
    };

    if (!isOpen || !task) return null;

    const getFriendlyName = (type: string) => {
        if (!type) return "Task";
        const map: Record<string, string> = {
            'CLOCK_DRAWING': 'Clock Challenge',
            'MEMORY_RECALL': 'Word Spark',
            'ATTENTION': 'Reaction Challenge'
        };
        return map[type] || type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    const friendlyName = getFriendlyName(task.type);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up ${isDarkMode ? 'bg-[#121212] ring-1 ring-white/10' : 'bg-white'}`}>

                {/* Header - Always Visible */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-gray-50/50 border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{friendlyName}</h2>
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                                {showTutorial ? 'Tutorial' : `${task.difficulty} Mode`}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!showTutorial && (
                            <button
                                onClick={() => setShowTutorial(true)}
                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-primary hover:bg-blue-50'}`}
                                title="Show Tutorial"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={`flex-1 overflow-hidden relative flex flex-col justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                    {showTutorial ? (
                        <TaskTutorial
                            type={task.type}
                            onComplete={handleTutorialComplete}
                            isDarkMode={isDarkMode}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-6 animate-fade-in">
                            <TaskRenderer
                                type={task.type}
                                difficulty={task.difficulty}
                                onComplete={(result) => {
                                    onComplete(result);
                                    onClose();
                                }}
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
