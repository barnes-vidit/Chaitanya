import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Clock, Eye, Brain, Mic } from 'lucide-react';

const ChaoticAssemblySection = ({ scrollContainerRef }: { scrollContainerRef?: React.RefObject<HTMLElement> }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        container: scrollContainerRef,
        offset: ["start start", "end end"]
    });

    // We pin the content for 3 screens worth of scroll
    // 0 -> 0.4: Chaos exists
    // 0.4 -> 0.8: Assembly into Chat
    // 0.8 -> 1: Hold/Exit

    // Floating Items Logic
    const items = [
        { icon: Clock, label: "Visuospatial", color: "text-rose-400", bg: "bg-rose-500/10", x: -200, y: -150, rot: -15 },
        { icon: Eye, label: "Attention", color: "text-amber-400", bg: "bg-amber-500/10", x: 250, y: -100, rot: 10 },
        { icon: Brain, label: "Memory", color: "text-purple-400", bg: "bg-purple-500/10", x: -180, y: 180, rot: -5 },
        { icon: Mic, label: "Fluency", color: "text-emerald-400", bg: "bg-emerald-500/10", x: 220, y: 150, rot: 20 },
    ];

    // Chat Bubbles (The Target)
    const bubbles = [
        { text: "How was your sleep?", side: "left", delay: 0 },
        { text: "I woke up at 7...", side: "right", delay: 0.1 },
        { text: "Let's draw a clock.", side: "left", delay: 0.2 }, // The assessment hidden
    ];

    return (
        <div ref={containerRef} className="relative h-[300vh]">
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

                {/* Background Text needing explanation? */}
                <motion.div
                    style={{ opacity: useTransform(scrollYProgress, [0, 0.2, 0.6], [0, 1, 0]) }}
                    className="absolute top-20 text-center z-10 px-4"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        Hidden in Plain Sight
                    </h2>
                    <p className="text-xl text-gray-300 font-light tracking-wide">Standard clinical tests feel stressful.</p>
                </motion.div>

                <motion.div
                    style={{ opacity: useTransform(scrollYProgress, [0.5, 0.6], [0, 1]) }}
                    className="absolute top-20 text-center z-10 px-4"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(60,130,246,0.4)]">
                        Invisible Assessment
                    </h2>
                    <p className="text-xl text-gray-300 font-light tracking-wide">We weave them into natural conversation.</p>
                </motion.div>


                {/* The Phone/Interface Container */}
                <div className="relative w-[320px] md:w-[400px] h-[500px] md:h-[600px] bg-[#050505]/80 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-[0_0_60px_-15px_rgba(30,58,138,0.5)] overflow-hidden flex flex-col z-20 transition-all duration-500 hover:shadow-[0_0_80px_-10px_rgba(147,51,234,0.4)]">
                    {/* Glossy Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-50 rounded-[3rem]" />

                    {/* Top Notch Area (implied) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/50 rounded-b-2xl z-40 backdrop-blur-md" />

                    {/* Chat Header */}
                    <div className="pt-12 pb-4 px-6 border-b border-white/5 bg-gradient-to-b from-[#0a0a0a] to-transparent flex items-center gap-4 z-30">
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Brain className="w-5 h-5 text-white" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                        </div>
                        <div>
                            <div className="font-bold text-lg text-white tracking-tight">Chaitanya</div>
                            <div className="text-xs text-blue-300/80 flex items-center gap-1.5 font-medium">
                                AI Companion
                            </div>
                        </div>
                        <div className="ml-auto text-white/20">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="flex-1 p-6 relative flex flex-col gap-5 overflow-hidden">
                        {/* Gradient Mesh Background inside phone */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-[#000] to-transparent" />

                        {bubbles.map((b, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                style={{
                                    opacity: useTransform(scrollYProgress, [0.4 + (i * 0.05), 0.5 + (i * 0.05)], [0, 1]),
                                    y: useTransform(scrollYProgress, [0.4 + (i * 0.05), 0.5 + (i * 0.05)], [20, 0])
                                }}
                                className={`relative p-4 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-lg backdrop-blur-sm
                                    ${b.side === 'left'
                                        ? 'bg-white/5 border border-white/5 text-gray-100 self-start rounded-tl-none'
                                        : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white self-end rounded-tr-none shadow-blue-500/20'
                                    }`}
                            >
                                {b.text}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CHAOTIC FLOATING ELEMENTS */}
                {items.map((item, index) => {
                    // Logic: Start scattered (0 scroll). 
                    // As scroll goes to 0.4/0.5, they move towards center (0,0) and scale down/fade out
                    // pretending to "enter" the phone.

                    const x = useTransform(scrollYProgress, [0, 0.5], [item.x, 0]);
                    const y = useTransform(scrollYProgress, [0, 0.5], [item.y, 100]); // Move slightly down into phone
                    const rotate = useTransform(scrollYProgress, [0, 0.5], [item.rot, 0]);
                    const scale = useTransform(scrollYProgress, [0, 0.4, 0.5], [1, 0.5, 0]); // Shrink to nothing
                    const opacity = useTransform(scrollYProgress, [0, 0.4, 0.5], [1, 1, 0]);

                    return (
                        <motion.div
                            key={index}
                            style={{ x, y, rotate, scale, opacity }}
                            className={`absolute z-30 flex items-center gap-3 px-6 py-4 rounded-xl border border-white/10 backdrop-blur-xl ${item.bg} shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]`}
                        >
                            <item.icon className={`w-8 h-8 ${item.color}`} />
                            <div className="text-left">
                                <div className={`font-bold ${item.color}`}>{item.label}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Module</div>
                            </div>
                        </motion.div>
                    )
                })}

            </div>
        </div>
    );
};

export default ChaoticAssemblySection;
