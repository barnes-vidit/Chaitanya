import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';
import EmptyState from './EmptyState';

interface ChartProps {
    data: Array<{ date: string; score: number; maxScore: number }>;
}

const CognitiveTrendChart = ({ data }: ChartProps) => {
    // AreaChart looks bad with 1 point. Show EmptyState until we have at least 2 points to draw a line.
    const hasData = data && data.length >= 2;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[320px] w-full bg-[#121212] rounded-[2rem] p-6 shadow-lg border border-white/5 flex flex-col relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />
            <h3 className="text-white/80 font-bold mb-6 flex items-center gap-2 relative z-10">
                Cognitive Trend
                {hasData && <span className="text-xs font-normal text-blue-200 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/20">{data.length} Sessions</span>}
            </h3>

            <div className="flex-1 w-full min-h-0 relative z-10">
                {!hasData ? (
                    <EmptyState
                        icon={BarChart2}
                        title="Not Enough Data"
                        description="Complete more assessments to see your cognitive trend analysis."
                    />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                hide
                                domain={[0, 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    borderColor: '#334155',
                                    color: '#f8fafc',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'
                                }}
                                itemStyle={{ color: '#818cf8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#818cf8"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>

    );
};

export default CognitiveTrendChart;
