---
phase: 07-design-workstream-orchestration-compliance-checker
plan: 04
subsystem: design-runtime
tags: [add-workstream, dynamic-addition, parameterized-agent, atomic-write]
wave: 3
requirements_completed:
  - DSG-10
dependency_graph:
  requires:
    - "07-03"   # /brief-design orchestrator (Step 4 spawns brief-workstream-designer agent shipped here)
    - "02-D-13" # workstream-loader.cjs 5-required-field validator (Phase 7 D-13 extends to 7)
    - "05-D-01" # parameterized agent precedent (brief-domain-researcher analog)
    - "05-D-15" # B2B/B2C conditional prose pattern (D-14 inheritance)
  provides:
    - "/brief-add-workstream <name>"   # NEW user-facing command (NET +1; combined with Plan 03 = NET +2 phase total)
    - "agents/brief-workstream-designer.md"   # parameterized DESIGN-side agent (Plan 03 Step 4 consumer)
    - "brief-tools.cjs add-workstream {check-collision,check-overlap,write}"   # 3 dispatcher subcommands
  affects:
    - "/brief-design <slug>"   # gains target agent for Step 4 spawn
    - "FND-08 acceptance"      # workstream addition without .cjs source change is now end-to-end
tech-stack:
  added: []   # zero new runtime deps (preserves zero-deps inheritance)
  patterns:
    - "Parameterized agent (Phase 5 D-01)"
    - "Atomic 3-file write with rollback (CONTEXT.md Risk Note inheritance)"
    - "Word-set overlap heuristic (CONTEXT.md Claude's Discretion D-11)"
key-files:
  created:
    - commands/brief/add-workstream.md
    - agents/brief-workstream-designer.md
    - brief/workflows/add-workstream.md
    - tests/brief-add-workstream-skeleton.test.cjs
    - tests/brief-add-workstream-collision.test.cjs
    - tests/brief-add-workstream-gates.test.cjs
  modified:
    - brief/bin/brief-tools.cjs   # case 'add-workstream' with 3 subcommands
decisions:
  - "Underscore preserved in slugify (matches _example existing slug)"
  - "emitYaml defensively backfills gates_required default (defense in depth for D-10)"
  - "TOCTOU collision re-check inside `add-workstream write` (Step 1 collision check is advisory; write subcommand is authoritative)"
  - "Rollback removes both files AND empty workstream dirs (no orphaned skeletons)"
  - "Word-set overlap filters tokens < 3 chars to reduce common-particle noise"
metrics:
  duration: 1h_03m
  completed_date: 2026-04-25T14:56:59Z
  tasks_completed: 3
  tests_added: 15
  files_created: 6
  files_modified: 1
---

# Phase 7 Plan 04: /brief-add-workstream + brief-workstream-designer Summary

**One-liner:** /brief-add-workstream ships a 1-session interactive Q&A flow that atomically writes a 3-file workstream skeleton (spec.yaml + design-prompts.md + templates/artifact.md) with name-collision BLOCK + role-overlap fork-or-new prompt + locked `gates_required: [align, audience, compliance]` default; the parallel parameterized brief-workstream-designer agent resolves Plan 03's Step 4 spawn target.

## Objective Achievement

Phase 7 D-09/D-10/D-11 / DSG-10 fully shipped:

