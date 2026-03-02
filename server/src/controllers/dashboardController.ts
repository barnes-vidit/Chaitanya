import type { Response } from 'express';
import { Assessment } from '../models/Assessment.js';
import { Chat } from '../models/Chat.js';
import { SessionState } from '../models/SessionState.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // 1. Fetch Core Data
        const [assessments, chats, sessionStates] = await Promise.all([
            Assessment.find({ patientId: userId, type: { $nin: ['MMSE', 'GDS'] } }).sort({ createdAt: -1 }).limit(20),
            Chat.find({ participants: userId }).sort({ lastMessageAt: -1 }).limit(10),
            SessionState.find({ userId }).sort({ updatedAt: -1 }) // Get all sessions to aggregate tasks
        ]);

        // 2. Aggregate Task Results (from Sessions)
        let allTaskResults: any[] = [];
        sessionStates.forEach((session: any) => {
            if (session.taskResults && session.taskResults.length > 0) {
                allTaskResults = [...allTaskResults, ...session.taskResults];
            }
        });

        // 3. Calculate Cognitive Profile (0-100 scale)
        // Simple heuristic mapping
        const profile = {
            memory: 0,
            attention: 0,
            language: 0
        };
        let counts = { memory: 0, attention: 0, language: 0 };

        // Process Assessments (Heavy weight)
        assessments.forEach((a: any) => {
            const scorePct = (a.totalScore / (a.maxScore || 30)) * 100;
            // Assessment covers all, but let's attribute it to Memory & Language primarily
            profile.memory += scorePct; counts.memory++;
            profile.language += scorePct; counts.language++;
            profile.attention += scorePct; counts.attention++;
        });

        // Process Micro-Tasks (Word Spark=Language/Memory, Attention=Attention)
        allTaskResults.forEach((t: any) => {
            // Task scores are raw, need normalization based on task type
            // Assuming task scores are somewhat normalized or we know max
            // For now, treat 'score' as % or raw 0-1 range.
            // Adjust logic based on actual data shape. 
            // Orchestrator sends raw numbers.
            let normalizedScore = 0;

            // Normalize task type (handle 'Word Spark', 'MEMORY_RECALL', etc.)
            const type = t.taskType ? t.taskType.toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN';
            let rawScore = Number(t.score); // Force number cast
            if (isNaN(rawScore)) rawScore = 0;

            console.log(`Processing Task: ${type}, Score: ${rawScore} (${t.score})`);

            // Match generic types
            if (type === 'MEMORY_RECALL' || type === 'WORD_SPARK') {
                normalizedScore = rawScore; // Assuming 0-100
                profile.memory += normalizedScore; counts.memory++;
                profile.language += normalizedScore; counts.language++;
            } else if (type === 'ATTENTION' || type === 'REACTION_CHALLENGE') {
                // Attention might be integer streak. Cap at 10 for 100%?
                normalizedScore = Math.min((rawScore / 10) * 100, 100);
                profile.attention += normalizedScore; counts.attention++;
            } else if (type === 'CLOCK_DRAWING') {
                normalizedScore = rawScore * 100; // 0.0-1.0
                profile.attention += normalizedScore; counts.attention++;
                profile.memory += normalizedScore; counts.memory++;
            }
        });

        const finalProfile = {
            memory: counts.memory ? Math.round(profile.memory / counts.memory) : 0,
            attention: counts.attention ? Math.round(profile.attention / counts.attention) : 0,
            language: counts.language ? Math.round(profile.language / counts.language) : 0
        };

        // 4. Calculate Risk Score
        // Weighted average of profile
        const avgProfileScore = (finalProfile.memory + finalProfile.attention + finalProfile.language) / 3;
        let riskLabel = 'Low';
        if (avgProfileScore > 0 && avgProfileScore < 50) riskLabel = 'High';
        else if (avgProfileScore >= 50 && avgProfileScore < 75) riskLabel = 'Moderate';

        // 5. Recent Activity Merge
        const tasksFormatted = allTaskResults.map((t: any) => ({
            type: 'task',
            subType: t.taskType,
            title: t.taskType === 'MEMORY_RECALL' ? 'Word Spark' : t.taskType,
            date: t.timestamp,
            score: typeof t.score === 'number' ? Math.round(t.score) : t.score,
            status: 'completed'
        }));

        const assessmentsFormatted = assessments.map((a: any) => ({
            type: 'assessment',
            title: `${a.type} Assessment`,
            date: a.createdAt,
            score: `${a.totalScore}/${a.maxScore}`,
            status: a.status
        }));

        const chatsFormatted = chats.map((c: any) => ({
            type: 'chat',
            title: c.title || 'Chat Session',
            date: c.lastMessageAt,
            status: 'active'
        }));

        const recentActivity = [...tasksFormatted, ...assessmentsFormatted, ...chatsFormatted]
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7); // Show top 7

        res.json({
            stats: {
                riskScore: riskLabel,
                totalAssessments: assessments.length + allTaskResults.length,
                avgScore: Math.round(avgProfileScore * 10) / 10,
                profile: finalProfile
            },
            trends: {
                cognitive: assessments.map((a: any) => ({
                    date: new Date(a.createdAt).toLocaleDateString(),
                    score: a.totalScore,
                    maxScore: a.maxScore
                })).reverse()
            },
            recentActivity
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
