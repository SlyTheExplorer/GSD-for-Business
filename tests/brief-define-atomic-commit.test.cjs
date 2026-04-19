'use strict';

/**
 * Atomic 3-artifact commit for `/brief-define apply`.
 *
 * Pitfall #3 mitigation (CONTEXT.md code_context Risk Notes):
 *   Phase 3 touches three separate on-disk artifacts in one flow —
 *   OBJECTIVES.md + config.json + STATE.md. If a write fails mid-transaction,
 *   the canary intent breaks (/brief-discover block-gate later mis-reads
 *   the partial write). The atomic boundary is implemented via
 *   performAtomicCommit which invokes `brief-tools commit --files` AFTER all
 *   three atomicWriteFileSync calls have succeeded; on intermediate
 *   exception the caller unlinks any partially-written OBJECTIVES.md
 *   BEFORE propagating the error.
 *
 * B-1 fix: every git assertion uses direct `execFileSync('git', ...)` —
 * brief-tools.cjs has no `case 'shell':` dispatcher, so attempting to
 * proxy git through runGsdTools is a false path.
 *
 * W-2 fix: primary negative test is a deterministic stub-throw — swap
 * writeConfigBrief in require-cache to throw and assert rollback invariants.
 * The secondary chmod-based test is opportunistic and silently skips on
 * filesystems that ignore the read-only bit (root / some CI).
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('node:child_process');
const {
  createTempGitProjectWithConfig,
  cleanup,
  runGsdTools,
} = require('./helpers.cjs');

function gitLogFiles(cwd) {
  // B-1: direct execFileSync — no shell dispatcher exists.
  const out = execFileSync('git', ['log', '-1', '--name-only', '--format='], {
    cwd,
    encoding: 'utf-8',
  });
  return out.trim().split('\n').filter(Boolean).sort();
}

function gitLogSubject(cwd) {
  return execFileSync('git', ['log', '-1', '--format=%s'], {
    cwd,
    encoding: 'utf-8',
  }).trim();
}

describe('Atomic 3-artifact commit (Pitfall 3 mitigation, DEF-04 supporting)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempGitProjectWithConfig();
  });
  afterEach(() => {
    cleanup(tmpDir);
  });

  test('Successful apply produces exactly 1 commit touching OBJECTIVES.md + config.json + STATE.md', () => {
    const r = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpDir,
    );
    assert.ok(r.success, `define apply failed: ${r.error || r.output}`);

    const files = gitLogFiles(tmpDir);
    assert.deepStrictEqual(
      files,
      [
        '.planning/OBJECTIVES.md',
        '.planning/STATE.md',
        '.planning/config.json',
      ].sort(),
      'exactly 3 planning files in single atomic commit',
    );
  });

  test('W-2 primary — Rollback on deterministic stub-throw: writeConfigBrief throws → no OBJECTIVES.md on disk + no new commit', () => {
    const defineModulePath = require.resolve('../brief/bin/lib/define.cjs');
    // Clear cache so our patched version takes hold just for this test.
    delete require.cache[defineModulePath];
    const define = require(defineModulePath);
    const originalWriteConfigBrief = define.writeConfigBrief;

    define.writeConfigBrief = () => {
      throw new Error('SIMULATED_CONFIG_WRITE_FAILURE');
    };

    try {
      let threw = false;
      try {
        define.applyFromFixture(tmpDir, 'korea-b2c-persona.json');
      } catch (e) {
        threw = true;
        assert.match(e.message, /SIMULATED_CONFIG_WRITE_FAILURE/);
      }
      assert.ok(threw, 'applyFromFixture propagated the stubbed error');

      // Rollback invariant: OBJECTIVES.md must NOT exist on disk.
      const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
      assert.ok(
        !fs.existsSync(objPath),
        'OBJECTIVES.md rolled back after writeConfigBrief stub threw',
      );

      // HEAD should be the seed commit from createTempGitProjectWithConfig,
      // never a DEFINE greenfield commit.
      const subject = gitLogSubject(tmpDir);
      assert.doesNotMatch(
        subject,
        /DEFINE greenfield/,
        'no DEFINE commit landed on HEAD (rollback occurred before performAtomicCommit)',
      );
    } finally {
      define.writeConfigBrief = originalWriteConfigBrief;
      // Wipe cache so the next test gets a fresh module.
      delete require.cache[defineModulePath];
    }
  });

  test('W-2 secondary — chmod-based rollback (may skip on filesystems that ignore read-only bit)', () => {
    // Opportunistic second pass — triggers the rollback via filesystem
    // permission denial rather than stub-throw. Skips silently on any
    // filesystem where atomicWriteFileSync can still overwrite a 0o444
    // target (macOS/Linux allow rename-over-readonly when the parent dir
    // is writable, Docker-as-root bypasses mode bits entirely, Windows
    // treats chmod as a best-effort attribute). The W-2 primary test is
    // the deterministic guarantor; this secondary exists only to catch
    // regressions on filesystems that DO honor the bit.
    const configPath = path.join(tmpDir, '.planning', 'config.json');
    const ATOMIC_WRITE = require('../brief/bin/lib/core.cjs').atomicWriteFileSync;

    try {
      fs.chmodSync(configPath, 0o444);
    } catch (_) {
      return; // chmod unsupported — skip silently
    }

    // Probe whether THIS filesystem denies overwrite via
    // atomicWriteFileSync specifically (not just writeFileSync). We don't
    // care about the success mode — if the probe either writes or throws
    // silently via the fallback, the secondary test cannot distinguish
    // real denial from rename-over-readonly tolerance.
    let writeableViaAtomic = false;
    try {
      ATOMIC_WRITE(configPath, '{"probe":1}');
      writeableViaAtomic = true;
    } catch (_) {
      /* expected when chmod bits block the final rename */
    }

    if (writeableViaAtomic) {
      // Filesystem permits rename-over-readonly — secondary is inapplicable.
      try {
        fs.chmodSync(configPath, 0o644);
      } catch (_) {
        /* best-effort */
      }
      return;
    }

    // Re-chmod the probed-back file so the subsequent apply encounters
    // the same readonly target.
    try {
      fs.chmodSync(configPath, 0o444);
    } catch (_) {
      /* already 0o444 or perm denied — tolerate */
    }

    const r = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpDir,
    );
    assert.ok(!r.success, 'apply should fail when config.json is read-only');

    const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    assert.ok(!fs.existsSync(objPath), 'OBJECTIVES.md rolled back');

    const subject = gitLogSubject(tmpDir);
    assert.doesNotMatch(
      subject,
      /DEFINE greenfield/,
      'no DEFINE commit landed on HEAD',
    );

    try {
      fs.chmodSync(configPath, 0o644);
    } catch (_) {
      /* best-effort */
    }
  });
});
