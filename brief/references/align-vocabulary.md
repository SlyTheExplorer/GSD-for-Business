# ALIGN Vocabulary — Findings Language, Not Pass/Fail

> Source of truth for the BRIEF ALIGN gate's findings language.
> Loaded as `required_reading` by `agents/brief-align-gate.md`.
> Grepped at CI time by `tests/brief-align-vocabulary-lock.test.cjs`.
>
> Rationale: Pitfall #4 (PITFALLS.md) — compliance checkbox theater.
> Positive examples > prohibitions [CITED: jodiecook.com/ban-list/].

## Preferred vocabulary (KO)

Use these phrasings in findings descriptions when Korea signals are detected (D-11):

- **문서화된 의도 중 반영된 것:** — list Immutable Intent bullets that the candidate delivers on
- **추가 작업이 필요한 항목:** — list Intent bullets with no operationalization
- **BRIEF로 확인할 수 없는 부분 (수동 검토 필요):** — list matters that require human judgment
- **Immutable Intent ↔ Mutable Hypothesis 충돌:** — when a Mutable Hypothesis contradicts an Immutable Intent
- **필수 설정 항목 누락:** — when business_model / region / audience_policy / compliance_packs is missing

## Preferred vocabulary (EN)

Use these phrasings when no Korea signal is detected:

- **Documented obligations addressed:** — list intent items delivered on
- **Obligations needing further work:** — list intent items not operationalized
- **Obligations BRIEF cannot verify (requires human counsel):** — matters beyond automated evaluation
- **Immutable ↔ Mutable contradiction:** — when hypothesis contradicts locked intent
- **Required config declaration missing:** — when a required frontmatter field is unset

## Ban-list (EN)

These tokens MUST NOT appear in any ALIGN-00.md output. Rewrite with findings vocabulary above.

- `compliant`
- `passed`
- `violation`
- `failed`
- Creative-avoidance (known forms): `aligned properly`, `all clear`, `no issues`, `meets expectations`

## Ban-list (KO)

- `준수` (as a verdict — usage in quoted regulation text is fine; usage as ALIGN verdict-language is banned)
- `통과` (as a verdict)
- `위반` (prefer "추가 작업이 필요한 항목")
- `실패` (prefer neutral findings language)

## Ban-list (symbols)

- `✅` (U+2705) — green-check mark
- `✓` (U+2713) — check mark
- `✗` (U+2717) — ballot x

## Notes for reviewers

- Ban-list is expected to grow during Phase 4 execution as LLM creative avoidance surfaces.
- When extending, add to THIS file first; the test and the lib read from here.
- Update Phase 9 HRD-04 pilot findings if non-English/non-Korean locales surface new patterns.
