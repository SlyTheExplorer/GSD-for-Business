---
phase: 09-hardening-cross-runtime-smoke-non-developer-pilot
plan: 01
subsystem: cross-runtime-smoke
tags: [hrd-01, smoke-test, runtime-detection, text-mode, stub-driven]
requires: [09-00 (Wave 0 fixtures)]
provides:
  - brief/bin/lib/smoke-test.cjs (RUNTIMES + COMMANDS + smokeOneCell + buildMatrix + renderMatrixMarkdown)
  - case 'smoke-test' dispatcher in brief/bin/brief-tools.cjs
  - .planning/SMOKE-TEST.md (4×5 PASS/FAIL/SKIP audit doc)
affects:
  - HRD-01 substrate operational; v1 launch gate prong (ii) "smoke test PASS or documented SKIP" can now be evaluated
tech-stack:
  added: []                  # A1 preserved — zero new npm deps
  patterns: [stub-driven-subprocess-fanout, byte-identity-dispatcher, atomic-write]
key-files:
  created:
    - brief/bin/lib/smoke-test.cjs
    - .planning/SMOKE-TEST.md
  modified:
    - brief/bin/brief-tools.cjs (case 'smoke-test' added between case 'voice-fit' and case 'leakage-diff')
decisions:
  - Mirror case 'voice-fit' byte-identity for case 'smoke-test' dispatcher (Plan §B-D01-style discipline)
  - text_mode_default key in RUNTIMES.env is a stub-test marker (NOT a real env var); stripped before child env spread
  - All-FAIL initial-run state is load-bearing per B-D02 — diagnostic signal of which brief-tools.cjs cmds need --smoke handler in v1.1
metrics:
  tasks-completed: 2
  files-created: 2
  files-modified: 1
  commits: 2
  tests-newly-green: 11   # 4 stub + 4 text-mode + 3 output-format
  tests-skipped: 0
  duration-minutes: ~10
  completed: 2026-04-27
---

# Phase 9 Plan 01: Cross-Runtime Smoke Test Substrate (HRD-01) Summary

Closes HRD-01 by adding the cross-runtime smoke-test substrate: a stub-driven 4-runtime × 5-command subprocess fan-out lib, a `case 'smoke-test'` dispatcher mirroring `case 'voice-fit'` byte-identity, and a generated `.planning/SMOKE-TEST.md` audit doc with 4×5 PASS/FAIL/SKIP matrix. Stub-driven by design — never invokes real Codex/Gemini/OpenCode CLIs.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create brief/bin/lib/smoke-test.cjs (RUNTIMES + COMMANDS + smokeOneCell + buildMatrix + renderMatrixMarkdown) | b3b5514 | brief/bin/lib/smoke-test.cjs (166 lines) |
| 2 | Add case 'smoke-test' dispatcher to brief-tools.cjs + generate .planning/SMOKE-TEST.md | 83c0de6 | brief/bin/brief-tools.cjs (+30 lines), .planning/SMOKE-TEST.md (35 lines) |

## What Landed

