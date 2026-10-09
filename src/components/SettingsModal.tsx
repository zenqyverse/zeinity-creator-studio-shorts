import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  RefreshCw,
  Activity,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { AppSettings, ContentItem } from '../types';
import { testSupabaseConnection } from '../services/supabaseClient';
import { testNineRouterHealth, fetchNineRouterCombos, NineRouterCombo } from '../services/aiGateway';
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
  const [detectedCombos, setDetectedCombos] = useState<NineRouterCombo[]>([]);
  const [isDetectingCombos, setIsDetectingCombos] = useState(false);
  const [useCustomComboInput, setUseCustomComboInput] = useState(false);
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

  const handleDetectCombos = async () => {
    setIsDetectingCombos(true);
    const config = {
      baseUrl: localSettings.nineRouterBaseUrl,
      apiKey: localSettings.nineRouterApiKey,
      comboName: localSettings.nineRouterCombo
    };
    const combos = await fetchNineRouterCombos(config);
    setDetectedCombos(combos);
    setIsDetectingCombos(false);

    // Otomatis pilih combo yang ada jika nama saat ini belum valid
    if (combos.length > 0) {
      const match = combos.find(c => c.name === localSettings.nineRouterCombo);
      if (!match) {
        setLocalSettings(prev => ({ ...prev, nineRouterCombo: combos[0].name }));
      }
    }
  };

  const handleTestNineRouter = async () => {
    setNineRouterTestStatus({ loading: true });
    const config = {
      baseUrl: localSettings.nineRouterBaseUrl,
      apiKey: localSettings.nineRouterApiKey,
      comboName: localSettings.nineRouterCombo
    };
    const result = await testNineRouterHealth(config);
    setNineRouterTestStatus({
      loading: false,
      success: result.online,
      message: result.online
        ? `${result.message}${result.version ? ` (v${result.version})` : ''}`
        : result.message
    });

    if (result.online) {
      handleDetectCombos();
    }
  };

  // Deteksi otomatis Combos saat tab AI dibuka
  useEffect(() => {
    if (isOpen && activeTab === 'ai') {
      handleDetectCombos();
    }
  }, [isOpen, activeTab, localSettings.nineRouterBaseUrl, localSettings.nineRouterApiKey]);

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
              {/* Info block */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    9Router AI Gateway
                  </span>
                  <a
                    href="http://localhost:20128"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-white border border-purple-500/30 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Buka Dashboard
                  </a>
                </div>
                <p className="text-[11px] leading-relaxed text-purple-200/90">
                  9Router adalah AI Gateway lokal (biasanya di <code className="bg-slate-900/70 px-1 rounded text-cyan-300">localhost:20128</code>) yang menyediakan <strong>Combos</strong> — rantai multi-model fallback otomatis antar 40+ provider AI. Jika gateway tidak aktif, Zeinity Studio otomatis menggunakan template formula lokal.
                </p>
                <ul className="text-[10px] text-purple-300/80 space-y-0.5 pl-3 list-disc">
                  <li>Jalankan 9Router: <code className="bg-slate-900/70 px-1 rounded text-cyan-300">npx 9router</code> atau via installer</li>
                  <li>Buat Combo di dashboard, lalu salin namanya ke field di bawah</li>
                  <li>API Key tersedia di tab <strong>API Keys</strong> di dashboard 9Router</li>
                </ul>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  9Router Endpoint Base URL
                </label>
                <input
                  type="text"
                  value={localSettings.nineRouterBaseUrl}
                  onChange={e => setLocalSettings({ ...localSettings, nineRouterBaseUrl: e.target.value })}
                  placeholder="http://localhost:20128/v1"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Format: <code>http://localhost:20128/v1</code> (termasuk /v1 di akhir)</p>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  9Router API Key
                </label>
                <input
                  type="password"
                  value={localSettings.nineRouterApiKey}
                  onChange={e => setLocalSettings({ ...localSettings, nineRouterApiKey: e.target.value })}
                  placeholder="sk-xxxxxxxxxxxxxxxx-ocd8hb-xxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Salin dari tab "API Keys" di dashboard 9Router. Kosongkan untuk gateway tanpa autentikasi.</p>
              </div>

              {/* Combo Selection Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      Pilih Combo 9Router (Routing AI)
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Grup model fallback yang terdaftar di 9Router lokal Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectCombos}
                    disabled={isDetectingCombos}
                    className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-white border border-purple-500/30 px-2 py-0.5 rounded-lg transition-colors bg-purple-500/10 hover:bg-purple-500/20"
                    title="Pindai ulang daftar Combos dari 9Router"
                  >
                    <RefreshCw className={`w-3 h-3 ${isDetectingCombos ? 'animate-spin' : ''}`} />
                    <span>{isDetectingCombos ? 'Memindai...' : 'Pindai Ulang'}</span>
                  </button>
                </div>

                {/* If Combos Detected */}
                {detectedCombos.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detectedCombos.map(combo => {
                        const isSelected = localSettings.nineRouterCombo === combo.name;
                        return (
                          <div
                            key={combo.id}
                            onClick={() => {
                              setLocalSettings({ ...localSettings, nineRouterCombo: combo.name });
                              setUseCustomComboInput(false);
                            }}
                            className={`cursor-pointer p-3 rounded-xl border transition-all text-left relative ${
                              isSelected
                                ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20 ring-1 ring-purple-500'
                                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-xs text-white flex items-center gap-1.5 truncate">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-purple-400 ring-2 ring-purple-400/30' : 'bg-slate-600'}`} />
                                <span className="truncate">{combo.name}</span>
                              </span>
                              {isSelected && (
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-semibold shrink-0">
                                  Aktif
                                </span>
                              )}
                            </div>

                            {combo.models && combo.models.length > 0 ? (
                              <div className="mt-1">
                                <span className="text-[10px] text-purple-300/80 font-mono block mb-1">
                                  {combo.models.length} Model Fallback Chain:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {combo.models.slice(0, 3).map((m, idx) => (
                                    <span key={idx} className="text-[9px] font-mono bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[130px]">
                                      {m.replace(/^.*\//, '')}
                                    </span>
                                  ))}
                                  {combo.models.length > 3 && (
                                    <span className="text-[9px] font-mono text-slate-500 px-1 py-0.5">
                                      +{combo.models.length - 3} lagi
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic block mt-1">
                                Siap digunakan
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>
                        Combo aktif: <strong className="text-purple-300 font-mono">{localSettings.nineRouterCombo}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseCustomComboInput(!useCustomComboInput)}
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        {useCustomComboInput ? 'Tutup input manual' : 'Ketik nama combo manual'}
                      </button>
                    </div>

                    {useCustomComboInput && (
                      <input
                        type="text"
                        value={localSettings.nineRouterCombo}
                        onChange={e => setLocalSettings({ ...localSettings, nineRouterCombo: e.target.value })}
                        placeholder="Creator-Combo"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-purple-500 text-xs mt-1"
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={localSettings.nineRouterCombo}
                      onChange={e => setLocalSettings({ ...localSettings, nineRouterCombo: e.target.value })}
                      placeholder="Creator-Combo"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500 text-xs"
                    />
                    <p className="text-[10px] text-slate-500">
                      9Router belum terdeteksi aktif di {localSettings.nineRouterBaseUrl}. Anda bisa memasukkan nama combo secara manual (misal: <code>Creator-Combo</code> atau <code>Gemini-Cluster</code>).
                    </p>
                  </div>
                )}
              </div>

              {/* Test button & status */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestNineRouter}
                  disabled={nineRouterTestStatus?.loading}
                  className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all"
                >
                  {nineRouterTestStatus?.loading
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Memeriksa Gateway...</>
                    : <><Activity className="w-3.5 h-3.5" /> Uji Koneksi 9Router (Health Check)</>
                  }
                </button>

                {nineRouterTestStatus && !nineRouterTestStatus.loading && (
                  <div className={`p-2.5 rounded-xl text-[11px] flex items-start gap-2 ${
                    nineRouterTestStatus.success
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                  }`}>
                    {nineRouterTestStatus.success
                      ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    }
                    <span className="leading-relaxed">{nineRouterTestStatus.message}</span>
                  </div>
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
