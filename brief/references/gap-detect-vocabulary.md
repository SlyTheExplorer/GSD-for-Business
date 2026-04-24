# Gap-Detect Vocabulary — Findings Language, Not Pass/Fail

> Source of truth for the BRIEF Gap-Detector agent's findings language.
> Loaded as `required_reading` by `agents/brief-gap-detector.md`.
> Grepped at CI time by `tests/brief-gap-detect-vocabulary-lock.test.cjs`.
>
> Rationale: Pitfall #4 (PITFALLS.md) — compliance checkbox theater.
> Phase 6 extends the Phase 4/5 gate-vocabulary precedent with gap-specific
> severity + decision enums.

## Decision enum (D-01 locked)

The agent emits EXACTLY one of these three decision strings:

- **GAPS-NONE** — no gaps detected; orchestrator proceeds
- **GAPS-MATERIAL-ONLY** — MATERIAL and/or NICE-TO-HAVE only; orchestrator proceeds with caveat note
- **GAPS-BLOCKING** — ≥1 BLOCKING gap present; orchestrator routes to meta-arbiter + push

## Severity enum (D-03 locked, inherited from Phase 4 D-04)

- **blocking** — triggers return_stack push (D-03)
- **material** — documented inline in `{artifact}.gaps.md` + written to `state.brief.gap_queue[]`; workflow proceeds
- **nice-to-have** — dropped in v1 (not written to gap_queue); classifies but does not persist

## Topic fingerprint contract (D-09 locked)

Every finding MUST include a `topic_fingerprint` string obeying ALL of:

- **lowercase-kebab-case regex**: `^[a-z]+(-[a-z]+){2,7}$`
- **3-8 tokens**: count of hyphen-separated segments is ≥3 and ≤8
- **no stopwords**: `the`, `a`, `an`, `of`, `in`, `for`, `with`, `and`, `or` MUST NOT appear as any segment
- **stable across minor rewording**: if you evaluate "Korea fintech TAM missing citation" vs "Missing citation for Korea fintech TAM" you MUST emit the same fingerprint

Canonical examples (from D-09):

- `market-sizing-korea-fintech-tam`
- `competitor-pricing-axis-missing`
- `regulatory-citation-pipa-article-28`

## Preferred vocabulary (KO)

Use these phrasings in findings descriptions when Korea signals are detected:

- **발견된 공백 (BLOCKING):** — a BLOCKING gap that blocks workflow progress
- **참고 공백 (MATERIAL):** — a MATERIAL gap that does not block but is documented
- **추가 개선 (NICE-TO-HAVE):** — a dropped-in-v1 polish-level observation
- **문서화된 의도 중 반영된 것:** — Immutable Intent bullets the artifact delivers on
- **추가 작업이 필요한 항목:** — Intent bullets with no operationalization in the artifact
- **BRIEF로 확인할 수 없는 부분 (수동 검토 필요):** — matters beyond automated gap detection

## Preferred vocabulary (EN)

Use these phrasings when no Korea signal is detected:

- **Identified gap (BLOCKING):** — gap that blocks workflow progress
- **Noted gap (MATERIAL):** — gap documented inline; workflow proceeds with caveat
- **Polish-level note (NICE-TO-HAVE):** — observation dropped in v1
- **Documented obligations addressed:** — Immutable Intent bullets delivered on
- **Obligations needing further work:** — Intent bullets with no operationalization
- **Obligations BRIEF cannot verify (requires human counsel):** — matters beyond automated gap detection

## Ban-list (EN) — inherited from align-vocabulary.md + audience-vocabulary.md

These tokens MUST NOT appear in any `{artifact}.gaps.md` output:

- `compliant`
- `passed`
- `violation`
- `failed`
- Creative-avoidance (known forms): `aligned properly`, `all clear`, `no issues`, `meets expectations`, `no gaps found` (use `GAPS-NONE` decision instead)

## Ban-list (KO)

- `준수` (as a verdict)
- `통과` (as a verdict)
- `위반` (prefer "추가 작업이 필요한 항목")
- `실패` (prefer neutral findings language)

## Ban-list (symbols)

- `✅` (U+2705)
- `✓` (U+2713)
- `✗` (U+2717)

## Notes for reviewers

- Ban-list is expected to grow during Phase 6 execution as LLM creative avoidance surfaces.
- When extending, add to THIS file first; the test and the lib read from here.
- Update Phase 9 HRD-04 pilot findings if non-English/non-Korean locales surface new patterns.
