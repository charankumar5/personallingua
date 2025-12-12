import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, Language } from '../types';
import { checkHealth, fetchHistory, sendMessageToApi, resetHistory } from '../services/api';
import { startListening, stopListening, speakText } from '../services/audioService';

export const useTutor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [interimInput, setInterimInput] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Rate limiting state
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const autoSpeakRef = useRef(autoSpeak);

  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  // Timer for cooldown
  useEffect(() => {
    if (!rateLimitEndTime) {
      setCooldownRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil((rateLimitEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setRateLimitEndTime(null);
        setCooldownRemaining(0);
        setError(null); // Clear the error when cooldown is done
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitEndTime]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const healthy = await checkHealth();
        setIsConnected(healthy);
        if (healthy) {
          const history = await fetchHistory();
          setMessages(history);
        } else {
            setError("Cannot connect to backend server.");
        }
      } catch (err) {
        setIsConnected(false);
        setError("Initialization failed.");
      }
    };
    init();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Block sending if in cooldown
    if (rateLimitEndTime && Date.now() < rateLimitEndTime) {
        return;
    }

    setIsLoading(true);
    setInterimInput(''); 
    setError(null);
    
    const userMsg: Message = { 
      role: 'user', 
      text, 
      timestamp: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await sendMessageToApi(text, language);
      setMessages(response.history);

      // Auto-speak logic
      if (autoSpeakRef.current) {
        const lastMsg = response.history[response.history.length - 1];
        if (lastMsg && lastMsg.role === 'model') {
          speakText(lastMsg.text, language);
        }
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      const errorMsg = err.message || "Failed to get response from AI.";
      
      // Check for rate limit in error message
      // Matches "Please retry in 32.35s" or similar variations
      const retryMatch = errorMsg.match(/retry in ([0-9.]+)/i);
      if (retryMatch && retryMatch[1]) {
        const seconds = parseFloat(retryMatch[1]);
        const waitTime = Math.ceil(seconds) + 1; // Add 1s buffer
        setRateLimitEndTime(Date.now() + (waitTime * 1000));
        setError(`Rate limit exceeded. Pausing for ${waitTime} seconds.`);
      } else if (errorMsg.includes("429") || errorMsg.includes("quota")) {
        // Default fallback if time not parsed
        const defaultWait = 30;
        setRateLimitEndTime(Date.now() + (defaultWait * 1000));
        setError(`Rate limit exceeded. Pausing for ${defaultWait} seconds.`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [language, rateLimitEndTime]);

  const toggleRecording = useCallback(async () => {
    if (cooldownRemaining > 0) return; // Prevent recording during cooldown

    if (isRecording) {
      stopListening();
      setIsRecording(false);
      setInterimInput('');
    } else {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         setError("Browser does not support microphone access.");
         return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("Microphone access denied:", err);
        setError("Microphone permission denied. Please allow access in browser settings.");
        return;
      }

      setIsRecording(true);
      setInterimInput('');
      
      startListening(
        (finalText) => {
          sendMessage(finalText);
          setIsRecording(false);
          setInterimInput('');
        },
        (interimText) => {
          setInterimInput(interimText);
        },
        () => {
            setIsRecording(false);
            setInterimInput('');
        },
        (errorMsg) => {
            console.error(errorMsg);
            setError(errorMsg);
            setIsRecording(false);
            setInterimInput('');
        },
        language
      );
    }
  }, [isRecording, language, sendMessage, cooldownRemaining]);

  const switchLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const clearHistory = async () => {
    if(confirm("Are you sure you want to clear the chat history?")) {
        try {
            await resetHistory();
            setMessages([]);
            setRateLimitEndTime(null); // Clear cooldown on reset
        } catch (e) {
            setError("Failed to clear history.");
        }
    }
  }

  const toggleAutoSpeak = () => {
    setAutoSpeak(prev => !prev);
  };

  return {
    messages,
    isRecording,
    interimInput,
    isConnected,
    isLoading,
    language,
    autoSpeak,
    error,
    cooldownRemaining,
    toggleRecording,
    sendMessage,
    switchLanguage,
    clearHistory,
    toggleAutoSpeak
  };
};