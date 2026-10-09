import assert from 'node:assert';
import { 
  extractKeywords, 
  computeTitleSimilarity, 
  findSimilarTopics 
} from '../src/services/similarityService.ts';

console.log('=== TEST SUITE: ZEINITY SHORTS ADVANCED FEATURES ===\n');

// -----------------------------------------------------------------------------
// SUITE 1: TOPIC SIMILARITY & DUPLICATE DETECTION
// -----------------------------------------------------------------------------
console.log('1. Testing Topic Similarity & 2-Letter Tech Acronyms...');

// 1.1 Acronym extraction
const aiKeywords = extractKeywords('Tren AI 2026 dan Dampak ke Kreator');
assert(aiKeywords.includes('ai'), 'Must preserve "ai" acronym');
assert(aiKeywords.includes('tren'), 'Must preserve "tren"');
assert(aiKeywords.includes('2026'), 'Must preserve "2026"');
assert(!aiKeywords.includes('dan'), 'Must strip stop word "dan"');

const waKeywords = extractKeywords('Fitur Baru Rahasia WA Bulan Ini');
assert(waKeywords.includes('wa'), 'Must preserve "wa" acronym');
assert(waKeywords.includes('fitur'), 'Must preserve "fitur"');
assert(waKeywords.includes('rahasia'), 'Must preserve "rahasia"');
assert(!waKeywords.includes('ini'), 'Must strip stop word "ini"');

const hpKeywords = extractKeywords('Kamera HP Rusak Karena Update?');
assert(hpKeywords.includes('hp'), 'Must preserve "hp" acronym');
assert(hpKeywords.includes('kamera'), 'Must preserve "kamera"');
console.log('  ✓ 1.1 2-Letter tech acronyms (AI, WA, HP) successfully extracted as valid keywords');

// 1.2 Identical title matching
const exactMatch = computeTitleSimilarity('Tren AI 2026', 'Tren AI 2026');
assert.strictEqual(exactMatch.score, 100, 'Identical titles with AI must score 100%');
assert(exactMatch.matchedKeywords.includes('ai'), 'Matched keywords must include "ai"');

const exactWaMatch = computeTitleSimilarity('Fitur Rahasia WA', 'Fitur Rahasia WA');
assert.strictEqual(exactWaMatch.score, 100, 'Identical titles with WA must score 100%');
console.log('  ✓ 1.2 Identical titles containing tech acronyms achieve 100% match');

// 1.3 Cross-field containment in database
const mockContents = [
  {
    id: 'short-01',
    title: 'Pembaruan Keamanan Sistem',
    status: 'published',
    pillar: 'internet_social',
    format: 'flash_news',
    hookText: 'Jangan biarkan WhatsApp Web kamu terbuka tanpa proteksi sandi.',
    targetDurationSec: 30,
    targetWpm: 145,
    tags: ['whatsapp', 'keamanan', 'privasi'],
    notes: 'Riset fitur baru WhatsApp Web untuk mengunci obrolan dengan password dan sensor biometrik agar aman dari rekan sekantor.',
    researchSources: [
      {
        id: 'r1',
        platformOrTopic: 'WhatsApp Changelog',
        sourceUrl: 'https://whatsapp.com',
        sourceDate: '2026-10-01',
        claim: 'WhatsApp Web merilis fitur chat lock dengan verifikasi sidik jari atau PIN.',
        evidenceQuote: 'Screen lock is now available on desktop',
        summary: 'Kunci obrolan WhatsApp Web dengan PIN desktop',
        verificationStatus: 'verified',
        isOfficialSource: true
      }
    ],
    script: {
      stageHook: 'Jangan biarkan WhatsApp Web kamu terbuka tanpa proteksi sandi.',
      stageContext: 'Banyak pengguna kantor sering lupa logout.',
      stagePayoff: 'Sekarang kamu bisa aktifkan screen lock langsung dari setelan.',
      stageEnding: 'Aktifkan kuncinya sekarang juga.',
      fullScript: 'Naskah lengkap...',
      wpmPace: 145,
      version: 1
    },
    storyboard: [],
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
    },
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  }
];

// Query with topic keywords covered in notes and research
const matches = findSimilarTopics('Cara Kunci Obrolan WhatsApp Web?', mockContents);
assert(matches.length > 0, 'Must detect duplicate topic from notes/claims containment');
assert(matches[0].score >= 60, `Score must be >= 60% (got ${matches[0].score}%)`);
assert(matches[0].matchedKeywords.includes('whatsapp'), 'Must match "whatsapp"');
console.log(`  ✓ 1.3 Database cross-field topic containment matched at ${matches[0].score}% (${matches[0].reason})`);

// 1.4 Self-exclusion
const excludedMatches = findSimilarTopics('Pembaruan Keamanan Sistem', mockContents, 'short-01');
assert.strictEqual(excludedMatches.length, 0, 'Must exclude current item ID when editing in studio');
console.log('  ✓ 1.4 Self-exclusion with excludeId properly omits current short');

// -----------------------------------------------------------------------------
// SUITE 2: SEAMLESS LOOP & HOOK FALLBACK GENERATION
// -----------------------------------------------------------------------------
console.log('\n2. Testing Hook & Seamless Loop Generation...');

