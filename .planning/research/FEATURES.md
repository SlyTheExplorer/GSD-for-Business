# Feature Research

**Domain:** Business planning / strategy meta-prompting framework (BRIEF)
**Researched:** 2026-04-17
**Confidence:** HIGH (broad coverage across 8 tool categories, 24 named products)

## Summary

The business planning tooling landscape is bifurcated. On one side: **template-and-canvas tools** (Strategyzer, Canvanizer, LivePlan, Bizplan, Notion templates) that give users a structured form to fill in but no help with thinking. On the other: **operational platforms** (Lattice, Workboard, Asana Goals, Vanta, Drata, Productboard, Aha) optimized for in-flight execution after a strategy already exists. AI-native business plan generators (Upmetrics, PrometAI, Canva, Gamma) sit between them but stop at "produce one document" and do not orchestrate the full DEFINE → DISCOVER → DESIGN → DELIVER arc.

**No tool in the surveyed landscape combines: (a) structured intent extraction before research, (b) parallel multi-domain discovery, (c) audience-aware artifact generation with confidentiality guards, (d) Korea-first compliance built in, and (e) bidirectional flow between research and design.** This is BRIEF's structural opening.

What every category surveyed has in common: they assume the user already knows what they want. The closest tool to BRIEF's DEFINE phase is consulting practice (Strategyn JTBD interviews, Amazon's PR/FAQ), not software.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or wrong-category.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Business Model Canvas (or equivalent structured BMC artifact) | Strategyzer made BMC the default vocabulary; Canvanizer, Notion templates, LivePlan, Upmetrics all include it. Users will look for it by name. | LOW | Output as structured Markdown with the 9 blocks. No need for visual canvas — see anti-features. |
| Financial projections section (P&L, cashflow, runway) | Causal, Pry, LivePlan, Bizplan, Upmetrics all include 3-way forecast. Investors require it. | MEDIUM | Generate scaffolding/templates with driver-based assumptions; do NOT build a calc engine — see anti-features. |
| GTM plan section (segments, channels, pricing, motion) | Every business plan tool and PM template (Lenny, Mutiny adjacencies) treats this as core. | LOW | Section in DESIGN milestone, audience-aware. |
| Pitch deck output / structured slide outline | Pitch, Tome, Beautiful.ai, Gamma, Upmetrics all generate decks. Founders expect "I get a deck out of this." | MEDIUM | Generate `.md` slide outline + speaker notes; export to deck tool. Don't build a slide editor. |
| Goals / OKR scaffolding | Lattice, Workboard, Asana Goals, Notion OKR templates — every strategic-planning workflow ends with measurable goals. | LOW | OBJECTIVES.md anchors this; Roadmap milestone produces explicit OKRs. |
| Compliance / regulatory checklist (industry+region aware) | Drata, Vanta, ISMS-P, PIPA all expect a structured checklist tied to controls. | MEDIUM | Built-in Compliance & Legal milestone + Korea-first reference library (ISMS-P, PIPA, e-금융업, mydata). |
| Competitive analysis section | Upmetrics, PrometAI, every strategy template includes it; investors ask for it. | LOW | Output of DISCOVER (competitor researcher agent). |
| Market sizing (TAM/SAM/SOM) | Upmetrics, every investor deck template. Pre-seed data rooms expect it (DocSend's 17-doc list). | LOW | Output of DISCOVER (market researcher agent). |
| Investor / IR-ready summary artifact | DocSend, Pitch, IR dashboards — fundraising founders expect a polished investor narrative. | MEDIUM | Type B INVESTOR-IR artifact in DELIVER. |
| Scenario planning (best/base/worst case) | Causal, Pry, Upmetrics all build it in. Investors ask "what if" by default. | LOW | Markdown table per milestone where it applies (financial, GTM). |
| Export to common formats (Markdown, PDF) | Canvanizer, every business-plan tool. Users want to copy out. | LOW | Already implicit — Markdown is native. PDF is downstream tool concern. |
| Templates / structured prompts for each artifact type | Notion Marketplace (30,000+ templates), Lenny's templates, McKinsey/BCG slide kits — proves users want starting points, not blank pages. | LOW | Each milestone agent has a structured prompt + output template. |

### Differentiators (Competitive Advantage)

Features that BRIEF will be uniquely strong on. None of the surveyed tools combine more than two of these.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Phase 0 DEFINE: structured intent extraction before any work** | Closest analog (Amazon PR/FAQ, Strategyn JTBD interviews) is a consulting practice, not software. Notion AI / ChatGPT prompts try, but ad-hoc. BRIEF makes "extract user's true intent" a mandatory first phase using Push Twice + Language Precision + Dream State Mapping. | MEDIUM | Conversational intent extractor (Phase 0 agent) producing OBJECTIVES.md. ~30 min lightweight. Direct rebuttal to "AI just generates a generic business plan from a one-liner." |
| **OBJECTIVES.md as the single anchor + continuous ALIGN gate** | Every other tool re-asks goals at each phase or, worse, lets goals drift silently. BRIEF measures every milestone output against OBJECTIVES.md before allowing the phase to advance. | MEDIUM | ALIGN gate runs after every milestone in Phase 2/3. Catches drift while correction cost is low. |
| **Audience-aware artifact frontmatter + leakage guard** | Document classification tools (Microsoft Sensitivity Labels, Adobe info classification) are enterprise security tools, not planning tools. No business-planning tool flags "this internal-only line leaked into your investor IR." BRIEF blocks publish when audience mismatch detected. | MEDIUM | Mandatory frontmatter (`audience`, `confidentiality`, `voice`) on every artifact + automatic checker on every Type B output. Direct response to "the #1 deliverable failure mode." |
| **B2B/B2C context injection on every spawned agent** | Lenny's templates, Strategyzer, Mutiny all assume one model context. Same advice (e.g., "GTM motion") means very different things B2B vs B2C. BRIEF injects business model into every prompt. | LOW | Read OBJECTIVES.md → inject into every agent prompt. Mechanical. High leverage. |
| **6-8 parallel domain researcher agents in DISCOVER** | LivePlan, Upmetrics, PrometAI generate market analysis as a single AI call. BRIEF runs market, competitors, customers, regulation, tech, trends, cases in parallel — each as a specialized researcher. | HIGH | Reuses GSD's multi-agent orchestration. The closest competitor (Upmetrics "AI industry research reports") is a single section, not parallel domain coverage. |
| **Bidirectional Phase 1 ↔ Phase 2 flow with auto gap detection** | Every tool surveyed is forward-only. Discovery gaps surface during design and force a rewrite. BRIEF detects gaps and offers return-to-Phase-1 (with user approval). | MEDIUM | Phase 2 milestone agents flag "missing research." Orchestrator surfaces a `/brief-fill-research-gap` decision. |
| **Korea-first compliance reference library** | Drata, Vanta cover SOC 2/GDPR/HIPAA but ISMS-P/PIPA/e-금융업/mydata coverage is thin or absent. The 2026 PIPA amendment makes ISMS-P certification mandatory for some controllers (effective July 2027) — high-leverage timing. | MEDIUM | Reference library: ISMS-P (80 InfoSec + 22 PII controls), PIPA (10% revenue penalty for repeat violations), e-금융업, mydata, 의료기기법. Plus global packs (GDPR, CCPA, SOC 2, HIPAA, PCI-DSS) for export. |
| **Two-layer compliance defense: formal milestone + auto-checker on every other output** | Drata/Vanta = continuous monitoring of one framework. BRIEF combines a dedicated Compliance & Legal milestone with auto-checks on every other artifact ("is this GTM plan PIPA-compliant?"). | MEDIUM | Compliance checker agent runs as a gate in addition to the formal milestone. |
| **Dynamic workstream addition (`/brief-add-workstream`)** | Every business-plan tool has a fixed structure. Real planning needs "oh, certifications got missed — add a workstream." BRIEF reuses the gsd-new-milestone pattern. | MEDIUM | Already a mature GSD pattern. Just renamed and re-prompted for business domain. |
| **Type A vs Type B artifact split (Product policy vs Communication)** | Productboard / Aha produce PRDs. Pitch / DocSend produce decks. Nobody does both from the same source of truth with audience-correct framing. | MEDIUM | DELIVER phase splits explicitly: Type A (PRODUCT-BRIEF, SERVICE-POLICY, HIGH-LEVEL-SPEC, FEATURE-MAP) feeds into a downstream PRD. Type B (INTERNAL-DECK, PROPOSAL-DECK, INVESTOR-IR, EXEC-SUMMARY, DECISION-MEMO) handles stakeholder communication. |
| **PRD-input handoff** | Notion AI generates a "business plan." BRIEF generates a structured PRD-input bundle that GSD itself can pick up and execute. Closes the loop from "fuzzy idea" to "engineering ready." | LOW | Type A artifacts are explicitly designed as PRD inputs. The fact that BRIEF is forked from GSD makes the handoff format-compatible. |
| **Multi-runtime CLI (Claude / Codex / Gemini / OpenCode)** | Notion AI, Upmetrics, Strategyzer are all SaaS web apps. BRIEF runs in the user's terminal with their preferred LLM. Fits PMs/founders who already work in Cursor/Claude Code. | LOW | Inherited from GSD. Zero added work. Differentiator vs every SaaS competitor. |
| **Atomic commit + state lock + audit trail** | SaaS competitors have version history but it's not designed for planning audit. BRIEF's state lock + atomic commits give a per-decision rewind log — important for regulated industries (fintech, healthcare). | LOW | Inherited from GSD. Free differentiator. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that look like table stakes from a glance but would pull BRIEF off-mission. The discipline is to NOT build these.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Visual BMC canvas / drag-and-drop diagram editor** | Strategyzer, Canvanizer, Miro are visual. Users will ask "where's my canvas view?" | A web/visual editor would force a UI app, kill multi-runtime CLI distribution, balloon scope, and duplicate Strategyzer poorly. The structured Markdown is more useful for downstream agents anyway. | Output BMC as structured Markdown blocks. User pastes into Strategyzer / Miro / Canva if they want a visual. |
| **Built-in financial calculation engine (Causal-style)** | "If this is a planning tool, why doesn't it compute IRR / DCF / cohort retention for me?" | Causal raised $20M+ to build that engine. Doing it badly is worse than not doing it. Investors trust spreadsheet outputs from real models, not generated ones. | Generate forecast scaffolding + driver assumptions in Markdown tables. User runs the math in Causal/Pry/Excel/Sheets. Optionally export CSV. |
| **Slide editor / presentation tool (Pitch/Tome/Gamma replacement)** | "I asked for a deck — give me a deck." | Pitch/Beautiful.ai/Gamma are presentation tools by full teams. Building a slide editor is a different product. | Generate slide outline as `.md` (one slide per `##` section, speaker notes underneath). User pastes into Gamma/Pitch/Beautiful.ai for visual polish. |
| **Continuous monitoring of compliance controls (Vanta/Drata replacement)** | "If you have a compliance milestone, why don't you continuously monitor my AWS / GitHub / Okta?" | Vanta has 375+ integrations. Drata has 250+. This is a separate product category. BRIEF is a planning tool, not a compliance ops platform. | BRIEF produces a readiness checklist + risk register at planning time. User adopts Vanta/Drata for runtime monitoring. The two are complementary. |
| **Real-time multi-user collaboration / WebSocket cursors (Miro/Notion-style)** | Modern planning tools have it. Lattice, Workboard, Notion all show live cursors. | CLI tool. Multi-runtime support. Live collab requires server infrastructure that conflicts with the "runs locally with your LLM" model. | Git is the collaboration layer. Atomic commits, branches, PR review. Fits the engineering-adjacent persona. |
| **Goal tracking dashboards / weekly check-ins (Lattice/Workboard replacement)** | OBJECTIVES.md sounds like an OKR tool. | Lattice/Workboard are operational HR tools. BRIEF is a planning tool. The OBJECTIVES file anchors planning, not weekly status. | OBJECTIVES.md → consumed by Lattice/Workboard/Asana for ongoing tracking. BRIEF stops at "plan defined." |
| **Investor data room / DocSend-style document distribution** | INVESTOR-IR artifact ⇒ "where do I send this from?" | Distribution / view tracking / watermarking is DocSend's core product. | BRIEF outputs the IR artifact as Markdown/PDF. User uploads to DocSend/Papermark/Peony for distribution. |
| **Customer feedback intake / Productboard-style insights** | DEFINE / DISCOVER touch user research. "Why don't I capture user feedback in here?" | Productboard built a $100M+ company on customer feedback ingestion. Different problem. | DISCOVER's customer-research agent works from existing user-research data the user provides. BRIEF is not a feedback intake tool. |
| **Prebuilt integration with Salesforce / HubSpot / Stripe / QuickBooks** | Causal/Pry/Lattice all integrate with these. | Each integration is an ongoing maintenance cost. Multi-runtime CLI distribution makes runtime integrations hard. | User pastes data in. Or uses GSD-style file-based ingestion (place CSV in `.planning/data/`). |
| **In-app deck templates / branding system** | "Can my decks use my company brand?" | Deck templating is its own product (Pitch templates, Beautiful.ai's smart slide system). | Generate slide-content `.md`. Branding happens in Gamma/Pitch on import. |
| **Mandatory translation / multilingual auto-output** | Korea-first ⇒ "should output Korean by default?" | The model handles this. The user's preferred output language is a runtime concern, not a feature to build. | Inherit from the runtime LLM. Provide Korean prompt examples in templates; trust LLM to follow user's language. |
| **Backwards compatibility with GSD commands / shim layer** | "I'm a GSD user — give me aliases." | Already decided in Key Decisions: "Aliases create dual-vocabulary confusion." | Hard rename `gsd-*` → `brief-*`. Backup branch for reference. |
| **Multi-cycle / `/brief-new-milestone` (v2 cycle restart)** | "What about iterating from v1 to v2?" | Already in Out of Scope: defer for v1. | `/brief-add-workstream` covers within-cycle additions. Multi-cycle deferred to a future need. |
| **Plugin form (in addition to fork)** | "Why not also publish as a GSD plugin?" | Already explored and rejected: coupling to GSD upgrade cycle constrains BRIEF too much. | Hard fork. Independent release cadence. |

## Feature Dependencies

```
OBJECTIVES.md (Phase 0 DEFINE output)
    └──required by──> ALIGN gate (every milestone)
    └──required by──> Audience guard (frontmatter source of truth)
    └──required by──> B2B/B2C context injection (business model lens)

Phase 0 Conversational Intent Extractor
    └──produces──> OBJECTIVES.md
    └──uses──> Push Twice + Language Precision + Dream State Mapping techniques

Phase 1 DISCOVER (parallel researcher agents)
    └──reads──> OBJECTIVES.md
    └──produces──> Research outputs tagged business_model + region
    └──feeds──> Phase 2 DESIGN milestones
    ↑
    └──gap-back-feed──┐
                      │
Phase 2 DESIGN milestones ─ (BMC, GTM, Financial, Operations, Compliance, Roadmap)
    └──reads──> OBJECTIVES.md + DISCOVER outputs
    └──gated by──> ALIGN gate (per milestone)
    └──gated by──> Compliance auto-checker
    └──can trigger──> Phase 1 return for missing research
    └──produces──> Built-in workstream artifacts
    └──supports──> Dynamic workstream addition (/brief-add-workstream)

Phase 3 DELIVER
    ├── Type A (Product/Service Policy)
    │       └──reads──> Phase 2 outputs
    │       └──produces──> PRODUCT-BRIEF, SERVICE-POLICY, HIGH-LEVEL-SPEC, FEATURE-MAP
    │       └──hands off to──> downstream PRD (e.g., GSD itself)
    └── Type B (Communication)
            └──reads──> Phase 2 outputs + audience target
            └──produces──> INTERNAL-DECK, PROPOSAL-DECK, INVESTOR-IR, EXEC-SUMMARY, DECISION-MEMO
            └──gated by──> Audience guard (confidentiality + voice fit)

Korea-first Compliance Reference Library
    └──used by──> Compliance & Legal milestone
    └──used by──> Compliance auto-checker
    └──contains──> ISMS-P, PIPA, e-금융업, mydata, 의료기기법, GDPR, CCPA, SOC 2, HIPAA, PCI-DSS

Multi-runtime CLI (Claude / Codex / Gemini / OpenCode)
    └──conflicts with──> Real-time collab, web UI, integration platforms
    └──enables──> Local-first, BYO-LLM distribution

Multi-agent orchestration (inherited from GSD)
    └──enables──> Parallel DISCOVER researchers
    └──enables──> Per-milestone agents in DESIGN
    └──enables──> Compliance + ALIGN + Audience checker agents

Atomic commits + STATE.md lock (inherited from GSD)
    └──enables──> Per-decision audit trail
    └──enables──> Concurrent agent safety
```

### Dependency Notes

- **OBJECTIVES.md is the linchpin.** Every gate (ALIGN, Audience, Compliance) and every spawned agent reads it. Build Phase 0 first, then everything downstream depends on it.
- **DISCOVER must precede DESIGN, but flow is bidirectional.** Build forward path first; gap-detection-and-return is a v1.x enhancement if it slips.
- **Compliance auto-checker requires the reference library.** Build the Korea ISMS-P/PIPA reference first (highest leverage), then global packs, then the auto-checker that consumes them.
- **Type A and Type B in DELIVER are independent.** Can ship Type B (decks) before Type A (PRD inputs) or vice-versa, depending on validation priority.
- **Dynamic workstream addition (`/brief-add-workstream`) requires the milestone agent pattern to be stable first.** Don't ship workstream-add until Phase 2's built-in workstreams work end-to-end.
- **B2B/B2C context injection is mechanical and cheap** — should be in v1 for every spawned agent. Drops in once OBJECTIVES.md is producing the business_model field.
- **Audience guard requires every artifact to have frontmatter.** Make frontmatter mandatory at artifact-template level so the guard always has something to check.

## MVP Definition

### Launch With (v1)

Minimum viable framework — enough to validate the core hypothesis that "structured intent extraction + parallel discovery + audience-aware delivery" is materially better than ad-hoc ChatGPT/Notion templates.

- [ ] **Phase 0 DEFINE intent extractor** — produces OBJECTIVES.md. Without this, BRIEF is just another business-plan generator.
- [ ] **OBJECTIVES.md schema + read-by-every-agent contract** — the anchor that makes every other gate work.
- [ ] **Phase 1 DISCOVER with 6-8 parallel researcher agents** (market, competitors, customers, regulation, tech, trends, cases) — the core differentiator vs single-call AI generators.
- [ ] **Phase 2 DESIGN built-in workstreams** (BMC, GTM, Financial, Operations, Compliance, Roadmap) — each as a milestone agent producing structured Markdown.
- [ ] **Continuous ALIGN gate at every milestone** — measures output against OBJECTIVES.md, blocks advance on drift.
- [ ] **Audience guard with mandatory frontmatter on every artifact** — blocks audience-mismatch leakage.
- [ ] **B2B/B2C context injection on every spawned agent** — mechanical, cheap, high-leverage.
- [ ] **Compliance & Legal milestone + Korea-first reference library** (ISMS-P, PIPA at minimum) — high-leverage timing given 2026 PIPA amendment.
- [ ] **Compliance auto-checker on every milestone output** — second layer of compliance defense.
- [ ] **Phase 3 DELIVER Type A artifacts** (PRODUCT-BRIEF, SERVICE-POLICY, HIGH-LEVEL-SPEC, FEATURE-MAP) — proves the PRD-handoff loop closes.
- [ ] **Phase 3 DELIVER Type B artifacts** (INTERNAL-DECK, PROPOSAL-DECK, INVESTOR-IR, EXEC-SUMMARY, DECISION-MEMO) — proves the audience-aware delivery story.
- [ ] **Hard rename `gsd-*` → `brief-*`** — cleanest brand, no dual-vocabulary confusion.
- [ ] **Multi-runtime support preserved** (Claude / Codex / Gemini / OpenCode) — inherited from GSD.
- [ ] **`backup/original-gsd` safety branch** — one-command rollback.
- [ ] **CLAUDE.md / README rewritten for business planning domain** — without this the tool will be misused.

### Add After Validation (v1.x)

Features to add once core is working and we have user signal.

- [ ] **Bidirectional Phase 1 ↔ Phase 2 flow with auto gap detection** — surfaces real research gaps mid-design. Add when v1 reveals which gaps actually surface most often.
- [ ] **`/brief-add-workstream` dynamic workstream addition** — pattern is mature in GSD, but defer until built-in workstreams are stable end-to-end.
- [ ] **Global compliance packs beyond Korea** (full GDPR, CCPA, SOC 2, HIPAA, PCI-DSS) — add after first export-bound user requests them.
- [ ] **Industry-specific compliance packs** (e-금융업, mydata, 의료기기법, plus US fintech/healthcare specifics) — add per industry as users emerge.
- [ ] **CSV export for financial model handoff to Causal/Pry/Excel** — add when users complain the Markdown table copy-paste is friction.
- [ ] **K-Startup grant proposal template** — high-leverage for Korean founders. The K-Startup application has a known structure; produce a Type A variant matching its sections.
- [ ] **Investor-narrative deck template variants** (seed / Series A / Series B) — each stage's IR doc has different expected sections.
- [ ] **Strategy consultant deliverable templates** (McKinsey/BCG style: market entry, ops review, growth strategy) — add for the strategy-consultant persona.

### Future Consideration (v2+)

Features to defer until product-market fit is established and we have clear demand signal.

- [ ] **`/brief-new-milestone` (v2 cycle restart)** — already deferred per Out of Scope. Add when users report they want to iterate from a v1 plan to a v2 plan with the prior plan as input.
- [ ] **Web/visual canvas mode** — only if validation shows CLI-only is a real adoption blocker. Likely never; persona is engineering-adjacent.
- [ ] **Real-time multi-agent collaboration** — only if users report git-as-collab is insufficient. Likely never.
- [ ] **Cross-cycle learning / pattern library** — extract patterns from completed plans to seed new ones. Adds value only after a corpus exists.
- [ ] **Plugin form (in addition to fork)** — already rejected per Out of Scope. Revisit only if BRIEF and GSD release cadences naturally converge.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Phase 0 DEFINE intent extractor (OBJECTIVES.md) | HIGH | MEDIUM | P1 |
| ALIGN gate at every milestone | HIGH | MEDIUM | P1 |
| Audience guard + frontmatter | HIGH | MEDIUM | P1 |
| B2B/B2C context injection | HIGH | LOW | P1 |
| Phase 1 parallel researcher agents | HIGH | HIGH | P1 |
| Phase 2 built-in workstreams (BMC, GTM, Financial, Ops, Compliance, Roadmap) | HIGH | MEDIUM | P1 |
| Compliance & Legal milestone | HIGH | MEDIUM | P1 |
| Korea-first compliance reference (ISMS-P, PIPA) | HIGH | MEDIUM | P1 |
| Compliance auto-checker | HIGH | MEDIUM | P1 |
| Phase 3 DELIVER Type A (PRD inputs) | HIGH | MEDIUM | P1 |
| Phase 3 DELIVER Type B (deck/IR/memo) | HIGH | MEDIUM | P1 |
| Hard rename `gsd-*` → `brief-*` | MEDIUM | LOW | P1 |
| Multi-runtime preservation | HIGH | LOW (inherited) | P1 |
| `backup/original-gsd` safety branch | MEDIUM | LOW | P1 |
| CLAUDE.md / README rewrite | HIGH | LOW | P1 |
| Bidirectional Phase 1 ↔ 2 with gap detection | MEDIUM | MEDIUM | P2 |
| `/brief-add-workstream` dynamic milestone | MEDIUM | MEDIUM | P2 |
| Global compliance packs (GDPR, SOC 2, HIPAA, PCI-DSS) | MEDIUM | MEDIUM | P2 |
| K-Startup grant proposal template | HIGH (KR persona) | LOW | P2 |
| Industry-specific compliance (e-금융업, mydata) | HIGH (per industry) | MEDIUM | P2 |
| CSV export for financial models | LOW | LOW | P2 |
| Investor-stage deck template variants (seed/A/B) | MEDIUM | LOW | P2 |
| Strategy consultant deliverable templates | MEDIUM | MEDIUM | P2 |
| `/brief-new-milestone` (v2 cycle) | UNKNOWN | MEDIUM | P3 |
| Web/visual canvas mode | LOW | HIGH | P3 (likely never) |
| Real-time collab | LOW | HIGH | P3 (likely never) |
| Cross-cycle learning / pattern library | UNKNOWN | HIGH | P3 |
| Visual BMC canvas editor | LOW | HIGH | ANTI |
| Built-in financial calc engine | MEDIUM | HIGH | ANTI |
| In-app slide editor | MEDIUM | HIGH | ANTI |
| Continuous compliance monitoring | LOW (BRIEF-context) | HIGH | ANTI |
| Customer feedback ingestion | LOW | HIGH | ANTI |
| Plugin form alongside fork | LOW | HIGH | ANTI |
| Backwards compat shim with GSD | LOW | MEDIUM | ANTI |

**Priority key:**
- P1: Must have for v1 launch (validates core hypothesis)
- P2: Should have, add 1-3 months post-launch with user signal
- P3: Nice to have, future consideration
- ANTI: Anti-feature — explicitly NOT to build

## Korea-Market Specific Features

These warrant explicit call-out because they are structural advantages BRIEF can claim that no global competitor matches today.

| Feature | Korea-Specific Justification | Priority |
|---------|------------------------------|----------|
| **ISMS-P readiness checklist (80 InfoSec + 22 PII controls)** | 2026 PIPA amendment makes ISMS-P certification mandatory for data controllers above thresholds (effective July 1, 2027). High-leverage timing — every fintech / SaaS / healthcare startup serving Korean users needs to plan for this now. | P1 |
| **PIPA compliance checklist with 10%-revenue penalty risk register** | Amended PIPA introduces aggravated penalties up to 10% of total revenue for repeat / serious violations. Risk-register format makes this tangible during planning. | P1 |
| **e-금융업 (Electronic Financial Business Act) reference pack** | Required for Korean fintech. Globally absent from Vanta/Drata. | P2 |
| **mydata reference pack** | Korean open-banking-equivalent regime. Distinct from global open-banking. | P2 |
| **의료기기법 (Medical Device Act) reference pack** | Required for Korean healthtech. Different from FDA/CE. | P2 |
| **K-Startup 정부지원사업 grant proposal template** | Annual budget KRW 3.46T (2026). Restructured into Deep Tech / General / Investment-Linked tracks. New "Policy Fund Navigator" digital application starting Jan 5, 2026. The proposal format is known and stable — generate a Type A variant matching it. | P2 |
| **Korean-language artifact output by default when OBJECTIVES.md indicates KR audience** | LLMs handle this natively if prompted; ensure agent prompts explicitly honor the language preference declared in OBJECTIVES.md. | P1 (mechanical, low cost) |

## Competitor Feature Analysis

| Feature | Strategyzer | Upmetrics | Notion AI | Lattice/Workboard | Vanta/Drata | Pitch/Gamma | **BRIEF** |
|---------|-------------|-----------|-----------|-------------------|-------------|-------------|-----------|
| Business Model Canvas | Native visual | Generated section | Templates | — | — | — | Structured Markdown blocks |
| Financial projections | — | Auto-generated 3-10 yr | Templates | — | — | — | Scaffolding + driver tables; export to Causal/Excel |
| GTM plan | — | Section | Templates | — | — | — | Dedicated milestone agent |
| Pitch deck | — | Generated | Templates | — | — | Native | `.md` outline; export to Gamma/Pitch |
| OKR / Goals | — | — | Templates | Native, real-time | — | — | OBJECTIVES.md anchor + Roadmap milestone |
| Compliance checklist | — | — | Templates | — | Native, monitored | — | Korea-first reference + auto-checker per milestone |
| Audience awareness | — | — | — | — | — | Audience mode | **Mandatory frontmatter + leakage guard** |
| Intent extraction (pre-work) | — | One-line prompt | Free-form | — | — | One-line prompt | **Phase 0 DEFINE conversational extractor** |
| Parallel domain research | — | Single AI call | Free-form | — | — | Single AI call | **6-8 parallel researcher agents** |
| Bidirectional research↔design | — | — | — | — | — | — | **Gap detection + return-to-Phase-1** |
| B2B/B2C model awareness | — | — | — | — | — | — | **Injected into every spawned agent** |
| Korea ISMS-P / PIPA | — | — | — | — | Partial (regulated globally) | — | **Built-in reference library** |
| PRD-input handoff | — | — | — | — | — | — | **Type A artifacts feed PRD (GSD-compatible)** |
| Multi-runtime LLM (BYO) | SaaS | SaaS | SaaS + AI plug | SaaS | SaaS | SaaS | **CLI: Claude / Codex / Gemini / OpenCode** |
| Atomic commits / audit trail | Version history | Version history | Version history | Audit log | Audit log | Version history | **Git atomic commits + STATE.md lock** |
| Continuous monitoring of controls | — | — | — | — | **Native** (anti-feature for BRIEF) | — | Out of scope (use Vanta/Drata downstream) |
| Visual canvas editor | **Native** (anti-feature for BRIEF) | — | — | — | — | — | Out of scope (use Strategyzer/Miro downstream) |
| Real-time collab | Limited | — | Native | Native | — | Native | Out of scope (git is the collab layer) |

**Pattern:** No competitor combines BRIEF's row-set. Strategyzer owns the canvas. Causal owns the calc. Vanta owns continuous compliance monitoring. Productboard owns customer feedback. BRIEF's edge is the **orchestration layer that turns a fuzzy idea into audience-correct, compliance-aware, structured deliverables** — and explicitly hands off to those tools rather than competing with them.

## Sources

### Business Model Canvas tools
- [Strategyzer — Business Model Canvas](https://www.strategyzer.com/library/the-business-model-canvas)
- [Strategyzer — Strategy & Growth Tools for Business Teams](https://www.strategyzer.com/)
- [Canvanizer](https://canvanizer.com/)
- [Canvanizer — G2 Reviews 2026](https://www.g2.com/products/canvanizer/reviews)
- [Canvanizer — Capterra 2026](https://www.capterra.com/p/178389/Canvanizer/)

### Financial modeling tools
- [Causal (now Lucanet)](https://www.causal.app/)
- [Causal — G2 Reviews 2026](https://www.g2.com/products/lucanet-ag-causal/reviews)
- [Causal — Research.com Review 2026](https://research.com/software/reviews/causal)
- [Pry — Capterra 2026](https://www.capterra.com/p/232353/Pry-Financials/)
- [Pry — G2 Reviews 2026](https://www.g2.com/products/pry/reviews)
- [Pry Financials Documentation](https://pry.co/docs/introduction/)

### OKR / Goal-tracking platforms
- [Lattice — OKR Software](https://lattice.com/platform/goals/okrs)
- [Lattice — Employee Goal Management](https://lattice.com/platform/goals)
- [Workboard](https://www.workboard.com/)
- [Workboard — Enterprise OKR Product](https://www.workboard.com/product/)
- [Asana — OKR Template Examples 2026](https://asana.com/templates/okr-objectives-key-results)
- [OKRs in Notion: Complete Guide 2026 — Mooncamp](https://mooncamp.com/blog/okrs-in-notion)
- [25 Best OKR Software 2026 — Mooncamp](https://mooncamp.com/blog/best-okr-software)

### Pitch deck / presentation tools
- [Best Pitch Deck Software 2026 — Winning Presentations](https://winningpresentations.com/best-pitch-deck-software/)
- [Gamma vs Beautiful.ai Comparison 2026 — NextDocs](https://www.nextdocs.io/compare/beautiful-ai-vs-gamma)
- [Best AI Presentation Tools 2026: Gamma vs Beautiful.ai vs Tome — CompareGen.AI](https://www.comparegen.ai/blog/best-ai-presentation-tools-2026)

### GTM / marketing planning tools
- [Mutiny — AI agent for GTM teams](https://www.mutinyhq.com/blog/ai-gtm)
- [Top AI Marketing & GTM Tools 2026 — Weglot](https://www.weglot.com/blog/top-ai-marketing-gtm-tools)
- [Top 12 Go-To-Market Tools 2026 — Default.com](https://www.default.com/post/go-to-market-tools-software)
- [Lenny Rachitsky — favorite product management templates](https://www.lennysnewsletter.com/p/my-favorite-templates-issue-37)
- [Lenny Rachitsky's Company Strategy One-Page Template — Whimsical](https://whimsical.com/lenny-rachitsky-s-company-strategy-one-pager-VqJaaTKMhaNpHsxPU6LDT)
- [How Lenny Rachitsky Helps Teams Build Strategy — Notion blog](https://www.notion.com/blog/how-lenny-rachitsky-helps-teams-build-strategy-template)

### Compliance tools
- [Vanta — SOC 2 Compliance Automation](https://www.vanta.com/products/soc-2)
- [Drata vs Vanta Comparison — Truvo Cyber](https://truvocyber.com/blog/soc-2-audit-guide-drata-vanta)
- [Drata vs Vanta API Comparison 2026 — Truvo](https://truvo.ca/blog/vanta-vs-drata-api-automation-soc2)
- [Vanta vs Drata 2026 — Cyber Sierra](https://cybersierra.co/blog/vanta-drata-review/)

### Korea regulatory references
- [ISMS-P — Personal Information Protection Commission (PIPC)](https://www.pipc.go.kr/eng/user/lgp/bnp/certification.do)
- [Korea Personal Information & ISMS-P Compliance — Thales](https://cpl.thalesgroup.com/compliance/apac/korea-personal-information-information-security-management-system-compliance)
- [K-ISMS — AWS Cloud Security](https://aws.amazon.com/compliance/k-isms/)
- [K-ISMS — Google Cloud Compliance](https://cloud.google.com/security/compliance/k-isms)
- [Data Protection & Privacy 2026 — South Korea (Chambers and Partners)](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments)
- [South Korea PIPA — TrustArc](https://trustarc.com/regulations/south-korea-pipa/)
- [South Korea Amends Privacy Law to 10% Total Revenue Fines — Hunton Privacy Blog](https://www.hunton.com/privacy-and-cybersecurity-law-blog/south-korea-amends-privacy-law-to-authorize-fines-of-up-to-10-of-total-revenue)
- [K-Startup Portal](https://www.k-startup.go.kr/)
- [Korea Rewires 2026 Startup & SME Funding System — KoreaTechDesk](https://koreatechdesk.com/korea-startup-sme-funding-policy-2026)
- [2026 중앙부처 및 지자체 창업지원사업 통합 공고 — bizinfo.go.kr](https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116904)

### Intent extraction / customer-research methods
- [Strategyn — Jobs to be Done framework (Tony Ulwick)](https://strategyn.com/jobs-to-be-done/)
- [Strategyn — Jobs to be Done Playbook](https://strategyn.com/jobs-to-be-done/jobs-to-be-done-playbook/)
- [Strategyn — Building Your Job Map](https://strategyn.com/jobs-to-be-done/jobs-to-be-done-playbook/build-your-job-map/)

### Amazon Working Backwards / PR-FAQ
- [Working Backwards — PR/FAQ Process](https://workingbackwards.com/concepts/working-backwards-pr-faq-process/)
- [Working Backwards — PR/FAQ Instructions & Template](https://workingbackwards.com/resources/working-backwards-pr-faq/)
- [Anatomy of an Amazon 6-pager — Writing Cooperative](https://writingcooperative.com/the-anatomy-of-an-amazon-6-pager-fc79f31a41c9)
- [The Amazon Writing Culture — PRFAQ.com](https://www.theprfaq.com/articles/amazon-writing-culture)

### PRD tools (downstream consumers)
- [Aha! — PRD Template](https://www.aha.io/roadmapping/guide/templates/create/prd)
- [Productboard — What is a PRD?](https://www.productboard.com/blog/product-requirements-document-guide/)
- [Top 10 Best PRD Software 2026 — ZipDo](https://zipdo.co/best/product-requirements-document-software/)

### Investor IR / data room
- [DocSend — Startup Fundraising & Pitch Deck Analytics](https://www.docsend.com/solutions/startup-fundraising/)
- [DocSend — 17 documents for emerging funds data room](https://www.docsend.com/blog/documents-to-include-in-your-emerging-funds-data-room/)
- [Best Virtual Data Rooms for Startups 2026](https://startupdatarooms.com/)
- [Your Data Room Through a VC's Eyes 2026 — Peony](https://www.peony.ink/blog/data-room-for-investors)

### Strategy consultant references
- [100+ Real McKinsey Presentations — Slideworks](https://slideworks.io/resources/47-real-mckinsey-presentations)
- [105+ Real BCG Presentations — Slideworks](https://slideworks.io/resources/54-real-bcg-presentations)
- [600+ Real Consulting Presentations — Analyst Academy](https://www.theanalystacademy.com/consulting-presentations/)

### AI business plan generators (closest direct competitors)
- [10 Best AI Business Plan Generators 2026 — Monday.com](https://monday.com/blog/crm-and-sales/best-ai-for-business-plan/)
- [Upmetrics](https://upmetrics.co/)
- [Upmetrics — Capterra 2026](https://www.capterra.com/p/171456/Business-Plan-Software/)
- [Upmetrics AI Review 2026](https://aidigitalspace.com/upmetrics-ai-review/)
- [LivePlan](https://www.liveplan.com/)
- [LivePlan Review 2026 — TRUiC](https://startupsavant.com/liveplan-review)
- [LivePlan vs Bizplan 2026 — Capterra](https://www.capterra.com/compare/142049-145819/LivePlan-vs-Bizplan)

### General-purpose tools used as planning surfaces
- [Notion AI Review 2026](https://max-productive.ai/ai-tools/notion-ai/)
- [Business Plan AI Prompts Template — Notion Marketplace](https://www.notion.com/templates/business-plan-ai-prompts)
- [110 Claude Prompts for Work — AI Prompt Library](https://www.aipromptlibrary.app/blog/claude-prompts-for-productivity)
- [Miro vs Lucidchart 2026 — Capterra](https://www.capterra.com/compare/128955-146136/Miro-vs-Lucidchart)
- [Miro vs Lucidchart 2026 — Nuclino](https://www.nuclino.com/solutions/miro-vs-lucidchart)

### Document classification / audience awareness
- [Document Classification Confidential Levels & Protocols — Deasy Labs](https://www.deasylabs.com/blog/document-classification-confidential-levels-and-protocols)
- [Microsoft — Data classification & sensitivity label taxonomy](https://learn.microsoft.com/en-us/compliance/assurance/assurance-data-classification-and-labels)
- [Information Classification — Adobe Security blog](https://blogs.adobe.com/security/2007/11/information_classification_wha.html)

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Table stakes | HIGH | Every category surveyed (BMC, financial, GTM, OKR, deck, compliance, intent extraction, PR/FAQ) shows convergent feature sets. Confidence is high that missing one of these will read as "broken." |
| Differentiators | HIGH | Negative finding — no surveyed tool combines more than two of BRIEF's differentiating features — was reached by checking each competitor against the differentiator list. The Korea PIPA 2026 amendment timing is verified by primary sources. |
| Anti-features | HIGH | Each anti-feature has a clear "competitor that already does it as their core product" — Strategyzer/Miro for visual canvas, Causal/Pry for calc engines, Pitch/Gamma for slide editors, Vanta/Drata for compliance monitoring. The discipline to NOT build them is clear. |
| Korea specificity | HIGH | 2026 PIPA amendment, ISMS-P mandatory certification timing, K-Startup 2026 funding restructuring all verified against primary government / law-firm sources. |
| MVP scope | MEDIUM | "P1 for v1" is the planner's call; this research lays out the rationale but the planner should validate each P1 has acceptable build cost in the BRIEF context. |

**Research date:** 2026-04-17
**Valid until:** ~2026-07-17 for tool feature lists (90 days; SaaS landscape moves fast). Korea PIPA / ISMS-P references valid until next regulatory amendment cycle.

---

*Feature research for: BRIEF — Business Research, Insight & Execution Framework*
*Researched: 2026-04-17*
