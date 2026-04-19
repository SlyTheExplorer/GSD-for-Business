---
phase: 03
plan: 04
subsystem: brief/define
tags: [define, config, korea-signal, atomic-commit, canary, pitfall-2, pitfall-3, def-04]
requires:
  - brief/bin/lib/define.cjs (Plans 03-02/03 — cmdDefineApply, applyFromFixture, applyModeBAmendment, IMMUTABLE_DEFAULT_ITEMS)
  - brief/bin/lib/objectives.cjs (Plan 03-01 — writeObjectivesMd, enforceImmutableLock)
  - brief/bin/lib/core.cjs (withPlanningLock, planningDir, atomicWriteFileSync)
  - tests/helpers.cjs (createTempProject, createTempGitProject, runGsdTools)
  - tests/fixtures/korea-b2c-persona.json (Plan 03-01 — positive Korea fixture)
provides:
  - brief/bin/lib/define.cjs (EXTENDED — detectKoreaSignals, writeConfigBrief, performAtomicCommit, touchStateActivity, KOREA_SIGNAL_PATTERNS; applyFromFixture rewritten for B-6 sole-source rule + atomic 3-file commit)
  - tests/helpers.cjs (EXTENDED — createTempProjectWithConfig, createTempGitProjectWithConfig, BRIEF_BASELINE_CONFIG)
  - tests/fixtures/non-korea-b2b-persona.json (B-6 negative fixture — empty compliance_packs expected)
  - tests/brief-define-korea-signal.test.cjs (9 detector tests incl. false-positive guard)
  - tests/brief-config-brief-namespace.test.cjs (4 merge semantics tests)
  - tests/brief-define-atomic-commit.test.cjs (3 tests: positive 3-file commit + W-2 primary stub-throw + W-2 secondary chmod opportunistic)
  - tests/brief-define-canary.test.cjs (4 structural assertions)
  - tests/brief-define-mode-a.test.cjs (EXTENDED — Cycles 2+3+4+5 appended in new describe block)
affects:
  - Plan 03-05 (block-gate — can reuse `config.brief.*` reads from config.json now that the namespace is populated by DEFINE)
  - Plan 04 ALIGN gate — reads the `.planning/config.json` brief.* map to know region/compliance posture
  - Phase 5+ workstream agents — context-injection surface now includes the 4 configs DEF-04 mandated
tech-stack:
  added: []  # A1 zero-runtime-deps preserved — no new packages, no devDependency additions
  patterns:
    - "Korea-signal over-suggest bias (Pitfall 2) — 3-layer keyword regex frozen for v1"
    - "Atomic 3-artifact commit — three atomicWriteFileSync calls BEFORE performAtomicCommit; exception path unlinks partially-written OBJECTIVES.md before re-throw"
    - "module.exports indirection — applyFromFixture dispatches through module.exports.writeConfigBrief / performAtomicCommit so stub-throw tests can hot-swap primitives via require-cache"
    - "Baseline config seed helpers (B-2/B-3) centralized in tests/helpers.cjs — single source of truth for `cfg.model_profile / workflow / mode / granularity` preservation assertions"
    - "execFileSync('git', [...]) direct child-process calls in tests (B-1 fix) — brief-tools.cjs has no `case 'shell':` dispatcher"
key-files:
  created:
    - tests/brief-define-korea-signal.test.cjs
    - tests/brief-config-brief-namespace.test.cjs
    - tests/brief-define-atomic-commit.test.cjs
    - tests/brief-define-canary.test.cjs
    - tests/fixtures/non-korea-b2b-persona.json
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-04-config-korea-atomic-commit-SUMMARY.md
  modified:
    - brief/bin/lib/define.cjs (301 → 450 lines; applyFromFixture rewritten, 4 new primitives + 1 helper added)
    - tests/helpers.cjs (111 → 160 lines; 2 new helpers + baseline config constant)
    - tests/brief-define-mode-a.test.cjs (109 → 208 lines; Cycles 2+3+4+5 appended)
    - .planning/phases/03-define-canary-phase-0-end-to-end/deferred-items.md (52 → 81 lines; Item 3 added)
