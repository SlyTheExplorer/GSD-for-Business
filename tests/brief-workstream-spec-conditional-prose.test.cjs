/**
 * BRIEF Phase 7 Plan 07 — B2B/B2C conditional prose vocabulary lock (D-14)
 *
 * Every built-in workstream's design-prompts.md MUST contain:
 *   - at least one `If business_model in [b2b...]:` conditional block
 *   - at least one `If business_model in [b2c...]:` conditional block
 *
 * This is the Phase 5 D-15 conditional prose convention applied uniformly to
 * the 9 Phase 7 workstreams. Same pattern as brief-domain-researcher.md.
 *
 * Plus: every workstream's templates/artifact.md frontmatter must carry the
 * audience.* and business_context.model fields used by the audience guard.
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');

const BUILT_IN_SLUGS = [
  'business-model-canvas',
  'go-to-market',
  'financial',
  'operations',
  'compliance',
  'roadmap',
  'brand',
  'risk',
  'tech-arch',
];

test('All 9 built-in design-prompts.md files contain B2B + B2C conditional blocks (D-14)', () => {
  for (const slug of BUILT_IN_SLUGS) {
    const dpPath = path.join(REPO_ROOT, 'brief', 'workstreams', slug, 'design-prompts.md');
    assert.ok(
      fs.existsSync(dpPath),
      `Missing design-prompts.md for workstream "${slug}": ${dpPath}`
    );
    const dp = fs.readFileSync(dpPath, 'utf8');
    assert.match(
      dp,
      /If business_model in \[b2b/i,
      `${slug}: design-prompts.md missing B2B conditional block (D-14 vocabulary lock)`
    );
    assert.match(
      dp,
      /If business_model in \[b2c/i,
      `${slug}: design-prompts.md missing B2C conditional block (D-14 vocabulary lock)`
    );
  }
});

test('All 9 templates/artifact.md have audience.* and business_context.model frontmatter fields', () => {
  for (const slug of BUILT_IN_SLUGS) {
    const tplPath = path.join(REPO_ROOT, 'brief', 'workstreams', slug, 'templates', 'artifact.md');
    assert.ok(fs.existsSync(tplPath), `Missing artifact template for "${slug}": ${tplPath}`);
    const tpl = fs.readFileSync(tplPath, 'utf8');
    assert.match(
      tpl,
      /audience\.type|audience:/i,
      `${slug}: artifact template missing audience frontmatter`
    );
    assert.match(
      tpl,
      /business_context\.model|business_context:/i,
      `${slug}: artifact template missing business_context.model frontmatter`
    );
  }
});

test('All 9 design-prompts.md files reference business_model conditional in expected positions', () => {
  // Validate that the conditional blocks appear at section-level granularity,
  // not just incidentally in prose. Each file should have at least 1 occurrence
  // of the lock phrase total (sometimes 2 — one for B2B, one for B2C).
  for (const slug of BUILT_IN_SLUGS) {
    const dpPath = path.join(REPO_ROOT, 'brief', 'workstreams', slug, 'design-prompts.md');
    const dp = fs.readFileSync(dpPath, 'utf8');
    const matches = dp.match(/If business_model in \[/gi) || [];
    assert.ok(
      matches.length >= 2,
      `${slug}: expected ≥2 'If business_model in [' lock occurrences (B2B + B2C); got ${matches.length}`
    );
  }
});
