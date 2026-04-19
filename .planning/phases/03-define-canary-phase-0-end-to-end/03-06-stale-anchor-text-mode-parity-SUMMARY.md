---
phase: 03
plan: 06
subsystem: brief/define + brief/workflows
tags: [stale-anchor, text-mode-parity, pitfall-6, def-06, fnd-06, korea-first]
requires:
  - brief/bin/lib/objectives.cjs (Plan 01 — checkStaleAnchor + cmdStaleCheck + STALE_ANCHOR_THRESHOLD_MS)
  - brief/bin/lib/define.cjs (Plans 02/03/04 — applyFromFixture + module.exports surface)
  - brief/bin/brief-tools.cjs (Plan 05 — case 'discover' block-gate wiring)
  - brief/workflows/define.md (Plans 02/03 — Mode A/B workflow skeleton)
  - brief/workflows/discover.md (Plan 05 — Step 2 STUB pending Plan 06 fill-in)
provides:
  - brief/bin/lib/define.cjs shouldStaleAnchorFire + renderStaleAnchorPrompt + QUALIFYING_ENTRY_POINTS
  - brief/bin/brief-tools.cjs case 'discover' stale-anchor invocation (W-8 ordering)
  - brief/workflows/discover.md Step 2 (full stale-anchor flow — 3 D-13 Korean options)
  - brief/workflows/define.md Step 0.5 (stale-anchor hook on --amend entry)
  - tests/brief-define-stale-anchor.test.cjs (4 cases — POS + 2 NEG + direct-call unit)
  - tests/brief-define-text-mode-parity.test.cjs (FND-06 byte-equivalence assertion)
affects:
  - Phase 4+ (phase-entry stale-anchor wiring — scaffolded here, live there)
  - Phase 5 (DISCOVER real body replaces placeholder; block-gate + stale-anchor stay)
  - v2 (/brief-new-milestone milestone-entry stale-anchor wiring — scaffolded here, live later)
tech-stack:
  added: []  # A1 zero-runtime-deps preserved — no new packages
  patterns:
    - "closed-set entry-point gating (QUALIFYING_ENTRY_POINTS) — Pitfall 6 mitigation"
    - "ordered stdout emission — stale-anchor prompt rendered BEFORE Phase 5 placeholder (W-8)"
    - "fs.utimesSync mtime backdating for deterministic stale-anchor tests"
    - "ISO-timestamp normalization regex for byte-equivalence parity assertions"
key-files:
  created:
    - tests/brief-define-stale-anchor.test.cjs
    - tests/brief-define-text-mode-parity.test.cjs
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-06-stale-anchor-text-mode-parity-SUMMARY.md
  modified:
    - brief/bin/lib/define.cjs (450 → 524 lines — Item 5 deferred)
    - brief/bin/brief-tools.cjs (case 'discover' extended with shouldStaleAnchorFire invocation)
    - brief/workflows/discover.md (Step 2 STUB → full flow)
    - brief/workflows/define.md (Step 0.5 stale-anchor hook added)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-VALIDATION.md (status→ready, wave_0_complete→true, 16 rows → ✅ green)
    - .planning/phases/03-define-canary-phase-0-end-to-end/deferred-items.md (Items 4/5/6 appended)
decisions:
  - "D-13 QUALIFYING_ENTRY_POINTS as a closed Set — Pitfall 6 mitigation requires an explicit vocabulary. Open-ended entryPoint strings would let any caller inadvertently qualify itself."
  - "W-1 phase-entry + milestone-entry scaffolded in the Set but NOT wired to dispatcher — the Set is the single source of truth for D-13's entry-point vocabulary; Phase 4+/v2 will add dispatcher call sites without re-editing define.cjs"
  - "W-8 prompt/placeholder ordering enforced via stdout.write BEFORE the core.output() call — assert.ok(idxPrompt < idxPlaceholder) in the positive test guards against future refactors that might reorder emission"
  - "text_mode parity proven via byte-equivalence after ISO-timestamp normalization — asserts the fixture path is insensitive to workflow.text_mode for file output (FND-06 flowdown)"
  - "Korean prompt text is a single module-owned string in renderStaleAnchorPrompt — the workflow markdown mirrors it but the authoritative source is the function; keeps runtime rendering consistent across Claude/Codex/Gemini/OpenCode"
