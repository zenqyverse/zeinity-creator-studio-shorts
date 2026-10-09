// =======================================================
// ZEINITY CREATOR STUDIO — 9ROUTER AI GATEWAY SERVICE
// Integrasi AI Gateway dengan dukungan Combos & Local Fallback
// =======================================================

import { ContentPillar, ContentFormat, ContentItem } from '../types';
import { CONTENT_PILLARS, CONTENT_FORMATS } from '../constants/zeinityRules';

export interface AiGatewayConfig {
  baseUrl: string;
  apiKey: string;
  comboName: string;
}

export function getDefaultAiConfig(): AiGatewayConfig {
  return {
    baseUrl: (import.meta as any).env?.VITE_NINEROUTER_BASE_URL || 'http://localhost:20128/v1',
    apiKey: (import.meta as any).env?.VITE_NINEROUTER_API_KEY || '',
    comboName: (import.meta as any).env?.VITE_NINEROUTER_COMBO || 'zeinity-combo'
  };
}

// System prompt dasar yang menanamkan seluruh batasan channel Zeinity
const ZEINITY_SYSTEM_PROMPT = `
Kamu adalah AI Production Assistant khusus untuk channel YouTube Shorts "Zeinity".
Prinsip utama Zeinity:
1. Video Shorts vertikal ≤ 60 detik.
2. Single-Point Focus: 1 video menyelesaikan 1 pertanyaan atau 1 fakta konkret.
3. Kecepatan tanpa kompromi akurasi: mengutamakan fakta resmi & changelog terverifikasi.
4. Detik pertama menentukan: Tanpa intro sapaan klise ("Halo guys", "Kembali lagi"). Langsung ke hook pada detik 0.
5. Struktur 4-Stage:
   - Stage 1 (0-3s): Visual & Audio Hook
   - Stage 2 (4-10s): Context Acceleration (mengapa penonton harus peduli sekarang)
   - Stage 3 (11-45s): Core Value / Payoff (bukti konkret, demo, langkah)
   - Stage 4 (46-60s): Seamless Loop atau Smart CTA
6. Naskah wajib 90–140 kata (tempo bicara 130–160 kata/menit).
7. Judul wajib kalimat tanya diawali "Apa", "Kenapa", atau "Bagaimana" dengan panjang 5–10 kata diakhiri tanda tanya (?).
8. DILARANG membuat fakta bohong (halusinasi). Jika fakta belum pasti, nyatakan sebagai perlu verifikasi.
`;

