---
phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
plan: 06
subsystem: status-renderer
tags: [FND-10, /brief-status, compact-dashboard, read-only, resilience]
requirements: [FND-10]
dependency_graph:
  requires:
    - 02-04  # state.brief.* namespace initialization (Wave 3, merged)
  provides:
    - /brief-status slash command (user-facing, compact dashboard)
    - brief/bin/lib/status.cjs renderStatus(cwd, raw) pure function
    - brief-tools.cjs `status` subcommand dispatch
  affects:
    - commands/brief/ surface (+1 command → 62 pre Phase-9 prune)
    - FND-06 cross-runtime parity (workflow stub shipped)
tech_stack:
  added: []
  patterns:
    - "Compose over read-only APIs (extractFrontmatter + direct ROADMAP regex); do not call cmdRoadmapAnalyze because it is print-coupled (Plan 06 W2 deferral)"
    - "Lazy require for dispatcher case — matches existing `uat`, `milestone` dispatch patterns"
    - "D-17 resilience: every fs read guarded by fs.existsSync + try/catch; never throw"
    - "D-18 read-only: renderer never invokes write-path APIs; verified via SHA256 unchanged"
    - "Raw-stdout plain-text output via core.output(obj, raw, rawValue) — same contract as cmdProgressRender"
key_files:
  created:
    - brief/bin/lib/status.cjs
    - commands/brief/status.md
    - brief/workflows/status.md
    - tests/status-renderer.test.cjs
  modified:
    - brief/bin/brief-tools.cjs  # added case 'status': dispatch + doc-header entry
decisions:
  - "Parse ROADMAP.md via direct regex rather than cmdRoadmapAnalyze (print-coupled API) — documented as Plan 06 W2 v2-refactor candidate"
  - "Strip leading zeros from current_phase (02 → 2) when looking up ROADMAP phase name, since ROADMAP headers use `Phase 2:` not `Phase 02:`"
  - "Workflow stub kept to 7 lines (cap: 30) — pure cross-runtime parity stub per FND-06; all logic lives in status.cjs"
  - "Fallback to `—` (em-dash) not `undefined` when current_phase or phase_count unavailable (Pitfall 4 mitigation)"
  - "Command frontmatter uses `name: brief:status` (NOT `gsd:status`) — avoids R-4 drift into Phase 9 HRD-05 residue catalog"
metrics:
  duration_minutes: 18
  tasks_completed: 2
  files_created: 4
  files_modified: 1
  commits: 2
  completed_date: 2026-04-19
---

# Phase 2 Plan 06: /brief-status Compact Dashboard Summary

FND-10 shipped: `/brief-status` renders the user-locked D-15 compact dashboard from `state.brief.*` with full D-17 resilience, D-18 read-only guarantees, and D-19 stdout semantics — closing the last Phase 2 deliverable.

## 요약

Phase 2 Plan 06은 사용자가 D-15에서 승인한 컴팩트 대시보드 포맷을 `/brief-status` 슬래시 명령으로 구현했다. 핵심 산출물 다섯 개 — `brief/bin/lib/status.cjs` 렌더러 (123줄), `commands/brief/status.md` 명령 스텁, `brief/workflows/status.md` 크로스-런타임 패리티 워크플로우 스텁 (7줄), `tests/status-renderer.test.cjs` (8개 테스트), `brief/bin/brief-tools.cjs`의 `case 'status':` 디스패치 추가 — 모두 단일 원자적 웨이브에서 출하되었다. RED/GREEN TDD 사이클로 실행되었으며 (Task 1: 테스트 우선 RED 커밋, Task 2: GREEN 구현), 모든 8개 테스트가 통과하고 사전 Plan 01-05 테스트 스위트에서 회귀가 없으며, npm-test 실패 수는 베이스라인 63에 고정되어 있다.

## What Was Built

### 1. `brief/bin/lib/status.cjs` — Read-only renderer (123 lines, cap 150)

