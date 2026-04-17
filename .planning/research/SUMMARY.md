# BRIEF — Research Synthesis

**Synthesized:** 2026-04-18
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md (all in `.planning/research/`)

## Executive Summary

BRIEF is a thin business-domain layer on top of GSD's already-mature meta-prompting infrastructure. **The four research streams converge on the same answer: differentiation lives in prompts, templates, gates, and reference libraries — not in new infrastructure.** Inherited GSD primitives (Node 22 + CommonJS bin layer, STATE.md file lock, atomic commits, multi-agent orchestration, multi-runtime detection across Claude/Codex/Gemini/OpenCode, the `.planning/` data contract) are constraints, not choices. Build effort is concentrated in the overlay: an OBJECTIVES.md anchor, three cross-cutting evaluator-optimizer gates (ALIGN / AUDIENCE / COMPLIANCE), parallel domain researcher agents, audience-aware artifact generation with mandatory frontmatter, a Korea-first compliance reference library, and a bidirectional Phase 1↔Phase 2 return-stack.

The structural opening is real and verifiable: across 24 surveyed business-planning tools (Strategyzer, Upmetrics, LivePlan, Notion AI, Pitch/Gamma, Vanta/Drata, Lattice, Productboard, Aha, etc.), **none combines structured intent extraction, parallel multi-domain discovery, audience-aware artifact generation with confidentiality guards, Korea-first compliance, and bidirectional research↔design flow.** The closest analog to Phase 0 intent-extraction is consulting practice (Strategyn JTBD, Amazon PR/FAQ), not software.

**Dominant risks are NOT technical** — they are framework-adoption risks. PITFALLS is unambiguous: skill/command bloat, OBJECTIVES.md drift, compliance checkbox theater (now a CEO-liability issue under the Feb 2026 PIPA amendment carrying fines up to 10% of total revenue, ISMS-P mandatory by July 2027), audience leakage, hallucinated market data, and infinite Phase 1↔2 loops are the failure modes that kill BRIEF, not Node version mismatches. Mitigations are designable into v1: hard caps on commands (≤12) and skills (≤8), three-output ALIGN gates with explicit drift handling, "findings not checks" compliance vocabulary with mandatory disclaimers, filename + watermark + export-step audience encoding, source-mandatory provenance tagging on all quantitative claims, and a hard 3-iteration cap on bidirectional flow.

## Cross-Cutting Themes

(Architectural commitments — themes appearing in 3+ research files.)

