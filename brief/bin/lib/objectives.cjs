/**
 * Objectives — OBJECTIVES.md reader/writer/validator + immutable-lock enforcement + stale-anchor.
 *
 * D-07 (CONTEXT.md): Immutable section lock is load-bearing vs Pitfall #3 anchor drift.
 *                    Enforcement at WRITER layer (here) — not at commit time.
 * D-09 (CONTEXT.md): Phase 3 ships ONLY project-level .planning/OBJECTIVES.md; per-workstream deferred to Phase 7.
 * D-10 (CONTEXT.md): Immutable default heuristic — creator-identity, core-value, problem-statement.
 * D-11 (CONTEXT.md): empty compliance_packs array IS VALID for Phase 3 canary.
 *
 * Pitfall #3 mitigation: two-layer enforcement — UI layer (Mode B hides immutable items from select
 *   prompt) + writer layer (this file refuses via enforceImmutableLock).
 *
 * Composition discipline (Plan 03-01 success criterion):
 *   - This module COMPOSES frontmatter.cjs (D-20) + core.cjs. No new YAML parser.
 *   - Zero runtime dependencies (A1 guard) — no gray-matter, no ajv, no js-yaml.
 */

const fs = require('fs');
const path = require('path');
const { planningPaths, atomicWriteFileSync } = require('./core.cjs');
const {
  extractFrontmatter,
  spliceFrontmatter,
  reconstructFrontmatter,
} = require('./frontmatter.cjs');

const OBJECTIVES_SCHEMA = {
  required: [
    'business_model',
    'region',
    'audience_policy',
    'compliance_packs',
    'status',
    'immutable_items',
  ],
};

const STALE_ANCHOR_THRESHOLD_MS = 48 * 60 * 60 * 1000;

const IMMUTABLE_LOCK_ERROR_KO =
  'Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다. ' +
  '변경이 꼭 필요하시면 /brief-define --amend --unlock-intent 로 다시 실행해주세요.';

// ─── Path resolution helper ────────────────────────────────────────────────

function objectivesPath(cwd) {
  // planningPaths returns `{planning, state, ...}`. The `.planning` key is the
  // `.planning/` base; fall back to the plain join if planningPaths is misconfigured
  // (defensive — current core.cjs always returns it).
  const paths = planningPaths(cwd);
  const base = paths && paths.planning ? paths.planning : path.join(cwd, '.planning');
  return { base, full: path.join(base, 'OBJECTIVES.md') };
}

// ─── Immutable lock enforcement (Pitfall #3 mitigation) ────────────────────

function enforceImmutableLock(existingFm, payload) {
  const immutableItems = Array.isArray(existingFm && existingFm.immutable_items)
    ? existingFm.immutable_items
    : [];
  if (immutableItems.length === 0) return; // nothing to lock

  const newFm = (payload && payload.frontmatter) || {};
  for (const key of immutableItems) {
    if (!Object.prototype.hasOwnProperty.call(newFm, key)) continue;
    // Use JSON.stringify for value comparison — handles primitives, arrays,
    // and nested maps uniformly. For fresh files (no existing value) this is
    // `undefined !== JSON.stringify(new)` → throw, which is the correct
    // behavior when payload DECLARES a key listed in immutable_items.
    const existingVal = existingFm[key];
    const newVal = newFm[key];
    if (JSON.stringify(newVal) !== JSON.stringify(existingVal)) {
      const err = new Error(IMMUTABLE_LOCK_ERROR_KO);
      err.code = 'OBJECTIVES_IMMUTABLE_LOCKED';
      err.violatedField = key;
      throw err;
    }
  }
}

// ─── Body skeleton render (RESEARCH.md §Example 4) ─────────────────────────

function renderBodySkeleton(payload) {
  // Emit the 03-RESEARCH.md Example 4 body sections. The Immutable Intent block
  // carries the 🔒 HTML comment marker verbatim so Mode B UI can detect the lock
  // boundary without re-parsing frontmatter.
  const body = (payload && payload.body) || {};
  const imm = body.immutable || {};
  const mut = body.mutable || {};
  const dreamNow = mut['dream-now'] || {};
  const dream3m = mut['dream-3m'] || {};
  const dream12m = mut['dream-12m'] || {};
  const lines = [
    '# OBJECTIVES',
    '',
    '## Immutable Intent',
    '',
    '<!-- 🔒 LOCKED — 이 섹션을 수정하려면 /brief-define --unlock-intent가 필요합니다. -->',
    '',
    '### Creator Identity',
    '',
    imm['creator-identity'] || '(to be filled)',
    '',
    '### Core Value',
    '',
    imm['core-value'] || '(to be filled)',
    '',
    '### Problem Statement',
    '',
    imm['problem-statement'] || '(to be filled)',
    '',
    '## Mutable Hypotheses',
    '',
    '### Target Audience Specifics',
    '',
    mut['target-audience'] || '(to be filled)',
    '',
    '### Verification Metrics',
    '',
    mut['verification-metrics'] || '(optional)',
    '',
    '### Hypothesized Alternative Tools / Competitors',
    '',
    mut['competitors'] || '(optional)',
    '',
    '### Dream State — Now',
    '',
    dreamNow.prose || '(prose)',
    '',
    '### Dream State — 3-month',
    '',
    dream3m.prose || '(prose)',
    '',
    '### Dream State — 12-month',
    '',
    dream12m.prose || '(prose)',
    '',
  ];
  return lines.join('\n');
}

