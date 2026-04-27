---
phase: 09-hardening-cross-runtime-smoke-non-developer-pilot
plan: 02
subsystem: cli-help-surface

tags: [help, levenshtein, dispatcher, brief-tools, frontmatter, 4d-phase]

# Dependency graph
requires:
  - phase: 09-01-smoke-test
    provides: case 'smoke-test' dispatcher landing point — Plan 09-02 inserts case 'help' immediately after it (canonical voice-fit → smoke-test → help → leakage-diff ordering)
  - phase: 09-00-test-fixtures
    provides: Wave 0 RED fixtures (brief-help-categorization / partial-match / levenshtein) ready to flip GREEN
  - phase: 08-deliver
    provides: case 'voice-fit' (lines 864-907) byte-identity template + frontmatter.cjs::extractFrontmatter helper

provides:
  - brief/bin/lib/help.cjs — 7 exports (buildCatalog, renderCategorized, renderTopicMatch, renderTypoSuggestions, levenshtein, suggestTopK, PHASE_CATEGORIES)
  - case 'help' dispatcher in brief-tools.cjs (line 939) with 3 paths (no-arg / partial-match / typo)
  - commands/brief/help.md rewritten with corrected name:brief:help frontmatter + dispatcher invocation body
  - Inline two-row DP Levenshtein (~30 LOC, RESEARCH.md Pattern 2 verbatim) — zero new runtime deps preserved (A1 invariant)

