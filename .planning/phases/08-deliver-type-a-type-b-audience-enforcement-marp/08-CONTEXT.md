# Phase 8: DELIVER — Type A + Type B + AUDIENCE Enforcement + Marp - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous-optimized) — 4 gray areas (A: Type A 산출물 묶음; B: Type B Marp 데크 + 4-layer audience 방어막; C: AUDIENCE/COMPLIANCE 게이트 격상; D: Type B 데크 schema + ko/en 처리). Each area: 4 questions, table proposals, all "Accept all (Recommended)". 16 decisions (A-D01..D-04, B-D01..D-04, C-D01..D-04, D-D01..D-04) + 1 meta-discipline (D-17). No area re-opened or "Discuss deeper".

<domain>
## Phase Boundary

Phase 8 ships the **DELIVER runtime** — `/brief-deliver` orchestration over **8 final artifacts** (4 Type A PRD-input + 4 Type B communication) **+ `/brief-export` mandatory pre-render confirmation gate** **+ 4-layer AUDIENCE 방어막** **+ CC-03 pre-commit Frontmatter Validator hook** **+ Marp PPTX/PDF rendering via `npx --yes @marp-team/marp-cli@4.3.1`**. Phase 8 is the LAST runtime feature phase before Phase 9 hardening.

**In scope:**

1. **/brief-deliver orchestrator** — `--type-a` mode (4개 PRD-input markdown 산출물 자동 합성) + `--type-b <name>` mode (Marp 데크 source markdown + Marp render via `/brief-export` gate). 2개 새 사용자 명령(`/brief-deliver`, `/brief-export`); Phase 9 HRD-02 surface cap audit 전까지는 cap 한도 내.
2. **Type A 4 산출물** (`.planning/deliverables/type-a/` 폴더 통일):
   - `PRODUCT-BRIEF.md` — OBJECTIVES.md immutable intent + BMC canvas.md + GTM.md 자동 합성
   - `SERVICE-POLICY.md` — 1개 템플릿 + B2B/B2C conditional prose blocks (Phase 5 D-15 / Phase 7 D-14 패턴 일관)
   - `HIGH-LEVEL-SPEC.md` — 9 워크스트림 산출물 + OBJECTIVES 자동 초안
   - `FEATURE-MAP.md` — Mermaid 또는 ASCII 트리, 9 워크스트림 산출물 자동 매핑
3. **Type B 4 데크/문서** (`.planning/deliverables/type-b/` 폴더 통일):
   - `INTERNAL-DECK.md` (+ `.confidential.pptx`) — 7-9 슬라이드 Sequoia/YC 변형
   - `PROPOSAL-DECK.md` (+ `.partner.pptx`) — 7-9 슬라이드, 외부 파트너 안전, 전략 누설 방지
   - `EXEC-SUMMARY.md` — 1-2페이지 narrative 5-section (Context/Problem/Recommendation/Risks/Ask)
   - `DECISION-MEMO.md` — 1-2페이지 ADR 변형 (Context/Decision/Alternatives/Consequences)
