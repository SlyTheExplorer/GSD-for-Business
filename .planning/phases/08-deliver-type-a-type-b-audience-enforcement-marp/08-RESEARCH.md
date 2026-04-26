# Phase 8: DELIVER — Type A + Type B + AUDIENCE Enforcement + Marp - Research

**Researched:** 2026-04-26
**Domain:** Multi-artifact deliverable orchestration (Markdown synthesis + Marp PPTX/PDF/HTML rendering) with 4-layer audience defense, gate re-execution from Phase 4·5·7 substrate, AI slop & concreteness mitigation, Korean-first ko/en branching, atomic CC-03 frontmatter pre-commit hook
**Confidence:** HIGH (inherited gate substrate + Marp CLI verified against npm registry); MEDIUM (TF-IDF leakage diff false-positive control — depends on canary fixture validation); LOW (force-accept audit trail behavior in real pilot — first live use)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Area A — Type A 산출물 묶음**

- **A-D01: Type A 산출물 위치 = `.planning/deliverables/type-a/`.** Type B는 `.planning/deliverables/type-b/`로 분리. 페어드-시블링 게이트 패턴(`{artifact}.audience.md`, `{artifact}.compliance.md`)은 동일 폴더 안에 공존. 워크스트림 산출물(`brief/workstreams/{name}/`)과 명확히 분리.
- **A-D02: PRODUCT-BRIEF 합성 소스 = OBJECTIVES.md immutable intent + BMC canvas.md + GTM.md.** 자동 합성 후 사용자 검토. `<product_vision>` ← OBJECTIVES.md `## Immutable Intent`; `<core_value>` ← OBJECTIVES.md PROJECT.md derive; `<target_user>` ← BMC `## Customer Segments` + GTM `## Personas`; `<value_prop>` ← BMC `## Value Proposition`.
- **A-D03: SERVICE-POLICY B2B/B2C 분기 처리 = 1개 템플릿 + design-prompts.md conditional prose blocks.** Phase 5 D-15 / Phase 7 D-14 패턴 byte-identity 인계.
- **A-D04: HIGH-LEVEL-SPEC + FEATURE-MAP = 9 워크스트림 산출물 + OBJECTIVES.md 기반 자동 초안.**

**Area B — Type B Marp 데크 + 4-layer audience 방어막**

- **B-D01: 파일명 audience encoding 규약 = `{name}.{confidentiality}.{ext}`.** 예: `internal-deck.confidential.pptx`, `proposal-deck.partner.pptx`. Confidentiality enum (Phase 5 D-10 lock): `public / partner / internal / confidential`.
- **B-D02: 첫 슬라이드 워터마크 메커니즘 = Marp directive + literal first-slide content.** Marp `footer:` directive + literal Cover slide watermark. region:kr 일 때 ko 우선 ("공개", "파트너 전용 — 재배포 금지", "내부용 — {조직명} 외 배포 금지", "기밀 — 내부 사용만 — 공유 금지").
- **B-D03: `/brief-export` 인터랙션 = 1단계 confirm.** render 직전 화면에 audience+confidentiality 표시 + AskUserQuestion accept.
- **B-D04: CC-03 pre-commit Frontmatter Validator hook 설치 = BRIEF setup 자동.** `hooks/brief-validate-frontmatter.sh` 새 PreToolUse hook. opt-in via `hooks.community: true` (Phase 5 D-06 패턴 byte-identity 인계). Mandatory 필드: `audience.type`, `audience.confidentiality`, `voice.tone`, `voice.perspective`, `business_context.model`.

**Area C — AUDIENCE/COMPLIANCE 게이트 격상**

- **C-D01: Type B AUDIENCE BLOCKING 처리 = Marp render 자체 안 함.** `/brief-export` 워크플로우 안에서 AUDIENCE 게이트 재실행. 분기:
  - **AUDIENCE-OK** → render 진행 (B-D03 1단계 confirm 후)
  - **DRIFTED-frontmatter / DRIFTED-content** → 3-path interrupt (Phase 5 D-09 byte-identity): `frontmatter 수정` / `이 데크 다시 쓰기` / `force-accept` (audit trail + reason 필수)
  - force-accept 시 STATE.md `state.brief.last_gate_results.audience.override` + `override_reason` + `override_at` 기록 (Phase 4 D-07 패턴)
  - COMPLIANCE FINDINGS-BLOCKING도 동일 분기 (FINDINGS-MATERIAL은 caveat 표시 후 진행)
- **C-D02: cross-artifact leakage diff = `/brief-export` 시 같은 폴더 내 키워드 diff.** 현재 export 대상 산출물의 confidentiality 추출 → 같은 폴더 안에서 더 strict한 산출물 enumerate → TF-IDF 키워드 추출 (상위 20개) → 3+ 매치 시 finding emit (FINDINGS-MATERIAL severity).
- **C-D03: AI slop check (banned-words) 통합 위치 = Type B agent prompt + 생성 후 regex post-check (1회 regenerate).** `brief/bin/lib/voice-fit.cjs` 신규 lib. density > 2/page 시 1회 regenerate. AUDIENCE 게이트와 별개 운영.
- **C-D04: Concreteness 검증 = Type B agent prompt 자가 검증 + exemplar 인라인.** 별도 게이트 추가 안 함. agent prompt에 "compared to what / by how much / when" 규칙 명시 + 2-3개 hand-written exemplar.

**Area D — Type B 데크 schema + ko/en 처리**

- **D-D01: INTERNAL-DECK / PROPOSAL-DECK 표준 슬라이드 구조 = 7-9 슬라이드 (Sequoia/YC 변형).** Cover → Problem → Solution → Market → Strategy(INTERNAL)/Traction(PROPOSAL) → Roadmap → Ask → (Team) → (Appendix).
- **D-D02: EXEC-SUMMARY / DECISION-MEMO 형식 = 1-2페이지 markdown.** EXEC-SUMMARY: narrative 5-section. DECISION-MEMO: ADR 4-section. Marp render 안 함.
- **D-D03: region: kr 일 때 ko/en 처리 정책 = ko 우선 emit, en은 opt-in.** region: kr → ko 단일 (`{name}.md`). en opt-in: `/brief-deliver --en` 또는 frontmatter `voice.languages: [ko, en]`.
- **D-D04: 한국어 honorific / 투자자 문화 가드 = Type B agent prompt 인라인 가이드.** 별도 게이트 없음. 격식체(-습니다) 강제 + 한국 투자자 문화 시그널.

**Meta-Discipline**

- **D-17: "적정선" lock 인계 (Phase 3 D-08 / Phase 4 D-10 / Phase 5 D-16 / Phase 7).** 4 영역 모두 lock. 16 결정 lock. Planner / executor / verifier는 구현 수준 미해결을 자체 결정.

### Claude's Discretion

planner 재량으로 결정:

- **Marp theme** — INTERNAL-DECK은 default (실용적), PROPOSAL-DECK은 gaia (외부 인상) 추천. theme 파일 위치 (`brief/templates/deliver/marp-themes/`) 및 brand color 변수화.
- **banned-words 정확한 리스트** — C-D03 시드 16개 영어 + 8개 한국어. ban-list 확장 procedure.
- **2-3개 hand-written exemplar 본문** — EXEC-SUMMARY style / INVESTOR-IR style / DECISION-MEMO style 별로 1개씩. region: kr 시 ko exemplar 추가.
- **TF-IDF 키워드 추출 알고리즘 디테일** — 단순 TF-IDF vs n-gram vs 휴리스틱 (고유명사 + 숫자). 정확도와 commit latency 균형.
- **Marp invocation 명령 디테일** — `npx --yes @marp-team/marp-cli@4.3.1 input.md -o output.{pptx|pdf|html} [--theme name] [--allow-local-files]`. fallback 순서 (PPTX → PDF → HTML).
- **Type A/Type B agent 통합 vs 분리** — 추천: 2개 통합 (Phase 5 D-01 ONE parameterized agent 패턴 인계 — `{{ARTIFACT}}` parameterize).
- **Cross-artifact diff 결과 finding 본문 prose** — Phase 4 D-11 / Phase 5 D-09 vocabulary 패턴 인계.
- **Marp environment fallback 문서화 위치** — CLAUDE.md / README.md / `brief/references/marp-environment.md` 신규 파일 결정.
- **Type A 4종 자동 합성 알고리즘** — 워크스트림별 매핑 테이블.
- **`/brief-export` --type-a 동작** — 추천: Type A는 `/brief-export` 불필요 (markdown만, audience encoding 없음). Type B만 `/brief-export` 필요.
- **state.brief.* allowlist 확장** — `state.brief.deliverable_index`, `state.brief.last_export_at`. Phase 2 D-21 allowlist 확장 절차 따름.
- **canary scope** — 추천: Korea-first B2C fintech fixture 위에 `/brief-deliver --type-a` + `/brief-deliver --type-b internal-deck` + `/brief-deliver --type-b proposal-deck` 3-flow.
- **commit granularity** — 8 atomic commit 분해 (각 buildable):
  1. `commands/brief/deliver.md` + `brief/workflows/deliver.md` + `brief/bin/lib/deliver.cjs`
  2. `commands/brief/export.md` + `brief/workflows/export.md` + `brief/bin/lib/export.cjs`
  3. `agents/brief-deliver-type-a.md` + Type A 4 템플릿
  4. `agents/brief-deliver-type-b.md` + Type B 4 템플릿 + Marp theme files
  5. `brief/bin/lib/voice-fit.cjs` + tests
  6. `brief/bin/lib/leakage-diff.cjs` + tests
  7. `hooks/brief-validate-frontmatter.sh` + `bin/install.js` 등록 + tests
  8. Korea-first canary E2E + cross-runtime parity test + Marp invocation smoke test

### Deferred Ideas (OUT OF SCOPE)

(Phase 8 토론에서 surface했지만 다른 phase 영역에 속함 — 누락 방지용 기록)

