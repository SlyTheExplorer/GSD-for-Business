# Phase 3: DEFINE Canary — Phase 0 End-to-End - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 03-define-canary-phase-0-end-to-end
**Areas discussed:** Area 1 (/brief-define 대화 경험), Area 2 (OBJECTIVES.md 범위·계층), Area 3 (설정값 4종 UX), Area 4 (차단 + stale 경고 UX)

---

## Gray-Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| /brief-define 대화 경험 전체 | Push Twice + Dream State Mapping + 라운드 수 | ✓ |
| OBJECTIVES.md 범위·계층 구조 | project-level vs per-workstream, immutable/mutable 분류 | ✓ |
| 설정값 4종 선언 UX (DEF-04) | business_model/region/audience/compliance_packs 수집 흐름 | ✓ |
| 차단 + stale 경고 UX (DEF-05, DEF-06) | 차단 톤, 48h 경고 위치 | ✓ |

**User's choice:** 4개 영역 모두 (multiSelect) — Phase 3이 BRIEF의 얼굴이므로 전부 다룸.

---

## Area 1 — /brief-define 대화 경험 전체

### Q1.1: 대화 형식

| Option | Description | Selected |
|--------|-------------|----------|
| 객관식 우세 (버튼 중심) | 선택 타입 | |
| 자유서술 우세 (Push Twice 중심) | 수문답 자연어 | |
| 혼합 (버튼 + 정밀화 지점에서 자연어) | 명확 지점 버튼, 정밀화·Push Twice 자유서술 | ✓ |

**User's choice:** 혼합 (버튼 + 정밀화 지점에서 자연어).
**Notes:** "객관식 질문에 대해서는 좀더 고민해 보면 좋겠어" — 사용자가 Mixed 방향은 맞지만 객관식 처리 방식에 추가 고민을 요청. Q1.1 후속.

### Q1.2: 객관식 질문의 역할 (Q1.1 후속)

| Option | Description | Selected |
|--------|-------------|----------|
| 시드(seed) 역할만 — 선택 이후 항상 자유서술 follow-up | 선택지를 정답으로 보지 않음, 항상 자유서술로 정밀화 | ✓ |
| 추론—후—확인 — 자유서술 먼저 받고 Claude가 분류 제안 | 아예 처음부터 객관식 없이 수문답 수집 | |
| 가설 보기 + '추가의견' 항상 열림 | 공식 오프-램프 옵션 추가 | |
| 객관식 극소화 — 테크니컬로 엄격하게 택소인 경우만 | business_model/region/compliance_packs만 객관식 | |

**User's choice:** 시드(seed) 역할만.
**Notes:** 선택지는 출발점; 답변은 자유서술에서 나옴. D-02로 굳어짐.

### Q1.3: Push Twice 가시성

| Option | Description | Selected |
|--------|-------------|----------|
| 명시적 표시 — "하나 더 물을게요" 같은 멘트 추가 | AI가 깊이 파고 있다는 것이 명시적 | |
| 암묵적 — 시스템은 자연스럽게 깊이만 파고 라벨 없음 | [Push Twice] 라벨 전혀 없이 자연스러운 후속 질문 | ✓ |
| 두 번째에만 라벨 — 가장 깊이 있는 질문에만 '마지막으로 하나만' | 둘의 절충 | |

**User's choice:** 암묵적.
**Notes:** 라벨 없을 뿐 동일한 깊이. 한국 문화권에서 자연스러운 대화 흐름 선호. D-03으로 굳어짐.

### Q1.4: Dream State Mapping 형식

| Option | Description | Selected |
|--------|-------------|----------|
| 자유서술 — 각 시점을 3–5문장 서술로 | 정량 지표 강제 없음 | |
| 워크시트 — 미리 정한 고정 항목 슬롯 채우기 | 사용자수·매출·팀·분위기 등 4~6개 고정 슬롯 | |
| 하이브리드 — 서술 + 2~3개 핵심 지표 (선택 입력) | 서술 필수, 지표는 선택 | ✓ |

**User's choice:** 하이브리드.
**Notes:** 지표는 선택, 서술은 필수. D-04로 굳어짐.

### Q1.5: 2-모드 분기 방식 (사용자 통찰로 추가된 질문)

**User의 통찰**: "완전히 새로운 사업이나 제품 기획을 하고 싶은 경우도 있겠지만, 기존에 존재하는 것을 고도화하기 위한 작업들도 있을 것 같은데 후자는 이러한 작업들이 매우 짧아야 하지 않을까?"

이 통찰이 기존 "라운드 수" 질문(고정 30분 / 적응형 / 2-패스)을 구조적으로 대체. Mode A(신규) / Mode B(고도화) 2-모드로 재설계.

| Option | Description | Selected |
|--------|-------------|----------|
| 자동 감지 — OBJECTIVES.md 존재여부로 분기 | 투명한 자동화, 사용자 인지 부담 제로 | |
| 명시적 플래그 — /brief-define vs --amend | 명령어 자체가 분기 | |
| 사용자 선택 — 진입 시 첫 질문으로 신규/고도화 물음 | OBJECTIVES.md 존재 무관 항상 질문 | ✓ |
| 자동 감지 + 변경 가능 한 선택 | Mode B로 시작하되 --reset 가능 | |

**User's choice:** 사용자 선택.
**Notes:** OBJECTIVES.md 존재 여부 무관 항상 질문. 명령어 단일화, 의도 명시. D-05, D-06, D-07의 원천.

### Area 1 Wrap-up

