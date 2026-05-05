---
pilot_id: 1
user_role: korean-non-technical-product-owner
logged: 2026-04-27
audience:
  confidentiality: internal
voice:
  languages: [ko, en]
---

# Friction Journal — BRIEF dogfooding session (1 of 3 pilots)

**Pilot scope:** Korean non-technical product owner running BRIEF on BRIEF (dogfooding the framework using itself as the example project from Phase 1 fork through Phase 8 DELIVER).

**Transparency note (B4 revision iteration 1):** Pilot 1 of 3 is the BRIEF build-team vision-keeper — a non-technical Korean product owner who used BRIEF end-to-end on the BRIEF project itself. They are NOT a fully external pilot. They count as pilot 1/3 under D-D01 acceptance because they are non-technical (do not write production code in this project; act as product owner / vision-keeper) and used BRIEF on a real planning project. REQUIREMENTS.md HRD-04 was reworded in revision iteration 1 to match this acceptance. The other 2 pilots (fully external non-developer business planners) are deferred to v1.1 beta per D-D01 + D-D04 — explicitly NOT a v1 launch blocker.

**Coverage:** 1 of 3 non-developer planners per HRD-04 success criterion. Remaining 2/3 deferred to v1.1 beta program per D-D01 (explicit Out of Scope).

**Reading discipline (Pitfall 5):** Each friction row cites a concrete phase where it occurred. severity=high items are triaged below — fixed in Phase 9 OR explicitly logged as v1.1 with rationale.

## Pitfall #9 — Non-developer barriers

| Friction Item | Severity | Frequency | Phase Citation | Mitigation Status |
|---------------|----------|-----------|----------------|-------------------|
| smart_discuss table clutter — gray-area gauntlet load | medium | every phase since Phase 3 (4/4) | Phase 3, 5, 7, 8 | mitigated — batch table with Recommended defaults; user accepts area as-locked-set without per-area discussion |
| agent quota fatigue — Plan 06 agent-spawn limit hit | high | once | Phase 8 Plan 06 | mitigated — single worktree-isolated agent for large plans; Wave parallelism capped at Wave 1 in Phase 9 |
| cwd bug exposure — 3 worktree agents leaked into main | high | once | Phase 8 Wave 1 | mitigated — `<critical_cwd_warning>` block embedded in every executor agent prompt (Plan 08-08 reinforced version) |
| AskUserQuestion fallback gaps — runtime-detection assumed but never end-to-end verified before Phase 9 | medium | latent | Phase 1 FND-06 deferred → Phase 9 HRD-01 | mitigated — stub-driven smoke test verifies text_mode plumbing for all 4 runtimes |
| command surface memorability — 68 inherited commands obscure the 4D phase mental model | high | every session | Phase 1 inherited surface; Phase 2 D-09 cap source; Phase 9 HRD-02 closes | mitigated — surface pruning to locked 12 commands + rich /brief-help with Levenshtein typo suggestion (HRD-03) |
| implementation-seat discomfort — vision-keeper in product owner role surfaces fatigue when forced into code-review seat | medium | every plan-checker iteration | Phase 5/7/8 plan-checker review cycles | partial mitigation — delegated mode (skip 4-gray-area gauntlet on implementation-heavy phases per memory feedback_delegated_mode.md); pilot user can opt out of code-review in v1.1 |

## Severity=high Triage (Pitfall 5 discipline)

All 3 severity=high items above are mitigated within Phase 9 closure or were already mitigated by Phase 8 prior:

