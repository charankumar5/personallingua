import { Message, SendMessageResponse, Language, AiModel } from '../types';

const API_BASE = '/api';

export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch (e) {
    return false;
  }
};

export const fetchHistory = async (): Promise<Message[]> => {
  try {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch (e) {
    console.error("Failed to fetch history", e);
    return [];
  }
};

export const sendMessageToApi = async (text: string, language: Language, model: AiModel): Promise<SendMessageResponse> => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, language, model }),
  });
  
  if (!res.ok) {
    let errorMessage = `Error ${res.status}: Failed to send message`;
    try {
        const errorData = await res.json();
        if (errorData.error) {
            errorMessage = errorData.error;
        }
    } catch (e) {
        // Fallback to default message if JSON parse fails
    }
    throw new Error(errorMessage);
  }
  
  return await res.json();
};

export const resetHistory = async (): Promise<void> => {
  await fetch(`${API_BASE}/history`, { method: 'DELETE' });
};