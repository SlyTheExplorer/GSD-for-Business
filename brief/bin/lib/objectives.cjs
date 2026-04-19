/**
 * Objectives — OBJECTIVES.md reader/writer/validator + immutable-lock enforcement + stale-anchor.
 *
 * D-07 (CONTEXT.md): Immutable section lock is load-bearing vs Pitfall #3 anchor drift.
 *                    Enforcement at WRITER layer (here) — not at commit time.
 * D-09 (CONTEXT.md): Phase 3 ships ONLY project-level .planning/OBJECTIVES.md; per-workstream deferred to Phase 7.
 * D-10 (CONTEXT.md): Immutable default heuristic — creator-identity, core-value, problem-statement.
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

// ─── Task 1 skeletons — will be implemented in Task 2. ──────────────────────

function enforceImmutableLock(existingFm, payload) {
  throw new Error('NOT_IMPLEMENTED');
}

function writeObjectivesMd(cwd, payload, opts) {
  throw new Error('NOT_IMPLEMENTED');
}

function readObjectivesMd(cwd) {
  throw new Error('NOT_IMPLEMENTED');
}

function validateObjectivesComplete(cwd) {
  throw new Error('NOT_IMPLEMENTED');
}

function checkStaleAnchor(cwd) {
  throw new Error('NOT_IMPLEMENTED');
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
