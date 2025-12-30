
import { TrendingUp, Activity, Users, Calendar, ArrowUpRight } from 'lucide-react';

const DashboardPage = () => {
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Patient Insights</h1>
                    <p className="text-gray-600">Tracking cognitive trends and risk progression.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Risk Score"
                        value="Low"
                        trend="+2%"
                        icon={<Activity className="text-green-600" />}
                    />
                    <StatCard
                        title="Engagement"
                        value="85%"
                        trend="+5%"
                        icon={<TrendingUp className="text-indigo-600" />}
                    />
                    <StatCard
                        title="Last Assessment"
                        value="2 days ago"
                        icon={<Calendar className="text-purple-600" />}
                    />
                    <StatCard
                        title="Caregiver Sync"
                        value="Active"
                        icon={<Users className="text-blue-600" />}
                    />
                </div>

                {/* Charts/Content Area Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Cognitive Trend</h3>
                            <a
                                href="/assessment"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Start New Assessment
                            </a>
                        </div>
                        <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <TrendingUp className="h-12 w-12 text-gray-300 mb-2" />
                            <span className="block w-full text-center">Trend Visualization Coming Soon</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h3>
                        <div className="space-y-6">
                            <ActivityItem title="Memory Game: Card Matching" time="Today, 10:30 AM" score="90/100" />
                            <ActivityItem title="Speech Analysis: Family Talk" time="Yesterday, 4:15 PM" score="Normal" />
                            <ActivityItem title="Clock Drawing Task" time="Dec 24, 2025" score="8/10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, trend, icon }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
            {trend && (
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {trend} <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
            )}
        </div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
);

const ActivityItem = ({ title, time, score }: any) => (
    <div className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
        <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{time}</p>
        </div>
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
            {score}
        </span>
    </div>
);

export default DashboardPage;
