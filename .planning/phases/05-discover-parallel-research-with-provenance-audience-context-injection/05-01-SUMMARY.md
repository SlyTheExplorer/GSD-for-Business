---
phase: 05-discover-parallel-research-with-provenance-audience-context-injection
plan: 01
subsystem: context-injection
tags: [context-inject, business-context, audience-defaults, compliance-packs, prompt-block, cross-cutting-primitive, zero-deps]

# Dependency graph
requires:
  - phase: 03-define-canary-phase-0-end-to-end
    provides: objectives.readObjectivesMd + define.detectKoreaSignals primitives
  - phase: 04-first-gate-align-pattern-established
    provides: align.detectKoreaSignalFromConfig pattern (mirrored inline, not imported)
  - phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
    provides: config.json brief.* namespace + D-18 ≤400 lines lib.cjs discipline
provides:
  - buildBusinessContext({cwd}) — STABLE API for Phase 5/6/7/8 orchestrator + AUDIENCE seed
  - COMPLIANCE_PACK_TO_REFERENCE frozen map — PIPA / ISMS-P / MyData primer auto-attach
  - PROMPT_BLOCK_TEMPLATE — inline XML format matching Phase 4 <candidate>/<baseline> delimiters
  - deriveAudienceDefaults() — D-10 auto-populated AUDIENCE frontmatter (voice.tone / voice.perspective / audience.role)
  - 5-test round-trip coverage (tests/brief-context-inject-roundtrip.test.cjs) — KR/B2B + global/B2C + parity + missing/malformed config
affects: [phase-05-plan-02, phase-05-plan-04, phase-05-plan-06, phase-05-plan-07, phase-05-plan-08, phase-06, phase-07, phase-08]

# Tech tracking
tech-stack:
  added: []  # Zero new runtime dependencies (A1 preserved)
  patterns:
    - "Cross-cutting primitive co-serving two consumers from one call (D-14 two-consumer parity)"
    - "Frozen Object.freeze() map for static reference paths (T-5-01-01 tampering mitigation)"
    - "Try/catch tolerant config reader — malformed JSON ≡ missing file (T-5-01-02 parity)"
    - "Inline XML prompt block delimiter (mirrors Phase 4 ALIGN <candidate>/<baseline> style)"

key-files:
  created:
    - brief/bin/lib/context-inject.cjs
    - tests/brief-context-inject-roundtrip.test.cjs
    - tests/fixtures/context-inject/objectives-kr-b2b-fintech.md
    - tests/fixtures/context-inject/objectives-global-b2c-consumer.md
    - tests/fixtures/context-inject/config-kr-b2b.json
    - tests/fixtures/context-inject/config-global-b2c.json
  modified: []  # No existing files modified — pure addition

key-decisions:
  - "Inline XML prompt block (chosen over YAML / JSON / prose) — matches Phase 4 <candidate>/<baseline> delimiter style; cross-runtime parity"
  - "audience.role defaults to 'planner' across all business models — single persona in v1 per PROJECT.md Context"
  - "region field is NOT used for defaults derivation in v1 — b2b/b2c switch suffices; region reserved for language detection only"
  - "COMPLIANCE_PACK_TO_REFERENCE is frozen — Plan 06 ships the primer files; map must not drift via runtime mutation"

patterns-established:
  - "Two-consumer parity: one buildBusinessContext() call feeds BOTH Task-spawn promptBlock AND AUDIENCE frontmatter seed — no drift"
  - "Tolerant JSON parsing with try/catch returning {} — malformed == missing (no throw on user-authored files)"
  - "Underscore-prefixed exports for test reuse (_readConfigBrief, _deriveAudienceDefaults, _PROMPT_BLOCK_TEMPLATE) — not part of stable Phase 5/6/7/8 contract"

requirements-completed: [CC-02, DSC-05]

# Metrics
duration: ~15 min
completed: 2026-04-23
---

# Phase 05 Plan 01: Context-Inject Primitive Summary

**`buildBusinessContext({cwd})` cross-cutting helper — one call produces XML prompt block for Task-spawn injection AND D-10 AUDIENCE frontmatter defaults, sharing identical underlying business_model/region/language values across both consumers.**

