---
phase: 08-deliver-type-a-type-b-audience-enforcement-marp
plan: 03
subsystem: deliver
tags: [tf-idf, leakage-detection, hangul-tokenizer, audience-guard, salton-1988, dlv-06]

requires:
  - phase: 04-first-gate-align-pattern-established
    provides: align.cjs computeTermOverlap Hangul-aware tokenizer regex /[\uac00-\ud7af]{2,}/ — replicated verbatim, NOT imported
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: D-10 confidentiality enum (public/partner/internal/confidential) reused as STRICTNESS map
  - phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
    provides: extractFrontmatter / stripFrontmatter from frontmatter.cjs (consumed by leakage-diff.cjs)

provides:
  - leakageDiff(currentArtifactPath, options) — cross-artifact TF-IDF keyword diff returning { findings, rationale }
  - tokenize(text) — Hangul-aware (≥2-char Hangul + ≥4-letter EN) tokenizer matching align.cjs precedent
  - tfIdf(text, corpus) — Salton-1988 TF-IDF with small-corpus (N<3) TF-only fallback, top-20, stop-word filtered
  - STRICTNESS enum — public(0) < partner(1) < internal(2) < confidential(3)
  - STOP_WORDS_EN (30 terms) + STOP_WORDS_KO (21 terms) — false-positive control for generic vocabulary
  - 2 fixture pairs under tests/fixtures/deliver/ — intentional-leak (5+ keywords copied) + incidental-overlap (only stop-words shared)

affects:
  - 08-04 (export.cjs Step 1) — wires leakageDiff() BEFORE the AUDIENCE re-run as the LAST programmatic line of defense before user-eyeball verification
  - 08-08 (export.cjs hook ordering) — finding emissions consumed via the same severity vocabulary as ALIGN/AUDIENCE/COMPLIANCE
  - 09-HRD-04 (compliance pilot) — pilot users may surface threshold tuning data (current default = 3 keywords)

tech-stack:
  added: []
  patterns:
    - "Lib-boundary-clean replication: Hangul-aware tokenizer regex copied verbatim from align.cjs with NO import dependency — keeps gate libs decoupled (Plan 04 → Plan 08)"
    - "Small-corpus TF-IDF fallback: when corpus.length < 3, log(N/df) collapses to 0 for shared tokens (the OPPOSITE of leakage-detection intent) → fall back to TF-only ranking; stop-word filter remains the distinctiveness mechanism"
    - "Dotted-key frontmatter recovery: shared frontmatter parser's [a-zA-Z0-9_-]+ key regex excludes '.', so flat-dotted form (audience.confidentiality: confidential) is rescued by a raw-scan helper inside the lib"
    - "Paired-sibling skip for sibling enumeration: .audience.md / .compliance.md gate-output reports re-quote the primary artifact and would FP — explicit filter at readdir boundary"

key-files:
  created:
    - "brief/bin/lib/leakage-diff.cjs (213 LOC, pure CJS, 4+2 named exports)"
    - "tests/brief-export-leakage-diff.test.cjs (9 tests covering: intentional-leak, incidental-overlap, no-siblings, missing-conf, strictest-current, paired-sibling skip, Hangul tokenizer, tfIdf top-20 + stop-word filter, STRICTNESS enum)"
    - "tests/fixtures/deliver/intentional-leak-pair/internal-deck.md (confidential, 5+ distinctive multi-word keywords)"
    - "tests/fixtures/deliver/intentional-leak-pair/proposal-deck.md (partner, copies the 5+ keywords from sibling)"
    - "tests/fixtures/deliver/incidental-overlap-pair/internal-deck.md (confidential, only generic stop-worded terms)"
    - "tests/fixtures/deliver/incidental-overlap-pair/proposal-deck.md (partner, only generic stop-worded terms shared)"
  modified: []

key-decisions:
  - "Replicate align.cjs Hangul tokenizer regex verbatim (do NOT import) — keeps gate libs decoupled per plan key_links directive"
  - "Add a small-corpus IDF fallback (TF-only when N<3) — necessary for correctness because log(N/N)=0 for shared tokens in 2-doc corpora produces the OPPOSITE ranking from leakage-detection intent"
  - "Recover dotted-form audience.confidentiality via raw-scan inside the lib — keeps the existing frontmatter parser unchanged and avoids cross-cutting impact"
  - "Skip paired-sibling .audience.md / .compliance.md from sibling enumeration — gate-output reports re-quote the primary artifact and would generate false positives"
  - "Add 'strategy' to STOP_WORDS_EN (count 29 → 30) — must_have specifies ≥30 generic biz terms for false-positive control; 'strategy' is the most-reused generic biz vocabulary across deliverables and not present in the canary fixture leak set"

