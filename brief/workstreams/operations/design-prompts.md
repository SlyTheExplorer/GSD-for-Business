# Operations — Design Prompts

You produce an Operations plan for `{{project_name}}`. The artifact covers 5 sections:
Org & Hiring, Process & SOP catalogue, Tool Stack, Cadence (operating rhythm), and
Decision Rights & Escalation.
`[CITED:wiserbrand.com/tech-startup-team-structure|2026 startup team structure|2026-04-25]`,
`[CITED:fi.co/insight/the-perfect-startup-ops-tech-stack-tips-from-a-4x-founder|tool selection framework|2026-04-25]`

## Inputs

You read:
- `.planning/OBJECTIVES.md` — immutable intent + mutable hypotheses (team_shape,
  infrastructure_assumptions, monetization, GTM motion).
- DISCOVER outputs at `.planning/discover/*.md` — `customer-research.md`,
  `competitor-landscape.md`, and any `hiring-and-team-structure.md` if surfaced.
- `.planning/workstreams/business-model-canvas/canvas.md` — Key Activities + Key
  Resources sections feed Section 1 (Org & Hiring) and Section 2 (Process & SOP).
- `.planning/workstreams/go-to-market/gtm-plan.md` — Sales motion + customer success
  shape feeds Section 1 (B2B sales/CS roles) and Section 2 (sales pipeline + onboarding
  SOPs).
- `.planning/workstreams/financial/drivers.md` and `.planning/workstreams/financial/financial-model.md`
  if FINANCIAL ran first — the hiring_plan driver + runway constraint feed Section 1
  hiring sequencing. Cross-workstream awareness: hiring sequencing must align with
  FINANCIAL runway (do NOT propose hires the runway can't sustain).
- `state.brief.business_model` (`b2b` / `b2c` / `b2b2c` / `enterprise`) and
  `state.brief.region` — context-injected.

## Output

Populate `templates/artifact.md`. Every claim cites OBJECTIVES.md, a DISCOVER output,
or a sibling workstream artifact with `[VERIFIED:source|date]`. Unsourced placeholder
values use `[FOUNDER-INPUT placeholder — fill before sharing]` rather than invented
numbers.

## B2B / B2C Conditional Lens

If business_model in [b2b, enterprise]:
  Section 1 (Org & Hiring) emphasizes sales + customer success roles: SDR/BDR ratio
    to AE, AE-to-CSM ratio (typical 1:1 or 1:2 by ACV band), Sales Engineering for
    high-ACV pursuits, Customer Success Manager dedicated to top accounts. Headcount
    sequencing typically: founder-led sales → first AE hire (after repeatable wins) →
    SDR + AE pair → CSM as renewals start landing.
  Section 2 (Process & SOP catalogue) emphasizes sales pipeline management (stages,
    forecast cadence, deal review), customer onboarding (kickoff → enablement →
    success-plan → QBR cadence), tier-1/tier-2 support, security questionnaire
    response process, RFP response workflow, and renewal motion.
  Section 3 (Tool Stack) emphasizes CRM (HubSpot / Salesforce / Attio — pick one),
    sales engagement (Outreach / Salesloft / Apollo), customer success platform
    (Gainsight / Vitally / ChurnZero), security questionnaire automation
    (Vanta / Drata / SafeBase).
  Section 4 (Cadence) emphasizes weekly pipeline review, monthly forecast, QBR with
    top accounts, monthly board / investor update.
  Section 5 (Decision Rights & Escalation) emphasizes who approves discounts, who
    closes deals above ACV thresholds, who handles security incidents, who handles
    customer escalations.

If business_model in [b2c, b2b2c]:
  Section 1 (Org & Hiring) emphasizes product + marketing + community roles:
    product manager, growth marketer, content / social manager, community manager,
    user-research / data analyst. For B2B2C, layer in a small business-side sales
    team alongside the consumer-side product/growth org. App-economy companies
    typically need an ASO/SEO specialist early.
  Section 2 (Process & SOP catalogue) emphasizes growth experimentation cycle
    (hypothesis → A/B test → ship/kill), content publishing pipeline, community
    moderation, app store release management, customer support tier-1/2 (often
    chat-first with macros), incident response.
  Section 3 (Tool Stack) emphasizes analytics (Mixpanel / Amplitude — pick one),
    A/B testing (Statsig / GrowthBook / Optimizely), customer support (Intercom /
    Zendesk / HelpScout), community (Discord / Circle / Reddit ops),
    app store optimization (AppsFlyer / Adjust / Branch for attribution).
  Section 4 (Cadence) emphasizes weekly growth review, monthly retention deep-dive,
    daily engineering stand-up, weekly app store / community check-in.
  Section 5 (Decision Rights & Escalation) emphasizes who ships features, who
    handles content/PR escalations, who handles app store rejections or platform
    policy changes, who handles privacy / data subject requests.

## Cross-workstream awareness

- **FINANCIAL runway alignment (CRITICAL):** Section 1 hiring plan MUST align with
  FINANCIAL runway. If FINANCIAL has run, read `drivers.md` `hiring_plan` driver +
  starting_cash + fixed_monthly_cost; do NOT propose a 12-month hiring sequence the
  runway can't sustain. If FINANCIAL has NOT run, mark hiring sequencing as
  `[FOUNDER-INPUT placeholder — runway dependency; revisit after FINANCIAL]`.
- **GTM motion alignment:** Section 2 process catalogue must include the sales /
  marketing process implied by the GTM motion (sales-led / marketing-led / PLG /
  partner-led). If GTM has not run, mark process detail as
  `[FOUNDER-INPUT placeholder — GTM motion dependency]`.
- **Tool stack discipline:** Section 3 picks ONE tool per category — do NOT propose
  parallel evaluation matrices unless the user explicitly asks. The fi.co 4x-founder
  rule: minimum tools that don't compound learning overhead.

## Korean Variant (region: kr)

When `state.brief.region == "kr"`, write all section headers in Korean and produce
body content in Korean:
- 1. 조직 및 채용 (Org & Hiring)
- 2. 프로세스 및 SOP 카탈로그 (Process & SOP Catalogue)
- 3. 툴 스택 (Tool Stack)
- 4. 운영 케이던스 (Cadence)
- 5. 의사결정 권한 및 에스컬레이션 (Decision Rights & Escalation)

Korean-specific operational notes:
- 채용 — 한국 시장 일반적인 채용 채널: 원티드 / 잡코리아 / 사람인 / LinkedIn / 직접 추천.
  C-level / Senior 직군은 헤드헌터 (이엔파트너스 / 커리어케어 등) 활용 일반적.
- 의사결정 — 결재 라인 (approval chain) 명확화. 중요 결정(채용, 지출, 외부 발표)은
  대표 / CFO / 법무 결재 필수 항목 구분.
- 인사 — 4대 보험, 연차, 퇴직금 정산 등 한국 노동법 준수. 급여 처리는 페이롤 솔루션
  (대상 / 슈프림 / Rippling 한국 지원 등).

## Discipline

DO NOT:
- Invent headcount numbers, salary ranges, or tool subscription costs the user did not
  supply and DISCOVER did not surface. Use `[FOUNDER-INPUT placeholder]` instead.
- Propose hiring plans that exceed FINANCIAL runway (cross-workstream constraint).
- List 5 tools per category — pick ONE per category (lean discipline). Document
  alternatives only if the user explicitly asks.
- Use compliance-theater vocabulary in audit / SOP descriptions.
- Wrap output in fenced code blocks. The output IS the artifact, not a code sample.
