import React from 'react';
import { 
  TrendingUp, 
  Eye, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  BarChart2, 
  ThumbsUp, 
  MessageSquare, 
  UserPlus,
  Share2
} from 'lucide-react';
import { ContentItem, ShortsAnalytics } from '../../types';
import { ZEINITY_STANDARDS } from '../../constants/zeinityRules';

interface TabAnalyticsProps {
  content: ContentItem;
  onChange: (updated: ContentItem) => void;
}

export const TabAnalytics: React.FC<TabAnalyticsProps> = ({ content, onChange }) => {
  const analytics: ShortsAnalytics = content.analytics || {
    shownInFeed: 0,
    views: 0,
    viewedPercent: 0,
    swipedAwayPercent: 0,
    apvPercent: 0,
    avgViewDurationSec: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    subscribersGained: 0,
    evaluationWhatWorked: '',
    evaluationWhatFailed: '',
    evaluationNextExperiment: ''
  };

  const handleUpdate = (fields: Partial<ShortsAnalytics>) => {
    const updatedAnalytics = { ...analytics, ...fields, evaluatedAt: new Date().toISOString() };
    onChange({
      ...content,
      analytics: updatedAnalytics,
      updatedAt: new Date().toISOString()
    });
  };

  const targetViewed = ZEINITY_STANDARDS.analyticsTarget.viewedRatioPercent; // 70%
  const isHookViral = analytics.viewedPercent >= targetViewed;
  const isHookWarning = analytics.viewedPercent > 0 && analytics.viewedPercent < 60;

  const isApvLooping = analytics.apvPercent >= 100;
  const isApvOptimal = analytics.apvPercent >= 90 && analytics.apvPercent <= 110;
  const isApvDrop = analytics.apvPercent > 0 && analytics.apvPercent < 90;

  return (
    <div className="space-y-6">
      
      {/* Intro Guidance */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          Dua Metrik Evaluasi Kunci Zeinity
        </h4>
        <p className="text-slate-400 leading-relaxed">
          Jangan hanya melihat Views. Nilai kesehatan video dengan: <strong className="text-cyan-300">Viewed vs Swiped Away (Target: ≥70%)</strong> untuk efektivitas Hook, dan <strong className="text-emerald-300">Average Percentage Viewed / APV (Target: 90%–110%)</strong> untuk retensi dan potensi looping viral.
        </p>
      </div>

      {/* Smart Benchmark Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Hook Status */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isHookViral 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
            : isHookWarning 
              ? 'bg-red-500/10 border-red-500/30 text-red-200' 
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
        }`}>
          <Eye className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isHookViral ? 'text-emerald-400' : 'text-slate-400'}`} />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-semibold text-slate-400">Status Hook Detik 0–3:</span>
            <h5 className="font-bold text-sm">
              {isHookViral ? '🔥 Hook Efektif Melampaui Target (≥70%)' : isHookWarning ? '🚨 Hook Perlu Dirombak (<60%)' : 'Belum Memenuhi Target 70%'}
            </h5>
            <p className="text-xs opacity-90">
              {isHookViral 
                ? 'Mayoritas audiens bertahan melewati detik ke-3. Teks overlay dan kalimat pembuka berhasil menahan scroll.' 
                : isHookWarning 
                  ? 'Tingkat swipe-away tinggi. Detik pertama kemungkinan terlalu lambat atau teks pembuka kurang kontras.' 
                  : 'Catat rasio viewed dari YouTube Studio untuk melihat evaluasi hook.'}
            </p>
          </div>
        </div>

        {/* Retensi APV Status */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isApvLooping 
            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' 
            : isApvOptimal 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
              : isApvDrop 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                : 'bg-slate-900/60 border-slate-800 text-slate-300'
        }`}>
          <TrendingUp className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isApvLooping ? 'text-cyan-400' : isApvOptimal ? 'text-emerald-400' : 'text-slate-400'}`} />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-semibold text-slate-400">Status Retensi & Looping:</span>
            <h5 className="font-bold text-sm">
              {isApvLooping ? '⭐ Seamless Loop Berhasil (>100% APV)' : isApvOptimal ? '✓ Retensi Optimal (90%–110%)' : isApvDrop ? '⚠️ Drop Retensi (<90% APV)' : 'Target Retensi 90%–110%'}
            </h5>
            <p className="text-xs opacity-90">
              {isApvLooping 
                ? 'Penonton menonton ulang video! Ini memicu algoritma Shorts Feed untuk mendistribusikan video secara masif.' 
                : isApvOptimal 
                  ? 'Struktur naskah 4-stage padat dan memuaskan dari awal hingga CTA.' 
                  : 'Naskah mungkin memiliki dead air atau informasi bertele-tele di bagian tengah.'}
            </p>
          </div>
        </div>

      </div>

      {/* Input Metrik Aktual YouTube Shorts */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Input Metrik YouTube Analytics
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Views (Penayangan)
            </label>
            <input
              type="number"
              value={analytics.views || ''}
              onChange={e => handleUpdate({ views: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Shown in Feed
            </label>
            <input
              type="number"
              value={analytics.shownInFeed || ''}
              onChange={e => handleUpdate({ shownInFeed: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cyan-400 mb-1">
              Viewed Ratio (%) [Target ≥70%]
            </label>
            <input
              type="number"
              step="0.1"
              value={analytics.viewedPercent || ''}
              onChange={e => handleUpdate({ viewedPercent: parseFloat(e.target.value) || 0 })}
              placeholder="70.0"
              className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2 font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
              APV (%) [Target 90–110%]
            </label>
            <input
              type="number"
              step="0.1"
              value={analytics.apvPercent || ''}
              onChange={e => handleUpdate({ apvPercent: parseFloat(e.target.value) || 0 })}
              placeholder="100.0"
              className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 font-mono text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Avg View Duration (detik)
            </label>
            <input
              type="number"
              step="0.1"
              value={analytics.avgViewDurationSec || ''}
              onChange={e => handleUpdate({ avgViewDurationSec: parseFloat(e.target.value) || 0 })}
              placeholder="28.5"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-pink-400" />
              Likes
            </label>
            <input
              type="number"
              value={analytics.likes || ''}
              onChange={e => handleUpdate({ likes: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-indigo-400" />
              Komentar
            </label>
            <input
              type="number"
              value={analytics.comments || ''}
              onChange={e => handleUpdate({ comments: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <UserPlus className="w-3 h-3 text-emerald-400" />
              Subscriber Didapat
            </label>
            <input
              type="number"
              value={analytics.subscribersGained || ''}
              onChange={e => handleUpdate({ subscribersGained: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Learning Logbook: What Worked / What Failed / Next Experiment */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Learning Logbook (Refleksi Editorial)
        </h4>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
              1. Apa yang Berhasil? (What Worked)
            </label>
            <textarea
              rows={2}
              value={analytics.evaluationWhatWorked}
              onChange={e => handleUpdate({ evaluationWhatWorked: e.target.value })}
              placeholder="cth: Hook visual kontras tinggi di detik awal berhasil menahan penonton (Viewed 74%)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-red-400 mb-1">
              2. Apa yang Kurang Maksimal? (What Failed)
            </label>
            <textarea
              rows={2}
              value={analytics.evaluationWhatFailed}
              onChange={e => handleUpdate({ evaluationWhatFailed: e.target.value })}
              placeholder="cth: Poin demo langkah ketiga terlalu cepat sehingga banyak penonton skip..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cyan-400 mb-1">
              3. Hipotesis & Eksperimen Konten Berikutnya (Next Experiment)
            </label>
            <textarea
              rows={2}
              value={analytics.evaluationNextExperiment}
              onChange={e => handleUpdate({ evaluationNextExperiment: e.target.value })}
              placeholder="cth: Coba format 'Kenapa' pada topik berikutnya dan tambahkan penanda lingkaran merah di detik ke-15..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
