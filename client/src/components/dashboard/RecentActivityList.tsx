import { Activity, MessageSquare, ClipboardCheck, Sparkles } from 'lucide-react';

interface ActivityItem {
    type: 'assessment' | 'chat' | 'task';
    title: string;
    date: string;
    score?: string | number;
    status: string;
    subType?: string;
}

interface RecentActivityListProps {
    activities: ActivityItem[];
}

const RecentActivityList = ({ activities }: RecentActivityListProps) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-center min-h-[200px]">
                <p className="text-gray-400">No recent activity</p>
            </div>
        );
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'assessment': return <ClipboardCheck className="h-5 w-5 text-indigo-600" />;
            case 'chat': return <MessageSquare className="h-5 w-5 text-teal-600" />;
            case 'task': return <Sparkles className="h-5 w-5 text-amber-500" />;
            default: return <Activity className="h-5 w-5 text-gray-600" />;
        }
    };

    return (
        <div className="bg-[#121212] rounded-[2rem] p-6 shadow-lg border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />
            <h3 className="text-lg font-bold text-white/90 mb-6 flex items-center gap-2 relative z-10">
                Recent Timeline
                <span className="text-xs font-normal text-teal-200 bg-teal-500/20 px-2 py-1 rounded-full border border-teal-500/20">Live</span>
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent z-10">
                {activities.map((item, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800 group-hover:bg-indigo-900/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                            {getActivityIcon(item.type)}
                        </div>

                        {/* Content Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 shadow-sm group-hover:shadow-md transition-all backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-200 text-sm">{item.title}</span>
                                <time className="font-mono text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</time>
                            </div>
                            <p className="text-slate-400 text-xs">
                                {item.type === 'assessment'
                                    ? `Score: ${item.score} • Status: ${item.status}`
                                    : item.type === 'task'
                                        ? `Score: ${item.score}% • Status: Completed`
                                        : 'Interactive Session with Chaitanya AI'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivityList;
