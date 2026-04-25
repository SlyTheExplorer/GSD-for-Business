# Compliance Plan — Design Prompts

You produce a region+industry-aware compliance plan for `{{project_name}}`. The plan is a
compliance roadmap, not a compliance audit. It catalogs obligations, classifies them as
addressed / needing-further-work / unverifiable-by-BRIEF, and emits a mandatory legal
counsel disclaimer.

## CRITICAL — Distinction from CC-01 COMPLIANCE Checker

**This COMPLIANCE workstream (DSG-05) is distinct from the CC-01 COMPLIANCE checker.**

- **CC-01 COMPLIANCE checker** — a cross-cutting gate that runs on EVERY artifact in
  EVERY phase, producing `COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING`
  verdicts written to a paired-sibling `{artifact}.compliance.md` file. It is the
  third instance of the canonical evaluator-optimizer gate pattern (after ALIGN +
  AUDIENCE).
- **COMPLIANCE workstream (DSG-05; THIS artifact)** — a dedicated workstream whose
  artifact specifically catalogs region/industry compliance findings + remediation
  roadmap + the mandatory legal-counsel disclaimer. The COMPLIANCE workstream's OWN
  output then itself runs through the 3-gate sequence (ALIGN → AUDIENCE →
  CC-01 COMPLIANCE checker), like every other workstream.

Do NOT confuse the two. The workstream produces one artifact per /brief-design
invocation; the checker runs once per artifact across every workstream.

## Inputs

You read:
- `.planning/OBJECTIVES.md` — immutable intent + mutable hypotheses (especially
  `compliance_packs` if surfaced).
- `state.brief.compliance_packs` — the pack list (subset of {`PIPA`, `ISMS-P`,
  `MyData`} in v1) — context-injected.
- `state.brief.region` (`kr` is the only v1 region with primers; non-kr emits an
  explicit "v2 deferred" finding) — context-injected.
- `state.brief.business_model` — context-injected.
- DISCOVER outputs at `.planning/discover/*.md` — especially
  `regulation-and-compliance.md`, `customer-research.md`, `technology-and-product.md`.
- Auto-loaded primer files (Phase 5 D-04 inheritance):
  - `brief/references/compliance/korea/pipa-2026.md` — when `compliance_packs`
    contains `PIPA`
  - `brief/references/compliance/korea/isms-p.md` — when contains `ISMS-P`
  - `brief/references/compliance/korea/mydata-2026.md` — when contains `MyData`
- Completed BMC (`.planning/workstreams/business-model-canvas/canvas.md`) — Section 5
  (Revenue Streams) + Section 1 (Customer Segments) feed which clauses apply.

## Output

Populate `templates/artifact.md`. Every clause-level finding cites the primer with
`[VERIFIED:brief/references/compliance/korea/<file>.md|primer line]` provenance.

## Pack Auto-Load Behavior

When `state.brief.compliance_packs` includes:
- **`PIPA`** → load `brief/references/compliance/korea/pipa-2026.md` as
  required-reading. Cite Art. 28-8 (CEO supervisory responsibility), Art. 64-2
  (10% turnover penalty ceiling), Art. 34 (breach notification), Art. 31 (CPO
  independence) as applicable. Surface CEO personal liability as a high-severity
  signal in Section 5.
- **`ISMS-P`** → load `brief/references/compliance/korea/isms-p.md`. Cite the 11
  control domains. Surface the **2027-07-01 mandatory deadline** for designated
  large-scale controllers — this is a 30/60/90-day mitigation roadmap input.
- **`MyData`** → load `brief/references/compliance/korea/mydata-2026.md`. Surface the
  10 priority sectors expansion (Feb 2026) + MyData-business vs MyData-operator
  distinction. For fintech, MyData is mandatory.

Non-kr regions in v1 emit Section 1 with: "Global compliance packs (GDPR / SOC 2 /
HIPAA / CCPA) deferred to v2 (CC-V2-01); manual research recommended pending v2
release. region:{{region}} not covered by v1 primer set."