## Performance

- **Duration:** ~15 min (context load + 2 atomic commits)
- **Started:** 2026-04-23T10:04:00Z (approximate — plan load)
- **Completed:** 2026-04-23T10:19:18Z (Task 2 commit)
- **Tasks:** 2 of 2
- **Files created:** 6 (1 lib + 1 test + 4 fixtures)
- **Files modified:** 0

## Accomplishments

- **STABLE API landed (D-14):** `buildBusinessContext({cwd})` exports a frozen-shape object (`business_model`, `region`, `audience_policy`, `compliance_packs`, `korea_signal`, `language`, `promptBlock`, `audienceDefaults`, `requiredReading`) — Phase 6/7/8 inherit verbatim.
- **Two-consumer parity proven:** The same call feeds both the D-13 Task-spawn XML prompt block AND the D-10 AUDIENCE frontmatter seed; test 3 asserts idempotency + identical underlying values across paths.
- **Korea-first signal detection preserved:** `region === 'kr'` OR Hangul-body fallback via the Phase 3 `detectKoreaSignals` primitive; drives `language` ∈ {'ko','en'}.
- **Frozen compliance-pack auto-attach (A4):** `COMPLIANCE_PACK_TO_REFERENCE` maps PIPA / ISMS-P / MyData to their `brief/references/compliance/korea/*.md` primer paths; Plan 06 ships the primers.
- **Resilience guarantees:** Missing `.planning/config.json` AND malformed JSON both resolve to the same null/empty default (tests 4 + 5). No throw, no partial state.
- **Zero runtime deps preserved (A1):** `dependencies: {}` still empty in `package.json`; no `gray-matter`, `ajv`, `js-yaml`, or `zod` added.
- **Surface cap preserved:** Zero new `commands/brief/*` files; zero new `agents/*.md` files. Pure lib + test addition.

## Task Commits

Each task committed atomically on branch `worktree-agent-a31207d3`:

1. **Task 1: Create context-inject.cjs with buildBusinessContext() + @stability JSDoc + inline XML prompt block** — `90bd681` (feat)
2. **Task 2: Write round-trip test covering KR/B2B/fintech + global/B2C + two-consumer parity + missing/malformed config fallbacks** — `2556f5c` (test)

## Files Created/Modified

- `brief/bin/lib/context-inject.cjs` (227 lines, ≤400 per Phase 2 D-18) — the primitive itself.
  - Exports: `buildBusinessContext`, `COMPLIANCE_PACK_TO_REFERENCE`, `_readConfigBrief`, `_deriveAudienceDefaults`, `_PROMPT_BLOCK_TEMPLATE`.
  - Imports: `fs`, `path`, `./core.cjs` (planningDir), `./objectives.cjs` (readObjectivesMd), `./define.cjs` (detectKoreaSignals).
  - JSDoc: `@stability: STABLE as of Phase 5. Additive-only changes. Phase 6/7/8 inherit.`
- `tests/brief-context-inject-roundtrip.test.cjs` (186 lines, 5 tests) — covers plan's 5 behaviors.
  - Runtime: ~67 ms total for all 5 tests.
- `tests/fixtures/context-inject/objectives-kr-b2b-fintech.md` — Korean B2B fintech OBJECTIVES.md (Hangul body for Korea-signal exercise).
- `tests/fixtures/context-inject/config-kr-b2b.json` — matching config.json with PIPA + ISMS-P compliance_packs.
- `tests/fixtures/context-inject/objectives-global-b2c-consumer.md` — English B2C OBJECTIVES.md.
- `tests/fixtures/context-inject/config-global-b2c.json` — matching config.json with empty compliance_packs.

## Decisions Made

