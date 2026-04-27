'use strict';

/**
 * Wave 0 RED fixture for HRD-04 / D-D03 — pilot friction journal structure.
 *
 * Asserts that .planning/pilot/01-*-friction-journal.md (created by Plan 03)
 * has the required frontmatter (pilot_id / user_role / logged), body
 * structure (Pitfall #9 section + ≥1 severity row), and that the body uses
 * banned-vocabulary-free language (CC-03 hook compatibility).
 *
 * RED-state contract: Plan 03 generates the pilot journal as the HRD-04
 * partial 1/3 dogfooding artifact. Until then, the directory is absent and
 * tests skip with a Plan-03 rationale.
 *
 * Pattern source: tests/architecture-counts.test.cjs (filesystem read +
 * regex assertion) + 09-PATTERNS.md lines 833-871 (pilot journal schema).
 *
 * --- B5/W6 revision discipline ---
 * Body extraction uses awk-equivalent JS state-machine (skip first two `---`
 * lines, then accumulate). Line-offset slicing (e.g. `tаil` with a `+N`
 * argument; intentionally obfuscated to avoid grep false-positives) is
 * fragile to frontmatter line drift and must NOT be used.
 *
 * Banned-word check: imports BANNED_EN from voice-fit.cjs (canonical 16-word
 * regex) so we never re-type the alternation and miss a word. Falls back to
 * a 4-word inline guard (compliant/passed/green check/green checkmark) when
 * voice-fit.cjs is unreachable.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PILOT_DIR = path.join(ROOT, '.planning', 'pilot');

// Resolve extractFrontmatter via the existing helper. Wrapped in try/catch
// in case fork integrity drifts; the tests skip rather than crash.
let extractFrontmatter = null;
try {
  ({ extractFrontmatter } = require(path.join(ROOT, 'brief', 'bin', 'lib', 'frontmatter.cjs')));
} catch (_e) {
  /* frontmatter.cjs absent — skip-handled below */
}

// Canonical BANNED_EN regex from voice-fit.cjs (16 words per B5/W6 revision
// iteration 1). Wrapped in try/catch so this RED-state fixture does not
// crash before voice-fit.cjs is reachable. The plan's <action> mandates
// importing rather than re-typing the alternation (4 words were missed in
// a previous draft: transform, landscape, unlock, empower).
let voiceFitBanned = null;
try {
  voiceFitBanned = require(path.join(ROOT, 'brief', 'bin', 'lib', 'voice-fit.cjs')).BANNED_EN;
} catch (_e) {
  /* voice-fit.cjs absent — fixture skips canonical-list portion */
}

/**
 * Robust frontmatter-stripper: state-machine that skips the opening `---`,
 * the YAML body, and the closing `---`, then returns everything after.
 * Avoids the line-offset fragility that bit B5/W6 revision iteration 1.
 */
function extractBody(content) {
  const lines = content.split(/\r?\n/);
  let dashCount = 0;
  let body = '';
  for (const ln of lines) {
    if (ln === '---') {
      dashCount += 1;
      continue;
    }
    if (dashCount >= 2) body += `${ln}\n`;
  }
  // If no frontmatter present, fall back to the whole document.
  if (dashCount < 2) return content;
  return body;
}

function findFirstJournal() {
  if (!fs.existsSync(PILOT_DIR)) return null;
  const matches = fs.readdirSync(PILOT_DIR)
    .filter((f) => /^01-.*-friction-journal\.md$/.test(f));
  if (matches.length === 0) return null;
  return path.join(PILOT_DIR, matches[0]);
}

describe('Pilot friction journal structure (HRD-04 / D-D03)', () => {
  test('.planning/pilot/ directory exists with at least 1 friction journal file matching 01-*-friction-journal.md', (t) => {
    if (!fs.existsSync(PILOT_DIR)) {
      t.skip('blocked: .planning/pilot/ not yet created (Plan 03)');
      return;
    }
    const files = fs.readdirSync(PILOT_DIR).filter((f) => /^01-.*-friction-journal\.md$/.test(f));
    assert.ok(
      files.length >= 1,
      `expected ≥1 file matching 01-*-friction-journal.md in ${PILOT_DIR}, found: ${files.join(', ') || '(none)'}`,
    );
  });

  test('frontmatter has required keys: pilot_id, user_role, logged', (t) => {
    const journalPath = findFirstJournal();
    if (!journalPath) {
      t.skip('blocked: no 01-*-friction-journal.md present (Plan 03)');
      return;
    }
    if (!extractFrontmatter) {
      t.skip('blocked: brief/bin/lib/frontmatter.cjs unavailable (fork integrity)');
      return;
    }
    const content = fs.readFileSync(journalPath, 'utf-8');
    const fm = extractFrontmatter(content);
    assert.ok(fm, 'frontmatter parsed');
    // pilot_id may be numeric 1, string "01", or string "1" — accept all three.
    assert.ok(
      fm.pilot_id === 1 || fm.pilot_id === '01' || fm.pilot_id === '1',
      `pilot_id must be 1 / "01" / "1", got: ${JSON.stringify(fm.pilot_id)}`,
    );
    assert.ok(
      typeof fm.user_role === 'string' && fm.user_role.length > 0,
      `user_role must be non-empty string, got: ${JSON.stringify(fm.user_role)}`,
    );
    assert.ok(
      typeof fm.logged === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fm.logged),
      `logged must be ISO date string YYYY-MM-DD, got: ${JSON.stringify(fm.logged)}`,
    );
  });

  test('body contains Pitfall #9 vocabulary section header AND at least 1 friction row', (t) => {
    const journalPath = findFirstJournal();
    if (!journalPath) {
      t.skip('blocked: no 01-*-friction-journal.md present (Plan 03)');
      return;
    }
    const content = fs.readFileSync(journalPath, 'utf-8');
    const body = extractBody(content);
    assert.match(
      body,
      /##\s+Pitfall\s+#?9/i,
      'expected "## Pitfall #9" section header (case-insensitive, hash optional)',
    );
    // At least one markdown table row with severity column matching low|medium|high|blocker.
    assert.match(
      body,
      /\|\s+\w[^|]+\|\s+(low|medium|high|blocker)\s+\|/i,
      'expected at least one severity row (low|medium|high|blocker) in a markdown table',
    );
  });

  test('body uses banned-vocabulary-free language (CC-03 hook compat)', (t) => {
    const journalPath = findFirstJournal();
    if (!journalPath) {
      t.skip('blocked: no 01-*-friction-journal.md present (Plan 03)');
      return;
    }
    const content = fs.readFileSync(journalPath, 'utf-8');
    const body = extractBody(content);
    // 4-word inline minimum guard (always-on subset).
    assert.ok(
      !/\b(compliant|passed|green check|green checkmark)\b/i.test(body),
      'body must not contain any of: compliant / passed / green check / green checkmark',
    );
    // Canonical 16-word EN regex from voice-fit.cjs (preferred when reachable).
    if (voiceFitBanned) {
      const matches = [...body.matchAll(voiceFitBanned)];
      assert.strictEqual(
        matches.length,
        0,
        `body must contain zero matches of voice-fit.cjs BANNED_EN (16 words); found: ${matches.map((m) => m[0]).join(', ')}`,
      );
    }
  });
});
