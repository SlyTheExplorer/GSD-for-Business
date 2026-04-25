# Phase 7: DESIGN — Workstream Orchestration + COMPLIANCE Checker - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Mode:** Interactive — resumed from 07-DISCUSS-CHECKPOINT.json (Area A pre-locked from 2026-04-24 session). 4 gray areas (A: COMPLIANCE checker shape + pack scope; B: /brief-design orchestrator UX; C: /brief-add-workstream flow depth; D: 9 workstream template shape) discussed; 15 decisions (D-01..D-15). All recommended options selected; no area re-opened.

<domain>
## Phase Boundary

Phase 7 ships the **DESIGN runtime** — `/brief-design <workstream>` orchestration over **9 built-in workstreams** (BMC, GTM, FINANCIAL, OPERATIONS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH) **+ dynamic addition** via `/brief-add-workstream <name>` **+ the third cross-cutting gate** (COMPLIANCE) replicating the Phase 4/5 evaluator-optimizer canonical pattern. COMPLIANCE checker auto-attaches to **every artifact in every phase**, not only the COMPLIANCE workstream — that is the CC-01 contract.

**In scope:**

1. **/brief-design orchestrator** — single-workstream-per-session (B-D01); soft dependency hint, no hard enforcement (B-D03); structured handoff with explicit user confirmation between workstreams (B-D04); OBJECTIVES.md amendment routing via `/brief-define --amend` instead of return-stack push (B-D02).
2. **9 built-in workstreams** delivered as `brief/workstreams/{name}/` folders (BMC, GTM, FINANCIAL, OPERATIONS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH) with spec.yaml + design-prompts.md + output-template.md.
3. **COMPLIANCE checker (CC-01)** — third instance of the canonical gate pattern. 3-output verdict `COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING` (A-D01); paired-sibling `{artifact}.compliance.md`; mandatory legal-counsel disclaimer; clause-level findings (regulation clause + required evidence + found-in-artifact + gap); auto-loads Korea reference primers (PIPA / ISMS-P / MyData) from Phase 5 inheritance based on `state.brief.compliance_packs`.
4. **Sequential gate orchestration** (A-D02) — for any artifact: ALIGN → AUDIENCE → COMPLIANCE in series. No parallel spawn, no per-gate toggle, no skip flag.
5. **/brief-add-workstream dynamic addition** — spec.yaml auto-generated + 1-session interactive Q&A (C-D01); 3 gates auto-attach (C-D02); name collision BLOCK + role-overlap fork/new prompt (C-D03).
6. **FINANCIAL driver-based bottom-up modeling (DSG-03)** — guided 8-12 driver Q&A interview (D-D04); user-supplied drivers → driver table → LLM computes 12-month projection. Pitfall #6 (hallucinated market data) mitigation: drivers MUST come from user, not LLM imagination.
7. **CEO personal liability + 10% turnover penalty (2026 PIPA)** surfacing — flagged as standard `FINDINGS-BLOCKING` severity with the legal-counsel disclaimer footer mentioning CEO liability explicitly (A-D03).

**Out of scope (deferred):**

- AUDIENCE/ALIGN re-implementation — both come from Phase 4/5 unchanged; Phase 7 only adds the third instance (COMPLIANCE) and threads all three sequentially.
- /brief-discover bidirectional return — Phase 6 infrastructure; /brief-design taps `state.brief.return_stack` only on entry/exit (resume detection), not as a primary trigger.
- Type A / Type B DELIVER artifacts (PRODUCT-BRIEF, INVESTOR-IR, INTERNAL-DECK, SERVICE-POLICY, etc.) — Phase 8 territory.
- Mandatory `/brief-export` step + filename audience encoding + first-slide watermark — Phase 8 territory.
- Marp PPTX/PDF rendering — Phase 8 territory.
- Pre-commit Frontmatter Validator git hook (CC-03) — Phase 8 territory.
- Multi-workstream parallel execution — single-workstream-per-session by B-D01.
- Cross-runtime smoke tests (Codex/Gemini/OpenCode end-to-end run of /brief-design) — Phase 9 HRD-01.
- Surface count audit / final pruning to ≤12 commands + ≤8 skills — Phase 9 HRD-02.
- Clause-level Korean compliance content depth — v2 (CC-V2-01); v1 ships the 1-page primers from Phase 5 unchanged.
- Continuous compliance monitoring (Drata/Vanta-style) — explicitly out of scope per REQUIREMENTS.md.
- Global compliance packs (GDPR / SOC 2 / HIPAA / CCPA) — v2; v1 Korea-only per A-D04.
- v2 cycle restart (`/brief-new-milestone`) — explicitly deferred.

**Why Phase 7 is the heaviest phase in BRIEF:**

This phase is where every primitive built in Phase 1–6 finally produces user-visible business value. Failure modes:

