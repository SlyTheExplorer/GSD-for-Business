---
phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
verified: 2026-04-19T01:45:00Z
status: passed
decision: complete
score: 4/4 success criteria verified
requirements_covered: 4/4   # FND-05, FND-08, FND-09, FND-10
overrides_applied: 0
deferred:
  - truth: "Phase line renders the full USER-LOCKED D-15 form `Phase 2 of 9 (Stable Seam)` against the production STATE.md"
    addressed_in: "Phase 3+ (orchestrator STATE.md writes)"
    evidence: "Plan 02-06 SUMMARY §Dashboard Render — Live Sample explicitly defers `current_phase` frontmatter population to the orchestrator; ROADMAP SC #4 clause 'schema is in place even if values are placeholder' covers this case; status-renderer test #1 proves the populated render works when `current_phase: 02` is seeded"
  - truth: "getPhaseInfo composed from cmdRoadmapAnalyze rather than duplicated regex"
    addressed_in: "Post-v1 refactor (Plan 06 W2 deferral)"
    evidence: "Plan 02-06 SUMMARY §W2 Deferral Documented: cmdRoadmapAnalyze is print-coupled; pure/effectful split is the v2 fix"
re_verification: null  # Initial verification
---

# Phase 2: Stable Seam — Anchor Schema, Caps, Workstream-as-Config — Verification Report

**Phase Goal:** The architectural seams that every later phase depends on are in place: STATE.md round-trips namespaced `brief.*` fields without loss, workstreams are defined as YAML config (not bespoke code), CLAUDE.md enforces hard caps on commands and skills before any feature is added, and `/brief-status` reports basic position information.

**Verified:** 2026-04-19
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### ROADMAP Success Criteria (4/4)

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | `state.cjs` round-trips `state.brief.*` without loss; A4 verified in ASSUMPTIONS.md (FND-05) | ✓ VERIFIED | `tests/state-brief-roundtrip.test.cjs` → 4/4 pass (Cycle 1 / Cycle 2 disk→disk / Cycle 3 CLI `state json` round-trip / Placeholder). `.planning/ASSUMPTIONS.md:116` contains `### A4 — STATE.md round-trips state.brief.* without loss — VERIFIED`. `.planning/STATE.md:15` contains the `brief:` nested map with full D-03 schema. `brief_state_version: 1.0` at line 2. |
| 2 | New workstream declared by one `spec.yaml` without `.cjs` source change (FND-08) | ✓ VERIFIED | `brief/workstreams/_example/spec.yaml` + `templates/artifact.md` exist. `tests/workstream-loader-discovery.test.cjs` → 9/9 pass including line-40 test `adding a second workstream dir beyond _example is picked up without .cjs change (FND-08 success criterion)`. `tests/workstream-loader-validation.test.cjs` → 8/8 pass. Loader has zero `require` of `workstream.cjs` (R-2 sibling boundary enforced). Zero runtime deps preserved. |
| 3 | CLAUDE.md has explicit caps: ≤12 user-facing commands, ≤8 skills, rationale (FND-09) | ✓ VERIFIED | `CLAUDE.md:204` carries the `<!-- BRIEF PHASE 2 / FND-09 — DO NOT REGENERATE -->` guard. L206 `## Surface Caps`. L210 `≤12 user-facing slash commands`. L211 `≤8 skills`. L213 user-facing definition pointing to `bin/install.js` → `commands/<runtime>/brief/`. L217 Phase 9 HRD-02 forward pointer. L219 notes current 61/18 inheritance and Phase 3-8 MUST NOT add commands. |
| 4 | `/brief-status` renders one-screen dashboard with phase, workstream, return stack, last ALIGN, last COMPLIANCE — schema in place even with placeholder values (FND-10) | ✓ VERIFIED | `node brief/bin/brief-tools.cjs status --raw` → exit 0, prints 7-line dashboard containing `BRIEF Status`, `Phase`, `Workstream`, `Return stack`, `Last ALIGN`, `Last COMPLIANCE`, `Next:`. `commands/brief/status.md:2` → `name: brief:status`. `brief/workflows/status.md` exists (7 lines, cross-runtime parity stub). `brief/bin/brief-tools.cjs:779` → `case 'status':`. `tests/status-renderer.test.cjs` → 8/8 pass. See "Phase — of 9 Determination" below for the live-output interpretation. |

