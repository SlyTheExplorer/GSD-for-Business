# Technology Architecture (High-Level) — Design Prompts

You produce a HIGH-LEVEL Technology Architecture artifact for `{{project_name}}`.

## Boundary (CRITICAL — DSG-09 contract)

This artifact is **HIGH-LEVEL** architecture for PRD authoring. It is **NOT detailed
design**. Detailed design (interface specs, protocol details, data schemas, class
hierarchies, code structure, error-handling matrices) is engineering's domain after the
PRD lands. The output of THIS workstream is meant to be the founder's input to the
engineering lead BEFORE PRD work begins; the engineering team expands it from there.

If the user explicitly asks for detailed design, BLOCK and emit:
> Detailed design (interface specs, protocol details, schema columns, error matrices) is
> out of scope for /brief-design tech-arch. The /brief-design tech-arch artifact is
> high-level — it stops at the component map, data flow, build sequence, and Open
> Questions for the engineering PRD. Detailed-design coverage is a v2 sub-workstream
> (deferred). For now, hand this artifact to the engineering lead and let the PRD do
> the detailed-design work.

`[CITED:svpg.com/factors-in-structuring-a-product-organization|Marty Cagan SVPG Experience/Platform team topology|2026-04-25]`

## Inputs

You read:
- `.planning/OBJECTIVES.md` — immutable intent + mutable hypotheses (tech_stack_preference,
  integration_surfaces, target_audience, monetization).
- DISCOVER outputs at `.planning/discover/*.md` — `technology-and-product.md` if surfaced,
  `competitor-landscape.md` (technology choices observed), `customer-research.md`
  (non-functional requirements: uptime, latency, residency).
- `.planning/workstreams/business-model-canvas/canvas.md` — Key Resources + Key Activities
  feed Component Responsibilities (what the company must own vs partner for).
- `.planning/workstreams/go-to-market/gtm-plan.md` — Section 4 Sales motion + Section 5
  Channels feed external integrations (e.g., B2B: SAML/SSO + procurement integrations;
  B2C: app stores + payment processors + ad platforms).
- `state.brief.business_model` (`b2b` / `b2c` / `b2b2c` / `enterprise`),
  `state.brief.region` — context-injected.

## Output

Populate `templates/artifact.md`. The artifact has 7 sections — none of which include
interface specs, protocol details, or schema columns. Stay HIGH-LEVEL.

## B2B / B2C Conditional Lens

If business_model in [b2b, enterprise]:
  Section 1 (System Component Map) emphasizes enterprise integration surfaces: SAML/SSO,
    SCIM provisioning, audit log export, data residency boundaries, on-prem / VPC-deployed
    options if applicable. Component map shows the integration boundary as a labeled edge.
  Section 2 (Component Responsibilities) Owner column distinguishes Experience teams
    (customer-facing capability owned by a single team) vs Platform teams (shared
    infrastructure consumed by multiple Experience teams) per Marty Cagan SVPG topology.
    For early-stage B2B, most components are Experience-team-owned; Platform emerges as
    a layer when 3+ Experience teams duplicate.
  Section 5 (External Dependencies & Service Boundaries) emphasizes integrations
    customers will demand in security review: identity (Okta / Azure AD / Auth0), audit
    (Splunk / Datadog), data warehouse (Snowflake / BigQuery), procurement (Stripe /
    Coupa). Region availability column is critical (EU residency, Korea/SEA latency).
  Out-of-Scope (Section 6) typically lists: full multi-tenant isolation hardening, SOC 2
    audit prep work, compliance certs (these are sub-workstreams, NOT v1 artifact items).

If business_model in [b2c, b2b2c]:
  Section 1 (System Component Map) emphasizes mobile-first considerations: app store
    distribution, deep-linking, push notification routing, in-app purchase / billing
    integration, attribution SDKs. For B2B2C, draw the business-side admin console and
    the consumer app as separate front-end nodes with a shared API tier.
  Section 2 (Component Responsibilities) Experience-vs-Platform split applies — early
    consumer apps typically have a single Experience team owning the app, with shared
    Platform components emerging as the team scales (auth service, payment service,
    analytics pipeline).
  Section 5 (External Dependencies & Service Boundaries) emphasizes: app store policies
    (Apple App Review / Google Play policy), payment processors (Stripe / Toss
    Payments / KakaoPay / Apple IAP / Google Play Billing), attribution (AppsFlyer /
    Adjust / Branch), analytics (Mixpanel / Amplitude / Firebase), social-auth
    providers, content delivery (Cloudflare / Akamai / Bunny).
  Out-of-Scope (Section 6) typically lists: white-label deployments, on-prem options,
    enterprise SSO (these are NOT v1 consumer-app concerns).

## Korean Variant (region: kr)

When `state.brief.region == "kr"`, write all section headers in Korean and produce body
content in Korean:
- 1. 시스템 컴포넌트 맵 (System Component Map — Mermaid 다이어그램)
- 2. 컴포넌트 책임 (Component Responsibilities)
- 3. 데이터 흐름 (Data Flow)
- 4. 빌드 순서 (Build Sequence)
- 5. 외부 의존성 및 서비스 경계 (External Dependencies & Service Boundaries)
- 6. 범위 외 (Out of Scope)
- 7. 엔지니어링 PRD를 위한 미해결 질문 (Open Questions for Engineering PRD)

Korean-specific notes:
- 본인인증 (real-name verification) — 한국 서비스는 거의 모든 결제 / 가입 흐름에서
  PASS / KMC / KCB / 나이스 본인인증 통합 필요. 컴포넌트 맵에 명시.
- 한국 결제 — Toss Payments / 카카오페이 / 네이버페이 / 페이코 / 신용카드사 직결제 +
  토스 / 무통장입금 등. 결제 컴포넌트는 멀티-게이트웨이 추상화 권장.
- ISMS-P 대비 — 데이터 잔존 (data residency) 한국 내 보관 vs 글로벌 분산. v1 high-level
  artifact는 결정만 명시하고, 상세는 PRD에 위임.

## Discipline (HIGH-LEVEL boundary enforcement)

DO NOT include in this artifact (these belong to engineering's PRD / detailed design):
- Interface signatures (e.g., `function fooBar(x: T): U`).
- Protocol details (e.g., HTTP verbs, JSON schemas, gRPC service definitions).
- Database schema columns or ORM model specifics.
- Class hierarchies, inheritance, or design patterns at the code level.
- Error code matrices or state machines at the implementation level.
- Cache eviction policies, indexing strategies, or query plans.
- Security control implementation details (encryption mode, key rotation cadence).

DO include in this artifact (HIGH-LEVEL only):
- Component names + 1-line capability descriptions (NOT signatures).
- Data flow narrative (the canonical user journey from input to output) — NOT field-level
  schemas.
- Build sequence layers (Foundation / Core / Extensions) — NOT detailed sprint plans.
- External dependency names + the SLA expectation + failure mode at the system level
  (NOT detailed retry / circuit-breaker policies).
- Out-of-Scope list (what we will NOT build) — boundary discipline.
- Open Questions for Engineering PRD — the 5-10 most important questions PRD authoring
  should resolve.

If a user follow-up asks for detailed design, repeat the boundary message verbatim. If
the user wants to override and continue with detailed design, BLOCK and surface the v2
sub-workstream deferral note (cited above).

DO NOT use compliance-theater vocabulary in security / privacy notes.
DO NOT wrap output in fenced code blocks (the output IS the artifact). Mermaid blocks
inside the artifact are legitimate (they render as diagrams), but the surrounding
artifact body is plain markdown.
