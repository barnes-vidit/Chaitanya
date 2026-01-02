import type { Response } from 'express';
import { Assessment } from '../models/Assessment.js';
import { Chat } from '../models/Chat.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // 1. Assessment Stats
        const assessments = await Assessment.find({ patientId: userId })
            .sort({ createdAt: -1 })
            .limit(10); // Get last 10 for trends

        const totalAssessments = await Assessment.countDocuments({ patientId: userId });

        // Calculate average score
        const completedAssessments = assessments.filter((a: any) => a.status === 'completed' || a.status === 'reviewed');
        const avgScore = completedAssessments.length > 0
            ? completedAssessments.reduce((acc: number, curr: any) => acc + (curr.totalScore || 0), 0) / completedAssessments.length
            : 0;

        // 2. Chat/Activity Stats
        const chats = await Chat.find({ participants: userId })
            .sort({ lastMessageAt: -1 })
            .limit(5);

        // 3. Trends Data (for graph)
        // Format: { date: 'YYYY-MM-DD', score: number }
        const cognitiveTrend = completedAssessments
            .map((a: any) => ({
                date: new Date(a.createdAt).toLocaleDateString(),
                score: a.totalScore || 0,
                maxScore: a.maxScore || 30
            }))
            .reverse(); // Oldest to newest for graph

        // 4. Recent Activity (Combined)
        const recentActivity = [
            ...assessments.map((a: any) => ({
                type: 'assessment',
                title: `${a.type} Assessment`,
                date: a.createdAt,
                score: a.totalScore ? `${a.totalScore}/${a.maxScore}` : 'In Progress',
                status: a.status
            })),
            ...chats.map((c: any) => ({
                type: 'chat',
                title: c.title || 'Chat Session',
                date: c.lastMessageAt,
                status: 'active'
            }))
        ]
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        res.json({
            stats: {
                riskScore: 'Low', // Placeholder logic, could be complex calculation
                engagement: 'High', // Placeholder
                totalAssessments,
                avgScore: Math.round(avgScore * 10) / 10
            },
            trends: {
                cognitive: cognitiveTrend
            },
            recentActivity
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
