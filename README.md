# Chaitanya - AI Companion for Early Detection of Dementia

**Chaitanya** is an advanced, empathetic AI designed to provide companionship and cognitive stimulation for the elderly. Built with a caring and patient persona, it helps users reminisce, stay engaged, and perform subtle cognitive exercises disguised as fun activities.

Live Link : https://chaitanya-kv.vercel.app/

## 🌟 Key Features

### 1. 🧠 Proactive Cognitive Engagement
Unlike standard chatbots, Chaitanya **proactively** leads the conversation.
- **RAG Memory**: Remembers past conversations, family details, and favorite topics to build deep rapport.
- **Strategic Pivots**: Detects when a conversation is stalling and smoothly transitions to engaging topics (Nostalgia, Advice, Family).

### 2. 🎮 Cognitive Health Assessments (Hidden)
Chaitanya seamlessly weaves standardized neurological assessments into natural conversation:
- **The Clock Drawing Test**: "Can you help me draw a clock?" (Visuospatial / Executive Function)
- **Word Spark (Memory Recall)**: "I found this word game..." (Short-term Memory)
- **Reaction Challenge**: "Let's test our reflexes!" (Attention/Processing Speed)

### 3. ❤️ Empathetic & Culturally Aware
- **Persona**: Warm, respectful, and patient (using "Ji" and cultural nuances).
- **Safety First**: Detects distress or sadness and overrides "Strategic" goals to offer pure comfort.

## 🛠️ Tech Stack

**Frontend**:
- React + Vite (TypeScript)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Lucide React (Icons)

**Backend**:
- Node.js + Express
- MongoDB (User State & Chat Logs)
- **Groq API** (Llama 3.3 70B - The Brain)
- **Pinecone** (Vector Database for Long-term Memory)
- **Google Gemini** (Embeddings)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- API Keys for: Groq, Pinecone, Google Gemini.

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/chaitanya-ai.git
    cd chaitanya-ai
    ```

2.  **Backend Setup**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in `/server`:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    GROQ_API_KEY=your_groq_api_key
    GEMINI_API_KEY=your_gemini_api_key
    PINECONE_API_KEY=your_pinecone_api_key
    CLIENT_URL=http://localhost:5173
    ```
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd client
    npm install
    ```
    Create a `.env` file in `/client` (if needed for Clerk/Auth, otherwise optional).
    
    Start the client:
    ```bash
    npm run dev
    ```

## Developers
Kritika Rathore
Vidit Sharma

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
