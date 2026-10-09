import React, { useState, useEffect } from 'react';
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
  Volume2
} from 'lucide-react';
import { ContentItem, ContentFormat } from '../../types';
import { validateZeinityTitle, countWords, TITLE_FORMULA_TEMPLATES } from '../../services/titleValidator';
import { CONTENT_FORMATS, ZEINITY_STANDARDS } from '../../constants/zeinityRules';
import { generateTitleVariations, draftZeinityScript, getDefaultAiConfig } from '../../services/aiGateway';

interface TabScriptProps {
  content: ContentItem;
  onChange: (updated: ContentItem) => void;
  onOpenAiAssistant?: () => void;
}

export const TabScript: React.FC<TabScriptProps> = ({ content, onChange, onOpenAiAssistant }) => {
  const [editorMode, setEditorMode] = useState<'guided' | 'freeform'>('guided');
  const [copied, setCopied] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isDraftingScript, setIsDraftingScript] = useState(false);

  const formatMeta = CONTENT_FORMATS[content.format];
  const titleValidation = validateZeinityTitle(content.title);

  // Perhitungan kata & durasi
  const currentWpm = content.script.wpmPace || ZEINITY_STANDARDS.paceWpm.ideal;
  const stageHookWords = countWords(content.script.stageHook);
  const stageContextWords = countWords(content.script.stageContext);
  const stagePayoffWords = countWords(content.script.stagePayoff);
  const stageEndingWords = countWords(content.script.stageEnding);

  const totalWords = countWords(content.script.fullScript);
  const estimatedSeconds = Math.round((totalWords / currentWpm) * 60);

  // Status kesesuaian target kata Zeinity (90–140 kata)
  const isWordsOptimal = totalWords >= ZEINITY_STANDARDS.scriptWords.min && totalWords <= ZEINITY_STANDARDS.scriptWords.max;
  const isWordsTooShort = totalWords > 0 && totalWords < ZEINITY_STANDARDS.scriptWords.min;
  const isWordsTooLong = totalWords > ZEINITY_STANDARDS.scriptWords.max;

  // Sinkronisasi teks gabungan jika dalam mode guided
  const updateScriptStages = (newStages: Partial<typeof content.script>) => {
    const nextScript = { ...content.script, ...newStages };
    const merged = `${nextScript.stageHook} ${nextScript.stageContext} ${nextScript.stagePayoff} ${nextScript.stageEnding}`.trim();
    onChange({
      ...content,
      script: {
        ...nextScript,
        fullScript: merged
      },
      updatedAt: new Date().toISOString()
    });
  };

  // Sinkronisasi jika diedit dalam mode freeform
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

  const handleCopyFullScript = () => {
    navigator.clipboard.writeText(content.script.fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Title Suggestions
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

  // AI Script Auto-Drafter
  const handleAiDraftScript = async () => {
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

  return (
    <div className="space-y-6">
      
      {/* 1. TITLE VALIDATOR BOX */}
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

        {/* Validasi Metrik: Awalan, Panjang Kata, Tanda Tanya */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Awalan Formula */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            titleValidation.starter 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <span>Awalan: <strong>Apa / Kenapa / Bagaimana</strong></span>
            {titleValidation.starter ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          </div>

          {/* Panjang Kata (5-10 kata) */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            titleValidation.isWithinWordRange 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <span>Panjang: <strong>{titleValidation.wordCount} kata</strong> (Ideal: 5–10)</span>
            {titleValidation.isWithinWordRange ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          </div>

          {/* Tanda Tanya (?) */}
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

      {/* 2. SCRIPT ECONOMY & PACE CALCULATOR BAR */}
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

          {/* Selector Tempo Bicara (WPM) */}
          <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Tempo Bicara:</span>
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

          {/* Progress bar visual */}
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

      {/* 3. EDITOR MODE TOGGLE & ACTIONS */}
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleAiDraftScript}
            disabled={isDraftingScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {isDraftingScript ? 'Menyusun Naskah...' : 'Draf AI 9Router'}
          </button>

          <button
            onClick={handleCopyFullScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Naskah Utuh'}
          </button>
        </div>
      </div>

      {/* 4. RENDER SCRIPT EDITOR CONTENT */}
      {editorMode === 'guided' ? (
        <div className="space-y-4">
          
          {/* STAGE 1: HOOK */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <strong className="text-white font-semibold">STAGE 1 — VISUAL & AUDIO HOOK (Detik 0–3)</strong>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">{stageHookWords} kata (~{Math.round((stageHookWords / currentWpm) * 60)}s)</span>
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
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                <strong className="text-white font-semibold">STAGE 4 — SEAMLESS LOOP / SMART CTA (Detik 46–60)</strong>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">{stageEndingWords} kata (~{Math.round((stageEndingWords / currentWpm) * 60)}s)</span>
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
          </div>

        </div>
      ) : (
        /* FREEFORM / CONTINUOUS EDITOR */
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Editor Teks Bebas (Sinkronisasi Otomatis)</span>
            <span className="font-mono">{totalWords} kata</span>
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
    </div>
  );
};
