import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Lightbulb, 
  BarChart3, 
  Plus, 
  Settings, 
  Cpu, 
  Sparkles, 
  Cloud, 
  CloudOff, 
  Menu, 
  X,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { AppSettings, ContentItem } from '../types';
import { ZEINITY_STANDARDS } from '../constants/zeinityRules';

interface SidebarProps {
  currentTab: 'dashboard' | 'pipeline' | 'ideas' | 'analytics';
  setCurrentTab: (tab: 'dashboard' | 'pipeline' | 'ideas' | 'analytics') => void;
  onNewShort: () => void;
  onOpenSettings: () => void;
  onOpenAiAssistant: () => void;
  settings: AppSettings;
  isSupabaseConnected: boolean;
  isNineRouterOnline?: boolean | null;
  contents: ContentItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onNewShort,
  onOpenSettings,
  onOpenAiAssistant,
  settings,
  isSupabaseConnected,
  isNineRouterOnline,
  contents
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hitung jumlah konten per kategori untuk badge sidebar
  const inProductionCount = contents.filter(c => c.status !== 'idea' && c.status !== 'published').length;
  const ideaCount = contents.filter(c => c.status === 'idea').length;

  const handleNavClick = (tab: 'dashboard' | 'pipeline' | 'ideas' | 'analytics') => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'pipeline' as const,
      label: 'Pipeline & Kalender',
      icon: CalendarDays,
      badge: inProductionCount > 0 ? inProductionCount : null
    },
    {
      id: 'ideas' as const,
      label: 'Idea Bank',
      icon: Lightbulb,
      badge: ideaCount > 0 ? ideaCount : null
    },
    {
      id: 'analytics' as const,
      label: 'Performance & Learning',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0c0e17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#090a10] rounded-[7px] flex items-center justify-center font-bold text-white text-sm">
                Z
              </div>
            </div>
            <span className="font-bold text-white text-sm tracking-wide">ZEINITY STUDIO</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAiAssistant}
            className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300"
          >
            <Cpu className="w-4 h-4" />
          </button>
          <button
            onClick={onNewShort}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Short</span>
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Main Sidebar Desktop & Drawer Mobile */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c0e17] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top Part: Brand + New Action + Nav */}
        <div className="flex flex-col p-4 space-y-6">
          
          {/* Brand Logo & Tag */}
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="cursor-pointer flex items-center gap-3 px-2 py-1 group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090a10] rounded-[11px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-lg tracking-wider">
                  Z
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-wide text-white">ZEINITY</h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  SHORTS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Creator Studio Hub</p>
            </div>
          </div>

          {/* Primary Action: + Short Baru */}
          <button
            onClick={() => {
              onNewShort();
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Produksi Short Baru</span>
          </button>

          {/* Main Navigation Menu */}
          <nav className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider px-3 block mb-2">
              Menu Utama
            </span>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/80 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* AI Tools Section */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider px-3 block mb-2">
              Asisten AI & Integrasi
            </span>

            <button
              onClick={() => {
                onOpenAiAssistant();
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 text-purple-300 border border-purple-500/20 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>9Router AI Gateway</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isNineRouterOnline ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" title="9Router Gateway Aktif" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400/70" title="Mode Fallback Formula Lokal Aktif" />
                )}
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              </div>
            </button>
          </div>

          {/* Quick Schedule Reminder Card */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono text-[10px]">
              <Clock className="w-3 h-3" />
              <span>JADWAL TAYANG BAKU</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-tight">
              Senin, Kamis, Minggu <br />
              <strong className="text-white">Pukul 07:00 WIB</strong>
            </p>
          </div>

        </div>

        {/* Bottom Part: Cloud Status & Settings */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090b13] space-y-2.5">
          
          {/* Cloud Sync Status Pill */}
          <div 
            onClick={onOpenSettings}
            className={`cursor-pointer flex items-center justify-between p-2 rounded-xl text-[11px] font-mono border transition-all ${
              isSupabaseConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {isSupabaseConnected ? (
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{isSupabaseConnected ? 'Supabase Sync OK' : 'Mode Offline-First'}</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </div>

          {/* Settings Trigger */}
          <button
            onClick={() => {
              onOpenSettings();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan & Cadangan</span>
          </button>

          {/* Channel Tag */}
          <div className="pt-2 border-t border-slate-900 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              @ZeinityShorts Official
            </span>
          </div>

        </div>

      </aside>
    </>
  );
};
