---
phase: 07-design-workstream-orchestration-compliance-checker
plan: 01
subsystem: gates
tags: [compliance, pipa, isms-p, mydata, gate, evaluator-optimizer, paired-sibling, vocabulary-lock]

# Dependency graph
requires:
  - phase: 04-first-gate-align-pattern-established
    provides: "ALIGN canonical evaluator-optimizer triad (agent + workflow + lib + report); detectKoreaSignalFromConfig helper; 3-output verdict shape; 3-path interrupt pattern"
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: "AUDIENCE second canonical instance (agent + workflow + lib + report); paired-sibling _siblingReportPath; buildBusinessContext() in context-inject.cjs; Korea compliance primer files (PIPA / ISMS-P / MyData)"
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: "gap-detect.cjs precedent for re-exporting siblingReportPath from audience.cjs (no fork)"
provides:
  - "COMPLIANCE checker triad (third canonical evaluator-optimizer instance)"
  - "agents/brief-compliance-checker.md — subagent template with COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING verdict enum + CC-01 clause-level extension fields (regulation_clause / required_evidence / found_in_artifact / gap)"
  - "brief/workflows/compliance.md — gate orchestrator (Step 0/1/2/3/4/5/6/7) with Phase 7 D-01 LOAD-BEARING DEVIATION: FINDINGS-MATERIAL routes to Step 4 commit (NO interrupt)"
  - "brief/bin/lib/compliance.cjs — primitives library (validators, deterministic screen w/ pack-applicability + PIPA-evidence + ban-list sub-screens, mergeVerdicts with FINDINGS-MATERIAL preservation, runCompliance, commitComplianceVerdict)"
  - "brief/bin/lib/compliance-report.cjs — report renderer with mandatory CEO-personal-liability disclaimer footer (verbatim PIPA Korean + English)"
  - "brief/references/compliance-vocabulary.md — extends Phase 5 audience-vocabulary with COMPLIANCE-specific ban-list (compliant, passed, compliance verified, audit complete, compliance OK as prose, 감사 완료, 컴플라이언스 확인 완료)"
  - "brief/bin/brief-tools.cjs case 'compliance' dispatcher block (run / commit subcommands)"
  - "6 Wave 0 tests: vocabulary-lock, canonical-shape, no-hooks, verdict, sibling-path, merge-rule"
affects: [07-02, 07-03, 07-04, 07-05, 07-06, 07-07, 07-08, design-orchestrator, workstream-templates]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Third canonical evaluator-optimizer gate instance (after Phase 4 ALIGN + Phase 5 AUDIENCE; gap-detect is fourth in spirit)"
    - "Phase 7 D-01 LOAD-BEARING DEVIATION: material findings preserve distinct FINDINGS-MATERIAL verdict — NOT collapsed to OK as Phase 4/5 do (CC-01 mandates findings on every artifact)"
    - "Verbatim regulatory-citation disclaimer footer rendered by report renderer (not authored in workflow prose); ban-list test exempts the disclaimer block"
    - "siblingReportPath re-exported from audience.cjs (no fork) — gap-detect.cjs precedent for canonical helper reuse"
    - "Conditional required_reading injection (Korea compliance primers loaded only when state.brief.compliance_packs match)"
    - "Deterministic screen 3-sub-screens pattern: (a) pack-applicability pass-through, (b) PIPA hard-required-evidence short-circuit, (c) ban-list grep additive-only"

key-files:
  created:
    - "brief/references/compliance-vocabulary.md"
    - "brief/bin/lib/compliance.cjs"
    - "brief/bin/lib/compliance-report.cjs"
    - "agents/brief-compliance-checker.md"
    - "brief/workflows/compliance.md"
    - "tests/brief-compliance-vocabulary-lock.test.cjs"
    - "tests/brief-compliance-canonical-shape.test.cjs"
    - "tests/brief-compliance-no-hooks.test.cjs"
    - "tests/brief-compliance-verdict.test.cjs"
    - "tests/brief-compliance-sibling-path.test.cjs"
    - "tests/brief-compliance-merge-rule.test.cjs"
  modified:
    - "brief/bin/brief-tools.cjs (added case 'compliance' dispatcher)"

