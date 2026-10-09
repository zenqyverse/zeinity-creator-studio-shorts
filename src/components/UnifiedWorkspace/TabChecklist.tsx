import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  FileVideo, 
  FileAudio, 
  FileImage, 
  FileText, 
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { ContentItem } from '../../types';

interface TabChecklistProps {
  content: ContentItem;
  onChange: (updated: ContentItem) => void;
}

export const TabChecklist: React.FC<TabChecklistProps> = ({ content, onChange }) => {
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetType, setNewAssetType] = useState<'video' | 'image' | 'audio' | 'doc'>('video');

  const checklist = content.checklist;

  const toggleCheck = (key: keyof typeof checklist) => {
    if (typeof checklist[key] === 'boolean') {
      onChange({
        ...content,
        checklist: {
          ...checklist,
          [key]: !checklist[key]
        },
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTitle.trim()) return;

    onChange({
      ...content,
      checklist: {
        ...checklist,
        customItems: [
          ...checklist.customItems,
          { id: 'c-' + Date.now().toString(36), title: newCustomTitle.trim(), completed: false }
        ]
      },
      updatedAt: new Date().toISOString()
    });
    setNewCustomTitle('');
  };

  const toggleCustomItem = (id: string) => {
    onChange({
      ...content,
      checklist: {
        ...checklist,
        customItems: checklist.customItems.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      },
      updatedAt: new Date().toISOString()
    });
  };

  const deleteCustomItem = (id: string) => {
    onChange({
      ...content,
      checklist: {
        ...checklist,
        customItems: checklist.customItems.filter(item => item.id !== id)
      },
      updatedAt: new Date().toISOString()
    });
  };

  // Asset handling
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetUrl.trim()) return;

    onChange({
      ...content,
      checklist: {
        ...checklist,
        assetLinks: [
          ...checklist.assetLinks,
          {
            id: 'ast-' + Date.now().toString(36),
            name: newAssetName.trim(),
            url: newAssetUrl.trim(),
            type: newAssetType
          }
        ]
      },
      updatedAt: new Date().toISOString()
    });
    setNewAssetName('');
    setNewAssetUrl('');
  };

  const deleteAsset = (id: string) => {
    onChange({
      ...content,
      checklist: {
        ...checklist,
        assetLinks: checklist.assetLinks.filter(a => a.id !== id)
      },
      updatedAt: new Date().toISOString()
    });
  };

  const totalCoreChecks = 7;
  const completedCoreChecks = [
    checklist.voRecorded,
    checklist.broll1080pReady,
    checklist.captionsContrastOk,
    checklist.safeZoneVerified,
    checklist.audioLevelsBalanced,
    checklist.musicRoyaltyFree,
    checklist.firstHourEngagementPlan
  ].filter(Boolean).length;

  const progressPercent = Math.round((completedCoreChecks / totalCoreChecks) * 100);

  return (
    <div className="space-y-6">
      
      {/* Progress Card */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Kelayakan Produksi & Quality Control ({completedCoreChecks}/{totalCoreChecks} Selesai)
            </h4>
            <p className="text-xs text-slate-400">
              Pemeriksaan wajib sebelum video dinyatakan <strong>Siap Produksi</strong> dan dijadwalkan tayang.
            </p>
          </div>
          <span className="font-mono text-sm font-bold text-indigo-400">{progressPercent}%</span>
        </div>

        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHECKLIST ITEMS */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Checklist Produksi Zeinity
          </h4>

          <div className="space-y-2.5 text-xs">
            
            {/* 1. Voice-over */}
            <div 
              onClick={() => toggleCheck('voRecorded')}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
            >
              {checklist.voRecorded ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <strong className={`block ${checklist.voRecorded ? 'text-white' : 'text-slate-300'}`}>
                  1. Rekaman Voice-Over Selesai & Jernih
                </strong>
                <span className="text-[11px] text-slate-400">Tempo bicara bertenaga 130–160 WPM, zero dead air pada detik ke-0.</span>
              </div>
            </div>

            {/* 2. B-Roll 1080p */}
            <div 
              onClick={() => toggleCheck('broll1080pReady')}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
            >
              {checklist.broll1080pReady ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <strong className={`block ${checklist.broll1080pReady ? 'text-white' : 'text-slate-300'}`}>
                  2. B-Roll & Screen Capture 1080p Siap
                </strong>
                <span className="text-[11px] text-slate-400">Rekaman antarmuka asli dengan zoom 1.2x atau penyorot merah pada menu.</span>
              </div>
            </div>

            {/* 3. Captions Contrast */}
            <div 
              onClick={() => toggleCheck('captionsContrastOk')}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
            >
              {checklist.captionsContrastOk ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <strong className={`block ${checklist.captionsContrastOk ? 'text-white' : 'text-slate-300'}`}>
                  3. Dynamic Auto-Captions Kontras Tinggi
                </strong>
                <span className="text-[11px] text-slate-400">Teks putih/kuning dengan outline gelap, muncul per 2–4 kata mengikuti ritme bicara.</span>
              </div>
            </div>

            {/* 4. Safe Zone */}
            <div 
              onClick={() => toggleCheck('safeZoneVerified')}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
            >
              {checklist.safeZoneVerified ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <strong className={`block ${checklist.safeZoneVerified ? 'text-white' : 'text-slate-300'}`}>
                  4. Safe-Zone Terverifikasi (Center 60%)
                </strong>
                <span className="text-[11px] text-slate-400">Bebas teks pada 15% atas dan 25% bawah layar agar tidak tertutup tombol Shorts.</span>
              </div>
            </div>

            {/* 5. Audio Balance */}
            <div 
              onClick={() => toggleCheck('audioLevelsBalanced')}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
            >
              {checklist.audioLevelsBalanced ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <strong className={`block ${checklist.audioLevelsBalanced ? 'text-white' : 'text-slate-300'}`}>
                  5. Keseimbangan Audio (Voice Dominan)
                </strong>
                <span className="text-[11px] text-slate-400">Musik latar belakang tidak menenggelamkan artikulasi narasi suara.</span>
              </div>
            </div>

            {/* 6. Royalty-Free Music */}
            <div 
              onClick={() => toggleCheck('musicRoyaltyFree')}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
            >
              {checklist.musicRoyaltyFree ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <strong className={`block ${checklist.musicRoyaltyFree ? 'text-white' : 'text-slate-300'}`}>
                  6. Musik Latar Bebas Hak Cipta
                </strong>
                <span className="text-[11px] text-slate-400">Menggunakan audio library YouTube Shorts atau musik komersial bebas klaim.</span>
              </div>
            </div>

            {/* 7. First Hour Engagement */}
            <div 
              onClick={() => toggleCheck('firstHourEngagementPlan')}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
            >
              {checklist.firstHourEngagementPlan ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <strong className={`block ${checklist.firstHourEngagementPlan ? 'text-white' : 'text-slate-300'}`}>
                  7. Rencana Interaksi Jam Pertama (07:00–08:00 WIB)
                </strong>
                <span className="text-[11px] text-slate-400">Memasang komentar pinned dan siap membalas tanggapan penonton awal.</span>
              </div>
            </div>

          </div>

          {/* Custom Checklist Form */}
          <form onSubmit={handleAddCustomItem} className="pt-2 flex gap-2">
            <input
              type="text"
              value={newCustomTitle}
              onChange={e => setNewCustomTitle(e.target.value)}
              placeholder="+ Tambah checklist khusus..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Tambah
            </button>
          </form>

          {/* Custom items list */}
          {checklist.customItems.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleCustomItem(item.id)}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span className={item.completed ? 'line-through text-slate-500' : ''}>{item.title}</span>
              </label>
              <button onClick={() => deleteCustomItem(item.id)} className="text-slate-600 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* ASSET LIBRARY PER VIDEO */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Asset Library Proyek Video Ini
          </h4>
          <p className="text-xs text-slate-400">
            Tautkan file B-roll Google Drive, rekaman layar, atau audio pendukung untuk Shorts ini.
          </p>

          {/* Form Tambah Aset */}
          <form onSubmit={handleAddAsset} className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={newAssetName}
                onChange={e => setNewAssetName(e.target.value)}
                placeholder="Nama Aset (cth: B-Roll Screen 1080p)"
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                required
              />
              <select
                value={newAssetType}
                onChange={e => setNewAssetType(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="video">Video B-Roll</option>
                <option value="image">Gambar / Screenshot</option>
                <option value="audio">Voice-Over / SFX</option>
                <option value="doc">Dokumen / Referensi</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={newAssetUrl}
                onChange={e => setNewAssetUrl(e.target.value)}
                placeholder="URL File (Google Drive / Cloud / Local Link)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Simpan
              </button>
            </div>
          </form>

          {/* Asset List */}
          <div className="space-y-2">
            {checklist.assetLinks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                Belum ada aset tertaut untuk video ini.
              </div>
            ) : (
              checklist.assetLinks.map(asset => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {asset.type === 'video' && <FileVideo className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                    {asset.type === 'audio' && <FileAudio className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                    {asset.type === 'image' && <FileImage className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    {asset.type === 'doc' && <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    <span className="font-medium text-slate-200 truncate">{asset.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-indigo-400 hover:text-indigo-300"
                      title="Buka Aset"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="p-1 text-slate-500 hover:text-red-400"
                      title="Hapus aset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
