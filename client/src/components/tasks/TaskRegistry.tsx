import { ClockDrawingTask } from './ClockDrawingTask';
import { MemoryRecallTask } from './MemoryRecallTask';
import { AttentionTask } from './AttentionTask';

export const TASK_COMPONENTS: Record<string, React.FC<any>> = {
    "CLOCK_DRAWING": ClockDrawingTask,
    "MEMORY_RECALL": MemoryRecallTask,
    "ATTENTION": AttentionTask
};
