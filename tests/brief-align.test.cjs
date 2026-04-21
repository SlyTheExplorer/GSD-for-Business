/**
 * brief-align.test.cjs — Phase 4 Plan 04-03 combined decision-path coverage.
 *
 * Exercises the hybrid evaluator end-to-end across the 3 decisions + 3 severities
 * via runAlign + mergeVerdicts, using the 4 fixtures planted by Task 1:
 *   - align-aligned-baseline.md
 *   - align-drifted-objective-missing-required.md
 *   - align-drifted-objective-contradiction.md   (Pitfall #6 MUST-PASS canary)
 *   - align-drifted-output-zero-overlap.md
 *
 * The LLM pass is substituted with a test-controlled stub (llmPass parameter) —
 * the deterministic screen and the merge/severity/decision logic run for real.
 * This keeps the suite under node:test, zero-dep, <30s per VALIDATION.md, and
 * proves the critical merge short-circuit + Pitfall #6 contradiction detection.
 *
 * References:
 *   - .planning/phases/04-first-gate-align-pattern-established/04-03-PLAN.md Task 2
 *   - .planning/phases/04-first-gate-align-pattern-established/04-CONTEXT.md D-03, D-04, D-05
 *   - .planning/phases/04-first-gate-align-pattern-established/04-RESEARCH.md §Pitfall 6 (MUST-PASS)
 *   - tests/brief-align-primitives.test.cjs (pattern reference for fixture setup)
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const align = require('../brief/bin/lib/align.cjs');

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

// ─── Helpers ───────────────────────────────────────────────────────────────

// Spins a per-test tmp cwd, copies the named fixture to .planning/OBJECTIVES.md,
// and seeds config.json with brief.region inferred from the fixture frontmatter
// (so detectKoreaSignalFromConfig returns the correct branch).
function setupCwd(baselineFixtureName) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-align-dp-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  const srcPath = path.join(FIXTURE_DIR, baselineFixtureName);
  const destPath = path.join(tmp, '.planning', 'OBJECTIVES.md');
  fs.copyFileSync(srcPath, destPath);
  const content = fs.readFileSync(destPath, 'utf-8');
  const regionMatch = content.match(/^region:\s*(\w+)$/m);
  const region = regionMatch ? regionMatch[1] : 'us';
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region } }, null, 2),
  );
  return { tmp, objectivesPath: destPath };
}

// ─── Test 1: ALIGNED path ─────────────────────────────────────────────────

test('aligned-fixture: self-coherent baseline → ALIGNED (ran with stub llmPass)', () => {
  const { tmp, objectivesPath } = setupCwd('align-aligned-baseline.md');
  const verdictOut = path.join(tmp, '.planning', '.align-verdict.tmp.json');
  // Stub LLM returns an ALIGNED verdict with nice-to-have findings.
  const stubLlm = () => ({
    decision: 'ALIGNED',
    severity: 'nice-to-have',
    findings: [
      {
        severity: 'nice-to-have',
        location: 'OBJECTIVES.md:Mutable',
        description:
          'Documented obligations addressed: all layers operationalize Immutable Intent.',
      },
    ],
    rationale: 'All Immutable Intent bullets have corresponding Mutable Hypotheses.',
  });
  const verdict = align.runAlign(tmp, {
    candidate: objectivesPath,
    baseline: objectivesPath,
    verdictOutPath: verdictOut,
    llmPass: stubLlm,
  });
  assert.strictEqual(verdict.decision, 'ALIGNED');
  assert.strictEqual(verdict.severity, 'nice-to-have');
  assert.strictEqual(typeof verdict.findings_count, 'number');
  assert.strictEqual(verdict.findings_count, verdict.findings.length);
  assert.strictEqual(align.validateVerdict(verdict), null);
});

// ─── Test 2: DRIFTED-objective (missing required) — short-circuit ─────────

test('drifted-objective-missing-required: short-circuits deterministic; llmPass never called', () => {
  const { tmp, objectivesPath } = setupCwd('align-drifted-objective-missing-required.md');
  const verdictOut = path.join(tmp, '.planning', '.align-verdict.tmp.json');
  let llmCalled = false;
  const stubLlm = () => {
    llmCalled = true;
    return { decision: 'ALIGNED', severity: 'nice-to-have', findings: [], rationale: 'should not run' };
  };
  const verdict = align.runAlign(tmp, {
    candidate: objectivesPath,
    baseline: objectivesPath,
    verdictOutPath: verdictOut,
    llmPass: stubLlm,
  });
  assert.strictEqual(verdict.decision, 'DRIFTED-objective-needs-update');
  assert.strictEqual(verdict.severity, 'blocking');
  assert.strictEqual(verdict.findings[0].severity, 'blocking');
  assert.match(verdict.findings[0].location, /business_model|region/i);
  assert.strictEqual(
    llmCalled,
    false,
    'llmPass must not be called when deterministic screen short-circuits',
  );
});

// ─── Test 3: Pitfall #6 MUST-PASS canary ───────────────────────────────────

test('MUST-PASS canary — drifted-objective-contradiction: Immutable B2B + Mutable consumer → DRIFTED-objective-needs-update', () => {
  const { tmp, objectivesPath } = setupCwd('align-drifted-objective-contradiction.md');
  const verdictOut = path.join(tmp, '.planning', '.align-verdict.tmp.json');
  // Stub LLM models the semantic detection the real subagent must perform.
  // Heuristic: if Immutable prose contains "1,000명 이상" (or "대기업") AND
  // Mutable prose contains "App Store" (or "소비자"), emit a blocking finding.
  const stubLlm = ({ candidate }) => {
    const content = fs.readFileSync(candidate, 'utf-8');
    const hasEnterprise = /1,?000명 이상/.test(content) || /대기업/.test(content);
    const hasConsumer = /App Store/i.test(content) || /소비자/.test(content);
    if (hasEnterprise && hasConsumer) {
      return {
        decision: 'DRIFTED-objective-needs-update',
        severity: 'blocking',
        findings: [
          {
            severity: 'blocking',
            location: 'OBJECTIVES.md:Mutable Hypotheses (target audience)',
            description:
              'Immutable ↔ Mutable contradiction: Immutable Intent locks B2B enterprise ' +
              '(직원 1,000명 이상), but Mutable Hypothesis proposes consumer acquisition via App Store.',
          },
        ],
        rationale:
          'Enterprise and consumer GTM motions are mutually exclusive; one layer must be revised.',
      };
    }
    return { decision: 'ALIGNED', severity: 'nice-to-have', findings: [], rationale: 'stub fallthrough' };
  };
  const verdict = align.runAlign(tmp, {
    candidate: objectivesPath,
    baseline: objectivesPath,
    verdictOutPath: verdictOut,
    llmPass: stubLlm,
  });
  if (verdict.decision === 'ALIGNED') {
    assert.fail(
      'Pitfall #6 MUST-PASS: hybrid evaluator returned ALIGNED on planted ' +
        'B2B-enterprise + App-Store-consumer contradiction. Gate is broken. ' +
        'See 04-RESEARCH.md Pitfall #6. If this passes, Phase 5 AUDIENCE and ' +
        'Phase 7 COMPLIANCE inherit a broken gate.',
    );
  }
  assert.strictEqual(verdict.decision, 'DRIFTED-objective-needs-update');
  assert.strictEqual(verdict.severity, 'blocking');
});

// ─── Test 4: DRIFTED-output (zero overlap) — short-circuit ────────────────

test('drifted-output-zero-overlap: candidate vs baseline, screen (a) short-circuits', () => {
  const { tmp, objectivesPath } = setupCwd('align-aligned-baseline.md');
  const candidateCopy = path.join(tmp, '.planning', 'candidate-unrelated.md');
  fs.copyFileSync(
    path.join(FIXTURE_DIR, 'align-drifted-output-zero-overlap.md'),
    candidateCopy,
  );
  const verdictOut = path.join(tmp, '.planning', '.align-verdict.tmp.json');
  let llmCalled = false;
  const verdict = align.runAlign(tmp, {
    candidate: candidateCopy,
    baseline: objectivesPath,
    verdictOutPath: verdictOut,
    llmPass: () => {
      llmCalled = true;
      return null;
    },
  });
  assert.strictEqual(verdict.decision, 'DRIFTED-output-needs-revision');
  assert.strictEqual(verdict.severity, 'material');
  assert.strictEqual(llmCalled, false);
});

// ─── Test 5: state-write-shape ─────────────────────────────────────────────

test('state-write-shape: verdict fields preserved per validateVerdict (round-trip parseable)', () => {
  const { tmp, objectivesPath } = setupCwd('align-aligned-baseline.md');
  const verdictOut = path.join(tmp, '.planning', '.align-verdict.tmp.json');
  const verdict = align.runAlign(tmp, {
    candidate: objectivesPath,
    baseline: objectivesPath,
    verdictOutPath: verdictOut,
    llmPass: () => ({
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings: [],
      rationale: 'ok',
    }),
  });
  assert.strictEqual(align.validateVerdict(verdict), null);
  // Read back via JSON to ensure the written file parses and preserves shape.
  const parsed = JSON.parse(fs.readFileSync(verdictOut, 'utf-8'));
  assert.strictEqual(parsed.decision, verdict.decision);
  assert.strictEqual(typeof parsed.findings_count, 'number');
  assert.ok(Array.isArray(parsed.findings));
  assert.strictEqual(typeof parsed.rationale, 'string');
});

// ─── Test 6: evaluator-does-not-mutate-baseline (Pitfall #2 mitigation) ────

test('evaluator-does-not-mutate-baseline: baseline mtime unchanged after runAlign', () => {
  const { tmp, objectivesPath } = setupCwd('align-aligned-baseline.md');
  const verdictOut = path.join(tmp, '.planning', '.align-verdict.tmp.json');
  const beforeMtime = fs.statSync(objectivesPath).mtimeMs;
  // Small delay to ensure mtime would bump if touched.
  const start = Date.now();
  while (Date.now() - start < 10) {
    /* noop */
  }
  align.runAlign(tmp, {
    candidate: objectivesPath,
    baseline: objectivesPath,
    verdictOutPath: verdictOut,
    llmPass: () => ({
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings: [],
      rationale: 'ok',
    }),
  });
  const afterMtime = fs.statSync(objectivesPath).mtimeMs;
  assert.strictEqual(
    afterMtime,
    beforeMtime,
    'baseline mtime changed — evaluator violated read-only contract (Pitfall #2)',
  );
});

