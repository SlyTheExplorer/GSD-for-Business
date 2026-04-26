/**
 * Leakage-Diff — Cross-artifact TF-IDF keyword diff (Plan 08-03 / DLV-06).
 *
 * Pure-CJS Hangul-aware Salton-1988 TF-IDF that detects copy-paste leakage
 * from a stricter-confidentiality sibling artifact into a less-strict
 * artifact in the same folder. Wired into `brief/bin/lib/export.cjs` Step 1
 * (Plan 08-04) BEFORE the AUDIENCE re-run.
 *
 * Strictness ordering (Phase 5 D-10 + Phase 8 B-D01 lock):
 *   public(0) < partner(1) < internal(2) < confidential(3)
 * Higher number = stricter. A finding is emitted only when the CURRENT
 * artifact (less-strict) shares ≥3 distinctive keywords with a STRICTER
 * sibling — i.e. potential downward leakage.
 *
 * False-positive control:
 *   - STOP_WORDS_EN (≥30 generic biz terms) + STOP_WORDS_KO (≥15 generic
 *     Korean particles + biz terms) filter common vocabulary BEFORE scoring.
 *   - 3-keyword threshold prevents single-token matches from firing.
 *   - Paired siblings (.audience.md / .compliance.md gate-output reports)
 *     are SKIPPED from sibling enumeration — they often re-quote the
 *     primary artifact and would falsely flag.
 *
 * Tokenizer regex: Hangul `/[\uac00-\ud7af]{2,}/` REPLICATES align.cjs
 * computeTermOverlap (lines 110-127) verbatim. EN tokens add the
 * `^[a-z][a-z0-9_-]+$` shape filter (slightly tighter than align.cjs)
 * to drop numeric/symbolic noise from leakage scoring.
 *
 * Zero external runtime deps (A1) — pure CJS, lib-boundary-clean (no
 * imports from align.cjs to keep gate boundaries decoupled).
 *
 * Reference: 08-RESEARCH.md §Pattern 5 (lines 584-737); 08-PATTERNS.md
 * leakage-diff analog (lines 299-356); 08-03-PLAN.md must_haves.
 */
const fs = require('fs');
const path = require('path');
const { extractFrontmatter, stripFrontmatter } = require('./frontmatter.cjs');

// ─── Strictness enum (B-D01 lock) ────────────────────────────────────────
const STRICTNESS = { public: 0, partner: 1, internal: 2, confidential: 3 };

// ─── Stop-word lists (false-positive control) ────────────────────────────
// EN — generic biz vocabulary present across most planning artifacts.
const STOP_WORDS_EN = new Set([
  'about', 'above', 'after', 'again', 'against', 'because', 'before', 'between',
  'during', 'every', 'further', 'should', 'their', 'there', 'these', 'those',
  'through', 'while', 'which', 'with', 'would', 'product', 'service',
  // Generic business words common across all artifacts:
  'customer', 'market', 'company', 'business', 'team', 'value', 'strategy',
]);
// KO — common particles + generic biz vocabulary.
const STOP_WORDS_KO = new Set([
  '있습니다', '입니다', '됩니다', '합니다', '우리는', '있는', '있고',
  '하는', '하고', '및', '또는', '이것', '저것',
  // Generic business words:
  '고객', '시장', '회사', '사업', '팀', '가치', '서비스', '제품',
]);

