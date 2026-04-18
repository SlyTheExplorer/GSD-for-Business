---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 04
subsystem: infra
tags: [fork-hygiene, internal-rename, directory-rename, binary-rename, package-identity, brief-cc, zero-deps-preserved]

# Dependency graph
requires:
  - phase: "01-foundation-fork-hygiene-removal-rename Plan 03"
    provides: "User-facing files already renamed to brief-* prefix (agents, commands, hooks, tests). Binary gsd-tools.cjs and directory get-shit-done/ still at original GSD names — targets of this plan."
provides:
  - "Directory renamed get-shit-done/ → brief/ via `git mv` (169 file renames at 100% similarity, history preserved)"
  - "Binary renamed brief/bin/gsd-tools.cjs → brief/bin/brief-tools.cjs via `git mv`"
  - "package.json structural fields (name, bin, files, scripts.test:coverage) fully switched to BRIEF identity"
  - "package.json descriptive fields (description, keywords, repository.url, homepage, bugs.url) rewritten to BRIEF domain (was deferred to Plan 05 in pre-revision plan; pulled into this plan per checker WARNING #6)"
  - "A1 preserved: `dependencies: {}` still empty — zero-runtime-deps rule intact"
  - "D-09 buildability gate: core.cjs / state.cjs / init.cjs / graphify.cjs all require() cleanly after the rename"
  - "Single atomic commit `d49f306` per D-08 commit 4 of 6"
affects:
  - "01-05 (internal text-reference fix will now target `brief/` paths and `brief-tools.cjs` name)"
  - "01-06 (Phase 1 closing commit will include this rename in FND-03 completion)"
  - "runtime dispatch remains temporarily broken until Plan 05 updates text references — expected per T-01-05 and T-01-07"
  - "Plan 05 surgical-edit scope: 9 `get-shit-done` string references and 31 `gsd-tools` references inside brief/bin/**/*.cjs are enumerated here"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Directory-level `git mv get-shit-done brief` as a single tree rename — git detects all 168 files moved at 100% similarity (plus the binary-rename file), producing R entries in `git status` and a `{get-shit-done => brief}/...` compact form in `git log --stat`"
    - "Nested git mv after dir rename: `git mv brief/bin/gsd-tools.cjs brief/bin/brief-tools.cjs` — must happen AFTER the dir rename is staged (the file is already at brief/bin/gsd-tools.cjs path after the first git mv)"
    - "Combined atomic commit pattern (D-08 commit 4): Tasks 1 (dir rename + binary rename) and 2 (package.json edits) stage changes; Task 3 commits all 170 staged changes in ONE reversible unit with the mandated message"
    - "package.json multi-Edit discipline: 8 sequential Edit operations (2 structural early: name + bin; 2 more structural after: files array + coverage path; 4 descriptive: description + keywords + 3 URLs). Order doesn't matter for idempotency but grouped structural-first for easier review"
    - "Relative-require() survival: because brief/bin/lib/*.cjs uses `require('./state.cjs')` (not `require('get-shit-done/...')`), the dir rename preserves all internal dependencies. Verified post-commit via explicit `node -e require()` on core/state/init/graphify."

key-files:
  created:
    - ".planning/phases/01-foundation-fork-hygiene-removal-rename/01-04-SUMMARY.md"
  modified:
    - "package.json (structural: name, bin, files, scripts.test:coverage; descriptive: description, keywords, repository.url, homepage, bugs.url)"
  renamed: 169  # 1 binary + 168 tree-renames (see commit d49f306); all at 100% similarity
  renamed_directories: 1  # get-shit-done/ → brief/

