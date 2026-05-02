---
phase: 09-hardening-cross-runtime-smoke-non-developer-pilot
verified: 2026-04-27T00:00:00Z
status: human_needed
score: 5/5 success-criteria delivered (Criterion 5 accepted-as-deferred per D-D02 + Rule-4 documented; one post-fix regression noted)
overrides_applied: 1
overrides:
  - must_have: "npm test failure count ≤ 16 (HRD-05 EMPIRICAL_BASELINE 6 + DELTA_CAP 10)"
    reason: "Per CONTEXT D-D02 + Plan 09-06 Rule-4 documented deferral. Plan 09-05 atomic deletion of 56 GSD developer-surface commands (correct + required per A-D02 hard-fork discipline + Pitfall #1 mitigation) broke ~169 previously-passing tests asserting against deleted file paths. Post-deletion empirical count is 185 (catalogued in RESIDUAL-FAILS-V1.md with v1.1 remediation effort estimate ~10-15h). v1 launch gate redefined to 3-prong checklist (D-D04) — empirical fail count is informational, not a launch criterion. User explicitly accepted this trade-off when locking D-D02."
    accepted_by: "build-team vision-keeper (BRIEF dogfooding pilot 1/3)"
    accepted_at: "2026-04-27T00:00:00Z"
human_verification:
  - test: "Run brief-cli smoke-test in each of the 4 actual runtimes (Claude Code / Codex / Gemini / OpenCode) and confirm SMOKE-TEST.md generation works end-to-end against the live runtime, not just the stub-driven harness"
    expected: "SMOKE-TEST.md is regenerated with 4×5 = 20 cells, each PASS (or documented SKIP). Stub-driven implementation (B-D01) means cross-runtime parity is tested via INSTRUCTION_FILE env mocking — confirming behaviour in the real runtime sandboxes is environment-bearing and outside automated verifier reach."
    why_human: "B-D01 explicitly chose stub-driven testing for v1 (env-independent + no API costs); v1.1 may add a `--live` opt-in flag. The user is the only party who can run the 4 real runtime CLIs and confirm the smoke harness behaves correctly under each. The matrix as committed shows 20/20 PASS based on the stub harness, but actual end-to-end execution under each runtime is manual."
  - test: "Read .planning/pilot/01-korean-non-technical-product-owner-friction-journal.md as a second reader and judge whether the journal honestly captures friction vs. rationalising around it (Pitfall #14 dogfooding-trap meta-check). Specifically: do the 6 logged friction items have severity assignments that feel right? Are there severity=high items that were silently re-classified as severity=medium? Is the 'no severity=blocker' assertion an honest read of the dogfooding session?"
    expected: "A second reader (the user, as build-team vision-keeper, OR an outside reviewer) confirms the journal is an honest read. Specifically confirms (a) the 'No severity=blocker items found' assertion holds, (b) the 6 friction items chosen are representative of the dogfooding pain, and (c) no rationalisation of high-severity items into lower bands is detected."
    why_human: "Pitfall #14 (dogfooding trap) is a meta-reflection failure mode that automated checks cannot detect. Only a human reader, ideally one with adversarial stance toward the build-team's own friction journal, can flag rationalisation. The journal's transparency note (B4 revision) explicitly acknowledges pilot 1/3 is the build-team vision-keeper — the meta-check is whether self-pilot is honest about its own friction."
  - test: "Read commands/brief/help.md and run /brief-help, /brief-help def, /brief-help xyz123 in a non-developer flow. Judge whether the 4D categorisation + Levenshtein suggestion output is read-understandable in ≤ 5 seconds for someone who has not seen BRIEF before."
    expected: "Non-developer reader can identify (a) the 4 phase categories, (b) the locked 12 commands grouped under those categories, and (c) the Levenshtein suggestion path on typo, all within ≤ 5 seconds. If understanding takes longer, the rich-help UX has not yet met its HRD-03 / Pitfall #9 mitigation goal even though the structural fixtures pass."
    why_human: "HRD-03 success criterion 'reads as categorized command listing with one-line per-command summary' is a UX claim that automated tests cannot evaluate. The categorisation, partial-match, and Levenshtein path all pass structural tests, but read-understandability is a human judgement. VALIDATION.md Manual-Only Verifications row #1 specifically calls this out."
  - test: "Verify backup/original-gsd branch preservation: run `git checkout backup/original-gsd -- commands/gsd/<one-deleted-slug>.md` (e.g., audit-fix.md, reapply-patches.md, autonomous.md) and confirm the file recovers; this validates A-D02 (50+ deleted commands preserved on backup branch, not lost)."
    expected: "Each spot-checked deleted command recovers from the backup branch without error. Confirms A-D02 hard-fork discipline did not destroy the original GSD command surface — it is preserved for reference. Recovery path is documented in SURFACE-AUDIT.md but not automatically tested."
    why_human: "VALIDATION.md Manual-Only Verifications row #4 specifically calls this out as manual. Automated check would require switching git branches mid-run, which violates the verifier's read-only, no-state-change discipline."