decisions:
  - "B-6 sole-source rule enforced: inferredCompliance = koreaSignal ? ['PIPA','ISMS-P','MyData'] : [] is the SOLE source for compliance_packs; fixture.expected_configs.compliance_packs is never injected (grep -c expected.compliance_packs brief/bin/lib/define.cjs → 0)"
  - "B-1 shell-dispatcher removal: tests use direct `execFileSync('git', ['log','-1','--name-only','--format='], {cwd, encoding:'utf-8'})` — runGsdTools(['shell','git',...]) is a non-existent path (checker-verified)"
  - "W-2 primary is deterministic stub-throw via require-cache + module.exports dispatch indirection; chmod secondary is opportunistic and skips on macOS/Linux parent-writable dirs where renameSync-over-readonly succeeds"
  - "touchStateActivity auto-seeds minimal STATE.md when absent — the 3-file atomic commit always has a third leg even on first-run greenfield projects"
  - "module.exports indirection pattern chosen over a named-export-only refactor — preserves Plan 03-03 applyModeBAmendment export contract while enabling the stub-throw test harness"
  - "define.cjs landed at 450 lines (plan budget ≤400); 50-line overshoot deferred to a later Phase 3 polish pass or plan-checker amendment — see deferred-items.md §3"
metrics:
  duration: "~35 min"
  tasks_completed: 2
  files_created: 5
  files_modified: 4
  tests_added: 16  # 9 Korea-signal + 4 namespace + 3 atomic-commit; 4 canary structural (partial overlap)
  tests_passing: 42  # Full Phase 3 suite
  tests_failing: 0
  regression_baseline_preserved: true
completed: 2026-04-19
---

# Phase 3 Plan 04: config.json brief.* + Korea-signal + atomic commit Summary

Mode A end-to-end transaction closed — `/brief-define apply` now writes OBJECTIVES.md + config.json `brief.*` + STATE.md via a single atomic `brief-tools commit --files` invocation, with Korea-signal over-suggest bias (ANY signal → PIPA/ISMS-P/MyData; else empty) and deterministic stub-throw rollback verification. The canary structural assertion locks the orchestrator-workers pattern so Phase 5+ can replicate.

## Objective

Complete the Mode A end-to-end transaction started in Plan 02. Plan 02 wrote OBJECTIVES.md via the fixture short-circuit; this plan adds:
1. 4-config inference written to `.planning/config.json` under the `brief.*` namespace per DEF-04 + D-11.
2. Korea-signal keyword regex with over-suggest bias per Pitfall 2 (ANY signal → pre-check PIPA/ISMS-P/MyData; absent signals → `[]`).
3. Atomic 3-artifact commit (OBJECTIVES.md + config.json + STATE.md) via `brief-tools commit --files`; partial write rollback.
4. Canary structural assertion — `tests/brief-define-canary.test.cjs` verifies command → workflow → lib + exported primitives reusable by Phase 5+.
5. Mode A smoke test Cycles 2 + 3 + 4 + 5 (config.json shape, git log file list, frontmatter round-trip, non-Korea fixture → empty compliance_packs).

**Canary purpose:** DEF-04 is the context-injection foundation for every Phase 4+ agent. Korea-signal detection directly mitigates 2026 PIPA / ISMS-P / CEO-personal-liability exposure (Pitfall 2 asymmetric-cost framing). Atomic 3-artifact commit realizes Phase 1 D-09 + Pitfall 3 — a partial write leaves the repo in an inconsistent state that `/brief-discover` block-gate would later misinterpret.

## What Was Built

### `brief/bin/lib/define.cjs` (301 → 450 lines)

Four new exports + one internal helper + one rewrite:

| Export | Role | Signature |
|--------|------|-----------|
| `detectKoreaSignals` | Pitfall 2 over-suggest bias detector | `(transcript: string) → boolean` |
| `writeConfigBrief` | config.json `brief.*` merge writer | `(cwd, payload) → {updated, brief}` |
| `performAtomicCommit` | 3-file `brief-tools commit` dispatcher | `(cwd, mode, summary) → void / throws` |
| `KOREA_SIGNAL_PATTERNS` | Frozen 3-regex array (Hangul / romanized / KR companies) | exported for pilot-refinement visibility |
| `touchStateActivity` | Internal helper — seeds minimal STATE.md if absent, bumps `last_updated` / `last_activity` | NOT exported (internal only) |

