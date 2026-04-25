---
phase: 07-design-workstream-orchestration-compliance-checker
plan: 02
subsystem: compliance-checker
tags: [phase-07, compliance, pipa, ceo-liability, disclaimer, byte-identity, false-positive-guard]
requirements: [CC-01]
dependency_graph:
  requires:
    - "07-01 (compliance.cjs scaffolding + 3-output verdict + commitComplianceVerdict)"
    - "Phase 5 D-04 (Korea primer files: pipa-2026.md, isms-p.md, mydata-2026.md)"
    - "Phase 5 D-13/D-14 (context-inject.cjs buildBusinessContext + COMPLIANCE_PACK_TO_REFERENCE)"
  provides:
    - "Verbatim D-03 CEO-liability disclaimer block in PIPA primer (canonical source-of-truth)"
    - "Drift-guard test asserting byte-identity between primer and renderer"
    - "Polymorphic runDeterministicScreen({...}) single-arg form"
    - "B2B SaaS PIPA Screen (b) false-positive prevention (Risk Notes mitigation)"
    - "CC-01 lock: every {artifact}.compliance.md emits the legal-counsel disclaimer regardless of decision"
  affects:
    - "Plan 07-03 (audience checker rebrand) — inherits the polymorphic runDeterministicScreen pattern"
    - "Phase 7 D-03 + D-04 — wording-lock and Korea-only-v1-pack-scope locked structurally"
tech_stack:
  added: []
  patterns:
    - "Polymorphic Node.js function signature via rest-args + length detection (cwd, opts) | (opts)"
    - "JS-source byte-identity test pattern: read .cjs as text + .replace(/\\\\n/g, '\\n') normalization"
    - "Negative-pattern guard: denial regex (No PII, 개인정보 미수집) suppresses Screen (b) on B2B context"
key_files:
  created:
    - "tests/brief-pipa-disclaimer-verbatim.test.cjs"
    - "tests/brief-compliance-disclaimer.test.cjs"
    - "tests/brief-compliance-pack-load.test.cjs"
  modified:
    - "brief/bin/lib/compliance.cjs (runDeterministicScreen polymorphic + denial guard)"
    - "brief/references/compliance/korea/pipa-2026.md (added D-03 verbatim disclaimer block)"
decisions:
  - "Primer-file is source-of-truth for disclaimer wording — renderer literal must mirror it byte-identically (D-03 lock); the test fails loudly on drift"
  - "Single-arg runDeterministicScreen accepted as additive contract; legacy 2-arg form preserved for Plan-01 / Phase-4 sibling backwards compatibility"
  - "Screen (b) false-positive guard: artifact denial pattern (No PII collected) + business_model: enterprise OR no consumer-positive signal = no blocking finding"
  - "businessContext.region (when string) trumps state-file detection so Plan-02 single-arg callers work without an initialized .planning/STATE.md"
metrics:
  duration_seconds: 378
  duration_human: "6m 18s"
  tasks_completed: 2
  commits: 4
  test_files_added: 3
  tests_added: 21
  tests_passing: 21
  full_compliance_suite: "74/74 (53 Plan-01 + 16 disclaimer + 5 pack-load)"
  files_created: 3
  files_modified: 2
  completed_at: "2026-04-25T14:31:53Z"
---

# Phase 7 Plan 02: PIPA Disclaimer Byte-Identity Lock + Korea Pack Auto-Load Tests Summary

Locked the Korean / English CEO-personal-liability disclaimer wording byte-identically between the primer file (canonical source-of-truth) and the renderer (`compliance-report.cjs`); added 5 deterministic-screen integration tests including the load-bearing B2B-SaaS-no-false-positive guard that prevents PIPA Art. 28-8 credibility-gradient overfiring.

## Tasks

### Task 1 — Disclaimer byte-identity lock + render-variant tests (`415fde2` + `61d4555`)

**RED commit `415fde2`:** Created `tests/brief-pipa-disclaimer-verbatim.test.cjs` (8 tests) and `tests/brief-compliance-disclaimer.test.cjs` (8 tests). Verbatim test failed because the primer file did NOT contain the canonical D-03 disclaimer block — only the abridged "Not legal advice" line. Renderer had it embedded but had no source-of-truth to mirror.

**GREEN commit `61d4555`:** Added a `## Verbatim CEO-Liability Disclaimer (D-03 Lock — DO NOT MODIFY)` section to `brief/references/compliance/korea/pipa-2026.md` containing both Korean and English disclaimer blocks verbatim per CONTEXT.md lines 1206-1223. Hardened `_stripBlockquotePrefix` test helper to handle JS-source escape sequences (`\n`) when comparing the renderer's `.cjs` literal against the primer's `.md` prose. All 16 tests now pass.

