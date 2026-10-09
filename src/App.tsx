import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
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

export function App() {
  const [contents, setContents] = useState<ContentItem[]>(() => getStoredContents());
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'pipeline' | 'ideas' | 'analytics'>('dashboard');
  const [activeShort, setActiveShort] = useState<ContentItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Periksa koneksi Supabase di awal
  useEffect(() => {
    if (settings.supabaseUrl && settings.supabaseAnonKey) {
      testSupabaseConnection(settings.supabaseUrl, settings.supabaseAnonKey).then(res => {
        setIsSupabaseConnected(res.success);
      });
    } else {
      setIsSupabaseConnected(false);
    }
  }, [settings.supabaseUrl, settings.supabaseAnonKey]);

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

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewShort={handleCreateNewShort}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        settings={settings}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Workspace Body */}
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
      <footer className="border-t border-slate-900 bg-[#07080d] py-6 px-4 text-center text-xs text-slate-500">
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

      {/* Unified Content Production Workspace Modal */}
      {activeShort && (
        <WorkspaceModal
          content={activeShort}
          isOpen={!!activeShort}
          onClose={() => setActiveShort(null)}
          onSave={handleSaveContent}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
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
      />
    </div>
  );
}

export default App;