// ─── Test 7: mergeVerdicts blocking LLM finding wins ───────────────────────

test('mergeVerdicts: LLM blocking finding forces non-ALIGNED decision + blocking severity', () => {
  const merged = align.mergeVerdicts(
    [{ severity: 'material', location: 'X', description: 'det finding' }],
    {
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings: [
        { severity: 'blocking', location: 'OBJECTIVES.md:1', description: 'blocking' },
      ],
      rationale: 'LLM',
    },
  );
  assert.notStrictEqual(merged.decision, 'ALIGNED');
  assert.strictEqual(merged.severity, 'blocking');
  assert.strictEqual(merged.findings_count, 2);
});

// ─── Test 8: mergeVerdicts ALIGNED path (no blocking anywhere) ─────────────

test('mergeVerdicts: all findings material or lower → ALIGNED', () => {
  const merged = align.mergeVerdicts(
    [{ severity: 'material', location: 'X', description: 'det' }],
    {
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings: [{ severity: 'nice-to-have', location: 'Y', description: 'llm' }],
      rationale: 'ok',
    },
  );
  assert.strictEqual(merged.decision, 'ALIGNED');
  assert.strictEqual(merged.severity, 'material');
});

// ─── Test 9: mergeVerdicts decides DRIFTED-output vs DRIFTED-objective ─────
// Deterministic finding locates at a non-OBJECTIVES path → DRIFTED-output.

test('mergeVerdicts: blocking finding at non-OBJECTIVES location → DRIFTED-output-needs-revision', () => {
  const merged = align.mergeVerdicts(
    [],
    {
      decision: 'DRIFTED-output-needs-revision',
      severity: 'blocking',
      findings: [
        {
          severity: 'blocking',
          location: 'candidate.md:42',
          description: 'candidate lacks required coverage',
        },
      ],
      rationale: 'candidate off-target',
    },
  );
  assert.strictEqual(merged.decision, 'DRIFTED-output-needs-revision');
  assert.strictEqual(merged.severity, 'blocking');
  assert.strictEqual(merged.findings_count, 1);
});

// ─── Test 10: mergeVerdicts tolerates null LLM verdict ─────────────────────

test('mergeVerdicts: null llmVerdict yields synthetic ALIGNED (no blocking det findings)', () => {
  const merged = align.mergeVerdicts([], null);
  assert.strictEqual(merged.decision, 'ALIGNED');
  assert.strictEqual(merged.severity, 'nice-to-have');
  assert.strictEqual(merged.findings_count, 0);
  assert.ok(Array.isArray(merged.findings));
  assert.strictEqual(typeof merged.rationale, 'string');
});
