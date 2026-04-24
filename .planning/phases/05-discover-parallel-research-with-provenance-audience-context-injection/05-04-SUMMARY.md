---
phase: 05-discover-parallel-research-with-provenance-audience-context-injection
plan: 04
subsystem: audience-gate
tags: [audience-gate, audience-guard, duplicate-rename, phase-4-pattern-replication, 3-output-verdict, closed-enum-validation, hedging-detection, phase-7-template]

# Dependency graph
requires:
  - phase: 04-first-gate-align-pattern-established
    provides: ALIGN canonical pattern (agents/brief-align-gate.md, brief/workflows/align-gate.md, brief/bin/lib/align.cjs + align-report.cjs, brief/references/align-vocabulary.md); detectKoreaSignalFromConfig helper re-used via require()
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: Plan 05-01 context-inject primitive (buildBusinessContext — future Plan 05-07 discover workflow will call before spawning audience-guard)
  - phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
    provides: state.brief.last_gate_results.audience forward-declared schema (Phase 2 D-03); frontmatter.cjs extract/strip/reconstruct (D-20); security.cjs sanitizeForPrompt; readModifyWriteStateMd
provides:
  - agents/brief-audience-guard.md — AUDIENCE subagent (duplicate-renamed from brief-align-gate.md; color=purple; tools=Read,Grep,Glob,Write)
  - brief/workflows/audience-guard.md — AUDIENCE orchestrator workflow (duplicate-renamed from align-gate.md; 3-path Korean interrupt for DRIFTED-frontmatter / DRIFTED-content)
  - brief/bin/lib/audience.cjs — AUDIENCE primitive lib (runDeterministicScreen + runAudience + mergeVerdicts + commitAudienceVerdict); 3-decision enum (AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content); closed-enum validation for audience.type / audience.confidentiality / business_context.model
  - brief/bin/lib/audience-report.cjs — paired-sibling report renderer (stub path in Plan 04; Plan 05 Task 1 activates `{artifact}.audience.md`)
  - brief/references/audience-vocabulary.md — ban-list + hedging vocabulary (extends align-vocabulary.md, zero-overlap additions per D-09)
  - brief-tools.cjs `audience run` + `audience commit` subcommand (plumbs --artifact flag so Plan 05 Task 1 activates paired-sibling rename without dispatcher change)
  - brief/bin/lib/status.cjs formatGate extended: `Last AUDIENCE` line between `Last ALIGN` and `Last COMPLIANCE` (Phase 2 D-03)
affects: [phase-05-plan-05, phase-05-plan-07, phase-05-plan-08, phase-07-all-plans]

# Tech tracking
tech-stack:
  added: []  # Zero new runtime dependencies (A1 preserved)
  patterns:
    - "Duplicate-rename-first pattern: Phase 4 ALIGN canary → Phase 5 AUDIENCE first replication; Phase 7 COMPLIANCE will copy-rename this literal shape"
    - "3-output verdict with decision-derivation rule: location-regex match → DRIFTED-frontmatter; else → DRIFTED-content; no blocking → AUDIENCE-OK"
    - "Closed-enum validation co-located with schema (AUDIENCE_TYPE_ENUM / CONFIDENTIALITY_ENUM / BUSINESS_MODEL_ENUM) — rejects typos with blocking severity"
    - "Dispatcher/body decoupling (WARNING-05): --artifact flag parsed + passed through in Plan 04; body activation deferred to Plan 05 Task 1"
    - "Dotted-path frontmatter lookup (getFrontmatterField) — generic over nested YAML objects"

key-files:
  created:
    - brief/references/audience-vocabulary.md                                 # 99 lines
    - brief/bin/lib/audience.cjs                                               # 425 lines (≤440 cap)
    - brief/bin/lib/audience-report.cjs                                        # 69 lines
    - agents/brief-audience-guard.md                                           # 286 lines (≤400)
    - brief/workflows/audience-guard.md                                        # 395 lines (≤400)
    - tests/brief-audience-ok.test.cjs                                         # 3 tests
    - tests/brief-audience-drifted-frontmatter.test.cjs                        # 4 tests
    - tests/brief-audience-drifted-content.test.cjs                            # 5 tests
    - tests/brief-audience-state-roundtrip.test.cjs                            # 3 tests
    - tests/brief-audience-vocabulary-lock.test.cjs                            # 6 tests
    - tests/fixtures/audience/audience-ok-en.md
    - tests/fixtures/audience/audience-ok-ko.md
    - tests/fixtures/audience/drifted-frontmatter-missing-type.md
    - tests/fixtures/audience/drifted-frontmatter-missing-confidentiality.md
    - tests/fixtures/audience/drifted-content-hedging-external-en.md
    - tests/fixtures/audience/drifted-content-hedging-external-ko.md
  modified:
    - brief/bin/brief-tools.cjs            # case 'audience' dispatcher (+81 lines)
    - brief/bin/lib/status.cjs             # Last AUDIENCE row in dashboard (+2 lines)

