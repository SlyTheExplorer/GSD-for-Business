/**
 * brief-context-inject-roundtrip.test.cjs — Phase 5 Plan 05-01 coverage.
 *
 * Exercises the exported primitive of brief/bin/lib/context-inject.cjs:
 *   - buildBusinessContext({ cwd })   (D-14 cross-cutting primitive)
 *   - COMPLIANCE_PACK_TO_REFERENCE    (frozen pack → primer-path map)
 *
 * 5 tests covering:
 *   1. KR/B2B/fintech fixture — language=ko, formal tone, PIPA+ISMS-P reading list.
 *   2. Global/B2C/consumer fixture — language=en, direct tone, empty reading list.
 *   3. Two-consumer parity — promptBlock + audienceDefaults derived from same inputs.
 *   4. Missing config.json — safe fallback (null/empty; en/b2b-default audience).
 *   5. Malformed config.json — safe fallback identical to missing (no throw).
 *
 * Zero-dep: node:test + node:assert + node:fs + node:os + node:path only.
 * Per-test tmp cwd via mkdtempSync to isolate fixtures (mirrors Phase 4
 * tests/brief-align-primitives.test.cjs pattern).
 *
 * References:
 *   - .planning/phases/05-discover-parallel-research-with-provenance-audience-context-injection/05-01-PLAN.md Task 2 behaviors
 *   - .planning/phases/05-discover-parallel-research-with-provenance-audience-context-injection/05-CONTEXT.md D-10, D-13, D-14
 *   - .planning/phases/05-discover-parallel-research-with-provenance-audience-context-injection/05-VALIDATION.md test ID 5-01-01
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  buildBusinessContext,
  COMPLIANCE_PACK_TO_REFERENCE,
} = require('../brief/bin/lib/context-inject.cjs');

const FIXTURES = path.join(__dirname, 'fixtures', 'context-inject');

// ─── Helpers ───────────────────────────────────────────────────────────────

function setupTmp(configSrc, objectivesSrc) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-ctx-'));
  const planning = path.join(tmp, '.planning');
  fs.mkdirSync(planning, { recursive: true });
  if (configSrc) {
    fs.copyFileSync(path.join(FIXTURES, configSrc), path.join(planning, 'config.json'));
  }
  if (objectivesSrc) {
    fs.copyFileSync(path.join(FIXTURES, objectivesSrc), path.join(planning, 'OBJECTIVES.md'));
  }
  return tmp;
}

// ─── Test 1: KR/B2B/fintech fixture ────────────────────────────────────────

test('KR/B2B/fintech: language=ko, formal tone, required_reading includes PIPA+ISMS-P', () => {
  const cwd = setupTmp('config-kr-b2b.json', 'objectives-kr-b2b-fintech.md');
  const ctx = buildBusinessContext({ cwd });

  assert.equal(ctx.language, 'ko');
  assert.equal(ctx.korea_signal, true);
  assert.equal(ctx.business_model, 'b2b');
  assert.equal(ctx.region, 'kr');
  assert.deepEqual(ctx.compliance_packs, ['PIPA', 'ISMS-P']);

  // audience_policy passed through from config.json
  assert.ok(ctx.audience_policy);
  assert.equal(ctx.audience_policy.default, 'internal');
  assert.deepEqual(ctx.audience_policy.permitted, ['internal', 'partner', 'external']);

  // D-10 auto-populated defaults for b2b
  assert.equal(ctx.audienceDefaults['audience.role'], 'planner');
  assert.equal(ctx.audienceDefaults['voice.tone'], 'formal');
  assert.equal(ctx.audienceDefaults['voice.perspective'], 'first-person-plural');

  // Compliance-pack primers auto-attached via frozen map
  assert.ok(ctx.requiredReading.includes(COMPLIANCE_PACK_TO_REFERENCE['PIPA']));
  assert.ok(ctx.requiredReading.includes(COMPLIANCE_PACK_TO_REFERENCE['ISMS-P']));
  assert.equal(ctx.requiredReading.length, 2);

  // Prompt block contains expected XML shape + Korean language tag
  assert.match(ctx.promptBlock, /<business_context>/);
  assert.match(ctx.promptBlock, /<\/business_context>/);
  assert.match(ctx.promptBlock, /<language>ko<\/language>/);
  assert.match(ctx.promptBlock, /<business_model>b2b<\/business_model>/);
  assert.match(ctx.promptBlock, /<region>kr<\/region>/);
  assert.match(ctx.promptBlock, /<pack>PIPA<\/pack>/);
  assert.match(ctx.promptBlock, /<pack>ISMS-P<\/pack>/);
});

// ─── Test 2: Global/B2C/consumer fixture ───────────────────────────────────

test('Global/B2C/consumer: language=en, direct tone, required_reading empty', () => {
  const cwd = setupTmp('config-global-b2c.json', 'objectives-global-b2c-consumer.md');
  const ctx = buildBusinessContext({ cwd });

  assert.equal(ctx.language, 'en');
  assert.equal(ctx.korea_signal, false);
  assert.equal(ctx.business_model, 'b2c');
  assert.equal(ctx.region, 'us');
  assert.deepEqual(ctx.compliance_packs, []);
  assert.deepEqual(ctx.requiredReading, []);

  // D-10 auto-populated defaults for b2c
  assert.equal(ctx.audienceDefaults['voice.tone'], 'direct');
  assert.equal(ctx.audienceDefaults['voice.perspective'], 'first-person-plural');

  // Prompt block language tag reflects EN
  assert.match(ctx.promptBlock, /<language>en<\/language>/);
  // Empty compliance/reading render as self-closing comment (no <pack> tags)
  assert.doesNotMatch(ctx.promptBlock, /<pack>/);
  assert.doesNotMatch(ctx.promptBlock, /<file>/);
});

// ─── Test 3: Two-consumer parity ───────────────────────────────────────────

test('Two-consumer parity: promptBlock and audienceDefaults derived from same underlying inputs', () => {
  const cwd = setupTmp('config-kr-b2b.json', 'objectives-kr-b2b-fintech.md');
  const ctx1 = buildBusinessContext({ cwd });
  const ctx2 = buildBusinessContext({ cwd });

  // Idempotent: promptBlock stable across calls (same fixture, same cwd).
  assert.equal(ctx1.promptBlock, ctx2.promptBlock);

  // Underlying values baked into promptBlock match the shared context source.
  assert.match(
    ctx1.promptBlock,
    new RegExp(`<business_model>${ctx1.business_model}</business_model>`),
  );
  assert.match(
    ctx1.promptBlock,
    new RegExp(`<region>${ctx1.region}</region>`),
  );

  // Two-consumer parity: the same ctx1 feeds both Task-spawn (promptBlock)
  // AND AUDIENCE frontmatter seed (audienceDefaults). Both calls receive the
  // same business_model / region / language — no drift between consumer paths.
  assert.equal(ctx1.business_model, ctx2.business_model);
  assert.equal(ctx1.region, ctx2.region);
  assert.equal(ctx1.language, ctx2.language);
  assert.deepEqual(ctx1.audienceDefaults, ctx2.audienceDefaults);
  assert.deepEqual(ctx1.requiredReading, ctx2.requiredReading);
});

// ─── Test 4: Missing config.json ───────────────────────────────────────────

test('Missing config.json: fallback to null/empty with en/b2b-default audience', () => {
  const cwd = setupTmp(null, null);
  const ctx = buildBusinessContext({ cwd });

  assert.equal(ctx.business_model, null);
  assert.equal(ctx.region, null);
  assert.deepEqual(ctx.compliance_packs, []);
  assert.equal(ctx.korea_signal, false);
  assert.equal(ctx.language, 'en');
  assert.deepEqual(ctx.requiredReading, []);
  // Default bucket = formal/first-person-plural (b2b-style)
  assert.equal(ctx.audienceDefaults['voice.tone'], 'formal');
  assert.equal(ctx.audienceDefaults['voice.perspective'], 'first-person-plural');

  // Prompt block still emits the expected skeleton with empty inners.
  assert.match(ctx.promptBlock, /<business_context>/);
  assert.match(ctx.promptBlock, /<language>en<\/language>/);
  // Empty tags render with the `<!-- none -->` placeholder comment.
  assert.match(ctx.promptBlock, /<compliance_packs>[\s\S]*<!-- none -->[\s\S]*<\/compliance_packs>/);
  assert.match(ctx.promptBlock, /<required_reading>[\s\S]*<!-- none -->[\s\S]*<\/required_reading>/);
});

// ─── Test 5: Malformed config.json ─────────────────────────────────────────

test('Malformed config.json: no throw, same fallback as missing', () => {
  const cwd = setupTmp(null, null);
  fs.writeFileSync(path.join(cwd, '.planning', 'config.json'), '{broken json');
  // MUST NOT throw — tolerant parse returns empty brief namespace.
  const ctx = buildBusinessContext({ cwd });
  assert.equal(ctx.business_model, null);
  assert.equal(ctx.region, null);
  assert.equal(ctx.language, 'en');
  assert.deepEqual(ctx.compliance_packs, []);
  assert.deepEqual(ctx.requiredReading, []);
});
