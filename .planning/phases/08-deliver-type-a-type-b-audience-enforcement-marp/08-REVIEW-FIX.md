---
phase: 08
fixed_at: 2026-04-27
review_path: .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 8: Code Review Fix Report

**Fixed at:** 2026-04-27
**Source review:** .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (2 BLOCKER + 5 WARNING; 6 INFO items skipped per orchestrator scope)
- Fixed: 7
- Skipped: 0
- Tests: 118/118 Phase 8 tests pass (was 116 baseline; +2 new BR-01/BR-02 regression tests per fix-c)
- Phase 4·5·7 vocabulary-lock regression: 17/17 pass
- A1 zero-runtime-deps preserved (0 dependencies)

## Fixed Issues

### BR-01 + BR-02: synthesizeTypeA TWO frontmatter blocks + flat-dotted unreadable by AUDIENCE parser

**Files modified:**
- `brief/bin/lib/deliver.cjs` (BR-01: stripFrontmatter on template before INSERT-fill; BR-02: nested fm structure)
- `brief/templates/deliver/type-a/product-brief.md` (BR-02: nested YAML)
- `brief/templates/deliver/type-a/service-policy.md` (BR-02: nested YAML)
- `brief/templates/deliver/type-a/high-level-spec.md` (BR-02: nested YAML)
- `brief/templates/deliver/type-a/feature-map.md` (BR-02: nested YAML)
- `brief/templates/deliver/type-b/internal-deck.md` (BR-02: nested YAML; preserved Marp directives)
- `brief/templates/deliver/type-b/proposal-deck.md` (BR-02: nested YAML; preserved Marp directives)
- `brief/templates/deliver/type-b/exec-summary.md` (BR-02: nested YAML)
- `brief/templates/deliver/type-b/decision-memo.md` (BR-02: nested YAML)
- `tests/brief-deliver-type-a.test.cjs` (Tests 1+2: nested-form regex assertions)
- `tests/brief-deliver-type-a-templates.test.cjs` (Tests 3+9: nested-form assertions)
- `tests/brief-deliver-type-b-templates.test.cjs` (Test 9: nested-form mandatory-field map)
- `tests/brief-deliver-ko-en-branching.test.cjs` (ko/en 1-4: nested voice.languages match)
- `tests/brief-deliver-canary-e2e.test.cjs` (Flow 1: nested voice.languages assertion + 2 NEW regression tests fix-c)

**Commit:** db40b12

**Applied fix:**
Coordinated fix per reviewer:
- (a) Added `let body = stripFrontmatter(template);` at deliver.cjs line 261 before INSERT-fill so synthesized output has exactly ONE leading frontmatter block (BR-01).
- (b) Restructured deliver.cjs `fm` object to nested form (`audience: { type, confidentiality }`, `voice: { tone, perspective, languages }`, `business_context: { model, region }`) AND restructured all 8 Type A/B templates' frontmatter to nested YAML so the shared parser (frontmatter.cjs:88 — key regex `[a-zA-Z0-9_-]+:` excludes `.`) can read every field. Type B Marp templates retain top-level Marp directives (marp:true / theme: / paginate: / footer:) outside the audience/voice/business_context nesting (BR-02).
- (c) Added two NEW canary regression tests to brief-deliver-canary-e2e.test.cjs (`canary E2E BR-01 regression` + `canary E2E BR-02 regression`) that synthesize against PRODUCTION templates (not stubs) and assert (1) exactly ONE leading frontmatter block + no literal placeholder leak, AND (2) audience.runAudience returns severity !== 'blocking' AND decision !== 'DRIFTED-frontmatter'. These two assertions would have caught both BR-01 and BR-02 at canary time.

### WR-01: `{{watermark_text}}` placeholder unfilled by any workflow step

**Files modified:**
- `brief/workflows/deliver.md` (added Step 3B.2a watermark substitution)
- `brief/workflows/export.md` (added Step 7a defensive idempotent re-substitution)

