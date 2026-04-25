<purpose>
Sub-workflow invoked from `brief/workflows/design.md` Step 4.5 when WORKSTREAM_SLUG ===
'financial'. Runs the canonical 12-question driver Q&A (Phase 7 D-15 lock), renders
the founder's answers into `.planning/workstreams/financial/drivers.md`, and primes
Step 5's Task spawn with a `<financial_drivers>` injection.

Discipline (Pitfall #6 mitigation): drivers come from the user, NOT LLM imagination.
Every driver carries `[VERIFIED:user-supplied]` (when answered) or `[FOUNDER-INPUT]`
(when the user said unknown) provenance per Phase 5 CC-04 inheritance. The downstream
Task spawn (in design.md Step 5) reads this drivers.md verbatim and produces the
12-month bear/base/bull projection — never inventing values.

Korean default voice when state.brief.region == 'kr'; English fallback. TEXT_MODE
(Codex / Gemini / OpenCode without AskUserQuestion) batches all 12 questions into ONE
consolidated numbered-list prompt; the parser splits the user's response on blank
lines OR semicolons and validates exactly 12 entries (FND-06 latency mitigation per
07-RESEARCH lines 912-914).
</purpose>

<process>

## Step 4.5.A: Pre-flight

1. Read `brief/workstreams/financial/templates/drivers.md` to load the 12-driver schema
   (5 sections: Revenue 3 / Customer 2 / Cost 3 / Capital 2 / Time 2).
2. Detect TEXT_MODE: if `--text` is in $ARGUMENTS OR `workflow.text_mode` from init JSON
   is true, set TEXT_MODE=true; otherwise TEXT_MODE=false. (Same detection rule as
   `align-gate.md` / `discover.md` Step 0.)
3. If `state.brief.financial_drivers` already points to an existing
   `.planning/workstreams/financial/drivers.md`, the user is RE-RUNNING /brief-design
   financial after a prior gate failure — skip the Q&A and reuse the existing
   drivers.md (no re-asking) unless the user invoked `/brief-define --amend`. In the
   amend case, treat as fresh Q&A (re-ask all 12).

## Step 4.5.B: 12-Question Driver Interview

The 12 canonical questions cover all 5 driver categories. Korean prompts are default
when state.brief.region == 'kr'; English otherwise. In interactive mode, run 12
sequential AskUserQuestion calls; in TEXT_MODE, batch via Step 4.5.E (below).

### Q1 [Revenue 1/3] — revenue_unit_anchor

- Korean: "단위 경제의 기준은 무엇인가요? — 고객당 / 거래당 / 세션당 (B2B 일반: per
  customer / B2C 일반: per session/transaction)"
- English: "What is your unit-economics anchor — revenue per customer, per
  transaction, or per session? (B2B typical: per customer / B2C typical: per
  session/transaction)"
- Driver name: `revenue_unit_anchor` (enum: customer | transaction | session)

### Q2 [Revenue 2/3] — arpu_year1

- Korean: "1년차 ARPU (고객당 평균 매출) 추정치를 (보고 통화로) 알려주세요. 범위면
  최저/최고 둘 다 답변해 주세요."
- English: "Estimated ARPU (average revenue per user/customer) for year 1 in your
  reporting currency? If a range, give both the low and high estimate."
- Driver name: `arpu_year1` (number, currency-tagged)

### Q3 [Revenue 3/3] — cac

- Korean: "고객 획득 비용(CAC)을 알려주세요. 모르시면 [FOUNDER-INPUT] 으로 표시됩니다."
- English: "Customer Acquisition Cost (CAC)? If unknown, this driver will be tagged
  [FOUNDER-INPUT] placeholder for the founder to fill before sharing externally."
- Driver name: `cac` (number, currency-tagged OR [FOUNDER-INPUT])

### Q4 [Customer 1/2] — customer_lifetime_months

- Korean: "고객 평균 라이프타임(개월 단위, 1/churn). B2B SaaS 일반: 24-60개월;
  B2C 앱 일반: 3-12개월."
