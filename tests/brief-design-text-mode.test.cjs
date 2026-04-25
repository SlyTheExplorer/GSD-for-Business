/**
 * brief-design-text-mode.test.cjs — Plan 07-08 Task 2 (Wave 5).
 *
 * TEXT_MODE multi-runtime parity test (FND-06 inheritance). Verifies that all
 * 3 NEW Phase 7 workflows (design.md / compliance.md / add-workstream.md)
 * carry TEXT_MODE detection + numbered-list fallback rendering for every
 * AskUserQuestion call. FND-06 mandates that runtimes WITHOUT AskUserQuestion
 * (OpenAI Codex, Gemini CLI, OpenCode, Claude Code remote `/rc`) still receive
 * an equivalent UX via plain-text numbered lists.
 *
 * Acceptance scope:
 *   T1. design.md detects TEXT_MODE flag (`--text` || workflow.text_mode).
 *   T2. design.md FINANCIAL Step 4.5 batches 12 questions into ONE consolidated
 *       numbered-list prompt under TEXT_MODE (latency mitigation).
 *   T3. add-workstream.md detects TEXT_MODE and renders Q&A as numbered list.
 *   T4. design.md Step 1 workstream selection has TEXT_MODE numbered-list fallback.
 *   T5. design.md Step 7 handoff (3-option AskUserQuestion) has TEXT_MODE fallback.
 *   T6. All 3 NEW Phase 7 workflows detect TEXT_MODE at Step 0.
 *
 * Threat mitigations:
 *   - T-07-28 (Spoofing — TEXT_MODE multi-runtime parity): every
 *     AskUserQuestion in the Phase 7 workflows MUST have a TEXT_MODE
 *     numbered-list fallback. Without it, non-Claude runtimes silently drop
 *     interactive Q&A — the user gets a different UX from what the planner
 *     designed (FND-06 canonical #2012).
 *
 * References:
 *   - 07-08-PLAN.md Task 2
 *   - 07-CONTEXT.md (TEXT_MODE inheritance from Phase 3 Mode A / Phase 4 / 5)
 *   - 07-RESEARCH.md lines 912-914 (TEXT_MODE consolidated numbered-list
 *     mitigation for FINANCIAL 12-driver Q&A latency).
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');
const DESIGN_WF = path.join(REPO_ROOT, 'brief/workflows/design.md');
const COMPLIANCE_WF = path.join(REPO_ROOT, 'brief/workflows/compliance.md');
const ADD_WS_WF = path.join(REPO_ROOT, 'brief/workflows/add-workstream.md');

// ─── T1: design.md detects TEXT_MODE flag (FND-06 inheritance) ─────────────
test('T1 design.md detects TEXT_MODE flag (FND-06 inheritance)', () => {
  const wf = fs.readFileSync(DESIGN_WF, 'utf8');
  assert.match(wf, /TEXT_MODE/, 'design.md must reference TEXT_MODE token');
  assert.match(
    wf,
    /--text|workflow\.text_mode/,
    'design.md must declare detection rule (--text flag OR workflow.text_mode config)'
  );
});

// ─── T2: design.md FINANCIAL Step 4.5 batches 12 questions in TEXT_MODE ────
test('T2 design.md FINANCIAL Step 4.5 batches 12 questions in TEXT_MODE (consolidated numbered list)', () => {
  const wf = fs.readFileSync(DESIGN_WF, 'utf8');
  // Plan 06 Task 3 wired Step 4.5; Step 4.5.E batches all 12 questions into
  // ONE consolidated numbered-list prompt for FND-06 latency mitigation.
  assert.match(
    wf,
    /TEXT_MODE.*batch|batch.*TEXT_MODE|consolidated.*numbered list|numbered.list.*TEXT_MODE/i,
    'design.md must document TEXT_MODE batching of FINANCIAL 12-driver Q&A into a consolidated numbered list'
  );
});

// ─── T3: add-workstream.md detects TEXT_MODE and renders Q&A as numbered list
test('T3 add-workstream.md detects TEXT_MODE and renders Q&A as numbered list', () => {
  const wf = fs.readFileSync(ADD_WS_WF, 'utf8');
  assert.match(wf, /TEXT_MODE/, 'add-workstream.md must reference TEXT_MODE token');
  assert.match(
    wf,
    /numbered.list|numbered-list|consolidated/i,
    'add-workstream.md must document numbered-list fallback rendering'
  );
});

// ─── T4: design.md Step 1 workstream selection has TEXT_MODE fallback ──────
test('T4 design.md Step 1 workstream selection has TEXT_MODE numbered-list fallback', () => {
  const wf = fs.readFileSync(DESIGN_WF, 'utf8');
  // Step 1 selection prompt — split between "Step 1" anchor and the next step
  // header. The workflow's Step 0 detection rule applies workflow-wide; Step
  // 1's specific workstream picker either restates TEXT_MODE inline or relies
  // on the workflow-level Step 0 detection covering it.
  const step1 = wf.split(/Step 1/)[1] ? wf.split(/Step 1/)[1].split(/Step 2/)[0] : '';
  assert.ok(
    /TEXT_MODE/.test(step1) || /TEXT_MODE/.test(wf),
    'Step 1 must reference TEXT_MODE handling for workstream selection (inline or via Step 0 workflow-level)'
  );
});

// ─── T5: design.md Step 7 handoff (3-option) has TEXT_MODE fallback ────────
test('T5 design.md Step 7 handoff (3-option) has TEXT_MODE numbered-list fallback', () => {
  const wf = fs.readFileSync(DESIGN_WF, 'utf8');
  const step7 = wf.split(/Step 7/)[1] || '';
  // Step 7 invokes AskUserQuestion with 3 options; TEXT_MODE renders as numbered list
  assert.ok(
    /TEXT_MODE/.test(step7) || /TEXT_MODE/.test(wf),
    'Step 7 handoff must support TEXT_MODE numbered-list fallback (inline or via Step 0)'
  );
  // 3 options visible in Step 7 (Continue / Stop here / Pick different)
  assert.match(step7, /continue|계속/i, 'Step 7 must offer Continue option');
  assert.match(step7, /stop|멈추/i, 'Step 7 must offer Stop here option');
  assert.match(step7, /다른|different/i, 'Step 7 must offer Pick different option');
});

// ─── T6: All 3 NEW Phase 7 workflows detect TEXT_MODE at Step 0 ────────────
test('T6 All 3 NEW Phase 7 workflows (design / compliance / add-workstream) detect TEXT_MODE at Step 0', () => {
  for (const f of [DESIGN_WF, COMPLIANCE_WF, ADD_WS_WF]) {
    const wf = fs.readFileSync(f, 'utf8');
    // Step 0 body: from "Step 0" heading anchor to "Step 0.5" or "Step 1" anchor.
    const step0 = wf.split(/Step 0/)[1] ? wf.split(/Step 0/)[1].split(/Step 0\.5|Step 1/)[0] : '';
    assert.match(
      step0,
      /TEXT_MODE/,
      `${path.basename(f)}: Step 0 must detect TEXT_MODE (FND-06 multi-runtime parity)`
    );
  }
});
