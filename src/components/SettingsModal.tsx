import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Cpu, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Cloud, 
  BookOpen,
  Save,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { AppSettings, ContentItem } from '../types';
import { testSupabaseConnection } from '../services/supabaseClient';
import { callNineRouter } from '../services/aiGateway';
import { exportDatabaseToJson } from '../services/storage';
import { STARTER_SHORTS } from '../services/starterData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  contents: ContentItem[];
  onImportContents: (imported: ContentItem[]) => void;
  onResetContents: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  contents,
  onImportContents,
  onResetContents
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; message?: string; success?: boolean } | null>(null);
  const [nineRouterTestStatus, setNineRouterTestStatus] = useState<{ loading: boolean; message?: string; success?: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'cloud' | 'ai' | 'backup' | 'guide'>('cloud');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleTestSupabase = async () => {
    if (!localSettings.supabaseUrl || !localSettings.supabaseAnonKey) {
      setSupabaseTestStatus({ loading: false, success: false, message: 'Harap isi URL dan Anon Key terlebih dahulu.' });
      return;
    }
    setSupabaseTestStatus({ loading: true });
    const result = await testSupabaseConnection(localSettings.supabaseUrl, localSettings.supabaseAnonKey);
    setSupabaseTestStatus({ loading: false, success: result.success, message: result.message });
  };

  const handleTestNineRouter = async () => {
    setNineRouterTestStatus({ loading: true });
    try {
      const config = {
        baseUrl: localSettings.nineRouterBaseUrl,
        apiKey: localSettings.nineRouterApiKey,
        comboName: localSettings.nineRouterCombo
      };
      await callNineRouter(config, [
        { role: 'user', content: 'Ping test. Jawab "9Router OK" dalam 2 kata.' }
      ]);
      setNineRouterTestStatus({ loading: false, success: true, message: 'Koneksi ke 9Router AI Gateway & Combo berhasil!' });
    } catch (err: any) {
      setNineRouterTestStatus({ loading: false, success: false, message: err?.message || 'Gagal menghubungi 9Router.' });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed.contents)) {
            onImportContents(parsed.contents);
            alert(`Berhasil memulihkan ${parsed.contents.length} data video Shorts!`);
          } else if (Array.isArray(parsed)) {
            onImportContents(parsed);
            alert(`Berhasil memulihkan ${parsed.length} data video Shorts!`);
          } else {
            alert('Format file JSON tidak valid.');
          }
        } catch (err) {
          alert('Gagal membaca file JSON cadangan.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0e101a] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#121422] p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pengaturan & Integrasi Zeinity Studio</h3>
              <p className="text-xs text-slate-400">Konfigurasi Supabase Cloud, 9Router AI Gateway, dan cadangan data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="bg-[#121422] px-5 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'cloud' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Supabase Cloud
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'ai' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            9Router AI Gateway
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'backup' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Cadangan & Reset
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'guide' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Pedoman Standar
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* TAB 1: SUPABASE */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 space-y-1">
                <span className="font-semibold text-white block">Arsitektur Offline-First & Supabase Sync:</span>
                <p className="text-[11px] leading-relaxed">
                  Aplikasi ini tetap bekerja 100% normal tanpa Supabase (tersimpan di browser lokal). Masukkan Project URL dan Anon Key untuk sinkronisasi cloud multi-perangkat.
                </p>
                <p className="text-[11px] text-indigo-300">
                  Skema SQL database tersedia di folder proyek: <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">supabase/schema.sql</code>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={localSettings.supabaseUrl}
                  onChange={e => setLocalSettings({ ...localSettings, supabaseUrl: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Supabase Anon / Publishable Key
                </label>
                <input
                  type="password"
                  value={localSettings.supabaseAnonKey}
                  onChange={e => setLocalSettings({ ...localSettings, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={supabaseTestStatus?.loading}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                >
                  {supabaseTestStatus?.loading ? 'Menguji...' : 'Uji Koneksi Supabase'}
                </button>

                {supabaseTestStatus && (
                  <span className={`text-[11px] flex items-center gap-1 ${
                    supabaseTestStatus.success ? 'text-emerald-400 font-semibold' : 'text-amber-400'
                  }`}>
                    {supabaseTestStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {supabaseTestStatus.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 9ROUTER AI GATEWAY */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 space-y-1">
                <span className="font-semibold text-white block">9Router AI Gateway & Combos:</span>
                <p className="text-[11px] leading-relaxed">
                  9Router bertindak sebagai AI Gateway lokal/remote dengan fitur "Combos" (urutan multi-model fallback cascade). Jika 9Router belum menyala, sistem otomatis memakai template formula cerdas Zeinity.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  9Router Endpoint Base URL
                </label>
                <input
                  type="text"
                  value={localSettings.nineRouterBaseUrl}
                  onChange={e => setLocalSettings({ ...localSettings, nineRouterBaseUrl: e.target.value })}
                  placeholder="http://localhost:20128/v1"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  9Router API Key (Opsional / Kosongkan jika Local Proxy)
                </label>
                <input
                  type="password"
                  value={localSettings.nineRouterApiKey}
                  onChange={e => setLocalSettings({ ...localSettings, nineRouterApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nama Model / Combos (Fallback Tier)
                </label>
                <input
                  type="text"
                  value={localSettings.nineRouterCombo}
                  onChange={e => setLocalSettings({ ...localSettings, nineRouterCombo: e.target.value })}
                  placeholder="zeinity-combo"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestNineRouter}
                  disabled={nineRouterTestStatus?.loading}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all"
                >
                  {nineRouterTestStatus?.loading ? 'Menghubungi...' : 'Uji 9Router Gateway'}
                </button>

                {nineRouterTestStatus && (
                  <span className={`text-[11px] flex items-center gap-1 ${
                    nineRouterTestStatus.success ? 'text-emerald-400 font-semibold' : 'text-amber-400'
                  }`}>
                    {nineRouterTestStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {nineRouterTestStatus.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Unduh Cadangan Database (JSON)</h4>
                  <p className="text-slate-400 text-[11px]">Simpan seluruh {contents.length} data video Shorts ke komputer.</p>
                </div>
                <button
                  onClick={() => exportDatabaseToJson(contents)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Cadangkan JSON
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Pulihkan dari File Cadangan (JSON)</h4>
                  <p className="text-slate-400 text-[11px]">Unggah file .json untuk memulihkan seluruh proyek.</p>
                </div>
                <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Pilih File
                  <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                </label>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-red-300">Reset ke Starter Kit Bawaan Zeinity</h4>
                  <p className="text-red-400/80 text-[11px]">Kembalikan 4 contoh data video Shorts resmi Zeinity.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Yakin ingin mereset data ke contoh awal Zeinity?')) {
                      onResetContents();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white rounded-xl font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PEDOMAN STANDAR ZEINITY */}
          {activeTab === 'guide' && (
            <div className="space-y-3 leading-relaxed text-slate-300">
              <h4 className="text-sm font-bold text-white">Pedoman Inti Dokumen Operasional Zeinity</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong className="text-white">Format:</strong> Video vertikal (9:16) ≤ 60 detik.</li>
                <li><strong className="text-white">Batasan Kata Naskah:</strong> 90–140 kata (Tempo bicara 130–160 WPM).</li>
                <li><strong className="text-white">Formula Judul:</strong> Kalimat tanya 5–10 kata diawali "Apa", "Kenapa", atau "Bagaimana" diakhiri tanda tanya (?).</li>
                <li><strong className="text-white">Safe Zone Visual:</strong> Bebas teks 15% atas dan 25% bawah; seluruh teks penting wajib di center 60%.</li>
                <li><strong className="text-white">Jadwal Publikasi:</strong> Senin, Kamis & Minggu pukul 07:00 WIB.</li>
                <li><strong className="text-white">Target Metrik:</strong> Viewed vs Swiped ≥ 70%, Average Percentage Viewed (APV) 90%–110%.</li>
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#121422] p-4 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold shadow-md shadow-indigo-500/20"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
};
