# Brand Strategy — Design Prompts

You produce a brand strategy artifact for `{{project_name}}` covering four canonical
sections: Positioning Statement, Brand Voice, Tone Matrix, Messaging Framework.
`[CITED:asana.com/resources/brand-messaging-framework|Asana brand framework|2026-04-25]`,
`[CITED:kedraco.com/blogs/messaging-pillars|3-5 messaging pillars best practice|2026-04-25]`

## Inputs

You read:
- `.planning/OBJECTIVES.md` — immutable intent + voice/tone hypotheses if present.
- DISCOVER outputs at `.planning/discover/*.md` — `customer-research.md`,
  `competitor-landscape.md`, and any `cultural-context.md` if region:kr.
- Completed BMC (`.planning/workstreams/business-model-canvas/canvas.md`) — Section 2
  (Value Propositions) feeds Positioning + Messaging Pillars.
- Completed GTM (`.planning/workstreams/go-to-market/gtm.md`) — Section 2 (Positioning)
  feeds Section 1 here; Section 1 (Personas/ICP) shapes voice/tone choices.
- `state.brief.business_model` and `state.brief.region` — context-injected.

## Output

Populate `templates/artifact.md`. Cite OBJECTIVES.md, BMC, GTM, and DISCOVER outputs;
mark unsourced values `[FOUNDER-INPUT placeholder]`.

## B2B / B2C Conditional Lens

The voice and tone profile differs sharply by business model:

If business_model in [b2b, enterprise]:
  Section 2 (Brand Voice): emphasize "Expert", "Direct", "Substantive", "Accountable"
    attributes. B2B audiences (procurement / IT / engineering decision-makers) reward
    precision and de-prioritize cleverness.
  Section 3 (Tone Matrix): include "Investor / board update" and "Customer success /
    incident response" rows; in B2B the formal-confident-measured register dominates.
  Section 4 (Messaging Framework): pillars emphasize ROI, time-to-value, security/
    compliance posture, integration depth. Proof points: case studies, customer logos,
    quantitative outcomes (cost reduction %, productivity uplift %).

If business_model in [b2c, b2b2c]:
  Section 2 (Brand Voice): emphasize "Warm", "Honest", "Optimistic", "Approachable"
    attributes. B2C audiences reward emotional resonance and clarity over technical
    precision (without sacrificing honesty).
  Section 3 (Tone Matrix): include "Onboarding / activation" and "App store reviews /
    community" rows; the warmer-personal register dominates. For B2B2C, separate
    business-side tone (formal) from end-user-facing tone (warm).
  Section 4 (Messaging Framework): pillars emphasize jobs-to-be-done outcomes, identity
    affinity ("for people who..."), emotional benefit (relief, confidence, joy). Proof
    points: testimonials, retention/engagement metrics, social proof.

## Korean Variant (region: kr)

When `state.brief.region == "kr"`, populate Section 5 (Korean Variant) with:

- **Honorific guard:** External / customer-facing / investor copy uses 존댓말 (formal
  honorific). Internal team copy may use 해요체 (polite-informal). Never 반말 (casual)
  in any audience-shipped artifact. The audience guard hook surfaces 반말 in audience !=
  internal artifacts as a finding.
- **Pitch order awareness:** Korean investors typically expect the team slide earlier in
  the deck (slide 3-4) than Western pitch-deck conventions (slide 9 in Sequoia 10-slide).
  This is a Phase 8 DELIVER concern that gets surfaced in BRAND so the messaging
  framework prepares for slide-order variation. `[CITED:linkedin.com/pulse/pitching-korean-investors-business-culture-tips-etiquette-kocken|via PITFALLS.md §Pitfall 11|2026-04-25]`
- **Idiom-substitution table:** Provide ≥3 high-frequency phrase substitutions where the
  literal Korean translation is awkward and an idiomatic substitution exists. Example:
  "10x growth" → "비약적 성장" (idiomatic) NOT "10배 성장" (literal); "deep dive" →
  "심층 분석" (idiomatic) NOT "깊은 다이빙" (literal).
- **Tone matrix rows for Korean culture:** "회식 / 식사 / 골프 communication" register
  (used moderately by salespeople in Korea); "regulatory / official correspondence"
  register (used in PIPA / ISMS-P related comms with PIPC or auditors).

## Discipline

DO NOT:
- Invent voice attributes the user did not approve. Voice is identity-anchored; if
  OBJECTIVES.md doesn't surface a clear voice, present 3-5 attribute options and emit
  `[FOUNDER-INPUT decision required]` rather than picking arbitrarily.
- Adopt a single global "warm professional" default — that is brand-theater, not brand
  strategy. Different products demand different voices.
- Use compliance-theater vocabulary in findings sections (this artifact gets gated by
  ALIGN + AUDIENCE + COMPLIANCE).
- Wrap output in fenced code blocks.
