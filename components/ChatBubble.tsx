import React, { useState } from 'react';
import { Message } from '../types';
import { User, Bot, Volume2, CheckCircle2, Globe2 } from 'lucide-react';
import { speakText } from '../services/audioService';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [showTranslation, setShowTranslation] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Auto-detect language or default to German if it's the bot response in a German context
    speakText(message.text);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`relative px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
          }`}>
            
            {message.text}

            {/* Audio Button */}
            <button 
              onClick={handleSpeak}
              className={`absolute -bottom-3 ${isUser ? '-left-3' : '-right-3'} bg-white text-slate-600 p-1.5 rounded-full shadow-md border border-slate-100 hover:text-blue-600 transition-colors`}
              title="Read aloud"
            >
              <Volume2 size={14} />
            </button>
          </div>

          {/* Corrections (Only for User messages if corrected by AI - handled by parsing, or AI messages showing corrections) */}
          {/* Note: The backend logic will attach corrections to the MODEL's response about the USER's previous input, or we can structure the data such that the correction is a property of the message. 
              Based on the prompt, the AI tags responses. We parse this in useTutor or here. 
              Assuming message.correction is populated if available. */}
          
          {message.correction && !isUser && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-sm w-full flex gap-3 items-start animate-fade-in">
              <CheckCircle2 size={16} className="mt-0.5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-amber-700 block text-xs uppercase mb-1">Correction</span>
                {message.correction}
              </div>
            </div>
          )}

          {/* Translation (Only for Model messages) */}
          {message.translation && !isUser && (
            <div className="w-full">
              <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors ml-1"
              >
                <Globe2 size={12} />
                {showTranslation ? 'Hide Translation' : 'Show Translation'}
              </button>
              
              {showTranslation && (
                <div className="mt-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl text-sm border border-slate-200">
                  {message.translation}
                </div>
              )}
            </div>
          )}

          <div className="text-[10px] text-slate-400 font-medium px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};