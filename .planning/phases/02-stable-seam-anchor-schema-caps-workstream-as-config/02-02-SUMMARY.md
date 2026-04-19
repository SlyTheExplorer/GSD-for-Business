---
phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
plan: 02
subsystem: docs
tags: [claude-md, surface-caps, policy, fnd-09]
type: execute
wave: 1
requirements:
  - FND-09
dependency_graph:
  requires: []
  provides:
    - "CLAUDE.md ## Surface Caps policy text (ready for Phase 3-8 command-addition enforcement by convention, and Phase 9 HRD-02 audit)"
  affects:
    - "CLAUDE.md (project-root, top-level policy)"
tech_stack:
  added: []
  patterns:
    - "HTML-comment regeneration guard (`<!-- BRIEF PHASE 2 / FND-09 — DO NOT REGENERATE ... -->`) for sections that must survive template rebuilds"
key_files:
  created: []
  modified:
    - "CLAUDE.md (+22 lines, 0 deletions; inserted ## Surface Caps H2 between ## Architecture and ## Project Skills)"
decisions:
  - "Placement between `## Architecture` and `## Project Skills` per 02-PATTERNS.md recommendation — keeps project-policy sections grouped"
  - "HTML-comment regeneration guard adopted verbatim per plan (T-02-02-01 mitigation); mirrors the `<!-- BRIEF:profile-end -->` envelope pattern already present in CLAUDE.md"
  - "Verbatim text from PLAN.md line 104-126 used — every grep-asserted keyword preserved"
metrics:
  duration: "~1분 (78초)"
  completed: "2026-04-19"
  tasks_completed: 1
  tasks_total: 1
---

# Phase 2 Plan 02: CLAUDE.md Surface Caps 섹션 추가 Summary

**One-liner:** CLAUDE.md에 `## Surface Caps` H2 섹션 신규 추가 — ≤12 user-facing 슬래시 명령 / ≤8 스킬 상한을 정책 텍스트로 고정하고, 향후 템플릿 재생성에 대비해 HTML 주석 가드를 prefix로 부착.

## Objective 달성 여부

PLAN.md의 `<objective>` 원문이 요구한 다음 5가지 must_have truths를 모두 충족:

1. ✅ CLAUDE.md에 정확한 제목 `## Surface Caps`의 H2 섹션이 존재
2. ✅ 상한값을 `≤12 user-facing slash commands` 및 `≤8 skills`로 명시
3. ✅ "user-facing" 정의를 `bin/install.js`가 `commands/<runtime>/brief/` 하위에 등록하는 대상으로 정의
4. ✅ **Phase 9 HRD-02**를 enforcement/audit 게이트로 포워드 포인터 제공
5. ✅ 섹션 바로 앞에 regeneration-guard HTML 주석 (`<!-- BRIEF PHASE 2 / FND-09 — DO NOT REGENERATE. Preserve across CLAUDE.md template rebuilds. -->`) 배치

## 실행된 작업

### Task 1 — `## Surface Caps` 섹션 삽입

**커밋:** `4085960` — `docs(02-02): add CLAUDE.md ## Surface Caps section (FND-09 / D-06-D-09)`

**변경:** `CLAUDE.md` +22 lines, 0 deletions (순수 추가, 기존 컨텐츠는 한 글자도 수정 없음).

**삽입 위치:** 기존 `<!-- BRIEF:architecture-end -->` 마커 직후, `<!-- BRIEF:skills-start source:skills/ -->` 마커 직전. 결과적으로 렌더링된 H2 순서는:
```
## Project
## Technology Stack
...
## Architecture
## Surface Caps   ← NEW
## Project Skills
## BRIEF Workflow Enforcement
## Developer Profile
```

