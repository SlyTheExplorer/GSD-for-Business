---
audience: internal
audience.type: internal
audience.confidentiality: internal
business_context.model: enterprise
business_context.region: us
business_context.industry: saas
business_context.compliance_packs: []
voice.tone: direct
voice.perspective: founder
project: AcmeIQ (B2B canary fixture)
---

# OBJECTIVES — AcmeIQ (B2B Enterprise SaaS Canary Fixture)

> This fixture is used by Plan 02 false-positive prevention test (CEO-personal-liability
> only fires for region: kr OR consumer-data flags, not for non-Korea B2B SaaS).
> compliance_packs is empty by design — exercises the "no Korea + no consumer data"
> path through the COMPLIANCE checker.

## Immutable Intent

Enterprise infrastructure SaaS for engineering team productivity analytics. Self-hosted
+ cloud options. Helps engineering leaders see where their team's time goes (deploy
frequency, incident response, code review velocity, on-call load) and surface the
specific bottlenecks worth fixing.

## Mutable Hypotheses

### target_audience

Engineering leaders at companies with 200-2000 engineers. Ideal customer profile: B2B
SaaS / B2C marketplaces with high-velocity engineering teams. Buyer persona: VP
Engineering, Director of Engineering, CTO at venture-backed scaleups.

### value_proposition_hypothesis

Engineering leaders today rely on gut feel + Jira reports + a hodgepodge of platform
metrics. AcmeIQ unifies these into one productivity-analytics layer with concrete
"this is where the bottleneck is" recommendations.

### monetization

Annual contract value $50K-$500K. Per-developer pricing tiers. Multi-year contracts
standard. Land-and-expand from a single team to org-wide rollout.

### gtm_motion

Sales-led with PLG entry point. ABM + outbound for ICP accounts. Free tier for teams
< 25 engineers (signal generation); paid tier kicks in at 25+ engineers / required SSO.

### pricing_hypothesis

$50/engineer/month base; volume discount kicks in at 250+ seats; multi-year discount
of 10-15%; enterprise tier with SSO + audit + dedicated CSM at $80/engineer/month.

### tech_stack_preference

Cloud + self-hosted dual deploy. Backend Go; frontend React; data layer PostgreSQL +
ClickHouse for analytics; Kafka for event ingestion. Deployable to AWS / GCP / Azure
+ on-prem Kubernetes.

### integration_surfaces

GitHub / GitLab / Bitbucket; Jira / Linear; PagerDuty / Opsgenie; Slack / Teams;
Okta / Azure AD / Auth0 for SSO; Splunk / Datadog for audit log export.

### team_shape

12 today: 6 engineers, 1 designer, 2 GTM (founder-led sales + 1 AE), 1 CSM, 1 ops, 1
data analyst. 12-month plan: +4 engineers, +1 SE (sales engineering), +2 AE/SDR pair,
+1 CSM.

### infrastructure_assumptions

99.9% uptime SLA on cloud tier; AWS us-east-1 + us-west-2 multi-region day 1; EU
region added at first EU customer; SOC 2 Type II audit underway (NOT compliant yet);
no PII in event ingestion (engineering metadata only).

### regulatory_packs

(empty — no Korea operations; no consumer data; no healthcare; no financial services
direct customers). SOC 2 Type II underway as a market expectation, not a regulatory
trigger.

### jurisdiction

Delaware C-Corp; principal place of business San Francisco; no overseas subsidiary in
year 1.

### key_competitors

- LinearB — Engineering productivity analytics; well-funded competitor.
- Jellyfish — Engineering metrics platform; enterprise-focused.
- Swarmia — Pull-request-centric metrics; smaller but strong product.

### key_risks

- **Category education:** Engineering leaders may resist measurement cultures; signal
  vs noise messaging is critical.
- **Privacy concerns from individual contributors:** Even though no PII is ingested,
  team-level metrics can feel surveillance-adjacent. Brand voice needs to address this.
- **Build-vs-buy decision pressure:** Some scaleups already have homegrown dashboards;
  switching cost is real.
