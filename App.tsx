import React, { useRef, useEffect } from 'react';
import { useTutor } from './hooks/useTutor';
import { ChatBubble } from './components/ChatBubble';
import { InputControls } from './components/InputControls';
import { StatusPanel } from './components/StatusPanel';
import { BookOpen, Languages, Menu, AlertCircle, Sparkles, Cpu } from 'lucide-react';
import { AiModel } from './types';

const App: React.FC = () => {
  const { 
    messages, 
    isRecording, 
    interimInput,
    isConnected, 
    isLoading,
    language,
    model,
    autoSpeak,
    error,
    cooldownRemaining,
    toggleRecording,
    sendMessage,
    switchLanguage,
    switchModel,
    clearHistory,
    toggleAutoSpeak
  } = useTutor();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, interimInput, error]);

  return (
    <div className="flex h-screen w-full bg-slate-100 relative overflow-hidden font-sans">
      {/* Sidebar / Status Panel */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative md:w-80 transition-transform duration-300 ease-in-out z-20 bg-white border-r border-slate-200 shadow-lg md:shadow-none flex flex-col`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">LinguaLocal</h1>
            <p className="text-xs text-slate-500 font-medium">Privacy-First AI Tutor</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <StatusPanel 
            isConnected={isConnected} 
            language={language} 
            currentModel={model}
            onModelChange={switchModel}
          />
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Languages size={16} />
              Current Session
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              You are practicing <strong>{language === 'en' ? 'English' : 'German'}</strong>. 
              The AI will correct your grammar and provide translations.
            </p>
            <button 
              onClick={clearHistory}
              className="w-full py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            >
              Reset Conversation
            </button>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Unified Header (Mobile & Desktop) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 md:hidden flex items-center gap-2">
                 <BookOpen size={18} className="text-blue-600" />
                 LinguaLocal
              </span>
              <span className="hidden md:flex items-center gap-2 font-semibold text-slate-700">
                <Sparkles size={16} className="text-amber-500" />
                AI Tutor Chat
              </span>
            </div>
          </div>

          {/* Persistent Model Selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
             <div className="hidden sm:flex items-center gap-1 px-2 text-slate-500">
                <Cpu size={14} />
                <span className="text-xs font-medium">Model:</span>
             </div>
             <select 
                value={model}
                onChange={(e) => switchModel(e.target.value as AiModel)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer py-1 px-1 max-w-[140px] sm:max-w-none truncate"
                title="Select AI Model"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-flash-lite-latest">Gemini Flash Lite</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp</option>
                <option value="gemini-2.0-flash-thinking-exp-01-21">Gemini 2.0 Thinking</option>
                <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
              </select>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/50 scroll-smooth" onClick={() => setIsSidebarOpen(false)}>
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {messages.length === 0 && !error && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <BookOpen size={64} className="mb-4" />
                <p>Start chatting to begin your lesson.</p>
                <p className="text-xs mt-2">Current Model: {model}</p>
             </div>
          )}
          
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full animate-pulse">
               <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <InputControls 
          onSendMessage={sendMessage}
          isRecording={isRecording}
          interimInput={interimInput}
          toggleRecording={toggleRecording}
          language={language}
          switchLanguage={switchLanguage}
          isLoading={isLoading}
          autoSpeak={autoSpeak}
          toggleAutoSpeak={toggleAutoSpeak}
          cooldownRemaining={cooldownRemaining}
        />
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;