- **Inline XML prompt block (vs YAML / JSON / prose):** Chose inline XML because Phase 4 already established `<candidate>` / `<baseline>` delimiters; using XML keeps cross-runtime agent prompts parsed consistently (Claude/Codex/Gemini/OpenCode).
- **Empty packs/reading render as `<!-- none -->` comment:** Chosen over self-closing tag because downstream agents see the tag presence (so the section is never "missing") while receiving no parseable content.
- **`audience.role: 'planner'` constant across business models:** Only one planner persona exists in v1 (PROJECT.md Context); diverging `audience.role` per business_model is v1.x+ work if needed.
- **`region` parameter of `deriveAudienceDefaults` unused in v1:** Kept the signature accepting it (commented `/* reserved for future v1.x */`) to preserve API shape for later region-specific defaults without a breaking change.
- **Malformed config.json ≡ missing config.json:** Unified the two error paths because both surface the same underlying problem (cannot read brief namespace) and both callers (spawn-time + frontmatter-seed) want the same fallback.
- **Underscore-prefixed test-only exports:** `_readConfigBrief`, `_deriveAudienceDefaults`, `_PROMPT_BLOCK_TEMPLATE` exposed with `_` prefix to signal "not part of stable Phase 5/6/7/8 contract"; only `buildBusinessContext` and `COMPLIANCE_PACK_TO_REFERENCE` are the D-14 STABLE API.

## Deviations from Plan

None — plan executed exactly as written.

The plan prescribed a precise implementation starter (§05-RESEARCH.md Pattern 3 Example 1) with all exact values for `COMPLIANCE_PACK_TO_REFERENCE`, `PROMPT_BLOCK_TEMPLATE`, `deriveAudienceDefaults`, and `buildBusinessContext` steps (a) through (h). The implementation follows the prescription line-for-line, with two minor stylistic additions that do not alter behavior:

- Added three underscore-prefixed helper exports (`_readConfigBrief`, `_deriveAudienceDefaults`, `_PROMPT_BLOCK_TEMPLATE`) to support future test extensions without expanding the stable contract — this is additive and non-breaking.
- Added a `try/catch` around `objectives.readObjectivesMd()` at step (c) to degrade gracefully to an empty body if the reader ever throws (e.g., permissions error). The plan's step (c) said "tolerate missing file (body defaults to empty string)" — the wider catch is a strict-superset of that promise.

Neither addition changes any test outcome; both are documentation discipline.

## Issues Encountered

- **Initial working-directory confusion:** Bash tool commands with `cd /Users/pc-26-006/GSD-for-Business` landed in the project root instead of the worktree path (`.claude/worktrees/agent-a31207d3`). Caught after the first Task 1 commit landed on the wrong branch (`main`). Recovered with `git reset --hard 7175a03` on main (clean rollback, commit had not been pushed), then re-created the file in the worktree path using absolute paths for `Write` and the default-cwd for `Bash`. Final state has zero residual commits on main; worktree branch `worktree-agent-a31207d3` holds both plan commits cleanly.
- **Branch base drift at worktree start:** The worktree branch started at commit `fb7385f` (which had Phase 3/4 content from prior iterations), but the target base was `7175a03`. Per the worktree_branch_check protocol, performed `git reset --hard 7175a03` to align the worktree with the plan's stated base before beginning work.

## Known Stubs

None. The Plan 06 primer files (`brief/references/compliance/korea/pipa-2026.md`, `isms-p.md`, `mydata-2026.md`) are REFERENCED by `COMPLIANCE_PACK_TO_REFERENCE` but not yet written — they are Plan 06's deliverable. This is intentional and by design (plan dependency graph): Plan 01 defines the auto-attach mechanism; Plan 06 ships the primer content. No stub value flows into any UI or agent prompt.

## API Stability Declaration

`buildBusinessContext({cwd})` is declared **STABLE as of Phase 5 (2026-04-23)**. Phase 6 / 7 / 8 orchestrators and AUDIENCE workflow invocations will call it without wrapping. Future changes MUST be additive-only:

- Adding a new field to the returned object — allowed.
- Adding an optional `opts.*` parameter — allowed.
- Renaming a returned field — **NOT allowed** (breaking).
- Removing a returned field — **NOT allowed** (breaking).
- Changing the XML shape of `promptBlock` — **discouraged** (agents may parse by regex).

The `COMPLIANCE_PACK_TO_REFERENCE` map may gain new keys as the compliance library grows (Phase 7 / v2) — additive-only.

## Known Limitations

