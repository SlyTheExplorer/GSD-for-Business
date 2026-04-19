---
phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
plan: 03
subsystem: state-anchor
type: execute
tags:
  - rename
  - atomic-commit
  - d-04
  - brief_state_version
  - phase-1-residue-closure
  - fnd-05-prerequisite
dependency_graph:
  requires:
    - 02-01 (frontmatter.cjs D-20 extension — already merged Wave 1)
  provides:
    - brief_state_version 명시자 (모든 live source에서 gsd_state_version 제거)
    - Plan 02-04가 build할 수 있는 `brief:` 중첩맵 준비의 사전조건
    - Phase 9 HRD-05 소스 드리프트 잔여 항목 1건 감소
  affects:
    - brief/bin/lib/state.cjs (buildStateFrontmatter 쓰기 경로)
    - .planning/STATE.md (frontmatter 앵커 버전 필드)
    - tests/state.test.cjs (5개 assertion line)
tech_stack:
  added: []
  patterns:
    - "원자적 커밋(Phase 1 D-09 계승): 7개 수정이 한 커밋에 묶여 delta-cap을 보존"
    - "별칭 금지(Phase 1 D-07 계승): gsd_state_version 호환 reader 추가하지 않음"
key_files:
  created: []
  modified:
    - brief/bin/lib/state.cjs
    - tests/state.test.cjs
    - .planning/STATE.md
decisions:
  - D-04 (Phase 2 CONTEXT.md §Implementation Decisions): gsd_state_version → brief_state_version 원샷 rename; 백워드 호환 reader 없음; 동일 원자 커밋에서 STATE.md 마이그레이션
  - D-07 계승(Phase 1): 별칭/shim 금지 — 본 Plan에서 재확인
  - D-09 계승(Phase 1): 원자적 buildable 커밋 — 본 Plan에서 재확인
  - 02-PATTERNS.md §908 수정 반영: 테스트 assertion 라인 수는 RESEARCH.md R-3이 undercount한 4가 아닌 5 (350, 365, 382, 442, **1725**)
metrics:
  duration: "~7분 (읽기 + 편집 + 검증 + 커밋)"
  completed: 2026-04-18
requirements:
  - FND-05 (사전조건; Plan 02-04에서 `brief:` 맵 초기화와 함께 FND-05를 완결)
---

# Phase 2 Plan 03: D-04 원자적 rename Summary

`gsd_state_version` → `brief_state_version` 이름 변경을 live source의 7개 사이트 전체에서 단일 원자 커밋으로 수행하여 Phase 1 HALT-ACCEPTED 잔여 드리프트 항목 1건을 닫고 Plan 02-04의 `brief:` 중첩맵 초기화 사전조건을 확보함.

## Objective 달성

단일 커밋(`cf614b5`)으로 `brief/bin/lib/state.cjs` 쓰기 사이트 1곳, `.planning/STATE.md` 프론트매터 1곳, `tests/state.test.cjs`의 assertion/fixture 5곳을 동시에 `brief_state_version`으로 rename. 중간 상태가 존재하지 않아 delta-cap(63 failures) 위반 위험이 원천 차단됨.

## 실행 결과

### 완료된 Task

| Task | 이름 | Commit | Files |
| ---- | ----------- | ------ | ---------------------------- |
| 1 | D-04 원자적 rename (7개 사이트) | `cf614b5` | brief/bin/lib/state.cjs, tests/state.test.cjs, .planning/STATE.md |

### 7개 수정 위치 — old/new snippet

**Edit 1 — `brief/bin/lib/state.cjs:814`**
```diff
-  const fm = { gsd_state_version: '1.0' };
+  const fm = { brief_state_version: '1.0' };
```

**Edit 2 — `.planning/STATE.md:2`**
```diff
-gsd_state_version: 1.0
+brief_state_version: 1.0
```

