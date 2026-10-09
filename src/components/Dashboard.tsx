import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  Play, 
  ChevronRight, 
  FileText, 
  Eye, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ContentItem } from '../types';
import { CONTENT_PILLARS, CONTENT_FORMATS, PIPELINE_STATUSES, ZEINITY_STANDARDS } from '../constants/zeinityRules';

interface DashboardProps {
  contents: ContentItem[];
  onOpenShort: (item: ContentItem) => void;
  onNewShort: () => void;
  onNavigateTab: (tab: 'dashboard' | 'pipeline' | 'ideas' | 'analytics') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  contents,
  onOpenShort,
  onNewShort,
  onNavigateTab
}) => {
  // Hitung status konten
  const statusCounts = PIPELINE_STATUSES.map(s => ({
    ...s,
    count: contents.filter(c => c.status === s.id).length
  }));

  // Konten yang sedang aktif dalam tahap produksi (bukan ide, dan belum terbit)
  const inProduction = contents.filter(c => 
    c.status !== 'idea' && c.status !== 'published'
  ).sort((a, b) => {
    const dateA = a.productionDeadline ? new Date(a.productionDeadline).getTime() : Infinity;
    const dateB = b.productionDeadline ? new Date(b.productionDeadline).getTime() : Infinity;
    return dateA - dateB;
  });

  // Konten yang sudah terbit untuk analisis metrik
  const publishedWithAnalytics = contents.filter(c => c.status === 'published' && c.analytics);
  
  const avgViewed = publishedWithAnalytics.length > 0
    ? publishedWithAnalytics.reduce((acc, c) => acc + (c.analytics?.viewedPercent || 0), 0) / publishedWithAnalytics.length
    : 0;

  const avgApv = publishedWithAnalytics.length > 0
    ? publishedWithAnalytics.reduce((acc, c) => acc + (c.analytics?.apvPercent || 0), 0) / publishedWithAnalytics.length
    : 0;

  const totalViews = publishedWithAnalytics.reduce((acc, c) => acc + (c.analytics?.views || 0), 0);

  // Periksa konten yang overdue tenggat produksinya
  const now = new Date();
  const overdueItems = contents.filter(c => 
    c.status !== 'published' && 
    c.status !== 'scheduled' && 
    c.productionDeadline && 
    new Date(c.productionDeadline) < now
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome & Next Publication */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/60 border border-indigo-500/20 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Creator Command Center — Zeinity Shorts
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Pusat Kendali Produksi Shorts Harian
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Target publikasi resmi: <strong className="text-white">Senin, Kamis & Minggu pukul 07:00 WIB</strong>. Fokus naskah 90–140 kata, verifikasi changelog resmi, dan optimasi safe-zone 9:16.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onNewShort}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              Produksi Short Baru
            </button>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-medium transition-all"
            >
              Lihat Pipeline Lengkap
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Peringatan Overdue jika ada */}
        {overdueItems.length > 0 && (
          <div className="mt-6 flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <strong className="font-semibold text-amber-300">Perhatian: {overdueItems.length} video melewati tenggat produksi!</strong> Segera selesaikan editing sebelum jadwal tayang.
            </div>
            <button
              onClick={() => onOpenShort(overdueItems[0])}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-medium text-amber-300 transition-colors"
            >
              Buka Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Grid KPI Utama & Target Acuan Zeinity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active In-Production */}
        <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Antrean Produksi</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {inProduction.length} <span className="text-sm font-normal text-slate-400">Shorts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Fase Riset hingga Siap Tayang
          </p>
        </div>

        {/* KPI 2: Viewed Ratio vs Target (70%) */}
        <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Viewed Ratio (Hook)</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-white">
              {avgViewed > 0 ? `${avgViewed.toFixed(1)}%` : '—'}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              avgViewed >= ZEINITY_STANDARDS.analyticsTarget.viewedRatioPercent 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : avgViewed > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
            }`}>
              Target: ≥70%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Rasio penonton bertahan melewati detik ke-3
          </p>
        </div>

        {/* KPI 3: Average Percentage Viewed (APV) vs Target (90-110%) */}
        <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">APV (Retensi Shorts)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-white">
              {avgApv > 0 ? `${avgApv.toFixed(1)}%` : '—'}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              avgApv >= 90 && avgApv <= 110 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : avgApv > 110 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
            }`}>
              Target: 90–110%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Kepadatan naskah & keberhasilan seamless loop
          </p>
        </div>

        {/* KPI 4: Total Channel Views */}
        <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Penayangan</span>
            <CheckCircle2 className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {totalViews > 0 ? totalViews.toLocaleString('id-ID') : '0'}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {publishedWithAnalytics.length} video dengan data analitik tercatat
          </p>
        </div>
      </div>

      {/* Jadwal Publikasi Mingguan Zeinity (Senin, Kamis, Minggu 07:00 WIB) */}
      <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Ritme Publikasi Mingguan Zeinity (3x Seminggu)
            </h3>
            <p className="text-xs text-slate-400">Jadwal baku tayang pada pukul 07:00 WIB sesuai dokumen operasional</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Zona Waktu: Asia/Jakarta (WIB)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ZEINITY_STANDARDS.publishSchedule.map((slot, index) => {
            // Temukan konten terjadwal untuk slot ini jika ada
            const matchedContent = contents.find(c => {
              if (!c.publishDate) return false;
              const d = new Date(c.publishDate);
              const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
              return dayName.toLowerCase() === slot.day.toLowerCase() && c.status === 'scheduled';
            });

            return (
              <div 
                key={index}
                className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      {slot.day}
                    </span>
                    <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {slot.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Fokus: <span className="text-slate-300">{slot.focus}</span>
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60">
                  {matchedContent ? (
                    <div 
                      onClick={() => onOpenShort(matchedContent)}
                      className="cursor-pointer group flex items-start gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs overflow-hidden">
                        <p className="font-medium text-indigo-200 truncate group-hover:text-white">
                          {matchedContent.title}
                        </p>
                        <span className="text-[10px] text-indigo-400 font-mono">Siap Tayang</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 flex items-center justify-between py-1">
                      <span>Slot Kosong</span>
                      <button 
                        onClick={onNewShort}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        + Jadwalkan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dua Kolom: Antrean Produksi Berjalan vs Distribusi Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Antrean Produksi Berjalan (2 Kolom) */}
        <div className="lg:col-span-2 bg-[#11131f] border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400" />
                Antrean Produksi Aktif Hari Ini
              </h3>
              <p className="text-xs text-slate-400">Konten yang memerlukan perhatian produksi dan penulisan naskah</p>
            </div>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Semua Konten
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {inProduction.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Tidak ada video dalam antrean produksi aktif saat ini.
              </div>
            ) : (
              inProduction.slice(0, 5).map(item => {
                const pillar = CONTENT_PILLARS[item.pillar];
                const format = CONTENT_FORMATS[item.format];
                const words = item.script.fullScript.split(/\s+/).filter(Boolean).length;
                const isDeadlineOverdue = item.productionDeadline && new Date(item.productionDeadline) < now;

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenShort(item)}
                    className="group cursor-pointer bg-slate-900/60 hover:bg-slate-800/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pillar.bgColor} border ${pillar.borderColor}`}>
                          {pillar.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {format.name} ({format.durationLabel})
                        </span>
                        <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          {PIPELINE_STATUSES.find(s => s.id === item.status)?.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {item.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-500" />
                          {words} kata {words >= 90 && words <= 140 ? '✓' : ''}
                        </span>
                        {item.productionDeadline && (
                          <span className={`flex items-center gap-1 ${isDeadlineOverdue ? 'text-amber-400 font-semibold' : ''}`}>
                            <Clock className="w-3 h-3" />
                            Deadline: {new Date(item.productionDeadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {item.publishDate && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3" />
                            Tayang: {new Date(item.publishDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center font-medium">
                        Buka Studio
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribusi Status Pipeline (1 Kolom) */}
        <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Status Pipeline</h3>
            <p className="text-xs text-slate-400 mb-5">Distribusi video di setiap tahapan</p>

            <div className="space-y-2.5">
              {statusCounts.map(st => (
                <div 
                  key={st.id}
                  onClick={() => onNavigateTab('pipeline')}
                  className="cursor-pointer group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                      {st.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                    {st.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Seluruh Konten</span>
              <strong className="text-white font-mono text-sm">{contents.length}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
