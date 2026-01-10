
import dotenv from 'dotenv';
import { LLMInterface } from './brain/LLMInterface.js';
import type { LLMInput } from './brain/types.js';

dotenv.config();

const runTest = async () => {
    console.log("🚀 Testing Groq Integration...");

    try {
        const llm = new LLMInterface();

        // Mock input
        const input: LLMInput = {
            user_message: "Hello, I'm feeling a bit tired today.",
            language: "English",
            state: {
                sessionId: "test-session",
                userId: "test-user",
                conversationPhase: "free_chat",
                fatigueScore: 0.8, // High fatigue -> Policy should block tasks
                engagementScore: 0.5,
                tasksDoneToday: 0,
                lastTaskType: null,
                lastTaskTimestamp: null
            },
            policy: {
                allowed_action: "CHAT_ONLY",
                task_type: null,
                difficulty: null
            },
            tone: "supportive"
        };

        console.log("📤 Sending prompt to Groq (Llama 3 70B)...");
        const response = await llm.generateResponse(input);

        console.log("\n✅ Response Received:");
        console.log(JSON.stringify(response, null, 2));

        if (response.reply) {
            console.log("\n🎉 SUCCESS: Groq API is working!");
        } else {
            console.log("\n⚠️ WARNING: Response format looks empty.");
        }

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error);
    }
};

runTest();