**Edit 3 — `tests/state.test.cjs:350`**
```diff
-    assert.strictEqual(output.gsd_state_version, '1.0', 'should have version 1.0');
+    assert.strictEqual(output.brief_state_version, '1.0', 'should have version 1.0');
```

**Edit 4 — `tests/state.test.cjs:365`** (템플릿 리터럴 안 fixture YAML)
```diff
-gsd_state_version: 1.0
+brief_state_version: 1.0
```

**Edit 5 — `tests/state.test.cjs:382`**
```diff
-    assert.strictEqual(output.gsd_state_version, '1.0', 'version from frontmatter');
+    assert.strictEqual(output.brief_state_version, '1.0', 'version from frontmatter');
```

**Edit 6 — `tests/state.test.cjs:442`**
```diff
-    assert.ok(content.includes('gsd_state_version: 1.0'), 'should have version field');
+    assert.ok(content.includes('brief_state_version: 1.0'), 'should have version field');
```

**Edit 7 — `tests/state.test.cjs:1725`** (템플릿 리터럴 안 fixture YAML; `'1.0'` 따옴표 주의)
```diff
-      `---\ngsd_state_version: '1.0'\nstatus: executing\n...
+      `---\nbrief_state_version: '1.0'\nstatus: executing\n...
```

## 검증 증거

### 사전 grep gate (pre-edit)