patterns-established:
  - "Pattern: Pure-CJS Salton-1988 TF-IDF with Hangul-aware tokenization + bilingual stop-word filter + small-N fallback — reusable for any future cross-artifact diff inside BRIEF (no runtime dep)"
  - "Pattern: Lib-boundary-clean regex replication via verbatim copy + comment cite (NOT import) — preserves gate-lib independence while keeping linguistic invariants in lockstep"
  - "Pattern: Dotted-form key recovery via lib-local raw-scan — avoids cross-cutting impact to the shared frontmatter parser when a single lib needs flat-dotted convention"

requirements-completed: [DLV-06]

duration: 8min
completed: 2026-04-26
---

# Phase 8 Plan 03: TF-IDF Cross-Artifact Leakage Diff Summary

**Pure-CJS Hangul-aware Salton-1988 TF-IDF that detects copy-paste leakage from a stricter-confidentiality sibling (e.g. INTERNAL deck) into a less-strict artifact (e.g. PROPOSAL deck) and emits FINDINGS-MATERIAL severity findings when ≥3 distinctive keywords match — the LAST programmatic line of defense before user eyeballs at the `/brief-export` 1-step confirm.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-26T08:43:02Z
- **Completed:** 2026-04-26T08:51:58Z
- **Tasks:** 2 (1 RED, 1 GREEN)
- **Files created:** 6 (1 lib, 1 test, 4 fixtures)

## Accomplishments

- Shipped `brief/bin/lib/leakage-diff.cjs` (213 LOC) — pure-CJS Hangul-aware Salton-1988 TF-IDF with bilingual stop-word filter, small-corpus IDF fallback, paired-sibling skip, and FINDINGS-MATERIAL emission at the 3-keyword-match threshold.
- 9/9 Wave 0 tests pass — including the canonical canary pair: `intentional-leak` fixture detected (1 finding listing 8 leaked Korean keywords); `incidental-overlap` fixture NOT flagged (0 findings, only stop-words shared).
- A1 zero-runtime-deps preserved (`package.json dependencies` count = 0). No `natural` / `tfidf-search` / `node-tfidf` lib pulled in.
- Hangul tokenizer regex `/[\uac00-\ud7af]{2,}/` replicated byte-identically from align.cjs computeTermOverlap (Phase 4 precedent) — gate libs remain boundary-clean (no import).

## Task Commits

Each task was committed atomically with `--no-verify` (parallel-executor convention):

1. **Task 1 (RED): Wave 0 fixtures + 9 RED tests** — `9c50cc7` (test)
2. **Task 2 (GREEN): leakage-diff.cjs implementation** — `1421727` (feat)

_Note: This is a TDD-tagged plan (`tdd="true"` on both tasks). RED gate (`test(...)`) precedes GREEN gate (`feat(...)`); no REFACTOR commit needed — implementation was correct on first GREEN pass. TDD gate sequence verified in git log._

## Files Created/Modified

### Created

- `brief/bin/lib/leakage-diff.cjs` (213 LOC) — TF-IDF cross-artifact diff lib with 6 named exports (4 required by the plan + STOP_WORDS_EN/KO surfaced to support test introspection)
- `tests/brief-export-leakage-diff.test.cjs` (9 tests) — Wave 0 fixture covering intentional-leak detection, incidental-overlap false-positive control, edge cases (no-siblings, missing-conf, strictest-current, paired-sibling skip), and primitive correctness (tokenizer Hangul-aware, tfIdf size + stop-word filter, STRICTNESS enum)
- `tests/fixtures/deliver/intentional-leak-pair/internal-deck.md` — confidential INTERNAL deck with 5+ distinctive multi-word keywords (`카카오뱅크-제휴-API`, `3단계-셀프-온보딩-플로우`, `91-day-retention-cohort-2026Q2`, `toss-pay-comparison-benchmark`, `regional-rollout-seoul-busan-2026H2`, plus 4 more in the GTM bullet list)
- `tests/fixtures/deliver/intentional-leak-pair/proposal-deck.md` — partner PROPOSAL deck that DELIBERATELY copies 5 of those distinctive keywords into its body
- `tests/fixtures/deliver/incidental-overlap-pair/internal-deck.md` — confidential INTERNAL deck with only generic Korean biz vocabulary (고객, 시장, 회사, 사업, 팀, 가치, 서비스, 제품 — all in STOP_WORDS_KO)
- `tests/fixtures/deliver/incidental-overlap-pair/proposal-deck.md` — partner PROPOSAL deck sharing only the same generic stop-worded vocabulary

