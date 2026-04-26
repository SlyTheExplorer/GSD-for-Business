# Voice-Fit Vocabulary — AI Slop Ban-List + Concreteness Examples

> Source of truth for the BRIEF voice-fit.cjs banned-words check.
> Loaded by `brief/bin/lib/voice-fit.cjs` BANNED_EN / BANNED_KO regex constants.
> Grepped at CI time by `tests/brief-voice-fit-vocabulary-lock.test.cjs` (future).
> Rationale: PITFALLS.md §Pitfall #10 (AI Slop in Type B Artifacts) + §Pitfall #11
> (Korean Cultural Gotchas).
>
> Distribution note: voice-fit.cjs is a SEPARATE lib that runs PARALLEL to AUDIENCE.
> It is NOT a 5th canonical gate (CONTEXT.md C-D03 explicit reject) and does NOT
> extend the AUDIENCE deterministic-screen entry point. The Phase 4·5·7 vocabulary-
> lock test for ALIGN/AUDIENCE/COMPLIANCE stays green; voice-fit ships alongside
> as a Plan 04 export-time post-check.

## Banned vocabulary (EN — 16 seed)

These tokens MUST NOT appear in any Type B agent artifact body. Density `> 2/page`
(per ~250 words/page approximation) triggers a 1-shot regenerate signal in
Plan 04 export.cjs dispatch.

- leverage / synergize / transform / holistic / delve / groundbreaking
- best-in-class / seamless / cutting-edge / revolutionary / game-changing
- landscape / unlock / empower / robust / innovative

Source: PITFALLS.md §Pitfall #10 banned-words list (verbatim) + jodiecook.com/ban-list/
corpus. Word-boundary + case-insensitive matching (`\b` + `gi` flags).

## Banned vocabulary (KO — 8 seed; CONTEXT.md C-D03)

These tokens MUST NOT appear in Korean Type B artifact body when `region: kr`.
Korean has no `\b` word-class for Hangul, so the regex uses exact-string
alternation. Detection only fires when `options.isKorean === true`.

- 혁신적인 / 차별화된 / 게임체인저 / 패러다임 시프트
- 시너지 / 활용 / 최적화 / 글로벌 스탠더드

Source: CONTEXT.md C-D03 한국어 8개 추가. Phase 9 HRD-04 pilot data may extend.

## Honorific violations (KO — only when audience external + region:kr)

These 반말 (informal) / 구어체 (colloquial) endings flag a CULTURAL violation
when the artifact is external Korean (audience.confidentiality in {partner, public}
AND region: kr). The check is gated by both `options.isKorean === true` AND
`options.isExternal === true` per D-D04.

- -야 / -지 / -라구요 / -거든요 / -는데요 (반말 endings)

Boundary semantics: regex uses positive lookahead `(?=[.!?]|$)` requiring
the matched suffix to be IMMEDIATELY followed by sentence-terminating
punctuation (`.`, `!`, `?`) or end-of-string. This is the most reliable
proxy for "sentence-final 반말" without morphological analysis. Hangul is
not in JavaScript's `\w` class so `\b` is a no-op for Korean text; the
positive lookahead on terminator punctuation is what enforces sentence-final
scoping.

False-positive suppression:
- Particles (까지, 부터, 마저) mid-sentence: NOT matched (no terminator
  follows the suffix).
- Noun + particle forms (아버지가, 아버지는, 아버지를): NOT matched (the
  지 suffix is followed by another Hangul particle, not a terminator).
- Edge case: a noun sentence-final without a particle (편지.) still
  false-positives — grammatically rare in natural Korean prose.

This regex was tightened from `\b` (the original Plan 02 spec) to
`(?=[.!?]|$)` during Plan 02 GREEN implementation when the Korean exemplar
text exposed false positives on noun + particle sequences. The original
spec assumed a negative lookahead `(?![가-힣])` boundary form; that form
was replaced by the positive-lookahead-on-terminator pattern that ships
in voice-fit.cjs:54 today (08-REVIEW.md WR-05 documentation correction).

Source: D-D04 honorific guard. Korean cultural context: 반말 in external
material reads as disrespectful or unprofessional and damages credibility with
investors / partners / public audiences (Pitfall #11).

## Concreteness exemplars (hand-written per C-D04)

The 4 exemplars below are HAND-WRITTEN by Claude in Plan 08-02 Task 2.
Per C-D04 / Pitfall #10: "LLM-generated exemplar는 그 자체로 slop 위험."
Each contains specific numbers (47%, 4,300, 91-day), real or plausible source
citations (`[VERIFIED:…]` / `[SOURCE:…]` / `[CITED:…]` per Phase 5 D-04
provenance schema), and concrete dates. The exemplars deliberately avoid every
word in BANNED_EN and BANNED_KO.

These exemplars are byte-identical to the layout that Plan 06 Type B agent
prompt embeds (lines 259-269) so the same source-of-truth governs both the
agent's self-check examples and the planner's reference doc.

### INVESTOR-IR style (1)

페이앱 v2 reduces user onboarding from 12 minutes (industry baseline per
Stripe Atlas 2025 benchmark) to 90 seconds — 87% reduction. Cohort 2026-Q2
(n=4,300 users) showed 91-day retention of 47% vs control 23% (p < 0.01).
[VERIFIED:internal-pilot-cohort-2026-Q2-analysis-2026-04-25|2026-04-25]

### EXEC-SUMMARY style (1)

We are recommending the Vendor X migration based on 3 data points:
(a) Q1-2026 pilot showed 23% reduction in MTTR vs incumbent (n=14 incidents);
(b) annual cost differential is $147K savings at current scale
[SOURCE: 2026 vendor quote 2026-03-15];
(c) 9 of 11 engineering team members preferred Vendor X interface in blind
2-week trial [VERIFIED:internal-trial-2026-Q1].

### DECISION-MEMO style (1)

We will adopt Vendor X over Vendor Y because (1) total cost of ownership
over 3 years is $441K vs $580K (24% lower); (2) Vendor X SLA covers Korea
region without latency surcharge per 2026-Q1 RFP response; (3) Korean PIPA
compliance attested via ISO/IEC 27018 + Korea ISMS-P certification (Vendor Y
has PIPA pending until Q4-2026).

### Korean exemplar (격식체 + 구체 수치 + 출처)

페이앱은 2026년 2분기에 91일 유지율을 47%까지 개선했습니다 (대조군 23%,
p < 0.01, n=4,300명). 한국 핀테크 시장 평균 91일 유지율은 27% 수준이며
[출처: 한국핀테크산업협회 2025 연간보고서, p. 47], 페이앱은 1.7배의
차이를 보였습니다.

## Ban-list extension procedure (per Phase 4 D-09 inheritance)

1. Edit THIS file first — add the new banned word + brief justification under
   the appropriate `## Banned vocabulary (EN|KO)` section.
2. Add the new word to the `BANNED_EN` or `BANNED_KO` regex literal in
   `brief/bin/lib/voice-fit.cjs` (mirror this file's order to keep diff
   minimal during reviews).
3. Add a structural test in `tests/brief-voice-fit-banned-words.test.cjs`
   asserting the new word is detected by `checkBannedWords`.
4. Phase 9 HRD-04 pilot data MAY drive new entries. Coordinate with the
   Plan 06 Type B agent prompt embed (the agent's self-check list MUST mirror
   this ban-list verbatim — Plan 04 voice-fit-vocabulary-lock test will
   enforce sync).
