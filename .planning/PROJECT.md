# BRIEF — Business Research, Insight & Execution Framework

## What This Is

BRIEF is a meta-prompting framework for business and product strategy planning, hard-forked from GSD (Get Shit Done). It guides a business planner through four phases — DEFINE (extract true intent), DISCOVER (broad domain research), DESIGN (concrete business plan), DELIVER (high-level product/service policy + stakeholder communication artifacts) — all of which occur BEFORE engineering's PRD work begins. The output of BRIEF can hand off cleanly into a PRD that GSD itself can then execute.

## Core Value

A business planner can transform a fuzzy idea into well-researched, audience-correct, compliance-aware deliverables — without already knowing what they want when they start.

## Current State

**Shipped:** v1.0 — Hard Fork from GSD (2026-05-02)

- 9 phases × 67 plans × 107 tasks delivered
- 55/55 v1 requirements satisfied (per REQUIREMENTS archive)
- v1 Launch Gate 3-prong PASS: (i) 0 blocking pilot findings + (ii) 20/20 smoke matrix + (iii) 12/12 commands + 0/8 skills surface compliance
- A1 zero-runtime-deps invariant intact (`package.json dependencies: {}`)
- 4 canonical evaluator-optimizer gate instances locked (ALIGN/AUDIENCE/gap-detect/COMPLIANCE) with 3-output verdict pattern
- 4-layer audience defense wired end-to-end (filename + Marp footer + Cover-slide watermark + CC-03 pre-commit hook)
- Korea-first compliance reference library (PIPA Feb 2026 amendment + ISMS-P July 2027 mandatory + MyData 2026 10-sector expansion)

**Tech debt accepted (v1.1 backlog):**
- 185 npm test failures from Plan 09-05 deletion-cascade (~10-15h closure per RESIDUAL-FAILS-V1.md)
- 2/3 non-developer beta pilots (vision-keeper as 1/3 per HRD-04 D-D01)
- ~48 orphan workflow files post-deletion-cascade
- 4 INFO findings from Phase 9 code review (deferred per --auto scope)

