# Risk Register — Design Prompts

You produce a 5-category Risk Register for `{{project_name}}`: Technology, Market,
Regulatory, Financial, Operational. Each risk has likelihood (H/M/L), impact (H/M/L),
mitigation, owner, and next review date. The artifact also includes a Top 5
cross-category prioritized list and a Quarterly Review Cadence section.
`[CITED:metricstream.com/learn/what-are-risk-categories|2025 risk categorization|2026-04-25]`

## Inputs

You read:
- `.planning/OBJECTIVES.md` — immutable intent + key_risks mutable hypothesis if present.
- DISCOVER outputs at `.planning/discover/*.md` — `competitor-landscape.md`,
  `market-sizing.md`, `regulation-and-compliance.md`, `technology-and-product.md`,
  `customer-research.md`.
- Completed BMC (`.planning/workstreams/business-model-canvas/canvas.md`) — Section 9
  (Cost Structure) + Section 8 (Key Partners) feed Operational + Financial risk.
- Completed COMPLIANCE workstream artifact (if exists) — feeds Regulatory risk.
- Completed FINANCIAL workstream artifact (if exists) — feeds Financial risk severity
  (runway < 6 months → likelihood: H).
- Completed OPERATIONS workstream artifact (if exists) — feeds Operational risk.
- `state.brief.business_model` and `state.brief.region` — context-injected.

## Output

Populate `templates/artifact.md`. Cite each risk source: every entry has provenance.

## B2B / B2C Conditional Lens

Risk profiles diverge meaningfully by business model:

If business_model in [b2b, enterprise]:
  Technology Risks: emphasize integration risk (customer's legacy systems, on-prem
    requirements, SSO / SCIM expectations), security questionnaire failures, data
    residency requirements, multi-tenant isolation.
  Market Risks: emphasize procurement-cycle elongation, win-rate compression, RFP
    losses, key-account-loss concentration risk.
  Regulatory Risks: emphasize contract clauses, MSA / DPA negotiation friction,
    SOC 2 / ISO 27001 / ISMS-P certification gaps blocking deals.
  Financial Risks: emphasize collection / DSO risk for enterprise deals, multi-year
    contract revenue recognition, churn-on-renewal risk.
  Operational Risks: emphasize CSM bandwidth, security review queue, professional
    services capacity.

If business_model in [b2c, b2b2c]:
  Technology Risks: emphasize app-store policy changes (Apple/Google), platform
    dependency risk (iOS rejection, Play Store removal), scaling under viral spike,
    payment-rail outages.
  Market Risks: emphasize CAC inflation, channel concentration, viral coefficient
    decay, competitive copycat risk.
  Regulatory Risks: emphasize consumer-protection / dark-pattern enforcement, privacy
    notice + consent flow PIPA exposure, breach notification readiness, kids/sensitive
    data scope.
  Financial Risks: emphasize CAC payback period blowing out, retention curve
    deterioration, refund / chargeback exposure.
  Operational Risks: emphasize support-tier-1 ticket volume, content moderation /
    trust & safety team, app-store-review-response capacity.

## Korean Variant (region: kr)

When `state.brief.region == "kr"`, ensure Regulatory Risks row references:

- **2026 PIPA amendments** — CEO personal liability + 10% turnover penalty ceiling.
  Phrase as: "PIPA 2026 위반 시 대표이사 개인 책임 노출. Mitigation: separate consent
  per data category, CPO independence, breach notification readiness." This is a
  high-severity risk for any region:kr fintech / healthcare / education project.
  `[VERIFIED:brief/references/compliance/korea/pipa-2026.md|Phase 5 D-04 primer]`
- **ISMS-P 2027-07-01 mandatory deadline** — likelihood H if designated large-scale
  controller threshold likely; impact H (cannot operate without certification).
  `[VERIFIED:brief/references/compliance/korea/isms-p.md|Phase 5 D-04 primer]`
- **MyData expansion** — for fintech, MyData is mandatory; for non-finance verticals
  (health / education / employment / culture / leisure expanded in 2026), MyData
  obligations are sector-specific.
  `[VERIFIED:brief/references/compliance/korea/mydata-2026.md|Phase 5 D-04 primer]`

## Discipline

DO NOT:
- Invent risk likelihood or impact ratings without grounding. If neither OBJECTIVES.md
  nor DISCOVER provides signal, mark `[FOUNDER-INPUT decision required]` for the
  likelihood/impact cells.
- Use compliance-theater vocabulary. The risk-register is itself gated by the COMPLIANCE
  checker; "compliant" / "passed" / "✅" violate the vocabulary lock.
- Attempt to be exhaustive. Top 5 cross-category section is what surfaces in DELIVER
  EXEC-SUMMARY (Phase 8). Prioritize quality over quantity.
- Wrap output in fenced code blocks.
