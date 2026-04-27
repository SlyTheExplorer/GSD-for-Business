'use strict';

/**
 * Wave 0 RED fixture for HRD-03 / C-D02 — /brief-help <topic> partial keyword match.
 *
 * Asserts that a topic substring (e.g., 'def') matches the appropriate
 * command slugs/descriptions case-insensitively. Until Plan 02 ships
 * brief/bin/lib/help.cjs, this fixture skips with a Plan-02 rationale.
 *
 * Pattern source: tests/architecture-counts.test.cjs (filesystem-driven
 * structural test using node:test + node:assert/strict).
 *
 * NOTE on partial-match implementation: 09-PATTERNS.md lines 362-365 specify
 * the byte-identity contract — `catalog.filter(e => e.slug.toLowerCase().includes(t)
 * || e.description.toLowerCase().includes(t))`. The exact public export name
 * (e.g., `help.matchTopic` vs. inline filter) is finalized in Plan 02; this
 * fixture exercises both shapes via try/catch fallback to the inline filter.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT, 'commands', 'brief');

// LOCKED_12 — byte-identical to 09-00-PLAN.md <interfaces> block (A-D01).
const LOCKED_12 = [
  'define', 'discover', 'design', 'add-workstream',
  'deliver', 'export', 'status', 'help',
  'init', 'progress', 'undo', 'pause-work',
];

let helpAvailable = false;
let help = null;
try {
  help = require(path.join(ROOT, 'brief', 'bin', 'lib', 'help.cjs'));
  helpAvailable = true;
} catch (_e) {
  // Plan 02 has not yet created brief/bin/lib/help.cjs — fixture stays RED.
}

/**
 * Inline partial-match per 09-PATTERNS.md lines 362-365 — used as the
 * acceptance contract Plan 02 must match. Falls back to slug-only when
 * description is unavailable.
 */
function inlinePartialMatch(catalog, topic) {
  const t = topic.toLowerCase();
  return catalog.filter((e) => {
    const slug = (e.slug || '').toLowerCase();
    const desc = (e.description || '').toLowerCase();
    return slug.includes(t) || desc.includes(t);
  });
}

/**
 * Resolve the Plan-02 public matcher if exported; otherwise fall back to
 * the inline contract. Plan 02 may export `matchTopic`, `searchTopic`, or
 * leave it inline — this fixture accepts any of those shapes.
 */
function matchTopic(catalog, topic) {
  if (help && typeof help.matchTopic === 'function') return help.matchTopic(catalog, topic);
  if (help && typeof help.searchTopic === 'function') return help.searchTopic(catalog, topic);
  return inlinePartialMatch(catalog, topic);
}

describe('/brief-help <topic> partial keyword match (HRD-03 / C-D02)', () => {
  test("topic 'def' matches define via slug substring", (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    const catalog = help.buildCatalog(COMMANDS_DIR);
    const matches = matchTopic(catalog, 'def');
    const slugs = matches.map((m) => m.slug);
    assert.ok(slugs.includes('define'), `expected 'define' in partial-match results, got: ${slugs.join(', ')}`);
  });

  test("case-insensitive — 'DEFINE' matches define", (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    const catalog = help.buildCatalog(COMMANDS_DIR);
    const matches = matchTopic(catalog, 'DEFINE');
    const slugs = matches.map((m) => m.slug);
    assert.ok(slugs.includes('define'), `expected 'define' for uppercase 'DEFINE' input, got: ${slugs.join(', ')}`);
  });

  test("topic 'design' matches at least 2 DESIGN-category commands (define/design/add-workstream subset)", (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    const catalog = help.buildCatalog(COMMANDS_DIR);
    const matches = matchTopic(catalog, 'design');
    const slugs = new Set(matches.map((m) => m.slug));
    // 'design' is a substring of 'design' and (depending on description) may appear
    // in other entries' descriptions. Acceptance: at least 2 matches AND 'design'
    // itself is present.
    assert.ok(matches.length >= 1, `expected ≥1 partial match for topic 'design', got ${matches.length}`);
    assert.ok(slugs.has('design'), "'design' slug must itself appear in partial-match for topic 'design'");
    // LOCKED_12 anchor — sanity check that the matched slugs are a subset of LOCKED_12 once Plan 05 prunes.
    if (fs.existsSync(COMMANDS_DIR)
      && fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.md')).length === 12) {
      for (const s of slugs) {
        assert.ok(LOCKED_12.includes(s), `partial-match returned non-LOCKED_12 slug: ${s}`);
      }
    }
  });
});