**Archive references:**
- `.planning/milestones/v1.0-ROADMAP.md` — full v1.0 phase breakdown
- `.planning/milestones/v1.0-REQUIREMENTS.md` — 55-REQ traceability
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md` — audit detail

## Next Milestone Goals (v1.1 — Beta Hardening)

- Close Plan 09-05 deletion-cascade test fallout (target: ≤16 npm test failures empirically)
- Recruit + observe 2/3 external non-developer beta pilots (HRD-04 completion)
- Sweep orphan workflow files (~48 in `brief/workflows/` post Plan 05)
- Polish 4 INFO findings + UX improvements from v1 launch UAT feedback

## Requirements

### Validated

(None yet — ship to validate)

### Active

<!-- Hypotheses for v1. Grouped by capability area. Detailed per-requirement breakdown lives in REQUIREMENTS.md. -->

**Phase 0 — DEFINE (intent extraction)**
- [ ] Conversational intent extractor that uses Push Twice + Language Precision techniques
- [ ] Dream State Mapping (now → 3 months → 12 months) to anchor objectives
- [ ] OBJECTIVES.md as the single anchor document referenced by all downstream phases

**Phase 1 — DISCOVER (broad research)**
- [ ] 6–8 parallel domain researcher agents (market, competitors, customers, regulation, tech, trends, cases)
- [ ] Research outputs auto-tagged with business_model + region context for retrieval
- [ ] Bidirectional flow: Phase 2 can trigger return-to-Phase-1 to fill detected research gaps

**Phase 2 — DESIGN (business plan)**
- [ ] Built-in workstreams: Business Model Canvas, GTM, Financial Model, Operations, Compliance & Legal, Roadmap
- [ ] Dynamic workstream addition (`/brief-add-workstream`) with gsd-new-milestone flow pattern
- [ ] Continuous ALIGN gate: every milestone output is checked against OBJECTIVES.md
- [ ] Audience guard: every artifact carries audience/confidentiality/voice frontmatter; leakage is blocked
- [ ] Compliance checker: industry+region-aware (Korea ISMS-P/PIPA + global SOC 2/GDPR/HIPAA + domain-specific)
- [ ] B2B/B2C context injector: every spawned agent inherits the right business model lens

**Phase 3 — DELIVER (final artifacts)**
- [ ] Type A — Product/service policy artifacts: PRODUCT-BRIEF, SERVICE-POLICY, HIGH-LEVEL-SPEC, FEATURE-MAP (PRD inputs)
- [ ] Type B — Communication artifacts: INTERNAL-DECK, PROPOSAL-DECK, INVESTOR-IR, EXEC-SUMMARY, DECISION-MEMO
- [ ] Audience guard runs on every Type B artifact (confidentiality + voice fit)

**Cross-cutting**
- [ ] All GSD development-specific surfaces (code review, UI, AI eval, TDD, security audit) removed
- [ ] All `gsd-*` identifiers renamed to `brief-*` (commands, agents, prefixes)
- [ ] Reuses GSD core: state lock, multi-agent orchestration, context engine, atomic commits, runtime detection (Claude/Codex/Gemini/OpenCode)
- [ ] CLAUDE.md / README rewritten for the business planning domain

### Out of Scope

- **Code review, test, UI design, AI eval, TDD, security audit, debug agents** — GSD development-specific. Removed entirely; not replaced.
- **`/brief-new-milestone` (full v2 cycle restart)** — explicitly deferred. Single-cycle tool for v1; multi-cycle (v1→v2→v3) is a future need, not now.
- **Codebase mapping of source GSD** — already analyzed in design conversation; no value in formal mapping artifact.
- **Backwards compatibility with GSD commands** — hard fork, no aliases. `backup/original-gsd` branch retained for reference, not for shim.
- **Heavy programmatic verification cycle** — replaced by ALIGN + AUDIENCE + COMPLIANCE gates that produce human-reviewable findings, not automated pass/fail.
- **Plugin form (in addition to fork)** — explored and rejected in design conversation; coupling to GSD upgrade cycle would constrain the business domain too much.

## Context

- **Origin**: Forked from GSD (`get-shit-done-cc`). The user already has GSD installed and has used it for development work; the current directory `/Users/agent/GSD-for-Business` is the fork base.
- **Inspiration absorbed (not depended upon)**: gstack's `office-hours` (forcing questions, push-twice, reframing techniques) and `plan-ceo-review` (Dream State Mapping, Platonic Ideal). Patterns absorbed; no runtime dependency.
- **Inspiration considered and rejected**: `superpowers` plugin — useful 5-phase clarify→design→plan→code→verify discipline, but software-development-centric. Concept absorbed (BRIEF's 5-phase flow), runtime dependency rejected.
- **Target users**: business and product planners; PMs preparing PRD inputs; founders preparing investor and stakeholder material; strategy consultants.
- **Geographic and regulatory scope**: Korea-first with global support. Compliance reference library covers Korea (ISMS-P, PIPA, e-금융업, mydata, 의료기기법) and global (GDPR, CCPA, SOC 2, HIPAA, PCI-DSS).
- **Dogfooding**: this project itself is being built using GSD, so the .planning/ directory will document where GSD breaks for business-domain work — feeding BRIEF's design.

## Constraints

- **Tech stack**: Inherited from GSD. Node.js 22+, CommonJS-only core (`.cjs`), zero external runtime dependencies for the bin layer. TypeScript SDK retained.
- **Architecture**: Must preserve GSD's atomic-commit + STATE.md file lock + agent prompt context engine. No re-architecture of these primitives.
- **Multi-runtime**: Must keep working across Claude Code, OpenAI Codex, Gemini CLI, OpenCode (same as GSD). `INSTRUCTION_FILE` detection and `text_mode` fallback for non-AskUserQuestion runtimes preserved.
- **Backward compatibility**: NONE. Hard fork. The `backup/original-gsd` branch is for reference only — no compatibility shims, aliases, or migration tooling.
- **Naming**: `gsd-*` → `brief-*` is a one-shot global rename. No transitional period.
- **Testing**: `node:test` (not Jest), c8 coverage, cross-platform (Mac/Windows/Linux) — same as GSD.
- **Distribution**: npm package, similar `bin/install.js` pattern. Likely package name `brief-cc` or similar.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hard fork (not plugin) | GSD coupling too tight; business-planning paradigm differs fundamentally from dev cycle. Plugin would constrain BRIEF to GSD's release cadence. | — Pending |
| Name: BRIEF | Sales/strategy deliverables are all "briefs" in the field. Acronym (Business Research, Insight & Execution Framework) reinforces the meaning. | — Pending |
| 5-phase: DEFINE → DISCOVER → DESIGN → DELIVER + continuous ALIGN | Replaces GSD's plan/execute/verify cycle with research-heavy flow. ALIGN runs at every milestone, not once at end. | — Pending |
| Phase 0 (DEFINE) is mandatory and lightweight (~30 min) | Business planners often don't know what they want when starting. Forcing a structured intent extraction up-front prevents drift later. | — Pending |
| OBJECTIVES.md as the anchor document | Every downstream agent reads it. ALIGN gate measures every output against it. Single source of truth for "what we're trying to do". | — Pending |
| Continuous ALIGN at every milestone | Better than once-at-end. Catches drift while cost of correction is small. | — Pending |
| Built-in Compliance & Legal milestone + automatic compliance checker on every milestone | Compliance is too important to leave to user discretion. Two-layer defense (formal milestone + auto-checker on every other output). | — Pending |
| Audience guard: mandatory frontmatter on every artifact | Leakage of internal strategy to external audiences is the #1 deliverable failure mode. Frontmatter forces explicit declaration; checker enforces it. | — Pending |
| B2B/B2C context injection on every spawned agent | Same advice (e.g., GTM strategy) means very different things for B2B vs B2C. Inject business model into every prompt. | — Pending |
| Bidirectional Phase 1 ↔ Phase 2 flow with auto gap detection | Discovery gaps inevitably surface during design. Forcing closure (with user approval) keeps the design well-grounded. | — Pending |
| Dynamic workstream addition (`/brief-add-workstream`) using gsd-new-milestone flow | Pattern is mature in GSD; reuse it. User pattern: "oh, certifications got missed — add a workstream". | — Pending |
| Defer `/brief-new-milestone` (v2 cycle restart) | Single-cycle is enough for v1. Multi-cycle adds complexity without clear demand. | — Pending |
| Reuse GSD core (state lock, multi-agent orchestration, context engine, runtime detection) | Don't reinvent infrastructure. Focus all build effort on the business-domain layer. | — Pending |
| In-place transformation with `backup/original-gsd` safety branch | Avoids code duplication. Backup branch gives one-command rollback. | — Pending |
| Build BRIEF using GSD itself (dogfooding) | Live experience reveals exactly where GSD breaks for business work — those breakage points become BRIEF's differentiation list. | — Pending |
| Korea-first + global compliance reference library | User is in Korea; Korea SaaS/fintech/healthcare reference library is high-leverage. Global packs added for export. | — Pending |
| Hard rename `gsd-*` → `brief-*` (no aliases) | Aliases create dual-vocabulary confusion. Clean break is better. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

## Current State

- Phase 1 (Foundation — Fork Hygiene, Removal, Rename) — **Complete**
- Phase 2 (Stable Seam — Anchor Schema, Caps, Workstream-as-Config) — **Complete**
- Phase 3 (DEFINE Canary — Phase 0 End-to-End) — **Complete**
- Phase 4 (First Gate — ALIGN Pattern Established) — **Complete** (2026-04-21; DSG-12 delivered; canonical evaluator-optimizer pattern locked for Phase 5/7 replication)
- Phase 5 (DISCOVER — Parallel Research with Provenance + AUDIENCE + Context Injection) — **Complete** (2026-04-24; DSC-01..07 + DSG-13 + CC-02 + CC-04 delivered; AUDIENCE gate stack replicated from ALIGN canonical pattern; Korea compliance primers PIPA/ISMS-P/MyData shipped; provenance pre-commit hook live; 152/152 Phase 5 tests pass)
- Phase 6 (Bidirectional Foundation — Phase 1↔2 Return Stack) — **Complete** (2026-04-24; DSG-11 + DSG-14 delivered; state.brief.return_stack LIFO + return_stack_history append-only; brief-gap-detector agent with BLOCKING/MATERIAL/NICE-TO-HAVE severity routing; meta-arbiter at iter 2 + hard-cap at iter 3 no-bypass; /brief-status convergence telemetry derived from history; /brief-discover Step 0.5 resume auto-detect; paired-sibling {artifact}.gaps.md; 145/145 Phase 6 tests pass; Pitfall #7 structurally mitigated BEFORE Phase 7 designers)
- Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) — **Complete** (2026-04-26; DSG-01..10 + CC-01 delivered; 8/8 plans across 5 waves; canonical gate fourth instance — COMPLIANCE — with LOAD-BEARING DEVIATION on FINDINGS-MATERIAL preserved per CC-01; 9 built-in workstreams shipped (BMC/GTM/FINANCIAL with 12-question driver Q&A/OPERATIONS/COMPLIANCE/ROADMAP/BRAND/RISK 5-category register/TECH-ARCH high-level boundary); /brief-design + /brief-add-workstream NET +2 commands; Korea PIPA CEO-liability + 10% turnover disclaimer byte-identity locked between primer + renderer; sequential 3-gate threading ALIGN→AUDIENCE→COMPLIANCE in design.md; OBJECTIVES amendment via /brief-define --amend directive (no DESIGN→DEFINE return-stack); soft-recommended ordering D-07; brief-workstream-designer parameterized agent; 225/225 Phase 7 tests pass; 4/4 code-review warnings fixed)
- Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement + Marp) — **Complete** (2026-04-26; DLV-01..09 + CC-03 delivered; 8/8 plans across 4 waves; 15/15 must-haves verified; 118/118 Phase 8 tests pass; 4-layer audience defense (filename audience encoding + Marp directive footer + literal first-slide watermark + CC-03 pre-commit hook) wired end-to-end; Type A 4 artifacts auto-synthesized from 9 workstreams + OBJECTIVES; Type B parameterized agent generates 4 deck/document templates with 3 Marp CSS themes; Marp via npx --yes @marp-team/marp-cli@4.3.1 preserving A1 zero-runtime-deps; /brief-deliver + /brief-export NET +2 commands; force-accept routes through Phase 4 D-07 audit trail substrate (first live use of override); Korean honorific guard + ko/en branching + banned-words/concreteness self-check inlined in Type B agent; cross-artifact leakage diff TF-IDF check (Pitfall #5 Phase 5→8 deferred resolved); 7 code-review findings fixed (2 BLOCKER frontmatter parser + 5 WARNING) — 8 templates restructured to nested YAML + watermark substitution wired in deliver/export workflows)
- Phase 9 (Hardening — Cross-Runtime Smoke + Non-Developer Pilot) — **Complete** (2026-05-01; HRD-01..05 delivered; 7/7 plans across 5 waves; 5/5 ROADMAP success criteria verified; v1 Launch Gate 3-prong PASS — (i) 0 blocker pilot findings + (ii) 20/20 smoke matrix PASS post-CR-01 fix + (iii) 12/12 commands + 0/8 skills surface compliance; HRD-04 partial 1/3 vision-keeper acceptance + 2/3 deferred to v1.1 beta per D-D01/D-D04; HRD-05 (a)+(b) closed (10 missing-file assertions DELETED + ARCHITECTURE.md count sync 12/69/26) + (c)+(d) deferred to v1.1 beta per D-D02; 56-cmd surface pruning (55 D + 1 R + bin/install.js cleanup) atomic; brief/bin/lib/{help,smoke-test}.cjs zero-deps libs with inline ~30-LOC Levenshtein + 4D phase categorization + INSTRUCTION_FILE env mock; .planning/{SURFACE-AUDIT,SMOKE-TEST,V1-LAUNCH-GATE,RESIDUAL-FAILS-V1,HRD-05-CLOSURE-RATIONALE,pilot/01-*-friction-journal}.md shipped; 10/10 code-review findings fixed (3 BLOCKER + 7 WARNING) + 4 INFO deferred to v1.1; A1 invariant intact 0 npm runtime deps; 4 human UAT items deferred per user acceptance — milestone lifecycle next)
- Status: v1.0 milestone — all phases complete, pending milestone audit + complete + cleanup

---
*Last updated: 2026-05-01 after Phase 9 completion*
