---
phase: 03
plan: 01
subsystem: brief/objectives
tags: [objectives, immutable-lock, pitfall-3, korea-first, tdd]
requires:
  - brief/bin/lib/frontmatter.cjs (D-20 serializer, Phase 2)
  - brief/bin/lib/core.cjs (planningPaths, atomicWriteFileSync)
provides:
  - brief/bin/lib/objectives.cjs (5 primitives + 2 constants)
  - tests/fixtures/korea-b2c-persona.json (canonical Korea-first B2C fixture)
affects:
  - Plan 03-02 (Mode A greenfield — consumes writeObjectivesMd, fixture)
  - Plan 03-03 (Mode B amendment — consumes enforceImmutableLock, writeObjectivesMd unlockIntent path)
  - Plan 03-04 (atomic commit — consumes writeObjectivesMd + fixture for Cycles 2+3+4+5)
  - Plan 03-05 (block-gate — consumes validateObjectivesComplete, OBJECTIVES_SCHEMA)
  - Plan 03-06 (stale-anchor — consumes checkStaleAnchor, STALE_ANCHOR_THRESHOLD_MS)
tech-stack:
  added: []  # A1 zero-runtime-deps preserved — no new packages
  patterns:
    - "frontmatter.cjs composition over extension (D-20 reuse)"
    - "writer-layer immutable-section refusal (Pitfall #3 mitigation per D-07)"
    - "JSON.stringify deep-equality for mutation detection"
    - "atomicWriteFileSync for OBJECTIVES.md disk write"
key-files:
  created:
    - brief/bin/lib/objectives.cjs
    - tests/brief-objectives-roundtrip.test.cjs
    - tests/brief-objectives-immutable-lock.test.cjs
    - tests/fixtures/korea-b2c-persona.json
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-01-objectives-foundation-SUMMARY.md
  modified: []
decisions:
  - "D-07 writer-layer lock: enforceImmutableLock throws BEFORE any atomicWriteFileSync — commit-time enforcement rejected as it would leak partial writes"
  - "D-11 compliance_packs empty array valid: validateObjectivesComplete treats [] as valid for compliance_packs specifically (non-Korea projects)"
  - "JSON.stringify deep-equality chosen over === for mutation detection — handles array/map immutable values uniformly without per-type branching"
  - "renderBodySkeleton emits 🔒 HTML comment marker inline in Immutable Intent block so Mode B UI detects lock boundary without re-parsing frontmatter"
  - "Export both OBJECTIVES_SCHEMA and STALE_ANCHOR_THRESHOLD_MS from module — Plan 05/06 compose from them, so they must be named exports not private constants"
metrics:
  duration: "~12 min"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
  tests_added: 12
  tests_passing: 12
  tests_failing: 0
  regression_baseline_preserved: true
completed: 2026-04-19
---

# Phase 3 Plan 01: OBJECTIVES.md Foundation Summary

`brief/bin/lib/objectives.cjs` composition module shipped with 5 primitives + writer-layer immutable-section lock + Korea-first B2C canonical fixture containing the W-3 verbatim Korean strings; Pitfall #3 mitigation is load-bearing for Plans 02–06.

## Objective

Ship the OBJECTIVES.md foundation — a dedicated lib module that handles read / write / validate / immutable-lock / stale-anchor against the D-20 frontmatter serializer, WITHOUT extending frontmatter.cjs further. Wave 1 foundation: every Phase 3 downstream plan (02, 03, 04, 05, 06) requires primitives from this file. Ship the canonical Korea-first B2C fixture at the same time so it is available to Plan 02's Mode A smoke test.

## What Was Built

### `brief/bin/lib/objectives.cjs` (239 lines)

Composition of `frontmatter.cjs` (D-20, Phase 2) + `core.cjs` — no new YAML parser, no new dependency, no gray-matter / ajv / js-yaml imports.

**5 named primitives exported** (the contract Phase 3 downstream plans `require()`):

| Primitive | Signature | Purpose |
|-----------|-----------|---------|
| `writeObjectivesMd` | `(cwd, payload, opts) → {path, frontmatter}` | Primary writer. Runs immutable-lock refuser BEFORE any disk write when `!opts.unlockIntent`. Stamps `last_amended` / `created_at` timestamps (drives stale-anchor). Splices frontmatter on amendment, renders body skeleton on first write. |
| `readObjectivesMd` | `(cwd) → {exists, frontmatter, body}` | Returns structured OBJECTIVES.md state; `{exists:false}` when file absent. |
| `validateObjectivesComplete` | `(cwd) → {valid, missing, present}` | Schema check against `OBJECTIVES_SCHEMA.required`. D-11 exception: empty `compliance_packs` array IS valid. Missing file returns `{missing:['FILE_NOT_EXIST']}` sentinel. |
| `checkStaleAnchor` | `(cwd) → {stale, age_hours, reason?}` | 48h mtime threshold check. Missing file returns `{stale:false, reason:'missing'}` — not stale, just not-yet-created. |
| `enforceImmutableLock` | `(existingFm, payload) → void / throws` | Pure function. Throws `Error` (code `OBJECTIVES_IMMUTABLE_LOCKED`, `violatedField`, Korean message) when payload mutates any field listed in `existingFm.immutable_items`. |