| Decision | Implementation |
|----------|----------------|
| **D-09** — 4-6 plain-language Q&A | `brief/workflows/add-workstream.md` Steps 2 (Q1) + 3 (Q2-Q6) — 6 questions total: goal, artifact shape, B2B/B2C variant, compliance focus, depends_on, research prompts. Each AskUserQuestion has TEXT_MODE numbered-list fallback per FND-06. |
| **D-10** — `gates_required: [align, audience, compliance]` default | Locked in workflow Step 4 spec.yaml template; defensively backfilled by dispatcher `emitYaml()` even when caller omits the field; verified by `brief-add-workstream-gates.test.cjs`. |
| **D-11** — Name collision BLOCK + role-overlap fork-or-new | `check-collision` dispatcher returns `{collides, existing_slug}`; workflow Step 1 emits BLOCK error in Korean (`이미 ... 존재합니다`) when region == 'kr'. `check-overlap` returns `{overlap, candidates}` via word-set overlap > 50% heuristic; workflow Step 2.5 renders 3-branch AskUserQuestion (Extend / Genuinely new / Cancel). |
| **DSG-10** — Add workstream without .cjs source change | `loadWorkstreams()` (Phase 2 D-13) auto-discovers new folders; the new workstream is immediately available to `/brief-design <slug>` without code changes. |
| **OPEN QUESTION A6** — workstream-designer agent | Resolved: ONE parameterized `agents/brief-workstream-designer.md` serves all 9 built-in + custom-added workstreams via `{{WORKSTREAM_SLUG}}` + `{{BUSINESS_CONTEXT_REQUIRED_READING}}` injection at spawn time (Phase 5 D-01 precedent). |

## Files Shipped

### NEW (6)

- **`commands/brief/add-workstream.md`** — User-facing `/brief-add-workstream <name>` command shell. Frontmatter `name: brief:add-workstream`. argument-hint `<workstream-name> [--text]`. Allowed tools: Read, Write, Bash, AskUserQuestion. Pointer to workflow.