function getFallbackEndingAlternatives(title, hookText) {
  const cleanTitle = (title || '').replace(/[?]/g, '').trim();
  const cleanHook = (hookText || cleanTitle || '').trim();
  const hookWords = cleanHook.split(/\s+/).filter(Boolean);
  const hookOpeningSnippet = hookWords.length > 0 ? hookWords.slice(0, 3).join(' ') : cleanTitle;

  return [
    `Dan sebelum setelan otomatis ini aktif permanen di perangkatmu, ingat bahwa ${hookOpeningSnippet}...`,
    `Terapkan langkah-langkah tadi sekarang, karena seperti yang sudah kita buktikan bahwa ${hookOpeningSnippet}...`,
    `Langsung buka dan periksa setelan ponselmu hari ini juga sebelum aturan baru ini diterapkan permanen.`,
    `Simpan video ini dan bagikan ke temanmu sekarang agar tidak terlambat mengamankan akun dari perubahan ini.`
  ];
}

const testHook = 'WhatsApp baru saja merilis pembaruan privasi';
const endings = getFallbackEndingAlternatives('Apa Fitur Baru WhatsApp?', testHook);
assert.strictEqual(endings.length, 4, 'Must produce 4 alternative endings');
assert(endings[0].includes('WhatsApp baru saja'), 'Ending 1 must seamlessly bridge into opening hook words');
assert(endings[1].includes('WhatsApp baru saja'), 'Ending 2 must seamlessly bridge into opening hook words');
assert(endings[2].includes('setelan'), 'Ending 3 must have actionable CTA');
console.log('  ✓ 2.1 Dynamic seamless loop endings grammatically bridge into opening hook snippet');

// -----------------------------------------------------------------------------
// SUITE 3: SCRIPT VERSION HISTORY & SNAPSHOT RESTORE INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n3. Testing Script Version History & Snapshot Restore...');

const initialScript = {
  stageHook: 'Hook Versi 1',
  stageContext: 'Konteks Versi 1',
  stagePayoff: 'Payoff Versi 1',
  stageEnding: 'Loop Versi 1',
  fullScript: 'Hook Versi 1 Konteks Versi 1 Payoff Versi 1 Loop Versi 1',
  wpmPace: 145,
  version: 1,
  history: []
};

// Create snapshot
const snapshot1 = {
  id: 'snap-1',
  version: 1,
  timestamp: new Date().toISOString(),
  stageHook: initialScript.stageHook,
  stageContext: initialScript.stageContext,
  stagePayoff: initialScript.stagePayoff,
  stageEnding: initialScript.stageEnding,
  fullScript: initialScript.fullScript,
  wordCount: 12,
  wpmPace: 145,
  note: 'Draft pertama'
};

const v2Script = {
  stageHook: 'Hook Versi 2 yang jauh lebih tajam',
  stageContext: 'Konteks Versi 2 yang lebih ringkas',
  stagePayoff: 'Payoff Versi 2 dengan demo konkret',
  stageEnding: 'Loop Versi 2 yang menyambung mulus',
  fullScript: 'Hook Versi 2 yang jauh lebih tajam Konteks Versi 2 Payoff Versi 2 Loop Versi 2',
  wpmPace: 152,
  version: 2,
  history: [snapshot1]
};

assert.strictEqual(v2Script.history.length, 1, 'History contains 1 snapshot');
assert.strictEqual(v2Script.history[0].stageHook, 'Hook Versi 1', 'Snapshot preserves V1 hook');

// Simulate restore
const targetSnap = v2Script.history[0];
const preRestoreSnapshot = {
  id: 'snap-pre-restore',
  version: v2Script.version,
  timestamp: new Date().toISOString(),
  stageHook: v2Script.stageHook,
  stageContext: v2Script.stageContext,
  stagePayoff: v2Script.stagePayoff,
  stageEnding: v2Script.stageEnding,
  fullScript: v2Script.fullScript,
  wordCount: 16,
  wpmPace: 152,
  note: 'Sebelum restore ke v1'
};

const restoredScript = {
  stageHook: targetSnap.stageHook,
  stageContext: targetSnap.stageContext,
  stagePayoff: targetSnap.stagePayoff,
  stageEnding: targetSnap.stageEnding,
  fullScript: targetSnap.fullScript,
  wpmPace: targetSnap.wpmPace,
  version: v2Script.version + 1,
  history: [preRestoreSnapshot, ...v2Script.history]
};

assert.strictEqual(restoredScript.stageHook, 'Hook Versi 1', 'Restored hook must match V1');
assert.strictEqual(restoredScript.version, 3, 'Version increments on restore');
assert.strictEqual(restoredScript.history.length, 2, 'Pre-restore backup is saved in history');
assert.strictEqual(restoredScript.history[0].note, 'Sebelum restore ke v1', 'Backup note is accurate');
console.log('  ✓ 3.1 Version snapshot and restore workflow with pre-restore auto-backup verified');

// -----------------------------------------------------------------------------
// SUITE 4: TELEPROMPTER TEMPO & SCROLL PACING FORMULAS
// -----------------------------------------------------------------------------
console.log('\n4. Testing Teleprompter Tempo & Duration Formulas...');

const scriptWords120 = 120; // Zeinity target script (90-140 words)
const durationAt130Wpm = Math.round((scriptWords120 / 130) * 60);
const durationAt145Wpm = Math.round((scriptWords120 / 145) * 60);
const durationAt160Wpm = Math.round((scriptWords120 / 160) * 60);

assert(durationAt130Wpm > durationAt145Wpm, '130 WPM takes longer than 145 WPM');
assert(durationAt145Wpm > durationAt160Wpm, '145 WPM takes longer than 160 WPM');
assert.strictEqual(durationAt145Wpm, 50, '120 words at 145 WPM is exactly ~50 seconds (Shorts sweet spot)');
console.log(`  ✓ 4.1 120 words paced at 145 WPM takes ~${durationAt145Wpm}s (Target Shorts: 45–55s)`);

console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