// ─── readConfidentiality ─────────────────────────────────────────────────
// Returns audience.confidentiality from a parsed frontmatter object,
// supporting BOTH the nested form (`audience: {confidentiality: ...}`)
// AND the flat-dotted form (`audience.confidentiality: ...`). The
// dotted form is widely used in deliverables fixtures (per 08-03 plan)
// but the shared frontmatter parser's key regex `[a-zA-Z0-9_-]+` does
// not include `.`, so dotted-form keys are not surfaced by the standard
// parser. Fall back to a raw scan of the frontmatter text in that case.
function readConfidentiality(fm, rawContent) {
  // Nested first.
  if (fm && fm.audience && fm.audience.confidentiality) {
    return fm.audience.confidentiality;
  }
  // Flat-dotted in parsed form (in case a future parser ever surfaces it).
  if (fm && fm['audience.confidentiality']) {
    return fm['audience.confidentiality'];
  }
  // Raw fallback for the dotted form: scan only the frontmatter block.
  if (typeof rawContent === 'string') {
    const fmMatch = rawContent.match(/^---\r?\n([\s\S]+?)\r?\n---/);
    if (fmMatch) {
      const m = fmMatch[1].match(/^audience\.confidentiality:\s*(.+)$/m);
      if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  return undefined;
}

// ─── tokenize ────────────────────────────────────────────────────────────
// Hangul-aware tokenization. EN: ≥4-letter lowercase tokens matching
// `^[a-z][a-z0-9_-]+$`. KO: ≥2-character Hangul sequences via
// `/[\uac00-\ud7af]{2,}/` (byte-identical to align.cjs computeTermOverlap).
function tokenize(text) {
  const tokens = [];
  const words = text.split(/[\s\p{P}]+/u).filter(Boolean);
  for (const w of words) {
    const lw = w.toLowerCase();
    if (lw.length >= 4 && /^[a-z][a-z0-9_-]+$/.test(lw)) tokens.push(lw);
    const koMatches = w.matchAll(/[\uac00-\ud7af]{2,}/g);
    for (const m of koMatches) tokens.push(m[0]);
  }
  return tokens;
}

// ─── tfIdf ───────────────────────────────────────────────────────────────
// Classical Salton-1988 TF-IDF: score = tf(t,d) * log(N / df(t)).
// Returns top-20 tokens by descending score; stop-words excluded.
//
// IDF degeneracy at small N: when corpus.length < 3, the idf factor
// log(N/df(t)) collapses to 0 for shared tokens (df=N) and produces a
// degenerate ranking that surfaces sib-only tokens, which is the OPPOSITE
// of what leakage detection needs. Fall back to TF-only ranking in that
// regime — the stop-word filter remains the distinctiveness mechanism,
// and high-frequency leaked tokens still rise to the top-20.
function tfIdf(text, corpus /* [text, ...] */) {
  const docTokens = tokenize(text);
  const tf = {};
  for (const t of docTokens) {
    if (STOP_WORDS_EN.has(t) || STOP_WORDS_KO.has(t)) continue;
    tf[t] = (tf[t] || 0) + 1;
  }

  const N = (corpus && corpus.length) || 0;
  const scores = [];

  if (N < 3) {
    // Small-corpus fallback: TF-only ranking (idf = 1).
    for (const [t, freq] of Object.entries(tf)) {
      scores.push({ token: t, score: freq });
    }
  } else {
    // Full Salton-1988 TF-IDF for N >= 3.
    const df = {};
    for (const t of Object.keys(tf)) {
      let count = 0;
      for (const docText of corpus) {
        if (docText.toLowerCase().includes(t) || docText.includes(t)) count++;
      }
      df[t] = count || 1;
    }
    for (const [t, freq] of Object.entries(tf)) {
      const idf = Math.log(N / df[t]);
      scores.push({ token: t, score: freq * idf });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 20).map((s) => s.token);
}

// ─── leakageDiff ─────────────────────────────────────────────────────────
// Returns { findings, rationale }.
//   - Reads currentArtifactPath frontmatter; needs audience.confidentiality
//     (flat-dotted OR nested) — otherwise SKIP with rationale.
//   - Enumerates same-folder *.md siblings, skipping the current artifact
//     itself and any paired-sibling .audience.md / .compliance.md (gate
//     output reports that quote the primary artifact and would FP).
//   - For each sibling whose confidentiality is STRICTLY STRICTER than
//     current's, extracts top-20 distinctive keywords via tfIdf and counts
//     case-insensitive substring matches in current body.
//   - When matched.length >= 3, emits a FINDINGS-MATERIAL severity finding
//     listing the first 8 matched keywords (T-08-03-04 bound).
function leakageDiff(currentArtifactPath, options /* { folder?: string } */) {
  const folder = (options && options.folder) || path.dirname(currentArtifactPath);
  const currentContent = fs.readFileSync(currentArtifactPath, 'utf-8');
  const currentFm = extractFrontmatter(currentContent) || {};
  const currentConf = readConfidentiality(currentFm, currentContent);
  if (!currentConf || STRICTNESS[currentConf] === undefined) {
    return { findings: [], rationale: 'current artifact missing confidentiality field — skipped' };
  }
  const currentBody = stripFrontmatter(currentContent);

  // Sibling enumeration — same-extension primary markdown only.
  // Paired-sibling gate reports (.audience.md, .compliance.md) are SKIPPED
  // because they re-quote the primary artifact and would falsely flag.
  const siblings = fs.readdirSync(folder)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => !f.endsWith('.audience.md') && !f.endsWith('.compliance.md'))
    .map((f) => path.join(folder, f))
    .filter((p) => path.resolve(p) !== path.resolve(currentArtifactPath));

  const findings = [];
  for (const sib of siblings) {
    const sibContent = fs.readFileSync(sib, 'utf-8');
    const sibFm = extractFrontmatter(sibContent) || {};
    const sibConf = readConfidentiality(sibFm, sibContent);
    if (!sibConf || STRICTNESS[sibConf] === undefined) continue;
    if (STRICTNESS[sibConf] <= STRICTNESS[currentConf]) continue; // not stricter — skip

    // Extract top-20 distinctive keywords from stricter sibling. Corpus =
    // [sibBody, currentBody] (small-N → tfIdf falls back to TF-only).
    const sibBody = stripFrontmatter(sibContent);
    const topKeywords = tfIdf(sibBody, [sibBody, currentBody]);

    // Count keywords appearing in current body (case-insensitive for EN,
    // exact-substring for Hangul which has no case).
    const matched = [];
    for (const kw of topKeywords) {
      if (currentBody.toLowerCase().includes(kw) || currentBody.includes(kw)) {
        matched.push(kw);
      }
    }

    if (matched.length >= 3) {
      findings.push({
        severity: 'material',
        location: `${path.basename(currentArtifactPath)}:body`,
        description: `Cross-artifact leakage suspected: stricter sibling '${path.basename(sib)}' (confidentiality: ${sibConf}) shares distinctive keywords [${matched.slice(0, 8).join(', ')}] with this artifact (confidentiality: ${currentConf}). Verify intent.`,
      });
    }
  }
  return { findings, rationale: `scanned ${siblings.length} sibling(s)` };
}

// ─── Exports ─────────────────────────────────────────────────────────────
module.exports = { leakageDiff, tokenize, tfIdf, STRICTNESS, STOP_WORDS_EN, STOP_WORDS_KO };
