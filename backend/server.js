import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const HISTORY_FILE = path.join(DATA_DIR, 'chat_history.json');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini with the new SDK
// NOTE: process.env.API_KEY is injected by Docker or environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

// Helper to read history
const getHistory = async () => {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { messages: [] };
  }
};

// Helper to write history
const saveHistory = async (history) => {
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', gemini: process.env.API_KEY ? 'connected' : 'disconnected' });
});

app.get('/history', async (req, res) => {
  const history = await getHistory();
  res.json(history);
});

app.delete('/history', async (req, res) => {
  await saveHistory({ messages: [] });
  res.json({ success: true });
});

app.post('/chat', async (req, res) => {
  const { message, language, model } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  // Default to 2.5 Flash if no model provided or if invalid
  const targetModel = model || 'gemini-2.5-flash';

  const historyData = await getHistory();
  
  // Add user message to local history
  const userMsg = {
    role: 'user',
    text: message,
    timestamp: new Date().toISOString()
  };
  
  historyData.messages.push(userMsg);

  try {
    // Construct System Instruction
    const systemInstruction = `
      You are an expert language tutor helping a student learn ${language === 'en' ? 'English' : 'German'}.
      
      Your Responsibilities:
      1. Engage in natural conversation.
      2. If the user makes a grammar or vocabulary mistake, correct it politely.
      3. Provide a translation of your response in the *other* language (e.g., if speaking German, provide English translation) to help understanding.
      
      Output Format (Strictly enforce this):
      Your main response here...
      
      [CORRECTION] 
      (Only if user made a mistake, explain briefy here)
      
      [TRANSLATION]
      (The translation of your main response)
    `;

    // Sanitize History for Gemini
    // Gemini 2.5 strictly requires alternating User -> Model -> User roles.
    // We iterate through the raw history and merge consecutive messages from the same role.
    const rawHistory = historyData.messages.slice(-20); // Keep last 20 messages for context
    const sanitizedContents = [];
    
    for (const msg of rawHistory) {
      const role = msg.role;
      const text = msg.text;
      
      if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
        // If previous message was same role, merge them (append text)
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += "\n" + text;
      } else {
        // Otherwise start a new turn
        sanitizedContents.push({
          role: role,
          parts: [{ text: text }]
        });
      }
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: sanitizedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text;

    if (!text) {
        throw new Error("Empty response from AI");
    }

    // Parse the response
    const correctionMatch = text.match(/\[CORRECTION\]([\s\S]*?)(?=\[TRANSLATION\]|$)/);
    const translationMatch = text.match(/\[TRANSLATION\]([\s\S]*?)$/);
    
    const mainText = text.split('[CORRECTION]')[0].split('[TRANSLATION]')[0].trim();
    const correction = correctionMatch ? correctionMatch[1].trim() : undefined;
    const translation = translationMatch ? translationMatch[1].trim() : undefined;

    const botMsg = {
      role: 'model',
      text: mainText,
      correction: correction,
      translation: translation,
      timestamp: new Date().toISOString()
    };

    historyData.messages.push(botMsg);
    await saveHistory(historyData);

    res.json({ response: mainText, history: historyData.messages });

  } catch (error) {
    console.error("Gemini Error:", error);
    // Send the specific error message to the frontend (e.g. "Quota exceeded")
    res.status(500).json({ error: error.message || "Failed to generate response" });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});