Public API: `renderStatus(cwd, raw) → string` (also writes rendered text to stdout via `core.output`).

Key design choices:

| Concern | Decision | Rationale |
|---|---|---|
| ROADMAP parsing | Direct regex over `^#{2,4}\s*Phase\s+\d+.*:` | `cmdRoadmapAnalyze` prints via `output()` and returns `undefined` — not composable from a read-only caller. Plan 06 W2 deferral. |
| Phase name lookup | `/^#{2,4}\s*Phase\s+${n}\s*:\s*(.+)$/m`, strip leading zeros on `n` | ROADMAP headers use `Phase 2:` not `Phase 02:` |
| Short name truncation | First 3 words before ` — ` | Keeps dashboard line under column budget |
| null handling | `brief.current_workstream || '— (none active)'` | Plan 02-01 frontmatter fix already returns JS `null` (not string "null") so the falsy check is correct |
| Warning trigger | `brief:` map missing entirely (not per-field) | D-17 rule 4: "if the entire `brief:` map is missing" |
| Output stream | `core.output({ rendered }, raw, rendered)` | Same contract as `cmdProgressRender` — JSON wrapper if `raw=false`, plain text if `raw=true` |

### 2. `commands/brief/status.md` — Slash command stub

18 lines. Frontmatter `name: brief:status` (NOT `gsd:status`). `allowed-tools: [Read, Bash]` matches the read-only posture. `<execution_context>` references `@~/.claude/brief/workflows/status.md`. Auto-registers across 14 runtimes via `bin/install.js` bulk copy — no tuple edit required (R-4).

### 3. `brief/workflows/status.md` — Cross-runtime parity stub (7 lines)

Thin FND-06 stub. `<purpose>` + `<process>` blocks only. All rendering logic lives in `status.cjs`; this file exists so the `@~/.claude/brief/workflows/status.md` reference in the command stub resolves in runtimes that materialize it.

### 4. `tests/status-renderer.test.cjs` — 8 test cases

| # | Test | Gates |
|---|------|-------|
| 1 | Placeholder render with empty `brief:` map | D-15 / D-16 / D-17 |
| 2 | Populated `current_workstream` slug | D-16 |
| 3 | Populated `last_gate_results.align` with decision + findings_count | D-16 |
| 4 | Populated `return_stack` depth > 0 | D-16 |
| 5 | Missing STATE.md — warning + no throw | D-17 / Pitfall 4 |
| 6 | Missing ROADMAP.md — `Phase N of —` + no `undefined` + no throw | D-17 / Pitfall 4 |
| 7 | Dispatcher integration via `runGsdTools(['status'])` — stdout + exit 0 | D-19 |
| 8 | Read-only — SHA256 of STATE.md unchanged | D-18 |

Test harness: temp project via `createTempProject`, seed helpers `seedState` + `seedRoadmap`, `callRender` that intercepts both `process.stdout.write` and `fs.writeSync(1, ...)` (the actual path `core.output` uses).

### 5. `brief/bin/brief-tools.cjs` — Dispatcher case

```javascript
case 'status': {
  const status = require('./lib/status.cjs');
  status.renderStatus(cwd, raw);
  break;
}
```

Placed between `case 'progress':` and `case 'audit-uat':`. Doc-header entry added under `Progress:` section for discoverability.

## Acceptance Gates — All Passing