1. **agent quota fatigue** — Phase 8 lesson: Plan 06 fallback was inline implementation; Phase 9 plans cap Wave parallelism at Wave 1 (per planning_context recommendation in this plan's parent /brief-plan-phase invocation).
2. **cwd bug exposure** — Plan 08-08 reinforced the `<critical_cwd_warning>` block; Phase 9 plans (this set) embed the same block in any worktree-isolated agent task. Plan 05 (HRD-02 atomic deletion) is the single-agent worktree task in Wave 2.
3. **command surface memorability** — HRD-02 prunes from 68 → 12 (Plan 05); HRD-03 ships rich /brief-help (Plan 02 of this Wave). Both close in Phase 9.

No severity=blocker items found. v1 launch gate prong (i) "0 blocking pilot findings" expected to read PASS at Phase 9 verifier (Plan 06).

## Out of Scope (per D-D01 — v1.1 beta program)

- **2 of 3 remaining non-developer pilots:** Recruit + observe + journal during v1.1 beta. Selection target: one EN business planner (US/EU) + one non-Korean Asian region planner — for cross-region/cross-language friction signal beyond the Korean dogfooding baseline. The launch posture per D-D04 explicitly accepts the partial 1/3 as NOT a launch blocker.

## Appendix — narrative observations (free-form)

### A. Phase shape vs. mental model

The dogfooding session reinforced the Phase 8 lesson that BRIEF's 5-phase shape
(DEFINE → DISCOVER → DESIGN → DELIVER + continuous ALIGN) actually works for the
non-developer audience when each phase has a single canonical entry slash command.

The 4D phase categorization in /brief-help (HRD-03) maps onto the user's existing
mental model from running through 8 prior phases. Ahead of v1 launch the larger UX
risk is the gap between "Korean product owner who has been running BRIEF for 8
phases" and "EN founder running BRIEF for the first time" — the v1.1 beta program
is the right place to surface that signal, not a Phase 9 task.

### B. cwd-bug visceral memory

The Phase 8 cwd-bug remains the most painful single friction event in the journal:
the user's discomfort when 3 worktree agents leaked their changes into main was
visceral. The Plan 08-08 mitigation has held since Plan 09-00 onward.

The pilot user's note for v1.1 is to add a hard pre-flight check (e.g.,
`git rev-parse --show-toplevel` assertion) inside every worktree-isolated agent's
first action, beyond the prompt-level `<critical_cwd_warning>` block. Defense in
depth at the agent boundary is preferable to relying on prompt discipline alone.

### C. Korean honorific + bilingual surface

The pilot user runs BRIEF bilingually (Korean for vision-setting + reflection,
English for code/artifact substrate). The voice-fit honorific guard from Phase 8
Plan 02 caught zero false positives during the dogfooding sessions, but the user
notes that Korean-only frontmatter values were never exercised at runtime — only
the EN-side ban list. The v1.1 beta program should recruit at least one
Korean-only planner to exercise the KO ban list end-to-end.

### D. Memorable feedback signals carried into Phase 9 closure

Three feedback signals from MEMORY.md drove this phase's planning shape and
should be carried forward into v1.1:

1. `feedback_delegated_mode.md` — pivot to delegated mode on implementation-heavy
   phases (Phase 9 was canonical; the gray-area gauntlet collapsed to a 4-area
   batch table accepted in one round).
2. `feedback_area_level_depth.md` — cap each gray area at 2-4 core decisions and
   defer the rest to Claude's Discretion / executor amendment. Phase 9's 4 areas
   honored this discipline (16 decisions total, not 30+).
3. `feedback_checkpoint_at_phase_boundaries.md` — present a Stop/Continue
   checkpoint after verify=ok on a multi-plan phase. Phase 9 has 6 plans;
   the executor must NOT auto-chain into v1.1 beta planning.

---

## Session 2 — Real-World Dogfood (2026-05-03 ~ 2026-05-06)

**Project:** `~/brief-dogfood-001/` — Korean investment study group app via Toss mini-app
**Pilot type:** vision-keeper applies BRIEF v1.0 to a non-meta fuzzy idea (BRIEF on BRIEF가 아닌 진짜 외부 케이스)
**Result:** 5 product-killer decisions caught before any code written

### Initial fuzzy idea (1 sentence)
"토스 앱 내 미니앱 플랫폼에서 투자 스터디 모임을 구성할 수 있는 앱"

### BRIEF가 catch한 product-killer 결정 5개

| # | Catch | Phase | Evidence |
|---|------|-------|---------|
| 1 | 토스 종목 게시판 funnel 가설 falsified | DISCOVER R1 | 토스증권 ML 2026-02-13 보도자료 + Apps-in-Toss 정책 (자사 redirect 불가) — funnel 자체가 platform-level 차단 |
| 2 | 토스 미니앱 입점 falsified | DISCOVER R3 | toss.im/apps-in-toss banlist에 "투자 자문, 리딩방, 유료 정보" 명시. 카테고리 기반 차단 — strict posture로 우회 불가 |
| 3 | 자본시장법 §101의2 무료=면책 X | DISCOVER R2 | 2024-08-14 시행 + 카카오톡 운영정책 verbatim ("대가 수령 무관"). 10명 단톡방도 "특정인 발화 1번"=직격 |
| 4 | AI nudge enforcement-aware UX hypothesis (H-07) 도출 | DESIGN | 사용자가 (2) 회색 corridor honest 인정 → product 정체성을 "안전 운영 인프라"로 reframe |
| 5 | H-06 success threshold(100모임) vs BMC BEP(333-714 운영자) 3-7배 gap | DESIGN amend | 2-tier reframe: H-06A validation(100) + H-06B viability(400) + 12개월 runway transfusion 가설 |

