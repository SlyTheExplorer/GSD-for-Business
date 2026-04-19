'use strict';

/**
 * Stale-anchor 48h interrupt (DEF-06, D-13, Plan 03-06).
 *
 * Positive: OBJECTIVES.md mtime >48h + `/brief-discover` (qualifying entry)
 *   → 3-option Korean prompt surfaced BEFORE the Phase 5 placeholder.
 *   W-8 ordering: idxPrompt < idxPlaceholder in combined stdout+stderr.
 *
 * Negative 1 — Pitfall 6 scope guard:
 *   49h-stale + `/brief-status` MUST NOT surface `잠시 검토에`.
 *
 * Negative 2 — freshness guard:
 *   Fresh OBJECTIVES.md + `/brief-discover` MUST NOT surface `잠시 검토에`.
 *
 * Unit — shouldStaleAnchorFire entry-point gating:
 *   discover-entry → fire:true on 49h-stale file
 *   define-amend-entry → fire:true on 49h-stale file
 *   status-entry / help-entry / mid-workflow → fire:false
 *     (with reason matching /entry-not-qualifying/)
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup, runGsdTools } = require('./helpers.cjs');
const objectives = require('../brief/bin/lib/objectives.cjs');
const define = require('../brief/bin/lib/define.cjs');

function seedValidObjectives(cwd) {
  objectives.writeObjectivesMd(cwd, {
    frontmatter: {
      brief_objectives_version: '1.0',
      status: 'ready',
      mode: 'greenfield',
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
      'creator-identity': 'seed',
      'core-value': 'seed',
      'problem-statement': 'seed',
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA'],
    },
    body: {
      immutable: {
        'creator-identity': 'seed',
        'core-value': 'seed',
        'problem-statement': 'seed',
      },
      mutable: {},
    },
  }, { unlockIntent: false });
}

function backdateMtime(cwd, hoursAgo) {
  const objPath = path.join(cwd, '.planning', 'OBJECTIVES.md');
  const pastMs = Date.now() - (hoursAgo * 60 * 60 * 1000);
  fs.utimesSync(objPath, new Date(pastMs), new Date(pastMs));
}

describe('Stale-anchor 48h notice (DEF-06, D-13)', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => { cleanup(tmpDir); });

  test('POSITIVE — /brief-discover on 49h-stale OBJECTIVES.md surfaces 3-option prompt (W-8 ordering enforced)', () => {
    seedValidObjectives(tmpDir);
    backdateMtime(tmpDir, 49);
    const r = runGsdTools(['discover'], tmpDir);
    const combined = (r.output || '') + (r.error || '');

    assert.match(combined, /48시간/, '48h threshold surfaced');
    assert.match(combined, /잠시 검토에/, 'option 1 present');
    assert.match(combined, /현재 OBJECTIVES를 보고/, 'option 2 present');
    assert.match(combined, /이제 승인, 빠르게 진행/, 'option 3 present');

    // W-8 ordering: stale-anchor prompt MUST render BEFORE Phase 5 placeholder.
    const idxPrompt = combined.indexOf('48시간');
    const idxPlaceholder = combined.indexOf('Phase 5');
    assert.ok(idxPrompt >= 0 && idxPlaceholder >= 0,
      'both markers present in combined output');
    assert.ok(idxPrompt < idxPlaceholder,
      `W-8: stale-anchor prompt (idx=${idxPrompt}) must render BEFORE Phase 5 placeholder (idx=${idxPlaceholder})`);
  });

  test('NEGATIVE 1 — /brief-status on 49h-stale OBJECTIVES.md does NOT trigger (D-13 scope, Pitfall 6)', () => {
    seedValidObjectives(tmpDir);
    backdateMtime(tmpDir, 49);
    const r = runGsdTools(['status'], tmpDir);
    const combined = (r.output || '') + (r.error || '');
    assert.doesNotMatch(combined, /잠시 검토에/,
      '/brief-status MUST NOT fire stale-anchor interrupt (Pitfall 6 train-to-ignore guard)');
  });

  test('NEGATIVE 2 — fresh OBJECTIVES.md + /brief-discover does NOT trigger', () => {
    seedValidObjectives(tmpDir);
    // intentional: no backdate — file mtime is seconds old
    const r = runGsdTools(['discover'], tmpDir);
    const combined = (r.output || '') + (r.error || '');
    assert.doesNotMatch(combined, /잠시 검토에/, 'fresh OBJECTIVES.md → no interrupt');
    assert.match(combined, /Phase 5/, 'Phase 5 placeholder still emitted');
  });

  test('shouldStaleAnchorFire direct-call — entry-point gating (Pitfall 6 unit)', () => {
    seedValidObjectives(tmpDir);
    backdateMtime(tmpDir, 49);

    const yes = define.shouldStaleAnchorFire(tmpDir, 'discover-entry');
    assert.strictEqual(yes.fire, true, 'discover-entry fires on 49h-stale');
    assert.ok(yes.age_hours >= 48, `age_hours (${yes.age_hours}) >= 48`);

    const amend = define.shouldStaleAnchorFire(tmpDir, 'define-amend-entry');
    assert.strictEqual(amend.fire, true, 'define-amend-entry fires on 49h-stale');

    const no1 = define.shouldStaleAnchorFire(tmpDir, 'status-entry');
    assert.strictEqual(no1.fire, false, 'status-entry does NOT fire');
    assert.match(no1.reason || '', /entry-not-qualifying/,
      'status-entry reason is entry-not-qualifying');

    const no2 = define.shouldStaleAnchorFire(tmpDir, 'mid-workflow');
    assert.strictEqual(no2.fire, false, 'mid-workflow does NOT fire');

    const no3 = define.shouldStaleAnchorFire(tmpDir, 'help-entry');
    assert.strictEqual(no3.fire, false, 'help-entry does NOT fire');
  });
});
