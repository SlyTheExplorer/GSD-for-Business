# Phase 7: DESIGN — Workstream Orchestration + COMPLIANCE Checker - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `07-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-25 (Areas B/C/D) + 2026-04-24 (Area A — resumed from `07-DISCUSS-CHECKPOINT.json`)
**Phase:** 07-design-workstream-orchestration-compliance-checker
**Areas discussed:** A (COMPLIANCE checker shape + pack scope), B (/brief-design orchestrator UX), C (/brief-add-workstream flow depth), D (9 workstream template shape)
**Mode:** Interactive — single-area-at-a-time pacing; recommended option selected for every question; no area re-opened.

---

## Area A — COMPLIANCE checker shape + pack scope (resumed from checkpoint, 2026-04-24)

### Q1: COMPLIANCE verdict 3-output 이름

| Option | Description | Selected |
|--------|-------------|----------|
| COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING | Recommended | ✓ |
| COMPLIANCE-OK / DRIFTED-evidence / DRIFTED-coverage | DRIFTED- prefix is misleading for clause-coverage | |
| NO-FINDINGS / FINDINGS / NO-APPLICABLE-CLAUSES | Loses severity stratification | |

**User's choice:** COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING
**Notes:** Literal preservation of Phase 4/5 canonical 3-output shape.

### Q2: 오케스트레이터 게이트 순서

| Option | Description | Selected |
|--------|-------------|----------|
| 순차: ALIGN → AUDIENCE → COMPLIANCE | Recommended | ✓ |
| 병렬: 세 게이트 동시 스폰 후 merge | Adds Task-coordination complexity, 3× LLM cost | |
| 조건부: spec.yaml의 gate_required 플래그로 게이트 토글 | Compliance-theater regression risk | |

**User's choice:** 순차 ALIGN → AUDIENCE → COMPLIANCE (fail-fast on BLOCKING)
**Notes:** Sequential is also semantically correct — each gate's input depends on prior gate's verdict being non-BLOCKING.

### Q3: 2026 PIPA CEO 개인책임 + 10% 매출액 벌금 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 일반 blocking findings + 면책 문구에 CEO 책임 언급 | Recommended | ✓ |
| 새 severity 'critical-personal-liability' | Bloats vocabulary; breaks 3-output canonical | |
| 전용 top-of-report 경고 배너 | Visual hierarchy push; primes reader to dismiss as boilerplate | |

**User's choice:** 일반 blocking findings + 면책 문구에 CEO 책임 언급
**Notes:** Disclaimer wording in Korean when state.brief.region == "kr" (Phase 3 D-11 inheritance). Disclaimer matches `pipa-2026.md` primer wording verbatim.

### Q4: v1 compliance pack 지원 범위

| Option | Description | Selected |
|--------|-------------|----------|
| Korea 3개 스켈레톤만 (PIPA / ISMS-P / MyData) | Recommended; Phase 5 유산 그대로 | ✓ |
| Korea 3개 + 글로벌 스텁 4개 (GDPR, SOC 2, HIPAA, CCPA) | Compliance theater risk for stub-level globals | |
| 팩 템플릿 뼈대만 유지, 내용 채우기는 v2 | Defeats CC-01 region-aware findings | |

**User's choice:** Korea 3개 스켈레톤만 (Phase 5 inheritance unchanged)
**Notes:** Globals deferred to v2 (CC-V2-01). v1 ships ONLY what was legally reviewed.

---

## Area B — /brief-design orchestrator UX

### Q1: 한 번에 몇 개의 워크스트림을 실행하는 곳으로 설계

| Option | Description | Selected |
|--------|-------------|----------|
| 1개 워크스트림/세션 | Recommended; 체크포인트/재개·gap·return_stack과 자연스럽게 맞음 | ✓ |
| 멀티 선택 후 웨이브 실행 | Multi-frame return-stack은 v2 deferred | |
| 명시적 파이프라인 전체 실행 | 사용자 의사결정 공간 사라짐; B2C 비전스 패턴과 어긋남 | |

**User's choice:** 1개 워크스트림/세션 (`/brief-design <workstream>`)

### Q2: OBJECTIVES.md 부족 시 사용자 대응

| Option | Description | Selected |
|--------|-------------|----------|
| 잠시 멈춤 + /brief-define --amend로 안내 | Recommended; immutable intent 자물쇠 유지 | ✓ |
| Phase 6 gap-detector로 자동 처리 | gap-detector는 DISCOVER↔DESIGN 스코프; semantic 확장 필요 | |
| DEFINE 룬턴 없이 BMC 내부에서 인라인 OBJECTIVES 수정 | Phase 3 D-03 immutable lock 우회 | |