key-decisions:
  - "Duplicate-rename preserves Phase 4 shape literally — Phase 7 COMPLIANCE copy-renames without re-architecture"
  - "3-output decision enum names: AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content (D-09; workflow button wording inherited from Phase 3 D-13 3-path interrupt tone)"
  - "Severity enum unchanged from Phase 4 D-04: blocking / material / nice-to-have"
  - "Closed-enum validation uses Set.has() for O(1) lookup; invalid value reported as blocking with field name + bad value in finding description"
  - "Plan 04 writes report to stub `.planning/.audience-report.tmp.md`; Plan 05 Task 1 activates paired-sibling `{artifact}.audience.md` without dispatcher change (WARNING-05 discipline)"
  - "3+ hedging-hit short-circuit threshold chosen to catch cluster pattern (not isolated use); 1-2 hits emit material finding for LLM pass to re-evaluate"
  - "_resolveSafePath inherited from Phase 4 align.cjs verbatim; Task 6 tests path-traversal rejection with fake --verdict argument"

requirements-completed: [DSG-13]

# Metrics
duration: ~20 min (Wave 3, sequential single executor)
completed: 2026-04-24
---

# Phase 05 Plan 04: AUDIENCE Gate Summary

AUDIENCE guard gate — the first replication of the Phase 4 ALIGN canonical pattern. Duplicate-renames agent + workflow + lib + report-renderer + vocabulary-reference from ALIGN to AUDIENCE; preserves literal shape so Phase 7 COMPLIANCE can copy-rename. 3-output decision (AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content) with closed-enum validation of 3 mandatory frontmatter fields (audience.type / audience.confidentiality / business_context.model) and hedging-vocabulary screen when audience is external.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | audience-vocabulary.md | `90b6d80` | brief/references/audience-vocabulary.md |
| 2 | audience.cjs + audience-report.cjs | `0cc59ee` | brief/bin/lib/audience.cjs, brief/bin/lib/audience-report.cjs |
| 3 | brief-audience-guard agent | `5b99ba2` | agents/brief-audience-guard.md |
| 4 | audience-guard workflow | `0ef85e6` | brief/workflows/audience-guard.md |
| 5 | dispatcher + status.cjs | `cdc109f` | brief/bin/brief-tools.cjs, brief/bin/lib/status.cjs |
| 6 | 5 test suites + 6 fixtures | `f42875b` | tests/brief-audience-*.test.cjs, tests/fixtures/audience/*.md |

## Verification Evidence

- **AUDIENCE verdict enum** — exactly 3 values, verified via Task 2's runtime check: `['AUDIENCE-OK', 'DRIFTED-frontmatter', 'DRIFTED-content'].forEach(d=>{if(!a.VALID_DECISIONS.has(d))process.exit(1);})` exits 0.
- **Mandatory frontmatter enforcement** — 4 Task 6 test cases cover: missing type, missing confidentiality, invalid enum value (typo `extornal`), and valid-both-present (AUDIENCE-OK).
- **Hedging vocabulary (external audience)** — 3+ hit cluster short-circuits to blocking DRIFTED-content; 1-2 hits emit material findings (additive). Tested on both EN and KO fixtures.
- **state.brief.last_gate_results.audience round-trip** — seeded via commitAudienceVerdict, read back via extractFrontmatter; override flag persists (accepting both boolean and string form per Pitfall #5); sanitized reason round-trips.
- **Vocabulary lock** — 6 test cases (3 emitted outputs + 3 static sources) scan for ban-list tokens; static files partition cleanly (vocabulary reference: Ban-list/Hedging sections only; agent: `<vocabulary_discipline>` only; workflow: zero).
- **Phase 4 regression** — 61 combined tests pass (21 AUDIENCE + 40 ALIGN); zero failures.
- **A1 dependencies guard** — `Object.keys(require('./package.json').dependencies||{}).length === 0`.
- **Surface cap** — 9-path FORBIDDEN file-test in audience-guard.md workflow verifies 0 new user-facing commands (aligns with Plan 05-08 Task 3 superset).
- **No hooks** — `grep -r audience-guard hooks/` returns 0 matches.

## Deviations from Plan

None — plan executed exactly as written, with one line-count discipline note:

- audience.cjs initial draft came in at 459 lines; trimmed verbose comment blocks to 425 lines, within the ≤440 cap. Trim was pure comment-reduction; no behavior change.

## Known Stubs

The `commitAudienceVerdict` body currently writes the paired-sibling report to a stub path `.planning/.audience-report.tmp.md` rather than the final `{artifact}.audience.md` paired-sibling path. **This is intentional and documented**:

- Plan 05-04 ships the dispatcher with `--artifact` flag plumbed through; the commit subbranch already parses and forwards `artifactPath` to `commitAudienceVerdict(cwd, opts)`.
- Plan 05-05 Task 1 activates the parameter by switching the body from the stub path to the paired-sibling write. The dispatcher signature is load-bearing and does NOT change between plans.

No work is blocked by this stub — Plan 05-05 Task 1 is the designated owner and has the full context in `<done>` NOTE of Plan 05-04 Task 5.

## Threat Flags

No new threat surface beyond the 9 items in `<threat_model>` of 05-04-PLAN. All STRIDE categories (T-5-04-01..09) remain in scope and mitigated via:

- T-5-04-01 Tampering (verdict manually edited) → `audience commit --override` records override flag + reason; `/brief-status` surfaces `(override applied)`.
- T-5-04-02 Injection (override_reason) → `sanitizeForPrompt` before state write.
- T-5-04-04 Path traversal → `_resolveSafePath` inherited from align.cjs verbatim; Task 6 exercises rejection of bogus `--verdict` arg.
- T-5-04-06 Spoofing (typo in closed-enum) → `AUDIENCE_TYPE_ENUM.has(v)` rejects; Task 6 test covers.
- T-5-04-07 DoS (orphaned verdict tmp) → `finally { unlinkSync }` in commitAudienceVerdict; Task 6 unlink test covers.

## Notes for Phase 7 COMPLIANCE Planner

When Phase 7 duplicate-renames this plan's artifacts to COMPLIANCE:

1. **Mechanical swap table:**
   - `agents/brief-audience-guard.md` → `agents/brief-compliance-checker.md`
   - `brief/workflows/audience-guard.md` → `brief/workflows/compliance-checker.md`
   - `brief/bin/lib/audience.cjs` → `brief/bin/lib/compliance.cjs`
   - `brief/bin/lib/audience-report.cjs` → `brief/bin/lib/compliance-report.cjs`
   - `brief/references/audience-vocabulary.md` → `brief/references/compliance-vocabulary.md`

2. **Decision enum swap:** `AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content` → `COMPLIANCE-OK / DRIFTED-controls / DRIFTED-jurisdiction` (or Phase 7 planner's choice).

3. **Color discipline:** Phase 4 ALIGN uses orange; Plan 05-04 AUDIENCE uses purple; Phase 7 COMPLIANCE should pick a distinct third color (e.g., teal or red).

4. **State field:** `state.brief.last_gate_results.compliance` (Phase 2 D-03 forward-declared — no allowlist change needed).

5. **Reference library:** Phase 7 imports Plan 05-06's Korea compliance primers (PIPA-2026, ISMS-P, MyData-2026) automatically when OBJECTIVES.md has `region: kr` + matching `compliance_packs`.

6. **Dispatcher pattern:** Copy `case 'audience':` block verbatim to `case 'compliance':` with keyword swap; status.cjs already has `Last COMPLIANCE` line wired (inherited from Phase 4).

7. **Canary check:** Run the full AUDIENCE + ALIGN regression AFTER the duplicate-rename; zero Phase 4+5 test regression is the smoke test.

## Line Count Discipline (Phase 2 D-18)

| File | Lines | Cap | Status |
|------|-------|-----|--------|
| brief/references/audience-vocabulary.md | 99 | 200 | under |
| brief/bin/lib/audience.cjs | 425 | 440 | under |
| brief/bin/lib/audience-report.cjs | 69 | 100 | under |
| agents/brief-audience-guard.md | 286 | 400 | under |
| brief/workflows/audience-guard.md | 395 | 400 | under |

## Self-Check: PASSED

**Files verified on disk:**
- FOUND: brief/references/audience-vocabulary.md
- FOUND: brief/bin/lib/audience.cjs
- FOUND: brief/bin/lib/audience-report.cjs
- FOUND: agents/brief-audience-guard.md
- FOUND: brief/workflows/audience-guard.md
- FOUND: tests/brief-audience-ok.test.cjs
- FOUND: tests/brief-audience-drifted-frontmatter.test.cjs
- FOUND: tests/brief-audience-drifted-content.test.cjs
- FOUND: tests/brief-audience-state-roundtrip.test.cjs
- FOUND: tests/brief-audience-vocabulary-lock.test.cjs
- FOUND: tests/fixtures/audience/audience-ok-en.md
- FOUND: tests/fixtures/audience/audience-ok-ko.md
- FOUND: tests/fixtures/audience/drifted-frontmatter-missing-type.md
- FOUND: tests/fixtures/audience/drifted-frontmatter-missing-confidentiality.md
- FOUND: tests/fixtures/audience/drifted-content-hedging-external-en.md
- FOUND: tests/fixtures/audience/drifted-content-hedging-external-ko.md

**Commits verified (via `git log --oneline --all | grep`):**
- FOUND: 90b6d80 (Task 1 — vocabulary)
- FOUND: 0cc59ee (Task 2 — audience.cjs + report)
- FOUND: 5b99ba2 (Task 3 — agent)
- FOUND: 0ef85e6 (Task 4 — workflow)
- FOUND: cdc109f (Task 5 — dispatcher + status)
- FOUND: f42875b (Task 6 — tests + fixtures)