affects:
  - phase 09-05 (HRD-02 surface pruning) — LOCKED_12 count assertion in brief-help-categorization.test.cjs flips GREEN once commands/brief/*.md count drops from 68 to 12
  - phase 09-06 (HRD-04 pilot journal) — pilots will exercise /brief-help and surface friction in the friction journal
  - v1.1 cleanup — orphaned brief/workflows/help.md left in place (deletion deferred; not in locked 12-cmd lineup)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Inline two-row DP Levenshtein (Wikipedia-canonical, ~30 LOC, zero deps)"
    - "Module-level _catalogCache for filesystem-driven catalog scan (RESEARCH.md Pattern 3)"
    - "4D phase categorization (DEFINE/DISCOVER/DESIGN/DELIVER/HELPERS) anchored on PHASE_CATEGORIES hash"
    - "Dispatcher byte-identity: case 'help' mirrors case 'voice-fit' try/catch + error + core.output"

key-files:
  created:
    - brief/bin/lib/help.cjs (230 LOC, 7 exports)
    - .planning/phases/09-hardening-cross-runtime-smoke-non-developer-pilot/09-02-SUMMARY.md
  modified:
    - brief/bin/brief-tools.cjs (added case 'help' at line 939, between smoke-test and leakage-diff)
    - commands/brief/help.md (frontmatter drift fixed: gsd:help → brief:help; body rewritten to invoke dispatcher with --raw)
    - tests/brief-help-levenshtein.test.cjs (Rule 1 deviation — test assertion corrected to match canonical Levenshtein DP)

key-decisions:
  - "Inline ~30-LOC two-row DP Levenshtein over fast-levenshtein npm dep (A1 zero-runtime-deps invariant)"
  - "Module-level _catalogCache (Pattern 3) — recomputed per process; survives manual commands/brief/ edits without an install step"
  - "PHASE_CATEGORIES is the single source of truth for 4D mapping; renderCategorized iterates a fixed canonical order (DEFINE → DISCOVER → DESIGN → DELIVER → HELPERS) regardless of catalog ordering"
  - "commands/brief/help.md <process> block invokes brief-tools.cjs help [<topic>] --raw (the --raw flag is required because core.output emits JSON by default; --raw selects the markdown fallback string per the inverted convention used by every Phase-8 dispatcher)"
  - "Orphaned brief/workflows/help.md left in place (Open Question 5 resolution: NOT deleted in Plan 09-02 — bin/install.js audit out of scope; HRD-02 surface pruning Plan 09-05 may sweep it, otherwise v1.1 cleanup)"
  - "Test fixture Levenshtein assertion corrected from 2 to 3 (Rule 1 deviation — original RESEARCH.md narrative miscounted; canonical DP returns 3; Pitfall 3 disambiguation contract still holds since 3 ≤ threshold 3)"

patterns-established:
  - "Pattern: brief-tools.cjs case dispatcher byte-identity — copy try/catch + error + core.output(result, raw, fallbackText) shape from case 'voice-fit'; subcommand routing via args[1] indexing; require lib at case-entry (not file-top) for lazy load"
  - "Pattern: 4D phase categorization hash — PHASE_CATEGORIES maps slug→category; renderCategorized iterates the fixed 5-section canonical order; falls back to HELPERS for unmapped slugs"
  - "Pattern: filesystem-driven catalog with module-level cache — buildCatalog reads commands/brief/*.md at first call, caches; CRLF-aware frontmatter strip handles Windows + Unix line endings"
  - "Pattern: --raw inverts default — core.output(result, raw=true, fallbackText) emits the fallback string; raw=false (default) emits JSON. Slash-command <process> blocks pass --raw to the dispatcher to render markdown for the user"

requirements-completed: [HRD-03]

# Metrics
duration: 5min
completed: 2026-04-27
---

# Phase 09 Plan 02: HRD-03 rich /brief-help — 4D categorization + Levenshtein typo correction

**4D-categorized command listing (DEFINE/DISCOVER/DESIGN/DELIVER/HELPERS) with case-insensitive partial-keyword match and inline two-row DP Levenshtein typo suggestion (top-3, distance ≤ 3) — zero new runtime deps.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-27T00:55:31Z
- **Completed:** 2026-04-27T01:00:46Z
- **Tasks:** 2
- **Files modified:** 4 (1 created lib + 1 dispatcher edit + 1 command frontmatter rewrite + 1 test fixture correction)

## Accomplishments

- `brief/bin/lib/help.cjs` lib created — 7 exports (`buildCatalog`, `renderCategorized`, `renderTopicMatch`, `renderTypoSuggestions`, `levenshtein`, `suggestTopK`, `PHASE_CATEGORIES`)
- `case 'help'` dispatcher inserted at brief-tools.cjs line 939, byte-identical to `case 'voice-fit'`
- `commands/brief/help.md` rewritten — frontmatter `name: gsd:help` → `name: brief:help` drift fixed; body invokes `brief-tools.cjs help [<topic>] --raw`
- 3 dispatch paths verified: no-arg (renderCategorized), partial-match (renderTopicMatch), typo (renderTypoSuggestions)
- A1 invariant preserved: `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` returns 0 before AND after Plan 09-02
- Wave 0 fixtures: 10 pass, 1 skip (`tests/brief-help-categorization.test.cjs` LOCKED_12 count test correctly skips because current commands count is 68; flips GREEN after Plan 09-05 pruning)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create brief/bin/lib/help.cjs with 7 exports (catalog + render + Levenshtein)** — `7612e9f` (feat)
2. **Task 2: Add `case 'help'` dispatcher to brief-tools.cjs + rewrite commands/brief/help.md** — `760660c` (feat)

## Canonical brief-tools.cjs Case Ordering (post-edit, verified)

| Line | Case |
|------|------|
| 864  | `case 'voice-fit'` (Phase 8 — existing) |
| 909  | `case 'smoke-test'` (Plan 09-01 — Wave 1) |
| **939** | **`case 'help'` (Plan 09-02 — Wave 2; THIS plan)** |
| 978  | `case 'leakage-diff'` (Phase 8 — existing) |

Verified via:
```bash
node -e "const fs=require('node:fs'); const lines=fs.readFileSync('brief/bin/brief-tools.cjs','utf-8').split('\n'); const vf=lines.findIndex(l=>/case 'voice-fit'/.test(l)); const st=lines.findIndex(l=>/case 'smoke-test'/.test(l)); const h=lines.findIndex(l=>/case 'help':/.test(l)); console.log(vf>0 && st>vf && h>st ? 'order-ok' : 'order-broken')"
# → order-ok
```

## Orphaned brief/workflows/help.md — Status

The file `brief/workflows/help.md` was previously referenced from `commands/brief/help.md` via `@~/.claude/brief/workflows/help.md`. The Plan 09-02 rewrite removed that reference (the new `<process>` block points DIRECTLY at `brief-tools.cjs help [<topic>] --raw`).

**Decision: LEFT IN PLACE.** Rationale:
- Deletion would require a `bin/install.js` audit (verify no install-time copy logic still references it) which is out of scope for Plan 09-02 (frontmatter drift fix + dispatcher add).
- HRD-02 surface pruning in **Plan 09-05** is the canonical sweep window: if `brief/workflows/help.md` is not part of the locked 12-cmd lineup it will be deleted there.
- If Plan 09-05 doesn't sweep it, the file becomes a documented v1.1 cleanup item via `RESIDUAL-FAILS-V1.md`.
- No runtime breakage: nothing in `commands/brief/help.md` or `brief/bin/lib/help.cjs` references the orphaned workflow file anymore.

## Files Created/Modified

- `brief/bin/lib/help.cjs` (CREATED, 230 LOC) — service lib: catalog scan + 4D-categorized render + partial-keyword match + Levenshtein typo suggestion. 7 module exports. Module-level `_catalogCache`. Inline two-row DP Levenshtein verbatim from RESEARCH.md Pattern 2.
- `brief/bin/brief-tools.cjs` (MODIFIED, +40 LOC at line 939) — `case 'help'` dispatcher with try/catch + error + core.output, byte-identity to case 'voice-fit'. Three dispatch paths: no-arg → renderCategorized; substring match → renderTopicMatch; no match → renderTypoSuggestions(suggestTopK).
- `commands/brief/help.md` (REWRITTEN, frontmatter + body) — frontmatter drift fixed (`gsd:help` → `brief:help`); description references 4D phase grouping + Levenshtein; argument-hint set to `[<topic>]`; allowed-tools includes Bash; body removes orphaned `@~/.claude/brief/workflows/help.md` reference and points `<process>` block at `brief-tools.cjs help [<topic>] --raw`.
- `tests/brief-help-levenshtein.test.cjs` (MODIFIED, 1-line assertion + comment) — Rule 1 deviation: `levenshtein('define','design')` assertion corrected from 2 to 3 to match canonical Levenshtein DP output.

## Decisions Made

- **Inline ~30-LOC two-row DP Levenshtein (no npm dep).** Mathematically identical to `fast-levenshtein` for this use case; A1 invariant preserved.
- **PHASE_CATEGORIES as single source of truth for 4D mapping.** A planner extending the lineup edits one hash; renderCategorized iterates a fixed 5-section canonical order regardless of catalog ordering.
- **Module-level `_catalogCache`.** Recomputed per process; survives manual `commands/brief/` edits without an install step (RESEARCH.md Discretion-3).
- **`commands/brief/help.md <process>` block invokes `--raw` flag.** `core.output(result, raw, fallbackText)` semantics: `raw=true` (i.e., `--raw` passed) emits the fallback markdown string; `raw=false` (default) emits JSON. Same convention as every Phase-8 dispatcher.
- **Orphaned `brief/workflows/help.md` left in place** (rationale above).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected Levenshtein assertion in test fixture**
- **Found during:** Task 1 verification (running `tests/brief-help-levenshtein.test.cjs` against the new help.cjs)
- **Issue:** Test fixture asserted `help.levenshtein('define', 'design') === 2`. The associated comment claimed "define and design differ by 2 characters (f→s, e→g)". This is mathematically incorrect — `define` and `design` differ at 3 positions: position 2 (`f` vs `s`), position 4 (`n` vs `g`), position 5 (`e` vs `n`). The canonical Wikipedia two-row DP Levenshtein returns 3, not 2. Verified independently with a full O(mn) DP matrix:
  - `levenshtein('define','define') === 0` ✓
  - `levenshtein('define','defin') === 1` ✓
  - `levenshtein('define','desine') === 1` ✓
  - `levenshtein('define','design') === 3` ✓ (canonical)
- **Fix:** Updated `tests/brief-help-levenshtein.test.cjs` line 67 assertion from `2` to `3`. Added rationale comment citing Plan 09-02 Rule 1 deviation.
- **Files modified:** tests/brief-help-levenshtein.test.cjs
- **Verification:** All 5 tests in the Levenshtein suite GREEN. The Pitfall 3 disambiguation contract still holds: distance 3 ≤ threshold 3, so `suggestTopK('desin', LOCKED_12, 3, 3)` returns BOTH `design` (distance 1) AND `define` (distance 2) — verified manually.
- **Committed in:** `7612e9f` (Task 1 commit)
- **Impact:** No runtime impact. The implementation is canonically correct; only the test expectation needed correction. The Plan 09-02 plan text and 09-RESEARCH.md Pitfall 3 narrative carry the same miscount and may want a v1.1 doc fix, but that's out of scope for this execution.

---

**Total deviations:** 1 auto-fixed (1 bug fix in a test fixture)
**Impact on plan:** Single-line assertion correction; no scope creep. Implementation matches canonical Levenshtein DP and PATTERNS.md verbatim template. Pitfall 3 narrative (define ↔ design near-collision) is preserved because the threshold of 3 still admits both candidates for typo inputs near either slug.

## Issues Encountered

- **Default JSON vs. --raw markdown convention:** The plan's `<verify>` clause invokes `node brief/bin/brief-tools.cjs help` (no `--raw`) and pipes to `grep -E "^## (DEFINE|...)"`. Without `--raw`, `core.output` emits JSON by default — the markdown is the fallback string emitted only when `--raw` is passed. The slash command body in `commands/brief/help.md` was authored to pass `--raw` so the user-facing experience renders the markdown listing as expected. Manual verification with `--raw` flag passes all 4 paths (no-arg, partial-match, typo with candidates, typo without).
- **Pre-existing `tests/architecture-counts.test.cjs` failure** (agent count drift, expected 26 actual 31) is out of scope — pre-existed before Plan 09-02 changes (verified via `git stash` + retest). Tracked in HRD-05 deferred fails.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 09-02 closes HRD-03 substrate (rich `/brief-help`). Wave 2 complete.
- 1 Wave 0 fixture (`tests/brief-help-categorization.test.cjs` LOCKED_12 count test) remains gated on Plan 09-05 surface pruning — flips GREEN automatically once `commands/brief/*.md` count reaches 12.
- Orphaned `brief/workflows/help.md` left in place; Plan 09-05 may sweep it. If not, document in `.planning/RESIDUAL-FAILS-V1.md` for v1.1 cleanup.
- No blockers for downstream Phase 9 plans (HRD-04 pilot journal, HRD-05a/b residual closure, V1-LAUNCH-GATE).

## Self-Check: PASSED

Verified all claimed artifacts and commits exist:

- `brief/bin/lib/help.cjs` — FOUND (230 LOC, 7 exports, A1-clean)
- `brief/bin/brief-tools.cjs` — MODIFIED (case 'help' at line 939, canonical ordering verified)
- `commands/brief/help.md` — REWRITTEN (`name: brief:help`, `--raw` invocation in `<process>`)
- `tests/brief-help-levenshtein.test.cjs` — MODIFIED (assertion corrected)
- Commit `7612e9f` — FOUND (`feat(09-02): add help.cjs lib (catalog + 4D categorization + Levenshtein)`)
- Commit `760660c` — FOUND (`feat(09-02): wire case 'help' dispatcher + rewrite commands/brief/help.md`)
- Wave 0 fixtures: `node --test tests/brief-help-*.test.cjs` → 10 pass, 1 skip (Plan 09-05 gated), 0 fail
- A1 invariant: `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → 0
- Canonical case ordering: voice-fit (864) → smoke-test (909) → help (939) → leakage-diff (978) — `order-ok`

---
*Phase: 09-hardening-cross-runtime-smoke-non-developer-pilot*
*Completed: 2026-04-27*