| Gate | Result |
|---|---|
| `test -f tests/status-renderer.test.cjs` | OK |
| `test -f brief/bin/lib/status.cjs` + exports `renderStatus` as function | OK |
| `wc -l < brief/bin/lib/status.cjs` ≤ 150 | OK (123) |
| `! grep -q "writeStateMd\|writeFileSync" brief/bin/lib/status.cjs` | OK (read-only) |
| `grep -q "^name: brief:status$" commands/brief/status.md` | OK |
| `! grep -q "^name: gsd:status" commands/brief/status.md` | OK (no residue drift) |
| `test -f brief/workflows/status.md` + `wc -l` ≤ 30 | OK (7) |
| `grep -q "^    case 'status':" brief/bin/brief-tools.cjs` | OK |
| `node --test tests/status-renderer.test.cjs` | 8/8 pass, 0 fail |
| `node brief/bin/brief-tools.cjs status` exit 0, stdout contains `BRIEF Status` | OK |
| Empty tmp dir: `node brief-tools.cjs status` exits 0 with warning | OK |
| SHA256 of STATE.md before/after identical | OK (`910cffa2…197d8a`) |
| `node --test tests/state.test.cjs tests/state-brief-roundtrip.test.cjs tests/frontmatter.test.cjs tests/frontmatter-roundtrip.test.cjs tests/workstream-loader-*` | 165 pass, 0 fail |
| `npm test` failure count | 63 (cap preserved) |
| `node -e "Object.keys(require('./package.json').dependencies\|\|{}).length"` | 0 |

## Commits

| Task | Commit | Message |
|---|---|---|
| 1 | `f7854dd` | `test(02-06): add status-renderer RED tests (FND-10 D-15..D-19)` |
| 2 | `6b0cd60` | `feat(02-06): /brief-status compact dashboard + command stub + workflow + dispatcher case (FND-10)` |

## Dashboard Render — Live Sample (against worktree STATE.md)

```
BRIEF Status
================================
  Phase           — of 9
  Workstream      — (none active)
  Return stack    0 / 3
  Last ALIGN      — (none yet)
  Last COMPLIANCE — (none yet)
--------------------------------
  Next: Phase 2 context gathered (delegated mode)
```

The `Phase — of 9` rendering is correct under D-17: the worktree's `.planning/STATE.md` frontmatter has no `current_phase` key (that field lives in the markdown body as `**Current Phase:** 02`). The renderer gracefully shows `—` rather than `undefined`, and the `of 9` comes from the 9 `### Phase N:` headers in ROADMAP.md. Once an orchestrator writes `current_phase: 02` into the frontmatter (Phase 3+ flow), the line reads `Phase 02 of 9 (Stable Seam)`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Strip leading zeros from `current_phase` when looking up ROADMAP phase name**

- **Found during:** Task 2 manual CLI verification
- **Issue:** `current_phase: 02` in STATE.md produced `Phase 02 of —` because the ROADMAP lookup regex used `Phase 02:` literally but ROADMAP.md uses `### Phase 2:` (no leading zero).
- **Fix:** Strip leading zeros in the phase-name regex construction (`phaseNumStr.replace(/^0+(?=\d)/, '')`) while preserving them in the displayed value.
- **Files modified:** `brief/bin/lib/status.cjs` (getPhaseInfo)
- **Commit:** Part of `6b0cd60` (same atomic commit as initial implementation; caught pre-commit during manual check)

**2. [Rule 1 - Bug] Comment wording false-positive against `! grep writeFileSync` acceptance gate**

- **Found during:** Task 2 acceptance gate sweep
- **Issue:** The JSDoc comment `MUST NOT call writeStateMd or fs.writeFileSync` (documenting the D-18 rule as anti-pattern guidance) tripped the acceptance grep `! grep -q "writeStateMd\|writeFileSync"`.
- **Fix:** Rephrased the comment to `must not mutate any on-disk state; no write-path APIs invoked` — preserves the D-18 contract signaling without matching the literal write-path identifiers.
- **Files modified:** `brief/bin/lib/status.cjs` (JSDoc header only)
- **Commit:** Part of `6b0cd60`

No Rule 2 (missing critical functionality), Rule 3 (blocking issues), or Rule 4 (architectural changes) deviations.

## Known Stubs

