---
phase: 09-hardening-cross-runtime-smoke-non-developer-pilot
plan: 04
subsystem: testing/regression
tags: [HRD-05, drift-fix, surgical, wave-1]
requires:
  - tests/command-count-sync.test.cjs (existing test file)
provides:
  - Regex-mismatch failure mode CLOSED in tests/command-count-sync.test.cjs
  - One of HRD-05's 14 (b) ARCH-drift items resolved
affects:
  - tests/command-count-sync.test.cjs (line 48 regex path)
tech-stack:
  added: []
  patterns:
    - Pure string substitution (gsd → brief) preserving regex byte-identity
key-files:
  created: []
  modified:
    - tests/command-count-sync.test.cjs
decisions:
  - "Plan 04 is Wave 1 (independent of Plan 05 HRD-02 deletion); regex path fix is correct regardless of which 12 commands the locked lineup contains"
  - "Plan 04 does NOT touch docs/ARCHITECTURE.md count lines; that's Plan 06's responsibility AFTER Plan 05 stabilizes disk counts"
  - "Plan 04 is necessary but not sufficient for `node --test tests/command-count-sync.test.cjs` to exit 0 — count-mismatch failures remain until Plan 06"
metrics:
  duration: "0m 39s"
  completed: "2026-04-27"
  tasks: 1
  files_modified: 1
  commits: 1
---

# Phase 09 Plan 04: Command-Count-Sync Regex Drift Fix Summary

One-liner: Surgical 1-line regex path fix in `tests/command-count-sync.test.cjs` (line 48) correcting `commands\/gsd\/` → `commands\/brief\/` — closes the regex-mismatch failure mode for HRD-05's 14 (b) ARCH-drift items.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update tests/command-count-sync.test.cjs line 48 regex from `commands/gsd/` to `commands/brief/` | `fba16b7` | tests/command-count-sync.test.cjs |

## What Changed

Single-character substitution at `tests/command-count-sync.test.cjs` line 48 (location confirmed; line number matched PATTERNS.md prediction exactly — no shift):

```diff
- const m = content.match(/commands\/gsd\/\*\.md[^\n]*#\s*(\d+)\s+slash commands/);
+ const m = content.match(/commands\/brief\/\*\.md[^\n]*#\s*(\d+)\s+slash commands/);
```

All other characters (escapes, character class `[^\n]*`, capture group `(\d+)`, literal `slash commands`) preserved byte-identical.

## Verification Results

All acceptance criteria met:

- `grep -c 'commands\/brief\/' tests/command-count-sync.test.cjs` → **7** (≥1 required) ✓
- `grep -c 'commands\/gsd\/' tests/command-count-sync.test.cjs` → **0** (zero remaining drift) ✓
- `node -e "Object.keys(require('./package.json').dependencies||{}).length"` → **0** (A1 zero-runtime-deps preserved) ✓
- String.raw verification: `{ brief: true, gsd: false }` ✓
- `node --test tests/command-count-sync.test.cjs` regex now compiles and matches (extracts `61` from ARCHITECTURE.md tree comment); only count-mismatch failures remain (61 vs 68 disk count vs 77 prose count) — these are Plan 06's responsibility per must_haves.truth #2.

## Necessary-but-Not-Sufficient Status (per W8 must_haves.truth #2)

Plan 04 closes the **regex-mismatch** failure mode but NOT the count-mismatch failure mode. Full GREEN state for `node --test tests/command-count-sync.test.cjs` requires:

1. **Plan 04 (this plan):** regex path fix `commands/gsd/` → `commands/brief/` ✓ DONE
2. **Plan 05 (HRD-02):** delete 56 commands so `commands/brief/` count = 12
3. **Plan 06:** sync `docs/ARCHITECTURE.md` Total commands/workflows/agents counts to disk reality

After Plan 04 alone, the test still reports failure for 2 assertions (directory-tree count mismatch, prose-vs-tree disagreement) — this is expected and documented in the plan's truth #2.

## Deviations from Plan

None — plan executed exactly as written.

- No auto-fixes triggered (no bugs/missing critical functionality/blocking issues encountered).
- No checkpoints (autonomous plan).
- No authentication gates.
- Line 48 location confirmed; no fallback `grep -n` lookup needed.

## Threat Surface Scan

No new security-relevant surface introduced. Per the plan's `<threat_model>` T-9-13 (Tampering — wrong replacement scope), the substitution preserves byte-identity except for the literal `gsd` → `brief` token. Verified via both `grep` (single-quoted shell) and `String.raw`-based node check.

No threat flags.

## Self-Check: PASSED

- File modified: `tests/command-count-sync.test.cjs` — FOUND
- Commit `fba16b7` exists in git log — FOUND
- SUMMARY.md created at `.planning/phases/09-hardening-cross-runtime-smoke-non-developer-pilot/09-04-SUMMARY.md` — created in this step