key-decisions:
  - "Applied `git mv get-shit-done brief` as a single directory-level rename (not per-file). Git's rename detector treats the entire subtree as a contiguous move at 100% similarity. This matches Plan 03's commands/gsd → commands/brief pattern and keeps the diff minimal (the compact `{get-shit-done => brief}/...` rename entries in the commit log)."
  - "Pulled package.json descriptive-field edits into THIS plan (per checker WARNING #6 captured in plan text). Pre-revision plan deferred description/keywords/repository/homepage/bugs to Plan 05, but Plan 05's substitution dictionary would not match those specific strings (e.g., `spec-driven development` is not a standard token; URLs lack trailing `/`). Moving them to Plan 04's Task 2 is the only way to prevent GSD-domain text from persisting in package.json after Phase 1 closes."
  - "Kept `author: \"TÂCHES\"` unchanged per D-14 — this is the fork maintainer's attribution string carried over from GSD. Changing to BRIEF-specific attribution is a Phase 9 publishing decision."
  - "Used placeholder repo URL `brief-build/brief` per plan's directive. Resolution to the actual GitHub org/repo is deferred to Phase 9 publishing work (ASSUMPTIONS.md entry `A-REPO` to be recorded by Plan 06 Task 1). Not publishing to npm in Phase 1, so the placeholder has no external trust impact."
  - "Single combined atomic commit (not per-task commits) per plan's `<execution_notes>`: 'Plan 04 expects ONE COMBINED ATOMIC COMMIT at end of Task 3' with the exact message `refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)`. This keeps the D-08 commit-4 boundary reversible as a single `git revert` unit."

patterns-established:
  - "D-08-staged commit pattern continues (commit 4 of 6): internal directory + binary rename + package.json identity are ONE commit. Plan 03's user-facing rename was commit 3. Plan 05's text-ref surgical edits are commit 5. Plan 06's Phase 1 closing docs + ASSUMPTIONS.md is commit 6."
  - "package.json-edit verification chain: (1) JSON.parse the file, (2) assert each structural field via `node -e require()` on package.json, (3) grep for GSD residues AND positive BRIEF markers, (4) assert deps count = 0 (A1). Used in Task 2 automated verify block."
  - "post-rename-commit verification chain: (1) `[ -d brief ] && [ ! -d get-shit-done ]`, (2) binary path assertions, (3) `node -e require()` on 4 lib modules, (4) `git diff --diff-filter=D HEAD~1 HEAD` should be empty (pure rename + modify, no deletions), (5) `git status --short | grep '^??'` should be empty (no untracked)."
  - "Stub-scan for Plan 05 scope: post-commit `grep -rn get-shit-done brief/ --include='*.cjs'` → 9 hits; `grep -rn gsd-tools brief/ --include='*.cjs'` → 31 hits. These are the intentional intermediate-state residues per T-01-07 accept disposition; Plan 05 will remove them."

requirements-completed: []  # FND-03 is a 3-plan requirement (Plans 03, 04, 05). Plan 04 is 'part 2' — do not mark FND-03 complete until Plan 05 finishes.

# Metrics
duration: ~2min
completed: 2026-04-18
---

# Phase 01 Plan 04: Internal `brief-*` Rename + `package.json` BRIEF Identity Summary

**169 internal files renamed (get-shit-done/ → brief/, gsd-tools.cjs → brief-tools.cjs) + 1 package.json modified (structural + descriptive fields) in a single atomic commit (`d49f306`). All 4 lib modules (core/state/init/graphify) load cleanly post-rename. A1 preserved: `dependencies: {}` still empty. Repo in buildable state per D-09; runtime `/brief-*` dispatch remains temporarily broken until Plan 05 fixes the 9 `get-shit-done` and 31 `gsd-tools` text references inside .cjs files.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-18T01:32:44Z (post worktree-base reset)
- **Completed:** 2026-04-18T01:34:41Z
- **Tasks:** 3 (dir+binary rename, package.json full-field edit, single combined commit)
- **Files renamed:** 169 (1 binary + 168 tree-renames following dir move)
- **Files modified:** 1 (package.json)
- **Commits on worktree branch:** 1 rename commit (`d49f306`) + 1 SUMMARY commit (next) = 2 total (matches execution_notes expected count)

## Accomplishments