**User's choice:** 잠시 멈춤 + /brief-define --amend로 안내
**Notes:** Phase 6 return_stack은 DISCOVER↔DESIGN 전용; DESIGN→DEFINE은 별도 directive 메커니즘.

### Q3: 9개 워크스트림 간 의존 관계

| Option | Description | Selected |
|--------|-------------|----------|
| soft 권장 순서만 명시, 강제 안 함 | Recommended; 사용자 판단 존중 | ✓ |
| hard 의존 선언, 선행 워크스트림 먼저 실행 요구 | "이미 외부에 있는데 다른 곳에 쓰고 싶다" 시나리오 떨어짐 | |
| 의존성 올 없음, 9개 완전 독립 실행 | DSG-03 driver-based bottom-up FINANCIAL은 BMC 수익 모델 없이 못 씀 | |

**User's choice:** soft 권장 순서만 (BMC → GTM → BRAND → OPERATIONS → FINANCIAL → RISK → ROADMAP → TECH-ARCH → COMPLIANCE)
**Notes:** depends_on 필드 informational; /brief-status에 "Recommended next" 표시.

### Q4: 워크스트림 완료 시 핸드오프

| Option | Description | Selected |
|--------|-------------|----------|
| 결과 요약 + 다음 제안 + 명시적 확인 | Recommended | ✓ |
| 완료 없이 차세션 이어서의 자동 입력 필요 설계 | UX 조금 거칠 | |
| 실행 조건 완료 시 자동 다음 워크스트림 시작 | 의사결정 쪽단 있는 워크스트림(BRAND voice)에서 사용자 논의 공간 사라짐 | |

**User's choice:** 결과 요약 + 다음 제안 + 명시적 확인 (auto-chain X)

---

## Area C — /brief-add-workstream flow depth

### Q1: 결과물 자동 생성 vs 사용자 작성 비율

| Option | Description | Selected |
|--------|-------------|----------|
| spec.yaml 자동 생성 + 1단계 대화 | Recommended; 4-6 질문 후 skeleton 자동 생성, 사용자는 prompt 튜닝만 | ✓ |
| spec.yaml 초기 골격만 자동, design-prompts 수동 작성 | 비개발자 타겟 사용자에게 진입장벽 큼 | |
| gsd-new-milestone 파일 전체 재사용 (리서치 갭 분석 포함) | v1에 너무 무거우꺼고 ROADMAP은 BRIEF 도구의 메타로드맵 비즈니스 로드맵 아님 | |

**User's choice:** spec.yaml 자동 생성 + 1단계 대화

### Q2: 추가된 워크스트림에도 ALIGN/AUDIENCE/COMPLIANCE 자동 attach?

| Option | Description | Selected |
|--------|-------------|----------|
| 3개 모두 자동 attach | Recommended; CC-01 "every artifact" 일관 | ✓ |
| spec.yaml gates_required 필드로 토글 | "COMPLIANCE 끄고 시작했다가 나중에 키면 뒤늦은 finding 폭탄" 시나리오 | |
| ALIGN+AUDIENCE만 자동, COMPLIANCE는 명시적 opt-in | CC-01 "every artifact" 완화 → 채크박스 철학 의문 | |

**User's choice:** 3개 모두 자동 attach (gates_required default = `[align, audience, compliance]`)

### Q3: 이름/역할 충돌 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 이름 중복은 BLOCK, 역할 유사함은 입장제태 프롬프트 | Recommended | ✓ |
| 이름만 유니크하면 세맨틱 중복 무시 | 중복/분한 artifact 양산됨 | |
| 모든 추가 시 기존 9개 전체 리스트 제시 + "정말 새 워크스트림 맞습니까?" 확인 | 매번 마찰 → v1에서는 과장 | |

**User's choice:** 이름 BLOCK + 역할 유사 시 fork/new 2분기 프롬프트
**Notes:** Role-overlap heuristic = word-set overlap > 50% with existing description (planner discretion).

---

## Area D — 9 workstream template shape

### Q1: artifact 위치와 구조

| Option | Description | Selected |
|--------|-------------|----------|
| .planning/workstreams/{name}/{artifact}.md | Recommended; paired-sibling 게이트 같은 폴더 | ✓ |
| .planning/workstreams/{name}.md 단일 파일 | paired-sibling이 평평한 곳에 떨어지면 36+ 파일 명시 없이 섞임 | |
| 9개 고정 경로 명시 (.planning/business-model.md, ...) | dynamic /brief-add-workstream과 두 체제 공존 | |

**User's choice:** `.planning/workstreams/{name}/{artifact}.md`

### Q2: spec.yaml 필수 필드 세트