- **`agents/brief-workstream-designer.md`** — Parameterized DESIGN-side agent. tools: Read, Write, Grep, Glob (NO Task — leaf agent). color: yellow (non-collision with align/audience/gap-detector). Frontmatter `# hooks: none — invoked as orchestrator step from brief/workflows/design.md` (Anti-pattern #2 anchor). Anti-heredoc instruction. Provenance discipline inherited from Phase 5 CC-04 (VERIFIED|ASSUMED|FOUNDER-INPUT|CITED tags); Phase 7 D-15 FINANCIAL multiplier tags added. Ban-list = AUDIENCE + COMPLIANCE combined (artifact flows through both downstream gates so emitting these tokens generates finding noise).

- **`brief/workflows/add-workstream.md`** — Full workflow body (397 lines, within 200-400 budget). 7 Steps: 0 (TEXT_MODE + language) → 1 (collision BLOCK) → 2 (Q1 description) → 2.5 (overlap detection + fork-or-new) → 3 (Q2-Q6) → 4 (atomic 3-file write) → 5 (success message). `<no_hooks_assertion>` block.

- **`tests/brief-add-workstream-skeleton.test.cjs`** (4 tests) — T-07-11 mitigation: workflow documents 3-file write + rollback semantics; dispatcher implements rollback; end-to-end smoke test creates 3 files in real tmpDir.

- **`tests/brief-add-workstream-collision.test.cjs`** (7 tests) — T-07-10 mitigation: `_example` collides; BMC alias resolves to business-model-canvas + collides; novel slug passes; word-set overlap detected vs disjoint; workflow contains BLOCK error in Korean + English + 3-branch fork-or-new prompt.

- **`tests/brief-add-workstream-gates.test.cjs`** (4 tests) — T-07-12 mitigation: workflow carries D-10 default literal; 7 D-13 required fields present; dispatcher backfills default; smoke test asserts caller-omitted gates_required → backfilled in emitted YAML.

### MODIFIED (1)

- **`brief/bin/brief-tools.cjs`** — `case 'add-workstream'` registered (~250 lines) with 3 subcommands:
  - `check-collision --name <slug>` → `{collides: bool, existing_slug?: string}`. Resolves canonical aliases (BMC → business-model-canvas, etc.). slugify preserves underscore (so `_example` matches the real existing slug).
  - `check-overlap --name <slug> --description <desc>` → `{overlap: bool, candidates: string[]}`. Word-set overlap heuristic: lowercase, whitespace-split (with common punctuation), filter tokens < 3 chars, intersection / union > 0.5.
  - `write --name <slug> --spec-json <json> --design-prompts-content <content> --template-content <content>` → atomic 3-file write via `atomicWriteFileSync` per file + `commands.cmdCommit` (single git commit, --no-verify). On any throw: rollback unlinks all created files + empty workstream/templates dirs. TOCTOU defensive collision re-check before mkdir. `emitYaml()` is hand-rolled minimal serializer (zero deps) with defensive D-10 default backfill.

## Test Results

```
node --test tests/brief-add-workstream-skeleton.test.cjs \
            tests/brief-add-workstream-collision.test.cjs \
            tests/brief-add-workstream-gates.test.cjs

ℹ tests 15 / pass 15 / fail 0
```

Existing tests not broken:
- `tests/agent-frontmatter.test.cjs` — 4 brief-workstream-designer conformance tests pass (anti-heredoc, no skills, hooks pattern, required frontmatter fields).
- `tests/workstream-loader-{validation,discovery}.test.cjs` — 17/17 pass (no dispatcher regression).
- `tests/brief-design-{orchestration,gate-order,handoff}.test.cjs` — 10/10 pass (Plan 03 not regressed).

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All tasks in Plan 07-04 executed and committed atomically | ✓ 3 atomic commits |
| `commands/brief/add-workstream.md` created | ✓ |
| `brief/workflows/add-workstream.md` created (200-400 lines) | ✓ 397 lines |
| `agents/brief-workstream-designer.md` created (parameterized; conformance fixed) | ✓ |
| `brief/bin/brief-tools.cjs add-workstream` dispatcher | ✓ 3 subcommands |
| 3-file atomic skeleton write tested | ✓ smoke test green |
| Name collision BLOCK test passes | ✓ `_example` + BMC alias |
| Role overlap fork/new prompt test passes | ✓ workflow + dispatcher |
| `gates_required` default test passes | ✓ literal + smoke |
| SUMMARY.md created and committed | ✓ this file |
| No modifications to STATE.md or ROADMAP.md | ✓ executor instructions honored |
| All commits use `--no-verify` | ✓ |
| Conformance frontmatter pattern (`# hooks: none`) | ✓ tests/agent-frontmatter green |
| Anti-heredoc instruction (`never use \`Bash(cat << 'EOF')\` or heredoc`) | ✓ verbatim in `<file_writing_discipline>` |

## Deviations from Plan

None — plan executed as written. Two minor adjustments documented:

1. **Slugify rule extended to preserve underscore.** The plan's stub test contemplated `_example` as a collision target; my initial slugify stripped underscores and the test failed. Fixed inline (Rule 1: bug). Committed in the same Task 2 atomic commit. Rationale: `_example` is the genuinely-existing canonical demo workstream slug (Phase 2 ship), so the slugify must accept it; documented in code comment.

2. **Workflow trimmed by 5 lines after first draft (402 → 397).** The plan budget was ≤ 400 lines. Out-of-scope-deferred bullets compressed into a single sentence. No semantic change. Internal calibration, not a deviation.

## Threat Surface Scan

No new security-relevant surface beyond the registered T-07-10 / T-07-11 / T-07-12 mitigations. The 3 user-input fields (name, description, Q6 research prompts) all flow through:
- Slugify (defensive normalization)
- JSON.stringify in emitYaml (escapes special chars in YAML output — no injection risk)
- Filesystem path resolution via `path.join(cwd, 'brief', 'workstreams', slug)` — no traversal risk because slugify strips `/` and `..` characters

No threat flags raised.

## Self-Check: PASSED

Verified files exist:
```
commands/brief/add-workstream.md             FOUND
agents/brief-workstream-designer.md          FOUND
brief/workflows/add-workstream.md            FOUND
brief/bin/brief-tools.cjs                    FOUND (case 'add-workstream' registered)
tests/brief-add-workstream-skeleton.test.cjs   FOUND
tests/brief-add-workstream-collision.test.cjs  FOUND
tests/brief-add-workstream-gates.test.cjs      FOUND
```

Verified commits exist:
```
d6f7aff feat(07-04): add /brief-add-workstream command shell + brief-workstream-designer parameterized agent
b3bfcaf feat(07-04): add /brief-add-workstream workflow body + dispatcher case (Task 2)
ecb1bf0 test(07-04): Wave 0 unit tests for /brief-add-workstream (Task 3)
```

Verified tests green: 15/15 — `node --test tests/brief-add-workstream-{skeleton,collision,gates}.test.cjs`.
