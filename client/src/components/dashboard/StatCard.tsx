import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    color?: string;
}

const StatCard = ({ title, value, trend, trendDirection = 'neutral', icon, color = 'blue' }: StatCardProps) => {
    const trendColor = {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
    }[trendDirection];

    const TrendIcon = {
        up: ArrowUpRight,
        down: ArrowDownRight,
        neutral: Minus
    }[trendDirection];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${trendColor}`}>
                        {trend} <TrendIcon className="h-3 w-3 ml-1" />
                    </span>
                )}
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    );
};

export default StatCard;
