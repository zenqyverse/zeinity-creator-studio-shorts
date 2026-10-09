import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  Send, 
  Copy, 
  Check, 
  Lightbulb, 
  FileText, 
  ShieldCheck, 
  Plus,
  RefreshCw,
  Zap,
  Repeat
} from 'lucide-react';
import { ContentPillar, ContentFormat, ContentItem, AppSettings } from '../types';
import { CONTENT_PILLARS, CONTENT_FORMATS } from '../constants/zeinityRules';
import { 
  generateTopicIdeas, 
  generateTitleVariations, 
  draftZeinityScript, 
  generateHookAlternatives,
  generateEndingLoopAlternatives,
  callNineRouter 
} from '../services/aiGateway';
import { createNewShort } from '../services/storage';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  onCreateShortFromIdea?: (item: ContentItem) => void;
  activeContent?: ContentItem | null;
  onApplyHookOrLoop?: (type: 'hook' | 'loop', text: string) => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenSettings,
  onCreateShortFromIdea,
  activeContent,
  onApplyHookOrLoop
}) => {
  const [activeTab, setActiveTab] = useState<'topics' | 'titles' | 'hook_loop' | 'script' | 'factcheck'>('topics');
  
  // Topic generation state
  const [selectedPillar, setSelectedPillar] = useState<ContentPillar>('internet_social');
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>('flash_news');
  const [generatedTopics, setGeneratedTopics] = useState<Array<{ title: string; hook: string; claim: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Titles generation state
  const [inputTopicForTitles, setInputTopicForTitles] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  // Hook & Loop generator state
  const [hookLoopType, setHookLoopType] = useState<'hook' | 'loop'>('hook');
  const [hookTopic, setHookTopic] = useState('');
  const [hookRefText, setHookRefText] = useState('');
  const [generatedHookLoops, setGeneratedHookLoops] = useState<string[]>([]);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  // Fact check state
  const [claimToVerify, setClaimToVerify] = useState('');
  const [factCheckResult, setFactCheckResult] = useState('');

  // Script drafter state
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptEvidence, setScriptEvidence] = useState('');
  const [generatedScript, setGeneratedScript] = useState<any>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Pre-populate input states from active content when opened
  React.useEffect(() => {
    if (activeContent) {
      if (!hookTopic) setHookTopic(activeContent.title);
      if (!hookRefText && activeContent.script?.stageHook) setHookRefText(activeContent.script.stageHook);
      if (!inputTopicForTitles) setInputTopicForTitles(activeContent.title);
      if (!scriptTopic) setScriptTopic(activeContent.title);
      setSelectedPillar(activeContent.pillar);
      setSelectedFormat(activeContent.format);
    }
  }, [activeContent]);

  if (!isOpen) return null;

  const handleFetchTopics = async () => {
    setIsLoading(true);
    try {
      const config = {
        baseUrl: settings.nineRouterBaseUrl,
        apiKey: settings.nineRouterApiKey,
        comboName: settings.nineRouterCombo
      };
      const topics = await generateTopicIdeas(selectedPillar, selectedFormat, config);
      setGeneratedTopics(topics);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchTitles = async () => {
    if (!inputTopicForTitles.trim()) return;
    setIsLoading(true);
    try {
      const config = {
        baseUrl: settings.nineRouterBaseUrl,
        apiKey: settings.nineRouterApiKey,
        comboName: settings.nineRouterCombo
      };
      const titles = await generateTitleVariations(inputTopicForTitles, 'YouTube Shorts Zeinity', config);
      setGeneratedTitles(titles);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyFact = async () => {
    if (!claimToVerify.trim()) return;
    setIsLoading(true);
    try {
      const config = {
        baseUrl: settings.nineRouterBaseUrl,
        apiKey: settings.nineRouterApiKey,
        comboName: settings.nineRouterCombo
      };
      const prompt = `
Analisis klaim digital berikut untuk kelayakan materi YouTube Shorts Zeinity:
Klaim: "${claimToVerify}"

Tolong berikan:
1. Status sementara (Apakah ini rilis resmi, rumor, atau fitur beta?)
2. Sumber resmi yang harus dicek kreator (misal changelog Android, dokumentasi Apple, atau blog Meta)
3. Peringatan misinformasi atau potensi salah paham bagi pengguna biasa.
`;
      const res = await callNineRouter(config, [
        { role: 'system', content: 'Kamu adalah fact-checker spesialis teknologi digital untuk Zeinity Shorts.' },
        { role: 'user', content: prompt }
      ]);
      setFactCheckResult(res);
    } catch (e: any) {
      setFactCheckResult(`Gagal menghubungi 9Router (${e.message}). Pastikan gateway 9Router aktif di ${settings.nineRouterBaseUrl}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftScript = async () => {
    if (!scriptTopic.trim()) return;
    setIsLoading(true);
    try {
      const config = {
        baseUrl: settings.nineRouterBaseUrl,
        apiKey: settings.nineRouterApiKey,
        comboName: settings.nineRouterCombo
      };
      const draft = await draftZeinityScript(scriptTopic, selectedPillar, selectedFormat, scriptEvidence, config);
      setGeneratedScript(draft);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchHookLoops = async () => {
    if (!hookTopic.trim()) return;
    setIsLoading(true);
    try {
      const config = {
        baseUrl: settings.nineRouterBaseUrl,
        apiKey: settings.nineRouterApiKey,
        comboName: settings.nineRouterCombo
      };

      if (hookLoopType === 'hook') {
        const hooks = await generateHookAlternatives(
          hookTopic,
          selectedPillar,
          selectedFormat,
          hookRefText,
          config
        );
        setGeneratedHookLoops(hooks);
      } else {
        const loops = await generateEndingLoopAlternatives(
          hookTopic,
          hookRefText,
          selectedPillar,
          selectedFormat,
          config
        );
        setGeneratedHookLoops(loops);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTopic = (topic: { title: string; hook: string; claim: string }) => {
    if (onCreateShortFromIdea) {
      const short = createNewShort(topic.title, selectedPillar, selectedFormat);
      short.hookText = topic.hook;
      short.script.stageHook = topic.hook;
      short.researchSources = [{
        id: 'res-' + Date.now().toString(36),
        platformOrTopic: CONTENT_PILLARS[selectedPillar].name,
        sourceUrl: '',
        sourceDate: new Date().toISOString().slice(0, 10),
        claim: topic.claim,
        evidenceQuote: '',
        summary: '',
        verificationStatus: 'unverified',
        isOfficialSource: false
      }];
      onCreateShortFromIdea(short);
      onClose();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0e101a] border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
      
      {/* Header */}
      <div className="p-4 sm:p-5 bg-[#121422] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              9Router AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Combo: <strong className="text-purple-300">{settings.nineRouterCombo}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-[#121422] px-3 border-b border-slate-800 flex items-center gap-1 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('topics')}
          className={`py-2.5 px-2.5 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'topics' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Topik
        </button>
        <button
          onClick={() => setActiveTab('titles')}
          className={`py-2.5 px-2.5 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'titles' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Judul
        </button>
        <button
          onClick={() => setActiveTab('hook_loop')}
          className={`py-2.5 px-2.5 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'hook_loop' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Hook & Looping
        </button>
        <button
          onClick={() => setActiveTab('script')}
          className={`py-2.5 px-2.5 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'script' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Draf Naskah
        </button>
        <button
          onClick={() => setActiveTab('factcheck')}
          className={`py-2.5 px-2.5 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'factcheck' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Cek Fakta
        </button>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
        
        {/* TAB 1: TOPIC DISCOVERY */}
        {activeTab === 'topics' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Cari kandidat topik baru yang relevan dengan 5 Pilar Zeinity dan formula kalimat tanya 5–10 kata.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">Pilar Konten:</label>
                <select
                  value={selectedPillar}
                  onChange={e => setSelectedPillar(e.target.value as ContentPillar)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  {Object.values(CONTENT_PILLARS).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">Format Shorts:</label>
                <select
                  value={selectedFormat}
                  onChange={e => setSelectedFormat(e.target.value as ContentFormat)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  {Object.values(CONTENT_FORMATS).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleFetchTopics}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isLoading ? 'Menghubungi 9Router AI...' : 'Generate 3 Ide Konten'}
            </button>

            {/* Results */}
            <div className="space-y-3 pt-2">
              {generatedTopics.map((top, idx) => (
                <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white">{top.title}</h4>
                  <p className="text-[11px] text-cyan-300/90 italic">Hook: "{top.hook}"</p>
                  <p className="text-[11px] text-slate-400">Klaim: {top.claim}</p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleUseTopic(top)}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Gunakan & Buat Short
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VARIATION TITLES */}
        {activeTab === 'titles' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Generate 5 variasi judul dengan formula "Apa / Kenapa / Bagaimana" dan panjang 5–10 kata.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={inputTopicForTitles}
                onChange={e => setInputTopicForTitles(e.target.value)}
                placeholder="Masukkan topik cth: Update privasi WhatsApp..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleFetchTitles}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Rancang Variasi Judul
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {generatedTitles.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-200">{t}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(t);
                      setCopiedIndex(idx);
                      setTimeout(() => setCopiedIndex(null), 1500);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: GENERATOR HOOK & LOOPING */}
        {activeTab === 'hook_loop' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Buat alternatif Hook tajam (0–3s, 8–15 kata) atau Seamless Looping penutup (46–60s) yang menyambung kembali ke awal naskah.
            </p>

            {/* Type selector: Hook vs Loop */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setHookLoopType('hook')}
                className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  hookLoopType === 'hook'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Alternatif Hook (0–3s)
              </button>
              <button
                onClick={() => setHookLoopType('loop')}
                className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  hookLoopType === 'loop'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                Seamless Loop (46–60s)
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">
                  Topik / Judul Short:
                </label>
                <input
                  type="text"
                  value={hookTopic}
                  onChange={e => setHookTopic(e.target.value)}
                  placeholder="cth: Apa Saja Fitur Baru WhatsApp Bulan Ini?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">
                  {hookLoopType === 'hook' ? 'Konteks / Sinyal Tambahan (Opsional):' : 'Teks Hook Awal (Untuk Loop Balik):'}
                </label>
                <input
                  type="text"
                  value={hookRefText}
                  onChange={e => setHookRefText(e.target.value)}
                  placeholder={hookLoopType === 'hook' ? 'cth: Aturan privasi baru larang screenshot foto profil' : 'cth: WhatsApp baru saja merilis pembaruan privasi...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Pilar:</label>
                  <select
                    value={selectedPillar}
                    onChange={e => setSelectedPillar(e.target.value as ContentPillar)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    {Object.values(CONTENT_PILLARS).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Format:</label>
                  <select
                    value={selectedFormat}
                    onChange={e => setSelectedFormat(e.target.value as ContentFormat)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    {Object.values(CONTENT_FORMATS).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleFetchHookLoops}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all mt-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isLoading ? 'Membuat Alternatif...' : hookLoopType === 'hook' ? 'Generate 4 Alternatif Hook' : 'Generate 4 Seamless Loop'}
              </button>
            </div>

            {/* Results */}
            <div className="space-y-2 pt-2">
              {generatedHookLoops.map((text, idx) => {
                const words = text.split(/\s+/).filter(Boolean).length;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-200 leading-relaxed flex-1">
                        <span className="text-purple-400 font-bold mr-1.5">#{idx + 1}</span>
                        {text}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(text);
                            setCopiedIndex(idx);
                            setTimeout(() => setCopiedIndex(null), 1500);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Salin teks"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {onApplyHookOrLoop && activeContent && (
                          <button
                            onClick={() => {
                              onApplyHookOrLoop(hookLoopType, text);
                              setAppliedIndex(idx);
                              setTimeout(() => setAppliedIndex(null), 1500);
                            }}
                            className="px-2.5 py-1 rounded bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition-all"
                            title="Terapkan ke naskah short yang sedang dibuka di workspace"
                          >
                            {appliedIndex === idx ? '✓ Diterapkan' : 'Terapkan'}
                          </button>
                        )}
                        {!activeContent && onCreateShortFromIdea && hookLoopType === 'hook' && (
                          <button
                            onClick={() => {
                              const item = createNewShort(hookTopic || 'Short Baru', selectedPillar, selectedFormat);
                              item.hookText = text;
                              item.script.stageHook = text;
                              onCreateShortFromIdea(item);
                            }}
                            className="px-2 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold transition-all"
                          >
                            + Buat Short
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{words} kata</span>
                      <span>~{Math.round((words / 145) * 60)}s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DRAF NASKAH */}
        {activeTab === 'script' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Buat draf naskah otomatis 90–140 kata dengan struktur 4-Stage sesuai format Zeinity.
            </p>

            <div className="space-y-2 text-xs">
              <input
                type="text"
                value={scriptTopic}
                onChange={e => setScriptTopic(e.target.value)}
                placeholder="Judul / Topik Short..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
              <textarea
                rows={2}
                value={scriptEvidence}
                onChange={e => setScriptEvidence(e.target.value)}
                placeholder="Catatan bukti changelog resmi atau poin penting..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
              />
              <button
                onClick={handleDraftScript}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Susun Naskah 4-Stage
              </button>
            </div>

            {generatedScript && (
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-white">Draf Siap Salin</span>
                  <span className="font-mono text-emerald-400">{generatedScript.totalWords} kata</span>
                </div>
                <div className="space-y-2 text-slate-200 bg-slate-950 p-3 rounded-lg leading-relaxed">
                  <p><strong>[Hook]:</strong> {generatedScript.stageHook}</p>
                  <p><strong>[Konteks]:</strong> {generatedScript.stageContext}</p>
                  <p><strong>[Payoff]:</strong> {generatedScript.stagePayoff}</p>
                  <p><strong>[Loop/CTA]:</strong> {generatedScript.stageEnding}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedScript.fullScript);
                    setCopiedIndex(99);
                    setTimeout(() => setCopiedIndex(null), 1500);
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                >
                  {copiedIndex === 99 ? 'Tersalin ke Clipboard!' : 'Salin Naskah Lengkap'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CEK FAKTA */}
        {activeTab === 'factcheck' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Evaluasi kebenaran klaim digital berdasarkan rujukan resmi changelog dan dokumentasi platform.
            </p>

            <div className="space-y-2 text-xs">
              <textarea
                rows={3}
                value={claimToVerify}
                onChange={e => setClaimToVerify(e.target.value)}
                placeholder="Masukkan klaim digital yang ingin diverifikasi..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
              />
              <button
                onClick={handleVerifyFact}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Analisis & Cek Fakta
              </button>
            </div>

            {factCheckResult && (
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {factCheckResult}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#121422] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate">Gateway: {settings.nineRouterBaseUrl}</span>
        <button
          onClick={onOpenSettings}
          className="text-purple-400 hover:underline flex-shrink-0 ml-2"
        >
          Konfigurasi
        </button>
      </div>

    </div>
  );
};
