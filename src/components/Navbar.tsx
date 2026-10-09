import React from 'react';
import { 
  Plus, 
  Settings, 
  Sparkles, 
  Layers, 
  Calendar, 
  Lightbulb, 
  BarChart3, 
  Cloud, 
  CloudOff, 
  Cpu
} from 'lucide-react';
import { AppSettings } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'pipeline' | 'ideas' | 'analytics';
  setCurrentTab: (tab: 'dashboard' | 'pipeline' | 'ideas' | 'analytics') => void;
  onNewShort: () => void;
  onOpenSettings: () => void;
  onOpenAiAssistant: () => void;
  settings: AppSettings;
  isSupabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onNewShort,
  onOpenSettings,
  onOpenAiAssistant,
  settings,
  isSupabaseConnected
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0e17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090a10] rounded-[11px] flex items-center justify-center">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-lg tracking-wider">
                Z
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
                ZEINITY <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">SHORTS</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">YouTube Shorts Production Studio</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Command Center
          </button>

          <button
            onClick={() => setCurrentTab('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Pipeline & Kalender
          </button>

          <button
            onClick={() => setCurrentTab('ideas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'ideas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Idea Bank
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Performance & Learning
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Cloud / Sync Badge */}
          <div 
            onClick={onOpenSettings}
            title={isSupabaseConnected ? 'Terhubung ke Supabase Cloud' : 'Mode Offline-First (Tersimpan Lokal di Browser)'}
            className={`cursor-pointer hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
              isSupabaseConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-slate-300'
            }`}
          >
            {isSupabaseConnected ? <Cloud className="w-3 h-3 text-emerald-400" /> : <CloudOff className="w-3 h-3 text-slate-400" />}
            <span>{isSupabaseConnected ? 'Cloud Sync' : 'Local-First'}</span>
          </div>

          {/* 9Router AI Gateway Quick Action */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-all shadow-sm"
            title="Buka 9Router AI Gateway Assistant"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">9Router AI</span>
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          </button>

          {/* New Short Button */}
          <button
            onClick={onNewShort}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Short Baru</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-slate-800 transition-all"
            title="Pengaturan & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Submenu Tabs */}
      <div className="flex md:hidden items-center justify-around mt-3 pt-2 border-t border-slate-800/60 text-xs">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`px-2 py-1 rounded ${currentTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Command
        </button>
        <button
          onClick={() => setCurrentTab('pipeline')}
          className={`px-2 py-1 rounded ${currentTab === 'pipeline' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Pipeline
        </button>
        <button
          onClick={() => setCurrentTab('ideas')}
          className={`px-2 py-1 rounded ${currentTab === 'ideas' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Idea Bank
        </button>
        <button
          onClick={() => setCurrentTab('analytics')}
          className={`px-2 py-1 rounded ${currentTab === 'analytics' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Analitik
        </button>
      </div>
    </header>
  );
};
