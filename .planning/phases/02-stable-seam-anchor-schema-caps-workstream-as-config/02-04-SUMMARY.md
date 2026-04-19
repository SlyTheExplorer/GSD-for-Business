---
phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
plan: 04
subsystem: state-persistence
tags: [FND-05, D-01, D-02, D-03, D-21, A4-VERIFIED, state-brief, round-trip]
requires:
  - 02-01   # D-20 frontmatter.cjs recursive serializer + null preservation
  - 02-03   # brief_state_version rename (atomic, clean STATE.md baseline)
provides:
  - state.brief.*-nested-map (D-02 encoding + D-03 schema)
  - cmdStateJson-preserves-brief (D-21 allowlist extension)
  - syncStateFrontmatter-preserves-brief (D-21 allowlist mirror)
  - A4-VERIFIED-in-ASSUMPTIONS.md
  - Phase-4/5/6/7-unblocked-for-brief-writes
affects:
  - brief/bin/lib/state.cjs
  - .planning/STATE.md
  - .planning/ASSUMPTIONS.md
  - tests/state-brief-roundtrip.test.cjs
tech_stack:
  added: []
  patterns:
    - allowlist-preservation-in-cmdStateJson-and-syncStateFrontmatter
    - node:test-round-trip-smoke-with-runGsdTools-cycle
    - RED-before-GREEN TDD on state.cjs preservation paths
key_files:
  created:
    - tests/state-brief-roundtrip.test.cjs
  modified:
    - brief/bin/lib/state.cjs
    - .planning/STATE.md
    - .planning/ASSUMPTIONS.md
key_decisions:
  - D-21 결정 (load-bearing): cmdStateJson + syncStateFrontmatter의 preservation allowlist를 4번째 브랜치로 확장해 `existingFm.brief`만 정확히 통과시킨다. Object.keys 전면 확장은 거부 — stale frontmatter 누수 위험.
  - D-03 placeholder shape 초기화를 Phase 2에서 먼저 심는다(Phase 3로 미루지 않음) — /brief-status가 첫 render부터 missing-map warning 없이 동작하도록.
  - D-20의 scalar-type contract(모든 non-null non-array scalar leaf은 string으로 round-trip) 준수 — fixture의 findings_count를 '0' (string)으로 유지해 `tests/frontmatter-roundtrip.test.cjs:20-27` 문서 계약과 일치.
  - D-05 sidecar path 최종 SUPERSEDED 확정 — D-20 + D-21 조합이 round-trip 결함을 in-place에서 완전히 닫았음을 ASSUMPTIONS.md A4 entry에 기록.
metrics:
  duration_seconds: 611
  duration_human: "10m 11s"
  completed_tasks: 3
  completed_at: "2026-04-19T01:25:07Z"
  npm_test_failures_pre: 63
  npm_test_failures_post: 63
  delta_cap_preserved: true
---

# Phase 2 Plan 04: state.brief.* schema + A4 smoke test + ASSUMPTIONS.md Summary

## 한 줄 요약

FND-05의 마지막 결정 gate — `state.cjs` round-trip이 `state.brief.*` 네스티드 맵을 무손실 보존함을 3-cycle 스모크 테스트(writeStateMd 메모리 → 디스크 → `state json` CLI)로 검증했고, D-21 allowlist extension 2군데(`cmdStateJson` + `syncStateFrontmatter`)가 live. D-05 sidecar path는 공식적으로 SUPERSEDED, Phase 4/5/6/7 writer들이 `brief.*` 필드에 직접 쓸 수 있는 상태가 되었다.

## 완료된 작업 (3/3)

### Task 1 — RED 테스트 파일 생성 (commit `4ac7f94`)

`tests/state-brief-roundtrip.test.cjs` 신규 생성 (330 lines). 4개 테스트 케이스:

1. **Cycle 1** — `writeStateMd` 로 D-03 payload 전체 형태(array-of-objects `return_stack`/`gap_queue`, nested-object-leaf `last_gate_results.align` with decision/severity/findings_count/at, null leaves `audience`/`compliance`, scalar `current_workstream: 'bmc'`) 주입 후 `extractFrontmatter`로 읽어 `assert.deepStrictEqual` 비교.
2. **Cycle 2** — Cycle 1 이후 디스크에서 다시 읽어 `writeStateMd` 재호출, drift 없이 `fm2.brief === fm1.brief` 유지.
3. **Cycle 3 (R-5 stronger test)** — `runGsdTools(['state', 'json'], tmpDir)`를 통해 production CLI를 실제로 invoke하고 parsed JSON의 `brief` 필드 검증. D-21 allowlist extension이 없으면 여기서 silent drop 발견.
4. **Placeholder** — Phase 2 초기 상태(모두 empty/null) fixture가 정상 round-trip.