### BRIEF mechanic 작동 evidence

| Mechanic | 작동 사례 |
|---------|---------|
| **Push Twice** | "토스 사용자=금융 관심자" 표면 답이 Dream State에서 자체 무너지고 "종목 게시판 모집글" 진짜 image 노출. 그 후 R1 검증으로 후자도 🔴 falsified — Pitfall #14 dogfooding-trap 직접 회피 |
| **Language Precision** | "투자 스터디" → A/B/C/D/E 5분기 force-define → A+C로 좁아짐. "당근 스터디 모임의 투자 버전" anchor 도입 |
| **Reframing as Clarification** | "스터디 모임은 리스크 없을 듯" intuition 검증 → (1)/(2)/(3)/(4) corridor table → 사용자가 (2) honest 선택 = product 정체성 lock |
| **Mutable hypothesis layered** | H-01 funnel + H-04 입점 = falsified after DISCOVER, archived. 새 H-07/H-08/H-09/H-10 추가 (DESIGN amend가 hypothesis 정제하는 정상 흐름) |
| **Cross-workstream consistency** | 4 critical 워크스트림 (BMC/COMP/RISK/TECH) 산출 후 8 axis 정합 board에서 4 tension 자동 surface → amend round 2로 모두 해결 |

### Time investment vs estimated value caught

- **Session time:** ~3 hours (DEFINE 1h + DISCOVER 30m + DESIGN 30m + amend 30m + checkpoints 30m)
- **Avoided cost (estimated):** Toss 미니앱 SDK 학습 + MVP 개발 (4-8주) + 토스 입점 신청 + 거부 받은 후 pivot 시도 — **수주~수개월 인적 손실 + 수천만원 burn 회피**
- **Counter-factual:** intuition대로 진행했다면 "MVP 완성 → 토스 입점 신청 → 거부 → 모집글 작성 → 토스 ML 차단 → 사용자 0 → product 사망" cascade

### Friction observed (BRIEF improvement backlog)

| 항목 | 관찰 | v1.1+ 후보 |
|------|------|----------|
| **DEFINE 5분기 push table 형식** | 비-개발자가 markdown table 읽고 정확한 분기 답 가능 | UAT 추가 검증 필요 (다른 비-개발자에게 같은 push 던져보기) |
| **DESIGN amend round 2가 자연 발생** | 4 워크스트림 cross-check가 4 tension surface — 정상 흐름이지만 사용자가 "왜 한 번 더 amend?" 혼란 가능 | DESIGN phase docs에 "amend round 2 자연 발생 흐름" 명시 |
| **Workstream 산출물 size** | bmc.md / risk.md / compliance.md 각 200-700 lines — 사용자가 한 번에 정독 부담 | amend 후 "1-page executive summary" view 자동 generation 검토 (v1.1) |
| **Korean voice in deep specs** | 4 워크스트림 한국어 voice 자연스러움 — 다만 법률 용어/기술 용어 영문 paraphrase 형식 일관성 부족 | voice-fit lib에 "Korean tech doc style guide" 추가 |
| **Quota usage** | DESIGN 4 parallel agents가 무거움. session 도중 재 dispatch 필요 가능 | DESIGN 워크스트림 mode "lightweight" (3-5K LOC 이하) 추가 검토 |

### Validation of BRIEF v1 mission

> *"A business planner can transform a fuzzy idea into well-researched, audience-correct, compliance-aware deliverables — without already knowing what they want when they start."*

이 dogfood session에서 위 mission이 **명백히 실증됨**:
- "토스 앱에 투자 스터디 모임" (1문장 fuzzy)
- → enforcement-aware infrastructure (5 immutable + 10 mutable hypothesis)
- → 4 critical research artifacts (provenance-tagged)
- → 4 critical design workstreams (BMC + COMP + RISK + TECH-ARCH)
- → 변호사 자문 P1-P3 우선순위
- → external next steps clearly defined (변호사 / MVP / segment 인터뷰)

**HRD-04 progress:** 본 session이 *외부 fuzzy idea + product reshape 실증* 첫 진짜 case. v1.1 beta에서 추가 2명 외부 pilot 시 BRIEF의 generalizability 검증.
