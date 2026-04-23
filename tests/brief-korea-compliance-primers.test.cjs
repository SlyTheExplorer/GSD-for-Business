const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

// Plan 01 (wave 1 sibling worktree) ships brief/bin/lib/context-inject.cjs with
// COMPLIANCE_PACK_TO_REFERENCE map. In THIS worktree the module may not yet be
// present; the orchestrator merges Plan 01 + Plan 06 before Phase 5 closeout.
// Load with tolerance so this test passes in isolation AND after merge.
let COMPLIANCE_PACK_TO_REFERENCE = null;
try {
  const mod = require('../brief/bin/lib/context-inject.cjs');
  COMPLIANCE_PACK_TO_REFERENCE = mod.COMPLIANCE_PACK_TO_REFERENCE || null;
} catch (err) {
  if (err && err.code !== 'MODULE_NOT_FOUND') throw err;
  // Pre-merge worktree: Plan 01 not yet landed. Cross-cutting test will skip.
}

const ROOT = path.join(__dirname, '..');
const DISCLAIMER_VERBATIM = '> Not legal advice. Refer to qualified Korean counsel before acting on findings.';

const PRIMERS = [
  { pack: 'PIPA', filename: 'pipa-2026.md', requires: [/10% of total turnover/, /2026-09-11/, /CEO/] },
  { pack: 'ISMS-P', filename: 'isms-p.md', requires: [/2027-07-01/, /ISMS-P/] },
  { pack: 'MyData', filename: 'mydata-2026.md', requires: [/MyData/, /medical/, /communications/, /energy/, /transportation/, /education/, /employment/, /real[_ ]estate/i, /welfare/, /distribution/, /leisure/] },
];

for (const p of PRIMERS) {
  test(`${p.filename}: file exists at allowlisted path`, () => {
    const primerPath = path.join(ROOT, 'brief/references/compliance/korea', p.filename);
    assert.ok(fs.existsSync(primerPath), `primer missing: ${primerPath}`);
  });

  test(`${p.filename}: contains verbatim disclaimer`, () => {
    const primerPath = path.join(ROOT, 'brief/references/compliance/korea', p.filename);
    const content = fs.readFileSync(primerPath, 'utf-8');
    assert.ok(content.includes(DISCLAIMER_VERBATIM),
      `${p.filename} missing verbatim disclaimer: "${DISCLAIMER_VERBATIM}"`);
  });

  test(`${p.filename}: mandatory YAML frontmatter present`, () => {
    const primerPath = path.join(ROOT, 'brief/references/compliance/korea', p.filename);
    const content = fs.readFileSync(primerPath, 'utf-8');
    const fm = extractFrontmatter(content);
    assert.ok(fm, `${p.filename} missing frontmatter`);
    assert.equal(fm.region, 'kr', `${p.filename} must declare region: kr`);
    assert.ok(fm.effective_date, `${p.filename} must declare effective_date`);
    assert.ok(fm.penalty_ceiling, `${p.filename} must declare penalty_ceiling`);
    assert.ok(fm.last_reviewed, `${p.filename} must declare last_reviewed`);
    assert.ok(Array.isArray(fm.industry) || typeof fm.industry === 'string',
      `${p.filename} industry must be array or string`);
  });

  test(`${p.filename}: body word count between 300 and 900`, () => {
    const primerPath = path.join(ROOT, 'brief/references/compliance/korea', p.filename);
    const content = fs.readFileSync(primerPath, 'utf-8');
    // Strip frontmatter + markdown
    const body = content.replace(/^---\r?\n[\s\S]+?\r?\n---\r?\n?/, '');
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount >= 300 && wordCount <= 900,
      `${p.filename} body word count ${wordCount} outside 300-900 cap`);
  });

  test(`${p.filename}: contains required content markers`, () => {
    const primerPath = path.join(ROOT, 'brief/references/compliance/korea', p.filename);
    const content = fs.readFileSync(primerPath, 'utf-8');
    for (const re of p.requires) {
      assert.match(content, re, `${p.filename} missing required content marker: ${re}`);
    }
  });

  test(`${p.filename}: has Sources section with URL+access-date format`, () => {
    const primerPath = path.join(ROOT, 'brief/references/compliance/korea', p.filename);
    const content = fs.readFileSync(primerPath, 'utf-8');
    assert.match(content, /## Sources/);
    // At least one entry in `[Title](url)` or `— accessed YYYY-MM-DD` format
    assert.match(content, /accessed 2026-\d{2}-\d{2}/);
  });
}

test('COMPLIANCE_PACK_TO_REFERENCE paths align with shipped primers (D-14 auto-attach)', { skip: !COMPLIANCE_PACK_TO_REFERENCE }, () => {
  // Paths from context-inject.cjs map must exist on disk.
  // Skipped pre-merge (Plan 01 context-inject.cjs not yet landed in this worktree).
  for (const pack of ['PIPA', 'ISMS-P', 'MyData']) {
    const primerPath = COMPLIANCE_PACK_TO_REFERENCE[pack];
    assert.ok(primerPath, `COMPLIANCE_PACK_TO_REFERENCE['${pack}'] missing from map`);
    const full = path.join(ROOT, primerPath);
    assert.ok(fs.existsSync(full), `COMPLIANCE_PACK_TO_REFERENCE['${pack}'] → '${primerPath}' not found on disk`);
  }
});

test('No "You must" / "You are required to" phrasings (Pitfall 6 — legal-advice avoidance)', () => {
  // Per Pitfall 6: sentences should NOT begin with directives like "You must" which imply legal advice
  for (const p of PRIMERS) {
    const primerPath = path.join(ROOT, 'brief/references/compliance/korea', p.filename);
    const content = fs.readFileSync(primerPath, 'utf-8');
    // Sentences starting with "You must" or "You are required to" (case-insensitive line starts)
    const badSentences = content.split(/(?<=[.!?])\s+/).filter(s => /^you must |^you are required to /i.test(s.trim()));
    assert.equal(badSentences.length, 0,
      `${p.filename} contains directive phrasings (Pitfall 6 violation): ${badSentences.slice(0, 2).join(' // ')}`);
  }
});