**Korea-signal regex (D-11, Pitfall 2):**
- `/[\u3131-\u318E\uAC00-\uD7A3]/` — any Hangul character (primary layer)
- `/\b(Korea|Korean|KR|Seoul|won|PIPA|ISMS|MyData)\b/i` — romanized + regulatory keywords (secondary)
- `/\b(핀테크|카카오|네이버|토스)\b/` — common Korean companies (tertiary)

ANY-layer match → true. Over-suggest bias: English "Kakao" alone returns false by design (boundary case documented in test — pilot feedback in v1.1 may expand Latin-script company list).

**`applyFromFixture` rewritten (B-6 sole-source rule):**
- `inferredCompliance = koreaSignal ? ['PIPA','ISMS-P','MyData'] : []` is the SOLE source for `compliance_packs`.
- `fixture.expected_configs.compliance_packs` is NEVER injected (no `||` override). Tests assert against the fixture's expected value as verification output, not as implementation input.
- Three atomicWriteFileSync calls (OBJECTIVES.md, config.json, STATE.md) land BEFORE `performAtomicCommit`; exception path unlinks partially-written OBJECTIVES.md before re-throwing.
- Dispatch through `module.exports.writeConfigBrief / performAtomicCommit` so the W-2 stub-throw harness can hot-swap primitives via require-cache without re-bundling the module.

**`writeConfigBrief` merge semantics (Shared Pattern 3):**
- Read existing `.planning/config.json` (creates if absent).
- Merge `cfg.brief = { ...cfg.brief, ...payload }` — preserves all non-brief top-level keys (model_profile, commit_docs, workflow, mode, granularity, hooks, git, etc.).
- Write under `withPlanningLock` for serialization against STATE.md writes.
- Emits `atomicWriteFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n', 'utf-8')`.

### `tests/helpers.cjs` (111 → 160 lines)

Two new helpers + one exported constant (B-2/B-3 centralization):

```javascript
const BRIEF_BASELINE_CONFIG = {
  model_profile: 'quality',
  commit_docs: true,
  workflow: { nyquist_validation: true, text_mode: false },
  mode: 'interactive',
  granularity: 'fine',
};

createTempProjectWithConfig(prefix)    // wraps createTempProject + seeds BRIEF_BASELINE_CONFIG
createTempGitProjectWithConfig(prefix) // wraps createTempGitProject + seeds BRIEF_BASELINE_CONFIG + re-commits as "seed config"
```

Every Plan 04 test that asserts on `cfg.model_profile / cfg.workflow / cfg.mode / cfg.granularity` preservation uses one of these helpers — single source of truth prevents the false-red baseline that would come from asserting against an absent key.

### `tests/fixtures/non-korea-b2b-persona.json` (B-6 negative fixture)

Thin B2B SaaS procurement-tool transcript, plain English, zero Korea-signal substrings anywhere in the file (verified via grep):
- `persona_name: "us-east-b2b-saas-planner"`
- `conversation_transcript`: opening + push_twice + language_precision + dream_state × 3, all English
- `expected_configs: {business_model:'b2b', region:'us', audience_policy:'partner', compliance_packs:[]}`

Purity check passed — substring search for `Korea / Korean / Seoul / PIPA / MyData / ISMS / won / 핀테크 / 카카오 / 네이버 / 토스` returns 0 matches; no Hangul in the stringified file.

### Tests Added (16 total, all GREEN)

**`tests/brief-define-korea-signal.test.cjs`** (9 tests):
- Hangul trigger, English "Korea" trigger, PIPA keyword, MyData/ISMS/won/Seoul composite, Korean companies (핀테크/카카오/네이버/토스), Latin-script "Kakao" boundary (false by design), non-Korea English transcript negative, empty/non-string inputs, 3-pattern-export contract.

**`tests/brief-config-brief-namespace.test.cjs`** (4 tests):
- Merge under brief.*, preserves all baseline keys (model_profile/workflow/mode/granularity/commit_docs), second-call compliance_packs override preserves earlier brief.* keys, non-existent config.json creates file with only brief.*, return-shape contract `{updated, brief}`.

