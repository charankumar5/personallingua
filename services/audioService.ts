// Simple wrapper for Web Speech API

// Define global types for Window to avoid TS errors without specific lib config
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

let recognition: any = null;
let silenceTimer: any = null;

export const startListening = (
  onResult: (text: string) => void,
  onInterim: (text: string) => void,
  onEnd: () => void,
  onError: (msg: string) => void,
  language: string = 'en-US'
) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError('Speech recognition not supported in this browser.');
    onEnd();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  // Clean up any existing instance
  if (recognition) {
    try {
      recognition.abort();
    } catch (e) {
      // ignore
    }
    recognition = null;
  }
  
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }
  
  recognition = new SpeechRecognition();
  
  // Continuous = true allows us to keep listening even after pauses, 
  // until OUR silence timer triggers.
  recognition.continuous = true; 
  recognition.interimResults = true; 
  recognition.maxAlternatives = 1;
  recognition.lang = language === 'de' ? 'de-DE' : 'en-US';

  // We accumulate the final transcript here to send it all at once at the end
  let fullFinalTranscript = '';
  let lastInterim = ''; // Track the latest interim result as fallback

  const resetSilenceTimer = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      console.log('Silence detected (3s), stopping recording...');
      if (recognition) recognition.stop();
    }, 3000); // Wait 3 seconds of silence
  };

  recognition.onstart = () => {
    console.log('Microphone is active');
    resetSilenceTimer(); // Start the timer in case user says nothing
  };

  recognition.onresult = (event: any) => {
    resetSilenceTimer(); // Reset timer on any speech detected

    if (!event.results) return;

    let interimPart = '';
    // We need to rebuild the full final transcript from the event results
    // The Web Speech API in continuous mode keeps the history in event.results
    fullFinalTranscript = ''; 

    for (let i = 0; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        fullFinalTranscript += event.results[i][0].transcript;
      } else {
        interimPart += event.results[i][0].transcript;
      }
    }
    
    lastInterim = interimPart;

    // Send the combined view (History + Current Interim) to the UI
    const displayBuffer = fullFinalTranscript + interimPart;
    if (displayBuffer) {
      onInterim(displayBuffer);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    if (silenceTimer) clearTimeout(silenceTimer);

    if (event.error === 'no-speech') {
      // If no speech was detected at all by the engine (and our timer didn't catch it yet)
      return; 
    }
    
    if (event.error === 'not-allowed') {
      onError('Microphone permission denied.');
    } else {
      // 'aborted' happens when we stop manually, don't show error
      if (event.error !== 'aborted') {
         // Only report critical errors, not benign ones
         // onError(`Error: ${event.error}`); 
      }
    }
  };

  recognition.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    
    // Logic to ensure we capture the text
    let finalResult = fullFinalTranscript.trim();
    
    // Fallback: If final transcript is empty but we had interim text, use it.
    // This happens if the browser stops before finalizing the last segment.
    if (!finalResult && lastInterim.trim()) {
        finalResult = lastInterim.trim();
    }
    
    if (finalResult) {
      onResult(finalResult);
    }
    
    onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Failed to start recognition", e);
    onError('Failed to start microphone.');
    onEnd();
  }
};

export const stopListening = () => {
  if (silenceTimer) clearTimeout(silenceTimer);
  if (recognition) {
    try {
      recognition.stop();
    } catch(e) {
      console.error("Error stopping recognition", e);
    }
  }
};

export const speakText = (text: string, language: string = 'auto') => {
  if (!('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const cleanText = text.replace(/\[CORRECTION\]|\[TRANSLATION\]/g, '');
  utterance.text = cleanText;
  
  if (language !== 'auto') {
     utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
  }

  window.speechSynthesis.speak(utterance);
};