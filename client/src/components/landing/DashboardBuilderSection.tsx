import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, BarChart3, TrendingUp, AlertOctagon } from 'lucide-react';

const DashboardBuilderSection = ({ scrollContainerRef }: { scrollContainerRef?: React.RefObject<HTMLElement> }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { root: scrollContainerRef, once: true, margin: "-100px" });

    // Physics constants for the drop
    const dropTransition = {
        type: "spring",
        damping: 20,
        stiffness: 300,
        mass: 1.5,
    };

    return (
        <section className="py-32 relative min-h-[120vh] bg-[#0a0a0a] overflow-hidden" ref={containerRef}>
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center mb-20">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="text-5xl md:text-7xl font-bold mb-4"
                >
                    The <span className="text-emerald-400">Full Picture</span>
                </motion.h2>
                <p className="text-xl text-gray-400">We assemble the pieces of your cognitive health.</p>
            </div>

            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">

                {/* Widget 1: Big Graph (Span 2) */}
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.9 }}
                    animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ ...dropTransition, delay: 0.1 }}
                    className="md:col-span-2 h-[300px] bg-[#151515] rounded-3xl border border-white/5 p-6 flex flex-col relative overflow-hidden group hover:border-emerald-500/30 transition-colors shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-gray-300 font-medium"><BarChart3 size={20} /> Memory Recall</div>
                        <div className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded">+5% vs last week</div>
                    </div>
                    {/* Fake Graph Lines */}
                    <div className="flex-1 flex items-end justify-between gap-2 px-2">
                        {[40, 60, 45, 70, 65, 80, 75, 90].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: "0%" }}
                                animate={isInView ? { height: `${h}%` } : {}}
                                transition={{ duration: 1, delay: 0.5 + (i * 0.1), type: "spring" }}
                                className="flex-1 bg-gradient-to-t from-emerald-900/50 to-emerald-500/50 rounded-t-sm group-hover:to-emerald-400/80 transition-all duration-500"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Widget 2: Risk Score (Tall) */}
                <motion.div
                    initial={{ y: -150, opacity: 0, scale: 0.9 }}
                    animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ ...dropTransition, delay: 0.2 }}
                    className="md:row-span-2 h-[400px] bg-gradient-to-b from-[#151515] to-emerald-900/10 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center relative hover:scale-[1.02] transition-transform shadow-2xl"
                >
                    <div className="text-gray-400 font-medium mb-4">Risk Profile</div>
                    <div className="w-40 h-40 rounded-full border-[8px] border-emerald-500/20 border-t-emerald-400 flex items-center justify-center text-5xl font-bold text-white shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                        Low
                    </div>
                    <div className="mt-8 text-center text-sm text-gray-400">
                        Based on <span className="text-white font-bold">14</span> conversations.
                    </div>
                </motion.div>

                {/* Widget 3: Alert/Insight */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    whileHover={{ scale: 1.05 }}
                    transition={{ ...dropTransition, delay: 0.4 }}
                    className="h-[200px] bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 flex flex-col justify-between shadow-2xl"
                >
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                        <AlertOctagon size={20} />
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Observation</div>
                        <div className="text-lg leading-tight text-gray-200">Word retrieval latency decreased in evening session.</div>
                    </div>
                </motion.div>

                {/* Widget 4: Suggestion */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    whileHover={{ scale: 1.05 }}
                    transition={{ ...dropTransition, delay: 0.5 }}
                    className="h-[200px] bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl border border-white/5 p-6 flex flex-col justify-center gap-4 shadow-2xl"
                >
                    <div className="flex items-center gap-3 text-lg font-bold">
                        <TrendingUp className="text-blue-400" />
                        <span>Suggestion</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-sm border-l-4 border-blue-400">
                        Try the "Clock Drawing" task tomorrow morning.
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default DashboardBuilderSection;