```
$ grep -rn "gsd_state_version" brief/ tests/ .planning/STATE.md
brief/bin/lib/state.cjs:814:  const fm = { gsd_state_version: '1.0' };
tests/state.test.cjs:350:    assert.strictEqual(output.gsd_state_version, '1.0', ...);
tests/state.test.cjs:365:gsd_state_version: 1.0
tests/state.test.cjs:382:    assert.strictEqual(output.gsd_state_version, '1.0', ...);
tests/state.test.cjs:442:    assert.ok(content.includes('gsd_state_version: 1.0'), ...);
tests/state.test.cjs:1725:      `---\ngsd_state_version: '1.0'\n...
.planning/STATE.md:2:gsd_state_version: 1.0
---COUNT--- 7
```

**기대 7건 = 실제 7건** — research snapshot 이후 드리프트 없음 확인.

### 사후 grep gate (post-edit, pre-commit)

```
$ grep -rn "gsd_state_version" brief/ tests/ .planning/STATE.md
(empty — exit 0 but no matches)
```

`gsd_state_version` 리터럴이 live source에서 **0건** 남음.

### 사후 확인 — `brief_state_version` 치환 확인

```
brief/bin/lib/state.cjs:814:  const fm = { brief_state_version: '1.0' };
tests/state.test.cjs:350, 365, 382, 442, 1725 (5건 치환)
.planning/STATE.md:2:brief_state_version: 1.0
```

### 테스트 결과

- **`node --test tests/state.test.cjs`**: 93/93 pass (fail 0)
- **`node --test tests/frontmatter.test.cjs`**: 41/41 pass (Plan 02-01 보존 확인)
- **STATE.md 라운드트립**: `extractFrontmatter('.planning/STATE.md').brief_state_version === '1.0'` OK; `.gsd_state_version === undefined` 확인

### Delta-cap guard (pre-commit = post-commit)

| 측정 시점 | Failure count | Baseline | 결과 |
| --------- | ------------- | -------- | ---- |
| Pre-edit (이번 Plan 시작 직전) | 63 | 63 | 기준선 일치 |
| Post-commit (이 커밋 이후) | **63** | 63 | **PASS (delta = 0)** |

Phase 1 HALT-ACCEPTED baseline이 정확히 보존됨. 이 rename은 이미 설계상 통과하던 5개 state-test assertion의 기대값만 바꾸고, state.cjs 쓰기 결과도 동시에 바꾸어 "assertions still pass against the renamed write"라는 대칭을 유지함.

## Acceptance Criteria 체크

- [x] ZERO `gsd_state_version` literals remain in live source (`brief/`, `tests/`, `.planning/STATE.md`)
- [x] `.planning/STATE.md:2` == `brief_state_version: 1.0`
- [x] `brief/bin/lib/state.cjs` writes `brief_state_version: '1.0'`
- [x] 5 test-assertion lines updated (350, 365, 382, 442, 1725)
- [x] `tests/state.test.cjs`에 `gsd_state_version` 0건
- [x] `node --test tests/state.test.cjs` → exit 0
- [x] `node --test tests/frontmatter.test.cjs` → exit 0 (Plan 02-01 회귀 없음)
- [x] `npm test` failure count ≤ 63 (실제: 63 — delta = 0)
- [x] STATE.md extractFrontmatter 파싱 OK (`brief_state_version = '1.0'`)
- [x] STATE.md에 orphan `gsd_state_version` 없음
- [x] Phase 1 audit record (`10-PARTIAL-AUDIT.md` 등)는 **손대지 않음** — 역사적 기록 보존

## Deviations from Plan

None — 플랜이 작성된 그대로 실행됨.

- 자동수정 규칙(Rule 1–3) 적용 없음. 플랜이 7개 사이트를 명시하고 있고, 사전 grep이 기대치와 정확히 일치했으며, 원자 커밋 원칙에 따라 추가 scope 확대 없이 `brief/` / `tests/` / `.planning/STATE.md` 3개 루트에만 한정함.
- 아키텍처 결정(Rule 4) 필요 없음.
- `commit-to-subrepo` 경로 불필요(single-repo).

## 인증 게이트

해당 없음 — 외부 인증 경로 없음.

## Phase 1 HRD-05 잔여 카탈로그 감소

Phase 1 `10-PARTIAL-AUDIT.md §4` 소스 드리프트 카탈로그에서 **`gsd_state_version` 카테고리 1건** 감소. 이 Plan 커밋 직전까지 해당 5개 test assertion은 `state.cjs:814`가 여전히 `gsd_state_version`을 쓰고 있어 GREEN 상태였지만, 원자 커밋이 쓰기 사이트와 assertion을 동시 업데이트하여 GREEN을 유지하면서 명명을 정정함 — 이것이 "원자적이지 않으면 delta-cap을 깬다"는 플랜의 핵심 인사이트를 증명.

## Known Stubs

없음. 이 Plan은 리네임만 수행하며 UI/데이터-소스 wiring을 추가하거나 변경하지 않음.

## Threat Flags

새로운 보안 surface 없음. state.cjs 쓰기 경로는 first-party이고 STATE.md는 이 프로세스만 쓰는 git-tracked artifact이므로 threat model 등록된 T-02-03-01(Tampering/mitigate — 원자성으로 경감) / T-02-03-02(Repudiation/accept — git revert 가능)가 계획대로 처리됨. 플랜의 `<threat_model>`에 포함되지 않은 신규 surface는 도입되지 않음.

## Self-Check: PASSED

- [x] Commit `cf614b5` in `git log --oneline`:
  ```
  cf614b5 refactor(02-03): rename gsd_state_version → brief_state_version atomically (D-04, 7 sites)
  ```
- [x] `brief/bin/lib/state.cjs:814` contains `brief_state_version: '1.0'` (verified via grep)
- [x] `.planning/STATE.md:2` reads `brief_state_version: 1.0` (verified via grep)
- [x] `tests/state.test.cjs` contains 5 `brief_state_version` references at lines 350/365/382/442/1725 (verified via grep)
- [x] `grep -rn "gsd_state_version" brief/ tests/ .planning/STATE.md` returns ZERO lines
- [x] `node --test tests/state.test.cjs`: 93/93 pass
- [x] `npm test` failure count: 63 (baseline preserved, delta = 0)
- [x] Plan 02-01 보존 확인: `tests/frontmatter.test.cjs` 41/41 pass

---

*Phase: 02-stable-seam-anchor-schema-caps-workstream-as-config*
*Plan: 03 (ATOMIC D-04 rename)*
*Summary 작성: 2026-04-18*
