import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProfileManager } from './ProfileManager.js';

interface Question {
    id: string;
    category: string;
    text: string;
    tags: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class QuestionManager {
    private questions: Question[] = [];
    private profileManager: ProfileManager;

    constructor() {
        this.profileManager = new ProfileManager();
        this.loadQuestions();
    }

    private loadQuestions() {
        try {
            // Path adjusted: server/src/brain/QuestionManager.ts -> server/src/data/questionBank.json
            const questionsPath = path.join(__dirname, '..', 'data', 'questionBank.json');
            const data = fs.readFileSync(questionsPath, 'utf-8');
            this.questions = JSON.parse(data);
            console.log(`✅ Loaded ${this.questions.length} questions from bank.`);
        } catch (err) {
            console.error("❌ Failed to load questionBank.json:", err);
            this.questions = [];
        }
    }

    async getStrategicQuestion(userId: string): Promise<Question | null> {
        const profile: any = await this.profileManager.getProfile(userId);
        if (!profile) return null;

        const discussedIds = new Set(profile.discussed_question_ids || []);
        const lastCategory = profile.last_question_category || "";

        // Filter: Not discussed yet
        let available = this.questions.filter(q => !discussedIds.has(q.id));

        // Smart Select: Avoid same category twice in a row (if possible)
        const varied = available.filter(q => q.category !== lastCategory);

        // If we have varied options, use them. Otherwise fallback to available.
        if (varied.length > 0) {
            available = varied;
        }

        // RECYCLING PROTOCOL: If user has discussed ALL questions, reset/recycle.
        if (available.length === 0) {
            console.log("♻️ Questions Exhausted! Recycling entire bank.");
            available = this.questions.filter(q => q.category !== lastCategory); // Try to at least vary category
            if (available.length === 0) available = this.questions; // Absolute fallback
        }

        // Random Pick
        const selected = available[Math.floor(Math.random() * available.length)];
        return selected;
    }

    async markQuestionAsDiscussed(userId: string, question: Question) {
        await this.profileManager.updateProfile(userId, {
            $push: { discussed_question_ids: question.id },
            last_question_category: question.category,
            last_injection_timestamp: new Date()
        });
        console.log(`✅ Injected Question: [${question.category}] ${question.id}`);
    }
}