| Option | Description | Selected |
|--------|-------------|----------|
| 최소 필수 6개 (name, description, output_artifact, design_prompts_path, gates_required, depends_on) | Recommended | ✓ |
| 풍부한 12+ 필드 (b2b_variant, b2c_variant, audience_default, voice_tone_default, region_specific 등) | 쓰기 부담 | |
| name + design_prompts_path 2개만 필수 | 9개 빌트인 어떤 필드를 채웠는지 명료적 표준 없음 | |

**User's choice:** 최소 필수 6개
**Reconciliation note:** Phase 2 D-13 already enforces 5 fields (name, description, research_prompts[], design_prompts[], output_artifact_template) in `workstream-loader.cjs`. Phase 7 D-13 ADDS 2 (gates_required, depends_on) → final required count = 7. The "minimum 6" user signal is preserved as the spirit (not fat schema); planner reconciles to 7 by extending Phase 2 D-13, NOT replacing.

### Q3: B2B/B2C 다른 내용을 어디에 표현?

| Option | Description | Selected |
|--------|-------------|----------|
| design-prompts.md 내 조건부 prose (Phase 5 D-15 그대로) | Recommended; 일관성 | ✓ |
| spec.yaml의 b2b_variant: + b2c_variant: 골격 분리 | Phase 5 D-15와 어긋남, prose 표현 한계 | |
| 공유 reference 파일 brief/references/business-model-lens.md | DRY이지만 워크스트림별 lens 특수성 사라짐 | |

**User's choice:** design-prompts.md 내 조건부 prose

### Q4: FINANCIAL driver-based 입력 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 8-12개 driver 인터뷰 시리즈 | Recommended; 사용자 입력 → driver table → LLM 12개월 projection | ✓ |
| drivers.yaml 템플릿 + 사용자 수동 작성 + LLM은 해석/검증만 | 비개발자에게 불친절 | |
| LLM이 OBJECTIVES + DISCOVER에서 driver 추론, 사용자 검토 | Pitfall #6 hallucinated market data 재발 | |

**User's choice:** 8-12개 driver 인터뷰 (revenue/cost/customer/capital/time 5 카테고리 커버)
**Notes:** 모든 driver 값에 `[FOUNDER-INPUT]` provenance tag (CC-04 inheritance). 12개월 projection cells에 `[VERIFIED:user-supplied]` or `[ASSUMED:multiplier-X]`.

---

## Final confirmation

### Q: Area A/B/C/D 논의 끝났고 총 15개 결정 잠겼어요. 더 다루고 싶은 회색지대가 있나요?

| Option | Description | Selected |
|--------|-------------|----------|
| 07-CONTEXT.md 생성 | Recommended | ✓ |
| 더 다룰 회색지대 있음 — 'Other'로 자유 타이핑 | | |

**User's choice:** 07-CONTEXT.md 생성

---

## Claude's Discretion (recorded in CONTEXT.md)

- COMPLIANCE checker prompt structure (follow Phase 4/5/6 canonical agent shape)
- `{artifact}.compliance.md` body schema beyond frontmatter
- CEO liability disclaimer Korean / English exact wording
- 9 built-in workstream content depth
- Soft-recommended ordering display in `/brief-status`
- `/brief-add-workstream` interactive Q&A exact prompts
- Role-overlap detection heuristic (D-11)
- FINANCIAL drivers.md schema details
- Test fixture granularity
- State allowlist extensions
- Atomic commit granularity (9 suggested steps)

## Deferred Ideas (recorded in CONTEXT.md)

- MATERIAL findings interactive review (`/brief-review-findings`) — v2
- Multi-workstream parallel execution — v2
- `/brief-recompliance` / `/brief-realign-workstream` on-demand re-gate commands — Phase 9 HRD-02 audit
- Global compliance packs (GDPR / SOC 2 / HIPAA / CCPA) — v2 (CC-V2-01)
- Clause-level Korean compliance content depth — v2 (CC-V2-01)
- Hard `depends_on` enforcement / `--strict` mode — Phase 9 HRD-04 pilot reassessment
- Workstream agent prompt drift detection (advanced) — v2
- B2B/B2C variant design-prompts split files — v2
- DESIGN→DEFINE bidirectional return — v2
- Pre-commit Frontmatter Validator git hook (CC-03) — Phase 8
- TECH-ARCH detailed-design sub-workstream — v2
- ROADMAP workstream vs BRIEF tool's ROADMAP.md naming clarity — v2
- Custom workstream scaling beyond ~20 — v2
- Cost / latency budget telemetry — v2
- Web-search MCP integration for COMPLIANCE checker — v2

---

*Discussion completed: 2026-04-25*
*Next step: `/brief-plan-phase 7`*