**RED 확인:** commit 시점에 Cycle 1 / Cycle 3 / Placeholder fail — TDD driver로 의도된 상태. Cycle 2는 trivially pass (both undefined). state / frontmatter / frontmatter-roundtrip 기존 suite 영향 없음 (green 유지).

### Task 2 — D-21 allowlist 확장 + STATE.md brief: 맵 초기화 (commit `03c5e6b`)

3개의 coordinated edit:

1. **`brief/bin/lib/state.cjs` `syncStateFrontmatter` (line ~870)** — `existingFm.brief` preservation 4번째 branch 추가. `buildStateFrontmatter`가 body+disk에서 frontmatter를 재구성할 때 `brief:` 맵을 보존하지 않던 defect을 닫음.
2. **`brief/bin/lib/state.cjs` `cmdStateJson` (line ~994)** — 동일 preservation pattern을 rebuild-from-body 경로에도 추가. 이 엣지가 바로 02-RESEARCH.md R-5 "stronger A4 test"가 지적한 load-bearing 지점.
3. **`.planning/STATE.md` frontmatter** — `progress:` block 아래, 닫는 `---` 바로 위에 D-03 placeholder nested map 삽입:
   ```yaml
   brief:
     return_stack: []
     gap_queue: []
     last_gate_results:
       align: null
       audience: null
       compliance: null
     current_workstream: null
   ```

**사이드 수정:** Task 1 fixture의 `findings_count: 0` (integer)를 `'0'` (string)으로 교정. D-20 scalar-type contract(`tests/frontmatter-roundtrip.test.cjs:20-27`) 문서에 명시된 "scalar leaves round-trip as strings" 규약과 일치시킴. 이는 Plan 02-01의 설계 범위 내 행동이며 Plan 02-04 스코프 밖 parser 변경이 아님.

**검증 결과:**
- `node --test tests/state-brief-roundtrip.test.cjs` → 4 pass / 0 fail
- `node --test tests/state.test.cjs` → green (regression 없음)
- `node --test tests/frontmatter.test.cjs` → green
- `node --test tests/frontmatter-roundtrip.test.cjs` → green
- `node brief/bin/brief-tools.cjs state json | jq .brief` → D-03 placeholder shape 그대로 보존
- `npm test 2>&1 | grep -cE '^✖'` → 63 (pre-plan baseline과 동일; delta-cap 유지)

### Task 3 — ASSUMPTIONS.md에 A4 VERIFIED 기록 (commit `b275c1d`)

`.planning/ASSUMPTIONS.md` 끝에 `## Phase 2 Verifications` 신규 H2 섹션 + `### A4 — STATE.md round-trips state.brief.* without loss — VERIFIED` H3 entry 52줄 추가. 포함 내용:

