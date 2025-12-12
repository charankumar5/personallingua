# PersonalLingua 🌍🗣️

**PersonalLingua** is a privacy-first, voice-enabled AI language tutor that runs locally on your machine using Docker. It leverages Google's latest **Gemini** models to help you practice English or German through natural conversation.

## 🚀 Key Features

- **🗣️ Voice-First Interaction**: Practice speaking and listening with real-time speech-to-text (Web Speech API) and text-to-speech.
- **🔄 Unlimited Access Strategy**: Instantly switch between **6+ Gemini Models** (Flash, Lite, Pro, Thinking) to bypass rate limits. If one model is busy, simply select another to continue chatting uninterrupted.
- **🧠 Smart Corrections**: The AI gently corrects your grammar and provides translations for difficult concepts automatically.
- **🔒 Privacy-Focused**: Your chat history is stored locally on your machine (`data/chat_history.json`), ensuring you own your data.
- **🐳 Dockerized**: One-command setup for the full stack (Frontend + Backend).

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Lucide Icons.
- **Backend**: Node.js, Express.
- **AI Engine**: Google Gemini API (`@google/genai` SDK).
- **Infrastructure**: Docker & Docker Compose.

## 📋 Prerequisites

1.  **Docker Desktop** installed and running.
2.  A **Google Gemini API Key** (Get it for free at [aistudio.google.com](https://aistudio.google.com/)).

## 🏁 Quick Start

### 1. Setup Environment
Create a file named `.env` in the root directory of the project and add your API key or export like below:

```env
export API_KEY=your_actual_api_key_here
```

### 2. Run with Docker
Start the application using Docker Compose:

```bash
   bash start.sh
```

### 3. Start Learning
Open your browser and navigate to:
👉 **http://localhost:5173**

## 🎮 How to Use

1.  **Choose Your Language**: Toggle between **English** and **Deutsch** using the buttons in the input area.
2.  **Speak or Type**: Click the **Microphone** icon to speak, or type your message.
3.  **Receive Feedback**: The AI will respond with:
    - Natural conversation.
    - `[CORRECTION]` if you made a mistake.
    - `[TRANSLATION]` to help you understand the response.
4.  **Bypass Limits**: If you encounter a "Rate Limit" or "Quota Exceeded" error, use the **Model Selector** in the top header to switch models (e.g., from *Gemini 2.5 Flash* to *Gemini Flash Lite*).

## 🤖 Available AI Models

The app supports switching between these models to manage quotas:

*   **Gemini 2.5 Flash**: The balanced standard for speed and intelligence.
*   **Gemini Flash Lite**: Extremely fast and lightweight (lowest latency).
*   **Gemini 2.0 Pro Exp**: High intelligence, best for complex grammar explanations.
*   **Gemini 2.0 Flash Thinking**: Uses "Chain of Thought" reasoning for deeper context.
*   **Gemini 3.0 Pro Preview**: The latest next-generation experimental model.

## ⚠️ Troubleshooting

-   **Microphone not working**: Ensure your browser has permission to access the microphone. Note that on some browsers (like Chrome), microphone access works best on `localhost` or via `HTTPS`.
-   **Backend Disconnected**: Check your Docker logs (`docker-compose logs -f`) to ensure the backend service started correctly and the API key is valid.
-   **"Quota Exceeded"**: Simply use the dropdown at the top of the screen to switch to a different AI model.

