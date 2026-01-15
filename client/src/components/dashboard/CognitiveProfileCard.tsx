import { motion } from 'framer-motion';
import { Brain, Zap, MessageSquare } from 'lucide-react';

interface SkillBarProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

const SkillBar = ({ label, value, icon, color }: SkillBarProps) => (
    <div className="mb-6 last:mb-0">
        <div className="flex justify-between items-center mb-2">
            <div className={`flex items-center gap-2 text-sm font-medium text-gray-300`}>
                <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>
                    {icon}
                </div>
                {label}
            </div>
            <span className="text-white font-bold text-sm">{value}%</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
            />
        </div>
    </div>
);

interface CognitiveProfileProps {
    profile: {
        memory: number;
        attention: number;
        language: number;
    };
}

const CognitiveProfileCard = ({ profile }: CognitiveProfileProps) => {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="h-full"
        >
            <h3 className="text-white/40 font-bold text-xs mb-6 uppercase tracking-[0.2em] text-center">Cognitive Profile</h3>

            <div className="relative z-10">
                <SkillBar
                    label="Memory"
                    value={profile.memory}
                    icon={<Brain className="h-4 w-4" />}
                    color="text-indigo-500"
                />
                <SkillBar
                    label="Attention"
                    value={profile.attention}
                    icon={<Zap className="h-4 w-4" />}
                    color="text-amber-500"
                />
                <SkillBar
                    label="Language"
                    value={profile.language}
                    icon={<MessageSquare className="h-4 w-4" />}
                    color="text-teal-500"
                />
            </div>
        </motion.div>
    );
};

export default CognitiveProfileCard;