**2 constants exported:**
- `OBJECTIVES_SCHEMA = {required: ['business_model','region','audience_policy','compliance_packs','status','immutable_items']}` — consumed by Plan 05 block-gate.
- `STALE_ANCHOR_THRESHOLD_MS = 48*60*60*1000` — consumed by Plan 06 stale-anchor workflow.

**Pitfall #3 mitigation (writer-layer lock):** `writeObjectivesMd` invokes `enforceImmutableLock(existingFm, payload)` BEFORE any `atomicWriteFileSync` call. The Korean error message is verbatim-load-bearing — Plan 03 (Mode B) and Plan 04 (atomic commit) assert on the regex `/Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/`.

**Body skeleton (`renderBodySkeleton`):** Emits the 11 RESEARCH.md §Example 4 sections (Immutable Intent × 3 + Mutable Hypotheses × 8). The Immutable Intent block carries the verbatim HTML comment `<!-- 🔒 LOCKED — 이 섹션을 수정하려면 /brief-define --unlock-intent가 필요합니다. -->` so Mode B UI (Plan 03) can detect the lock boundary without re-parsing frontmatter.

### `tests/fixtures/korea-b2c-persona.json`

Canonical Korea-first B2C non-developer planner dialogue fixture consumed starting Plan 02. Contains:
- `persona_name: "한국-첫-B2C-피트니스-앱-기획자"`
- Full Mode A conversation transcript: opening + Push-Twice (core-value, audience) + Language-Precision + Dream State × 3 horizons + Korea-context mentions
- `expected_configs`: `{business_model:'b2c', region:'kr', audience_policy:'internal', compliance_packs:['PIPA','ISMS-P','MyData']}` (Korea-first compliance triad per D-11)
- `expected_objectives.body_sections_present`: 12 section anchors Plan 02 Cycle 1 test greps for

**W-3 verbatim Korean strings** (required verbatim, no rephrasing):
- `퇴근 후 혼자 집에서 운동하는 1인 가구 직장인` — placed in `conversation_transcript.opening`
- `AI가 봐주면서` — placed in `conversation_transcript.push_twice_core_value.push_1_answer`

Verified via W-3 guard script: `node -e "const f=require('./tests/fixtures/korea-b2c-persona.json'); const s=JSON.stringify(f); if(!s.includes('퇴근 후 혼자 집에서 운동하는 1인 가구 직장인'))process.exit(1); if(!s.includes('AI가 봐주면서'))process.exit(1)"` → exit 0.

### Tests Added (12 total, all GREEN)

**`tests/brief-objectives-roundtrip.test.cjs`** (4 tests) — D-20 serializer reuse verification:
- Full OBJECTIVES.md shape round-trips with zero drift via `assert.deepStrictEqual`
- `immutable_items` array preserves order (load-bearing for 🔒 marker logic)
- Empty `compliance_packs` survives round-trip (non-Korea fixture case)
- Two-cycle integrity (no write-normalization drift, R-1 Phase 2 defect class)

**`tests/brief-objectives-immutable-lock.test.cjs`** (8 tests) — Pitfall #3 writer-layer enforcement:
- enforceImmutableLock direct throw tests (A, non-immutable pass, empty immutable_items pass, error code attribution)
- writeObjectivesMd refusal tests (B: unlockIntent:false throws + file unchanged; B2: different immutable field + file unchanged)
- writeObjectivesMd permit tests (C: unlockIntent:true mutation succeeds; C2: first-write on fresh temp)

## TDD Cycle Compliance

Plan `type: execute` but tasks marked `tdd="true"`:
- **RED (Task 1 commit `1f3c06d`)** — skeleton with NOT_IMPLEMENTED stubs; `node --test tests/brief-objectives-*.test.cjs` correctly RED.
- **GREEN (Task 2 commit `68bc67b`)** — 5 primitives fully implemented; 12/12 tests pass.
- **REFACTOR** — not needed; implementation fits under the 300-line discipline at 239 lines on first pass.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Phase 3 quick-run | `node --test tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs` | 12/12 GREEN (0 fail, ~170ms) |
| Phase 2 regression (D-20/D-21 load-bearing) | `node --test tests/frontmatter-roundtrip.test.cjs tests/state-brief-roundtrip.test.cjs` | 14/14 GREEN |
| Full suite regression | `node scripts/run-tests.cjs` | 3637 pass / 41 fail (baseline 3625 pass / 41 fail). +12 new tests GREEN; 0 new regressions. The 41 pre-existing failures are Phase 1 HRD-05 deferred per STATE.md. |
| Zero-dep guard (A1) | `grep -E "require\('gray-matter'\\)\|require\('ajv'\\)\|require\('js-yaml'\\)" brief/bin/lib/objectives.cjs` | no match (PASS) |
| Line count discipline | `wc -l brief/bin/lib/objectives.cjs` | 239 (≤300 target) |
| package.json deps | `node -e "console.log(Object.keys(require('./package.json').dependencies\|\|{}).length)"` | 0 (unchanged) |
| Lock-enforce inline | enforceImmutableLock({immutable_items:['core-value'],'core-value':'orig'},{frontmatter:{'core-value':'new'}}) | throws with `/Immutable Intent 항목은/` (PASS) |
| W-3 verbatim strings in fixture | node -e grep on JSON.stringify(fixture) | both strings present (PASS) |

