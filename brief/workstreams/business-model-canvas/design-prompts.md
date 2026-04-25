# Business Model Canvas — Design Prompts

You produce a 9-block Strategyzer Business Model Canvas for `{{project_name}}`. The canvas
maps how the business creates, delivers, and captures value across nine canonical building
blocks: Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue
Streams, Key Resources, Key Activities, Key Partners, and Cost Structure.
`[CITED:strategyzer.com/library/the-business-model-canvas|Strategyzer 9 building blocks|2026-04-25]`

## Inputs

You read:
- `.planning/OBJECTIVES.md` — immutable intent + mutable hypotheses (target audience,
  monetization, GTM motion, compliance packs).
- DISCOVER outputs at `.planning/discover/*.md` (especially `customer-research.md`,
  `market-sizing.md`, `competitor-landscape.md`, `pricing-benchmarks.md`,
  `distribution-channels.md`).
- `state.brief.business_model` (`b2b` / `b2c` / `b2b2c` / `enterprise`) and
  `state.brief.region` (`kr` / `us` / `eu` / etc.) — injected via context-inject.

## Output

Populate `templates/artifact.md`. Every claim cites either OBJECTIVES.md, a DISCOVER
output, or a regulatory primer with a `[VERIFIED:source|date]` tag (Phase 5 CC-04
provenance discipline). If a value is not in any source and the user did not supply
it, emit `[FOUNDER-INPUT placeholder — fill before sharing]` rather than inventing.

## B2B / B2C Conditional Lens

The same 9-block structure carries different content depending on `business_model`. Apply
the lens per block:

If business_model in [b2b, enterprise]:
  Section 1 (Customer Segments) emphasizes ICP firmographics: industry, company size band,
    geography, technographics. Distinguish ICP (organization) from buyer persona
    (individual decision-maker). `[CITED:dealhub.io/glossary/b2b-gtm/|ICP-vs-buyer-persona|2026-04-25]`
  Section 3 (Channels) emphasizes sales-led motion: direct sales, partner channels, RFP
    processes, procurement cycle stage, pilot-to-rollout sequence.
  Section 4 (Customer Relationships) emphasizes account management: dedicated CSM, QBR
    cadence, expansion playbooks, renewal motion.
  Section 5 (Revenue Streams) emphasizes contract structures: ACV bands, multi-year
    commitments, usage-based vs. seat-based, expansion revenue.
  Section 7 (Key Activities) emphasizes enterprise sales motion, RFP responses, security
    questionnaires, customer success.
  Section 8 (Key Partners) emphasizes channel partners, system integrators, technology
    alliances.

If business_model in [b2c, b2b2c]:
  Section 1 (Customer Segments) emphasizes personas: jobs-to-be-done, demographic +
    behavioral cohorts, psychographic frames. For B2B2C, distinguish business-side
    customer from end-user persona.
  Section 3 (Channels) emphasizes distribution: app stores, social platforms, influencer
    partnerships, retail / e-commerce, viral mechanics, paid acquisition.
  Section 4 (Customer Relationships) emphasizes engagement: lifecycle email, push, in-app
    nudges, community, retention cohort behavior.
  Section 5 (Revenue Streams) emphasizes monetization: freemium tiers, in-app purchases,
    subscription, ads, transactional fees.
  Section 7 (Key Activities) emphasizes product iteration, growth marketing, content,
    community management.
  Section 8 (Key Partners) emphasizes platform partners (app stores, payment processors),
    content / influencer partnerships, distribution partners.

## Korean Variant (region: kr)

When `state.brief.region == "kr"`, write all section headers in Korean and produce body
content in Korean:
- 1. 고객 세그먼트 (Customer Segments)
- 2. 가치 제안 (Value Propositions)
- 3. 채널 (Channels)
- 4. 고객 관계 (Customer Relationships)
- 5. 수익원 (Revenue Streams)
- 6. 핵심 자원 (Key Resources)
- 7. 핵심 활동 (Key Activities)
- 8. 핵심 파트너 (Key Partners)
- 9. 비용 구조 (Cost Structure)

`[CITED:strategyzer.com/library/the-business-model-canvas|Strategyzer 9 blocks Korean equivalents|2026-04-25]`

## Lean Canvas Variant (frontmatter toggle)

Ash Maurya's Lean Canvas substitutes Problem / Solution / Key Metrics / Unfair Advantage
for Key Activities / Key Resources / Key Partners / Customer Relationships. This is a
v2 toggle. v1 ships ONLY the Strategyzer 9-block default.
`[CITED:leanstack.com/leancanvas|Ash Maurya 9-block lean variant|2026-04-25]`

If `business_model_canvas_variant: lean` is set in OBJECTIVES.md frontmatter, emit a
`Lean Canvas Variant` appendix noting that v2 will swap the section headers. Do NOT
swap headers in v1 — the default Strategyzer template ships and the toggle is
documented for forward compatibility.

## Discipline

DO NOT:
- Invent customer segments, revenue numbers, or competitor positioning the user did not
  supply and DISCOVER did not surface. Use `[FOUNDER-INPUT placeholder]` instead.
- Apply top-down market sizing ("we'll capture X% of the market"). Pitfall #6 mitigation:
  bottom-up grounding only.
- Use compliance-theater vocabulary ("compliant", "passed", "verified", "audit complete",
  "✅"). The COMPLIANCE checker will gate this artifact and findings vocabulary applies.
- Wrap output in fenced code blocks. The output IS the artifact, not a code sample.
