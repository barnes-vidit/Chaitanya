import { useRef, useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingSection from '../components/landing/LandingSection';
import ScrollProgress from '../components/landing/ScrollProgress';

import IntroOverlay from '../components/intro/IntroOverlay';
import ChaoticAssemblySection from '../components/landing/ChaoticAssemblySection';
import HorizontalProcessSection from '../components/landing/HorizontalProcessSection';
import DashboardBuilderSection from '../components/landing/DashboardBuilderSection';
import BrainNetworkBackground from '../components/landing/BrainNetworkBackground';

// Import Assets
import chatIllustration from '../assets/landing/illustration-chat.png';

const LandingPage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [introComplete, setIntroComplete] = useState(false);

    const [scrolled, setScrolled] = useState(false);

    // Prevent scrolling during intro and handle scroll fade
    useEffect(() => {
        if (!introComplete) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        const handleScroll = () => {
            if (containerRef.current) {
                setScrolled(containerRef.current.scrollTop > 50);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [introComplete]);

    return (
        <>
            <AnimatePresence>
                {!introComplete && (
                    <IntroOverlay onComplete={() => setIntroComplete(true)} />
                )}
            </AnimatePresence>

            <div
                ref={containerRef}
                className="fixed top-0 left-0 right-0 bottom-0 overflow-y-auto bg-[#0a0a0a] text-white selection:bg-primary selection:text-white"
                style={{ zIndex: 0 }}
            >
                {/* Top Fade Mask - Pure gradient, NO BLUR, to fade content out as it scrolls up */}
                <div
                    className={`fixed top-0 left-0 right-0 h-32 z-40 pointer-events-none transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
                </div>


                {/* Content Wrapper that animates in AFTER intro */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={introComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <ScrollProgress containerRef={containerRef as any} />

                    {/* Background Texture/Gradient */}
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-[#0a0a0a]" />
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        />
                    </div>

                    {/* --- HERO SECTION --- */}
                    <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-20 pb-40">

                        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                            {/* LEFT COLUMN: Text Content */}
                            <div className="text-left z-20 relative">
                                {/* Subtle white glow behind text for separation */}
                                <div className="absolute -inset-10 bg-white/5 blur-3xl -z-10 rounded-full opacity-0 lg:opacity-100" />

                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                >
                                    {/* New Localization Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-6">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </span>
                                        <span className="text-xs font-semibold tracking-wide text-blue-200 uppercase">Tailored for Indian Languages</span>
                                    </div>

                                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1] text-white drop-shadow-xl">
                                        The Thread of <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-white drop-shadow-[0_0_15px_rgba(93,173,226,0.3)] animate-pulse-slow">Memory</span>
                                    </h1>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="text-xl md:text-2xl text-blue-100/80 max-w-lg font-light leading-relaxed mb-12 tracking-wide"
                                >
                                    We translate conversations into cognitive insights.
                                    Early detection of dementia, woven into the fabric of everyday chat.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                    className="flex flex-wrap gap-6"
                                >
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full transition-all hover:scale-105 hover:bg-blue-50 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.6)] flex items-center gap-3">
                                                Begin Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </SignInButton>
                                    </SignedOut>
                                    <SignedIn>
                                        <Link
                                            to="/chat"
                                            className="group relative px-8 py-4 bg-[#5DADE2] text-white font-bold text-lg rounded-full transition-all hover:bg-[#4a90e2] hover:scale-105 hover:shadow-[0_0_50px_-5px_rgba(93,173,226,0.5)] flex items-center gap-3"
                                        >
                                            Continue Assessment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </SignedIn>
                                </motion.div>
                            </div>

                            {/* RIGHT COLUMN: Interactive Brain */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-[60vh] lg:h-[80vh] w-full relative"
                            >
                                <div className="absolute inset-0 bg-radial-at-c from-blue-500/10 to-transparent blur-3xl" />
                                <BrainNetworkBackground />
                            </motion.div>

                        </div>

                        {/* Background Ambience */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-900/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                        </div>

                        {/* Scroll Indicator */}
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute bottom-10 left-10 text-gray-500 text-sm tracking-widest uppercase writing-mode-vertical"
                        >
                            Scroll to Explore
                        </motion.div>
                    </section>


                    {/* --- SECTION 1: THE HOOK (Just Chat) --- */}
                    <LandingSection illustration={chatIllustration} align="left" containerRef={containerRef}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <MessageSquare className="w-6 h-6 text-[#5DADE2]" />
                            </div>
                            <span className="text-[#5DADE2] font-mono text-sm tracking-widest uppercase">The Interface</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            It feels like a <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Simple Conversation.</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            No clinical tests. No anxiety. Just you and Chaitanya talking about your life, your memories, and your stories.
                            We've designed an experience that feels like catching up with an old friend.
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500 font-mono">
                            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Voice Enabled</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Multilingual</span>
                        </div>
                    </LandingSection>


                    {/* --- SECTION 2: THE MAGIC (Assessment) - REPLACED WITH CHAOTIC ASSEMBLY --- */}
                    <ChaoticAssemblySection scrollContainerRef={containerRef as any} />


                    {/* --- SECTION 2.5: HORIZONTAL FLOW (How it Works) --- */}
                    <HorizontalProcessSection scrollContainerRef={containerRef as any} />

                    {/* --- SECTION 3: THE REVEAL (Dashboard) - REPLACED WITH GRAVITY BUILDER --- */}
                    <DashboardBuilderSection scrollContainerRef={containerRef} />


                    {/* --- CALL TO ACTION --- */}
                    <section className="py-32 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent pointer-events-none" />
                        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">
                                Ready to start?
                            </h2>
                            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                                Join Indians using Chaitanya to preserve memories and monitor health with dignity.
                            </p>
                            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button className="px-10 py-5 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]">
                                            Create Free Account
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <Link to="/chat" className="px-10 py-5 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]">
                                        Start Now
                                    </Link>
                                </SignedIn>
                            </div>
                        </div>
                    </section>


                </motion.div>
            </div>
        </>
    );
};

export default LandingPage;
