# Phase 9 — Discuss Draft (pre-checkpoint, 2026-04-26)

> **Resume context:** 이 파일은 /clear 직전 Phase 9 smart_discuss 시작 단계에서 준비된 4 회색 영역 표 제안을 담고 있다. 다음 세션에서 `/brief-discuss-phase 9` 또는 `/gsd-autonomous --from 9` 실행 후 이 파일을 참조해 영역별 Accept all / Change Q* / Discuss deeper 결정을 그대로 이어가면 된다.
>
> **Phase 8 완료 상태:** 15/15 must-haves; 118/118 tests; 8/8 plans (4 waves); 4-layer audience defense + Type A/B 8 artifacts + /brief-deliver + /brief-export + CC-03 hook + 7 review fixes. STATE.md `Last session` = "Phase 8 complete... Next: /brief-discuss-phase 9".
>
> **사용자 결정 인계:** 이전 세션에서 "Phase 8 + Phase 9 + lifecycle (Recommended)" 선택 + smart_discuss 표 제안 모드 선택 + Stop/Continue checkpoint에서 "계속 — Phase 9 자동 시작" 선택. /clear 후 즉시 Phase 9 smart_discuss 영역 4개 결정 → plan-phase → execute-phase → review/verify → ROADMAP+PROJECT 마크 → milestone audit → complete → cleanup으로 진행.

---

## Phase 9 도메인 경계

**Phase 9: Hardening — Cross-Runtime Smoke + Non-Developer Pilot** (BRIEF v1 launch 직전 hardening)

**5 success criteria (ROADMAP §lines 192-201):**
1. `brief-cli smoke-test`가 Claude Code / Codex / Gemini / OpenCode 4 runtime에서 5 critical commands (`init`, `define`, `discover`, `design`, `deliver`) 작동 검증; runtime별 text_mode fallback 활성 (HRD-01)
2. Surface count audit 문서 — ≤12 user-facing commands + ≤8 skills, 각 one-line rationale (HRD-02)
3. `/brief-help` rich + categorized + `/brief-help <topic>` subset + Levenshtein 3-suggest (HRD-03)
4. 3-planner non-developer pilot — `.planning/pilot/` friction journal (HRD-04)
5. Phase 1 HALT-ACCEPTED 63 residual failures closure ≤ 16 npm test failures (HRD-05; (a) 19 missing-file + (b) 14 doc-drift + (c) 30 source-behavior + (d) 13 source-content)

**Requirements:** HRD-01, HRD-02, HRD-03, HRD-04 (+ HRD-05 added 2026-04-18)

---

## 4 회색 영역 (smart_discuss 표 제안)

### Grey Area 1/4: Surface cap pruning (HRD-02) — 64+ commands → ≤12 어떻게?

| # | 질문 | ✅ 추천 | 대안 |
|---|------|---------|------|
| 1 | 12 user-facing 명령으로 어떤 8개 BRIEF 도메인 + 4 helper 묶을지? | BRIEF 8: `/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`, `/brief-export`, `/brief-add-workstream`, `/brief-status`, `/brief-help` + helper 4: `/brief-init` (or new-project), `/brief-progress`, `/brief-undo`, `/brief-pause-work` | BRIEF 6 + helper 6; 모든 BRIEF 도메인 + 0 helper (의존: SDK CLI) |
| 2 | 나머지 50+ 명령 처리? | `commands/brief/`에서 물리적 삭제 + bin/install.js cleanup; backup branch에 보존 | 명령 hidden (frontmatter `hidden: true`) 후 v2에서 삭제; 모두 보존 + cap 위반 문서화 |
| 3 | Skills cap (≤8) 처리? | `.claude/skills/` 비어 있음 — 자동 0/8 (cap 안에서); HRD-02 audit 문서에 명시 | gstack/외부 skills 카운트 포함 (사용자 환경 의존, 위험) |
| 4 | 명령 별 rationale 문서화 위치? | `.planning/SURFACE-AUDIT.md` (Phase 2 D-09 cap source 옆에 audit 결과) | CLAUDE.md "Surface Caps" 섹션 직접 확장; v1-launch 전용 별도 SURFACE-V1.md |

