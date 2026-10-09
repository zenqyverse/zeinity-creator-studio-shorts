import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  CheckCircle2, 
  Flame, 
  Lightbulb, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  Calendar,
  Sliders
} from 'lucide-react';
import { ContentItem, ContentPillar, ContentFormat } from '../types';
import { CONTENT_PILLARS, CONTENT_FORMATS, ZEINITY_STANDARDS } from '../constants/zeinityRules';

interface AnalyticsViewProps {
  contents: ContentItem[];
  onOpenShort: (item: ContentItem) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ contents, onOpenShort }) => {
  const [metricSort, setMetricSort] = useState<'views' | 'viewedPercent' | 'apvPercent'>('views');

  // Filter video yang sudah dianalisis atau sudah terbit dengan analitik
  const analyzedVideos = contents.filter(c => c.analytics && (c.analytics.views > 0 || c.analytics.viewedPercent > 0));

  // Rata-rata channel
  const avgViewed = analyzedVideos.length > 0
    ? analyzedVideos.reduce((acc, c) => acc + (c.analytics?.viewedPercent || 0), 0) / analyzedVideos.length
    : 0;

  const avgApv = analyzedVideos.length > 0
    ? analyzedVideos.reduce((acc, c) => acc + (c.analytics?.apvPercent || 0), 0) / analyzedVideos.length
    : 0;

  const totalViews = analyzedVideos.reduce((acc, c) => acc + (c.analytics?.views || 0), 0);

  // Analisis per Pilar
  const pillarStats = Object.keys(CONTENT_PILLARS).map(key => {
    const pillarKey = key as ContentPillar;
    const items = analyzedVideos.filter(c => c.pillar === pillarKey);
    const count = items.length;
    const pAvgViewed = count > 0 ? items.reduce((acc, c) => acc + (c.analytics?.viewedPercent || 0), 0) / count : 0;
    const pAvgApv = count > 0 ? items.reduce((acc, c) => acc + (c.analytics?.apvPercent || 0), 0) / count : 0;
    const pViews = items.reduce((acc, c) => acc + (c.analytics?.views || 0), 0);
    return {
      pillar: CONTENT_PILLARS[pillarKey],
      count,
      avgViewed: pAvgViewed,
      avgApv: pAvgApv,
      views: pViews
    };
  });

  // Urutkan video berdasarkan metrik pilihan
  const sortedVideos = [...analyzedVideos].sort((a, b) => {
    const valA = a.analytics ? a.analytics[metricSort] : 0;
    const valB = b.analytics ? b.analytics[metricSort] : 0;
    return valB - valA;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Performance & Learning Center
            </div>
            <h2 className="text-xl font-bold text-white">Evaluasi & Pembelajaran Algoritma Shorts</h2>
            <p className="text-xs text-slate-400">
              Ubah angka performa menjadi keputusan konten berikutnya sesuai pedoman editorial Zeinity.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Urutkan Tabel:</span>
            <select
              value={metricSort}
              onChange={e => setMetricSort(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="views">Total Views</option>
              <option value="viewedPercent">Viewed Ratio (%) [Hook]</option>
              <option value="apvPercent">APV (%) [Retensi]</option>
            </select>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Rata-rata Hook (Viewed Ratio)</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${avgViewed >= 70 ? 'text-emerald-400' : 'text-slate-200'}`}>
                {avgViewed > 0 ? `${avgViewed.toFixed(1)}%` : '—'}
              </span>
              <span className="text-[11px] font-mono text-slate-500">Target: ≥70%</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Rata-rata Retensi (APV)</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${avgApv >= 90 && avgApv <= 110 ? 'text-cyan-400' : 'text-slate-200'}`}>
                {avgApv > 0 ? `${avgApv.toFixed(1)}%` : '—'}
              </span>
              <span className="text-[11px] font-mono text-slate-500">Target: 90%–110%</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Total Penayangan Teranalisis</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {totalViews > 0 ? totalViews.toLocaleString('id-ID') : '0'}
              </span>
              <span className="text-[11px] font-mono text-slate-500">dari {analyzedVideos.length} video</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Analisis Per Pilar Konten */}
      <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-1">Perbandingan Performa Antar Pilar Konten</h3>
        <p className="text-xs text-slate-400 mb-5">Pilar mana yang paling disukai audiens dan menghasilkan retensi tertinggi?</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {pillarStats.map((stat, idx) => (
            <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stat.pillar.bgColor} border ${stat.pillar.borderColor} inline-block`}>
                {stat.pillar.name}
              </span>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Konten:</span>
                  <strong className="text-white">{stat.count} video</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Viewed:</span>
                  <strong className={stat.avgViewed >= 70 ? 'text-emerald-400' : 'text-slate-300'}>
                    {stat.avgViewed > 0 ? `${stat.avgViewed.toFixed(1)}%` : '—'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>APV:</span>
                  <strong className={stat.avgApv >= 90 ? 'text-cyan-400' : 'text-slate-300'}>
                    {stat.avgApv > 0 ? `${stat.avgApv.toFixed(1)}%` : '—'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Views:</span>
                  <strong className="text-white">{stat.views.toLocaleString('id-ID')}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Leaderboard Video dengan Benchmark Badges */}
      <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Leaderboard & Status Metrik Video</h3>
            <p className="text-xs text-slate-400">Klik video untuk mengedit naskah atau memperbarui catatan evaluasi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Judul Video</th>
                <th className="p-3.5">Pilar</th>
                <th className="p-3.5">Views</th>
                <th className="p-3.5">Viewed % (Hook)</th>
                <th className="p-3.5">APV % (Retensi)</th>
                <th className="p-3.5">Evaluasi Zeinity</th>
                <th className="p-3.5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sortedVideos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Belum ada video dengan data analitik. Masukkan metrik di tab "Analitik & Evaluasi" pada setiap video yang sudah terbit.
                  </td>
                </tr>
              ) : (
                sortedVideos.map(item => {
                  const pillar = CONTENT_PILLARS[item.pillar];
                  const an = item.analytics!;
                  const isHookPassed = an.viewedPercent >= 70;
                  const isLoopPassed = an.apvPercent >= 100;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <button
                          onClick={() => onOpenShort(item)}
                          className="font-semibold text-white hover:text-indigo-300 text-left line-clamp-1"
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${pillar.bgColor} border ${pillar.borderColor}`}>
                          {pillar.name}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        {an.views.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          isHookPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {an.viewedPercent}%
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          isLoopPassed ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {an.apvPercent}%
                        </span>
                      </td>
                      <td className="p-3.5 text-[11px]">
                        {isHookPassed && isLoopPassed ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Viral Ready
                          </span>
                        ) : isHookPassed ? (
                          <span className="text-cyan-400">Hook Kuat</span>
                        ) : (
                          <span className="text-slate-400">Normal</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onOpenShort(item)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium"
                        >
                          Buka
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consolidated Learning Logbook */}
      <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Rangkuman Jurnal Pembelajaran Editorial (Learning Logbook)
        </h3>
        <p className="text-xs text-slate-400">
          Kumpulan refleksi dari seluruh video untuk pedoman produksi berikutnya:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* What Worked */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              ✓ Apa yang Berhasil (What Worked)
            </h4>
            <div className="space-y-2 text-xs text-slate-300 max-h-60 overflow-y-auto">
              {analyzedVideos.filter(v => v.analytics?.evaluationWhatWorked).map((v, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block font-mono truncate">{v.title}</span>
                  <p className="mt-1">{v.analytics?.evaluationWhatWorked}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What Failed */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
              ✗ Apa yang Kurang (What Failed)
            </h4>
            <div className="space-y-2 text-xs text-slate-300 max-h-60 overflow-y-auto">
              {analyzedVideos.filter(v => v.analytics?.evaluationWhatFailed).map((v, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block font-mono truncate">{v.title}</span>
                  <p className="mt-1">{v.analytics?.evaluationWhatFailed}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Experiment */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              🔬 Eksperimen Berikutnya (Next)
            </h4>
            <div className="space-y-2 text-xs text-slate-300 max-h-60 overflow-y-auto">
              {analyzedVideos.filter(v => v.analytics?.evaluationNextExperiment).map((v, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block font-mono truncate">{v.title}</span>
                  <p className="mt-1">{v.analytics?.evaluationNextExperiment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
