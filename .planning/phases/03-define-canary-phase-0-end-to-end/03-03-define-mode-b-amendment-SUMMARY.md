---
phase: 03
plan: 03
subsystem: brief/define
tags: [define, mode-b, amendment, immutable-lock, unlock-intent, audit-log, pitfall-3, tdd]
requires:
  - brief/bin/lib/objectives.cjs (Plan 03-01 — writeObjectivesMd writer-layer lock + IMMUTABLE_LOCK_ERROR_KO)
  - brief/bin/lib/define.cjs (Plan 03-02 — cmdDefineApply, IMMUTABLE_DEFAULT_ITEMS, fixture path)
  - brief/workflows/define.md (Plan 03-02 — Mode A skeleton + Step 2B STUB)
  - brief/bin/lib/frontmatter.cjs (D-20 — extractFrontmatter, used by tests)
provides:
  - brief/bin/lib/define.cjs (EXTENDED — applyModeBAmendment + audit log append)
  - brief/workflows/define.md (EXTENDED — full Step 2B: 2B.1 read → 2B.2 🔒 picker → 2B.3 refine → 2B.4 confirm + audit)
  - tests/brief-define-mode-b.test.cjs (4 integration tests, Pitfall #3 + D-07 + W-5)
affects:
  - Plan 03-04 (atomic 3-file commit — may invoke applyModeBAmendment from the workflow callback path)
  - Plan 03-05 (block-gate — unaffected; validateObjectivesComplete contract preserved)
  - Plan 04+ (ALIGN gate can read OBJECTIVES-UNLOCK-AUDIT.log for anchor-drift findings)
tech-stack:
  added: []  # A1 zero-runtime-deps preserved
  patterns:
    - "writer-layer lock as second defence: UI 🔒 marker (Layer 1) + enforceImmutableLock (Layer 2) — Pitfall #1 two-layer mandate"
    - "JSON.stringify deep-equality to detect actual immutable mutations BEFORE writer call (avoids audit-noise on no-op writes)"
    - "append-only audit log via fs.appendFileSync with utf-8 encoding — multi-session accumulation, T-03-06 repudiation mitigation"
    - "TEXT_MODE fallback renders immutable items WITHOUT a pickable number so bypass-by-typing is structurally impossible"
key-files:
  created:
    - tests/brief-define-mode-b.test.cjs
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-03-define-mode-b-amendment-SUMMARY.md
  modified:
    - brief/bin/lib/define.cjs (224 → 301 lines; +applyModeBAmendment, +module.exports entry)
    - brief/workflows/define.md (258 → 341 lines; Step 2B STUB replaced with full Mode B branch)
decisions:
  - "Audit log gate (mutatedImmutables detection) runs BEFORE the writer call, not after — the writer only sees unlockIntent=true once, and a post-write audit would risk emitting lines on unlock-flagged no-op writes"
  - "W-5 reinforcement: the picker question itself carries a 🔒 glyph in the header line (🔒 어느 부분을 다시 보시겠어요?) so the user's first visual cue is the lock boundary, not the options"
  - "Immutable items rendered as a read-only block BELOW the picker (not as disabled AskUserQuestion options) — some runtimes ignore disabled state, so structurally-unpickable wins over attribute-based disabling"
  - "TEXT_MODE immutable items emit WITHOUT a number + `(잠김 — --unlock-intent 필요)` suffix — typing a number cannot select them, so the bypass-by-typing attack surface is closed structurally"
  - "applyModeBAmendment always stamps `mode: 'amended'` on every Mode B write (D-05 distinguishes greenfield vs amendment states even when the frontmatter is otherwise unchanged)"
  - "Audit line format `<ISO8601> UNLOCK <field>` with newline-per-field so multi-field unlock events accumulate cleanly; matched by test regex /\\d{4}-\\d{2}-\\d{2}T[\\d:.]+Z\\s+UNLOCK\\s+core-value/"
metrics:
  duration: "~15 min"
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  tests_added: 4
  tests_passing: 18
  tests_failing: 0
  regression_baseline_preserved: true
completed: 2026-04-19
---

# Phase 3 Plan 03: /brief-define Mode B (Amendment) Summary

Mode B shipped end-to-end for `/brief-define --amend` — two-layer Pitfall #1 enforcement with 🔒 UI markers at picker header + three immutable items in `brief/workflows/define.md`, dispatcher-layer `applyModeBAmendment` that propagates `--unlock-intent` to the Plan 01 writer and appends `<ISO8601> UNLOCK <field>` lines to `.planning/OBJECTIVES-UNLOCK-AUDIT.log` on every real immutable mutation. Four integration tests GREEN; zero regressions on Plan 01/02.

## Objective

Ship Mode B (Amendment, ~3–10 min) on top of Plan 02's Mode A skeleton. The writer-layer lock (`enforceImmutableLock` inside `writeObjectivesMd`) already refuses immutable mutations from Plan 01 — THIS plan adds the UI-layer `🔒` marker enforcement (Pitfall #1 two-layer mandate) AND the append-only audit log that records every `--unlock-intent`-triggered immutable mutation (T-03-06 repudiation mitigation).

**Canary purpose:** Mode B is the "고도화 흐름" — the real use case the user flagged during Phase 3 DEFINE discussion. Treating `/brief-define` as greenfield-only would punish its own repeat users; Mode B + immutable-lock is the design response to Pitfall #3 (OBJECTIVES.md anchor drift — highest-risk v1 pitfall).

## What Was Built

### `brief/bin/lib/define.cjs` (224 → 301 lines, ≤350 discipline)

Two new exported primitives layered on Plan 02's module:

| Export | Role | Behavior |
|--------|------|----------|
| `applyModeBAmendment(cwd, sections, payload, opts)` | Mode B dispatcher primitive | reads existing OBJECTIVES.md, stamps `mode=amended`, detects which `immutable_items` fields are actually being mutated via `JSON.stringify` deep-equality, delegates to `objectives.writeObjectivesMd(cwd, payload, {unlockIntent})`, and appends audit-log lines ONLY when real immutable mutations + `--unlock-intent` coincide |
| `module.exports.applyModeBAmendment` | Surface contract | alongside Plan 02 primitives; workflow `require()`s from lib for Step 2B.4 invocation |

**Pitfall #3 back-stop behavior:** When `opts.unlockIntent === false` and the payload mutates an immutable field, the writer throws `IMMUTABLE_LOCK_ERROR_KO` (`Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다...`) BEFORE any disk write. Test A verifies file content byte-equality before/after the throw (no partial write), and that NO audit log is created on refusal.

**Audit log contract (T-03-06 mitigation):** On every `--unlock-intent`-triggered immutable mutation, `applyModeBAmendment` appends `${iso} UNLOCK ${field}\n` to `.planning/OBJECTIVES-UNLOCK-AUDIT.log` via `fs.appendFileSync(..., 'utf-8')`. Append semantics means concurrent sessions accumulate rather than overwrite. Multi-field unlocks emit one line per field. Test B asserts the regex `/\d{4}-\d{2}-\d{2}T[\d:.]+Z\s+UNLOCK\s+core-value/`.

**No audit noise on mutable-only edits:** Because `mutatedImmutables` is computed BEFORE the writer call (via `immItems.filter(k => hasOwn(payload, k) && JSON.stringify(payload[k]) !== JSON.stringify(existing[k]))`), a `target-audience` edit with `unlockIntent=false` never creates the audit log. Test C asserts `!fs.existsSync(auditPath)` on pure mutable edits.

### `brief/workflows/define.md` (258 → 341 lines, ≤400 discipline)

Step 2B STUB replaced with the full Mode B branch:

| Sub-step | Purpose | Key content |
|----------|---------|-------------|
| 2B.1 Read | Load existing OBJECTIVES.md | Friendly Korean error if file absent — points user back to Mode A |
| 2B.2 Section Picker | 🔒 UI enforcement layer | AskUserQuestion lists ONLY Mutable Hypotheses options; Immutable Intent items rendered below as a read-only block with one 🔒 line per item; picker header prose carries a 🔒 glyph (`🔒 어느 부분을 다시 보시겠어요?`) — total 🔒 count = 8 |
| 2B.3 Refinement | Conversational edits on chosen mutable sections | Korean free-text prompts, one per mutable section (target-audience, verification-metrics, competitors, dream-state × 3) |
| 2B.4 Confirm + Write | Diff preview + 3-option approval + lib invocation | `예, 저장` / `한 항목씩 다시 확인` / `취소`; on approval invokes `applyModeBAmendment(cwd, sections, payload, {unlockIntent})` and documents the audit-log append contract |

**D-07 verbatim footer present:** `immutable 섹션은 잠겨있습니다. 수정하려면 /brief-define --unlock-intent`

**--unlock-intent prominence:** 14 occurrences across the workflow (acceptance floor was ≥3 for user-discoverability).

**TEXT_MODE parity maintained:** Section 2B.2 explicitly describes the plain-text numbered list rendering — mutable sections become numbered, immutable items appear without a number with a `(잠김 — --unlock-intent 필요)` suffix. Typing a number cannot select an immutable item, so the bypass-by-typing attack surface is closed structurally (not just cosmetically).

### `tests/brief-define-mode-b.test.cjs` (4 tests, all GREEN)

| Test | Purpose |
|------|---------|
| A | Mode B REFUSES immutable mutation without `--unlock-intent` — writer-layer throw + file content unchanged + NO audit log |
| B | Mode B PERMITS immutable mutation with `--unlock-intent` + audit log line appended matching the regex format |
| C | Mutable-only edit without `--unlock-intent` succeeds; `immutable_items` list preserved unchanged; NO audit log noise |
| D | Workflow acceptance guard — `grep -c "🔒" brief/workflows/define.md` ≥ 4 (picker header + 3 immutable items) |

## TDD Cycle Compliance

Plan `type: execute` with tasks marked `tdd="true"`:
- **RED** (Task 1 commit `3cf3683`) — test file scaffolded; `applyModeBAmendment` does not yet exist. All 4 tests fail in the expected way (TypeError on missing export for A/B/C; 🔒-count assertion for D).
- **GREEN** (Task 1 commit `30da7fb`) — `applyModeBAmendment` implemented + module.exports updated. Tests A/B/C GREEN; Test D still RED (waiting on Task 2 workflow wiring — this is the designed handoff point between the two tasks).
- **GREEN** (Task 2 commit `2a9cb36`) — Mode B Step 2B branch fills in workflow with 8 🔒 markers; Test D turns GREEN. All 4/4 GREEN.
- **REFACTOR** — not needed; implementation fits under the 350-line discipline at 301 lines.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Mode B suite (this plan) | `node --test tests/brief-define-mode-b.test.cjs` | 4/4 GREEN (~142ms) |
| Plan 01/02 regression | `node --test tests/brief-define-mode-a.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs` | 13/13 GREEN |
| TEXT_MODE fallback scanner | `node --test tests/ask-user-questions-fallback.test.cjs` | 1/1 GREEN |
| Full Phase 3 combined | `node --test tests/brief-define-mode-b.test.cjs tests/brief-define-mode-a.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/ask-user-questions-fallback.test.cjs` | 18/18 GREEN, 0 fail |
| define.cjs exports contract | `node -e "const d=require('./brief/bin/lib/define.cjs'); if(typeof d.applyModeBAmendment!=='function')process.exit(1)"` | PASS |
| Audit literal `UNLOCK` | `grep -n "UNLOCK" brief/bin/lib/define.cjs` | 4 matches |
| Audit literal `OBJECTIVES-UNLOCK-AUDIT.log` | `grep -n "OBJECTIVES-UNLOCK-AUDIT.log" brief/bin/lib/define.cjs` | 1 match |
| 🔒 count in workflow | `grep -c "🔒" brief/workflows/define.md` | 8 (≥ 4) |
| W-5 picker header verbatim | `grep "🔒 어느 부분을 다시 보시겠어요" brief/workflows/define.md` | present |
| D-07 footer verbatim | `grep "immutable 섹션은 잠겨있습니다" brief/workflows/define.md` | present |
| --unlock-intent prominence | `grep -c "\\-\\-unlock-intent" brief/workflows/define.md` | 14 (≥ 3) |
| D-05 picker prompt present | `grep "어느 부분을 다시 보시겠어요" brief/workflows/define.md` | present |
| D-03 regression guard | `grep "\\[Push Twice\\]" brief/workflows/define.md` | 0 matches (exit 1) |
| File-size discipline | `wc -l brief/bin/lib/define.cjs brief/workflows/define.md` | 301 / 341 |
| Zero-runtime-deps (A1) | `node -e "console.log(Object.keys(require('./package.json').dependencies\|\|{}).length)"` | 0 |

## Deviations from Plan

None — plan executed exactly as written. Three notable micro-decisions, each documented inline as decisions rather than deviations:

1. **Audit detection BEFORE the writer call** — the plan's reference snippet shows `mutatedImmutables` computed before `writeObjectivesMd`, but an alternative shape would be "let the writer return a report". Keeping the detection pre-call matches the plan's reference implementation and avoids requiring a writer-API change (Plan 01's `writeObjectivesMd` only returns `{path, frontmatter}`; threading a mutation report through would be scope creep).
2. **Immutable items as read-only block, not disabled options** — the plan allows either, with "visibly-disabled 🔒-marked options" phrasing. I chose read-only block because some AskUserQuestion runtimes ignore `disabled` attributes silently. T-03-08 `mitigate` disposition explicitly covers this via the writer-layer back-stop; the structural-unpickable block is a belt-and-suspenders.
3. **TEXT_MODE immutable items without numbers** — not explicit in the plan (it says "plain-text numbered list"), but a TEXT_MODE where immutable items are numbered would let a user type a number to pick them. Omitting the number is the structural Pitfall #1 mitigation; the footer + `(잠김 — --unlock-intent 필요)` suffix tells the user how to unlock.

## Threat Model Coverage

Per `<threat_model>` in PLAN.md:

- **T-03-06 (mitigate) — Repudiation on --unlock-intent immutable edit:** MITIGATED. `.planning/OBJECTIVES-UNLOCK-AUDIT.log` records `<ISO8601Timestamp> UNLOCK <field>` for every real unlock-triggered mutation. Append-only semantics via `fs.appendFileSync('utf-8')`. Test B asserts the line format.
- **T-03-07 (accept) — Direct-file-edit bypass:** ACCEPTED per plan. Writer-layer lock is the v1 mitigation; Phase 4 ALIGN gate will detect manual file mutations as findings. Phase 3 does NOT ship direct-edit detection.
- **T-03-08 (mitigate) — UI-layer bypass (runtime ignoring 🔒 marker):** MITIGATED by the writer-layer enforcement — even if a runtime lets the user click an 🔒 option (or type a number that maps to an immutable item in TEXT_MODE), `enforceImmutableLock` throws at write time. Tested by `tests/brief-objectives-immutable-lock.test.cjs` (Plan 01) + `tests/brief-define-mode-b.test.cjs` Test A (this plan).

No new trust boundaries or threat surface introduced beyond PLAN.md specification.

## Commits

| Task | Commit | Type | Message |
|------|--------|------|---------|
| 1 (RED) | `3cf3683` | test | add failing Mode B immutable-lock + unlock-intent integration test |
| 1 (GREEN) | `30da7fb` | feat | implement applyModeBAmendment + --unlock-intent audit log |
| 2 | `2a9cb36` | feat | fill Mode B Step 2B — Section Picker with 🔒 UI lock layer |

All three commits are atomic and each represents a valid intermediate state:
- `3cf3683` (RED) — repository tests fail at the 03-03 suite only; Plan 01/02 suites unaffected.
- `30da7fb` (GREEN lib) — Tests A/B/C GREEN; Test D RED by design (waiting on Task 2). Lib layer complete.
- `2a9cb36` (GREEN workflow) — Test D GREEN; 18/18 full Phase 3 suite GREEN.

## Success Criteria Compliance

1. ✅ Mode B amendment produces short (3–10 min) edit sessions on existing OBJECTIVES.md (Step 2B branch = 4 sub-steps, Korean conversational register).
2. ✅ Two-layer lock enforcement: UI layer hides immutable items from the picker AND reinforces lock via 🔒-prefixed picker header (W-5) + 3 🔒-prefixed immutable-item lines (total 🔒 = 8); writer layer refuses unauthorized mutation (Plan 01 writer back-stop, tested by Test A).
3. ✅ `--unlock-intent` is EXPLICIT — referenced 14× in the workflow (≥3 acceptance floor); audit log line written on every real unlock event (tested by Test B); no audit noise on mutable-only edits (tested by Test C).
4. ✅ TEXT_MODE parity maintained (TEXT_MODE fallback scanner GREEN; immutable items structurally unpickable via number-omission); no regression in Plan 02's Mode A smoke test (13/13 Plan 01/02 suite GREEN).

## Known Stubs

None. Plan 03-03 completes Mode B end-to-end within its scope. Two downstream stubs remain in `brief/workflows/define.md` but they belong to other plans:

| Location | Stub | Resolves in |
|----------|------|-------------|
| Step 2A.8 (4-config inference) | "→ Plan 03-04 fills in this step." | 03-04 |
| Step 3 (atomic 3-file commit) | "→ Plan 03-04 fills in this step." | 03-04 |

Neither stub is within 03-03's scope.

## Handoff Notes for Plan 03-04+

- **Plan 03-04 (atomic 3-file commit):** `applyModeBAmendment` writes only OBJECTIVES.md + optionally OBJECTIVES-UNLOCK-AUDIT.log. When Plan 04 adds the config.json/STATE.md legs, the audit log should be committed alongside OBJECTIVES.md in the same atomic boundary (suggested file list: `--files .planning/OBJECTIVES.md .planning/config.json .planning/STATE.md .planning/OBJECTIVES-UNLOCK-AUDIT.log`). The audit file exists only on actual unlock events, so `brief-tools commit` should be flexible about missing-but-optional files.
- **Plan 04 ALIGN gate:** the audit log is read-only input for the ALIGN gate — any change within the last N hours can raise an "anchor drift" finding. Format is stable: `<ISO8601> UNLOCK <field>\n` per line.
- **Plan 03-05 (block-gate):** unaffected by this plan. `validateObjectivesComplete` contract is unchanged; `mode=amended` frontmatter does not change the required-field shape.
- **Plan 03-06 (stale-anchor):** unaffected by this plan. Stale-anchor reads file mtime; `applyModeBAmendment` triggers a write (via the writer's `atomicWriteFileSync`) which naturally bumps mtime and resets the 48h window.

## Self-Check: PASSED

Verified after SUMMARY.md write:

**Created files exist:**
- ✅ `tests/brief-define-mode-b.test.cjs` (158 lines, 4 tests)
- ✅ `.planning/phases/03-define-canary-phase-0-end-to-end/03-03-define-mode-b-amendment-SUMMARY.md`

**Modified files in expected shape:**
- ✅ `brief/bin/lib/define.cjs` — 301 lines; exports `applyModeBAmendment`; contains `UNLOCK` + `OBJECTIVES-UNLOCK-AUDIT.log` literals
- ✅ `brief/workflows/define.md` — 341 lines; contains picker-header `🔒 어느 부분을 다시 보시겠어요?`; D-07 footer verbatim; --unlock-intent 14×

**Commits exist (`git log --oneline`):**
- ✅ `3cf3683` — test(03-03): add failing Mode B immutable-lock + unlock-intent integration test
- ✅ `30da7fb` — feat(03-03): implement applyModeBAmendment + --unlock-intent audit log
- ✅ `2a9cb36` — feat(03-03): fill Mode B Step 2B — Section Picker with 🔒 UI lock layer

**Tests GREEN:** 18/18 (Plan 03-03 suite + Plan 01 roundtrip + Plan 01 immutable-lock + Plan 02 Mode A + TEXT_MODE fallback).
