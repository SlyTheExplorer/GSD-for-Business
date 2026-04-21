/**
 * brief-align-text-mode.test.cjs — Phase 4 Plan 04-06 Task 2 (File 1 of 2).
 *
 * Static markdown-parse assertion that brief/workflows/align-gate.md carries
 * the 3-path interrupt's FND-06 TEXT_MODE parity — i.e., every AskUserQuestion
 * block has an equivalent plain-text numbered-list fallback documented in the
 * same step body. Non-AskUserQuestion runtimes (Codex, Gemini CLI, OpenCode)
 * rely on this fallback; without it, the 3-path interrupt degrades silently.
 *
 * Scope boundaries:
 *   - This is a STATIC file parse — it does NOT runtime-spawn /brief-define
 *     under TEXT_MODE=true. Cross-runtime actual spawn is Phase 9 HRD-01
 *     smoke test.
 *   - Step 5A and Step 5B bodies are extracted via a widened regex
 *     `/^## Step 5A[:\- ]/` (char class tolerates colon / hyphen / space
 *     separators — defends against future em-dash separator renames).
 *   - Precondition `content.includes('## Step 5A')` runs BEFORE the regex
 *     extraction so a malformed file triggers a clear diagnostic, not a
 *     silent null.
 *   - D-07 "MANDATORY override reason" is locked in Step 6 (plan Task 2
 *     Test 3).
 *   - The no_hooks_assertion structural block (ROADMAP Phase 4 SC #3)
 *     is locked in Test 4.
 *
 * References:
 *   - 04-06-PLAN.md Task 2 (tests/brief-align-text-mode.test.cjs behaviors)
 *   - 04-CONTEXT.md D-06 (3-path interrupt Korean strings), D-07 (MANDATORY)
 *   - 04-RESEARCH.md §Architecture Patterns Pattern 3 (FND-06 TEXT_MODE parity)
 *   - brief/workflows/define.md Step 0 ("render as plain-text numbered list")
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');

// ─── extractStepBody ───────────────────────────────────────────────────────
// Returns the body of a `## Step X...` section (header line through the line
// just before the next `## Step ` heading). Used for Step 5A/5B/6 extraction.
//
// The caller must pre-verify the heading exists via a `content.includes`
// check so a missing heading produces an informative precondition failure
// rather than a silent null-return debugging rabbit hole (Pitfall #6
// fixture-shape regression mitigation).

function extractStepBody(content, stepHeadingRegex) {
  const lines = content.split('\n');
  const startIdx = lines.findIndex((l) => stepHeadingRegex.test(l));
  if (startIdx === -1) return null;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^## Step /.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join('\n');
}

// ─── Test 1: Step 5A — DRIFTED-objective 3-path + TEXT_MODE fallback ──────

test('brief/workflows/align-gate.md Step 5A contains D-06 Korean options + TEXT_MODE fallback note', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'brief/workflows/align-gate.md'),
    'utf-8',
  );
  assert.ok(
    content.includes('## Step 5A'),
    'precondition: Step 5A heading must exist in brief/workflows/align-gate.md',
  );
  const body = extractStepBody(content, /^## Step 5A[:\- ]/);
  assert.ok(
    body,
    'Step 5A body extraction failed — widened regex /^## Step 5A[:\\- ]/ returned null despite precondition. Investigate separator.',
  );
  // D-06 Korean option strings — verbatim from CONTEXT.md.
  assert.ok(
    body.includes('objective 수정하기'),
    `Step 5A missing D-06 option 1 Korean string 'objective 수정하기'. Body start: ${body.slice(0, 400)}`,
  );
  assert.ok(
    body.includes('이 output이 틀렸다, 다시 쓰기'),
    `Step 5A missing D-06 option 2 Korean string '이 output이 틀렸다, 다시 쓰기'.`,
  );
  assert.ok(
    body.includes('현재 상태 승인, 계속 진행'),
    `Step 5A missing D-06 option 3 Korean string '현재 상태 승인, 계속 진행'.`,
  );
  // FND-06 TEXT_MODE fallback note — one of the documented phrasings must
  // appear in the same step body. The phrasings enumerated here mirror the
  // brief/workflows/define.md Step 0 canonical text ("plain-text numbered
  // list") + shorter variants seen in the Phase 4 workflow markdown.
  assert.ok(
    /plain-text numbered list|numbered-list|numbered list|1\/2\/3/i.test(body),
    `Step 5A missing TEXT_MODE fallback note (FND-06 inheritance). ` +
      `Expected one of: 'plain-text numbered list' | 'numbered-list' | ` +
      `'numbered list' | '1/2/3'. Body start: ${body.slice(0, 500)}`,
  );
});

// ─── Test 2: Step 5B — DRIFTED-output 3-path + TEXT_MODE fallback ─────────

test('brief/workflows/align-gate.md Step 5B contains D-06 Korean options + TEXT_MODE fallback note', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'brief/workflows/align-gate.md'),
    'utf-8',
  );
  assert.ok(
    content.includes('## Step 5B'),
    'precondition: Step 5B heading must exist in brief/workflows/align-gate.md',
  );
  const body = extractStepBody(content, /^## Step 5B[:\- ]/);
  assert.ok(
    body,
    'Step 5B body extraction failed — widened regex /^## Step 5B[:\\- ]/ returned null despite precondition.',
  );
  // D-06 Korean option strings for the DRIFTED-output variant.
  assert.ok(
    body.includes('output 다시 쓰기'),
    `Step 5B missing D-06 option 1 Korean string 'output 다시 쓰기'. Body start: ${body.slice(0, 400)}`,
  );
  assert.ok(
    body.includes('output을 수동으로 편집'),
    `Step 5B missing D-06 option 2 Korean string 'output을 수동으로 편집'.`,
  );
  assert.ok(
    body.includes('현재 상태 승인, 계속 진행'),
    `Step 5B missing D-06 option 3 Korean string '현재 상태 승인, 계속 진행'.`,
  );
  assert.ok(
    /plain-text numbered list|numbered-list|numbered list|1\/2\/3/i.test(body),
    `Step 5B missing TEXT_MODE fallback note (FND-06 inheritance). Body start: ${body.slice(0, 500)}`,
  );
});

// ─── Test 3: Step 6 — MANDATORY override reason (D-07) ────────────────────

test('brief/workflows/align-gate.md Step 6 marks override reason as MANDATORY (D-07)', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'brief/workflows/align-gate.md'),
    'utf-8',
  );
  assert.ok(
    content.includes('## Step 6'),
    'precondition: Step 6 heading must exist in brief/workflows/align-gate.md',
  );
  const body = extractStepBody(content, /^## Step 6[:\- ]/);
  assert.ok(body, 'Step 6 body extraction failed — investigate separator.');
  // D-07: override reason must be REQUIRED / MANDATORY / non-empty / not optional
  // per 04-CONTEXT.md: "typed justification is REQUIRED (not optional)".
  assert.ok(
    /MANDATORY|required|non-empty|not optional|mandatory/i.test(body),
    `Step 6 must mark override reason as MANDATORY per D-07. ` +
      `Expected one of: 'MANDATORY' | 'required' | 'non-empty' | 'not optional'. ` +
      `Body start: ${body.slice(0, 600)}`,
  );
});

// ─── Test 4: no_hooks_assertion block present (ROADMAP SC #3) ─────────────
// The workflow markdown declares, in a structural block, that ALIGN is
// invoked ONLY from orchestrator markdown — never from PostToolUse /
// SubagentStop / any hook. This test locks the presence of that block and
// the two load-bearing phrases inside it. Pairs with the hooks/ directory
// grep in tests/brief-align-no-hook.test.cjs.

test('brief/workflows/align-gate.md contains no_hooks_assertion block (ROADMAP Phase 4 SC #3)', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'brief/workflows/align-gate.md'),
    'utf-8',
  );
  assert.match(
    content,
    /no_hooks_assertion/,
    'no_hooks_assertion block must be present (ROADMAP SC #3).',
  );
  // At least one of the three load-bearing phrasings must appear INSIDE
  // the block body to confirm the block is not just an empty shell.
  const blockMatch = content.match(/<no_hooks_assertion>([\s\S]*?)<\/no_hooks_assertion>/);
  assert.ok(
    blockMatch,
    '<no_hooks_assertion>...</no_hooks_assertion> wrapping tags must exist.',
  );
  const blockBody = blockMatch[1];
  assert.match(
    blockBody,
    /NO PostToolUse|not via hook|explicitly from orchestrator/i,
    `no_hooks_assertion block must document the "no-hook" invariant. ` +
      `Body start: ${blockBody.slice(0, 400)}`,
  );
});