key-decisions:
  - "color: pink for brief-compliance-checker — red collides with brief-gap-detector; orange collides with brief-align-gate; pink is unused"
  - "Vocabulary-lock test exempts the _disclaimerFooter function body in compliance-report.cjs (verbatim PIPA regulatory citation, not gate prose)"
  - "Vocabulary-lock test exempts BAN_EN/BAN_KO/BAN_SYMBOL regex literals + their adjacent describing line-comments in compliance.cjs (they ARE the ban-list pattern definitions)"
  - "Force-accept override floor: ≥20 non-whitespace chars (Phase 6 D-08 inheritance) — stricter than Phase 5 audience floor (non-empty), per Phase 7 D-03 CEO-liability stakes"
  - "Compliance vocabulary file omits the `## Hedging vocabulary` sections that audience-vocabulary.md ships — compliance has different signal vectors (clause coverage, not audience drift)"

patterns-established:
  - "Phase 7 D-01 LOAD-BEARING DEVIATION pattern: when canonical pattern needs domain-specific divergence, mark explicitly in code comment + structural test + summary, so future canonical-pattern instances inherit ALIGN/AUDIENCE merge rule rather than COMPLIANCE merge rule by default"
  - "Verbatim regulatory disclaimer pattern: report renderer holds the verbatim regulatory citation; vocabulary-lock test exempts it; workflow + agent prose never reproduce it"
  - "Conditional required_reading pattern: agent prompt declares pack-conditional reads (PIPA / ISMS-P / MyData) loaded only when state.brief.compliance_packs match — buildBusinessContext().requiredReading drives the actual file injection at spawn time"

requirements-completed: [CC-01]

# Metrics
duration: 14min
completed: 2026-04-25
---

# Phase 07 Plan 01: COMPLIANCE Checker Triad Summary

**Third canonical evaluator-optimizer gate instance — agent + workflow + compliance.cjs + compliance-report.cjs + dispatcher + 6 Wave 0 tests, with the LOAD-BEARING DEVIATION (FINDINGS-MATERIAL preserves distinct verdict, not collapsed to COMPLIANCE-OK) tested structurally and the mandatory verbatim PIPA CEO-personal-liability disclaimer rendering on every emitted .compliance.md.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-04-25T13:57:24Z
- **Completed:** 2026-04-25T14:11:27Z
- **Tasks:** 3
- **Files created:** 11 (6 source files + 6 test files; 1 modified)

## Accomplishments

- Shipped `agents/brief-compliance-checker.md` (318 lines) with the canonical 7-section shape (`<role>`, `<required_reading>`, `<vocabulary_discipline>`, `<decision_mechanism>`, `<output_contract>`, `<process>`, `<examples>`), 3 verdict-enum-correct examples, and conditional Korea compliance pack required_reading.
- Shipped `brief/workflows/compliance.md` (375 lines) with Step 0/1/2/3/4/5/6/7 mirroring `audience-guard.md` plus the Phase 7 D-01 LOAD-BEARING DEVIATION: FINDINGS-MATERIAL routes to Step 4 commit (NO interrupt) — only FINDINGS-BLOCKING triggers the 3-path interrupt.
- Shipped `brief/bin/lib/compliance.cjs` (358 lines, ≤400 cap) with verdict-enum swap (COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING), 3-sub-screen deterministic pass (pack-applicability / PIPA hard-required-evidence / ban-list), CC-01 clause-level extension fields in `validateVerdict`, and `mergeVerdicts` LOAD-BEARING DEVIATION (material → FINDINGS-MATERIAL).
- Shipped `brief/bin/lib/compliance-report.cjs` (68 lines, ≤100 cap) with mandatory verbatim CEO-personal-liability disclaimer footer (Korean when `region: kr`, English otherwise), 3 severity-grouped sections (Documented obligations addressed / Obligations needing further work / Obligations BRIEF cannot verify), and CC-01 clause-level sub-bullet rendering (regulation_clause / required_evidence / found_in_artifact / gap).
- Shipped `brief/references/compliance-vocabulary.md` (90 lines) extending Phase 5 audience-vocabulary with the COMPLIANCE-specific ban-list (`compliance verified`, `audit complete`, `compliance OK` as prose, `감사 완료`, `컴플라이언스 확인 완료`) plus a `## Clause-level findings format (CC-01 contract)` section documenting the four optional extension fields.
- Registered `case 'compliance':` in `brief/bin/brief-tools.cjs` with `run` + `commit` subcommands paralleling the `audience` dispatcher.
- Shipped 6 Wave 0 tests with 33 sub-tests, all green, including the LOAD-BEARING DEVIATION enforcement test that asserts `mergeVerdicts([{severity: 'material'}], null).decision === 'FINDINGS-MATERIAL'`.
- End-to-end smoke test verified: pack-applicability pass-through → COMPLIANCE-OK; Korean PII without evidence → FINDINGS-BLOCKING with PIPA Art. 28-8 finding; commit round-trip renders Korean disclaimer + clause-level sub-bullets + 3 severity sections.

