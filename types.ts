export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  correction?: string;
  translation?: string;
}

export type Language = 'en' | 'de';

export type AiModel = 
  | 'gemini-2.5-flash' 
  | 'gemini-flash-lite-latest' 
  | 'gemini-2.0-pro-exp-02-05'
  | 'gemini-2.0-flash-thinking-exp-01-21'
  | 'gemini-2.0-flash-exp'
  | 'gemini-3-pro-preview';

export interface ChatHistory {
  messages: Message[];
}

export interface ApiHealthResponse {
  status: 'ok' | 'error';
  gemini: 'connected' | 'disconnected';
}

export interface SendMessagePayload {
  message: string;
  language: Language;
  model: AiModel;
}

export interface SendMessageResponse {
  response: string;
  history: Message[];
}