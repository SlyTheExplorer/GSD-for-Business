/**
 * brief-align-vocabulary-lock.test.cjs — Phase 4 Plan 04-06 Task 1.
 *
 * Pitfall #4 (PITFALLS.md Common Pitfall #4 — Compliance Checkbox Theater)
 * mitigation: post-hoc vocabulary discipline. Greps every OBJECTIVES.align.md
 * emitted by runAlign + commitAlignVerdict for ban-list tokens across
 * three fixture runs (Korean ALIGNED, English ALIGNED, override) AND
 * asserts the same discipline holds in the three static source-of-truth
 * files (align-vocabulary.md reference, agents/brief-align-gate.md
 * subagent prompt, brief/workflows/align-gate.md orchestrator workflow).
 *
 * Ban-list (D-05):
 *   EN: compliant | passed | violation | failed
 *   KO: 준수 | 통과 | 위반 | 실패
 *   Symbols: ✅ | ✓ | ✗
 *
 * Test-fires-when-pitfall-manifests discipline: each assertion message
 * names the pitfall ("Pitfall #4 vocabulary theater has manifested") so
 * CI triage is fast.
 *
 * References:
 *   - 04-06-PLAN.md Task 1
 *   - 04-CONTEXT.md D-05 (ban-list), D-11 (language rule)
 *   - 04-RESEARCH.md §Common Pitfalls Pitfall 1
 *   - brief/references/align-vocabulary.md (source of truth)
 *   - tests/brief-align-canary.test.cjs (fixture-seeding pattern)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const align = require('../brief/bin/lib/align.cjs');

const REPO_ROOT = path.join(__dirname, '..');
const FIXTURE_DIR = path.join(__dirname, 'fixtures');

// D-05 ban-list — authoritative set mirrored from brief/references/align-vocabulary.md.
// Symbols are listed literally; EN tokens use \b word-boundaries via regex at assert time.
const BAN_TOKENS_EN = ['compliant', 'passed', 'violation', 'failed'];
const BAN_TOKENS_KO = ['준수', '통과', '위반', '실패'];
const BAN_SYMBOLS = ['✅', '✓', '✗'];

// ─── assertNoBanListInText ─────────────────────────────────────────────────
// Shared assertion helper. contextLabel is surfaced in assert.fail so CI
// diagnostics pinpoint which file / run produced the hit.

function assertNoBanListInText(text, contextLabel) {
  for (const tok of BAN_TOKENS_EN) {
    const re = new RegExp(`\\b${tok}\\b`, 'gi');
    const matches = text.match(re);
    if (matches) {
      assert.fail(
        `[${contextLabel}] EN ban-list token '${tok}' appeared ${matches.length}x. ` +
          `Pitfall #4 vocabulary theater has manifested. See brief/references/align-vocabulary.md ` +
          `for the preferred vocabulary.`,
      );
    }
  }
  for (const tok of BAN_TOKENS_KO) {
    if (text.includes(tok)) {
      assert.fail(
        `[${contextLabel}] KO ban-list token '${tok}' appeared. ` +
          `Pitfall #4 vocabulary theater has manifested.`,
      );
    }
  }
  for (const sym of BAN_SYMBOLS) {
    if (text.includes(sym)) {
      assert.fail(
        `[${contextLabel}] Ban-list symbol '${sym}' appeared. ` +
          `Pitfall #4 vocabulary theater has manifested.`,
      );
    }
  }
}

// ─── Fixture seeders ───────────────────────────────────────────────────────
// Self-contained: each test owns its own tmp cwd with the three required
// .planning/ files (OBJECTIVES.md, config.json, STATE.md).

function seedKorea() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-align-vocab-kr-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.copyFileSync(
    path.join(FIXTURE_DIR, 'align-aligned-baseline.md'),
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'kr', business_model: 'b2c' } }, null, 2),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "04"',
      'stopped_at: "vocab test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

function seedNonKorea() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-align-vocab-en-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'brief_objectives_version: "1.0"',
      'status: ready',
      'mode: greenfield',
      'immutable_items:',
      '  - creator-identity',
      '  - core-value',
      '  - problem-statement',
      'business_model: b2c',
      'region: us',
      'audience_policy: internal',
      'compliance_packs: []',
      '---',
      '',
      '## Immutable Intent (locked)',
      '- Creator Identity: solo maker',
      '- Core Value: decision helper app for urban commuters',
      '- Problem Statement: monthly budget decisions are slow',
      '',
      '## Mutable Hypotheses',
      '- Target Audience: urban professionals 25-35',
      '- Verification Metrics: MAU 10k',
      '- Competitors: Mint, YNAB',
      '- Dream State — Now: spreadsheets',
      '- Dream State — 3-month: app MVP live',
      '- Dream State — 12-month: 100k users',
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us', business_model: 'b2c' } }, null, 2),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "04"',
      'stopped_at: "vocab test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

// ─── Test 1: Emitted OBJECTIVES.align.md — Korean ALIGNED path ────────────────────

test('emitted OBJECTIVES.align.md Korean ALIGNED path — no ban-list tokens (Pitfall #4)', () => {
  const cwd = seedKorea();
  const objPath = path.join(cwd, '.planning', 'OBJECTIVES.md');
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  align.runAlign(cwd, {
    candidate: objPath,
    baseline: objPath,
    verdictOutPath: verdictPath,
    llmPass: () => ({
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings: [
        {
          severity: 'nice-to-have',
          location: 'OBJECTIVES.md:Mutable',
          description:
            '문서화된 의도 중 반영된 것: 모든 Immutable Intent 항목에 대응되는 Mutable Hypothesis가 있습니다.',
        },
      ],
      rationale: '모든 레이어가 일관된 상태입니다.',
    }),
  });
  align.commitAlignVerdict(cwd, { verdictPath });
  const body = fs.readFileSync(path.join(cwd, '.planning', 'OBJECTIVES.align.md'), 'utf-8');
  assertNoBanListInText(body, 'emitted OBJECTIVES.align.md (Korean ALIGNED)');
});

// ─── Test 2: Emitted OBJECTIVES.align.md — English ALIGNED path ───────────────────

test('emitted OBJECTIVES.align.md English ALIGNED path — no ban-list tokens (Pitfall #4)', () => {
  const cwd = seedNonKorea();
  const objPath = path.join(cwd, '.planning', 'OBJECTIVES.md');
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  align.runAlign(cwd, {
    candidate: objPath,
    baseline: objPath,
    verdictOutPath: verdictPath,
    llmPass: () => ({
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings: [
        {
          severity: 'nice-to-have',
          location: 'OBJECTIVES.md:Mutable',
          description:
            'Documented obligations addressed: all Immutable bullets operationalized by Mutable Hypotheses.',
        },
      ],
      rationale: 'All layers coherent.',
    }),
  });
  align.commitAlignVerdict(cwd, { verdictPath });
  const body = fs.readFileSync(path.join(cwd, '.planning', 'OBJECTIVES.align.md'), 'utf-8');
  assertNoBanListInText(body, 'emitted OBJECTIVES.align.md (English ALIGNED)');
});

// ─── Test 3: Emitted OBJECTIVES.align.md — override path ──────────────────────────

test('emitted OBJECTIVES.align.md override path — no ban-list tokens (Pitfall #4)', () => {
  const cwd = seedKorea();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  // Seed a DRIFTED verdict directly — simulates the user force-accepting
  // after the workflow's 3-path interrupt (skips runAlign for speed).
  fs.writeFileSync(
    verdictPath,
    JSON.stringify({
      decision: 'DRIFTED-output-needs-revision',
      severity: 'material',
      findings_count: 1,
      findings: [
        {
          severity: 'material',
          location: 'X',
          description: '추가 작업이 필요한 항목: 구체화되지 않은 청중',
        },
      ],
      rationale: '청중 구체화 부족',
    }),
  );
  align.commitAlignVerdict(cwd, {
    verdictPath,
    override: true,
    overrideReason: '사용자가 의도적으로 현재 상태 승인',
  });
  const body = fs.readFileSync(path.join(cwd, '.planning', 'OBJECTIVES.align.md'), 'utf-8');
  assertNoBanListInText(body, 'emitted OBJECTIVES.align.md (override path)');
});

// ─── Test 4: Static file — align-vocabulary.md section containment ─────────
// Ban-list tokens are legitimate ONLY inside `## Ban-list*` sections of the
// reference file (that is their purpose there). They MUST NOT leak into
// Preferred-vocabulary or Notes sections.

test('static file brief/references/align-vocabulary.md — ban-list tokens only in Ban-list sections', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'brief/references/align-vocabulary.md'),
    'utf-8',
  );
  // Split the file on `## ` H2 headers. Section [0] is the preamble (file-top
  // notes before the first H2); section [1..] each starts with its header line.
  const sections = content.split(/^## /m);
  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i];
    const headerLine = sec.split('\n', 1)[0];
    if (/^Ban-list/i.test(headerLine)) continue; // ban-list sections are the legitimate home
    for (const tok of BAN_TOKENS_EN) {
      const re = new RegExp(`\\b${tok}\\b`, 'gi');
      if (re.test(sec)) {
        assert.fail(
          `align-vocabulary.md: EN ban-list token '${tok}' appeared in NON-Ban-list section ` +
            `'${headerLine}'. Move to a Ban-list section or remove.`,
        );
      }
    }
    for (const tok of BAN_TOKENS_KO) {
      if (sec.includes(tok)) {
        assert.fail(
          `align-vocabulary.md: KO ban-list token '${tok}' appeared in NON-Ban-list section ` +
            `'${headerLine}'.`,
        );
      }
    }
  }
});

// ─── Test 5: Static file — agents/brief-align-gate.md ─────────────────────
// Ban tokens are legitimate ONLY inside the <vocabulary_discipline> block
// (where they appear as "DO NOT use" examples). They MUST NOT appear in
// example verdict JSON, output-contract, or any other prose outside that
// block.

test('static file agents/brief-align-gate.md — ban-list tokens only inside vocabulary_discipline block', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'agents/brief-align-gate.md'),
    'utf-8',
  );
  const vdMatch = content.match(/<vocabulary_discipline>([\s\S]*?)<\/vocabulary_discipline>/);
  assert.ok(
    vdMatch,
    '<vocabulary_discipline> block must exist in agents/brief-align-gate.md (prompt contract)',
  );
  // Remove the vocabulary_discipline block entirely, then assert no ban
  // tokens appear in the remainder.
  const outsideVd = content.replace(vdMatch[0], '');
  for (const tok of BAN_TOKENS_EN) {
    const re = new RegExp(`\\b${tok}\\b`, 'gi');
    if (re.test(outsideVd)) {
      assert.fail(
        `agents/brief-align-gate.md: EN ban-list token '${tok}' appeared OUTSIDE ` +
          `<vocabulary_discipline> block. Scrub it from examples/output-contract/process.`,
      );
    }
  }
  for (const tok of BAN_TOKENS_KO) {
    if (outsideVd.includes(tok)) {
      assert.fail(
        `agents/brief-align-gate.md: KO ban-list token '${tok}' appeared OUTSIDE ` +
          `<vocabulary_discipline> block.`,
      );
    }
  }
});

// ─── Test 6: Static file — brief/workflows/align-gate.md ──────────────────
// The orchestrator workflow markdown is pure orchestration prose. Evaluator
// vocabulary (ban-list) must not appear here at all. This is the strictest
// of the three static checks — if a future edit introduces evaluator
// language into the workflow, this test catches it.

test('static file brief/workflows/align-gate.md — no ban-list tokens anywhere (orchestration prose)', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'brief/workflows/align-gate.md'),
    'utf-8',
  );
  assertNoBanListInText(content, 'brief/workflows/align-gate.md');
});
