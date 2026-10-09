import { ContentPillar, ContentFormat, ContentStatus } from '../types';

export interface PillarMeta {
  id: ContentPillar;
  name: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  scheduleDay: string; // Hari rutin publikasi
  exampleTopics: string[];
}

export const CONTENT_PILLARS: Record<ContentPillar, PillarMeta> = {
  internet_social: {
    id: 'internet_social',
    name: 'Internet & Medsos',
    badge: '📱 Medsos & Privasi',
    color: '#06b6d4', // Cyan
    bgColor: 'bg-cyan-500/10 text-cyan-400',
    borderColor: 'border-cyan-500/30',
    description: 'Fitur baru platform, aturan privasi, tren format konten, keamanan akun.',
    scheduleDay: 'Senin (07:00 WIB)',
    exampleTopics: [
      'Perubahan setelan privasi dan pelacakan data',
      'Cara kerja fitur baru WhatsApp / Instagram',
      'Mencegah akun dibajak / phishing modern'
    ]
  },
  ai_tech: {
    id: 'ai_tech',
    name: 'AI & Teknologi',
    badge: '🤖 AI & Gadget',
    color: '#6366f1', // Indigo
    bgColor: 'bg-indigo-500/10 text-indigo-400',
    borderColor: 'border-indigo-500/30',
    description: 'Rilis model & tools AI praktis, update OS (Android/iOS), gadget esensial.',
    scheduleDay: 'Senin (07:00 WIB)',
    exampleTopics: [
      'Fitur baru AI yang memangkas waktu kerja',
      'Update OS dan fitur tersembunyi smartphone',
      'Mendeteksi konten deepfake audio/visual'
    ]
  },
  digital_economy: {
    id: 'digital_economy',
    name: 'Ekonomi Digital',
    badge: '💳 Bisnis & Belanja',
    color: '#f59e0b', // Amber
    bgColor: 'bg-amber-500/10 text-amber-400',
    borderColor: 'border-amber-500/30',
    description: 'E-commerce, subscription, fintech, trik diskon tersembunyi, dark patterns.',
    scheduleDay: 'Kamis (07:00 WIB)',
    exampleTopics: [
      'Biaya admin baru di aplikasi belanja/fintech',
      'Membatalkan langganan otomatis tersembunyi',
      'Manipulasi harga promo belanja digital'
    ]
  },
  gaming_entertainment: {
    id: 'gaming_entertainment',
    name: 'Gaming & Hiburan',
    badge: '🎮 Game & Streaming',
    color: '#ec4899', // Pink
    bgColor: 'bg-pink-500/10 text-pink-400',
    borderColor: 'border-pink-500/30',
    description: 'Industri game, live service, streaming, update game, hak kepemilikan digital.',
    scheduleDay: 'Minggu (07:00 WIB)',
    exampleTopics: [
      'Update besar sistem monetisasi game populer',
      'Kebijakan baru platform streaming game',
      'Perubahan hak kepemilikan game digital'
    ]
  },
  modern_life: {
    id: 'modern_life',
    name: 'Kehidupan Modern',
    badge: '🧠 Digital Well-being',
    color: '#10b981', // Emerald
    bgColor: 'bg-emerald-500/10 text-emerald-400',
    borderColor: 'border-emerald-500/30',
    description: 'Digital well-being, manajemen screen time, etika komunikasi daring, burnout.',
    scheduleDay: 'Minggu (07:00 WIB)',
    exampleTopics: [
      'Fitur pembatas screen time yang terbukti efektif',
      'Mengatasi burnout digital dan memfilter notifikasi',
      'Menjaga batas privasi dalam komunikasi kerja daring'
    ]
  }
};

export interface FormatMeta {
  id: ContentFormat;
  name: string;
  durationLabel: string;
  minDuration: number;
  maxDuration: number;
  idealWords: { min: number; max: number };
  purpose: string;
  stagesGuide: {
    stage1: string; // 0-3s
    stage2: string; // 4-10s
    stage3: string; // 11-45s
    stage4: string; // 46-60s
  };
}

