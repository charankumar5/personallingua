import React from 'react';
import { Wifi, WifiOff, Database, Cpu, Activity, Zap, Star } from 'lucide-react';
import { Language, AiModel } from '../types';

interface StatusPanelProps {
  isConnected: boolean;
  language: Language;
  currentModel: AiModel;
  onModelChange: (model: AiModel) => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ isConnected, language, currentModel, onModelChange }) => {
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Activity size={16} />
        System Status
      </h3>
      
      <div className="space-y-3">
        {/* Backend Connection */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-md ${isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            </div>
            <span className="text-sm font-medium text-slate-700">Backend</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
        </div>

        {/* Model Selector */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
              <Cpu size={16} />
            </div>
            <span className="text-sm font-medium text-slate-700">AI Model</span>
          </div>
          
          <select 
            value={currentModel}
            onChange={(e) => onModelChange(e.target.value as AiModel)}
            className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Balanced)</option>
            <option value="gemini-flash-lite-latest">Gemini Flash Lite (Fastest)</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
            <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp (Smart)</option>
            <option value="gemini-2.0-flash-thinking-exp-01-21">Gemini 2.0 Flash Thinking</option>
            <option value="gemini-3-pro-preview">Gemini 3.0 Pro Preview</option>
          </select>
          
          <p className="text-[10px] text-slate-400 px-1 leading-tight">
            Switch models if you hit rate limits. Each model has its own quota bucket.
          </p>
        </div>

        {/* Storage Status */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-purple-100 text-purple-600">
              <Database size={16} />
            </div>
            <span className="text-sm font-medium text-slate-700">Local History</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">JSON</span>
        </div>
      </div>
    </div>
  );
};