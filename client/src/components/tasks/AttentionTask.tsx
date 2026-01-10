import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, AlertCircle, CheckCircle2, XCircle, Flame, Volume2, VolumeX } from 'lucide-react';

export const AttentionTask = ({ onComplete }: { onComplete?: (result: any) => void }) => {
    const [gameState, setGameState] = useState<'idle' | 'countdown' | 'running' | 'completed'>('idle');
    const [color, setColor] = useState('gray');
    const [targetColor, setTargetColor] = useState('bg-red-500');
    const [score, setScore] = useState({ hits: 0, misses: 0 });
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [countdown, setCountdown] = useState(3);
    const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Refs for intervals
    const gameInterval = useRef<any>(null);
    const colorInterval = useRef<any>(null);
    const timeoutRef = useRef<any>(null);

    // Audio Context Ref
    const audioCtxRef = useRef<AudioContext | null>(null);

    const COLORS = [
        { id: 'bg-red-500', name: 'RED', text: 'text-red-500' },
        { id: 'bg-blue-500', name: 'BLUE', text: 'text-blue-500' },
        { id: 'bg-green-500', name: 'GREEN', text: 'text-green-500' },
        { id: 'bg-yellow-500', name: 'YELLOW', text: 'text-yellow-600' },
        { id: 'bg-purple-500', name: 'PURPLE', text: 'text-purple-500' }
    ];

    // Initialize Audio Context on user interaction
    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const playSound = useCallback((type: 'hit' | 'miss') => {
        if (!soundEnabled || !audioCtxRef.current) return;

        try {
            const oscillator = audioCtxRef.current.createOscillator();
            const gainNode = audioCtxRef.current.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtxRef.current.destination);

            if (type === 'hit') {
                // Happy high pitch "ding"
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtxRef.current.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.15);
                oscillator.start();
                oscillator.stop(audioCtxRef.current.currentTime + 0.15);
            } else {
                // Sad low pitch "buzz"
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, audioCtxRef.current.currentTime);
                oscillator.frequency.linearRampToValueAtTime(100, audioCtxRef.current.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioCtxRef.current.currentTime + 0.2);
            }
        } catch (e) {
            console.error("Audio play error", e);
        }
    }, [soundEnabled]);

    // Countdown Logic
    useEffect(() => {
        if (gameState === 'countdown') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setGameState('running');
                startGameLoop();
            }
        }
    }, [gameState, countdown]);

    const handleStart = () => {
        initAudio(); // Ensure audio context is ready

        // Pick a random target color
        const randomTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
        setTargetColor(randomTarget.id);

        setScore({ hits: 0, misses: 0 });
        setStreak(0);
        setMaxStreak(0);
        setTimeLeft(15);
        setCountdown(3);
        setGameState('countdown');
    };

    const startGameLoop = () => {
        setTimeLeft(15);
        setColor('gray');

        // Game Timer
        gameInterval.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Color Change Loop
        changeColorLoop();
    };

    const changeColorLoop = () => {
        if (colorInterval.current) clearTimeout(colorInterval.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Adaptive Difficulty: Speed up based on streak
        // Base: 400-1200ms. 
        // With streak 5: 300-900ms.
        // With streak 10: 200-600ms.
        const streakFactor = Math.min(streak, 15) * 40; // Max speedup at streak 15
        const minDelay = Math.max(250, 400 - streakFactor);
        const maxDelay = Math.max(500, 1200 - streakFactor * 1.5);

        const delay = Math.random() * (maxDelay - minDelay) + minDelay;

        colorInterval.current = setTimeout(() => {
            // Ensure we don't pick the same color twice in a row for variety
            const availableColors = COLORS.map(c => c.id);
            const randomColorId = availableColors[Math.floor(Math.random() * availableColors.length)];
            setColor(randomColorId);
            changeColorLoop();
        }, delay);
    };

    const endGame = () => {
        setGameState('completed');
        if (gameInterval.current) clearInterval(gameInterval.current);
        if (colorInterval.current) clearTimeout(colorInterval.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setColor('gray');

        if (onComplete) {
            const precision = score.hits / (score.hits + score.misses || 1);
            onComplete({ ...score, streak: Math.max(streak, maxStreak), score: precision, target: targetColor });
        }
    };

    const handleTap = () => {
        if (gameState !== 'running') return;

        if (color === targetColor) {
            const newHits = score.hits + 1;
            const newStreak = streak + 1;
            setScore(s => ({ ...s, hits: newHits }));
            setStreak(newStreak);
            if (newStreak > maxStreak) setMaxStreak(newStreak);

            showFeedback('hit');
            playSound('hit');
        } else {
            setScore(s => ({ ...s, misses: s.misses + 1 }));
            setStreak(0); // Reset streak on miss
            showFeedback('miss');
            playSound('miss');
        }
    };

    const showFeedback = (type: 'hit' | 'miss') => {
        setFeedback(type);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setFeedback(null), 150);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (gameInterval.current) clearInterval(gameInterval.current);
            if (colorInterval.current) clearTimeout(colorInterval.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    // Helper to get display properties of target color
    const targetDetails = COLORS.find(c => c.id === targetColor) || COLORS[0];

    return (
        <div className="relative overflow-hidden p-8 bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-xl mx-auto select-none transition-all duration-300 hover:shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                    <div className="p-2.5 bg-orange-100/50 text-orange-600 rounded-xl">
                        <AlertCircle size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xs text-gray-400 tracking-wider uppercase leading-none mb-1">Reaction</span>
                        <div className="h-7 flex items-center">
                            {streak > 1 && gameState === 'running' ? (
                                <span className="font-black text-orange-500 animate-pulse flex items-center gap-2 text-lg leading-none">
                                    <Flame size={18} fill="currentColor" /> {streak} Streak
                                </span>
                            ) : (
                                <span className="font-bold text-lg tracking-wide uppercase leading-none">Challenge</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 min-h-[44px]">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <div className={`transition-opacity duration-300 ${gameState === 'running' ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="font-mono font-bold text-2xl text-primary bg-blue-50 px-0 py-2 rounded-xl w-24 text-center">
                            {timeLeft}s
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative aspect-square w-full max-w-[380px] mx-auto mb-8">

                {/* Idle / Start State */}
                {gameState === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center z-10 transition-all">
                        <p className="text-gray-600 mb-8 font-medium text-xl leading-relaxed">
                            Tap the box <span className="font-bold text-gray-900">ONLY</span> when it matches the target color.
                        </p>
                        <button
                            onClick={handleStart}
                            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all"
                        >
                            <Play size={24} fill="currentColor" /> Start Game
                        </button>
                    </div>
                )}

                {/* Countdown State - Show Target Instruction */}
                {gameState === 'countdown' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-3xl z-10 p-6 text-center border border-gray-100 shadow-sm">
                        <p className="text-gray-400 font-bold tracking-widest uppercase mb-6 text-sm">Target Color</p>
                        <h2 className={`text-5xl font-black mb-10 ${targetDetails.text} tracking-wider scale-110`}>
                            {targetDetails.name}
                        </h2>
                        <div className="text-8xl font-black text-gray-200 animate-pulse">
                            {countdown}
                        </div>
                    </div>
                )}

                {/* Completed State */}
                {gameState === 'completed' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-3xl z-20 animate-fade-in">
                        <div className="text-center w-full px-6">
                            <h4 className="text-2xl font-bold text-gray-800 mb-2">Time's Up!</h4>

                            {Math.max(streak, maxStreak) > 3 && (
                                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold animate-bounce-short">
                                    <Flame size={14} fill="currentColor" /> Max Streak: {Math.max(streak, maxStreak)}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                    <span className="block text-3xl font-bold text-green-600">{score.hits}</span>
                                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Correct</span>
                                </div>
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <span className="block text-3xl font-bold text-red-500">{score.misses}</span>
                                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Mistakes</span>
                                </div>
                            </div>

                            <button
                                onClick={handleStart}
                                className="text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2 mx-auto transition-colors hover:bg-gray-50 px-4 py-2 rounded-lg"
                            >
                                <RotateCcw size={16} /> Play Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Active Game Button */}
                {gameState === 'running' && (
                    <>
                        {/* Persistent Target Indicator */}
                        <div className="absolute top-4 right-4 z-20 pointer-events-none bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-gray-100 shadow-sm transition-all">
                            Target: <span className={targetDetails.text}>{targetDetails.name}</span>
                        </div>

                        <button
                            onMouseDown={handleTap}
                            onTouchStart={handleTap}
                            className={`
                                w-full h-full rounded-3xl shadow-inner transition-all duration-100 transform active:scale-95
                                ${color === 'gray' ? 'bg-gray-100' : color}
                                flex items-center justify-center
                            `}
                        >
                            {/* Feedback Overlays */}
                            {feedback === 'hit' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-scale-up z-30">
                                    <CheckCircle2 className="w-24 h-24 text-white drop-shadow-lg" />
                                </div>
                            )}
                            {feedback === 'miss' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-shake z-30">
                                    <XCircle className="w-24 h-24 text-white/50 drop-shadow-lg" />
                                </div>
                            )}
                        </button>
                    </>
                )}
            </div>

            {/* Footer / Instructions */}
            <div className="text-center h-6 flex items-center justify-center">
                {gameState === 'idle' && (
                    <p className="text-sm text-gray-400">
                        Test your reflexes and attention span.
                    </p>
                )}
                {gameState === 'running' && (
                    <p className="text-sm font-medium text-gray-500">
                        Tap only on <span className={`font-bold ${targetDetails.text}`}>{targetDetails.name}</span>
                    </p>
                )}
            </div>
        </div>
    );
};
