import { motion } from 'framer-motion';

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    label: string;
    subLabel?: string;
    color?: string;
    trackColor?: string;
}

const CircularProgress = ({
    value,
    size = 200,
    strokeWidth = 15,
    label,
    subLabel,
    color = "#2DD4BF", // Teal-400 default
    trackColor = "#E5E7EB"
}: CircularProgressProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference} // Start from 0
                    strokeLinecap="round"
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-bold text-white"
                >
                    {value}%
                </motion.span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm font-medium text-gray-500 mt-1"
                >
                    {label}
                </motion.span>
                {subLabel && <span className="text-xs text-gray-400 mt-1">{subLabel}</span>}
            </div>
        </div>
    );
};

export default CircularProgress;