export const CONTENT_FORMATS: Record<ContentFormat, FormatMeta> = {
  flash_news: {
    id: 'flash_news',
    name: 'Flash News',
    durationLabel: '20–30 Detik',
    minDuration: 20,
    maxDuration: 30,
    idealWords: { min: 70, max: 95 },
    purpose: 'Menyampaikan satu pembaruan resmi atau berita penting yang baru saja terjadi.',
    stagesGuide: {
      stage1: 'Headline berita + fakta paling mengejutkan/penting (Detik 0–3)',
      stage2: 'Konteks cepat: Mengapa ini terjadi & resmi diumumkan (Detik 4–8)',
      stage3: 'Rincian 2–3 poin kunci yang resmi berlaku (Detik 9–22)',
      stage4: 'Implikasi langsung bagi pengguna biasa (Detik 23–30)'
    }
  },
  quick_breakdown: {
    id: 'quick_breakdown',
    name: 'Quick Breakdown',
    durationLabel: '30–45 Detik',
    minDuration: 30,
    maxDuration: 45,
    idealWords: { min: 90, max: 120 },
    purpose: 'Menjelaskan cara kerja sebuah fitur baru, aturan baru, atau mekanisme digital dalam tempo cepat.',
    stagesGuide: {
      stage1: 'Pertanyaan pemantik / hook visual kontras (Detik 0–3)',
      stage2: 'Konteks minimum mengapa penting diperhatikan (Detik 4–10)',
      stage3: 'Penjelasan langkah/mekanisme inti disertai rekaman antarmuka (Detik 11–38)',
      stage4: 'Kesimpulan singkat / seamless loop ending (Detik 39–45)'
    }
  },
  actionable_tip: {
    id: 'actionable_tip',
    name: 'Actionable Tip',
    durationLabel: '45–60 Detik',
    minDuration: 45,
    maxDuration: 60,
    idealWords: { min: 110, max: 140 },
    purpose: 'Memberikan panduan praktis yang bisa langsung diterapkan penonton di perangkat mereka.',
    stagesGuide: {
      stage1: 'Masalah yang sering dihadapi + janji solusi cepat (Detik 0–3)',
      stage2: 'Konteks bahaya/kerugian jika setelan diabaikan (Detik 4–10)',
      stage3: 'Tiga langkah praktis teruji disertai demo di layar (Detik 11–48)',
      stage4: 'Hasil akhir + Call to action spesifik untuk mencoba (Detik 49–60)'
    }
  },
  myth_buster: {
    id: 'myth_buster',
    name: 'Myth Buster',
    durationLabel: '30–45 Detik',
    minDuration: 30,
    maxDuration: 45,
    idealWords: { min: 90, max: 125 },
    purpose: 'Meluruskan misinformasi atau klaim keliru seputar teknologi yang sedang viral.',
    stagesGuide: {
      stage1: 'Tampilkan klaim viral yang keliru / narasi umum (Detik 0–3)',
      stage2: 'Klarifikasi ringkas: faktanya tidak seperti itu (Detik 4–9)',
      stage3: 'Bukti data resmi & verifikasi teknis sebenarnya (Detik 10–36)',
      stage4: 'Panduan tindakan yang benar bagi penonton (Detik 37–45)'
    }
  }
};

export interface StatusMeta {
  id: ContentStatus;
  label: string;
  order: number;
  color: string;
  description: string;
}

export const PIPELINE_STATUSES: StatusMeta[] = [
  { id: 'idea', label: 'Ide', order: 1, color: '#94a3b8', description: 'Tampungan topik & gagasan awal' },
  { id: 'research', label: 'Riset', order: 2, color: '#38bdf8', description: 'Pemeriksaan sumber & bukti klaim' },
  { id: 'scripting', label: 'Penulisan', order: 3, color: '#818cf8', description: 'Penyusunan naskah 4 tahap & judul' },
  { id: 'production_ready', label: 'Siap Produksi', order: 4, color: '#a855f7', description: 'Naskah & storyboard terverifikasi' },
  { id: 'editing', label: 'Editing', order: 5, color: '#f59e0b', description: 'Proses VO, B-roll, captions di CapCut' },
  { id: 'review', label: 'Review', order: 6, color: '#ec4899', description: 'Pemeriksaan safe zone & audio' },
  { id: 'scheduled', label: 'Terjadwal', order: 7, color: '#06b6d4', description: 'Siap tayang Senin/Kamis/Minggu 07:00' },
  { id: 'published', label: 'Terbit', order: 8, color: '#10b981', description: 'Sudah live di YouTube Shorts' },
];

export const ZEINITY_STANDARDS = {
  paceWpm: {
    min: 130,
    ideal: 145,
    max: 160
  },
  scriptWords: {
    min: 90,
    max: 140
  },
  titleWords: {
    min: 5,
    max: 10
  },
  validTitleStarters: ['Apa', 'Kenapa', 'Bagaimana'],
  safeZones: {
    topPercent: 15,    // 15% dari atas (bebas teks agar tak tertutup header pencarian)
    centerPercent: 60, // 60% tengah (zona aktif visual & teks hook)
    bottomPercent: 25  // 25% bawah (bebas teks agar tak tertutup tombol YouTube)
  },
  analyticsTarget: {
    viewedRatioPercent: 70, // Target viewed >= 70%
    apvMinPercent: 90,      // Target APV 90%
    apvMaxPercent: 110      // Target APV 110%
  },
  publishSchedule: [
    { day: 'Senin', time: '07:00 WIB', focus: 'Internet, Medsos & AI Update' },
    { day: 'Kamis', time: '07:00 WIB', focus: 'Ekonomi Digital, Gadget & Productivity' },
    { day: 'Minggu', time: '07:00 WIB', focus: 'Gaming, Modern Life & Tips Digital Weekend' }
  ]
};
