import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Grid, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Music2, 
  Play, 
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';
import { ContentItem, StoryboardShot } from '../../types';

interface TabSafeZoneProps {
  content: ContentItem;
  onChange: (updated: ContentItem) => void;
}

export const TabSafeZone: React.FC<TabSafeZoneProps> = ({ content, onChange }) => {
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [showShortsUi, setShowShortsUi] = useState(true);
  const [selectedShotIndex, setSelectedShotIndex] = useState(0);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  const activeShot = content.storyboard[selectedShotIndex] || content.storyboard[0];

  // Upload gambar background untuk canvas simulator
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddShot = () => {
    const newShot: StoryboardShot = {
      id: 'shot-' + Date.now().toString(36),
      stage: 'payoff',
      timestamp: '00:15 - 00:25',
      visualAction: 'Demonstrasi langkah fitur di layar HP',
      bRollSource: 'Screen capture antarmuka 1080p',
      onScreenText: 'Langkah Berikutnya',
      highlightFx: 'Zoom 1.2x'
    };

    onChange({
      ...content,
      storyboard: [...content.storyboard, newShot],
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteShot = (shotId: string) => {
    onChange({
      ...content,
      storyboard: content.storyboard.filter(s => s.id !== shotId),
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateShot = (shotId: string, updatedFields: Partial<StoryboardShot>) => {
    onChange({
      ...content,
      storyboard: content.storyboard.map(s => s.id === shotId ? { ...s, ...updatedFields } : s),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Safe-Zone Controls & Explanation Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            Safe-Zone Simulator & Storyboard 9:16 (1080 × 1920)
          </h4>
          <p className="text-xs text-slate-400">
            Jaga teks penting & rekaman layar tetap di <strong className="text-emerald-400">Area Tengah (60%)</strong> agar tidak tertutup antarmuka YouTube Shorts.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showSafeZones 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Overlay Safe Zone: {showSafeZones ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowShortsUi(!showShortsUi)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showShortsUi 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showShortsUi ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Mockup UI Shorts: {showShortsUi ? 'ON' : 'OFF'}
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            Upload BG
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Grid: Canvas Preview 9:16 (Kiri) vs Storyboard List (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* KOLOM KIRI: SIMULATOR CANVAS 9:16 (5 Kolom) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[320px] aspect-[9/16] bg-slate-950 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl shadow-indigo-950/40 select-none">
            
            {/* Background Layer: Custom Image atau Gradient Placeholder */}
            {customBgImage ? (
              <img 
                src={customBgImage} 
                alt="Shot Preview" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <ImageIcon className="w-12 h-12 text-slate-700 mb-2" />
                <p className="text-xs text-slate-500 font-mono">B-Roll / Screen Recording Canvas (1080×1920)</p>
                <span className="text-[10px] text-slate-600 mt-1">Upload gambar untuk uji keterbacaan teks</span>
              </div>
            )}

            {/* LIVE ON-SCREEN TEXT OVERLAY (DI CENTER 60%) */}
            <div className="absolute inset-x-4 top-[32%] z-20 flex flex-col items-center text-center pointer-events-none">
              {activeShot?.onScreenText ? (
                <div className="bg-black/85 backdrop-blur-sm border-2 border-amber-400 px-3.5 py-2 rounded-xl shadow-2xl max-w-[90%] transform transition-transform animate-pulse">
                  <span className="font-extrabold text-amber-300 text-sm tracking-wide uppercase leading-tight drop-shadow-md">
                    {activeShot.onScreenText}
                  </span>
                </div>
              ) : (
                <div className="bg-black/75 px-3 py-1.5 rounded-lg border border-white/20">
                  <span className="font-bold text-white text-xs">{content.title}</span>
                </div>
              )}
            </div>

            {/* SAFE ZONE OVERLAY LAYER */}
            {showSafeZones && (
              <div className="absolute inset-0 z-30 pointer-events-none flex flex-col">
                
                {/* TOP 15%: DANGER ZONE */}
                <div className="h-[15%] bg-red-500/20 border-b border-red-500/50 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
                    AREA ATAS 15% (BEBAS TEKS)
                  </span>
                </div>

                {/* CENTER 60%: SAFE CONTENT ZONE */}
                <div className="h-[60%] border-2 border-dashed border-emerald-400/60 bg-emerald-500/5 flex items-start justify-between p-2">
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-black/70 px-1.5 py-0.5 rounded">
                    ZONA AMAN (CENTER 60%)
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 bg-black/70 px-1.5 py-0.5 rounded">
                    Visual & Captions
                  </span>
                </div>

                {/* BOTTOM 25%: DANGER ZONE (UI SHORTS) */}
                <div className="h-[25%] bg-red-500/20 border-t border-red-500/50 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
                    AREA BAWAH 25% (TERTUTUP UI SHORTS)
                  </span>
                </div>
              </div>
            )}

            {/* YOUTUBE SHORTS UI MOCKUP OVERLAY */}
            {showShortsUi && (
              <div className="absolute inset-0 z-25 pointer-events-none flex flex-col justify-between p-3 text-white">
                
                {/* Header Mockup */}
                <div className="flex items-center justify-between text-xs pt-1 opacity-80">
                  <span className="font-bold tracking-tight">Shorts</span>
                  <span className="font-mono text-[10px]">1080p 60fps</span>
                </div>

                {/* Bottom & Side Rails Mockup */}
                <div className="flex items-end justify-between pb-1">
                  
                  {/* Info Channel & Title (Bottom Left) */}
                  <div className="space-y-1.5 max-w-[70%]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        Z
                      </div>
                      <span className="text-xs font-semibold drop-shadow">@ZeinityShorts</span>
                      <span className="text-[10px] font-semibold bg-white text-black px-1.5 py-0.2 rounded-full">
                        Subscribe
                      </span>
                    </div>

                    <p className="text-[11px] font-medium line-clamp-2 drop-shadow leading-snug">
                      {content.title}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-slate-300">
                      <Music2 className="w-3 h-3 text-white animate-spin" />
                      <span className="truncate">Original Sound - Zeinity</span>
                    </div>
                  </div>

                  {/* Action Icons Rail (Bottom Right) */}
                  <div className="flex flex-col items-center gap-3 text-center pb-2">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                        <ThumbsUp className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono mt-0.5">14K</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                        <ThumbsDown className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono mt-0.5">Dislike</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono mt-0.5">188</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono mt-0.5">Share</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          <p className="text-[11px] text-slate-500 font-mono mt-3 text-center">
            Pratinjau Shot Aktif: <strong className="text-slate-300">{activeShot?.timestamp}</strong>
          </p>
        </div>

        {/* KOLOM KANAN: STORYBOARD SHOT LIST (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Storyboard Shot List ({content.storyboard.length} Shot)
            </h4>

            <button
              onClick={handleAddShot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              + Shot Baru
            </button>
          </div>

          <div className="space-y-3">
            {content.storyboard.map((shot, index) => {
              const isSelected = index === selectedShotIndex;

              return (
                <div
                  key={shot.id}
                  onClick={() => setSelectedShotIndex(index)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-3 ${
                    isSelected 
                      ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/50' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        SHOT #{index + 1}
                      </span>
                      <select
                        value={shot.stage}
                        onChange={e => handleUpdateShot(shot.id, { stage: e.target.value as any })}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none"
                      >
                        <option value="hook">Stage 1: Hook (0-3s)</option>
                        <option value="context">Stage 2: Context (4-10s)</option>
                        <option value="payoff">Stage 3: Core Payoff (11-45s)</option>
                        <option value="ending">Stage 4: Loop / CTA (46-60s)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shot.timestamp}
                        onChange={e => handleUpdateShot(shot.id, { timestamp: e.target.value })}
                        placeholder="00:00 - 00:03"
                        className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-xs font-mono text-cyan-300 text-center focus:outline-none"
                      />

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteShot(shot.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Hapus shot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Action & B-Roll */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-medium mb-1">Aksi Visual di Layar:</label>
                      <input
                        type="text"
                        value={shot.visualAction}
                        onChange={e => handleUpdateShot(shot.id, { visualAction: e.target.value })}
                        placeholder="cth: Zoom 1.2x ke tombol privasi WhatsApp"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-medium mb-1">Sumber B-Roll / Rekaman Layar:</label>
                      <input
                        type="text"
                        value={shot.bRollSource}
                        onChange={e => handleUpdateShot(shot.id, { bRollSource: e.target.value })}
                        placeholder="cth: Screen capture Android 1080p 60fps"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Teks Layar & Highlight Effect */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-amber-400 font-medium mb-1">Teks Overlay Layar (Safe Zone):</label>
                      <input
                        type="text"
                        value={shot.onScreenText}
                        onChange={e => handleUpdateShot(shot.id, { onScreenText: e.target.value })}
                        placeholder="cth: 3 FITUR BARU!"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-medium mb-1">Efek Penyorot / SFX Transisi:</label>
                      <input
                        type="text"
                        value={shot.highlightFx}
                        onChange={e => handleUpdateShot(shot.id, { highlightFx: e.target.value })}
                        placeholder="cth: Red Circle + Swoosh SFX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
