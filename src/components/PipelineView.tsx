import React, { useState } from 'react';
import { 
  Kanban, 
  Calendar as CalendarIcon, 
  ListFilter, 
  Search, 
  Plus, 
  Clock, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  CalendarDays,
  Filter,
  Pencil,
  Trash2,
  Film,
  X,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ContentItem, ContentStatus, ContentPillar, ContentFormat } from '../types';
import { CONTENT_PILLARS, CONTENT_FORMATS, PIPELINE_STATUSES } from '../constants/zeinityRules';
import { validateZeinityTitle, countWords } from '../services/titleValidator';

interface PipelineViewProps {
  contents: ContentItem[];
  onOpenShort: (item: ContentItem) => void;
  onNewShort: () => void;
  onUpdateStatus: (itemId: string, newStatus: ContentStatus) => void;
  onSaveContent?: (item: ContentItem) => void;
  onDeleteContent?: (itemId: string) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  contents,
  onOpenShort,
  onNewShort,
  onUpdateStatus,
  onSaveContent,
  onDeleteContent
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Edit modal state
  const [editingShort, setEditingShort] = useState<ContentItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContentItem>>({});

  const handleOpenEdit = (item: ContentItem) => {
    setEditingShort(item);
    setEditForm({
      title: item.title,
      pillar: item.pillar,
      format: item.format,
      status: item.status,
      publishDate: item.publishDate || '',
      productionDeadline: item.productionDeadline || '',
      notes: item.notes || '',
      targetDurationSec: item.targetDurationSec || 45
    });
  };

  const handleSaveEdit = () => {
    if (!editingShort || !onSaveContent) return;
    const updated: ContentItem = {
      ...editingShort,
      title: editForm.title?.trim() || editingShort.title,
      pillar: (editForm.pillar as ContentPillar) || editingShort.pillar,
      format: (editForm.format as ContentFormat) || editingShort.format,
      status: (editForm.status as ContentStatus) || editingShort.status,
      publishDate: editForm.publishDate || editingShort.publishDate,
      productionDeadline: editForm.productionDeadline || editingShort.productionDeadline,
      notes: editForm.notes !== undefined ? editForm.notes : editingShort.notes,
      targetDurationSec: editForm.targetDurationSec || editingShort.targetDurationSec,
      updatedAt: new Date().toISOString()
    };
    onSaveContent(updated);
    setEditingShort(null);
  };

  const handleOpenStudioFromEdit = () => {
    if (!editingShort || !onSaveContent) return;
    const updated: ContentItem = {
      ...editingShort,
      title: editForm.title?.trim() || editingShort.title,
      pillar: (editForm.pillar as ContentPillar) || editingShort.pillar,
      format: (editForm.format as ContentFormat) || editingShort.format,
      status: (editForm.status as ContentStatus) || editingShort.status,
      publishDate: editForm.publishDate || editingShort.publishDate,
      productionDeadline: editForm.productionDeadline || editingShort.productionDeadline,
      notes: editForm.notes !== undefined ? editForm.notes : editingShort.notes,
      targetDurationSec: editForm.targetDurationSec || editingShort.targetDurationSec,
      updatedAt: new Date().toISOString()
    };
    onSaveContent(updated);
    setEditingShort(null);
    onOpenShort(updated);
  };

  const handleDelete = (item: ContentItem) => {
    if (window.confirm(`Yakin ingin menghapus ide / video Shorts ini?\n\n"${item.title}"`)) {
      if (onDeleteContent) {
        onDeleteContent(item.id);
      }
      if (editingShort?.id === item.id) {
        setEditingShort(null);
      }
    }
  };

