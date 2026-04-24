/**
 * brief-discover-parallel-smoke.test.cjs — Phase 5 Plan 02 Task 1.
 *
 * MANDATORY 2-task parallel spawn smoke (Pitfall 2 mitigation — 05-RESEARCH.md
 * §Pitfall 2 "Wave-spawn actually running sequentially"). Runs BEFORE the
 * 4-wide wave-spawn pattern is exercised.
 *
 * SCOPE — unit-level smoke, NOT a live Task-spawn test:
 *   - Wave-partition algorithm (D-02) — ceil(N/4) waves of ≤4 each, order-preserving.
 *   - Spawn-message shape contract — per-Task prompt MUST include the tokens
 *     `<business_context>`, `{{CATEGORY}}`, `{{OUT_PATH}}` at the agent-template
 *     level so the orchestrator (Plan 07) can interpolate without drift.
 *
 * Out of scope (Plan 08 canary E2E concerns, not node:test territory):
 *   - Actual Task-tool spawn inside Claude Code runtime.
 *   - Wall-clock ratio assertion (2 × single) × 0.9 — requires live LLM.
 *
 * Cross-worktree tolerance: the agent template is shipped by Task 3 of this
 * same plan (agents/brief-domain-researcher.md). When this test runs at the
 * Task 1 commit point the file does not yet exist; the template-token test
 * is skipped with a pointer to Task 3. Once Task 3 lands the file, the skip
 * flips to a pass naturally.
 *
 * References:
 *   - 05-02-PLAN.md Task 1
 *   - 05-CONTEXT.md D-02 (wave cap), D-13 (spawn-time injection)
 *   - 05-RESEARCH.md §Pitfall 2 (wave-spawn parallelism verification)
 *   - tests/brief-align-primitives.test.cjs (node:test structural template)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// ─── Wave-partition algorithm (D-02 authoritative) ────────────────────────
// N categories → ceil(N/4) waves of ≤4 each. This helper lives in
// brief/bin/lib (either context-inject.cjs OR a new discover.cjs added in
// Plan 07). For now, inline the algorithm under test as part of this smoke —
// Plan 07 refactors to lib when the workflow consumer lands.
function partitionWaves(categories, cap = 4) {
  if (!Array.isArray(categories) || categories.length === 0) return [];
  const waves = [];
  for (let i = 0; i < categories.length; i += cap) {
    waves.push(categories.slice(i, i + cap));
  }
  return waves;
}

// ─── Wave-partition algorithm tests ────────────────────────────────────────

test('Empty categories → zero waves', () => {
  assert.deepEqual(partitionWaves([]), []);
});

test('1 category → 1 wave of 1', () => {
  assert.deepEqual(partitionWaves(['market-sizing']), [['market-sizing']]);
});

test('2 categories → 1 wave of 2 (smoke baseline)', () => {
  const waves = partitionWaves(['market-sizing', 'competitor-landscape']);
  assert.equal(waves.length, 1);
  assert.equal(waves[0].length, 2);
});

test('4 categories → 1 wave of 4 (at cap)', () => {
  const categories = ['a', 'b', 'c', 'd'];
  const waves = partitionWaves(categories);
  assert.equal(waves.length, 1);
  assert.equal(waves[0].length, 4);
});

test('5 categories → 2 waves (4 + 1)', () => {
  const waves = partitionWaves(['a', 'b', 'c', 'd', 'e']);
  assert.equal(waves.length, 2);
  assert.equal(waves[0].length, 4);
  assert.equal(waves[1].length, 1);
});

test('9 categories → 3 waves (4 + 4 + 1) — DSC-01 full default set', () => {
  const cats = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  const waves = partitionWaves(cats);
  assert.equal(waves.length, 3);
  assert.deepEqual(waves.map((w) => w.length), [4, 4, 1]);
  // Order-preserving — Wave 1 contains first 4, Wave 2 next 4, Wave 3 last 1.
  assert.equal(waves[0][0], 'a');
  assert.equal(waves[2][0], 'i');
});

// ─── Spawn-message contract test (agent-template) ──────────────────────────
// REQUIRED_PROMPT_TOKENS documents the shape of the orchestrator message the
// workflow will construct (Plan 07). If future refactoring drops any of these
// interpolation targets, this test catches it.
const REQUIRED_PROMPT_TOKENS = ['<business_context>', '{{CATEGORY}}', '{{OUT_PATH}}'];

const agentPath = path.join(__dirname, '..', 'agents', 'brief-domain-researcher.md');
const agentExists = fs.existsSync(agentPath);

test(
  'Spawn-message contract: per-Task prompt includes <business_context>, {{CATEGORY}}, {{OUT_PATH}}',
  { skip: !agentExists },
  () => {
    // The agents/brief-domain-researcher.md file is the TEMPLATE — verify it
    // declares all tokens. When this test runs at the Task 1 commit point
    // the file has not yet been created by Task 3; the skip condition above
    // handles that transitional state. Once Task 3 lands the template the
    // skip flips to an assertion.
    assert.ok(
      fs.existsSync(agentPath),
      'brief-domain-researcher.md must exist (Plan 02 Task 3)',
    );
    const body = fs.readFileSync(agentPath, 'utf-8');
    for (const token of REQUIRED_PROMPT_TOKENS) {
      assert.ok(body.includes(token), `agent template must reference ${token}`);
    }
  },
);