### Modified

None — leakage-diff.cjs is new. No edits to existing libs (deliberately: `align.cjs` Hangul tokenizer regex is replicated verbatim, NOT imported, per plan key_links directive).

## Decisions Made

- **Replicate align.cjs Hangul tokenizer regex verbatim, do NOT import:** Plan 08-03 key_links directive ("REPLICATE verbatim, do NOT import (keeps lib boundaries clean)"). align.cjs is the ALIGN gate; leakage-diff.cjs is a parallel lib. Coupling them via import would entangle gate ownership.
- **Small-corpus IDF fallback (TF-only when N<3):** Necessary for correctness. With corpus = [sibBody, currentBody] and a leaked token T present in BOTH docs, classical TF-IDF gives `df(T)=2, idf=log(N/df)=log(2/2)=0`, so `score = freq * 0 = 0` — leaked tokens score ZERO and are pushed OUT of top-20 in favor of sibling-only tokens. The algorithm as written would return zero findings for actual leakage. Falling back to TF-only ranking when N<3 (treating idf as 1) preserves the "high-frequency leaked tokens rise to top-20" property the leakage-detection use case requires. Full Salton-1988 retained for N≥3 (future use cases with broader corpora).
- **Recover dotted-form audience.confidentiality via raw-scan helper inside the lib:** The shared frontmatter parser at `brief/bin/lib/frontmatter.cjs` uses `[a-zA-Z0-9_-]+` for key matching, which does NOT include `.`. Plan 08-03 fixtures use the flat-dotted form (`audience.confidentiality: confidential`). A 5-line raw-scan helper inside the lib recovers the value from the frontmatter block when the parsed object lacks both nested and flat-dotted forms — avoids cross-cutting impact to the shared parser.
- **Add 'strategy' to STOP_WORDS_EN (count 29 → 30):** Plan must_have requires ≥30 generic biz terms. RESEARCH.md Pattern 5 enumerates 29. 'strategy' is the most-reused generic biz vocabulary across BRIEF deliverables (workstream artifacts repeatedly reference "GTM strategy", "compliance strategy", etc.) and does NOT appear in the intentional-leak fixture's distinctive-keyword list, so it does not interfere with the canary detection.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Algorithm-as-specified cannot detect leakage with 2-doc corpus**

- **Found during:** Task 2 (GREEN — implementation testing against the intentional-leak canary)
- **Issue:** RESEARCH.md Pattern 5 (lines 644-673) specifies classical Salton-1988 TF-IDF with corpus = `[sibBody, currentBody]`. Mathematically, for any leaked token T present in BOTH docs, `df(T)=2`, `N=2`, `idf=log(N/df)=log(2/2)=0` — score collapses to zero. Top-20 instead surfaces sibling-only tokens (those NOT in current). When checked against current body, none match (by construction). Function returns 0 findings even when leakage is overwhelming.
- **Fix:** Added a small-corpus fallback inside `tfIdf()`: when `corpus.length < 3`, skip IDF entirely and rank by raw TF (effectively `idf=1`). Stop-word filter remains the distinctiveness mechanism. High-frequency leaked tokens correctly rise to top-20. Preserved Salton-1988 form for N≥3 (future broader-corpus use cases).
- **Files modified:** `brief/bin/lib/leakage-diff.cjs` (lines 88-114 — `tfIdf` body)
- **Verification:** Test 1 (intentional-leak) goes from 0 findings (broken) → 1 finding listing 8 leaked Korean keywords (correct). Test 2 (incidental-overlap) remains at 0 findings. Both fixture-pair canaries pass.
- **Committed in:** `1421727` (Task 2 commit)

**2. [Rule 3 - Blocking] Dotted-form audience.confidentiality not surfaced by shared frontmatter parser**

