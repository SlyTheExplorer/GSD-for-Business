/**
 * Gap-Detect — Phase 6 gap-detector gate primitives (Plan 06-03). Copy-rename
 * of brief/bin/lib/audience.cjs with Phase-6-specific extensions:
 *   - D-01 decision enum {GAPS-NONE, GAPS-MATERIAL-ONLY, GAPS-BLOCKING}
 *   - D-03 severity enum inherited from Phase 4
 *   - D-05 return_stack frame shape (7 fields) + LIFO append via pushReturnFrame
 *   - D-06 append-only return_stack_history (NEVER popped — structural guard)
 *   - D-09 topic_fingerprint slug contract (kebab-case regex + stopword ban)
 *
 * Task 1 scope: validateVerdict + countIterations + validateFingerprint +
 * pushReturnFrame. Task 2 extends with popReturnFrame + maybePopTopFrame +
 * clearReturnStackFor + appendGapQueue + writeAssumption.
 *
 * countIterations + validateFingerprint + validateVerdict are pure functions.
 * pushReturnFrame transacts on state.cjs via readModifyWriteStateMd.
 *
 * STRIDE threat register mitigations (06-03):
 *   T-06-03-01: validateVerdict calls validateFingerprint at ingest
 *   T-06-03-05: countIterations null-checks every entry
 *   T-06-03-06: error messages path-agnostic
 *
 * Zero external runtime deps (A1). Refs: 06-CONTEXT.md D-05/D-06/D-09/D-11.
 */
const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync, planningDir, planningPaths } = require('./core.cjs');
const { sanitizeForPrompt } = require('./security.cjs');
const {
  extractFrontmatter,
  stripFrontmatter,
  reconstructFrontmatter,
} = require('./frontmatter.cjs');
const { readModifyWriteStateMd } = require('./state.cjs');
const { detectKoreaSignalFromConfig } = require('./align.cjs');
const { siblingReportPath } = require('./audience.cjs');
const { renderGapDetectReport } = require('./gap-detect-report.cjs');

// ─── Enum constants (exported for test fixture use) ────────────────────────
// D-01: decision enum for gap-detect verdicts.
const VALID_DECISIONS = new Set(['GAPS-NONE', 'GAPS-MATERIAL-ONLY', 'GAPS-BLOCKING']);
// D-03: severity enum inherited verbatim from Phase 4.
const VALID_SEVERITIES = new Set(['blocking', 'material', 'nice-to-have']);

// D-09: topic fingerprint contract — kebab-case 3-8 alpha tokens.
const FINGERPRINT_RE = /^[a-z]+(-[a-z]+){2,7}$/;
const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'in', 'for', 'with', 'and', 'or']);

// Ban-list (inherited verbatim from audience.cjs — same vocabulary-lock).
const BAN_EN = /\b(compliant|passed|violation|failed)\b/gi;
const BAN_KO = /(준수|통과|위반|실패)/g;
const BAN_SYMBOL = /[✅✓✗]/g;

// ─── validateFingerprint (D-09 pure function) ─────────────────────────────
// Returns null if valid; error string otherwise. No I/O, no side effects.
function validateFingerprint(slug) {
  if (typeof slug !== 'string') return 'not a string';
  if (slug.length === 0) return 'empty string';
  if (!FINGERPRINT_RE.test(slug)) return 'fails kebab-case 3-8 token regex';
  const tokens = slug.split('-');
  const stop = tokens.filter((t) => STOPWORDS.has(t));
  if (stop.length > 0) return `contains stopword (${stop.join(',')})`;
  return null;
}

// ─── validateVerdict (T-06-03-01 mitigation) ──────────────────────────────
// Extends audience.cjs's shape-check to REQUIRE topic_fingerprint in every
// finding — rejects agent verdicts that try to inject a fingerprint that
// bypasses countIterations string-equality match.
function validateVerdict(v) {
  if (!v || typeof v !== 'object') return 'verdict not object';
  if (!VALID_DECISIONS.has(v.decision)) return `bad decision: ${v.decision}`;
  if (!VALID_SEVERITIES.has(v.severity)) return `bad severity: ${v.severity}`;
  if (typeof v.findings_count !== 'number' || v.findings_count < 0 || !Number.isInteger(v.findings_count)) {
    return 'bad findings_count (must be non-negative integer)';
  }
  if (!Array.isArray(v.findings)) return 'findings not array';
  for (let i = 0; i < v.findings.length; i++) {
    const f = v.findings[i];
    if (!f || typeof f !== 'object') return `findings[${i}] not object`;
    if (!VALID_SEVERITIES.has(f.severity)) return `findings[${i}].severity bad`;
    if (typeof f.location !== 'string') return `findings[${i}].location not string`;
    if (typeof f.description !== 'string') return `findings[${i}].description not string`;
    if (typeof f.topic_fingerprint !== 'string') return `findings[${i}].topic_fingerprint not string`;
    const fpErr = validateFingerprint(f.topic_fingerprint);
    if (fpErr) return `findings[${i}].topic_fingerprint invalid: ${fpErr}`;
  }
  if (typeof v.rationale !== 'string') return 'rationale not string';
  return null;
}