gaps: []
deferred:
  - truth: "npm test failure count ≤ 16 (Criterion 5)"
    addressed_in: "v1.1 (per CONTEXT D-D02)"
    evidence: "RESIDUAL-FAILS-V1.md catalogues 185 deferred fails with per-cluster v1.1 remediation effort estimate ~10-15h. Plan 09-06 SUMMARY.md documents this as Rule-4 deferred deviation with the architectural rationale (Plan 09-05 atomic deletion broadened the assertion-drift surface beyond Phase 1's framing). User explicitly accepted the deviation when locking D-D02 and D-D04."
  - truth: "Pilots 2/3 + 3/3 (fully external EN + non-Korean Asian planners) for HRD-04"
    addressed_in: "v1.1 beta program (per CONTEXT D-D01 + D-D04)"
    evidence: "Pilot journal explicitly logs pilot 1/3 = Korean build-team vision-keeper (transparency note); ROADMAP HRD-04 wording was revised post-D-D01 to accept partial 1/3 with 2/3 deferred. v1 launch gate prong (i) is satisfied via the partial 1/3 pilot's `severity=blocker count = 0` finding."
  - truth: "HRD-05 (c) 30 source-behavior + (d) 13 source-content drift fixes"
    addressed_in: "v1.1 (per CONTEXT D-D02)"
    evidence: "RESIDUAL-FAILS-V1.md sections (c) and (d) catalog these clusters in detail with per-test root-cause and remediation plan. Plan 09-06 documents this deferral as Rule-4 architectural decision."
  - truth: "Code review INFO findings (IN-01 unused `void fs;`, IN-02 unused `glob` alias, IN-03 padEnd no-op, IN-04 first-line-only error reasons)"
    addressed_in: "v1.1 backlog"
    evidence: "REVIEW-FIX.md explicitly notes 'The 4 INFO findings... were intentionally excluded per the `--auto` default scope. They remain documented in 09-REVIEW.md for follow-up under the v1.1 backlog or as nice-to-have polish.'"
---

# Phase 9: Hardening — Cross-Runtime Smoke + Non-Developer Pilot — Verification Report

**Phase Goal:** BRIEF v1 launch hardening — cross-runtime smoke verification, surface audit ≤12 cmds + ≤8 skills, rich /brief-help, ≥3 non-developer pilot acceptance (revised: vision-keeper as 1/3 + 2/3 v1.1 deferred per D-D01), and Phase 1 HALT-ACCEPTED 63 residuals (a)+(b) closure.

**Verified:** 2026-04-27
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Per-Criterion Goal-Backward Verification

