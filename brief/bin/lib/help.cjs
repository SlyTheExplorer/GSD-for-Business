/**
 * Help — categorized command listing + partial-keyword match + inline
 * Levenshtein typo correction for /brief-help (Phase 9 Plan HRD-03 /
 * C-D01..C-D04).
 *
 * Distribution: standalone lib invoked from brief-tools.cjs `case 'help'`
 * dispatcher. Reads commands/brief/*.md frontmatter via the shared
 * frontmatter.cjs::extractFrontmatter helper. Builds an in-memory catalog
 * cached at module level (recomputed on next process — survives manual
 * commands/brief/ edits without an install step per RESEARCH.md
 * Discretion-3).
 *
 * Zero runtime deps (A1). No npm packages. Inline ~30-LOC two-row DP
 * Levenshtein per RESEARCH.md Pattern 2 (lines 333-378). NEVER pulls
 * `fast-levenshtein`, `js-levenshtein`, or `commander` — A1 invariant.
 *
 * Pitfall #12 (slash-command memorability) mitigation: 4D phase grouping
 * (DEFINE / DISCOVER / DESIGN / DELIVER / HELPERS) gives users a phase-anchored
 * mental model when they don't remember the exact slug.
 *
 * Pitfall 3 (define ↔ design known collision, distance=3): both candidates
 * MUST land within the suggestTopK k=3 / threshold=3 window so the user
 * disambiguates rather than silently picking one. Documented inline at the
 * levenshtein() function header.
 *
 * Refs: 09-RESEARCH.md §Pattern 2 (lines 333-378), §Pattern 3 (lines 380-434),
 * §Pitfall 3 (lines 506-523), §Pitfall #12 (slash-command memorability);
 * 09-PATTERNS.md help.cjs section (lines 129-253); 09-02-PLAN.md.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { extractFrontmatter } = require('./frontmatter.cjs');

// PHASE_CATEGORIES — byte-identical to 09-00-PLAN.md <interfaces> block (C-D01).
// Maps each user-facing slug to one of 5 4D-phase categories. Anything not in
// this hash falls back to 'HELPERS' in buildCatalog.
const PHASE_CATEGORIES = {
  define: 'DEFINE', discover: 'DISCOVER', design: 'DESIGN',
  deliver: 'DELIVER', export: 'DELIVER', 'add-workstream': 'DESIGN',
  status: 'HELPERS', help: 'HELPERS', 'init': 'HELPERS',
  'progress': 'HELPERS', 'undo': 'HELPERS', 'pause-work': 'HELPERS',
};

// Module-level catalog cache (Pattern 3) — recomputed on next process; survives
// manual commands/brief/ edits without an install step per RESEARCH.md
// Discretion-3. Keyed by resolved commandsDir so callers passing different
// paths (e.g., fixture temp dirs in tests, future per-workstream subsets)
// receive the right entries instead of a stale cached set.
const _catalogCache = new Map();

/**
 * buildCatalog(commandsDir) → array of {slug, name, description, category, body}
 *
 * Reads every `*.md` file under commandsDir, extracts frontmatter via the
 * shared extractFrontmatter helper, and returns a normalized catalog entry per
 * file. Subsequent calls with the same resolved path return the cached result.
 *
 * @param {string} commandsDir absolute path
 * @returns {Array<{slug:string, name:string, description:string, category:string, body:string}>}
 */
function buildCatalog(commandsDir) {
  const key = path.resolve(commandsDir);
  const cached = _catalogCache.get(key);
  if (cached) return cached;
  const files = fs.readdirSync(key).filter((f) => f.endsWith('.md'));
  const entries = files.map((f) => {
    const slug = f.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(key, f), 'utf-8');
    const fm = extractFrontmatter(content) || {};
    return {
      slug,
      name: fm.name || `brief:${slug}`,
      description: fm.description || '',
      category: PHASE_CATEGORIES[slug] || 'HELPERS',
      // CRLF-aware frontmatter strip — matches `---\n` and `---\r\n` line endings.
      body: content.replace(/^---[\s\S]*?---\r?\n/, ''),
    };
  });
  _catalogCache.set(key, entries);
  return entries;
}

/**
 * renderCategorized(catalog) → markdown string with 5 ## headers
 *
 * Emits a `# BRIEF Command Reference` header followed by 5 `## DEFINE`,
 * `## DISCOVER`, `## DESIGN`, `## DELIVER`, `## HELPERS` sections in that
 * fixed canonical order. Each section lists matching commands as
 * `- \`/brief-${slug}\` — ${description}`.
 *
 * @param {Array} catalog
 * @returns {string}
 */
