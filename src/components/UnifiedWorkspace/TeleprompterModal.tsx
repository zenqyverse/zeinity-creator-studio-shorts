import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Maximize, 
  Minimize, 
  FlipHorizontal, 
  Mic, 
  MicOff, 
  Download, 
  Sliders, 
  Volume2, 
  Layers, 
  Type, 
  Clock, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { ContentItem } from '../../types';
import { ZEINITY_STANDARDS } from '../../constants/zeinityRules';

interface TeleprompterModalProps {
  content: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onMarkVoCompleted?: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  content,
  isOpen,
  onClose,
  onMarkVoCompleted
}) => {
  // WPM tempo (130 - 160 WPM)
  const initialWpm = content.script.wpmPace || ZEINITY_STANDARDS.paceWpm.ideal;
  const [wpm, setWpm] = useState<number>(initialWpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [isMirrored, setIsMirrored] = useState(false);
  const [viewMode, setViewMode] = useState<'continuous' | 'stages'>('stages');
  const [elapsedSec, setElapsedSec] = useState(0);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Teleprompter container refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Script text & stats
  const scriptText = content.script.fullScript || 
    `${content.script.stageHook} ${content.script.stageContext} ${content.script.stagePayoff} ${content.script.stageEnding}`.trim();
  const totalWords = scriptText.split(/\s+/).filter(Boolean).length;
  const targetDurationSec = Math.round((totalWords / wpm) * 60);

  // Reset scroll and states when opened or reset
  const handleReset = () => {
    setIsPlaying(false);
    setCountdown(null);
    setElapsedSec(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleReset();
    } else {
      stopRecording();
    }
  }, [isOpen]);

  // Countdown and play/pause toggling
  const handleTogglePlay = () => {
    if (countdown !== null) {
      // Langsung lewati hitungan mundur jika ditekan lagi
      setCountdown(null);
      setIsPlaying(true);
      return;
    }
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // Jika baru dari awal (posisi scroll atas dan belum berjalan), jalankan 3-2-1
      const isAtStart = (scrollContainerRef.current?.scrollTop || 0) <= 20 && elapsedSec === 0;
      if (isAtStart) {
        setCountdown(3);
      } else {
        // Melanjutkan pembacaan secara instan tanpa delay
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 1) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 800);
      return () => clearTimeout(timer);
    } else if (countdown === 1) {
      const timer = setTimeout(() => {
        setCountdown(null);
        setIsPlaying(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-scroll loop dengan kalkulasi kecepatan adaptif real-time
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    const step = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (container) {
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const currentTargetSec = Math.round((totalWords / wpm) * 60);
        const pixelsPerSecond = scrollHeight > 0 && currentTargetSec > 0
          ? scrollHeight / currentTargetSec
          : 35;

        const nextScroll = container.scrollTop + pixelsPerSecond * deltaTime;
        container.scrollTop = nextScroll;

        // Cek jika sudah mencapai batas bawah
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
          setIsPlaying(false);
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, wpm, totalWords, fontSize, viewMode]);

  // Elapsed timer when playing
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setElapsedSec(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Keyboard navigation shortcuts (Spasi, R, Esc, ArrowUp, ArrowDown)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setWpm(prev => Math.min(160, prev + 2));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setWpm(prev => Math.max(130, prev - 2));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, countdown]);

  // Audio recording handlers dengan multi-format Safari & Chrome compatibility
  const getSupportedAudioMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'];
    return candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
  };

  const startRecording = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        alert('Fitur perekaman suara tidak didukung pada browser ini atau membutuhkan koneksi aman HTTPS.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const detectedMime = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: detectedMime });
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onMarkVoCompleted) {
          onMarkVoCompleted();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      alert('Tidak dapat mengakses mikrofon. Pastikan mikrofon terpasang dan izin diberikan di browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const isMp4 = mediaRecorderRef.current?.mimeType?.includes('mp4');
    const ext = isMp4 ? 'mp4' : 'webm';
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `vo-${content.id}-${Date.now().toString(36)}.${ext}`;
    a.click();
  };

  if (!isOpen) return null;

  const fontClasses = {
    sm: 'text-lg sm:text-xl leading-relaxed',
    md: 'text-2xl sm:text-3xl leading-relaxed',
    lg: 'text-3xl sm:text-4xl lg:text-5xl leading-relaxed font-medium',
    xl: 'text-4xl sm:text-5xl lg:text-6xl leading-relaxed font-semibold'
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05060a] flex flex-col select-none animate-fadeIn overflow-hidden">
      
      {/* TOP CONTROL BAR */}
      <header className="bg-[#0b0d17]/95 border-b border-slate-800/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Mode Teleprompter Voice-Over
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            | {content.title}
          </span>
        </div>

        {/* Center: Play, Pause, Reset, WPM & Duration Info */}
        <div className="flex items-center gap-3">
          {/* WPM Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 hidden md:inline">Tempo:</span>
            <select
              value={wpm}
              onChange={e => setWpm(parseInt(e.target.value))}
              className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value={130} className="bg-slate-900">130 WPM (Santai)</option>
              <option value={138} className="bg-slate-900">138 WPM</option>
              <option value={145} className="bg-slate-900">145 WPM (Ideal Zeinity)</option>
              <option value={152} className="bg-slate-900">152 WPM</option>
              <option value={160} className="bg-slate-900">160 WPM (Flash News)</option>
            </select>
          </div>

          {/* Stats: Word Count & Target Duration */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-xl text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatSeconds(elapsedSec)} / ~{formatSeconds(targetDurationSec)}</span>
            <span className="text-slate-500">({totalWords} kata)</span>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Jeda (Space)
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Mulai Gulir (Space)
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset ke awal (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Recording, Typography, Mirror, Close */}
        <div className="flex items-center gap-2">
          {/* Voice Recording Control */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-all"
              title="Rekam Audio Suara Langsung"
            >
              <Mic className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Rekam VO</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-600 text-white animate-pulse text-xs font-semibold"
              title="Hentikan Rekaman Audio"
            >
              <MicOff className="w-3.5 h-3.5" />
              <span>Stop Rekam</span>
            </button>
          )}

          {/* In-Modal Audio Preview & Download */}
          {audioUrl && !isRecording && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-emerald-500/30 rounded-xl px-2 py-1">
              <audio src={audioUrl} controls className="h-6 w-32 sm:w-44" />
              <button
                onClick={handleDownloadAudio}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold"
                title="Unduh Hasil Rekaman VO"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Unduh</span>
              </button>
            </div>
          )}

          {/* Font Size Selector */}
          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded-lg ${fontSize === 'sm' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              S
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-1 rounded-lg ${fontSize === 'md' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              M
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded-lg ${fontSize === 'lg' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              L
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-1 rounded-lg ${fontSize === 'xl' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              XL
            </button>
          </div>

          {/* View Mode Toggle: Stages vs Continuous */}
          <button
            onClick={() => setViewMode(prev => prev === 'stages' ? 'continuous' : 'stages')}
            className={`p-1.5 rounded-xl border transition-all ${
              viewMode === 'stages'
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Ganti Mode Tampilan (Per-Stage atau Teks Utuh)"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Mirror Toggle (for glass teleprompter mirrors) */}
          <button
            onClick={() => setIsMirrored(prev => !prev)}
            className={`p-1.5 rounded-xl border transition-all ${
              isMirrored
                ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Mirror Horisontal Teks (Kaca Teleprompter)"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Exit / Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Keluar dari Teleprompter (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div 
          onClick={() => { setCountdown(null); setIsPlaying(true); }}
          className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center animate-fadeIn cursor-pointer"
          title="Klik atau tekan Spasi untuk langsung mulai"
        >
          <div className="text-center space-y-4">
            <span className="text-8xl sm:text-9xl font-extrabold text-cyan-400 animate-bounce block">
              {countdown}
            </span>
            <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
              Tarik napas & siap membaca... (Klik / Spasi untuk Langsung Mulai)
            </p>
          </div>
        </div>
      )}

      {/* READING EYE-LINE GUIDE OVERLAY */}
      <div 
        className="pointer-events-none absolute left-0 right-0 top-1/3 h-28 border-y-2 border-indigo-500/25 bg-indigo-500/5 z-10 flex items-center justify-between px-6"
        aria-hidden="true"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400/60 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/20">
          ▲ FOKUS PANDANGAN BACA (EYE-LINE)
        </span>
        <span className="text-[10px] font-mono text-indigo-400/40">
          TEMPO: {wpm} WPM (▲/▼ Arrow)
        </span>
      </div>

      {/* MAIN SCRIPT READING CANVAS */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 sm:px-16 md:px-28 lg:px-44 py-36 scroll-smooth"
        style={{ scrollBehavior: 'auto' }}
      >
        {viewMode === 'stages' ? (
          /* 4-STAGE STRUCTURED FORMAT */
          <div className={`max-w-4xl mx-auto space-y-16 transition-transform ${isMirrored ? 'scale-x-[-1]' : ''}`}>
            
            {/* STAGE 1: HOOK */}
            <div className="space-y-4 border-l-4 border-cyan-500 pl-6 sm:pl-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  STAGE 1 — HOOK (0–3s)
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {content.script.stageHook.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
              <p className={`${fontClasses[fontSize]} text-cyan-100 font-bold tracking-tight`}>
                {content.script.stageHook || '(Belum ada teks Hook)'}
              </p>
            </div>

            {/* STAGE 2: CONTEXT */}
            <div className="space-y-4 border-l-4 border-indigo-500 pl-6 sm:pl-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  STAGE 2 — CONTEXT (4–10s)
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {content.script.stageContext.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
              <p className={`${fontClasses[fontSize]} text-slate-200`}>
                {content.script.stageContext || '(Belum ada teks Konteks)'}
              </p>
            </div>

            {/* STAGE 3: PAYOFF */}
            <div className="space-y-4 border-l-4 border-amber-500 pl-6 sm:pl-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  STAGE 3 — CORE PAYOFF (11–45s)
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {content.script.stagePayoff.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
              <p className={`${fontClasses[fontSize]} text-slate-100`}>
                {content.script.stagePayoff || '(Belum ada teks Poin Inti/Payoff)'}
              </p>
            </div>

            {/* STAGE 4: ENDING / LOOP */}
            <div className="space-y-4 border-l-4 border-pink-500 pl-6 sm:pl-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  STAGE 4 — SEAMLESS LOOP / CTA (46–60s)
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {content.script.stageEnding.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
              <p className={`${fontClasses[fontSize]} text-pink-100 font-semibold`}>
                {content.script.stageEnding || '(Belum ada teks Penutup)'}
              </p>
            </div>

            {/* SPACER AT BOTTOM */}
            <div className="h-72 flex items-center justify-center text-center text-slate-600 text-sm font-mono pt-12">
              — SELESAI NASKAH SHORTS ZEINITY —
            </div>

          </div>
        ) : (
          /* CONTINUOUS TEXT FORMAT */
          <div className={`max-w-4xl mx-auto space-y-8 transition-transform ${isMirrored ? 'scale-x-[-1]' : ''}`}>
            <p className={`${fontClasses[fontSize]} text-slate-100 leading-relaxed font-normal tracking-wide`}>
              {scriptText}
            </p>
            <div className="h-72 flex items-center justify-center text-center text-slate-600 text-sm font-mono pt-12">
              — SELESAI NASKAH SHORTS ZEINITY —
            </div>
          </div>
        )}
      </main>

      {/* FOOTER QUICK STATUS */}
      <footer className="bg-[#0b0d17]/90 border-t border-slate-800/80 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 z-20">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">
            Pintasan: <strong>Spasi</strong> = Putar/Jeda | <strong>▲/▼</strong> = Tempo | <strong>R</strong> = Reset | <strong>Esc</strong> = Keluar
          </span>
          {isRecording && (
            <span className="text-red-400 flex items-center gap-1.5 font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Merekam Vokal Audio Langsung...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span>Standar Tempo: 130–160 WPM</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">{wpm} WPM</span>
        </div>
      </footer>

    </div>
  );
};
