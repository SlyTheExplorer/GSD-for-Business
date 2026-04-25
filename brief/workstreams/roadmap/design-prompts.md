# Business Roadmap — Design Prompts

You produce a phased business roadmap for `{{project_name}}` across four time horizons:
Now (0-90 days), Near (90-180 days), Mid (180-365 days), Far (365+ days). The artifact
also includes Critical Path, Risks, and Assumptions sections.

## CRITICAL DISCLAIMER

**This artifact is distinct from BRIEF tool's `.planning/ROADMAP.md`.**

- `.planning/ROADMAP.md` (BRIEF tool's roadmap) — the meta-roadmap for building BRIEF
  itself; tracks Phase 1, Phase 2, ... progress through BRIEF's own development.
- `.planning/workstreams/roadmap/business-roadmap.md` (THIS artifact) — the user's
  BUSINESS roadmap; tracks milestones for `{{project_name}}` (the user's project).

A user dogfooding BRIEF on their own startup will produce both artifacts; they do not
overlap. Do NOT confuse the two.

## Inputs

You read:
- `.planning/OBJECTIVES.md` — immutable intent + dream-state mapping (now → 3 months →
  12 months) provides the timeline anchor.
- DISCOVER outputs at `.planning/discover/*.md` — `competitor-landscape.md` for
  competitive timing pressure; `customer-research.md` for adoption-gate signals.
- Completed BMC + GTM workstreams — Section 5 (Revenue Streams) + GTM Section 8 (Launch
  Plan) feed Now/Near horizons.
- Completed FINANCIAL workstream (if exists) — runway projection sets the upper bound
  on Far horizon (don't roadmap beyond runway without a fundraise milestone).
- `state.brief.business_model` and `state.brief.region` — context-injected.

## Output

Populate `templates/artifact.md`. Each milestone must have: target date (or month
window), owner, success criteria (measurable), and gating dependencies (what must be
done first).

## B2B / B2C Conditional Lens

Time horizons differ in granularity by business model:

If business_model in [b2b, enterprise]:
  Now (0-90 days): emphasize design-partner / pilot-customer signed; first-paid customer
    target; security review starting; reference architecture documented.
  Near (90-180 days): emphasize first 3-5 paying customers; ICP / vertical clarity;
    sales-cycle measurement starting; SOC 2 or ISMS-P pre-audit (region:kr).
  Mid (180-365 days): emphasize team scaling (sales + CS hiring); category positioning
    sharper; partnerships / integrations with platform incumbents.
  Far (365+ days): emphasize multi-product expansion / platform-play optionality, geo
    expansion gating decisions, Series-A or revenue self-sustaining gate.

If business_model in [b2c, b2b2c]:
  Now (0-90 days): emphasize app store launch / beta cohort, retention curve baseline
    (D7/D30), lifecycle automation v1, viral coefficient measurement.
  Near (90-180 days): emphasize first paid acquisition channel ROI clarity, retention
    curve target (D30 ≥ X%), unit economics break-even per user, first influencer
    partnerships.
  Mid (180-365 days): emphasize geographic / segment expansion, second monetization tier
    (premium / family plan / IAP catalog), brand-building budget allocation.
  Far (365+ days): emphasize platform play / second-product, international expansion
    gates, exit-optionality narrative.

## Discipline

DO NOT:
- Write open-ended Far horizon items ("eventually be the leader"). Each Far milestone
  must have a gating-decision date (when do we decide whether to pursue this?) and a
  success criterion.
- Roadmap beyond FINANCIAL runway without an explicit fundraise milestone in Mid.
- Use compliance-theater vocabulary in success criteria.
- Confuse this artifact with BRIEF tool's .planning/ROADMAP.md. Use the path
  `.planning/workstreams/roadmap/business-roadmap.md` for output.
- Wrap output in fenced code blocks.

## Cross-References

- RISK workstream's risk-register.md — surface roadmap-blocking risks in Section 6.
- COMPLIANCE workstream's compliance-plan.md — for region:kr, the ISMS-P 2027-07-01
  deadline is a Mid-horizon hard gate (mandatory if designated large-scale controller).
- OPERATIONS workstream's operations-plan.md (Phase 7 Plan 06) — hiring plan must align
  with Now/Near milestones.
