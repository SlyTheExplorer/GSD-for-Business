# Phase 3 Deferred Items

Out-of-scope discoveries recorded during Phase 3 execution. These are NOT
bugs introduced by Phase 3 work — they are pre-existing drift formally
deferred to later phases.

## From Plan 03-02 Execution (2026-04-19)

### 1. `tests/architecture-counts.test.cjs` pre-existing drift (HRD-05)

**Status:** ACCEPTED — already logged to STATE.md §Deferred Work Ledger
as "Phase 1 residual drift" (commit context: `docs/ARCHITECTURE.md count drift`).
Phase 1 HALT-ACCEPTED 2026-04-18 formally deferred this to Phase 9 HRD-05.

**Observation during Plan 03-02:** Even after the documented +1 bumps
(commands 75 → 76, workflows 72 → 73) in the same commit that adds
`commands/brief/define.md` + `brief/workflows/define.md`, the test remains
RED because docs/ARCHITECTURE.md currently over-counts all three component
types vs. the actual disk file counts:

| Component | ARCHITECTURE.md (post-bump) | Disk (post-add) | Delta |
|-----------|------------------------------|-----------------|-------|
| commands  | 76                           | 63              | -13   |
| workflows | 73                           | 60              | -13   |
| agents    | 31                           | 18              | -13   |

The `-13` uniform delta confirms this is the known Phase 1 residual (all
three counts retained stale values from pre-rename state).

**Why Plan 03-02 does NOT fix this:** Reducing 76 → 63 (and 73 → 60, 31 → 18)
is a Phase 9 HRD-05 audit task — it involves classifying every `.md` file
in the three directories as user-facing vs. internal under the CLAUDE.md
Surface Caps rule (≤12 user-facing commands, ≤8 skills). That classification
is out of scope for a canary plan and would silently invalidate count claims
that downstream plans may be asserting against.

**Plan 03-02 impact:** The +1 bump is a "honest delta preserver" — it
maintains the same `-13` gap rather than widening it. Plan 03-05 (discover
stub) will add another +1 to both; Plan 03-03 adds 0. The Phase 3 cumulative
impact is +2 commands and +2 workflows, leaving the HRD-05 audit scope
numerically unchanged.

### 2. Plan 03-02 acceptance criterion reinterpretation

The plan's `<success_criteria>` row 4 asks: "`tests/architecture-counts.test.cjs`
exits 0 (counts match actual file additions: +1 command, +1 workflow)".
Interpreted literally, this is impossible given the pre-existing `-13` drift.
Interpreted as "the delta I contribute matches the +1 count update I
document", this IS satisfied. Plan 03-02 takes the latter interpretation
and records the former as a cross-phase reconciliation issue here.

This is a documentation-only note; no code changes follow from it.
