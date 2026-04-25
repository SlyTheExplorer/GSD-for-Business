---
phase: 07
fix_iteration: 1
fix_scope: critical_warning
fixes_applied: 4
fixes_skipped: 0
fixes_failed: 0
findings_remaining: 0
fixed_at: 2026-04-26
---

# Phase 07: Code Review Fix Report

**Fixed at:** 2026-04-26
**Source review:** `.planning/phases/07-design-workstream-orchestration-compliance-checker/07-REVIEW.md`
**Iteration:** 1
**Scope:** critical_warning (Critical + Warning only; Info findings deferred)

**Summary:**
- Findings in scope: 4 (0 Critical + 4 Warning)
- Fixed: 4
- Skipped: 0
- Failed: 0

All 4 Warning-level findings (WR-01 through WR-04) were applied successfully. Each fix was verified via Tier-1 re-read plus Tier-2 syntax check (`node -c`), and where applicable a smoke test of the actual mutation against a temporary STATE.md. The full Phase 7 test suite (63 tests across 13 design / add-workstream / compliance / surface-cap files) was re-run after all fixes — all 63 pass.

## Fixed Issues

### WR-04: design.md `no_hooks_assertion` example regex too broad

**Status:** ✓ fixed
**File modified:** `brief/workflows/design.md:368`
**Commit:** `a4757da`
**Applied fix:** Replaced the documented grep example
`brief-design|design\.md|brief_design|compliance|add-workstream` (which incidentally hits the `compliance` substring inside `hooks/brief-validate-provenance.sh`'s ALLOWLIST_REGEX) with the narrower semantic-scoped pattern
`brief/workflows/design|brief-workstream-designer|brief/workflows/add-workstream|agents/brief-compliance-checker`. This matches the spirit of the actual `tests/brief-compliance-no-hooks.test.cjs` patterns (which were never broken — only the workflow-prose example was). Verified the new grep returns no matches (`! grep ... | exit 0`) on the current tree.

### WR-02: `state json --path` flag does not exist

**Status:** ✓ fixed
**File modified:** `brief/workflows/design.md:323`
**Commit:** `cdeaf7e`
**Applied fix:** Changed `node brief/bin/brief-tools.cjs state json --path brief.workstreams_completed` to `node brief/bin/brief-tools.cjs state json --pick brief.workstreams_completed --raw`. The CLI's actual top-level field-extraction flag is `--pick` (defined in `brief-tools.cjs:294-302`), not `--path`. Added `--raw` to suppress JSON-wrapper output so the downstream `design recommended-next --completed "$(...)"` parser receives a clean array string. Verified the corrected invocation against the live CLI.

### WR-03: `add-workstream write` YAML emitter does not quote array elements

**Status:** ✓ fixed
**File modified:** `brief/bin/brief-tools.cjs:1034-1056`
**Commit:** `7f4b8b0`
**Applied fix:** Added per-element `JSON.stringify` to the `compliance_packs` array emission so user-supplied "Other" branch values containing commas / colons / brackets / parentheses (e.g. `"DSL, eIDAS"` or `"GDPR Art. 5(1)(e)"`) survive the YAML round-trip via `yaml-mini.cjs parseYamlDocument`. **Scope reduction from review's suggestion:** the review suggested quoting all three array fields (`gates_required`, `depends_on`, `compliance_packs`); after running `tests/brief-add-workstream-gates.test.cjs` against a full per-element-quote variant and observing test 4 (line 108) assert the exact unquoted format `gates_required: [align, audience, compliance]`, the fix was narrowed to ONLY quote `compliance_packs` (the actually-affected field — gates and depends_on values are constrained canonical slugs validated server-side). The locked-literal test contract is preserved. Smoke-tested the fix end-to-end: emitted YAML with multi-special-char values (`["PIPA", "DSL, eIDAS", "GDPR Art. 5(1)(e)"]`) parses back to the original 3 distinct elements via `yaml-mini.cjs`.

### WR-01: `brief-tools state set --path` invoked but dispatcher subcommand does not exist

**Status:** ✓ fixed
**Files modified:** `brief/workflows/design.md:137-147` (workstream_paused), `brief/workflows/design.md:292-303` (last_design_workstream + workstreams_completed), `brief/workflows/design-financial-qa.md:160-168` (financial_drivers)
**Commit:** `bcb3a48`
**Applied fix:** Used Option (b) per the review (rewrite the 3 workflow call-sites; do NOT add a new dispatcher subcommand). Each of the 3 sites now invokes a Node one-liner that:
1. Requires `readModifyWriteStateMd` from `state.cjs` (re-uses the existing state-lock atomic read-modify-write pattern, same as Phase 6 `gap-detect.cjs:110`).
2. Requires `extractFrontmatter` / `reconstructFrontmatter` / `stripFrontmatter` from `frontmatter.cjs`.
3. Requires `planningPaths` from `core.cjs` for the STATE.md path resolution.
4. Mutates `fm.brief.<field>` defensively (`fm.brief = fm.brief || {}`) — preserves any sibling brief.* keys already in STATE.md.
5. For `workstreams_completed`: append-only with dedup (skip push if `slug` already in array).

**Why Option (b) over Option (a):** the phase context constraint "Phase 7 NET +2 commands... Do NOT add new sub-commands" was interpreted conservatively to apply to dispatcher subcommands too, despite the surface-cap doc carving them out of the cap. Option (b) is purely workflow-markdown change with zero CJS code mutation, lowest blast radius. The Node one-liner pattern matches the existing precedent in `design.md` Step 3 (`buildBusinessContext` one-liner) and `discover.md` Step 4.

**Smoke test:** All 3 one-liners were exercised against a temporary STATE.md that already contained an unrelated `brief.some_other` field. Outcomes verified:
- `workstream_paused`: nested object with array field round-trips correctly; sibling `some_other` preserved.
- `last_design_workstream + workstreams_completed`: scalar set, array appended; second invocation with different slug appends; third invocation with duplicate slug deduplicates correctly.
- `financial_drivers`: scalar path string written; all prior brief.* keys preserved.

**Logic-bug consideration:** the dedup-on-append behavior in the workstreams_completed write is new (the review-suggested fix only specified write semantics). This is per the workflow's own description "(a list — append-only, deduped)". Marked as `fixed` rather than `fixed: requires human verification` because the dedup is a strict superset of the originally described "append-only" contract — it cannot lose data, only prevent duplicate growth.

## REVIEW-FIX COMPLETE