## Task Commits

Each task was committed atomically (with `--no-verify` per parallel-executor protocol):

1. **Task 1: Vocabulary + 3 Wave 0 test scaffolds** - `781f850` (feat)
2. **Task 2: compliance.cjs + compliance-report.cjs + 3 unit tests** - `2f57bba` (feat)
3. **Task 3: Agent + workflow + dispatcher** - `a034cce` (feat)

## Files Created/Modified

- `brief/references/compliance-vocabulary.md` — Phase 7 ban-list authoritative source; loaded as required_reading by brief-compliance-checker
- `brief/bin/lib/compliance.cjs` — gate primitives (358 lines) with LOAD-BEARING DEVIATION in mergeVerdicts and 3-sub-screen deterministic pass
- `brief/bin/lib/compliance-report.cjs` — report renderer (68 lines) with mandatory verbatim PIPA disclaimer footer
- `agents/brief-compliance-checker.md` — subagent template (318 lines) with conditional Korea compliance pack required_reading
- `brief/workflows/compliance.md` — gate orchestrator (375 lines) with Phase 7 D-01 NO-interrupt-on-MATERIAL routing
- `brief/bin/brief-tools.cjs` — added case 'compliance' dispatcher (78 lines) parallel to case 'audience'
- `tests/brief-compliance-vocabulary-lock.test.cjs` — 5 audit globs (vocabulary file + agent + workflow + lib + report); ban-list-section + regex/comment + verbatim-disclaimer exemptions
- `tests/brief-compliance-canonical-shape.test.cjs` — asserts 7 H2/XML sections in agent + 14 canonical exports in lib + 7-step structure in workflow
- `tests/brief-compliance-no-hooks.test.cjs` — Anti-pattern #2 grep audits (compliance-checker AND brief/workflows/compliance not referenced from hooks/)
- `tests/brief-compliance-verdict.test.cjs` — 10 sub-tests for verdict-enum swap + CC-01 clause-level extension field acceptance + non-string-rejection
- `tests/brief-compliance-sibling-path.test.cjs` — 5 sub-tests including function-identity check (compliance.siblingReportPath === audience.siblingReportPath)
- `tests/brief-compliance-merge-rule.test.cjs` — 8 sub-tests for the LOAD-BEARING DEVIATION (material-only → FINDINGS-MATERIAL, NOT collapsed to OK)

## Decisions Made

