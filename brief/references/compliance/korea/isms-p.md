---
region: kr
industry: [all_designated_large_scale]
effective_date: 2027-07-01
penalty_ceiling: "See PIPA 10% ceiling"
ceo_liability: true
last_reviewed: 2026-04-22
---

# ISMS-P Certification — Primer

> Not legal advice. Refer to qualified Korean counsel before acting on findings.

## Scope

ISMS-P (Information Security Management System — Personal information) is the Korean integrated
management-system certification covering BOTH information-security controls (ISMS) AND
personal-information-protection controls. The scheme is roughly comparable to ISO 27001 + ISO 27701
with Korean-specific controls and Korean-regulator audit mechanics (KISA / PIPC).

**The 2026 PIPA amendment makes ISMS-P certification mandatory from 2027-07-01 for designated
large-scale controllers.** The exact designation criteria are being clarified via KISA / PIPC
enforcement notice; monitor the Korean regulator's communications for updates.

## Key Articles / Clauses (high-level)

The ISMS-P certification scheme organizes approximately 80+ controls across 11 domains:

- Policy (organizational information-security policy)
- Organization (governance structure, CPO independence per PIPA Art. 31)
- External-party management (third-party / vendor security)
- Physical controls (facility access, device control)
- Communications (network, encryption in transit)
- Access (authentication, authorization, least privilege)
- Operations (patching, vulnerability management, monitoring)
- Development (secure SDLC)
- Incident response (detection, containment, breach notification)
- Business continuity / disaster recovery
- Personal-information lifecycle (collection, use, retention, destruction)

## Common Gotchas

- **ISMS-P vs. ISMS-alone.** ISMS certification is the narrower information-security-only audit;
  ISMS-P extends with personal-information-protection controls. Many Korean startups begin with
  ISMS and later add -P. Plan for the full -P scope if targeting regulated sectors.
- **Designated large-scale controllers.** The 2027-07-01 mandate applies only to designated
  entities. Criteria (turnover thresholds, number of data subjects, sector) are being clarified
  by KISA / PIPC enforcement notice. Do NOT assume your organization is or is not designated
  without checking the current notice.
- **Certification cycle.** 3-year primary cycle with annual surveillance audits. Budget
  accordingly — this is not a one-shot compliance expense.
- **Korean-language documentation requirement.** Certification artifacts (policies, procedures,
  evidence) must be maintained in Korean for audit.

## Penalties + CEO Liability

- **Mandatory deadline 2027-07-01** — failure to hold ISMS-P certification (when designated as
  subject) may trigger administrative enforcement under PIPA; the CEO-liability regime documented
  in `pipa-2026.md` applies coextensively.
- **Audit findings** generally result in remediation requirements rather than direct fines, but
  serious findings can escalate to PIPA Art. 64-2 10% turnover penalty exposure.

## Legal Counsel Disclaimer

> Not legal advice. Refer to qualified Korean counsel before acting on findings.

ISMS-P certification is a structured audit process with its own vocabulary and documentation
requirements. Engage Korean privacy counsel AND a KISA-accredited auditor well before the
2027-07-01 deadline if designation status is possible.

## Sources

1. [Data Protection & Privacy 2026 — South Korea (Chambers and Partners)](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments) — accessed 2026-04-22
2. [South Korea PIPA Compliance — Thales](https://cpl.thalesgroup.com/compliance/apac/south-koreas-pipa) — accessed 2026-04-22