- English: "Customer lifetime in months (1/churn). For B2B SaaS, typically 24-60
  months. For B2C consumer apps, typically 3-12 months. Your estimate?"
- Driver name: `customer_lifetime_months` (number)

### Q5 [Customer 2/2] — initial_customer_count

- Korean: "출시 시점의 초기 고객/사용자 수 추정치?"
- English: "Initial number of customers (or active users) at launch — best estimate?"
- Driver name: `initial_customer_count` (number)

### Q6 [Cost 1/3] — fixed_monthly_cost

- Korean: "월간 고정비 (인건비+복리후생+툴+인프라+사무실 등)는 보고 통화 기준으로
  얼마인가요?"
- English: "Fixed monthly costs (team salary + benefits, tools, infrastructure, rent
  if any) — in reporting currency?"
- Driver name: `fixed_monthly_cost` (number, currency-tagged)

### Q7 [Cost 2/3] — variable_cost_per_customer

- Korean: "고객/거래당 변동비 (예: 결제 수수료, 호스팅 분담)는?"
- English: "Variable cost per customer/transaction (e.g., payment processing fees,
  fulfillment, hosting allocated per user) — in reporting currency?"
- Driver name: `variable_cost_per_customer` (number, currency-tagged)

### Q8 [Cost 3/3] — hiring_plan

- Korean: "초기 인원수 + 12개월 채용 계획? (예: 'Start: 4 engineers, 1 designer,
  2 ops. Add 2 sales/CS by month 6, 2 more engineers by month 12.')"
- English: "Initial team headcount and 12-month hiring plan? (e.g., 'Start: 4
  engineers, 1 designer, 2 ops. Add 2 sales/CS by month 6, 2 more engineers by month
  12.')"
- Driver name: `hiring_plan` (free-text — LLM parses into headcount-by-month later)

### Q9 [Capital 1/2] — starting_cash

- Korean: "이 12개월 projection 시작 시 보유 현금/예상 펀딩 금액 (보고 통화)?"
- English: "Cash on hand or expected funding amount before this 12-month projection
  starts — in reporting currency?"
- Driver name: `starting_cash` (number, currency-tagged)

### Q10 [Capital 2/2] — target_gross_margin_pct

- Korean: "목표 gross margin %? (Revenue minus COGS, % of revenue. SaaS 일반: 70-90%;
  hardware/services: 30-50%.)"
- English: "Target gross margin %? (Revenue minus COGS, as % of revenue. SaaS
  typical: 70-90%; hardware/services: 30-50%.)"
- Driver name: `target_gross_margin_pct` (number, %)

### Q11 [Time 1/2] — payment_terms

- Korean: "결제 조건 — net-30 (B2B 계약) / 즉시 (B2C 카드) / 월 구독 (SaaS) / 기타?"
- English: "Payment terms — net-30 (B2B contract), immediate (B2C card-on-file),
  monthly subscription (SaaS), other?"
- Driver name: `payment_terms` (enum: net30 | immediate | subscription | other)

### Q12 [Time 2/2] — seasonality + reporting_currency

- Korean: "계절성 — 12개월 균일 (1.0)이거나, 월별 factor 지정 (예: 'Q4 retail spike
  1.3x; summer slowdown 0.8x'). 또한 보고 통화는?"
- English: "Seasonality factor — uniform 1.0 across months, or specify monthly
  factors? (e.g., 'Q4 retail spike 1.3x; summer slowdown 0.8x'.) Currency of
  reporting?"
- Driver names: `seasonality` (free-text or array of 12 factors) AND
  `reporting_currency` (string — KRW / USD / EUR / etc.)

### Question wording discipline (Pitfall #9 mitigation)

- No developer jargon (`schema`, `frontmatter`, `JSON`, `YAML`, `dispatcher`,
  `subagent`).
- Each question explains the parameter in plain language + gives a typical-range
  example.
- "Don't know" path: every question accepts `[FOUNDER-INPUT] placeholder` — the user
  can fill the value later before sharing externally.

## Step 4.5.C: Persist drivers.md

