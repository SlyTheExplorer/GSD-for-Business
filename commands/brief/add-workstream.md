---
name: brief:add-workstream
description: BRIEF — Add a custom workstream via 1-session interactive Q&A. Auto-generates spec.yaml + design-prompts.md + templates/artifact.md skeleton with name-collision BLOCK + role-overlap fork-or-new prompt. Default `gates_required: [align, audience, compliance]`. Phase 7 D-09/D-10/D-11.
argument-hint: "<workstream-name> [--text]"
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---
<objective>
Add a custom workstream without touching `.cjs` source (FND-08 / DSG-10 acceptance).
4-step flow: (1) Name validation — slugify + collision BLOCK against canonical aliases or existing folders (D-11);
(2) Role-overlap detection — heuristic word-set overlap > 50% with an existing workstream's description triggers "extend or new" 2-branch AskUserQuestion (D-11);
(3) 4-6 plain-language Q&A — goal / artifact shape / B2B-B2C variant / compliance focus / depends_on / research prompts (D-09);
(4) Atomic 3-file skeleton write — spec.yaml (gates_required default `[align, audience, compliance]` per D-10) + design-prompts.md (with B2B/B2C conditional blocks when Q3 = Y) + templates/artifact.md (skeleton matching Q2 answer); rollback on partial failure.
Korean is the default voice when state.brief.region == 'kr'; English fallback. TEXT_MODE numbered-list rendering replaces every AskUserQuestion when `--text` is in $ARGUMENTS or workflow.text_mode is true (FND-06).
</objective>

<execution_context>
@~/.claude/brief/workflows/add-workstream.md
</execution_context>

<process>
Execute the add-workstream workflow: parse `<workstream-name>` from `$ARGUMENTS`; slugify and resolve canonical aliases (BMC → business-model-canvas, GTM → go-to-market, etc.); call `brief-tools add-workstream check-collision --name <slug>` and exit on collide=true with the structured BLOCK error (Korean for state.brief.region == 'kr'); ask Q1 (goal / description) and call `brief-tools add-workstream check-overlap --name <slug> --description <q1>` to detect role overlap (≥ 50% word-set with an existing description), rendering a "extend existing / genuinely new / cancel" AskUserQuestion when overlap is detected; ask Q2-Q6 (artifact shape / B2B-B2C variant / compliance focus / depends_on / optional research prompts); build the 3 file payloads (spec.yaml with `gates_required: [align, audience, compliance]` default, design-prompts.md with conditional blocks when Q3 = Y, templates/artifact.md skeleton matching Q2); call `brief-tools add-workstream write` to atomically write all 3 files (rollback on partial failure); print success message + 3-step next-steps hint.

See brief/workflows/add-workstream.md for the full workflow detail.
</process>