// ─── Primary writer ────────────────────────────────────────────────────────

function writeObjectivesMd(cwd, payload, opts = {}) {
  const { base, full } = objectivesPath(cwd);
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

  const existingContent = fs.existsSync(full) ? fs.readFileSync(full, 'utf-8') : '';
  const existingFm = existingContent ? extractFrontmatter(existingContent) : {};

  // Enforcement BEFORE any disk write. Pitfall #3 mitigation.
  if (!opts.unlockIntent) {
    enforceImmutableLock(existingFm, payload);
  }

  const payloadFm = (payload && payload.frontmatter) || {};
  const mergedFm = { ...existingFm, ...payloadFm };

  // Track last_amended timestamp on every write (drives stale-anchor 48h check).
  const now = new Date().toISOString();
  mergedFm.last_amended = now;
  if (!mergedFm.created_at) mergedFm.created_at = now;

  let newContent;
  if (existingContent) {
    // Amendment — preserve existing body; splice frontmatter only.
    newContent = spliceFrontmatter(existingContent, mergedFm);
  } else {
    // First write — render body skeleton per RESEARCH.md Example 4.
    const body = renderBodySkeleton(payload);
    const yaml = reconstructFrontmatter(mergedFm);
    newContent = `---\n${yaml}\n---\n\n${body}`;
  }

  atomicWriteFileSync(full, newContent);
  return { path: full, frontmatter: mergedFm };
}

// ─── Reader ────────────────────────────────────────────────────────────────

function readObjectivesMd(cwd) {
  const { full } = objectivesPath(cwd);
  if (!fs.existsSync(full)) {
    return { exists: false, frontmatter: {}, body: '' };
  }
  const content = fs.readFileSync(full, 'utf-8');
  const fm = extractFrontmatter(content);
  // Strip the `---\n...\n---\n` frontmatter block to return body only.
  const fmMatch = content.match(/^---\r?\n[\s\S]+?\r?\n---\r?\n?/);
  const body = fmMatch ? content.slice(fmMatch[0].length) : content;
  return { exists: true, frontmatter: fm, body };
}

// ─── Schema validator ──────────────────────────────────────────────────────

function validateObjectivesComplete(cwd) {
  const r = readObjectivesMd(cwd);
  if (!r.exists) {
    return { valid: false, missing: ['FILE_NOT_EXIST'], present: [] };
  }
  const fm = r.frontmatter || {};
  const isMissing = (field) => {
    const v = fm[field];
    if (v === undefined || v === null) return true;
    // D-11: empty compliance_packs array IS VALID for Phase 3 canary.
    if (field === 'compliance_packs') return false;
    if (typeof v === 'string' && v.trim() === '') return true;
    if (Array.isArray(v) && v.length === 0) return true;
    return false;
  };
  const missing = OBJECTIVES_SCHEMA.required.filter(isMissing);
  const present = OBJECTIVES_SCHEMA.required.filter((f) => !missing.includes(f));
  return { valid: missing.length === 0, missing, present };
}

// ─── Stale-anchor check (Plan 06 consumer) ─────────────────────────────────

function checkStaleAnchor(cwd) {
  const { full } = objectivesPath(cwd);
  if (!fs.existsSync(full)) {
    return { stale: false, age_hours: 0, reason: 'missing' };
  }
  const stat = fs.statSync(full);
  const ageMs = Date.now() - stat.mtimeMs;
  return {
    stale: ageMs > STALE_ANCHOR_THRESHOLD_MS,
    age_hours: Math.floor(ageMs / 3600000),
  };
}

module.exports = {
  writeObjectivesMd,
  readObjectivesMd,
  validateObjectivesComplete,
  checkStaleAnchor,
  enforceImmutableLock,
  OBJECTIVES_SCHEMA,          // exported for Plan 05 block-gate reuse
  STALE_ANCHOR_THRESHOLD_MS,  // exported for Plan 06 stale-anchor reuse
};
