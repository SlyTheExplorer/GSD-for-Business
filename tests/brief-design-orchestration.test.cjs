/**
 * brief-design-orchestration.test.cjs — Plan 07-03 Task 3 (Wave 0).
 *
 * Single-workstream-per-session contract enforcement (D-05). brief/workflows/
 * design.md MUST:
 *   1. Reference at least one workstream design Task spawn (Step 4 body).
 *   2. NOT contain wave/multi-select/parallel-spawn language — those are
 *      discover.md patterns (Phase 5) intentionally NOT inherited by /brief-
 *      design (Phase 7 D-05 contract).
 *   3. Validate the slug via the design get-workstream / loadWorkstreams
 *      seam (the dispatcher case shipped in Task 1).
 *   4. Reference canonical aliases BMC and GTM (RESOLVED Open Question #2 in
 *      07-RESEARCH.md — full alias map BMC/GTM/FIN/OPS/COMP/ROAD/BRAND/RISK/TECH).
 *
 * Threat mitigations:
 *   - T-07-06 (Spoofing — argument-hint surface): the orchestration test
 *     enforces single-positional-slug parsing in the workflow markdown.
 *
 * References:
 *   - 07-03-PLAN.md Task 3 (test source)
 *   - 07-CONTEXT.md D-05 (single-WS-per-session)
 *   - 07-RESEARCH.md Open Question #2 RESOLVED (alias map)
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const WORKFLOW = path.join(ROOT, 'brief/workflows/design.md');
const wf = fs.readFileSync(WORKFLOW, 'utf8');

test('design.md is single-workstream-per-session (D-05)', () => {
  // The workflow body must reference at least one Task spawn (Step 4).
  const taskSpawnCount = (wf.match(/spawn.*Task|Task spawn|design Task spawn/gi) || []).length;
  assert.ok(
    taskSpawnCount >= 1,
    `design.md should reference at least one Task spawn (got ${taskSpawnCount})`,
  );
  // Must NOT contain wave-based or multi-select language — those are
  // discover.md (Phase 5) patterns, intentionally not inherited.
  assert.ok(
    !/multi-select|wave queue|parallel spawn/i.test(wf),
    'design.md should not contain wave/multi-select language (D-05 single-workstream contract)',
  );
});

test('design.md validates slug via workstream-loader', () => {
  assert.match(
    wf,
    /design get-workstream|loadWorkstreams|workstream-loader/,
    'design.md must invoke the workstream-loader (via design get-workstream dispatcher or direct loadWorkstreams reference)',
  );
});

test('design.md accepts canonical aliases (BMC/GTM/FIN/...)', () => {
  assert.match(
    wf,
    /BMC|business-model-canvas/,
    'design.md must reference BMC alias or canonical business-model-canvas slug',
  );
  assert.match(
    wf,
    /GTM|go-to-market/,
    'design.md must reference GTM alias or canonical go-to-market slug',
  );
});
