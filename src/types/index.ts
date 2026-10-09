// =======================================================
// ZEINITY CREATOR STUDIO — DATA TYPES DEFINITIONS
// =======================================================

export type ContentStatus =
  | 'idea'               // Ide awal
  | 'research'           // Riset & cek fakta
  | 'scripting'          // Penyusunan naskah
  | 'production_ready'   // Siap produksi
  | 'editing'            // Proses editing video
  | 'review'             // Review akhir
  | 'scheduled'          // Terjadwal tayang
  | 'published';         // Sudah terbit

export type ContentPillar =
  | 'internet_social'        // Internet & Media Sosial
  | 'ai_tech'                // AI & Teknologi
  | 'digital_economy'        // Ekonomi Digital & Budaya Konsumen
  | 'gaming_entertainment'   // Gaming & Hiburan Digital
  | 'modern_life';           // Kehidupan Modern & Perilaku Digital

export type ContentFormat =
  | 'flash_news'       // 20–30s (Headline + 2-3 Poin + Implikasi)
  | 'quick_breakdown'  // 30–45s (Pertanyaan + Cara Kerja + Implikasi)
  | 'actionable_tip'   // 45–60s (Masalah + 3 Langkah Praktis + CTA)
  | 'myth_buster';     // 30–45s (Klaim Viral + Bukti Fakta + Solusi)

export type VerificationStatus =
  | 'unverified'          // Belum Dicek
  | 'verified'            // Terverifikasi Resmi
  | 'needs_confirmation'  // Perlu Konfirmasi Tambahan
  | 'deprecated'          // Kedaluwarsa
  | 'rumor_promo';        // Rumor / Klaim Promosi

export interface ResearchSource {
  id: string;
  platformOrTopic: string;
  sourceUrl: string;
  sourceDate: string;
  eventDate?: string;
  claim: string;
  evidenceQuote: string;
  summary: string;
  verificationStatus: VerificationStatus;
  isOfficialSource: boolean;
}

export interface ScriptVersionSnapshot {
  id: string;
  version: number;
  timestamp: string;
  stageHook: string;
  stageContext: string;
  stagePayoff: string;
  stageEnding: string;
  fullScript: string;
  wordCount: number;
  wpmPace: number;
  note?: string;
}

export interface ScriptData {
  stageHook: string;       // Stage 1: Hook (0-3s)
  stageContext: string;    // Stage 2: Context (4-10s)
  stagePayoff: string;     // Stage 3: Core Value / Payoff (11-45s)
  stageEnding: string;     // Stage 4: Seamless Loop / CTA (46-60s)
  fullScript: string;      // Continuous merged text
  wpmPace: number;         // Default 145 (range 130-160)
  version: number;
  history?: ScriptVersionSnapshot[];
}

export interface StoryboardShot {
  id: string;
  stage: 'hook' | 'context' | 'payoff' | 'ending';
  timestamp: string;       // e.g. "00:00 - 00:03"
  visualAction: string;    // e.g. "Screen recording app settings, zoom in to toggle"
  bRollSource: string;     // e.g. "iPhone 15 screen capture"
  onScreenText: string;    // Teks besar di layar
  highlightFx: string;     // e.g. "Red Circle + Zoom 1.2x"
  audioFx?: string;        // e.g. "Swoosh SFX"
  previewImage?: string;   // Data URL or image link
}

export interface ProductionChecklist {
  voRecorded: boolean;
  broll1080pReady: boolean;
  captionsContrastOk: boolean;
  safeZoneVerified: boolean;
  audioLevelsBalanced: boolean;
  musicRoyaltyFree: boolean;
  firstHourEngagementPlan: boolean;
  customItems: { id: string; title: string; completed: boolean }[];
  assetLinks: { id: string; name: string; url: string; type: 'video' | 'image' | 'audio' | 'doc' }[];
}

export interface ShortsAnalytics {
  shownInFeed: number;
  views: number;
  viewedPercent: number;      // Target: >= 70%
  swipedAwayPercent: number;
  apvPercent: number;         // Target: 90% - 110%
  avgViewDurationSec: number;
  likes: number;
  comments: number;
  shares: number;
  subscribersGained: number;
  evaluationWhatWorked: string;
  evaluationWhatFailed: string;
  evaluationNextExperiment: string;
  evaluatedAt?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  status: ContentStatus;
  pillar: ContentPillar;
  format: ContentFormat;
  hookText: string;
  publishDate?: string;          // ISO string (Jadwal: Senin/Kamis/Minggu 07:00 WIB)
  productionDeadline?: string;   // ISO string (Batas akhir editing)
  targetDurationSec: number;     // e.g. 25, 40, 55
  targetWpm: number;
  tags: string[];
  notes: string;
  researchSources: ResearchSource[];
  script: ScriptData;
  storyboard: StoryboardShot[];
  checklist: ProductionChecklist;
  analytics?: ShortsAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  nineRouterBaseUrl: string;
  nineRouterApiKey: string;
  nineRouterCombo: string;
  defaultWpm: number;
  creatorName: string;
}
