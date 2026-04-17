---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - ".git/refs/heads/backup/original-gsd"
autonomous: true
requirements:
  - FND-01
user_setup: []

must_haves:
  truths:
    - "User runs `git branch` and sees `backup/original-gsd` listed as a branch"
    - "User can inspect the branch and confirm it points to the current `main` HEAD"
    - "User can run `git checkout backup/original-gsd` as a one-command rollback"
  artifacts:
    - path: ".git/refs/heads/backup/original-gsd"
      provides: "Rollback safety net pointing to pre-BRIEF state"
      contains: "current main SHA (40-char hex)"
  key_links:
    - from: "backup/original-gsd"
      to: "main (HEAD at commit creation time)"
      via: "git branch (pointer)"
      pattern: "same SHA as main HEAD at plan-01 execution time"
---

<objective>
Create the `backup/original-gsd` git branch as the one-command rollback safety net BEFORE any removal or rename work begins. This commit (commit 1 of 6 per D-08) is the precondition for all subsequent Phase 1 plans: if anything in plans 02-06 goes wrong, `git checkout backup/original-gsd` restores the exact pre-BRIEF state.

Purpose: Honor FND-01 (rollback safety) and D-06 accepted trade-off (GSD upstream merge abandoned — backup branch IS the rollback path). No actual code or file changes happen in this plan; only a git ref is created.

Output: A new git branch pointing at the current `main` HEAD, and one atomic commit recording that the branch was created (the commit itself is a no-op content change but serves as the phase's commit 1).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md

<interfaces>
<!-- Git branch creation. No code interfaces involved. -->
<!-- Key constraint: branch must point at current main HEAD at time of creation, -->
<!-- so that `git checkout backup/original-gsd` restores the exact pre-Phase-1 state. -->

Current state (verified at planning time):
- Git branches: main only
- Current main HEAD: (captured at execution time via `git rev-parse main`)
- Working tree: clean per status snapshot
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create backup/original-gsd branch at current main HEAD and commit marker</name>
  <files>
    .git/refs/heads/backup/original-gsd
    .planning/STATE.md
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-08 commit order, D-06 backup-branch rationale)
    - .planning/STATE.md (current position — must be updated to reflect branch creation)
    - .planning/ROADMAP.md (Phase 1 Success Criteria #1 — line 32)
  </read_first>
  <action>
Execute these commands in order (all from repo root `/Users/agent/GSD-for-Business`):

1. Confirm the repo is on `main` and working tree is clean:
   ```
   git status
   git rev-parse --abbrev-ref HEAD   # must print: main
   ```
   If not on main, abort and report. If dirty, abort and report.

2. Capture current main SHA for audit trail:
   ```
   MAIN_SHA=$(git rev-parse main)
   echo "main HEAD at backup creation: $MAIN_SHA"
   ```

3. Create the backup branch pointing at current main (per D-06, this is the ONLY path back to GSD-compatible code):
   ```
   git branch backup/original-gsd main
   ```

4. Verify the branch now exists and points at the same SHA as main:
   ```
   git branch | grep -E "^\s+backup/original-gsd$"
   BACKUP_SHA=$(git rev-parse backup/original-gsd)
   [ "$MAIN_SHA" = "$BACKUP_SHA" ] && echo "OK: branch points to main HEAD" || { echo "MISMATCH"; exit 1; }
   ```

5. Update `.planning/STATE.md` — add a "Last activity" line recording the branch creation. Use the Edit tool to replace the line starting with `Last activity:` (currently `Last activity: 2026-04-18 — Phase 1 CONTEXT.md captured...`) with:
   `Last activity: 2026-04-18 — Phase 1 Plan 01: backup/original-gsd branch created at main SHA <MAIN_SHA>`
   Substitute `<MAIN_SHA>` with the captured value.

6. Commit the STATE.md update as the atomic commit for commit 1 (D-08 commit 1):
   ```
   git add .planning/STATE.md
   node get-shit-done/bin/gsd-tools.cjs commit "chore(01): create backup/original-gsd branch for rollback safety (FND-01)" --files .planning/STATE.md
   ```
   If `gsd-tools.cjs commit` is unavailable, fall back to:
   ```
   git commit -m "chore(01): create backup/original-gsd branch for rollback safety (FND-01)"
   ```

NOTE: The branch is created BEFORE this commit, so the backup ref already points to the previous main HEAD (pre-Phase-1 state), which is what we want. Advancing main via this commit does NOT move the backup ref.
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# Branch exists
git branch | grep -q "backup/original-gsd" || { echo "FAIL: branch missing"; exit 1; }
# Branch points to pre-Phase-1 main (must differ from current main after this commit)
BACKUP_SHA=$(git rev-parse backup/original-gsd)
MAIN_SHA=$(git rev-parse main)
echo "backup: $BACKUP_SHA"
echo "main:   $MAIN_SHA"
# These SHAs differ because the STATE.md commit advanced main but not backup.
[ "$BACKUP_SHA" != "$MAIN_SHA" ] || { echo "WARN: backup == main (acceptable only if STATE.md did not commit)"; }
# STATE.md references backup branch creation
grep -q "backup/original-gsd" .planning/STATE.md && echo "OK: STATE.md updated" || { echo "FAIL: STATE.md not updated"; exit 1; }
'
    </automated>
  </verify>
  <done>
    - `git branch` output contains `backup/original-gsd`
    - `git rev-parse backup/original-gsd` returns a valid SHA
    - The backup branch SHA equals the main HEAD that existed BEFORE the STATE.md commit (i.e., the backup was created from pre-Phase-1 main; subsequent plans advance main but do not move the backup ref)
    - `.planning/STATE.md` "Last activity:" line references backup/original-gsd creation with the main SHA
    - Exactly one new git commit exists on `main` with message starting `chore(01): create backup/original-gsd branch for rollback safety (FND-01)`
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Local git repo ↔ developer machine | Standard git trust model; no new boundary introduced by this plan. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-01 | I (Information Disclosure) | backup/original-gsd branch retains unredacted inherited GSD state | accept | The backup branch is local-only at Phase 1 time. No push to remote is planned here. The branch preserves the exact pre-fork state including any comments/history that the team considers acceptable on main already. |
| T-01-02 | T (Tampering) | Accidental deletion of backup branch | accept | Recovery path: `git reflog` and re-create from main's parent commit. Low probability in solo-dev workflow; not worth additional tooling in Phase 1. Documented in D-06 as the backup branch being "the only path back to upstream-compatible code". |

Phase 1 adds zero new attack surface: this plan only creates a git ref; no new code paths, no new user inputs, no new external surfaces.
</threat_model>

<verification>
1. Branch exists: `git branch | grep -q "backup/original-gsd"` returns exit 0.
2. Branch SHA resolves: `git rev-parse backup/original-gsd` returns a 40-char SHA.
3. Rollback command works (dry-run): `git checkout --detach backup/original-gsd && git checkout main` succeeds.
4. STATE.md updated: grep finds `backup/original-gsd` reference in STATE.md.
5. Commit exists: `git log --oneline -1 main | grep -q "backup/original-gsd branch"`.
</verification>

<success_criteria>
- [ ] `backup/original-gsd` branch exists pointing at pre-Phase-1 main HEAD
- [ ] `.planning/STATE.md` records the branch creation with SHA
- [ ] Exactly one new commit on `main` implements this plan
- [ ] User can run `git checkout backup/original-gsd` to return to pre-BRIEF state
- [ ] FND-01 success criterion (ROADMAP.md line 32) is met
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-01-SUMMARY.md`
</output>
