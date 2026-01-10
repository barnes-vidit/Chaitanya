import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import CircularProgress from '../components/dashboard/CircularProgress';
import PulseRateCard from '../components/dashboard/PulseRateCard';
import CognitiveTrendChart from '../components/dashboard/CognitiveTrendChart';
import ActionCard from '../components/dashboard/ActionCard';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import { User, Bell, AlertTriangle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

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
                const response = await fetch('http://localhost:5000/api/dashboard/stats', {
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

    // --- DATA CORRELATION LOGIC ---
    // 1. Memory Retention (Circular Progress)
    // Correlates with average assessment score. 
    // If no assessments, default to 0 to encourage taking one.
    const hasAssessments = stats?.stats?.totalAssessments > 0;
    const avgScore = stats?.stats?.avgScore || 0;
    const memoryPercentage = hasAssessments ? Math.round((avgScore / 30) * 100) : 0;

    // 2. Risk Calculation based on Assessment Scores
    // MMSE Scoring: <24 is abnormal/risk.
    let riskLevel = "Low";
    if (hasAssessments) {
        if (avgScore < 10) riskLevel = "Severe";
        else if (avgScore < 20) riskLevel = "Moderate";
        else if (avgScore < 25) riskLevel = "Mild";
    }

    // 3. Pulse Rate (Placeholder -> Future: Wearable Integration)
    const pulseRate = 72;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F0F4F8]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F4F8] p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Hello, {user?.firstName || 'User'}!</h1>
                        <p className="text-slate-500">
                            Risk Status: <span className={`font-bold ${riskLevel === 'Low' ? 'text-teal-600' : 'text-red-500'}`}>{riskLevel}</span>
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow relative">
                            <Bell className="h-6 w-6 text-slate-600" />
                            {riskLevel !== 'Low' && <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>}
                        </button>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm">
                            <span className="text-sm font-medium text-slate-700">{user?.fullName}</span>
                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                <User className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Key Vitals */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Memory Retention Card (Real Data) */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-white/50 flex flex-col items-center justify-center relative overflow-hidden"
                        >
                            <h3 className="text-lg font-semibold text-slate-700 mb-6 w-full text-center">Memory Retention</h3>
                            <CircularProgress
                                value={memoryPercentage}
                                label={hasAssessments ? "Score" : "No Data"}
                                subLabel={hasAssessments ? "Based on MMSE" : "Take a Test"}
                                size={220}
                                color={memoryPercentage > 70 ? "#2DD4BF" : memoryPercentage > 40 ? "#FACC15" : "#F87171"} // Color coding based on risk
                            />
                            {/* Background Decorations */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 z-0 ${memoryPercentage > 70 ? 'bg-teal-50' : 'bg-red-50'}`}></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 rounded-full -ml-12 -mb-12 z-0"></div>
                        </motion.div>

                        {/* Pulse Rate Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <PulseRateCard bpm={pulseRate} />
                        </motion.div>

                        {/* Risk Indicator Card */}
                        <div className={`rounded-3xl p-6 text-white shadow-lg ${riskLevel === 'Low' ? 'bg-teal-500' : 'bg-red-500'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="h-6 w-6" />
                                <h3 className="font-bold text-lg">Health Status</h3>
                            </div>
                            <p className="opacity-90">
                                {riskLevel === 'Low'
                                    ? "Your cognitive health is stable. Keep it up!"
                                    : "Declining trends detected. Consult a doctor."}
                            </p>
                        </div>
                    </div>

                    {/* Middle Column - Charts & Activity */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Real Trend Chart */}
                        <CognitiveTrendChart data={stats?.trends?.cognitive} />

                        {/* Real Recent Activity */}
                        <RecentActivityList activities={stats?.recentActivity || []} />
                    </div>

                    {/* Right Column - Actions */}
                    <div className="lg:col-span-3 space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Actions</h3>

                        <ActionCard
                            title="Memory Test"
                            subtitle="Start a new standardized assessment."
                            onClick={() => navigate('/assessment')}
                        />

                        <ActionCard
                            title="Chat with AI"
                            subtitle="Start a new conversation session."
                            onClick={() => navigate('/chat')}
                        />

                        <div className="bg-[#1E293B] rounded-3xl p-6 text-white relative overflow-hidden">
                            <h4 className="font-bold mb-2 relative z-10">Caregiver Tips</h4>
                            <p className="text-sm text-slate-400 relative z-10">
                                {riskLevel === 'Low'
                                    ? "Routine is key. Try to keep a consistent schedule."
                                    : "Monitor sleep patterns and daily water intake closely."}
                            </p>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
                        </div>

                        {/* Stats Summary */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h4 className="font-bold text-slate-700 mb-4">Summary</h4>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-500 text-sm">Total Tests</span>
                                <span className="font-bold text-slate-800">{stats?.stats?.totalAssessments || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Avg Score</span>
                                <span className="font-bold text-slate-800">{avgScore.toFixed(1)}/30</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
