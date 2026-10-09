import { ContentItem } from '../types';

export const STARTER_SHORTS: ContentItem[] = [
  {
    id: 'zeinity-short-001',
    title: 'Apa Saja Fitur Baru WhatsApp Bulan Ini?',
    status: 'published',
    pillar: 'internet_social',
    format: 'flash_news',
    hookText: 'WhatsApp diam-diam merilis tiga fitur privasi baru minggu ini.',
    publishDate: '2026-10-05T07:00:00.000Z',
    productionDeadline: '2026-10-04T18:00:00.000Z',
    targetDurationSec: 28,
    targetWpm: 145,
    tags: ['WhatsApp', 'Privasi', 'Update Fitur', 'Medsos'],
    notes: 'Shorts fokus pada changelog resmi Meta v2.24.18.',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-05T08:30:00.000Z',
    researchSources: [
      {
        id: 'res-001',
        platformOrTopic: 'WhatsApp / Meta Official Blog',
        sourceUrl: 'https://about.fb.com/news/whatsapp-privacy-updates',
        sourceDate: '2026-10-01',
        eventDate: '2026-10-02',
        claim: 'Meta merilis pembatasan tangkapan layar untuk foto profil dan opsi kode rahasia chat.',
        evidenceQuote: 'Starting this week, profile photo screenshots are blocked by default across all Android and iOS builds.',
        summary: 'Pembaruan resmi mematikan screenshot foto profil dan menambah kunci chat rahasia.',
        verificationStatus: 'verified',
        isOfficialSource: true
      }
    ],
    script: {
      stageHook: 'WhatsApp diam-diam merilis tiga fitur privasi baru minggu ini yang wajib kamu cek.',
      stageContext: 'Pembaruan versi terbaru ini baru saja diluncurkan serentak untuk semua pengguna Android dan iPhone tanpa pengumuman besar.',
      stagePayoff: 'Pertama, kamu sudah tidak bisa lagi mengambil screenshot foto profil orang lain. Kedua, ada kode rahasia untuk menyembunyikan folder chat terkunci dari daftar obrolan utama. Ketiga, panggilan dari nomor tak dikenal kini otomatis disenyapkan.',
      stageEnding: 'Periksa menu setelan privasi WhatsApp kamu sekarang juga, dan lihat apakah fitur ini sudah aktif di ponselmu.',
      fullScript: 'WhatsApp diam-diam merilis tiga fitur privasi baru minggu ini yang wajib kamu cek. Pembaruan versi terbaru ini baru saja diluncurkan serentak untuk semua pengguna Android dan iPhone tanpa pengumuman besar. Pertama, kamu sudah tidak bisa lagi mengambil screenshot foto profil orang lain. Kedua, ada kode rahasia untuk menyembunyikan folder chat terkunci dari daftar obrolan utama. Ketiga, panggilan dari nomor tak dikenal kini otomatis disenyapkan. Periksa menu setelan privasi WhatsApp kamu sekarang juga, dan lihat apakah fitur ini sudah aktif di ponselmu.',
      wpmPace: 145,
      version: 2
    },
    storyboard: [
      {
        id: 'shot-01',
        stage: 'hook',
        timestamp: '00:00 - 00:03',
        visualAction: 'Layar HP menampilkan logo WhatsApp dengan icon gembok bersinar, zoom cepat 1.2x',
        bRollSource: 'Screen recording UI WhatsApp Dark Mode',
        onScreenText: '3 FITUR BARU WHATSAPP!',
        highlightFx: 'Pulsing cyan border + sound swoosh',
        audioFx: 'Swoosh transisi tajam'
      },
      {
        id: 'shot-02',
        stage: 'context',
        timestamp: '00:04 - 00:08',
        visualAction: 'Tangkapan layar halaman About / Version di Google Play Store & App Store',
        bRollSource: 'Play Store changelog capture',
        onScreenText: 'Update Resmi Meta v2.24',
        highlightFx: 'Penyorot kuning pada nomor versi',
        audioFx: 'Pop sound'
      },
      {
        id: 'shot-03',
        stage: 'payoff',
        timestamp: '00:09 - 00:22',
        visualAction: 'Demonstrasi 3 fitur: Layar hitam saat coba screenshot, input PIN chat rahasia, toggle silence unknown callers',
        bRollSource: 'Screen recording menu Privacy WhatsApp',
        onScreenText: '1. No Screenshot\n2. Secret Lock\n3. Silence Spam',
        highlightFx: 'Lingkaran merah pada toggle button',
        audioFx: 'Subtle ding sound'
      },
      {
        id: 'shot-04',
        stage: 'ending',
        timestamp: '00:23 - 00:28',
        visualAction: 'Animasi kursor mengarahkan penonton ke menu Settings > Privacy',
        bRollSource: 'Quick mock animation',
        onScreenText: 'Cek WhatsApp Kamu Sekarang!',
        highlightFx: 'Zoom out transisi loop',
        audioFx: 'Click sound'
      }
    ],
    checklist: {
      voRecorded: true,
      broll1080pReady: true,
      captionsContrastOk: true,
      safeZoneVerified: true,
      audioLevelsBalanced: true,
      musicRoyaltyFree: true,
      firstHourEngagementPlan: true,
      customItems: [
        { id: 'c1', title: 'Thumbnail frame terbaik diatur pada detik ke-01', completed: true }
      ],
      assetLinks: [
        { id: 'a1', name: 'B-Roll Recording WhatsApp 1080p', url: 'https://example.com/assets/wa-broll.mp4', type: 'video' }
      ]
    },
    analytics: {
      shownInFeed: 24500,
      views: 18200,
      viewedPercent: 74.3, // Target >= 70% tercapai!
      swipedAwayPercent: 25.7,
      apvPercent: 104.5,   // Target 90-110% tercapai!
      avgViewDurationSec: 29.2,
      likes: 1420,
      comments: 88,
      shares: 312,
      subscribersGained: 145,
      evaluationWhatWorked: 'Hook 0-3 detik visual screenshot terbukti menahan penonton (74.3% stayed). Looping naskah di akhir membuat penonton menonton ulang sehingga APV tembus 104%.',
      evaluationWhatFailed: 'Teks demo poin kedua sedikit terlalu cepat berpindah bagi penonton layar kecil.',
      evaluationNextExperiment: 'Uji variasi judul dengan awalan "Kenapa" pada topik privasi berikutnya untuk membandingkan rasio klik.'
    }
  },
  {
    id: 'zeinity-short-002',
    title: 'Kenapa Aplikasi Ini Diam-Diam Pakai Kuotamu?',
    status: 'scheduled',
    pillar: 'digital_economy',
    format: 'quick_breakdown',
    hookText: 'Pernah heran kenapa kuota internet tiba-tiba berkurang drastis padahal ponsel sedang tidak dipakai?',
    publishDate: '2026-10-15T07:00:00.000Z',
    productionDeadline: '2026-10-14T17:00:00.000Z',
    targetDurationSec: 42,
    targetWpm: 145,
    tags: ['Kuota', 'Aplikasi Belanja', 'Penghematan Data', 'Android iOS'],
    notes: 'Jadwal tayang rutin Kamis 07:00 WIB.',
    createdAt: '2026-10-06T09:00:00.000Z',
    updatedAt: '2026-10-08T14:20:00.000Z',
    researchSources: [
      {
        id: 'res-002',
        platformOrTopic: 'Analisis Jaringan & Caching E-commerce',
        sourceUrl: 'https://developer.android.com/topic/performance/network-cache',
        sourceDate: '2026-09-28',
        claim: 'Beberapa aplikasi marketplace melakukan preloading video promosi otomatis di background data.',
        evidenceQuote: 'Apps with aggressive background prefetching consume cellular bandwidth unless Background Data is restricted.',
        summary: 'Fitur background auto-prefetch video promosi menyedot kuota hingga 300MB per hari tanpa disadari.',
        verificationStatus: 'verified',
        isOfficialSource: true
      }
    ],
    script: {
      stageHook: 'Pernah heran kenapa kuota internet tiba-tiba habis padahal ponsel sedang jarang kamu pakai?',
      stageContext: 'Tersangkanya sering kali bukan video streaming, melainkan aplikasi belanja online yang diam-diam melakukan pre-loading video promosi di latar belakang.',
      stagePayoff: 'Saat kamu menutup aplikasi, sistem mereka tetap mengunduh puluhan video banner promosi agar langsung lancar saat nanti dibuka lagi. Akibatnya, kuotamu tersedot ratusan megabyte setiap hari tanpa kamu sadari. Untungnya, ini bisa dihentikan dalam dua langkah mudah: buka setelan ponsel, pilih aplikasi tersebut, lalu matikan izin data latar belakang.',
      stageEnding: 'Cek penggunaan kuota aplikasi belanjamu sekarang, dan kamu akan kaget melihat angkanya.',
      fullScript: 'Pernah heran kenapa kuota internet tiba-tiba habis padahal ponsel sedang jarang kamu pakai? Tersangkanya sering kali bukan video streaming, melainkan aplikasi belanja online yang diam-diam melakukan pre-loading video promosi di latar belakang. Saat kamu menutup aplikasi, sistem mereka tetap mengunduh puluhan video banner promosi agar langsung lancar saat nanti dibuka lagi. Akibatnya, kuotamu tersedot ratusan megabyte setiap hari tanpa kamu sadari. Untungnya, ini bisa dihentikan dalam dua langkah mudah: buka setelan ponsel, pilih aplikasi tersebut, lalu matikan izin data latar belakang. Cek penggunaan kuota aplikasi belanjamu sekarang, dan kamu akan kaget melihat angkanya.',
      wpmPace: 145,
      version: 1
    },
    storyboard: [
      {
        id: 'shot-201',
        stage: 'hook',
        timestamp: '00:00 - 00:03',
        visualAction: 'Grafik data usage melonjak tajam dengan teks peringatan "Kuotamu Habis"',
        bRollSource: 'Screen capture Network Meter Android',
        onScreenText: 'KUOTA HABIS SENDIRI?',
        highlightFx: 'Warna teks merah menyala kontras tinggi'
      },
      {
        id: 'shot-202',
        stage: 'context',
        timestamp: '00:04 - 00:10',
        visualAction: 'Logo-logo e-commerce populer berputar dengan ikon download latar belakang',
        bRollSource: 'Motion graphic clean',
        onScreenText: 'Penyebab: Background Prefetch',
        highlightFx: 'Zoom ke folder aplikasi e-commerce'
      },
      {
        id: 'shot-203',
        stage: 'payoff',
        timestamp: '00:11 - 00:35',
        visualAction: 'Langkah demo: Buka Settings > Apps > Data Usage > Toggle Off Background Data',
        bRollSource: '1080p Screen Recording Settings',
        onScreenText: 'Matikan: Background Data',
        highlightFx: 'Kotak penyorot hijau terang pada toggle switch'
      },
      {
        id: 'shot-204',
        stage: 'ending',
        timestamp: '00:36 - 00:42',
        visualAction: 'Kembali ke layar utama dengan baterai dan kuota aman',
        bRollSource: 'Clean mockup phone',
        onScreenText: 'Cek Penggunaan Data Sekarang!',
        highlightFx: 'Looping CTA'
      }
    ],
    checklist: {
      voRecorded: true,
      broll1080pReady: true,
      captionsContrastOk: true,
      safeZoneVerified: true,
      audioLevelsBalanced: true,
      musicRoyaltyFree: true,
      firstHourEngagementPlan: true,
      customItems: [],
      assetLinks: []
    }
  },
  {
    id: 'zeinity-short-003',
    title: 'Bagaimana Cara Mematikan Fitur Pelacak di Ponsel?',
    status: 'editing',
    pillar: 'ai_tech',
    format: 'actionable_tip',
    hookText: 'Tiga setelan pelacakan tersembunyi ini wajib kamu matikan hari ini juga.',
    publishDate: '2026-10-18T07:00:00.000Z',
    productionDeadline: '2026-10-17T15:00:00.000Z',
    targetDurationSec: 52,
    targetWpm: 145,
    tags: ['Android', 'iOS', 'Privasi Data', 'Tracking', 'Tips'],
    notes: 'Jadwal rilis Minggu 07:00 WIB.',
    createdAt: '2026-10-07T11:00:00.000Z',
    updatedAt: '2026-10-08T16:00:00.000Z',
    researchSources: [
      {
        id: 'res-003',
        platformOrTopic: 'Dokumentasi Privasi OS Ponsel',
        sourceUrl: 'https://support.google.com/accounts/answer/3118621',
        sourceDate: '2026-10-01',
        claim: 'Pengaturan Google Activity tracking aktif secara default pada akun baru.',
        evidenceQuote: 'Web & App Activity and Location History are enabled by default for personalization.',
        summary: 'Web & App Activity dan Personalized Ads mengumpulkan jejak lokasi dan pencarian.',
        verificationStatus: 'verified',
        isOfficialSource: true
      }
    ],
    script: {
      stageHook: 'Tiga setelan pelacakan tersembunyi ini wajib kamu matikan di ponselmu hari ini juga.',
      stageContext: 'Tanpa kamu sadari, ponselmu mencatat lokasi persis, histori pencarian, dan aktivitas aplikasi untuk membuat profil iklan digitalmu.',
      stagePayoff: 'Pertama, masuk ke Pengaturan Akun, buka menu Data & Privasi, lalu jeda opsi Aktivitas Web dan Aplikasi. Kedua, buka menu Iklan dan reset atau hapus ID Periklanan ponselmu agar riwayat pelacakan terputus. Ketiga, periksa izin lokasi dan ubah dari Izinkan Sepanjang Waktu menjadi Hanya Saat Aplikasi Digunakan.',
      stageEnding: 'Bagikan video ini ke keluargamu agar data pribadi mereka tetap aman terlindungi.',
      fullScript: 'Tiga setelan pelacakan tersembunyi ini wajib kamu matikan di ponselmu hari ini juga. Tanpa kamu sadari, ponselmu mencatat lokasi persis, histori pencarian, dan aktivitas aplikasi untuk membuat profil iklan digitalmu. Pertama, masuk ke Pengaturan Akun, buka menu Data & Privasi, lalu jeda opsi Aktivitas Web dan Aplikasi. Kedua, buka menu Iklan dan reset atau hapus ID Periklanan ponselmu agar riwayat pelacakan terputus. Ketiga, periksa izin lokasi dan ubah dari Izinkan Sepanjang Waktu menjadi Hanya Saat Aplikasi Digunakan. Bagikan video ini ke keluargamu agar data pribadi mereka tetap aman terlindungi.',
      wpmPace: 145,
      version: 1
    },
    storyboard: [
      {
        id: 'shot-301',
        stage: 'hook',
        timestamp: '00:00 - 00:03',
        visualAction: 'Peta digital dengan pin lokasi bergerak mengikuti pengguna, teks peringatan tajam',
        bRollSource: 'Map tracking mockup',
        onScreenText: 'PONSEL INI MELACAKMU!',
        highlightFx: 'Pulsing red dot'
      },
      {
        id: 'shot-302',
        stage: 'context',
        timestamp: '00:04 - 00:10',
        visualAction: 'Tampilan profil data iklan di menu settings',
        bRollSource: 'Android privacy dashboard capture',
        onScreenText: 'Data & Privasi Akun',
        highlightFx: 'Highlight box'
      },
      {
        id: 'shot-303',
        stage: 'payoff',
        timestamp: '00:11 - 00:45',
        visualAction: '3 demo berurutan: Pause Web Activity, Delete Ad ID, Location permission set to while using only',
        bRollSource: '1080p Screen capture step by step',
        onScreenText: 'Step 1: Pause Activity\nStep 2: Delete Ad ID\nStep 3: Location Only When Used',
        highlightFx: 'Green checkmarks sequence'
      },
      {
        id: 'shot-304',
        stage: 'ending',
        timestamp: '00:46 - 00:52',
        visualAction: 'Ikon gembok hijau menyala dengan teks ajakan berbagi',
        bRollSource: 'Shield icon animation',
        onScreenText: 'Share ke Teman & Keluarga!',
        highlightFx: 'Glow effect'
      }
    ],
    checklist: {
      voRecorded: true,
      broll1080pReady: true,
      captionsContrastOk: false,
      safeZoneVerified: false,
      audioLevelsBalanced: false,
      musicRoyaltyFree: true,
      firstHourEngagementPlan: false,
      customItems: [],
      assetLinks: []
    }
  },
  {
    id: 'zeinity-short-004',
    title: 'Apa Bahaya Fitur Rekam Suara AI Baru?',
    status: 'research',
    pillar: 'modern_life',
    format: 'myth_buster',
    hookText: 'Kloning suara berbasis AI sekarang hanya butuh rekaman suara tiga detik.',
    publishDate: '2026-10-22T07:00:00.000Z',
    productionDeadline: '2026-10-21T18:00:00.000Z',
    targetDurationSec: 38,
    targetWpm: 145,
    tags: ['AI Voice', 'Deepfake', 'Keamanan Digital', 'Penipuan'],
    notes: 'Riset sedang diverifikasi dengan laporan keamanan siber.',
    createdAt: '2026-10-08T08:00:00.000Z',
    updatedAt: '2026-10-09T10:00:00.000Z',
    researchSources: [
      {
        id: 'res-004',
        platformOrTopic: 'Laporan Keamanan Siber AI Voice Scam',
        sourceUrl: 'https://www.ftc.gov/business-guidance/blog/2024/ai-voice-cloning-scams',
        sourceDate: '2026-09-15',
        claim: 'Alat voice synthesis modern mampu meniru karakter vokal hanya dari sample voice note WhatsApp berdurasi singkat.',
        evidenceQuote: 'Scammers can replicate a family member’s voice using just a few seconds of audio extracted from social media.',
        summary: 'Kloning suara AI marak disalahgunakan untuk modus telepon darurat palsu.',
        verificationStatus: 'verified',
        isOfficialSource: true
      }
    ],
    script: {
      stageHook: 'Jangan pernah sembarangan mengirim pesan suara panjang ke nomor asing di internet.',
      stageContext: 'Beredar narasi bahwa membuat kloningan suara AI butuh rekaman profesional berjam-jam di studio musik.',
      stagePayoff: 'Faktanya, teknologi model difusi audio terbaru saat ini hanya butuh sampel suara jernih selama tiga detik untuk meniru intonasi, timbre, dan aksen bicaramu secara presisi. Kloningan ini kemudian digunakan untuk menipu kerabatmu melalui panggilan darurat palsu.',
      stageEnding: 'Buat kata sandi keluarga rahasia sekarang juga untuk memverifikasi situasi darurat.',
      fullScript: 'Jangan pernah sembarangan mengirim pesan suara panjang ke nomor asing di internet. Beredar narasi bahwa membuat kloningan suara AI butuh rekaman profesional berjam-jam di studio musik. Faktanya, teknologi model difusi audio terbaru saat ini hanya butuh sampel suara jernih selama tiga detik untuk meniru intonasi, timbre, dan aksen bicaramu secara presisi. Kloningan ini kemudian digunakan untuk menipu kerabatmu melalui panggilan darurat palsu. Buat kata sandi keluarga rahasia sekarang juga untuk memverifikasi situasi darurat.',
      wpmPace: 145,
      version: 1
    },
    storyboard: [
      {
        id: 'shot-401',
        stage: 'hook',
        timestamp: '00:00 - 00:03',
        visualAction: 'Perekam gelombang suara berubah menjadi avatar digital berbicara',
        bRollSource: 'Audio waveform animation',
        onScreenText: 'BAHAYA VOICE NOTE AI!',
        highlightFx: 'Waveform pulse cyan'
      },
      {
        id: 'shot-402',
        stage: 'context',
        timestamp: '00:04 - 00:09',
        visualAction: 'Teks klaim mitos: "AI butuh jam-jam rekaman" dicoret merah',
        bRollSource: 'Red cross animation',
        onScreenText: 'Mitos: Butuh Studio',
        highlightFx: 'Red strike-through'
      },
      {
        id: 'shot-403',
        stage: 'payoff',
        timestamp: '00:10 - 00:30',
        visualAction: 'Demonstrasi kloning suara 3 detik di software AI audio generator',
        bRollSource: 'Screen capture AI voice tool interface',
        onScreenText: 'Fakta: Cuma Butuh 3 Detik!',
        highlightFx: 'Red alert tag'
      },
      {
        id: 'shot-404',
        stage: 'ending',
        timestamp: '00:31 - 00:38',
        visualAction: 'Tips membuat Safe Word keluarga dengan icon kunci rahasia',
        bRollSource: 'Safe word graphic',
        onScreenText: 'Buat Kata Sandi Keluarga!',
        highlightFx: 'Lock icon pulse'
      }
    ],
    checklist: {
      voRecorded: false,
      broll1080pReady: false,
      captionsContrastOk: false,
      safeZoneVerified: false,
      audioLevelsBalanced: false,
      musicRoyaltyFree: false,
      firstHourEngagementPlan: false,
      customItems: [],
      assetLinks: []
    }
  }
];