- **color: pink for brief-compliance-checker** — Plan 07-01 recommended `red` (gap-detector) or `orange` (align-gate) as fallback; both collide with existing agents. Pink is unused across the agent catalog.
- **Vocabulary-lock test exemptions extended beyond Plan 07-01 spec** — Plan instructed exempting `## Ban-list*` sections in the vocabulary file (audience-vocabulary precedent). The compliance.cjs file required an additional exemption for the BAN_EN/BAN_KO regex line-comments adjacent to the regex literals (the comments describe the ban-list and reusing the audience exemption pattern would have left them unguarded). The compliance-report.cjs file required exempting the entire `_disclaimerFooter` function body since it holds verbatim regulatory citation text (which mandatorily contains `위반` because PIPA Art. 64-2 Korean text uses the term).
- **Compliance vocabulary file does NOT inherit Phase 5 hedging-vocabulary sections** — audience-vocabulary's hedging sections detect external-audience drift; compliance has a different signal vector (clause coverage, not audience drift). The `## Hedging vocabulary (EN)` and `## Hedging vocabulary (KO)` sections were intentionally dropped from the copy-rename per Plan 07-01 Task 1 instruction step 7.
- **`compliance.cjs runDeterministicScreen` accepts `businessContext` opt** — Plan 07-01 Task 2 instruction step 1 added the `buildBusinessContext` import for compliance-pack-aware screening. The signature accepts an optional `businessContext` to allow tests to inject a deterministic context (avoids reading config.json each call) while production callers omit it and runDeterministicScreen invokes buildBusinessContext directly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Korean preferred-vocabulary line in compliance-vocabulary.md leaked the ban-token `위반`**
- **Found during:** Task 1 (vocabulary-lock test execution)
- **Issue:** The verbatim Korean PIPA disclaimer text `"위반 시 대표이사 개인 책임이 발생할 수 있으며"` was inlined into the `## Preferred vocabulary (KO)` section per Plan 07-01 Task 1 step 2. The vocabulary-lock test (correctly) flagged `위반` as appearing outside the `## Ban-list*` sections.
- **Fix:** Reworded the Korean line to describe the disclaimer's intent without quoting the ban-token verbatim — the disclaimer text itself lives in compliance-report.cjs `_disclaimerFooter` (where the vocabulary-lock exemption applies because it's verbatim regulatory citation, not gate prose).
- **Files modified:** `brief/references/compliance-vocabulary.md`
- **Verification:** vocabulary-lock test re-ran green; the load-bearing PIPA disclaimer text remains verbatim in compliance-report.cjs where it belongs.
- **Committed in:** `781f850` (Task 1 commit)

**2. [Rule 1 - Bug] compliance-report.cjs initial draft was 127 lines (>100 cap)**
- **Found during:** Task 2 (acceptance-criterion line-count check)
- **Issue:** First draft expanded the audience-report.cjs structure verbatim while adding the disclaimer footer + clause-level sub-bullets + 3 severity-grouped sections. Result was 127 lines, breaking the Plan 07-01 ≤100 cap.
- **Fix:** Compressed via (a) collapsing repeated `korea ? ko : en` ternaries into a `lbl(ko, en)` helper closure, (b) inline-joining disclaimer multi-line strings into single string literals with `\n`, (c) removing per-section comment blocks, (d) extracting `renderGroup` for the empty-message branch. Result: 68 lines, well under cap.
- **Files modified:** `brief/bin/lib/compliance-report.cjs`
- **Verification:** `wc -l` returns 68; all output structure preserved (verified via end-to-end smoke test rendering Korean + English disclaimers and 3-section severity grouping).
- **Committed in:** `2f57bba` (Task 2 commit)

**3. [Rule 1 - Bug] compliance.cjs comment line referenced AUDIENCE-OK enum verbatim**
- **Found during:** Task 2 (acceptance-criterion `grep -c "AUDIENCE-OK"` check)
- **Issue:** A code-comment in compliance.cjs `mergeVerdicts` originally read "Phase 4 ALIGN + Phase 5 AUDIENCE collapse material+nice-to-have into ALIGNED/AUDIENCE-OK" — using the literal Phase 5 enum string. Plan 07-01 acceptance criterion required `grep -c "AUDIENCE-OK\|DRIFTED-frontmatter\|DRIFTED-content"` returns 0.
- **Fix:** Reworded the comment to "into the prior gates' OK verdicts" without naming the verbatim enum string.
- **Files modified:** `brief/bin/lib/compliance.cjs`
- **Verification:** `grep -c "AUDIENCE-OK\|DRIFTED-frontmatter\|DRIFTED-content"` returns 0.
- **Committed in:** `2f57bba` (Task 2 commit)

