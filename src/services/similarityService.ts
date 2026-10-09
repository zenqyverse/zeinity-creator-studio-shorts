// =======================================================
// ZEINITY CREATOR STUDIO — TOPIC SIMILARITY & DUPLICATE DETECTOR
// Mencegah kanibalisasi topik dan memperingatkan duplikasi dini
// =======================================================

import { ContentItem } from '../types';

// Stop words umum bahasa Indonesia dan partikel percakapan pendek
const INDONESIAN_STOP_WORDS = new Set([
  'apa', 'kenapa', 'bagaimana', 'yang', 'di', 'ke', 'dari', 'ini', 'itu',
  'dan', 'atau', 'untuk', 'pada', 'adalah', 'kamu', 'anda', 'kita', 'bisa',
  'saja', 'cara', 'hari', 'bulan', 'tahun', 'tips', 'trik',
  'video', 'shorts', 'channel', 'zeinity', 'tahu', 'ketahui', 'harus',
  'wajib', 'oleh', 'dengan', 'saat', 'karena', 'maka', 'dalam', 'akan',
  'sudah', 'belum', 'tentang', 'terkait', 'jadi', 'ada', 'lagi', 'juga',
  'bikin', 'buat', 'punya', 'secara', 'agar', 'supaya', 'tanpa', 'semua',
  'ya', 'ga', 'gak', 'tp', 'yg', 'an', 'dr', 'kr', 'lu', 'lo', 'gw', 'mu',
  'ku', 'si', 'ok', 'ni', 'tu', 'lah', 'pun', 'kok', 'sih', 'deh', 'dong'
]);

// 2-letter token yang merupakan topik teknologi / platform penting yang sah
const VALID_TECH_ACRONYMS = new Set([
  'ai', 'wa', 'ig', 'hp', 'vr', 'ar', 'pc', 'os', 'ui', 'ux', 'yt', 'dm',
  'ml', 'ff', 'qr', 'ip', '5g', '4g', '3d', '2d', 'io', 'tv', 'id'
]);

export interface SimilarTopicMatch {
  item: ContentItem;
  score: number; // Persentase 0 - 100
  similarityLevel: 'high' | 'medium';
  matchedKeywords: string[];
  reason: string;
}

/**
 * Normalisasi dan ekstraksi token kata kunci penting dari sebuah teks/judul
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];

  // Bersihkan tanda baca, karakter non-alfanumerik, dan ubah ke huruf kecil
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/_/g, ' ');

  const rawTokens = clean.split(/\s+/).filter(Boolean);

  const keywords = rawTokens
    .map(t => t.trim())
    .filter(t => {
      if (t.length < 2) return false;
      if (INDONESIAN_STOP_WORDS.has(t)) return false;
      if (t.length === 2 && !VALID_TECH_ACRONYMS.has(t)) return false;
      return true;
    });

  return Array.from(new Set(keywords));
}

/**
 * Menghitung koefisien kemiripan (Dice-Jaccard hybrid) antara dua judul
 */
export function computeTitleSimilarity(titleA: string, titleB: string): {
  score: number;
  matchedKeywords: string[];
} {
  const kwA = extractKeywords(titleA);
  const kwB = extractKeywords(titleB);

  if (kwA.length === 0 || kwB.length === 0) {
    return { score: 0, matchedKeywords: [] };
  }

  const setB = new Set(kwB);
  const matchedKeywords = kwA.filter(k => setB.has(k));

  // Cek juga substring match untuk kata kunci penting (misal: 'notifikasi' vs 'notif', 'screen' vs 'screenshot')
  const partialMatches: string[] = [];
  for (const a of kwA) {
    for (const b of kwB) {
      if (a !== b && (a.includes(b) || b.includes(a)) && Math.min(a.length, b.length) >= 3) {
        if (!matchedKeywords.includes(a) && !partialMatches.includes(a)) {
          partialMatches.push(a);
        }
      }
    }
  }

  const allMatched = Array.from(new Set([...matchedKeywords, ...partialMatches]));

  if (allMatched.length === 0) {
    return { score: 0, matchedKeywords: [] };
  }

  // Jaccard similarity: intersection / union
  const unionSize = new Set([...kwA, ...kwB]).size;
  const rawJaccard = allMatched.length / unionSize;

  // Dice coefficient: 2 * intersection / (sizeA + sizeB)
  const dice = (2 * allMatched.length) / (kwA.length + kwB.length);

  // Bobot gabungan (0 - 100%)
  const combined = Math.round(((rawJaccard * 0.4 + dice * 0.6) * 100));
  const finalScore = Math.min(100, Math.max(0, combined));

  return {
    score: finalScore,
    matchedKeywords: allMatched
  };
}

