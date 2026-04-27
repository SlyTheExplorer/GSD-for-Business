---
phase: 09-hardening-cross-runtime-smoke-non-developer-pilot
plan: 05
subsystem: surface-pruning/architectural-keystone
tags: [HRD-02, surface-cap, atomic-delete, A-D01, A-D02, A-D03, A-D04, wave-3]
requires:
  - backup/original-gsd branch (recovery path per A-D02)
  - tests/brief-surface-audit-count.test.cjs (Wave 0 fixture, 09-00)
  - tests/brief-surface-audit-install-cleanup.test.cjs (Wave 0 fixture, 09-00)
  - tests/brief-surface-audit-doc.test.cjs (Wave 0 fixture, 09-00)
  - .planning/phases/09-.../09-PATTERNS.md (SURFACE-AUDIT.md schema lines 695-736)
provides:
  - .planning/SURFACE-AUDIT.md (NEW — 110-line v1 launch surface audit doc)
  - commands/brief/init.md (RENAMED from new-project.md per A-D01 / Open Question 1)
  - 12-locked user-facing slash command surface (down from 68 inherited GSD commands)
  - All 12 LOCKED_12 commands carry name: brief:* frontmatter (zero gsd: drift)
  - HRD-02 success criterion CLOSED (Phase 9 ROADMAP item #2)
  - Pitfall #1 (skill bloat) and Pitfall #12 (slash-cmd memorability) mitigated for v1 launch
affects:
  - commands/brief/ (55 deletions + 1 rename + 3 frontmatter rewrites + 1 fresh init.md)
  - bin/install.js (12 user-facing /brief-new-project hint strings → /brief-init)
  - CLAUDE.md (Surface Caps section updated to v1 final state, references SURFACE-AUDIT.md)
tech-stack:
  added: []
  patterns:
    - Atomic single-commit deletion of 55 files + 1 rename + 5 modifications (Pitfall 1 mitigation)
    - Worktree-isolated agent execution (Phase 8 cwd-bug discipline)
    - Backup-branch preservation as rollback path (A-D02; backup/original-gsd predates Phase 1 rename so files live at commands/gsd/{name}.md)
    - Documentation-enforced surface cap (Phase 2 D-07; no pre-commit hook in v1; reviewer discipline)
key-files:
  created:
    - .planning/SURFACE-AUDIT.md
  modified:
    - bin/install.js
    - CLAUDE.md
    - commands/brief/init.md (renamed from new-project.md; frontmatter brief:init)
    - commands/brief/pause-work.md (sed: name: gsd:* → brief:*)
    - commands/brief/progress.md (sed: name: gsd:* → brief:*)
    - commands/brief/undo.md (sed: name: gsd:* → brief:*)
  deleted: 55 files (DELETED_56 minus new-project which was renamed)
decisions:
  - "Single atomic commit (3a1204d) lands all 55 deletions + 1 rename + 5 modifications + 1 new SURFACE-AUDIT.md file; partial state never reaches main per Pitfall 1 contract"
  - "Follow-up doc-clarity commit (47956b3) corrects backup/original-gsd recovery hint path: original GSD files live at commands/gsd/{name}.md NOT commands/brief/{name}.md, since the backup branch predates the Phase 1 gsd-* → brief-* hard rename — discovered as Rule 1 deviation during post-commit verification"
  - "bin/install.js had ZERO slug-by-slug references to delete (Phase 1 D-08 already cleaned that up); install.js work in this plan was limited to updating the 12 post-install /brief-new-project user-hint strings to /brief-init"
  - "All 12 LOCKED_12 commands now carry name: brief:* frontmatter; only 3 retained commands (pause-work, progress, undo) had gsd: drift before this plan; the other 9 were already on brief: from prior phases"
  - "SURFACE-AUDIT.md uses 28+28 phase-introduced grouping per RESEARCH.md Discretion-4: Inherited GSD developer surfaces (28) + Inherited GSD orchestrator surfaces, not yet domain-mapped (28); the 56-entry total includes new-project.md with a footnote (†) noting the rename to init.md rather than deletion"
  - "W10 documentation-enforcement note added explicitly to SURFACE-AUDIT.md: surface cap is documentation-enforced per Phase 2 D-07; no pre-commit hook blocks new command additions; reviewer discipline maintains the cap"
metrics:
  duration: "0m 28s"
  completed: "2026-04-27"
  tasks: 1
  files_modified: 7
  files_deleted: 55
  files_renamed: 1
  files_created: 1
  commits: 2
---

# Phase 09 Plan 05: HRD-02 Surface Pruning Summary

One-liner: Atomic 55-file deletion + new-project.md→init.md rename + bin/install.js cleanup + SURFACE-AUDIT.md generation + CLAUDE.md sync — closing HRD-02 (the architectural keystone of Phase 9) by reducing the user-facing slash-command surface from 68 inherited GSD commands to the locked 12 BRIEF commands.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | [WORKTREE-ISOLATED AGENT] Atomic 56-file deletion + new-project.md→init.md rename + 11-file sed bulk-rewrite + bin/install.js cleanup + SURFACE-AUDIT.md + CLAUDE.md update | `3a1204d` | 63 changed: 55 D, 1 R, 1 A, 5 M (commands/brief/*.md × 4, bin/install.js, CLAUDE.md, .planning/SURFACE-AUDIT.md) |
| 1+follow-up | Rule 1 deviation: fix backup/original-gsd recovery hint path | `47956b3` | 1 modified (.planning/SURFACE-AUDIT.md) |

## Final Disk State

`commands/brief/*.md` count: **12** (down from 68; 55 deleted + 1 renamed = 56 dispositions per A-D02).

12 retained slugs (alphabetical): `add-workstream`, `define`, `deliver`, `design`, `discover`, `export`, `help`, `init`, `pause-work`, `progress`, `status`, `undo`.

LOCKED_12 match verified via:
```bash
ls commands/brief/*.md | sed 's|commands/brief/||;s|\.md$||' | sort > /tmp/actual.txt
printf "%s\n" add-workstream define deliver design discover export help init pause-work progress status undo | sort > /tmp/expected.txt
diff /tmp/actual.txt /tmp/expected.txt  # MATCH (empty diff)
```

All 12 retained commands carry `name: brief:*` frontmatter (zero gsd: drift):
```bash
grep -lE "^name: brief:" commands/brief/*.md | wc -l  # 12
grep -l "^name: gsd:" commands/brief/*.md  # (empty)
```

## bin/install.js Cleanup Count

**Slug-by-slug refs removed: 0.** Phase 1 D-08 already cleaned every `commands/brief/{deleted-slug}.md` reference from bin/install.js — this plan inherited an already-clean file at the slug level. Wave 0 fixture `brief-surface-audit-install-cleanup.test.cjs` confirms 57/57 GREEN with zero refs to any DELETED_57 slug (regex `['"\\/]${slug}\.md['"\\)]` matches nothing).

**User-facing hint strings rewritten: 12.** The post-install user-hint at lines 6484-6495 (`let command = '/brief-new-project'; if (runtime === 'opencode') ...`) was rewritten across all 12 runtime branches to use `/brief-init` consistent with the rename. `node -c bin/install.js` parses cleanly post-edit.

## SURFACE-AUDIT.md Schema Verification

**Lines:** 110 (≥80 acceptance threshold).
**First line:** `# BRIEF Surface Audit — v1 Launch`.
**Numbered LOCKED_12 rows in commands table:** 12.
**"Removed in v1 (56 commands deleted ...)" header:** present (matches fixture regex `/##\s+Removed in v1.*(56|57)\s+commands/i`).
**Skills 0/8 cap section:** present (2 mentions).
**backup/original-gsd recovery references:** 4.
**W10 documentation-enforced note:** present (2 mentions of "documentation-enforced", "Phase 2 D-07", or "reviewer discipline").
**Phase-introduced grouping:** 28 Inherited GSD developer + 28 Inherited GSD orchestrator (= 56), with `new-project.md` carrying a `†` footnote documenting the rename-to-init disposition.

## CLAUDE.md Surface Caps Update

The `## Surface Caps` section (between architecture-end and skills-start markers, unmanaged by `BRIEF:*` boundaries) was updated:

- The pre-Phase-9 "Current state" sentence ("Total user-facing commands = 68; total agents = 23. Both counts still exceed the cap.") was REPLACED with: "**Current state (v1 launch):** 12 user-facing commands, 0 skills. Cap met for both. Audit: see `.planning/SURFACE-AUDIT.md`."
- A second paragraph enumerates the 12 locked commands and notes the backup-branch recovery path + new-project.md → init.md rename.
- Pre-existing rationale, scope clarification, and definition-of-user-facing sections preserved unchanged.

`grep -c "SURFACE-AUDIT\.md" CLAUDE.md` returns 1; `grep -c "12 user-facing commands"` returns 1.

## Wave 0 Fixtures

All 3 surface-audit fixtures are GREEN (no skips, no fails):

```
brief-surface-audit-count.test.cjs:           3/3 PASS
brief-surface-audit-install-cleanup.test.cjs: 57/57 PASS
brief-surface-audit-doc.test.cjs:             3/3 PASS
TOTAL:                                        63/63 PASS
```

## Backup Branch Verification

`git rev-parse backup/original-gsd` resolves (`73e951...`). The branch contains all original GSD commands at the pre-rename path `commands/gsd/{name}.md` — confirmed via `git ls-tree -r backup/original-gsd --name-only | grep audit-fix.md` returning `commands/gsd/audit-fix.md`. The Rule-1 follow-up commit (47956b3) updated SURFACE-AUDIT.md's recovery hint accordingly so users can correctly locate deleted files.

## A1 Preserved (Zero Runtime Deps)

```bash
node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"  # 0
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] backup/original-gsd recovery hint path was incorrect**
- **Found during:** Post-commit verification step 7d (`git show backup/original-gsd:commands/brief/audit-fix.md` errored with "path does not exist")
- **Issue:** Plan's recovery hint and SURFACE-AUDIT.md template assumed deleted files are at `backup/original-gsd:commands/brief/{name}.md`, but the backup branch predates Phase 1's gsd-*→brief-* rename, so files live at `backup/original-gsd:commands/gsd/{name}.md`.
- **Fix:** Updated SURFACE-AUDIT.md recovery instructions to use `git show backup/original-gsd:commands/gsd/{name}.md > commands/brief/{name}.md` with a verification step (`git ls-tree -r backup/original-gsd --name-only | grep {name}.md`).
- **Files modified:** .planning/SURFACE-AUDIT.md (4 lines)
- **Commit:** 47956b3
- **Why follow-up commit instead of amend:** CLAUDE.md commit conventions ("Always create NEW commits rather than amending"). The functional atomic commit (3a1204d) already landed all required state; the recovery-hint correction is a doc-clarity fix that's appropriate as a follow-up.

### Auto-resolved (No Action Required)

**2. [Rule 3 - Blocker] Worktree base mismatch at startup**
- **Found during:** Pre-flight check (worktree_branch_check)
- **Issue:** Worktree HEAD was at `c5b453f` (Phase 7 era checkpoint commit) but expected base was `d17c9d9` (Phase 9 HRD-03 close).
- **Fix:** Ran `git reset --hard d17c9d9c7f6cbfb7c8f19a04f96678db569aa8a0` per the worktree_branch_check protocol; re-verified base matched.

## Self-Check: PASSED

**Created files exist:**
- `.planning/SURFACE-AUDIT.md` ✓ (110 lines)
- `commands/brief/init.md` ✓ (renamed from new-project.md, name: brief:init)

**Commits exist:**
- `3a1204d` ✓ feat(09-05): HRD-02 surface pruning to locked 12 cmds + SURFACE-AUDIT.md + CLAUDE.md sync
- `47956b3` ✓ docs(09-05): fix backup/original-gsd recovery hint path in SURFACE-AUDIT.md

**Acceptance criteria all GREEN:**
- 12 files, exact LOCKED_12 alphabetical match ✓
- new-project.md absent, init.md present with `name: brief:init` ✓
- Zero gsd: drift; 12/12 brief: namespaced ✓
- SURFACE-AUDIT.md schema (110 lines, 12 numbered rows, 56-cmd Removed-in-v1 header, 0/8 skills, backup recovery, W10 note) ✓
- CLAUDE.md references SURFACE-AUDIT.md and reflects v1 final state ✓
- Wave 0 fixtures: 63/63 GREEN ✓
- bin/install.js parses cleanly ✓
- backup/original-gsd intact ✓
- A1 preserved (0 runtime deps) ✓
- Single atomic commit for all functional changes (3a1204d) ✓

## Threat Flags

None. The deletions, rename, install.js update, audit doc, and CLAUDE.md update are entirely within the threat surface enumerated in the plan's `<threat_model>` block (T-9-03, T-9-14, T-9-15, T-9-16). No new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries were introduced.
