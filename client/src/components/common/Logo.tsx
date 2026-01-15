import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    layoutIdPrefix?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', layoutIdPrefix = 'chaitanya-logo' }) => {
    return (
        <div className={`relative inline-flex items-baseline justify-center ${className} select-none`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rozha+One&display=swap');
            `}</style>

            <div className="flex items-baseline">
                {/* Large 'C' */}
                <motion.span
                    className="leading-none m-0 tracking-normal"
                    style={{ fontFamily: '"Rozha One", serif', fontWeight: 400, fontSize: '1.4em', marginRight: '-0.05em' }}
                    layoutId={`${layoutIdPrefix}-text-C`}
                >
                    C
                </motion.span>

                {/* ha */}
                <motion.span
                    className="leading-none m-0 tracking-normal"
                    style={{ fontFamily: '"Rozha One", serif', fontWeight: 400 }}
                    layoutId={`${layoutIdPrefix}-text-ha`}
                >
                    ha
                </motion.span>

                {/* i - Distinct Blue */}
                <motion.span
                    className="leading-none m-0 tracking-normal relative"
                    style={{ fontFamily: '"Rozha One", serif', fontWeight: 400, color: '#5DADE2', zIndex: 30 }}
                    layoutId={`${layoutIdPrefix}-text-i`}
                >
                    i
                </motion.span>

                {/* tanya */}
                <motion.span
                    className="leading-none m-0 tracking-normal"
                    style={{ fontFamily: '"Rozha One", serif', fontWeight: 400 }}
                    layoutId={`${layoutIdPrefix}-text-tanya`}
                >
                    tanya
                </motion.span>
            </div>
        </div>
    );
};

export default Logo;
