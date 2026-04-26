---
phase: 08-deliver-type-a-type-b-audience-enforcement-marp
plan: 06
subsystem: deliver
tags: [type-b, marp, deck, exec-summary, decision-memo, watermark, ko-honorific, banned-words, concreteness]
status: complete
requirements_addressed: [DLV-05, DLV-06, DLV-07, DLV-09]
---

# Plan 08-06 Summary — Type B Agent + 4 Templates + 3 Marp CSS Themes

## What Shipped

### 1. `agents/brief-deliver-type-b.md` (parameterized agent)

Single parameterized agent file (Phase 5 D-01 byte-identity), `{{ARTIFACT}}` ∈ {`internal-deck`, `proposal-deck`, `exec-summary`, `decision-memo`}. Tools: `Read, Grep, Glob, Write` (NO Bash — does not invoke Marp directly; Plan 04 export.cjs owns Marp invocation).

**6-step process:**
1. Read `<business_context>` + OBJECTIVES + workstream artifacts
2. Determine `{{watermark_text}}` from `audience.confidentiality` (DECK only)
3. Compose Marp frontmatter + Cover slide watermark (DECK only)
4. Generate body — DECK 7-9 slide sequence OR EXEC narrative OR DECISION-MEMO ADR
5. SELF-CHECK against banned-words + concreteness + Korean honorific (when applicable)
6. Write to `{{OUT_PATH}}`

**Inline rule blocks (NOT new gates per CONTEXT.md C-D03/C-D04/D-D04 reject):**
- `<banned_vocabulary>` — 16 EN + 8 KO banned words verbatim
- `<concreteness_rule>` — "compared to what / by how much / when" + 4 hand-written exemplars (INVESTOR-IR / EXEC-SUMMARY / DECISION-MEMO / Korean) byte-identical to Plan 02 voice-fit-vocabulary.md
- `<korean_honorific_rule>` — 5 반말 endings + conditional firing (language=ko AND audience external)

### 2. 4 Type B templates

| Template | Marp? | Sections | Audience | Watermark |
|----------|-------|----------|----------|-----------|
| `internal-deck.md` | ✓ (theme: default) | 9 slides (Cover/Problem/Solution/Market/Strategy/Roadmap/Ask/Team/Appendix) | confidential | `{{watermark_text}}` placeholder filled by Plan 08 workflow → "CONFIDENTIAL — Internal use only — Do not share" |
| `proposal-deck.md` | ✓ (theme: partner) | 8 slides — Strategy → **Traction**, Team **redacted** ("available post-NDA"), **NO** Appendix (FINANCIAL excluded for partner safety) | partner | "Partner-only — Do not redistribute" |
| `exec-summary.md` | ✗ (markdown only) | 5 narrative sections (Context/Problem/Recommendation/Risks/Ask) | internal | n/a |
| `decision-memo.md` | ✗ (markdown only) | 4 ADR sections (Context/Decision/Alternatives Considered/Consequences) | internal | n/a |

All 4 templates have 5 mandatory frontmatter fields (`audience.type`, `audience.confidentiality`, `voice.tone`, `voice.perspective`, `business_context.model`) + `voice.languages: {{languages}}` + `deliverable` + `generated_by` + `generated_at`.

### 3. 3 Marp CSS themes

| Theme | Brand | Use case |
|-------|-------|----------|
| `default.css` | slate-800 + blue-500 (neutral professional) | INTERNAL deck |
| `partner.css` | teal-700 + teal-500 + slate-50 bg (outward brand) | PROPOSAL deck for partners |
| `confidential.css` | red-600 + red-50 banner overlay + top-right corner watermark | Applied IN ADDITION to default for confidential decks |

All 3 use CSS `:root { --brief-primary, --brief-accent, --brief-warning, ... }` variables for brand recoloring.

### 4. 19 Wave 0 tests (15 templates + 4 ko/en branching)