**User's answer:** "Area 1이 너무 깊어지는 건 사람들이 지치게 할 수 있으니 적정선을 정하는게 무척 중요할 것 같아. 부족한 부분은 나중에 보완해 나갈 수 있지 않을까?"
**Notes:** 이것이 D-08 meta-discipline의 원천. Area 1에서 5번의 Q&A 후 적정선 인지; 원리가 Phase 3 planner·executor에도 확장됨.

---

## Area 2 — OBJECTIVES.md 범위·계층 구조

### Q2.1: 배치

| Option | Description | Selected |
|--------|-------------|----------|
| Project-level 1개만 (Phase 3 canary 범위) | .planning/OBJECTIVES.md 단일. per-workstream은 Phase 7 | ✓ |
| Project-level + 1개 '기본' workstream (둘 다) | default/primary workstream 병행 | |
| Phase 3에서 workstream 선택을 사용자가 하도록 — 유연한 구조 | 진입 시 선택 | |

**User's choice:** Project-level 1개만.
**Notes:** ROADMAP/REQUIREMENTS의 "per-workstream" 문구는 Phase 3+Phase 7 합쳐 충족으로 재해석. D-09에 기록.

### Q2.2: immutable/mutable 분류 결정자

| Option | Description | Selected |
|--------|-------------|----------|
| Claude 제안 + 사용자 승인 | 대화 끝 드래프트 보여주고 3-옵션 승인 | ✓ |
| 사용자가 직접 분류 — Claude는 틀만 제공 | 각 항목을 사용자가 버킷 배정 | |
| 고정 템플릿 — 항목이 자동으로 정해진 섹션 | 창서자=immutable, 청중=mutable 고정 | |

**User's choice:** Claude 제안 + 사용자 승인.
**Notes:** 승인 / 한 항목씩 검토 / 전체 재분류 3-옵션. D-10에 기록.

---

## Area 3 — 설정값 4종 선언 UX (DEF-04)

### Q3.1: 4개 설정값 수집 시점·방식

| Option | Description | Selected |
|--------|-------------|----------|
| 대화 끝에 한 번에 — Claude 추론 → 사용자 확인 | 대화 답변에서 추론, 마지막에 확인 | ✓ |
| 대화 중 자연스럽게 — 답변 중 자동 확인을 세 번 나눠 | 분산 체크인 | |
| 대화 직후 독립 체크리스트 — 명시적 피드백 | 폼 형식 | |

**User's choice:** 대화 끝에 한 번에 — Claude 추론 → 사용자 확인.
**Notes:** 비개발자 가장 친화. "config.json이 무엇인지 몰라도 됨." Korea 신호 감지 시 PIPA/ISMS-P/MyData 자동 pre-check (단, 감지된 경우에만). D-11에 기록.

---

## Area 4 — 차단 + stale 경고 UX (DEF-05, DEF-06)

### Q4.1: 차단 메시지 톤 (DEF-05)

| Option | Description | Selected |
|--------|-------------|----------|
| 구체적 안내 + 즉시 보완 경로 제공 | 어떤 필드가 빠졌는지, 보완 명령어 바로 제시 | ✓ |
| 간략한 차단 메시지 + '/brief-status'로 위임 | 상세는 /brief-status의 compact dashboard에서 | |
| 완상 메시지 + 바로 보완 대화 이어보자는 제안 | 부드럽지만 DEF-05 block-style 정신 위반 | |

**User's choice:** 구체적 안내 + 즉시 보완 경로.
**Notes:** 한국어. 기존 내용 보존 언급. DEF-05 "block-style, not warning" 준수. D-12에 기록.

### Q4.2: Stale-anchor 경고 UX (DEF-06)

| Option | Description | Selected |
|--------|-------------|----------|
| 새 활동(/brief-discover·새 milestone) 진입 시에만 안내 | 3-옵션 선택 필수 | ✓ |
| 매 명령 시작에 좌측 베너로 시각적 알림 | 일상화 → 무시 위험 | |
| /brief-status에만 표시 — 사용자가 볼 때만 | 가장 조용 — 그러나 DEF-06 정신 위반 위험 | |

**User's choice:** 새 활동 진입 시에만.
**Notes:** 3-옵션(amend/승인/빠른진행) 선택 필수, 선택 없이 진행 불가. `/brief-confirm-objectives` 보조 명령은 Claude's Discretion. D-13에 기록.

---

## Claude's Discretion

CONTEXT.md `<decisions>` 섹션의 "Claude's Discretion" 블록으로 이관. 주요 항목:

- `--amend` / `--unlock-intent` / `/brief-confirm-objectives`의 command-surface 구현 방식 (surface cap 존중)
- Push Twice / Language Precision의 정확한 프롬프트 문구
- Korea-signal 감지 방법 (regex / agent / structured inference)
- Mode A vs Mode B의 내부 파일 구조 (단일 vs 분리)
- 테스트 fixture 페르소나 (Korea-first B2C 권장)

---

## Deferred Ideas

CONTEXT.md `<deferred>` 섹션으로 이관:
- per-workstream OBJECTIVES.md (Phase 7)
- ALIGN gate (Phase 4)
- AUDIENCE guard (Phase 5)
- COMPLIANCE checker (Phase 7)
- `/brief-help` 통합 (Phase 9 HRD-03)
- 다국어 지원 (Phase 9 이후)
- 대화 중단·재개 처리 (Phase 3 실행 중 amendment 가능)
- Korea-signal 감지 리파인먼트 (v1.1)
- 의미론적 OBJECTIVES.md 검증 (Phase 4 ALIGN)
- Dream State Mapping 시점 커스터마이징 (v1.x)