function renderCategorized(catalog) {
  const groups = { DEFINE: [], DISCOVER: [], DESIGN: [], DELIVER: [], HELPERS: [] };
  for (const e of catalog) {
    const cat = groups[e.category] ? e.category : 'HELPERS';
    groups[cat].push(e);
  }
  let out = '# BRIEF Command Reference\n\n';
  for (const cat of ['DEFINE', 'DISCOVER', 'DESIGN', 'DELIVER', 'HELPERS']) {
    out += `## ${cat}\n\n`;
    for (const e of groups[cat]) {
      out += `- \`/brief-${e.slug}\` — ${e.description}\n`;
    }
    out += '\n';
  }
  return out;
}

/**
 * renderTopicMatch(matches) → markdown listing matched commands + first body
 *
 * On match: lists every matched command and appends the body of the FIRST
 * matched command's `.md` file (so `/brief-help def` shows DEFINE-phase
 * commands AND the full define.md body).
 *
 * On empty matches: returns a concise no-match notice (the dispatcher routes
 * empty matches to renderTypoSuggestions, so this branch is defensive).
 *
 * @param {Array} matches
 * @returns {string}
 */
function renderTopicMatch(matches) {
  if (!matches || matches.length === 0) {
    return '# BRIEF Help\n\nNo matches.\n';
  }
  let out = `# BRIEF Help — ${matches.length} match${matches.length > 1 ? 'es' : ''}\n\n`;
  for (const e of matches) {
    out += `- \`/brief-${e.slug}\` (${e.category}) — ${e.description}\n`;
  }
  out += '\n---\n\n' + (matches[0].body || '');
  return out;
}

/**
 * renderTypoSuggestions(input, suggestions) → markdown with top-3 list
 *
 * Either lists the top-3 Levenshtein candidates (distance ≤ 3) or — when no
 * candidate qualifies — returns a "no candidates" notice that points the user
 * back at the no-arg full listing.
 *
 * @param {string} input
 * @param {Array<{name:string, distance:number}>} suggestions
 * @returns {string}
 */
function renderTypoSuggestions(input, suggestions) {
  let out = `# BRIEF Help — no exact match for "${input}"\n\n`;
  if (!suggestions || suggestions.length === 0) {
    out += 'No candidates within distance ≤ 3. Run `/brief-help` (no argument) for the full categorized listing.\n';
    return out;
  }
  out += 'Did you mean:\n\n';
  for (const s of suggestions) {
    out += `- \`/brief-${s.name}\` (distance ${s.distance})\n`;
  }
  out += '\nRun `/brief-help` (no argument) for the full listing.\n';
  return out;
}

/**
 * levenshtein(a, b) → integer edit distance
 *
 * Inline two-row dynamic programming Levenshtein, copied verbatim from
 * 09-RESEARCH.md §Pattern 2 (lines 344-378). O(min(m,n)) space, O(m*n) time.
 *
 * Pitfall 3 (RESEARCH.md lines 506-523): `levenshtein('define', 'design') === 3`
 * — three substitutions at positions 2, 4, 5 (f→s, n→g, e→n). The original
 * RESEARCH.md narrative miscounted as 2; canonical Wikipedia DP returns 3
 * (verified by tests/brief-help-levenshtein.test.cjs). The k=3 / threshold=3
 * window still surfaces both for inputs within 1-2 edits of either
 * (e.g., `desin` → design(1), define(2); `defin` → define(1), design(3)).
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  // Ensure a is the shorter string — minimizes inner-loop allocations.
  if (a.length > b.length) { const t = a; a = b; b = t; }

  let prev = new Array(a.length + 1);
  let curr = new Array(a.length + 1);
  for (let i = 0; i <= a.length; i += 1) prev[i] = i;

  for (let j = 1; j <= b.length; j += 1) {
    curr[0] = j;
    for (let i = 1; i <= a.length; i += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,        // deletion
        curr[i - 1] + 1,    // insertion
        prev[i - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[a.length];
}

/**
 * suggestTopK(input, candidates, k=3, maxDistance=3) → sorted suggestions
 *
 * Computes Levenshtein distance from `input` to every candidate, filters out
 * candidates exceeding `maxDistance`, sorts ascending, and returns the top
 * `k` results.
 *
 * @param {string} input
 * @param {Array<string>} candidates
 * @param {number} [k=3]
 * @param {number} [maxDistance=3]
 * @returns {Array<{name:string, distance:number}>}
 */
function suggestTopK(input, candidates, k = 3, maxDistance = 3) {
  return candidates
    .map((c) => ({ name: c, distance: levenshtein(input, c) }))
    .filter((r) => r.distance <= maxDistance)
    .sort((x, y) => x.distance - y.distance)
    .slice(0, k);
}

module.exports = {
  buildCatalog,
  renderCategorized,
  renderTopicMatch,
  renderTypoSuggestions,
  levenshtein,
  suggestTopK,
  PHASE_CATEGORIES,
};