**Acceptance criteria all met:**
- `tests/brief-pipa-disclaimer-verbatim.test.cjs` exists and exits 0
- `tests/brief-compliance-disclaimer.test.cjs` exists with 8 tests (the plan asked for 4; we exceeded with footer-position + Pitfall #11 honorific-register tests)
- `grep -c "총매출의 10%" brief/bin/lib/compliance-report.cjs` = 1 (≥ 1)
- `grep -c "10% of total turnover" brief/bin/lib/compliance-report.cjs` = 1 (≥ 1)
- `grep -c "법적 자문이 아닙니다" brief/bin/lib/compliance-report.cjs` = 1 (≥ 1)
- `grep -c "not legal advice" brief/bin/lib/compliance-report.cjs` = 1 (≥ 1)

### Task 2 — Korea pack auto-load + Screen (a)/(b) integration (`4af70e9` + `1d63a53`)

**RED commit `4af70e9`:** Created `tests/brief-compliance-pack-load.test.cjs` (5 tests). All 5 failed at first because `runDeterministicScreen` only accepted the legacy 2-arg form `(cwd, opts)`; the plan contract requires single-arg `(opts)`. Test 3 (B2B SaaS no false positive) would have additionally failed even with the 2-arg form because the personal-data regex matches "PII" inside "No PII collected" and triggered Screen (b) blocking.

**GREEN commit `1d63a53`:** Two-part fix to `brief/bin/lib/compliance.cjs runDeterministicScreen`:

1. **Polymorphic signature** via `function runDeterministicScreen(...args)` with length detection. Both `runDeterministicScreen(cwd, opts)` and `runDeterministicScreen(opts)` work; `opts.cwd` defaults to `process.cwd()` in single-arg mode. Korea preference: `businessContext.region` (when string) > state-file detection — required so Plan-02 single-arg callers don't need an initialized `.planning/STATE.md`.

2. **Screen (b) false-positive guard.** Added denial-pattern regex matching `No PII`, `PII-free`, `no personal data`, `no PII collected`, `does not collect PII`, `does not process personal data`, `no personally identifiable information`, `개인정보 없음`, `개인정보 미수집`, `개인정보를 수집하지 않`. When denial pattern matches AND (`business_model` is `enterprise`/`b2b` OR no consumer-positive signal like `결제`, `customer signup`, `회원가입`), Screen (b) does NOT short-circuit. This is the load-bearing CEO-liability credibility-gradient mitigation per CONTEXT.md Risk Notes — overfiring on B2B SaaS infra erodes trust in the CEO-liability surface.

**Acceptance criteria all met:**
- `tests/brief-compliance-pack-load.test.cjs` exists with 5 tests (plan asked for 4; +1 acceptance test for businessContext-not-state-file read contract)
- `node --test tests/brief-compliance-pack-load.test.cjs` exits 0 — all 5 tests pass
- Test 3 (B2B SaaS no false positive) explicitly green
- `grep -c "compliance_packs" brief/bin/lib/compliance.cjs` = 2 (≥ 2)
- `grep -c "PIPA Art\\. 28-8" brief/bin/lib/compliance.cjs` = 2 (≥ 1)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] runDeterministicScreen signature mismatch**

- **Found during:** Task 2 RED phase (test infrastructure)
- **Issue:** Plan contract uses single-arg `runDeterministicScreen({...})`; existing implementation (Plan-01) uses 2-arg `runDeterministicScreen(cwd, {...})`. The legacy form is the canonical pattern across `align.cjs` and `audience.cjs`.
- **Fix:** Made the function polymorphic via `function (...args)` with length detection. Both forms supported. Backwards-compatible — all 53 Plan-01 tests still pass.
- **Files modified:** `brief/bin/lib/compliance.cjs` (runDeterministicScreen function only — single function signature change + opts destructure inline)
- **Commit:** `1d63a53`

**2. [Rule 1 - Bug] Personal-data regex false-positive on denial phrases**

- **Found during:** Task 2 RED phase (Test 3 specification analysis)
- **Issue:** Regex `(PII|...)` matches the string "PII" even inside "No PII collected" — meaning a B2B SaaS artifact that *explicitly declares it does not process PII* would have triggered the PIPA Art. 28-8 blocking finding. This is the exact CEO-liability credibility-gradient regression the Risk Notes warn against.
- **Fix:** Added a denial-pattern regex + business-model gate. Suppresses Screen (b) blocking when denial matches AND (business_model is non-consumer OR no consumer-positive signal). Preserves Screen (b) blocking on Korean B2C fintech (Test 2 still green).
- **Files modified:** `brief/bin/lib/compliance.cjs` (Screen (b) only)
- **Commit:** `1d63a53`

**3. [Rule 3 - Blocking] Test fixture isolation in tmpdir**

- **Found during:** Task 2 RED phase (test setup)
- **Issue:** Plan tests use `/tmp/objectives.md` directly; running tests in parallel could cause cross-test pollution.
- **Fix:** `_makeSandbox()` helper uses `fs.mkdtempSync(path.join(os.tmpdir(), 'brief-cc-pack-load-'))` so each test gets an isolated tmp directory.
- **Files modified:** `tests/brief-compliance-pack-load.test.cjs`
- **Commit:** `4af70e9`

**4. [Rule 1 - Bug] Test helper missed JS-source escape sequences**

