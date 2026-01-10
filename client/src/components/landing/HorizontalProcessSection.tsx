import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageSquare, Cpu, AlertTriangle } from 'lucide-react';

const HorizontalProcessSection = ({ scrollContainerRef }: { scrollContainerRef?: React.RefObject<HTMLElement> }) => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        container: scrollContainerRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

    const cards = [
        {
            title: "1. It Starts with a Chat",
            desc: "No white coats. No clipboards. Just a warm conversation about family, hobbies, or the weather.",
            icon: MessageSquare,
            color: "text-blue-400",
            bg: "bg-blue-900/20",
            border: "border-blue-500/30"
        },
        {
            title: "2. The AI Listens",
            desc: "Our model analyzes speech fluency, vocabulary richness, and response latency in real-time.",
            icon: Cpu,
            color: "text-purple-400",
            bg: "bg-purple-900/20",
            border: "border-purple-500/30"
        },
        {
            title: "3. Patterns Emerge",
            desc: "We detect subtle cognitive deviations long before traditional tests, flagging risks early.",
            icon: AlertTriangle,
            color: "text-amber-400",
            bg: "bg-amber-900/20",
            border: "border-amber-500/30"
        },
        {
            title: "4. You Stay Informed",
            desc: "Receive weekly insights on cognitive health trends directly on your dashboard.",
            icon: ActivityIcon,
            color: "text-emerald-400",
            bg: "bg-emerald-900/20",
            border: "border-emerald-500/30"
        },
    ];

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-[#050505]">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-10 pl-20 pr-20">

                    {/* Intro / Header Card */}
                    <div className="w-[400px] md:w-[600px] shrink-0 flex flex-col justify-center">
                        <h2 className="text-5xl md:text-7xl font-bold mb-6">How it <br /> Works</h2>
                        <p className="text-xl text-gray-400 max-w-md">A seamless journey from conversation to clinical insight. Scroll to follow the data flow.</p>
                        <div className="mt-8 text-sm text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            Scroll Down <div className="w-10 h-[1px] bg-gray-600" /> to move Right
                        </div>
                    </div>

                    {cards.map((card, i) => (
                        <div key={i} className={`w-[85vw] md:w-[600px] h-[60vh] shrink-0 rounded-[3rem] border backdrop-blur-sm p-12 flex flex-col justify-between ${card.bg} ${card.border}`}>
                            <div>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-black/40 ${card.color}`}>
                                    <card.icon size={32} />
                                </div>
                                <h3 className="text-4xl font-bold mb-4">{card.title}</h3>
                                <p className="text-xl text-gray-300 leading-relaxed">{card.desc}</p>
                            </div>
                            <div className="text-9xl font-bold opacity-10 absolute bottom-4 right-8 select-none">
                                0{i + 1}
                            </div>
                        </div>
                    ))}

                    {/* Spacer */}
                    <div className="w-[200px]" />

                </motion.div>
            </div>
        </section>
    );
};

const ActivityIcon = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
)

export default HorizontalProcessSection;