**플래그:** Q1 12개 명령 가지치기는 도메인 결정. "Discuss deeper" 옵션 권장.

---

### Grey Area 2/4: Cross-runtime smoke test (HRD-01) — Codex/Gemini/OpenCode 실제 호출?

| # | 질문 | ✅ 추천 | 대안 |
|---|------|---------|------|
| 1 | smoke test 구현 접근? | **stub-driven** — `brief-cli smoke-test` runtime별 4개 mock CLI subprocess (실제 Codex/Gemini/OpenCode 호출 없음); FND-06 detection code path만 검증; AskUserQuestion → numbered-list fallback 작동 검증 | 실제 4 runtime CLI 호출 (Codex/Gemini/OpenCode 설치 + API 키 필요 — 사용자 환경 의존, 비용 큼); 일부만 mock (Claude Code 실제 + 나머지 mock) |
| 2 | 5 critical commands는? | `init`, `define`, `discover`, `design`, `deliver` (ROADMAP 명시). `/brief-export`는 Type B 경로만 — 4 runtime 중 일부에서 Marp 미가용 가능 — 별도 manual verification으로 빠짐 | 8 commands 모두 (define+discover+design+deliver+export+add-workstream+status+help); 3 commands만 (init+define+deliver) |
| 3 | text_mode fallback 검증? | runtime에서 AskUserQuestion 미가용 시 numbered-list로 자동 전환 검증 (Phase 1 FND-06 추적); brief-cli smoke-test가 INSTRUCTION_FILE 환경변수 mock 후 결과 캡처 | text_mode 고정 활성 후 모든 runtime에서 numbered-list만 검증; runtime detection 무시 |
| 4 | 결과 보고 형식? | `.planning/SMOKE-TEST.md` — 4 runtime × 5 commands = 20 cell matrix (PASS/FAIL/SKIP); CLAUDE.md "Multi-runtime parity" 섹션에서 reference | JSON output (CI parsing); 각 runtime 별 별도 .md 파일 |

---

### Grey Area 3/4: Rich `/brief-help` (HRD-03) — UX 디자인

| # | 질문 | ✅ 추천 | 대안 |
|---|------|---------|------|
| 1 | 명령 분류 기준? | 4D phase별 (DEFINE / DISCOVER / DESIGN / DELIVER) + Helpers 카테고리 — 사용자 mental model 일치 | 알파벳 순; 빈도 순 (사용 빈도 추적 데이터 필요); 단일 flat list |
| 2 | `/brief-help <topic>` 기능? | 부분 키워드 매치 (예: `/brief-help define` → DEFINE phase 명령들 + define.md 본문) | 정확 명령명 매치만; 전문 검색 (느림) |
| 3 | 오타 시 Levenshtein 제안? | 가장 가까운 3개 명령 제안 (`/brief-defone` → `/brief-define`, `/brief-deliver`, `/brief-export`); 임계값 distance ≤ 3 | 오타 시 빈 결과 (사용자 알아서); 모든 명령 fuzzy match (느림) |
| 4 | 구현 위치? | `commands/brief/help.md` 새 명령 + `brief/bin/lib/help.cjs` (정적 JSON 카탈로그 + Levenshtein) — A1 zero-deps 유지 | 외부 패키지 `commander` (dep 추가); brief-tools.cjs 직접 hardcode (lib split 패턴 위반) |

---

### Grey Area 4/4: HRD-04 (pilot) + HRD-05 (Phase 1 잔여 63 failures) 대처

