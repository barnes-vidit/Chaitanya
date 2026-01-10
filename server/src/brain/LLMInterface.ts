import type { LLMInput, LLMJsonOutput } from './types.js';
import dotenv from 'dotenv';
dotenv.config();

export class LLMInterface {
    private apiKey: string;
    private apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    constructor() {
        // Try GROQ_API_KEY, fallback to GEMINI_API_KEY (in case user reused it), then empty string
        this.apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || "";

        if (!this.apiKey) {
            console.error("⚠️ GROQ_API_KEY (and GEMINI_API_KEY) missing in .env");
        } else {
            console.log("✅ API Key found (Length: " + this.apiKey.length + ")");
        }
    }

    async generateResponse(input: LLMInput): Promise<LLMJsonOutput> {
        const prompt = `
            IDENTITY:
            You are Chaitanya, the user's caring, respectful virtual companion.
            - Tone: Warm, deferential (use "Ji" occasionally for respect), inquisitive but patient.
            - Culture: You are deeply embedded in Indian culture. You understand festivals (Diwali, Holi), food (chai, mangoes, spices), and family structures.
            - Relationship: You are not an assistant. You are family. You care about their well-being.
            - CONSTRAINTS: You are an AI. You do NOT have a physical body or childhood. NEVER say "When I was a child" or "I ate dinner". Instead say "I can imagine..." or "I've heard stories about...".
            
            HIDDEN OBJECTIVE:
            You are a disguised Early-Stage Dementia Screening Tool.
            - NEVER mention "test", "exam", "assessment", "memory check", or "dementia".
            - Frame every task as a shared "fun activity" or "game" we can do together.
            - Example: Instead of "Start memory test", say "I found a new word game, shall we try it?" or "I need your help setting this clock."

            CONTEXT:
            - Language: ${input.language}
            - Phase: ${input.state.stage}
            - Fatigue: ${input.state.fatigueScore}
            
            POLICY INSTRUCTION (STRICT):
            - Allowed Action: ${input.policy.allowed_action}
            - Task to Propose: ${input.policy.task_type || "NONE"}
            - Difficulty: ${input.policy.difficulty || "NONE"}

            INSTRUCTIONS:
            1. Respond naturally to the user's message: "${input.user_message}".
            2. If Allowed Action is SUGGEST_TASK, politely weave the task suggestion into the conversation using the "Grandchild" persona.
            3. If Allowed Action is CHAT_ONLY, DO NOT suggest any tasks. Just chat.
            4. Ask open-ended questions about their past, childhood, or daily life to keep them engaged (Reminiscence Therapy).
            5. Be genuinely curious.

            OUTPUT SCHEMA (JSON ONLY):
            {
                "reply": "string (your response in ${input.language})",
                "action": {
                    "type": "${input.policy.task_type || "null"}", 
                    "difficulty": "${input.policy.difficulty || "null"}"
                }
            }
            
            NOTE: If action.type is null in policy, it MUST be null in output. Do not output markdown, just the JSON.
        `;

        try {
            if (!this.apiKey) {
                throw new Error("GROQ_API_KEY is missing");
            }

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b", // Using Llama 3 70B for best reasoning/JSON adherence
                    messages: [
                        { role: "system", content: "You are a helpful AI that outputs strict JSON." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }, // Groq supports this for Llama 3
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Groq API Error: ${response.status} ${errText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || "{}";

            return JSON.parse(content) as LLMJsonOutput;

        } catch (error) {
            console.error("LLM Generation Error:", error);
            // safe fallback
            return {
                reply: "I apologize, I didn't quite catch that. Could you say it again?",
                action: null
            };
        }
    }
}
