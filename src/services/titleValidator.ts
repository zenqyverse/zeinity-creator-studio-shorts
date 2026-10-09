// =======================================================
// ZEINITY CREATOR STUDIO — TITLE VALIDATOR SERVICE
// =======================================================

export interface TitleValidationResult {
  isValid: boolean;
  wordCount: number;
  starter: string | null;
  hasQuestionMark: boolean;
  isWithinWordRange: boolean;
  issues: string[];
  tips: string[];
  formulaType: 'apa' | 'kenapa' | 'bagaimana' | 'invalid';
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateZeinityTitle(title: string): TitleValidationResult {
  const trimmed = (title || '').trim();
  const issues: string[] = [];
  const tips: string[] = [];

  if (!trimmed) {
    return {
      isValid: false,
      wordCount: 0,
      starter: null,
      hasQuestionMark: false,
      isWithinWordRange: false,
      issues: ['Judul masih kosong. Masukkan judul video.'],
      tips: ['Gunakan formula Apa / Kenapa / Bagaimana dengan panjang 5–10 kata.'],
      formulaType: 'invalid'
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Cek awalan kata (Apa / Kenapa / Bagaimana)
  const firstWordRaw = words[0].replace(/[^a-zA-Z]/g, '');
  const firstWord = firstWordRaw.charAt(0).toUpperCase() + firstWordRaw.slice(1).toLowerCase();
  
  let formulaType: 'apa' | 'kenapa' | 'bagaimana' | 'invalid' = 'invalid';
  let starter: string | null = null;

  if (firstWord === 'Apa') {
    formulaType = 'apa';
    starter = 'Apa';
  } else if (firstWord === 'Kenapa') {
    formulaType = 'kenapa';
    starter = 'Kenapa';
  } else if (firstWord === 'Bagaimana') {
    formulaType = 'bagaimana';
    starter = 'Bagaimana';
  } else {
    issues.push(`Judul harus diawali kata "Apa", "Kenapa", atau "Bagaimana" (saat ini diawali "${words[0]}").`);
    tips.push('Pilih formula: "Apa Saja...", "Kenapa Aplikasi...", atau "Bagaimana Cara...".');
  }

  // 2. Cek tanda tanya
  const hasQuestionMark = trimmed.endsWith('?');
  if (!hasQuestionMark) {
    issues.push('Judul wajib berbentuk kalimat tanya dan diakhiri tanda tanya (?).');
    tips.push('Tambahkan tanda tanya (?) di akhir kalimat judul.');
  }

  // 3. Cek panjang kata (5 - 10 kata)
  let isWithinWordRange = true;
  if (wordCount < 5) {
    issues.push(`Terlalu pendek (${wordCount} kata). Standar Zeinity adalah 5–10 kata.`);
    tips.push('Tambahkan konteks platform atau objek spesifik.');
    isWithinWordRange = false;
  } else if (wordCount > 10) {
    issues.push(`Terlalu panjang (${wordCount} kata). Standar Zeinity adalah 5–10 kata agar tidak terpotong di layar HP.`);
    tips.push('Padatkan kalimat dan buang kata pengisi yang tidak perlu.');
    isWithinWordRange = false;
  }

  const isValid = issues.length === 0;

  return {
    isValid,
    wordCount,
    starter,
    hasQuestionMark,
    isWithinWordRange,
    issues,
    tips,
    formulaType
  };
}

export const TITLE_FORMULA_TEMPLATES = [
  {
    prefix: 'Apa',
    category: 'Informasi & Pembaruan',
    templates: [
      'Apa Saja [Jumlah] Fitur Baru [Platform] Bulan Ini?',
      'Apa Bahaya Fitur [Nama Fitur] yang Baru Dirilis?',
      'Apa Saja Perubahan Aturan [Platform] untuk Pengguna?'
    ],
    examples: [
      'Apa Saja Fitur Baru WhatsApp Bulan Ini?',
      'Apa Bahaya Fitur Rekam Suara AI Baru?'
    ]
  },
  {
    prefix: 'Kenapa',
    category: 'Fakta & Alasan Cepat',
    templates: [
      'Kenapa [Aplikasi/Perangkat] Kamu Tiba-Tiba [Kondisi]?',
      'Kenapa [Perusahaan] Diam-Diam Mengubah [Fitur/Kebijakan]?',
      'Kenapa Fitur [Nama Fitur] Tiba-Tiba Hilang di Ponsel?'
    ],
    examples: [
      'Kenapa Aplikasi Ini Diam-Diam Pakai Kuotamu?',
      'Kenapa Semua Game Sekarang Minta Akun Baru?'
    ]
  },
  {
    prefix: 'Bagaimana',
    category: 'Panduan & Solusi Terapan',
    templates: [
      'Bagaimana Cara [Aksi Cepat] Tanpa [Kendala/Risiko]?',
      'Bagaimana Aturan Baru Ini Mengubah Sistem [Aktivitas]?',
      'Bagaimana Cara Mematikan Fitur Pelacak di Ponsel?'
    ],
    examples: [
      'Bagaimana Cara Mematikan Fitur Pelacak di Ponsel?',
      'Bagaimana Aturan Baru Ini Mengubah Sistem Belanja?'
    ]
  }
];