metrics:
  duration: "~25 min"
  tasks_completed: 2
  files_created: 3
  files_modified: 6
  tests_added: 5  # 4 stale-anchor + 1 text_mode-parity
  tests_passing: 50  # full Phase 3 suite excluding architecture-counts (Phase 1 residual)
  tests_failing: 0
  regression_baseline_preserved: true
completed: 2026-04-19
---

# Phase 3 Plan 06: Stale-Anchor + Text-Mode Parity Summary

**One-liner:** Wired the D-13 stale-anchor 48h interrupt into the two qualifying
new-activity entry points (`/brief-discover` via brief-tools.cjs dispatcher +
`/brief-define --amend` via workflow Step 0.5), added the 3-option Korean
interrupt prompt with W-8 ordering and Pitfall 6 scope guards, and proved
FND-06 text_mode parity via a byte-equivalence assertion on the canonical
Korea-first B2C fixture.

## What Shipped

### `brief/bin/lib/define.cjs` — 2 new primitives + 1 closed-set constant

```javascript
const QUALIFYING_ENTRY_POINTS = new Set([
  'discover-entry',       // /brief-discover first invocation — LIVE Phase 3 Plan 06
  'define-amend-entry',   // /brief-define --amend entry — LIVE Phase 3 Plan 06
  'phase-entry',          // Phase 4+ new-phase-start — scaffolded only
  'milestone-entry',      // v2 /brief-new-milestone — scaffolded only
]);

function shouldStaleAnchorFire(cwd, entryPoint) { /* entry gate + mtime check */ }
function renderStaleAnchorPrompt(ageHours) { /* deterministic 3-option Korean text */ }
```

Exports also surface `QUALIFYING_ENTRY_POINTS` so future phases can introspect
the set without duplicating the vocabulary.

### `brief/bin/brief-tools.cjs` `case 'discover':` — W-8 ordering

```javascript
const define = require('./lib/define.cjs');
const stale = define.shouldStaleAnchorFire(cwd, 'discover-entry');
if (stale.fire) {
  process.stdout.write(define.renderStaleAnchorPrompt(stale.age_hours));
}
// Phase 5 placeholder follows — idxPrompt < idxPlaceholder always holds.
```

### `brief/workflows/discover.md` Step 2 — STUB replaced

Full flow with 3 D-13 options (`잠시 검토에` / `현재 OBJECTIVES를 보고 맞으면 승인`
/ `이제 승인, 빠르게 진행`), TEXT_MODE fallback, and per-option action (dispatch
to `/brief-define --amend` / read-before-approve / fast approve).

### `brief/workflows/define.md` Step 0.5 — new

Stale-anchor hook fires ONLY on `--amend` entry (Mode A is INITIAL anchor
creation — stale-anchor does not apply). Same 3 D-13 options, routed to
continue the current `--amend` flow instead of re-dispatching.

### Tests — 5 new cases across 2 files

- **`tests/brief-define-stale-anchor.test.cjs` (4 cases):**
  - POSITIVE — 49h-stale + `/brief-discover` → prompt + **W-8 ordering
    (idxPrompt=0 < idxPlaceholder>0)**
  - NEGATIVE 1 — 49h-stale + `/brief-status` → NO `잠시 검토에` (Pitfall 6)
  - NEGATIVE 2 — fresh + `/brief-discover` → NO prompt, placeholder still emitted
  - UNIT — direct-call `shouldStaleAnchorFire` for 6 entry points:
    `discover-entry` + `define-amend-entry` fire; `status-entry` +
    `help-entry` + `mid-workflow` return `{fire:false, reason:'entry-not-qualifying'}`