| # | Success Criterion | Delivered Artefact | Empirical Proof | Status |
|---|------------------|-------------------|-----------------|--------|
| 1 | brief-cli smoke-test exercises 4 runtimes × 5 critical commands; text_mode fallback active | `brief/bin/lib/smoke-test.cjs` (176 lines), `brief/bin/brief-tools.cjs` case 'smoke-test' dispatcher + 5 `--smoke` no-op handlers wired into init/define/discover/design/deliver, `.planning/SMOKE-TEST.md` (20-cell matrix) | `node brief/bin/brief-tools.cjs init --smoke --text` → `{"smoke":"ok","cmd":"init"}`; SMOKE-TEST.md shows 20/20 PASS post-CR-01 fix; `brief-smoke-test-stub.test.cjs` 4/4 GREEN, `brief-smoke-test-text-mode.test.cjs` 4/4 GREEN, `brief-smoke-test-output-format.test.cjs` 3/3 GREEN | VERIFIED (with human-side end-to-end real-runtime check pending) |
| 2 | Surface count audit doc — ≤12 user-facing commands + ≤8 skills, with rationale for each | `.planning/SURFACE-AUDIT.md` (12-row table + 0/8 skills + Removed-in-v1 appendix listing 56 deletions + 1 rename) | `ls commands/brief/` returns exactly 12 files; `ls .claude/skills/` empty; SURFACE-AUDIT.md 12-row table with phase + rationale per command; `brief-surface-audit-count.test.cjs` 3/3 GREEN, `brief-surface-audit-doc.test.cjs` GREEN, `brief-surface-audit-install-cleanup.test.cjs` GREEN (every deleted slug verified absent from bin/install.js) | VERIFIED |
| 3 | /brief-help rich + categorised + /brief-help <topic> + Levenshtein 3-suggest distance ≤ 3 | `brief/bin/lib/help.cjs` (236 lines, zero-deps Levenshtein), `commands/brief/help.md` (frontmatter `name: brief:help`), `brief-tools.cjs case 'help'` dispatcher | `node brief-tools.cjs help --raw` renders 5-section 4D listing (DEFINE/DISCOVER/DESIGN/DELIVER/HELPERS) with all 12 commands grouped correctly; `node brief-tools.cjs help desin --raw` returns Levenshtein top-3 (`design` distance 1, `define` distance 2); `brief-help-categorization.test.cjs` GREEN, `brief-help-partial-match.test.cjs` GREEN, `brief-help-levenshtein.test.cjs` 11/11 GREEN | VERIFIED (with human-side UX read-understandability check pending) |
| 4 | ≥3 non-developer pilots logged (revised: vision-keeper 1/3 + 2/3 v1.1 deferred per D-D01) | `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md` (transparency note + Pitfall #9 friction table + severity=high triage + Out-of-Scope log + narrative appendix) | `brief-pilot-journal-structure.test.cjs` GREEN; frontmatter has `pilot_id: 1`, `user_role: korean-non-technical-product-owner`, `audience.confidentiality: internal`, `voice.languages: [ko, en]`; explicit `severity=blocker count = 0` line; explicit transparency note that pilot 1/3 = build-team vision-keeper; explicit Out-of-Scope log for 2/3 deferred to v1.1 beta | VERIFIED (with human-side dogfooding-honesty meta-check pending) |
| 5 | npm test failure count ≤ 16 (EMPIRICAL_BASELINE 6 + DELTA_CAP 10) | `RESIDUAL-FAILS-V1.md` catalogue with v1.1 remediation plan + Plan 09-06 Rule-4 deferral entry | Empirical post-Plan-09-05 count: 185. Documented as architecturally-driven deferral per D-D02 — Plan 09-05 atomic deletion of 56 GSD developer-surface commands broadened assertion-drift surface beyond Phase 1's estimate. v1.1 effort revised upward to ~10-15h. | DEFERRED via override (D-D02 + Rule-4 + user-accepted) |

**Score:** 5/5 success criteria delivered (Criterion 5 accepted-as-deferred via override per D-D02; one post-fix regression noted in §"Anti-Patterns Found")

### 16-Decision Coverage (CONTEXT.md A-D01..D-D04)

| Decision | Delivered Evidence | Status |
|----------|---------------------|--------|
| **A-D01** Lock 12 user-facing commands | `commands/brief/` has exactly 12 files matching the spec'd list; SURFACE-AUDIT.md row 1-12 enumerates the lineup | VERIFIED |
| **A-D02** Physically delete 50+ remaining commands; backup branch preserves them | SURFACE-AUDIT.md "Removed in v1" appendix lists 28+28=56 deleted slugs + 1 renamed; `git ls-tree backup/original-gsd` retains the originals (manual spot-check pending — see human_verification) | VERIFIED (preservation pending human spot-check) |
| **A-D03** Skills cap: `.claude/skills/` empty (0/8); audit doc states explicitly | `.claude/skills/` empty; SURFACE-AUDIT.md "Skills (0/8 cap)" section explicit | VERIFIED |
| **A-D04** Rationale documentation: `.planning/SURFACE-AUDIT.md` | File exists with 12-row table + per-command rationale | VERIFIED |
| **B-D01** Stub-driven smoke (no real Codex/Gemini/OpenCode CLIs) | `smoke-test.cjs` uses `execFileSync` with `INSTRUCTION_FILE` env injection; no real CLI invocation | VERIFIED |
| **B-D02** 5 critical commands per runtime | `init`, `define`, `discover`, `design`, `deliver` — each has `--smoke` handler at brief-tools.cjs lines 727 / 1036 / 1919 / 1962 / 2058 | VERIFIED |
| **B-D03** text_mode fallback verification via mocked INSTRUCTION_FILE | `smokeOneCell` sets `INSTRUCTION_FILE` env per runtime; WR-03 fix added `delete env.INSTRUCTION_FILE` for non-codex runtimes (parent-process contamination guard) | VERIFIED |
| **B-D04** SMOKE-TEST.md 4×5 matrix | File exists with markdown table; 20/20 PASS post-CR-01 fix | VERIFIED |
| **C-D01** 4D phase grouping (DEFINE/DISCOVER/DESIGN/DELIVER + HELPERS) | help.cjs `PHASE_CATEGORIES` map + 5-section render order verified empirically | VERIFIED |
| **C-D02** /brief-help <topic> partial keyword match | help.cjs `partialMatch()` function + `brief-help-partial-match.test.cjs` GREEN | VERIFIED |
| **C-D03** Levenshtein top-3 suggestions, distance ≤ 3 | help.cjs `levenshtein()` (50 lines, zero-deps) + `suggestTopK()` k=3 threshold=3; verified empirically `desin` → `design` (1), `define` (2) | VERIFIED |
| **C-D04** Implementation: commands/brief/help.md + brief/bin/lib/help.cjs (A1 zero-deps preserved) | Both files exist; A1 invariant verified at `node -e "console.log(...)" → 0` | VERIFIED |
| **D-D01** HRD-04 partial 1/3 acceptance | Pilot journal logs pilot 1/3 with explicit transparency note; Out-of-Scope log for 2/3 explicit | VERIFIED |
| **D-D02** HRD-05 (a)+(b) closed in Phase 9; (c)+(d) deferred to v1.1 | HRD-05-CLOSURE-RATIONALE.md (10 DELETE-skips) + ARCH count sync to 12/70/26 + RESIDUAL-FAILS-V1.md (c+d catalogue) | VERIFIED (with one post-fix regression — workflows count drift to 69; see §"Anti-Patterns Found") |
| **D-D03** Pilot friction measurement: Pitfall #9 frequency + severity | Journal has Pitfall #9 section with frequency + severity columns; `brief-pilot-journal-structure.test.cjs` GREEN | VERIFIED |
| **D-D04** v1 launch gate redefinition: 3-prong (i)+(ii)+(iii) | V1-LAUNCH-GATE.md with all 3 prongs PASS; verdict line present; cross-references to source artefacts present | VERIFIED |

### v1 Launch Gate 3-Prong Verification (D-D04)

| Prong | Criterion | Source Artefact | Empirical Status |
|-------|-----------|-----------------|------------------|
| (i) | 0 blocking pilot findings | `.planning/pilot/01-*-friction-journal.md` line 40 | PASS — explicit "No severity=blocker items found" assertion + 6 friction items all severity ∈ {medium, high} |
| (ii) | Smoke test 4 runtimes × 5 commands matrix; text_mode plumbing verified | `.planning/SMOKE-TEST.md` + `brief-tools.cjs` `--smoke` handlers | PASS — 20/20 PASS cells post-CR-01 fix; empirical probe `init --smoke --text` returns deterministic ok payload |
| (iii) | Surface cap compliance (≤12 cmds + ≤8 skills) | `.planning/SURFACE-AUDIT.md` + `commands/brief/` + `.claude/skills/` | PASS — 12/12 commands (filesystem-counted) + 0/8 skills (filesystem-counted); SURFACE-AUDIT.md table aligned |

### Required Artefacts (Level 1-3 verification)

| Artefact | Expected | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `commands/brief/*.md` (locked-12) | 12 files: define/discover/design/add-workstream/deliver/export/status/help/init/progress/undo/pause-work | ✓ | ✓ | ✓ | VERIFIED |
| `brief/bin/lib/smoke-test.cjs` | Stub-driven 4×5 matrix harness | ✓ (176 lines) | ✓ | ✓ (dispatched via case 'smoke-test') | VERIFIED |
| `brief/bin/lib/help.cjs` | Zero-deps Levenshtein + 4D categorisation | ✓ (236 lines) | ✓ | ✓ (dispatched via case 'help') | VERIFIED |
| `brief/bin/brief-tools.cjs` | case 'help' + case 'smoke-test' + 5 `--smoke` no-op handlers | ✓ | ✓ | ✓ | VERIFIED |
| `commands/brief/help.md` | New command, frontmatter `name: brief:help` + `<context>$ARGUMENTS</context>` | ✓ | ✓ | ✓ (post-WR-06 fix) | VERIFIED |
| `.planning/SMOKE-TEST.md` | 4×5 PASS/FAIL/SKIP matrix | ✓ | ✓ (20/20 PASS post-CR-01) | ✓ | VERIFIED |
| `.planning/SURFACE-AUDIT.md` | 12-row table + 0/8 skills + 56-row removal appendix | ✓ | ✓ | ✓ | VERIFIED |
| `.planning/V1-LAUNCH-GATE.md` | 3-prong checklist + verdict | ✓ | ✓ (verdict PASS) | ✓ | VERIFIED |
| `.planning/pilot/01-*-friction-journal.md` | Pitfall #9 table + severity triage + transparency note | ✓ | ✓ | ✓ | VERIFIED |
| `.planning/HRD-05-CLOSURE-RATIONALE.md` | Per-test triage table | ✓ (10-row table) | ✓ | n/a (audit doc) | VERIFIED |
| `.planning/RESIDUAL-FAILS-V1.md` | (c)+(d) drift catalogue with v1.1 remediation | ✓ | ✓ | n/a (audit doc) | VERIFIED |
| `docs/ARCHITECTURE.md` | Total commands/workflows/agents synced | ✓ | ⚠ (workflows = 70 in doc, 69 on disk post-WR-07) | ✓ | PARTIAL — see §Anti-Patterns |
| `bin/install.js` | No references to deleted command slugs | ✓ | ✓ (only internal-comment mentions remain at lines 1118 / 5326 / 5354 — render template + code comment, not user-facing) | ✓ | VERIFIED |
| `CLAUDE.md` BRIEF Workflow Enforcement section | LOCKED_12 entry-points only | ✓ (post-WR-02 fix; no deleted-cmd references) | ✓ | ✓ | VERIFIED |

### Key Link Verification (Wiring)

| From | To | Via | Status | Detail |
|------|----|----|--------|--------|
| commands/brief/help.md | brief-tools.cjs case 'help' | `<process>` block "Execute `brief-tools.cjs help $ARGUMENTS --raw`" | WIRED | Empirical: `brief-tools.cjs help --raw` renders 4D listing |
| brief-tools.cjs case 'help' | brief/bin/lib/help.cjs | require + buildCatalog/renderFull/handleTopic delegation | WIRED | Module exports `{buildCatalog, renderFull, levenshtein, ...}` consumed by dispatcher |
| brief-tools.cjs case 'smoke-test' | brief/bin/lib/smoke-test.cjs | require + run() invocation | WIRED | Empirical: smoke-test test fixtures GREEN |
| smoke-test.cjs (smokeOneCell) | brief-tools.cjs `<slug> --smoke` | execFileSync subprocess | WIRED | Empirical: `init --smoke --text` returns expected payload |
| commands/brief/init.md | LOCKED_12 next-step pointer | post-CR-02 fix replaced `/brief-plan-phase 1` with `/brief-discover` + `/brief-design` | WIRED | post-fix grep: 0 references to deleted commands |
| `<execution_context>` blocks (init.md, undo.md) | filesystem | `@~/.claude/brief/references/...` paths | WIRED post-CR-03 | Dangling `@~/.claude/brief/references/ui-brand.md` removed; remaining `@`-imports verified present |
| `.planning/V1-LAUNCH-GATE.md` | source artefacts | cross-reference list (SMOKE-TEST.md, SURFACE-AUDIT.md, pilot/01-, HRD-05-CLOSURE-RATIONALE.md, RESIDUAL-FAILS-V1.md) | WIRED | All 5 referenced files exist on disk |

### Behavioural Spot-Checks

| Behaviour | Command | Result | Status |
|-----------|---------|--------|--------|
| `/brief-help` renders 4D categorised listing | `node brief/bin/brief-tools.cjs help --raw` | Returns 5-section listing (DEFINE/DISCOVER/DESIGN/DELIVER/HELPERS) with 12 commands grouped correctly | PASS |
| `--smoke` handler responds with deterministic ok payload | `node brief/bin/brief-tools.cjs init --smoke --text` | Returns `{"smoke":"ok","cmd":"init"}` JSON | PASS |
| Levenshtein typo correction surfaces top-3 within distance ≤ 3 | `node brief/bin/brief-tools.cjs help desin --raw` | Returns `design` (distance 1) + `define` (distance 2) — top-3 with no false positives beyond distance 3 | PASS |
| All 11 Wave 0 fixture suites pass | `node --test <11 fixture files>` | 93/93 GREEN, 0 FAIL, 0 SKIP | PASS |
| A1 zero-runtime-deps invariant | `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` | Returns `0` | PASS |
| LOCKED_12 frontmatter naming consistent | `grep -c "^name: brief:" commands/brief/*.md` | Returns `12` (all 12 commands have `name: brief:<slug>` frontmatter) | PASS |
| ARCHITECTURE.md count test (Phase 9 acceptance test) | `node --test tests/architecture-counts.test.cjs` | 1/3 FAIL — workflows count drift (70 vs 69) | FAIL — post-fix regression (see §Anti-Patterns) |

### Code Review Fix Status (per 09-REVIEW-FIX.md)

| Severity | In-Scope | Fixed | Status |
|----------|----------|-------|--------|
| BLOCKER | 3 (CR-01 smoke matrix structurally broken; CR-02 init.md points at deleted /brief-plan-phase; CR-03 init.md + undo.md reference non-existent ui-brand.md) | 3/3 | ALL FIXED — commits 3af64fc / fb340a7 / a3ae71f |
| WARNING | 7 (WR-01 install.js reapply-patches; WR-02 CLAUDE.md deleted commands; WR-03 INSTRUCTION_FILE leak; WR-04 Levenshtein doc miscount; WR-05 catalog cache key; WR-06 help.md $ARGUMENTS; WR-07 obsolete brief/workflows/help.md) | 7/7 | ALL FIXED — commits 495743e / a2d17d3 / e8850b5 / 837fce4 / 624c372 / 80dfd3c / 92abda3 |
| INFO | 4 (IN-01..IN-04) | 0/4 | DEFERRED to v1.1 backlog per `--auto` default scope (REVIEW-FIX.md §Out of Scope) |

10/10 in-scope findings fixed; 4 INFO findings deferred per scope discipline.

### A1 Zero-Runtime-Deps Invariant

| Check | Command | Result | Status |
|-------|---------|--------|--------|
| `package.json.dependencies` is empty | `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` | 0 | VERIFIED |

### Vocabulary Lock Spot-Check

| Artefact | Banned-words count (`compliant\|leverage\|synergize\|holistic`) | Status |
|----------|--------------------------------------------------------------|--------|
| `.planning/SURFACE-AUDIT.md` | 0 | CLEAN |
| `.planning/V1-LAUNCH-GATE.md` | 0 | CLEAN |
| `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md` | 0 | CLEAN |

Vocabulary lock per Phase 4 D-09 / Phase 5 D-09 / Phase 7 D-01 honoured in all new Phase 9 artefacts.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| HRD-01 | 09-01 | Cross-runtime smoke (4 runtimes × 5 commands; text_mode fallback) | SATISFIED | smoke-test.cjs + SMOKE-TEST.md 20/20 PASS + 11 fixture tests GREEN |
| HRD-02 | 09-05 | Surface count audit ≤12 + ≤8 skills | SATISFIED | SURFACE-AUDIT.md + 12 files + 0 skills empirically verified |
| HRD-03 | 09-02 | Rich /brief-help with Levenshtein | SATISFIED | help.cjs + help.md + 11 Levenshtein tests GREEN + empirical UX probe (UX read-understandability needs human verification) |
| HRD-04 | 09-03 | Non-developer pilot 1/3 (vision-keeper) + 2/3 deferred | SATISFIED (per revised wording) | pilot/01-*-friction-journal.md + transparency note + Out-of-Scope log |
| HRD-05 | 09-04, 09-06 | (a) 19 missing-file tests + (b) ARCH.md count drift closure | SATISFIED FOR (a)+(b); (c)+(d) deferred per D-D02 | HRD-05-CLOSURE-RATIONALE.md (10 DELETE-skips) + ARCH sync 12/70/26 + RESIDUAL-FAILS-V1.md catalogue |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `docs/ARCHITECTURE.md` | 127 (`Total workflows: 70`) and 430 (`# 70 workflow definitions`) | Stale count after WR-07 fix deleted `brief/workflows/help.md` | WARNING | `tests/architecture-counts.test.cjs` line 49 currently FAILS — `expected 70, actual 69`. This is a fresh post-fix regression: WR-07 commit `92abda3` deleted `brief/workflows/help.md` AFTER Plan 09-06 commit `8390172` synced ARCHITECTURE.md to `Total workflows: 70`. The count needs to be re-synced to `69` (and the inline tree comment too). The fix is mechanical: `sed -i 's/Total workflows: 70/Total workflows: 69/' docs/ARCHITECTURE.md` plus the same change at line 430. **NOT a launch blocker** — does not affect any of the 3 v1 launch gate prongs; impacts only the architecture-counts.test.cjs assertion. Strongly recommend fixing before `/brief-verify-work` to avoid carrying a fresh test failure into v1 ship. |

No other anti-patterns surfaced in the new Phase 9 source. The 4 INFO findings (IN-01..IN-04) from REVIEW.md are explicitly deferred per scope discipline — they remain documented for the v1.1 backlog.

### Human Verification Required

#### 1. Real-runtime end-to-end smoke (HRD-01 / B-D01)

**Test:** Run `brief-cli smoke-test` (or the equivalent invocation) inside each of the 4 actual runtimes — Claude Code, OpenAI Codex, Gemini CLI, OpenCode — and verify that SMOKE-TEST.md regenerates correctly and that each runtime can route a child invocation through the brief-tools.cjs dispatcher without hitting an interactive precondition.

**Expected:** SMOKE-TEST.md is regenerated showing 4×5 = 20 cells, each PASS (or documented SKIP). The stub-driven harness has been verified end-to-end in the build process; what remains is confirming behaviour under real runtime sandboxes.

**Why human:** B-D01 explicitly chose stub-driven testing for v1 (env-independent + no API costs); v1.1 may add a `--live` opt-in flag. Only the user can run the 4 real runtime CLIs and confirm the smoke harness behaves correctly under each. The matrix as committed shows 20/20 PASS based on the stub harness + post-fix `--smoke` handler probe, but real runtime cross-confirmation is environment-bearing.

#### 2. Pilot friction journal honesty meta-check (HRD-04 / Pitfall #14 dogfooding-trap)

**Test:** Read `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md` as a second reader and judge whether the journal honestly captures friction vs. rationalising around it. Specifically: do the 6 logged friction items have severity assignments that feel right? Are there severity=high items that were silently re-classified as severity=medium? Is the "no severity=blocker" assertion (line 40) an honest read of the dogfooding session?

**Expected:** A second reader (the user, as build-team vision-keeper, OR an outside reviewer) confirms the journal is an honest read. Specifically confirms (a) the "No severity=blocker items found" assertion holds, (b) the 6 friction items chosen are representative of the dogfooding pain, and (c) no rationalisation of high-severity items into lower bands is detected.

**Why human:** Pitfall #14 (dogfooding trap) is a meta-reflection failure mode that automated checks cannot detect. Only a human reader, ideally one with adversarial stance toward the build-team's own friction journal, can flag rationalisation. The journal's transparency note (B4 revision) explicitly acknowledges pilot 1/3 is the build-team vision-keeper — the meta-check is whether self-pilot is honest about its own friction. This is the load-bearing trust check for prong (i) of the v1 launch gate.

#### 3. /brief-help UX read-understandability for non-developers (HRD-03 / Pitfall #9)

**Test:** Read `commands/brief/help.md` and run `/brief-help`, `/brief-help def`, `/brief-help xyz123` in a non-developer flow. Judge whether the 4D categorisation + Levenshtein suggestion output is read-understandable in ≤ 5 seconds for someone who has not seen BRIEF before.

**Expected:** Non-developer reader can identify (a) the 4 phase categories, (b) the locked 12 commands grouped under those categories, and (c) the Levenshtein suggestion path on typo, all within ≤ 5 seconds. If understanding takes longer, the rich-help UX has not yet met its HRD-03 / Pitfall #9 mitigation goal even though the structural fixtures pass.

**Why human:** HRD-03 success criterion "reads as categorized command listing with one-line per-command summary" is a UX claim that automated tests cannot evaluate. The categorisation, partial-match, and Levenshtein paths all pass structural tests, but read-understandability is a human judgement. VALIDATION.md Manual-Only Verifications row #1 specifically calls this out.

#### 4. backup/original-gsd branch preservation (A-D02)

**Test:** Run `git checkout backup/original-gsd -- commands/gsd/<one-deleted-slug>.md` for several deleted slugs (suggested spot-check: `audit-fix.md`, `reapply-patches.md`, `autonomous.md`, `discuss-phase.md`, `plan-phase.md`) and confirm each file recovers cleanly from the backup branch.

**Expected:** Each spot-checked deleted command recovers from the backup branch without error. Confirms A-D02 hard-fork discipline did not destroy the original GSD command surface — it is preserved for reference. Recovery path is documented in SURFACE-AUDIT.md "Recovery" section.

**Why human:** VALIDATION.md Manual-Only Verifications row #4 specifically calls this out as manual. Automated check would require switching git branches mid-run, which violates the verifier's read-only, no-state-change discipline. Spot-checking 3-5 slugs is sufficient — exhaustive verification is unnecessary for v1 launch.

### Acknowledged Deviations

#### Criterion 5 (npm test ≤ 16) — accepted via override per D-D02 + Plan 09-06 Rule-4

The empirical npm test failure count is 185 — far above the original ≤ 16 target. This deviation is documented at length in `.planning/RESIDUAL-FAILS-V1.md` and `.planning/V1-LAUNCH-GATE.md`. The architectural rationale: Plan 09-05's atomic deletion of 56 GSD developer-surface commands (which is correct + required per A-D02 hard-fork discipline + Pitfall #1 mitigation) broke ~169 previously-passing tests asserting against deleted file paths. Per D-D02, these cluster as (c) source-behavior drift + (d) source-content drift, both deferred to v1.1.

The user accepted this trade-off when locking D-D02 and D-D04. The v1 launch gate (D-D04) is the authoritative ship criterion — it is satisfied (3/3 prongs PASS). The empirical fail count is informational, catalogued for v1.1 remediation effort sizing (~10-15h estimate per `RESIDUAL-FAILS-V1.md`).

#### HRD-04 partial 1/3 — accepted explicitly per D-D01 + D-D04

ROADMAP HRD-04 was reworded post-D-D01 to accept the partial 1/3 pilot as v1 satisfaction; the remaining 2/3 are explicitly Out of Scope per D-D04 (NOT a v1 launch blocker). The transparency note in `.planning/pilot/01-*-friction-journal.md` makes the build-team-vision-keeper status of pilot 1/3 explicit.

### Gaps Summary

**No must-have gaps blocking v1 launch.**

The single test regression (architecture-counts workflows count drift 70→69) is a small post-WR-07 sync miss — easily fixed with a 2-line edit to `docs/ARCHITECTURE.md` lines 127 + 430. It does NOT affect any of the 3 v1 launch gate prongs. Recommend fixing before `/brief-verify-work` to avoid carrying a fresh test failure into the v1 ship.

The 4 human-verification items are not gaps — they are non-automatable UAT-style checks called out in VALIDATION.md "Manual-Only Verifications" §1, §2, §4 plus the real-runtime smoke confirmation. Two of them (real-runtime smoke + pilot honesty meta-check) are load-bearing for v1 launch confidence; recommend the user run them before `/brief-verify-work`.

### Recommendation

**Status: human_needed.** The 5 ROADMAP success criteria are delivered (Criterion 5 accepted as deferred via override). All 16 CONTEXT decisions trace to delivered evidence. The 3-prong v1 launch gate evaluates PASS empirically. The 10 in-scope code review findings are all fixed. A1 invariant holds. Vocabulary lock holds.

Two recommended actions before `/brief-verify-work` is invoked:

1. **Mechanical fix (~30 seconds):** Re-sync `docs/ARCHITECTURE.md` `Total workflows: 70` → `69` (line 127) + `# 70 workflow definitions` → `# 69 workflow definitions` (line 430) to close the post-WR-07 count drift. This restores `architecture-counts.test.cjs` to GREEN. Could either be done as a tiny doc-sync commit OR explicitly carried as one of the residual fails into RESIDUAL-FAILS-V1.md (your call — it's small enough either way).

2. **Human UAT (~15 minutes):** Run the 4 human-verification items above. Items #1 (real-runtime smoke) and #2 (pilot honesty meta-check) are load-bearing for v1 launch confidence; items #3 (UX read-understandability) and #4 (backup-branch preservation) are nice-to-have spot-checks before final ship.

Once the ARCH count is re-synced and the 4 manual UATs are confirmed, this verification report should be re-run with status flipping to `passed` and the v1 ship signal flowing into the milestone closure flow.

---

_Verified: 2026-04-27_
_Verifier: Claude (gsd-verifier)_
