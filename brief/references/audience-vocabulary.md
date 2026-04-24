# AUDIENCE Vocabulary — Findings Language, Not Pass/Fail

> Source of truth for the BRIEF AUDIENCE gate's findings language.
> Extends the Phase 4 ALIGN vocabulary with AUDIENCE-specific hedging /
> internal-only vocabulary for DRIFTED-content detection (D-09).
> Loaded as `required_reading` by `agents/brief-audience-guard.md`.
> Grepped at CI time by `tests/brief-audience-vocabulary-lock.test.cjs`.
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
- **선언된 청중과 일치하는 부분:** — artifact body aligns with declared audience.type
- **선언된 청중과 맞지 않는 부분 (재작성 또는 frontmatter 수정 필요):** — content mismatch between body and declared audience
- **필수 frontmatter 항목 누락:** — missing one of the 3 mandatory D-10 fields (audience.type / audience.confidentiality / business_context.model)

## Preferred vocabulary (EN)

Use these phrasings when no Korea signal is detected:

- **Documented obligations addressed:** — list intent items delivered on
- **Obligations needing further work:** — list intent items not operationalized
- **Obligations BRIEF cannot verify (requires human counsel):** — matters beyond automated evaluation
- **Immutable ↔ Mutable contradiction:** — when hypothesis contradicts locked intent
- **Required config declaration missing:** — when a required frontmatter field is unset
- **Content consistent with declared audience:** — body aligns with declared audience.type
- **Content inconsistent with declared audience (rewrite or amend frontmatter):** — content mismatch between body and declared audience
- **Mandatory frontmatter field missing:** — missing one of the 3 mandatory D-10 fields

## Ban-list (EN)

These tokens MUST NOT appear in any AUDIENCE `.audience.md` output. Rewrite with findings vocabulary above.

- `compliant`
- `passed`
- `violation`
- `failed`
- Creative-avoidance (known forms): `aligned properly`, `all clear`, `no issues`, `meets expectations`

## Ban-list (KO)

- `준수` (as a verdict — usage in quoted regulation text is fine; usage as AUDIENCE verdict-language is banned)
- `통과` (as a verdict)
- `위반` (prefer "추가 작업이 필요한 항목")
- `실패` (prefer neutral findings language)

## Ban-list (symbols)

- `✅` (U+2705) — green-check mark
- `✓` (U+2713) — check mark
- `✗` (U+2717) — ballot x

## Hedging vocabulary — DRIFTED-content triggers (when audience.type: external)

These tokens in an external-audience artifact body flag DRIFTED-content (material severity;
blocking if 3+ cluster in one section per D-09 Screen (a)):

- TBD
- we believe / we think
- concerns / concern (as nouns)
- risk we haven't solved
- still proving
- not sure / gut feel
- needs validation / open question / unclear
- to be figured out / we aren't sure / we don't yet know
- frankly / honestly / privately
- hypothesis (without nearby [VERIFIED:...] tag)
- we assume (without nearby [VERIFIED:...] tag)

## Hedging 어휘 — DRIFTED-content 트리거 (audience.type: external 일 때)

외부용 artifact 본문에 아래 토큰이 등장하면 DRIFTED-content 소견으로 기록합니다
(material severity; 한 섹션 내 3회 이상 클러스터 시 blocking, D-09 Screen (a) 참조):

- 아직 확정 전
- 우려
- 미해결
- 확신 없음
- 걱정
- 확인 필요
- 미정 / 아직 모름
- 솔직히 / 사실 / 내부적으로는
- 아직 검증 전 / 아직 증명 전
- 가정 (except when within [ASSUMED:...] tag)

## Notes for reviewers

- Ban-list is expected to grow during Phase 5 execution as LLM creative avoidance surfaces.
- When extending, add to THIS file first; the test and the lib read from here.
- Update Phase 9 HRD-04 pilot findings if non-English/non-Korean locales surface new patterns.
- Hedging ban-list expansion based on Phase 9 HRD-04 pilot-observed LLM creative avoidance. Initial list is v1 shipping set.