export async function callNineRouter(
  config: AiGatewayConfig,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  temperature = 0.7
): Promise<string> {
  const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const payload = {
    model: config.comboName || 'zeinity-combo',
    messages,
    temperature
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`9Router Gateway error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Respons dari 9Router kosong.');
  }

  return content;
}

// =======================================================
// ASISTEN SPESIFIK WORKFLOW ZEINITY
// =======================================================

// 1. Topic Discovery Assistant
export async function generateTopicIdeas(
  pillar: ContentPillar,
  format: ContentFormat,
  config: AiGatewayConfig
): Promise<Array<{ title: string; hook: string; claim: string }>> {
  const pillarInfo = CONTENT_PILLARS[pillar];
  const formatInfo = CONTENT_FORMATS[format];

  try {
    const prompt = `
Berikan 3 ide konten Shorts untuk Zeinity pada pilar: "${pillarInfo.name}" (${pillarInfo.description}) dengan format: "${formatInfo.name}" (${formatInfo.purpose}).

SYARAT MUTLAK:
- Judul wajib diawali "Apa", "Kenapa", atau "Bagaimana" dan panjang 5–10 kata diakhiri (?).
- Hook detik 0–3 harus langsung to-the-point tanpa sapaan.
- Fakta yang diangkat harus realistis berdasarkan ekosistem digital nyata (fitur aplikasi, aturan privasi, atau teknologi).

Keluarkan dalam format JSON array murni tanpa markdown pembungkus lain:
[
  {
    "title": "Judul kalimat tanya 5-10 kata?",
    "hook": "Kalimat pembuka tajam 0-3 detik",
    "claim": "Fakta atau isu resmi yang mendasari topik ini"
  }
]
`;

    const raw = await callNineRouter(config, [
      { role: 'system', content: ZEINITY_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn('Gagal memanggil 9Router, menggunakan fallback template lokal:', err);
  }

  // Fallback lokal jika 9Router belum aktif
  return getFallbackTopicIdeas(pillar, format);
}

// 2. Script Drafter Assistant
export async function draftZeinityScript(
  topicTitle: string,
  pillar: ContentPillar,
  format: ContentFormat,
  evidenceNotes: string,
  config: AiGatewayConfig
): Promise<{ stageHook: string; stageContext: string; stagePayoff: string; stageEnding: string; fullScript: string; totalWords: number }> {
  const formatInfo = CONTENT_FORMATS[format];

  try {
    const prompt = `
Susun naskah video YouTube Shorts Zeinity berdasarkan informasi berikut:
- Judul: "${topicTitle}"
- Pilar: "${CONTENT_PILLARS[pillar].name}"
- Format: "${formatInfo.name}" (${formatInfo.durationLabel})
- Bukti/Catatan Fakta: "${evidenceNotes || 'Fakta pembaruan digital terkini'}"

PANDUAN FORMAT TAHAP INI:
- Stage 1 (Hook 0-3s): ${formatInfo.stagesGuide.stage1} (sekitar 8-15 kata)
- Stage 2 (Context 4-10s): ${formatInfo.stagesGuide.stage2} (sekitar 15-25 kata)
- Stage 3 (Core Payoff 11-45s): ${formatInfo.stagesGuide.stage3} (sekitar 50-80 kata)
- Stage 4 (Loop / CTA 46-60s): ${formatInfo.stagesGuide.stage4} (sekitar 15-25 kata)

TOTAL KATA HARUS BERADA DI ANTARA 90 SAMPAI 140 KATA!
Bahasa Indonesia alami, lugas, tanpa jargon rumit, tanpa sapaan pembuka.

Keluarkan dalam JSON murni:
{
  "stageHook": "...",
  "stageContext": "...",
  "stagePayoff": "...",
  "stageEnding": "..."
}
`;

    const raw = await callNineRouter(config, [
      { role: 'system', content: ZEINITY_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const full = `${parsed.stageHook} ${parsed.stageContext} ${parsed.stagePayoff} ${parsed.stageEnding}`.trim();
      const words = full.split(/\s+/).filter(Boolean).length;
      return {
        stageHook: parsed.stageHook,
        stageContext: parsed.stageContext,
        stagePayoff: parsed.stagePayoff,
        stageEnding: parsed.stageEnding,
        fullScript: full,
        totalWords: words
      };
    }
  } catch (err) {
    console.warn('Gagal memanggil 9Router untuk naskah, menggunakan fallback cerdas:', err);
  }

  return getFallbackScript(topicTitle, format);
}

// 3. Title Variations Assistant
export async function generateTitleVariations(
  currentTitle: string,
  topicContext: string,
  config: AiGatewayConfig
): Promise<string[]> {
  try {
    const prompt = `
Buatkan 5 alternatif judul YouTube Shorts Zeinity untuk topik: "${currentTitle}" (Konteks: ${topicContext}).

SYARAT WAJIB:
1. Harus kalimat tanya diakhiri tanda tanya (?).
2. Setiap judul WAJIB diawali salah satu dari: "Apa", "Kenapa", atau "Bagaimana".
3. Panjang judul HARUS pas antara 5 sampai 10 kata.
4. Buat variasinya seimbang: ada yang berawalan Apa, Kenapa, dan Bagaimana.

Keluarkan dalam format JSON array murni:
["Judul 1?", "Judul 2?", "Judul 3?", "Judul 4?", "Judul 5?"]
`;

    const raw = await callNineRouter(config, [
      { role: 'system', content: ZEINITY_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn('Gagal memanggil 9Router untuk judul, fallback lokal:', err);
  }

  return [
    `Apa Saja Fakta Baru Terkait ${currentTitle.replace(/[?]/g, '')}?`,
    `Kenapa Fitur Ini Penting Kamu Ketahui?`,
    `Bagaimana Cara Kerja Sistem Baru Ini?`,
    `Apa Bahaya Jika Mengabaikan Aturan Ini?`,
    `Bagaimana Trik Cepat Mengatasi Masalah Ini?`
  ];
}

// =======================================================
// LOCAL FALLBACK GENERATORS (RULE-BASED SMART TEMPLATES)
// =======================================================

function getFallbackTopicIdeas(pillar: ContentPillar, format: ContentFormat) {
  const map: Record<ContentPillar, Array<{ title: string; hook: string; claim: string }>> = {
    internet_social: [
      {
        title: 'Apa Saja Fitur Baru WhatsApp Bulan Ini?',
        hook: 'WhatsApp baru saja merilis pembaruan privasi yang wajib kamu periksa hari ini.',
        claim: 'Pembaruan aplikasi versi terbaru menambahkan enkripsi metadata obrolan dan pembatasan tangkapan layar.'
      },
      {
        title: 'Kenapa Akun Instagram Tiba-Tiba Dibatasi?',
        hook: 'Jangan panik kalau akunmu mendadak tidak bisa berkomentar di postingan.',
        claim: 'Sistem deteksi bot terbaru Meta menandai aktivitas beruntun dalam jeda singkat sebagai anomali.'
      },
      {
        title: 'Bagaimana Cara Mengunci Data Pribadi di Medsos?',
        hook: 'Tiga setelan tersembunyi ini bisa menutup celah kebocoran profilmu sekarang juga.',
        claim: 'Sebagian besar platform media sosial mengaktifkan penargetan iklan pihak ketiga secara bawaan.'
      }
    ],
    ai_tech: [
      {
        title: 'Apa Bahaya Fitur Rekam Suara AI Baru?',
        hook: 'Kloning suara berbasis AI sekarang hanya butuh rekaman tiga detik.',
        claim: 'Model generatif suara terbaru mampu mereplikasi intonasi dan warna vokal dari pesan suara pendek.'
      },
      {
        title: 'Kenapa Baterai Ponselmu Cepat Habis Hari Ini?',
        hook: 'Pembaruan sistem terbaru ternyata mengaktifkan sinkronisasi latar belakang non-stop.',
        claim: 'Fitur pelacakan aktivitas real-time pada update OS terbaru meningkatkan konsumsi daya hingga 18%.'
      },
      {
        title: 'Bagaimana Cara Deteksi Video Deepfake di Ponsel?',
        hook: 'Perhatikan detail kecil pada kedipan mata dan garis rahang ini.',
        claim: 'Algoritma kompresi video Shorts sering kali memudarkan artefak tepi pada rekaman manipulasi AI.'
      }
    ],
    digital_economy: [
      {
        title: 'Kenapa Aplikasi Ini Diam-Diam Pakai Kuotamu?',
        hook: 'Cek daftar konsumsi data di ponselmu sekarang sebelum tagihan melonjak.',
        claim: 'Aplikasi belanja online melakukan caching otomatis materi video promosi di jaringan seluler.'
      },
      {
        title: 'Bagaimana Aturan Baru Ini Mengubah Sistem Belanja?',
        hook: 'Biaya penanganan baru ini otomatis ditambahkan saat kamu menyelesaikan pembayaran.',
        claim: 'Regulasi marketplace terbaru memperbolehkan penyesuaian biaya jasa aplikasi per transaksi.'
      },
      {
        title: 'Apa Saja Trik Batalkan Langganan Otomatis?',
        hook: 'Tombol pembatalan langganan sering kali disembunyikan di sub-menu terdalam.',
        claim: 'Dark pattern antarmuka sengaja menaruh tautan unsubscribe dengan kontras teks yang sangat rendah.'
      }
    ],
    gaming_entertainment: [
      {
        title: 'Kenapa Semua Game Sekarang Minta Akun Baru?',
        hook: 'Penerbit game besar kini mewajibkan login sekunder bahkan untuk game single player.',
        claim: 'Perjanjian lisensi pengguna akhir terbaru mengalihkan hak lisensi cloud ke ekosistem terpadu penerbit.'
      },
      {
        title: 'Apa Status Kepemilikan Game Digital yang Dibeli?',
        hook: 'Kamu tidak benar-benar memiliki game digital yang ada di perpustakaan tokomu.',
        claim: 'Pengadilan konsumen Uni Eropa dan syarat ketentuan platform menegaskan pembelian adalah hak sewa pakai lisensi.'
      },
      {
        title: 'Bagaimana Update Baru Ini Mengubah Sistem Rank?',
        hook: 'Sistem matchmaking berbasis performa kini memperhitungkan konsistensi bermain mingguan.',
        claim: 'Changelog kompetitif musim terbaru merombak pembobotan poin kemenangan untuk mencegah smurfing.'
      }
    ],
    modern_life: [
      {
        title: 'Kenapa Notifikasi Ponsel Selalu Bikin Cemas?',
        hook: 'Bunyi denting notifikasi dirancang sengaja memicu lonjakan hormon dopamin instan.',
        claim: 'Riset perilaku digital membuktikan red-dot badge visual melatih refleks cemas pengguna untuk segera membuka layar.'
      },
      {
        title: 'Bagaimana Cara Mengatur Jam Batas Layar Ponsel?',
        hook: 'Gunakan aturan grayscale satu jam sebelum tidur agar matamu rileks.',
        claim: 'Menonaktifkan palet warna jenuh pada layar ponsel terbukti memangkas durasi doom-scrolling hingga 40%.'
      },
      {
        title: 'Apa Saja Tanda Kamu Mengalami Burnout Digital?',
        hook: 'Sering merasa harus langsung membalas pesan instan adalah sinyal kelelahan mental.',
        claim: 'Survei kesehatan kerja modern mencatat tingkat stres meningkat drastis akibat budaya always-on messaging.'
      }
    ]
  };

  return map[pillar] || map.internet_social;
}

function getFallbackScript(title: string, format: ContentFormat) {
  const stageHook = `Pernahkah kamu memperhatikan perubahan penting ini di ponselmu? Judulnya: ${title}`;
  const stageContext = 'Banyak pengguna tidak menyadari bahwa pembaruan resmi terbaru membawa dampak langsung pada keamanan dan kenyamanan penggunaan harian kita.';
  const stagePayoff = 'Berdasarkan dokumentasi resmi yang baru dirilis, ada tiga hal utama yang harus kamu ketahui. Pertama, sistem otomatis mengaktifkan perlindungan baru. Kedua, kamu bisa mematikan pelacakan langsung dari menu setelan. Ketiga, pastikan aplikasi selalu diperbarui ke versi paling stabil.';
  const stageEnding = 'Cek setelan ponselmu sekarang juga, dan bagikan informasi ini ke teman yang belum tahu.';

  const fullScript = `${stageHook} ${stageContext} ${stagePayoff} ${stageEnding}`;
  const totalWords = fullScript.split(/\s+/).filter(Boolean).length;

  return {
    stageHook,
    stageContext,
    stagePayoff,
    stageEnding,
    fullScript,
    totalWords
  };
}
