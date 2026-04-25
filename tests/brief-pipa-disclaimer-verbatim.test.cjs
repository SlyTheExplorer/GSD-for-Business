/**
 * brief-pipa-disclaimer-verbatim.test.cjs — Plan 07-02 Task 1.
 *
 * LOAD-BEARING DRIFT GUARD: asserts the Korean + English CEO-personal-liability
 * disclaimer wording is byte-identical between two surfaces:
 *   1. The Phase 5 primer file `brief/references/compliance/korea/pipa-2026.md`
 *      (canonical source-of-truth per CONTEXT.md D-03 + Specifics line 350).
 *   2. The Phase 7 renderer `brief/bin/lib/compliance-report.cjs`
 *      (`_disclaimerFooter` literal string).
 *
 * If either surface drifts (translation tweak, hyphenation change, quote variant),
 * the test FAILS with a diff signal so the planner can re-sync immediately —
 * preventing "no re-translation between two surfaces" violations (Pitfall #4
 * compliance-checkbox-theater regression vector).
 *
 * Reference: 07-02-PLAN.md Task 1; 07-CONTEXT.md "CEO personal liability
 * disclaimer — verbatim wording (D-03 lock)" (lines 1200-1231).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const PRIMER_PATH = path.join(REPO_ROOT, 'brief/references/compliance/korea/pipa-2026.md');
const RENDERER_PATH = path.join(REPO_ROOT, 'brief/bin/lib/compliance-report.cjs');

// Canonical anchor strings — these MUST appear in BOTH primer and renderer.
// Korean anchor: from D-03 lock (CONTEXT.md lines 1217-1223). Identifies the
// Korean disclaimer block uniquely in either surface.
const KO_ANCHOR_FRAGMENTS = [
  '본 분석은 법적 자문이 아닙니다',
  '2026년 개정 개인정보 보호법(PIPA, 2026-09-11 시행)',
  '대표이사 개인 책임이',
  '총매출의 10%',
  '본 findings는 자격 있는 한국 법률 자문가와 검토하기 위한 출발점이며, 법적 자문을 대체하지 않습니다',
];

// English anchor: from D-03 lock (CONTEXT.md lines 1206-1213).
const EN_ANCHOR_FRAGMENTS = [
  'Not legal advice. Refer to qualified Korean counsel before acting on findings',
  'Under 2026 PIPA amendments (effective 2026-09-11)',
  'personal liability for the CEO',
  '10% of total turnover',
  'Findings here are starting points for review with qualified Korean counsel',
  'they are not legal advice',
];

function _stripBlockquotePrefix(s) {
  // Strip leading "> " markdown blockquote markers and surrounding whitespace
  // so byte-identity compares semantic text, not markdown decoration.
  // Handles BOTH real newlines (from .md files) AND JS-source escape
  // sequences (`\n` and `\\n`) that appear when reading the renderer .cjs
  // source literally.
  return s
    .replace(/\\n/g, '\n')          // JS source: literal "\n" → real newline
    .split('\n')
    .map((line) => line.replace(/^>\s?/, '').trim())
    .filter((line) => line.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function _readFile(p) {
  return fs.readFileSync(p, 'utf-8');
}

test('PIPA primer file exists and is readable', () => {
  assert.ok(fs.existsSync(PRIMER_PATH), `primer file missing: ${PRIMER_PATH}`);
  const content = _readFile(PRIMER_PATH);
  assert.ok(content.length > 0, 'primer file is empty');
});

test('compliance-report.cjs renderer exists and is readable', () => {
  assert.ok(fs.existsSync(RENDERER_PATH), `renderer missing: ${RENDERER_PATH}`);
  const content = _readFile(RENDERER_PATH);
  assert.ok(content.length > 0, 'renderer file is empty');
});

test('Korean disclaimer fragments are present VERBATIM in primer (D-03 lock)', () => {
  const primerContent = _readFile(PRIMER_PATH);
  for (const frag of KO_ANCHOR_FRAGMENTS) {
    assert.ok(
      primerContent.includes(frag),
      `Korean disclaimer drift in primer: missing fragment "${frag}". ` +
      `Primer is source-of-truth per CONTEXT.md D-03 line 1202. ` +
      `Re-sync brief/references/compliance/korea/pipa-2026.md against the verbatim block in 07-CONTEXT.md lines 1217-1223.`,
    );
  }
});

test('Korean disclaimer fragments are present VERBATIM in renderer (D-03 lock)', () => {
  const rendererContent = _readFile(RENDERER_PATH);
  for (const frag of KO_ANCHOR_FRAGMENTS) {
    assert.ok(
      rendererContent.includes(frag),
      `Korean disclaimer drift in renderer: missing fragment "${frag}". ` +
      `Re-sync brief/bin/lib/compliance-report.cjs _disclaimerFooter() literal against the primer.`,
    );
  }
});

test('English disclaimer fragments are present VERBATIM in primer (D-03 lock)', () => {
  const primerContent = _readFile(PRIMER_PATH);
  for (const frag of EN_ANCHOR_FRAGMENTS) {
    assert.ok(
      primerContent.includes(frag),
      `English disclaimer drift in primer: missing fragment "${frag}". ` +
      `Primer is source-of-truth per CONTEXT.md D-03 line 1202. ` +
      `Re-sync brief/references/compliance/korea/pipa-2026.md against the verbatim block in 07-CONTEXT.md lines 1206-1213.`,
    );
  }
});

test('English disclaimer fragments are present VERBATIM in renderer (D-03 lock)', () => {
  const rendererContent = _readFile(RENDERER_PATH);
  for (const frag of EN_ANCHOR_FRAGMENTS) {
    assert.ok(
      rendererContent.includes(frag),
      `English disclaimer drift in renderer: missing fragment "${frag}". ` +
      `Re-sync brief/bin/lib/compliance-report.cjs _disclaimerFooter() literal against the primer.`,
    );
  }
});

test('byte-identity: Korean disclaimer block extracted from primer matches renderer literal', () => {
  // Extract Korean block from primer: from start anchor to end anchor.
  const primerContent = _readFile(PRIMER_PATH);
  const koStartIdx = primerContent.indexOf('본 분석은 법적 자문이 아닙니다');
  const koEndAnchor = '법적 자문을 대체하지 않습니다';
  const koEndIdx = primerContent.indexOf(koEndAnchor, koStartIdx);
  assert.ok(koStartIdx > 0, 'Korean disclaimer block not found in primer');
  assert.ok(koEndIdx > koStartIdx, 'Korean disclaimer end anchor not found after start in primer');
  const primerKoBlock = primerContent.substring(koStartIdx, koEndIdx + koEndAnchor.length);

  // Extract Korean block from renderer source.
  const rendererContent = _readFile(RENDERER_PATH);
  const rendererKoStart = rendererContent.indexOf('본 분석은 법적 자문이 아닙니다');
  const rendererKoEnd = rendererContent.indexOf(koEndAnchor, rendererKoStart);
  assert.ok(rendererKoStart > 0, 'Korean disclaimer block not found in renderer');
  assert.ok(rendererKoEnd > rendererKoStart, 'Korean disclaimer end anchor not found after start in renderer');
  const rendererKoBlock = rendererContent.substring(rendererKoStart, rendererKoEnd + koEndAnchor.length);

  // Normalize whitespace + blockquote prefixes for semantic comparison.
  const normalizedPrimer = _stripBlockquotePrefix(primerKoBlock);
  const normalizedRenderer = _stripBlockquotePrefix(rendererKoBlock);

  assert.strictEqual(
    normalizedRenderer,
    normalizedPrimer,
    `Korean disclaimer DRIFT detected. Re-sync renderer against primer.\n\n` +
    `PRIMER (normalized):\n${normalizedPrimer}\n\n` +
    `RENDERER (normalized):\n${normalizedRenderer}\n`,
  );
});

test('byte-identity: English disclaimer block extracted from primer matches renderer literal', () => {
  // Extract English block from primer: from start anchor to end anchor.
  const primerContent = _readFile(PRIMER_PATH);
  const enStartAnchor = 'Under 2026 PIPA amendments';
  const enStartIdx = primerContent.indexOf(enStartAnchor);
  const enEndAnchor = 'they are not legal advice';
  const enEndIdx = primerContent.indexOf(enEndAnchor, enStartIdx);
  assert.ok(enStartIdx > 0, 'English disclaimer block not found in primer');
  assert.ok(enEndIdx > enStartIdx, 'English disclaimer end anchor not found after start in primer');
  const primerEnBlock = primerContent.substring(enStartIdx, enEndIdx + enEndAnchor.length);

  // Extract English block from renderer source.
  const rendererContent = _readFile(RENDERER_PATH);
  const rendererEnStart = rendererContent.indexOf(enStartAnchor);
  const rendererEnEnd = rendererContent.indexOf(enEndAnchor, rendererEnStart);
  assert.ok(rendererEnStart > 0, 'English disclaimer block not found in renderer');
  assert.ok(rendererEnEnd > rendererEnStart, 'English disclaimer end anchor not found after start in renderer');
  const rendererEnBlock = rendererContent.substring(rendererEnStart, rendererEnEnd + enEndAnchor.length);

  const normalizedPrimer = _stripBlockquotePrefix(primerEnBlock);
  const normalizedRenderer = _stripBlockquotePrefix(rendererEnBlock);

  assert.strictEqual(
    normalizedRenderer,
    normalizedPrimer,
    `English disclaimer DRIFT detected. Re-sync renderer against primer.\n\n` +
    `PRIMER (normalized):\n${normalizedPrimer}\n\n` +
    `RENDERER (normalized):\n${normalizedRenderer}\n`,
  );
});
