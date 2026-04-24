---
phase: 05-discover-parallel-research-with-provenance-audience-context-injection
plan: 08
subsystem: canary-e2e-anti-pattern-and-surface-cap-audit
tags: [canary-e2e, anti-pattern-2, surface-cap, a1-preservation, phase-5-closure, integration-test, structural-audit, phase-7-template]

# Dependency graph
requires:
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: |
      Plan 05-01 buildBusinessContext() STABLE API (consumed by canary E2E Step 1);
      Plan 05-02 brief-domain-researcher + 2 golden fixtures (injected as research
      output in canary E2E Steps 2-5);
      Plan 05-03 hooks/brief-validate-provenance.sh (asserted present in Phase 5
      file manifest + hook-inventory audit);
      Plan 05-04 runAudience + commitAudienceVerdict + audience-guard.md + 9-path
      FORBIDDEN list <command_surface_assertion> (canary E2E + Surface Cap audit
      superset alignment);
      Plan 05-05 _siblingReportPath paired-sibling scheme (canary E2E Step 3
      assertion target);
      Plan 05-06 3 Korea compliance primer paths (manifest assertion);
      Plan 05-07 brief/workflows/discover.md full body + <no_hooks_assertion>
      (Anti-pattern #2 grep target + discover.md assertion test)
  - phase: 04-first-gate-align-pattern-established
    provides: |
      tests/brief-align-canary.test.cjs (Phase 4 canary test shape template);
      tests/brief-align-no-hook.test.cjs (Anti-pattern #2 structural test
      template — duplicate-renamed to AUDIENCE verbatim)
provides:
  - "tests/brief-discover-canary-e2e.test.cjs — 6-test integration pass (~130ms)"
  - "tests/brief-audience-no-hook.test.cjs — 5-test structural guarantee that AUDIENCE never becomes a hook"
  - "tests/brief-discover-no-new-command.test.cjs — 5-test Surface Cap audit + A1 preservation guard"
  - "Phase 5 closed: 10 requirements (DSC-01..07, DSG-13, CC-02, CC-04) all covered collectively by Plans 02-07 + this plan's structural guarantees"
  - "Canonical Phase 7 COMPLIANCE template: the 3 test files copy-rename verbatim once the gate name swaps (compliance-guard.md / compliance.cjs / etc.)"
affects:
  - phase-06-plan-* (return stack reads state.brief.last_gate_results.audience — canary proves this round-trips)
  - phase-07-all-plans (COMPLIANCE duplicate-renames Plan 05-04 AUDIENCE gate + Plan 05-08 hook/surface-cap audit shape)
  - phase-09-hrd-01 (cross-runtime smoke: runtime 4-wide parallelism verification deferred — canary's wave-partition is unit-level only)
  - phase-09-hrd-02 (Surface Cap audit: Phase 5 adds zero user-facing commands — the Phase 9 reduction targets the inherited 61-command surface, not this phase's adds)

# Tech tracking
tech-stack:
  added: []  # Zero new runtime dependencies (A1 preserved — test-only plan)
  patterns:
    - "In-process canary E2E: require() the lib, inject fixtures, assert state/sibling/vocabulary — no child_process, no live LLM; runtime ≤1s per subsystem"
    - "Anti-pattern #2 structural test as durable invariant: grep hooks/ for subsystem refs; any regression fires on next full-suite run"
    - "Surface Cap FORBIDDEN enum alignment: test's 9-path list mirrors the 9-path assertion baked into brief/workflows/audience-guard.md <command_surface_assertion>"
    - "A1 preservation test as single-line sentinel: JSON.parse(package.json).dependencies count === 0"
    - "Hook-inventory closed-set audit: ALLOWED list (inherited + Plan 03 addition) catches unexpected Phase 5 hook additions before they silently ship"

key-files:
  created:
    - tests/brief-discover-canary-e2e.test.cjs                    # 393 lines, 6 tests
    - tests/brief-audience-no-hook.test.cjs                       # 150 lines, 5 tests
    - tests/brief-discover-no-new-command.test.cjs                # 159 lines, 5 tests
  modified: []  # Pure test addition — no source code or workflow markdown touched

key-decisions:
  - "findings_count tolerance on state round-trip: Plan 04 commitAudienceVerdict writes findings_count as number, but D-20 YAML serializer round-trips it as string '0' on re-read (Pitfall #4). Canary Step 3 asserts shape (decision + at present) rather than exact findings_count type — mirrors tests/brief-align-canary.test.cjs Test 1 tolerance."
  - "In-process canary (no child_process): runtime 130ms for 6 tests + 17s budget for all 16 Plan 05-08 tests. 05-CONTEXT §Canary Scope capped at 60s; well under. Live-LLM parallelism verification (runtime 4-wide wall-clock) deferred to Phase 9 HRD-01 cross-runtime smoke per 05-CONTEXT Risk Notes."
  - "Surface Cap FORBIDDEN enumeration is 9 paths (matches Plan 05-04 audience-guard.md <command_surface_assertion> 9-path list verbatim). Enforcement is filesystem-level; workflow-markdown-level enforcement is in audience-guard.md + discover.md <command_surface_assertion> blocks. Dual-layer catches both accidental file creation AND workflow-markdown drift."
  - "A1 preservation test lives in the Surface Cap file (not its own file) — the two invariants are conceptually unified (both catch scope creep): a new user-facing command OR a new runtime dep both signal Phase 5 overreach."

patterns-established:
  - "Phase closure pattern: final-wave plan consists of integration test (canary E2E) + 2 structural audits (Anti-pattern #2 + Surface Cap) + A1 preservation sentinel — Phase 7/8 closure plans copy this shape"
  - "Canary E2E fixture reuse: Plan 02's researcher golden fixtures double as Plan 08's stub-injected research output, avoiding fixture-drift between plan-internal and integration testing"
  - "Structural-audit-as-test: grep-in-test patterns (execSync grep + JS includes()) treat filesystem state as durable invariants; any regression fires on next suite run"

requirements-completed: []  # Phase 5 requirements all covered collectively by Plans 02-07 tests; Plan 08 contributes integration pass + structural guarantees, not new requirement coverage

# Metrics
duration: ~8 min (Wave 6, sequential single executor)
completed: 2026-04-23
---

# Phase 05 Plan 08: Canary E2E + Anti-pattern #2 + Surface Cap Summary

Final-wave Phase 5 closure plan. Ships 3 test files (16 tests total) that exercise
the full DISCOVER flow end-to-end (context-inject → researcher stub → AUDIENCE →
paired-sibling → STATE round-trip → vocabulary lock) and lock two structural
guarantees for downstream phases: (1) AUDIENCE is an orchestrator step not a
hook (Anti-pattern #2 grep-audit), and (2) Phase 5 adds zero user-facing slash
commands (Surface Cap FORBIDDEN enum). Also preserves A1 zero-runtime-deps rule
at the filesystem level. No new source code; all 3 files are test / audit only.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Canary E2E test — simulated 2-category flow through full pipeline (6 tests) | `dbfdb40` | tests/brief-discover-canary-e2e.test.cjs |
| 2 | Anti-pattern #2 structural test — AUDIENCE is orchestrator-step, never a hook (5 tests) | `0e76985` | tests/brief-audience-no-hook.test.cjs |
| 3 | Surface Cap audit — Phase 5 adds 0 user-facing slash commands + A1 preservation (5 tests) | `8b9691e` | tests/brief-discover-no-new-command.test.cjs |

## Verification Evidence

### Task 1 — Canary E2E
- `node --test tests/brief-discover-canary-e2e.test.cjs` exits 0 (6 pass, 0 fail, **~130ms**).
- **Step 1** asserts `buildBusinessContext({cwd: KR-B2B-fintech})` returns `business_model='b2b'`, `region='kr'`, `language='ko'`, `compliance_packs=['PIPA','ISMS-P']`, `requiredReading` includes both `pipa-2026.md` and `isms-p.md`, and `promptBlock` contains the XML delimiters.
- **Step 2** asserts the Plan 02 B2B market-sizing fixture flows through `runAudience` → `AUDIENCE-OK`, `severity ∈ {nice-to-have, material}`.
- **Step 3** asserts `commitAudienceVerdict` creates `market-sizing.audience.md` paired-sibling (D-11) + populates `state.brief.last_gate_results.audience` with decision/severity/at (D-10 round-trip).
- **Step 4** asserts the AUDIENCE sibling content contains ZERO ban-list tokens (EN: `compliant|passed|violation|failed`; KO: `준수|통과|위반|실패`; symbols: `✅|✓|✗`) — vocabulary-lock enforced end-to-end.
- **Step 5** asserts 2-category sequential flow: market-sizing (B2B) then competitor-landscape (B2C) through the pipeline; `state.audience.at` of second ≥ first (last-writer-wins); both siblings exist on disk.
- **Step 6** asserts the Phase 5 file manifest — all 12 required files (context-inject.cjs, audience.cjs, audience-report.cjs, audience-vocabulary.md, pipa-2026.md, isms-p.md, mydata-2026.md, brief-domain-researcher.md, brief-audience-guard.md, audience-guard.md, discover.md, brief-validate-provenance.sh) are present on disk.
- Acceptance grep-counts all pass: buildBusinessContext|runAudience|commitAudienceVerdict=21 (≥3), `market-sizing.audience.md`=4 (≥1), `last_gate_results.*audience`=8 (≥1), ban-list patterns=6 (≥3).

### Task 2 — Anti-pattern #2 structural audit
- `node --test tests/brief-audience-no-hook.test.cjs` exits 0 (5 pass, 0 fail, **~216ms**).
- **Test 1** runs `grep -rE "audience-guard|audience_guard|brief-audience-guard|audience.cjs" hooks/` over hooks/ — returns zero matches. Every hook file verified via direct grep.
- **Test 2** scans `.claude/hooks/config.json` and `hooks/config.json` (if present) for case-insensitive `audience` — passes vacuously in current repo (no such config file exists).
- **Test 3** enumerates every `audience-guard.md` reference outside `.planning/` and `node_modules/` and asserts each routes through `brief/workflows/|agents/|commands/brief/|.planning/|tests/|brief/bin/lib/` — and NEVER from `hooks/`.
- **Tests 4 + 5** assert both `brief/workflows/audience-guard.md` and `brief/workflows/discover.md` carry the `<no_hooks_assertion>` block or equivalent `NO PostToolUse` / `NOT a hook` phrase adjacent to the surface.
- Acceptance grep-counts all pass: `hooks/`=11 (≥1), `no_hooks_assertion|NOT a hook`=11 (≥2), audience subsystem refs=14 (≥3).

### Task 3 — Surface Cap + A1 audit
- `node --test tests/brief-discover-no-new-command.test.cjs` exits 0 (5 pass, 0 fail, **~57ms**).
- **Test 1** enumerates the 9 FORBIDDEN filenames (audience.md / audience-check.md / audience-guard.md / reaudit.md / realign.md / discover-audit.md / provenance.md / provenance-check.md / context-inject.md) and asserts each is absent from `commands/brief/`.
- **Test 2** asserts `commands/brief/discover.md` exists (Phase 3 stub, Plan 05-07 body replacement preserved).
- **Test 3** re-enumerates `commands/brief/` on disk and asserts the intersection with FORBIDDEN is empty (trap detector for future plans that might sneak a file in).
- **Test 4** enumerates `hooks/` and asserts every `.sh`/`.js` file is in the ALLOWED inventory (12 inherited + brief-validate-provenance.sh from Plan 03).
- **Test 5** asserts `Object.keys(require('./package.json').dependencies||{}).length === 0` — A1 zero-runtime-deps rule preserved.
- Acceptance grep-counts all pass: FORBIDDEN enum tokens=13 (≥9), A1/dependencies pattern=7 (≥1), `brief-validate-provenance.sh`=4 (≥1).

### Full-Phase-5 Regression
- `node --test tests/brief-discover-*.test.cjs tests/brief-audience-*.test.cjs tests/brief-provenance-*.test.cjs tests/brief-context-inject-*.test.cjs tests/brief-researcher-*.test.cjs tests/brief-korea-compliance-primers.test.cjs tests/brief-align-filename-migration.test.cjs` → exits 0.
  - **152 tests pass, 0 fail, 1 suite (no skipped/cancelled/todo), total runtime 1.66s.**
  - Well under the 180s budget (05-VALIDATION.md sampling rate target).
- All Plan 01 round-trip (5) + Plan 02 researcher smoke/partition/provenance/B2B-vs-B2C (27) + Plan 03 provenance (22) + Plan 04 AUDIENCE (21) + Plan 05 sibling-filename/migration (15) + Plan 06 Korea primers (20) + Plan 07 discover-workflow audits (27) + Plan 08 new (16) tests green together.

### Phase 4 Regression (zero drift after D-12 migration)
- `node --test tests/brief-align.test.cjs tests/brief-align-primitives.test.cjs tests/brief-align-canary.test.cjs tests/brief-align-vocabulary-lock.test.cjs tests/brief-align-no-hook.test.cjs tests/brief-align-text-mode.test.cjs` → **50 tests pass, 0 fail, 113ms**.
- Plan 05-05's D-12 ALIGN filename migration (`OBJECTIVES.align.md`) leaves all Phase 4 ALIGN behavioral tests green.

### Phase 3 Regression
- `node --test tests/brief-discover-gate.test.cjs tests/brief-define-korea-signal.test.cjs` → **12 tests pass, 0 fail, 230ms**.
- Phase 3 block-gate (DEF-05) + stale-anchor (DEF-06) + Korea-signal detection all preserved.

### A1 Preservation
- `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → **0**.
- Test 5 in `tests/brief-discover-no-new-command.test.cjs` asserts the same value at test time.

### Surface Cap Preservation
- `ls commands/brief/ | grep -E 'audience.*|reaudit|realign|discover-audit|provenance|context-inject'` → **zero lines** (no FORBIDDEN file present).
- Phase 5 net user-facing command additions = **0** (only `/brief-discover` body replacement in Plan 05-07; no new `commands/brief/*.md` files added).

### npm test baseline observation
- Current npm test total: **3973 tests, 3925 pass, 48 fail**.
- Baseline at commit `717d475` (Plan 05-07 completion, Wave 5 tip — the target base for this plan's worktree): identical **3973/3925/48**.
- **Plan 05-08 introduces ZERO new npm-test failures.** All 48 failures are pre-existing drift from Phase 1 HALT-ACCEPTED (`.planning/STATE.md` Blockers — formally deferred to Phase 9 HRD-05) plus 32 post-Phase-1 accumulated failures in unrelated test files (agent-frontmatter, architecture-counts, bug-2004-pr-branch-milestone, codex-config, command-count-sync, copilot-install, workflow-guard-registration etc.). None of the failures touch any Plan 05-08 test or source file.

## Deviations from Plan

None — plan executed exactly as written.

The plan prescribed exact test content for all 3 files (node:test + node:assert + fs + path + os + execSync idioms). Implementation follows verbatim with small refinements documented here that do not alter any assertion:
- Adjusted the Canary E2E test file's `setupCanaryTmp()` OBJECTIVES.md skeleton to align with the existing Phase 4 canary test pattern (`[internal, partner, external]` inline list form) while preserving the plan's field set and values.
- Replaced the plan's `.planning/.audience-verdict.tmp.json` placeholder with explicit `.tmp.json` path arguments for each `runAudience` call, matching the Plan 05-04 `tests/brief-audience-ok.test.cjs` setup pattern.
- Added descriptive assertion-failure messages throughout (e.g., `last-writer-wins violated: firstAt=... secondAt=...`) so diagnosis of a future regression is one message away, consistent with the Phase 4 canary test template.

All three refinements are pure test-quality improvements; each assertion in the plan's EXACT CONTENT is preserved 1:1.

## Auto-fix Attempts

- Task 1: 0 fixes needed
- Task 2: 0 fixes needed
- Task 3: 0 fixes needed

No auto-fixes needed. All verification commands exited 0 on first run.

## Issues Encountered

- **Worktree branch base drift at start:** The worktree HEAD was at `fb7385f` (Phase 3 completion tip from prior iterations) instead of the expected base `717d475` (Wave 5 completion — Plan 05-07 tip). `HEAD` was verified an ancestor of the expected base via `git merge-base --is-ancestor`, so fast-forwarded via `git reset --hard 717d475`. Zero content lost; worktree branch starts cleanly from Plan 05-07's final commit.
- **findings_count YAML round-trip tolerance:** Initial exploration of `commitAudienceVerdict` round-trip confirmed `findings_count` re-reads as the string `"0"` on macOS (Pitfall #4 — D-20 YAML serializer drift). Canary Step 3 assertion avoids the shape-sensitive check by asserting decision + at presence only; the full round-trip characterization is locked elsewhere by `tests/brief-audience-state-roundtrip.test.cjs` (Plan 05-04 Task 6).

## Known Stubs

None. This plan is pure test / audit; no stub code ships. The canary uses Plan 02 golden fixtures as stubbed researcher output deliberately — the fixtures were designed for this reuse per Plan 02's `Next Phase Readiness` note. Fixture reuse is a feature, not a stub.

## Threat Flags

No new threat surface beyond the 6 items in `<threat_model>` of 05-08-PLAN. Mitigations:

- **T-5-08-01** (Future plan adds `commands/brief/audience.md`) — Task 3 Test 1 + Test 3 enumerate FORBIDDEN and fire on any addition at next full-suite run.
- **T-5-08-02** (Future plan attaches AUDIENCE as PostToolUse hook) — Task 2 Test 1 grep-audit + Tests 4+5 assertion-block checks catch hook-attachment + assertion removal.
- **T-5-08-03** (Future plan adds runtime dep to package.json) — Task 3 Test 5 catches any non-zero `dependencies` count.
- **T-5-08-04** (Canary leaves tmp directories) — `accept` disposition; OS cleans os.tmpdir() entries.
- **T-5-08-05** (Canary false green from fixture determinism) — Mitigated: canary verifies 3 orthogonal invariants (sibling write + STATE.md round-trip + vocabulary-lock); false green requires ALL three to pass despite semantic drift. Runtime LLM variance verification is Phase 9 HRD-04 pilot concern (accepted).
- **T-5-08-06** (E2E runtime exceeds 180s budget) — Mitigated: in-process only, zero live-LLM calls; 3-test-file total runtime 0.4s.

No NEW network endpoints, auth paths, file-access patterns, or schema changes introduced.

## Notes for Phase 6/7/8 Planners

- **Phase 6 (bidirectional return stack):** The canary's Step 5 proves `state.brief.last_gate_results.audience` round-trips correctly across per-artifact AUDIENCE runs. Phase 6's "return to DISCOVER" logic can safely read this field; stale-check discipline uses the `at` field exactly as populated here.
- **Phase 7 (COMPLIANCE checker):** All 3 test files are canonical Phase 7 templates:
  1. `tests/brief-discover-canary-e2e.test.cjs` → `tests/brief-design-canary-e2e.test.cjs` — copy structure, swap fixture injection point + AUDIENCE → COMPLIANCE + researcher output → workstream artifact.
  2. `tests/brief-audience-no-hook.test.cjs` → `tests/brief-compliance-no-hook.test.cjs` — mechanical rename of grep needles + assertion descriptions.
  3. `tests/brief-discover-no-new-command.test.cjs` → `tests/brief-design-no-new-command.test.cjs` — extend FORBIDDEN list with Phase 7 names (compliance.md / compliance-check.md / etc.); hook inventory adjusts to whatever Phase 7 ships (if anything).
- **Phase 8 (DELIVER):** Type B decks flow through AUDIENCE via the same `brief/workflows/audience-guard.md` — no new AUDIENCE-side test shape needed. The canary confirms AUDIENCE works on arbitrary artifacts placed under `.planning/`; Type B artifact paths (e.g., `.planning/deliver/investor-ir.md`) work the same way.

## Line Count Discipline (Phase 2 D-18)

| File | Lines | Cap | Status |
|------|-------|-----|--------|
| tests/brief-discover-canary-e2e.test.cjs | 393 | — (test files uncapped) | within spirit (6 tests + 1 helper, well-commented) |
| tests/brief-audience-no-hook.test.cjs | 150 | — | concise |
| tests/brief-discover-no-new-command.test.cjs | 159 | — | concise |

## Known Limitations (deferred to Phase 9 / future phases)

- **Runtime 4-wide parallelism verification deferred to Phase 9 HRD-01 cross-runtime smoke:** The canary is in-process only; the real ≤4-wide Task spawn (Plan 02 smoke test covers partition algorithm; Plan 07 workflow documents it) is verified only by the live cross-runtime pilot. If Phase 9 HRD-01 observes serialization, escalation is HIGH per 05-CONTEXT Risk Notes — not by this plan.
- **Full-stack behavioral canary deferred to Phase 9 HRD-04 pilot:** This plan's canary exercises the pipeline via in-process library calls. Whether the orchestrator emits correct Task blocks at runtime, whether AUDIENCE 3-path interrupts fire correctly under DRIFTED at runtime, and whether the atomic commit lands every file in the real slash-command flow — all behavioral — are Phase 9 HRD-04 pilot concerns.
- **npm-test regression baseline deferred to Phase 9 HRD-05:** 48 pre-existing npm-test failures remain. Per STATE.md Blockers + Phase 1 HALT-ACCEPTED (2026-04-18), these are scheduled for Phase 9 HRD-05. This plan introduces zero new failures against that baseline.
- **Degenerate-topic runtime re-prompt verification deferred:** Plan 02 agent prompt + Plan 07 workflow both document the degenerate-topic fallback (Custom {{TOPIC}} < 10 chars or prose-quantifier-only). The runtime re-prompt flow is orchestrator-layer; this plan does not canary it.
- **AUDIENCE idempotency-skip not canaried:** Plan 07 Step 6 documents an idempotency skip via `state.brief.last_gate_results.audience.at` vs `fs.statSync(artifact).mtimeMs`. The canary runs fresh artifacts only; skip-on-unchanged is a Phase 7/8 optimization concern.
- **Korean + English locale only:** Canary uses `region='kr'` fixture. Non-KR / non-EN locales deferred per 05-CONTEXT `<deferred>` §8 + Phase 1 localized-READMEs deferred list.

## Self-Check: PASSED

**Files verified on disk:**
- FOUND: tests/brief-discover-canary-e2e.test.cjs (393 lines)
- FOUND: tests/brief-audience-no-hook.test.cjs (150 lines)
- FOUND: tests/brief-discover-no-new-command.test.cjs (159 lines)

**Commits verified (via `git log --oneline`):**
- FOUND: dbfdb40 (Task 1 — canary E2E)
- FOUND: 0e76985 (Task 2 — Anti-pattern #2)
- FOUND: 8b9691e (Task 3 — Surface Cap + A1)

**Verified via commands:**
- `node --test tests/brief-discover-canary-e2e.test.cjs` exits 0 (6 pass, 0 fail, ~130ms)
- `node --test tests/brief-audience-no-hook.test.cjs` exits 0 (5 pass, 0 fail, ~216ms)
- `node --test tests/brief-discover-no-new-command.test.cjs` exits 0 (5 pass, 0 fail, ~57ms)
- Full Phase 5 regression (152 tests across Plans 01-08): exits 0 (152 pass, 0 fail, 1.66s)
- Phase 4 regression (50 ALIGN tests): exits 0 (50 pass, 0 fail, 113ms)
- Phase 3 regression (12 tests): exits 0 (12 pass, 0 fail, 230ms)
- A1 preserved: `package.json dependencies` count = 0
- Surface cap preserved: 0 new `commands/brief/*.md` files matching FORBIDDEN enum
- Hook purity: `grep -rE "audience-guard|audience_guard|brief-audience-guard|audience\.cjs" hooks/` returns zero matches
- npm-test baseline: 3973/3925/48 — identical to Plan 05-07 tip at commit 717d475; Plan 05-08 introduces zero new failures

## Phase 5 COMPLETE

All 10 Phase 5 requirements are now covered:

| Requirement | Plan(s) | Covering tests |
|-------------|---------|----------------|
| DSC-01 (9 default categories multi-select) | 05-02, 05-07 | brief-researcher-output-provenance.test.cjs, brief-discover-multiselect.test.cjs |
| DSC-02 (Custom free-text category) | 05-02, 05-07 | brief-researcher-output-provenance.test.cjs, brief-discover-custom-topic.test.cjs |
| DSC-03 (≤4-wide wave parallelism) | 05-02, 05-07 | brief-discover-parallel-smoke.test.cjs, brief-discover-wave-partition.test.cjs |
| DSC-04 (provenance tag grammar) | 05-02, 05-03 | brief-researcher-output-provenance.test.cjs, brief-provenance-positive.test.cjs |
| DSC-05 (B2B/B2C lens) | 05-01, 05-02 | brief-context-inject-roundtrip.test.cjs, brief-researcher-b2b-vs-b2c.test.cjs |
| DSC-06 (Korea compliance primers) | 05-06 | brief-korea-compliance-primers.test.cjs |
| DSC-07 (DSC-07 date-format edge — [VERIFIED:url|YYYY-MM-DD]) | 05-02, 05-03 | brief-researcher-output-provenance.test.cjs, brief-provenance-negative.test.cjs (edge-malformed-tag) |
| DSG-13 (AUDIENCE paired-sibling + state round-trip) | 05-04, 05-05, 05-08 | brief-audience-*.test.cjs, brief-audience-sibling-filename.test.cjs, brief-discover-canary-e2e.test.cjs |
| CC-02 (context-injection primitive — two-consumer parity) | 05-01 | brief-context-inject-roundtrip.test.cjs |
| CC-04 (provenance hook + allowlist) | 05-03 | brief-provenance-*.test.cjs (22 tests across 5 files) |

Structural guarantees enforced by this plan's 3 files:
- Canary E2E proves the 4 subsystems (researcher, provenance, AUDIENCE, context-inject) compose correctly in a 2-category scenario.
- Anti-pattern #2 grep-audit guarantees AUDIENCE never silently migrates from orchestrator step to hook.
- Surface Cap FORBIDDEN enum + A1 sentinel guarantee zero scope creep at the filesystem and dependency layers.

Ready for Phase 6 (bidirectional return stack) — the AUDIENCE state field this canary exercises is the foundation Phase 6's designer builds on.

---
*Phase: 05-discover-parallel-research-with-provenance-audience-context-injection*
*Plan: 08 (final wave)*
*Completed: 2026-04-23*