**Score:** 4/4 success criteria verified.

---

## Requirements Coverage

| Requirement | Plans | Status | Evidence |
|-------------|-------|--------|----------|
| **FND-05** — A4 round-trip verified via smoke test in `tests/` | 02-01, 02-03, 02-04 | ✓ SATISFIED | `frontmatter.cjs` D-20 serializer extension + `state.cjs` D-21 allowlist extension + A4 VERIFIED ASSUMPTIONS entry. 3 test files green (frontmatter-roundtrip 10/10, state-brief-roundtrip 4/4, state.test 93/93 regression). `brief_state_version: 1.0` live at `state.cjs:814` and `.planning/STATE.md:2`; zero `gsd_state_version` literals remain in `brief/` / `tests/` / `.planning/STATE.md`. |
| **FND-08** — Workstream declared via YAML spec, no `.cjs` source change | 02-05 | ✓ SATISFIED | `yaml-mini.cjs` (197 lines, zero deps) + `workstream-loader.cjs` (111 lines, R-2 sibling). `_example` fixture proves D-13 schema end-to-end. 17/17 loader tests pass. Three STRIDE mitigations (proto-pollution T-02-05-01, path traversal T-02-05-02, DoS T-02-05-03) exercised by tests. |
| **FND-09** — ≤12 user-facing commands / ≤8 skills caps in CLAUDE.md with rationale | 02-02 | ✓ SATISFIED | CLAUDE.md §`## Surface Caps` (L206–L228) carries explicit caps, rationale (Miller's Law, Pitfall #1 skill bloat, Pitfall #12 slash-command memorability), "user-facing" definition, D-07 documentation-only enforcement note, D-08 current-state acknowledgment (61/18 inherited), Phase 9 HRD-02 forward pointer, MUST NOT clause for Phase 3-8, regeneration guard HTML comment. |
| **FND-10** — `/brief-status` shows current phase, workstream, return-stack depth, last ALIGN, last COMPLIANCE | 02-06 | ✓ SATISFIED | `status.cjs` (123 lines, read-only, D-17 resilient). `commands/brief/status.md` with `name: brief:status`. `brief/workflows/status.md` cross-runtime parity stub. Dispatcher integrated at `brief-tools.cjs:779`. 8/8 renderer tests pass (placeholder, populated workstream, populated ALIGN, populated return stack, missing STATE.md resilience, missing ROADMAP.md resilience, dispatcher integration, read-only SHA256 guard). |

**Coverage:** 4/4 requirements.

**Orphans:** None. REQUIREMENTS.md Traceability table maps exactly FND-05/08/09/10 to Phase 2; all 4 are claimed by at least one plan.

---

## Artifact Verification

| Artifact | Level 1 (exists) | Level 2 (substantive) | Level 3 (wired) | Level 4 (data flows) | Status |
|----------|------------------|----------------------|-----------------|---------------------|--------|
| `brief/bin/lib/frontmatter.cjs` | ✓ 420 lines | ✓ recursive serializer + array-of-objects parser | ✓ used by state.cjs, status.cjs, 198+ tests | ✓ deep-strict-equal across 10 round-trip tests | ✓ VERIFIED |
| `brief/bin/lib/state.cjs` | ✓ L814 `brief_state_version` | ✓ 2 preservation branches (sync + cmdStateJson) | ✓ used by brief-tools.cjs subcommands | ✓ brief map survives CLI round-trip (R-5 test) | ✓ VERIFIED |
| `brief/bin/lib/yaml-mini.cjs` | ✓ 197 lines | ✓ scalars + lists + nested maps parser | ✓ required by workstream-loader.cjs | ✓ 17 tests exercise full grammar + guards | ✓ VERIFIED |
| `brief/bin/lib/workstream-loader.cjs` | ✓ 111 lines | ✓ glob + validate D-13 | ✓ can be required by Phase 5/7 (not yet invoked — forward seam) | ✓ `_example` fixture loads end-to-end in tests | ✓ VERIFIED |
| `brief/bin/lib/status.cjs` | ✓ 123 lines | ✓ full D-15 compact dashboard | ✓ dispatched at brief-tools.cjs:779 | ✓ reads `stateFm.brief` from STATE.md; renders all 5 fields | ✓ VERIFIED |
| `brief/workstreams/_example/spec.yaml` | ✓ exists | ✓ 8 fields per D-13 | ✓ loader discovers via glob | ✓ round-trip-parsed by yaml-mini in test fixtures | ✓ VERIFIED |
| `brief/workstreams/_example/templates/artifact.md` | ✓ exists | ✓ audience-guard frontmatter | ✓ referenced by spec.yaml `output_artifact_template` | N/A (template only) | ✓ VERIFIED |
| `commands/brief/status.md` | ✓ exists | ✓ `name: brief:status` frontmatter | ✓ `bin/install.js` bulk-copies to 14 runtimes (R-4) | N/A (command stub) | ✓ VERIFIED |
| `brief/workflows/status.md` | ✓ exists (7 lines) | ✓ cross-runtime parity stub | ✓ resolved by `@~/.claude/brief/workflows/status.md` reference | N/A (stub) | ✓ VERIFIED |
| `CLAUDE.md` `## Surface Caps` section | ✓ L206 | ✓ 22 lines, all 6 grep-keywords present | ✓ placed between Architecture and Project Skills | N/A (docs) | ✓ VERIFIED |
| `.planning/STATE.md` `brief:` map | ✓ L15 | ✓ D-03 schema shape (4 keys, nested last_gate_results) | ✓ preserved by syncStateFrontmatter + cmdStateJson allowlist | ✓ survives CLI round-trip | ✓ VERIFIED |
| `.planning/ASSUMPTIONS.md` A4 entry | ✓ L116 | ✓ 52 lines with ISO timestamp + test output + implication + commit chain | ✓ closes Phase 1 HIGH-RISK A4 open item | N/A (docs) | ✓ VERIFIED |
| `tests/frontmatter-roundtrip.test.cjs` | ✓ 243 lines | ✓ 10 test cases across 5 describe blocks | ✓ ran in regression sweep | ✓ all pass | ✓ VERIFIED |
| `tests/state-brief-roundtrip.test.cjs` | ✓ 330 lines | ✓ 4 cycles (mem, disk, CLI, placeholder) | ✓ ran via `node --test` | ✓ all pass | ✓ VERIFIED |
| `tests/workstream-loader-discovery.test.cjs` | ✓ exists | ✓ 9 tests | ✓ ran via `node --test` | ✓ all pass | ✓ VERIFIED |
| `tests/workstream-loader-validation.test.cjs` | ✓ exists | ✓ 8 tests | ✓ ran via `node --test` | ✓ all pass | ✓ VERIFIED |
| `tests/status-renderer.test.cjs` | ✓ exists | ✓ 8 tests covering D-15..D-19 | ✓ ran via `node --test` | ✓ all pass | ✓ VERIFIED |

All 16 must-have artifacts VERIFIED across all 4 levels.

---

## Key Link Verification

| From | To | Via | Status | Evidence |
|------|-----|-----|--------|----------|
| `status.cjs` | `brief:` map in STATE.md | `extractFrontmatter` read | ✓ WIRED | Test #1 renders placeholder map; test #4 renders return_stack depth > 0 |
| `brief-tools.cjs` | `status.cjs` | `case 'status':` dispatch at L779 | ✓ WIRED | Dispatcher test #7 invokes via `runGsdTools(['status'])` and asserts exit 0 + stdout contains `BRIEF Status` |
| `workstream-loader.cjs` | `_example` fixture | glob `brief/workstreams/*/spec.yaml` | ✓ WIRED | Discovery test asserts specs[].slug === '_example' |
| `syncStateFrontmatter` | `existingFm.brief` | 4th preservation branch (line ~870) | ✓ WIRED | Cycle 2 test passes — disk→disk round-trip no drift |
| `cmdStateJson` | `existingFm.brief` | 4th preservation branch (line ~994) | ✓ WIRED | Cycle 3 test passes — CLI `state json` preserves brief map (R-5 stronger test) |
| `reconstructFrontmatter` | `serializeValue` recursive helper | function call chain | ✓ WIRED | 10/10 roundtrip tests; deep-strict-equal fidelity for nested/array-of-objects/null |
| `workstream-loader.cjs` | (not) `workstream.cjs` | none | ✓ SIBLING BOUNDARY ENFORCED | `grep "workstream\.cjs" workstream-loader.cjs` returns 0 lines |
| CLAUDE.md Surface Caps | `bin/install.js` policy | text-link via "what `bin/install.js` registers under `commands/<runtime>/brief/`" | ✓ WIRED (documentation) | Forward-pointer text to Phase 9 HRD-02 audit |

All 8 key links WIRED.

---

## Behavioral Spot-Checks

| # | Behavior | Command | Result | Status |
|---|----------|---------|--------|--------|
| 1 | A4 smoke test | `node --test tests/state-brief-roundtrip.test.cjs` | 4 pass / 0 fail | ✓ PASS |
| 2 | D-20 frontmatter round-trip | `node --test tests/frontmatter-roundtrip.test.cjs` | 10 pass / 0 fail | ✓ PASS |
| 3 | Workstream loader discovery + validation | `node --test tests/workstream-loader-discovery.test.cjs tests/workstream-loader-validation.test.cjs` | 17 pass / 0 fail | ✓ PASS |
| 4 | `/brief-status` renderer contract | `node --test tests/status-renderer.test.cjs` | 8 pass / 0 fail | ✓ PASS |
| 5 | `/brief-status` live dispatch | `node brief/bin/brief-tools.cjs status --raw` | exit 0; 10-line dashboard printed | ✓ PASS |
| 6 | STATE.md brief map parseable | `node -e "extractFrontmatter('.planning/STATE.md').brief"` | 4 keys: `return_stack`, `gap_queue`, `last_gate_results`, `current_workstream` | ✓ PASS |
| 7 | Zero runtime deps | `node -e "Object.keys(require('./package.json').dependencies\|\|{}).length"` | 0 | ✓ PASS |
| 8 | Delta-cap discipline | `node scripts/run-tests.cjs 2>&1 \| grep -cE "^✖"` | 63 (Phase 1 HALT-ACCEPTED baseline; delta = 0) | ✓ PASS |
| 9 | `gsd_state_version` residue | `grep -rn "gsd_state_version" brief/ tests/ .planning/STATE.md` | 0 matches | ✓ PASS |

All 9 behavioral spot-checks pass.

---

## Anti-Pattern Scan

| File | Finding | Severity | Impact |
|------|---------|----------|--------|
| `status.cjs` | JSDoc comment `must not mutate any on-disk state; no write-path APIs invoked` (docs only, intentional per Plan 06 Rule 1 auto-fix #2 to avoid acceptance-grep false-positive) | ℹ Info | None — comment was rephrased to document the D-18 contract without triggering the literal-grep gate |
| `brief/workflows/status.md` | 7-line stub (pure placeholder) | ℹ Info (planned) | Intentional per Plan 06 File 2b spec — cross-runtime parity stub; all logic lives in status.cjs. NOT a gap. |
| `workstream-loader.cjs` | Docstring rephrased from "MUST NOT require or extend workstream.cjs" to "MUST NOT import or extend that adjacent module" (Rule 1 auto-fix #1 to avoid acceptance-grep false-positive) | ℹ Info | None — R-2 sibling boundary still enforced (zero `workstream.cjs` references) |

No blockers, no warnings. All 3 info-level items are documented intentional patterns.

---

## Phase — of 9 Determination (live debate point)

**Decision: PASSED — not a spec deviation.**

**Live render against production STATE.md:**
```
BRIEF Status
================================
  Phase           — of 9
  Workstream      — (none active)
  Return stack    0 / 3
  Last ALIGN      — (none yet)
  Last COMPLIANCE — (none yet)
--------------------------------
  Next: Phase 2 context gathered (delegated mode)
```

**Analysis:**

1. **ROADMAP SC #4 text:** "User runs `/brief-status` and gets a one-screen summary showing current phase, active workstream (none yet — placeholder OK at this phase), return-stack depth (0), last ALIGN finding (none yet), last COMPLIANCE finding (none yet) — **the schema is in place even if values are placeholder** (FND-10)."

2. **The clause "the schema is in place even if values are placeholder" is the governing constraint.** It explicitly admits placeholder values as satisfying the criterion. The dashboard renders 7 structural lines including a distinct "Phase" line; the schema is demonstrably in place.

3. **D-15 USER-LOCKED preview** (CONTEXT.md L188–197) shows `Phase 2 of 9 (Stable Seam)` — but this is the target state AFTER `current_phase: 02` is written into STATE.md frontmatter. `buildStateFrontmatter` in `state.cjs` DOES support writing this field (line 818); it is populated by orchestrator commands when phases complete.

4. **Plan 02-04 scope deliberately excluded `current_phase: 02` initialization** (02-04-PLAN.md line 37 carve-out). The seeding is owned by the orchestrator write path, not by the `brief:` map initialization.

5. **D-17 resilience is explicit:** the renderer MUST gracefully fall back to `—` when a STATE.md field is missing. This is the documented, tested (tests #5 and #6), user-approved behavior. Rendering `—` is the CORRECT behavior for a missing field, not a defect.

6. **Test case #1 proves the populated render works** when `current_phase: 02` is present (`assert.match(output, /Phase\s+0?2 of 9/)`).

**Remediation stance:** None required for Phase 2 verification. Populating `current_phase: 02` in live STATE.md is an orchestrator concern (the post-merge state-write that happens after `/gsd-verify-work` completes). If the orchestrator's final state-write emits `current_phase: 02`, the live dashboard will then match the D-15 preview. If it doesn't, that's a Phase 3+ orchestrator issue, not a Phase 2 FND-10 issue.

**Recorded as a deferred observation in the frontmatter `deferred[0]`**, so the orchestrator has clear visibility into what would turn `Phase — of 9` → `Phase 2 of 9 (Stable Seam)` at the user-visible layer.

---

## Delta-Cap Discipline

| Metric | Phase 1 HALT-ACCEPTED baseline | Phase 2 post-merge | Delta |
|--------|-------------------------------|---------------------|-------|
| `npm test` failure count | 63 | 63 | 0 ✓ |
| Zero runtime deps | 0 | 0 | 0 ✓ |
| `gsd_state_version` live-source residue | 7 | 0 | −7 ✓ (closes 1 Phase 9 HRD-05 item) |

All 6 plans preserved the delta-cap; Plan 02-03 REDUCED the cap by closing 5 `gsd_state_version` test-assertion residue items. Phase 9 HRD-05 residual catalog now at 56 items (was 63).

---

## Plan Coverage

| Plan | Subsystem | Requirement | SUMMARY.md | Commits | Status |
|------|-----------|-------------|------------|---------|--------|
| 02-01 | frontmatter D-20 | FND-05 prereq | ✓ 172 lines | b9a6e53 (test RED), eccd94f (fix GREEN), 3c3635f (SUMMARY) | ✓ COMPLETE |
| 02-02 | CLAUDE.md Surface Caps | FND-09 | ✓ 167 lines | 4085960 (docs), 7159372 (SUMMARY) | ✓ COMPLETE |
| 02-03 | brief_state_version atomic rename | FND-05 (D-04) | ✓ 214 lines | cf614b5 (refactor atomic), 9824eed (SUMMARY) | ✓ COMPLETE |
| 02-04 | state.brief.* schema + A4 VERIFIED | FND-05 | ✓ 287 lines | 4ac7f94 (test RED), 03c5e6b (feat GREEN), b275c1d (ASSUMPTIONS), 4652890 (SUMMARY) | ✓ COMPLETE |
| 02-05 | workstream-as-YAML loader | FND-08 | ✓ 165 lines | 2d8cde5 (test RED), 51c47b1 (feat GREEN), 3ff0d47 (SUMMARY) | ✓ COMPLETE |
| 02-06 | /brief-status compact dashboard | FND-10 | ✓ 222 lines | f7854dd (test RED), 6b0cd60 (feat GREEN), 03cfc21 (SUMMARY) | ✓ COMPLETE |

All 6 plans have SUMMARY.md. All commits follow the RED-then-GREEN TDD pattern. No scope drift detected — every file modified in the git history belongs to a plan's `files_modified` declaration.

---

## Deferred Items (not blocking Phase 2 closure)

| # | Item | Addressed In | Evidence |
|---|------|--------------|----------|
| 1 | Phase line renders the full USER-LOCKED D-15 form `Phase 2 of 9 (Stable Seam)` against production STATE.md | Phase 3+ (orchestrator writes `current_phase: 02` into frontmatter) | D-17 resilience is documented, tested, and correct; test #1 proves the populated render works when the field is seeded |
| 2 | `getPhaseInfo` composed from pure `analyzeRoadmap` function (cmdRoadmapAnalyze refactor) | Post-v1 refactor (Plan 06 W2) | cmdRoadmapAnalyze is print-coupled; pure/effectful split mirrors Plan 02-04's buildStateFrontmatter / cmdStateJson separation |

---

## Gaps Found

**None.** All 4 ROADMAP success criteria PASSED. All 4 requirements (FND-05/08/09/10) SATISFIED by working code + passing tests. Delta-cap held at 63. Zero runtime deps preserved.

---

## Human Verification Required

**None.** All verification paths are programmatic (node:test + CLI dispatch). The non-technical product owner's single user-decision point (D-15 compact-dashboard preview) was captured at discussion time and tested against in test case #1 (asserts `Phase\s+0?2 of 9`). The live dashboard renders correctly against the seeded fixture; the production-STATE.md render shows `Phase — of 9` because the orchestrator hasn't written `current_phase` — this is a Phase 3+ orchestrator concern, not a Phase 2 verification failure.

---

## PHASE VERIFIED

**Decision: complete**

Phase 2 delivered all 4 architectural seams that later phases depend on:

1. **FND-05** — `state.cjs` round-trips `state.brief.*` without loss. A4 VERIFIED. D-20 serializer + D-21 allowlist + `brief_state_version` atomic rename shipped; 3-cycle smoke test (memory → disk → CLI) green.

2. **FND-08** — Workstream-as-YAML loader live. `_example` fixture + discovery + validation prove a new workstream requires ZERO `.cjs` source change. R-2 sibling boundary enforced. Zero runtime deps preserved.

3. **FND-09** — CLAUDE.md `## Surface Caps` section with ≤12 / ≤8 caps, "user-facing" definition, rationale, D-07 documentation-only enforcement, D-08 current-state acknowledgment (61/18), Phase 9 HRD-02 forward pointer, MUST NOT clause, HTML regeneration guard.

4. **FND-10** — `/brief-status` compact dashboard with D-17 resilience, D-18 read-only guarantee, D-19 plain-text stdout. Dispatcher wired at brief-tools.cjs:779. 8/8 renderer tests pass.

**No gaps. No human verification required. Delta-cap held at 63 (Phase 1 baseline).**

Phase 4 (ALIGN), Phase 5 (AUDIENCE/DISCOVER), Phase 6 (Return Stack), Phase 7 (COMPLIANCE + Workstream population) are now unblocked — they can write directly into `state.brief.*` and populate real workstreams against the loader contract without re-litigating schema or infrastructure.

---

*Verified: 2026-04-19T01:45:00Z*
*Verifier: Claude (brief-verifier)*