**1. `brief/workflows/status.md`** — intentional thin stub per plan's File 2b spec. All rendering logic lives in `status.cjs`; the workflow exists solely for FND-06 cross-runtime parity (to resolve the `@~/.claude/brief/workflows/status.md` reference in the command stub on runtimes that materialize it). This is NOT a gap — it's the planned architecture and will remain as-is.

**2. `current_phase` absent from worktree STATE.md frontmatter** — not a Plan 06 stub. The field is managed by STATE-orchestration commands (Plan 02-04 initialized the `brief:` map but did not add `current_phase` to frontmatter; the legacy value lives in the body). `/brief-status` renders `—` correctly per D-17. Phase 3+ orchestrator writes will populate it.

## W2 Deferral Documented

**`getPhaseInfo` uses direct ROADMAP.md regex parsing rather than `cmdRoadmapAnalyze`.**

Rationale: `cmdRoadmapAnalyze` in `brief/bin/lib/roadmap.cjs:115-255` ends with `output(result, raw)` — it writes JSON to stdout and returns `undefined`. A read-only caller like `status.cjs` cannot compose with it without either (a) swallowing the stdout pollution via monkey-patching, or (b) re-extracting the analyzer's internals. Option (c) — refactoring `cmdRoadmapAnalyze` into a pure `analyzeRoadmap(cwd) → object` + a thin `cmdRoadmapAnalyze(cwd, raw) { output(analyzeRoadmap(cwd), raw); }` wrapper — is the correct v2 fix, but it is out of scope for Plan 06 (surfaces two callers and two tests that would need updating and exceeds the Plan 06 file footprint).

**Tracked as v2 refactor candidate.** Candidate path: `brief/bin/lib/roadmap.cjs` pure/effectful split, mirroring how Plan 02-04 separated `buildStateFrontmatter` (pure) from `cmdStateJson` (effectful).

## Threat Model Audit

Per the plan's `<threat_model>` register:

| ID | Category | Component | Disposition | Outcome |
|---|---|---|---|---|
| T-02-06-01 | Denial of Service | `status.cjs` on missing STATE/ROADMAP | mitigate | **Verified via tests 5 + 6** — renderer never throws; emits `—` fallback and D-17 warning line |
| T-02-06-02 | Information Disclosure | `brief.current_workstream` to stdout | accept | Slug names are non-confidential; `/brief-status` is the planner's own terminal per plan |
| T-02-06-03 | Tampering | command frontmatter `name:` | mitigate | **Verified** — `grep -q "^name: brief:status$"` passes; `! grep -q "^name: gsd:status"` passes |

No new threat surface discovered during execution.

## Threat Flags

None — no new network endpoints, auth paths, file-write paths, or schema mutations introduced. The new ROADMAP.md read is a first-party trusted file already read by 5+ other lib modules.

## Self-Check: PASSED

**Files created (all exist):**
- `brief/bin/lib/status.cjs` — FOUND
- `commands/brief/status.md` — FOUND
- `brief/workflows/status.md` — FOUND
- `tests/status-renderer.test.cjs` — FOUND

**Files modified (change visible in git log):**
- `brief/bin/brief-tools.cjs` — FOUND (case 'status': at line 779; doc entry at line 65)

**Commits (verified in `git log --oneline --all`):**
- `f7854dd` — FOUND: `test(02-06): add status-renderer RED tests (FND-10 D-15..D-19)`
- `6b0cd60` — FOUND: `feat(02-06): /brief-status compact dashboard + command stub + workflow + dispatcher case (FND-10)`

**Test outcomes:**
- `node --test tests/status-renderer.test.cjs` → 8 pass, 0 fail
- `node --test tests/state.test.cjs tests/state-brief-roundtrip.test.cjs tests/frontmatter.test.cjs tests/frontmatter-roundtrip.test.cjs tests/workstream-loader-discovery.test.cjs tests/workstream-loader-validation.test.cjs` → 165 pass, 0 fail
- `npm test` failure count → 63 (baseline preserved)