| # | 질문 | ✅ 추천 | 대안 |
|---|------|---------|------|
| 1 | HRD-04 (3-planner pilot) 충족? | **partial: 1 of 3** — 현 dogfooding 세션 (한국, 비개발자 product owner) 1명 logged in `.planning/pilot/`; 나머지 2명 v1.1 베타 (Out of Scope for v1 launch — log explicit) | 3명 미충족 시 v1 launch 차단 (현실적 불가); HRD-04 전체 v2로 이관 (REQUIREMENTS.md 수정) |
| 2 | HRD-05 (63 source-side test failures) 처리 범위? | **(a)+(b) 우선, (c)+(d) defer** — (a) 19 missing-file tests: 빠진 workflow/reference 생성 OR assertion 삭제 (필요 vs out-of-scope 판단), (b) 14 ARCHITECTURE.md count drift 동기화. (c) 30 source-behavior drift + (d) 13 source-content drift는 v1.1 (대량 source diff, 영향 크지만 launch 차단 안 함) | 전부 fix (heavy work, plan ~6h); 모두 defer to v1.1 (Phase 1 HALT-ACCEPTED 그대로 유지); 사용자가 우선순위 직접 결정 |
| 3 | pilot 친화도 측정? | `.planning/pilot/01-{user-id}-friction-journal.md` 형식 — Pitfall #9 비개발자 마찰 항목별 발생 빈도 + severity | Likert scale 설문지; 자유 형식 텍스트만 |
| 4 | v1 launch 차단 기준 재정의? | "blocking pilot finding 0개 + smoke test PASS + surface cap 준수" — HRD-04 partial은 launch 차단 사유 아님 (베타로 명시) | 5 success criteria 모두 100% (현실 불가); HRD-04 + HRD-05 모두 연기 (v1 spec 약화) |

---

## 다음 세션 진입 절차

1. `/clear` 후 새 세션 시작
2. 이 draft 파일 자동 발견 — `cat .planning/STATE.md` (Resume File에 08-VERIFICATION.md 표시) + `ls .planning/phases/09-*/` (09-DISCUSS-DRAFT.md 표시)
3. 두 가지 진입 경로:
   - **인터랙티브 (사용자가 영역별 Accept/Change/Discuss 직접 선택):** `/brief-discuss-phase 9 --chain` — discuss → plan → execute auto-chain
   - **autonomous (사용자가 영역 선택만 하고 나머지 위임):** `/gsd-autonomous --from 9` — discuss → plan → execute → review → verify → mark complete → milestone audit → complete → cleanup
4. smart_discuss 시작 시 위 4 영역 표를 그대로 제시 (이 draft 참조). 사용자가 Accept/Change/Discuss 선택 후 09-CONTEXT.md 작성.

## 메모리 인계 (이 draft를 후속 세션이 알아야 할 것)

- **Phase 8 패턴 인계:** smart_discuss → plan-phase (with research + pattern-mapper + plan-checker iter) → 4 wave execution → code review + fix → verifier → mark complete → STATE record. Plan 1-7과 동일.
- **사용자 메모리 규칙 적용 예정:**
  - "적정선 lock" — 영역당 2-4개 핵심 결정만 잠금
  - "Default to delegated mode on implementation-heavy phases" — Phase 9는 implementation-heavy (code generation, test creation, docs)
  - "Leave space for user-surfaced design insights" — Surface cap pruning Q1은 도메인 결정이므로 사용자 의견 우선
- **agent quota 주의:** 이전 세션에서 Plan 06 agent가 한도 도달로 실패 → inline 폴백. Phase 9도 유사 위험. 큰 plan은 worktree-isolated 단일 agent로 처리 (병렬 4개는 Wave 1 수준에서만).
- **Phase 8 cwd 버그 교훈:** 3개 worktree agent가 main에 직접 leak. Phase 9 plan-phase 시 executor prompt에 `<critical_cwd_warning>` 강화 (이미 Plan 08-08에서 적용된 형태 그대로).
- **HRD-04 dogfooding 인계:** 현 세션 자체가 1/3 pilot (Korean non-technical product owner). friction 항목 자동 캡처 가능 (예: smart_discuss 표 클러터, agent 한도 도달, cwd 버그 노출 등).

---

*Phase 9 draft prepared at /clear checkpoint. Resume via /brief-discuss-phase 9 OR /gsd-autonomous --from 9.*
