import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { ContentItem, ResearchSource, VerificationStatus } from '../../types';

interface TabResearchProps {
  content: ContentItem;
  onChange: (updated: ContentItem) => void;
}

export const TabResearch: React.FC<TabResearchProps> = ({ content, onChange }) => {
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newClaim, setNewClaim] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newStatus, setNewStatus] = useState<VerificationStatus>('verified');
  const [isOfficial, setIsOfficial] = useState(true);

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaim.trim()) return;

    const newSource: ResearchSource = {
      id: 'src-' + Date.now().toString(36),
      platformOrTopic: newPlatform.trim() || 'Sumber Resmi',
      sourceUrl: newUrl.trim(),
      sourceDate: newDate,
      claim: newClaim.trim(),
      evidenceQuote: newEvidence.trim(),
      summary: newSummary.trim(),
      verificationStatus: newStatus,
      isOfficialSource: isOfficial
    };

    onChange({
      ...content,
      researchSources: [...content.researchSources, newSource],
      updatedAt: new Date().toISOString()
    });

    // Reset form
    setNewPlatform('');
    setNewUrl('');
    setNewClaim('');
    setNewEvidence('');
    setNewSummary('');
  };

  const handleDeleteSource = (sourceId: string) => {
    onChange({
      ...content,
      researchSources: content.researchSources.filter(s => s.id !== sourceId),
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateStatus = (sourceId: string, status: VerificationStatus) => {
    onChange({
      ...content,
      researchSources: content.researchSources.map(s => 
        s.id === sourceId ? { ...s, verificationStatus: status } : s
      ),
      updatedAt: new Date().toISOString()
    });
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Terverifikasi Resmi
          </span>
        );
      case 'needs_confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-3 h-3" />
            Perlu Konfirmasi
          </span>
        );
      case 'rumor_promo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/15 text-pink-400 border border-pink-500/30">
            <AlertTriangle className="w-3 h-3" />
            Rumor / Klaim Promosi
          </span>
        );
      case 'deprecated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-400">
            <Clock className="w-3 h-3" />
            Kedaluwarsa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            <XCircle className="w-3 h-3" />
            Belum Dicek
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Box Pedoman Zeinity */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-white">Standar Fakta & Verifikasi Zeinity</h4>
          <p className="leading-relaxed text-indigo-200/90">
            Zeinity mengutamakan fakta resmi, changelog platform, dan rujukan primer terverifikasi, bukan rumor sensasional. Setiap klaim dalam naskah harus memiliki landasan bukti yang bisa diperiksa.
          </p>
        </div>
      </div>

      {/* Form Input Sumber Baru */}
      <form onSubmit={handleAddSource} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          Tambah Sumber Riset & Bukti Fakta
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Platform / Dokumen Sumber
            </label>
            <input
              type="text"
              value={newPlatform}
              onChange={e => setNewPlatform(e.target.value)}
              placeholder="cth: WhatsApp Blog Resmi / Meta Changelog"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              URL Sumber Rujukan
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Tanggal Sumber
            </label>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Klaim Inti yang Akan Disampaikan di Naskah
          </label>
          <input
            type="text"
            value={newClaim}
            onChange={e => setNewClaim(e.target.value)}
            placeholder="cth: Fitur screenshot foto profil sekarang dinonaktifkan otomatis di Android & iOS"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Kutipan Bukti dari Dokumen (Quotes)
            </label>
            <textarea
              rows={2}
              value={newEvidence}
              onChange={e => setNewEvidence(e.target.value)}
              placeholder='cth: "Profile photo screenshots are blocked by default across all Android builds."'
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Ringkasan Kesimpulan Fakta
            </label>
            <textarea
              rows={2}
              value={newSummary}
              onChange={e => setNewSummary(e.target.value)}
              placeholder="cth: Terbukti sah. Bukan rumor. Fitur sudah rilis publik di versi stabil."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={isOfficial}
                onChange={e => setIsOfficial(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              Sumber Resmi / Changelog Primer
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as VerificationStatus)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="verified">Terverifikasi Resmi</option>
                <option value="needs_confirmation">Perlu Konfirmasi</option>
                <option value="rumor_promo">Rumor / Klaim Promosi</option>
                <option value="unverified">Belum Dicek</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Simpan Sumber Riset
          </button>
        </div>
      </form>

      {/* Daftar Sumber Riset Tersimpan */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>Bukti Sumber Terverifikasi ({content.researchSources.length})</span>
        </h4>

        {content.researchSources.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-slate-800/80 text-slate-500 text-xs">
            Belum ada sumber riset. Tambahkan sumber rujukan di atas untuk memastikan kepatuhan akurasi Zeinity.
          </div>
        ) : (
          content.researchSources.map((source, index) => (
            <div
              key={source.id}
              className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">#{index + 1}</span>
                  <span className="text-xs font-semibold text-slate-200">{source.platformOrTopic}</span>
                  {source.isOfficialSource && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Official Doc
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(source.verificationStatus)}

                  <select
                    value={source.verificationStatus}
                    onChange={e => handleUpdateStatus(source.id, e.target.value as VerificationStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                  >
                    <option value="verified">Terverifikasi</option>
                    <option value="needs_confirmation">Perlu Konfirmasi</option>
                    <option value="rumor_promo">Rumor/Promosi</option>
                    <option value="unverified">Belum Dicek</option>
                    <option value="deprecated">Kedaluwarsa</option>
                  </select>

                  <button
                    onClick={() => handleDeleteSource(source.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Hapus sumber"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Klaim Utama */}
              <div className="text-xs text-white font-medium bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Klaim Teruji:</span>
                {source.claim}
              </div>

              {/* Bukti Kutipan */}
              {source.evidenceQuote && (
                <div className="text-xs text-slate-300 italic bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/20">
                  <span className="text-indigo-400 not-italic block text-[10px] uppercase font-mono mb-1">Kutipan Rujukan Resmi:</span>
                  "{source.evidenceQuote}"
                </div>
              )}

              {/* Meta URL & Tanggal */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Tanggal Rilis: {source.sourceDate || '—'}
                </span>

                {source.sourceUrl && (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-mono text-[10px]"
                  >
                    Buka Dokumen Asli
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