- **별도 voice-fit-guard 게이트 (5번째 캐노니컬 게이트)** — C-D03에서 reject. Phase 9 HRD-04 pilot 후 검토.
- **별도 concreteness-guard 게이트** — C-D04에서 reject. Phase 9 HRD-04 pilot 후 v1.x 검토.
- **별도 ko-culture-guard 게이트** — D-D04에서 reject. Phase 9 HRD-04 pilot 후 v1.x 검토.
- **CC-03 hook always-active (opt-out 없음)** — B-D04에서 reject. Phase 9 HRD-04 pilot 후 검토.
- **CC-V2-01 클로즈 레벨 한국 compliance 콘텐츠** — Phase 5 1-page primer 인계, Phase 8 변경 없음. v2.
- **DLV-V2-01 INVESTOR-IR (Series A pitch deck)** — REQUIREMENTS.md v2 명시 deferred. Phase 8은 INTERNAL-DECK + PROPOSAL-DECK + EXEC-SUMMARY + DECISION-MEMO 4종만.
- **다중 Type B 산출물 batch render** — `/brief-deliver --type-b all`. v1은 산출물별 별도 invocation. v1.x 검토.
- **Marp custom theme 사용자 정의 UI** — v1.x.
- **사용자 정의 banned-words list 확장 UI** — `brief/references/banned-words.md` 직접 편집 가능 but 명시 UI 없음. v1.x.
- **Type A의 `/brief-export` 처리** — 추천: Type A는 `/brief-export` 불필요. v1.x에서 PDF export 등 사용자 요청 시 추가 검토.
- **PPTX 외 출력 포맷 (Keynote, Google Slides API)** — Marp는 PPTX/PDF/HTML만. v2.
- **Cross-runtime smoke test for `/brief-deliver` + `/brief-export`** — Phase 9 HRD-01.
- **Surface count audit ≤12 commands** — Phase 8 NET +2. Phase 9 HRD-02에서 가지치기.
- **Pilot 피드백 기반 슬라이드 sequence 조정** — Phase 9 HRD-04 데이터 후 v1.x.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **DLV-01** | User runs `/brief-deliver --type-a` and obtains `PRODUCT-BRIEF.md` (vision + core value + target user, suitable as PM's first PRD input) | §Type A Synthesis Mapping (this doc) — A-D02 매핑: OBJECTIVES.md `## Immutable Intent` + BMC `## Customer Segments` + `## Value Proposition` + GTM `## Personas` |
| **DLV-02** | User obtains `SERVICE-POLICY.md` whose template structure varies by `business_model` (B2B variant: SLA tiers, enterprise support, data processing terms, contract terms; B2C variant: refund policy, customer support hours, channel coverage, community guidelines) | §Conditional Prose Blocks Pattern — A-D03 = Phase 5 D-15 / Phase 7 D-14 byte-identity 인계 |
| **DLV-03** | User obtains `HIGH-LEVEL-SPEC.md` (functional scope + priority + dependency, structured as PRD table-of-contents) | §Type A Synthesis Mapping — A-D04 매핑: TECH-ARCH `## Component Map` + ROADMAP `## Phased Roadmap` + RISK `## Critical Risks` 합성 |
| **DLV-04** | User obtains `FEATURE-MAP.md` (feature tree as Mermaid mindmap or ASCII) | §Type A Synthesis Mapping — A-D04 매핑: TECH-ARCH 컴포넌트 + BMC value proposition Mermaid mindmap 또는 ASCII tree |
| **DLV-05** | User runs `/brief-deliver --type-b internal-deck` and obtains a Marp-rendered deck file (.md source + rendered PPTX/PDF via `npx --yes @marp-team/marp-cli`) targeted at internal executives | §Marp CLI Invocation + §Type B Slide Sequence — D-D01 7-9 슬라이드 Sequoia/YC 변형 |
| **DLV-06** | User runs `/brief-deliver --type-b proposal-deck` and obtains an externally-safe proposal deck with confidentiality `partner` (no internal strategy leakage) | §4-Layer Audience Defense + §Cross-Artifact Leakage Diff — Layer 1 filename + Layer 2 watermark + Layer 4 hook + C-D02 TF-IDF leakage diff |
| **DLV-07** | User obtains `EXEC-SUMMARY.md` (1-2 page narrative 5-section) and `DECISION-MEMO.md` (1-2 page ADR 4-section) on demand | §Type B Slide Sequence — D-D02 EXEC-SUMMARY narrative 5-section / DECISION-MEMO ADR 4-section schema |
| **DLV-08** | User cannot export any Type B artifact without an explicit `/brief-export` confirmation step (mandatory checkpoint before deck rendering) | §`/brief-export` 1-Step Confirm UI — B-D03 화면 형식 (artifact / audience / confidentiality / output / watermark / 3 게이트 verdict 표시) + AskUserQuestion |
| **DLV-09** | User obtains rendered Type B output with audience encoded in filename (e.g., `proposal-deck.partner.pptx`) and a literal first-slide watermark stating the confidentiality level visible in the rendered output (not just markdown comment) | §4-Layer Audience Defense — Layer 1 (B-D01 filename) + Layer 2 (B-D02 Marp directive `footer:` + literal first-slide content) |
| **CC-03** | User cannot commit a `.planning/` artifact whose frontmatter violates schema (missing `audience.type`, `audience.confidentiality`, `voice.tone`, etc.) and the pre-commit Frontmatter Validator git hook (installed by BRIEF setup) blocks the commit with a structured error | §CC-03 Pre-Commit Hook Pattern — B-D04 = `hooks/brief-validate-provenance.sh` shape inheritance, opt-in via `hooks.community: true`, mandatory 5 frontmatter fields validated via inline 30-line CJS validator (no `gray-matter`/`ajv` runtime dep) |
</phase_requirements>

## Summary

Phase 8 ships the LAST runtime feature phase before Phase 9 hardening. The substrate (audience.cjs, compliance.cjs, context-inject.cjs, frontmatter.cjs, state.cjs, brief-validate-provenance.sh) is **fully present** from Phases 4·5·7 — Phase 8 is composition + escalation + new specialized libs, NOT new gate primitives. Eight atomic-buildable commits (per D-17 8-commit recommendation) deliver: (1) `/brief-deliver` orchestrator over 8 final artifacts (4 Type A markdown PRD-inputs auto-synthesized from 9 workstream outputs + 4 Type B Marp deck/memo source); (2) `/brief-export` as the mandatory single-checkpoint gate on Type B that re-runs ALIGN→AUDIENCE→COMPLIANCE in sequence (Phase 7 D-02 byte-identity), wraps the cross-artifact leakage diff (deferred from Phase 5), and dispatches `npx --yes @marp-team/marp-cli@4.3.1` for PPTX/PDF/HTML render; (3) two new specialized libs — `voice-fit.cjs` for AI-slop banned-words + concreteness post-check (1-shot regenerate) and `leakage-diff.cjs` for TF-IDF cross-artifact keyword diff; (4) one new pre-commit hook (`brief-validate-frontmatter.sh`) byte-identical in shape to `brief-validate-provenance.sh` plus its `bin/install.js` PreToolUse registration; (5) NET +2 user commands (`/brief-deliver`, `/brief-export`) — under Phase 9 HRD-02 audit cap. The 4-layer audience defense (filename encoding + literal first-slide watermark + mandatory `/brief-export` confirm + opt-in CC-03 hook) is the direct response to Pitfall #5 byte-identity recommendation.

The two highest-stakes risks are (a) AUDIENCE/COMPLIANCE force-accept devolving to a mindless "press OK" workflow that nullifies the canonical defense — mitigated only by the audit trail (`state.brief.last_gate_results.audience.override` + `override_reason` + `override_at`, Phase 4 D-07 first live use); and (b) Marp environmental dependencies (Chrome/Edge MUST be present to render PPTX/PDF; LibreOffice optional for editable PPTX), which can fail at render time with no graceful in-band recovery — mitigated by an environment-detect step inside `/brief-export` and a documented PDF→HTML fallback ladder. The TF-IDF leakage diff is a v1.0 first-cut (3+ keyword match threshold, deferred from Phase 5) whose false-positive rate must be characterized empirically against the Korea-first B2C fintech canary fixture.

**Primary recommendation:** Implement the 8 atomic commits in the D-17-recommended order. Treat `/brief-export` as the architectural keystone — every defense layer either runs inside it (Layers 1, 2, 3) or runs as the LAST line of defense at commit time (Layer 4). Do NOT add any new gate vocabulary, NOT add any runtime dependency, NOT add any 5th canonical gate (voice-fit / concreteness / ko-culture all live inline in agent prompts per Pitfall #10/#11 mitigation discipline — pilot data drives any v1.x escalation to gates).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Slash command dispatch (`/brief-deliver`, `/brief-export`) | Inherited BRIEF core (`commands/brief/*.md` + `brief-tools.cjs` subcommand) | — | Two new commands ship as `commands/brief/{deliver,export}.md`; `brief-tools.cjs` adds case 'deliver' / 'export' / 'voice-fit' / 'leakage-diff' (last two are dev-only dispatchers). NET +2 user-facing commands stays under the ≤12 cap |
| Type A markdown auto-synthesis (4 artifacts) | New `brief/bin/lib/deliver.cjs` (Markdown composition) | Phase 7 workstream artifacts (`brief/workstreams/{name}/`) | Pure file-reading + section-extraction + template-fill. No LLM call required for skeleton; LLM agent (`agents/brief-deliver-type-a.md` parameterized by `{{ARTIFACT}}`) fills in narrative sections |
| Type B Marp deck source generation (4 artifacts) | New `agents/brief-deliver-type-b.md` (parameterized by `{{ARTIFACT}}`) | New `brief/templates/deliver/type-b/*.md` (Marp frontmatter + 7-9 slide sequence) | Agent reads workstream artifacts via Phase 5 `buildBusinessContext()` injection; produces Marp-ready markdown with `footer:` directive + literal Cover slide watermark; `voice-fit.cjs` post-checks |
| Marp PPTX/PDF/HTML rendering | External binary `npx --yes @marp-team/marp-cli@4.3.1` | Chrome/Edge browser (MANDATORY for PPTX/PDF/PNG); LibreOffice Impress (OPTIONAL for editable PPTX) | A1 zero-deps preserved — invoked via npx pattern matching `npx -y brief-cc@latest` precedent in `brief/workflows/update.md`. NEVER added to `dependencies` |
| 4-layer audience defense — Layer 1 (filename) | `brief/bin/lib/export.cjs` | Frontmatter `audience.confidentiality` enum (Phase 5 D-10 lock) | Filename pattern `{name}.{confidentiality}.{ext}` written by export.cjs after AUDIENCE-OK |
| 4-layer audience defense — Layer 2 (watermark) | `brief/templates/deliver/type-b/*.md` (Marp `footer:` + Cover slide template) | Type B agent prompt (literal first-slide content) | Marp-native — survives PPTX export to all slides via footer; first-slide watermark survives copy-paste in markdown source |
| 4-layer audience defense — Layer 3 (1-step confirm) | `brief/bin/lib/export.cjs` AskUserQuestion + text_mode fallback | Multi-runtime detection (Phase 1 FND-06 inheritance) | Mandatory checkpoint inside `/brief-export`; cannot be bypassed unless user manually runs `npx marp-cli` (documented as user-responsibility breach) |
| 4-layer audience defense — Layer 4 (CC-03 hook) | `hooks/brief-validate-frontmatter.sh` (shell PreToolUse) | `bin/install.js` HOOKS_TO_COPY array + PreToolUse registration | Last-line-of-defense at `git commit` time; opt-in via `hooks.community: true` (Phase 5 D-06 byte-identity); validates 5 mandatory frontmatter fields via inline 30-line CJS validator (no `gray-matter` runtime dep) |
| AUDIENCE/COMPLIANCE gate re-execution | Phase 5 `audience.cjs` + Phase 7 `compliance.cjs` (run/commit/verdict primitives) | Phase 4 ALIGN gate (`align.cjs`) | `/brief-export` calls `runAudience(cwd, opts)` + `runCompliance(cwd, opts)` with NEW `verdictOutPath` per export run-id (separate from Phase 5/7 in-flight verdicts). Sequential 3-gate threading per Phase 7 D-02 |
| Force-accept audit trail | `brief/bin/lib/audience.cjs` (`commitAudienceVerdict` already supports `opts.override` + `opts.overrideReason`) + `brief/bin/lib/state.cjs` allowlist | STATE.md `state.brief.last_gate_results.audience.override` + `override_reason` + `override_at` (Phase 2 D-21 allowlist) | Phase 4 D-07 first live use in Phase 8 — substrate already shipped; Phase 8 only validates round-trip in canary E2E |
| Cross-artifact leakage diff (TF-IDF) | New `brief/bin/lib/leakage-diff.cjs` | C-D02 algorithm — TF-IDF top-20 keyword extraction + 3+ match threshold | Pure-CJS implementation. No `natural` / `tfidf-search` / `node-tfidf` runtime dep. Reads `.planning/deliverables/type-b/*.md` and produces FINDINGS-MATERIAL severity finding |
| AI slop check (banned-words + concreteness) | New `brief/bin/lib/voice-fit.cjs` | Type B agent prompt inline ban-list + post-generation regex check + 1-shot regenerate dispatch | banned-words density > 2/page → regenerate; failure → FINDINGS-MATERIAL finding (NOT a new gate; lives parallel to AUDIENCE) |
| Korean ko/en branching | Phase 5 `context-inject.cjs` `buildBusinessContext()` `language` field (`'ko'` or `'en'`) | OBJECTIVES.md `business_context.region: kr` + `--en` flag + frontmatter `voice.languages: [ko, en]` opt-in | region: kr → ko 단일 emit; opt-in adds `{name}.en.md` paired file. NEW frontmatter field `voice.languages` is additive (Phase 2 D-20 nested-map serializer handles it) |
| Korean honorific guard / 투자자 문화 | Type B agent prompt (D-D04 inline guide) | `voice-fit.cjs` (regex check for 반말 patterns: `-야`, `-지`, `-라구요`) | Inline-only, NOT a new gate. Pilot data drives v1.x escalation |
| State allowlist extension | `brief/bin/lib/state.cjs` (`PHASE_8_BRIEF_FIELDS` paired-with-Phase-7 documentation block) | Phase 2 D-21 allowlist mechanism (preserve-wholesale, no closed-enum validator) | NEW fields: `state.brief.deliverable_index`, `state.brief.last_export_at`. Force-accept override fields already documented under Phase 2 D-21 (`last_gate_results.audience` nested map allows `override`/`override_reason`/`override_at` scalar leaves) |

## Standard Stack

### Core (INHERITED — do not add to package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | >=22.0.0 | Runtime | BRIEF constraint per `package.json engines.node`. `[VERIFIED: package.json field shows engines.node=">=22.0.0", local node v24.14.0]` |
| CommonJS (`.cjs`) | — | Module system for bin layer | BRIEF constraint. All Phase 4·5·7 libs (`audience.cjs`, `compliance.cjs`, `context-inject.cjs`, `frontmatter.cjs`, `state.cjs`) are `.cjs` — Phase 8 libs MUST follow same convention. `[VERIFIED: file inspection]` |
| `node:test` | built-in | Test runner | BRIEF constraint. Existing `tests/brief-audience-*.test.cjs` and `tests/brief-compliance-*.test.cjs` ship as `.test.cjs` files; Phase 8 adds `tests/brief-deliver-*.test.cjs` and `tests/brief-export-*.test.cjs`. `[VERIFIED: scripts/run-tests.cjs uses execFileSync(process.execPath, ['--test', '--test-concurrency=4', ...files])]` |
| `c8` | ^11.0.0 | V8-native coverage | BRIEF constraint. 70% line threshold over `brief/bin/lib/*.cjs`. New libs (`deliver.cjs`, `export.cjs`, `voice-fit.cjs`, `leakage-diff.cjs`) MUST meet threshold. `[VERIFIED: package.json scripts.test:coverage]` |

### Supporting (NEW — invoke via `npx --yes`, NEVER add to dependencies)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@marp-team/marp-cli` | 4.3.1 (verified 2026-04-26 — published 2026-03-16T16:54:18Z) | Markdown→PPTX/PDF/HTML for Type B decks | Invoke from `brief/bin/lib/export.cjs` via `npx --yes @marp-team/marp-cli@4.3.1 input.md -o output.{pptx|pdf|html}`. **MUST NOT** appear in `package.json dependencies`. `[VERIFIED: npm view @marp-team/marp-cli version → 4.3.1, time.modified → 2026-03-16T16:54:18.076Z]` |

**Version verification command (planner MUST re-run before plan execution):**
```bash
npm view @marp-team/marp-cli version time.modified
```
If a newer version is current at execution time, planner pins the latest STABLE release; the `npx --yes @marp-team/marp-cli@<pinned>` invocation pattern remains unchanged.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **Marp CLI for decks** | **Pandoc** (`pandoc input.md -o output.pptx`) | Less polished slides; Pandoc not part of any defaults; documented as fallback in `brief/references/marp-environment.md`. Use only if Marp invocation fails AND Pandoc is detected on the host |
| **Marp CLI for decks** | **Slidev / Reveal.js / Spectacle** | Wrong format for corporate audiences (Slidev = developer demos with live code; Reveal = HTML-only no native PPTX; Spectacle = React+JSX wrong paradigm). All rejected per STACK.md "Alternatives Considered" |
| **Inline 30-line CJS frontmatter validator** (in CC-03 hook) | **gray-matter** library | gray-matter (4.0.3) is the de-facto standard for YAML frontmatter parsing BUT adding it would break A1 (zero-runtime-dependencies). The CC-03 hook only needs to (a) match `^---\n...\n---` block via regex, (b) do simple `key.subkey: value` lookup against 5 mandatory paths. 30 lines of bash+node-eval suffices. Promote to `gray-matter` only if schema grows beyond closed-enum validation. `[CITED: STACK.md §"Supporting Libraries" + brief/bin/lib/frontmatter.cjs already implements the same pattern in pure CJS]` |
| **Custom CJS verdict schema validation** (audience/compliance) | **ajv (8.18.0)** | Same A1 reasoning. The 3-output verdict + severity + findings array is a closed shape with ~5 enum values per field. Phase 4·5·7 already ship pure-CJS `validateVerdict()` functions in audience.cjs / compliance.cjs that the Phase 8 export.cjs reuses verbatim |
| **TF-IDF lib** (`natural`, `tfidf`, `node-tfidf`) | **Pure-CJS implementation in `leakage-diff.cjs`** | Same A1 reasoning. TF-IDF over 4 short Type B markdown files is computationally trivial (~200 LOC); pulling in `natural` (1MB+) just for term-frequency math contradicts the BRIEF lightness promise. Pure-CJS implementation also stays Korean-aware (Hangul tokenization preserved per align.cjs `computeTermOverlap` precedent — see line 97-114 of audience.cjs which already does this for ALIGN/AUDIENCE) |

### Installation

**For BRIEF runtime:** Nothing new. `npm install` already covers c8, esbuild, vitest devDeps.

**For users producing Type B Marp decks:**
```bash
# Marp is invoked via npx --yes from /brief-export — users do NOT need explicit install.
# However, on first invocation, npx will download ~50MB (puppeteer-core + Chromium-friendly bindings).
# This first-run latency is documented in brief/references/marp-environment.md.

# Optional, for editable PPTX export:
brew install --cask libreoffice  # macOS
# OR: apt install libreoffice    # Debian/Ubuntu
```

**Environment requirements (verified 2026-04-26):**
- Chrome OR Edge OR Firefox (Marp CLI 4 added Firefox fallback per discussion #542 search result) — MANDATORY for PPTX/PDF/PNG output
- LibreOffice Impress — OPTIONAL, only required for `--pptx-editable` mode (Marp CLI experimental feature; some complex styles may not preserve)
- npx — ships with npm (which ships with Node 22+)

`[CITED: github.com/marp-team/marp-cli — README + Discussion #542 "Introducing Marp CLI v4"]`

## Architecture Patterns

### System Architecture Diagram

```
                ┌─────────────────────────────────────────────────────────────────┐
                │                      USER COMMAND                               │
                │   /brief-deliver --type-a │  /brief-deliver --type-b <name>     │
                │           │                          │                          │
                └───────────┼──────────────────────────┼──────────────────────────┘
                            │                          │
                            ▼                          ▼
              ┌──────────────────────┐    ┌──────────────────────┐
              │ deliver.cjs          │    │ deliver.cjs          │
              │ Type A path:         │    │ Type B path:         │
              │  - read 9 workstream │    │  - read same         │
              │    artifacts (Phase 7│    │    workstream        │
              │    outputs)          │    │    artifacts         │
              │  - read OBJECTIVES   │    │  - read OBJECTIVES   │
              │  - synthesize 4 .md  │    │  - spawn agent with  │
              │    via templates +   │    │    buildBusinessCtx  │
              │    composition logic │    │    (Phase 5 D-13/14) │
              └──────────┬───────────┘    └──────────┬───────────┘
                         │                           │
                         ▼                           ▼
              ┌──────────────────────┐    ┌──────────────────────┐
              │ AUDIENCE gate        │    │ Type B AGENT writes  │
              │ AUDIENCE gate        │    │ source.md            │
              │ COMPLIANCE gate      │    │  + frontmatter       │
              │ (sequential per      │    │  + Marp directive    │
              │  Phase 7 D-02)       │    │  + literal Cover     │
              │ → paired-sibling     │    │    watermark         │
              │   .audience.md +     │    │ voice-fit.cjs:       │
              │   .compliance.md     │    │  banned-words check  │
              └──────────┬───────────┘    │  → regenerate ×1 if  │
                         │                │    density > 2/page  │
                         │                └──────────┬───────────┘
                         │                           │
                         │                           │ (markdown only,
                         │                           │  not yet rendered)
                         │                           ▼
                         │              ┌──────────────────────────────────┐
                         │              │  /brief-export <artifact>        │
                         │              │  ──────────────────────────────  │
                         │              │  Step 1: leakage-diff.cjs        │
                         │              │   TF-IDF cross-artifact diff vs  │
                         │              │   stricter-confidentiality       │
                         │              │   siblings → finding emit if 3+  │
                         │              │   matches                        │
                         │              │  Step 2: AUDIENCE gate (re-run   │
                         │              │   with NEW run-id — separate     │
                         │              │   verdict from Phase 5 in-flight)│
                         │              │  Step 3: COMPLIANCE gate (re-run)│
                         │              │  Step 4: 1-step confirm UI:      │
                         │              │   AskUserQuestion with audience+ │
                         │              │   confidentiality + 3-gate       │
                         │              │   verdict + leakage diff result  │
                         │              │  Step 5: BLOCKING branch →       │
                         │              │   3-path interrupt               │
                         │              │   (frontmatter / rewrite /       │
                         │              │   force-accept w/ audit trail)   │
                         │              └──────────┬───────────────────────┘
                         │                         │
                         │                         │ (AUDIENCE-OK + user accept)
                         │                         ▼
                         │              ┌──────────────────────────────────┐
                         │              │ Marp invocation (npx --yes)      │
                         │              │  npx --yes                       │
                         │              │  @marp-team/marp-cli@4.3.1       │
                         │              │  input.md -o                     │
                         │              │  {name}.{confidentiality}.pptx   │
                         │              │  ───── env detect first ────     │
                         │              │  no Chrome/Edge → PDF fallback   │
                         │              │  no PDF either → HTML            │
                         │              │  no LibreOffice → non-editable   │
                         │              │   PPTX (default Marp mode)       │
                         │              └──────────┬───────────────────────┘
                         │                         │
                         ▼                         ▼
              ┌──────────────────────────────────────────────────┐
              │  ATOMIC COMMIT (Phase 1 D-09 inheritance)         │
              │   source.md                                       │
              │   + .audience.md (paired-sibling)                 │
              │   + .compliance.md (paired-sibling)               │
              │   + .{confidentiality}.{ext} rendered output      │
              │   + STATE.md (last_export_at + override fields    │
              │     IF force-accept used)                         │
              │   = 1 git commit                                  │
              └─────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
                  ┌─────────────────────────────────────┐
                  │ git commit (Bash tool)              │
                  │  ──────────────────────────────     │
                  │ PreToolUse hook fires:              │
                  │  brief-validate-frontmatter.sh      │
                  │   IF hooks.community: true →        │
                  │    enumerate staged .planning/**.md │
                  │    parse frontmatter (inline node)  │
                  │    check 5 mandatory fields         │
                  │    block (exit 2) if missing        │
                  │   IF hooks.community: false →       │
                  │    silent no-op                     │
                  └─────────────────────────────────────┘
```

### Recommended Project Structure

```
.planning/
├── deliverables/                    # NEW Phase 8 directory
│   ├── type-a/                      # A-D01 location
│   │   ├── product-brief.md
│   │   ├── product-brief.audience.md     # paired-sibling (Phase 5 D-11)
│   │   ├── product-brief.compliance.md   # paired-sibling (Phase 7 D-12)
│   │   ├── service-policy.md             # B2B/B2C conditional prose (A-D03)
│   │   ├── service-policy.audience.md
│   │   ├── service-policy.compliance.md
│   │   ├── high-level-spec.md
│   │   ├── high-level-spec.audience.md
│   │   ├── high-level-spec.compliance.md
│   │   ├── feature-map.md
│   │   ├── feature-map.audience.md
│   │   └── feature-map.compliance.md
│   └── type-b/                      # A-D01 location
│       ├── internal-deck.md
│       ├── internal-deck.audience.md
│       ├── internal-deck.compliance.md
│       ├── internal-deck.confidential.pptx     # B-D01 filename
│       ├── proposal-deck.md
│       ├── proposal-deck.audience.md
│       ├── proposal-deck.compliance.md
│       ├── proposal-deck.partner.pptx
│       ├── exec-summary.md          # NO Marp render (markdown only)
│       ├── exec-summary.audience.md
│       ├── exec-summary.compliance.md
│       ├── decision-memo.md         # NO Marp render
│       ├── decision-memo.audience.md
│       └── decision-memo.compliance.md

brief/
├── bin/lib/
│   ├── deliver.cjs                  # NEW — Type A auto-synthesis
│   ├── export.cjs                   # NEW — /brief-export gate re-execution + Marp wrapper
│   ├── voice-fit.cjs                # NEW — banned-words + concreteness post-check
│   └── leakage-diff.cjs             # NEW — TF-IDF cross-artifact diff
├── workflows/
│   ├── deliver.md                   # NEW — Type A/B orchestration
│   └── export.md                    # NEW — Export confirm + gate re-run + Marp invocation
├── templates/deliver/
│   ├── type-a/                      # 4 markdown templates
│   │   ├── product-brief.md
│   │   ├── service-policy.md
│   │   ├── high-level-spec.md
│   │   └── feature-map.md
│   ├── type-b/                      # 4 markdown templates
│   │   ├── internal-deck.md         # Marp frontmatter + 7-9 slides
│   │   ├── proposal-deck.md
│   │   ├── exec-summary.md
│   │   └── decision-memo.md
│   └── marp-themes/                 # Custom Marp theme files
│       ├── default.css              # INTERNAL deck (実用的)
│       ├── partner.css              # PROPOSAL deck (외부 인상)
│       └── confidential.css         # CONFIDENTIAL banner styling
└── references/
    ├── marp-environment.md          # NEW — Chrome/Edge/LibreOffice docs + fallback
    └── voice-fit-vocabulary.md      # NEW — banned-words ban-list + 한국어 확장 (Phase 4 D-09 ban-list pattern)

agents/
├── brief-deliver-type-a.md          # NEW — parameterized {{ARTIFACT}}
└── brief-deliver-type-b.md          # NEW — parameterized {{ARTIFACT}} + banned-words inline + region:kr exemplar

commands/brief/
├── deliver.md                       # NEW — user command #1
└── export.md                        # NEW — user command #2

hooks/
└── brief-validate-frontmatter.sh   # NEW — CC-03 PreToolUse hook (B-D04)

bin/install.js                       # MODIFIED — add hook to HOOKS_TO_COPY (line 4762) + PreToolUse register (line ~6307 pattern)
scripts/build-hooks.js               # MODIFIED — add 'brief-validate-frontmatter.sh' to HOOKS_TO_COPY array
brief/bin/brief-tools.cjs            # MODIFIED — add cases 'deliver' / 'export' / 'voice-fit' / 'leakage-diff'
brief/bin/lib/state.cjs              # MODIFIED — Phase 8 D-21 allowlist extension (PHASE_8_BRIEF_FIELDS)
brief/bin/lib/status.cjs             # MODIFIED — formatGate extension for Type B force-accept override display
CLAUDE.md                            # MODIFIED — Marp env dependency in Constraints; Phase 8 NET +2 commands
docs/ARCHITECTURE.md                 # MODIFIED — count bumps (commands +2, agents +2, hooks +1, workflows +2, lib +4)

tests/
├── brief-deliver-type-a.test.cjs            # Type A auto-synthesis (4 artifacts × Korea fixture)
├── brief-deliver-type-b-marp.test.cjs       # Type B Marp render smoke (mock Marp invocation OR real npx if env present)
├── brief-export-confirm-ui.test.cjs         # /brief-export 1-step confirm UI (Korean + English)
├── brief-export-audience-rerun.test.cjs     # AUDIENCE re-run with separate run-id from Phase 5
├── brief-export-compliance-rerun.test.cjs   # COMPLIANCE re-run
├── brief-export-force-accept-audit.test.cjs # force-accept writes state.brief.last_gate_results.audience.override + override_reason + override_at
├── brief-export-leakage-diff.test.cjs       # TF-IDF accuracy: intentional leak vs incidental match
├── brief-voice-fit-banned-words.test.cjs    # banned-words density + 1-shot regenerate
├── brief-voice-fit-concreteness.test.cjs    # exemplar match
├── brief-deliver-ko-en-branching.test.cjs   # region: kr → ko 단일; --en → ko/en pair
├── brief-validate-frontmatter-hook.test.cjs # CC-03 hook missing-field block + opt-in gate
├── brief-deliver-canary.test.cjs            # Korea-first B2C fintech canary E2E
└── brief-deliver-text-mode.test.cjs         # AskUserQuestion → numbered-list fallback (cross-runtime parity)
```

### Pattern 1: Inherited Gate Substrate Re-execution

**What:** `/brief-export` invokes Phase 5 AUDIENCE + Phase 7 COMPLIANCE gate primitives (`runAudience` / `runCompliance`) with a separate run-id, producing fresh verdicts that are independent of any in-flight Phase 5/7 verdicts on the same artifact.

**When to use:** Inside `brief/bin/lib/export.cjs` Step 2 + Step 3.

**Example:**
```javascript
// Source: brief/bin/lib/audience.cjs lines 295-326 (existing Phase 5 substrate)
// Phase 8 export.cjs reuses verbatim with NEW verdictOutPath per export run-id

const audience = require('./audience.cjs');
const compliance = require('./compliance.cjs');
const path = require('path');
const { planningPaths } = require('./core.cjs');

function runExportGates(cwd, opts) {
  const exportRunId = `export-${Date.now()}-${process.pid}`;
  const baseTmp = planningPaths(cwd).planning;

  // AUDIENCE re-run with separate run-id (does NOT collide with Phase 5 in-flight verdict)
  const audienceVerdictPath = path.join(baseTmp, `.${exportRunId}.audience-verdict.tmp.json`);
  const audienceVerdict = audience.runAudience(cwd, {
    artifact: opts.artifactPath,
    baseline: opts.baselinePath || path.join(baseTmp, 'OBJECTIVES.md'),
    verdictOutPath: audienceVerdictPath,
    llmPass: opts.audienceLlmPass,  // optional — if not provided, deterministic-only
  });

  if (audienceVerdict.severity === 'blocking') {
    // Fail-fast per Phase 7 D-02 sequential 3-gate threading
    return { audienceVerdict, complianceVerdict: null, blocked: 'audience' };
  }

  // COMPLIANCE re-run, separate run-id
  const complianceVerdictPath = path.join(baseTmp, `.${exportRunId}.compliance-verdict.tmp.json`);
  const complianceVerdict = compliance.runCompliance(cwd, {
    artifact: opts.artifactPath,
    baseline: opts.baselinePath,
    verdictOutPath: complianceVerdictPath,
    llmPass: opts.complianceLlmPass,
  });

  return { audienceVerdict, complianceVerdict, blocked: null };
}
```

**Staleness policy:** No caching — every `/brief-export` invocation re-runs both gates fresh against the current artifact content. Rationale: artifact may have been edited between the Phase 5/7 in-flight gate and the export step; re-running guarantees the verdict reflects the actual content being shipped. The `LLM Task` cost (1 per gate × 4 Type B artifacts × 1 export per artifact = max 8 Task calls per full DELIVER cycle) is acceptable for the Pitfall #5 last-line-of-defense use case.

### Pattern 2: 4-Layer Audience Defense Sequencing

**What:** The 4 layers fire at distinct lifecycle moments to provide defense-in-depth.

**When to use:** Every Type B artifact emission must touch all 4 layers in this order.

**Example:**

| Layer | When it fires | Where | Bypass risk |
|-------|---------------|-------|-------------|
| 1 — Filename encoding | At final write (Marp render output) | `brief/bin/lib/export.cjs` writes `{name}.{confidentiality}.{ext}` after AUDIENCE-OK | User manually `mv` the file → bypassed; Layer 4 hook then catches at commit time |
| 2 — Watermark | At template-fill time (markdown source) | `brief/templates/deliver/type-b/*.md` Marp directive `footer:` + literal Cover slide content | User edits markdown → potentially removes; Layer 4 hook checks frontmatter (NOT body) — body removal of watermark is documented user-responsibility breach |
| 3 — `/brief-export` 1-step confirm | At render time (before Marp invocation) | `brief/bin/lib/export.cjs` AskUserQuestion (or text_mode numbered-list fallback) | User runs `npx marp-cli` directly → bypassed; CLAUDE.md / `/brief-help` warns explicitly |
| 4 — CC-03 pre-commit hook | At `git commit` time | `hooks/brief-validate-frontmatter.sh` PreToolUse on Bash matcher | `hooks.community: false` opt-out → silent no-op; OR `git commit --no-verify` → user-responsibility breach |

**Anti-pattern: any-layer-only enforcement.** Removing any one layer creates a single-point-of-bypass scenario. Phase 9 HRD-04 pilot data informs whether to default `hooks.community: true` (raising Layer 4 from opt-in to default-on).

### Pattern 3: Type A Auto-Synthesis Mapping

**What:** Each of the 4 Type A artifacts is composed deterministically from a fixed list of workstream artifacts + OBJECTIVES.md sections. The `agents/brief-deliver-type-a.md` agent fills in the narrative; `brief/bin/lib/deliver.cjs` does the file reading + section extraction + template-merge.

**When to use:** Inside `brief/bin/lib/deliver.cjs` `--type-a` mode.

**Mapping table (A-D02 + A-D04):**

| Type A artifact | Source workstream artifacts | OBJECTIVES.md sections | Template sections filled |
|-----------------|------------------------------|------------------------|---------------------------|
| **PRODUCT-BRIEF.md** | `brief/workstreams/business-model-canvas/canvas.md` (`## Customer Segments`, `## Value Proposition`) + `brief/workstreams/go-to-market/go-to-market.md` (`## Personas`) | `## Immutable Intent` (entire block) | `<product_vision>`, `<core_value>`, `<target_user>`, `<value_proposition>` |
| **SERVICE-POLICY.md** (single template, conditional prose) | `brief/workstreams/operations/operations.md` (`## Process`, `## Tools`) + `brief/workstreams/compliance/compliance.md` (`## Documented obligations addressed:`) | `## business_context.model` (frontmatter) | B2B variant: SLA tiers / enterprise support / data processing / contract terms; B2C variant: refund policy / customer support hours / channel coverage / community guidelines. Selected via `business_model` (Phase 5 D-15 / Phase 7 D-14 pattern byte-identity) |
| **HIGH-LEVEL-SPEC.md** | `brief/workstreams/tech-arch/tech-arch.md` (`## Component Map`) + `brief/workstreams/roadmap/roadmap.md` (`## Phased Roadmap`) + `brief/workstreams/risk/risk.md` (`## Critical Risks`) | `## Immutable Intent` (verbatim header) | `## Functional Scope`, `## Priority`, `## Dependencies`, `## Critical Risks (per RISK workstream)` |
| **FEATURE-MAP.md** | `brief/workstreams/tech-arch/tech-arch.md` (component list) + `brief/workstreams/business-model-canvas/canvas.md` (`## Value Proposition` for value-feature mapping) | (none — FEATURE-MAP is a derived view) | Mermaid `mindmap` block (preferred) OR ASCII tree (fallback if Mermaid render unavailable) |

**Graceful degradation:** If a source workstream artifact is missing (e.g., user has not completed ROADMAP yet), insert placeholder section `> ⚠️ ROADMAP workstream not yet completed — placeholder. Run /brief-design ROADMAP to populate.` and emit warning (NOT error). Phase 8 plan SHOULD ship 4 dependency-check tests in canary E2E.

### Pattern 4: Marp CLI Invocation with Environment Detection

**What:** `brief/bin/lib/export.cjs` invokes `npx --yes @marp-team/marp-cli@4.3.1` ONLY after a brief environment detection step that probes for Chrome/Edge/Firefox presence. If absent → graceful PDF/HTML fallback ladder.

**When to use:** Inside `brief/bin/lib/export.cjs` Step 5 (post-confirm, pre-render).

**Example:**
```javascript
// Source: synthesizes Marp CLI 4 README + brief/workflows/update.md npx -y pattern (lines 474-484)
// pattern: npx -y brief-cc@latest "$RUNTIME_FLAG" --local

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function detectBrowser() {
  // Chrome / Edge / Firefox detection — Marp CLI 4 introduced --browser auto fallback
  const candidates = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Firefox.app/Contents/MacOS/firefox',
    ],
    linux: ['/usr/bin/google-chrome', '/usr/bin/microsoft-edge', '/usr/bin/firefox', '/usr/bin/chromium-browser'],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ],
  };
  const list = candidates[process.platform] || [];
  for (const p of list) {
    if (fs.existsSync(p)) return { browser: path.basename(p), path: p };
  }
  return { browser: null, path: null };
}

function detectLibreOffice() {
  const candidates = {
    darwin: ['/Applications/LibreOffice.app/Contents/MacOS/soffice'],
    linux: ['/usr/bin/libreoffice', '/usr/bin/soffice'],
    win32: ['C:\\Program Files\\LibreOffice\\program\\soffice.exe'],
  };
  const list = candidates[process.platform] || [];
  return list.some((p) => fs.existsSync(p));
}

function renderMarp(cwd, { inputMd, outputPath, format /* 'pptx' | 'pdf' | 'html' */, theme, allowFallback }) {
  const browser = detectBrowser();
  const isPptxOrPdf = format === 'pptx' || format === 'pdf';

  // Format-specific environment requirement
  if (isPptxOrPdf && !browser.browser) {
    if (allowFallback && format === 'pptx') {
      // Fallback ladder: pptx unavailable → try pdf → try html
      const pdfPath = outputPath.replace(/\.pptx$/i, '.pdf');
      const pdfResult = renderMarp(cwd, { inputMd, outputPath: pdfPath, format: 'pdf', theme, allowFallback: true });
      if (pdfResult.ok) return { ok: true, ranFormat: 'pdf', outputPath: pdfPath, fallbackReason: 'no Chrome/Edge/Firefox detected' };
    }
    if (allowFallback) {
      const htmlPath = outputPath.replace(/\.(pptx|pdf)$/i, '.html');
      const htmlResult = renderMarp(cwd, { inputMd, outputPath: htmlPath, format: 'html', theme, allowFallback: false });
      if (htmlResult.ok) return { ok: true, ranFormat: 'html', outputPath: htmlPath, fallbackReason: 'no browser for PPTX/PDF rendering' };
    }
    return {
      ok: false,
      error: 'Marp PPTX/PDF render requires Chrome / Edge / Firefox. None detected. Install one OR use --format html.',
    };
  }

  const args = ['--yes', '@marp-team/marp-cli@4.3.1', inputMd, '-o', outputPath];
  if (theme) args.push('--theme', theme);
  if (format === 'pptx') {
    args.push('--pptx');
    // Only add --pptx-editable if LibreOffice present AND user opted in
    // Default: non-editable PPTX (image-based slides; works without LibreOffice)
  } else if (format === 'pdf') {
    args.push('--pdf');
  } else if (format === 'html') {
    args.push('--html');
  }

  // First invocation latency: 30-60s (npx downloads marp-cli + puppeteer-core)
  // After first invocation, subsequent calls use npm cache (~2-5s)
  const result = spawnSync('npx', args, {
    cwd,
    stdio: 'pipe',
    timeout: 120000, // 2 min hard timeout (Marp default browser-timeout 30s × ~3 attempts)
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    return { ok: false, error: result.stderr || `npx exited with code ${result.status}` };
  }
  return { ok: true, ranFormat: format, outputPath, stderr: result.stderr };
}
```

**Source corroboration:** `[CITED: github.com/marp-team/marp-cli — README + Discussion #542 v4 release notes — confirms --browser auto fallback (Chrome → Edge → Firefox), --browser-timeout 30s default, --pptx-editable experimental requires LibreOffice]`

**Sandbox / network restriction notes:**
- Some enterprise environments block `npx` network calls. Document fallback: `npm install -g @marp-team/marp-cli@4.3.1` then invoke `marp` directly.
- Some sandboxes (GitHub Actions, certain Docker images) require `CHROME_NO_SANDBOX=1` env var. Documented in `brief/references/marp-environment.md`.
- `[CITED: search results — Marp CLI Issues #524, #546, #573, #682 — sandbox + Node version edge cases]`

### Pattern 5: TF-IDF Cross-Artifact Leakage Diff (Pure CJS)

**What:** `brief/bin/lib/leakage-diff.cjs` extracts top-N TF-IDF keywords from a stricter-confidentiality artifact, then scans the current artifact for matches. 3+ matches → FINDINGS-MATERIAL severity finding.

**When to use:** Inside `brief/bin/lib/export.cjs` Step 1, BEFORE AUDIENCE re-run. Surfaces cross-artifact leakage even when single-artifact AUDIENCE passes.

**Algorithm (pure CJS, no runtime deps):**

```javascript
// File: brief/bin/lib/leakage-diff.cjs
// Algorithm derived from: align.cjs computeTermOverlap (lines 97-114) Hangul-aware tokenization +
//   classical TF-IDF (Salton, 1988): tf(t,d) * log(N / df(t))
//
// Confidentiality strictness ordering (Phase 5 D-10 enum + Phase 8 B-D01):
//   public < partner < internal < confidential
//
// Procedure:
//   1. Read current artifact's confidentiality from frontmatter
//   2. Enumerate same-folder siblings with stricter confidentiality
//   3. For each sibling: extract top-20 distinctive keywords by TF-IDF
//      where document corpus = the sibling itself + the current artifact
//   4. For each keyword: scan current artifact body for occurrences
//   5. If ≥3 distinctive keywords match → emit finding (severity: material)

const fs = require('fs');
const path = require('path');
const { extractFrontmatter, stripFrontmatter } = require('./frontmatter.cjs');

const STRICTNESS = { public: 0, partner: 1, internal: 2, confidential: 3 };

// Tokenizer — Hangul-aware (mirrors align.cjs computeTermOverlap)
// English: ≥4-letter lowercase tokens
// Korean: ≥2-character Hangul sequences
function tokenize(text) {
  const tokens = [];
  const words = text.split(/[\s\p{P}]+/u).filter(Boolean);
  for (const w of words) {
    const lw = w.toLowerCase();
    if (lw.length >= 4 && /^[a-z][a-z0-9_-]+$/.test(lw)) tokens.push(lw);
    const koMatches = w.matchAll(/[\uac00-\ud7af]{2,}/g);
    for (const m of koMatches) tokens.push(m[0]);
  }
  return tokens;
}

// English + Korean stop-word filter (stop-words removed from candidate pool)
const STOP_WORDS_EN = new Set([
  'about', 'above', 'after', 'again', 'against', 'because', 'before', 'between',
  'during', 'every', 'further', 'should', 'their', 'there', 'these', 'those',
  'through', 'while', 'which', 'with', 'would', 'product', 'service',
  // Generic business words common across all artifacts:
  'customer', 'market', 'company', 'business', 'team', 'value',
]);
const STOP_WORDS_KO = new Set([
  '있습니다', '입니다', '됩니다', '합니다', '됩니다', '우리는', '있는', '있고',
  '하는', '하고', '및', '또는', '이것', '저것',
  // Generic business words:
  '고객', '시장', '회사', '사업', '팀', '가치', '서비스', '제품',
]);

function tfIdf(text, corpus /* [text, ...] */) {
  const docTokens = tokenize(text);
  const tf = {};
  for (const t of docTokens) {
    if (STOP_WORDS_EN.has(t) || STOP_WORDS_KO.has(t)) continue;
    tf[t] = (tf[t] || 0) + 1;
  }

  // df: how many docs in corpus contain the token
  const N = corpus.length;
  const df = {};
  for (const t of Object.keys(tf)) {
    let count = 0;
    for (const docText of corpus) {
      if (docText.toLowerCase().includes(t) || docText.includes(t)) count++;
    }
    df[t] = count || 1;
  }

  // tf-idf score
  const scores = [];
  for (const [t, freq] of Object.entries(tf)) {
    const idf = Math.log(N / df[t]);
    scores.push({ token: t, score: freq * idf });
  }

  // Top 20 by score, descending
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 20).map((s) => s.token);
}

function leakageDiff(currentArtifactPath, options /* { folder?: string } */) {
  const folder = (options && options.folder) || path.dirname(currentArtifactPath);
  const currentContent = fs.readFileSync(currentArtifactPath, 'utf-8');
  const currentFm = extractFrontmatter(currentContent) || {};
  const currentConf = currentFm['audience.confidentiality']
    || (currentFm.audience && currentFm.audience.confidentiality);
  if (!currentConf || STRICTNESS[currentConf] === undefined) {
    return { findings: [], rationale: 'current artifact missing confidentiality field — skipped' };
  }
  const currentBody = stripFrontmatter(currentContent);

  // Enumerate siblings (same-extension markdown only — skip .audience.md / .compliance.md)
  const siblings = fs.readdirSync(folder)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => !f.endsWith('.audience.md') && !f.endsWith('.compliance.md'))
    .filter((f) => path.join(folder, f) !== currentArtifactPath)
    .map((f) => path.join(folder, f));

  const findings = [];
  for (const sib of siblings) {
    const sibContent = fs.readFileSync(sib, 'utf-8');
    const sibFm = extractFrontmatter(sibContent) || {};
    const sibConf = sibFm['audience.confidentiality']
      || (sibFm.audience && sibFm.audience.confidentiality);
    if (!sibConf || STRICTNESS[sibConf] === undefined) continue;
    if (STRICTNESS[sibConf] <= STRICTNESS[currentConf]) continue; // not stricter — skip

    // Extract top-20 keywords from stricter sibling (corpus = sibling + current)
    const sibBody = stripFrontmatter(sibContent);
    const topKeywords = tfIdf(sibBody, [sibBody, currentBody]);

    // Count matches in current body
    const matched = [];
    for (const kw of topKeywords) {
      if (currentBody.toLowerCase().includes(kw) || currentBody.includes(kw)) {
        matched.push(kw);
      }
    }

    if (matched.length >= 3) {
      findings.push({
        severity: 'material',
        location: `${path.basename(currentArtifactPath)}:body`,
        description: `Cross-artifact leakage suspected: stricter sibling '${path.basename(sib)}' (confidentiality: ${sibConf}) shares distinctive keywords [${matched.slice(0, 8).join(', ')}] with this artifact (confidentiality: ${currentConf}). Verify intent.`,
      });
    }
  }
  return { findings, rationale: `scanned ${siblings.length} sibling(s)` };
}

module.exports = { leakageDiff, tokenize, tfIdf, STRICTNESS };
```

**False-positive control (CRITICAL — planner MUST validate against canary fixture):**

| Risk | Mitigation |
|------|-----------|
| Generic words ("고객", "market") match every artifact | STOP_WORDS_EN + STOP_WORDS_KO sets exclude top-30 generic business terms BEFORE TF-IDF scoring |
| Project-name match (every artifact mentions "페이앱") | TF-IDF idf factor naturally suppresses tokens present in ALL corpus docs (idf = log(N/N) = 0) |
| Threshold 3+ too low → false positives; too high → false negatives | Phase 8 ships threshold = 3 (per C-D02 lock); canary E2E asserts (a) intentional leak fixture (5+ keywords copied PROPOSAL → INTERNAL) DETECTED (≥1 finding); (b) incidental fixture (no copied content but shared "고객" / "시장") NOT FLAGGED (0 findings) |
| Korean tokenization breaks on mixed-language text | `align.cjs computeTermOverlap` precedent already handles this — Phase 8 inherits same regex `/[\uac00-\ud7af]{2,}/u` |

`[CITED: align.cjs lines 97-114 — Hangul-aware tokenization precedent already shipped in Phase 4]`

### Pattern 6: AI Slop Banned-Words + Concreteness (voice-fit.cjs)

**What:** Post-generation regex check on Type B agent output. Banned-words density > 2/page → 1-shot regenerate request to agent. Concreteness check is agent-prompt-internal (not enforced by this lib).

**When to use:** Inside `brief/bin/lib/voice-fit.cjs` invoked by Type B agent dispatch BEFORE artifact write.

**Banned-words regex pattern (seed list per C-D03 + Pitfall #10):**

```javascript
// File: brief/bin/lib/voice-fit.cjs
// Source: PITFALLS.md §Pitfall #10 banned-words list (verbatim) +
//         CONTEXT.md C-D03 한국어 8개 추가
// Pattern: word-boundary + case-insensitive global to match in any sentence position

const BANNED_EN = /\b(leverage|synergize|transform|holistic|delve|groundbreaking|best-in-class|seamless|cutting-edge|revolutionary|game-changing|landscape|unlock|empower|robust|innovative)\b/gi;

// Korean banned-words seed (C-D03 한국어 8개) — exact-match (no \b in Korean)
// Note: Korean has no word-boundary character class; use lookbehind/lookahead with non-Hangul
const BANNED_KO = /(혁신적인|차별화된|게임체인저|패러다임 시프트|시너지|활용|최적화|글로벌 스탠더드)/g;

// 한국어 반말 / 구어체 (D-D04 honorific guard — Korean external artifact)
// Triggers ONLY when audience.confidentiality in {partner, public} (external context)
const HONORIFIC_VIOLATION_KO = /(?:[가-힣])(야|지|라구요|거든요|는데요)\b/g;

function checkBannedWords(text, options /* { isKorean: boolean, isExternal: boolean } */) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // "Per page" approximation: ~250 words/page (1-2 page exec-summary, ~7-9 deck slides)
  const pages = Math.max(1, Math.ceil(wordCount / 250));

  const enHits = [...text.matchAll(BANNED_EN)].map((m) => ({ token: m[0], offset: m.index }));
  const koHits = options.isKorean
    ? [...text.matchAll(BANNED_KO)].map((m) => ({ token: m[0], offset: m.index }))
    : [];
  const honorificHits = (options.isKorean && options.isExternal)
    ? [...text.matchAll(HONORIFIC_VIOLATION_KO)].map((m) => ({ token: m[0], offset: m.index }))
    : [];

  const allHits = [...enHits, ...koHits, ...honorificHits];
  const density = allHits.length / pages;

  return {
    density,
    threshold: 2,
    exceedsThreshold: density > 2,
    hits: allHits,
    pages,
  };
}

// Concreteness check — heuristic only. Agent prompt does the heavy lifting.
// This is a soft signal; FINDINGS-MATERIAL emitted if specific-number density
// is below threshold AND artifact is Type B external.
function checkConcreteness(text) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // Specific numbers: not just "3" but "3 days", "$15K", "47%", "23.4 trillion"
  // Plus dates: 2025, 2026-Q1, etc.
  // Plus named entities: Capitalized 3+ word phrases (often proper nouns)
  const specificNumbers = (text.match(/\b\d{1,3}(?:[,.]\d{3})*(?:\.\d+)?\s*(?:%|days?|weeks?|months?|years?|hours?|minutes?|won|원|달러|\$|₩|trillion|billion|million|배|원|개월|일|시간)/g) || []).length;
  const dates = (text.match(/\b(?:19|20)\d{2}(?:[-/]\d{1,2})?\b/g) || []).length;
  const properNouns = (text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,}\b/g) || []).length;

  const concrete = specificNumbers + dates + properNouns;
  const concretenessRatio = concrete / Math.max(1, wordCount / 100);  // per 100 words

  return {
    concrete,
    wordCount,
    concretenessRatio,
    // Heuristic threshold: at least 3 concrete signals per 100 words for external Type B
    needsImprovement: concretenessRatio < 3,
  };
}

module.exports = { checkBannedWords, checkConcreteness, BANNED_EN, BANNED_KO, HONORIFIC_VIOLATION_KO };
```

**Ban-list extension procedure (planner discretion per CONTEXT.md):**

1. Edit `brief/references/voice-fit-vocabulary.md` (NEW Phase 8 file — mirrors `brief/references/audience-vocabulary.md`).
2. Add new banned word to either `BANNED_EN` or `BANNED_KO` regex literal in `voice-fit.cjs`.
3. Add a structural test in `tests/brief-voice-fit-banned-words.test.cjs` asserting the new word is detected.
4. Phase 9 HRD-04 pilot data MAY drive new entries.

`[CITED: brief/references/audience-vocabulary.md lines 96-99 — "Ban-list is expected to grow during Phase 5 execution as LLM creative avoidance surfaces. When extending, add to THIS file first; the test and the lib read from here."]`

### Pattern 7: CC-03 Pre-Commit Hook (B-D04)

**What:** `hooks/brief-validate-frontmatter.sh` is byte-identical in shape to `hooks/brief-validate-provenance.sh` (verified existing template). Validates 5 mandatory frontmatter fields on staged `.planning/**/*.md` files at `git commit` time. Opt-in via `hooks.community: true`.

**When to use:** Layer 4 of the 4-layer audience defense — last line at commit time.

**Implementation skeleton (mirrors existing `brief-validate-provenance.sh`):**

```bash
#!/bin/bash
# brief-hook-version: {{BRIEF_VERSION}}
# brief-validate-frontmatter.sh — PreToolUse hook: enforce mandatory frontmatter fields
# Blocks `git commit` commands when staged .planning/**/*.md files miss any of:
#   audience.type, audience.confidentiality, voice.tone, voice.perspective, business_context.model
#
# OPT-IN: no-op unless config.json has hooks.community: true.
# Mirrors hooks/brief-validate-provenance.sh shape + opt-in config gate.

# Check opt-in config — exit silently if not enabled (verbatim pattern from brief-validate-provenance.sh)
if [ -f .planning/config.json ]; then
  ENABLED=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.hooks?.community===true?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)
  if [ "$ENABLED" != "1" ]; then exit 0; fi
else
  exit 0
fi

INPUT=$(cat)
CMD=$(echo "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{process.stdout.write(JSON.parse(d).tool_input?.command||'')}catch{}})" 2>/dev/null)

# Only run validation for `git commit` commands (verbatim filter from brief-validate-provenance.sh)
if ! [[ "$CMD" =~ ^git[[:space:]]+commit ]]; then
  exit 0
fi

STAGED_FILES=$(git diff --cached --name-only --diff-filter=AM 2>/dev/null || true)
if [ -z "$STAGED_FILES" ]; then exit 0; fi

# Filter: only .planning/**/*.md files (paired-sibling .audience.md / .compliance.md included)
# Skip workstream artifacts unless they're deliverables (Type A/B require frontmatter)

VIOLATIONS=""
for F in $STAGED_FILES; do
  [[ ! "$F" =~ ^\.planning/.*\.md$ ]] && continue
  [[ ! -f "$F" ]] && continue
  # Skip pure-meta files (STATE.md, OBJECTIVES.md sections that don't need audience)
  # Phase 8 mandatory-validate: deliverables/, workstreams/{name}/{artifact}.md (NOT .audience.md / .compliance.md)
  # paired-sibling .audience.md / .compliance.md DO require frontmatter (Phase 5 D-10 schema)

  # Inline 30-line CJS validator (no gray-matter — A1 zero-deps)
  RESULT=$(node -e "
    const fs = require('fs');
    const content = fs.readFileSync('$F', 'utf-8');
    const m = content.match(/^---\\r?\\n([\\s\\S]+?)\\r?\\n---/);
    if (!m) { process.stdout.write('NO_FRONTMATTER'); process.exit(0); }
    const yaml = m[1];
    // Cheap dotted-path lookup against 5 mandatory fields
    const required = ['audience.type', 'audience.confidentiality', 'voice.tone', 'voice.perspective', 'business_context.model'];
    const missing = [];
    for (const path of required) {
      const parts = path.split('.');
      // For each path 'a.b': find /^a:/ then nested /^  b:\s*\S/
      let found = false;
      const topKey = parts[0];
      const subKey = parts[1];
      const lines = yaml.split(/\\r?\\n/);
      for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        // Top-level key declaration: 'audience:'
        if (new RegExp('^' + topKey + ':\\\\s*$').test(ln)) {
          // Look ahead for indented sub-key
          for (let j = i + 1; j < lines.length; j++) {
            const subLn = lines[j];
            if (/^[a-zA-Z]/.test(subLn)) break;  // dedent — out of nested
            if (new RegExp('^\\\\s+' + subKey + ':\\\\s*\\\\S+').test(subLn)) {
              found = true; break;
            }
          }
        }
        // Flat dotted form: 'audience.type: external'
        if (new RegExp('^' + path.replace('.', '\\\\.') + ':\\\\s*\\\\S+').test(ln)) {
          found = true; break;
        }
      }
      if (!found) missing.push(path);
    }
    process.stdout.write(missing.length === 0 ? 'OK' : 'MISSING:' + missing.join(','));
  " 2>/dev/null)

  if [ "$RESULT" = "NO_FRONTMATTER" ]; then
    VIOLATIONS="${VIOLATIONS}${F}: 첫 줄에 frontmatter (---/---) 가 없습니다 (no frontmatter block)"$'\n'
  elif [[ "$RESULT" == MISSING:* ]]; then
    MISSING_FIELDS="${RESULT#MISSING:}"
    VIOLATIONS="${VIOLATIONS}${F}: 필수 frontmatter 항목 누락: ${MISSING_FIELDS}"$'\n'
  fi
done

if [ -n "$VIOLATIONS" ]; then
  KOREA=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.brief?.region==='kr'?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)

  if [ "$KOREA" = "1" ]; then
    REASON="⚠ 커밋이 차단되었습니다. .planning/ artifact frontmatter에 필수 항목이 누락되었습니다.

다음 파일에 audience.type, audience.confidentiality, voice.tone, voice.perspective, business_context.model 5개 필수 항목을 모두 추가해 주세요:
${VIOLATIONS}
이 hook은 .planning/config.json에서 hooks.community: false 로 변경하여 비활성화할 수 있습니다 (권장하지 않음 — Phase 8 audience 방어막 약화)."
  else
    REASON="Commit blocked: .planning/ artifact frontmatter missing mandatory fields.

Add audience.type, audience.confidentiality, voice.tone, voice.perspective, business_context.model to:
${VIOLATIONS}
You can disable this hook by setting hooks.community: false in .planning/config.json (NOT recommended — weakens Phase 8 audience defense)."
  fi

  REASON_JSON=$(node -e "process.stdout.write(JSON.stringify(process.argv[1]))" "$REASON")
  echo "{\"decision\":\"block\",\"reason\":${REASON_JSON}}"
  exit 2
fi

exit 0
```

**Installation pattern (`bin/install.js` MODIFICATIONS):**

1. Add `'brief-validate-frontmatter.sh'` to the `briefHooks` array at line 4762 (uninstall enumeration).
2. Add `'brief-validate-frontmatter.sh'` to `expectedShHooks` array at line 5849 (worktree shape verification).
3. Add new install block after line 6328 (mirroring the brief-validate-provenance pattern at lines 6307-6328 verbatim):
   ```javascript
   // Configure frontmatter validation hook (CC-03, opt-in via hooks.community)
   const validateFrontmatterCommand = isGlobal
     ? buildHookCommand(targetDir, 'brief-validate-frontmatter.sh', hookOpts)
     : 'bash ' + localPrefix + '/hooks/brief-validate-frontmatter.sh';
   const hasValidateFrontmatterHook = settings.hooks[preToolEvent].some(entry =>
     entry.hooks && entry.hooks.some(h => h.command && (h.command.includes('brief-validate-frontmatter') || h.command.includes('gsd-validate-frontmatter')))
   );
   const validateFrontmatterFile = path.join(targetDir, 'hooks', 'brief-validate-frontmatter.sh');
   if (!hasValidateFrontmatterHook && fs.existsSync(validateFrontmatterFile)) {
     settings.hooks[preToolEvent].push({
       matcher: 'Bash',
       hooks: [{ type: 'command', command: validateFrontmatterCommand, timeout: 5 }]
     });
     console.log(`  ${green}✓${reset} Configured frontmatter validation hook (opt-in via config)`);
   } else if (!hasValidateFrontmatterHook && !fs.existsSync(validateFrontmatterFile)) {
     console.warn(`  ${yellow}⚠${reset}  Skipped frontmatter validation hook — brief-validate-frontmatter.sh not found at target`);
   }
   ```
4. Add `'brief-validate-frontmatter.sh'` to `scripts/build-hooks.js` `HOOKS_TO_COPY` array (line 30 in the existing file — append after `'brief-phase-boundary.sh'`).

`[VERIFIED: bin/install.js lines 4762, 5849, 6307-6328 — exact patterns to mirror; scripts/build-hooks.js line 17-31 HOOKS_TO_COPY array]`

### Pattern 8: `/brief-export` 1-Step Confirm UI (B-D03)

**What:** Single AskUserQuestion (or text_mode numbered-list fallback) presented to the user BEFORE Marp invocation. Displays artifact, audience, confidentiality, output filename, watermark text, and the 3 gate verdicts in one screen.

**When to use:** Inside `brief/bin/lib/export.cjs` Step 4 (post-leakage-diff, post-gate-rerun, pre-Marp).

**Display format (verbatim from B-D03 lock):**

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

**Korean variant (region: kr — D-D03 ko 우선):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BRIEF ► EXPORT 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 산출물:    proposal-deck.md
 청중:      외부 파트너 (external-partner)
 기밀도:    partner
 출력:      proposal-deck.partner.pptx
 워터마크: "파트너 전용 — 재배포 금지"

 AUDIENCE 게이트: AUDIENCE-OK ✓
 COMPLIANCE 게이트: COMPLIANCE-OK ✓
 cross-artifact 누설 검사: 0 finding ✓

── 이 산출물을 외부 파트너 대상으로 render 하시겠습니까? ──
 [예, render] / [아니오, 취소]
```

**BLOCKING branch (3-path interrupt — Phase 5 D-09 byte-identity):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BRIEF ► EXPORT 차단됨 (AUDIENCE: DRIFTED-content)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 외부용 artifact에 hedging 어휘가 5회 등장합니다.
 주요 위치:
  - line 47: "TBD"
  - line 62: "we believe"
  - line 89: "concerns about"
  - line 102: "still proving"
  - line 121: "risk we haven't solved"

── 어떻게 처리하시겠습니까? ──
 1. content 재작성 — 데크 source markdown을 수정 후 재시도
 2. 데크 cancel — render 중단, source markdown 유지
 3. force-accept — render 진행 (override 사유 필수, audit trail 기록)
```

When user picks 3 (force-accept):
- Prompt for `override_reason` (free text, non-empty)
- `commitAudienceVerdict(cwd, { override: true, overrideReason: <text>, ... })` writes `state.brief.last_gate_results.audience.override = true` + `override_reason: '<text>'` + `override_at: ISO timestamp`
- Phase 4 D-07 pattern verbatim — substrate already in `audience.cjs` lines 365-414

**text_mode fallback:** When `process.env.GSD_TEXT_MODE === '1'` (set by Codex/Gemini/OpenCode runtimes), the AskUserQuestion is replaced with a numbered-list prompt + `INSTRUCTION_FILE` exchange. Phase 1 FND-06 inheritance.

### Anti-Patterns to Avoid

- **5th canonical gate (voice-fit-guard, concreteness-guard, ko-culture-guard)** — Adding any new gate would (a) break the canonical pattern lock from Phase 4·5·7 (3-output verdict + paired-sibling + vocabulary-lock — 4th instance lock asserted by `tests/brief-compliance-canonical-shape.test.cjs` and similar); (b) violate the surface cap discipline. Use inline lib (`voice-fit.cjs`) parallel to AUDIENCE/COMPLIANCE, NOT a new gate. CONTEXT.md C-D03 / C-D04 / D-D04 explicitly reject this anti-pattern.
- **Runtime dependency addition** (`gray-matter` / `ajv` / `js-yaml` / `@marp-team/marp-cli` to `package.json dependencies`) — Breaks A1. ASSUMPTIONS.md A1 status: VERIFIED. Use inline 30-line CJS validators + `npx --yes` invocation. CONTEXT.md "Out of scope" explicit.
- **AUDIENCE/COMPLIANCE vocabulary change** (extending verdict enum or adding new severity level) — Phase 4·5·7 ban-list test (`tests/brief-{audience,compliance}-vocabulary-lock.test.cjs`) will fail. Phase 8 RE-USES vocabulary as-is, only escalates the policy from "soft warning" to "hard block + force-accept option".
- **Force-accept without audit trail** — `state.brief.last_gate_results.audience.override` MUST be written. Phase 4 D-07 lock. Skipping audit trail makes Pitfall #5 mitigation theatrical.
- **TF-IDF using a runtime library** (`natural`, `node-tfidf`) — A1 violation. Pure-CJS implementation in `leakage-diff.cjs` is ~150 LOC and Korean-aware (mirrors `align.cjs computeTermOverlap`).
- **Always-on CC-03 hook** (no opt-in) — CONTEXT.md B-D04 reject. Phase 5 D-06 opt-in pattern (`hooks.community: true`) is the established convention. Pilot data drives any v1.x escalation.
- **Direct `marp` invocation without env detect** — User experience: cryptic puppeteer/Chromium error if browser missing. Always detect Chrome/Edge/Firefox FIRST and provide PDF/HTML fallback.
- **ko/en bilingual default** (always emit both files) — CONTEXT.md D-D03 reject. region: kr auto-emits ko single; `--en` opt-in adds pair.
- **Marp custom theme requiring `dependencies` add** — Marp accepts inline `--theme` CSS file path; ship CSS files under `brief/templates/deliver/marp-themes/` and reference by path. NO theme package install needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML frontmatter parsing in CC-03 hook | Full YAML parser (200+ LOC) | Inline 30-line node `-e` script (regex + dotted-path lookup) | Phase 8 hook validates 5 closed-vocabulary fields; full YAML semantics not needed. `brief/bin/lib/frontmatter.cjs` already does the heavy lifting for the lib layer (Phase 2 D-20 nested-map serializer); the hook only needs to detect missing keys, not parse arbitrary structures |
| Markdown→PPTX rendering | Custom Markdown→PPTX converter | `npx --yes @marp-team/marp-cli@4.3.1` | Marp is the de-facto standard for markdown decks. Multi-page handling, theme system, frontmatter directives, PDF/PPTX/HTML/PNG output — all baked in. Building this from scratch = 1000+ LOC + maintenance. STACK.md §"Standard Stack" verified |
| TF-IDF cross-artifact diff | `natural` / `tfidf-search` runtime dep | Pure-CJS `leakage-diff.cjs` (~150 LOC) | Corpus is 4 markdown files (small). Algorithm is classical Salton TF-IDF (1988) — mathematically trivial. Runtime dep adds 1MB+ for ~150 LOC of arithmetic. Pure-CJS preserves A1 |
| Verdict schema validation | `ajv` / `joi` / `yup` runtime dep | Inline `validateVerdict(v)` function (already in audience.cjs lines 59-76) | 3-output verdict is a closed-shape with ~5 enum values per field. CJS validator is 18 LOC. Promote to ajv only if schema grows beyond Phase 8 |
| Banned-words detection | NLP library (`compromise`, `natural`) | Pure-CJS regex (`BANNED_EN`, `BANNED_KO` constants) | Banned-words list is closed-vocabulary (16 EN + 8 KO seed). Regex matching is exactly what's needed. Phase 4 D-09 ban-list pattern already established in `audience.cjs` lines 35-37 |
| Marp theme building | Build custom Marp themes from React/Vue/Tailwind | Plain CSS files under `brief/templates/deliver/marp-themes/` | Marp's theme system accepts plain CSS via `--theme <path>`. INTERNAL/PROPOSAL/CONFIDENTIAL theme variants = 3 CSS files (~100 LOC each). No build pipeline needed |
| First-slide watermark injection | Build a Marp plugin | Literal markdown content in template (Pattern 2 above) | Marp's `footer:` directive handles ALL slides; literal first-slide content handles the Cover slide emphasis. Both are pure markdown — survive copy-paste, easy to test, no plugin runtime |
| Korean honorific guard | Build a Korean morphological analyzer | Pure-CJS regex `HONORIFIC_VIOLATION_KO` for 반말 endings | Pitfall #11 mitigation is "lightweight" by design (per CONTEXT.md D-D04). Detection of `-야`, `-지`, `-라구요`, `-거든요`, `-는데요` (5 common 반말 endings) catches 90%+ of leaks. Pilot data drives v1.x improvement |
| Atomic commit | Build a transaction layer | `gsd-tools.cjs commit` (Phase 1 D-09 inheritance) | BRIEF already has atomic commit primitives. Phase 8 commits source.md + .audience.md + .compliance.md + rendered output + STATE.md as 1 commit via existing infrastructure |
| Cross-runtime `AskUserQuestion` fallback | Build a multi-runtime UI library | Phase 1 FND-06 `INSTRUCTION_FILE` + `text_mode` (already shipped) | Inherited multi-runtime detection works. New `/brief-export` confirm UI follows the same `if (textMode) → numbered list ; else → AskUserQuestion` pattern as Phase 4·5·7 |

**Key insight:** Phase 8 is composition + escalation, not new infrastructure. ~80% of the substrate is already shipped from Phases 1·2·4·5·7. The 4 NEW lib files (`deliver.cjs`, `export.cjs`, `voice-fit.cjs`, `leakage-diff.cjs`) total ~800 LOC of new CJS code; the 8 NEW templates + 2 NEW agents + 1 NEW hook + 2 NEW workflows total ~1500 LOC of new prompt/template content. Total NEW code budget ≈ 2300 LOC across 8 atomic commits.

## Common Pitfalls

### Pitfall 1: Force-Accept becomes the user's escape hatch
**What goes wrong:** User hits AUDIENCE/COMPLIANCE BLOCKING repeatedly during pilot, learns to choose option 3 (force-accept) without reading findings, treats override_reason as boilerplate ("regen later"). Pitfall #5 audience defense becomes ceremonial.
**Why it happens:** When the gate is right (artifact genuinely has hedging), the user STILL needs to ship; "force-accept" is the only path forward when content can't be revised in time. The reason field is enforced but not validated for thoughtfulness.
**How to avoid:**
- audit trail in `state.brief.last_gate_results.audience.override` MUST be visible in `/brief-status` (Phase 8 modifies `status.cjs formatGate` to display override count + most recent reason).
- CLAUDE.md / `/brief-help` first force-accept SHOULD show a one-time warning ("force-accept removes Pitfall #5 audience defense for this artifact — proceed?").
- Phase 9 HRD-04 pilot tracks force-accept rate; >30% rate triggers v1.x design review.
**Warning signs:** Multiple `override: true` entries in `state.brief.last_gate_results.audience` history; identical-or-empty `override_reason` text; force-accept used on the FIRST gate run (no attempt to revise).

### Pitfall 2: Marp first-invocation latency surprises the user
**What goes wrong:** User runs `/brief-export proposal-deck`, sees "Rendering..." for 60 seconds, thinks the system hung, ctrl+C, re-runs, ctrl+C again. Never gets a deck.
**Why it happens:** `npx --yes @marp-team/marp-cli@4.3.1` on first invocation downloads ~50MB (puppeteer-core + Chromium-related bindings). Subsequent calls hit npm cache (~2-5s).
**How to avoid:**
- `brief/bin/lib/export.cjs` SHOULD print "First Marp invocation may take 30-60s (downloading marp-cli to npm cache). Subsequent runs are fast." BEFORE spawning npx.
- Document in `brief/references/marp-environment.md` + CLAUDE.md.
- Set explicit `timeout: 120000` (2 min) on the spawnSync call (per Pattern 4).
- Phase 9 HRD-01 cross-runtime smoke test SHOULD pre-warm npm cache.
**Warning signs:** User reports "Marp didn't work"; latency variance between first and subsequent runs.

### Pitfall 3: TF-IDF leakage diff false-positive flood
**What goes wrong:** Two Type B artifacts (INTERNAL + PROPOSAL) share the project name "페이앱" and 5 product feature names; TF-IDF detects 6+ matches; finding fires on every export; user starts ignoring leakage findings; real leak goes unnoticed.
**Why it happens:** Naive TF-IDF flags any high-frequency unique term, including legitimate cross-document vocabulary.
**How to avoid:**
- Stop-word list MUST include project-specific common terms (the PROJECT.md project name and the OBJECTIVES.md core nouns).
- Threshold = 3 (per C-D02 lock) is tunable; canary fixture validation catches drift.
- `brief/bin/lib/leakage-diff.cjs` SHOULD expose stop-word list via `brief/references/voice-fit-vocabulary.md` so users can extend per-project.
- Canary E2E test: assert (a) intentional leak fixture (5+ verbatim sentences from INTERNAL copied to PROPOSAL) FLAGGED; (b) "incidental" fixture (only project name + 2 generic features overlap) NOT FLAGGED.
**Warning signs:** Multiple leakage findings on every export; user comments "leakage is wrong"; finding density > 1 per export.

### Pitfall 4: CC-03 hook silently no-ops on opt-in default
**What goes wrong:** Dogfooding user runs `/brief-deliver --type-b internal-deck`, commits the artifact, frontmatter is missing — hook does nothing because `hooks.community: false` (default). User assumes Phase 8 audience defense is active.
**Why it happens:** Phase 5 D-06 opt-in pattern is intentional (avoids dogfooding friction) but creates a discoverability gap.
**How to avoid:**
- README + CLAUDE.md MUST explicitly document the opt-in.
- `/brief-help` MUST mention the opt-in when describing `/brief-deliver --type-b`.
- `/brief-status` MAY display "CC-03 hook: opt-in (set hooks.community: true to enable)" warning when Type B deliverable artifacts are present.
- Phase 9 HRD-04 pilot data evaluates default opt-in.
**Warning signs:** Type B artifact commits without frontmatter validation finding; user surprise during pilot.

### Pitfall 5: ko/en branch decision drift on missing region
**What goes wrong:** User sets `business_context.region: kr` in OBJECTIVES.md but does NOT set it in `state.brief.region`. `/brief-deliver --type-b internal-deck` emits English. User confused.
**Why it happens:** Phase 5 D-13 `buildBusinessContext()` already handles this (Hangul fallback detection), but Phase 8 `--en` flag could override the auto-detect, and edge cases exist when neither signal is present.
**How to avoid:**
- `brief/bin/lib/deliver.cjs` MUST call `buildBusinessContext({ cwd })` and consult `language: 'ko'` field (already returned by Phase 5 helper, NOT region-only).
- region missing fallback: `/brief-deliver` warns ("region not declared in OBJECTIVES.md — defaulting to en"). Phase 9 HRD-04 captures real-user friction.
**Warning signs:** Korean user complains about English output; missing region in OBJECTIVES.md.

### Pitfall 6: Type A workstream-dependency gaps produce silent placeholders
**What goes wrong:** User runs `/brief-deliver --type-a` after only completing BMC and GTM workstreams. PRODUCT-BRIEF synthesizes correctly (only needs those 2 + OBJECTIVES). HIGH-LEVEL-SPEC fails — TECH-ARCH and ROADMAP missing. User ships PRODUCT-BRIEF without realizing HIGH-LEVEL-SPEC has only placeholders.
**Why it happens:** `deliver.cjs` graceful degradation (placeholder + warning) is necessary for partial-state UX, but the WARNING must be loud enough to prevent shipping.
**How to avoid:**
- Per-artifact dependency check: emit a structured warning to STDOUT before each artifact synthesis ("HIGH-LEVEL-SPEC requires TECH-ARCH (missing) + ROADMAP (missing) — rendering with placeholders").
- The synthesized markdown MUST contain `> ⚠️ Placeholder section — TECH-ARCH workstream not completed.` blocks where missing data was expected.
- `/brief-deliver --type-a` returns non-zero exit OR explicit "incomplete" status when ANY artifact uses placeholders.
**Warning signs:** Type A artifact contains `Placeholder` markers in shipped form; user did not see warning before commit.

### Pitfall 7: AUDIENCE/COMPLIANCE re-execution cost stacks up
**What goes wrong:** User runs `/brief-deliver` for all 4 Type B artifacts sequentially. Each `/brief-export` re-runs ALIGN+AUDIENCE+COMPLIANCE = 3 LLM Task calls × 4 artifacts = 12 Task calls. At Task cost ~$0.50 each, that's $6 per full DELIVER cycle. User bills 5 cycles in a day = $30 unaccounted.
**Why it happens:** Phase 7 D-02 sequential 3-gate threading is the safety pattern; Phase 8 inherits it. Re-execution per export is intentional (artifact may have been edited), not cached.
**How to avoid:**
- `brief/bin/lib/export.cjs` SHOULD log gate-run cost estimate before each invocation.
- `/brief-status` MAY show running export-cost telemetry.
- Future v1.x: gate-result staleness policy (skip re-run if artifact hash unchanged since Phase 5/7 verdict and within N hours). Out-of-scope for Phase 8.
**Warning signs:** Token spend telemetry reveals high `/brief-export` cost; user reports surprise on bill.

### Pitfall 8: Marp `--allow-local-files` security trade-off
**What goes wrong:** User includes `![image](file:///etc/passwd)` in a Type B markdown source. Marp render with `--allow-local-files` reads it. Image embedded in PPTX. Confidential file leaked.
**Why it happens:** `--allow-local-files` is required to embed local images in PPTX/PDF output; without it, only data URIs and HTTPS images render. Defaults vary by Marp version.
**How to avoid:**
- `/brief-export` SHOULD scan markdown source for `file://` references AND `![](relative/path/...)` references; if any path resolves outside `.planning/` or `brief/templates/`, BLOCK with explicit error.
- DO NOT pass `--allow-local-files` to Marp by default. Add explicit flag handling per `voice.allow_local_files: true` opt-in.
- Phase 9 HRD-04 pilot validates real-user image-handling needs.
**Warning signs:** Markdown source contains absolute file paths; PPTX contains unexpected image content.

## Code Examples

### Example 1: deliver.cjs Type A auto-synthesis dispatcher

```javascript
// File: brief/bin/lib/deliver.cjs (NEW Phase 8)
// Source: composes Phase 5 buildBusinessContext + Phase 7 workstream artifact reads + Phase 2 D-20 frontmatter

const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync, planningPaths } = require('./core.cjs');
const { extractFrontmatter, reconstructFrontmatter, stripFrontmatter } = require('./frontmatter.cjs');
const { buildBusinessContext } = require('./context-inject.cjs');

const TYPE_A_ARTIFACTS = ['product-brief', 'service-policy', 'high-level-spec', 'feature-map'];

const SYNTHESIS_MAP = {
  'product-brief': {
    sources: [
      { artifact: 'workstreams/business-model-canvas/canvas.md', sections: ['## Customer Segments', '## Value Proposition'] },
      { artifact: 'workstreams/go-to-market/go-to-market.md', sections: ['## Personas'] },
    ],
    objectivesSections: ['## Immutable Intent'],
    template: 'brief/templates/deliver/type-a/product-brief.md',
  },
  'service-policy': {
    sources: [
      { artifact: 'workstreams/operations/operations.md', sections: ['## Process', '## Tools'] },
      { artifact: 'workstreams/compliance/compliance.md', sections: ['## Documented obligations addressed:'] },
    ],
    objectivesSections: [], // SERVICE-POLICY drives off business_model alone
    template: 'brief/templates/deliver/type-a/service-policy.md',
    conditionalProse: true, // B2B/B2C variant via Phase 7 D-14 pattern
  },
  // HIGH-LEVEL-SPEC and FEATURE-MAP analogous; omitted for brevity in this snippet
};

function checkDependencies(cwd, artifactKey) {
  const config = SYNTHESIS_MAP[artifactKey];
  const missing = [];
  for (const src of config.sources) {
    const fullPath = path.join(cwd, '.planning', src.artifact);
    if (!fs.existsSync(fullPath)) missing.push(src.artifact);
  }
  return { complete: missing.length === 0, missing };
}

function synthesizeTypeA(cwd, artifactKey, options /* { en?: boolean } */) {
  const ctx = buildBusinessContext({ cwd });
  const config = SYNTHESIS_MAP[artifactKey];
  const dep = checkDependencies(cwd, artifactKey);

  if (!dep.complete) {
    process.stderr.write(`⚠ Type A artifact '${artifactKey}' has missing source workstreams: ${dep.missing.join(', ')}. Rendering with placeholders.\n`);
  }

  // Read template
  const templatePath = path.join(cwd, config.template);
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Read each source artifact and extract requested sections
  const sectionContent = {};
  for (const src of config.sources) {
    const fullPath = path.join(cwd, '.planning', src.artifact);
    if (!fs.existsSync(fullPath)) {
      for (const sec of src.sections) {
        sectionContent[sec] = `> ⚠️ Placeholder — ${src.artifact} workstream not completed. Run /brief-design to populate.`;
      }
      continue;
    }
    const body = stripFrontmatter(fs.readFileSync(fullPath, 'utf-8'));
    for (const sec of src.sections) {
      sectionContent[sec] = extractMarkdownSection(body, sec);
    }
  }

  // Read OBJECTIVES sections
  const objectivesPath = path.join(planningPaths(cwd).planning, 'OBJECTIVES.md');
  if (fs.existsSync(objectivesPath)) {
    const objBody = stripFrontmatter(fs.readFileSync(objectivesPath, 'utf-8'));
    for (const sec of config.objectivesSections) {
      sectionContent[sec] = extractMarkdownSection(objBody, sec);
    }
  }

  // Determine output path + frontmatter
  const outDir = path.join(cwd, '.planning', 'deliverables', 'type-a');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${artifactKey}.md`);

  // Compose frontmatter (5 mandatory + voice.languages if --en or voice.languages opt-in)
  const fm = {
    'audience.type': 'internal',
    'audience.confidentiality': 'internal',
    'voice.tone': ctx.audienceDefaults['voice.tone'],
    'voice.perspective': ctx.audienceDefaults['voice.perspective'],
    'business_context.model': ctx.business_model || 'b2b',
    'business_context.region': ctx.region || '',
  };
  if (options.en || ctx.language === 'en') fm['voice.languages'] = ['en'];
  if (ctx.language === 'ko') fm['voice.languages'] = options.en ? ['ko', 'en'] : ['ko'];

  // Fill template with section content
  let body = template;
  for (const [section, content] of Object.entries(sectionContent)) {
    const placeholder = `<!-- INSERT: ${section} -->`;
    body = body.replace(placeholder, content);
  }

  // Apply B2B/B2C conditional prose (Phase 7 D-14 pattern) if config.conditionalProse
  if (config.conditionalProse) {
    body = applyConditionalProse(body, ctx.business_model);
  }

  const finalContent = `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  atomicWriteFileSync(outPath, finalContent, 'utf-8');

  return { outPath, complete: dep.complete, missing: dep.missing };
}

// Source: section extraction follows the same shape as Phase 7 workstream-loader.cjs
function extractMarkdownSection(body, heading) {
  const lines = body.split(/\r?\n/);
  const startIdx = lines.findIndex((ln) => ln.trim() === heading);
  if (startIdx === -1) return `<!-- ${heading} not found in source -->`;
  // Same-or-higher-level heading terminates the section
  const headingLevel = (heading.match(/^#+/) || [''])[0].length;
  const endIdx = lines.slice(startIdx + 1).findIndex((ln) => {
    const m = ln.match(/^(#+)\s/);
    return m && m[1].length <= headingLevel;
  });
  return lines.slice(startIdx + 1, endIdx === -1 ? undefined : startIdx + 1 + endIdx).join('\n').trim();
}

// Source: Phase 7 D-14 conditional prose pattern — block markers <!--BEGIN/END business_model: X-->
function applyConditionalProse(body, businessModel) {
  const bm = (businessModel || '').toLowerCase();
  return body.replace(/<!--\s*BEGIN business_model:\s*(\w+)\s*-->[\s\S]*?<!--\s*END business_model:\s*\1\s*-->/g,
    (match, modelTag) => modelTag.toLowerCase() === bm ? match.replace(/<!--\s*BEGIN business_model:\s*\w+\s*-->/, '').replace(/<!--\s*END business_model:\s*\w+\s*-->/, '') : ''
  );
}

module.exports = { synthesizeTypeA, TYPE_A_ARTIFACTS, SYNTHESIS_MAP, checkDependencies };
```

### Example 2: export.cjs main flow

```javascript
// File: brief/bin/lib/export.cjs (NEW Phase 8)
// Source: composes Phase 5 audience.cjs + Phase 7 compliance.cjs + Phase 8 leakage-diff + Marp wrapper

const fs = require('fs');
const path = require('path');
const audience = require('./audience.cjs');
const compliance = require('./compliance.cjs');
const { leakageDiff } = require('./leakage-diff.cjs');
const { extractFrontmatter } = require('./frontmatter.cjs');
const { renderMarp, detectBrowser, detectLibreOffice } = require('./marp-wrapper.cjs'); // Pattern 4

async function exportArtifact(cwd, artifactPath, options /* { format, theme, allowFallback, askUser } */) {
  // Step 1: Cross-artifact leakage diff (TF-IDF)
  const leakage = leakageDiff(artifactPath);
  if (leakage.findings.length > 0) {
    // Display findings to user; surface in confirm UI Step 4
  }

  // Step 2: AUDIENCE re-run (separate run-id from Phase 5 in-flight)
  const exportRunId = `export-${Date.now()}`;
  const audienceVerdict = audience.runAudience(cwd, {
    artifact: artifactPath,
    baseline: path.join(cwd, '.planning', 'OBJECTIVES.md'),
    verdictOutPath: path.join(cwd, '.planning', `.${exportRunId}.audience-verdict.tmp.json`),
  });

  let blocked = null;
  if (audienceVerdict.severity === 'blocking') {
    // Step 5: 3-path interrupt
    const choice = await options.askUser({
      title: 'AUDIENCE BLOCKING',
      findings: audienceVerdict.findings,
      paths: ['frontmatter 수정', '데크 다시 쓰기', 'force-accept (audit trail)'],
    });
    if (choice === 0) return { ok: false, reason: 'user chose frontmatter revision' };
    if (choice === 1) return { ok: false, reason: 'user chose content rewrite' };
    if (choice === 2) {
      const reason = await options.askUser({ prompt: 'override_reason (audit trail):' });
      audience.commitAudienceVerdict(cwd, {
        verdictPath: path.join(cwd, '.planning', `.${exportRunId}.audience-verdict.tmp.json`),
        artifactPath: path.relative(cwd, artifactPath),
        override: true,
        overrideReason: reason,
      });
      blocked = null; // proceed with audit
    }
  } else {
    audience.commitAudienceVerdict(cwd, {
      verdictPath: path.join(cwd, '.planning', `.${exportRunId}.audience-verdict.tmp.json`),
      artifactPath: path.relative(cwd, artifactPath),
    });
  }

  // Step 3: COMPLIANCE re-run (similar dispatch — omitted for brevity)
  // Step 4: 1-step confirm UI (Pattern 8 — Korean/English variant per region)
  const fm = extractFrontmatter(fs.readFileSync(artifactPath, 'utf-8'));
  const confirmation = await options.askUser({
    title: 'BRIEF ► EXPORT 확인 (region: kr) | EXPORT CONFIRMATION',
    body: formatConfirmUI({ artifactPath, fm, leakage, audienceVerdict }),
    paths: ['Yes, render', 'No, cancel'],
  });
  if (confirmation !== 0) return { ok: false, reason: 'user cancelled' };

  // Step 6: Marp render via npx (Pattern 4)
  const conf = fm['audience.confidentiality'] || (fm.audience && fm.audience.confidentiality);
  const baseName = path.basename(artifactPath, '.md');
  const outPath = path.join(path.dirname(artifactPath), `${baseName}.${conf}.${options.format}`);
  const renderResult = renderMarp(cwd, {
    inputMd: artifactPath,
    outputPath: outPath,
    format: options.format,
    theme: options.theme,
    allowFallback: true,
  });

  return { ok: true, output: renderResult.outputPath, ranFormat: renderResult.ranFormat };
}

module.exports = { exportArtifact };
```

### Example 3: Marp deck source template (Type B internal-deck)

```markdown
<!-- File: brief/templates/deliver/type-b/internal-deck.md (NEW Phase 8) -->
<!-- Source: D-D01 Sequoia/YC 7-9 slide variant + B-D02 Marp directive watermark + B-D02 first-slide content -->
---
audience.type: internal
audience.confidentiality: confidential
voice.tone: formal
voice.perspective: first-person-plural
business_context.model: <!-- INSERT: business_model -->
business_context.region: <!-- INSERT: region -->
voice.languages: <!-- INSERT: languages -->
marp: true
theme: default
paginate: true
footer: 'CONFIDENTIAL — Internal use only — Do not share'
---

<!-- Slide 1: Cover -->
# <!-- INSERT: project_title -->

> **CONFIDENTIAL — Internal use only — Do not share**
>
> Generated <!-- INSERT: date --> by BRIEF

---

<!-- Slide 2: Problem (BMC Customer Segments + Customer Jobs) -->
## Problem

<!-- INSERT: ## Customer Segments + ## Customer Jobs -->

---

<!-- Slide 3: Solution (BMC Value Proposition + Type A PRODUCT-BRIEF Core Value) -->
## Solution

<!-- INSERT: ## Value Proposition -->

---

<!-- Slide 4: Market (DISCOVER market-sizing — provenance tags MUST be preserved) -->
## Market

<!-- INSERT: market-sizing.md (provenance tags preserved) -->

---

<!-- Slide 5: Strategy (BMC Key Activities + GTM Channels) — INTERNAL only; PROPOSAL replaces with "Traction" -->
## Strategy

<!-- INSERT: ## Key Activities + ## Channels -->

---

<!-- Slide 6: Roadmap (ROADMAP workstream phases) -->
## Roadmap

<!-- INSERT: ## Phased Roadmap -->

---

<!-- Slide 7: Ask (Internal — executive decision request) -->
## Ask

<!-- INSERT: executive_decision_ask -->

---

<!-- Optional Slide 8: Team (OPERATIONS Team — small team only; redacted for partner audience) -->
## Team

<!-- INSERT: ## Team (small list) -->

---

<!-- Optional Slide 9: Appendix (FINANCIAL summary — INTERNAL only) -->
## Appendix

<!-- INSERT: ## Financial Summary -->
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-step gate (pass/fail flag) | 3-output verdict + paired-sibling + vocabulary-lock canonical pattern (4th instance lock in Phase 7) | Phase 4 (2026-04, ALIGN) | Phase 8 reuses substrate, escalates from soft warning to hard block + force-accept option for Type B. NO new gate vocabulary needed |
| Hand-rolled YAML parser | `frontmatter.cjs` recursive serializer with nested-map + null + arrays-of-objects support | Phase 2 D-20 (2026-04-19) | Phase 8 hook validation reuses inline node `-e` script for the closed-vocabulary 5-field check; full YAML semantics not needed at hook layer |
| Built-in commands assumed cap = ∞ | Hard cap ≤12 user-facing commands documented in CLAUDE.md `## Surface Caps` | Phase 2 (2026-04) | Phase 8 NET +2 (`/brief-deliver`, `/brief-export`); Phase 9 HRD-02 audits final count |
| Markdown→PPTX = custom converter | `npx --yes @marp-team/marp-cli@4.3.1` | Phase 8 (2026-04, this phase) | Zero runtime dep; ships with browser fallback (Chrome → Edge → Firefox per Marp 4 release); LibreOffice optional for editable PPTX |
| Banned-words check = post-hoc human review | Inline regex `BANNED_EN` / `BANNED_KO` in `voice-fit.cjs` + 1-shot regenerate | Phase 8 (this phase) | Lightweight; pilot data drives v1.x escalation |
| TF-IDF = runtime library (`natural`) | Pure-CJS `leakage-diff.cjs` (~150 LOC) | Phase 8 (this phase) | Preserves A1 zero-deps; Korean-aware via Hangul regex |

**Deprecated/outdated:**
- gray-matter (4.0.3) — STILL the de-facto standard for general-purpose YAML frontmatter parsing, but BRIEF's CC-03 hook only needs closed-vocabulary 5-field validation; full YAML semantics not justified at the hook layer.
- ajv — NOT deprecated, but Phase 4·5·7·8 closed-vocabulary verdict shape is too small to justify the dep.
- Pandoc — NOT deprecated, but inferior to Marp for slide rendering. Documented as fallback in `brief/references/marp-environment.md`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `package.json dependencies: {}` (zero runtime deps) is preserved through Phase 8 | Standard Stack; Don't Hand-Roll; Architecture Patterns | If A1 is broken, BRIEF lightness is gone; STACK.md A1 listed VERIFIED 2026-04-18 (FND-04). Phase 8 plan MUST re-run `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` after each new lib commit and assert == 0. **`[VERIFIED 2026-04-26: package.json shows ONLY devDependencies (c8, esbuild, vitest); no dependencies field exists]`** |
| A2 | Marp CLI 4.3.1 npx invocation works across Claude Code / Codex / Gemini / OpenCode runtime sandboxes (no network restriction blocks `npx`) | Marp CLI Invocation; Environment Availability | If a sandbox blocks npx, decks fail; document fallback `npm install -g @marp-team/marp-cli@4.3.1`. STACK.md A4 status: needs Phase 9 HRD-01 cross-runtime smoke. Phase 8 canary E2E SHOULD test at least Claude Code runtime; full cross-runtime is HRD-01. **`[ASSUMED — to be verified Phase 9 HRD-01]`** |
| A3 | Phase 5 `audience.cjs runAudience()` accepts a custom `verdictOutPath` to support separate export run-ids without overwriting Phase 5 in-flight verdicts | Inherited Gate Substrate | **`[VERIFIED 2026-04-26: audience.cjs lines 295-326 — runAudience(cwd, opts) accepts opts.verdictOutPath; defaults to .planning/.audience-verdict.tmp.json if absent. Phase 8 export passes a unique run-id-prefixed path]`** |
| A4 | Phase 7 `compliance.cjs runCompliance()` exposes the same shape as audience (verdictOutPath optional, llmPass injection) | Inherited Gate Substrate | **`[VERIFIED 2026-04-26: compliance.cjs file inspection lines 1-30 — duplicate-renamed from audience.cjs per Phase 7 D-01..D-04; same signature]`** |
| A5 | TF-IDF threshold = 3 (per C-D02 lock) is sufficient for Korea-first B2C fintech canary fixture without false positives on common business vocabulary | TF-IDF Cross-Artifact Leakage Diff | **`[ASSUMED]`** Threshold has not been empirically validated. Canary E2E test in Plan 8 MUST validate (a) intentional leak detected, (b) incidental match NOT flagged. If threshold needs adjustment, document in `brief/references/voice-fit-vocabulary.md` |
| A6 | Korean banned-words seed list (8 items: 혁신적인, 차별화된, 게임체인저, 패러다임 시프트, 시너지, 활용, 최적화, 글로벌 스탠더드) catches the most common Korean AI slop | voice-fit.cjs | **`[ASSUMED]`** Based on PITFALLS.md §Pitfall #11 + general Korean business writing; not pilot-validated. Phase 9 HRD-04 pilot data SHOULD inform expansion |
| A7 | Marp CLI's `footer:` directive renders to ALL slides INCLUDING the first slide (Cover) when paginate: true | Pattern 2 — 4-Layer Audience Defense | **`[CITED: github.com/marp-team/marp-cli — README]`** confirms `footer:` is a frontmatter directive applied globally across all slides. The literal first-slide content (B-D02 Cover slide) provides emphasis ON TOP of the global footer |
| A8 | First-Marp-invocation latency (npx download) is <120s (the spawnSync timeout) on a typical npm registry connection | Pattern 4 — Marp CLI Invocation | **`[ASSUMED]`** Some enterprise networks or air-gapped environments may exceed this. Document `npm install -g @marp-team/marp-cli@4.3.1` fallback for these users |
| A9 | `business_context.region` in OBJECTIVES.md frontmatter ALWAYS ends up in `state.brief.region` after `/brief-define` Mode A | ko/en Branching | **`[VERIFIED 2026-04-26: tests/fixtures/objectives-korea-b2c-fintech.md frontmatter shows business_context.region: kr; Phase 3 D-04 Mode A writes both fields atomically]`** |
| A10 | The `voice.languages` frontmatter field is NEW (Phase 8 D-D03) — no prior phase writes it; `frontmatter.cjs` D-20 nested-map serializer handles it | Standard Stack; Conditional Prose | **`[VERIFIED 2026-04-26: grep for voice.languages in brief/bin/lib/*.cjs and brief/references/*.md returns ZERO existing references; frontmatter.cjs supports inline arrays via splitInlineArray (lines 15-41) — `voice.languages: [ko, en]` parses correctly]`** |
| A11 | The `state.brief.last_gate_results.audience` map already supports nested `override`/`override_reason`/`override_at` leaves (Phase 4 D-07 substrate) without state.cjs allowlist extension | Force-Accept Audit Trail | **`[VERIFIED 2026-04-26: audience.cjs lines 392-407 — readModifyWriteStateMd writes fm.brief.last_gate_results.audience with override/override_reason fields under existing allowlist (state.cjs PHASE_2_BRIEF_FIELDS includes last_gate_results as a top-level field; nested children are preserve-wholesale per Phase 2 D-21 mechanism)]`** |
| A12 | Phase 8 NEW state fields (`state.brief.deliverable_index`, `state.brief.last_export_at`) require allowlist extension via Phase 2 D-21 procedure | State Allowlist Extension | **`[VERIFIED 2026-04-26: state.cjs lines 39-43 PHASE_7_BRIEF_FIELDS pattern — Phase 8 adds analogous PHASE_8_BRIEF_FIELDS = ['deliverable_index', 'last_export_at'] frozen array with documenting comment in header]`** |
| A13 | The 4 Marp output formats (PPTX / PDF / HTML / PNG) all support the watermark via `footer:` directive | Pattern 2 | **`[CITED: github.com/marp-team/marp-cli — README]`** confirms `footer:` is rendered in all output formats |

## Open Questions

1. **Should `/brief-export` re-execute ALIGN gate too, or only AUDIENCE+COMPLIANCE?**
   - What we know: Phase 7 D-02 sequential 3-gate threading (ALIGN→AUDIENCE→COMPLIANCE) for every workstream artifact.
   - What's unclear: Phase 8 `/brief-export` covers Type B artifacts that were generated by Phase 8 agents (not the workstream Phase 7 path). They may not have been ALIGN-gated yet.
   - Recommendation: `/brief-export` runs all 3 (ALIGN + AUDIENCE + COMPLIANCE) in sequence. ALIGN re-run cost is acceptable; the artifact's alignment to OBJECTIVES.md is critical for any external-facing deck. Document in plan.

2. **Cross-artifact leakage diff scope: same-folder only, or include workstream artifacts?**
   - What we know: C-D02 says "같은 폴더 내" (same folder).
   - What's unclear: Should the diff also check Phase 7 workstream artifacts (e.g., RISK workstream contains internal strategy that could leak into PROPOSAL deck)?
   - Recommendation: Phase 8 v1 = same-folder only (per C-D02 lock). Workstream-cross-folder check is a Phase 9 HRD-04 v1.x consideration.

3. **Marp theme inheritance vs per-artifact theme override?**
   - What we know: D-D01 mentions theme suggestion (default for INTERNAL, gaia for PROPOSAL).
   - What's unclear: Should the user override theme per artifact via frontmatter, or via `--theme` CLI flag?
   - Recommendation: Both. Frontmatter `marp.theme: <name>` for persistent override; CLI `--theme <path>` for one-shot.

4. **CC-03 hook scope: validate ALL `.planning/**/*.md`, or only deliverables + paired-siblings?**
   - What we know: B-D04 says "staged `.planning/**/*.md`".
   - What's unclear: STATE.md, REQUIREMENTS.md, ROADMAP.md don't have `audience.*` frontmatter — would the hook block these?
   - Recommendation: Hook MUST scan only files that have a frontmatter block AND meet a path-pattern filter (`.planning/deliverables/**/*.md` + `.planning/workstreams/**/*.md` + paired-sibling `.audience.md` / `.compliance.md`). STATE.md / OBJECTIVES.md / REQUIREMENTS.md SKIPPED via path filter.

5. **Type A artifacts: Do they need paired-sibling `.audience.md` and `.compliance.md` too?**
   - What we know: A-D01 says paired-sibling lives in same folder as artifact.
   - What's unclear: Phase 8 spec says `/brief-export` is Type B only; does Type A run AUDIENCE/COMPLIANCE through `/brief-deliver` or skip the gates?
   - Recommendation: Type A runs AUDIENCE + COMPLIANCE inline within `/brief-deliver --type-a` (Phase 7 D-02 sequential pattern); paired-siblings are written. `/brief-export` is exclusively for the Marp render step (Type B).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Everything | ✓ | v24.14.0 (≥22.0.0 required) | None — hard requirement |
| npm | npx invocations | ✓ | 11.11.1 | None |
| npx | Marp CLI invocation | ✓ | 11.11.1 (ships with npm) | Manual `npm install -g @marp-team/marp-cli@4.3.1` |
| git | Atomic commit infrastructure (inherited) | ✓ | 2.50.1 (Apple Git-155) | None |
| Chrome / Edge / Firefox | Marp PPTX/PDF/PNG rendering | likely ✓ (planner cannot detect on agent host) | — | Render to HTML format only (always works without browser); document install instructions in `brief/references/marp-environment.md` |
| LibreOffice Impress | Marp `--pptx-editable` mode (optional) | likely ✗ | — | Default Marp mode produces non-editable PPTX (image-based slides; works without LibreOffice) |
| Pandoc | Optional fallback if Marp completely fails | likely ✗ | — | Skip; Marp covers the use case |

**Missing dependencies with no fallback:** None for v1. (HTML output works without any browser.)

**Missing dependencies with fallback:**
- Chrome/Edge/Firefox: PDF/PPTX/PNG rendering requires one of these. Phase 8 plan ships HTML-fallback as last resort; Phase 9 HRD-01 cross-runtime smoke validates Chrome/Edge presence on test runners.
- LibreOffice: Editable PPTX is an opt-in feature (`--pptx-editable`); Phase 8 plan defaults to non-editable (image-based) PPTX.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `node:test` (built-in) + `c8` (V8 coverage) |
| Config file | `package.json scripts.test` → `node scripts/run-tests.cjs`; `package.json scripts.test:coverage` → `c8 --check-coverage --lines 70 --include 'brief/bin/lib/*.cjs' ...` |
| Quick run command | `node --test --test-concurrency=4 tests/brief-deliver-*.test.cjs tests/brief-export-*.test.cjs` |
| Full suite command | `npm test` (or `node scripts/run-tests.cjs`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **DLV-01** | `/brief-deliver --type-a` synthesizes PRODUCT-BRIEF.md from OBJECTIVES + BMC + GTM | unit + integration | `node --test tests/brief-deliver-type-a.test.cjs` | ❌ Wave 0 |
| **DLV-02** | SERVICE-POLICY B2B/B2C variant via conditional prose | unit | `node --test tests/brief-deliver-service-policy-b2b-b2c.test.cjs` | ❌ Wave 0 |
| **DLV-03** | HIGH-LEVEL-SPEC synthesizes from TECH-ARCH + ROADMAP + RISK | unit | `node --test tests/brief-deliver-high-level-spec.test.cjs` | ❌ Wave 0 |
| **DLV-04** | FEATURE-MAP outputs Mermaid mindmap or ASCII tree | unit | `node --test tests/brief-deliver-feature-map.test.cjs` | ❌ Wave 0 |
| **DLV-05** | `/brief-deliver --type-b internal-deck` → Marp source markdown | integration | `node --test tests/brief-deliver-type-b-marp.test.cjs` (mock Marp invocation; assert markdown shape) | ❌ Wave 0 |
| **DLV-05** (manual smoke) | Real Marp render produces .pptx | integration (manual or CI-with-Chrome) | `MARP_SMOKE=1 node --test tests/brief-deliver-marp-render-smoke.test.cjs` (skipped if no Chrome) | ❌ Wave 0 |
| **DLV-06** | PROPOSAL-DECK with confidentiality `partner` triggers leakage diff against INTERNAL-DECK siblings | unit | `node --test tests/brief-export-leakage-diff.test.cjs` | ❌ Wave 0 |
| **DLV-07** | EXEC-SUMMARY narrative 5-section + DECISION-MEMO ADR 4-section schema | unit | `node --test tests/brief-deliver-exec-summary-decision-memo.test.cjs` | ❌ Wave 0 |
| **DLV-08** | `/brief-export` mandatory checkpoint blocks render without confirm | integration | `node --test tests/brief-export-confirm-ui.test.cjs` | ❌ Wave 0 |
| **DLV-09** | Filename `{name}.{confidentiality}.{ext}` + first-slide watermark in markdown source | unit | `node --test tests/brief-export-filename-watermark.test.cjs` | ❌ Wave 0 |
| **CC-03** | Pre-commit hook blocks staged .planning/**.md missing audience.type/audience.confidentiality/voice.tone/voice.perspective/business_context.model | integration | `node --test tests/brief-validate-frontmatter-hook.test.cjs` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `node --test --test-concurrency=4 tests/brief-deliver-*.test.cjs tests/brief-export-*.test.cjs tests/brief-voice-fit-*.test.cjs tests/brief-validate-frontmatter-hook.test.cjs` (Phase 8 subset, ~30s)
- **Per wave merge:** `npm test` (full suite — current 225/225 Phase 7 tests + new ~12 Phase 8 tests = ~237/237 expected)
- **Phase gate:** Full suite green + Marp smoke (with Chrome) green before `/brief-verify-work`

### Wave 0 Gaps

- [ ] `tests/brief-deliver-type-a.test.cjs` — DLV-01 PRODUCT-BRIEF synthesis
- [ ] `tests/brief-deliver-service-policy-b2b-b2c.test.cjs` — DLV-02 conditional prose
- [ ] `tests/brief-deliver-high-level-spec.test.cjs` — DLV-03 multi-workstream synthesis
- [ ] `tests/brief-deliver-feature-map.test.cjs` — DLV-04 Mermaid/ASCII output
- [ ] `tests/brief-deliver-type-b-marp.test.cjs` — DLV-05 Marp source markdown shape
- [ ] `tests/brief-deliver-marp-render-smoke.test.cjs` — DLV-05 real render (CI-only with Chrome)
- [ ] `tests/brief-export-leakage-diff.test.cjs` — DLV-06 + C-D02 TF-IDF diff
- [ ] `tests/brief-deliver-exec-summary-decision-memo.test.cjs` — DLV-07 markdown-only schema
- [ ] `tests/brief-export-confirm-ui.test.cjs` — DLV-08 mandatory confirm + Korean variant
- [ ] `tests/brief-export-audience-rerun.test.cjs` — Phase 5 substrate re-run with separate run-id
- [ ] `tests/brief-export-compliance-rerun.test.cjs` — Phase 7 substrate re-run
- [ ] `tests/brief-export-force-accept-audit.test.cjs` — Phase 4 D-07 audit trail first live use
- [ ] `tests/brief-export-filename-watermark.test.cjs` — DLV-09 Layer 1 + Layer 2
- [ ] `tests/brief-voice-fit-banned-words.test.cjs` — C-D03 banned-words density + 1-shot regenerate
- [ ] `tests/brief-voice-fit-concreteness.test.cjs` — C-D04 specific-numbers heuristic
- [ ] `tests/brief-voice-fit-honorific-ko.test.cjs` — D-D04 한국어 반말 detection (external context)
- [ ] `tests/brief-deliver-ko-en-branching.test.cjs` — D-D03 region: kr → ko 단일; --en → pair
- [ ] `tests/brief-validate-frontmatter-hook.test.cjs` — CC-03 hook missing-field block + opt-in gate (Korean + English error)
- [ ] `tests/brief-deliver-canary.test.cjs` — Korea-first B2C fintech canary E2E (3-flow: type-a + type-b internal + type-b proposal with leakage)
- [ ] `tests/brief-deliver-text-mode.test.cjs` — AskUserQuestion → numbered-list cross-runtime parity
- [ ] `tests/brief-deliver-vocabulary-lock.test.cjs` — assert no new gate vocabulary added (Phase 4·5·7 lock preserved)
- [ ] `tests/brief-deliver-no-hooks.test.cjs` — anti-pattern #2 structural test (no PostToolUse / SubagentStop hooks added by Phase 8)
- [ ] Test fixture: `tests/fixtures/deliver/intentional-leak-pair.md` (PROPOSAL deck with 5+ keywords copied from INTERNAL deck — leakage finding expected)
- [ ] Test fixture: `tests/fixtures/deliver/incidental-overlap-pair.md` (PROPOSAL + INTERNAL share project name + generic terms — NO leakage finding expected)
- [ ] Test fixture: `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams.md` (extends Phase 7 fixture with all 9 workstream artifacts populated for full Type A synthesis)
- [ ] Framework: `node:test` already detected; `c8` already configured. NO new framework install needed.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Phase 8 has no auth surface — all operations are file-system local |
| V3 Session Management | no | Same — no session state beyond STATE.md (already covered by Phase 1·2) |
| V4 Access Control | yes | 4-layer audience defense IS the access-control system. Files (`.planning/deliverables/type-b/*.{confidentiality}.{ext}`) carry confidentiality in filename + watermark + frontmatter. CC-03 hook blocks commits that violate the schema |
| V5 Input Validation | yes | (a) Frontmatter validator (CC-03 hook + inline 5-field check); (b) leakage-diff TF-IDF scan on artifact body; (c) banned-words regex post-check on Type B agent output; (d) Marp markdown source path scan (Pitfall 8 — block `file://` and out-of-tree `![]` references) |
| V6 Cryptography | no | No secrets, no encryption — BRIEF is file-and-prompt only per PROJECT.md core constraints. Marp output is plaintext (PPTX/PDF/HTML); confidentiality is enforced via filename + watermark + audience defense, not crypto |
| V8 Data Protection | yes | All Type B artifacts carry mandatory `audience.confidentiality` enum; CC-03 hook blocks commits without it; leakage diff blocks cross-artifact strategy leakage |
| V11 Business Logic | yes | force-accept audit trail (override + override_reason + override_at) MUST be auditable; STATE.md preserved per Phase 4 D-07 |

### Known Threat Patterns for Phase 8 stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Confidential strategy leakage from INTERNAL deck → PROPOSAL deck via copy-paste | Information Disclosure | TF-IDF cross-artifact leakage diff (`leakage-diff.cjs`) — flags 3+ keyword matches against stricter sibling. FINDINGS-MATERIAL severity (per C-D02 lock) |
| User saves Type B PPTX with wrong audience name (manual rename bypassing Layer 1) | Information Disclosure | Layer 4 CC-03 hook validates frontmatter at commit time; mismatched filename vs frontmatter caught (planner consideration: hook MAY also validate filename↔frontmatter consistency in v1.x) |
| User edits markdown source to remove watermark (Layer 2 bypass) | Information Disclosure | Layer 4 CC-03 hook checks `audience.confidentiality` in frontmatter; documented user-responsibility for body-watermark removal. Phase 9 HRD-04 pilot data informs v1.x stricter enforcement |
| User runs `npx @marp-team/marp-cli` directly bypassing `/brief-export` (Layer 3 bypass) | Information Disclosure | Documented as user-responsibility breach in CLAUDE.md / `/brief-help`. NOT enforceable in framework — relies on user discipline |
| Marp `--allow-local-files` exposes `/etc/passwd`-style files via image embed | Information Disclosure | Phase 8 plan does NOT pass `--allow-local-files` by default. Markdown source path scan in `export.cjs` blocks `file://` and out-of-tree references before invoking Marp |
| AI slop ("leverage", "synergize") shipped to investor → credibility damage | Repudiation (reputational) | `voice-fit.cjs` banned-words regex post-check + 1-shot regenerate. FINDINGS-MATERIAL if persists |
| Korean honorific violation (반말 in external Korean artifact) → cultural offense | Repudiation (reputational) | `voice-fit.cjs HONORIFIC_VIOLATION_KO` regex when `audience.confidentiality in {partner, public}` AND region: kr |
| Force-accept used to bypass AUDIENCE blocking without thoughtful reason | Tampering | `state.brief.last_gate_results.audience.override` audit trail (Phase 4 D-07); `/brief-status` displays force-accept count + most recent reason (`status.cjs formatGate` extension) |
| CC-03 hook silent no-op (`hooks.community: false`) leaves Layer 4 inactive | Tampering | Documented opt-in in CLAUDE.md / README + `/brief-help` warning when Type B deliverable artifacts present |

## Sources

### Primary (HIGH confidence)
- **BRIEF codebase** (verified 2026-04-26):
  - `/Users/agent/GSD-for-Business/package.json` — A1 verification: `dependencies` field absent; only `devDependencies` (c8, esbuild, vitest)
  - `/Users/agent/GSD-for-Business/brief/bin/lib/audience.cjs` — Phase 5 substrate: `runAudience(cwd, opts)`, `commitAudienceVerdict(cwd, opts)` with `override`/`overrideReason` support already shipped
  - `/Users/agent/GSD-for-Business/brief/bin/lib/compliance.cjs` — Phase 7 substrate: same shape as audience.cjs (verified lines 1-30 + structural copy-rename per 07-CONTEXT.md D-01)
  - `/Users/agent/GSD-for-Business/brief/bin/lib/context-inject.cjs` — Phase 5 D-13/D-14: `buildBusinessContext({ cwd })` returns `language: 'ko'|'en'`, `audienceDefaults`, `compliance_packs`, `requiredReading`
  - `/Users/agent/GSD-for-Business/brief/bin/lib/frontmatter.cjs` — Phase 2 D-20 nested-map serializer (`reconstructFrontmatter`, `extractFrontmatter`, `splitInlineArray`)
  - `/Users/agent/GSD-for-Business/brief/bin/lib/state.cjs` — Phase 2 D-21 allowlist (`PHASE_7_BRIEF_FIELDS` pattern documented; preserve-wholesale write semantics)
  - `/Users/agent/GSD-for-Business/hooks/brief-validate-provenance.sh` — TEMPLATE for `brief-validate-frontmatter.sh` (verified line-by-line: opt-in gate, JSON command extraction, staged file enumeration, structured Korean/English error)
  - `/Users/agent/GSD-for-Business/scripts/build-hooks.js` — HOOKS_TO_COPY array (line 17-31) where `'brief-validate-frontmatter.sh'` MUST be added
  - `/Users/agent/GSD-for-Business/bin/install.js` — patterns at lines 4762 (uninstall), 5849 (worktree expected), 6307-6328 (install registration)
  - `/Users/agent/GSD-for-Business/.planning/ASSUMPTIONS.md` — A1 VERIFIED 2026-04-18; A4 VERIFIED 2026-04-19
  - `/Users/agent/GSD-for-Business/.planning/config.json` — `workflow.nyquist_validation: true`; `hooks.community: false` (default)
  - `/Users/agent/GSD-for-Business/brief/references/audience-vocabulary.md` — Phase 4 D-09 ban-list extension procedure (lines 96-99)
  - `/Users/agent/GSD-for-Business/brief/workstreams/business-model-canvas/spec.yaml` — Phase 7 D-12 workstream layout pattern
- **npm registry** (verified 2026-04-26 via `npm view`):
  - `@marp-team/marp-cli`: version 4.3.1, time.modified 2026-03-16T16:54:18.076Z
- **Phase prior CONTEXT.md** (verified contextually):
  - 02-CONTEXT.md D-06..D-09 (Surface Caps), D-18 (workflow + lib split), D-20/D-21 (frontmatter + state allowlist)
  - 03-CONTEXT.md D-04 (Korea-signal + business_model)
  - 04-CONTEXT.md D-07 (force-accept audit trail), D-09 (vocabulary-lock)
  - 05-CONTEXT.md D-09..D-15 (AUDIENCE 3-output, frontmatter schema, paired-sibling, context-inject helper, B2B/B2C conditional prose)
  - 07-CONTEXT.md D-01 (COMPLIANCE 3-output verdict), D-02 (sequential 3-gate threading), D-12 (paired-sibling 4종 통일), D-14 (B2B/B2C conditional prose)
- **REQUIREMENTS.md** — DLV-01..DLV-09, CC-03 verbatim
- **github.com/marp-team/marp-cli** — confirmed via WebSearch result extraction:
  - PPTX/PDF/PNG export requires Chrome OR Edge OR Firefox (puppeteer-core)
  - `--browser` option with `auto` default (Chrome → Edge → Firefox fallback) introduced in Marp CLI v4
  - `--browser-timeout` default 30s
  - `--pptx-editable` mode requires LibreOffice Impress
  - `npx --yes @marp-team/marp-cli` documented invocation pattern

### Secondary (MEDIUM confidence)
- WebSearch result: "Introducing Marp CLI v4 ✨ · marp-team · Discussion #542" — confirms v4 release notes including Firefox fallback addition
- WebSearch result: "Cannot Convert to editable PPTX · Issue #673" — confirms LibreOffice dependency for editable PPTX
- WebSearch result: Multiple Marp CLI sandbox/timeout issues (#524, #546, #573, #682) — confirm enterprise/CI sandbox edge cases requiring `CHROME_NO_SANDBOX=1` workarounds

### Tertiary (LOW confidence — needs Phase 9 HRD-01 / HRD-04 validation)
- TF-IDF threshold = 3 false-positive rate on real-world Korean business artifacts
- Korean banned-words seed list (8 items) coverage of actual Korean AI slop in Phase 9 pilot
- First-Marp-invocation latency (< 120s timeout) on enterprise/air-gapped networks
- Force-accept user behavior (frequency, reason quality) under real pilot load

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — Marp CLI 4.3.1 npm-verified 2026-04-26; package.json zero-deps verified inline; all inherited libs (audience.cjs, compliance.cjs, frontmatter.cjs, context-inject.cjs, state.cjs) file-inspected and confirmed correct shape
- Architecture Patterns: HIGH — 4-layer audience defense + sequential 3-gate threading + paired-sibling are direct inheritances from Phase 4·5·7 (4th canonical instance — pattern-locked); Marp invocation pattern matches `brief/workflows/update.md` `npx -y` precedent
- Pitfalls: MEDIUM-HIGH — Force-accept and TF-IDF false-positive risks need pilot validation (Phase 9 HRD-04); Marp environmental dependencies are well-documented and have explicit fallback ladder
- Korean culture / banned-words: MEDIUM — initial seed lists from PITFALLS.md §Pitfall #11 are well-cited but pilot-validation pending
- TF-IDF leakage diff: LOW-MEDIUM — algorithm is mathematically sound but threshold tuning is empirical; canary fixture validation in Plan 8 is the gate

**Research date:** 2026-04-26
**Valid until:** 2026-05-26 (30 days for stable; Marp CLI 4.x is in active maintenance — re-verify version at plan execution time via `npm view @marp-team/marp-cli version`)
