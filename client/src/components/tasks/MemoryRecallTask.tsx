import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Play, CheckCircle2, RotateCcw, Brain, Clock, XCircle } from 'lucide-react';

const WORD_BANK = [
    // Indian Context
    "Rickshaw", "Bangle", "Spice", "Mango", "Lotus",
    "Chai", "Saree", "Temple", "Diya", "Yoga",
    "Monsoon", "Bazaar", "Jungle", "Guru", "Namaste",

    // Universal / Simple
    "River", "Mountain", "Cloud", "Garden", "Book",
    "Music", "Dance", "Color", "Happy", "Dream",
    "Star", "Moon", "Phone", "Paper", "Chair",
    "Table", "Spoon", "Plate", "Clock", "Light",
    "Road", "Tree", "Bird", "Fish", "Tiger"
];

interface MemoryRecallTaskProps {
    onComplete?: (result: any) => void;
    difficulty?: string;
}

export const MemoryRecallTask = ({ onComplete, difficulty = "Medium", isDarkMode = false }: MemoryRecallTaskProps & { isDarkMode?: boolean }) => {
    // Game State
    const [phase, setPhase] = useState<'intro' | 'memorize' | 'hold' | 'select' | 'completed'>('intro');
    const [timeLeft, setTimeLeft] = useState(5);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);

    // Data State
    const [targetWords, setTargetWords] = useState<string[]>([]);
    const [gridWords, setGridWords] = useState<string[]>([]);
    const [correctSelections, setCorrectSelections] = useState<string[]>([]);
    const [wrongSelections, setWrongSelections] = useState<string[]>([]);
    const [score, setScore] = useState(0);

    // Initial Setup based on difficulty
    const config = useMemo(() => {
        const isHard = difficulty === 'Hard';
        const isEasy = difficulty === 'Easy';

        return {
            targetCount: isEasy ? 3 : isHard ? 6 : 4,
            gridSize: isEasy ? 6 : isHard ? 12 : 9, // Total words in grid
            memorizeTime: isEasy ? 5 : isHard ? 8 : 6,
            holdTime: 2 // Brief pause before selection to flush short-term buffer slightly
        };
    }, [difficulty]);

    const startGame = () => {
        // 1. Pick Targets
        const shuffledBank = [...WORD_BANK].sort(() => Math.random() - 0.5);
        const targets = shuffledBank.slice(0, config.targetCount);
        setTargetWords(targets);

        // 2. Prepare Distractors & Grid
        const remainders = shuffledBank.slice(config.targetCount);
        const distractors = remainders.slice(0, config.gridSize - config.targetCount);

        // 3. Combine and Shuffle for Grid
        const grid = [...targets, ...distractors].sort(() => Math.random() - 0.5);
        setGridWords(grid);

        // 4. Start
        setTimeLeft(config.memorizeTime);
        setPhase('memorize');
        setCorrectSelections([]);
        setWrongSelections([]);
        setSelectedWords([]);
    };

    // Timer Logic
    useEffect(() => {
        if (phase === 'memorize' || phase === 'hold') {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                if (phase === 'memorize') {
                    setPhase('hold');
                    setTimeLeft(config.holdTime);
                } else if (phase === 'hold') {
                    setPhase('select');
                }
            }
        }
    }, [phase, timeLeft, config.holdTime]);

    const handleWordSelect = (word: string) => {
        if (phase !== 'select') return;
        if (selectedWords.includes(word)) return; // Already picked

        const newSelection = [...selectedWords, word];
        setSelectedWords(newSelection);

        if (targetWords.includes(word)) {
            setCorrectSelections(prev => [...prev, word]);
        } else {
            setWrongSelections(prev => [...prev, word]);
        }

        // Check completion
        // Or if they've clicked too many things (limit guesses to avoid brute force?)
        // Let's simpler: Finish when they've picked 'targetCount' items or maybe allow more?
        // Let's finish when they have selected 'targetCount' items total.

        if (newSelection.length >= config.targetCount) {
            finishGame(newSelection, targetWords);
        }
    };

    const finishGame = (selections: string[], targets: string[]) => {
        // Calculate Score
        // 1 point for each correct word
        // 0 points for distractors
        let correctCount = 0;
        selections.forEach(s => {
            if (targets.includes(s)) correctCount++;
        });

        // Basic score: (Correct / Total Targets) * 100
        const finalScore = Math.round((correctCount / config.targetCount) * 100);
        setScore(finalScore);

        // Wait a small moment to show the last selection ani
        setTimeout(() => {
            setPhase('completed');
            if (onComplete) {
                onComplete({
                    score: finalScore,
                    targets: targets,
                    selections: selections,
                    difficulty: difficulty
                });
            }
        }, 500);
    };

    return (
        <div className={`
            relative overflow-hidden p-6 rounded-3xl border shadow-xl w-full max-w-lg mx-auto transition-all
            ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}
        `}>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                        <Brain size={24} />
                    </div>
                    <div>
                        <h2 className={`text-lg font-bold leading-none ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Word Spark</h2>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{difficulty}</span>
                    </div>
                </div>

                {(phase === 'memorize' || phase === 'hold') && (
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold ${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-50 text-purple-600'}`}>
                        <Clock size={16} /> {timeLeft}s
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="min-h-[300px] flex flex-col items-center justify-center">

                {/* INTRO */}
                {phase === 'intro' && (
                    <div className="text-center max-w-xs animate-fade-in">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-500'}`}>
                            <Sparkles size={40} />
                        </div>
                        <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Ready to Spark?</h3>
                        <p className={`mb-8 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Memorize the <span className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{config.targetCount} words</span> shown.
                            Then spot them in the crowd.
                        </p>
                        <button
                            onClick={startGame}
                            className={`w-full py-4 rounded-xl font-bold shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2
                                ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}
                            `}
                        >
                            <Play size={20} fill="currentColor" /> Start
                        </button>
                    </div>
                )}

                {/* MEMORIZE */}
                {phase === 'memorize' && (
                    <div className="w-full text-center animate-fade-in-up">
                        <p className="text-gray-400 font-bold tracking-widest uppercase mb-8 text-sm">Memorize These</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {targetWords.map((word, i) => (
                                <div key={i} className="animate-pop-in" style={{ animationDelay: `${i * 100}ms` }}>
                                    <span className={`inline-block px-6 py-3 rounded-xl text-xl font-bold shadow-sm border 
                                        ${isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200'}
                                    `}>
                                        {word}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* HOLD */}
                {phase === 'hold' && (
                    <div className="text-center animate-pulse">
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>Hold it...</p>
                    </div>
                )}

                {/* SELECT */}
                {(phase === 'select' || phase === 'completed') && (
                    <div className="w-full animate-fade-in">
                        <p className="text-center text-gray-400 font-bold tracking-widest uppercase mb-6 text-sm">
                            {phase === 'select' ? 'Select the words you saw' : 'Results'}
                        </p>
                        <div className="grid grid-cols-3 gap-3 w-full">
                            {gridWords.map((word, i) => {
                                const isSelected = selectedWords.includes(word);
                                const isCorrect = correctSelections.includes(word);
                                const isWrong = wrongSelections.includes(word);
                                const isMissed = phase === 'completed' && targetWords.includes(word) && !isSelected;

                                let baseClass = "h-14 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center border-2 ";

                                if (phase === 'completed') {
                                    if (isCorrect) baseClass += isDarkMode ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-green-100 border-green-400 text-green-700";
                                    else if (isWrong) baseClass += isDarkMode ? "bg-red-500/20 border-red-500/40 text-red-400 opacity-60" : "bg-red-50 border-red-200 text-red-500 opacity-60";
                                    else if (isMissed) baseClass += isDarkMode ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-500 border-dashed" : "bg-yellow-50 border-yellow-300 text-yellow-600 border-dashed";
                                    else baseClass += isDarkMode ? "bg-white/5 border-white/5 text-gray-600 opacity-40" : "bg-gray-50 border-gray-100 text-gray-300 opacity-40";
                                } else {
                                    if (isSelected) {
                                        if (isCorrect) baseClass += "bg-purple-600 border-purple-600 text-white shadow-md transform scale-105";
                                        else baseClass += isDarkMode ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-200 border-gray-300 text-gray-500";
                                    } else {
                                        baseClass += isDarkMode
                                            ? "bg-white/5 border-white/5 text-gray-400 hover:border-purple-500/30 hover:bg-purple-500/10 cursor-pointer"
                                            : "bg-white border-gray-100 text-gray-600 hover:border-purple-200 hover:bg-purple-50 cursor-pointer hover:shadow-sm";
                                    }
                                }

                                return (
                                    <button
                                        key={i}
                                        disabled={phase === 'completed' || isSelected}
                                        onClick={() => handleWordSelect(word)}
                                        className={baseClass}
                                    >
                                        {word}
                                        {/* Optional Icons for result */}
                                        {phase === 'completed' && isCorrect && <CheckCircle2 size={14} className="ml-1" />}
                                        {phase === 'completed' && isWrong && <XCircle size={14} className="ml-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* COMPLETED OVERLAY */}
                {phase === 'completed' && (
                    <div className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm animate-fade-in ${isDarkMode ? 'bg-black/60' : 'bg-white/90'}`}>
                        <div className={`text-center p-6 rounded-3xl shadow-2xl border max-w-xs w-full ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
                            <div className="mb-2 uppercase tracking-wider text-xs font-bold text-gray-400">Score</div>
                            <div className={`text-6xl font-black mb-6 ${score === 100 ? 'text-green-500' : (isDarkMode ? 'text-purple-400' : 'text-purple-600')}`}>
                                {score}%
                            </div>

                            <p className={`mb-8 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {score === 100 ? "Perfect Memory! 🌟" : score > 60 ? "Great job! 🧠" : "Keep practicing!"}
                            </p>

                            <button
                                onClick={startGame}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                            >
                                <RotateCcw size={18} /> Play Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
