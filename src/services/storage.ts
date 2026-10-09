// =======================================================
// ZEINITY CREATOR STUDIO — DATA STORE & PERSISTENCE
// Offline-First with optional Supabase Cloud Sync
// =======================================================

import { ContentItem, AppSettings, ContentPillar, ContentFormat } from '../types';
import { STARTER_SHORTS } from './starterData';
import { getSupabaseClient } from './supabaseClient';
import { getDefaultAiConfig } from './aiGateway';
import { CONTENT_FORMATS } from '../constants/zeinityRules';

const STORAGE_KEY_CONTENTS = 'zeinity_creator_studio_contents_v1';
const STORAGE_KEY_SETTINGS = 'zeinity_creator_studio_settings_v1';

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading settings from localStorage:', err);
  }

  const defaultAi = getDefaultAiConfig();
  const envSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envSupabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    supabaseUrl: envSupabaseUrl.includes('your-project-id') ? '' : envSupabaseUrl,
    supabaseAnonKey: envSupabaseKey.includes('your-anon-key') ? '' : envSupabaseKey,
    nineRouterBaseUrl: defaultAi.baseUrl,
    nineRouterApiKey: defaultAi.apiKey,
    nineRouterCombo: defaultAi.comboName,
    defaultWpm: 145,
    creatorName: 'Zeinity Creator'
  };
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

export function getStoredContents(): ContentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading contents from localStorage:', err);
  }

  // Seed default starter kit
  saveStoredContents(STARTER_SHORTS);
  return STARTER_SHORTS;
}

export function saveStoredContents(contents: ContentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONTENTS, JSON.stringify(contents));
  } catch (err) {
    console.error('Error saving contents to localStorage:', err);
  }

  // Coba background sync ke Supabase jika client aktif
  syncToSupabaseAsync(contents).catch(err => {
    console.warn('Background sync ke Supabase gagal atau belum terhubung:', err);
  });
}

