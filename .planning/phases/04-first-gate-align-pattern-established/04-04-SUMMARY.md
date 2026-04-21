---
phase: 04-first-gate-align-pattern-established
plan: 04
subsystem: gates-align-commit-dispatcher
tags: [align, commit, dispatcher, state-roundtrip, path-traversal, prompt-injection, override, canary]

# Dependency graph
requires:
  - phase: 04-first-gate-align-pattern-established (Plan 04-01)
    provides: "align.cjs foundational primitives (validateVerdict, detectKoreaSignalFromConfig, writeVerdict, runDeterministicScreen)"
  - phase: 04-first-gate-align-pattern-established (Plan 04-03)
    provides: "runAlign + mergeVerdicts pipeline + 4 decision-path fixtures"
  - phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
    provides: "D-20/D-21 state.brief namespace + reconstructFrontmatter serializer + readModifyWriteStateMd file-lock"
  - phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
    provides: "status.cjs D-18 compact-dashboard with formatGate placeholder"
provides:
  - "commitAlignVerdict (atomic 3-effect: ALIGN-00.md render + STATE.md brief.last_gate_results.align write + tmp verdict unlink)"
  - "renderAlignReport (moved to align-report.cjs sibling file to keep align.cjs <400 lines)"
  - "_resolveSafePath with macOS /private/var symlink canonicalization (T-04-01)"
  - "brief-tools.cjs case 'align': dispatcher with run + commit + unknown-subcommand branches; try/catch on BOTH branches routing through core.error (Test 10 mitigation)"
  - "status.cjs formatGate override-aware suffix '(override applied)' — boolean true OR string 'true' (Pitfall #5)"
  - "frontmatter.cjs stripFrontmatter export (lifted from state.cjs internals)"
  - "state-brief-override-roundtrip.test.cjs — 23 tests covering renderAlignReport, commitAlignVerdict, D-20 round-trip, formatGate, full CLI surface (including Test 10 path-traversal boundary)"
