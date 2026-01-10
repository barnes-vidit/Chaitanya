import { motion } from 'framer-motion';
import { ArrowRight, Brain } from 'lucide-react';

interface ActionCardProps {
    title: string;
    subtitle: string;
    onClick?: () => void;
    image?: string; // Optional illustration URL
}

const ActionCard = ({ title, subtitle, onClick }: ActionCardProps) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer group relative overflow-hidden"
            onClick={onClick}
        >
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Brain className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-[80%]">{subtitle}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
            </div>

            {/* Hover Decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
        </motion.div>
    );
};

export default ActionCard;
