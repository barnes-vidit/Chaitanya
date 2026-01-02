import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface PulseRateCardProps {
    bpm: number;
}

const PulseRateCard = ({ bpm }: PulseRateCardProps) => {
    return (
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-teal-50">Pulse Rate</h3>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
                <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 60 / bpm
                    }}
                    className="text-4xl font-bold"
                >
                    {bpm}
                </motion.span>
                <span className="text-lg opacity-80">BPM</span>
            </div>

            {/* Heartbeat Line Visualization */}
            <div className="h-12 w-full flex items-center mt-2">
                <svg viewBox="0 0 300 50" className="w-full h-full overflow-visible">
                    <motion.path
                        d="M0 25 L30 25 L40 10 L50 40 L60 25 L300 25"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="300"
                        strokeDashoffset="300"
                        animate={{ strokeDashoffset: 0 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </svg>
            </div>
        </div>
    );
};

export default PulseRateCard;
