import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface IntroOverlayProps {
    onComplete: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Step 1: Reveal "I" (0.5s)
        const timer1 = setTimeout(() => setStep(1), 500);

        // Step 2: Retract Line (2.5s)
        const timer2 = setTimeout(() => {
            setStep(2);

            // Step 3: Fly to Navbar (Wait for retraction to finish - 0.5s)
            // Reduced to 100ms for snappier takeoff
            setTimeout(onComplete, 100);
        }, 2200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent pointer-events-none"
        >
            {/* Background Layer - This fades out */}
            <motion.div
                className="absolute inset-0 bg-[#050505] -z-10"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Font is now preloaded in index.html with non-blocking strategy */}

                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)' }} />
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                </div>
            </motion.div>

            {/* MAIN ANIMATION CONTAINER - Text stays visible for transition */}
            <div className="relative z-50 flex items-center justify-center">
                <div className="flex items-end text-6xl md:text-9xl font-normal tracking-normal text-white"
                    style={{ fontFamily: '"Rozha One", serif' }}>

                    {/* Shirorekha - Shows at Step 1, Hides at Step 2 */}
                    {/* IMPORTANT: No layoutId, so it just fades out here and doesn't try to fly */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: (step === 1) ? 1 : 0 }} // Expand then Retract
                        transition={{ duration: step === 1 ? 1.2 : 0.5, ease: step === 1 ? [0.22, 1, 0.36, 1] : "easeIn" }}
                        className="absolute top-[0.42em] left-[0.2em] right-[-0.05em] h-[0.06em] bg-white origin-left z-20 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    />

                    {/* Text Parts */}
                    <div className="flex items-baseline">
                        {/* The Large C */}
                        <motion.span
                            layoutId="chaitanya-logo-text-C"
                            className="leading-none m-0 tracking-normal mr-[-0.05em]"
                            style={{ fontSize: '1.4em' }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : 20 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            C
                        </motion.span>

                        <div className="flex items-center">
                            {/* "ha" */}
                            <motion.span
                                layoutId="chaitanya-logo-text-ha"
                                className="overflow-hidden inline-block"
                                initial={{ width: 0, opacity: 0 }}
                                animate={step >= 1 ? { width: 'auto', opacity: 1 } : { width: 0, opacity: 0 }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                ha
                            </motion.span>

                            {/* "i" - Blue */}
                            <motion.span
                                layoutId="chaitanya-logo-text-i"
                                initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                                animate={step >= 1 ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { opacity: 1, scale: 1.2, filter: 'blur(0px)' }}
                                transition={{ duration: 1 }}
                                className="mx-[0.02em] text-[#5DADE2] relative"
                                style={{ zIndex: 30 }}
                            >
                                i
                            </motion.span>

                            {/* "tanya" */}
                            <motion.span
                                layoutId="chaitanya-logo-text-tanya"
                                className="overflow-hidden inline-block"
                                initial={{ width: 0, opacity: 0 }}
                                animate={step >= 1 ? { width: 'auto', opacity: 1 } : { width: 0, opacity: 0 }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            >
                                tanya
                            </motion.span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default IntroOverlay;
