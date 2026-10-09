import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Sparkles, 
  Clock, 
  Sliders, 
  HelpCircle, 
  Check, 
  SplitSquareVertical, 
  FileText,
  Volume2,
  History,
  Bookmark,
  RotateCcw,
  Trash2,
  Mic,
  Zap,
  Repeat,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { ContentItem, ContentFormat, ScriptVersionSnapshot } from '../../types';
import { validateZeinityTitle, countWords } from '../../services/titleValidator';
import { CONTENT_FORMATS, ZEINITY_STANDARDS } from '../../constants/zeinityRules';
import { 
  generateTitleVariations, 
  draftZeinityScript, 
  generateHookAlternatives, 
  generateEndingLoopAlternatives, 
  getDefaultAiConfig 
} from '../../services/aiGateway';
import { findSimilarTopics, SimilarTopicMatch } from '../../services/similarityService';
import { TeleprompterModal } from './TeleprompterModal';

interface TabScriptProps {
  content: ContentItem;
  onChange: (updated: ContentItem) => void;
  onOpenAiAssistant?: () => void;
  allContents?: ContentItem[];
}

export const TabScript: React.FC<TabScriptProps> = ({ 
  content, 
  onChange, 
  onOpenAiAssistant,
  allContents = []
}) => {
  const [editorMode, setEditorMode] = useState<'guided' | 'freeform'>('guided');
  const [copied, setCopied] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isDraftingScript, setIsDraftingScript] = useState(false);

  // Hook generator states
  const [hookAlternatives, setHookAlternatives] = useState<string[]>([]);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [showHookDrawer, setShowHookDrawer] = useState(false);
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);

  // Ending / Looping generator states
  const [endingAlternatives, setEndingAlternatives] = useState<string[]>([]);
  const [isGeneratingEndings, setIsGeneratingEndings] = useState(false);
  const [showEndingDrawer, setShowEndingDrawer] = useState(false);
  const [copiedEndingIdx, setCopiedEndingIdx] = useState<number | null>(null);

  // Version History states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [snapshotNote, setSnapshotNote] = useState('');
  const [showSnapshotInput, setShowSnapshotInput] = useState(false);
  const [expandedSnapId, setExpandedSnapId] = useState<string | null>(null);

  // Teleprompter Modal state
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);

  const formatMeta = CONTENT_FORMATS[content.format];
  const titleValidation = validateZeinityTitle(content.title);

  // Real-time topic similarity check
  const similarTopics: SimilarTopicMatch[] = findSimilarTopics(content.title, allContents, content.id);

  // Word count & duration calculations
  const currentWpm = content.script.wpmPace || ZEINITY_STANDARDS.paceWpm.ideal;
  const stageHookWords = countWords(content.script.stageHook);
  const stageContextWords = countWords(content.script.stageContext);
  const stagePayoffWords = countWords(content.script.stagePayoff);
  const stageEndingWords = countWords(content.script.stageEnding);

  const totalWords = countWords(content.script.fullScript);
  const estimatedSeconds = Math.round((totalWords / currentWpm) * 60);

  // Zeinity script words constraints (90–140 words)
  const isWordsOptimal = totalWords >= ZEINITY_STANDARDS.scriptWords.min && totalWords <= ZEINITY_STANDARDS.scriptWords.max;
  const isWordsTooShort = totalWords > 0 && totalWords < ZEINITY_STANDARDS.scriptWords.min;
  const isWordsTooLong = totalWords > ZEINITY_STANDARDS.scriptWords.max;

  // Sync stage edits into fullScript and keep hookText synchronized
  const updateScriptStages = (newStages: Partial<typeof content.script>) => {
    const nextScript = { ...content.script, ...newStages };
    const merged = `${nextScript.stageHook} ${nextScript.stageContext} ${nextScript.stagePayoff} ${nextScript.stageEnding}`.trim();
    onChange({
      ...content,
      hookText: newStages.stageHook !== undefined ? newStages.stageHook : content.hookText,
      script: {
        ...nextScript,
        fullScript: merged
      },
      updatedAt: new Date().toISOString()
    });
  };

  // Sync freeform edits into fullScript
  const handleFreeformChange = (text: string) => {
    onChange({
      ...content,
      script: {
        ...content.script,
        fullScript: text
      },
      updatedAt: new Date().toISOString()
    });
  };

  // Helper membagi naskah utuh ke 4 stage secara proporsional
  const handleSyncFreeformToStages = () => {
    const text = content.script.fullScript.trim();
    if (!text) return;
    
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || [text];
    
    let hook = '';
    let context = '';
    let payoff = '';
    let ending = '';
    
    if (sentences.length === 1) {
      hook = sentences[0];
    } else if (sentences.length === 2) {
      hook = sentences[0];
      payoff = sentences[1];
    } else if (sentences.length === 3) {
      hook = sentences[0];
      context = sentences[1];
      ending = sentences[2];
    } else {
      hook = sentences[0];
      context = sentences[1];
      ending = sentences[sentences.length - 1];
      payoff = sentences.slice(2, sentences.length - 1).join(' ');
    }
    
    updateScriptStages({
      stageHook: hook,
      stageContext: context,
      stagePayoff: payoff,
      stageEnding: ending
    });
  };

  const handleCopyFullScript = () => {
    navigator.clipboard.writeText(content.script.fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Generate Title Suggestions
  const handleGenerateTitles = async () => {
    setIsGeneratingTitles(true);
    try {
      const config = getDefaultAiConfig();
      const results = await generateTitleVariations(content.title, content.notes || 'YouTube Shorts Zeinity', config);
      setTitleSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  // 2. Hook Alternatives Generator (0–3s)
  const handleGenerateHooks = async () => {
    setIsGeneratingHooks(true);
    try {
      const config = getDefaultAiConfig();
      const results = await generateHookAlternatives(
        content.title,
        content.pillar,
        content.format,
        content.notes || '',
        config
      );
      setHookAlternatives(results);
      setShowHookDrawer(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  const handleApplyHook = (hookText: string) => {
    updateScriptStages({ stageHook: hookText });
  };

  // 3. Seamless Loop Ending Generator (46–60s)
  const handleGenerateEndings = async () => {
    setIsGeneratingEndings(true);
    try {
      const config = getDefaultAiConfig();
      const results = await generateEndingLoopAlternatives(
        content.title,
        content.script.stageHook,
        content.pillar,
        content.format,
        config
      );
      setEndingAlternatives(results);
      setShowEndingDrawer(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingEndings(false);
    }
  };

  const handleApplyEnding = (endingText: string) => {
    updateScriptStages({ stageEnding: endingText });
  };

  // 4. Save Version Snapshot
  const handleSaveSnapshot = (noteText?: string) => {
    const currentWords = countWords(content.script.fullScript);
    const snapshot: ScriptVersionSnapshot = {
      id: 'snap-' + Date.now().toString(36),
      version: content.script.version,
      timestamp: new Date().toISOString(),
      stageHook: content.script.stageHook,
      stageContext: content.script.stageContext,
      stagePayoff: content.script.stagePayoff,
      stageEnding: content.script.stageEnding,
      fullScript: content.script.fullScript,
      wordCount: currentWords,
      wpmPace: currentWpm,
      note: noteText || snapshotNote.trim() || `Revisi Manual #${content.script.version}`
    };

    const existingHistory = content.script.history || [];
    onChange({
      ...content,
      script: {
        ...content.script,
        version: content.script.version + 1,
        history: [snapshot, ...existingHistory]
      },
      updatedAt: new Date().toISOString()
    });

    setSnapshotNote('');
    setShowSnapshotInput(false);
  };

  // 5. Restore from Snapshot
  const handleRestoreSnapshot = (snap: ScriptVersionSnapshot) => {
    // Simpan snapshot keadaan saat ini terlebih dahulu sebelum ditimpa
    const preRestoreSnapshot: ScriptVersionSnapshot = {
      id: 'snap-' + Date.now().toString(36),
      version: content.script.version,
      timestamp: new Date().toISOString(),
      stageHook: content.script.stageHook,
      stageContext: content.script.stageContext,
      stagePayoff: content.script.stagePayoff,
      stageEnding: content.script.stageEnding,
      fullScript: content.script.fullScript,
      wordCount: countWords(content.script.fullScript),
      wpmPace: currentWpm,
      note: `Sebelum restore ke v${snap.version}`
    };

    const existingHistory = content.script.history || [];
    onChange({
      ...content,
      hookText: snap.stageHook || content.hookText,
      script: {
        ...content.script,
        stageHook: snap.stageHook,
        stageContext: snap.stageContext,
        stagePayoff: snap.stagePayoff,
        stageEnding: snap.stageEnding,
        fullScript: snap.fullScript,
        wpmPace: snap.wpmPace || currentWpm,
        version: content.script.version + 1,
        history: [preRestoreSnapshot, ...existingHistory]
      },
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteSnapshot = (snapId: string) => {
    const existingHistory = content.script.history || [];
    onChange({
      ...content,
      script: {
        ...content.script,
        history: existingHistory.filter(h => h.id !== snapId)
      },
      updatedAt: new Date().toISOString()
    });
  };

  // 6. AI Script Auto-Drafter (with auto-backup snapshot)
  const handleAiDraftScript = async () => {
    if (content.script.fullScript.trim()) {
      handleSaveSnapshot('Sebelum Draf AI 9Router');
    }

    setIsDraftingScript(true);
    try {
      const config = getDefaultAiConfig();
      const evidence = content.researchSources.map(s => `${s.claim} (${s.evidenceQuote})`).join('. ');
      const draft = await draftZeinityScript(content.title, content.pillar, content.format, evidence, config);
      
      onChange({
        ...content,
        script: {
          ...content.script,
          stageHook: draft.stageHook,
          stageContext: draft.stageContext,
          stagePayoff: draft.stagePayoff,
          stageEnding: draft.stageEnding,
          fullScript: draft.fullScript,
          version: content.script.version + 1
        },
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDraftingScript(false);
    }
  };

  // Checklist callback when VO completed from teleprompter
  const handleMarkVoCompleted = () => {
    onChange({
      ...content,
      checklist: {
        ...content.checklist,
        voRecorded: true
      },
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TITLE VALIDATOR & TOPIC SIMILARITY WARNING BOX */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Title Studio & Validator</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              titleValidation.isValid 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              {titleValidation.isValid ? '✓ Judul Sesuai Pedoman Zeinity' : '! Perlu Penyesuaian'}
            </span>
          </div>

          <button
            onClick={handleGenerateTitles}
            disabled={isGeneratingTitles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {isGeneratingTitles ? 'Merumuskan Variasi...' : 'Buat Variasi Formula Judul'}
          </button>
        </div>

        {/* Input Judul */}
        <div>
          <input
            type="text"
            value={content.title}
            onChange={e => onChange({ ...content, title: e.target.value, updatedAt: new Date().toISOString() })}
            placeholder="Apa / Kenapa / Bagaimana [Nama Objek/Masalah]?"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* TOPIC SIMILARITY & DUPLICATE WARNING */}
        {similarTopics.length > 0 && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Peringatan Kemiripan Topik ({similarTopics.length} video serupa di database)</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Judul ini memiliki kemiripan kata kunci atau membahas topik yang sudah ada sebelumnya. Pastikan mengambil sudut pandang (angle) baru atau fokus berbeda agar tidak terjadi kanibalisasi konten.
            </p>
            <div className="space-y-1.5 pt-1">
              {similarTopics.slice(0, 3).map(sim => (
                <div key={sim.item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      sim.similarityLevel === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {sim.score}% Mirip
                    </span>
                    <span className="text-white font-medium truncate">{sim.item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                    {sim.matchedKeywords.length > 0 && (
                      <span className="text-slate-500 hidden md:inline">
                        Kata kunci: {sim.matchedKeywords.join(', ')}
                      </span>
                    )}
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 uppercase">
                      {sim.item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validasi Metrik: Awalan, Panjang Kata, Tanda Tanya */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            titleValidation.starter 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <span>Awalan: <strong>Apa / Kenapa / Bagaimana</strong></span>
            {titleValidation.starter ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            titleValidation.isWithinWordRange 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <span>Panjang: <strong>{titleValidation.wordCount} kata</strong> (Ideal: 5–10)</span>
            {titleValidation.isWithinWordRange ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            titleValidation.hasQuestionMark 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <span>Format: <strong>Kalimat Tanya (?)</strong></span>
            {titleValidation.hasQuestionMark ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          </div>
        </div>

        {/* Issue Explanations jika ada */}
        {titleValidation.issues.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1 text-xs text-red-300">
            {titleValidation.issues.map((issue, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Suggestion list if generated */}
        {titleSuggestions.length > 0 && (
          <div className="pt-2 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">Klik salah satu untuk menerapkan:</span>
            <div className="flex flex-wrap gap-2">
              {titleSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange({ ...content, title: sug, updatedAt: new Date().toISOString() })}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700 transition-colors text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. SCRIPT ECONOMY, PACE CALCULATOR & TELEPROMPTER BAR */}
      <div className="bg-[#11131f] p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Script Economy & Pace Calculator
            </h4>
            <p className="text-xs text-slate-400">
              Format: <strong className="text-white">{formatMeta.name}</strong> ({formatMeta.durationLabel}) | Standar: <strong className="text-white">90–140 kata</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector Tempo Bicara (WPM) */}
            <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Tempo:</span>
              <select
                value={currentWpm}
                onChange={e => onChange({
                  ...content,
                  script: { ...content.script, wpmPace: parseInt(e.target.value) },
                  updatedAt: new Date().toISOString()
                })}
                className="bg-transparent font-bold text-white focus:outline-none"
              >
                <option value={135} className="bg-slate-900">135 WPM (Santai)</option>
                <option value={145} className="bg-slate-900">145 WPM (Ideal Zeinity)</option>
                <option value={155} className="bg-slate-900">155 WPM (Cepat / Flash)</option>
              </select>
            </div>

            {/* Launch Teleprompter Button */}
            <button
              onClick={() => setIsTeleprompterOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all"
              title="Buka Mode Teleprompter Berjalan untuk Rekaman Vokal Voice-Over"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Mode Teleprompter VO
            </button>
          </div>
        </div>

        {/* Meter Bar Jumlah Kata & Durasi */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <span className={`font-extrabold text-sm ${
                isWordsOptimal ? 'text-emerald-400' : isWordsTooLong ? 'text-red-400' : 'text-amber-400'
              }`}>
                {totalWords}
              </span>
              <span className="text-slate-400">/ 90–140 Kata</span>
            </span>

            <span className="flex items-center gap-1 text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Estimasi Durasi: <strong className="text-white text-sm">~{estimatedSeconds}s</strong>
              <span className="text-slate-500"> (Target: {content.targetDurationSec}s)</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800 flex">
            <div 
              style={{ width: `${Math.min((totalWords / 140) * 100, 100)}%` }} 
              className={`h-full rounded-full transition-all duration-300 ${
                isWordsOptimal 
                  ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' 
                  : isWordsTooLong 
                    ? 'bg-red-500' 
                    : 'bg-amber-400'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>0 kata</span>
            <span>90 kata (Batas Minimum)</span>
            <span>140 kata (Batas Maksimal)</span>
          </div>
        </div>
      </div>

      {/* 3. EDITOR TOOLBAR & VERSION HISTORY ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setEditorMode('guided')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              editorMode === 'guided'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            4-Stage Guided Editor
          </button>
          <button
            onClick={() => setEditorMode('freeform')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              editorMode === 'freeform'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Continuous Script View
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Version History Toggle */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isHistoryOpen
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Buka panel riwayat revisi dan restore snapshot"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Versi & Riwayat ({(content.script.history || []).length})</span>
          </button>

          {/* Save Snapshot Button */}
          <button
            onClick={() => setShowSnapshotInput(!showSnapshotInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            title="Simpan snapshot naskah saat ini"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Simpan Snapshot</span>
          </button>

          {/* AI Drafter Button */}
          <button
            onClick={handleAiDraftScript}
            disabled={isDraftingScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {isDraftingScript ? 'Menyusun Naskah...' : 'Draf AI 9Router'}
          </button>

          {/* Copy Full Script Button */}
          <button
            onClick={handleCopyFullScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Naskah'}
          </button>
        </div>
      </div>

      {/* SNAPSHOT CREATION INPUT POPOVER */}
      {showSnapshotInput && (
        <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row items-center gap-3 animate-fadeIn">
          <input
            type="text"
            value={snapshotNote}
            onChange={e => setSnapshotNote(e.target.value)}
            placeholder="Catatan versi (misal: 'Revisi hook tajam', 'Selesai cek tempo')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveSnapshot()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Simpan Versi Baru
            </button>
            <button
              onClick={() => setShowSnapshotInput(false)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* SCRIPT VERSION HISTORY PANEL */}
      {isHistoryOpen && (
        <div className="bg-[#11131f] border border-slate-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Riwayat Revisi Naskah & Snapshot Restore
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {(content.script.history || []).length} snapshot tersimpan
              </span>
            </div>

            <button
              onClick={() => setIsHistoryOpen(false)}
              className="text-slate-500 hover:text-white text-xs"
            >
              Tutup Panel
            </button>
          </div>

          {(content.script.history || []).length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              Belum ada snapshot naskah yang disimpan. Klik "Simpan Snapshot" untuk mencatat versi naskah saat ini.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(content.script.history || []).map((snap) => (
                <div
                  key={snap.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 overflow-hidden flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                          v{snap.version}
                        </span>
                        <strong className="text-xs text-white">{snap.note || 'Snapshot'}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(snap.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                        {snap.fullScript ? `"${snap.fullScript.slice(0, 90)}..."` : '(Teks kosong)'}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                        <span>{snap.wordCount} kata</span>
                        <span>~{Math.round((snap.wordCount / (snap.wpmPace || 145)) * 60)}s</span>
                        <button
                          type="button"
                          onClick={() => setExpandedSnapId(expandedSnapId === snap.id ? null : snap.id)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 underline font-sans"
                        >
                          <Eye className="w-3 h-3" />
                          {expandedSnapId === snap.id ? 'Sembunyikan' : 'Lihat Detail'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
                        title="Kembalikan naskah saat ini ke versi ini"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </button>

                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Hapus snapshot ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE 4-STAGE PREVIEW */}
                  {expandedSnapId === snap.id && (
                    <div className="pt-2.5 mt-2 border-t border-slate-800/80 space-y-2 text-[11px] font-sans animate-fadeIn">
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-cyan-500/20">
                        <span className="font-bold text-cyan-400">Stage 1 Hook (0–3s): </span>
                        <span className="text-slate-300">{snap.stageHook || '(kosong)'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-indigo-500/20">
                        <span className="font-bold text-indigo-400">Stage 2 Context (4–10s): </span>
                        <span className="text-slate-300">{snap.stageContext || '(kosong)'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-amber-500/20">
                        <span className="font-bold text-amber-400">Stage 3 Payoff (11–45s): </span>
                        <span className="text-slate-300">{snap.stagePayoff || '(kosong)'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-pink-500/20">
                        <span className="font-bold text-pink-400">Stage 4 Loop (46–60s): </span>
                        <span className="text-slate-300">{snap.stageEnding || '(kosong)'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. RENDER SCRIPT EDITOR CONTENT */}
      {editorMode === 'guided' ? (
        <div className="space-y-4">
          
          {/* STAGE 1: HOOK */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <strong className="text-white font-semibold">STAGE 1 — VISUAL & AUDIO HOOK (Detik 0–3)</strong>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 text-[11px]">
                  {stageHookWords} kata (~{Math.round((stageHookWords / currentWpm) * 60)}s)
                </span>

                <button
                  onClick={handleGenerateHooks}
                  disabled={isGeneratingHooks}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all"
                  title="Generate alternatif hook detik 0–3 dengan 9Router AI"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  {isGeneratingHooks ? 'Membuat Hook...' : '⚡ Alternatif Hook (0–3s)'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-cyan-300/80 leading-relaxed">
              Panduan Format: {formatMeta.stagesGuide.stage1}. Tanpa basa-basi/sapaan.
            </p>

            <textarea
              rows={2}
              value={content.script.stageHook}
              onChange={e => updateScriptStages({ stageHook: e.target.value })}
              placeholder="Masukkan kalimat hook tajam detik ke-0..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />

            {/* GENERATED HOOK ALTERNATIVES DRAWER */}
            {showHookDrawer && hookAlternatives.length > 0 && (
              <div className="p-3 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Pilihan Alternatif Hook Tajam (0–3 Detik):
                  </span>
                  <button
                    onClick={() => setShowHookDrawer(false)}
                    className="text-slate-500 hover:text-white text-[11px]"
                  >
                    Tutup
                  </button>
                </div>

                <div className="space-y-1.5">
                  {hookAlternatives.map((hk, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-2 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="text-xs text-slate-200 leading-relaxed flex-1">
                        <span className="text-cyan-400 font-bold mr-1.5">#{idx + 1}</span>
                        {hk}
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">
                          ({countWords(hk)} kata)
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(hk);
                            setCopiedHookIdx(idx);
                            setTimeout(() => setCopiedHookIdx(null), 1500);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Salin hook"
                        >
                          {copiedHookIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleApplyHook(hk)}
                          className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STAGE 2: CONTEXT */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <strong className="text-white font-semibold">STAGE 2 — CONTEXT ACCELERATION (Detik 4–10)</strong>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">{stageContextWords} kata (~{Math.round((stageContextWords / currentWpm) * 60)}s)</span>
            </div>
            <p className="text-[11px] text-indigo-300/80 leading-relaxed">
              Panduan Format: {formatMeta.stagesGuide.stage2}. Mengapa penonton harus peduli sekarang.
            </p>
            <textarea
              rows={2}
              value={content.script.stageContext}
              onChange={e => updateScriptStages({ stageContext: e.target.value })}
              placeholder="Berikan konteks minimum dalam 1-2 kalimat..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* STAGE 3: CORE PAYOFF */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <strong className="text-white font-semibold">STAGE 3 — CORE VALUE / PAYOFF (Detik 11–45)</strong>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">{stagePayoffWords} kata (~{Math.round((stagePayoffWords / currentWpm) * 60)}s)</span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Panduan Format: {formatMeta.stagesGuide.stage3}. Tampilkan bukti visual & langkah konkret.
            </p>
            <textarea
              rows={4}
              value={content.script.stagePayoff}
              onChange={e => updateScriptStages({ stagePayoff: e.target.value })}
              placeholder="Sajikan poin-poin konkret dan bukti changelog resmi..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* STAGE 4: ENDING / LOOP */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                <strong className="text-white font-semibold">STAGE 4 — SEAMLESS LOOP / SMART CTA (Detik 46–60)</strong>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 text-[11px]">
                  {stageEndingWords} kata (~{Math.round((stageEndingWords / currentWpm) * 60)}s)
                </span>

                <button
                  onClick={handleGenerateEndings}
                  disabled={isGeneratingEndings}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 text-[11px] font-semibold transition-all"
                  title="Generate alternatif seamless loop & penutup dengan 9Router AI"
                >
                  <Repeat className="w-3 h-3 text-pink-400" />
                  {isGeneratingEndings ? 'Membuat Penutup...' : '🔄 Alternatif Loop Ending (46–60s)'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-pink-300/80 leading-relaxed">
              Panduan Format: {formatMeta.stagesGuide.stage4}. Loop alami kembali ke hook atau ajakan cek setelan.
            </p>

            <textarea
              rows={2}
              value={content.script.stageEnding}
              onChange={e => updateScriptStages({ stageEnding: e.target.value })}
              placeholder="Kalimat penutup looping atau ajakan bertindak..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 leading-relaxed"
            />

            {/* GENERATED ENDING ALTERNATIVES DRAWER */}
            {showEndingDrawer && endingAlternatives.length > 0 && (
              <div className="p-3 bg-slate-950/80 border border-pink-500/30 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-pink-300 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5" />
                    Pilihan Alternatif Seamless Looping & Smart CTA:
                  </span>
                  <button
                    onClick={() => setShowEndingDrawer(false)}
                    className="text-slate-500 hover:text-white text-[11px]"
                  >
                    Tutup
                  </button>
                </div>

                <div className="space-y-1.5">
                  {endingAlternatives.map((end, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-2 hover:border-pink-500/40 transition-colors"
                    >
                      <div className="text-xs text-slate-200 leading-relaxed flex-1">
                        <span className="text-pink-400 font-bold mr-1.5">#{idx + 1}</span>
                        {end}
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">
                          ({countWords(end)} kata)
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(end);
                            setCopiedEndingIdx(idx);
                            setTimeout(() => setCopiedEndingIdx(null), 1500);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Salin penutup"
                        >
                          {copiedEndingIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleApplyEnding(end)}
                          className="px-2.5 py-1 rounded bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-[11px] font-semibold"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* FREEFORM / CONTINUOUS EDITOR */
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Editor Teks Bebas</span>
              <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">{totalWords} kata</span>
            </div>
            <button
              type="button"
              onClick={handleSyncFreeformToStages}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
              title="Bagi naskah bebas ini ke 4 stage secara proporsional"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              Sinkronkan ke 4 Stage Guided
            </button>
          </div>
          <textarea
            rows={12}
            value={content.script.fullScript}
            onChange={e => handleFreeformChange(e.target.value)}
            placeholder="Tuliskan naskah lengkap di sini..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>
      )}

      {/* TELEPROMPTER MODAL */}
      <TeleprompterModal
        content={content}
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        onMarkVoCompleted={handleMarkVoCompleted}
      />

    </div>
  );
};
