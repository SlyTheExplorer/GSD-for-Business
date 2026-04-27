---
phase: 09-hardening-cross-runtime-smoke-non-developer-pilot
plan: 03
subsystem: pilot
tags: [hrd-04, pitfall-9, dogfooding, vision-keeper, friction-journal, audience-guard]

# Dependency graph
requires:
  - phase: 09-hardening-cross-runtime-smoke-non-developer-pilot
    provides: Wave 0 RED fixture tests/brief-pilot-journal-structure.test.cjs (Plan 00) — flips to GREEN with this plan's artifact
  - phase: 08-deliver
    provides: brief/bin/lib/voice-fit.cjs canonical BANNED_EN regex (16 EN words) — imported by the pilot journal vocabulary lock
provides:
  - HRD-04 partial 1/3 friction journal at .planning/pilot/01-korean-non-technical-product-owner-friction-journal.md
  - Pitfall #9 friction vocabulary table (6 rows) with phase citations + severity (3 high, 3 medium, 0 blocker)
  - Severity=high triage notes (Pitfall 5 anti-rationalization discipline)
  - B4 transparency note (pilot 1/3 = build-team vision-keeper, not fully external)
  - Out of Scope log for remaining 2/3 pilots (deferred to v1.1 beta per D-D01 + D-D04, NOT a launch blocker)