// ─── countIterations (Pattern 3 — D-06 pure function, T-06-03-05 mitigation) ──
// Returns the count of history entries matching BOTH workstream AND
// topic_fingerprint — string-equality compare. Null-safe against malformed
// history entries per T-06-03-05 (null, missing workstream, missing
// fingerprint, non-object). Never throws.
function countIterations(history, workstream, topicFingerprint) {
  if (!Array.isArray(history)) return 0;
  return history.filter((f) =>
    f && typeof f === 'object'
    && f.paused_workstream === workstream
    && f.topic_fingerprint === topicFingerprint,
  ).length;
}

// ─── pushReturnFrame (Pattern 1 — atomic dual-array write) ────────────────
// Writes frame to BOTH state.brief.return_stack (LIFO append) AND
// state.brief.return_stack_history (append-only) inside ONE
// readModifyWriteStateMd transaction. Defensive deep-copy prevents caller
// mutation from altering state after push.
function pushReturnFrame(cwd, frame) {
  if (!frame || typeof frame !== 'object') {
    throw new Error('pushReturnFrame: frame must be an object');
  }
  const required = [
    'paused_phase',
    'paused_workstream',
    'paused_artifact',
    'gap_text',
    'triggering_topic',
    'topic_fingerprint',
    'pushed_at',
  ];
  for (const k of required) {
    if (typeof frame[k] !== 'string' || frame[k].length === 0) {
      throw new Error(`pushReturnFrame: frame.${k} missing or not a non-empty string`);
    }
  }
  const fpErr = validateFingerprint(frame.topic_fingerprint);
  if (fpErr) throw new Error(`pushReturnFrame: invalid topic_fingerprint: ${fpErr}`);

  const statePath = planningPaths(cwd).state;
  readModifyWriteStateMd(statePath, (content) => {
    const body = stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    if (!fm.brief || typeof fm.brief !== 'object' || Array.isArray(fm.brief)) fm.brief = {};
    if (!Array.isArray(fm.brief.return_stack)) fm.brief.return_stack = [];
    if (!Array.isArray(fm.brief.return_stack_history)) fm.brief.return_stack_history = [];

    // Defensive deep-copy — never share references between caller, return_stack,
    // and return_stack_history. JSON round-trip guarantees isolation.
    const frameCopy = JSON.parse(JSON.stringify(frame));
    const historyCopy = JSON.parse(JSON.stringify(frame));

    fm.brief.return_stack.push(frameCopy);
    fm.brief.return_stack_history.push(historyCopy);
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);
}

// ─── writeVerdict ──────────────────────────────────────────────────────────
// Validates and atomically writes a verdict JSON to disk.
function writeVerdict(verdictPath, verdictObject) {
  const err = validateVerdict(verdictObject);
  if (err) throw new Error(`GAP-DETECT verdict invalid: ${err}`);
  const serialized = JSON.stringify(verdictObject, null, 2);
  atomicWriteFileSync(verdictPath, serialized, 'utf-8');
}

// ─── Exports ───────────────────────────────────────────────────────────────
// popReturnFrame + maybePopTopFrame + clearReturnStackFor + appendGapQueue +
// writeAssumption are added in Task 2. runGapDetect + commitGapDetectVerdict
// added in Plan 04.
module.exports = {
  VALID_DECISIONS,
  VALID_SEVERITIES,
  FINGERPRINT_RE,
  STOPWORDS,
  BAN_EN,
  BAN_KO,
  BAN_SYMBOL,
  validateVerdict,
  validateFingerprint,
  countIterations,
  pushReturnFrame,
  writeVerdict,
  siblingReportPath,
  renderGapDetectReport,
  detectKoreaSignalFromConfig,
};
