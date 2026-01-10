import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface LandingSectionProps {
    children: React.ReactNode;
    illustration?: string;
    align?: 'left' | 'right';
    className?: string;
    containerRef?: React.RefObject<any>;
}

const LandingSection: React.FC<LandingSectionProps> = ({
    children,
    illustration,
    align = 'left',
    className = '',
    containerRef
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
        container: containerRef
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={ref}
            className={`min-h-[80vh] flex items-center justify-center py-20 relative ${className}`}
        >
            <div className={`max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${align === 'right' ? 'md:grid-flow-dense' : ''}`}>

                {/* Content Side */}
                <motion.div
                    initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-20%", root: containerRef }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={align === 'right' ? 'md:col-start-2' : ''}
                >
                    {children}
                </motion.div>

                {/* Illustration Side */}
                {illustration && (
                    <motion.div
                        style={{ y, opacity }}
                        className={`relative flex justify-center ${align === 'right' ? 'md:col-start-1' : ''}`}
                    >
                        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl skew-y-3 transform transition-transform hover:skew-y-0 duration-500">
                            <img
                                src={illustration}
                                alt="Visualization"
                                className="w-full max-w-[500px] object-cover"
                            />
                            {/* Glass overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                        </div>

                        {/* Background elements for depth */}
                        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full -z-10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-20 pointer-events-none rounded-3xl" />
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default LandingSection;