- **`tests/brief-define-text-mode-parity.test.cjs` (1 case):**
  - Mode A `define apply --fixture korea-b2c-persona.json` produces
    byte-equivalent OBJECTIVES.md (after ISO-timestamp normalization) with
    `workflow.text_mode: false` vs `true` in config.json.

### VALIDATION.md — finalized

- Frontmatter: `status: ready`, `wave_0_complete: true`, `nyquist_compliant: true`
- 16 Per-Task Verification Map rows: all `⬜ pending` → `✅ green`
- 14 Wave 0 Requirements checkboxes: all `[ ]` → `[x]`

## Phase 3 Regression — 50/50 GREEN

Full command:
```
node --test tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs \
  tests/brief-define-atomic-commit.test.cjs tests/brief-define-canary.test.cjs \
  tests/brief-define-korea-signal.test.cjs tests/brief-define-stale-anchor.test.cjs \
  tests/brief-define-text-mode-parity.test.cjs tests/brief-config-brief-namespace.test.cjs \
  tests/brief-discover-gate.test.cjs tests/brief-objectives-roundtrip.test.cjs \
  tests/brief-objectives-immutable-lock.test.cjs tests/ask-user-questions-fallback.test.cjs
```

Result: **50 pass / 0 fail** across 15 suites, ~3.4s.

`tests/architecture-counts.test.cjs` remains RED as a Phase 1 residual (Plan 02
Item 1 in deferred-items.md; unchanged by Plan 06 per Item 6).

## Commits

| Task | Hash | Type | Subject |
|------|------|------|---------|
| 1 | `797f243` | feat | shouldStaleAnchorFire + renderStaleAnchorPrompt + /brief-discover wiring (DEF-06, D-13) |
| 2 | `2f146c2` | feat | stale-anchor workflow hooks + VALIDATION finalized + W-1 deferred note |

Both commits are atomic and each represents a valid intermediate state:
- `797f243` — define.cjs + brief-tools.cjs + 2 new test files; 50/50 Phase 3 GREEN (architecture-counts pre-existing RED unchanged).
- `2f146c2` — workflow.md hooks land + VALIDATION.md finalized + deferred-items updated; no test deltas.

## Deviations from Plan

### Auto-fixed Issues

None. The plan executed exactly as written for Task 1 (tests + define.cjs +
brief-tools.cjs) and Task 2 (workflow.md hooks + VALIDATION.md finalization).

### Pre-existing Issues Out of Scope

**1. `brief/bin/lib/define.cjs` line budget overshoot (524 vs plan ≤400)**
- **Discovered during:** Task 1 implementation — verifying `wc -l` after adds.
- **Root cause:** Plan 04 already overshot to 450 (Item 3 in deferred-items.md).
  Plan 06's 2 functions + 1 Set + JSDoc add 74 lines.
- **Resolution:** Item 5 appended to deferred-items.md. Same reasoning as Item
  3: splitting define.cjs during a wave-6 execute plan would thrash the module
  surface Plans 03/04/05/06 all import from. Factor-out deferred to Phase 9
  HRD-05 / polish pass.

**2. `tests/architecture-counts.test.cjs` pre-existing RED**
- **Discovered during:** Task 1 post-change regression sweep.
- **Root cause:** Phase 1 residual (`-13` delta on commands/workflows/agents
  counts in docs/ARCHITECTURE.md vs disk).
- **Resolution:** Verified unchanged by `git stash` before/after comparison.
  Item 6 appended to deferred-items.md (Plan 06 does not add any new
  user-facing command/workflow/agent files; the delta is unchanged).
  Excluded from Plan 06 acceptance set per VALIDATION.md commands.

## Deferred Items

**Deferred to Phase 4+/v2:** `phase-entry` and `milestone-entry` stale-anchor
dispatcher wiring — scaffolded in `QUALIFYING_ENTRY_POINTS` but no live call
site in Phase 3. Recorded in
`.planning/phases/03-define-canary-phase-0-end-to-end/deferred-items.md` Item 4.

**Deferred to Phase 9 HRD-05 / polish pass:** `brief/bin/lib/define.cjs` factor-out
to reduce line count (524 → target ≤400). Item 5.

