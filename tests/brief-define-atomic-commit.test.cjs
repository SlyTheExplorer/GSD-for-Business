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
    // permission denial rather than stub-throw. Skips silently on
    // filesystems that ignore chmod 0o444 (Docker-as-root, Windows).
    const configPath = path.join(tmpDir, '.planning', 'config.json');
    try {
      fs.chmodSync(configPath, 0o444);
    } catch (_) {
      return; // chmod unsupported — skip silently
    }
    let writeable = false;
    try {
      fs.writeFileSync(configPath, '{"probe":1}');
      writeable = true;
    } catch (_) {
      /* expected when chmod is honored */
    }
    if (writeable) {
      // Filesystem ignored chmod — skip.
      try {
        fs.chmodSync(configPath, 0o644);
      } catch (_) {
        /* best-effort */
      }
      return;
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