  const setPresetPublishDate = (dayOfWeek: number) => {
    const d = new Date();
    const currentDay = d.getDay();
    let diff = dayOfWeek - currentDay;
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() + diff);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    setEditForm(prev => ({
      ...prev,
      publishDate: `${year}-${month}-${date}`
    }));
  };

  const titleValidation = validateZeinityTitle(editForm.title || '');

  // Filter items
  const filteredContents = contents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPillar = selectedPillar === 'all' || item.pillar === selectedPillar;
    const matchesFormat = selectedFormat === 'all' || item.format === selectedFormat;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesPillar && matchesFormat && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#11131f] border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Kalender Rilis
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Daftar Tabel
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari judul, tag, atau topik..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pilar Filter */}
          <select
            value={selectedPillar}
            onChange={e => setSelectedPillar(e.target.value)}
            className="bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Pilar</option>
            {Object.values(CONTENT_PILLARS).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Format Filter */}
          <select
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className="bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Format</option>
            {Object.values(CONTENT_FORMATS).map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Status</option>
            {PIPELINE_STATUSES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <button
            onClick={onNewShort}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            + Short
          </button>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO VIEW MODE */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-800">
          {PIPELINE_STATUSES.map((col, colIdx) => {
            const itemsInCol = filteredContents.filter(c => c.status === col.id);

            return (
              <div
                key={col.id}
                className="flex-shrink-0 w-80 bg-[#11131f] border border-slate-800/80 rounded-2xl flex flex-col max-h-[78vh]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: col.color }}
                    />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {itemsInCol.length}
                  </span>
                </div>

                {/* Column Body / Cards */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {itemsInCol.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-xs italic">
                      Kosong
                    </div>
                  ) : (
                    itemsInCol.map(item => {
                      const pillar = CONTENT_PILLARS[item.pillar];
                      const format = CONTENT_FORMATS[item.format];
                      const words = item.script.fullScript.split(/\s+/).filter(Boolean).length;

                      return (
                        <div
                          key={item.id}
                          className="group bg-slate-900/80 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all shadow-sm space-y-2.5"
                        >
                          {/* Tags / Badges & Quick Action Buttons */}
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span className={`font-semibold px-2 py-0.5 rounded-full ${pillar.bgColor} border ${pillar.borderColor}`}>
                              {pillar.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                                {format.durationLabel}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(item);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Edit detail ide"
                              >
                                <Pencil className="w-3 h-3 text-indigo-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Hapus ide"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Title */}
                          <h4 
                            onClick={() => onOpenShort(item)}
                            className="cursor-pointer text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2"
                          >
                            {item.title}
                          </h4>

                          {/* Quick Stats */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                            <span className="flex items-center gap-1 font-mono">
                              <FileText className="w-3 h-3 text-slate-500" />
                              {words} kata
                            </span>

                            {item.publishDate && (
                              <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(item.publishDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                              </span>
                            )}
                          </div>

                          {/* Stage Transition Buttons */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              disabled={colIdx === 0}
                              onClick={() => {
                                const prevStatus = PIPELINE_STATUSES[colIdx - 1]?.id;
                                if (prevStatus) onUpdateStatus(item.id, prevStatus);
                              }}
                              className={`p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all ${
                                colIdx === 0 ? 'opacity-20 cursor-not-allowed' : ''
                              }`}
                              title="Pindah ke tahap sebelumnya"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="text-[11px] font-medium text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-1 transition-colors"
                                title="Edit cepat"
                              >
                                <Pencil className="w-3 h-3 text-indigo-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => onOpenShort(item)}
                                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                              >
                                Studio
                              </button>
                            </div>

                            <button
                              disabled={colIdx === PIPELINE_STATUSES.length - 1}
                              onClick={() => {
                                const nextStatus = PIPELINE_STATUSES[colIdx + 1]?.id;
                                if (nextStatus) onUpdateStatus(item.id, nextStatus);
                              }}
                              className={`p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all ${
                                colIdx === PIPELINE_STATUSES.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                              }`}
                              title="Pindah ke tahap berikutnya"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-cyan-400" />
                Kalender Jadwal Publikasi & Deadline Produksi
              </h3>
              <p className="text-xs text-slate-400">Jadwal baku: Senin, Kamis, dan Minggu pukul 07:00 WIB</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Tanggal Publikasi
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Deadline Produksi
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContents.map(item => {
              const pillar = CONTENT_PILLARS[item.pillar];
              const format = CONTENT_FORMATS[item.format];
              const statusMeta = PIPELINE_STATUSES.find(s => s.id === item.status);

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenShort(item)}
                  className="cursor-pointer bg-slate-900/60 hover:bg-slate-800/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${pillar.bgColor} border ${pillar.borderColor}`}>
                      {pillar.name}
                    </span>
                    <span 
                      className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: `${statusMeta?.color}20`, color: statusMeta?.color }}
                    >
                      {statusMeta?.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white line-clamp-2">
                    {item.title}
                  </h4>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                    {item.publishDate && (
                      <div className="flex items-center justify-between text-cyan-300">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          Publikasi:
                        </span>
                        <strong className="font-mono">
                          {new Date(item.publishDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} 07:00 WIB
                        </strong>
                      </div>
                    )}
                    {item.productionDeadline && (
                      <div className="flex items-center justify-between text-amber-300">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Deadline Editing:
                        </span>
                        <strong className="font-mono">
                          {new Date(item.productionDeadline).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Calendar card actions footer */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(item);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors border border-slate-700/60"
                        title="Edit jadwal & detail"
                      >
                        <Pencil className="w-3 h-3 text-indigo-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Hapus jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenShort(item);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <Film className="w-3 h-3" />
                      <span>Studio</span>
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}

      {/* LIST TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-[#11131f] border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Judul Video</th>
                  <th className="p-3.5">Pilar Konten</th>
                  <th className="p-3.5">Format</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Kata & Pace</th>
                  <th className="p-3.5">Publikasi (07:00 WIB)</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      Tidak ada konten yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredContents.map(item => {
                    const pillar = CONTENT_PILLARS[item.pillar];
                    const format = CONTENT_FORMATS[item.format];
                    const words = item.script.fullScript.split(/\s+/).filter(Boolean).length;
                    const statusMeta = PIPELINE_STATUSES.find(s => s.id === item.status);

                    return (
                      <tr 
                        key={item.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
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
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">
                          {format.name}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={item.status}
                            onChange={e => onUpdateStatus(item.id, e.target.value as ContentStatus)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            {PIPELINE_STATUSES.map(st => (
                              <option key={st.id} value={st.id}>{st.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <span className={words >= 90 && words <= 140 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {words} kata
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">
                          {item.publishDate ? new Date(item.publishDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-700/60"
                              title="Edit detail video Shorts"
                            >
                              <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[11px] transition-colors border border-red-500/20"
                              title="Hapus video Shorts ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenShort(item)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
                              title="Buka studio produksi lengkap"
                            >
                              <Film className="w-3.5 h-3.5" />
                              <span>Studio</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      {editingShort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#0e101a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#121422] p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <Pencil className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Edit Cepat Ide Shorts</h3>
                  <p className="text-[11px] text-slate-400">Perbarui judul, pilar, format, status, dan jadwal rilis</p>
                </div>
              </div>
              <button
                onClick={() => setEditingShort(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Judul Video Shorts</label>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    titleValidation.isValid ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}>
                    {countWords(editForm.title || '')} kata {titleValidation.isValid ? '✓ Ideal (5-10)' : '⚠️'}
                  </span>
                </div>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Contoh: Kenapa Aplikasi Ini Diam-Diam Pakai Kuotamu?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500 text-xs"
                />
                {titleValidation.issues.length > 0 && (
                  <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {titleValidation.issues[0]}
                  </p>
                )}
              </div>

              {/* Pilar & Format Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Pilar Konten</label>
                  <select
                    value={editForm.pillar}
                    onChange={e => setEditForm({ ...editForm, pillar: e.target.value as ContentPillar })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {Object.values(CONTENT_PILLARS).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Format Video</label>
                  <select
                    value={editForm.format}
                    onChange={e => setEditForm({ ...editForm, format: e.target.value as ContentFormat })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {Object.values(CONTENT_FORMATS).map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.durationLabel})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Pipeline */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tahap Status Pipeline</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value as ContentStatus })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {PIPELINE_STATUSES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Jadwal Publikasi (Senin / Kamis / Minggu) */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Jadwal Publikasi (07:00 WIB)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={editForm.publishDate ? editForm.publishDate.slice(0, 10) : ''}
                    onChange={e => setEditForm({ ...editForm, publishDate: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-500">Preset jadwal baku:</span>
                  <button
                    type="button"
                    onClick={() => setPresetPublishDate(1)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  >
                    Senin Depan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetPublishDate(4)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  >
                    Kamis Depan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetPublishDate(0)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  >
                    Minggu Depan
                  </button>
                </div>
              </div>

              {/* Catatan / Notes */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Catatan Ide / Sumber Riset</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Catatan tambahan, sudut pandang unik, atau link rujukan..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 resize-none text-xs"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#121422] p-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(editingShort)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-semibold transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingShort(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenStudioFromEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all text-xs"
                  title="Simpan dan buka editor naskah lengkap di Studio"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
