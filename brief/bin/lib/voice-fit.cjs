/**
 * Voice-Fit — banned-words density + concreteness heuristic + KO honorific
 * post-check for Type B agent output (Phase 8 Plan 02). Pitfall #10 (AI Slop)
 * + Pitfall #11 (Korean honorific) mitigation.
 *
 * Distribution: SEPARATE lib that runs PARALLEL to AUDIENCE — does NOT
 * extend the AUDIENCE deterministic-screen entry point per Phase 8
 * anti-pattern flag (CONTEXT.md C-D03 / D-D04 explicit reject; Phase 4·5·7
 * vocabulary-lock test stays green).
 *
 * Constants are mirrored verbatim into Plan 06 Type B agent prompt and into
 * brief/references/voice-fit-vocabulary.md so the planner can extend the ban
 * list in one place. tests/brief-voice-fit-vocabulary-lock.test.cjs (future)
 * greps both for sync.
 *
 * Zero runtime deps (A1). No imports from audience.cjs. Pure regex +
 * arithmetic utilities.
 *
 * Refs: 08-02-PLAN.md, 08-RESEARCH.md Pattern 6 lines 739-822,
 * 08-PATTERNS.md lines 247-296.
 */

// Banned vocabulary (EN — 16 seed). Source: PITFALLS.md §Pitfall #10
// + jodiecook.com/ban-list/ corpus. Word-boundary + case-insensitive.
const BANNED_EN = /\b(leverage|synergize|transform|holistic|delve|groundbreaking|best-in-class|seamless|cutting-edge|revolutionary|game-changing|landscape|unlock|empower|robust|innovative)\b/gi;

// Banned vocabulary (KO — 8 seed). Source: CONTEXT.md C-D03. Korean has no
// `\b` word-class for Hangul, so use exact-string alternation.
const BANNED_KO = /(혁신적인|차별화된|게임체인저|패러다임 시프트|시너지|활용|최적화|글로벌 스탠더드)/g;

// Honorific violations (KO — 5 반말 / 구어체 endings). Source: D-D04.
// Triggers ONLY when audience external + region:kr (gated in checkBannedWords
// via the {isKorean, isExternal} options object).
//
// Boundary semantics: Hangul characters are NOT in JavaScript's `\w` class,
// so `\b` after a Hangul suffix is a no-op (it only fires at ASCII↔non-ASCII
// transitions). The lookahead `(?=[.!?]|$)` requires the suffix to be
// IMMEDIATELY followed by sentence-terminating punctuation (`.`, `!`, `?`)
// or end-of-string — this is the most reliable proxy for "sentence-final
// 반말" without morphological analysis.
//
// False-positive avoidance:
//   - Particles like `까지`, `부터`, `마저` (mid-sentence, followed by space
//     or other Hangul) are correctly suppressed because the lookahead is
//     restricted to sentence-terminating punctuation.
//   - Nouns ending in `-지` followed by a particle (편지를, 아버지가,
//     소식지에서) are correctly suppressed for the same reason.
//   - Edge case: a single noun followed by sentence-end (`편지.`) would
//     still false-positive, but this construction is grammatically rare
//     (nouns almost always take a particle before sentence-end).
// Plan 08-02 Rule 1 deviation: original spec used `\b` boundary which is
// a no-op for Hangul; tightened to sentence-final lookahead during GREEN
// implementation when the Korean exemplar text exposed the false positive.
const HONORIFIC_VIOLATION_KO = /(?:[가-힣])(야|지|라구요|거든요|는데요)(?=[.!?]|$)/g;

/**
 * checkBannedWords(text, options)
 *
 * Returns banned-words density per ~250-words/page approximation. Density
 * threshold is 2: density > 2 → exceedsThreshold true → 1-shot regenerate
 * signal in Plan 04 export.cjs dispatch.
 *
 * @param {string} text
 * @param {{ isKorean: boolean, isExternal: boolean }} options
 * @returns {{ density: number, threshold: 2, exceedsThreshold: boolean,
 *             hits: Array<{token: string, offset: number}>, pages: number }}
 */
function checkBannedWords(text, options) {
  const opts = options || {};
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // ~250 words/page approximation (1-2 page exec-summary, 7-9 deck slides).
  const pages = Math.max(1, Math.ceil(wordCount / 250));

  const enHits = [...text.matchAll(BANNED_EN)].map((m) => ({ token: m[0], offset: m.index }));
  const koHits = opts.isKorean
    ? [...text.matchAll(BANNED_KO)].map((m) => ({ token: m[0], offset: m.index }))
    : [];
  const honorificHits = opts.isKorean && opts.isExternal
    ? [...text.matchAll(HONORIFIC_VIOLATION_KO)].map((m) => ({ token: m[0], offset: m.index }))
    : [];

  const allHits = [...enHits, ...koHits, ...honorificHits];
  const density = allHits.length / pages;

  return {
    density,
    threshold: 2,
    exceedsThreshold: density > 2,
    hits: allHits,
    pages,
  };
}

/**
 * checkConcreteness(text)
 *
 * Heuristic post-check on Type B agent output. Counts specific-numbers (with
 * units), dates (YYYY or YYYY-MM/YYYY-Q variants), and proper-noun chains
 * (3+ Capitalized-words). Density threshold is 3 concrete signals per
 * 100 words; below threshold → needsImprovement: true → soft signal that
 * Plan 04 export.cjs may surface as FINDINGS-MATERIAL when the artifact is
 * Type B external.
 *
 * Agent prompt does the heavy lifting (the prompt is preconditioned to
 * write specific numbers); this lib is a sanity check, not the primary
 * enforcement mechanism.
 *
 * @param {string} text
 * @returns {{ concrete: number, wordCount: number, concretenessRatio: number,
 *             needsImprovement: boolean }}
 */
function checkConcreteness(text) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Specific numbers: not just "3" but "3 days", "$15K", "47%", "23.4 trillion".
  // Recognises EN units (days/weeks/months/years/hours/minutes/%/trillion/billion/million)
  // + KO units (원/달러/배/개월/일/시간) + currency markers ($/₩).
  const specificNumbers = (text.match(/\b\d{1,3}(?:[,.]\d{3})*(?:\.\d+)?\s*(?:%|days?|weeks?|months?|years?|hours?|minutes?|won|원|달러|\$|₩|trillion|billion|million|배|원|개월|일|시간)/g) || []).length;

  // Dates: YYYY or YYYY-MM or YYYY/MM.
  const dates = (text.match(/\b(?:19|20)\d{2}(?:[-/]\d{1,2})?\b/g) || []).length;

  // Proper-noun chains: 3+ Capitalized words in sequence (often product names,
  // company names, or program names).
  const properNouns = (text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,}\b/g) || []).length;

  const concrete = specificNumbers + dates + properNouns;
  // Per 100 words: concrete / (wordCount / 100). Math.max(1, ...) guards
  // against division-by-zero on empty text.
  const concretenessRatio = concrete / Math.max(1, wordCount / 100);

  return {
    concrete,
    wordCount,
    concretenessRatio,
    // Threshold: at least 3 concrete signals per 100 words for external Type B.
    needsImprovement: concretenessRatio < 3,
  };
}

module.exports = {
  checkBannedWords,
  checkConcreteness,
  BANNED_EN,
  BANNED_KO,
  HONORIFIC_VIOLATION_KO,
};