1. Render the 12 answers into `brief/workstreams/financial/templates/drivers.md`
   schema (substitute `{{Q1}}` through `{{Q12}}` with the user's answers; preserve
   the `[VERIFIED:user-supplied]` provenance in each row except where the user
   said unknown — those rows carry `[FOUNDER-INPUT]`).
2. Write the rendered output to `.planning/workstreams/financial/drivers.md` via:

   ```
   node brief/bin/brief-tools.cjs commit --files .planning/workstreams/financial/drivers.md
   ```

3. Set state via:

   ```
   node brief/bin/brief-tools.cjs state set --path brief.financial_drivers \
     --value '.planning/workstreams/financial/drivers.md'
   ```

   The `brief.financial_drivers` allowlist extension lands in Plan 07-07 Wave 4
   (CROSS-PLAN DEPENDENCY); end-to-end exercise is via Plan 07-08 canary.

## Step 4.5.D: Hand off to Step 5 design Task spawn

Step 5's Task spawn receives the just-written drivers.md verbatim as part of a
`<financial_drivers>...</financial_drivers>` injection block alongside the existing
`<business_context>...</business_context>` block. The combined injection looks like:

```
<business_context>...</business_context>
<financial_drivers>
{{contents of .planning/workstreams/financial/drivers.md verbatim}}
</financial_drivers>
```

The LLM receives both blocks in its prompt and produces a 12-month bear/base/bull
projection per the design-prompts.md arithmetic. Every projection cell carries
`[VERIFIED:user-supplied]` (direct driver use) or
`[ASSUMED:multiplier-0.7]` / `[ASSUMED:multiplier-1.0]` / `[ASSUMED:multiplier-1.3]`
(sensitivity-multiplier-applied — costs invert in bear/bull per design-prompts.md).

The Phase 5 CC-04 pre-commit hook BLOCKs untagged quantitative cells as defense in
depth — should not happen by construction.

## Step 4.5.E: TEXT_MODE batching (FND-06)

In TEXT_MODE (Codex / Gemini / OpenCode runtimes without AskUserQuestion), render
ALL 12 questions as ONE consolidated numbered-list prompt. The user types 12 answers
separated by blank lines OR semicolons. The parser:

1. Reads the user's response.
2. Tries to split on `\n\n+` (one or more blank lines). If exactly 12 entries result,
   accept.
3. Otherwise tries to split on `;` (semicolon). If exactly 12 entries result, accept.
4. Otherwise emits a structured re-prompt:

   ```
   12 답변이 필요합니다. 빈 줄 또는 세미콜론(;)으로 구분해 주세요.
   12 answers required. Separate answers with a blank line OR a semicolon (;).

   답변하신 내용 (parsed: {n} entries):
   {raw input}

   다시 입력해 주세요 / Please re-enter.
   ```

5. Maps the 12 entries in order to Q1 through Q12 (1:1 positional mapping).
6. Tags any blank / "unknown" / "[FOUNDER-INPUT]" entries as `[FOUNDER-INPUT]`
   provenance instead of `[VERIFIED:user-supplied]`.

Acceptable degraded UX preserves correctness — the consolidated prompt mitigates
cumulative round-trip latency in non-AskUserQuestion runtimes (per Risk Notes /
Phase 7 RESEARCH lines 912-914).

</process>

<no_hooks_assertion>
This sub-workflow is invoked EXPLICITLY from `brief/workflows/design.md` Step 4.5
when WORKSTREAM_SLUG === 'financial'. No hook auto-attaches it. The design.md
Step 4.5 inline summary references this file via @-path; no PostToolUse / SubagentStop
indirection.

Load-bearing citations:
  - 07-CONTEXT.md D-15 (driver-based bottom-up; user-supplied drivers; bear/base/bull
    multipliers ×0.7 / ×1.0 / ×1.3; provenance discipline)
  - 07-RESEARCH.md lines 770-911 (canonical 12-question set + drivers.md schema +
    TEXT_MODE batching mitigation)
  - 07-RESEARCH.md lines 912-914 (TEXT_MODE consolidated numbered-list mitigation)
  - Phase 5 CC-04 (provenance pre-commit hook — defense in depth)
</no_hooks_assertion>