**`tests/brief-define-atomic-commit.test.cjs`** (3 tests):
- Positive 3-file commit (direct execFileSync git log with sorted file list).
- W-2 primary deterministic stub-throw — swap `writeConfigBrief` via require-cache + module.exports dispatch, assert OBJECTIVES.md absent + no DEFINE commit on HEAD after throw.
- W-2 secondary chmod opportunistic — probes via atomicWriteFileSync (not writeFileSync) so macOS/Linux parent-writable dirs skip silently; only filesystems that actually deny renameSync-over-readonly run the rollback assertion.

**`tests/brief-define-canary.test.cjs`** (4 structural tests):
- `commands/brief/define.md` references `brief/workflows/define.md`.
- `brief/bin/brief-tools.cjs` contains `case 'define'` + `require('./lib/define.cjs')`.
- `objectives.cjs` exports 5 primitives (writeObjectivesMd / readObjectivesMd / validateObjectivesComplete / checkStaleAnchor / enforceImmutableLock).
- `define.cjs` exports 6 primitives (cmdDefineApply / applyFromFixture / applyModeBAmendment / detectKoreaSignals / writeConfigBrief / performAtomicCommit).

**`tests/brief-define-mode-a.test.cjs`** (Cycles 2+3+4+5 appended):
- Cycle 2 — config.json extended with brief.* keys; other keys preserved.
- Cycle 3 — atomic commit contains exactly 3 planning files (direct `execFileSync('git', ['log','-1','--name-only','--format='], {cwd, encoding:'utf-8'})`).
- Cycle 4 — OBJECTIVES.md frontmatter round-trips via frontmatter.cjs (D-20) without drift.
- Cycle 5 (B-6 negative) — non-Korea fixture produces `cfg.brief.compliance_packs: []`.

## TDD Cycle Compliance

Plan `type: execute` with tasks marked `tdd="true"`:
- **RED (commit `43776e1`)** — all 4 new test files + Mode A Cycles 2+3+4+5 added; `detectKoreaSignals / writeConfigBrief / performAtomicCommit` not yet implemented. Tests fail as expected: TypeError on missing exports, deep-equal mismatch on empty config.brief.
- **GREEN (commit `d5b3550`)** — define.cjs extended + applyFromFixture rewritten + secondary chmod test skip-logic tightened. All 42 Phase 3 tests GREEN.
- **REFACTOR** — not needed; module.exports indirection was the only post-GREEN adjustment (to make W-2 primary deterministic) and it was landed inside the GREEN commit.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Plan 04 unit tests | `node --test tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs` | 13/13 GREEN (~155ms) |
| Plan 04 integration | `node --test tests/brief-define-canary.test.cjs tests/brief-define-mode-a.test.cjs tests/brief-define-atomic-commit.test.cjs` | 12/12 GREEN (~3.1s) |
| Full Phase 3 suite | `node --test tests/brief-define-*.test.cjs tests/brief-objectives-*.test.cjs tests/ask-user-questions-fallback.test.cjs` | 42/42 GREEN (0 fail) |
| B-6 guard | `grep -c "expected.compliance_packs" brief/bin/lib/define.cjs` | 0 (PASS — sole-source rule enforced) |
| B-1 guard | `grep -c "runGsdTools.*shell" tests/brief-define-atomic-commit.test.cjs tests/brief-define-mode-a.test.cjs` | 0 / 0 (PASS — no shell-dispatcher references) |
| B-1 direct exec | `grep -c "execFileSync.*git" tests/brief-define-atomic-commit.test.cjs` | 3 (PASS ≥ 2) |
| VALID_CONFIG_KEYS guard | `grep -c "VALID_CONFIG_KEYS" brief/bin/lib/define.cjs` | 0 (PASS — brief.* does not couple to cmdConfigSet) |
| Zero-runtime-deps (A1) | `grep -E "gray-matter\|require\('ajv'\)\|require\('js-yaml'\)" brief/bin/lib/define.cjs` | no match (PASS) |
| package.json deps | `node -e "Object.keys(require('./package.json').dependencies\|\|{}).length"` | 0 (unchanged) |
| Line count | `wc -l brief/bin/lib/define.cjs` | 450 (plan budget ≤400 exceeded by 50 — deferred per §3 in deferred-items.md) |
| Helpers contract | `node -e "const h=require('./tests/helpers.cjs'); typeof h.createTempProjectWithConfig === 'function' && typeof h.createTempGitProjectWithConfig === 'function'"` | PASS |
| Seed config shape | `node -e "const h=require('./tests/helpers.cjs'); const t=h.createTempProjectWithConfig(); const c=JSON.parse(require('fs').readFileSync(require('path').join(t,'.planning/config.json'),'utf-8')); h.cleanup(t); c.model_profile==='quality' && c.workflow.nyquist_validation===true"` | PASS |
| Define exports contract | `node -e "const d=require('./brief/bin/lib/define.cjs'); ['cmdDefineApply','applyFromFixture','applyModeBAmendment','detectKoreaSignals','writeConfigBrief','performAtomicCommit'].every(fn=>typeof d[fn]==='function') && d.KOREA_SIGNAL_PATTERNS.length===3"` | PASS |
| Non-Korea fixture purity | grep for `Korea / Korean / Seoul / PIPA / MyData / ISMS / 핀테크 / 카카오 / 네이버 / 토스` substrings | 0 matches; 0 Hangul (PASS) |

