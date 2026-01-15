import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export class VectorMemory {
    private pinecone: Pinecone | null = null;
    private index: any = null;
    private genAI: GoogleGenerativeAI;
    private isReady = false;

    constructor() {
        const pineconeKey = process.env.PINECONE_API_KEY;
        const indexName = process.env.PINECONE_INDEX_NAME || 'chaitanya-memory';
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY; // Using Gemini for Embeddings

        if (pineconeKey && geminiKey) {
            try {
                this.pinecone = new Pinecone({ apiKey: pineconeKey });
                this.index = this.pinecone.index(indexName);
                this.genAI = new GoogleGenerativeAI(geminiKey);
                this.isReady = true;

                // Async Index Verification/Creation (Non-blocking but helpful)
                this.ensureIndex(indexName).then(ready => {
                    if (ready) console.log("✅ VectorMemory Check: Index is ready.");
                });

            } catch (err) {
                console.error("❌ Failed to init VectorMemory:", err);
            }
        } else {
            console.warn("⚠️ VectorMemory disabled: Missing PINECONE_API_KEY or GEMINI_API_KEY.");
        }
    }

    private async ensureIndex(indexName: string): Promise<boolean> {
        if (!this.pinecone) return false;
        try {
            console.log(`Checking Pinecone Index '${indexName}'...`);
            const list = await this.pinecone.listIndexes();
            const exists = list.indexes?.some(i => i.name === indexName);
            if (!exists) {
                console.warn(`⚠️ Pinecone Index '${indexName}' NOT FOUND. Auto-creating (Dimension: 768, Metric: Cosine)...`);
                await this.pinecone.createIndex({
                    name: indexName,
                    dimension: 768, // Matches text-embedding-004
                    metric: 'cosine',
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: 'us-east-1'
                        }
                    }
                });
                console.log(`✅ Pinecone Index '${indexName}' Creation Initiated. Waiting 5s...`);
                await new Promise(r => setTimeout(r, 5000));
            } else {
                console.log(`✅ Pinecone Index '${indexName}' exists.`);
            }
            return true;
        } catch (err) {
            console.error("⚠️ Failed to ensure Pinecone Index (Is your API Key valid?):", err);
            return false;
        }
    }

    private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T | null> {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error: any) {
                const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.toString().includes('Quota exceeded');

                if (isRateLimit && i < retries - 1) {
                    console.warn(`⚠️ Embedding Rate Limit (Attempts ${i + 1}/${retries}). Retrying in ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    console.error("Embedding Error (VectorMemory):", error.message || error);
                    return null;
                }
            }
        }
        return null;
    }

    async generateEmbedding(text: string): Promise<number[] | null> {
        if (!this.isReady) return null;

        return this.retryWithBackoff(async () => {
            // Using modern 'text-embedding-004'
            const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
            const result = await model.embedContent(text);
            const embedding = result.embedding;
            return embedding.values;
        });
    }

    async storeTurn(userId: string, userMessage: string, aiReply: string) {
        if (!this.isReady) return;

        try {
            const textToEmbed = `User: ${userMessage}\nAI: ${aiReply}`;
            const vector = await this.generateEmbedding(textToEmbed);

            if (vector) {
                const id = `${userId}-${Date.now()}`;

                // Safe Upsert
                await this.index.upsert([{
                    id: id,
                    values: vector,
                    metadata: {
                        userId,
                        text: textToEmbed,
                        timestamp: new Date().toISOString()
                    }
                }]);
                console.log("💾 Memory Stored in Pinecone.");
            }
        } catch (err) {
            // CATCH 404 or Other Pinecone Errors to prevent crash
            console.error("❌ Memory Storage Failed (Non-Fatal):", (err as any).message || err);
        }
    }

    async retrieveContext(userId: string, currentMessage: string): Promise<string[]> {
        if (!this.isReady) return [];

        try {
            const vector = await this.generateEmbedding(currentMessage);
            if (!vector) return [];

            const queryResponse = await this.index.query({
                vector: vector,
                topK: 3,
                filter: { userId: userId },
                includeMetadata: true
            });

            return queryResponse.matches.map((match: any) => match.metadata.text);
        } catch (error) {
            console.warn("⚠️ Context Retrieval Failed (Non-fatal, memory disabled this turn):", (error as any).message);
            return [];
        }
    }
}
