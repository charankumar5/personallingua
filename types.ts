export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  correction?: string;
  translation?: string;
}

export type Language = 'en' | 'de';

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
}

export interface SendMessageResponse {
  response: string;
  history: Message[];
}