| Theme | STACK | FEATURES | ARCHITECTURE | PITFALLS |
|-------|:-:|:-:|:-:|:-:|
| Zero external runtime dependencies | Y (verify A1) | — | Y | Y (#2 cross-runtime) |
| Hard fork, no aliases, no shim | Y | Y (anti) | Y | Y (#8 fork drift) |
| Multi-runtime (Claude/Codex/Gemini/OpenCode) | Y | Y | Y | Y (#2) |
| OBJECTIVES.md as single anchor | — | Y (P1) | Y (Pattern 3) | Y (#3 drift) |
| Findings, not pass/fail (gates emit findings) | — | Y | Y (Pattern 2) | Y (#3, #4, UX) |
| Audience-aware frontmatter | Y (gray-matter or inline) | Y (P1) | Y (two-layer enforcer) | Y (#5 leakage) |
| Korea-first compliance reference library | Y | Y | Y | Y (#4 PIPA, #11 cultural) |
| Provenance tagging on quantitative claims | — | — | Y (implied) | Y (#6 hallucination) |
| Hard caps (commands/skills/iterations) | — | — | Y (implied) | Y (#1, #7, #12) |
| Workstream-as-yaml (config not code) | — | Y (implied) | Y (Pattern 7) | Y (#13 lock-in) |
| Two-track dogfooding | — | — | Y (.planning/ exists) | Y (#14) |

**No contradictions found across research files.** Coherence is unusually high because the four streams share the same constraints (PROJECT.md decisions) and converge on the same root finding.

## Korea-Specific Findings

(High-leverage timing — separate sub-section called out per orchestrator request.)

All findings cite primary government / law-firm sources verified across STACK, FEATURES, and PITFALLS:

- **Feb 2026 PIPA amendment** — penalties up to **10% of total revenue**; CEO personally liable; CPO-independence requirement; probabilistic incident-notification trigger
- **ISMS-P certification mandatory** for certain data controllers from **July 1, 2027** (80 InfoSec + 22 PII controls)
- **MyData expanded in 2026** to energy, education, employment, culture, leisure
- **PIPA explicitly forbids single-checkbox-covers-all consent** — a green-checkbox compliance report from BRIEF would model exactly the failure pattern the regulator banned
- **Korean BMC tooling absence verified** — no dominant Korean SaaS or open-source tool surfaced in either English or Korean web search; leverage is entirely in BRIEF's compliance reference library and Korean-language artifact templates
- **Korean pitch deck culture** — team slide at 3-4 (not 8-10 Western); 회장님 addressed first; bilingual decks expected; 하십시오체 default for external; idiomatic translation required (literal "10배 성장" reads as AI vs idiomatic "비약적 성장")
- **K-Startup 정부지원사업 2026** — KRW 3.46T budget; restructured into Deep Tech / General / Investment-Linked tracks; new "Policy Fund Navigator" digital application Jan 5, 2026 (P2 priority Type A variant)

**Implication:** Korea-first positioning is high-leverage timing. The roadmap MUST address PIPA 2026 awareness in Phase 6 (DESIGN COMPLIANCE), and Korean cultural artifacts in Phase 7 (DELIVER).

## High-Risk Assumptions That Need Early Verification

These two assumptions change the architecture if wrong — flag for Phase 1 (Foundation):

- **STACK Assumption A1:** GSD's bin layer ships with empty `dependencies` (only `devDependencies`). Inspect `package.json` directly. **If wrong:** BRIEF can freely add `gray-matter`/`ajv` as runtime deps; if right, inline implementations are mandatory to preserve cross-runtime portability.
- **ARCHITECTURE Assumption A4:** Inherited `state.cjs` preserves unknown namespaced fields (`state.brief.*`) on round-trip read/write. Write a smoke test in Phase 1. **If wrong:** the architecture needs a sidecar `state-brief.json` instead of namespaced extension; this changes the entire state-management strategy and propagates into Phase 5 (bidirectional foundation).

Lower-risk assumptions worth noting: STACK A4 (`npx --yes` works in all four runtime sandboxes — verify in Phase 7), STACK A5 (Korean regulatory dates accurate as of 2026-04-17 — needs ongoing refresh discipline), ARCHITECTURE A3 (SubagentStop hook cannot spawn subagents — official docs imply but don't state explicitly).

## Suggested Phase Structure (8 phases)

| # | Phase | Rationale |
|---|-------|-----------|
| 1 | Foundation — Fork hygiene + stable seam | Layered seam decision before hard rename; verify A1 + A4; CLAUDE.md caps before any command written; OBJECTIVES.md schema with mutability layers |
| 2 | Phase 0 (DEFINE) end-to-end (canary) | OBJECTIVES.md is the linchpin every other agent reads; prove orchestrator-workers + context-injection on small surface first |
| 3 | First cross-cutting gate — ALIGN | Three-output design (ALIGNED / DRIFTED-objective / DRIFTED-output) must be in v1; sets findings-not-checks vocabulary for AUDIENCE/COMPLIANCE later |
| 4 | Phase 1 (DISCOVER) — parallel researchers + AUDIENCE guard | Source-mandatory mode; provenance tagging; Korea reference library skeleton; B2B/B2C context injection; cap parallel spawns at 3-4 per Anthropic best practice |
| 5 | Phase 1↔Phase 2 bidirectional foundation | Build BEFORE Phase 2 designers so designers are aware from day one; hard 3-round-trip cap mandatory; gap criticality classification; meta-arbiter at iteration 2 |
| 6 | Phase 2 (DESIGN) — workstream designers + COMPLIANCE checker | Workstream-as-yaml (NOT bespoke code); compliance checker outputs clause-level findings (NOT keyword-matching); mandatory legal-counsel disclaimer; driver-based bottom-up financial modeling |
| 7 | Phase 3 (DELIVER) — Type A + Type B + Marp + export step | AUDIENCE guard truly blocking; filename audience encoding; literal watermark; `/brief-export` mandatory; banned-words + concreteness in Type B agents; bilingual `.ko.md`/`.en.md` for Korean projects; Marp via `npx --yes` |
| 8 | Hardening + pre-launch pilot | Cross-runtime smoke tests in Codex + Gemini; external pilot with 3 non-developer planners; surface count audit; verb aliases; rich `/brief-help`; CLAUDE.md/README.md rewritten for business-user persona |

**Ordering rationale:** Foundation is non-negotiable first (locks in #8 fork-drift and #13 framework lock-in mitigations). DEFINE before all other runtime phases (OBJECTIVES.md is the linchpin). First gate before second runtime phase (gate pattern set once, replicated). Bidirectional foundation before designers (designers must be written aware). Compliance checker proper implementation in Phase 6 (needs reference library from Phase 4). Marp in Phase 7 (no other phase produces decks). Hardening last (Pitfall #9, #12, #14 require feature-complete system).

## Research Flags

**Phases needing deeper research during planning:**

- **Phase 1:** Verify A1 + A4 (HIGH-RISK assumptions; allocate explicit research time)
- **Phase 5:** Bidirectional return-stack pattern is novel for AI agent orchestration; ARCHITECTURE confidence is MEDIUM; max stack depth (3) is empirical
- **Phase 6:** Compliance reference library content (clause-level ISMS-P / PIPA / e-금융업 / mydata / 의료기기법) needs deeper Korean legal research; consider engaging legal counsel for review
- **Phase 7:** Verify A4 from STACK (npx works in all runtimes); LibreOffice Impress dependency for editable PPTX needs runtime guidance

**Phases with standard patterns (skip research):**

- **Phase 2 + 3:** Orchestrator-workers and evaluator-optimizer well-documented by Anthropic; gstack techniques well-documented
- **Phase 4:** Same orchestrator-workers pattern as Phase 2; reuses GSD's existing researcher pattern
- **Phase 8:** Pre-commit hooks, status/help commands are standard CLI patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Inherited core verified from package.json/config; npm versions verified live; Marp HIGH; patterns-not-deps HIGH; Korean tooling absence LOW (verified absent vs present) |
| Features | HIGH | 24 products surveyed in 8 categories; convergent feature sets; differentiator analysis = negative finding (no tool combines >2 of BRIEF's differentiators); Korea PIPA 2026 verified |
| Architecture | HIGH for boundaries; MEDIUM for bidirectional state-machine specifics | No prior art for return-stack in AI agent orchestration; A4 is HIGH-RISK |
| Pitfalls | HIGH for framework adoption risks; MEDIUM-HIGH for Korea-specific; HIGH for business deliverable failure modes | Multi-source agreement on Korea PIPA, AI hallucination rates, fork drift |

**Overall confidence:** HIGH. Two HIGH-RISK assumptions (A1 STACK, A4 ARCHITECTURE) need explicit verification in Phase 1 foundation. No contradictions found across research files.

## Highest-Leverage Findings

The 3-5 things that should anchor roadmap creation:

1. **The fork is an overlay, not a rewrite.** Build effort goes into prompts, templates, gates, reference libraries — NOT new infrastructure. Inherited GSD primitives are constraints. This single insight reduces the surface area of the roadmap by ~70%.

2. **Three cross-cutting gates (ALIGN / AUDIENCE / COMPLIANCE) are the differentiator surface.** They emit findings not pass/fail, attach via orchestrator commands not hooks, and run on every milestone. Get the gate pattern right in Phase 3 (ALIGN first); replicate for AUDIENCE (Phase 4) and COMPLIANCE (Phase 6).

3. **Korea-first compliance reference library is high-leverage 2026 timing.** Feb 2026 PIPA amendment + July 2027 ISMS-P deadline + CEO personal liability + 10%-of-revenue penalties create real urgency. No global competitor (Vanta/Drata) has clause-level Korean coverage.

4. **Bidirectional Phase 1↔2 return-stack is the highest-architectural-risk feature.** Build the foundation BEFORE Phase 2 designers (Phase 5 before Phase 6), or pay massive retrofit cost. Hard 3-round-trip cap is mandatory v1 feature, not a polish item.

5. **Workstream-as-yaml architectural commitment must be made up-front.** Built-in workstreams ship as yaml exemplars, not bespoke code. Generic researcher + generic designer parameterized by `workstream-spec.yaml`. Decision must be in Phase 1 foundation; making it later locks in Pitfall #13 (framework lock-in).

## Highest-Risk Pitfalls the Roadmap MUST Address

These are not optional polish — they kill BRIEF if missed:

1. **Compliance Checkbox Theater (#4)** — CEO liability under 2026 PIPA. Phase 6 MUST output findings with regulation clause + required evidence + found-in-artifact + gap. Mandatory legal-counsel disclaimer. NO green checkmarks. Filename suffix `.checker-finding.md`.

2. **OBJECTIVES.md Anchor Drift (#3)** — Phase 1 foundation MUST design schema with mutability layers (immutable intent vs mutable hypotheses). Phase 3 ALIGN gate MUST emit three outputs (ALIGNED / DRIFTED-objective / DRIFTED-output). Stale-anchor warning if amendments >48h old.

3. **Audience Leakage in Type B (#5)** — Phase 7 MUST encode audience in filename + literal first-line watermark in rendered output + cross-artifact diff check + mandatory `/brief-export` confirmation step. Voice and audience are separate guards.

4. **Hallucinated Market Data (#6)** — Phase 4 DISCOVER MUST require URL + access date for every quantitative claim (no URL = no number). Provenance tags `[VERIFIED:...|date]`, `[ASSUMED:...]`, `[FOUNDER-INPUT]` propagate. Phase 7 investor-facing gate MUST reject `[ASSUMED]` quantitative claims. Phase 6 financial models MUST use driver-based bottom-up.

5. **Phase 1↔2 Infinite Loop (#7)** — Phase 5 MUST implement hard 3-round-trip cap, gap criticality classification (BLOCKING/MATERIAL/NICE-TO-HAVE), meta-arbiter prompt at iteration 2, convergence telemetry in `/brief-status`. NEVER acceptable to skip.

6. **Skill/Command Bloat (#1)** — Phase 1 foundation MUST set caps in CLAUDE.md before writing first command (≤12 user-facing commands, ≤8 skills). Phase 8 MUST audit surface count before launch.

7. **Fork Drift from Upstream GSD (#8)** — Phase 1 foundation MUST design layered architecture with stable seam BEFORE the hard rename. Atomic single-purpose rename commit. Quarterly upstream-sync milestone in roadmap.

8. **Cross-Runtime Prompt Fragility (#2)** — Phase 1 codifies LCD capability surface in CLAUDE.md (no AskUserQuestion, no thinking, no antml:, no MCP-assumed). Phase 8 MUST run cross-runtime smoke tests in Codex + Gemini.

9. **Korean Cultural Gotchas (#11)** — Phase 4 region context injection on every researcher; Phase 6 region-aware designers; Phase 7 honorific guard + pitch-order awareness + bilingual pairs + idiom-substitution table.

10. **Non-Developer User Friction (#9)** — Phase 1 establishes "non-developer first" as CLAUDE.md constraint; Phase 8 MUST conduct external pilot with at least 3 non-developer planners observed.

## Files Referenced

- `.planning/PROJECT.md`
- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`

---
*Synthesized: 2026-04-18*
