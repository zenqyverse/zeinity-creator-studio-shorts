import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PipelineView } from './components/PipelineView';
import { IdeaBankView } from './components/IdeaBankView';
import { AnalyticsView } from './components/AnalyticsView';
import { WorkspaceModal } from './components/UnifiedWorkspace/WorkspaceModal';
import { SettingsModal } from './components/SettingsModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { ContentItem, ContentStatus, AppSettings } from './types';
import { 
  getStoredContents, 
  saveStoredContents, 
  getStoredSettings, 
  saveStoredSettings, 
  createNewShort 
} from './services/storage';
import { STARTER_SHORTS } from './services/starterData';
import { testSupabaseConnection } from './services/supabaseClient';
import { testNineRouterHealth } from './services/aiGateway';
import { Sparkles, Plus, Cpu, Cloud, CloudOff } from 'lucide-react';

export function App() {
  const [contents, setContents] = useState<ContentItem[]>(() => getStoredContents());
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'pipeline' | 'ideas' | 'analytics'>('dashboard');
  const [activeShort, setActiveShort] = useState<ContentItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isNineRouterOnline, setIsNineRouterOnline] = useState<boolean | null>(null);

  // Periksa koneksi Supabase & 9Router di awal
  useEffect(() => {
    if (settings.supabaseUrl && settings.supabaseAnonKey) {
      testSupabaseConnection(settings.supabaseUrl, settings.supabaseAnonKey).then(res => {
        setIsSupabaseConnected(res.success);
      });
    } else {
      setIsSupabaseConnected(false);
    }

    testNineRouterHealth({
      baseUrl: settings.nineRouterBaseUrl,
      apiKey: settings.nineRouterApiKey,
      comboName: settings.nineRouterCombo
    }).then(res => {
      setIsNineRouterOnline(res.online);
    });
  }, [settings.supabaseUrl, settings.supabaseAnonKey, settings.nineRouterBaseUrl, settings.nineRouterApiKey, settings.nineRouterCombo]);

  // Simpan konten saat berubah
  const handleSaveContent = (updated: ContentItem) => {
    setContents(prev => {
      const exists = prev.some(c => c.id === updated.id);
      const next = exists 
        ? prev.map(c => c.id === updated.id ? updated : c)
        : [updated, ...prev];
      saveStoredContents(next);
      return next;
    });

    if (activeShort && activeShort.id === updated.id) {
      setActiveShort(updated);
    }
  };

  const handleDeleteContent = (id: string) => {
    setContents(prev => {
      const next = prev.filter(c => c.id !== id);
      saveStoredContents(next);
      return next;
    });
    if (activeShort && activeShort.id === id) {
      setActiveShort(null);
    }
  };

  const handleUpdateStatus = (itemId: string, newStatus: ContentStatus) => {
    setContents(prev => {
      const next = prev.map(c => c.id === itemId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c);
      saveStoredContents(next);
      return next;
    });
  };

  const handleCreateNewShort = () => {
    const newShort = createNewShort();
    handleSaveContent(newShort);
    setActiveShort(newShort);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    if (newSettings.supabaseUrl && newSettings.supabaseAnonKey) {
      testSupabaseConnection(newSettings.supabaseUrl, newSettings.supabaseAnonKey).then(res => {
        setIsSupabaseConnected(res.success);
      });
    } else {
      setIsSupabaseConnected(false);
    }
  };

  const handleImportContents = (imported: ContentItem[]) => {
    setContents(imported);
    saveStoredContents(imported);
  };

  const handleResetContents = () => {
    setContents(STARTER_SHORTS);
    saveStoredContents(STARTER_SHORTS);
    if (activeShort) setActiveShort(null);
  };

  const pageTitles: Record<typeof currentTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Creator Command Center',
      subtitle: 'Pusat kendali operasional & metrik kesehatan YouTube Shorts'
    },
    pipeline: {
      title: 'Pipeline & Kalender Produksi',
      subtitle: 'Kanban alur kerja 8 fase & kalender rilis Senin-Kamis-Minggu 07:00 WIB'
    },
    ideas: {
      title: 'Idea Bank & Topic Intake',
      subtitle: 'Tampungan sinyal digital 24–72 jam terakhir sebelum verifikasi fakta'
    },
    analytics: {
      title: 'Performance & Learning Center',
      subtitle: 'Evaluasi rasio Hook (≥70%) & APV (90%–110%) serta logbook editorial'
    }
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Dashboard Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewShort={handleCreateNewShort}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        settings={settings}
        isSupabaseConnected={isSupabaseConnected}
        isNineRouterOnline={isNineRouterOnline}
        contents={contents}
      />

      {/* Main Workspace Canvas (with left padding for sidebar on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header Bar on Desktop */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#0c0e17]/85 backdrop-blur-md border-b border-slate-800/80 px-8 py-4 items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {pageTitles[currentTab].title}
            </h2>
            <p className="text-[11px] text-slate-400">
              {pageTitles[currentTab].subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase status indicator */}
            <div 
              onClick={() => setIsSettingsOpen(true)}
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSupabaseConnected ? <Cloud className="w-3.5 h-3.5 text-emerald-400" /> : <CloudOff className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isSupabaseConnected ? 'Cloud Synced' : 'Offline Mode'}</span>
            </div>

            {/* 9Router Quick Trigger */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isNineRouterOnline
                  ? 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title={isNineRouterOnline ? '9Router Gateway Aktif' : '9Router Offline (Template Formula Zeinity Aktif)'}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>9Router AI</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isNineRouterOnline === null
                    ? 'bg-slate-500'
                    : isNineRouterOnline
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : 'bg-amber-400'
                }`}
              />
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </button>

            {/* Create Short Button */}
            <button
              onClick={handleCreateNewShort}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Short Baru</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
          {currentTab === 'dashboard' && (
            <Dashboard
              contents={contents}
              onOpenShort={item => setActiveShort(item)}
              onNewShort={handleCreateNewShort}
              onNavigateTab={tab => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineView
              contents={contents}
              onOpenShort={item => setActiveShort(item)}
              onNewShort={handleCreateNewShort}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {currentTab === 'ideas' && (
            <IdeaBankView
              contents={contents}
              onOpenShort={item => setActiveShort(item)}
              onSaveContent={handleSaveContent}
              onDeleteContent={handleDeleteContent}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              contents={contents}
              onOpenShort={item => setActiveShort(item)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-[#07080d] py-6 px-4 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Zeinity Creator Studio</span>
              <span>—</span>
              <span className="italic text-slate-400">"Paham Dunia Digital dalam 60 Detik"</span>
            </div>
            <div className="text-[11px] font-mono text-slate-600">
              Jadwal Publikasi: Senin, Kamis & Minggu 07:00 WIB • Target APV: 90%–110%
            </div>
          </div>
        </footer>

      </div>

      {/* Unified Content Production Workspace Modal */}
      {activeShort && (
        <WorkspaceModal
          content={activeShort}
          isOpen={!!activeShort}
          onClose={() => setActiveShort(null)}
          onSave={handleSaveContent}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          allContents={contents}
        />
      )}

      {/* Settings & Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        contents={contents}
        onImportContents={handleImportContents}
        onResetContents={handleResetContents}
      />

      {/* 9Router AI Gateway Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        settings={settings}
        onOpenSettings={() => {
          setIsAiAssistantOpen(false);
          setIsSettingsOpen(true);
        }}
        onCreateShortFromIdea={item => {
          handleSaveContent(item);
          setActiveShort(item);
        }}
        activeContent={activeShort}
        onApplyHookOrLoop={(type, text) => {
          if (!activeShort) return;
          if (type === 'hook') {
            const updated: ContentItem = {
              ...activeShort,
              hookText: text,
              script: {
                ...activeShort.script,
                stageHook: text,
                fullScript: `${text} ${activeShort.script.stageContext} ${activeShort.script.stagePayoff} ${activeShort.script.stageEnding}`.trim()
              },
              updatedAt: new Date().toISOString()
            };
            handleSaveContent(updated);
          } else {
            const updated: ContentItem = {
              ...activeShort,
              script: {
                ...activeShort.script,
                stageEnding: text,
                fullScript: `${activeShort.script.stageHook} ${activeShort.script.stageContext} ${activeShort.script.stagePayoff} ${text}`.trim()
              },
              updatedAt: new Date().toISOString()
            };
            handleSaveContent(updated);
          }
        }}
      />
    </div>
  );
}

export default App;