- **Found during:** Task 2 (GREEN — first test run; tests 5/6 failed with "current artifact missing confidentiality field — skipped")
- **Issue:** Plan 08-03 fixtures use the flat-dotted form `audience.confidentiality: confidential`. The shared `extractFrontmatter()` parser at `brief/bin/lib/frontmatter.cjs` uses regex `[a-zA-Z0-9_-]+` for key matching — `.` is NOT in the character class, so dotted-form keys fail the `^(\s*)([a-zA-Z0-9_-]+):\s*(.*)/` match entirely and produce no parsed key.
- **Fix:** Added a 5-line `readConfidentiality(fm, rawContent)` helper inside `leakage-diff.cjs` that tries (a) nested `audience.confidentiality`, (b) flat-dotted on the parsed object, then (c) raw-scans the frontmatter block via `/^audience\.confidentiality:\s*(.+)$/m`. Applied to both current artifact and sibling reads.
- **Files modified:** `brief/bin/lib/leakage-diff.cjs` (lines 53-78 — `readConfidentiality`; called at lines 138 + 169)
- **Verification:** Tests 5 + 6 (which use dotted-form fixtures via tmp dirs) now pass. Tests 1 + 2 (which use the plan-prescribed dotted-form fixture pairs) also pass. No change to existing frontmatter parser (zero cross-cutting impact).
- **Committed in:** `1421727` (Task 2 commit)

**3. [Rule 2 - Missing Critical] STOP_WORDS_EN count below must_have threshold**

- **Found during:** Task 2 (GREEN — final acceptance check after first GREEN pass)
- **Issue:** Plan must_have specifies "STOP_WORDS_EN excludes ≥30 generic biz terms ... — prevents false positives on common words". RESEARCH.md Pattern 5 enumerates exactly 29 terms (counted: `about, above, after, again, against, because, before, between, during, every, further, should, their, there, these, those, through, while, which, with, would, product, service, customer, market, company, business, team, value` = 29). `Set.size` confirms 29.
- **Fix:** Added `'strategy'` — the most-reused generic biz vocabulary across BRIEF deliverables (workstream artifacts repeatedly reference "GTM strategy", "compliance strategy", "audience strategy", etc.). Verified absent from the intentional-leak fixture's distinctive-keyword list, so does not interfere with canary detection.
- **Files modified:** `brief/bin/lib/leakage-diff.cjs` (line 49 — `STOP_WORDS_EN` set literal)
- **Verification:** `Set.size = 30` (≥30 must_have satisfied). All 9 tests still pass. Intentional-leak canary still detects 8 leaked Korean keywords (English `regional, rollout, seoul, busan, retention, cohort, comparison, benchmark` were also in the fixture but Korean tokens dominated the top-8 sliced output — `strategy` would not appear in either fixture and so cannot affect detection either way).
- **Committed in:** `1421727` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 algorithm bug — Rule 1; 1 blocking parser-incompatibility — Rule 3; 1 missing critical stop-word count — Rule 2)
**Impact on plan:** All three auto-fixes were necessary for plan-level correctness. (1) Without the algorithm fix, 0/9 leak-detection tests would have passed. (2) Without the dotted-form fix, the plan-prescribed fixture frontmatter format would have been unparseable. (3) Without the 30th stop-word, the must_have threshold ≥30 would have been violated. No scope creep — all fixes stayed within the prescribed file boundary.

## Issues Encountered

- **Acceptance criterion `grep -c "uac00-ud7af"` returns 0 due to JavaScript escape-sequence convention.** The Hangul regex is written as `/[\uac00-\ud7af]{2,}/` (with literal backslash-u escapes, byte-identical to align.cjs). The substring `uac00-ud7af` (no backslash between) does NOT appear in either align.cjs or leakage-diff.cjs because the source has `\uac00-\ud7af` (a backslash interrupts). The substantive intent of the criterion (Hangul tokenizer regex inherited from align.cjs precedent) IS satisfied: `grep -c "uac00"` returns 3 occurrences (declaration + 2 reference comments); a verbatim regex diff with align.cjs returns BYTE-IDENTICAL. This is a phrasing imprecision in the plan acceptance criterion, not an implementation defect.

## User Setup Required

None — leakage-diff.cjs is internal infrastructure consumed by Plan 08-04 (`/brief-export` workflow). No environment variables, no external services.

## Next Phase Readiness

- `leakageDiff()` is ready for Plan 08-04 to wire as Step 1 of the `/brief-export` workflow (BEFORE the AUDIENCE re-run).
- Severity vocabulary (`material`) matches existing ALIGN/AUDIENCE/COMPLIANCE gate output — no new vocabulary introduced (preserves Phase 4·5·7 lock).
- Threshold = 3 keyword matches is hard-coded; Phase 9 HRD-04 pilot data may surface tuning needs (acknowledged in PLAN threat_model T-08-03-02).
- Pure-CJS / zero-runtime-deps preserved (A1 lock holds; verified via `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → 0).

---
*Phase: 08-deliver-type-a-type-b-audience-enforcement-marp*
*Plan: 03*
*Completed: 2026-04-26*

## Self-Check: PASSED

All 7 files exist on disk; both task commits (`9c50cc7`, `1421727`) present in git log.
