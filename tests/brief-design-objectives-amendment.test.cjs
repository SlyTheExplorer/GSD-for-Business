/**
 * brief-design-objectives-amendment.test.cjs — Plan 07-03 Task 3 (Wave 0).
 *
 * OBJECTIVES.md insufficiency directive routing enforcement (D-06).
 * brief/workflows/design.md Step 2 MUST:
 *   1. Emit a `/brief-define --amend` directive when OBJECTIVES.md lacks the
 *      workstream-relevant mutable_hypotheses fields.
 *   2. NOT push a return-stack frame for the DEFINE direction. The return-
 *      stack is DISCOVER↔DESIGN bidirectional only; DESIGN→DEFINE is
 *      intentionally not supported (D-06 lock).
 *   3. Route the user to Phase 3 Mode B (`/brief-define --amend`) rather
 *      than attempting an in-place fix.
 *
 * Threat mitigations:
 *   - T-07-08 (Elevation of Privilege — OBJECTIVES insufficiency handler):
 *     this test fails if Step 2 ever attempts a DESIGN→DEFINE return-stack
 *     push, which would conflate two return-stack disciplines and create a
 *     privilege-elevation pathway between phases.
 *
 * References:
 *   - 07-03-PLAN.md Task 3 (test source)
 *   - 07-CONTEXT.md D-06 (OBJECTIVES amendment routing — no return-stack push)
 *   - 06-CONTEXT.md D-02 (return-stack is DISCOVER↔DESIGN only)
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const WORKFLOW = path.join(ROOT, 'brief/workflows/design.md');
const wf = fs.readFileSync(WORKFLOW, 'utf8');

test('OBJECTIVES insufficiency emits /brief-define --amend directive (D-06)', () => {
  assert.match(
    wf,
    /\/brief-define --amend/,
    'design.md must emit /brief-define --amend directive on OBJECTIVES insufficiency',
  );
  assert.match(
    wf,
    /paused|insufficiency/i,
    'design.md must use paused-status or insufficiency vocabulary on OBJECTIVES gap',
  );
});

test('design.md does NOT push return-stack frame for OBJECTIVES gap (D-06)', () => {
  // The DESIGN→DEFINE direction is explicitly NOT supported by the
  // return-stack. Find Step 2 (OBJECTIVES handling) and verify there is
  // no `pushReturnFrame` call NOR `push.*return_stack.*DEFINE` pattern in
  // the 500 chars following. The return-stack is DISCOVER↔DESIGN only.
  assert.ok(
    !/Step 2[\s\S]{0,500}pushReturnFrame|Step 2[\s\S]{0,500}push.*return_stack.*DEFINE/i.test(wf),
    'D-06: OBJECTIVES insufficiency must NOT push DEFINE-bound return-stack frame',
  );
});

test('design.md OBJECTIVES gap routes user to Phase 3 Mode B', () => {
  // The user-facing route on OBJECTIVES insufficiency is the same as the
  // DEFINE phase's amendment mode (Mode B): `/brief-define --amend`.
  assert.match(
    wf,
    /\/brief-define --amend/,
    'design.md OBJECTIVES gap must route to /brief-define --amend (Phase 3 Mode B)',
  );
});