- **Found during:** Task 1 GREEN phase (re-test after primer update)
- **Issue:** `_stripBlockquotePrefix` operated on real newlines but the renderer text (read via `fs.readFileSync` from .cjs source) contained `\n` as 2-character escape sequences inside the JS string literal. After whitespace normalization these became literal `\n` substrings, causing the byte-identity comparison to fail by-design.
- **Fix:** Added `.replace(/\\n/g, '\n')` as the first normalization step so JS-source escape sequences become real newlines before blockquote-prefix stripping.
- **Files modified:** `tests/brief-pipa-disclaimer-verbatim.test.cjs`
- **Commit:** `61d4555`

### Out-of-Scope Discoveries (logged, not addressed)

None — Plan 07-02 changes were tightly scoped to compliance.cjs, compliance-report.cjs, and the PIPA primer file; no peripheral systems surfaced new issues.

## TDD Gate Compliance

Per the `tdd="true"` flag on both tasks:

| Task | RED commit | GREEN commit | REFACTOR | Status |
|------|------------|--------------|----------|--------|
| 1 | `415fde2` test(07-02) | `61d4555` feat(07-02) | none needed | OK |
| 2 | `4af70e9` test(07-02) | `1d63a53` feat(07-02) | none needed | OK |

Both tasks have RED → GREEN gate sequence in git log. No REFACTOR commits — code remained clean after GREEN.

## Test Results

```
$ node --test tests/brief-pipa-disclaimer-verbatim.test.cjs tests/brief-compliance-disclaimer.test.cjs tests/brief-compliance-pack-load.test.cjs
ℹ tests 21
ℹ pass 21
ℹ fail 0
```

Full Phase-7 compliance suite (Plan 01 + Plan 02 deliverables):

```
$ node --test tests/brief-compliance-*.test.cjs tests/brief-pipa-disclaimer-verbatim.test.cjs tests/brief-korea-compliance-primers.test.cjs tests/brief-workstream-compliance.test.cjs
ℹ tests 108
ℹ pass 108
ℹ fail 0
```

(Note: 108 ≠ 74 from the runtime command in this session because the wildcard glob picks up additional tests like `brief-workstream-compliance.test.cjs` which scan all 9 workstream COMPLIANCE templates; total is invariant to exact glob pattern.)

## Threat Model Compliance

Two STRIDE threats from the plan's `<threat_model>` are now structurally mitigated:

| Threat ID | Category | Component | Mitigation |
|-----------|----------|-----------|------------|
| T-07-04 | Tampering | compliance-report.cjs disclaimer text | `tests/brief-pipa-disclaimer-verbatim.test.cjs` byte-identity test fires on any drift between primer (D-03 source-of-truth) and renderer literal |
| T-07-05 | Spoofing | runDeterministicScreen Screen (a) | `tests/brief-compliance-pack-load.test.cjs` Test 2 verifies Korea pack auto-load when state.brief.compliance_packs is set; Test 3 verifies the load-bearing B2B SaaS no-false-positive contract — credibility-gradient mitigation is structural |
| (covers also) | Information Disclosure | Disclaimer omission | `tests/brief-compliance-disclaimer.test.cjs` test cases assert disclaimer renders on COMPLIANCE-OK + FINDINGS-MATERIAL + FINDINGS-BLOCKING + empty packs (defense-in-depth: every gate output is canonical) |

## Files Modified Summary

| File | Change Type | Lines | Note |
|------|-------------|-------|------|
| `tests/brief-pipa-disclaimer-verbatim.test.cjs` | Created | 187 | Drift guard between primer + renderer |
| `tests/brief-compliance-disclaimer.test.cjs` | Created | 142 | 8 render-variant tests (Korean/English × decision matrix) |
| `tests/brief-compliance-pack-load.test.cjs` | Created | 179 | 5 Screen (a)/(b)/(c) integration tests |
| `brief/bin/lib/compliance.cjs` | Modified | +66 / -5 | Polymorphic signature + denial guard |
| `brief/references/compliance/korea/pipa-2026.md` | Modified | +33 / -0 | Verbatim D-03 disclaimer section added |

## Self-Check: PASSED

Files asserted to exist:
- `tests/brief-pipa-disclaimer-verbatim.test.cjs` — FOUND
- `tests/brief-compliance-disclaimer.test.cjs` — FOUND
- `tests/brief-compliance-pack-load.test.cjs` — FOUND
- `brief/references/compliance/korea/pipa-2026.md` — FOUND (modified, contains D-03 verbatim block)
- `brief/bin/lib/compliance.cjs` — FOUND (modified, polymorphic signature + denial guard)

Commits asserted to exist on branch:
- `415fde2` — FOUND
- `61d4555` — FOUND
- `4af70e9` — FOUND
- `1d63a53` — FOUND

All Plan 07-02 success criteria satisfied:
- 3 NEW test files committed
- Primer ↔ renderer disclaimer byte-identical (test green)
- Screen (a) pack-applicability + Screen (b) PIPA-evidence scoping verified
- Phase 7 D-03 + D-04 lock honored: Korea-only pack scope, verbatim CEO-liability disclaimer
- All commits use --no-verify (parallel-executor discipline)
