# Go-to-Market — Design Prompts

You produce a Go-to-Market (GTM) plan for `{{project_name}}`. Structure follows the
Sequoia 10-slide convention adapted for an internal GTM artifact: 9 sections covering
target market, positioning, pricing, sales motion, channels, demand generation, sales
enablement, launch plan, and KPIs.
`[CITED:winningpresentations.com/investor-pitch-deck-template/|Sequoia 10-slide structure|2026-04-25]`,
`[CITED:vendedigital.com/blog/2025-b2b-gtm-strategy-playbook|2026-04-25]`

## Inputs

You read:
- `.planning/OBJECTIVES.md` — immutable intent + mutable hypotheses (target audience,
  monetization, GTM motion).
- DISCOVER outputs at `.planning/discover/*.md` — `customer-research.md`,
  `competitor-landscape.md`, `distribution-channels.md`, `pricing-benchmarks.md`.
- `.planning/workstreams/business-model-canvas/canvas.md` if completed — the BMC's
  Customer Segments + Channels + Revenue Streams blocks are direct inputs to GTM.
- `state.brief.business_model` and `state.brief.region` — context-injected.

## Output

Populate `templates/artifact.md`. Every claim cites a source with `[VERIFIED:source|date]`
or marks unsourced values `[FOUNDER-INPUT placeholder]`.

## B2B / B2C Conditional Lens

If business_model in [b2b, enterprise]:
  Section 1 (Target Market & ICP / Personas): distinguish ICP (firmographic — ideal
    customer organization) from buyer persona (individual decision-maker within that
    organization). Cite the DSG-02 contract: 4 GTM motions exist (sales-led,
    marketing-led, PLG, partner-led); B2B with complex offerings + high ACV typically
    sales-led-anchored. `[CITED:dealhub.io/glossary/b2b-gtm/|ICP-vs-buyer-persona|2026-04-25]`
  Section 3 (Pricing & Packaging): ACV bands + tier ladder; multi-year discount
    structures; usage-based vs. seat-based; expansion math.
  Section 4 (Sales & Distribution Motion): enumerate the procurement / RFP / pilot →
    rollout cycle. Multi-stakeholder buying committee: champion, economic buyer,
    technical evaluator, end user, procurement.
  Section 5 (Channels): outbound / inbound / events / partnerships. Account-Based
    Marketing (ABM) for high-ACV accounts.
  Section 6 (Demand Generation): content + ABM + outbound; SDR/BDR motion; intent data;
    target account list (TAL) construction.
  Section 7 (Sales Enablement): collateral, ROI calculators, demo flow, security
    questionnaire library, reference customer program.
  Section 9 (KPIs): pipeline coverage, conversion-by-stage, ACV/contract-length
    distribution, sales-cycle, win-rate, expansion / NRR, Net Promoter Score.

If business_model in [b2c, b2b2c]:
  Section 1 (Target Market & ICP / Personas): jobs-to-be-done framing; demographic +
    psychographic + behavioral persona dimensions; cohort definitions.
  Section 3 (Pricing & Packaging): freemium tiers / subscription / IAP / ads /
    transactional. Price elasticity considerations + paywall strategy.
  Section 4 (Sales & Distribution Motion): app store economics (Apple/Google take-rate,
    store optimization, review velocity), viral coefficients, retention cohort math.
    For B2B2C, separate the business-side sales motion from the end-user growth motion.
  Section 5 (Channels): paid acquisition / organic / influencer / referral / SEO / ASO.
  Section 6 (Demand Generation): paid + viral + referral; growth loops; influencer
    programs; content + community.
  Section 7 (Sales Enablement): not applicable in the B2B sense — replace with
    onboarding flow, activation milestones, and lifecycle email/push automation.
  Section 9 (KPIs): CAC payback, LTV/CAC, retention curves (D1/D7/D30/D90), MAU/DAU
    stickiness, viral K-factor, ARPU, churn rate.

## Korean Variant (region: kr)

When `state.brief.region == "kr"`:
- Korean section headers; body in Korean.
- Section 7 (Sales Enablement) for B2B addresses Korean enterprise buying culture:
  관계 영업 (relationship-led sales), 제안서 (proposal) culture, 결재 라인 (approval
  chain) traversal, 회식 / 골프 / 식사 customer-relationship-building expectations
  (in moderation, not as anti-pattern caricatures).
- Section 1 personas note Korean market specifics: app store landscape (Naver, Kakao,
  Coupang play role of Western counterparts), payment culture (Toss, Kakao Pay), and
  regulatory consumer expectations (PIPA-driven consent UX).

## Discipline

DO NOT:
- Invent acquisition channel performance numbers, CAC values, or pipeline conversion
  rates the user did not supply and DISCOVER did not surface. Use
  `[FOUNDER-INPUT placeholder]` instead.
- Apply top-down market sizing ("if we capture 5% of TAM..."). Pitfall #6 mitigation
  applies here too.
- Use compliance-theater vocabulary in findings sections.
- Wrap output in fenced code blocks.