**삽입된 본문 (핵심):**
- 제목 `## Surface Caps` + 근거 (Miller's Law, Pitfall #1 skill bloat, Pitfall #12 slash-command memorability)
- 상한 두 줄 (`≤12 user-facing slash commands`, `≤8 skills`)
- "user-facing" 정의 (bin/install.js 기반)
- **Enforcement 블록** — D-07 준수: pre-commit hook 없음, CI 게이트 없음, 오직 문서만. 실제 audit은 Phase 9 HRD-02.
- **Current state 블록** — D-08 준수: GSD 상속으로 61개 명령 + 18개 에이전트 존재, 둘 다 상한 초과. Phase 2는 `/brief-status` +1만 추가.
- **MUST NOT 조항** — D-09 준수: Phase 3-8은 requirement-mapped set 외 신규 명령 추가 금지.
- **Scope clarification** — 상한이 적용되지 않는 항목 명시 (brief-tools.cjs 서브명령, brief/workflows/ 내부 마크다운, brief/references/ 참조 문서).

## 의사결정 반영 매트릭스 (D-06 ~ D-09)

| 결정 | 반영 여부 | 본문 발췌 (grep 확인됨) |
|------|-----------|----------------------|
| D-06 — ≤12/≤8 상한 + user-facing 정의 | ✅ | `≤12 user-facing slash commands`, `≤8 skills`, `bin/install.js ... commands/<runtime>/brief/` |
| D-07 — Phase 2는 문서 전용, 자동 게이트 없음 | ✅ | `Documentation-only in Phase 2`, `No pre-commit hook, no automated gate` |
| D-08 — 현재 61 cmd / 18 agent 초과 상태 명시 | ✅ | `61 renamed brief-* commands`, `18 renamed agents` |
| D-09 — Phase 9 HRD-02 포워드 포인터 + Phase 3-8 MUST NOT | ✅ | `Phase 9 HRD-02`, `MUST NOT add new commands` |

## 위협 모델 반영

| 위협 ID | Disposition | 처리 결과 |
|---------|-------------|-----------|
| T-02-02-01 (Tampering — 향후 regeneration이 섹션 drop 할 위험) | mitigate | HTML 주석 가드 prefix 부착 완료 — `grep -q "BRIEF PHASE 2 / FND-09 — DO NOT REGENERATE"` 통과 |
| T-02-02-02 (Info — 61/18 숫자가 시점 스냅샷일 뿐) | accept | 본문에 "As of v1 design (Phase 2 entry, 2026-04)"로 시점 명시, Phase 9 HRD-02 포워드 포인터로 권위성 회피 |

## Verification 결과

### 자동 assertion (PLAN.md `<verify><automated>` 6종)

```
OK: grep -q "^## Surface Caps$" CLAUDE.md
OK: grep -q "≤12" CLAUDE.md
OK: grep -q "≤8" CLAUDE.md
OK: grep -q "Phase 9 HRD-02" CLAUDE.md
OK: grep -q "user-facing" CLAUDE.md
OK: grep -q "BRIEF PHASE 2 / FND-09 — DO NOT REGENERATE" CLAUDE.md
```

### Acceptance criteria (PLAN.md 추가 10종)

```
OK: grep -q "≤12 user-facing slash commands" CLAUDE.md
OK: grep -q "≤8 skills" CLAUDE.md
OK: grep -qE "bin/install\.js.*commands/<runtime>/brief/" CLAUDE.md
OK: grep -qE "MUST NOT add new commands" CLAUDE.md
OK: grep -qE "61 renamed.*brief-\*" CLAUDE.md
OK: grep -q "18 renamed agents" CLAUDE.md
OK: awk '/^## Architecture$/,/^## Project Skills$/' CLAUDE.md | grep -q "## Surface Caps"
OK: no prohibited emojis
OK: H2 count PRE=22 → POST=23 (delta=+1, 예상치와 정확히 일치)
OK: git diff --numstat → "22 0 CLAUDE.md" (순수 추가, 삭제 0)
```

### Regression 체크

- `git diff --diff-filter=D HEAD~1 HEAD`: 삭제된 파일 없음
- `git status --short` 커밋 후: clean, untracked 파일 없음
- 다른 H2 섹션은 한 줄도 수정되지 않음 (PRE 22 + 1 신규 = POST 23)

## 편차 (Deviations from Plan)

**없음** — 계획이 쓰여진 그대로 실행됨.

PLAN.md Task 1 `<action>` 블록의 텍스트를 한 글자도 수정하지 않고 복사해 삽입했으며, 삽입 위치도 PLAN.md가 지시한 `## Architecture`와 `## Project Skills` 사이 규칙을 따랐다. 단 한 가지 판단이 필요했던 부분은 "두 마커 사이 어느 위치에 넣을까"였고, 기존 `<!-- BRIEF:architecture-end -->` → `<!-- BRIEF:skills-start source:skills/ -->` envelope 사이에 넣는 것이 기존 BRIEF 마커 envelope 규칙을 존중하면서도 D-09의 신규 regeneration 가드를 독립 블록으로 배치할 수 있는 자연스러운 위치였다.

## Known Stubs

**없음** — 본 플랜은 정책 텍스트만 추가했으며, 어떤 UI/데이터 바인딩도 도입하지 않음.

## Threat Flags

**없음** — 본 플랜은 순수 문서 변경으로 새로운 네트워크 엔드포인트, 인증 경로, 파일 접근 패턴을 도입하지 않음.

## Forward Pointers

- **Phase 3-8:** 본 섹션의 "MUST NOT add new commands beyond their requirement-mapped set" 조항을 규약으로 준수해야 함. 각 Phase의 plan-time에서 신규 명령 개수를 추적하고, 상한 초과가 발생할 경우 Phase 9 HRD-02 audit으로 이관.
- **Phase 9 HRD-02:** 61개 → ≤12개 user-facing commands 감축 및 18개 → ≤8개 skills 감축 audit을 실행. 본 섹션의 text가 해당 감축의 policy anchor 역할을 함.
- **향후 `/brief-profile-user` / CLAUDE.md 템플릿 재생성 도구:** HTML 주석 가드 (`<!-- BRIEF PHASE 2 / FND-09 — DO NOT REGENERATE ... -->`)를 반드시 인식하여 본 섹션을 보존해야 함.

## Self-Check: PASSED

**Files claimed created:** 1 파일
- ✅ `.planning/phases/02-stable-seam-anchor-schema-caps-workstream-as-config/02-02-SUMMARY.md` — 이 문서 자체 (본 Write 호출이 생성)

**Files claimed modified:** 1 파일
- ✅ `CLAUDE.md` — `grep -c "^## " CLAUDE.md` → 23 (pre=22, delta=+1), `git show HEAD~0:CLAUDE.md | grep -q "^## Surface Caps$"` 통과

**Commit claimed:** 1 커밋
- ✅ `4085960` — `git log --oneline -1` → `4085960 docs(02-02): add CLAUDE.md ## Surface Caps section (FND-09 / D-06-D-09)`

**Verification 모든 grep assertion:** 16/16 통과 (자동 6 + acceptance 10)

## 커밋

| # | Hash | 메시지 |
|---|------|--------|
| 1 | `4085960` | `docs(02-02): add CLAUDE.md ## Surface Caps section (FND-09 / D-06-D-09)` |

(본 SUMMARY commit은 worktree 종료 후 orchestrator가 별도로 추가 예정)
