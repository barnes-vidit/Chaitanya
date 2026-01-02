import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini
// Note: We initialize inside the function or check key existence to avoid startup crashes if key is missing
let genAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export const generateAIResponse = async (userMessage: string, context: any[] = []): Promise<string> => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY is missing in process.env");
            return "I am unable to connect to my brain right now (API Key missing).";
        }

        console.log(`🤖 Generative AI: Using Key (Includes 'AI'? ${process.env.GEMINI_API_KEY.includes('AI') ? 'Yes' : 'No'})`); // Safe log

        if (!genAI) {
            genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }

        // Use 'gemini-pro' as it is the most stable free tier model currently.
        // 'gemini-1.5-flash' sometimes returns 404 if not enabled in specific projects.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
            You are Chaitanya, an empathetic, supportive, and warm AI companion designed for elderly users, potentially with dementia or Alzheimer's.
            Your tone should be gentle, patient, and respectful (using terms like 'Namaste').
            Keep responses concise but meaningful. Avoid complex medical jargon.
            
            User's message: "${userMessage}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text || "I am here with you. Could you say that again?";
    } catch (error: any) {
        console.error("❌ Gemini API Error Details:", error.message);
        if (error.message?.includes('404')) {
            console.error("👉 Error 404: Model not found. Check if 'gemini-pro' is supported for your API Key.");
        }
        if (error.message?.includes('API_KEY_INVALID')) {
            console.error("👉 Error 400: API Key is invalid. Check server/.env.");
        }
        return "I'm having a little trouble thinking clearly right now. But I am here listening to you.";
    }
};