**Deferred to Phase 9 HRD-05:** `tests/architecture-counts.test.cjs` drift
(Phase 1 residual). Item 6.

## Acceptance Criteria — all met

- [x] `tests/brief-define-stale-anchor.test.cjs` exits 0 (all 4 tests GREEN)
- [x] `idxPrompt < idxPlaceholder` W-8 assertion present in positive test
- [x] `tests/brief-define-text-mode-parity.test.cjs` exits 0 (parity after ISO-timestamp normalization)
- [x] `brief/bin/lib/define.cjs` exports `shouldStaleAnchorFire` + `renderStaleAnchorPrompt` + `QUALIFYING_ENTRY_POINTS`
- [x] `QUALIFYING_ENTRY_POINTS` has all 4 entries, EXCLUDES `status-entry` / `help-entry` / `mid-workflow`
- [x] W-1 `scaffolded` comment on `phase-entry` / `milestone-entry` (grep present)
- [x] `renderStaleAnchorPrompt(49)` contains all 3 D-13 options + `48시간`
- [x] `brief/bin/brief-tools.cjs` `case 'discover':` invokes `shouldStaleAnchorFire` (grep present)
- [x] `brief/workflows/discover.md` has `48시간` + 3 D-13 options; no more `→ Plan 06 fills in` STUB
- [x] `brief/workflows/define.md` has `Step 0.5` + `48시간` + 3 D-13 options
- [x] TEXT_MODE regression preserved in both workflow files
- [x] VALIDATION.md: `status: ready`, `wave_0_complete: true`, `nyquist_compliant: true`
- [x] Full Phase 3 regression (12 suites, 50 tests) GREEN

## Verification Summary

| Check | Command | Result |
|-------|---------|--------|
| Exports contract | `node -e "const d=require('./brief/bin/lib/define.cjs'); ['shouldStaleAnchorFire','renderStaleAnchorPrompt'].every(fn=>typeof d[fn]==='function')"` | PASS |
| Prompt contents | `node -e "const d=require('./brief/bin/lib/define.cjs'); const p=d.renderStaleAnchorPrompt(49); ['48시간','잠시 검토에','현재 OBJECTIVES를 보고','이제 승인, 빠르게 진행'].every(s=>p.includes(s))"` | PASS |
| W-1 scaffolded | `grep -c "scaffolded" brief/bin/lib/define.cjs` | 3 (≥1) |
| Dispatcher wire | `grep "shouldStaleAnchorFire" brief/bin/brief-tools.cjs` | 1 line |
| Workflow STUB removed | `grep "→ Plan 06 fills in" brief/workflows/discover.md` | 0 matches |
| discover.md 3 options | `grep -c "잠시 검토에" brief/workflows/discover.md` | 2 |
| define.md 3 options | `grep -c "잠시 검토에" brief/workflows/define.md` | 2 |
| define.md Step 0.5 | `grep "Step 0.5" brief/workflows/define.md` | present |
| TEXT_MODE regression | `grep -c "TEXT_MODE\|text_mode" brief/workflows/discover.md` | 4 |
| TEXT_MODE regression | `grep -c "TEXT_MODE\|text_mode" brief/workflows/define.md` | 6 |
| Full Phase 3 suite | `node --test tests/brief-*.test.cjs tests/ask-user-questions-fallback.test.cjs` (12 files) | 50/50 GREEN |
| package.json deps | `node -e "console.log(Object.keys(require('./package.json').dependencies\|\|{}).length)"` | 0 (unchanged — A1 preserved) |

## Self-Check: PASSED

- FOUND: tests/brief-define-stale-anchor.test.cjs
- FOUND: tests/brief-define-text-mode-parity.test.cjs
- FOUND: .planning/phases/03-define-canary-phase-0-end-to-end/03-06-stale-anchor-text-mode-parity-SUMMARY.md
- FOUND commit: 797f243 (Task 1)
- FOUND commit: 2f146c2 (Task 2)