4. **4-layer AUDIENCE 방어막** (Pitfall #5 권고 byte-identity 매핑):
   - **Layer 1**: 파일명 audience encoding `{name}.{confidentiality}.{ext}` (예: `internal-deck.confidential.pptx`, `proposal-deck.partner.pptx`)
   - **Layer 2**: Marp directive 워터마크 + literal first-slide content (한국어/영어 confidentiality 표시 — Korea-signal 시 ko 우선)
   - **Layer 3**: `/brief-export` 1단계 confirm — render 직전 audience+confidentiality 화면 표시 + AskUserQuestion accept (mandatory checkpoint)
   - **Layer 4**: CC-03 pre-commit Frontmatter Validator hook — `hooks/brief-validate-frontmatter.sh`, BRIEF setup 자동 설치, opt-in via `hooks.community: true` (기존 `brief-validate-provenance.sh` / `brief-validate-commit.sh` 패턴 일관)
5. **AUDIENCE/COMPLIANCE 게이트 격상** (Phase 5/7 finding emit → Phase 8 hard block on Type B):
   - Type B에서 AUDIENCE BLOCKING → Marp render 자체 안 함; `/brief-export`에서 AUDIENCE 게이트 재실행 → BLOCKING이면 Phase 5 D-09 3-path interrupt → force-accept 시에만 진행 + audit trail (Phase 4 D-07 force-accept 패턴 인계)
   - cross-artifact leakage diff (Pitfall #5, Phase 5에서 Phase 8로 deferred) → `/brief-export` 시 같은 폴더 내 다른 confidentiality 산출물과 키워드 diff → 누설 의심 시 finding emit (FINDINGS-MATERIAL severity)
6. **AI slop & concreteness 검증** (Pitfall #10):
   - Type B agent prompt에 banned-words list 흡수 + 생성 후 regex post-check (failure → 1회 regenerate); AUDIENCE 게이트와 별개 voice-fit 검증
   - "compared to what / by how much / when" concreteness 자가 검증 + 2-3개 hand-written exemplar 인라인 (별도 게이트 추가 안 함)
7. **Korea-first ko/en 정책** (Pitfall #11 + Phase 5 D-13 인계):
   - region: kr 시 ko 우선 emit; en은 `/brief-deliver --en` 또는 frontmatter `voice.languages: [ko, en]` opt-in
   - 한국어 honorific guard ("모든 산출물 격식체 -습니다") + 한국 투자자 문화 가이드 ("founder reliability + long-term relationship signals") agent prompt 인라인 — 별도 게이트 없음
8. **Marp invocation pattern**: `npx --yes @marp-team/marp-cli@4.3.1 input.md -o output.pptx` (zero runtime deps 유지). Chrome/Edge 필요 (rendering); LibreOffice Impress 선택 (편집 가능 PPTX). 환경 부재 시 PDF/HTML fallback 문서화.

**Out of scope (deferred):**

- AUDIENCE/COMPLIANCE 게이트 재구현 — Phase 5/7 인프라 인계 (Phase 8은 enforcement 격상만).
- 새 게이트 기본 패턴 변경 — 캐노니컬 3-output / paired-sibling / vocabulary-lock는 Phase 4·5·7에서 4번째 instance까지 lock 완료, Phase 8은 그대로 사용.
- gray-matter / ajv / js-yaml 런타임 dep 추가 — A1 zero-deps 유지 (인라인 30줄 CJS validator).
- 다중 milestone 지원 (`/brief-new-milestone` v2 cycle restart) — explicitly deferred per PROJECT.md.
- 클로즈 레벨 한국 compliance 콘텐츠 (PIPA/ISMS-P/MyData 클로즈별 체크리스트) — v2 (CC-V2-01); Phase 5 1-page primer 인계.
- Cross-runtime smoke test execution (Codex/Gemini/OpenCode end-to-end) — Phase 9 HRD-01.
- Surface count audit + ≤12 cmd / ≤8 skill 최종 가지치기 — Phase 9 HRD-02 (Phase 8은 NET +2 commands, cap 안에서).
- 별도 voice-fit-guard 게이트 / concreteness-guard 게이트 / ko-culture-guard 게이트 — pilot 피드백 후 v1.x.
- 항상-실행 frontmatter validator (opt-out 없음) — opt-in via `hooks.community: true` 유지 (Phase 5 D-06 패턴 일관).
- 글로벌 compliance 팩 (GDPR / SOC 2 / HIPAA / CCPA) — v2 (Phase 7 D-04 인계).

**Why Phase 8 is high-stakes:**

1. **Pitfall #5 audience leakage** — Phase 8이 마지막 방어선. 4-layer 방어막의 Layer 1+2+3+4가 모두 작동해야 외부 산출물에 내부 전략 누설 차단. 어느 한 layer라도 우회 가능하면 사용자가 잘못된 PPTX 첨부 → 이메일 전송 → 누설.
2. **AUDIENCE 게이트 격상의 위험** — Phase 5에서는 finding emit + interrupt (사용자 선택), Phase 8 Type B에서는 hard block (render 자체 거부). 격상 정도가 너무 약하면 Pitfall #5 재발, 너무 강하면 사용자 좌절 + force-accept 무차별 사용. force-accept는 audit trail 필수 (Phase 4 D-07 인계).
3. **AI slop in Type B** (Pitfall #10) — banned-words 검사 + concreteness 자가 검증이 약하면 투자자/파트너가 즉각 AI 생성으로 감지 → 신뢰 손실. agent prompt 인라인 + 1회 regenerate 패턴이 첫 방어선; pilot 후 강화.
4. **Marp 환경 의존성** — Chrome/Edge 부재 시 PPTX render 실패; LibreOffice 부재 시 편집 가능 PPTX 불가. fallback (PDF/HTML/non-editable PPTX) 명확히 문서화. `npx --yes` 패턴은 zero-deps 유지하지만 첫 invocation 지연 발생.
5. **Surface cap 위반 위험** — Phase 8은 NET +2 (`/brief-deliver`, `/brief-export`); 어떤 추가 명령(`/brief-watermark`, `/brief-render`, `/brief-confirm`)도 surface cap 위반. Phase 9 HRD-02 audit가 가지치기 책임.

</domain>

<decisions>
## Implementation Decisions

### Area A — Type A 산출물 묶음

- **A-D01: Type A 산출물 위치 = `.planning/deliverables/type-a/`.** Type B는 `.planning/deliverables/type-b/`로 분리. 페어드-시블링 게이트 패턴(`{artifact}.audience.md`, `{artifact}.compliance.md`)은 동일 폴더 안에 공존. 워크스트림 산출물(`.planning/workstreams/{name}/`)과 명확히 분리 — DELIVER는 워크스트림 결과의 합성물이지 워크스트림 그 자체가 아님.
  - **Rejected:** `.planning/deliverables/` flat (4 Type A + 4 Type B + paired-sibling = 24+ 파일이 한 폴더에 — grep / git diff 가독성 저하). 워크스트림 폴더 안에 흡수 (BMC.md → product-brief 합성을 BMC 폴더에 두면 합성-소스 관계가 가려짐; 4 Type A는 원래 다중 워크스트림 합성물).

- **A-D02: PRODUCT-BRIEF 합성 소스 = OBJECTIVES.md immutable intent + BMC canvas.md + GTM.md.** 자동 합성 후 사용자 검토. `<product_vision>` ← OBJECTIVES.md `## Immutable Intent`; `<core_value>` ← OBJECTIVES.md PROJECT.md derive; `<target_user>` ← BMC `## Customer Segments` + GTM `## Personas`; `<value_prop>` ← BMC `## Value Proposition`. 사용자가 PM 첫 PRD 입력으로 사용 가능한 1-2 페이지.
  - **Rejected:** OBJECTIVES.md만 (lossless dump — vision은 잡히나 customer/value-prop이 빠짐); 9 워크스트림 모두 (FINANCIAL projection / RISK register는 PRD 입력에 부적절, noise).

- **A-D03: SERVICE-POLICY B2B/B2C 분기 처리 = 1개 템플릿 + design-prompts.md conditional prose blocks.** Phase 5 D-15 / Phase 7 D-14 패턴 byte-identity 인계. `service-policy.md` 단일 파일에 B2B 변형 (SLA tiers / enterprise support / data processing terms / contract terms) + B2C 변형 (refund policy / customer support hours / channel coverage / community guidelines)을 conditional prose blocks로 분기. 워크스트림 agent가 `<business_context>` 블록 (Phase 5 D-13 `context-inject.cjs`)에서 `business_model` 읽고 매칭 prose 적용.
  - **Rejected:** 2개 별도 파일 (`service-policy.b2b.md`, `service-policy.b2c.md`) — 패턴 분기 (다른 워크스트림은 1 파일 + conditional, SERVICE-POLICY만 2 파일이면 패턴 일관성 위반); 인터랙티브 사용자 선택 (B2B/B2C는 OBJECTIVES.md `business_model`에 이미 lock; 다시 묻는 것은 Pitfall #9 마찰).

- **A-D04: HIGH-LEVEL-SPEC + FEATURE-MAP = 9 워크스트림 산출물 + OBJECTIVES.md 기반 자동 초안.** 사용자 검토 후 commit. `HIGH-LEVEL-SPEC.md`: TECH-ARCH `## Component Map` + ROADMAP `## Phased Roadmap` + RISK `## Critical Risks` 합성, PRD 표 of contents 구조 (functional scope + priority + dependency). `FEATURE-MAP.md`: TECH-ARCH 컴포넌트 + BMC value proposition 매핑한 Mermaid `mindmap` 또는 ASCII 트리.
  - **Rejected:** skeleton만 제공 (사용자가 9개 워크스트림 산출물 수동 합성 — 자동화 가치 0); incremental contribute (각 워크스트림이 끝날 때 HIGH-LEVEL-SPEC에 자기 섹션 append — 복잡성 증가, atomic commit 깨짐).

### Area B — Type B Marp 데크 + 4-layer audience 방어막

- **B-D01: 파일명 audience encoding 규약 = `{name}.{confidentiality}.{ext}`.** 예: `internal-deck.confidential.pptx`, `proposal-deck.partner.pptx`, `exec-summary.public.md`. Pitfall #5 권고 ("Filename encoding of audience: `INVESTOR-IR.external.deck.md` vs `DECISION-MEMO.internal-confidential.memo.md`. Audience is in the filename, not just frontmatter")와 일치. confidentiality enum (Phase 5 D-10 lock): `public / partner / internal / confidential`. 파일명에 노출되어 사용자가 Finder/email 첨부 시 즉각 식별 가능.
  - **Rejected:** `{name}.{audience.type}.{ext}` (audience.type는 internal/external 2값으로 거칠음 — confidentiality가 더 운영적 의미); 두 필드 결합 `{name}.{audience}.{confidentiality}.{ext}` (파일명 길이 폭증, OS 한도 위험, 가독성 저하).

- **B-D02: 첫 슬라이드 워터마크 메커니즘 = Marp directive + literal first-slide content.** Marp 데크에 다음 frontmatter directive 자동 삽입:
  ```yaml
  ---
  marp: true
  theme: default
  paginate: true
  footer: '{watermark_text}'   # Marp directive — 모든 슬라이드 footer
  ---
  ```
  + 첫 슬라이드(Cover slide)에 literal content 삽입:
  ```markdown
  # {Title}
  
  > **{watermark_text}**
  
  Generated {date} by BRIEF
  ```
  `watermark_text` 결정 규칙:
  - `confidentiality: public` → "Public"
  - `confidentiality: partner` → "Partner-only — Do not redistribute"
  - `confidentiality: internal` → "Internal — Do not distribute outside {organization}"
  - `confidentiality: confidential` → "CONFIDENTIAL — Internal use only — Do not share"
  - region: kr 일 때 ko 우선: "공개", "파트너 전용 — 재배포 금지", "내부용 — {조직명} 외 배포 금지", "기밀 — 내부 사용만 — 공유 금지"
  - **Rejected:** Marp footer global watermark만 (Cover slide에 강조 워터마크 없으면 첫 인상에서 confidentiality 인지 약함); 별도 cover slide injection script (Marp directive 패턴이 더 단순 + portable).

- **B-D03: `/brief-export` 인터랙션 = 1단계 confirm.** render 직전 화면에 audience+confidentiality 표시 + AskUserQuestion accept. Pitfall #5 mandatory checkpoint 직접 응답:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BRIEF ► EXPORT CONFIRMATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
   Artifact: proposal-deck.md
   Audience: external-partner
   Confidentiality: partner
   Output:    proposal-deck.partner.pptx
   Watermark: "Partner-only — Do not redistribute"
  
   AUDIENCE gate: AUDIENCE-OK ✓
   COMPLIANCE gate: COMPLIANCE-OK ✓
   Cross-artifact leakage diff: 0 findings ✓
  
  ── Render this artifact for partner audience? ──
   [Yes, render] / [No, cancel]
  ```
  AUDIENCE/COMPLIANCE BLOCKING이거나 leakage finding 있으면 별도 3-path interrupt 분기 (C-D01, C-D02 참고).
  - **Rejected:** 2단계 confirm (audience 확인 → render 옵션 선택) — UX 중복; frontmatter `export_approved: true` 자동 (사용자가 한 번 lock하면 영원히 우회 — Pitfall #5 핵심 방어 무력화).

- **B-D04: CC-03 pre-commit Frontmatter Validator hook 설치 = BRIEF setup 자동.** `hooks/brief-validate-frontmatter.sh` 새 PreToolUse hook. `bin/install.js`가 `brief-validate-provenance.sh` / `brief-validate-commit.sh`와 동일 패턴으로 자동 copy + dist에 등록. opt-in via `.planning/config.json` `hooks.community: true` (Phase 5 D-06 패턴 byte-identity 인계). hook 동작:
  - `git commit` 명령에서만 작동
  - staged `.planning/**/*.md` 파일 enumerate
  - 각 파일 frontmatter 파싱 (Phase 2 D-20 `frontmatter.cjs` 또는 인라인 30줄 CJS validator)
  - mandatory 필드 검증: `audience.type`, `audience.confidentiality`, `voice.tone`, `voice.perspective`, `business_context.model` (Phase 5 D-10 schema + Phase 8 추가 voice 2 필드)
  - 결측/오류 시 exit 2 + 한국어/영어 구조화 에러 (region: kr 시 ko 우선)
  - **Rejected:** 사용자가 명시적으로 `/brief-init-hooks` 실행 (잊기 쉬움 → CC-03 빈 약속); 항상 활성 (opt-out 없음 — 기존 hook 패턴 위반, dogfooding 사용자 friction).

### Area C — AUDIENCE/COMPLIANCE 게이트 격상 (Type B hard block)

- **C-D01: Type B AUDIENCE BLOCKING 처리 = Marp render 자체 안 함.** `/brief-export` 워크플로우 안에서 AUDIENCE 게이트 재실행 (Phase 5 `audience.cjs` 인계, run-id로 기존 verdict와 분리). 처리 분기:
  - **AUDIENCE-OK** → render 진행 (B-D03 1단계 confirm 후)
  - **DRIFTED-frontmatter** → 3-path interrupt (Phase 5 D-09 byte-identity): `frontmatter 수정` / `이 데크 다시 쓰기` / `force-accept` (audit trail + reason 필수)
  - **DRIFTED-content** → 3-path interrupt: `content 재작성` / `데크 cancel` / `force-accept` (audit trail + reason 필수)
  - force-accept 시 STATE.md `state.brief.last_gate_results.audience.override` + `override_reason` + `override_at` 기록 (Phase 4 D-07 패턴)
  - COMPLIANCE FINDINGS-BLOCKING도 동일 분기 (FINDINGS-MATERIAL은 caveat 표시 후 진행)
  - **Rejected:** 항상 markdown만 commit + Marp render 별도 명령 (사용자가 render 명령을 직접 호출하면 audience 게이트 우회 가능); force-accept 금지 (CEO 책임 시나리오 — pilot 단계에서 force-accept가 필요한 합법 케이스 존재; audit trail로 책임 추적이 더 적절).

- **C-D02: cross-artifact leakage diff (Pitfall #5, Phase 5→8 deferred) = `/brief-export` 시 같은 폴더 내 키워드 diff.** 알고리즘:
  - 현재 export 대상 산출물의 confidentiality 추출 (예: `proposal-deck.md` → `partner`)
  - 같은 폴더(`.planning/deliverables/type-b/`) 안에서 confidentiality가 더 strict한 산출물 (예: `internal-deck.md` → `confidential`) enumerate
  - 더 strict 산출물의 본문에서 distinctive 키워드 추출 (TF-IDF 상위 20개; 또는 휴리스틱: 고유명사, 숫자, 전문 용어 5+ 글자)
  - 현재 산출물 본문에서 이 키워드 등장 검사 → 3+ 매치 시 leakage 의심 → finding emit (FINDINGS-MATERIAL severity)
  - finding 본문: "고기밀 산출물 `{strict_artifact}`의 키워드 [...]가 현재 산출물에 등장합니다. 의도된 공유인지 확인하세요." (region: kr 시 ko 우선)
  - 사용자에게 finding 표시 + AskUserQuestion: `누설 검토 후 cancel` / `의도된 공유 — 진행`
  - **Rejected:** defer to Phase 9 HRD-04 pilot (Phase 5에서 Phase 8로 명시 deferred — 더 미루면 v1 누설 위험 미해결); 항상 활성 (모든 commit 시 — TF-IDF 비용 큼, commit latency 증가).

- **C-D03: AI slop check (banned-words, Pitfall #10) 통합 위치 = Type B agent prompt + 생성 후 regex post-check (1회 regenerate).** 아키텍처:
  - Type B agent prompt (`agents/brief-deliver-type-b.md` 또는 4종별 분리)에 banned-words list 흡수: `leverage / synergize / transform / holistic / delve / groundbreaking / best-in-class / seamless / cutting-edge / revolutionary / game-changing / landscape / unlock / empower / robust / innovative` (Pitfall #10 + Phase 5 D-08 vocabulary-ban 패턴 일관)
  - region: kr 시 한국어 banned-words 추가: `혁신적인 / 차별화된 / 게임체인저 / 패러다임 시프트 / 시너지 / 활용 / 최적화 / 글로벌 스탠더드` (Pitfall #11 ko-culture context)
  - agent 출력 후 즉시 regex post-check (`brief/bin/lib/voice-fit.cjs` 신규 lib): banned-word density 계산
  - density > 2/page 시 → agent에게 1회 재생성 지시 (`<feedback>banned words [...] detected. regenerate avoiding these terms.</feedback>`)
  - 재생성 후에도 density > 2/page → AUDIENCE 게이트와 별개 voice-fit finding emit (FINDINGS-MATERIAL)
  - AUDIENCE 게이트의 deterministic screen 키워드 리스트 (`TBD`, `we believe`, `concerns`, `미해결`, `우려` — Phase 5 D-09 인계)와 별도 운영 — banned-words는 AI slop 신호, hedging은 audience-fit 신호
  - **Rejected:** AUDIENCE 게이트 내 deterministic screen 확장 (캐노니컬 게이트 패턴 4번째 instance lock 후 변경 — Phase 4·5·7 vocabulary-lock test가 깨짐); 별도 voice-fit-guard 게이트 (5번째 게이트 추가는 surface 복잡성, lib 재사용으로 충분).

- **C-D04: Concreteness 검증 (Pitfall #10) = Type B agent prompt 자가 검증 + exemplar 인라인.** 별도 게이트 추가 안 함:
  - agent prompt에 concreteness 규칙 명시: "모든 claim은 다음 중 하나에 답해야 한다 — `compared to what?` / `by how much?` / `when?`. 예: 'we deliver innovative solutions' (실패) → 'We reduce 15-person legal review cycles from 3 weeks to 4 days' (통과)."
  - 2-3개 hand-written exemplar 인라인 (Pitfall #10 권고 "Style examples mandatory: each Type B artifact agent ships with 2-3 hand-written exemplars of good writing in its prompt context"). exemplar는 워크스트림별 — INVESTOR-IR style, EXEC-SUMMARY style, DECISION-MEMO style.
  - region: kr 시 ko exemplar 추가 (한국 투자자/임원 어조: 격식체 + 구체 수치 + 출처 명시)
  - 자가 검증 실패 시 agent가 자체 재작성 — 별도 lib 호출 없음 (Pitfall #10 가벼운 mitigation, pilot 후 강화)
  - **Rejected:** 별도 concreteness-guard 게이트 (Pitfall #10이 강조하는 "compared to what" 검증은 LLM-judge가 잘 수행 — 별도 lib 비용 vs 효과 균형에서 prompt-내 자가 검증이 충분); defer to Phase 9 HRD-04 pilot (현재 Phase 8이 Type B 산출물 첫 실전 — slop 위험 즉각 차단 필요).

### Area D — Type B 데크 schema + ko/en 처리

- **D-D01: INTERNAL-DECK / PROPOSAL-DECK 표준 슬라이드 구조 = 7-9 슬라이드 (Sequoia/YC 변형).** 캐노니컬 슬라이드 sequence:
  1. **Cover** — 워터마크 (B-D02), 제목, 날짜
  2. **Problem** — BMC `## Customer Segments` + `## Customer Jobs` 합성
  3. **Solution** — BMC `## Value Proposition` + Type A `PRODUCT-BRIEF.md ## Core Value`
  4. **Market** — DISCOVER `market-sizing.md` (provenance tag 보존)
  5. **Strategy or Traction** — INTERNAL-DECK은 `Strategy` (BMC `## Key Activities` + GTM `## Channels`); PROPOSAL-DECK은 `Traction` (RISK 제외, partner-safe content만)
  6. **Roadmap** — ROADMAP 워크스트림 산출물 합성
  7. **Ask** — INTERNAL-DECK: 임원 의사결정 요청; PROPOSAL-DECK: 파트너십 제안 / 다음 단계
  8. (선택) **Team** — OPERATIONS `## Team` (small team만, redacted for partner)
  9. (선택) **Appendix** — 참고 데이터, FINANCIAL summary (INTERNAL-only)
  자동 매핑: 9 워크스트림 산출물 → 슬라이드 마크다운 source. 사용자 검토 후 `/brief-export`로 PPTX render.
  - **Rejected:** 자유 구조 (Marp markdown만 제공 — 사용자가 매번 슬라이드 결정; 일관성 없음 + Pitfall #9 비개발자 마찰); 4종 산출물별 별도 구조 (Type B 4종이 모두 Cover/Problem/Solution 코어를 공유 — 분기는 Strategy vs Traction 슬라이드에서만, 별도 schema는 과도).

- **D-D02: EXEC-SUMMARY / DECISION-MEMO 형식 = 1-2페이지 markdown.** 두 산출물 형식 분기:
  - **EXEC-SUMMARY.md** — narrative 5-section: `## Context` (1단락) → `## Problem` (1-2단락) → `## Recommendation` (3-5 bullets) → `## Risks` (3-5 bullets, RISK 워크스트림 인계) → `## Ask` (1단락 + 명확한 의사결정 요청)
  - **DECISION-MEMO.md** — ADR 변형: `## Context` → `## Decision` (1-2 sentences, "We will [verb] [object] because [reason]") → `## Alternatives Considered` (3+ rejected options + rationale) → `## Consequences` (positive + negative + neutral)
  - 둘 다 1-2 페이지 (~500-1000 words). Marp render 안 함 (markdown만; 사용자가 직접 PDF로 변환 가능).
  - **Rejected:** 자유 형식 (사용자 작성 — 자동화 가치 0); 4-section 단일 표준 (EXEC-SUMMARY와 DECISION-MEMO는 의도가 다름 — 합치면 둘 다 약화).

- **D-D03: region: kr 일 때 ko/en 처리 정책 = ko 우선 emit, en은 opt-in.** 분기:
  - region: kr (Phase 3 D-04 `state.brief.region == "kr"` 검출) → 모든 Type A + Type B 산출물 한국어로 우선 emit (`{name}.md` = ko 단일)
  - en 옵트인 경로 1: `/brief-deliver --en` — 추가로 `{name}.en.md` 페어 emit
  - en 옵트인 경로 2: 산출물 frontmatter `voice.languages: [ko, en]` 명시 → 항상 ko/en 페어 emit
  - region: 그 외 → en 단일 (`{name}.md`)
  - Phase 5 D-13 한국어-우선 패턴 byte-identity 인계 (`buildBusinessContext()` 헬퍼가 region 신호 → agent prompt에 ko 우선 instruction 주입)
  - **Rejected:** 항상 ko/en 동시 emit (`{name}.ko.md` + `{name}.en.md`) — 비용 2배, 비활성 언어 유지 부담 (Pitfall #11 명시 — bilingual은 region: kr에 한정한 추천이지 mandatory 아님); 사용자가 매번 선택 (Pitfall #9 마찰 — region 신호로 자동 결정이 더 자연스러움).

- **D-D04: 한국어 honorific / 투자자 문화 가드 (Pitfall #11) = Type B agent prompt 인라인 가이드.** 별도 게이트 추가 안 함:
  - agent prompt에 명시: "모든 한국어 산출물은 격식체(-습니다)로 작성. 투자자/임원 문화: founder reliability + long-term relationship signals 강조 — 'Trust is built before terms are discussed'. 단기 ROI보다 비전 + 팀 안정성 + 장기 파트너십 시그널."
  - region: kr exemplar (D-D02 / D-D01 슬라이드 sample) — 한국 투자자 어조 시연
  - 자가 검증: 한국어 산출물에 반말/구어체 (`-야`, `-지` 등) 등장 시 agent 자체 재작성
  - 별도 lib 호출 없음 (Pitfall #11 가벼운 mitigation)
  - **Rejected:** 별도 ko-culture-guard 게이트 (5번째 게이트 추가 — surface 복잡성); defer to Phase 9 HRD-04 pilot (Phase 8 Type B는 한국 투자자/임원 첫 노출 — culture mismatch 위험 즉각 차단).

### Meta-Discipline

- **D-17: "적정선" lock 인계 (Phase 3 D-08 / Phase 4 D-10 / Phase 5 D-16 / Phase 7).** 4 영역 (A/B/C/D) 모두 인터랙티브 사용자-확인 추천 옵션으로 resolve. 16 결정 (A-D01..D-04, B-D01..D-04, C-D01..D-04, D-D01..D-04) lock. Planner / executor / verifier는 구현 수준 미해결 (정확한 banned-words 리스트, exemplar 본문, Marp theme 디테일, 슬라이드 layout pixel값, 테스트 fixture 모양)을 자체 결정; A-D01..D-D04를 수정해야 할 갭이 surface될 때만 CONTEXT 토론으로 복귀.

### Claude's Discretion

planner 재량으로 결정 가능:

- **Marp theme** — Marp는 default / gaia / uncover 3개 빌트인 theme + custom theme 지원. INTERNAL-DECK은 default (실용적), PROPOSAL-DECK은 gaia (외부 인상) 추천. theme 파일 위치 (`brief/templates/deliver/marp-themes/`) 및 brand color 변수화는 planner 결정.
- **banned-words 정확한 리스트** — C-D03 시드 16개 영어 + 8개 한국어. 실행 중 false positive/negative 발견 시 planner가 ban-list 확장 procedure 정의 (Phase 4 ALIGN vocabulary-ban 인계).
- **2-3개 hand-written exemplar 본문** — C-D04 시드 ("compared to what / by how much / when" 통과 예시). EXEC-SUMMARY style / INVESTOR-IR style / DECISION-MEMO style 별로 1개씩 (총 3개). region: kr 시 ko exemplar 추가. exemplar 본문 정확한 prose는 planner가 prompt 엔지니어링 결정.
- **TF-IDF 키워드 추출 알고리즘 디테일** — C-D02 cross-artifact leakage diff. 단순 TF-IDF vs n-gram vs 휴리스틱 (고유명사 + 숫자) — planner 결정. 정확도와 commit latency 균형.
- **Marp invocation 명령 디테일** — `npx --yes @marp-team/marp-cli@4.3.1 input.md -o output.{pptx|pdf|html} [--theme name] [--allow-local-files]`. fallback 순서 (PPTX 실패 시 PDF, PDF 실패 시 HTML) 및 환경 검사 (Chrome/Edge presence) 절차는 planner 결정.
- **slope 변경 4종 산출물별 agent 분리 vs 통합** — `agents/brief-deliver-type-a.md` + `agents/brief-deliver-type-b.md` 2개로 통합 vs 8개 산출물 each (Type A 4 + Type B 4) 분리. 추천: 2개 통합 (Phase 5 D-01 ONE parameterized agent 패턴 인계 — `{{ARTIFACT}}` parameterize). planner가 prompt 분기 복잡도 보고 결정.
- **Cross-artifact diff 결과 finding 본문 prose** — C-D02 finding 메시지 정확한 wording (Korean / English). Phase 4 D-11 / Phase 5 D-09 vocabulary 패턴 인계 (recovery-oriented, blame 없음).
- **Marp environment fallback 문서화 위치** — Marp `npx --yes` 첫 invocation 지연 / Chrome/Edge 필수 / LibreOffice 선택 문서를 CLAUDE.md에 둘지, README.md에 둘지, `brief/references/marp-environment.md` 신규 파일에 둘지. planner 결정.
- **Type A 4종 자동 합성 알고리즘** — A-D02..A-D04에서 합성 소스만 결정. 정확한 합성 로직 (어떤 섹션을 어떻게 머지하는가, 충돌 시 우선순위) — planner가 워크스트림별 매핑 테이블 정의.
- **`/brief-export` --type-a 동작** — Type A 산출물도 `/brief-export` 거쳐야 하는가, 아니면 markdown commit만으로 충분한가. 추천: Type A는 `/brief-export` 불필요 (markdown만, audience encoding 없음). Type B만 `/brief-export` 필요. planner 결정 + CONTEXT 명시.
- **state.brief.* allowlist 확장** — Phase 8이 새로 쓰는 state 필드 (예: `state.brief.deliverable_index`, `state.brief.last_export_at`). Phase 2 D-21 allowlist 확장 절차 따름. 필요 시 planner가 plan-phase에서 결정.
- **canary scope** — Phase 8 canary E2E. 추천: Korea-first B2C fintech fixture (Phase 5/7 inheritance) 위에 `/brief-deliver --type-a` (4 산출물 자동 합성) + `/brief-deliver --type-b internal-deck` (Marp render + AUDIENCE OK + watermark + filename encoding) + `/brief-deliver --type-b proposal-deck` (cross-artifact leakage diff trigger 검증) 3-flow. CC-03 hook 활성 검증 별도. planner가 fixture 정확한 모양 + commit granularity 결정.
- **commit granularity** — 추천 atomic commit 분해 (각 buildable):
  1. `commands/brief/deliver.md` + `brief/workflows/deliver.md` + `brief/bin/lib/deliver.cjs` (Type A 자동 합성 로직)
  2. `commands/brief/export.md` + `brief/workflows/export.md` + `brief/bin/lib/export.cjs` (1단계 confirm + AUDIENCE/COMPLIANCE 재실행 + leakage diff)
  3. `agents/brief-deliver-type-a.md` + Type A 4 템플릿 (`brief/templates/deliver/type-a/`)
  4. `agents/brief-deliver-type-b.md` + Type B 4 템플릿 (`brief/templates/deliver/type-b/`) + Marp theme files
  5. `brief/bin/lib/voice-fit.cjs` (banned-words + concreteness post-check) + tests
  6. `brief/bin/lib/leakage-diff.cjs` (TF-IDF cross-artifact 키워드 diff) + tests
  7. `hooks/brief-validate-frontmatter.sh` + `bin/install.js` 등록 + tests
  8. Korea-first canary E2E + cross-runtime parity test + Marp invocation smoke test

### Folded Todos

(No todos matched Phase 8 scope — `gsd-sdk query todo.match-phase 8` returned 0 results.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level decisions and requirements
- `.planning/PROJECT.md` — "Audience guard: every artifact carries audience/confidentiality/voice frontmatter; leakage is blocked", "Type A — Product/service policy artifacts", "Type B — Communication artifacts", "Audience guard runs on every Type B artifact (confidentiality + voice fit)" key decisions.
- `.planning/REQUIREMENTS.md` §Phase 3 (DELIVER) — **DLV-01 through DLV-09** (4 Type A + 4 Type B + mandatory `/brief-export` confirmation + audience encoded in filename + first-slide watermark) + **CC-03** (pre-commit Frontmatter Validator git hook). 10 requirements total — all traceable to A-D01..D-D04.
- `.planning/ROADMAP.md` lines 177-190 — Phase 8 goal + 5 success criteria + Pitfall coverage (#5 audience leakage, #4 compliance theater, #11 Korean cultural gotchas).
- `.planning/ASSUMPTIONS.md` — A1 VERIFIED (zero runtime dependencies — Phase 8 MUST NOT add `gray-matter` / `ajv` / `js-yaml` / `@marp-team/marp-cli` to `dependencies`; use `npx --yes` + 인라인 30줄 CJS validator).

### Prior-phase context (locked decisions Phase 8 inherits)
- `.planning/phases/02-stable-seam-anchor-schema-caps-workstream-as-config/02-CONTEXT.md` — Phase 2 **D-06..D-09** (Surface Caps — Phase 8 NET +2 commands `/brief-deliver` + `/brief-export` 인 한도 내), **D-18** (workflow-markdown + lib.cjs split; <~400 lines/file), **D-20 / D-21** (frontmatter.cjs serializer + state allowlist — CC-03 hook validator + new `state.brief.*` fields 인계).
- `.planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md` — Phase 3 **D-04** (`state.brief.region` Korea-signal + business_model — D-D03 ko/en 분기 + D-D04 한국 문화 가드 read), **D-08** ("적정선" lock; carries into Phase 8 D-17), **D-11** (Korea-signal detection — `voice-fit.cjs` ko banned-words 인계), **D-12** (block-style error tone — CC-03 hook 에러 메시지 인계).
- `.planning/phases/04-first-gate-align-pattern-established/04-CONTEXT.md` — Phase 4 **D-07** (force-accept with audit trail — C-D01 Type B AUDIENCE BLOCKING force-accept 패턴), **D-09** (vocabulary-lock — C-D03 banned-words ban-list 패턴 일관), **D-11** (Korean-preferred-vocabulary — D-D04 ko exemplar 인계).
- `.planning/phases/05-discover-parallel-research-with-provenance-audience-context-injection/05-CONTEXT.md` — Phase 5 **D-09** (AUDIENCE 3-output verdict — C-D01 Type B 재실행 게이트 byte-identity), **D-10** (frontmatter schema 3 mandatory + 3 auto — CC-03 hook validator 동일 schema), **D-11** (paired-sibling filename `{artifact}.audience.md` — Type B에서도 동일), **D-13 / D-14** (`buildBusinessContext()` + `context-inject.cjs` — D-D03 region: kr 신호 / D-D04 한국 문화 가드 인계), **D-15** (B2B/B2C conditional prose blocks — A-D03 SERVICE-POLICY 분기 패턴 byte-identity).
- `.planning/phases/06-bidirectional-foundation-phase-1-2-return-stack/06-CONTEXT.md` — Phase 6 (DELIVER에서 return-stack 사용 안 함; Type B 산출물은 ALIGN/AUDIENCE/COMPLIANCE 게이트로 충분).
- `.planning/phases/07-design-workstream-orchestration-compliance-checker/07-CONTEXT.md` — Phase 7 **D-01** (COMPLIANCE 3-output verdict — C-D01 Type B에서 동일 vocabulary), **D-02** (sequential gate execution ALIGN→AUDIENCE→COMPLIANCE — `/brief-export` 시 동일 순서 재실행), **D-12** (paired-sibling 4종 통일 — Type B에서도 `{artifact}.compliance.md` 생성), **D-14** (B2B/B2C conditional prose blocks — A-D03 byte-identity), 9 workstream artifact 위치 (`.planning/workstreams/{name}/`) — A-D02..A-D04 합성 source.

### Research synthesis (Phase 8-specific)
- `.planning/research/PITFALLS.md` §Pitfall #5 (Audience Leakage in Type B Artifacts) — **Phase 8 핵심 mitigation**: filename encoding (B-D01) + watermark (B-D02) + mandatory `/brief-export` (B-D03) + cross-artifact diff (C-D02) — 4-layer 방어막 모두 직접 응답. CC-03 hook (B-D04)이 Layer 4 "audit time" 강제.
- `.planning/research/PITFALLS.md` §Pitfall #10 (AI Slop in Type B Artifacts) — banned-words list (C-D03) + concreteness check (C-D04) + style examples mandatory (C-D04 exemplar) — 3개 mitigation 모두 직접 응답.
- `.planning/research/PITFALLS.md` §Pitfall #11 (Korean Cultural Gotchas) — bilingual `.ko.md`/`.en.md` (D-D03 변형 — region:kr ko 우선 + en opt-in), honorific guard (D-D04), Korean investor culture note (D-D04 inline guide) — 3개 mitigation 직접 응답.
- `.planning/research/PITFALLS.md` §Anti-pattern #2 (Hook-spawned gates) — `/brief-export`의 AUDIENCE/COMPLIANCE 재실행은 explicit orchestrator step (NOT PostToolUse / SubagentStop). Phase 4·5·7 패턴 byte-identity 인계.
- `.planning/research/STACK.md` §Marp CLI — `@marp-team/marp-cli@4.3.1` invoke via `npx --yes`, NOT `dependencies`. Chrome/Edge 필수 (rendering); LibreOffice Impress 선택 (편집 가능 PPTX); HTML/PDF/non-editable PPTX은 LibreOffice 없어도 작동. Pandoc fallback 문서화 (Marp 미가동 시).
- `.planning/research/STACK.md` §Sequoia / YC pitch-deck — D-D01 INTERNAL/PROPOSAL 7-9 슬라이드 표준 source.

### Files Phase 8 will create or modify

**NEW files:**
- `commands/brief/deliver.md` — **NEW** 사용자 명령 #1. `/brief-deliver --type-a` (4 Type A 자동 합성) + `/brief-deliver --type-b <name>` (Type B 데크 source markdown 생성).
- `commands/brief/export.md` — **NEW** 사용자 명령 #2. `/brief-export <artifact>` (1단계 confirm + AUDIENCE/COMPLIANCE 재실행 + cross-artifact leakage diff + Marp render).
- `brief/workflows/deliver.md` — Type A/B 오케스트레이션 워크플로우.
- `brief/workflows/export.md` — Export confirm + 게이트 재실행 + Marp invocation 워크플로우.
- `brief/bin/lib/deliver.cjs` — Type A 자동 합성 로직 (workstream 산출물 + OBJECTIVES.md → 4 Type A 산출물 합성).
- `brief/bin/lib/export.cjs` — `/brief-export` 핵심: AUDIENCE/COMPLIANCE 재실행 dispatcher + leakage diff trigger + Marp invocation wrapper.
- `brief/bin/lib/voice-fit.cjs` — banned-words regex post-check + concreteness 자가 검증 트리거 + 1회 regenerate dispatch.
- `brief/bin/lib/leakage-diff.cjs` — TF-IDF cross-artifact 키워드 diff (FINDINGS-MATERIAL emit).
- `agents/brief-deliver-type-a.md` — Type A 자동 합성 agent (parameterized — `{{ARTIFACT}}` ∈ {PRODUCT-BRIEF, SERVICE-POLICY, HIGH-LEVEL-SPEC, FEATURE-MAP}).
- `agents/brief-deliver-type-b.md` — Type B 데크/문서 agent (parameterized — `{{ARTIFACT}}` ∈ {INTERNAL-DECK, PROPOSAL-DECK, EXEC-SUMMARY, DECISION-MEMO}); banned-words list + concreteness 규칙 + region:kr exemplar 인라인.
- `brief/templates/deliver/type-a/` — 4 Type A markdown 템플릿:
  - `product-brief.md` (OBJECTIVES + BMC + GTM 합성 schema)
  - `service-policy.md` (B2B/B2C conditional prose blocks)
  - `high-level-spec.md` (TECH-ARCH + ROADMAP + RISK 합성 schema)
  - `feature-map.md` (Mermaid mindmap 또는 ASCII 트리)
- `brief/templates/deliver/type-b/` — 4 Type B 템플릿:
  - `internal-deck.md` (Marp frontmatter + 7-9 슬라이드 sequence)
  - `proposal-deck.md` (Marp frontmatter + 7-9 슬라이드 sequence + partner-safe content)
  - `exec-summary.md` (5-section narrative)
  - `decision-memo.md` (ADR 4-section)
- `brief/templates/deliver/marp-themes/` — Marp custom theme files (default / partner / internal — brand color variables).
- `hooks/brief-validate-frontmatter.sh` — **NEW** PreToolUse hook (B-D04). Mirrors `hooks/brief-validate-provenance.sh` shape + opt-in `hooks.community: true`. Mandatory 필드: `audience.type` / `audience.confidentiality` / `voice.tone` / `voice.perspective` / `business_context.model`.
- `brief/references/marp-environment.md` — **NEW** Marp 환경 의존성 + fallback 문서 (Chrome/Edge 필수, LibreOffice 선택, npx 첫 invocation 지연 caveat).
- `tests/brief-deliver-*.test.cjs` — 신규 테스트 fixtures: Type A 자동 합성, Type B Marp render, AUDIENCE 재실행 force-accept audit trail, cross-artifact leakage diff TF-IDF 정확도, banned-words density, concreteness exemplar match, ko/en 분기, CC-03 hook validator 결측 frontmatter 차단, vocabulary-lock for new lib.

**MODIFIED files:**
- `bin/install.js` — 신규 SRC 튜플: `commands/brief/deliver.md`, `commands/brief/export.md`, `agents/brief-deliver-type-a.md`, `agents/brief-deliver-type-b.md`, `hooks/brief-validate-frontmatter.sh`, workflow + lib + template + reference 파일들.
- `brief/bin/brief-tools.cjs` — 신규 subcommand: `deliver` (dispatches to `deliver.cjs`), `export` (dispatches to `export.cjs`), `voice-fit` (lib 직접 호출용 dev subcommand), `leakage-diff` (동일).
- `brief/bin/lib/state.cjs` — Phase 2 D-21 allowlist 확장: `state.brief.deliverable_index`, `state.brief.last_export_at`, `state.brief.last_gate_results.audience.override` (Phase 4 D-07 인계 — Phase 8에서 Type B force-accept 시 첫 실전 사용).
- `brief/bin/lib/status.cjs` — `formatGate` 확장: Type B force-accept override 표시.
- `bin/install.js` (별도 hunk) — `hooks/brief-validate-frontmatter.sh` HOOKS_TO_COPY 배열에 추가.
- `CLAUDE.md` — Marp 환경 의존성 (Chrome/Edge + LibreOffice optional) "Constraints" 섹션에 명시. Phase 8 NET +2 commands `/brief-deliver` + `/brief-export` Surface Caps 섹션에 정확한 카운트 업데이트.
- `.planning/STATE.md` — Phase 8 진행 상태 + Phase 8 완료 시 last_export_at 첫 실전 쓰기.
- `docs/ARCHITECTURE.md` — commands/agents/hooks/workflows count 업데이트 (Phase 1 HALT-ACCEPTED 인계 — count drift는 Phase 9 HRD-05에서 closure).

### Inherited primitives Phase 8 must NOT break

- STATE.md file lock (atomic commits) — `/brief-deliver` 와 `/brief-export`는 산출물 + sibling .audience.md + sibling .compliance.md + STATE.md를 atomic 1 commit으로 작성.
- Multi-runtime detection — `/brief-deliver` Type B 선택 + `/brief-export` 1단계 confirm은 Claude Code, Codex, Gemini, OpenCode 모두에서 작동 (FND-06). `AskUserQuestion` → numbered-list in text_mode.
- `node:test` + c8 70% line threshold.
- Zero runtime dependencies rule (A1) — `gray-matter` / `ajv` / `js-yaml` / `@marp-team/marp-cli` 모두 `dependencies` 추가 금지. 인라인 CJS validator + `npx --yes` 패턴 유지.
- CLAUDE.md Surface Caps — Phase 8 NET commands 정확히 +2 (`/brief-deliver`, `/brief-export`); 추가 명령 (`/brief-render`, `/brief-watermark`, `/brief-confirm`) 금지. Phase 9 HRD-02 가지치기 책임.
- 캐노니컬 게이트 패턴 (3-output / paired-sibling / vocabulary-lock) — Type B AUDIENCE 재실행 + COMPLIANCE 재실행 모두 Phase 4·5·7 vocabulary 그대로 사용. `compliant` / `passed` / 녹색 체크마크 금지.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (inheritance from Phase 1-7)

**Phase 4·5·7 게이트 인프라가 Phase 8의 `/brief-export` 게이트 재실행 substrate:**
- **`brief/bin/lib/audience.cjs`** (Phase 5) — `audience run / commit / verdict` 동사 세트. Phase 8 `/brief-export`가 run-id로 재실행 호출 (artifact + run-id → 새 verdict 생성, 기존 verdict와 분리).
- **`agents/brief-audience-guard.md`** (Phase 5) — `{{ARTIFACT_PATH}}` parameterize. Phase 8에서 동일 agent 호출, run-id만 다름.
- **`brief/bin/lib/compliance.cjs`** (Phase 7) — `compliance run / commit / verdict`. 동일 패턴 재실행.
- **`agents/brief-compliance-checker.md`** (Phase 7) — `{{ARTIFACT_PATH}}` parameterize.

**Phase 5 D-13/D-14 context-inject — Phase 8 agent spawn에서 동일 사용:**
- **`brief/bin/lib/context-inject.cjs`** — `buildBusinessContext()` 헬퍼. Phase 8 Type A agent + Type B agent 모두 spawn 직전에 호출 → `<business_context>` 블록을 prompt에 inject. region: kr 신호 → ko 우선 instruction. business_model → B2B/B2C conditional prose 분기.

**Phase 5 D-06 hook 패턴 — Phase 8 CC-03 hook 직접 인계:**
- **`hooks/brief-validate-provenance.sh`** (Phase 5) + **`hooks/brief-validate-commit.sh`** (existing) — **TEMPLATE** for `hooks/brief-validate-frontmatter.sh`. 동일 PreToolUse 형태; 동일 opt-in `hooks.community: true` 게이트; 동일 한국어/영어 에러 형식 (region: kr 시 ko 우선); 동일 `git commit` filter; 동일 staged file enumeration.

**Phase 7 D-12/D-14 워크스트림 산출물 layout — Phase 8 Type A 자동 합성 source:**
- **`.planning/workstreams/business-model-canvas/canvas.md`** + 페어드-시블링 — Phase 8 PRODUCT-BRIEF + HIGH-LEVEL-SPEC 합성 read.
- **`.planning/workstreams/go-to-market/go-to-market.md`** + 페어드-시블링 — PRODUCT-BRIEF + INTERNAL/PROPOSAL deck `Strategy` 슬라이드 read.
- **`.planning/workstreams/financial/financial.md`** + drivers.md — INTERNAL deck `Appendix` 슬라이드 read (FINANCIAL은 partner deck에서 제외 — partner-safe).
- **`.planning/workstreams/operations/operations.md`** — INTERNAL deck `Team` 슬라이드 read.
- **`.planning/workstreams/compliance/compliance.md`** + 페어드-시블링 — Type A SERVICE-POLICY B2B variant `data processing terms` 섹션 read.
- **`.planning/workstreams/roadmap/roadmap.md`** — Type A HIGH-LEVEL-SPEC + Type B `Roadmap` 슬라이드 read.
- **`.planning/workstreams/brand/brand.md`** — Type B agent prompt voice/tone 파라미터 source.
- **`.planning/workstreams/risk/risk.md`** — Type A HIGH-LEVEL-SPEC + Type B `Risks` (EXEC-SUMMARY) read; partner deck에서 제외.
- **`.planning/workstreams/tech-arch/tech-arch.md`** — Type A HIGH-LEVEL-SPEC + Type A FEATURE-MAP 자동 합성 source.

**Phase 3 Korea-signal + Phase 4 vocabulary — Phase 8 D-D03/D-D04에서 직접 사용:**
- **`brief/bin/lib/objectives.cjs`** (Phase 3) — `state.brief.region` / `business_model` / `audience_policy` 읽기. Phase 8 `voice-fit.cjs` + `deliver.cjs` 가 region 신호 → ko 우선 분기 + 한국 banned-words 추가.
- **`brief/references/align-vocabulary.md`** (Phase 4) + **`brief/references/audience-vocabulary.md`** (Phase 5) + **`brief/references/compliance-vocabulary.md`** (Phase 7) — Phase 8 `voice-fit.cjs` ban-list 패턴 일관 source.

**Phase 2 D-18/D-20/D-21 — Phase 8 신규 lib + state allowlist 직접 인계:**
- **`brief/bin/lib/frontmatter.cjs`** (Phase 2 D-20) — round-trips nested maps + null + arrays-of-objects. Type A/B 산출물 frontmatter (audience.type, confidentiality, voice.tone, voice.perspective, business_context.model + 신규 voice.languages) 직접 사용.
- **`brief/bin/lib/state.cjs`** (Phase 2 D-21) — `buildStateFrontmatter` allowlist 확장 (D-17 범위 외 — planner 결정).
- **`brief/bin/lib/status.cjs`** (Phase 2 D-15) — `formatGate` 확장 패턴 — Phase 8에서 Type B force-accept override 표시 추가.

**Phase 1 D-09 atomic commit — Phase 8 `/brief-deliver` + `/brief-export` 직접 인계:**
- 모든 commit은 atomic + buildable. `/brief-deliver --type-b internal-deck`은 source.md + sibling .audience.md (재실행 결과) + sibling .compliance.md (재실행 결과) + STATE.md를 atomic 1 commit. `/brief-export`는 source.md + .pptx (또는 .pdf) + STATE.md (last_export_at) atomic.

### Established Patterns

- **Workflow markdown + lib.cjs split** (Phase 2 D-18) — Phase 8 `deliver.md` + `deliver.cjs` + `export.md` + `export.cjs` 모두 동일 패턴. <~400 lines/file.
- **Agent file + workflow file + lib file triad** — Phase 4 ALIGN / Phase 5 AUDIENCE / Phase 7 COMPLIANCE 패턴. Phase 8: Type A + Type B agent + workflow + lib 동일 shape.
- **Atomic commit per logical step** (Phase 1 D-09) — D-17 commit granularity 8단계 추천.
- **Fixture-based tests with Korea-first persona** (Phase 3/4/5/7 인계) — Phase 8 fixture는 Korea-first B2C fintech 위에 4 Type A + 4 Type B 산출물 + 4-layer 방어막 검증.
- **`text_mode` fallback** (Phase 1 FND-06) — `/brief-deliver --type-b` 선택 + `/brief-export` 1단계 confirm 모두 `AskUserQuestion` OR numbered-list (runtime 별).
- **Sequential 3-gate threading** (Phase 7 D-02) — Type B `/brief-export` 안에서 ALIGN → AUDIENCE → COMPLIANCE 재실행 (gate 자체는 fail-fast).
- **3-output verdict + paired-sibling + vocabulary-lock** (Phase 4 D-09 / Phase 5 D-09 / Phase 7 D-01) — Type B에서 AUDIENCE/COMPLIANCE 재실행 시 동일 vocabulary. Phase 4·5·7 ban-list test가 Phase 8에서도 작동.
- **Force-accept with audit trail** (Phase 4 D-07) — Type B AUDIENCE BLOCKING force-accept 첫 실전 사용. STATE.md `state.brief.last_gate_results.audience.override` + `override_reason` + `override_at`.
- **Paired-sibling filename `{artifact}.{gate}.md`** (Phase 5 D-11 / Phase 7 D-12) — Type B 산출물도 동일: `internal-deck.audience.md`, `internal-deck.compliance.md`.

### Integration Points

- **`commands/brief/deliver.md`** — 신규 사용자 명령 (NET +1).
- **`commands/brief/export.md`** — 신규 사용자 명령 (NET +1).
- **`brief-tools.cjs deliver / export / voice-fit / leakage-diff`** — 신규 subcommand dispatch.
- **`brief/references/marp-environment.md`** — Marp 환경 문서화. CLAUDE.md "Constraints"에서 참조.
- **`hooks/brief-validate-frontmatter.sh`** — `bin/install.js` HOOKS_TO_COPY 배열에 추가; `hooks/dist/`에 빌드.
- **`brief/templates/deliver/{type-a|type-b}/`** — 8 산출물 markdown 템플릿. `deliver.cjs` 가 합성 시 source.

### Risk Notes

- **Marp 환경 의존성은 critical fail mode.** Chrome/Edge 부재 시 PPTX render 자체 실패; LibreOffice 부재 시 편집 가능 PPTX 불가. `/brief-export`가 환경 검사 필수 (Chrome/Edge presence 확인) + fallback 명확히 안내. `npx --yes` 첫 invocation은 최대 30-60s 지연 — 사용자 알림 필요. planner는 Marp invocation smoke test (Korea-first canary) 의무.
- **AUDIENCE/COMPLIANCE 게이트 재실행 비용.** `/brief-export`마다 ALIGN + AUDIENCE + COMPLIANCE 3 게이트 재실행 = 3 LLM Task. 4 Type B 산출물 × 3 게이트 = 12 LLM Task per full DELIVER. 비용 예상 + cache 전략 (gate 결과가 아직 fresh면 재실행 skip — staleness 정책 planner 결정).
- **Force-accept 무차별 사용 위험.** C-D01 force-accept는 audit trail 보장하지만 사용자가 매번 누르면 Pitfall #5 핵심 방어 무력화. CLAUDE.md / `/brief-help` / 첫 force-accept 시 경고 prompt 등 행동 가드 (planner 결정).
- **Cross-artifact leakage diff (C-D02) false positive 위험.** TF-IDF 키워드 추출은 일반 명사 (예: "고객", "시장") 매치 시 false positive 다수. 임계값 (3+ 매치) + 필터 (stop words 제외, 5+ 글자, 고유명사 우선) 디테일이 핵심. planner는 TF-IDF 알고리즘 + 임계값 정확도 검증 (canary fixture에서 의도된 leak vs 무의도 매치 분리).
- **AI slop check (C-D03) regenerate 무한 루프 방지.** 1회 regenerate 후에도 banned-words density > 2/page → finding emit + 사용자 분기 (강제 진행 vs revise). 무한 regenerate 금지.
- **CC-03 hook (B-D04) opt-in 미설정 시 silent no-op.** `hooks.community: false`인 dogfooding 사용자가 Type B 산출물 commit하면 frontmatter 미검증. CLAUDE.md / `/brief-help`에서 명시 안내 + Phase 9 HRD-04 pilot에서 default opt-in 검토.
- **D-D03 ko/en 분기는 region 신호에만 의존.** `state.brief.region == "kr"` 자동 ko 우선 emit. region 미설정 (Phase 3에서 사용자가 누락) 시 en default. planner는 region 미설정 fallback (en default + warning) 명확히 정의.
- **D-D01 슬라이드 sequence 자동 매핑은 워크스트림 산출물 dependency.** INTERNAL/PROPOSAL deck 합성 시 BMC + GTM + ROADMAP + RISK + TECH-ARCH 산출물이 모두 존재해야 자동 매핑 작동. 일부 워크스트림만 완료된 상태에서 deck 생성 시 빠진 슬라이드 placeholder + warning ("ROADMAP 워크스트림 미완료 — Roadmap 슬라이드 placeholder"). planner는 dependency check + graceful degradation 정의.
- **8 산출물 템플릿 + 8 자동 합성 = ~3000 lines new code.** Phase 8은 Phase 7 다음으로 무거운 phase. plan 분해 (D-17 8 commit) 충실히 따라야 atomic + buildable 유지. wave 기반 plan 병렬화 (Phase 5/7 패턴).
- **Type A/Type B agent 통합 vs 분리 (Claude's Discretion).** parameterized 단일 agent 추천 (Phase 5 D-01 패턴) — `{{ARTIFACT}}` 매개변수로 8 산출물 분기. 통합 시 prompt 복잡성 증가; 분리 시 8 파일 = surface 복잡성 + DRY 위반. planner가 prompt 분기 합리성 보고 결정.

</code_context>

<specifics>
## Specific Ideas

- **Phase 8은 Phase 5 AUDIENCE 인프라의 첫 실전 hard block.** Phase 5에서는 finding emit + 사용자 interrupt (정책상 사용자 선택). Phase 8 Type B에서는 hard block (render 자체 거부) — force-accept만이 우회 경로 (audit trail 강제). 캐노니컬 게이트 패턴이 "soft warning"에서 "hard policy"로 격상되는 첫 사례. C-D01 force-accept audit trail이 핵심 — 책임 추적 가능. **HIGH flag if force-accept가 무차별 사용되면 Pitfall #5 방어 무력화.**

- **4-layer 방어막은 모두 작동해야 함 — 어느 layer라도 우회 가능하면 누설.**
  - Layer 1 (filename encoding) 우회: 사용자가 수동으로 파일명 변경 → CC-03 hook이 frontmatter도 검증하므로 audience 일치 검사 (필요 시 hook 강화).
  - Layer 2 (워터마크) 우회: 사용자가 markdown 편집 → 워터마크 삭제 → CC-03 hook이 first-slide content 검증 (Marp directive + first-slide 모두 체크).
  - Layer 3 (`/brief-export` confirm) 우회: 사용자가 `npx marp-cli` 직접 호출 → CLAUDE.md / `/brief-help`에서 명시 경고 ("`/brief-export` 우회는 audience 방어막 제거"). pilot에서 검증.
  - Layer 4 (CC-03 hook) 우회: `hooks.community: false`로 opt-out → README/CLAUDE.md에서 명시 ("Type B 산출물 작업 시 opt-in 권장"). 또는 `--no-verify` git flag 사용 → 일반적으로 사용자 책임 영역.

- **Marp `npx --yes` invocation pattern은 zero-deps 유지의 핵심.** `dependencies` 추가하면 BRIEF의 "GSD lightness" 약속 깨짐 + 모든 사용자 install 시 ~50 MB 증가. `npx --yes`는 사용자 선택 (필요 시만 download) — STACK.md A4 가정. 4 runtime sandbox 모두에서 `npx` 작동 확인 = Phase 9 HRD-01 cross-runtime smoke test 책임. **MEDIUM flag for runtime sandbox network restrictions** (예: enterprise 환경에서 `npx` 차단).

- **C-D02 cross-artifact leakage diff는 Pitfall #5에서 명시 deferred.** Phase 5에서 "Phase 8 DELIVER 영역에서 다중 Type B 산출물이 같은 폴더에 공존할 때 의미 있음" — 정확히 이 시나리오. TF-IDF 키워드 추출 + 임계값 + 필터 디테일이 정확도 결정. canary fixture에서 의도된 leak ("PROPOSAL-DECK가 INTERNAL-DECK의 전략 키워드를 그대로 복사") vs 무의도 매치 ("두 deck 모두 '고객' 단어 등장") 명확히 분리.

- **C-D04 concreteness exemplar는 hand-written이 핵심.** Pitfall #10이 명시: "각 Type B agent는 2-3개 hand-written exemplar 함께 ship". LLM-generated exemplar는 그 자체로 slop 위험. planner / executor가 직접 작성 의무. region: kr 시 ko exemplar (한국 투자자 어조: 격식체 + 구체 수치 + 출처 명시) 추가 hand-written.

- **D-D04 한국어 honorific guard는 격식체(-습니다) 강제.** 모든 한국어 산출물에 반말 / 구어체 (`-야`, `-지`, `-라구요`) 등장 시 agent 자체 재작성. 한국 투자자/임원 문화는 격식이 trust signal — 반말은 "캐주얼 = 미숙" 인식. **별도 게이트 없음** — agent prompt 인라인이 가벼운 mitigation. pilot 후 강화 가능.

- **`/brief-deliver` 8 산출물 모두 자동 합성.** 사용자는 `/brief-deliver --type-a`로 4 Type A 한 번에 받음. `/brief-deliver --type-b internal-deck` 등 Type B 4종은 산출물별 별도 invocation (Marp render 비용 + audience 게이트 재실행 비용 분리). PRD에 "사용자 요청 시" 산출물별 분리는 합리.

- **Force-accept 첫 실전 사용은 Phase 8.** Phase 4 D-07이 force-accept 패턴 ship; Phase 5/7은 finding emit + 사용자 선택만. Phase 8에서 force-accept가 처음 audit trail에 기록 (state.brief.last_gate_results.audience.override = true + override_reason + override_at). planner는 STATE.md schema 첫 실전 쓰기 검증.

- **`/brief-export` 1단계 confirm 화면은 사용자 첫 인상.** B-D03 표시 형식이 명확해야 audience+confidentiality 즉각 인지. 파일명 + 워터마크 텍스트 + 게이트 verdict 3개를 한 화면에 (한국어/영어 region 별). pilot에서 사용자가 "이게 맞는 audience인가?" 즉각 판단 가능해야 함 — Pitfall #9 비개발자 마찰.

- **Type A 자동 합성은 사용자 검토 필수.** A-D02..A-D04 자동 합성은 PRD의 "초안" — 사용자가 검토 후 commit. agent가 합성 후 사용자에게 화면 표시 + AskUserQuestion: `commit as-is` / `edit before commit` / `regenerate with feedback`. PRD 책임자(PM)가 최종 승인 의무.

</specifics>

<deferred>
## Deferred Ideas

(Phase 8 토론에서 surface했지만 다른 phase 영역에 속함 — 누락 방지용 기록)

- **별도 voice-fit-guard 게이트 (5번째 캐노니컬 게이트)** — C-D03에서 reject. Phase 9 HRD-04 pilot에서 banned-words density 빈발 시 게이트 격상 검토.
- **별도 concreteness-guard 게이트** — C-D04에서 reject. Phase 9 HRD-04 pilot 후 "compared to what" 자가 검증 실패율 모니터링 → v1.x에서 게이트 격상 검토.
- **별도 ko-culture-guard 게이트** — D-D04에서 reject. Phase 9 HRD-04 pilot에서 한국 투자자/임원 culture mismatch 빈발 시 v1.x 게이트 추가.
- **CC-03 hook always-active (opt-out 없음)** — B-D04에서 reject. Phase 9 HRD-04 pilot 후 opt-in 미설정 사용자 비율 → default opt-in 검토.
- **CC-V2-01 클로즈 레벨 한국 compliance 콘텐츠** — Phase 5 1-page primer 인계, Phase 8 변경 없음. v2.
- **DLV-V2-01 INVESTOR-IR (Series A pitch deck)** — REQUIREMENTS.md v2 명시 deferred. Phase 8은 INTERNAL-DECK + PROPOSAL-DECK + EXEC-SUMMARY + DECISION-MEMO 4종만. v2.
- **다중 Type B 산출물 batch render** — `/brief-deliver --type-b all`로 4 Type B를 한 번에 render. v1은 산출물별 별도 invocation (audience 게이트 재실행 비용 분리). v1.x에서 batch 검토.
- **Marp custom theme 사용자 정의 UI** — `brief/templates/deliver/marp-themes/`에 default + partner + internal 3 theme ship; 사용자 custom theme 추가 가능 but 명시적 UI 없음. v1.x.
- **사용자 정의 banned-words list 확장 UI** — C-D03 시드 16개 영어 + 8개 한국어. 사용자가 도메인 별 추가 (예: 의료 슬랭, 핀테크 슬랭) UI 없음. `brief/references/banned-words.md` 직접 편집 가능 but 명시 UI 없음. v1.x.
- **Type A의 `/brief-export` 처리** — Claude's Discretion 추천: Type A는 markdown만, `/brief-export` 불필요. v1.x에서 PDF export 등 사용자 요청 시 추가 검토.
- **PPTX 외 출력 포맷 (Keynote, Google Slides API)** — Marp는 PPTX/PDF/HTML만. Keynote은 Apple-specific, Google Slides는 OAuth 복잡성. v2.
- **Cross-runtime smoke test for `/brief-deliver` + `/brief-export`** — Phase 9 HRD-01에서 Codex/Gemini/OpenCode 4 runtime 모두 작동 검증.
- **Surface count audit ≤12 commands** — Phase 8 NET +2 (`/brief-deliver`, `/brief-export`). Phase 9 HRD-02에서 가지치기.
- **Pilot 피드백 기반 슬라이드 sequence 조정** — D-D01 7-9 슬라이드 sequence는 Sequoia/YC 변형. pilot에서 한국 투자자 / 한국 파트너 선호 sequence 다를 수 있음 — Phase 9 HRD-04 데이터 후 v1.x 조정.
- **Reviewed Todos (not folded)** — no Phase 8-matching todos surfaced (`gsd-sdk query todo.match-phase 8` returned 0 matches).

</deferred>

---

*Phase: 08-deliver-type-a-type-b-audience-enforcement-marp*
*Context gathered: 2026-04-26*
*Discussion mode: Smart discuss (autonomous-optimized) — 4 gray areas (A: Type A 산출물 묶음; B: Type B Marp 데크 + 4-layer audience 방어막; C: AUDIENCE/COMPLIANCE 게이트 격상; D: Type B 데크 schema + ko/en 처리). 16 decisions (A-D01..D-04, B-D01..D-04, C-D01..D-04, D-D01..D-04) + 1 meta-discipline (D-17). All "Accept all (Recommended)"; no area re-opened.*