## Deviations from Plan

### Rule 3 — module.exports dispatch indirection added to applyFromFixture

**Found during:** Task 2 verification (W-2 primary stub-throw test initially failed — stubbed `define.writeConfigBrief` was not exercised because `applyFromFixture` used the lexical closure binding).
**Issue:** Setting `define.writeConfigBrief = stub` on the exported object had no effect on the implementation — the `applyFromFixture` function captured the original binding at module-load time.
**Fix:** Changed two call sites inside `applyFromFixture` to dispatch through `module.exports.writeConfigBrief` / `module.exports.performAtomicCommit` with a fallback to the lexical binding: `(module.exports.writeConfigBrief || writeConfigBrief)(cwd, ...)`. This preserves default behavior AND allows test-time stubbing via require-cache property mutation.
**Files modified:** `brief/bin/lib/define.cjs` (applyFromFixture body — 2 call-site changes).
**Impact:** W-2 primary now deterministic. No behavior change to production paths.

### Rule 3 — W-2 secondary chmod skip logic tightened

**Found during:** Task 2 verification (initial secondary test assertion `apply should fail when config.json is read-only` failed on macOS).
**Issue:** The initial skip logic probed via `fs.writeFileSync` — which IS denied by chmod 0o444 on macOS — but `atomicWriteFileSync` uses `renameSync` which succeeds over a readonly target when the parent dir is writable. So the probe correctly detected "writeFileSync denied" (writeable=false, proceed to apply) but `atomicWriteFileSync` then succeeded and apply returned `success:true`.
**Fix:** Switched the probe to use `atomicWriteFileSync` directly — the same primitive the runtime uses. Now macOS/Linux parent-writable dirs exit early and skip silently; only filesystems that genuinely deny rename-over-readonly run the rollback assertion.
**Rationale:** Rule 3 — the W-2 primary is the deterministic guarantor; the secondary exists as a real-filesystem backstop that should skip gracefully when inapplicable, not false-fail.
**Files modified:** `tests/brief-define-atomic-commit.test.cjs` (W-2 secondary test only).

### Rule 2 — touchStateActivity auto-seeds STATE.md when absent

**Found during:** Task 2 verification (first Cycle 3 atomic-commit test failed — `git log --name-only` returned only `.planning/config.json` because the fresh temp project had no STATE.md for `brief-tools commit --files .planning/OBJECTIVES.md .planning/config.json .planning/STATE.md` to stage).
**Issue:** The plan's `performAtomicCommit` spec lists 3 files unconditionally, but on first-run greenfield there is no STATE.md (createTempGitProjectWithConfig seeds PROJECT.md + config.json but not STATE.md). Without a third leg the commit only contains 2 files.
**Fix:** `touchStateActivity` now seeds a minimal 4-line STATE.md (frontmatter + `# STATE` heading) if absent, then splices `last_updated` / `last_activity` frontmatter fields. Seeded file is written via `atomicWriteFileSync` inside the same lock envelope.
**Rationale:** Rule 2 — the 3-file atomic-commit contract is a Phase 3 success criterion; an absent STATE.md silently breaks Cycle 3 atomicity. Seeding is correctness, not scope creep.
**Files modified:** `brief/bin/lib/define.cjs` (touchStateActivity body).

