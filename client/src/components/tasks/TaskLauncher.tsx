import { Play, Activity } from 'lucide-react';

interface TaskLauncherProps {
    type: string;
    difficulty: string;
    onLaunch: () => void;
    completed?: boolean;
}

const TaskLauncher = ({ type, difficulty, onLaunch, completed }: TaskLauncherProps) => {
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-5 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl ${details.color} bg-opacity-10 flex items-center justify-center mb-3 text-primary`}>
                    <Activity className={`w-6 h-6 ${details.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{details.title}</h3>
                <p className="text-sm text-gray-500 mb-6">{details.description}</p>

                <button
                    onClick={onLaunch}
                    disabled={completed}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors active:scale-95
                        ${completed
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
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
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>{difficulty} Difficulty</span>
                <span>~2 Min</span>
            </div>
        </div>
    );
};

export default TaskLauncher;
