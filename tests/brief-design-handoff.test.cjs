/**
 * brief-design-handoff.test.cjs — Plan 07-03 Task 3 (Wave 0).
 *
 * Workstream completion handoff structure enforcement (D-08).
 * brief/workflows/design.md Step 7 MUST render four elements:
 *   1. Artifact path (the path to the produced workstream artifact).
 *   2. 3-gate verdict summary (ALIGN + AUDIENCE + COMPLIANCE decisions).
 *   3. Recommended-next derivation (derive-at-read from spec.yaml depends_on
 *      via the `design recommended-next` dispatcher — NO stored field).
 *   4. AskUserQuestion 3-option (Continue / Stop here / Pick different) per
 *      D-08; NO auto-chain to the next workstream without user confirmation.
 *
 * Anti-nesting principle (Phase 5 D-08 inheritance): the Continue path uses
 * the Skill tool for recursion rather than spawning a child Task. A nested
 * Task spawn would conflate parent + child agents and is forbidden.
 *
 * Threat mitigations:
 *   - T-07-09 (Repudiation — handoff confirmation): the AskUserQuestion 3-
 *     option assertion guarantees the user explicitly confirms each
 *     workstream transition; there is no silent auto-chain.
 *
 * References:
 *   - 07-03-PLAN.md Task 3 (test source)
 *   - 07-CONTEXT.md D-07 (soft-recommended ordering)
 *   - 07-CONTEXT.md D-08 (handoff confirmation 4-element contract)
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const WORKFLOW = path.join(ROOT, 'brief/workflows/design.md');
const wf = fs.readFileSync(WORKFLOW, 'utf8');

test('Step 7 handoff renders artifact path + 3-gate verdict summary (D-08)', () => {
  // Take everything after the `## Step 7:` heading. The split returns the
  // body content the user sees during the handoff.
  const step7 = wf.split(/Step 7/)[1] || '';
  assert.match(step7, /artifact|Artifact/, 'Step 7 must render artifact path');
  assert.match(step7, /ALIGN/, 'Step 7 must render ALIGN verdict');
  assert.match(step7, /AUDIENCE/, 'Step 7 must render AUDIENCE verdict');
  assert.match(step7, /COMPLIANCE/, 'Step 7 must render COMPLIANCE verdict');
});

test('Step 7 handoff renders recommended-next derivation (D-07 + D-08)', () => {
  // Recommended-next is computed at read-time from spec.yaml depends_on +
  // completed-list — it is NOT a stored state.brief.* field (D-08
  // explicit decision). Either the literal phrase 'recommended next' or
  // the dispatcher invocation must appear in the workflow.
  assert.match(
    wf,
    /recommended.next|recommended_next|Recommended next/,
    'design.md must reference recommended-next computation',
  );
  assert.match(
    wf,
    /design recommended-next|derive.*at.read|derive-at-read/,
    'design.md must invoke the design recommended-next dispatcher (derive-at-read)',
  );
});

test('Step 7 handoff offers 3 options (Continue / Stop here / Pick different) — D-08', () => {
  const step7 = wf.split(/Step 7/)[1] || '';
  assert.match(step7, /continue|계속|Continue/i, 'Step 7 must offer Continue option');
  assert.match(step7, /stop|멈추|Stop/i, 'Step 7 must offer Stop here option');
  assert.match(step7, /다른|different|pick/i, 'Step 7 must offer Pick different option');
});

test('Step 7 Continue does NOT nest Task spawn (anti-nesting per Phase 5 D-08)', () => {
  const step7 = wf.split(/Step 7/)[1] || '';
  // Continue path must use Skill-tool recursion or recursive invocation.
  assert.match(
    step7,
    /Skill tool|recursive|recursive.*invoke/i,
    'Continue path must use Skill-tool recursion',
  );
  // Continue path must NOT spawn a nested Task (anti-nesting principle).
  assert.ok(
    !/nested Task|nest.*Task/i.test(step7),
    'Continue path must NOT nest Task spawns (anti-nesting principle)',
  );
});