- `tests/brief-deliver-type-b-templates.test.cjs` (15 tests):
  - Templates 1-4: file existence + Marp frontmatter + Cover watermark + slide count
  - Templates 5-6: proposal-deck Traction (NOT Strategy)
  - Templates 7-8: exec-summary + decision-memo NO Marp + section structure
  - Template 9: 5 mandatory frontmatter fields across all 4 templates
  - Template 10: 3 Marp CSS themes section { + brand variables
  - Templates 11-15: agent file structure (name, tools no-Bash, banned_vocabulary, concreteness_rule, korean_honorific_rule, 4 H3 exemplars)

- `tests/brief-deliver-ko-en-branching.test.cjs` (4 tests):
  - ko/en 1: region: kr default → voice.languages: [ko]
  - ko/en 2: region: kr + options.en=true → voice.languages: [ko, en]
  - ko/en 3: region: us + non-Korean OBJECTIVES → voice.languages: [en] (no ko)
  - ko/en 4: proposal-deck.md template `voice.languages: {{languages}}` placeholder

**Result:** 26/26 tests pass (15 + 4 + 7 Plan 01 regression). A1 zero-runtime-deps preserved.

## Cross-Plan Wiring (Plan 08 will consume)

- `agents/brief-deliver-type-b.md` → spawned by `brief/workflows/deliver.md` Type B path with `{{ARTIFACT}}` parameterization
- `brief/templates/deliver/type-b/{internal,proposal}-deck.md` `{{watermark_text}}` placeholder ← filled by Plan 04 `watermarkFor(confidentiality, language)` at template-fill time
- `voice.languages: {{languages}}` placeholder ← filled by Plan 08 workflow from `synthesizeTypeA`-style language derivation (region + options.en)
- 3 Marp CSS themes referenced by Plan 04 export.cjs `renderMarp` invocation: `npx --yes @marp-team/marp-cli@4.3.1 input.md -o output.pptx --theme brief/templates/deliver/marp-themes/{theme}.css`

## Deviations

**Test 3 (region: us)** — Initial Hangul-strip approach failed because `KOREA_SIGNAL_PATTERNS` in `brief/bin/lib/define.cjs` matches not only Hangul but also English keywords (Korea/Korean/KR/Seoul/won/PIPA/ISMS/MyData) + Korean company names (핀테크/카카오/네이버/토스). Final approach: when `regionOverride !== 'kr'`, write a fresh minimal en-only OBJECTIVES.md (no Korea-signal keywords). This gives a cleaner test isolation.

## Files Plan 08 (final wiring) consumes

- `agents/brief-deliver-type-b.md` — spawn target for Type B workflow
- `brief/templates/deliver/type-b/*.md` — 4 templates copied + filled by `brief/workflows/deliver.md` Type B path
- `brief/templates/deliver/marp-themes/*.css` — passed to `npx --yes @marp-team/marp-cli@4.3.1 --theme`
- Plan 02 `voice-fit.cjs` — invoked at template-fill time post-generation for banned-words density check (1-shot regenerate if > 2/page)

## Self-Check

- ✓ All 4 templates exist
- ✓ All 3 CSS themes exist with `section {` + brand variables
- ✓ Agent has all 16 EN + 8 KO banned words
- ✓ Agent has `<concreteness_rule>` + 4 H3 exemplars (INVESTOR-IR / EXEC-SUMMARY / DECISION-MEMO / Korean)
- ✓ Agent has `<korean_honorific_rule>` with 5 반말 endings + conditional firing
- ✓ proposal-deck.md has Traction (NOT Strategy), redacted Team, NO Appendix
- ✓ exec-summary.md + decision-memo.md NO `marp: true` (markdown only)
- ✓ A1 zero-runtime-deps preserved (no `dependencies` added)
- ✓ Marp invoked via `npx --yes @marp-team/marp-cli@4.3.1` (Plan 04 owns; Plan 06 just produces source)
- ✓ 19 Wave 0 RED→GREEN; Plan 01 regression 7/7 still GREEN
- ✓ Layer 2 watermark: literal Cover slide content survives copy-paste even if Marp footer directive stripped
- ✓ NO 5th canonical gate (voice-fit/concreteness/honorific live as agent-prompt-inline rules)
- ✓ NO Bash in agent tools (does not invoke Marp directly)

## STATE.md / ROADMAP.md

NOT modified (orchestrator handles those after wave merge).