1. **Drift from canonical gate pattern** — if COMPLIANCE deviates from the 3-output / paired-sibling / vocabulary-lock template Phase 4/5 established, the test infrastructure breaks and Phase 8 inherits drift.
2. **Workstream count explosion** — 9 built-in × 3 gates = 27 gate runs per full design cycle. Gate cost (LLM Tasks) dominates wall time and cost; FINANCIAL Q&A series adds sequential AskUserQuestion latency. Planner must respect the boundary (single workstream per session) to keep latency tolerable.
3. **Compliance theater** (Pitfall #4) — the CEO personal liability finding MUST be surfaced as actionable, not as a checkbox. CC-01 vocabulary lock test enforces "Documented obligations addressed:" / "Obligations needing further work:" / "Obligations BRIEF cannot verify (requires human counsel):" — never "compliant" or green checkmarks.
4. **Hallucinated FINANCIAL numbers** (Pitfall #6) — driver-based bottom-up is the structural mitigation; any auto-fill or LLM-imagined driver value re-opens the pitfall. The 8-12 driver interview MUST come from user input, not LLM extrapolation.
5. **Surface cap violation** — Phase 7 adds exactly 2 user-facing commands: `/brief-design` and `/brief-add-workstream`. No on-demand re-gate commands (`/brief-recompliance`, `/brief-realign-workstream`, etc.). All re-gating happens via re-running `/brief-design <workstream>` or via gate-internal force-accept.

</domain>

<decisions>
## Implementation Decisions

### Area A — COMPLIANCE checker shape + pack scope (locked 2026-04-24, resumed from checkpoint)

- **D-01: COMPLIANCE 3-output verdict = `COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING`.** Literal preservation of the Phase 4 ALIGN / Phase 5 AUDIENCE 3-output canonical shape, with COMPLIANCE-specific semantics:
  - `COMPLIANCE-OK` — clause coverage adequate; documented obligations addressed; no blocking findings.
  - `FINDINGS-MATERIAL` — gaps present but proceed-with-caveat allowed; written to `{artifact}.compliance.md` body + `state.brief.last_gate_results.compliance.findings`; workflow proceeds.
  - `FINDINGS-BLOCKING` — gap blocks workflow until resolved (e.g., 2026 PIPA CEO-liability evidence missing for region: kr fintech projects). Triggers 3-path interrupt (revise content / amend OBJECTIVES / force-accept with audit trail) — same shape as Phase 4 D-06 / Phase 5 D-09.
  - **Rejected:** `COMPLIANCE-OK / DRIFTED-evidence / DRIFTED-coverage` (DRIFTED- prefix is misleading for clause-coverage findings — drift implies divergence from baseline, but compliance is gap-against-regulation not gap-against-baseline). `NO-FINDINGS / FINDINGS / NO-APPLICABLE-CLAUSES` (loses severity stratification — without BLOCKING vs MATERIAL the orchestrator can't decide whether to halt; conflates "no findings" with "no applicable clauses" which are very different states).

- **D-02: Sequential gate execution — ALIGN → AUDIENCE → COMPLIANCE.** For every artifact written by a workstream, the orchestrator runs the three gates in series, in this fixed order. Each gate runs as an explicit orchestrator step (not a hook). If an earlier gate produces a BLOCKING verdict, downstream gates do not run for that artifact iteration (fail-fast: no point COMPLIANCE-checking content the user is going to revise anyway).
  - **Rejected:** Parallel spawn + merge — adds Task-coordination complexity (Phase 5 wave-queue exists for parallel-research, not parallel-gates). 3× LLM cost concurrently for marginal latency gain. Conditional via `gate_required` flag in spec.yaml — opens "I turned off COMPLIANCE because it was noisy" foot-gun (Pitfall #4 compliance theater regression). Sequential is also semantically correct: ALIGN first asks "does this match objectives", AUDIENCE asks "is this audience-safe", COMPLIANCE asks "are regulatory obligations addressed" — natural progression, each gate's input depends on the prior gate's verdict being non-BLOCKING.

- **D-03: 2026 PIPA CEO personal liability + 10% turnover penalty = standard FINDINGS-BLOCKING + footer disclaimer mentions CEO liability.** No new severity tier (`critical-personal-liability` rejected — bloats vocabulary, breaks 3-output canonical shape). No top-of-report banner (rejected — pulls focus away from artifact and primes reader to dismiss as boilerplate). Approach:
  - PIPA-related gaps (clause coverage, CPO independence, breach notification readiness, ISMS-P controls) emit as standard `FINDINGS-BLOCKING` per D-01.
  - The mandatory legal-counsel disclaimer at the bottom of every `{artifact}.compliance.md` includes one explicit sentence: `"Under 2026 PIPA amendments, breaches may result in personal liability for the CEO and penalties up to 10% of total turnover. Findings here are starting points for review with qualified Korean counsel — they are not legal advice."`
  - Disclaimer wording in Korean when `state.brief.region == "kr"` (Phase 3 D-11 / Phase 4 D-11 inheritance).
  - **Rejected:** New severity tier (`critical-personal-liability`) — violates 3-output canonical lock from Phase 4 D-09 / Phase 5 D-09. Top-of-report banner — visual hierarchy push that the planner-controlled-prose body already accomplishes.

- **D-04: v1 compliance pack scope = Korea 3 (PIPA / ISMS-P / MyData) ONLY — Phase 5 reference library inherited unchanged.** Globally GDPR / SOC 2 / HIPAA / CCPA stubs are deferred to v2 (CC-V2-01). Pack template scaffolding is also deferred — v1 hardcodes the 3 Korea packs in `brief/references/compliance/korea/` and the COMPLIANCE checker auto-loads matching primers based on `state.brief.compliance_packs`.
  - Rationale: Phase 5 already shipped the 3 Korea primers (D-04 default). Scope expansion (4 global stubs) without legal review = Pitfall #4 compliance theater risk + Pitfall #6 hallucinated regulation risk. v1 ships ONLY what was legally reviewed; v2 expands.
  - **Rejected:** Korea 3 + 4 global stubs (compliance theater risk: stub-level GDPR primers mislead users into thinking GDPR is covered when it isn't). Pack template-only with no content (defeats CC-01 — orchestrator can't load packs for region-aware findings if packs are empty).

### Area B — /brief-design orchestrator UX

- **D-05: Single workstream per `/brief-design` invocation.** Command signature: `/brief-design <workstream-name> [args]`. Examples: `/brief-design BMC`, `/brief-design GTM`, `/brief-design financial`. The session runs ONE workstream end-to-end (workstream prompts → artifact write → ALIGN → AUDIENCE → COMPLIANCE → handoff prompt) and exits. Naturally compatible with checkpoint/resume semantics (Phase 6 return-stack); gap-detection + return-stack push happens within ALIGN's existing post-verdict step (Phase 6 D-02 inheritance, no new orchestrator surface).
  - **Rejected:** Multi-select + wave execution (Phase 5 wave pattern) — gap-detection across multiple in-flight workstreams requires multi-frame return-stack which is explicit v2 deferred per Phase 6 deferred ideas. Implicit pipeline (BMC → GTM → ... 9 sequential auto) — removes user judgment between workstreams; conflicts with B-D04 explicit-confirmation handoff.

- **D-06: OBJECTIVES.md insufficiency = pause + `/brief-define --amend` directive (NOT return-stack push to DEFINE).** When a workstream agent determines OBJECTIVES.md lacks information needed to produce its artifact (e.g., BMC needs revenue model but OBJECTIVES.md `Mutable Hypotheses` block is empty on monetization), the workflow:
  1. Writes a "PAUSED — OBJECTIVES amendment needed" status to STATE.md.
  2. Prints user-facing message: `"Workstream {name} paused. OBJECTIVES.md needs more detail on {topic}. Run: /brief-define --amend → then re-run /brief-design {workstream}."`
  3. Exits cleanly. NO return-stack frame is pushed (return-stack is DISCOVER↔DESIGN, not DESIGN→DEFINE).
  4. Optionally writes a `{artifact}.gaps.md` with severity MATERIAL noting the OBJECTIVES gap (so it's audit-trail visible).
  - User runs `/brief-define --amend` (Phase 3 Mode B), updates OBJECTIVES Mutable Hypotheses block, re-runs `/brief-design {workstream}`. Phase 3 D-03 immutable-intent lock preserved — Mode B Section Picker prevents accidental immutable edits.
  - **Rejected:** Phase 6 gap-detector handles automatically — gap-detector is DISCOVER↔DESIGN scoped; expanding semantics to DESIGN→DEFINE is structural drift. In-line OBJECTIVES edit from BMC workstream — bypasses Phase 3 D-03 immutable-intent lock + Mode B audit trail; turns workstream into back-door OBJECTIVES editor.

- **D-07: Soft-recommended dependency order, never hard-blocked.** Recommended progression: BMC → GTM → BRAND → OPERATIONS → FINANCIAL → RISK → ROADMAP → TECH-ARCH → COMPLIANCE. Implementation:
  - `spec.yaml` declares `depends_on: []` (informational only — not enforced).
  - `/brief-design <workstream>` checks `depends_on` and emits a non-blocking advisory if dependencies aren't done: `"Tip: BMC and GTM are the typical inputs to FINANCIAL. They aren't done yet — proceed anyway?"` AskUserQuestion with `Continue / Cancel`.
  - `/brief-status` displays "Recommended next: {workstream}" derived from completion state + dependency graph.
  - User can run any workstream in any order without ceremony.
  - Rationale: A v1 user dogfooding may already have a Notion doc with their BMC drafted; forcing them to re-run BMC inside BRIEF before they can produce GTM is workflow friction that hurts adoption.
  - **Rejected:** Hard `depends_on` enforcement with BLOCK — violates the "user judgment over framework rigidity" principle (Pitfall #9 non-developer friction). No order hints — wastes the deterministic ordering knowledge the team has from BMC ↔ GTM ↔ FINANCIAL inter-dependency literature.

- **D-08: Workstream completion handoff = result summary + recommended next + explicit AskUserQuestion confirmation.** Each workstream completion emits to the user:
  1. **Generated artifact path** (e.g., `.planning/workstreams/business-model-canvas/canvas.md`).
  2. **3-gate verdict summary** (`ALIGN: ALIGNED | AUDIENCE: AUDIENCE-OK | COMPLIANCE: FINDINGS-MATERIAL (2 gaps in Section 4)`).
  3. **Recommended next workstream** (per D-07 soft-order, taking already-completed workstreams into account).
  4. **AskUserQuestion** with options: `Continue with {recommended next}` / `Stop here` / `Pick a different workstream`.
  - On `Continue` → spawn `/brief-design {recommended-next}` (Skill tool, not nested Task — same anti-nesting principle as Phase 5/6 auto-advance).
  - On `Stop here` → commit + exit; STATE.md captures last-completed workstream so `/brief-status` shows it; user picks up later via `/brief-design <other>`.
  - On `Pick a different` → present full 9-workstream + custom-added list as multi-choice; pivot.
  - **Rejected:** Auto-chain through 9 workstreams — removes user's design judgment moments (especially BRAND voice, RISK acceptance, COMPLIANCE review which all benefit from deliberation between artifacts). Bare commit + exit (no recommendation) — loses the soft-order knowledge B-D07 captured.

### Area C — /brief-add-workstream flow depth

- **D-09: spec.yaml auto-generated + 1-session interactive Q&A (4-6 questions).** `/brief-add-workstream <name>` runs:
  1. **Name validation** — collision check (D-11). If unique, proceed; if collision, branch.
  2. **AskUserQuestion 4-6 prompts**:
     - "What is the workstream's goal? (1-2 sentences)" → `description`
     - "What artifact does it produce? Pick one or describe." → `output_artifact_template` skeleton path
     - "Does this workstream have B2B/B2C variant content?" Y/N → conditional template prose toggle in `design-prompts.md`
     - "Compliance focus areas?" multi-select [pipa, isms-p, mydata, none] → influences COMPLIANCE checker pack auto-load when this workstream's artifact is produced
     - "Recommended ordering — runs after which existing workstreams?" multi-select from completed-or-planned workstreams → `depends_on`
     - "Any additional research prompts beyond OBJECTIVES.md?" optional → seeds `research_prompts[]`
  3. **Auto-write skeleton files**:
     - `brief/workstreams/{name}/spec.yaml` (filled from Q&A answers + Phase 2 D-13 required-field defaults)
     - `brief/workstreams/{name}/design-prompts.md` (template scaffolding with conditional B2B/B2C blocks if Y in step 2)
     - `brief/workstreams/{name}/templates/artifact.md` (skeleton output template — sections, frontmatter, paired-sibling ready)
  4. **User finishes off-line** — fine-tune design-prompts.md prose, edit artifact template structure. The framework is now ready: subsequent `/brief-design {name}` auto-loads the new workstream via `workstream-loader.cjs` (Phase 2 D-13).
  - **Rejected:** Skeleton-only (user fills design-prompts.md from scratch) — too high a friction wall for non-developer planners (Pitfall #9). Full gsd-new-milestone flow including ROADMAP update — BRIEF's ROADMAP.md is the meta-roadmap of the BRIEF tool itself, not the user's business roadmap; updating it from /brief-add-workstream is a category error. (User's business roadmap is the ROADMAP workstream's own artifact, separate.)

- **D-10: Added workstreams auto-attach all 3 gates (ALIGN + AUDIENCE + COMPLIANCE).** `spec.yaml` `gates_required` field defaults to `[align, audience, compliance]` for all `/brief-add-workstream`-created workstreams. User can override in spec.yaml manually after creation, but defaults match the 9 built-in workstreams' gate posture for CC-01 consistency ("every artifact in every phase").
  - **Rejected:** `gates_required` toggleable to opt out of COMPLIANCE on non-compliance-relevant workstreams (e.g., BRAND, MARKETING-channels) — opens "I turned off COMPLIANCE and shipped" foot-gun. CC-01 explicitly requires compliance checker on EVERY artifact, including BRAND/MARKETING ones (region: kr region-locked content has compliance implications even for branding — prohibited claims, advertising restrictions). ALIGN+AUDIENCE only with COMPLIANCE opt-in — same pitfall.

- **D-11: Name collision = BLOCK; role overlap = "fork or new" 2-branch prompt.**
  - **Name BLOCK** — `/brief-add-workstream BMC` when `brief/workstreams/business-model-canvas/` already exists (canonical name) OR a custom-added `bmc/` exists → emit error: `"Workstream 'BMC' already exists at brief/workstreams/business-model-canvas/. Use a different name or run '/brief-design BMC' to use the existing one."` Exit.
  - **Role overlap** — name is unique but description/research-prompts overlap with existing workstream (heuristic: shared keywords with existing `description` field, e.g., user creates `go-to-market-detail` when `go-to-market` already exists) → AskUserQuestion: `"This sounds like an extension of GTM. Which is correct?"` Options: `Extend existing GTM (creates a phase 2 of go-to-market workstream)` / `Genuinely new workstream (proceed)` / `Cancel`. The "extend" path creates a `brief/workstreams/go-to-market-detail/` linked to the parent via `extends_workstream: go-to-market` field in spec.yaml — the COMPLIANCE checker can detect related artifacts and cross-reference. The "new" path proceeds with isolated workstream.
  - **Rejected:** Name uniqueness only (semantic duplicates accepted) — produces fragmented artifacts that confuse downstream readers. Mandatory list-of-9 review on every add — over-cautious; UX friction every time even when name is clearly fresh.

### Area D — 9 workstream template shape

- **D-12: Artifact layout = `.planning/workstreams/{name}/{artifact}.md` with paired-sibling gates in same folder.** Concrete example for BMC:
  ```
  .planning/workstreams/business-model-canvas/
    canvas.md                  ← primary artifact
    canvas.align.md            ← ALIGN gate verdict (Phase 4 D-11 paired-sibling)
    canvas.audience.md         ← AUDIENCE gate verdict (Phase 5 D-11)
    canvas.compliance.md       ← COMPLIANCE gate verdict (Phase 7 D-12 NEW)
    canvas.gaps.md             ← gap-detector findings (Phase 6 D-04, optional — only if MATERIAL/BLOCKING gaps exist)
  ```
  Each workstream gets its own folder. Paired-sibling scheme (Phase 5 D-11) extended uniformly to COMPLIANCE — same `_siblingReportPath` helper logic. `find -name '*.md'` discoverable; `git diff` per-artifact clean; cross-phase audit trivial.
  - **Rejected:** Single file `.planning/workstreams/{name}.md` — paired-sibling siblings would litter `.planning/workstreams/` flat directory (9 × 4 = 36 files at minimum). Hardcoded `.planning/business-model.md` etc. — breaks dynamic /brief-add-workstream consistency (would need 2 layout schemes coexisting).

- **D-13: spec.yaml minimum required fields = inherit Phase 2 D-13 (5 fields) + add `gates_required` and `depends_on` (Phase 7 D-13 extension).** **Reconciliation note:**
  - **Phase 2 D-13 already enforces 5 required fields** in `brief/bin/lib/workstream-loader.cjs`: `name` (= directory name), `description`, `research_prompts[]`, `design_prompts[]`, `output_artifact_template`. This validation is live and tested.
  - **Phase 7 D-13 ADDS 2 new fields**: `gates_required: [align, audience, compliance]` (default; override allowed but discouraged — see D-10) and `depends_on: []` (informational, soft-order per D-07).
  - **Final required field count = 7** (5 inherited + 2 new). The Area D Q&A "최소 필수 6개" answer is reconciled here: the user signaled "minimum required, not a fat schema" and the planner reconciles to 7 by preserving the existing 5 + adding the 2 cross-phase fields the new orchestrator depends on.
  - `research_prompts[]` and `design_prompts[]` allow either inline arrays (short prompts, 1-3 items) OR a single-element path reference like `[file:design-prompts.md]` (long prompts pulled from sibling `.md` file in the workstream folder). The 9 built-in workstreams use the `[file:...]` pattern (their prompts are too long to inline cleanly); `_example/` and trivial workstreams may use inline arrays.
  - Planner extends `workstream-loader.cjs` validation: add `gates_required` validity (must be subset of `[align, audience, compliance]`); add `depends_on` reference resolution (warning if a referenced workstream doesn't exist at load time, NOT block — supports forward-reference for incremental builds).
  - **Rejected:** Fat 12+ field schema — fat schemas slow `/brief-add-workstream` and bloat _example/. Minimal 2-field (name + design_prompts_path) schema — drops `gates_required` + `depends_on` which are load-bearing for D-07/D-10. Override-Phase-2-D-13 schema — breaks Phase 2 acceptance test (workstream-loader-test.cjs would fail).

- **D-14: B2B/B2C divergence = conditional prose blocks inside `design-prompts.md` (Phase 5 D-15 pattern preserved).** Each workstream's `design-prompts.md` includes one or more conditional blocks following Phase 5's exact convention:
  ```markdown
  If business_model in [b2b, enterprise]:
    [B2B-specific guidance for this workstream — e.g., for GTM:
     emphasize sales motion, account-based marketing, procurement cycles,
     pilot→rollout pattern, contract terms.]

  If business_model in [b2c, b2b2c]:
    [B2C-specific guidance — e.g., for GTM:
     emphasize personas, jobs-to-be-done, viral / word-of-mouth mechanics,
     retention cohorts, app-store economics.]
  ```
  - The workstream agent reads the injected `<business_context>` block (built by `context-inject.cjs buildBusinessContext()` at spawn time per Phase 5 D-13), parses `business_model`, and applies the matching block prose. Same pattern as `brief-domain-researcher.md` (Phase 5 D-01).
  - SLA tiers, persona deep-dives, refund-policy details, etc., live in `design-prompts.md` not `spec.yaml` — yaml is poor at long-form conditional prose.
  - **Rejected:** spec.yaml structured `b2b_variant: ... / b2c_variant: ...` field — overlaps with design-prompts content, duplication risk; yaml can't represent natural-language guidance well. Shared `brief/references/business-model-lens.md` required-reading file — DRY but agent loads an extra file every spawn (latency cost) AND prevents per-workstream lens specificity (BMC's B2B lens differs from FINANCIAL's B2B lens — generic shared doc would over-abstract).

- **D-15: FINANCIAL workstream uses guided 8-12 driver Q&A (NOT auto-extraction from prior research).** DSG-03 driver-based bottom-up explicitly forbids top-down market-share assumption + LLM-imagined values. Approach:
  1. **Driver elicitation** — FINANCIAL workstream entry triggers a sequence of 8-12 AskUserQuestion / numbered-list (text_mode) prompts. Examples (planner finalizes the canonical set):
     - "What is your unit economics anchor — revenue per customer, per transaction, or per session?"
     - "Estimated ARPU (average revenue per user) for year 1 in your reporting currency?"
     - "Customer acquisition cost (CAC)? If unknown, mark as `[FOUNDER-INPUT]` placeholder."
     - "Customer lifetime in months (1/churn)?"
     - "Fixed monthly costs (team, tools, infra)?"
     - "Variable cost per customer/transaction?"
     - "Initial team headcount + headcount plan over 12 months?"
     - "Cash on hand or expected funding amount?"
     - "Target gross margin %?"
     - "Payment terms (net-30 vs immediate vs subscription)?"
     - "Seasonality factor (1.0 if uniform; else describe)?"
     - "Currency of reporting?"
  2. **Driver table assembly** — User answers populate a `drivers.md` (or YAML inline) file inside the FINANCIAL workstream folder; each driver carries a `[FOUNDER-INPUT]` provenance tag (Phase 5 CC-04 inheritance).
  3. **LLM projection generation** — LLM receives the driver table + business_model lens (D-14) and produces a 12-month bottom-up projection table (revenue / costs / runway / burn / break-even month). The projection is purely arithmetic from user-supplied drivers; LLM does NOT invent driver values.
  4. **Sensitivity bands** — LLM emits 3 scenario columns: bear (driver × 0.7), base (driver × 1.0), bull (driver × 1.3) — well-known sensitivity discipline; ranges instead of point estimates aligns with Phase 5 D-08 confidence-band rule.
  5. **Provenance** — every projection cell carries either `[VERIFIED:user-supplied]` (driver-derived) or `[ASSUMED:multiplier-X]` (LLM-applied sensitivity multiplier). Provenance regex catches anything else — shouldn't happen by construction, but defense in depth.
  - **Rejected:** Yaml driver template + manual fill (too high a barrier for non-developer planners — Pitfall #9). LLM-extracts-drivers from OBJECTIVES + DISCOVER (Pitfall #6 hallucinated market data — LLM imagines plausible-looking numbers; the entire DSG-03 requirement exists to prevent this).

### Claude's Discretion

The planner has flexibility on:

- **Exact COMPLIANCE checker prompt structure** in `agents/brief-compliance-checker.md` — follow Phase 4 `brief-align-gate.md` + Phase 5 `brief-audience-guard.md` template shape (frontmatter + `<role>` + `<required_reading>` + `<business_context_contract>` + `<verdict_enum>` + `<output_structure>` + `<anti_patterns>` + `<process>` + `<examples>`). Verdict enum locked by D-01; vocabulary lock per Phase 4 D-09 inheritance; specific COMPLIANCE-only ban-list (e.g., ban "compliant" + "passed" + green-checkmark Unicode) is planner's domain.
- **`{artifact}.compliance.md` body schema** — sections like `## Documented obligations addressed`, `## Obligations needing further work`, `## Obligations BRIEF cannot verify (requires human counsel)`, `## Mandatory disclaimer`. Frontmatter shape mirrors Phase 5 audience.md (paired-sibling header).
- **CEO liability disclaimer Korean / English exact wording** — D-03 specifies the English template; planner adds Korean translation per Phase 3 D-11 / Phase 4 D-11 Korean-preferred-vocabulary precedent. Tone: matter-of-fact, not alarmist; cites sources in references library.
- **9 built-in workstream content depth** — for BMC this is the 9 canonical building blocks (Strategyzer); GTM is variant per business_model; FINANCIAL is the driver-based projection per D-15; OPERATIONS is team+process+tools; COMPLIANCE is region+industry-aware findings (auto-loads Korea packs); ROADMAP is a phased business roadmap distinct from BRIEF tool's ROADMAP; BRAND is Voice/Tone/Messaging/Positioning; RISK is Risk Register across 5 categories; TECH-ARCH is high-level component map (NOT detailed design — explicit DSG-09 boundary). Planner determines exact canvas slot definitions, exact section list per workstream, etc. Use research synthesis (`.planning/research/STACK.md` Strategyzer Lean Canvas reference, Sequoia / YC pitch-deck conventions) as authoritative.
- **Soft-recommended ordering display** in `/brief-status` — planner picks the rendering (text list, table, indicator). Phase 2 D-15 compact-dashboard slot.
- **`/brief-add-workstream` interactive Q&A exact prompts and ordering** — D-09 specifies the 4-6 categories; exact wording, multi-select fences, default values are planner's domain.
- **Role-overlap detection heuristic for D-11** — planner picks heuristic (shared keywords in description? semantic embedding? simple word-set overlap?). Default to lightweight: word-set overlap > 50% with existing workstream's description triggers the prompt. Tune iteratively from execution-time false positives.
- **FINANCIAL drivers.md schema** — D-15 specifies the question shape and that drivers carry `[FOUNDER-INPUT]` tags. Exact YAML/Markdown layout is planner's domain.
- **Test fixture granularity** — follow Phase 5 fixture discipline: 1 test file per major subsystem (compliance-checker / brief-design-orchestrator / brief-add-workstream / 9 built-in workstream lookup / FINANCIAL driver Q&A round-trip). Coverage ≥ 70% (Phase 2 D-09 inheritance).
- **State allowlist extensions** — D-07 + D-08 + D-15 may add `state.brief.last_design_workstream`, `state.brief.last_gate_results.compliance`, `state.brief.financial_drivers` (path or inline). Use Phase 2 D-21 frontmatter.cjs allowlist extension pattern.
- **Atomic commit granularity** — suggested breakdown (each buildable):
  1. `brief-compliance-checker.md` agent + `brief/workflows/compliance.md` workflow (duplicate-rename from audience-guard) + `brief/bin/lib/compliance.cjs` lib (duplicate-rename from audience.cjs).
  2. `brief/references/compliance-vocabulary.md` (duplicate-rename from audience-vocabulary.md, with COMPLIANCE-specific ban-list incl. "compliant", "passed", green checkmarks).
  3. `commands/brief/design.md` + `brief/workflows/design.md` body — single-workstream-per-session orchestration.
  4. `commands/brief/add-workstream.md` + `brief/workflows/add-workstream.md` — 4-6 Q&A flow + skeleton write.
  5. 9 built-in workstream folders with spec.yaml + design-prompts.md + templates/artifact.md (atomic per workstream OR single bulk commit, planner picks; each workstream MUST be independently buildable + loadable).
  6. FINANCIAL driver Q&A flow specific to FINANCIAL workstream — reuses common AskUserQuestion plumbing.
  7. `workstream-loader.cjs` extension — `gates_required` + `depends_on` field validation.
  8. Canary E2E test (run `/brief-design BMC` end-to-end on a Korea-first B2C fixture: expect canvas.md + canvas.align.md AUDIENCE-OK + canvas.compliance.md `FINDINGS-MATERIAL` because PIPA pack triggers + handoff prompt to GTM).
  9. Vocabulary-lock test, surface-cap audit test (Phase 5 Plan 08 inheritance).

### Folded Todos

None — `brief-tools.cjs todo match-phase 7` returned 0 matches.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### ROADMAP + Requirements
- `.planning/ROADMAP.md` §Phase 7 (lines 156-167) — phase goal, 4 SC items, 11 requirements (DSG-01..DSG-10 + CC-01), Pitfall coverage statement (#4 #6 #11 #13)
- `.planning/REQUIREMENTS.md` §Phase 2 (DSG) — DSG-01..DSG-10 (9 built-in workstreams + dynamic addition), CC-01 (compliance checker on every artifact)

### Prior phase decisions (locked — do NOT revisit)
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md` — D-05 (aggressive rename — no `gsd-compliance-*` / `gsd-design-*` residues), D-07 (no aliases), D-09 (atomic buildable commits)
- `.planning/phases/02-stable-seam-anchor-schema-caps-workstream-as-config/02-CONTEXT.md` — **D-03** (state.brief.* schema forward-declaration including `last_gate_results.compliance` slot — Phase 7 first writer), **D-13** (workstream-loader.cjs 5 required fields validation — Phase 7 D-13 extends to 7), **D-15/D-16** (/brief-status compact dashboard format — Phase 7 adds soft-order "Recommended next" rendering), **D-18** (`commands/brief/*.md` + `brief/bin/lib/*.cjs` + `brief/workflows/*.md` split pattern + < ~400 lines/file), **D-20/D-21** (frontmatter.cjs round-trip + allowlist extension pattern — Phase 7 may add `state.brief.last_design_workstream`, `state.brief.last_gate_results.compliance`)
- `.planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md` — **D-03** (immutable intent / mutable hypotheses lock — Phase 7 D-06 OBJECTIVES amendment routes through Phase 3 Mode B, never inline edits), **D-08** ("적정선" lock — Phase 7 D-16 inheritance), **D-11** (Korea-signal detection — drives Phase 7 region-aware compliance pack auto-load), **D-12** (block-style error tone — Phase 7 D-11 name-collision BLOCK uses same tone), **D-13** (3-path interrupt pattern — Phase 7 COMPLIANCE FINDINGS-BLOCKING reuses)
- `.planning/phases/04-first-gate-align-pattern-established/04-CONTEXT.md` — **D-01..D-09** (the ALIGN canonical pattern — Phase 7 COMPLIANCE literally duplicate-and-renames; D-01 subagent + workflow + lib triad; D-03 hybrid deterministic + LLM decision; D-04 severity vocabulary `blocking/material/nice-to-have`; D-05 findings structure `{severity, location, description}`; D-06 3-path interrupt; D-07 force-accept with audit trail; D-08 canary scope), **D-10** ("적정선" carry-forward), **D-11** (Korea-signal language rule — COMPLIANCE output Korean for region: kr)
- `.planning/phases/05-discover-parallel-research-with-provenance-audience-context-injection/05-CONTEXT.md` — **D-09..D-12** (AUDIENCE 3-output verdict + paired-sibling filename — Phase 7 COMPLIANCE third instance), **D-13/D-14** (`context-inject.cjs buildBusinessContext()` — Phase 7 reuses unchanged), **D-15** (B2B/B2C conditional prose in agent prompts — Phase 7 D-14 adopts identically for design-prompts.md), Korea compliance primers PIPA/ISMS-P/MyData (Phase 5 ships; Phase 7 COMPLIANCE checker auto-loads via `state.brief.compliance_packs`), CC-04 provenance regex (Phase 7 FINANCIAL projection cells carry `[VERIFIED:user-supplied]` / `[ASSUMED:multiplier-X]` tags)
- `.planning/phases/06-bidirectional-foundation-phase-1-2-return-stack/06-CONTEXT.md` — **D-01..D-11** (gap-detector + return-stack — Phase 7 /brief-design taps return_stack only on entry/exit for resume detection; gap-detector fires inside ALIGN post-verdict step per Phase 6 D-02; Phase 7 does NOT extend to DESIGN→DEFINE return per Phase 7 D-06)

### Canonical code patterns to replicate (from Phase 4/5 outputs)
- `brief/bin/lib/align.cjs` + `brief/bin/lib/align-report.cjs` — gate lib + report split (Phase 7 `compliance.cjs` + `compliance-report.cjs` copy-rename)
- `brief/bin/lib/audience.cjs` + `brief/bin/lib/audience-report.cjs` — second canonical instance; Phase 7 is third
- `brief/bin/lib/gap-detect.cjs` + `brief/bin/lib/gap-detect-report.cjs` — fourth instance shape (verifies the canonical pattern is stable across 4 instances; Phase 7 should not invent novel structure)
- `brief/bin/lib/context-inject.cjs` `buildBusinessContext()` — used by every workstream agent spawn AND by COMPLIANCE checker spawn (Phase 5 inheritance)
- `brief/bin/lib/status.cjs` — extend to render `last_gate_results.compliance` row + soft-order "Recommended next" hint
- `brief/workflows/align-gate.md` + `brief/workflows/audience-guard.md` + `brief/workflows/gap-detect.md` — workflow patterns; Phase 7 `brief/workflows/compliance.md` copy-renames + adds the sequential-3-gate threading in `brief/workflows/design.md`
- `agents/brief-align-gate.md` + `agents/brief-audience-guard.md` + `agents/brief-gap-detector.md` — agent template shape

### Existing workstream infrastructure (Phase 2 ship)
- `brief/workstreams/_example/spec.yaml` — current 5-required-field schema; Phase 7 9 built-in workstreams reuse pattern with extensions per D-13
- `brief/bin/lib/workstream-loader.cjs` — Phase 2 D-13 validator; Phase 7 extends with `gates_required` + `depends_on` resolution
- `brief/workstreams/_example/templates/artifact.md` — output artifact template skeleton; Phase 7 9 built-in workstreams provide their own per-workstream `templates/artifact.md`

### Research + Architecture
- `.planning/research/PITFALLS.md` §#4 (Compliance checkbox theater) — Phase 7 D-01..D-04 + D-10 directly mitigate via findings-not-checks vocabulary, clause-level evidence, mandatory disclaimer with CEO-liability mention, `gates_required` default = all-3
- `.planning/research/PITFALLS.md` §#6 (Hallucinated market data + false precision) — Phase 7 D-15 driver-based bottom-up FINANCIAL is structural mitigation
- `.planning/research/PITFALLS.md` §#9 (Non-developer friction) — Phase 7 D-09 (single-session Q&A for /brief-add-workstream), D-07 (soft order, never blocking) directly respond
- `.planning/research/PITFALLS.md` §#11 (Korean cultural gotchas) — Phase 7 D-03 + D-04 (Korea PIPA / ISMS-P / MyData auto-load + Korean disclaimer + region-aware findings)
- `.planning/research/PITFALLS.md` §#13 (Framework specialization lock-in) — Phase 7 D-09 + D-10 + D-13 (workstream-as-yaml extension, NOT bespoke code per workstream) directly respond
- `.planning/research/PITFALLS.md` §Anti-pattern #2 (Hook-spawned gates) — COMPLIANCE MUST be explicit orchestrator step in `brief/workflows/design.md`; NO PostToolUse / SubagentStop hook
- `.planning/research/ARCHITECTURE.md` §Pattern 2 (Evaluator-Optimizer) — third instance of canonical gate pattern
- `.planning/research/ARCHITECTURE.md` §Pattern 4 (Cross-Cutting Gate Auto-Attach via Orchestrator, NOT Hooks) — COMPLIANCE follows
- `.planning/research/ARCHITECTURE.md` §Strategyzer BMC + Lean Canvas reference — DSG-01 BMC workstream uses 9-block canonical structure (planner authoritative source)
- `.planning/research/ARCHITECTURE.md` §Sequoia/YC pitch-deck convention — referenced by ROADMAP workstream for phased business-roadmap structure

### External inspiration (patterns, not dependencies)
- **Strategyzer Business Model Canvas** (CC-licensed) — DSG-01 BMC workstream's 9-block structure as section headers
- **Ash Maurya Lean Canvas** — alternative BMC variant offered via frontmatter `business_model_canvas_variant: lean` toggle (D-14 conditional prose pattern)
- **Anthropic "Building Effective Agents"** — orchestrator-workers + evaluator-optimizer pattern; Phase 7 third evaluator-optimizer instance
- NOT runtime dependencies — absorbed as patterns

### Korean compliance regulatory sources (Phase 5 inheritance)
- `brief/references/compliance/korea/pipa-2026.md` — 2026 PIPA amendment (CEO personal liability + 10% turnover penalty + ISMS-P July 2027 mandatory)
- `brief/references/compliance/korea/isms-p.md` — ISMS-P certification controls
- `brief/references/compliance/korea/mydata-2026.md` — 2026 MyData domain expansion (energy, education, employment, culture, leisure)
- All 3 carry mandatory legal-counsel disclaimer per Phase 5 D-04 default

### Inherited primitives Phase 7 must NOT break
- **STATE.md file lock + atomic commits** — every workstream artifact + paired-sibling gates write atomically via `brief-tools.cjs commit`
- **Multi-runtime detection** (FND-06) — `/brief-design` workstream selection + `/brief-add-workstream` Q&A + FINANCIAL driver interview ALL work in Claude Code, Codex, Gemini, OpenCode via AskUserQuestion + numbered-list text_mode fallback
- **`node:test` + c8 70% line threshold** (Phase 2 D-09)
- **Zero runtime dependencies** (A1 VERIFIED) — Phase 7 MUST NOT add `gray-matter` / `ajv` / `js-yaml` / `@marp-team/marp-cli` / any new runtime dep
- **CLAUDE.md Surface Caps** — Phase 7 NET user-facing command additions = 2 (`/brief-design`, `/brief-add-workstream`). NO on-demand re-gate commands. Phase 9 HRD-02 final audit catches violations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (inheritance from Phase 1-6)

**Phase 4/5/6 templates that Phase 7 duplicate-renames (explicit D-01/D-12/D-13 instructions):**

- **`agents/brief-align-gate.md`** + **`agents/brief-audience-guard.md`** + **`agents/brief-gap-detector.md`** — TEMPLATES for `agents/brief-compliance-checker.md`. Three prior instances stabilize the shape; Phase 7 is the fourth instance:
  - `ALIGN / AUDIENCE / GAP / COMPLIANCE` semantic swap
  - `<verdict_enum>` adapts to `COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING` (Phase 7 D-01)
  - `<required_reading>` adds `brief/references/compliance/korea/{pack}.md` based on `state.brief.compliance_packs`
  - Vocabulary ban-list extends with COMPLIANCE-specific items: `compliant`, `passed`, `compliant ✓`, `compliance verified`, `audit complete`, green-checkmark Unicode `✅`
- **`brief/workflows/align-gate.md`** + **`brief/workflows/audience-guard.md`** + **`brief/workflows/gap-detect.md`** — TEMPLATES for `brief/workflows/compliance.md`. Phase 7 `brief/workflows/design.md` is NEW (sequential 3-gate threading inside the design orchestrator) — pattern: copy-rename `align-gate.md`'s structure, add the sequential-3-gate post-artifact-write logic.
- **`brief/bin/lib/align.cjs`** + **`brief/bin/lib/audience.cjs`** + **`brief/bin/lib/gap-detect.cjs`** — TEMPLATES for `brief/bin/lib/compliance.cjs`. Same lib API: `compliance run` / `compliance commit` / verdict state-write / paired-sibling path resolver. ~400 lines max (Phase 2 D-18).
- **`brief/references/align-vocabulary.md`** + **`brief/references/audience-vocabulary.md`** — TEMPLATES for `brief/references/compliance-vocabulary.md`. COMPLIANCE-specific ban-list + Korean preferred-vocabulary entries.

**Other reusable assets (NO duplicate-rename, direct call):**
- **`brief/bin/lib/context-inject.cjs`** (Phase 5 D-13/D-14) — `buildBusinessContext()` called by every workstream agent spawn. The `COMPLIANCE_PACK_TO_REFERENCE` frozen map already wired for Korea packs.
- **`brief/bin/lib/state.cjs`** (Phase 2 D-20/D-21) — `state.brief.last_gate_results.compliance` writes via existing `state json` round-trip; allowlist extension if `state.brief.last_design_workstream` or `state.brief.financial_drivers` added.
- **`brief/bin/lib/status.cjs`** — extend `formatGate(...)` to handle `compliance` row; add "Recommended next workstream" rendering (D-08).
- **`brief/bin/lib/objectives.cjs`** (Phase 3) — `readObjectives()` called by every workstream agent (via `context-inject.cjs`); D-06 OBJECTIVES insufficiency check uses this.
- **`brief/bin/lib/workstream-loader.cjs`** (Phase 2 D-13) — extend with `gates_required` + `depends_on` validation; do NOT remove existing 5-field validation.
- **`brief/bin/lib/frontmatter.cjs`** (Phase 2 D-20) — round-trips nested maps; spec.yaml extensions + COMPLIANCE verdict frontmatter fit without further extension.
- **`agents/brief-domain-researcher.md`** (Phase 5 D-01) — parameterized researcher; design parallel: `brief-design-orchestrator.md` is NOT a separate agent — `/brief-design` is a workflow markdown that loads workstream-specific design-prompts.md and spawns Tasks per workstream's prompts. No new researcher needed for Phase 7 (workstreams ARE the design step, not a discovery step).
- **`commands/brief/discover.md`** + **`brief/workflows/discover.md`** (Phase 5 + Phase 6 final) — Phase 7 does NOT modify; only reads `state.brief.return_stack` on `/brief-design` entry to detect interrupted DISCOVER workflows blocking workstream entry.
- **AskUserQuestion + text_mode fallback** (Phase 1 FND-06 + Phase 4/5 consumers) — D-08 handoff confirmation, D-09 add-workstream Q&A, D-15 FINANCIAL driver interview ALL reuse existing infrastructure.
- **`brief/bin/brief-tools.cjs`** — register new `compliance` subcommand (parallel to `align` / `audience` / `gap-detect`); register new `design` subcommand (workflow dispatcher) and `add-workstream` subcommand (skeleton writer). 3 new dispatcher cases.

### Established Patterns
- **Workflow markdown + lib.cjs split** (Phase 2 D-18) — Phase 7 applies to `compliance.md` + `compliance.cjs`, `design.md` + `design.cjs`, `add-workstream.md` + `add-workstream.cjs`.
- **Agent file + workflow file + lib file triad** — fourth instance for COMPLIANCE; design + add-workstream use workflow + lib only (no separate agent — they orchestrate workstream-supplied agents).
- **Atomic commit per logical step** (Phase 1 D-09) — D-16 commit granularity discretion. Each buildable.
- **Fixture-based tests with Korea-first persona** — Phase 7 fixtures use Korean B2C fintech baseline to exercise PIPA-pack auto-load + CEO-liability disclaimer + Korean COMPLIANCE output body.
- **`text_mode` fallback** (FND-06) — `/brief-design` workstream selection AskUserQuestion, `/brief-add-workstream` 4-6 Q&A, FINANCIAL 8-12 driver interview, COMPLIANCE 3-path interrupt — all render as numbered lists in text_mode.
- **Paired-sibling filename scheme (Phase 5 D-11)** — `{artifact}.compliance.md` slots in beside `{artifact}.align.md` / `{artifact}.audience.md` / `{artifact}.gaps.md`. Same `_siblingReportPath` helper logic.
- **Severity vocabulary lock (Phase 4 D-09)** — `blocking / material / nice-to-have` (gap-detect) → `BLOCKING / MATERIAL / OK` (compliance verdict) string-equality vocabulary lock test.
- **Vocabulary ban-list discipline (Phase 4 D-11)** — Phase 7 ban-list adds compliance theater terms.

### Integration Points
- **Inside `brief/workflows/design.md`** — single-workstream-per-session orchestration; sequential-3-gate threading post-artifact-write (D-02 enforces order); D-08 handoff at end. NEW workflow file.
- **Inside `brief/workflows/add-workstream.md`** — 4-6 Q&A flow + skeleton write; D-11 collision detection. NEW workflow file.
- **Inside `commands/brief/design.md`** + **`commands/brief/add-workstream.md`** — user-facing command markdown shells. 2 NEW commands (NET user-facing surface +2). All other Phase 7 work is orchestrator-internal or reuses Phase 2 D-18 split pattern.
- **Inside `brief/bin/brief-tools.cjs`** — register 3 NEW dispatcher cases: `compliance`, `design`, `add-workstream`.
- **Inside `brief/bin/lib/status.cjs`** — extend `formatGate` for compliance + add soft-order "Recommended next" rendering. Existing dashboard format preserved.
- **Inside `brief/workstreams/{name}/`** — 9 new built-in folders: `business-model-canvas/`, `go-to-market/`, `financial/`, `operations/`, `compliance/`, `roadmap/`, `brand/`, `risk/`, `tech-arch/`. Each ships spec.yaml + design-prompts.md + templates/artifact.md.
- **Inside `.planning/workstreams/{name}/`** — runtime artifact location (NEW per workstream, created on first `/brief-design <workstream>` run).
- **Inside `bin/install.js`** — new SRC tuples for compliance agent + workflows + libs + 9 workstream folders + design + add-workstream commands.

### Risk Notes
- **3-gate sequential cost is heavy.** 9 workstreams × 3 gates = 27 LLM gate runs per full design cycle, plus FINANCIAL 8-12 driver interview's AskUserQuestion latency. Single-workstream-per-session (D-05) limits per-session impact, but a user dogfooding the full cycle ends up at 27+ gate runs. Planner should document expected per-workstream wall time + cost in CLAUDE.md before Phase 9 pilot.
- **CC-01 "every artifact in every phase" is broad.** It applies to artifacts from Phase 5 DISCOVER (research outputs), Phase 6 gap-detect (`{artifact}.gaps.md`), Phase 7 DESIGN (workstream outputs), Phase 8 DELIVER (Type A + Type B). Phase 7 wires COMPLIANCE checker into the orchestrator-step pattern; Phase 5/6/8 inherit. Planner verifies during plan-phase that all 4 artifact-producing phases call COMPLIANCE.
- **CEO liability findings have a credibility gradient.** When the COMPLIANCE checker correctly flags PIPA Article 28 evidence missing, that's load-bearing. When it false-positives on a context where Article 28 doesn't apply (e.g., a B2B enterprise SaaS with no consumer data), it erodes trust. The reference primer must include applicability scoping; checker must respect industry/region context from `business_context`. Planner ships canary fixture covering both: Korean fintech (PIPA applies, finding emitted) + Korean enterprise B2B SaaS (PIPA partial, finding scoped to relevant clauses only).
- **FINANCIAL driver Q&A is conversation-heavy.** 8-12 sequential AskUserQuestion calls in single-runtime mode is fine; in text_mode (Codex / Gemini) the cumulative round-trips compound latency. Planner considers batching (one consolidated numbered-list Q with 8-12 sub-questions) for text_mode, OR splits into 2-3 batches. Acceptable degraded UX preserves correctness.
- **Workstream agent prompt drift risk.** D-14 conditional B2B/B2C prose lives in `design-prompts.md`. If a workstream's design-prompts.md drifts (e.g., user manually edits and removes the conditional block), the workstream produces business_model-agnostic output → CC-02 (B2B/B2C context injection) silently degrades. Planner ships a workstream-loader test that asserts presence of the conditional pattern in the 9 built-in design-prompts.md files (vocabulary-lock pattern from Phase 4 D-11).
- **`/brief-add-workstream` skeleton write is filesystem-side-effect-heavy.** Creates 3 files (spec.yaml + design-prompts.md + templates/artifact.md). Planner ensures atomic write semantics — if any of the 3 fails, all 3 roll back; the user is left with no half-created workstream skeleton. Reuse `brief-tools.cjs commit` atomicity contract.
- **Soft `depends_on` advisory MUST NOT progress to enforcement creep.** D-07 deliberately leaves user judgment intact. If pilot data (Phase 9 HRD-04) reveals consistent misuse (e.g., 80% of users skip BMC and start with FINANCIAL, leading to bad bottom-up), the response is to improve the advisory wording, NOT add a `--strict` mode. Document this in CLAUDE.md as a firm v1 stance.
- **Surface cap at +2 commands is non-negotiable.** Any future temptation to add `/brief-recompliance`, `/brief-relax-compliance`, `/brief-design-all`, `/brief-realign-workstream` etc. = surface-cap regression. Re-gating is via re-running `/brief-design <workstream>` (idempotent — re-runs gates against the latest artifact). Force-accept inside the FINDINGS-BLOCKING 3-path interrupt covers the "I read the findings, ship anyway" path with audit trail. No new commands needed.
- **9 built-in workstream content depth temptation.** Each workstream has its own decades of best-practice literature (Strategyzer BMC, Lean Canvas, Sequoia GTM, Ash Maurya Running Lean, Marty Cagan PROD principles for TECH-ARCH, etc.). v1 ships well-researched skeleton prompts; deep content tuning is a v2 / pilot-driven concern. Don't over-invest at planner / executor stage; let pilot drive depth (Phase 9 HRD-04).

</code_context>

<specifics>
## Specific Ideas

- **Phase 7 is the "third instance" milestone for the canonical gate pattern.** Phase 4 ALIGN was the first; Phase 5 AUDIENCE was the second (proving the pattern is duplicable); Phase 6 gap-detector showed the same shape works for non-traditional verdicts (gap criticality classification); Phase 7 COMPLIANCE is the fourth instance and should NOT need novel structure — if any deviation from the shape arises during planning, that's a signal to revisit the deviation, not invent new patterns. Plan-phase MUST verify by greppable structural identity: agent file shape, workflow file shape, lib file API.
- **The CEO personal liability disclaimer wording is user-facing prose with legal weight.** D-03 specifies an English template; planner MUST coordinate with the existing Phase 5 Korea reference primers (which already cite 2026 PIPA + CEO liability). The exact disclaimer wording in `{artifact}.compliance.md` should match the `pipa-2026.md` primer's wording verbatim so users see consistent language across primer reading and gate output. No re-translation between the two surfaces.
- **`/brief-design BMC` is the v1 canary.** Per D-16 commit granularity step 8, planner runs end-to-end on a Korea-first B2C fintech fixture (e.g., a payment app concept). Expected outcome: `canvas.md` + `canvas.align.md ALIGNED` + `canvas.audience.md AUDIENCE-OK` + `canvas.compliance.md FINDINGS-MATERIAL` (because PIPA pack triggers + canvas.md may not exhaustively address Article 28). Gate output language Korean (Korea-signal detected). Handoff prompt offers GTM next. If any of these break during planning execution, planner returns to discuss with a flag; otherwise, Phase 7 is "the pattern is proven" canary-equivalent for Phase 8.
- **Workstream auto-discovery from `brief/workstreams/`** uses `workstream-loader.cjs` (Phase 2 D-13) — no manual registration. New workstream = new folder + spec.yaml = available next `/brief-design` run. This is FND-08's acceptance: any user can add a workstream without touching `.cjs` source. Planner MUST NOT introduce a per-workstream `.cjs` registration step (that would violate FND-08 + Pitfall #13 framework specialization lock-in).
- **Sequential gate threading happens INSIDE `brief/workflows/design.md`, not in each workstream.** Each workstream produces an artifact; the design workflow then runs ALIGN → AUDIENCE → COMPLIANCE on it. Workstreams remain artifact-producers, gates remain artifact-consumers — separation of concerns. If a future workstream needs custom gate ordering (hypothetical), that's a v2 design.
- **Soft-order "Recommended next" is derivable, not stored.** D-07 + D-08 use the spec.yaml `depends_on` graph + STATE.md last-completed timestamps to compute "next recommended" at read time. No `state.brief.recommended_next_workstream` field — derived state, single source of truth (Phase 6 D-06 inheritance).
- **Phase 7 D-13 reconciliation note is load-bearing.** The "최소 필수 6개" user signal during discuss must NOT be implemented as 6 fields that diverge from Phase 2 D-13's 5. Planner MUST extend (5 + 2 = 7) — explicitly preserving research_prompts/design_prompts/output_artifact_template names as-is. Don't rename for cosmetic alignment with the user-facing answer; the spec.yaml schema is API for downstream `workstream-loader.cjs` and a rename = breaking change to Phase 2 acceptance test. Document the reconciliation in `_example/spec.yaml` comment header so future readers don't trip.
- **FINANCIAL driver Q&A canonical question set is Claude's Discretion BUT MUST cover the 5 driver categories: revenue, cost, customers, capital, time.** The 8-12 question example list in D-15 is illustrative; planner finalizes exact wording but MUST hit all 5 categories or the bottom-up projection has gaps. Provenance tag on every driver value is non-negotiable per CC-04 inheritance.
- **OBJECTIVES.md amendment routing (D-06) preserves the immutable-intent lock from Phase 3 D-03.** When a workstream needs more OBJECTIVES detail, it routes the user to `/brief-define --amend` (Phase 3 Mode B) — the Section Picker presents OBJECTIVES with 🔒 markers on immutable sections, preventing accidental immutable edits. This is the one path; in-workstream OBJECTIVES editing would bypass the lock and is rejected.
- **Korea-first signal flow into Phase 7 = same as Phase 5/6.** The single signal-detection helper inside `context-inject.cjs` (Phase 5 D-13) drives: (1) Korean COMPLIANCE output body (Phase 4 D-11 inheritance), (2) Korean disclaimer text (D-03), (3) Korea compliance pack auto-load (Phase 5 D-04 + Phase 7 D-04), (4) Korean Q&A wording for `/brief-add-workstream` and FINANCIAL driver interview. No new signal-detection logic needed.

</specifics>

<deferred>
## Deferred Ideas

(Items that came up during this discussion or are obvious adjacent concerns — captured here so they're not lost.)

- **MATERIAL findings interactive review (`/brief-review-findings`)** — accumulated MATERIAL findings across multiple workstreams could benefit from a batch review surface. Deferred to v2 (CC-V2-02-equivalent) — current Phase 7 ships per-artifact MATERIAL findings inline in `{artifact}.compliance.md`.
- **Multi-workstream parallel execution** — single-workstream-per-session (D-05) is v1. v2 could support `/brief-design --parallel BMC GTM BRAND` if pilot reveals demand. Deferred — adds gate-run complexity multiplicatively.
- **`/brief-recompliance` / `/brief-realign-workstream` on-demand re-gate commands** — re-running `/brief-design <workstream>` is the v1 path (re-runs gates against latest artifact). Surface-cap discipline forbids new commands. Revisit only via Phase 9 HRD-02 audit if pilot demand surfaces.
- **Global compliance packs (GDPR / SOC 2 / HIPAA / CCPA)** — v2 (CC-V2-01). v1 Korea-only per A-D04.
- **Clause-level Korean compliance content depth** — 1-page primers ship; clause-level expansion is v2 (CC-V2-01). Legal counsel engagement also deferred.
- **Hard `depends_on` enforcement / `--strict` mode** — explicitly rejected by D-07. Revisit only if Phase 9 HRD-04 pilot surfaces consistent misuse pattern; first response is wording, not enforcement.
- **Workstream agent prompt drift detection (advanced)** — vocabulary-lock test catches drift on the 9 built-in workstreams; user-added workstreams (`/brief-add-workstream`) are NOT vocabulary-locked. v2 could add a soft drift advisor; v1 leaves user-added workstreams to user discipline.
- **B2B/B2C variant beyond design-prompts conditional prose** — D-14 ships conditional prose; if a workstream genuinely diverges so much that conditional prose is unwieldy (hypothetical: a workstream with 80% disjoint B2B/B2C content), v2 could allow `design-prompts.b2b.md` + `design-prompts.b2c.md` split. v1 doesn't anticipate this.
- **DESIGN→DEFINE bidirectional return (gap-detector extension to OBJECTIVES gaps)** — v1 routes via `/brief-define --amend` directive (D-06). v2 could expand Phase 6 gap-detector to also push DEFINE-bound frames. Out of v1 scope.
- **Pre-commit Frontmatter Validator git hook (CC-03)** — Phase 8 territory. Phase 7 produces frontmatter via the canonical infrastructure; the validator hook lands in DELIVER for Type A/Type B artifacts.
- **TECH-ARCH workstream's "high-level NOT detailed design" boundary** — DSG-09 explicitly forbids detailed design output (component-level interface specs, protocol details). v1 ships canonical high-level structure (component map + data flow + build sequence). Pilot may surface "but I want more detail" → v2 considers spawning a sub-workstream `/brief-design tech-arch-detailed`. Out of v1 scope.
- **ROADMAP workstream conflict with BRIEF tool's ROADMAP.md** — v1 names them separately: BRIEF tool's roadmap is `.planning/ROADMAP.md` (the build plan for BRIEF itself); user's business roadmap is `.planning/workstreams/roadmap/business-roadmap.md` (output of ROADMAP workstream). Naming clarity in workstream prompts and CLAUDE.md prevents confusion. v2 could rename one for absolute clarity.
- **Custom workstream scaling beyond ~20 added workstreams** — v1 untested at high count; workstream-loader.cjs scans all folders. If a power user adds 50 workstreams, listing performance and Q&A "pick a workstream" UX may degrade. Defer to v2 if pilot reveals.
- **Cost / latency budget per workstream** — Phase 9 pilot will surface acceptable wall-time per workstream. v1 ships without budget enforcement; v2 may add `state.brief.workstream_runtime[]` telemetry for budget alerting.
- **State allowlist extensions** — Phase 7 may add `state.brief.last_design_workstream`, `state.brief.last_gate_results.compliance`, and possibly `state.brief.financial_drivers` (path or inline). Use Phase 2 D-21 frontmatter.cjs allowlist extension pattern. Flag during planning if novel field needs justification.
- **Web-search MCP integration for COMPLIANCE checker** — to validate "is this regulatory clause still current?" the v1 checker relies on the static Korea reference primers (with effective_date frontmatter). v2 (parallel to DSC-V2-01) could integrate web-search MCP for live regulatory checking.

### Reviewed Todos (not folded)

None — `brief-tools.cjs todo match-phase 7` returned 0 matches.

</deferred>

---

*Phase: 07-design-workstream-orchestration-compliance-checker*
*Context gathered: 2026-04-25 (Area A locked from 2026-04-24 checkpoint resume + Areas B/C/D resolved interactively)*
*Discussion mode: Interactive — 4 gray areas (A: COMPLIANCE shape + pack scope, B: /brief-design UX, C: /brief-add-workstream depth, D: 9 workstream template shape). 15 decisions (D-01..D-15). All recommended options selected; no gray area re-opened. "적정선" lock inherited from Phase 3 D-08 / Phase 4 D-10 / Phase 5 D-16 / Phase 6 D-12.*
