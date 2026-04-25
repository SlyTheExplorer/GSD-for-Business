# Financial Model — Design Prompts (Driver-Based Bottom-Up)

You produce a 12-month bottom-up financial projection for `{{project_name}}` using the
founder-supplied drivers in `drivers.md`. The math is **purely arithmetic** — you do
NOT invent any input value.

`[CITED:cfotechstack.ai/startup-financial-modeling|driver-based bottom-up wins for investor models|2026-04-25]`,
`[CITED:bussinology.com/startups/financial-model-startup-sensitivity-analysis|bear/base/bull scenario discipline|2026-04-25]`,
`[CITED:inflectioncfo.co/blog/startup-financial-model-sensitivity|key drivers CAC/churn/burn dominate outcomes|2026-04-25]`

## Inputs

You receive:
- `.planning/workstreams/financial/drivers.md` — founder-supplied via the /brief-design
  FINANCIAL 12-driver Q&A (handled by `brief/workflows/design.md` Step 4.5). Every
  driver carries `[VERIFIED:user-supplied]` (when answered) or `[FOUNDER-INPUT]`
  (when user said unknown) provenance per Phase 5 CC-04 inheritance.
- `.planning/OBJECTIVES.md` — immutable intent + mutable hypotheses (monetization,
  pricing_hypothesis).
- DISCOVER outputs at `.planning/discover/*.md` — `pricing-benchmarks.md`,
  `customer-research.md`, `competitor-landscape.md` for sanity checks (not as
  driver source).
- `.planning/workstreams/business-model-canvas/canvas.md` — Revenue Streams + Cost
  Structure blocks contextualize the drivers.
- `.planning/workstreams/go-to-market/gtm-plan.md` — sales motion + KPIs influence
  the customer-acquisition assumptions.
- `state.brief.business_model` and `state.brief.region` — context-injected.

## Output

Populate `templates/artifact.md`. The artifact has 6 sections: Driver Inputs (lifted
from `drivers.md`), Unit Economics (LLM-derived arithmetic), 12-Month Bottom-Up
Projection (3 scenarios), Cash Runway & Burn (LLM-derived), Sensitivity Analysis
(top 3-5 highest-variance drivers), and Provenance Audit.

## Discipline (CRITICAL — Pitfall #6 mitigation)

**Drivers come from the user, not your imagination.** Every projection cell carries:
- `[VERIFIED:user-supplied]` — direct driver use (no multiplier applied)
- `[ASSUMED:multiplier-0.7]` — bear scenario, multiplier × 0.7 applied to driver
- `[ASSUMED:multiplier-1.0]` — base scenario, multiplier × 1.0 applied to driver
- `[ASSUMED:multiplier-1.3]` — bull scenario, multiplier × 1.3 applied to driver

If a driver is missing from drivers.md, emit `[FOUNDER-INPUT placeholder — fill before
investor share]` in the cell. **DO NOT invent a value.** The Phase 5 CC-04 pre-commit
hook BLOCKs untagged quantitative cells (defense in depth — should not happen by
construction).

## Step 1: Compute unit economics from drivers (arithmetic only)

```
LTV (lifetime value)        = arpu_year1 × customer_lifetime_months × target_gross_margin_pct
CAC (acquisition cost)      = cac driver
LTV:CAC ratio               = LTV / CAC
Contribution margin         = (arpu_year1 - variable_cost_per_customer) / arpu_year1
CAC payback (months)        = CAC / (arpu_year1 × target_gross_margin_pct)
```

Tag every output cell `[VERIFIED:user-supplied]` (computed from direct driver values
without multiplier).

## Step 2: Build 12-month base projection