// Background sync ke Supabase (Fire and forget, tidak memblokir UI)
async function syncToSupabaseAsync(contents: ContentItem[]): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  for (const item of contents) {
    try {
      // 1. Upsert contents
      await client.from('contents').upsert({
        id: item.id,
        title: item.title,
        status: item.status,
        pillar: item.pillar,
        format: item.format,
        hook_text: item.hookText,
        publish_date: item.publishDate || null,
        production_deadline: item.productionDeadline || null,
        target_duration_sec: item.targetDurationSec,
        target_wpm: item.targetWpm,
        tags: item.tags,
        notes: item.notes,
        updated_at: new Date().toISOString()
      });

      // 2. Upsert script
      await client.from('scripts').upsert({
        content_id: item.id,
        stage_hook: item.script.stageHook,
        stage_context: item.script.stageContext,
        stage_payoff: item.script.stagePayoff,
        stage_ending: item.script.stageEnding,
        full_script: item.script.fullScript,
        version: item.script.version,
        wpm_pace: item.script.wpmPace,
        updated_at: new Date().toISOString()
      });

      // 3. Upsert storyboards
      await client.from('storyboards').upsert({
        content_id: item.id,
        shots: item.storyboard,
        updated_at: new Date().toISOString()
      });

      // 4. Upsert checklists
      await client.from('checklists').upsert({
        content_id: item.id,
        vo_recorded: item.checklist.voRecorded,
        broll_1080p_ready: item.checklist.broll1080pReady,
        captions_contrast_ok: item.checklist.captionsContrastOk,
        safe_zone_verified: item.checklist.safeZoneVerified,
        audio_levels_balanced: item.checklist.audioLevelsBalanced,
        music_royalty_free: item.checklist.musicRoyaltyFree,
        first_hour_engagement_plan: item.checklist.firstHourEngagementPlan,
        custom_items: item.checklist.customItems,
        asset_links: item.checklist.assetLinks,
        updated_at: new Date().toISOString()
      });

      // 5. Upsert analytics jika ada
      if (item.analytics) {
        await client.from('analytics').upsert({
          content_id: item.id,
          shown_in_feed: item.analytics.shownInFeed,
          views: item.analytics.views,
          viewed_percent: item.analytics.viewedPercent,
          swiped_away_percent: item.analytics.swipedAwayPercent,
          apv_percent: item.analytics.apvPercent,
          avg_view_duration_sec: item.analytics.avgViewDurationSec,
          likes: item.analytics.likes,
          comments: item.analytics.comments,
          shares: item.analytics.shares,
          subscribers_gained: item.analytics.subscribersGained,
          evaluation_what_worked: item.analytics.evaluationWhatWorked,
          evaluation_what_failed: item.analytics.evaluationWhatFailed,
          evaluation_next_experiment: item.analytics.evaluationNextExperiment,
          evaluated_at: item.analytics.evaluatedAt || new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Upsert content id ' + item.id + ' error:', e);
    }
  }
}

// Create new blank Short
export function createNewShort(
  title = 'Apa Saja Fitur Baru yang Perlu Kamu Tahu?',
  pillar: ContentPillar = 'internet_social',
  format: ContentFormat = 'flash_news'
): ContentItem {
  const formatInfo = CONTENT_FORMATS[format];
  const now = new Date();
  
  // Hitung jadwal rilis berikutnya (Senin, Kamis, atau Minggu pukul 07:00 WIB)
  const nextPublishDate = getNextScheduledSlot();

  return {
    id: 'zeinity-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    title,
    status: 'idea',
    pillar,
    format,
    hookText: '',
    publishDate: nextPublishDate.toISOString(),
    productionDeadline: new Date(nextPublishDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    targetDurationSec: formatInfo.minDuration + Math.floor((formatInfo.maxDuration - formatInfo.minDuration) / 2),
    targetWpm: 145,
    tags: [],
    notes: '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    researchSources: [],
    script: {
      stageHook: '',
      stageContext: '',
      stagePayoff: '',
      stageEnding: '',
      fullScript: '',
      wpmPace: 145,
      version: 1
    },
    storyboard: [
      {
        id: 's1',
        stage: 'hook',
        timestamp: '00:00 - 00:03',
        visualAction: 'Visual pembuka tajam dengan teks overlay judul',
        bRollSource: 'Screen capture antarmuka',
        onScreenText: title,
        highlightFx: 'Pulsing cyan'
      },
      {
        id: 's2',
        stage: 'context',
        timestamp: '00:04 - 00:10',
        visualAction: 'Bukti latar belakang atau changelog resmi',
        bRollSource: 'Official documentation',
        onScreenText: 'Konteks Perubahan',
        highlightFx: 'Zoom 1.2x'
      },
      {
        id: 's3',
        stage: 'payoff',
        timestamp: '00:11 - 00:35',
        visualAction: 'Demonstrasi inti atau poin-poin konkret',
        bRollSource: 'Step by step interface',
        onScreenText: 'Demo Langkah',
        highlightFx: 'Lingkaran merah / penyorot'
      },
      {
        id: 's4',
        stage: 'ending',
        timestamp: '00:36 - 00:45',
        visualAction: 'Seamless loop atau Call to Action',
        bRollSource: 'Outro looping motion',
        onScreenText: 'Cek Sekarang!',
        highlightFx: 'Looping CTA'
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
  };
}

// Kalkulasi slot publikasi resmi berikutnya (Senin, Kamis, Minggu 07:00 WIB = 00:00 UTC)
function getNextScheduledSlot(): Date {
  const d = new Date();
  d.setHours(7, 0, 0, 0); // 07:00 WIB
  
  // 1: Senin, 4: Kamis, 0: Minggu
  const validDays = [1, 4, 0];
  
  for (let i = 0; i < 7; i++) {
    d.setDate(d.getDate() + 1);
    if (validDays.includes(d.getDay())) {
      return d;
    }
  }
  return d;
}

// Export database ke file JSON
export function exportDatabaseToJson(contents: ContentItem[]): void {
  const data = {
    exportedAt: new Date().toISOString(),
    creatorStudio: 'Zeinity Creator Studio',
    version: '1.0.0',
    totalContents: contents.length,
    contents
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zeinity-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export single Short ke Markdown produksi lengkap
export function exportShortToMarkdown(item: ContentItem): void {
  const words = item.script.fullScript.split(/\s+/).filter(Boolean).length;
  const estSeconds = Math.round((words / (item.script.wpmPace || 145)) * 60);

  const md = `# PRODUCTION SHEET: ${item.title}
*Zeinity Creator Studio — YouTube Shorts Production Workspace*

---

## 1. METADATA KONTEN
- **ID:** \`${item.id}\`
- **Pilar Konten:** ${item.pillar}
- **Format:** ${item.format} (Target: ${item.targetDurationSec} detik)
- **Status:** ${item.status.toUpperCase()}
- **Jadwal Publikasi:** ${item.publishDate ? new Date(item.publishDate).toLocaleString('id-ID') : 'Belum diatur'}
- **Deadline Produksi:** ${item.productionDeadline ? new Date(item.productionDeadline).toLocaleString('id-ID') : 'Belum diatur'}
- **Tags:** ${item.tags.join(', ') || '-'}

---

## 2. NASKAH SHORTS (4-STAGE SCRIPT)
- **Total Kata:** ${words} kata (Standar Zeinity: 90–140 kata)
- **Tempo Bicara:** ${item.script.wpmPace} WPM
- **Estimasi Durasi Bicara:** ~${estSeconds} detik

### Stage 1 — Visual & Audio Hook (0–3s)
> ${item.script.stageHook || '-'}

### Stage 2 — Context Acceleration (4–10s)
> ${item.script.stageContext || '-'}

### Stage 3 — Core Value / Payoff (11–45s)
> ${item.script.stagePayoff || '-'}

### Stage 4 — Seamless Loop / Smart CTA (46–60s)
> ${item.script.stageEnding || '-'}

### Naskah Utuh Siap Salin (Full Continuous Script):
\`\`\`text
${item.script.fullScript || '-'}
\`\`\`

---

## 3. RISET & BUKTI FAKTA RESMI
${item.researchSources.length === 0 ? '_Belum ada sumber riset yang dicatat._' : item.researchSources.map((s, idx) => `
### Sumber #${idx + 1}: ${s.platformOrTopic} (${s.verificationStatus.toUpperCase()})
- **URL Sumber:** [${s.sourceUrl}](${s.sourceUrl})
- **Tanggal Sumber:** ${s.sourceDate || '-'}
- **Klaim Utama:** ${s.claim}
- **Kutipan Bukti:** "${s.evidenceQuote}"
- **Ringkasan Fakta:** ${s.summary}
`).join('\n')}

---

## 4. VISUAL STORYBOARD & SHOT LIST
| Stage | Waktu | Visual Action | B-Roll Source | Teks Layar | Efek Penyorot |
|---|---|---|---|---|---|
${item.storyboard.map(s => `| ${s.stage.toUpperCase()} | ${s.timestamp} | ${s.visualAction} | ${s.bRollSource} | ${s.onScreenText.replace(/\n/g, ' ')} | ${s.highlightFx} |`).join('\n')}

---

## 5. PRODUCTION CHECKLIST
- [${item.checklist.voRecorded ? 'x' : ' '}] Voice-Over Recorded (Jernih, 130–160 WPM)
- [${item.checklist.broll1080pReady ? 'x' : ' '}] B-Roll & Screen Capture 1080p Siap
- [${item.checklist.captionsContrastOk ? 'x' : ' '}] Dynamic Captions Kontras Tinggi (2–4 kata per ritme)
- [${item.checklist.safeZoneVerified ? 'x' : ' '}] Safe Zone Terverifikasi (Top 15%, Center 60%, Bottom 25%)
- [${item.checklist.audioLevelsBalanced ? 'x' : ' '}] Audio Balance (VO dominan, BGM pelan)
- [${item.checklist.musicRoyaltyFree ? 'x' : ' '}] Background Music Bebas Hak Cipta
- [${item.checklist.firstHourEngagementPlan ? 'x' : ' '}] Rencana Interaksi Jam Pertama Pasca-Terbit

${item.analytics ? `
---

## 6. ANALITIK PASCA-TERBIT
- **Views:** ${item.analytics.views.toLocaleString()}
- **Viewed Ratio:** ${item.analytics.viewedPercent}% (Target: ≥70%)
- **Average Percentage Viewed (APV):** ${item.analytics.apvPercent}% (Target: 90%–110%)
- **Average View Duration:** ${item.analytics.avgViewDurationSec}s
- **Evaluasi Keberhasilan:** ${item.analytics.evaluationWhatWorked || '-'}
- **Evaluasi Kekurangan:** ${item.analytics.evaluationWhatFailed || '-'}
- **Eksperimen Berikutnya:** ${item.analytics.evaluationNextExperiment || '-'}
` : ''}
`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zeinity-short-${item.id}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
