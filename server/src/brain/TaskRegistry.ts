export interface BaseTask {
    getUiSchema(): Record<string, any>;
    evaluate(metrics: any): any;
}

class ClockDrawingTask implements BaseTask {
    getUiSchema() {
        return {
            type: "CANVAS",
            instruction: "Please draw a clock face setting the time to 10 past 11.",
            required_inputs: ["strokes", "timestamp"]
        };
    }

    evaluate(metrics: any) {
        // Placeholder for complex evaluation logic
        return { score: 0.8, details: "Good circle shape." };
    }
}

class MemoryRecallTask implements BaseTask {
    getUiSchema() {
        return {
            type: "AUDIO_RECORDING",
            instruction: "Recall the story I told you earlier.",
            required_inputs: ["audio_blob"]
        };
    }

    evaluate(metrics: any) {
        return { score: 0.7, details: "Mentioned 2 of 3 key elements." };
    }
}

class AttentionTask implements BaseTask {
    getUiSchema() {
        return {
            type: "INTERACTIVE_TAP",
            instruction: "Tap the screen whenever you see a red circle.",
            required_inputs: ["reaction_times"]
        };
    }

    evaluate(metrics: any) {
        return { score: 0.9, details: "Fast reaction time." };
    }
}

export const TASK_REGISTRY: Record<string, BaseTask> = {
    "CLOCK_DRAWING": new ClockDrawingTask(),
    "MEMORY_RECALL": new MemoryRecallTask(),
    "ATTENTION": new AttentionTask()
};
