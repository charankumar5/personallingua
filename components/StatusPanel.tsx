import React from 'react';
import { Wifi, WifiOff, Database, Cpu, Activity } from 'lucide-react';
import { Language } from '../types';

interface StatusPanelProps {
  isConnected: boolean;
  language: Language;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ isConnected, language }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Activity size={16} />
        System Status
      </h3>
      
      <div className="space-y-2">
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

        {/* Gemini API Status (Inferred from backend connection for simplicity in UI) */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
              <Cpu size={16} />
            </div>
            <span className="text-sm font-medium text-slate-700">Gemini 2.5 Flash</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
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