## Threat Model Coverage

Per `<threat_model>` in PLAN.md:

- **T-03-04 (mitigate):** Fixture path traversal via `--fixture ../../../etc/passwd` — MITIGATED. `applyFromFixture` rejects fixture names containing `..`/`/`/`\` BEFORE `path.resolve`; all lookups confined to `tests/fixtures/` via `path.resolve(__dirname, '..', '..', '..', 'tests', 'fixtures', fixtureName)`. Plan 02 Test already asserted this; Plan 04 preserves the guard verbatim.
- **T-03-09 (mitigate):** config.json overwrite wipes user's other keys — MITIGATED. `writeConfigBrief` reads-then-merges under `withPlanningLock`; Shared Pattern 3 preserves all non-brief keys. `tests/brief-config-brief-namespace.test.cjs` Cycle 1 asserts every baseline key (model_profile, workflow.*, mode, granularity, commit_docs) survives the merge.
- **T-03-10 (mitigate):** Partial-write leaves repo in inconsistent state — MITIGATED. `applyFromFixture` issues three `atomicWriteFileSync` calls BEFORE `performAtomicCommit`; on any intermediate exception the `objWritten` flag drives `fs.unlinkSync(OBJECTIVES.md)` before re-throwing. W-2 primary deterministic stub-throw test verifies: `OBJECTIVES.md` absent + HEAD unchanged (no DEFINE commit) after injected `SIMULATED_CONFIG_WRITE_FAILURE`.

No new trust boundaries or threat surface introduced beyond PLAN.md specification.

## Commits

| Task | Commit | Type | Message |
|------|--------|------|---------|
| RED | `43776e1` | test | add failing tests for Korea-signal + config.json brief.* + atomic commit + canary |
| GREEN | `d5b3550` | feat | implement Korea-signal + config.json brief.* + atomic 3-file commit |
| DOCS | `a01c5ea` | docs | record define.cjs 450-line budget overshoot as deferred |

All three commits are atomic and each represents a valid intermediate state:
- `43776e1` (RED) — 4 new test files + helpers + non-Korea fixture land; Plan 04 tests correctly RED (missing exports, empty config.brief); all prior Phase 3 tests unaffected.
- `d5b3550` (GREEN) — define.cjs + helpers complete the contract; 42/42 Phase 3 tests GREEN; module.exports dispatch indirection lands for W-2 primary determinism.
- `a01c5ea` (DOCS) — deferred-items.md records the 50-line budget overshoot; no code change.

## Success Criteria Compliance

1. ✅ DEF-04: 4 configs (business_model/region/audience_policy/compliance_packs) round-trip through `.planning/config.json` `brief.*` namespace preserving all other keys — verified by `tests/brief-config-brief-namespace.test.cjs` (4/4 GREEN) AND `tests/brief-define-mode-a.test.cjs` Cycle 2.
2. ✅ D-11 Korea-first policy: `compliance_packs` pre-checked with `['PIPA','ISMS-P','MyData']` ONLY when Korea signals detected in transcript; absent signals → `[]` — enforced via B-6 sole-source rule (inferredCompliance is the only source; fixture.expected_configs.compliance_packs never injected). Verified by Cycles 2 (Korea positive) + 5 (non-Korea negative).
3. ✅ Pitfall 3 mitigation: atomic 3-artifact commit verifiable by direct `execFileSync('git', ['log','-1','--name-only','--format='])` — Cycle 3 + atomic-commit positive test both GREEN; partial-failure rollback prevents orphan OBJECTIVES.md — W-2 primary deterministic stub-throw GREEN; W-2 secondary chmod opportunistic (skips on macOS parent-writable dirs).
4. ✅ Canary property: `/brief-define` writes OBJECTIVES.md via the same command → workflow → lib split Phase 5+ will reuse — `tests/brief-define-canary.test.cjs` locks the 4 structural assertions (4/4 GREEN).
5. ✅ W-4 serialization held: Plan 04 ran after Plan 03 (single worktree; no parallel-execution hazard on `module.exports`); scope stayed within a single plan's context budget.

## Known Stubs

None. All 6 primitives are fully implemented; no TODO/FIXME/placeholder strings in shipped code. The `runInteractiveModeA` stub from Plan 02 remains intentional — the workflow markdown orchestrates the interactive conversation via AskUserQuestion; Plan 04's scope is the fixture + production-lib primitives, not interactive-driver wiring.

## Deferred Issues

- **define.cjs line budget (450 vs ≤400):** Recorded in `deferred-items.md` §3. 50-line overshoot is JSDoc + guarded error paths, not logic density. Recommended future resolution: factor `writeConfigBrief` / `performAtomicCommit` / `touchStateActivity` into `brief/bin/lib/define-commit.cjs` during a later Phase 3 polish pass.

## Handoff Notes for Plan 03-05+

- **Plan 03-05 (block-gate on /brief-discover):** `config.brief.*` namespace is now populated by every `/brief-define apply` run. Block-gate can read `config.brief.region` / `config.brief.compliance_packs` to shape its Korean error message (e.g., "Korea 프로젝트인데 compliance_packs가 비어 있습니다"). The block-gate should still primarily rely on `objectives.validateObjectivesComplete(cwd)` for field-presence checks; config.json is a secondary signal.
- **Plan 03-06 (stale-anchor):** `applyFromFixture` touches STATE.md `last_updated` / `last_activity` frontmatter on every apply — the stale-anchor 48h check via `objectives.checkStaleAnchor(cwd)` will observe these mtime bumps correctly.
- **Plan 04 ALIGN gate (Phase 4):** Read `.planning/config.json` `.brief` map to know the region / audience_policy / compliance_packs posture the DEFINE phase inferred. `.brief.compliance_packs: []` combined with Korean content in OBJECTIVES.md body is a valid ALIGN finding ("Korea signals present but compliance_packs empty — did user deliberately unselect?").
- **Phase 5+ workstream agents:** The orchestrator-workers canary is locked structurally via `tests/brief-define-canary.test.cjs`. Phase 5+ can replicate the pattern (command.md → workflow.md → lib.cjs + `require('./lib/<name>.cjs')` dispatch in brief-tools.cjs) confidently.

## Self-Check: PASSED

Verified after SUMMARY.md write:

**Created files exist:**
- ✅ `tests/brief-define-korea-signal.test.cjs`
- ✅ `tests/brief-config-brief-namespace.test.cjs`
- ✅ `tests/brief-define-atomic-commit.test.cjs`
- ✅ `tests/brief-define-canary.test.cjs`
- ✅ `tests/fixtures/non-korea-b2b-persona.json`

**Modified files in expected shape:**
- ✅ `brief/bin/lib/define.cjs` — 450 lines; exports `detectKoreaSignals`, `writeConfigBrief`, `performAtomicCommit`, `KOREA_SIGNAL_PATTERNS` in addition to prior Plan 02/03 exports; `grep -c "expected.compliance_packs"` = 0.
- ✅ `tests/helpers.cjs` — 160 lines; exports `createTempProjectWithConfig`, `createTempGitProjectWithConfig`, `BRIEF_BASELINE_CONFIG`.
- ✅ `tests/brief-define-mode-a.test.cjs` — 208 lines; Cycles 2+3+4+5 describe block appended.
- ✅ `.planning/phases/03-define-canary-phase-0-end-to-end/deferred-items.md` — 81 lines; Item 3 (define.cjs budget overshoot) appended.

**Commits exist (`git log --oneline`):**
- ✅ `43776e1` — test(03-04): add failing tests for Korea-signal + config.json brief.* + atomic commit + canary
- ✅ `d5b3550` — feat(03-04): implement Korea-signal + config.json brief.* + atomic 3-file commit
- ✅ `a01c5ea` — docs(03-04): record define.cjs 450-line budget overshoot as deferred

**Tests GREEN:** 42/42 (full Phase 3 suite) — no regression on Plans 01/02/03.
