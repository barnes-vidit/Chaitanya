import React from 'react';
import { TASK_COMPONENTS } from './TaskRegistry';

interface TaskRendererProps {
    type: string;
    difficulty?: string;
    onComplete?: (result: any) => void;
}

export const TaskRenderer: React.FC<TaskRendererProps> = ({ type, difficulty, onComplete }) => {
    const Component = TASK_COMPONENTS[type];

    if (!Component || type === 'null') {
        if (type === 'null') return null;
        return (
            <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded border border-yellow-200">
                Unknown task type: {type}
            </div>
        );
    }

    return (
        <div className="my-2 animate-fade-in-up">
            <Component difficulty={difficulty} onComplete={onComplete} />
        </div>
    );
};
