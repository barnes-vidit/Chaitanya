import { useState, useRef } from 'react';
import { Check, RotateCcw, Clock } from 'lucide-react';

export const ClockDrawingTask = ({ onComplete, isDarkMode = false }: { onComplete?: (data: any) => void, isDarkMode?: boolean }) => {
    // Generate random time on mount
    const [targetTime] = useState(() => {
        const h = Math.floor(Math.random() * 12) + 1;
        const m = Math.floor(Math.random() * 12) * 5; // Multiples of 5 for easier reading initially, or 0-59
        // Let's do completely random minutes as requested for 'dynamic'
        const randomMinute = Math.floor(Math.random() * 60);
        return { hour: h, minute: randomMinute };
    });

    // Initialize hands to random non-overlapping positions to avoid confusion
    const [hourAngle, setHourAngle] = useState(() => Math.random() * 360);
    const [minuteAngle, setMinuteAngle] = useState(() => Math.random() * 360);

    const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const svgRef = useRef<SVGSVGElement>(null);

    const getAngle = (clientX: number, clientY: number) => {
        if (!svgRef.current) return 0;
        const rect = svgRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        return angle;
    };

    const handleStart = (type: 'hour' | 'minute') => (e: any) => {
        if (submitted) return;
        e.preventDefault();
        e.stopPropagation(); // Stop event bubbling
        setIsDragging(type);
    };

    const handleMove = (e: any) => {
        if (!isDragging || submitted) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const angle = getAngle(clientX, clientY);
        if (isDragging === 'hour') setHourAngle(angle);
        else setMinuteAngle(angle);
    };

    const handleEnd = () => setIsDragging(null);

    const handleSubmit = () => {
        setSubmitted(true);

        // Calculate Target Angles
        // Minute: 6 degrees per minute
        const targetMinuteAngle = targetTime.minute * 6;

        // Hour: 30 degrees per hour + 0.5 degrees per minute
        // Ensure 12 is treated as 0 for calculation if needed, but 12*30 = 360 which is 0.
        // Let's use standard (h % 12) * 30 + m * 0.5
        const targetHourAngle = ((targetTime.hour % 12) * 30) + (targetTime.minute * 0.5);

        // Calculate minimal difference (considering 360 wrap-around)
        const getDiff = (a: number, b: number) => {
            const diff = Math.abs(a - b) % 360;
            return Math.min(diff, 360 - diff);
        };

        const hDiff = getDiff(hourAngle, targetHourAngle);
        const mDiff = getDiff(minuteAngle, targetMinuteAngle);

        // Tolerance: 20 degrees for hour, 10 degrees for minute
        const isCorrect = hDiff < 20 && mDiff < 10;

        if (onComplete) {
            onComplete({
                hourAngle,
                minuteAngle,
                targetTime,
                score: isCorrect ? 1.0 : 0.0,
                hDiff,
                mDiff
            });
        }
    };

    return (
        <div className={`
            relative overflow-hidden p-8 rounded-2xl border shadow-xl backdrop-blur-sm my-4 w-full max-w-sm mx-auto select-none group transition-all duration-300 hover:shadow-2xl
            ${isDarkMode
                ? 'bg-[#1a1a1a] border-white/10'
                : 'bg-gradient-to-br from-white to-blue-50/50 border-white/60'}
        `}>
            {/* Header / Gamified Prompt */}
            <div className="text-center mb-8 relative z-10">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3 ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100/50 text-blue-700'}`}>
                    <Clock size={12} /> Challenge
                </div>
                <h3 className="font-display text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
                    <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} font-light`}>Set to</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        {targetTime.hour}:{targetTime.minute.toString().padStart(2, '0')}
                    </span>
                </h3>
            </div>

            {/* Clock Interaction Area */}
            <div
                className="relative w-full aspect-square max-w-[280px] mx-auto transform transition-transform duration-500 hover:scale-105"
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            >
                {/* Decorative Glow */}
                <div className={`absolute inset-0 blur-3xl rounded-full -z-10 animate-pulse ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-400/20'}`} />

                <svg
                    ref={svgRef}
                    viewBox="0 0 300 300"
                    className="w-full h-full drop-shadow-2xl"
                >
                    {/* Clock Face Background */}
                    <circle cx="150" cy="150" r="140" fill={isDarkMode ? '#222' : 'url(#faceGradient)'} stroke={isDarkMode ? '#333' : 'white'} strokeWidth="2" className="shadow-inner" />
                    <defs>
                        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#f0f4ff" />
                        </linearGradient>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.1" />
                        </filter>
                    </defs>

                    {/* Ticks (Subtle) */}
                    {[...Array(60)].map((_, i) => (
                        <line
                            key={i}
                            x1="150" y1="18"
                            x2="150" y2={i % 5 === 0 ? "28" : "22"}
                            transform={`rotate(${i * 6} 150 150)`}
                            stroke={i % 5 === 0 ? (isDarkMode ? '#555' : '#cbd5e1') : (isDarkMode ? '#333' : '#e2e8f0')}
                            strokeWidth={i % 5 === 0 ? "2" : "1"}
                        />
                    ))}

                    {/* Numbers (Modern Font) */}
                    {[...Array(12)].map((_, i) => {
                        const num = i + 1;
                        const angle = (num * 30 - 90) * (Math.PI / 180);
                        const r = 105;
                        return (
                            <text
                                key={num}
                                x={150 + r * Math.cos(angle)}
                                y={150 + r * Math.sin(angle) + 1} // Optical adjust
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className={`font-bold text-xl font-sans ${isDarkMode ? 'fill-gray-500' : 'fill-slate-400'}`}
                                style={{ filter: isDarkMode ? 'none' : "url(#shadow)" }}
                            >
                                {num}
                            </text>
                        );
                    })}

                    {/* Minute Hand */}
                    <g
                        transform={`rotate(${minuteAngle}, 150, 150)`}
                        filter={isDarkMode ? 'none' : "url(#shadow)"}
                        className={`cursor-grab active:cursor-grabbing ${submitted ? 'pointer-events-none' : ''}`}
                        onMouseDown={handleStart('minute')}
                        onTouchStart={handleStart('minute')}
                    >
                        {/* Invisible Wide Hit Area for easier grabbing */}
                        <rect x="135" y="25" width="30" height="150" fill="transparent" />

                        {/* Hand Body */}
                        <rect x="147" y="40" width="6" height="130" rx="3" fill="#60a5fa" className="opacity-90 transition-colors" />
                        {/* Arrowhead */}
                        <path d="M 147 42 L 150 25 L 153 42 L 150 40 Z" fill="#60a5fa" stroke="#60a5fa" strokeWidth="1" strokeLinejoin="round" />

                        {/* Control Knob */}
                        <circle
                            cx="150" cy="30" r="15"
                            fill="transparent"
                        />
                        <circle
                            cx="150" cy="30" r="4"
                            fill={submitted ? "#94a3b8" : "#3b82f6"}
                            className="pointer-events-none"
                        />
                    </g>

                    {/* Hour Hand */}
                    <g
                        transform={`rotate(${hourAngle}, 150, 150)`}
                        filter={isDarkMode ? 'none' : "url(#shadow)"}
                        className={`cursor-grab active:cursor-grabbing ${submitted ? 'pointer-events-none' : ''}`}
                        onMouseDown={handleStart('hour')}
                        onTouchStart={handleStart('hour')}
                    >
                        {/* Invisible Wide Hit Area */}
                        <rect x="130" y="60" width="40" height="110" fill="transparent" />

                        {/* Hand Body */}
                        <rect x="146" y="80" width="8" height="90" rx="4" fill="#1e40af" className="opacity-90 transition-colors" />
                        {/* Arrowhead */}
                        <path d="M 146 82 L 150 60 L 154 82 L 150 80 Z" fill="#1e40af" stroke="#1e40af" strokeWidth="1" strokeLinejoin="round" />

                        {/* Control Knob */}
                        <circle
                            cx="150" cy="65" r="15"
                            fill="transparent"
                        />
                        <circle
                            cx="150" cy="65" r="4"
                            fill={submitted ? "#64748b" : "#1d4ed8"}
                            className="pointer-events-none"
                        />
                    </g>

                    {/* Center Cap */}
                    <circle cx="150" cy="150" r="6" fill="#1e3a8a" stroke="white" strokeWidth="2" className="pointer-events-none" />
                </svg>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-center">
                {!submitted ? (
                    <button
                        onClick={handleSubmit}
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20"
                    >
                        <span>I'm Done</span>
                        <Check size={20} className="stroke-[3]" />
                    </button>
                ) : (
                    <div className="flex gap-3 animate-fade-in">
                        <span className={`inline-flex items-center px-6 py-2 rounded-lg font-medium border ${isDarkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700 border-green-200'}`}>
                            Excellent!
                        </span>
                        <button onClick={() => { setSubmitted(false); setHourAngle(0); setMinuteAngle(0); }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                            <RotateCcw size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
