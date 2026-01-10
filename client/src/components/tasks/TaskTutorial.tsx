import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';

interface TutorialProps {
    type: string;
    onComplete: () => void;
}

const TUTORIAL_CONTENT: Record<string, { title: string; steps: { text: string; subtext?: string }[] }> = {
    CLOCK_DRAWING: {
        title: "Clock Challenge Tutorial",
        steps: [
            { text: "Welcome to the Clock Challenge", subtext: "This exercise checks your ability to set the correct time." },
            { text: "Read the Time", subtext: "A specific time (e.g., 10 past 11) will be displayed at the top." },
            { text: "Set the Hands", subtext: "Drag the hour and minute hands on the clock face to match the requested time." },
            { text: "Submit", subtext: "When you are confident, press the Submit button." }
        ]
    },
    MEMORY_RECALL: {
        title: "Memory Exercise Tutorial",
        steps: [
            { text: "Memory Challenge", subtext: "Let's test your short-term recall." },
            { text: "Memorize", subtext: "You will see a list of words for a few seconds. Focus and try to remember them." },
            { text: "Recall", subtext: "Once they disappear, type as many as you can remember into the box." }
        ]
    }
};

const TaskTutorial = ({ type, onComplete }: TutorialProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const content = TUTORIAL_CONTENT[type] || { title: "Activity", steps: [{ text: "Follow on-screen instructions." }] };
    const totalSteps = content.steps.length;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 h-full min-h-[400px] animate-fade-in text-center">
            {/* Progress Dots */}
            <div className="flex gap-2 mb-8">
                {content.steps.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-primary' : 'w-2 bg-gray-200'
                            }`}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 animate-fade-in-up" key={`title-${currentStep}`}>
                    {content.steps[currentStep].text}
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-8 animate-fade-in-up" key={`desc-${currentStep}`}>
                    {content.steps[currentStep].subtext}
                </p>
            </div>

            {/* Navigation */}
            <button
                onClick={handleNext}
                className="w-full max-w-xs bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
            >
                {currentStep === totalSteps - 1 ? (
                    <>
                        <span>Start Activity</span>
                        <Check className="w-5 h-5" />
                    </>
                ) : (
                    <>
                        <span>Next Step</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </div>
    );
};

export default TaskTutorial;