/**
 * Menghitung tingkat cakupan (containment) kata kunci kandidat dalam teks dokumen (notes/claim/hook)
 */
function computeContainmentScore(candidateKeywords: string[], targetText: string): {
  score: number;
  matchedKeywords: string[];
} {
  if (candidateKeywords.length === 0 || !targetText) {
    return { score: 0, matchedKeywords: [] };
  }

  const targetKeywords = new Set(extractKeywords(targetText));
  if (targetKeywords.size === 0) {
    return { score: 0, matchedKeywords: [] };
  }

  const matched: string[] = [];
  for (const kw of candidateKeywords) {
    if (targetKeywords.has(kw)) {
      matched.push(kw);
    } else {
      // Substring check
      for (const tKw of targetKeywords) {
        if ((kw.includes(tKw) || tKw.includes(kw)) && Math.min(kw.length, tKw.length) >= 3) {
          matched.push(kw);
          break;
        }
      }
    }
  }

  const uniqueMatched = Array.from(new Set(matched));
  const coverageRatio = uniqueMatched.length / candidateKeywords.length;

  // Skor berbasis coverage dengan bobot proporsional (0 - 90%)
  const score = Math.round(coverageRatio * 90);

  return {
    score,
    matchedKeywords: uniqueMatched
  };
}

/**
 * Mencari konten-konten yang mirip di database berdasarkan candidate title
 */
export function findSimilarTopics(
  candidateTitle: string,
  existingContents: ContentItem[],
  excludeId?: string,
  minThresholdPercent = 35
): SimilarTopicMatch[] {
  const trimmed = (candidateTitle || '').trim();
  if (trimmed.length < 3) return [];

  const candidateKeywords = extractKeywords(trimmed);
  if (candidateKeywords.length === 0) return [];

  const results: SimilarTopicMatch[] = [];

  for (const item of existingContents) {
    if (excludeId && item.id === excludeId) continue;

    // 1. Cek kemiripan dengan judul utama (Dice-Jaccard hybrid)
    const titleMatch = computeTitleSimilarity(trimmed, item.title);
    let highestScore = titleMatch.score;
    let matchedWords = titleMatch.matchedKeywords;
    let matchSource = 'judul utama';

    // 2. Cek kemiripan dengan hookText atau stageHook
    const hookToTest = item.hookText || item.script?.stageHook || '';
    if (hookToTest.trim().length > 5) {
      const hookMatch = computeContainmentScore(candidateKeywords, hookToTest);
      if (hookMatch.score > highestScore) {
        highestScore = hookMatch.score;
        matchedWords = hookMatch.matchedKeywords;
        matchSource = 'hook naskah';
      }
    }

    // 3. Cek kemiripan dengan notes
    if (item.notes && item.notes.trim().length > 5) {
      const notesMatch = computeContainmentScore(candidateKeywords, item.notes);
      if (notesMatch.score > highestScore) {
        highestScore = Math.round(notesMatch.score * 0.95);
        matchedWords = notesMatch.matchedKeywords;
        matchSource = 'catatan/ide';
      }
    }

    // 4. Cek kemiripan dengan klaim riset
    if (item.researchSources && item.researchSources.length > 0) {
      const combinedClaims = item.researchSources.map(s => `${s.claim} ${s.summary || ''}`).join(' ');
      const researchMatch = computeContainmentScore(candidateKeywords, combinedClaims);
      if (researchMatch.score > highestScore) {
        highestScore = Math.round(researchMatch.score * 0.9);
        matchedWords = researchMatch.matchedKeywords;
        matchSource = 'riset/fakta';
      }
    }

    // 5. Cek kemiripan dengan tags
    if (item.tags && item.tags.length > 0) {
      const tagText = item.tags.join(' ');
      const tagMatch = computeContainmentScore(candidateKeywords, tagText);
      if (tagMatch.score > highestScore) {
        highestScore = Math.round(tagMatch.score * 0.9);
        matchedWords = tagMatch.matchedKeywords;
        matchSource = 'tag topik';
      }
    }

    if (highestScore >= minThresholdPercent) {
      const level: 'high' | 'medium' = highestScore >= 60 ? 'high' : 'medium';
      
      let reason = '';
      if (level === 'high') {
        reason = `Sangat mirip (${highestScore}%), topik utama beririsan di ${matchSource}: ${matchedWords.join(', ')}`;
      } else {
        reason = `Kemiripan moderat (${highestScore}%), irisan kata kunci di ${matchSource}: ${matchedWords.join(', ')}`;
      }

      results.push({
        item,
        score: highestScore,
        similarityLevel: level,
        matchedKeywords: matchedWords,
        reason
      });
    }
  }

  // Urutkan dari score tertinggi
  return results.sort((a, b) => b.score - a.score);
}

