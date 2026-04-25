---
phase: 07
slug: design-workstream-orchestration-compliance-checker
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Phenomena measured: 3-gate threading correctness; 9 workstream loadability; vocabulary lock; surface-cap discipline; Korean compliance disclaimer fidelity; FINANCIAL provenance enforcement.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in) — Phase 2 D-09 inheritance |
| **Config file** | none (uses package.json scripts.test) |
| **Quick run command** | `node --test tests/brief-compliance-*.test.cjs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~25–40 seconds (full suite); ~3–5 seconds (per-test-file quick) |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/brief-{subsystem}-*.test.cjs` for the subsystem touched
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/brief-verify-work`:** Full suite must be green AND `c8` line coverage ≥ 70% (Phase 2 inherited threshold)
- **Max feedback latency:** 60 seconds (single test file < 10s; full suite < 60s)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | CC-01 | T-07-01 | COMPLIANCE checker emits findings vocabulary, never "compliant"/"passed"/"✅" | unit | `node --test tests/brief-compliance-vocabulary-lock.test.cjs` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | CC-01 | T-07-02 | 3-output verdict enum locked: COMPLIANCE-OK/FINDINGS-MATERIAL/FINDINGS-BLOCKING | unit | `node --test tests/brief-compliance-verdict.test.cjs` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | CC-01 | T-07-03 | paired-sibling `{artifact}.compliance.md` resolver matches Phase 5 D-11 pattern | unit | `node --test tests/brief-compliance-sibling-path.test.cjs` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 2 | CC-01 | T-07-04 | CEO liability disclaimer footer present + Korean for region:kr | unit | `node --test tests/brief-compliance-disclaimer.test.cjs` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 2 | DSG-05 | T-07-05 | Korea pack auto-load when state.brief.compliance_packs contains PIPA/ISMS-P/MyData | unit | `node --test tests/brief-compliance-pack-load.test.cjs` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 2 | DSG-10 | T-07-06 | /brief-design <workstream> single-workstream-per-session contract | unit | `node --test tests/brief-design-orchestration.test.cjs` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 2 | CC-01 | T-07-07 | Sequential 3-gate threading: ALIGN→AUDIENCE→COMPLIANCE; fail-fast on BLOCKING | unit | `node --test tests/brief-design-gate-order.test.cjs` | ❌ W0 | ⬜ pending |
| 07-03-03 | 03 | 2 | DSG-10 | T-07-08 | OBJECTIVES insufficiency emits /brief-define --amend directive (no return-stack push) | unit | `node --test tests/brief-design-objectives-amendment.test.cjs` | ❌ W0 | ⬜ pending |
| 07-03-04 | 03 | 2 | DSG-10 | T-07-09 | Workstream completion handoff = result + recommended next + AskUserQuestion confirm | unit | `node --test tests/brief-design-handoff.test.cjs` | ❌ W0 | ⬜ pending |
| 07-04-01 | 04 | 3 | DSG-10 | T-07-10 | /brief-add-workstream 4-6 Q&A → 3-file skeleton atomic write | unit | `node --test tests/brief-add-workstream-skeleton.test.cjs` | ❌ W0 | ⬜ pending |
| 07-04-02 | 04 | 3 | DSG-10 | T-07-11 | name collision BLOCK; role-overlap fork/new prompt | unit | `node --test tests/brief-add-workstream-collision.test.cjs` | ❌ W0 | ⬜ pending |
| 07-04-03 | 04 | 3 | DSG-10 | T-07-12 | gates_required default `[align, audience, compliance]` for added workstreams | unit | `node --test tests/brief-add-workstream-gates.test.cjs` | ❌ W0 | ⬜ pending |
| 07-05-01 | 05 | 3 | DSG-01 | T-07-13 | BMC workstream produces 9-block canonical artifact (Strategyzer) | unit | `node --test tests/brief-workstream-bmc.test.cjs` | ❌ W0 | ⬜ pending |
| 07-05-02 | 05 | 3 | DSG-02 | T-07-14 | GTM workstream produces B2B and B2C variant content paths | unit | `node --test tests/brief-workstream-gtm.test.cjs` | ❌ W0 | ⬜ pending |
| 07-05-03 | 05 | 3 | DSG-04 | T-07-15 | OPERATIONS workstream artifact (team/process/tools) | unit | `node --test tests/brief-workstream-operations.test.cjs` | ❌ W0 | ⬜ pending |
| 07-05-04 | 05 | 3 | DSG-06 | T-07-16 | ROADMAP workstream produces phased business-roadmap distinct from BRIEF tool roadmap | unit | `node --test tests/brief-workstream-roadmap.test.cjs` | ❌ W0 | ⬜ pending |
| 07-05-05 | 05 | 3 | DSG-07 | T-07-17 | BRAND workstream produces Voice/Tone/Messaging/Positioning artifact | unit | `node --test tests/brief-workstream-brand.test.cjs` | ❌ W0 | ⬜ pending |
| 07-05-06 | 05 | 3 | DSG-08 | T-07-18 | RISK workstream produces 5-category Risk Register | unit | `node --test tests/brief-workstream-risk.test.cjs` | ❌ W0 | ⬜ pending |
| 07-05-07 | 05 | 3 | DSG-09 | T-07-19 | TECH-ARCH workstream high-level (NOT detailed) component map | unit | `node --test tests/brief-workstream-tech-arch.test.cjs` | ❌ W0 | ⬜ pending |
| 07-05-08 | 05 | 3 | DSG-05 | T-07-20 | COMPLIANCE workstream artifact uses findings vocabulary + region-aware pack loading | unit | `node --test tests/brief-workstream-compliance.test.cjs` | ❌ W0 | ⬜ pending |
| 07-06-01 | 06 | 3 | DSG-03 | T-07-21 | FINANCIAL workstream 12-question driver Q&A covers all 5 categories | unit | `node --test tests/brief-financial-driver-questions.test.cjs` | ❌ W0 | ⬜ pending |
| 07-06-02 | 06 | 3 | DSG-03 | T-07-22 | FINANCIAL projection cells carry [VERIFIED:user-supplied] or [ASSUMED:multiplier-X] | unit | `node --test tests/brief-financial-provenance.test.cjs` | ❌ W0 | ⬜ pending |
| 07-06-03 | 06 | 3 | DSG-03 | T-07-23 | FINANCIAL sensitivity bands (bear/base/bull = ×0.7/×1.0/×1.3) | unit | `node --test tests/brief-financial-sensitivity.test.cjs` | ❌ W0 | ⬜ pending |
| 07-07-01 | 07 | 4 | FND-08 | T-07-24 | workstream-loader.cjs additively validates gates_required + depends_on | unit | `node --test tests/brief-workstream-loader-extended.test.cjs` | ❌ W0 | ⬜ pending |
| 07-07-02 | 07 | 4 | FND-09 | T-07-25 | Surface cap audit: net +2 commands; no /brief-recompliance/-realign-workstream | unit | `node --test tests/brief-surface-cap-phase-7.test.cjs` | ❌ W0 | ⬜ pending |
| 07-07-03 | 07 | 4 | CC-01 | T-07-26 | Anti-pattern #2: COMPLIANCE invoked as orchestrator step (NOT hook) | structural | `grep -L "PostToolUse.*compliance\|SubagentStop.*compliance" hooks/*.js` | ❌ W0 | ⬜ pending |
| 07-08-01 | 08 | 5 | DSG-01..10+CC-01 | T-07-27 | Canary E2E: /brief-design BMC on Korea-first B2C fintech fixture produces 4 paired-sibling files | integration | `node --test tests/brief-design-canary-e2e.test.cjs` | ❌ W0 | ⬜ pending |
| 07-08-02 | 08 | 5 | FND-06 | T-07-28 | text_mode parity: /brief-design + /brief-add-workstream Q&A + FINANCIAL drivers in numbered-list mode | integration | `node --test tests/brief-design-text-mode.test.cjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/brief-compliance-vocabulary-lock.test.cjs` — vocabulary ban-list grep audit (must include "compliant", "passed", "✅", "compliance verified")
- [ ] `tests/brief-compliance-verdict.test.cjs` — 3-output verdict enum string-equality lock
- [ ] `tests/brief-compliance-sibling-path.test.cjs` — paired-sibling path resolver
- [ ] `tests/brief-compliance-disclaimer.test.cjs` — CEO liability disclaimer Korean/English regex
- [ ] `tests/brief-compliance-pack-load.test.cjs` — Korea pack auto-load via state.brief.compliance_packs
- [ ] `tests/brief-design-orchestration.test.cjs` — single-workstream-per-session contract
- [ ] `tests/brief-design-gate-order.test.cjs` — sequential 3-gate threading + fail-fast
- [ ] `tests/brief-design-objectives-amendment.test.cjs` — /brief-define --amend directive
- [ ] `tests/brief-design-handoff.test.cjs` — handoff result + recommend next + AskUserQuestion
- [ ] `tests/brief-add-workstream-skeleton.test.cjs` — 3-file atomic skeleton write
- [ ] `tests/brief-add-workstream-collision.test.cjs` — name BLOCK + role overlap fork/new
- [ ] `tests/brief-add-workstream-gates.test.cjs` — gates_required default
- [ ] `tests/brief-workstream-bmc.test.cjs` — BMC 9-block canonical artifact
- [ ] `tests/brief-workstream-gtm.test.cjs` — GTM B2B/B2C variant paths (run twice with different state.brief.business_model)
- [ ] `tests/brief-workstream-operations.test.cjs` — OPERATIONS team/process/tools
- [ ] `tests/brief-workstream-roadmap.test.cjs` — ROADMAP business-roadmap (distinct from BRIEF tool roadmap)
- [ ] `tests/brief-workstream-brand.test.cjs` — BRAND Voice/Tone/Messaging/Positioning
- [ ] `tests/brief-workstream-risk.test.cjs` — RISK 5-category register
- [ ] `tests/brief-workstream-tech-arch.test.cjs` — TECH-ARCH high-level boundary
- [ ] `tests/brief-workstream-compliance.test.cjs` — COMPLIANCE workstream artifact (distinct from COMPLIANCE checker)
- [ ] `tests/brief-financial-driver-questions.test.cjs` — 12 questions × 5 categories
- [ ] `tests/brief-financial-provenance.test.cjs` — projection cell provenance regex
- [ ] `tests/brief-financial-sensitivity.test.cjs` — bear/base/bull bands
- [ ] `tests/brief-workstream-loader-extended.test.cjs` — additive validation of gates_required + depends_on
- [ ] `tests/brief-surface-cap-phase-7.test.cjs` — net +2 commands; no on-demand re-gate commands
- [ ] `tests/brief-design-canary-e2e.test.cjs` — Korea-first B2C fintech canary
- [ ] `tests/brief-design-text-mode.test.cjs` — text_mode multi-runtime parity
- [ ] `tests/fixtures/objectives-korea-b2c-fintech.md` — canary fixture
- [ ] `tests/fixtures/objectives-b2b-enterprise-saas.md` — B2B variant fixture

*Note: brief-tools.cjs case 'compliance' dispatcher must be present before any test file using `compliance run` invocation can pass — Wave 1 ships this with the lib.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| LLM-driven 3-gate verdict semantics on a real artifact | CC-01 | LLM output non-deterministic; assertion would over-constrain prose | Run /brief-design BMC end-to-end on a fresh fixture; manually inspect canvas.compliance.md for clause-level findings vs theater language |
| Korean disclaimer prose readability for non-developer planner | DSG-05 | Korean cultural fluency check; native-speaker review | Native-speaker reviews disclaimer + 3 sample compliance.md files; report any awkward phrasings |
| FINANCIAL projection narrative quality (bear/base/bull readability) | DSG-03 | Subjective UX of the projection table for a non-CFO reader | Generate FINANCIAL artifact for fixture; confirm sensitivity bands are interpretable without finance background |
| 9 workstream artifact prose quality vs Strategyzer/Sequoia/Cagan canonical | DSG-01..09 | Subjective alignment with industry conventions | Domain expert (BMC for Strategyzer alignment, Sequoia-style GTM for VC alignment, Cagan-style TECH-ARCH for SVPG alignment) spot-reviews 1 artifact per workstream |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter (after Wave 0 lands)

**Approval:** pending