## Deviations from Plan

None — plan executed exactly as written. One notable sub-design:

- **Path resolution helper `objectivesPath(cwd)`** — factored out of the three primitives that need `.planning/OBJECTIVES.md` full path (writer, reader, stale-anchor). Uses `planningPaths(cwd).planning` with a defensive `path.join(cwd, '.planning')` fallback. The PLAN.md suggested `planningPaths(cwd).base` but `core.cjs` actually returns `{planning, state, ...}` with the `.planning` key; the fallback pattern is equivalent. No deviation in behavior or contract.

## Success Criteria Compliance

1. ✅ `objectives.cjs` is a COMPOSITION of `frontmatter.cjs` (D-20) + `core.cjs` — no new parser, no new dependency.
2. ✅ Pitfall #3 mitigation is WRITER-LAYER, not commit-layer: `enforceImmutableLock` throws BEFORE any `atomicWriteFileSync` call. Verified by Test B (file content unchanged after throw).
3. ✅ Phase 5+ consumers (ALIGN gate, per-workstream OBJECTIVES.md) can `require('./objectives.cjs')` and get all 5 primitives without side-effects on import. Confirmed by the import-harness in the roundtrip test file.
4. ✅ Canonical Korea-first B2C fixture is available to Plan 02's Mode A smoke test AND contains the W-3 verbatim Korean strings.

## Threat Model Coverage

Per `<threat_model>` in PLAN.md:

- **T-03-01 (mitigate):** Tampering via writeObjectivesMd immutable-section bypass — MITIGATED. `enforceImmutableLock` runs BEFORE any disk write; throws Korean Error with `code: 'OBJECTIVES_IMMUTABLE_LOCKED'` and `violatedField` attribution. Test B asserts file is NOT written on throw (content byte-equality before/after).
- **T-03-02 (accept):** Frontmatter injection via status value with newlines + `---` sequence — ACCEPTED. D-20 `spliceFrontmatter` serializer handles control-char escape; existing `tests/frontmatter-roundtrip.test.cjs` regression guard still GREEN post-Plan-03-01.
- **T-03-03 (accept):** PII leaking into OBJECTIVES.md via user-typed content — ACCEPTED. Phase 3 out-of-scope per RESEARCH.md §Security Domain. Phase 5+ PII scanner covers.

No new trust boundaries or threat surface introduced beyond what PLAN.md specified.

## Commits

| Task | Commit | Type | Message |
|------|--------|------|---------|
| 1 | `1f3c06d` | test | scaffold objectives.cjs + RED tests + Korea-first B2C fixture |
| 2 | `68bc67b` | feat | implement 5 objectives.cjs primitives — tests GREEN |

Both commits are atomic (single logical step) and buildable in isolation — Task 1 leaves the module importable with stubs, Task 2 completes the contract.

## Known Stubs

None. All 5 primitives are fully implemented; no `TODO` / `FIXME` / placeholder strings in shipped code.

## Handoff Notes for Plan 03-02+

- Plan 03-02 (Mode A greenfield): `require('../brief/bin/lib/objectives.cjs').writeObjectivesMd(cwd, {frontmatter, body})` where `body` has `immutable` + `mutable` sub-maps. Fixture at `tests/fixtures/korea-b2c-persona.json` is the reference payload; `expected_body_fragments` field provides the Korean strings the workflow should splice in.
- Plan 03-03 (Mode B amendment): use `enforceImmutableLock` at UI layer (before picker prompt) AND rely on `writeObjectivesMd`'s writer-layer enforcement as the back-stop; `--unlock-intent` translates to `opts.unlockIntent = true`.
- Plan 03-04 (atomic commit): `writeObjectivesMd` alone does not commit; Plan 04 wraps it in a transaction with config.json + STATE.md writes. The writer-layer throw propagates — no rollback needed because nothing was written.
- Plan 03-05 (block-gate): `validateObjectivesComplete(cwd).missing` is the structured field-name array for the Korean error message.
- Plan 03-06 (stale-anchor): `checkStaleAnchor(cwd).stale === true` is the trigger; `.age_hours` is surfaced in the prompt.

## Self-Check: PASSED

Verified after SUMMARY.md write:

**Created files exist:**
- ✅ `brief/bin/lib/objectives.cjs` (239 lines)
- ✅ `tests/brief-objectives-roundtrip.test.cjs`
- ✅ `tests/brief-objectives-immutable-lock.test.cjs`
- ✅ `tests/fixtures/korea-b2c-persona.json`

**Commits exist:**
- ✅ `1f3c06d` — test(03-01): scaffold…
- ✅ `68bc67b` — feat(03-01): implement…

**Tests GREEN:** 12/12 (tests/brief-objectives-roundtrip + tests/brief-objectives-immutable-lock).