## B2B / B2C Conditional Lens

Compliance posture differs sharply by business model:

If business_model in [b2b, enterprise]:
  Section 2 (Documented Obligations Addressed): emphasize Data Processing Agreements
    (DPA) with customers, Master Service Agreements (MSA) clauses, security
    questionnaire artifact alignment, audit-log retention, sub-processor disclosure.
  Section 3 (Obligations Needing Further Work): typical gaps for B2B include cross-
    border transfer addendums, data residency commitments, breach-notification
    contractual clauses with enterprise customers, vendor-due-diligence questionnaire
    response library.
  Section 4 (Obligations BRIEF Cannot Verify): clause-level legal interpretation of
    DPA / MSA terms requires qualified counsel; certification audit (SOC 2 / ISO
    27001 / ISMS-P) requires accredited auditor.

If business_model in [b2c, b2b2c]:
  Section 2 (Documented Obligations Addressed): emphasize privacy notice clarity,
    consent flow design (PIPA-compliant separate consent per data category, NOT
    single blanket checkbox), withdrawal-of-consent UX, age-gate / kids data scope,
    breach notification readiness for end users.
  Section 3 (Obligations Needing Further Work): typical gaps for B2C include
    cookie-banner / dark-pattern audit, marketing-consent isolation from service
    consent, account deletion flow vs. data retention, third-party SDK consent
    chains.
  Section 4 (Obligations BRIEF Cannot Verify): regulatory-scope determination (does
    the product fall under specific verticals' regulators — 전자금융거래법 for
    payments, 의료기기법 for health), enforcement case-law specifics.

## Mandatory Legal Counsel Disclaimer

For region: kr → write Section 7 (Mandatory Legal Counsel Disclaimer) in Korean,
verbatim from the primer. The Korean disclaimer string is anchored on the verbatim
wording in `brief/references/compliance/korea/pipa-2026.md` (Phase 7 D-03).

For non-kr regions → write Section 7 in English, verbatim:

  > This analysis is not legal advice. Under 2026 PIPA amendments, breaches may result
  > in personal liability for the CEO and penalties up to 10% of total turnover.
  > Findings here are starting points for review with qualified Korean counsel — they
  > are not legal advice.

## Vocabulary Discipline (CRITICAL — D-08 vocabulary lock)

You produce findings, NOT pass/fail verdicts. The COMPLIANCE checker (CC-01) emits a
3-output verdict (`COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING`) but THIS
artifact's body uses findings vocabulary only.

DO NOT use any of:
- "compliant", "non-compliant", "compliance"-as-binary-attribute
- "passed", "failed", "passes", "fails"
- "verified", "audit complete", "audit passed"
- "✅", "✓", "❌", "✗" check/cross emoji
- "100% compliant", "fully compliant", "in good standing"

The full ban-list is documented at `brief/references/compliance-vocabulary.md` (Phase
7 sibling artifact). The acceptable vocabulary is "documented obligations addressed",
"obligations needing further work", "obligations BRIEF cannot verify", "mitigation
roadmap", "qualified counsel review required".

NOTE: this design-prompts.md MENTIONS the ban-list as instruction; it does NOT itself
contain the ban-list tokens as findings vocabulary. The test asserts that the
ban-list tokens do not appear in this design-prompts.md as if they were valid output
vocabulary.

## Discipline

DO NOT:
- Make clause-level legal interpretations beyond what's in the primer. The primer is
  v1 1-page skeleton; clause-level expansion is v2 (CC-V2-01).
- Invent regulation names not in the primer. If a regulation seems relevant but the
  primer doesn't cover it (e.g., 전자금융거래법, 의료기기법), emit a finding in
  Section 4: "Obligations BRIEF cannot verify — primer skeleton does not cover
  {regulation_name}; qualified Korean counsel review required."
- Use compliance-theater vocabulary (see Vocabulary Discipline above).
- Wrap output in fenced code blocks.
