import { Play, Activity } from 'lucide-react';

interface TaskLauncherProps {
    type: string;
    difficulty: string;
    onLaunch: () => void;
    completed?: boolean;
    isDarkMode?: boolean;
}

const TaskLauncher = ({ type, difficulty, onLaunch, completed, isDarkMode = false }: TaskLauncherProps) => {
    // Helper to get friendly names and icons
    const getTaskDetails = (t: string) => {
        switch (t) {
            case 'CLOCK_DRAWING':
                return { title: 'Clock Challenge', description: 'Draw the time on the clock face.', color: 'bg-blue-500' };
            case 'MEMORY_RECALL':
                return { title: 'Word Spark', description: 'Spot the words you just saw.', color: 'bg-purple-500' };
            case 'ATTENTION':
                return { title: 'Reaction Challenge', description: 'Test your reaction speed.', color: 'bg-orange-500' };
            default:
                return { title: 'Brain Challenge', description: 'Interactive exercise.', color: 'bg-gray-500' };
        }
    };

    const details = getTaskDetails(type);

    return (
        <div className={`
            rounded-2xl border shadow-sm overflow-hidden w-full max-w-sm transition-all duration-300 group
            ${isDarkMode
                ? 'bg-[#121212] border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/40'
                : 'bg-white border-gray-100 hover:shadow-md'
            }
        `}>
            <div className="p-5 flex flex-col items-center text-center">
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
                    ${isDarkMode ? 'bg-white/5 text-white' : `${details.color} bg-opacity-10 text-primary`}
                `}>
                    <Activity className={`w-6 h-6 ${isDarkMode ? 'text-white' : details.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{details.title}</h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{details.description}</p>

                <button
                    onClick={onLaunch}
                    disabled={completed}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all active:scale-95
                        ${completed
                            ? (isDarkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                            : (isDarkMode
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20')
                        }
                    `}
                >
                    {completed ? (
                        <>
                            <span className="font-semibold">Completed</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start Activity</span>
                        </>
                    )}
                </button>
            </div>
            <div className={`
                px-5 py-3 border-t flex justify-between items-center text-xs font-medium
                ${isDarkMode ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}
            `}>
                <span>{difficulty} Difficulty</span>
                <span>~2 Min</span>
            </div>
        </div>
    );
};

export default TaskLauncher;
