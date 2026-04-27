# BRIEF Surface Audit — v1 Launch

**Audited:** 2026-04-27
**Cap source:** CLAUDE.md "Surface Caps" section (Phase 2 D-09); HRD-02 closure (Phase 9)
**Enforcement:** Surface cap is documentation-enforced per Phase 2 D-07. No pre-commit hook blocks new command additions; reviewer discipline maintains the cap. (W10 revision iteration 1 — explicit note to prevent ambiguity: this audit doc is the v1 enforcement mechanism, not a runtime gate.)
**Status:** PASS — 12 commands ≤ 12 cap; 0 skills ≤ 8 cap

## User-Facing Commands (12 / 12 cap)

| # | Command | Category | Phase introduced | One-line rationale |
|---|---------|----------|------------------|---------------------|
| 1 | `/brief-define`         | DEFINE   | Phase 3 | Conversational intent extraction (DEF-01) |
| 2 | `/brief-discover`       | DISCOVER | Phase 5 | Parallel research with provenance (DSC-01) |
| 3 | `/brief-design`         | DESIGN   | Phase 7 | 9-workstream orchestration (DSG-10) |
| 4 | `/brief-add-workstream` | DESIGN   | Phase 7 | Dynamic workstream addition (DSG-10) |
| 5 | `/brief-deliver`        | DELIVER  | Phase 8 | Type A + Type B artifact synthesis (DLV-01..09) |
| 6 | `/brief-export`         | DELIVER  | Phase 8 | Mandatory Type B audience-confirm gate (DLV-08) |
| 7 | `/brief-status`         | HELPERS  | Phase 2 | Compact dashboard render (FND-10) |
| 8 | `/brief-help`           | HELPERS  | Phase 9 | Categorized command listing + Levenshtein (HRD-03) |
| 9 | `/brief-init`           | HELPERS  | Phase 1 | Project initialization (inherited; renamed from `new-project`) |
| 10 | `/brief-progress`       | HELPERS  | Phase 1 | Progress reporting (inherited helper) |
| 11 | `/brief-undo`           | HELPERS  | Phase 1 | Undo last orchestrator action (inherited helper) |
| 12 | `/brief-pause-work`     | HELPERS  | Phase 1 | Pause + restore state (inherited helper) |

## Skills (0 / 8 cap)

`.claude/skills/` is empty in v1. The 8-skill cap is reservation, not allocation — v1.x adds skills as evidence-driven (per A-D03).

## Removed in v1 (56 commands deleted from `commands/brief/`)

> All deleted commands preserved on `backup/original-gsd` branch (at the original `commands/gsd/{name}.md` path, since the branch predates the Phase 1 `gsd-*` → `brief-*` hard rename).
> Recovery: `git show backup/original-gsd:commands/gsd/{name}.md > commands/brief/{name}.md` (then re-add Phase 1 rename pattern manually if reviving). Verify the file exists in the backup tree first via `git ls-tree -r backup/original-gsd --name-only | grep {name}.md`.

NOTE on count: this section enumerates 56 deleted slugs. Wave 0 fixture `brief-surface-audit-install-cleanup.test.cjs` carries a Rule-1 deviation note documenting the constant was renamed from `DELETED_56` → `DELETED_57` because the filesystem-true count is 57 (the 56 above PLUS `new-project` which is RENAMED to `init.md` rather than deleted; see footnote below).

### Inherited GSD developer surfaces (28)

- `audit-fix.md`
- `audit-uat.md`
- `audit-milestone.md`
- `analyze-dependencies.md`
- `autonomous.md`
- `check-todos.md`
- `cleanup.md`
- `complete-milestone.md`
- `do.md`
- `docs-update.md`
- `explore.md`
- `fast.md`
- `health.md`
- `import.md`
- `intel.md`
- `manager.md`
- `milestone-summary.md`
- `new-milestone.md`
- `new-workspace.md`
- `profile-user.md`
- `quick.md`
- `reapply-patches.md`
- `scan.md`
- `session-report.md`
- `set-profile.md`
- `settings.md`
- `stats.md`
- `thread.md`
- `update.md`

### Inherited GSD orchestrator surfaces, not yet domain-mapped (28)

- `add-backlog.md`
- `add-phase.md`
- `add-todo.md`
- `discuss-phase.md`
- `execute-phase.md`
- `extract_learnings.md`
- `from-gsd2.md`
- `insert-phase.md`
- `join-discord.md`
- `list-phase-assumptions.md`
- `list-workspaces.md`
- `map-codebase.md`
- `next.md`
- `note.md`
- `plan-milestone-gaps.md`
- `plan-phase.md`
- `plant-seed.md`
- `remove-phase.md`
- `remove-workspace.md`
- `research-phase.md`
- `resume-work.md`
- `review.md`
- `review-backlog.md`
- `spec-phase.md`
- `validate-phase.md`
- `verify-work.md`
- `workstreams.md`
- `new-project.md` †

† **Footnote:** `new-project.md` was RENAMED to `init.md` per A-D01 lineup (slug `init`); the file content is preserved and re-shaped to `/brief-init` in the locked 12-cmd lineup, NOT deleted. Listed in this group for completeness — its surface slot is replaced by `init`.

**Total verified:** 28 + 28 = 56 deleted slugs (Inherited developer + Inherited orchestrator). Plus 1 renamed (new-project → init) = 57 disposition decisions.

## Recovery

> All deleted commands preserved on `backup/original-gsd` branch (at the original `commands/gsd/{name}.md` path, since the branch predates the Phase 1 `gsd-*` → `brief-*` hard rename).
> Recovery: `git show backup/original-gsd:commands/gsd/{name}.md > commands/brief/{name}.md` (then re-add Phase 1 rename pattern manually if reviving). Verify the file exists in the backup tree first via `git ls-tree -r backup/original-gsd --name-only | grep {name}.md`.

## Cap Discipline (W10)

This audit doc is the v1 launch enforcement mechanism. The Phase 2 D-07 decision committed to **documentation-enforced** caps (no pre-commit hook, no automated gate). Reviewer discipline maintains the cap going forward; future plans MUST justify any addition that pushes the cap, and the SURFACE-AUDIT.md table MUST be re-issued whenever the surface changes. v1.1+ may revisit automation if cap drift emerges as a real failure mode.
