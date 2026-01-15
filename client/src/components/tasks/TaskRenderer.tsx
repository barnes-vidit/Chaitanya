import React from 'react';
import { TASK_COMPONENTS } from './TaskRegistry';

interface TaskRendererProps {
    type: string;
    difficulty?: string;
    onComplete?: (result: any) => void;
    isDarkMode?: boolean;
}

export const TaskRenderer: React.FC<TaskRendererProps> = ({ type, difficulty, onComplete, isDarkMode = false }) => {
    const Component = TASK_COMPONENTS[type];

    if (!Component || type === 'null') {
        if (type === 'null') return null;
        return (
            <div className={`p-3 text-sm rounded border ${isDarkMode ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                Unknown task type: {type}
            </div>
        );
    }

    return (
        <div className="my-2 animate-fade-in-up w-full h-full">
            <Component difficulty={difficulty} onComplete={onComplete} isDarkMode={isDarkMode} />
        </div>
    );
};