- **i18n: Korean and English only.** `language` is a closed enum of `'ko'` / `'en'`. Non-KR non-EN locales deferred to v1.x (05-CONTEXT.md `<deferred>` §8).
- **audience_policy validation: structural only.** The function reads the shape `{default, permitted[]}` without asserting that `default` is a member of `permitted`. That invariant check is a workflow-layer concern if needed.
- **No mid-workflow cache.** Every call re-reads `config.json` + `OBJECTIVES.md`. Acceptable because the helper is invoked at orchestrator-boundary moments (1–2 times per discover wave); read cost is <1 ms per call.
- **COMPLIANCE_PACK_TO_REFERENCE is Korea-only.** Non-Korean packs (GDPR, HIPAA, SOC 2) get no auto-attach; `requiredReading` silently drops unknown packs via `.filter(Boolean)`. Phase 7 extends the map (Korea → global expansion in `.planning/ROADMAP.md` line 136-140 scope).
- **Body scan has no size cap.** `detectKoreaSignals(body)` runs a regex over arbitrary-size OBJECTIVES.md bodies. Threat T-5-01-05 (ReDoS) was accepted — current Hangul + keyword regex has no known catastrophic backtracking; tested indirectly via Phase 3 Plan 04 fixtures. Monitor during Phase 9 HRD-04 pilot.

## User Setup Required

None — this plan ships only an internal library primitive + tests. No env vars, no external services, no secrets.

## Next Phase Readiness

- **Plan 05-02 (brief-domain-researcher spawn + wave orchestration):** Can `require('./brief/bin/lib/context-inject.cjs').buildBusinessContext({cwd})` and embed `ctx.promptBlock` in the Task-spawn prompt. The `ctx.requiredReading` array feeds the researcher's `required_reading:` frontmatter. Two-consumer parity test 3 is the canary; if Plan 02 observes drift between spawn-time prompt values and later AUDIENCE frontmatter values, it is a Plan 01 regression, not a Plan 02 bug.
- **Plan 05-04 (AUDIENCE gate):** Will call `buildBusinessContext()` from `brief/workflows/audience-guard.md` BEFORE writing the 6-field AUDIENCE frontmatter on research artifacts; `ctx.audienceDefaults` seeds `audience.role` / `voice.tone` / `voice.perspective` automatically.
- **Plan 05-06 (Korea compliance primers):** MUST ship the three primer files at the exact paths declared in `COMPLIANCE_PACK_TO_REFERENCE`. Mismatch = broken `required_reading` flow. Validation test recommended: `for pack in PIPA ISMS-P MyData; do test -f $(cat map) || fail; done`.
- **Phase 6/7/8:** The primitive is stable; no re-implementation needed. AUDIENCE (Plan 05-04) is the first replication target of the canonical pattern Phase 5 establishes; COMPLIANCE (Phase 7) and DELIVER Type B artifacts (Phase 8) inherit verbatim.

## Self-Check: PASSED

- **File existence (brief/bin/lib/context-inject.cjs):** FOUND (227 lines, ≤ 400 per D-18).
- **File existence (tests/brief-context-inject-roundtrip.test.cjs):** FOUND (186 lines).
- **File existence (tests/fixtures/context-inject/objectives-kr-b2b-fintech.md):** FOUND.
- **File existence (tests/fixtures/context-inject/objectives-global-b2c-consumer.md):** FOUND.
- **File existence (tests/fixtures/context-inject/config-kr-b2b.json):** FOUND.
- **File existence (tests/fixtures/context-inject/config-global-b2c.json):** FOUND.
- **Commit hash `90bd681` (Task 1):** FOUND in `git log`.
- **Commit hash `2556f5c` (Task 2):** FOUND in `git log`.
- **Automated test (all 5 pass):** VERIFIED (`node --test tests/brief-context-inject-roundtrip.test.cjs` → 5 pass, 0 fail, 67 ms).
- **A1 preservation:** VERIFIED (`node -e "..."` → `0` runtime dependencies).
- **Surface cap preservation:** VERIFIED (`git diff --name-only 7175a03..HEAD` shows zero `commands/brief/*` and zero `agents/*` file changes).

---
*Phase: 05-discover-parallel-research-with-provenance-audience-context-injection*
*Completed: 2026-04-23*