**4. [Rule 1 - Bug] Agent example-3 used the verb "passed" outside the vocabulary_discipline block**
- **Found during:** Task 3 (vocabulary-lock test execution)
- **Issue:** Example 2 in `agents/brief-compliance-checker.md` `<examples>` block originally read "Deterministic screen (a) — pack-applicability — passed through because..." — `passed` is a Phase 7 ban-list token outside the `<vocabulary_discipline>` block.
- **Fix:** Reworded to "Deterministic screen (a) — pack-applicability — short-circuited through pass-through mode because..." which preserves the technical meaning without the ban-token.
- **Files modified:** `agents/brief-compliance-checker.md`
- **Verification:** vocabulary-lock test re-ran green; all 33 Wave 0 sub-tests pass.
- **Committed in:** `a034cce` (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (Rule 1 bugs × 3, Rule 3 blocking × 1)
**Impact on plan:** All four auto-fixes were structural-correctness fixes that the test suite caught — no scope creep. The vocabulary-lock test enforcement is doing exactly what Phase 7 D-01 requires (Pitfall #4 vocabulary theater prevention).

## Issues Encountered

None — every issue surfaced was either caught by the structural tests (deviations 1, 3, 4) or the line-count acceptance criterion (deviation 2), exactly the failure modes the Plan was designed to enforce.

## TDD Gate Compliance

Plan 07-01 specified `tdd="true"` on all 3 tasks. Wave 0 test scaffolds were committed in Task 1 (with skip predicates for files Tasks 2-3 would land), then promoted to passing as Tasks 2 + 3 landed their source files. RED → GREEN cadence:

- **RED (Task 1):** Wave 0 test files committed. 3 tests pass (vocabulary-lock, no-hooks, no-hooks); 7 skipped pending Task 2/3 outputs.
- **GREEN-1 (Task 2):** compliance.cjs + compliance-report.cjs landed; verdict + sibling-path + merge-rule + lib-vocabulary-lock + lib-canonical-shape tests promoted to passing (5 of the 7 prior skips).
- **GREEN-2 (Task 3):** agent + workflow + dispatcher landed; remaining 2 skips (agent-canonical-shape + workflow-vocabulary-lock + agent-vocabulary-lock + workflow-canonical-shape) promoted. All 33 sub-tests green.

Each task carries its own `feat(07-01)` commit per Plan 07-01 atomic commit instruction; no separate `test(...)` and `feat(...)` commits because the planner specified each task's tests as part of the same task's `<files>` list.

## User Setup Required

None — no external service configuration required. The compliance-vocabulary.md ban-list grows as Phase 7 execution surfaces LLM creative avoidance per the file's own "Notes for reviewers" section.

## Next Phase Readiness

- **Plan 07-02 (state allowlist + workstream loader extension)** — can now write `state.brief.last_gate_results.compliance` via the commitComplianceVerdict path. The shape mirrors `last_gate_results.audience` exactly (decision / severity / findings_count / at / override / override_reason).
- **Plan 07-03 (`/brief-design` orchestrator + `brief/workflows/design.md`)** — can thread `brief/workflows/compliance.md` as the third sequential gate (ALIGN → AUDIENCE → COMPLIANCE) per Phase 7 D-02. The dispatcher is already registered.
- **Plan 07-08 (final vocabulary lock + surface-cap audit + canary)** — can extend the existing 6 tests with end-to-end fixture-based tests (full design cycle on a Korea-first B2C fintech fixture expecting `canvas.compliance.md` with FINDINGS-MATERIAL because PIPA pack triggers).

No blockers.

## Self-Check: PASSED

All claimed files verified to exist:
- `brief/references/compliance-vocabulary.md` — 90 lines, present
- `brief/bin/lib/compliance.cjs` — 358 lines, present
- `brief/bin/lib/compliance-report.cjs` — 68 lines, present
- `agents/brief-compliance-checker.md` — 318 lines, present
- `brief/workflows/compliance.md` — 375 lines, present
- `brief/bin/brief-tools.cjs` — modified (case 'compliance' present, line ~640)
- 6 test files in `tests/brief-compliance-*.test.cjs` — all present, 33 sub-tests pass, 0 skips

All claimed commits verified to exist:
- `781f850` (Task 1 commit) — present in git log
- `2f57bba` (Task 2 commit) — present in git log
- `a034cce` (Task 3 commit) — present in git log

End-to-end smoke test passed: pack-applicability + PIPA-evidence + commit round-trip all behaviors verified.

---
*Phase: 07-design-workstream-orchestration-compliance-checker*
*Completed: 2026-04-25*