Month-by-month arithmetic (each month's row carries the driver values that flowed in):

```
Revenue (month-i)        = arpu_year1 × cumulative_customers (month-i) × seasonality_factor[i]
COGS (month-i)           = (1 - target_gross_margin_pct) × Revenue (month-i)
Variable cost (month-i)  = variable_cost_per_customer × cumulative_customers (month-i)
Fixed cost (month-i)     = fixed_monthly_cost + headcount_cost_at_month_i  (parsed from hiring_plan)
Burn (month-i)           = Fixed + Variable + COGS - Revenue
Cash (month-i)           = Cash (month-(i-1)) - Burn (month-i)
                           starting at Cash (month-0) = starting_cash
Runway (months)          = months_until_cash_balance <= 0
Break-even month         = first month where Revenue >= Fixed + Variable + COGS
```

Every cell tagged `[VERIFIED:user-supplied]` (direct driver use, no multiplier).

## Step 3: Build bear scenario (×0.7) and bull scenario (×1.3) — with COSTS inversion

**Sensitivity bands (D-15 verbatim):**
- **Bear:** every revenue / customer-side driver × 0.7 (more pessimistic on revenue,
  retention, etc.). **Exception: COSTS multiply by 1.3 in bear** (costs go UP in bear
  — this inversion makes the scenario semantically meaningful; without it, "bear"
  becomes a math noop because the burn ratio collapses to ~base).
- **Base:** every driver × 1.0.
- **Bull:** every revenue / customer-side driver × 1.3. **Exception: COSTS multiply by
  0.7 in bull** (costs go DOWN in bull — symmetric inversion to bear).

Tag every cell:
- Direct driver use → `[VERIFIED:user-supplied]`
- Multiplier-applied → `[ASSUMED:multiplier-0.7]` (bear), `[ASSUMED:multiplier-1.0]`
  (base), or `[ASSUMED:multiplier-1.3]` (bull)
- Cost cells in bear scenario → `[ASSUMED:multiplier-1.3]` (inverted)
- Cost cells in bull scenario → `[ASSUMED:multiplier-0.7]` (inverted)

## Step 4: Identify top 3-5 highest-variance drivers

Compute the variance contribution of each driver across bear/base/bull. Surface the
top 3-5 drivers in Section 5 — these are the levers the founder should focus on.
Typical winners: CAC, churn (1/customer_lifetime_months), ARPU, fixed_monthly_cost.
`[CITED:inflectioncfo.co/blog/startup-financial-model-sensitivity|key drivers CAC/churn/burn dominate outcomes|2026-04-25]`

## Step 5: Provenance audit (Section 6 of artifact)

Render a table that traces every projection cell to either `[VERIFIED:user-supplied]`
or `[ASSUMED:multiplier-X.X]`. The pre-commit hook validates this — if any cell is
untagged, the commit is BLOCKed.

## B2B / B2C Conditional Lens

If business_model in [b2b, enterprise]:
  Drivers emphasize: ACV (annual contract value, not ARPU), sales-cycle length,
    win-rate, expansion-rate / NRR, payment terms (net-30 typical for B2B).
  Unit economics emphasize deal-level economics, pipeline coverage, sales velocity.
  CAC payback period is critical — investors want < 18 months for B2B SaaS.

If business_model in [b2c, b2b2c]:
  Drivers emphasize: ARPU (per-user revenue), retention cohorts (D1/D7/D30/D90 → churn
    curve → customer_lifetime_months), viral coefficient (k-factor), CAC payback
    period (per-user basis).
  Unit economics emphasize cohort-level economics, retention-curve LTV (vs. flat
    ARPU × lifetime), payback period in months.
  Seasonality matters more in B2C (Q4 retail spike, summer slowdown for some
    categories).

## Korean Variant (region: kr)

When `state.brief.region == "kr"`, render section headers and body text in Korean:
- 1. 드라이버 입력 (Driver Inputs — 창업자 제공)
- 2. 단위 경제 (Unit Economics — LLM 산출, 산술만)
- 3. 12개월 바텀업 프로젝션 (3 시나리오)
- 4. 캐시 런웨이 및 번 (Cash Runway & Burn)
- 5. 민감도 분석 (Sensitivity Analysis — 상위 3-5 드라이버)
- 6. 프로버넌스 감사 (Provenance Audit)

Korean financial discipline notes:
- 보고 통화 (reporting currency) — KRW 기본; 글로벌 투자자 미팅용으로 USD 병기 권장.
- 매출 인식 (revenue recognition) — 한국 K-IFRS / 일반 SaaS pro-rata 인식.
- 부가가치세 (VAT) — 한국 부가세 10% 별도 표기. 매출 산정 시 VAT 제외 정책 명시.
- 투자자 — 한국 시리즈 A 투자자는 LTV:CAC > 3 + 18개월 페이백 + monthly burn detail
  요구. 글로벌 시리즈 A 기준과 유사하나 국내 시장 사이즈 고려한 보수적 가정 선호.

## Discipline (verbatim DO NOT list)

DO NOT:
- **Invent driver values** the user did not supply. If a driver is missing, emit
  `[FOUNDER-INPUT placeholder — fill before investor share]` in the cell. The
  drivers.md table is the SOLE source of input numbers.
- **Apply top-down "we'll capture X% of the market" math.** This workstream is
  **bottom-up by contract** (DSG-03 + Pitfall #6 mitigation). Reject any market-share
  framing the user provides; redirect to drivers.
- **Introduce assumptions beyond the documented multipliers** (0.7 / 1.0 / 1.3).
  No "moderate growth assumption", "steady-state churn", "industry-average CAC", etc.
  Every cell traces to a driver × multiplier.
- Use **false precision** (e.g., $1,247,392 when the driver is $1.2M ± $0.4M). Round
  to driver precision; document precision band in the cell.
- Use compliance-theater vocabulary in any audit / disclaimer section.
- Wrap output in fenced code blocks. The output IS the artifact, not a code sample.

## Cross-workstream awareness

- **Hiring plan ↔ runway:** the OPERATIONS workstream's Section 1 (Org & Hiring)
  reads this artifact's runway. If runway is < 18 months and the OPERATIONS plan
  proposes aggressive hiring, surface that conflict explicitly.
- **GTM motion ↔ CAC:** if GTM is sales-led with high-touch enterprise motion, the
  CAC driver should reflect that (typical $5K-$50K CAC). If GTM is PLG / freemium
  consumer, CAC reflects paid-acquisition CPM (typically $1-$50). The drivers.md
  table does not enforce this consistency — surface it as a finding if the gap is
  large.
- **Compliance reserve:** if `compliance_packs` includes PIPA / ISMS-P, set aside a
  reserve in the cost model for ISMS-P pre-audit (typical ₩50M-₩300M depending on
  scope) and note the 2027-07-01 deadline reservation.
