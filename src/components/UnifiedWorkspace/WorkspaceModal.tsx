import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Calendar, 
  Clock, 
  FileCheck, 
  FileText, 
  Smartphone, 
  CheckSquare, 
  BarChart3, 
  ChevronRight, 
  Save,
  Check
} from 'lucide-react';
import { ContentItem, ContentStatus, ContentPillar, ContentFormat } from '../../types';
import { CONTENT_PILLARS, CONTENT_FORMATS, PIPELINE_STATUSES } from '../../constants/zeinityRules';
import { exportShortToMarkdown } from '../../services/storage';
import { TabResearch } from './TabResearch';
import { TabScript } from './TabScript';
import { TabSafeZone } from './TabSafeZone';
import { TabChecklist } from './TabChecklist';
import { TabAnalytics } from './TabAnalytics';

interface WorkspaceModalProps {
  content: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ContentItem) => void;
  onOpenAiAssistant?: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  content,
  isOpen,
  onClose,
  onSave,
  onOpenAiAssistant
}) => {
  const [activeTab, setActiveTab] = useState<'research' | 'script' | 'safezone' | 'checklist' | 'analytics'>('script');
  const [localContent, setLocalContent] = useState<ContentItem>(content);
  const [justSaved, setJustSaved] = useState(false);

  // Sync state if content prop updates
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  if (!isOpen) return null;

  const pillar = CONTENT_PILLARS[localContent.pillar];
  const format = CONTENT_FORMATS[localContent.format];
  const words = localContent.script.fullScript.split(/\s+/).filter(Boolean).length;

  const handleUpdate = (updated: ContentItem) => {
    setLocalContent(updated);
    onSave(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const handleStatusChange = (newStatus: ContentStatus) => {
    handleUpdate({
      ...localContent,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  const handlePillarChange = (newPillar: ContentPillar) => {
    handleUpdate({
      ...localContent,
      pillar: newPillar,
      updatedAt: new Date().toISOString()
    });
  };

  const handleFormatChange = (newFormat: ContentFormat) => {
    const fMeta = CONTENT_FORMATS[newFormat];
    handleUpdate({
      ...localContent,
      format: newFormat,
      targetDurationSec: fMeta.minDuration + Math.floor((fMeta.maxDuration - fMeta.minDuration) / 2),
      updatedAt: new Date().toISOString()
    });
  };

  const currentStatusIdx = PIPELINE_STATUSES.findIndex(s => s.id === localContent.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-[#0e101a] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-[#121422] p-4 sm:p-6 border-b border-slate-800/80 flex flex-col gap-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Badges Pilar & Format & Status */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={localContent.pillar}
                onChange={e => handlePillarChange(e.target.value as ContentPillar)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pillar.bgColor} border ${pillar.borderColor} focus:outline-none`}
              >
                {Object.values(CONTENT_PILLARS).map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name}</option>
                ))}
              </select>

              <select
                value={localContent.format}
                onChange={e => handleFormatChange(e.target.value as ContentFormat)}
                className="text-xs font-mono font-medium bg-slate-900 border border-slate-700/80 text-slate-300 px-2.5 py-1 rounded-full focus:outline-none"
              >
                {Object.values(CONTENT_FORMATS).map(f => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-white">{f.name} ({f.durationLabel})</option>
                ))}
              </select>

              {/* Status Dropdown */}
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-[11px] text-slate-400">Status:</span>
                <select
                  value={localContent.status}
                  onChange={e => handleStatusChange(e.target.value as ContentStatus)}
                  className="text-xs font-bold bg-slate-900 border border-indigo-500/40 text-indigo-300 px-3 py-1 rounded-xl focus:outline-none"
                >
                  {PIPELINE_STATUSES.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono flex items-center gap-1 transition-all ${
                justSaved ? 'text-emerald-400 font-semibold' : 'text-slate-500'
              }`}>
                {justSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {justSaved ? 'Tersimpan' : 'Autosaved'}
              </span>

              <button
                onClick={() => exportShortToMarkdown(localContent)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                title="Ekspor naskah & dokumen produksi ke file Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ekspor .md</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                title="Tutup Studio"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Schedule Strip */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-800/60 text-slate-400">
            {/* Tanggal Publikasi (Senin/Kamis/Minggu 07:00 WIB) */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Publikasi (07:00 WIB):</span>
              <input
                type="date"
                value={localContent.publishDate ? localContent.publishDate.slice(0, 10) : ''}
                onChange={e => handleUpdate({
                  ...localContent,
                  publishDate: e.target.value ? new Date(e.target.value + 'T07:00:00+07:00').toISOString() : undefined
                })}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Deadline Produksi */}
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Deadline Editing:</span>
              <input
                type="date"
                value={localContent.productionDeadline ? localContent.productionDeadline.slice(0, 10) : ''}
                onChange={e => handleUpdate({
                  ...localContent,
                  productionDeadline: e.target.value ? new Date(e.target.value + 'T17:00:00+07:00').toISOString() : undefined
                })}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* WORKSPACE SEQUENTIAL TABS */}
        <div className="bg-[#121422] px-4 sm:px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('research')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'research'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            01. Riset & Fakta
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {localContent.researchSources.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'script'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            02. Naskah & Judul
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              words >= 90 && words <= 140 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
            }`}>
              {words} kata
            </span>
          </button>

          <button
            onClick={() => setActiveTab('safezone')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'safezone'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            03. Safe-Zone & Storyboard (9:16)
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {localContent.storyboard.length} shot
            </span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            04. Checklist & Aset
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            05. Analitik & Evaluasi
            {localContent.analytics?.views ? (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
                {localContent.analytics.views.toLocaleString()}
              </span>
            ) : null}
          </button>
        </div>

        {/* MODAL BODY (TAB CONTENT) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'research' && (
            <TabResearch content={localContent} onChange={handleUpdate} />
          )}

          {activeTab === 'script' && (
            <TabScript 
              content={localContent} 
              onChange={handleUpdate} 
              onOpenAiAssistant={onOpenAiAssistant} 
            />
          )}

          {activeTab === 'safezone' && (
            <TabSafeZone content={localContent} onChange={handleUpdate} />
          )}

          {activeTab === 'checklist' && (
            <TabChecklist content={localContent} onChange={handleUpdate} />
          )}

          {activeTab === 'analytics' && (
            <TabAnalytics content={localContent} onChange={handleUpdate} />
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-[#121422] p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span>Fase Saat Ini:</span>
            <strong className="text-white">{PIPELINE_STATUSES[currentStatusIdx]?.label}</strong>
          </div>

          <div className="flex items-center gap-2">
            {currentStatusIdx < PIPELINE_STATUSES.length - 1 && (
              <button
                onClick={() => handleStatusChange(PIPELINE_STATUSES[currentStatusIdx + 1].id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
              >
                Lanjut ke: {PIPELINE_STATUSES[currentStatusIdx + 1].label}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
