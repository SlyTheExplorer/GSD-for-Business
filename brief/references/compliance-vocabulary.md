# COMPLIANCE Vocabulary — Findings Language, Not Pass/Fail

> Source of truth for the BRIEF COMPLIANCE gate's findings language.
> Extends the Phase 5 AUDIENCE + Phase 4 ALIGN vocabulary with COMPLIANCE-
> specific clause-level + regulatory-aware findings phrasings.
> Loaded as `required_reading` by `agents/brief-compliance-checker.md`.
> Grepped at CI time by `tests/brief-compliance-vocabulary-lock.test.cjs`.
>
> Rationale: Pitfall #4 (PITFALLS.md §#4 Compliance checkbox theater) — the
> highest-risk pitfall the COMPLIANCE gate must structurally mitigate.
> Positive examples > prohibitions [CITED: jodiecook.com/ban-list/].
>
> CC-01 contract: every artifact carries a `.compliance.md` paired-sibling;
> findings render as gaps and obligations, never as pass/fail or audit
> verdicts. The legal-counsel disclaimer is mandatory on every emitted
> report.

## Preferred vocabulary (KO)

Use these phrasings in findings descriptions when Korea signals are detected (Phase 4 D-11):

- **문서화된 의무 사항 중 반영된 것:** — list documented regulatory obligations the artifact addresses
- **추가 작업이 필요한 의무 사항:** — list obligations needing further documentation or operationalization
- **BRIEF로 확인할 수 없는 의무 사항 (자격 있는 한국 변호사 검토 필요):** — list matters that require qualified Korean counsel review
- **규정 조항: ... | 필요 증거: ... | artifact 내 위치: ... | 공백: ...** — clause-level finding format (CC-01 four-field contract)
- The CEO-liability disclaimer rendered by `compliance-report.cjs` (Phase 7 D-03) is the verbatim text from `brief/references/compliance/korea/pipa-2026.md` (effective date, 10% turnover ceiling, CEO personal liability). The disclaimer text itself is NOT subject to the ban-list — it is rendered by the report renderer, not authored by findings prose.
- **본 분석은 법적 자문이 아닙니다.** — disclaimer header (Phase 5 D-04 inheritance)
- **자격 있는 한국 법률 자문가와 검토하기 위한 출발점입니다.** — closing line of disclaimer block

## Preferred vocabulary (EN)

Use these phrasings when no Korea signal is detected:

- **Documented obligations addressed:** — list documented obligations the artifact addresses
- **Obligations needing further work:** — list obligations needing further work
- **Obligations BRIEF cannot verify (requires qualified Korean counsel):** — matters requiring counsel review
- **Regulation clause: ... | Required evidence: ... | Found in artifact: ... | Gap: ...** — clause-level finding format
- **Under 2026 PIPA amendments (effective 2026-09-11), breaches may result in personal liability for the CEO and administrative fines up to 10% of total turnover.** — mandatory disclaimer footer
- **Not legal advice. Refer to qualified Korean counsel before acting on findings.** — disclaimer header
- **Findings here are starting points for review with qualified Korean counsel — they are not legal advice.** — closing line of disclaimer block

## Ban-list (EN)

These tokens MUST NOT appear in any COMPLIANCE `.compliance.md` output. Rewrite with findings vocabulary above.

- `compliant`
- `passed`
- `violation`
- `failed`
- `compliance verified`
- `audit complete`
- `compliance OK` (gate-internal `COMPLIANCE-OK` enum string is fine — only ban human-prose usage)
- `all clear`
- `no issues`
- Creative-avoidance (known forms): `aligned properly`, `meets expectations`, `everything in order`

## Ban-list (KO)

- `준수` (as a verdict — usage in quoted regulation text is fine; usage as COMPLIANCE verdict-language is banned. Prefer "추가 작업이 필요한 항목" or "법적 자문 필요 항목")
- `통과` (as a verdict)
- `위반` (prefer "추가 작업이 필요한 의무 사항")
- `실패` (prefer neutral findings language)
- `감사 완료` (audit-complete creep — Pitfall #4 vocabulary theater)
- `컴플라이언스 확인 완료`

## Ban-list (symbols)

- `✅` (U+2705) — green-check mark — Pitfall #4 vocabulary theater symbol
- `✓` (U+2713) — check mark
- `✗` (U+2717) — ballot x

## Clause-level findings format (CC-01 contract)

Every COMPLIANCE finding MAY carry four optional clause-level extension fields. When present, render as four indented sub-bullets under the finding description:

| Field (KO) | Field (EN) | Purpose | Example |
|------------|------------|---------|---------|
| `규정 조항:` | `Regulation clause:` | Specific regulatory citation | `PIPA Art. 28-8 (supervisory responsibility)` |
| `필요 증거:` | `Required evidence:` | What documentation/control is required | `Documented CPO appointment + signed independence policy` |
| `artifact 내 위치:` | `Found in artifact:` | Where in the artifact the gap was detected | `BMC Section 4 mentions 'CPO' but no policy reference` |
| `공백:` | `Gap:` | What is missing | `CPO-Art-31-independence policy text not cited` |

These fields are optional in the JSON verdict shape (the `compliance.cjs validateVerdict` function accepts findings with or without them). The rendered `.compliance.md` body shows them only when present, hidden when absent. Forward-compatible: a v2 agent prompt can be tuned to emit clause-level fields more reliably without changing the lib API.

## Notes for reviewers

- Ban-list is expected to grow during Phase 7 execution as LLM creative avoidance surfaces (e.g., "comprehensively addressed", "fully covered", "no concerns identified" — these creep into compliance prose more than ALIGN/AUDIENCE prose because regulatory framing invites pass/fail mental models).
- When extending, add to THIS file first; the test and the lib read from here.
- Update Phase 9 HRD-04 pilot findings if non-English/non-Korean locales surface new patterns.
- The CEO-personal-liability disclaimer line is mandatory on every emitted `.compliance.md` (Phase 7 D-03). It is NOT a finding — it is a footer rendered by `compliance-report.cjs` regardless of verdict decision.
