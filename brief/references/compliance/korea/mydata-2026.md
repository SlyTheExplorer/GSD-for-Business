---
region: kr
industry: [medical, communications, energy, transportation, education, employment, real_estate, welfare, distribution, leisure]
effective_date: 2026-02-01
penalty_ceiling: "Per PIPA baseline"
ceo_liability: true
last_reviewed: 2026-04-22
first_wave_sector_count: 10
---

# MyData 2026 Expansion — Primer

> Not legal advice. Refer to qualified Korean counsel before acting on findings.

## Scope

MyData (마이데이터) is the Korean data-portability regime established under the Personal Information
Protection Act. The **February 2026 enforcement decree expanded MyData scope from the prior
{finance, telecommunications, healthcare} baseline to ALL INDUSTRIES**, with 10 priority sectors
designated for first-wave expansion:

1. medical (의료)
2. communications (통신)
3. energy (에너지)
4. transportation (교통)
5. education (교육)
6. employment (고용)
7. real_estate (부동산)
8. welfare (복지)
9. distribution (유통)
10. leisure (여가)

The energy-sector MyData goes live in June 2026 per the PIPC rollout roadmap. Other priority
sectors follow on a staggered schedule.

## Key Articles / Clauses (high-level)

- **Right-to-request personal-information-transfer** — Under the amended Personal Information
  Protection Act enforcement decree, data subjects can request structured transfer of their
  personal information between operators across in-scope sectors.
- **Operator licensing framework** — A designated "MyData operator" role handles data-portability
  requests on behalf of end users. The exact licensing regime for non-finance sectors is under
  development by PIPC as of the research date.
- **Interoperability standards** — Technical standards (APIs, schemas) for data portability are
  being published sector-by-sector by PIPC.

## Common Gotchas

- **Operator licensing framework is still being clarified for non-finance sectors.** Do NOT assert
  specifics about licensing requirements for medical / energy / etc. without checking current PIPC
  notices. This primer deliberately does not name operator-license specifics.
- **MyData-business vs. MyData-operator distinction.** These are separate regulatory concepts with
  different obligations. A startup building a consumer app that uses MyData APIs is a MyData-business
  (participant); running the portability infrastructure itself is a MyData-operator (licensed role).
  Mixing the two in planning artifacts is a common misunderstanding.
- **Cross-industry portability** — A user may request portability from (say) a medical provider to
  a distribution retailer. Planning products that span priority sectors should anticipate this UX
  scenario even before specific sector rules are finalized.
- **2026 financial support.** PIPC has budgeted ~$12M in 2026 to support MyData operator build-out
  across the priority sectors — relevant for partnership-seeking planners.

## Penalties + CEO Liability

- Enforcement sits under the PIPA umbrella. Penalty ceiling (10% turnover) and CEO liability regime
  inherit from `pipa-2026.md`. There is no MyData-specific penalty schedule separate from PIPA.

## Legal Counsel Disclaimer

> Not legal advice. Refer to qualified Korean counsel before acting on findings.

MyData operator licensing and sector-specific technical standards are being published iteratively
by PIPC. Engage qualified Korean counsel AND monitor PIPC notices for the specific sector you plan
to operate in.

## Sources

1. [Korea Expands MyData Rights to All Industries, Offers $12M in Support — Seoul Economic Daily](https://en.sedaily.com/technology/2026/03/12/korea-expands-mydata-rights-to-all-industries-offers-12m-in) — accessed 2026-04-22
2. [PIPC seeks applicants for 2026 MyData service support programme — DigitalToday](https://www.digitaltoday.co.kr/en/view/34941/pipc-seeks-applicants-for-2026-mydata-service-support-programme) — accessed 2026-04-22
3. [South Korea: Amended Personal Information Protection Act — Library of Congress](https://www.loc.gov/item/global-legal-monitor/2025-06-23/south-korea-amended-personal-information-protection-act-expands-individuals-control-over-personal-data/) — accessed 2026-04-22
4. [Data Protection & Privacy 2026 — South Korea (Chambers and Partners)](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments) — accessed 2026-04-22
