# Phase 2: Stable Seam — Anchor Schema, Caps, Workstream-as-Config - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 02-CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18
**Phase:** 02-stable-seam-anchor-schema-caps-workstream-as-config
**Areas surfaced:** A4 verification + state.brief.* schema, Surface caps, workstream-spec.yaml schema/loader, /brief-status output
**Discussion mode:** Delegated — user is non-technical product owner; Claude held implementation decisions; user decided 1 surface-visible UX item.

---

## Mode pivot

Initial gray-area selection prompt was issued. User responded:

> "이걸 하다보니 비개발자인 내가 이 작업을 하는게 맞나 싶네"

(Translation: "Doing this, I'm wondering if I — a non-developer — am the right person for this work.")

This was identified as a real signal, not a brush-off. The discussion pivoted to **delegated mode**: Claude takes implementation decisions (because Phase 2 is plumbing-heavy: schema, caps, loader, status reader); user is asked only about decisions that affect BRIEF's user experience for future non-developer planners.

User confirmed: "응 그럼 그렇게 진행해 보자."

---

## A4 Verification + state.brief.* Schema

**Mode:** Claude's discretion.

| Option | Description | Selected |
|--------|-------------|----------|
| `node:test` smoke at `tests/state-brief-roundtrip.test.cjs` | Two-write-cycle round-trip; matches BRIEF's existing test pattern | ✓ |
| Standalone bash smoke script | Faster to write, harder to integrate with `npm test` and c8 coverage | |
| Manual smoke via repl | Loses CI integration | |

**Encoding chosen:** Single nested `brief:` map in YAML frontmatter (vs. flat dot keys `brief.return_stack:`). Nested maps round-trip cleanly through standard YAML parsers; flat dot keys tend to lose during normalize-on-write.

**Schema fields locked:** `return_stack`, `gap_queue`, `last_gate_results.{align, audience, compliance}`, `current_workstream`. Forward-declared so Phase 4/5/6/7 can write into them without mutating shape.

**`gsd_state_version` → `brief_state_version`:** Migrated atomically in the same commit. No backwards-compat reader (Phase 1 D-07 enforcement).

**Fallback:** If A4 fails verification, switch to sidecar `.planning/state-brief.json` + new helper `brief/bin/lib/state-brief.cjs`. Plan-phase MUST plan both happy and fallback lanes.

---

## Surface Caps — Scope and Enforcement

**Mode:** Claude's discretion (UX-relevant deferred to Phase 9 HRD-02 audit).

| Option | Description | Selected |
|--------|-------------|----------|
| Documentation-only (CLAUDE.md `## Surface Caps`) | Establishes policy text + definition of "user-facing"; defers enforcement to launch audit | ✓ |
| Pre-commit hook blocking command additions over cap | Mid-stream blocking; over-engineering for a single requirement | |
| CI check counting commands on PR | Useful but BRIEF has no CI yet; premature | |

**Counting rule chosen:** "user-facing" = what `bin/install.js` registers under `commands/<runtime>/brief/`. Internal helpers and sub-commands routed through a parent command don't count.

**Reduction strategy:** Phase 2 adds 1 command (`/brief-status`); Phases 3–8 add only requirement-mapped domain commands; **Phase 9 HRD-02** does the actual prune from current 61 → ≤12. Phase 2 cannot pre-decide which 49 disappear.

---

## workstream-spec.yaml Schema and Loader

**Mode:** Claude's discretion (field set is dictated by REQUIREMENTS).

| Option | Description | Selected |
|--------|-------------|----------|
| `brief/workstreams/<name>/spec.yaml` + sibling `templates/` dir | Co-locates spec + templates per workstream | ✓ |
| Single flat `brief/workstreams/specs/*.yaml` | Easier glob, harder to co-locate templates | |
| Sub-folder of `brief/templates/` | Mixes workstream definitions with general templates | |

**Discovery:** Glob `brief/workstreams/*/spec.yaml`. Directory IS the registry. No explicit `index.yaml`.

**YAML parser:** Inline mini-parser extending `brief/bin/lib/frontmatter.cjs` — supports string/number/boolean/null/list/nested-map; not full YAML 1.2. Zero-runtime-deps rule (A1) prevents `js-yaml`. `npx --yes` is wrong for a hot path (loader runs on every `/brief-design`).

**Schema locked** (D-13): required `name, description, research_prompts[], design_prompts[], output_artifact_template`; optional `business_model_variants{b2b,b2c}, region_overrides{}, audience_default{}`.

**Phase 2 ships:** Loader + ONE example workstream (`brief/workstreams/_example/`). The 9 real built-in workstreams are Phase 7 content.

---

## /brief-status Skeleton

**Mode:** USER-DECIDED — output shape.

**Question presented:** "/brief-status 명령어가 한 화면에 어떻게 보이면 좋을까요?"

| Option | Description | Selected |
|--------|-------------|----------|
| Compact dashboard | Two-column fixed-width layout; high info density; fits compact terminal sessions | ✓ (recommended) |
| Narrative summary | Natural-language paragraph; friendlier but consumes vertical space | |
| Checklist view | Phase-completion checkboxes per gate; risk of duplicating ROADMAP info | |

**Preview content the user selected** (rendered exactly):

```
BRIEF Status
================================
  Phase           2 of 9 (Stable Seam)
  Workstream      — (none active)
  Return stack    0 / 3
  Last ALIGN      — (none yet)
  Last COMPLIANCE — (none yet)
--------------------------------
  Next: /brief-plan-phase 2
```

**User's choice:** Compact dashboard.

**Notes:**
- All other `/brief-status` implementation decisions (resilience on missing fields, logic location, output stream) delegated to Claude per the mode pivot.
- D-17 resilience rule: missing `state.brief.*` fields render `— (none yet)` instead of erroring.
- Phase 2 ships English-only output. Korean toggle deferred to Phase 9 HRD-03.

---

## Claude's Discretion (carried forward)

The following were explicitly delegated to the planner:

- Internal organization of `brief/bin/lib/status.cjs` (one function vs. helper split)
- Test file granularity for the workstream loader (one big test or split)
- Whether the inline YAML parser becomes its own module or extends `frontmatter.cjs` directly (target: keep `frontmatter.cjs` < ~400 lines)
- Exact text of CLAUDE.md `## Surface Caps` section (faithful to D-06–D-09)
- Commit ordering within Phase 2 (suggested 5-commit sequence in CONTEXT.md D-19; planner may merge or split)

---

## Deferred Ideas (carried forward)

- Pre-commit hook for surface cap enforcement → Phase 9 HRD-02
- `/brief-status --json` mode → Phase 9 HRD-03
- 9 real built-in workstream YAMLs → Phase 7
- Reduction of inherited 61 commands / 18 agents → Phase 9 HRD-02
- `/brief-init` first-run command → Phase 3 `/brief-define` covers it implicitly
- `gsd_state_version` backwards-compat reader → rejected per Phase 1 D-07
- Korean-language `/brief-status` → Phase 9 HRD-03
- `ajv` schema validation library → rejected per zero-deps rule
