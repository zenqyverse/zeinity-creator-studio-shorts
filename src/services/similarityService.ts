// =======================================================
// ZEINITY CREATOR STUDIO — TOPIC SIMILARITY & DUPLICATE DETECTOR
// Mencegah kanibalisasi topik dan memperingatkan duplikasi dini
// =======================================================

import { ContentItem } from '../types';

const INDONESIAN_STOP_WORDS = new Set([
  'apa', 'kenapa', 'bagaimana', 'yang', 'di', 'ke', 'dari', 'ini', 'itu',
  'dan', 'atau', 'untuk', 'pada', 'adalah', 'kamu', 'anda', 'kita', 'bisa',
  'saja', 'cara', 'fitur', 'hari', 'bulan', 'tahun', 'tips', 'trik',
  'video', 'shorts', 'channel', 'zeinity', 'tahu', 'ketahui', 'harus',
  'wajib', 'oleh', 'dengan', 'saat', 'karena', 'maka', 'dalam', 'akan',
  'sudah', 'belum', 'tentang', 'terkait', 'jadi', 'ada', 'lagi', 'juga',
  'bikin', 'buat', 'punya', 'secara', 'agar', 'supaya', 'tanpa', 'semua'
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
    .filter(t => t.length > 2 && !INDONESIAN_STOP_WORDS.has(t));

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
      if (a !== b && (a.includes(b) || b.includes(a)) && Math.min(a.length, b.length) >= 4) {
        if (!matchedKeywords.includes(a) && !partialMatches.includes(a)) {
          partialMatches.push(a);
        }
      }
    }
  }

  const allMatched = Array.from(new Set([...matchedKeywords, ...partialMatches]));

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
 * Mencari konten-konten yang mirip di database berdasarkan candidate title
 */
export function findSimilarTopics(
  candidateTitle: string,
  existingContents: ContentItem[],
  excludeId?: string,
  minThresholdPercent = 35
): SimilarTopicMatch[] {
  const trimmed = (candidateTitle || '').trim();
  if (trimmed.length < 4) return [];

  const results: SimilarTopicMatch[] = [];

  for (const item of existingContents) {
    if (excludeId && item.id === excludeId) continue;

    // Cek kemiripan dengan judul utama
    const titleMatch = computeTitleSimilarity(trimmed, item.title);

    // Cek juga kemiripan dengan notes / claim jika judul masih pendek
    let highestScore = titleMatch.score;
    let matchedWords = titleMatch.matchedKeywords;

    if (item.notes && item.notes.trim().length > 10) {
      const notesMatch = computeTitleSimilarity(trimmed, item.notes);
      if (notesMatch.score > highestScore) {
        highestScore = Math.round(notesMatch.score * 0.85); // Beri sedikit diskon karena di notes
        matchedWords = Array.from(new Set([...matchedWords, ...notesMatch.matchedKeywords]));
      }
    }

    if (highestScore >= minThresholdPercent) {
      const level: 'high' | 'medium' = highestScore >= 60 ? 'high' : 'medium';
      
      let reason = '';
      if (level === 'high') {
        reason = `Sangat mirip (${highestScore}%), berbagi topik utama: ${matchedWords.join(', ')}`;
      } else {
        reason = `Kemiripan moderat (${highestScore}%), ada irisan kata kunci: ${matchedWords.join(', ')}`;
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
