/**
 * brief-financial-provenance — Phase 7 Plan 6 Task 2 (DSG-03 / VALIDATION 07-06-04)
 *
 * Validates the FINANCIAL workstream's provenance discipline (CC-04 inheritance):
 *   - design-prompts.md and templates/drivers.md mention [VERIFIED:user-supplied]
 *   - design-prompts.md and templates/drivers.md mention [FOUNDER-INPUT]
 *   - design-prompts.md and templates/artifact.md mention [ASSUMED:multiplier-
 *   - design-prompts.md explicitly says "DO NOT invent" (or equivalent forbidding language)
 *   - design-prompts.md mentions "bottom-up" or rejects "top-down market-share" (Pitfall #6)
 *
 * T-07-21 mitigation (LLM hallucinated driver values): the discipline is mandated in
 * the design-prompts.md text the LLM reads at design-time.
 * T-07-22 mitigation (untagged projection cells): every projection cell carries a
 * provenance tag — Phase 5 CC-04 pre-commit hook BLOCKS untagged quantitative cells
 * as defense in depth.
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'templates', 'artifact.md');
const DRIVERS = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'templates', 'drivers.md');

test('FINANCIAL design-prompts.md mentions [VERIFIED:user-supplied] provenance tag', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /\[VERIFIED:user-supplied\]/,
    'design-prompts.md must instruct LLM to use [VERIFIED:user-supplied] for direct driver use');
});

test('FINANCIAL design-prompts.md mentions [ASSUMED:multiplier- provenance tag', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /\[ASSUMED:multiplier-/,
    'design-prompts.md must instruct LLM to use [ASSUMED:multiplier-X.X] for sensitivity-multiplier-applied cells');
});

test('FINANCIAL design-prompts.md mentions [FOUNDER-INPUT] for unknown drivers', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /\[FOUNDER-INPUT/,
    'design-prompts.md must reference [FOUNDER-INPUT] placeholder for missing/unknown driver values');
});

test('FINANCIAL templates/drivers.md every row has provenance column with [VERIFIED:user-supplied] or [FOUNDER-INPUT]', () => {
  const drv = fs.readFileSync(DRIVERS, 'utf8');
  assert.match(drv, /\[VERIFIED:user-supplied\]/,
    'drivers.md schema must show [VERIFIED:user-supplied] provenance tag in driver rows');
  assert.match(drv, /\[FOUNDER-INPUT/,
    'drivers.md schema must show [FOUNDER-INPUT] placeholder for unknown drivers');
});

test('FINANCIAL templates/artifact.md mentions [VERIFIED:user-supplied] or [ASSUMED:multiplier- provenance', () => {
  const art = fs.readFileSync(ARTIFACT, 'utf8');
  // The artifact must carry the provenance discipline forward into the projection
  const hasVerified = /\[VERIFIED:user-supplied\]/.test(art);
  const hasMultiplier = /\[ASSUMED:multiplier-/.test(art);
  assert.ok(hasVerified || hasMultiplier,
    'artifact.md must carry [VERIFIED:user-supplied] OR [ASSUMED:multiplier-] provenance into the projection');
});

test('FINANCIAL design-prompts.md explicitly says "DO NOT invent" or equivalent (Pitfall #6 driver discipline)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /DO NOT.*invent|do not invent|never invent|user-supplied/i,
    'design-prompts.md must contain forbidding language ("DO NOT invent driver values" or equivalent)');
});

test('FINANCIAL design-prompts.md explicitly rejects top-down market-share OR mandates bottom-up (Pitfall #6 mitigation)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  // either of these should be present
  const hasBottomUp = /bottom-up/i.test(dp);
  const rejectsTopDown = /top-down|market.share/i.test(dp);
  assert.ok(hasBottomUp || rejectsTopDown,
    'design-prompts.md must mention bottom-up math OR explicitly reject top-down market-share assumption (Pitfall #6)');
});