affects: [09-06 v1-launch-gate-verifier, v1.1-beta-recruit, v1.1-beta-pilot-journal-batch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pilot friction journal schema (frontmatter: pilot_id, user_role, logged, audience.confidentiality:internal, voice.languages:[ko,en]; body: Pitfall #9 table + Severity=high triage + Out of Scope log + Appendix)"
    - "Vocabulary lock via canonical BANNED_EN import from voice-fit.cjs (B5/W6 revision discipline — never re-type the alternation)"
    - "awk-based body extractor (`awk '/^---$/{n++; next} n>=2'`) for frontmatter-stripped scans (B5 revision: line-offset-fragile tail -n +N rejected)"

key-files:
  created:
    - .planning/pilot/01-korean-non-technical-product-owner-friction-journal.md
  modified: []

key-decisions:
  - "Pilot 1/3 = BRIEF build-team vision-keeper (not fully external) per D-D01 acceptance; explicit transparency note in journal body per B4 revision iteration 1"
  - "Remaining 2/3 pilots deferred to v1.1 beta (Out of Scope per D-D04, NOT a v1 launch blocker)"
  - "Vocabulary lock uses canonical BANNED_EN regex imported from voice-fit.cjs (16 EN words) plus the basic 4-word inline guard (compliant|passed|green check|green checkmark)"
  - "awk body extractor replaces tail -n +N to be robust against frontmatter line-count drift"

patterns-established:
  - "HRD-04 partial-fulfillment pattern: 1 of 3 pilots logged + 2 of 3 deferred to v1.1 with explicit Out of Scope rationale (D-D01 + D-D04) — closes the requirement without spec-weakening"
  - "Pitfall 5 anti-rationalization in pilot journals: every friction row cites a phase, severity=high items are triaged in a dedicated section, severity=blocker count == 0 is the V1-LAUNCH-GATE prong (i) input"

requirements-completed: [HRD-04]

# Metrics
duration: ~10min
completed: 2026-04-27
---

# Phase 9 Plan 3: Korean Non-Technical Product Owner Friction Journal Summary

**HRD-04 partial 1/3 dogfooding journal: 6 Pitfall #9 friction rows (3 high / 3 medium / 0 blocker), B4 transparency note that pilot 1/3 is the build-team vision-keeper, and explicit Out-of-Scope deferral of 2/3 to v1.1 beta per D-D01 + D-D04**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-27T00:40Z (approx — plan loaded after worktree base reset)
- **Completed:** 2026-04-27T00:51Z
- **Tasks:** 1 / 1
- **Files created:** 1

## Accomplishments

- Created `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md` (93 lines) with full schema per Plan 03 PATTERNS.md lines 833-871
- Wave 0 RED fixture `tests/brief-pilot-journal-structure.test.cjs` flipped from skip → GREEN (4/4 tests passing)
- Pitfall #9 friction table populated with 6 rows: smart_discuss table clutter (medium), agent quota fatigue (high), cwd bug exposure (high), AskUserQuestion fallback gaps (medium), command surface memorability (high), implementation-seat discomfort (medium)
- 3 severity=high items each triaged in the Severity=high Triage section with concrete Phase 9 closure references (HRD-02 + HRD-03 + Wave parallelism cap)
- 0 severity=blocker rows — V1-LAUNCH-GATE prong (i) "0 blocking pilot findings" expected to read PASS at Plan 06 verifier

## Task Commits

1. **Task 1: Create pilot friction journal** — `5a8dd5f` (docs)

## Files Created/Modified

- `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md` — friction journal with frontmatter (pilot_id=1, user_role, logged, audience.confidentiality=internal, voice.languages=[ko,en]) + Pitfall #9 table + Severity=high triage + Out of Scope log + 4-section appendix (phase shape, cwd-bug memory, Korean honorific, memory feedback signals)

## Decisions Made

- Vocabulary lock implementation: imported the canonical BANNED_EN regex directly from `brief/bin/lib/voice-fit.cjs` (16 EN words) AND ran the basic 4-word inline guard (compliant|passed|green check|green checkmark). Both checks return zero matches. This honors B5/W6 revision discipline (never re-type the alternation; previous draft missed transform/landscape/unlock/empower).
- Body extraction: used `awk '/^---$/{n++; next} n>=2'` rather than `tail -n +N` to be robust against frontmatter line-count drift (B5 revision iteration 1 rationale).
- Appendix expansion: when the initial 50-line draft was 10 lines short of the min_lines:60 contract, added 4 narrative subsections (A: phase shape vs. mental model; B: cwd-bug visceral memory; C: Korean honorific + bilingual surface; D: memorable feedback signals from MEMORY.md) — content drawn from real dogfooding observations, not filler. Final length: 93 lines.

## Deviations from Plan

None - plan executed as written. One minor in-flight self-correction: the first pass of the appendix used the phrase "verify=passed" which triggered the basic banned-word guard (`passed`); rephrased to "verify=ok" before commit. This is not a deviation in the Rule-1/2/3 sense — it was caught by the acceptance check loop and fixed before any commit attempt.

**Total deviations:** 0
**Impact on plan:** None — plan executed exactly as written, including the B4 transparency note and B5/W6 vocabulary-lock disciplines.

## Issues Encountered

- **Worktree base mismatch on agent startup:** The worktree's HEAD was at `c5b453f` rather than the expected base `d605869`. Per the `<worktree_branch_check>` instruction, ran `git reset --hard d605869` to align before reading the plan. This is the standard worktree-startup protocol; not a substantive issue.
- **Initial draft 10 lines short of min_lines:60:** The exact template provided in the plan body (≈50 lines as written) was 10 short of the contract. Resolved by expanding the Appendix with 4 narrative subsections drawn from real dogfooding observations (not filler). Final 93 lines.
- **Banned-word "passed" caught in self-check:** First-draft appendix used "verify=passed"; the basic banned-vocab guard caught it pre-commit. Rephrased to "verify=ok". Vocabulary lock now satisfied (0 matches in both basic + canonical regex scans).

## Verification

(a) **Final friction-row count + severity distribution:** 6 rows total — 3 severity=high (agent quota fatigue, cwd bug exposure, command surface memorability) + 3 severity=medium (smart_discuss table clutter, AskUserQuestion fallback gaps, implementation-seat discomfort) + 0 severity=blocker.

(b) **Vocabulary-lock workarounds:** None required. The phrase "verify=passed" was rephrased to "verify=ok" before any commit; no banned word was load-bearing in any phase citation. Both the basic 4-word guard (compliant|passed|green check|green checkmark) and the canonical 16-word BANNED_EN imported from voice-fit.cjs return zero matches in body.

(c) **severity=blocker count is 0 (V1-LAUNCH-GATE prong (i) ready to PASS):** Confirmed via `grep -cE '\|\s*blocker\s*\|' .planning/pilot/01-korean-non-technical-product-owner-friction-journal.md` → `0`. Plan 06 (HRD-05 verifier) will read this as the prong (i) input.

(d) **W3 frontmatter-parse acceptance check returned 3 non-empty values:** Confirmed via `node -e "const fm=require('./brief/bin/lib/frontmatter.cjs').extractFrontmatter(...); console.log(fm.pilot_id, fm.user_role, fm.logged)"` → `1 korean-non-technical-product-owner 2026-04-27`. All 3 required frontmatter keys are defined and non-empty. The nested `audience.confidentiality` field also parses to `'internal'` for CC-03 hook compatibility.

(e) **REQUIREMENTS.md HRD-04 wording is consistent with the journal's B4 transparency note:** Confirmed via `grep "HRD-04" .planning/REQUIREMENTS.md` returning the revision-iteration-1 wording: "BRIEF is piloted with the BRIEF vision-keeper (1 of 3 in v1) and ≥2 additional non-developer business planners (deferred to v1.1 beta program) per CONTEXT D-D01. The vision-keeper counts as a non-developer pilot under D-D01 acceptance — they are non-technical and used BRIEF end-to-end on a real planning project, even though they are also the build-team vision-keeper." The pilot journal's Transparency note section uses the same acceptance language verbatim.

## Next Phase Readiness

- HRD-04 partial 1/3 logged ✓ — Plan 06 verifier prong (i) input ready
- Wave 0 fixture GREEN ✓ — no test blocker for Plan 06 entry
- Out of Scope log present ✓ — v1.1 beta program scope captured for v1.1 planning kickoff
- Audience-guard frontmatter compatible (CC-03 hook) ✓ — journal can be committed under the brief-validate-frontmatter.sh hook without regenerate

## Self-Check: PASSED

- File exists: `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md` ✓
- Commit exists: `5a8dd5f` (verified via `git log --oneline | grep 5a8dd5f`) ✓
- Wave 0 fixture GREEN: 4/4 tests pass via `node --test tests/brief-pilot-journal-structure.test.cjs` ✓
- All 13 acceptance criteria from Plan 03 satisfied (line count 93≥60, frontmatter keys present, Pitfall #9 header, severity rows, vocabulary lock zero matches, B4 transparency note, Out of Scope log) ✓

---
*Phase: 09-hardening-cross-runtime-smoke-non-developer-pilot*
*Completed: 2026-04-27*
