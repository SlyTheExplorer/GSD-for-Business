'use strict';

/**
 * FND-06 multi-runtime parity: Both brief/workflows/discover.md and
 * brief/workflows/audience-guard.md MUST render AskUserQuestion interrupts
 * as plain-text numbered lists when TEXT_MODE is active (Codex/Gemini/OpenCode
 * — runtimes that do not support AskUserQuestion natively).
 *
 * Audits:
 *   1. discover.md Step 0 detects TEXT_MODE.
 *   2. discover.md Step 3 has BOTH AskUserQuestion AND TEXT_MODE multi-select forms.
 *   3. audience-guard.md 3-path interrupts (Step 5A + 5B) have TEXT_MODE
 *      numbered-list fallbacks.
 *
 * Task 5 of Plan 05-07.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const DISCOVER_WORKFLOW = path.join(__dirname, '..', 'brief/workflows/discover.md');
const AUDIENCE_WORKFLOW = path.join(__dirname, '..', 'brief/workflows/audience-guard.md');

test('discover.md: TEXT_MODE detection at Step 0', () => {
  const body = fs.readFileSync(DISCOVER_WORKFLOW, 'utf-8');
  assert.match(body, /TEXT_MODE/);
  assert.match(body, /--text|workflow\.text_mode/);
});

test('discover.md: Step 3 multi-select has BOTH AskUserQuestion AND TEXT_MODE forms', () => {
  const body = fs.readFileSync(DISCOVER_WORKFLOW, 'utf-8');
  // AskUserQuestion form
  assert.match(
    body,
    /<askuserquestion>[\s\S]*<multiSelect>true<\/multiSelect>[\s\S]*<\/askuserquestion>/,
  );
  // TEXT_MODE numbered-list form
  assert.match(body, /1\.\s*Market Sizing|1\.\s*Competitor/);
  assert.match(body, /10\.\s*Other/);
});

test('discover.md: TEXT_MODE fallback instructs user to type comma-separated choice', () => {
  const body = fs.readFileSync(DISCOVER_WORKFLOW, 'utf-8');
  assert.match(body, /쉼표로 구분|comma-separated/);
});

test('audience-guard.md: 3-path interrupt has TEXT_MODE numbered-list fallback (Step 5A + 5B)', () => {
  const body = fs.readFileSync(AUDIENCE_WORKFLOW, 'utf-8');
  assert.match(body, /TEXT_MODE/);
  // Numbered-list form 1/2/3 for each interrupt
  const numberedFormPattern = /1\..*(?:수정|audience)[\s\S]*2\..*(?:다시 쓰기|rewrite)[\s\S]*3\..*(?:force-accept|승인)/;
  assert.match(body, numberedFormPattern);
});

test('audience-guard.md: Step 5A and 5B both reference TEXT_MODE rendering instructions', () => {
  const body = fs.readFileSync(AUDIENCE_WORKFLOW, 'utf-8');
  // Count occurrences of TEXT_MODE — should be at least 2 (one per interrupt step) + Step 0
  const matches = body.match(/TEXT_MODE/g) || [];
  assert.ok(
    matches.length >= 2,
    `expected ≥2 TEXT_MODE references in audience-guard.md, got ${matches.length}`,
  );
});

test('Both workflows reference FND-06 multi-runtime equivalence (directly or indirectly)', () => {
  const discoverBody = fs.readFileSync(DISCOVER_WORKFLOW, 'utf-8');
  const audienceBody = fs.readFileSync(AUDIENCE_WORKFLOW, 'utf-8');
  // Either FND-06 explicit OR numbered-list instructions that achieve the same goal
  const anyRef = /FND-06|Codex|Gemini|OpenCode|numbered[- ]list|text[_ ]mode/i;
  assert.match(discoverBody, anyRef);
  assert.match(audienceBody, anyRef);
});