**brief/bin/lib/smoke-test.cjs (NEW, 166 lines):**
- 5 module exports: `RUNTIMES` (4 entries: claude/codex/gemini/opencode with INSTRUCTION_FILE + text_mode_default), `COMMANDS` (5 entries: init/define/discover/design/deliver), `smokeOneCell(runtime, cmd, briefRoot)`, `buildMatrix(briefRoot)`, `renderMatrixMarkdown(matrix)`.
- Pitfall 4 mitigation explicit: `execFileSync(process.execPath, [...], { env, encoding, timeout: 5000 })`. ETIMEDOUT → `{ status: 'FAIL', reason: 'timeout 5s' }`.
- text_mode plumbing assertion: if subprocess stdout includes 'AskUserQuestion' AND `runtime.env.text_mode_default === true` → FAIL with reason 'AskUserQuestion present despite text_mode'.
- text_mode_default stripped from child env (it's a stub-test marker, not a real env var).
- Zero runtime deps preserved (A1) — uses only `node:child_process`, `node:fs`, `node:path`.

**brief/bin/brief-tools.cjs case 'smoke-test' dispatcher (NEW, ~30 lines, between voice-fit and leakage-diff):**
- Subcommand: `smoke-test run [--out <path>]` → `buildMatrix(cwd)` → `renderMatrixMarkdown(matrix)` → `core.atomicWriteFileSync(outPath, md)` → `core.output({matrix, outPath}, raw, 'SMOKE-TEST.md written: <path>')`.
- Unknown subcommand: `error('smoke-test: unknown subcommand 'bogus'. Valid: run')` (exit 1).
- Mirrors `case 'voice-fit'` byte-identity: try/catch + `error` + `core.output` + index-based `--out` arg parsing.

**.planning/SMOKE-TEST.md (NEW, generated, 35 lines):**
- Header `# BRIEF Cross-Runtime Smoke Test — v1 Launch`.
- Run metadata: date, stub-driven approach declaration, result format note.
- 4×5 table: 4 runtime rows (claude/codex/gemini/opencode) × 5 command columns (init/define/discover/design/deliver).
- `## FAIL/SKIP Detail` section enumerating every non-PASS cell with one-line reason.

## Initial-Run Cell Outcomes (LOAD-BEARING DIAGNOSTIC)

All 20 cells FAIL on first run. **This is expected and documented per Plan §B-D02.** The brief-tools.cjs dispatchers for `init/define/discover/design/deliver` do not yet recognize the `--smoke` flag, so each spawned subprocess exits non-zero with messages like:
- `init`: "Unknown init workflow: --smoke. Available: execute-phase, plan-phase, ..."
- `define`: subcommand-not-recognized
- `discover`: subcommand-not-recognized
- `design`: "design: unknown subcommand '--smoke'. Valid: list, get-workstream, recommended-next"
- `deliver`: "deliver: unknown subcommand '--smoke'. Valid: synthesize, list-type-a, list-type-b"

These FAILs become the v1.1 follow-up backlog: each dispatcher needs a `--smoke` handler that prints a deterministic "OK" line + exits 0 (B-D02 explicit Out of Scope for Plan 01).

## Tests Newly Green

3 fixtures from Wave 0 (Plan 09-00) flip from RED (skipped) to GREEN (passing):

| Fixture | Tests | Pass | Skip |
|---------|-------|------|------|
| tests/brief-smoke-test-stub.test.cjs | 4 | 4 | 0 |
| tests/brief-smoke-test-text-mode.test.cjs | 4 | 4 | 0 |
| tests/brief-smoke-test-output-format.test.cjs | 3 | 3 | 0 |
| **TOTAL** | **11** | **11** | **0** |

Verification: `node --test tests/brief-smoke-test-stub.test.cjs tests/brief-smoke-test-text-mode.test.cjs tests/brief-smoke-test-output-format.test.cjs` exits 0; 11 pass / 0 fail / 0 skip.

## Deviations from Plan

None — plan executed exactly as written. Two minor noteworthy alignment points:

1. **dispatcher local helper naming**: voice-fit uses `error()` (not `core.error()`) because `error` is destructured from `core` at brief-tools.cjs line 170 (`const { error, findProjectRoot, getActiveWorkstream } = core;`). Plan §action.1 referenced `core.error` from PATTERNS.md line 416, but the actual dispatcher convention in voice-fit/leakage-diff is `error(...)`. Used `error(...)` to match true byte-identity discipline. Both forms resolve to the same function.

2. **wc -l count**: file is 166 lines, ≥130 minimum required. Acceptance criteria all green.

## Threat Model Compliance

Per `<threat_model>` in plan:
- T-9-02 (E/I shell injection): mitigated. RUNTIMES + COMMANDS are hardcoded constants in smoke-test.cjs; `execFileSync(process.execPath, [array of args], options)` — no shell, no string concat.
- T-9-07 (D timeout DoS): mitigated. `timeout: 5000` (3 occurrences in lib); ETIMEDOUT returns FAIL 'timeout 5s'. Worst-case 4×5×5s = 100s; acceptable for one-shot smoke run.
- T-9-08 (I path leakage in err.message): accepted per plan. SMOKE-TEST.md is internal pre-launch diagnostic material; absolute paths in cell.reason are useful for v1.1 dispatcher repair triage.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries introduced by this plan. Stub subprocess invocation is bounded by hardcoded RUNTIMES + COMMANDS arrays.

## A1 Invariant Preserved

`node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` returns `0` after this plan. Imports are exclusively built-in:
```javascript
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
```

`grep -E "require\\('(commander|fast-levenshtein|cross-spawn|execa)'\\)" brief/bin/lib/smoke-test.cjs` returns nothing.

## Self-Check: PASSED

- [x] FOUND: brief/bin/lib/smoke-test.cjs (166 lines, ≥130 required)
- [x] FOUND: .planning/SMOKE-TEST.md (35 lines, ≥20 required)
- [x] FOUND: case 'smoke-test' in brief/bin/brief-tools.cjs (1 occurrence, between voice-fit and leakage-diff)
- [x] FOUND: commit b3b5514 (Task 1)
- [x] FOUND: commit 83c0de6 (Task 2)
- [x] All 11 Wave 0 plan-relevant tests GREEN, 0 skipped
- [x] A1 invariant: package.json dependencies count = 0
- [x] No forbidden runtime deps in smoke-test.cjs (commander/cross-spawn/execa/fast-levenshtein absent)
- [x] node brief/bin/brief-tools.cjs smoke-test bogus exits non-zero (subcommand validation works)

## Next Plan

Plan 09-02 lands `case 'help'` AFTER `case 'smoke-test'` (canonical ordering: voice-fit → smoke-test → help). Plan 09-02 also does not need to add `--smoke` handlers to init/define/discover/design/deliver — that v1.1 follow-up is recorded in the FAIL/SKIP Detail section of `.planning/SMOKE-TEST.md` itself.