- **Status:** VERIFIED
- **Timestamp:** 2026-04-19T01:22:55Z (UTC ISO-8601)
- **Phase:** 02-stable-seam-anchor-schema-caps-workstream-as-config
- **Requirement:** FND-05 (ROADMAP.md Success Criterion #1 for Phase 2)
- **Verification source:** `tests/state-brief-roundtrip.test.cjs`
- **Coverage bullet:** array-of-objects / nested-object leaves / null leaves / scalar / placeholder 각각에 대한 설명 + D-20 scalar-type contract 주석
- **Verification command / Expected / Actual output:** `ℹ tests 4 / pass 4 / fail 0 / cancelled 0 / skipped 0`
- **Implication:** D-05 sidecar path SUPERSEDED, in-place fix via D-20 + D-21
- **R-5 stronger-test compliance 설명:** Cycle 3 가 production CLI를 invoke해서 cmdStateJson path를 실제로 exercise
- **Downstream unblock:** Phase 4 (ALIGN), Phase 5 (AUDIENCE), Phase 6 (Return Stack + gap queue), Phase 7 (COMPLIANCE + workstream selection) 각각이 brief.* 필드에 쓸 수 있음
- **Risk if regression:** Cycle 3 가 regression guard 역할 — preservation branch가 좁혀지거나 제거되면 loud fail
- **Commit chain:** Plan 02-01 (eccd94f) + Plan 02-04 Task 1 (4ac7f94) + Plan 02-04 Task 2 (03c5e6b)

## state.cjs Diff 요약 (2 preservation branches 추가)

**`syncStateFrontmatter` (line ~866-875, +7 lines):**
```javascript
  // Preserve brief:* namespaced map across write cycles (buildStateFrontmatter
  // doesn't regenerate it). Per Phase 2 D-21 — paired with the cmdStateJson
  // allowlist extension below. Without this, the `brief:` map is silently
  // dropped on every STATE.md write.
  if (existingFm && existingFm.brief) {
    derivedFm.brief = existingFm.brief;
  }
```

**`cmdStateJson` (line ~990-998, +7 lines):**
```javascript
  // Preserve the brief:* namespaced map (cannot be recovered from body).
  // Per Phase 2 D-21 — without this, the brief: map is silently dropped on
  // `state json` rebuild because buildStateFrontmatter doesn't regenerate it
  // (R-5: 02-RESEARCH.md). Paired with the syncStateFrontmatter mirror above.
  if (existingFm && existingFm.brief) {
    built.brief = existingFm.brief;
  }
```

Allowlist는 `brief:` key 하나만 넓힘 — `Object.keys(existingFm)` 전면 확장은 명시적으로 거부(stale-frontmatter 누수 방지).

## STATE.md Frontmatter Diff 요약

**Before (Plan 02-03 landing 이후):**
```yaml
---
brief_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Phase 2 context gathered (delegated mode)
last_updated: "2026-04-19T00:40:14.019Z"
last_activity: 2026-04-19 -- Phase 2 execution started
progress:
  total_phases: 9
  completed_phases: 1
  total_plans: 15
  completed_plans: 10
  percent: 67
---
```

**After (Plan 02-04 Task 2 이후, +7 lines):**
```yaml
---
brief_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Phase 2 context gathered (delegated mode)
last_updated: "2026-04-19T00:40:14.019Z"
last_activity: 2026-04-19 -- Phase 2 execution started
progress:
  total_phases: 9
  completed_phases: 1
  total_plans: 15
  completed_plans: 10
  percent: 67
brief:
  return_stack: []
  gap_queue: []
  last_gate_results:
    align: null
    audience: null
    compliance: null
  current_workstream: null
---
```

본문(Project State / Current Position / ...)은 변경 없음. 오케스트레이터 관리 필드(Status / Position / progress counter / Last Activity) 전부 touch 안 함 — Edit 3의 carve-out 범위가 frontmatter `brief:` 맵 1종 초기화 seeding으로 제한됨을 준수.

## ASSUMPTIONS.md A4 Entry — Actual Test Output

```
ℹ tests 4
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

(Cycle 1 / Cycle 2 / Cycle 3 / Placeholder 모두 green. duration ≈ 209ms)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Fixture-contract bug] `findings_count` fixture 값이 integer로 선언돼 D-20 scalar-type contract와 불일치**

- **Found during:** Task 2 verification run (post-edit 1차 테스트)
- **Issue:** Task 1 plan PATTERNS §112-124 spec이 `findings_count: 0` (integer)로 적힌 것을 그대로 따라갔으나, 실제 D-20 contract(`tests/frontmatter-roundtrip.test.cjs:20-27` 문서)는 "scalar leaves round-trip as strings"를 명시. `extractFrontmatter`가 nested map의 integer literal `0`을 string `'0'`으로 parse해서 반환.
- **Fix:** `tests/state-brief-roundtrip.test.cjs` Cycle 1 assertion을 `findings_count: 0` → `findings_count: '0'`로 교정 + 8줄 주석 추가해서 D-20 contract 참조. Task 2 commit에 묶어서 원자적으로 landed (분리했다면 intermediate state에서 fail).
- **Files modified:** `tests/state-brief-roundtrip.test.cjs` (commit `03c5e6b`에 포함)
- **Rule:** Rule 1 (버그 수정). Plan 02-01의 문서화된 contract가 source-of-truth이며, Plan 02-04 fixture는 그것에 맞춰야 한다는 판단. D-20의 scalar coercion 부재는 Plan 02-04 스코프 밖 (frontmatter.cjs 파서의 별도 property이며 Plan 02-01에서 의도적으로 범위 밖으로 남긴 결정).

### No Other Deviations

- Task 1의 Cycle 1 & Placeholder RED는 plan의 `<done>` 블록이 "Test 1/2/4 MAY pass already" 라고 약한 표현을 썼으나 실제로는 fail 했음 — 이는 plan 예측이 optimistic이었을 뿐 bug 는 아님 (Plan 02-01은 `writeStateMd`가 아니라 `reconstructFrontmatter` 순수 호출만 검증했기 때문에 `syncStateFrontmatter`가 덮어쓰는 production path에서의 drop을 catch할 수 없었음). RED 확인은 plan의 `<verify>` automated check(`grep -qE "fail|not ok"`)를 그대로 만족시켰고, Task 2에서 모두 GREEN으로 전환됐다. 즉, plan의 의도 — 'Cycle 3 RED 이 TDD driver' — 는 그대로 유지됐고 추가로 Cycle 1/Placeholder까지 포함돼 더 강한 RED 조건으로 작동했다. 이는 plan 사양의 해석을 유지하며 deviation으로 분류하지 않는다.

### Authentication Gates

없음. All tasks fully automated (local filesystem + node:test + node CLI only).

## Pre/Post Metrics

| 지표 | Pre-plan | Post-plan | 델타 |
|------|----------|-----------|------|
| npm test failure count | 63 | 63 | 0 (delta-cap 유지) |
| `tests/state-brief-roundtrip.test.cjs` pass/fail | N/A (file didn't exist) | 4 / 0 | +4 passing tests |
| `.planning/ASSUMPTIONS.md` H3 section count | 4 | 5 | +1 (A4) |
| `.planning/STATE.md` frontmatter line count | 14 | 21 | +7 (brief: map) |
| `brief/bin/lib/state.cjs` `existingFm.brief` references | 0 | 2 | +2 (syncStateFrontmatter + cmdStateJson) |
| H2 sections in ASSUMPTIONS.md | 1 (Phase 1) | 2 (+ Phase 2 Verifications) | +1 |

## Commits

| Task | Hash | Type | Message |
|------|------|------|---------|
| 1 | `4ac7f94` | test | add state-brief-roundtrip RED test (Cycle 3 RED for R-5 allowlist gap) |
| 2 | `03c5e6b` | feat | extend cmdStateJson + syncStateFrontmatter allowlist; initialize state.brief.* in STATE.md (D-01/D-02/D-03/D-21) |
| 3 | `b275c1d` | docs | record A4 VERIFIED in ASSUMPTIONS.md |

## Threat Register — Disposition

| Threat ID | Category | Disposition | Evidence |
|-----------|----------|-------------|----------|
| T-02-04-01 | Tampering (preservation allowlist) | **mitigated** | 2개 branch (`syncStateFrontmatter` + `cmdStateJson`) 모두 `existingFm.brief`로 좁게 스코프 — Object.keys 확장 아님. `grep -c "existingFm.brief" brief/bin/lib/state.cjs` = 4 (2개 조건 + 2개 assignment). |
| T-02-04-02 | Tampering (smoke test fixture coverage) | **mitigated** | fixture에 array-of-objects, nested-object-leaf, null leaf, scalar, placeholder 5종 형태 모두 포함. Cycle 3가 CLI path 실제 invoke. |
| T-02-04-03 | Repudiation (A4 VERIFIED 조기 선언) | **mitigated** | Task 3 는 Task 2 tests green 이후에만 commit. Actual test output(`ℹ tests 4 / pass 4 / fail 0`)이 entry 에 literal로 캡처됨. Timestamp는 `date -u +"%Y-%m-%dT%H:%M:%SZ"` 결과를 직접 인라인. |

## Threat Flags

없음. 이 plan은 state.cjs의 preservation 경로만 좁게 확장했을 뿐 새로운 network/auth/file-access/schema-at-trust-boundary 도입 없음. STATE.md는 first-party local filesystem artifact 그대로.

## Known Stubs

없음. Brief 맵의 placeholder null/empty 값은 D-03 sche에서 명시된 shape 전달이며(Phase 2 delivered), Phase 4/5/6/7이 populate하도록 의도된 forward-declared schema. 이는 stub이 아니라 설계된 contract.

## Self-Check: PASSED

### Files verified

```
[ -f "tests/state-brief-roundtrip.test.cjs" ] → FOUND
[ -f ".planning/STATE.md" ] → FOUND (with brief: nested map)
[ -f ".planning/ASSUMPTIONS.md" ] → FOUND (with A4 VERIFIED)
[ -f "brief/bin/lib/state.cjs" ] → FOUND (with 2 brief: preservation branches)
```

### Commits verified

```
git log --oneline | grep 4ac7f94 → FOUND
git log --oneline | grep 03c5e6b → FOUND
git log --oneline | grep b275c1d → FOUND
```

### Acceptance contracts verified

- `node --test tests/state-brief-roundtrip.test.cjs` → 4/4 pass
- `grep -c "existingFm.brief" brief/bin/lib/state.cjs` ≥ 2 → 4 references (condition + assignment at each site)
- `grep -q "^brief:$" .planning/STATE.md` → OK
- `grep -qE "^\s*align: null$" .planning/STATE.md` → OK
- `grep -q "^### A4 —" .planning/ASSUMPTIONS.md` → OK
- `grep -q "^## Phase 2 Verifications" .planning/ASSUMPTIONS.md` → OK
- npm test failure count ≤ 63 → 63 (exact baseline)

---

**FND-05 closure:** D-20 (Plan 02-01) + D-21 (this plan) + A4 VERIFIED (this plan) = FND-05의 stable-seam 합의 완성. Phase 4 이후 ALIGN/AUDIENCE/COMPLIANCE/Return-Stack writer들은 이제 re-litigate할 필요 없이 `state.brief.*` namespace에 직접 쓸 수 있다.
