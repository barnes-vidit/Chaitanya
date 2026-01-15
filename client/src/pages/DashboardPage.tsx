import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Sparkles, Activity, Brain, ArrowRight } from 'lucide-react';

import CircularProgress from '../components/dashboard/CircularProgress';
import CognitiveProfileCard from '../components/dashboard/CognitiveProfileCard';
import CognitiveTrendChart from '../components/dashboard/CognitiveTrendChart';
import ActionCard from '../components/dashboard/ActionCard';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import EmptyState from '../components/dashboard/EmptyState';

const DashboardPage = () => {
    const { getToken, isLoaded } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!isLoaded) return;
            try {
                const token = await getToken();
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [isLoaded, getToken]);

    // Data Processing
    const hasData = stats?.stats?.totalAssessments > 0;
    const avgScore = stats?.stats?.avgScore || 0;
    const memoryPercentage = stats?.stats?.profile?.memory || 0;
    const riskLevel = stats?.stats?.riskScore || "Low";

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans pt-24 overflow-x-hidden">
            {/* Vibrant Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-teal-900/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* 1. Hero Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden border border-white/10 bg-[#121212]/50 backdrop-blur-2xl shadow-xl"
                >
                    <div className="z-10">
                        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-white">
                            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user?.firstName}</span>
                        </h1>
                        <p className="text-gray-300 text-lg max-w-xl font-light leading-relaxed">
                            Ready to strengthen your mind today? Your cognitive health looks <span className={`font-semibold ${riskLevel === 'Low' ? 'text-teal-400' : 'text-rose-400'}`}>{riskLevel} Risk</span>.
                        </p>
                    </div>

                    <div className="flex gap-6 z-10 items-center">
                        <div className="hidden md:block text-right">
                            <p className="text-xs text-blue-300/60 font-medium uppercase tracking-widest mb-1">Daily Streak</p>
                            <p className="text-3xl font-bold text-white flex items-center justify-end gap-2">
                                <Sparkles className="w-6 h-6 text-amber-400" fill="currentColor" /> 3 <span className="text-lg font-normal text-white/50">Days</span>
                            </p>
                        </div>
                        <div className="h-12 w-[1px] bg-white/10 hidden md:block"></div>
                        <button className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all relative group">
                            <Bell className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                            {riskLevel === 'High' && <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>}
                        </button>
                    </div>

                    {/* Abstract Shapes Background */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none"></div>
                </motion.div>

                {/* 2. Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

                    {/* COL 1: Key Metrics (Memory & Profile) */}
                    <div className="space-y-6 lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#121212] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-gray-400 font-bold text-xs mb-6 uppercase tracking-[0.2em] text-center">Memory Score</h3>
                            <div className="flex justify-center py-2 relative z-10">
                                <CircularProgress
                                    value={memoryPercentage}
                                    label={hasData ? `${Math.round(memoryPercentage)}%` : "N/A"}
                                    subLabel=""
                                    size={180}
                                    color={memoryPercentage > 75 ? "#2dd4bf" : memoryPercentage > 50 ? "#facc15" : "#f43f5e"}
                                    trackColor="#262626"
                                />
                            </div>
                        </motion.div>

                        <div className="bg-[#121212] rounded-[2rem] p-6 border border-white/5 shadow-lg">
                            <CognitiveProfileCard profile={stats?.stats?.profile || { memory: 0, attention: 0, language: 0 }} />
                        </div>
                    </div>

                    {/* COL 2: Main Activity Feed & Chart (Span 2) */}
                    <div className="space-y-6 md:col-span-2 lg:col-span-2">
                        {/* Trend Chart */}
                        <CognitiveTrendChart data={stats?.trends?.cognitive} />

                        {/* Recent Timeline */}
                        <RecentActivityList activities={stats?.recentActivity || []} />
                    </div>

                    {/* COL 3: Quick Actions */}
                    <div className="space-y-6 lg:col-span-1">
                        <div>
                            <h3 className="font-bold text-white/90 text-lg mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                                Start Activity
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/chat')}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-900/20 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all flex items-center justify-between group border border-indigo-400/20"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                                            <Brain className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Memory Test</p>
                                            <p className="text-xs text-indigo-200">Start Assessment</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 group-hover:text-white transition-all" />
                                </button>

                                <button
                                    onClick={() => navigate('/chat')}
                                    className="w-full bg-[#1A1B2E] text-blue-100 p-4 rounded-2xl border border-white/5 hover:bg-[#232438] hover:border-white/10 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-teal-500/10 rounded-xl">
                                            <Sparkles className="w-5 h-5 text-teal-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Chat Companion</p>
                                            <p className="text-xs text-slate-500 group-hover:text-slate-400">Casual Conversation</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Recommendation Card */}
                        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                    <Activity className="w-4 h-4 text-emerald-400" />
                                </div>
                                <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-400">Daily Tip</h4>
                            </div>
                            <p className="text-sm text-slate-300 relative z-10 leading-relaxed font-light">
                                {riskLevel === 'Low'
                                    ? "Great coherence in your last session! Try reading a short article today to boost recall."
                                    : "We noticed some hesitation. Drink water and try a quick breathing exercise before your next chat."}
                            </p>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors"></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
