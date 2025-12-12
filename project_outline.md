# PersonalLingua - Project Report 🌍🗣️

**PersonalLingua** is a privacy-first, voice-enabled AI language tutoring platform. It leverages the latest advancements in Generative AI (Google Gemini) to create an immersive language learning environment that runs entirely locally via Docker.

---

## 1. Project Overview

The goal of this project was to bridge the gap between static language learning applications (like Duolingo) and expensive human tutors. By utilizing Large Language Models (LLMs), PersonalLingua provides infinite, dynamic conversation practice with real-time grammatical feedback.

### Key Objectives
*   **Privacy**: Ensure conversation data remains on the user's machine (Local JSON storage).
*   **Accessibility**: "Voice-first" design to simulate real-world speaking scenarios.
*   **Resilience**: Overcome free-tier API limitations through architectural ingenuity.

---

## 2. Technical Architecture

The application follows a modern client-server architecture, containerized for consistent deployment.

### 🛠️ Tech Stack
| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS | High performance, component modularity, and rapid development. |
| **Backend** | Node.js, Express | Lightweight handling of API requests and file I/O operations. |
| **AI Engine** | Google Gemini SDK (`@google/genai`) | Best-in-class performance-to-cost ratio (Free tier available). |
| **Audio** | Web Speech API & Synthesis | Native browser support requiring no external heavy audio libraries. |
| **Infrastructure** | Docker & Docker Compose | "Write once, run anywhere" deployment. |

---

## 3. Key Achievements

### 🔄 Unlimited Access Strategy (Multi-Model Failover)
One of the primary achievements of this project is the **Dynamic Model Switching System**.
*   **The Problem**: High-quality LLMs have strict rate limits (Requests Per Minute) on free tiers.
*   **The Achievement**: Integrated the entire fleet of Gemini models (Flash, Lite, Pro, Thinking). Users can instantly toggle between models via the UI. If one model hits a `429 Too Many Requests` error, the user switches to another "quota bucket," effectively granting unlimited practice time.

### 🗣️ Real-Time Voice Processing
*   Implemented **Continuous Speech Recognition** using the Web Speech API.
*   Developed a "Silence Detection" algorithm: The app listens for user speech, waits for a specific duration of silence (3 seconds), and automatically triggers the message send, simulating natural conversational pauses.

### 🧠 Pedagogical Feedback Loop
*   Engineered a robust **System Instruction** (Prompt Engineering) that forces the AI to strictly separate its output into three distinct parts:
    1.  **Conversational Response**: The natural reply.
    2.  **[CORRECTION]**: Dedicated section for grammar fixes.
    3.  **[TRANSLATION]**: Native language aid.
*   The backend parses this raw text using Regex and serves it to the frontend as structured JSON data.

---

## 4. Challenges & Engineering Solutions

During development, several critical issues were raised. Below are the strategies employed to solve them.

### Issue 1: API Rate Limiting & "Quota Exceeded"
*   **Challenge**: During testing, the `gemini-2.5-flash` model would frequently block requests after short bursts of conversation.
*   **Solution**: 
    1.  **Error Trapping**: The backend specifically catches `429` and `503` errors.
    2.  **UI Feedback**: A persistent header was added to the UI allowing users to select `gemini-flash-lite` (faster, different quota) or `gemini-2.0-pro` (smarter, different quota).
    3.  **Result**: Users have 6+ backups ensuring 99.9% uptime.

### Issue 2: Context Maintenance (Memory)
*   **Challenge**: LLMs are stateless. Every request is treated as a new interaction, but a tutor needs to remember previous mistakes.
*   **Solution**: 
    1.  Implemented a **Sliding Window Context**. The backend reads `data/chat_history.json`, slices the last 20 messages, and feeds them into the API call.
    2.  **Role Merging**: Gemini requires strict `User -> Model -> User` turn-taking. The backend sanitizes history by merging consecutive messages from the same role before sending to the API.

### Issue 3: Audio Hallucinations & Ghost Inputs
*   **Challenge**: The microphone would sometimes pick up background noise or the system's own Text-to-Speech output, causing an infinite loop of the AI talking to itself.
*   **Solution**: 
    1.  **Echo Cancellation**: Relied on browser-native echo cancellation.
    2.  **State Locking**: The microphone is strictly disabled (`isRecording = false`) while the AI is generating a response or speaking. It only re-enables explicitly via user interaction or strict state management.

### Issue 4: Structured Data Reliability
*   **Challenge**: The AI would sometimes forget to provide translations or mix corrections into the main text.
*   **Solution**: 
    1.  **Prompt Engineering**: Moved from "Ask for a correction" to a strict schema definition in the system prompt.
    2.  **Backend Parsing**: Added defensive programming in `server.js`. If the Regex fails to find a `[CORRECTION]` tag, the app degrades gracefully (showing just the text) rather than crashing.

---

## 5. Future Roadmap

*   **User Accounts**: Support for multiple user profiles.
*   **RAG Integration**: Upload PDF textbooks for the AI to teach from specific curriculum.
*   **Mobile App**: Wrap the frontend in React Native for native mobile deployment.

---