**Commit:** b3da56d

**Applied fix:**
Per reviewer's preferred approach (workflow-side substitution): added a Step 3B.2a in `brief/workflows/deliver.md` that runs after the agent emits the artifact and BEFORE voice-fit check (3B.3). The new step calls `watermarkFor(audience.confidentiality, language)` from Plan 04 export.cjs and splits the placeholder string in-place. Mirrors the voice-fit dispatch pattern (read frontmatter → derive context → write).

Defense-in-depth: added Step 7a to `brief/workflows/export.md` for an idempotent re-substitution before Marp render so post-deliver edits that re-introduce the placeholder do NOT survive into the rendered PPTX. Both steps are skipped for exec-summary and decision-memo (no Marp, no watermark placeholder).

### WR-02: `--gate` flag silently disables both gates on typo

**Files modified:**
- `brief/bin/brief-tools.cjs` (added VALID_EXPORT_GATES enum check at `case 'export'` entry)

**Commit:** 7926a9b

**Applied fix:**
Per reviewer recommendation: added `const VALID_EXPORT_GATES = new Set(['audience', 'compliance', 'both']);` validation at the top of `case 'export'`, before either `'run'` or `'render'` subcommand branch. When `--gate` is set to a non-enum value (e.g., typo `audiece`), `core.error()` is invoked which prints to stderr and exits 1. Manually verified: `brief-tools export run --gate audiece ...` exits non-zero with `Error: export: --gate must be one of audience | compliance | both (got: 'audiece')`. The check runs once and is shared across both subcommands.

### WR-03: `exportArtifact` JSDoc claims "all 3 gates" but only 2 run

**Files modified:**
- `brief/bin/lib/export.cjs` (updated `@param options._gate` JSDoc)

**Commit:** 543c786

**Applied fix:**
Rewrote the @param description on line 349 to accurately reflect "default null = run BOTH AUDIENCE and COMPLIANCE re-runs" and explicitly note ALIGN is not re-evaluated at export time. Cross-references workflows/deliver.md Step 3A.3 / 3B.4 as the canonical ALIGN evaluation point, and notes export.cjs re-runs only AUDIENCE+COMPLIANCE for export-time staleness detection per Phase 7 D-02 fail-fast on AUDIENCE blocking. Documentation-only correction; no code change.

### WR-04: `marp-environment.md` documents fallback that `renderMarp` never implements

**Files modified:**
- `brief/references/marp-environment.md` (replaced false marp-on-PATH fallback claim with cache-pre-warm guidance)

**Commit:** 44ec3a5

**Applied fix:**
Per reviewer's preferred approach (Approach 1, smaller blast radius): replaced the false claim ("Then `/brief-export` falls back to invoking `marp` directly from PATH instead of `npx`. The CLI on PATH is detected first; npx is only used as the second-choice path.") with accurate cache-pre-warm guidance. The global install DOES populate the npm cache as a side effect, but `/brief-export` ALWAYS spawns `npx` and does NOT detect / prefer the global binary on PATH. Documented this clearly so users who need direct-marp dispatch know to invoke marp manually on the artifact source.

### WR-05: `voice-fit-vocabulary.md` documents wrong honorific regex (negative lookahead vs actual positive)

**Files modified:**
- `brief/references/voice-fit-vocabulary.md` (boundary semantics section rewritten to match shipped regex)

**Commit:** b84bae4

**Applied fix:**
Per reviewer recommendation: rewrote the boundary semantics section to document the actual positive-lookahead pattern `(?=[.!?]|$)` per the Plan 02 GREEN deviation that ships in voice-fit.cjs:54. Listed the false-positive suppression cases (particles mid-sentence + noun + particle forms), called out the remaining edge case (single noun sentence-final without particle), and referenced the Plan 02 GREEN deviation history. Mirrors the inline comment block in voice-fit.cjs:35-54. Documentation-only correction.

---

_Fixed: 2026-04-27_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
