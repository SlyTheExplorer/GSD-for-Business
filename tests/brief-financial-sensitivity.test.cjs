/**
 * brief-financial-sensitivity — Phase 7 Plan 6 Task 2 (DSG-03 / VALIDATION 07-06-05)
 *
 * Validates the FINANCIAL workstream's bear/base/bull sensitivity discipline (D-15):
 *   - design-prompts.md OR templates/drivers.md OR templates/artifact.md contains literal
 *     0.7, 1.0, 1.3 multipliers (bear/base/bull bands)
 *   - design-prompts.md mentions "bear" AND "base" AND "bull" scenario keywords
 *   - design-prompts.md explains COSTS multiplier inversion (×1.3 in bear; ×0.7 in bull)
 *
 * T-07-23 mitigation: the bear/base/bull bands are part of the design-prompts text the
 * LLM reads at design-time. Without the inversion-on-COSTS rule, "bear" mathematically
 * becomes a noop (0.7×Revenue + 0.7×Costs ≈ original burn ratio); the inversion makes
 * the scenario semantically meaningful.
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'templates', 'artifact.md');
const DRIVERS = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'templates', 'drivers.md');

test('FINANCIAL bear/base/bull multipliers (0.7 / 1.0 / 1.3) appear across design-prompts.md OR drivers.md OR artifact.md', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  const drv = fs.readFileSync(DRIVERS, 'utf8');
  const art = fs.readFileSync(ARTIFACT, 'utf8');
  const all = [dp, drv, art].join('\n---\n');
  assert.match(all, /0\.7/, 'bear multiplier 0.7 missing across FINANCIAL bundle files');
  assert.match(all, /1\.0/, 'base multiplier 1.0 missing across FINANCIAL bundle files');
  assert.match(all, /1\.3/, 'bull multiplier 1.3 missing across FINANCIAL bundle files');
});

test('FINANCIAL design-prompts.md mentions "bear" AND "base" AND "bull" scenario keywords', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /bear/i, 'design-prompts.md missing "bear" keyword');
  assert.match(dp, /base/i, 'design-prompts.md missing "base" keyword');
  assert.match(dp, /bull/i, 'design-prompts.md missing "bull" keyword');
});

test('FINANCIAL design-prompts.md explains COSTS multiplier inversion (bear ×1.3 costs / bull ×0.7 costs)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  // The inversion rule: in bear, costs go UP; in bull, costs go DOWN.
  // Loose match: both "1.3" and "bear" must appear in proximity to "cost"
  // We accept either explicit inversion phrasing or proximity.
  const hasInversion =
    /COST.*1\.3|1\.3.*COST|bear.*cost.*1\.3|cost.*bear.*1\.3|exception.*COST|cost.*exception|inver/i.test(dp);
  assert.ok(hasInversion,
    'design-prompts.md must explain that COSTS multiplier inverts in bear (×1.3) and bull (×0.7) scenarios');
});

test('FINANCIAL templates/drivers.md "Sensitivity bands" section enumerates the 3 bands', () => {
  const drv = fs.readFileSync(DRIVERS, 'utf8');
  assert.match(drv, /Sensitivity bands/i, 'drivers.md must have "Sensitivity bands" section');
  // The 3 multipliers must be enumerated
  assert.match(drv, /Bear.*0\.7/i, 'drivers.md Sensitivity bands must enumerate "Bear: × 0.7"');
  assert.match(drv, /Base.*1\.0/i, 'drivers.md Sensitivity bands must enumerate "Base: × 1.0"');
  assert.match(drv, /Bull.*1\.3/i, 'drivers.md Sensitivity bands must enumerate "Bull: × 1.3"');
});
