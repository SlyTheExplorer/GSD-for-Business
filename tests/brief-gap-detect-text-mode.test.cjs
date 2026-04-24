/**
 * brief-gap-detect-text-mode.test.cjs — Phase 6 Plan 08 Task 2 (4 of 4).
 *
 * FND-06 cross-runtime parity: the iteration-2 meta-arbiter (D-08) and
 * iteration-3 hard-cap (D-07) prompts MUST render as plain-text numbered
 * lists when TEXT_MODE is active. This keeps BRIEF functional across
 * Claude Code, Codex, Gemini CLI, and OpenCode — the non-AskUserQuestion
 * runtime fallback is the multi-runtime promise that rides the entire
 * framework forward.
 *
 * Also: discover.md Step 0.5 (Plan 06-07 D-10 resume auto-detect) carries
 * the same TEXT_MODE discipline because it is the user-facing entry point
 * that presents the 3-option menu when a paused frame exists on the stack.
 *
 * 4 structural invariants locked:
 *
 *   1. gap-detect.md Step 5.1 (D-08 meta-arbiter) has a TEXT_MODE /
 *      numbered-list fallback.
 *   2. gap-detect.md Step 5.2 (D-07 hard-cap) has a numbered-options
 *      fallback (the "(1) ... (2) ... (3) ..." form).
 *   3. discover.md Step 0.5 (D-10 resume) has a TEXT_MODE /
 *      numbered-list fallback.
 *   4. Korean-language variants present alongside English for the iter-2
 *      prompt options (FND-06 bilingual parity — Korean is the default
 *      when brief.region=kr; English is the fallback).
 *
 * References:
 *   - 06-08-PLAN.md Task 2 (EXACT CONTENT)
 *   - 06-CONTEXT.md D-07 (hard-cap), D-08 (meta-arbiter), D-10 (resume)
 *   - Phase 1 FND-06 multi-runtime inheritance
 *   - brief/workflows/gap-detect.md Step 5.1 / 5.2
 *   - brief/workflows/discover.md Step 0.5
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const GAP_WORKFLOW = fs.readFileSync(
  path.join(__dirname, '..', 'brief/workflows/gap-detect.md'),
  'utf-8',
);
const DISCOVER = fs.readFileSync(
  path.join(__dirname, '..', 'brief/workflows/discover.md'),
  'utf-8',
);

// ─── Test 1: gap-detect.md meta-arbiter has TEXT_MODE fallback ──────────

test('TEXT_MODE: gap-detect.md Step 5.1 meta-arbiter has numbered-list fallback (FND-06)', () => {
  const s51 = GAP_WORKFLOW.search(/iteration 2|Step 5\.1|N === 1/);
  assert.ok(
    s51 > 0,
    'Step 5.1 (D-08 meta-arbiter) section not found in brief/workflows/gap-detect.md',
  );
  const tail = GAP_WORKFLOW.slice(s51);
  assert.match(
    tail,
    /TEXT_MODE|numbered[- ]list|\n\s*1\.\s/i,
    'TEXT_MODE numbered-list fallback missing in Step 5.1 meta-arbiter section',
  );
});

// ─── Test 2: gap-detect.md hard-cap has numbered-options fallback ───────

test('TEXT_MODE: gap-detect.md Step 5.2 hard-cap has numbered-options fallback (D-07 no-bypass)', () => {
  const s52 = GAP_WORKFLOW.search(/HARD CAP|hard-cap|iteration 3/i);
  assert.ok(
    s52 > 0,
    'Step 5.2 (D-07 hard-cap) section not found in brief/workflows/gap-detect.md',
  );
  const tail = GAP_WORKFLOW.slice(s52);
  assert.match(
    tail,
    /\(1\)|\n\s*1\.\s/,
    'Hard-cap numbered-list options missing (expected `(1) Proceed...` or `1. Proceed...` form)',
  );
});

// ─── Test 3: discover.md Step 0.5 has TEXT_MODE fallback ────────────────

test('TEXT_MODE: discover.md Step 0.5 resume auto-detect has numbered-list fallback (D-10)', () => {
  const s05 = DISCOVER.indexOf('## Step 0.5');
  const s1 = DISCOVER.indexOf('## Step 1:');
  assert.ok(s05 > 0, 'Step 0.5 heading missing in brief/workflows/discover.md');
  assert.ok(s1 > 0, 'Step 1 heading missing in brief/workflows/discover.md');
  assert.ok(
    s05 < s1,
    'Step 0.5 must appear before Step 1 (fractional-step prepend convention)',
  );
  const block = DISCOVER.slice(s05, s1);
  assert.match(
    block,
    /TEXT_MODE|\n\s*1\.\s+Resume/,
    'Step 0.5 missing TEXT_MODE numbered-list rendering (expected TEXT_MODE block or `1. Resume` line)',
  );
});

// ─── Test 4: FND-06 Korean variants alongside English ──────────────────

test('FND-06 cross-runtime parity: Korean variants present alongside English for iter-2 prompt', () => {
  assert.ok(
    GAP_WORKFLOW.includes('계속 연구하기') || GAP_WORKFLOW.includes('계속 연구'),
    'Korean variant for "Keep researching" option missing in gap-detect.md iter-2 prompt',
  );
  assert.ok(
    GAP_WORKFLOW.includes('가정') || GAP_WORKFLOW.includes('가정을 명시'),
    'Korean variant for "Proceed with assumption" option missing in gap-detect.md iter-2 prompt',
  );
});
