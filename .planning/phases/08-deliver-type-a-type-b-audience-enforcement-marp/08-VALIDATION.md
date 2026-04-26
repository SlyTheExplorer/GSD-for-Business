---
phase: 8
slug: deliver-type-a-type-b-audience-enforcement-marp
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in) + c8 11.0.0 (coverage) |
| **Config file** | none — invoked via `node scripts/run-tests.cjs` |
| **Quick run command** | `node scripts/run-tests.cjs tests/brief-deliver-*.test.cjs tests/brief-export-*.test.cjs` |
| **Full suite command** | `node scripts/run-tests.cjs` (all tests/ + c8 70% line threshold) |
| **Estimated runtime** | quick ~30s; full ~3-5min (Phase 7 baseline 225 tests) |

---

## Sampling Rate

- **After every task commit:** Run `node scripts/run-tests.cjs tests/brief-{deliver,export,voice-fit,leakage-diff}-*.test.cjs` (≤30s)
- **After every plan wave:** Run `node scripts/run-tests.cjs` (full suite + c8 coverage check)
- **Before `/brief-verify-work`:** Full suite must be green; c8 ≥ 70% line for new lib files
- **Max feedback latency:** 30s for incremental, 5min for full

---

## Per-Task Verification Map

> Populated by planner during plan generation (one row per atomic task across 8 plans).

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| {N}-01-01 | 01 | 1 | REQ-{XX} | T-{N}-01 / — | {expected secure behavior or "N/A"} | unit | `{command}` | ✅ / ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

> Test infrastructure stubs that MUST exist before any execution wave begins. Planner enumerates per RESEARCH.md §Wave 0.

- [ ] `tests/brief-deliver-type-a.test.cjs` — Type A 자동 합성 fixture (PRODUCT-BRIEF + SERVICE-POLICY[B2B/B2C] + HIGH-LEVEL-SPEC + FEATURE-MAP)
- [ ] `tests/brief-export-confirm.test.cjs` — 1단계 confirm + AUDIENCE/COMPLIANCE 재실행 + force-accept audit trail
- [ ] `tests/brief-export-leakage-diff.test.cjs` — TF-IDF cross-artifact 키워드 diff (intentional-leak fixture vs incidental-overlap fixture)
- [ ] `tests/brief-voice-fit-banned-words.test.cjs` — banned-words density (16 영어 + 8 한국어 seed) + 1회 regenerate dispatch
- [ ] `tests/brief-validate-frontmatter-hook.test.cjs` — CC-03 hook 결측 frontmatter 차단 + opt-in `hooks.community: true` gate + path-pattern filter
- [ ] `tests/brief-export-filename-watermark.test.cjs` — 파일명 audience encoding `{name}.{confidentiality}.{ext}` + Marp directive footer + literal first-slide content (ko/en)
- [ ] `tests/brief-deliver-canary-e2e.test.cjs` — Korea-first B2C fintech canary E2E (`/brief-deliver --type-a` + `/brief-deliver --type-b internal-deck` + `/brief-deliver --type-b proposal-deck` + `/brief-export` 1단계 + leakage diff trigger 검증)

*Wave 0 fixtures total: 7 test files (per RESEARCH.md §Wave 0 enumeration; Marp invocation is mocked inside `tests/brief-export-confirm.test.cjs` Plan 04 — no separate Marp smoke fixture). Planner refines exact path/content per task.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Marp PPTX 렌더링 시각 검증 | DLV-09 | Marp render 출력의 시각적 정확성 (워터마크 위치, 슬라이드 배치, 텍스트 가독성)은 PPTX 파일 열어서 확인 — 자동 검증은 파일 존재 + 슬라이드 수만 가능 | `/brief-export internal-deck` → 생성된 `internal-deck.confidential.pptx`를 PowerPoint/Keynote/LibreOffice Impress에서 열기 → Cover 슬라이드 워터마크 텍스트 + footer 워터마크 확인 |
| `/brief-export` 1단계 confirm 사용자 인지성 | DLV-08 | confirm 화면이 audience+confidentiality를 즉각 인지 가능한 형태인지 (Pitfall #9 비개발자 마찰)는 사용자 시점 검증 필요 | `/brief-export proposal-deck` 실행 → confirm 화면 캡처 → 비개발자 사용자 (또는 product owner)가 5초 안에 audience/confidentiality 식별 가능한지 검증 |
| 한국어 honorific 자가 가드 효과 (Pitfall #11) | D-D04 | Type B agent prompt 인라인 가이드의 실제 효과는 한국 투자자/임원의 시점에서 격식체 자연스러움으로 평가 — Phase 9 HRD-04 pilot 시 본격 검증 | Korea-first canary B2C fintech fixture로 `/brief-deliver --type-b proposal-deck` 실행 → 한국어 산출물에 반말/구어체 (`-야`, `-지`, `-라구요`) 등장 검사 (수동) + 격식체 일관성 확인 |
| Marp 환경 (Chrome/Edge/LibreOffice) presence detection 정확성 | DLV-05/DLV-06 | `npx` 첫 invocation 지연 (~30-60s) + Chrome/Edge 미설치 시 fallback 메시지 명확성은 사용자 환경에 의존 | `/brief-export internal-deck`을 Chrome/Edge 미설치 환경에서 실행 → fallback 메시지 명확성 + `--browser auto` Firefox fallback 동작 확인 (Marp 4.x 신규) |
| Cross-artifact leakage diff 사용자-인지 가능 finding 본문 (Pitfall #5) | C-D02 | TF-IDF 매치 결과를 사용자가 "이게 누설인가?" 즉각 판단 가능한 prose로 emit — 한국어 finding 본문의 자연스러움은 수동 검증 | canary 시 의도된 leak fixture로 `/brief-export proposal-deck` 실행 → finding 메시지에 매치된 키워드 + 매치 횟수 + recovery 가이드가 한국어로 명확히 표시되는지 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (7 test fixtures listed above)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s for quick / 5min for full
- [ ] c8 line coverage ≥ 70% for new lib files (`deliver.cjs`, `export.cjs`, `voice-fit.cjs`, `leakage-diff.cjs`)
- [ ] vocabulary-lock test passes (Phase 4 D-09 / Phase 5 D-09 / Phase 7 D-01 patterns preserved — `compliant`/`passed`/녹색 체크마크 ban 유지)
- [ ] Korea-first canary E2E passes (`tests/brief-deliver-canary-e2e.test.cjs`)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
