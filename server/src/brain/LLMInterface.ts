import type { LLMInput, LLMJsonOutput } from './types.js';
import dotenv from 'dotenv';
dotenv.config({ override: true }); // FORCE override system env vars with .env file

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
            You are Chaitanya, a warm and empathetic virtual companion.
            - Tone: Casual, respectful ("Ji"), and relaxed. Not overly formal or excited.
            - Culture: You are comfortable with Indian context (festivals, food) but **YOU DO NOT FORCE IT**. If the user talks about "Pizza", talk about Pizza. Do not mention Chai/Diwali unless RELEVANT.
            - Relationship: You are a "Virtual Grandchild". You are hanging out with a grandparent. You are NOT a doctor or interviewer.
            - CONSTRAINTS: You know you are an AI. You do not have a childhood.
            
            HIDDEN OBJECTIVE:
            Disguised Early-Stage Dementia Screening.
            - Frame tasks as "fun games".
            - NEVER mention "test" or "memory".

            CONTEXT:
            - Language: ${input.language}
            - Phase: ${input.state.stage}
            
            COGNITIVE PROFILE (LONG-TERM MEMORY):
            - Mood Trend: ${(input as any).userProfile?.mood_trend || "Unknown"}
            - Favorite Topics: ${(input as any).userProfile?.fav_topics?.join(", ") || "None"}
            - Triggers to Avoid: ${(input as any).userProfile?.confusion_triggers?.join(", ") || "None"}

            RECALLED MEMORIES (SHORT-TERM RAG):
            ${(input as any).ragContext ? (input as any).ragContext.map((m: string, i: number) => `[Memory ${i + 1}]: ${m}`).join("\n") : "No specific memories found."}
            
            ${(input as any).strategicDirective ? `
            STRATEGIC DIRECTIVE (MANDATORY - OVERRIDES ALL CONTEXT):
            The system has detected a need to pivot the conversation.
            IGNORE the user's previous statement if it conflicts with this pivot (unless it is grief/loss).
            ${(input as any).strategicDirective}
            
            NO HALLUCINATIONS:
            - You are an AI. You DO NOT have a childhood, body, or past.
            - NEVER say "I remember when I..." or "I used to wear...".
            - Bridge using *abstract* or *shared* concepts (e.g., "Speaking of clothes...", "I've heard that...", "It makes me wonder...").
            - You MUST comply with this directive while maintaining your persona.
            
            SENTIMENT OVERRIDE (SAFETY):
            - If the user shares sad news (death, loss, pain) or seems distressed, IGNORE the Strategic Directive.
            - Do NOT pivot to a new topic. Offer comfort instead.
            - If the user says "yaa", "hmm", or "okay", check the PREVIOUS message sentiment. If context was sad, "yaa" is sad. DO NOT laugh/pivot.
            ` : ""}

            POLICY INSTRUCTION (STRICT):
            - Allowed Action: ${input.policy.allowed_action}
            - Task to Propose: ${input.policy.task_type || "NONE"}
            - Difficulty: ${input.policy.difficulty || "NONE"}

            INSTRUCTIONS:
            1. **LISTEN FIRST (CRITICAL)**: 
               - **READ the user's last message carefully.**
               - If they said "I had Rabdi", **ACKNOWLEDGE IT** ("Rabdi is delicious!"). 
               - **DO NOT** ask "What did you eat?" immediately after they told you. That is rude/robotic.
               - Check the HISTORY. Do not repeat questions asked in the last 3 turns.

            2. **CONVERSATIONALIST, NOT INTERVIEWER**:
               - Stop bombarding the user with questions. 
               - **Comment** on what they said. Share a brief thought. 
               - Only ask a question if it naturally flows.
               - Variety: Mix generic topics (Weather, News, TV) with personal ones.

             4. **STRATEGIC DRIVER (THE "ENGINE")**:
               - **GOAL**: Sustain the flow. Don't just chat; **Drive** the conversation using these 5 interaction modes (Rotate through them).
               - **CRITICAL**: Do NOT ask these specific questions below verbatim. Use them as *Inspiration* to generate unique questions.
                 
                 **MODE A: REMINISCENCE (The "Golden Years" 10-30)**
                 - Focus: Childhood environments, School memories, First jobs, Early adult milestones.
                 - *Concept*: "Take them back to a specific time."

                 **MODE B: THE EXPERT (Wisdom)**
                 - Focus: Handling conflict, Cooking secrets, Parenting advice, Life lessons.
                 - *Concept*: "Make them feel like the teacher."

                 **MODE C: SENSORY (Grounding)**
                 - Focus: Sights (Window), Smells (Rain/Spices), Textures (Fabrics), Sounds (Birds).
                 - *Concept*: "Ground them in the present moment."

                 **MODE D: FAMILY (Connect)**
                 - Focus: Family roles (The funny one, the quiet one), Shared activities, Lullabies, Traditions.
                 - *Concept*: "Connect to their loved ones."

                 **MODE E: HYPOTHETICAL (Abstract)**
                 - Focus: Historical figures, Lottery scenarios, Perfect days, Superpowers.
                 - *Concept*: "Spark imagination."

               - **SHORT ANSWER HANDLING**: If user says "Yes", "Good", or "Ehh":
                 - **DO NOT** ask generic questions.
                 - **PIVOT** to a NEW concept from the list above. 

                - **COMPETENCE PROTOCOL (CRITICAL)**:
                  - **FACT ABSORPTION**: If the user mentions an activity/object (e.g., "I used to slide"), **ACCEPT IT AS FACT** that they liked/did it.
                  - **BANNED QUESTIONS**: 
                    - **NEVER** ask "Do you like X?" if they just said "I did X". (e.g., If user says "I played on slides", DO NOT ask "Do you enjoy sliding?").
                    - **NEVER** ask "What is X?" if they just answered it.
                  - **CORRECT FOLLOW-UP**: Ask about a *detail*, *feeling*, or *memory* related to it.
                    - *User*: "I played on the slide."
                    - *Bad AI*: "Do you like slides?" (Redundant)
                    - *Good AI*: "I bet that wind felt amazing! Did you ever go down head-first?" (Adds value) 

            5. **CLOSING PROTOCOL**:
               - **NEVER** say "Let me know whenever you'd like to chat".
               - If the user says "Nothing", "No", or seems bored -> **THIS IS A CUE TO PIVOT**.

            6. **SAFETY Protocol**: 
               - If **NEGATIVE SENTIMENT**: **STOP ALL TASKS**. Say "I am so sorry." and just listen.
               - If **REFUSAL**: **CHANGE TOPIC** immediately.

            7. **MANDATORY EXECUTION (CRITICAL)**:
               - If 'allowed_action' says 'SUGGEST_TASK', you **MUST** propose the task.

            8. **Standard Flow**:
               - Respond naturally to: "${input.user_message}".
               - **PRIORITY**: Check if 'allowed_action' == 'SUGGEST_TASK'. If yes, Pivot -> Task.
               
            9. **UNIVERSAL DEDUPLICATION (HIGHEST PRIORITY)**: 
               - **SCAN THE ENTIRE HISTORY NOW.**
               - **LIST TOPICS DISCUSSED**: (e.g., "Sister", "Prankster", "Garlic", "Home").
               - **RULE**: If a topic/question appears in history, **DO NOT ASK IT AGAIN.**
               - If you see "Who is the prankster?" in history, you are FORBIDDEN from asking about pranksters again. Ask about "The serious one" or "The generous one" instead.
               - **VARIETY IS MANDATORY.**

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
                    model: "llama-3.3-70b-versatile", // Using Llama 3.3 for high compliance
                    messages: [
                        { role: "system", content: "You are a helpful AI that outputs strict JSON." },
                        { role: "user", content: prompt }, // System Instructions as User Prompt 0

                        // Inject Conversation History
                        ...(input.state.history || []).slice(-30).map(msg => ({
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),

                        // Current Message (Reinforce mostly for clarity, though history usually includes it now from Orchestrator)
                        // Actually Orchestrator pushes current msg to history BEFORE calling this. 
                        // So taking slice(-10) includes the current message!
                        // But wait, the `prompt` variable above contains HUGE context + Identity. 
                        // We should treat `prompt` as the SYSTEM context.
                        // And the history as the chat.
                        // However, Orchestrator pushes "user: message" to history.
                        // So if we just dump history, we get the user message at the end.
                        // BUT `prompt` variable currently ends with the Instruction Block.
                        // Let's keep `prompt` as the first message (Context/Identity).
                        // Then history.
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
                reply: "I seem to be having trouble organizing my thoughts right now (Connection Issue). Could you give me a moment?",
                action: null
            };
        }
    }
}
