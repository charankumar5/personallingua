import React, { useState, KeyboardEvent, useEffect } from 'react';
import { Send, Mic, MicOff, Globe, Volume2, VolumeX, Clock } from 'lucide-react';
import { Language } from '../types';

interface InputControlsProps {
  onSendMessage: (text: string) => void;
  isRecording: boolean;
  interimInput?: string;
  toggleRecording: () => void;
  language: Language;
  switchLanguage: (lang: Language) => void;
  isLoading: boolean;
  autoSpeak: boolean;
  toggleAutoSpeak: () => void;
  cooldownRemaining: number;
}

export const InputControls: React.FC<InputControlsProps> = ({ 
  onSendMessage, 
  isRecording, 
  interimInput = '',
  toggleRecording, 
  language, 
  switchLanguage,
  isLoading,
  autoSpeak,
  toggleAutoSpeak,
  cooldownRemaining
}) => {
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (isRecording && interimInput) {
      setInputText(interimInput);
    }
  }, [interimInput, isRecording]);

  const handleSend = () => {
    if (inputText.trim() && !isLoading && cooldownRemaining === 0) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const isBlocked = isLoading || cooldownRemaining > 0;

  return (
    <div className="bg-white border-t border-slate-200 p-4 md:p-6 pb-6 md:pb-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        
        {/* Language Switcher & Auto-Speak Toggle */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => switchLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                English
              </button>
              <button
                onClick={() => switchLanguage('de')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${language === 'de' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Deutsch
              </button>
            </div>

            <button
              onClick={toggleAutoSpeak}
              className={`p-2 rounded-lg transition-all ${
                autoSpeak 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' 
                  : 'bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
              title={autoSpeak ? "Disable auto-speak" : "Enable auto-speak"}
            >
              {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-1">
              <span className="flex gap-1 h-3 items-end">
                <span className="w-1 bg-red-500 rounded-full animate-[bounce_1s_infinite] h-2"></span>
                <span className="w-1 bg-red-500 rounded-full animate-[bounce_1.2s_infinite] h-3"></span>
                <span className="w-1 bg-red-500 rounded-full animate-[bounce_0.8s_infinite] h-2"></span>
              </span>
              <span className="text-xs font-semibold text-red-500 ml-1">Listening...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 relative">
          <button
            onClick={toggleRecording}
            disabled={cooldownRemaining > 0}
            className={`p-4 rounded-xl transition-all duration-300 flex-shrink-0 ${
              isRecording 
                ? 'bg-red-50 text-red-500 border border-red-200 ring-2 ring-red-100' 
                : cooldownRemaining > 0 
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
            title="Toggle Voice Input"
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                cooldownRemaining > 0 
                  ? `Pausing for ${cooldownRemaining}s...` 
                  : isRecording 
                      ? (interimInput || "Speak now...") 
                      : `Type in ${language === 'en' ? 'English' : 'German'}...`
              }
              className={`w-full h-full pl-5 pr-12 rounded-xl border border-slate-200 outline-none transition-all text-slate-700 placeholder:text-slate-400 ${
                isRecording 
                  ? 'border-red-300 bg-red-50/10' 
                  : cooldownRemaining > 0
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
              disabled={isBlocked} 
            />
            {cooldownRemaining > 0 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-sm flex items-center gap-1">
                    <Clock size={16} className="animate-pulse" />
                    {cooldownRemaining}s
                </div>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isBlocked}
            className={`p-4 rounded-xl transition-colors shadow-sm ${
                !inputText.trim() || isBlocked
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-blue-200'
            }`}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};