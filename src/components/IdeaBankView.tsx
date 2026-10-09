import React, { useState } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Search, 
  Tag, 
  Clock, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { ContentItem, ContentPillar, ContentFormat } from '../types';
import { CONTENT_PILLARS, CONTENT_FORMATS } from '../constants/zeinityRules';
import { createNewShort } from '../services/storage';

interface IdeaBankViewProps {
  contents: ContentItem[];
  onOpenShort: (item: ContentItem) => void;
  onSaveContent: (item: ContentItem) => void;
  onDeleteContent: (id: string) => void;
  onOpenAiAssistant: () => void;
}

export const IdeaBankView: React.FC<IdeaBankViewProps> = ({
  contents,
  onOpenShort,
  onSaveContent,
  onDeleteContent,
  onOpenAiAssistant
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<ContentPillar>('internet_social');
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>('flash_news');
  const [initialClaim, setInitialClaim] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Ambil hanya konten dengan status 'idea'
  const ideas = contents.filter(c => c.status === 'idea').filter(c => 
    c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.notes.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const short = createNewShort(newTitle.trim(), selectedPillar, selectedFormat);
    short.status = 'idea';
    if (initialClaim.trim()) {
      short.notes = initialClaim.trim();
      short.researchSources = [{
        id: 'res-' + Date.now().toString(36),
        platformOrTopic: CONTENT_PILLARS[selectedPillar].name,
        sourceUrl: '',
        sourceDate: new Date().toISOString().slice(0, 10),
        claim: initialClaim.trim(),
        evidenceQuote: '',
        summary: '',
        verificationStatus: 'unverified',
        isOfficialSource: false
      }];
    }

    onSaveContent(short);
    setNewTitle('');
    setInitialClaim('');
  };

  const handlePromoteToResearch = (item: ContentItem) => {
    const updated: ContentItem = {
      ...item,
      status: 'research',
      updatedAt: new Date().toISOString()
    };
    onSaveContent(updated);
    onOpenShort(updated);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Intake Form */}
      <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Idea Bank & Topic Discovery
            </div>
            <h2 className="text-xl font-bold text-white">Tampungan Ide & Sinyal Tren Baru</h2>
            <p className="text-xs text-slate-400">
              Tangkap ide digital 24–72 jam terakhir sebelum diformulasikan ke riset dan penulisan naskah.
            </p>
          </div>

          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Cari Ide dengan 9Router AI
          </button>
        </div>

        {/* Quick Idea Creation Form */}
        <form onSubmit={handleCreateIdea} className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Title Input */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Gagasan Topik / Judul Calon Short
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="cth: Apa Saja Fitur Baru WhatsApp Bulan Ini?"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Pillar Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                5 Pilar Konten
              </label>
              <select
                value={selectedPillar}
                onChange={e => setSelectedPillar(e.target.value as ContentPillar)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {Object.values(CONTENT_PILLARS).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Format Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Format Shorts
              </label>
              <select
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value as ContentFormat)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {Object.values(CONTENT_FORMATS).map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.durationLabel})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Fakta Awal / Sinyal Berita / Link Inspirasi (Opsional)
            </label>
            <input
              type="text"
              value={initialClaim}
              onChange={e => setInitialClaim(e.target.value)}
              placeholder="cth: Rilis changelog Meta resmi melarang tangkapan layar foto profil"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Simpan ke Idea Bank
            </button>
          </div>
        </form>
      </div>

      {/* Grid Ide yang Sudah Ada */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Daftar Ide Tersimpan</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {ideas.length}
            </span>
          </h3>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter ide..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-16 bg-[#11131f] border border-slate-800/80 rounded-2xl text-slate-500 text-xs">
            Belum ada ide dalam tampungan. Masukkan ide baru di atas atau gunakan asisten 9Router AI.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map(item => {
              const pillar = CONTENT_PILLARS[item.pillar];
              const format = CONTENT_FORMATS[item.format];

              return (
                <div
                  key={item.id}
                  className="bg-[#11131f] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${pillar.bgColor} border ${pillar.borderColor}`}>
                        {pillar.name}
                      </span>
                      <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {format.name}
                      </span>
                    </div>

                    <h4 
                      onClick={() => onOpenShort(item)}
                      className="cursor-pointer text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2"
                    >
                      {item.title}
                    </h4>

                    {item.notes && (
                      <p className="text-xs text-slate-400 line-clamp-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onDeleteContent(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Hapus ide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handlePromoteToResearch(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-[1.01]"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Mulai Riset & Naskah
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