### Task 1 — Directory and binary rename
- **Pre-state verified:** `get-shit-done/` existed with subdirectories `bin/ contexts/ references/ templates/ workflows/` (matching plan's expected layout); `get-shit-done/bin/gsd-tools.cjs` existed.
- **Directory rename:** `git mv get-shit-done brief` — git detected all files inside the tree as renames at 100% similarity. `brief/` now contains the same subdirectory structure (`bin/ contexts/ references/ templates/ workflows/`).
- **Binary rename:** `git mv brief/bin/gsd-tools.cjs brief/bin/brief-tools.cjs` — executed AFTER the directory rename was staged (the file was already at `brief/bin/gsd-tools.cjs` by that point).
- **Verified:** `brief/` exists, `get-shit-done/` absent, `brief/bin/brief-tools.cjs` exists, `brief/bin/gsd-tools.cjs` absent. All 4 lib modules (`core.cjs`, `state.cjs`, `init.cjs`, `graphify.cjs`) load successfully via `require()` — relative-path requires survived the rename as predicted in the plan's buildability analysis.
- **Staged count:** 169 entries in `git status` (all `R` rename entries).

### Task 2 — package.json structural + descriptive edits
Executed 8 sequential Edit operations in order:

**Structural (4 edits):**
1. `"name": "get-shit-done-cc"` → `"brief-cc"`
2. `bin` block key renamed from `"get-shit-done-cc"` to `"brief-cc"` (install.js target unchanged)
3. `files` array: `"get-shit-done"` → `"brief"`
4. `scripts.test:coverage`: `--include 'get-shit-done/bin/lib/*.cjs'` → `--include 'brief/bin/lib/*.cjs'`

**Descriptive (4 edits — per checker WARNING #6):**
5. `description`: replaced GSD's "spec-driven development" phrasing with BRIEF's "Meta-prompting framework for business and product strategy planning ... DEFINE, DISCOVER, DESIGN, DELIVER before engineering's PRD work begins."
6. `keywords`: removed `spec-driven-development`; added `business-planning`, `strategy`, `prd`
7. `repository.url`: `git+https://github.com/gsd-build/get-shit-done.git` → `git+https://github.com/brief-build/brief.git` (placeholder; see Known Surprises below)
8. `homepage` + `bugs.url`: matching placeholder URLs at `brief-build/brief`

**Unchanged (per D-14):**
- `author`: `"TÂCHES"` (fork-maintainer attribution; Phase 9 publishing decision)
- `license`, `version`, `engines`, `devDependencies`, `scripts.build:hooks`/`test`/`prepublishOnly`

**Verified (automated gate):** valid JSON, name=brief-cc, bin key=brief-cc, files includes `brief` but not `get-shit-done`, coverage path points at `brief/bin/lib/*.cjs`, no `spec-driven development` text, no `gsd-build/get-shit-done` URL, no `"spec-driven-development"` keyword, positive BRIEF markers present (`business`, `business-planning`, `brief-build/brief`), **`dependencies: {}` still empty (A1 preserved)**.

### Task 3 — Atomic commit
- **Staged:** 170 changes total (169 renames from Task 1 + 1 modify for package.json).
- **Commit:** `git commit --no-verify -m "refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)"` — used `--no-verify` per parallel-execution guidance to avoid hook contention.
- **Result:** Commit `d49f306`, 170 files changed, 11 insertions(+), 9 deletions(-) (the insertion/deletion counts reflect the package.json line-by-line edits; all 169 renames are 0-insertion/0-deletion).
- **Post-commit verification:** commit message regex match ok, directory state ok, binary state ok, package name ok, no GSD residues in package.json, all 4 lib modules still load, `git diff --diff-filter=D HEAD~1 HEAD` empty (zero deletions), `git status --short` empty (no untracked files).

## package.json Final Values (Post-Commit)

| Field | Before | After |
|-------|--------|-------|
| `name` | `get-shit-done-cc` | `brief-cc` |
| `description` | "A meta-prompting, context engineering and spec-driven development system for Claude Code, OpenCode, Gemini and Codex by TÂCHES." | "Meta-prompting framework for business and product strategy planning across Claude Code, OpenCode, Gemini, and Codex. Hard fork of GSD — DEFINE, DISCOVER, DESIGN, DELIVER before engineering's PRD work begins." |
| `bin` (key) | `get-shit-done-cc` | `brief-cc` |
| `bin` (value) | `bin/install.js` | `bin/install.js` (unchanged) |
| `files` array | `[ bin, commands, get-shit-done, agents, hooks, scripts ]` | `[ bin, commands, brief, agents, hooks, scripts ]` |
| `keywords` (removed) | `spec-driven-development` | — |
| `keywords` (added) | — | `business-planning`, `strategy`, `prd` |
| `keywords` (unchanged) | `claude`, `claude-code`, `ai`, `meta-prompting`, `context-engineering`, `gemini`, `gemini-cli`, `codex`, `codex-cli` | same |
| `repository.url` | `git+https://github.com/gsd-build/get-shit-done.git` | `git+https://github.com/brief-build/brief.git` (placeholder) |
| `homepage` | `https://github.com/gsd-build/get-shit-done` | `https://github.com/brief-build/brief` (placeholder) |
| `bugs.url` | `https://github.com/gsd-build/get-shit-done/issues` | `https://github.com/brief-build/brief/issues` (placeholder) |
| `author` | `TÂCHES` | `TÂCHES` (unchanged per D-14) |
| `license` | `MIT` | `MIT` (unchanged) |
| `engines.node` | `>=22.0.0` | `>=22.0.0` (unchanged) |
| `devDependencies` | `{ c8, esbuild, vitest }` | same (unchanged) |
| `dependencies` | absent (implicit `{}`) | absent (implicit `{}`) — **A1 preserved** |
| `scripts.test:coverage` | `... --include 'get-shit-done/bin/lib/*.cjs' ...` | `... --include 'brief/bin/lib/*.cjs' ...` |

## Placeholder URL Strategy

The three URL fields (`repository.url`, `homepage`, `bugs.url`) now point at `github.com/brief-build/brief`. This is a **placeholder**, not the final URL:
- No actual BRIEF repo exists at that path yet (clicking through produces a 404).
- Acceptable because **no `npm publish` happens in Phase 1** — these fields are internal metadata only until the Phase 9 publishing decision.
- Plan 06's FND-07 grep will include package.json in its scope; if Phase 9 selects a different URL (e.g., a GitHub org owned by swyoo@iotrust.kr), it's a simple find-and-replace on a single file.
- To be documented as ASSUMPTIONS.md entry `A-REPO` with status `PLACEHOLDER — Phase 9 resolves before any npm publish` (that recording is Plan 06 Task 1's responsibility).

## Known Surprises — Plan 05 Input

Per the plan's `<output>` directive, enumerate unexpected references inside `.cjs` files that Plan 05 will need to repair. Post-commit grep of `brief/` found:

| Pattern | Count | Files (sample) |
|---------|-------|----------------|
| `get-shit-done` | 9 | `brief/bin/brief-tools.cjs:1195` (hard-coded directory name in an array literal), `brief/bin/lib/model-profiles.cjs:4` (doc comment), `brief/bin/lib/verify.cjs:717,721` (error messages: `npx get-shit-done-cc@latest`), `brief/bin/lib/core.cjs:1274,1286` (comment + comment), `brief/bin/lib/init.cjs:1694,1695` (skill-discovery path), `brief/bin/lib/profile-output.cjs:625` (USER-PROFILE.md path) |
| `gsd-tools` | 31 | `brief/bin/brief-tools.cjs:9` (usage header comment), `brief/bin/brief-tools.cjs:318,327` (error-message usage strings), and 28 others (usage strings in other command branches inside the same file) |

These are the expected intermediate-state residues per T-01-07 (accept) disposition in this plan's threat model. Plan 05's surgical-edit pass must:
1. Replace `get-shit-done` with `brief` in all 9 locations inside `brief/` tree.
2. Replace `gsd-tools` with `brief-tools` in all 31 locations (mostly `brief/bin/brief-tools.cjs` usage strings).
3. Additionally: `get-shit-done-cc` install-command references (2 occurrences at `brief/bin/lib/verify.cjs:717,721`) must become `brief-cc` — this is a SEPARATE token from the bare `get-shit-done` pattern and may need its own substitution rule in Plan 05's dictionary.

**Confidence:** Plan 05 already has these in scope per CONTEXT.md D-05 ("Internal text references: All .md and .cjs files that mention 'GSD', 'Get Shit Done', or paths like get-shit-done/ are updated"). The counts above are for verification scope-sizing, not new scope.

## Git Commit (Single Atomic)

1. **Tasks 1–3 combined:** `d49f306` — `refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)`
   - 170 files changed
   - 169 renames at 100% similarity (168 tree-renames via dir move + 1 binary rename)
   - 1 file modified (package.json: 11 insertions, 9 deletions — reflects field edits)
   - `git diff --diff-filter=D HEAD~1 HEAD` returned empty (no accidental deletions)
   - Previous commit: `128ecbb` (Plan 03 SUMMARY)

The SUMMARY commit follows this file's creation.

## Deviations from Plan

### Auto-fixed Issues

**None.** The plan executed exactly as written, in the exact sequence and with the exact edits specified in Task 2's substitution list.

### Auth Gates

**None encountered.** All operations were local git + filesystem. No npm publish, no network calls, no external authentication.

## Threat Flags

**None.** Plan 04 introduces no new attack surface:
- File renames at 100% similarity do not alter executable code paths.
- package.json metadata is inert until `npm publish` (which is Phase 9 scope).
- Placeholder URLs (`brief-build/brief`) resolve to 404 for end-users who click through, but **no end-user is seeing this until Phase 9 publishes** — T-01-21 disposition is `accept` and this plan correctly documents the placeholder strategy above.
- A1 (zero runtime deps) preserved: `dependencies: {}` still empty. If it weren't, BRIEF's install-time surface would widen; that's not happening here.

Threat-model dispositions that materialized:
- T-01-07 (hard-coded absolute paths inside .cjs break silently) — did NOT materialize on the buildability gate because the 4 explicitly-tested lib modules use relative requires throughout. The 9 `get-shit-done` and 31 `gsd-tools` string residues found (listed in Known Surprises) are comments, doc-strings, error-messages, and one hard-coded array literal at `brief-tools.cjs:1195` — none of them break module loading. Plan 05 repairs them.
- T-01-08 (test suite post-rename) — deferred; not exercised in this plan.
- T-01-21 (placeholder URL 404) — accept; documented as Known Surprise + plan's output section.

## Issues Encountered

- **Worktree-base reset at startup** — the worktree's `git merge-base HEAD <required-base>` check in `<worktree_branch_check>` produced a mismatch (HEAD was `128ecbb` from Plan 03 SUMMARY, required base `128ecbb` was the same commit — they matched by content but the merge-base verification ran against a different target hash). Executed `git reset --hard 128ecbbba7ac03ee82d08d4e2d8fe643a1292300` per the spawn prompt, which brought HEAD to the expected Plan-03-SUMMARY state. Subsequent rename commit `d49f306` chains off that base cleanly. No lost work — reset was to a committed state.
- **Initial package.json `name` edit emitted a PreToolUse READ-BEFORE-EDIT reminder** after the Bash-invoked initial read (the hook tracks file-read state per-session and the earlier Bash `Read` of the shared-repo package.json did not register the worktree-local path). Re-read the worktree-local package.json via the `Read` tool, then the remaining 7 edits proceeded without reminder. No functional impact — all 8 edits landed in the intended sequence.
- **No other issues.** All verification gates passed first try. No fix-attempts consumed; no retries; no deviations; no auth gates; no architectural decisions needed.

## User Setup Required

**None.** All operations are local git + filesystem. No external services, no credentials, no user intervention needed. The runtime `/brief-*` slash command dispatch continues to be broken (from Plan 03's intermediate state carrying forward) and remains so until Plan 05 completes — this is documented in Plan 03's SUMMARY and T-01-05 of this phase.

## Next Phase Readiness

- **Plan 05 (wave 5) unblocked.** Directory and binary are at their BRIEF names, so Plan 05's text-reference fix can grep `brief/**/*.{md,cjs}` and `tests/` for remaining `get-shit-done`, `gsd-tools`, and bare-prefix `gsd-` patterns using the renamed path tree as its input.
- **Plan 05 inventory hint:** 9 `get-shit-done` + 31 `gsd-tools` string residues inside `brief/`-tree `.cjs` files are enumerated in Known Surprises above. These are the minimum residues Plan 05 MUST fix inside the .cjs surface; the .md surface under `brief/{workflows,references,templates,contexts}` has more (not counted here — Plan 05 owns enumeration).
- **Plan 06 input (FND-04):** `dependencies: {}` still empty post-commit. Plan 06 Task 1's A1 recording step can reference this commit as evidence without re-verification.
- **Plan 06 FND-07 grep scope:** package.json now has BRIEF-domain text — no further edit needed by Plan 06 for this file (the FND-07 grep will still scan it to confirm no residues remain).
- **Buildability intact (D-09).** `node -e "require('./brief/bin/lib/core.cjs'); require('./brief/bin/lib/state.cjs'); require('./brief/bin/lib/init.cjs'); require('./brief/bin/lib/graphify.cjs')"` exits 0 post-commit. Plan 05 can invoke these paths safely.
- **Shared orchestrator artifacts untouched.** Per `<parallel_execution>` guidance, this worktree did NOT modify `.planning/STATE.md` or `.planning/ROADMAP.md`. The orchestrator will update those after wave-4 worktree agents complete (Plan 04 is the only wave-4 plan per dependencies).
- **Runtime `/brief-*` dispatch** — still broken (carrying forward from Plan 03 + now additionally: `brief-tools.cjs` internally references `gsd-tools` in its own usage strings). This is EXPECTED per T-01-05 and will be repaired in Plan 05. Rollback path unchanged: `git checkout backup/original-gsd` (from Plan 01).

## Self-Check: PASSED

- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-04-SUMMARY.md` exists (this file being written): CREATED
- Rename commit `d49f306` exists on worktree branch: FOUND (`git log -1 --oneline` → `d49f306 refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)`)
- `brief/` directory exists: CONFIRMED (`[ -d brief ]` returns 0)
- `get-shit-done/` directory absent: CONFIRMED (`[ ! -d get-shit-done ]` returns 0)
- `brief/bin/brief-tools.cjs` exists: CONFIRMED
- `brief/bin/gsd-tools.cjs` absent: CONFIRMED
- `brief/bin/lib/` still has 25+ .cjs files (audit, commands, config, core, docs, frontmatter, graphify, gsd2-import, init, intel, learnings, milestone, model-profiles, phase, ...): CONFIRMED (first 5 shown during Task 1 verify)
- package.json name = `brief-cc`: CONFIRMED
- package.json bin key = `brief-cc` → `bin/install.js`: CONFIRMED
- package.json files array contains `brief`, not `get-shit-done`: CONFIRMED
- package.json scripts.test:coverage uses `brief/bin/lib/*.cjs`: CONFIRMED
- package.json description is BRIEF-domain (contains "business", no "spec-driven development"): CONFIRMED
- package.json keywords contain `business-planning`, `strategy`, `prd`; no `spec-driven-development`: CONFIRMED
- package.json repository.url, homepage, bugs.url point at `brief-build/brief`: CONFIRMED
- package.json dependencies empty (A1 holds): CONFIRMED (`Object.keys(deps).length === 0`)
- `node -e "require('./brief/bin/lib/core.cjs')"` exits 0: CONFIRMED
- `node -e "require('./brief/bin/lib/state.cjs')"` exits 0: CONFIRMED
- `node -e "require('./brief/bin/lib/init.cjs')"` exits 0: CONFIRMED
- `node -e "require('./brief/bin/lib/graphify.cjs')"` exits 0: CONFIRMED
- `git diff --diff-filter=D HEAD~1 HEAD` returns empty (no deletions in commit d49f306): CONFIRMED
- `git status --short | grep '^??'` returns empty (no untracked): CONFIRMED
- `.planning/STATE.md` untouched (worktree mode): CONFIRMED (no changes to that file from this agent)
- `.planning/ROADMAP.md` untouched (worktree mode): CONFIRMED (no changes to that file from this agent)

---
*Phase: 01-foundation-fork-hygiene-removal-rename*
*Completed: 2026-04-18*
