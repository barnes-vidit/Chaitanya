import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ChartProps {
    data: Array<{ date: string; score: number; maxScore: number }>;
}

const CognitiveTrendChart = ({ data }: ChartProps) => {
    // Generate dummy data if real data is empty for better visualization
    const chartData = data && data.length > 0 ? data : [
        { date: 'Mon', score: 65, maxScore: 100 },
        { date: 'Tue', score: 59, maxScore: 100 },
        { date: 'Wed', score: 80, maxScore: 100 },
        { date: 'Thu', score: 81, maxScore: 100 },
        { date: 'Fri', score: 56, maxScore: 100 },
        { date: 'Sat', score: 55, maxScore: 100 },
        { date: 'Sun', score: 40, maxScore: 100 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[300px] w-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-6 shadow-xl border border-slate-700/50"
        >
            <h3 className="text-slate-300 font-medium mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Speech Clarity
            </h3>

            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        hide
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1E293B',
                            borderColor: '#334155',
                            color: '#F8FAFC',
                            borderRadius: '12px'
                        }}
                        itemStyle={{ color: '#A78BFA' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#A78BFA"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default CognitiveTrendChart;