affects: [04-05 (define.md Mode A wiring), 04-06 (vocabulary lock + text-mode parity), 05 (audience gate replication), 07 (compliance gate replication)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "read-modify-write STATE.md via state.cjs readModifyWriteStateMd (file-lock preserving)"
    - "sibling-file split discipline when a single lib approaches 400 lines (align-report.cjs extracted from align.cjs)"
    - "CLI dispatcher try/catch forwarding err.message through core.error to prevent Node stack-trace path leakage"
    - "path-traversal guard with realpath canonicalization on both sides (macOS /private/var symlink robustness)"

key-files:
  created:
    - brief/bin/lib/align-report.cjs
    - tests/state-brief-override-roundtrip.test.cjs
  modified:
    - brief/bin/lib/align.cjs
    - brief/bin/brief-tools.cjs
    - brief/bin/lib/status.cjs
    - brief/bin/lib/frontmatter.cjs

key-decisions:
  - "Moved renderAlignReport to a sibling file (align-report.cjs) when align.cjs crossed 400 lines after all three new functions were inlined — this is the escape hatch the PLAN explicitly authorized"
  - "_canonicalize walks parents (try path.join(realpathSync(cur), relative(cur, p)) then retreat to dirname) so non-existent candidates still normalize their symlinked ancestors — required on macOS where process.cwd() returns /private/var/... but a user-passed path may carry /var/..."
  - "extractFrontmatter returns brief: {} as the STRING '{}' — commitAlignVerdict coerces non-object fm.brief to a real object before writing (defensive guard against YAML inline-empty-object surface)"
  - "Added stripFrontmatter to frontmatter.cjs exports (previously lived only as a state.cjs internal) — no new dependency, just broader reuse"
  - "CLI dispatcher wraps BOTH align.runDeterministicScreen+writeVerdict (run branch) and align.commitAlignVerdict (commit branch) in try/catch; errors forward via core.error(err.message) — required for Test 10 doesNotMatch(/\\/Users\\/.../GSD-for-Business/i) assertion"

patterns-established:
  - "Pattern 4 (Atomic commit): verdict .tmp.json → ALIGN-00.md render → STATE.md brief write → verdict unlink in finally → caller issues git commit via brief-tools commit --files. No commit plumbing added to align.cjs."
  - "Pattern: D-20 serializer boolean round-trip — downstream readers MUST accept both boolean true and string 'true'. Pitfall #5 guard codified in formatGate and round-trip test assertions"
  - "Pattern: extend status.cjs display surfaces WITHOUT changing renderStatus main flow — formatGate is the single mutation point, backward-compatible for callers that don't carry override field"

requirements-completed: [DSG-12]

# Metrics
duration: 70min
completed: 2026-04-21
---

# Phase 4 Plan 4: ALIGN Commit Path + Dispatcher + Override-Aware Status

**commitAlignVerdict atomically writes ALIGN-00.md + STATE.md brief.last_gate_results.align via readModifyWriteStateMd; renderAlignReport moved to align-report.cjs sibling; brief-tools.cjs align run/commit dispatcher with try/catch on both branches; formatGate renders '(override applied)' suffix distinctly from plain ALIGNED**

## Performance

- **Duration:** ~70 min
- **Started:** 2026-04-21T01:00:00Z (approximate — plan start)
- **Completed:** 2026-04-21T01:25:00Z
- **Tasks:** 2 (each split into TDD RED + GREEN commits = 4 logical commits)
- **Files modified:** 6 (4 source, 2 test — one new)

## Accomplishments

- **commitAlignVerdict** — atomic 3-effect path from validated verdict to persisted state: renders ALIGN-00.md, updates `state.brief.last_gate_results.align` via `readModifyWriteStateMd` (file-lock preserving), unlinks tmp verdict in `finally` (T-04-03). Sanitizes `override_reason` via `sanitizeForPrompt` BEFORE state write (T-04-02).
- **renderAlignReport** — ALIGN-00.md content renderer with D-07 override schema (decision→ALIGNED + override:true + override_reason in frontmatter + ## User Override section) and D-11 language rule (Korean bilingual headers when Korea signal, English otherwise). Extracted to sibling file `align-report.cjs` when align.cjs crossed the 400-line budget.
- **_resolveSafePath** — path-traversal guard canonicalizes both sides via realpath-walking so macOS `/private/var` symlinks don't desync cwd from a user-passed verdict path. Throws with a sanitized message (`path traversal refused: <input> resolves outside .planning/`) — no absolute paths in the error text so the CLI try/catch can safely forward `err.message`.
- **brief-tools.cjs `case 'align':`** — dispatcher with `run` (deterministic screen + optional verdict write) and `commit` (commitAlignVerdict wrapper) subcommands. **Both branches wrap align.cjs calls in try/catch that forwards err.message through `core.error`**, preventing Node's default uncaught-exception handler from printing the absolute path to align.cjs (Test 10 mitigation).
- **status.cjs formatGate override suffix** — renders `ALIGNED (0 findings) (override applied)` distinctly from plain `ALIGNED (0 findings)`. Accepts both boolean `true` and string `'true'` (Pitfall #5 — D-20 serializer round-trip drops boolean type).
- **state-brief-override-roundtrip.test.cjs** — 23 tests covering renderAlignReport (6 tests on headers/override section/frontmatter), commitAlignVerdict (6 tests on state write/sanitization/tmp unlink/path traversal/override guard), state D-20 round-trip, formatGate plain/boolean-true/string-'true' paths, full CLI surface (run/commit/override/unknown-subcommand/missing-flags), and **Test 10** path-traversal boundary asserting `doesNotMatch(/\/Users\/[a-z0-9_-]+\/GSD-for-Business/i)` — verifies the absolute cwd path never reaches stdout/stderr.

## Task Commits

Each task followed TDD (RED → GREEN):

1. **Task 1 RED: failing tests for renderAlignReport + commitAlignVerdict** — `a648ca9` (test)
2. **Task 1 GREEN: align.cjs implementation + align-report.cjs sibling split + stripFrontmatter export** — `0acfd7f` (feat)
3. **Task 2 RED: failing tests for dispatcher + formatGate override + CLI Test 10** — `40925c5` (test)
4. **Task 2 GREEN: dispatcher + formatGate + _resolveSafePath canonicalization** — `d613e89` (feat)

## Files Created/Modified

**Created:**
- `brief/bin/lib/align-report.cjs` (63 lines) — D-07 override + D-11 language renderer, extracted from align.cjs to preserve the <400-line discipline.
- `tests/state-brief-override-roundtrip.test.cjs` (480 lines, 23 tests) — combined Task 1 + Task 2 coverage per PLAN spec.

**Modified:**
- `brief/bin/lib/align.cjs` (+80, now 390 lines) — adds `_canonicalize`, `_resolveSafePath`, `commitAlignVerdict`; imports `renderAlignReport` from sibling; fixes latent 04-03 bug where `planningPaths` was referenced but not imported.
- `brief/bin/brief-tools.cjs` (+72 lines) — registers `case 'align':` between `state` and `resolve-model`. Both subcommand branches (`run`, `commit`) wrap align.cjs calls in try/catch that forwards via `core.error(err.message)`.
- `brief/bin/lib/status.cjs` (+7 lines) — `formatGate` now appends `(override applied)` when `gate.override === true || gate.override === 'true'`.
- `brief/bin/lib/frontmatter.cjs` (+12 lines) — exports `stripFrontmatter` (lifted from state.cjs internals; identical behavior, broader reuse surface).

## Decisions Made

1. **Sibling-file escape hatch used.** align.cjs was at 310 lines after 04-03; adding renderAlignReport (~50) + commitAlignVerdict (~55) + _resolveSafePath (~15) + imports inline pushed it to 445 — 45 over the 400-line D-18 budget. The PLAN explicitly authorized moving `renderAlignReport` to `brief/bin/lib/align-report.cjs`; I did so. Final counts: align.cjs = 390 (under budget), align-report.cjs = 63.
2. **`_canonicalize` walks parents on ENOENT.** macOS `process.cwd()` returns `/private/var/folders/...` (symlink-resolved), while a command-line arg may carry `/var/folders/...`. `path.resolve` does NOT follow symlinks. Using `fs.realpathSync` directly fails on non-existent candidates (the test inputs `/etc/passwd` and `../../outside.json` need path-traversal rejection regardless of existence). Solution: walk up the candidate until `realpathSync` succeeds, then re-join the suffix. This is robust across macOS, Linux, and Windows (no-op where symlinks are absent).
3. **`brief: {}` surface coercion.** extractFrontmatter returns `brief: {}` in YAML as the JS STRING `'{}'`, not an empty object. commitAlignVerdict defensively coerces `fm.brief` to a real object before writing. This is a known frontmatter.cjs quirk (Phase 2 D-20 — inline-empty-object literal); the coercion pattern will propagate to Phase 5 audience gate and Phase 7 compliance gate.
4. **stripFrontmatter re-exported from frontmatter.cjs.** It previously lived only in state.cjs as a file-internal helper. The plan's specified imports referenced it from frontmatter.cjs; moving it to the exports block (keeping the state.cjs internal copy byte-identical) keeps frontmatter.cjs as the single authoritative home for frontmatter operations — consistent with its existing ownership of `extractFrontmatter`, `reconstructFrontmatter`, `spliceFrontmatter`.
5. **CLI dispatcher wraps BOTH run and commit branches.** The plan's Test 10 asserts `doesNotMatch(/\/Users\/[a-z0-9_-]+\/GSD-for-Business/i)`. Without a try/catch on the commit branch, a thrown `Error` from `_resolveSafePath` would propagate to Node's default uncaught-exception handler, which prints the full stack trace including the absolute path to align.cjs. Wrapping in try/catch and forwarding through `core.error(err.message)` emits a sanitized one-line error and `process.exit(1)`s — keeping the CLI surface leak-free.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Added `stripFrontmatter` to frontmatter.cjs exports**
- **Found during:** Task 1 (commitAlignVerdict implementation)
- **Issue:** Plan's `<read_first>` and `<interfaces>` sections reference `stripFrontmatter` as if it were exported from `brief/bin/lib/frontmatter.cjs`. It was only defined in state.cjs as a non-exported internal helper. Task 2's test file also imports it from frontmatter.cjs.
- **Fix:** Lifted the existing stripFrontmatter function (10 lines, identical behavior) to frontmatter.cjs with an export entry. state.cjs retains its own internal copy byte-for-byte; no behavior change.
- **Files modified:** `brief/bin/lib/frontmatter.cjs`
- **Verification:** `node -e "require('./brief/bin/lib/frontmatter.cjs').stripFrontmatter"` returns a function; all 199 frontmatter+state tests still green.
- **Committed in:** `0acfd7f` (Task 1 GREEN commit)

**2. [Rule 1 — Bug] Imported `planningPaths` in align.cjs (latent 04-03 bug)**
- **Found during:** Task 1 (commitAlignVerdict references `planningPaths(cwd).planning` for ALIGN-00.md path)
- **Issue:** Plan 04-03 added a call to `planningPaths(cwd).planning` on line 268 but never imported `planningPaths` from core.cjs. The existing tests all pass `verdictOutPath` explicitly so the runAlign default-path branch never ran. Task 1's commitAlignVerdict uses the same helper and would throw `ReferenceError: planningPaths is not defined`.
- **Fix:** Added `planningPaths` to the existing `require('./core.cjs')` destructuring alongside `atomicWriteFileSync` and `planningDir`.
- **Files modified:** `brief/bin/lib/align.cjs`
- **Verification:** All 31 existing align tests remain green (including `state-write-shape` which exercises writeVerdict).
- **Committed in:** `0acfd7f` (Task 1 GREEN commit)

**3. [Rule 1 — Bug] Defensive coercion of `fm.brief` when parsed as string `"{}"`**
- **Found during:** Task 1 test `commitAlignVerdict — writes ALIGN-00.md and updates STATE.md brief map`
- **Issue:** Seed STATE.md contained `brief: {}` (inline YAML empty object). extractFrontmatter returns that as the literal string `'{}'`, not an empty object. `fm.brief = fm.brief || {}` leaves `'{}'` unchanged (truthy string); the next statement `fm.brief.last_gate_results = fm.brief.last_gate_results || {}` fails with `Cannot set properties of undefined (setting 'align')`.
- **Fix:** Changed the guard to `if (!fm.brief || typeof fm.brief !== 'object' || Array.isArray(fm.brief)) fm.brief = {};` — coerces any non-object (string, null, array, undefined) to a real empty object.
- **Files modified:** `brief/bin/lib/align.cjs`
- **Verification:** All 12 Task 1 tests green; subsequent round-trip tests confirm the brief map survives.
- **Committed in:** `0acfd7f` (Task 1 GREEN commit)

**4. [Rule 1 — Bug] `_resolveSafePath` canonicalizes via realpath-walk for macOS /private/var symlink compatibility**
- **Found during:** Task 2 CLI test `align commit --override writes override flag into STATE.md`
- **Issue:** On macOS, `process.cwd()` resolves `/var/folders/...` to `/private/var/folders/...` but command-line args carry the `/var/...` form. `path.resolve` does not follow symlinks. `absolute.startsWith(planningRoot + path.sep)` evaluates false even when both paths refer to the same filesystem location, so legitimate in-tree verdict paths were falsely rejected.
- **Fix:** Added `_canonicalize` helper that tries `fs.realpathSync` on progressively shorter parent paths until one exists, then re-joins the leaf. Applied to both sides of the startsWith check. Robust for non-existent candidates (`/etc/passwd`, `../../outside.json`) — they still canonicalize to their real parent and still get rejected for being outside `.planning/`.
- **Files modified:** `brief/bin/lib/align.cjs`
- **Verification:** All 23 tests in the round-trip suite green, including the two lib-layer `assert.throws(/path traversal/)` assertions on explicit traversal attempts.
- **Committed in:** `d613e89` (Task 2 GREEN commit)

---

**Total deviations:** 4 auto-fixed (1 blocking, 3 bugs)
**Impact on plan:** All auto-fixes were correctness requirements — three were pre-existing latent issues the plan's tests would have triggered, one (#4) surfaced through the CLI subprocess test environment. No scope creep; all fixes live inside the 4 files the plan allocated to this wave.

## Issues Encountered

- **align.cjs line-count budget pressure.** After inlining all three new functions, align.cjs reached 445 lines (45 over 400). Resolved via the sibling-file escape hatch the plan explicitly authorized — moved renderAlignReport to align-report.cjs. Final: align.cjs = 390, align-report.cjs = 63. No behavior change; align.cjs now imports renderAlignReport from the sibling.
- **macOS symlink path resolution.** Covered in deviation #4 above. The canonicalization pattern (realpath-walk fallback) is reusable and may be worth promoting to a core.cjs helper in a future refactor if Phase 5 audience gate or Phase 7 compliance gate need the same guard.

## Pitfall #5 Outcome (informing Plan 04-05)

**Empirical finding:** The D-20 frontmatter serializer round-trips `override: true` as the string `'true'` (not boolean `true`). `findings_count: 3` round-trips as the string `'3'` (Pitfall #4 — previously known).

Both `formatGate` and the round-trip test accept either form via `=== true || === 'true'` comparison. Plan 04-05 consumers (`/brief-define` Mode A wiring) should adopt the same pattern when reading `state.brief.last_gate_results.align.override`.

## Plan 04-05 Handoff

**Ready for 04-05 (define.md Mode A wiring):**
- `brief-tools.cjs align run --candidate <obj> --baseline <obj> --verdict-out <path> --raw` emits JSON: `{short_circuited: bool, verdict?: object, deterministic_findings?: array, verdictPath?: string}`. The workflow markdown should invoke this, inspect `short_circuited`, and either proceed to ALIGN commit (short-circuit) or spawn the LLM-pass subagent (deterministic didn't fire).
- `brief-tools.cjs align commit --verdict <path> [--override --override-reason <text>] --raw` emits `{alignPath, stateUpdated: true}`.
- The workflow should then issue `brief-tools commit --files .planning/OBJECTIVES.md .planning/ALIGN-00.md .planning/STATE.md` for the atomic 3-file commit (Pattern 4 visibility). No new commit plumbing needed inside align.cjs.

## Plan 04-06 Handoff

**Ready for 04-06 (vocabulary lock + text-mode parity tests):**
- ALIGN-00.md rendering is Korean-when-Korea-signal, English-otherwise (D-11 verified via test `renderAlignReport — Korean body with bilingual headers when korea=true`).
- Ban-list vocabulary discipline lives in align.cjs BAN_EN / BAN_KO / BAN_SYMBOL regexes (from 04-01). 04-06's vocabulary-lock tests should grep the rendered ALIGN-00.md and agent prompt templates for `compliant|passed|violation|failed|준수|통과|위반|실패|[✅✓✗]`.
- The 3-path user-interrupt UX (D-06) is orchestrator-workflow territory, not align.cjs — 04-06 can wire text-mode parity tests against the workflow markdown directly without touching the lib layer.

## Next Phase Readiness

- ALIGN commit infrastructure (lib + CLI + state + status) is complete and tested end-to-end via the CLI subprocess tests.
- Plans 04-05 and 04-06 (Waves 4 and 5) can proceed in parallel — 04-05 wires into `/brief-define` Mode A, 04-06 adds vocabulary + text-mode parity. Neither depends on the other.
- Phase 5 AUDIENCE and Phase 7 COMPLIANCE can duplicate-and-rename `align.cjs` + `align-report.cjs` + `brief-align-gate.md` + the combined round-trip test when their scope lands. The sibling-file split pattern and the override+findings_count string-vs-int Pitfall guards are the two inheritances.

## Self-Check: PASSED

Verified artifacts:
- FOUND: `brief/bin/lib/align.cjs` (390 lines, exports commitAlignVerdict + renderAlignReport)
- FOUND: `brief/bin/lib/align-report.cjs` (63 lines, renderAlignReport home)
- FOUND: `brief/bin/brief-tools.cjs` (case 'align': registered)
- FOUND: `brief/bin/lib/status.cjs` (formatGate override suffix)
- FOUND: `brief/bin/lib/frontmatter.cjs` (stripFrontmatter export)
- FOUND: `tests/state-brief-override-roundtrip.test.cjs` (23 tests, all green)

Verified commits:
- FOUND: `a648ca9` — test(04-04): add failing tests for commitAlignVerdict + renderAlignReport (TDD RED)
- FOUND: `0acfd7f` — feat(04-04): commitAlignVerdict + renderAlignReport in align.cjs (TDD GREEN)
- FOUND: `40925c5` — test(04-04): add failing tests for align dispatcher + formatGate override + CLI path-traversal (TDD RED)
- FOUND: `d613e89` — feat(04-04): align dispatcher + formatGate override + _resolveSafePath canonicalization (TDD GREEN)

Verified invariants:
- align.cjs line count: 390 < 400 ✓
- package.json dependencies: `{}` (zero runtime deps) ✓
- Full test suite: 54 pass, 0 fail across brief-align*, state-brief-override-roundtrip ✓
- Broader regression: 199 pass, 0 fail across frontmatter + state ✓

---
*Phase: 04-first-gate-align-pattern-established*
*Completed: 2026-04-21*
