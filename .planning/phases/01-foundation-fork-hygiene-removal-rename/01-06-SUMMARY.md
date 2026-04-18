---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 06
subsystem: documentation + verification
tags: [docs, verification, FND-04, FND-06, FND-07, phase-1-closure]
requires:
  - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md
provides:
  - .planning/ASSUMPTIONS.md
  - CLAUDE.md (BRIEF-domain workflow + stack notes)
  - README.md (BRIEF-domain hero + core value + four phases + commands)
  - Phase 1 closed (all 6 success criteria met)
affects:
  - CLAUDE.md (workflow section, project section constraints, stack section BRIEF notes)
  - README.md (hero, core value, four phases, commands — 171 deletions / 63 insertions)
  - .planning/ASSUMPTIONS.md (created with A1 + FND-06 + A-REPO + FND-07 entries)
tech-stack:
  added: []
  patterns:
    - "Dual-site FND-06 verification (INSTRUCTION_FILE in brief/workflows/ + text_mode in brief/bin/lib/)"
    - "Hard-fail guards on zero-count detection to prevent silent VERIFIED-for-zero"
    - "Placeholder URL assumption logging (A-REPO) for Phase 9 resolution"
key-files:
  created:
    - .planning/ASSUMPTIONS.md
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-06-SUMMARY.md
  modified:
    - CLAUDE.md
    - README.md
decisions:
  - "Dev-vocabulary residuals in CLAUDE.md (count=2, lines 60+95) kept as intentional anti-examples in Patterns-to-Absorb / What-NOT-to-Use tables — they describe concepts BRIEF DROPPED from superpowers/gstack, not BRIEF features"
  - "README.md Hero uses 'A hard fork of GSD' (not 'GSD (Get Shit Done)') to keep the first 60 lines free of the literal 'Get Shit Done' brand per FND-07 gate, while preserving GSD attribution elsewhere"
  - "Localized READMEs (ko-KR, ja-JP, pt-BR, zh-CN) explicitly flagged as Phase 9 (Hardening) scope; not touched in Plan 06"
  - "A-REPO placeholder URL strategy documented in ASSUMPTIONS.md: npm publish blocked until Phase 9 HRD-02 resolves brief-build/brief org+repo"
metrics:
  duration: ~7 minutes
  completed: 2026-04-18
  commits: 1 (atomic — all 4 tasks landed in a single commit per plan's combined-commit strategy)
---

# Phase 1 Plan 06: CLAUDE.md + README.md Targeted Delta + ASSUMPTIONS.md Summary

Closes Phase 1 by (a) verifying A1 (zero runtime deps) and FND-06 (multi-runtime detection survived rename) via dual-site grep with hard-fail guards, (b) rewriting CLAUDE.md Workflow + Stack sections and README.md Hero + Core Value + Four Phases + Commands for BRIEF-domain identity, (c) recording A-REPO placeholder assumption for Phase 9 resolution, and (d) landing one atomic docs commit `e8b8478` that closes Phase 1 with all 6 ROADMAP.md success criteria met.

## What Changed

### `.planning/ASSUMPTIONS.md` (new file, 110 lines)

Four sections:

1. **A1 — Zero-runtime-dependencies rule (FND-04)** — VERIFIED at 2026-04-18T02:04:23Z. `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → `0`. devDependencies: `c8, esbuild, vitest` (count=3). The GSD-inherited zero-runtime-deps property survives the rename.

2. **FND-06 — Multi-runtime detection survived rename** — VERIFIED at 2026-04-18T02:04:23Z, at BOTH known detection sites:
   - `INSTRUCTION_FILE` in `brief/workflows/`: 8 refs (expected ~8). Not present in `brief/bin/lib/` (verified count=0; this identifier is workflow-layer, not lib-layer).
   - `text_mode` in `brief/bin/lib/`: 6 refs across `core.cjs`, `config.cjs`, `init.cjs` (expected ~6).
   - `get-shit-done` in `brief/bin/lib/`: 0 refs (post-rename residue check).
   - Cross-runtime smoke (actually running BRIEF under Claude Code / Codex / Gemini / OpenCode) is deferred to Phase 9 HRD-01.

3. **A-REPO — Placeholder repository URL** — PLACEHOLDER status at 2026-04-18T02:04:23Z. Current `repository.url`, `homepage`, `bugs.url` in package.json all point at `brief-build/brief`, an unreserved GitHub org+repo. Documented as W1 closure per checker iteration 1. Constraint: no `npm publish` while PLACEHOLDER; Phase 9 HRD-02 resolves.

4. **FND-07 — Business-planning-domain language** — VERIFIED at 2026-04-18T02:09:41Z. Post-rewrite counts:
   - Biz vocab (`business planner|OBJECTIVES.md|workstream|audience`): CLAUDE.md=25, README.md=14 (both >> plan minima of 2 and 5).
   - Dev vocab (`code review|TDD|deployment|security audit|unit test`): CLAUDE.md=2, README.md=0, combined=2 (≤3 plan cap).
   - package.json residue (`spec-driven|get-shit-done-cc|gsd-build/get-shit-done`): 0.

### CLAUDE.md (30 insertions / 11 deletions net)

- **Project section** (BRIEF:project-start/end): fixed semantic regression introduced by Plan 05's blanket `GSD → BRIEF` substitution. "hard-forked from BRIEF (BRIEF)" restored to "hard-forked from GSD (Get Shit Done)"; `Inherited from BRIEF` / `Must preserve BRIEF's atomic-commit` / `same as BRIEF` in the Constraints block restored to the correct GSD attributions. Project section now matches PROJECT.md lines 3–18 exactly.

- **Workflow section** (BRIEF:workflow-start/end): `BRIEF Workflow Enforcement` body replaced. Old text listed `/brief-quick` (survivor), `/brief-debug` (REMOVED in Plan 02 per D-02), `/brief-execute-phase`. New text anchors workflow to the DEFINE → DISCOVER → DESIGN → DELIVER model, lists `/brief-discuss-phase`, `/brief-plan-phase`, `/brief-execute-phase`, `/brief-verify-work` as the Phase-1 entry points, and includes a Phase-1 caveat noting that the BRIEF domain-specific commands (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`) arrive in Phases 3–8.

- **Stack section** (BRIEF:stack-start/end): appended a `### BRIEF-Specific Stack Notes` block with four bullets — zero runtime deps (A1 verified), Marp via `npx --yes` during Phase 8, multi-runtime detection preserved (naming BOTH detection sites), and business-planner workflow (audience/confidentiality/voice frontmatter, OBJECTIVES.md anchor).

- Sentinels balanced: 7 starts, 7 ends (project, stack, conventions, architecture, skills, workflow, profile).

### README.md (63 insertions / 171 deletions net)

Three major edits (D-14 targeted-delta):

1. **Hero** (lines 1–31, was 1–46): replaced title (`# GET SHIT DONE` → `# BRIEF` + subtitle `Business Research, Insight & Execution Framework`), tagline (spec-driven-development-system → "A hard fork of GSD, purpose-built for business and product strategy planning"), intro (context-rot → BRIEF-transforms-fuzzy-idea), testimonials block removed. Install command `npx brief-cc@latest` retained. Badges/Discord/Twitter/stars removed (noise in Phase 1). Nav links updated to match new sections: Core Value, Four Phases, Status and Roadmap, Commands. Phase 1 status blurb added explicitly.

2. **Why I Built This → Who This Is For block** (lines 47–68, was 64–100): replaced TÂCHES solo-developer narrative + "v1.36.0 Highlights" list with:
   - `## Core Value` section (direct quote from PROJECT.md Core Value + one-paragraph expansion describing what BRIEF swaps from GSD).
   - `## Who This Is For` section (5-bullet audience list: business planners, PMs, founders, strategy consultants, Korea-first + Not-for callout pointing back to GSD for SWE workflows).
   - `## Four Phases` section (DEFINE → DISCOVER → DESIGN → DELIVER one-liner each).

3. **Commands section** (lines 530–563, was 561–681): replaced 10 sub-sections (Core Workflow, Workstreams, Multi-Project Workspaces, UI Design, Navigation, Brownfield, Phase Management, Session, Code Quality, Backlog & Threads, Utilities) with:
   - Phase-1 reality note ("BRIEF-domain commands arrive in Phases 3–8").
   - `### Core Workflow (Phase 1)` table (6 inherited workflow primitives survivors).
   - `### Phases 3–8 (coming)` list (6 future BRIEF-domain commands).
   - Preservation note about inherited GSD workflow commands with `/brief-` prefix.

Also appended `## Status and Roadmap` + `## Localized READMEs` sections before Configuration. Localized READMEs (ko-KR / ja-JP / pt-BR / zh-CN) explicitly flagged as Phase 9 scope and not touched.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Fixed Plan-05-induced semantic regression in CLAUDE.md Project section**
- **Found during:** Task 2 read-before-edit of CLAUDE.md.
- **Issue:** Plan 05's blanket `GSD → BRIEF` substitution produced nonsensical phrases: "hard-forked from BRIEF (BRIEF)", "Inherited from BRIEF", "Must preserve BRIEF's atomic-commit + STATE.md file lock", "same as BRIEF". Without correction, CLAUDE.md would have presented BRIEF as forked from itself.
- **Fix:** Restored the correct "GSD" / "Get Shit Done" attributions in the Project section block. This is technically reversing what Plan 05 did to this specific block, but Plan 05's own note documented that substitutions in semantic ancestry contexts were left as Phase 6 cleanup.
- **Files modified:** CLAUDE.md (lines 6, 12, 13, 14, 17).
- **Commit:** e8b8478

**2. [Rule 3 — Blocking issue] Softened README.md Hero "GSD (Get Shit Done)" to "GSD" to pass FND-07 gate**
- **Found during:** Task 3 first verify run — "GSD brand still in hero" gate failed.
- **Issue:** Plan 06 Task 3's action-block Hero template included "A hard fork of GSD (Get Shit Done)". Task 3's own verification gate asserts `! head -60 README.md | grep -qi "Get Shit Done"`. This is a plan-internal contradiction.
- **Fix:** Changed "A hard fork of GSD (Get Shit Done)" → "A hard fork of GSD" in the hero block only. GSD attribution remains in the intro paragraph (line 13: "PRD that BRIEF's briefs feeds cleanly back into GSD itself for execution") — below the 60-line hero cutoff and outside the gated region.
- **Files modified:** README.md (line 9).
- **Commit:** e8b8478

**3. [Documented, not fixed — accepted residual] Dev-vocabulary count = 2 in CLAUDE.md (lines 60, 95)**
- **Found during:** Task 4 FND-07 gate.
- **Issue:** Two lines contain "TDD" and/or "code review":
  - Line 60 (`Patterns to Absorb` table): "...TDD enforcement, subagent dev, code review — intentionally dropped — they don't translate..."
  - Line 95 (`What NOT to Use` table): "...TDD enforcement, subagent code review, browser automation skills don't translate to business planning..."
- **Why not fixed:** Both occurrences describe features BRIEF **rejected / dropped** from external references (superpowers, gstack). The text is anti-example framing, not BRIEF feature description. Removing them would weaken the documentation's explanation of what BRIEF is not.
- **Disposition:** Accepted under plan's ≤3 dev-vocab cap. ASSUMPTIONS.md FND-07 entry records the exact location + rationale. Phase 9 polish can prune further if desired.

### Auth / Architecture Changes

None. No auth gates. No architectural decisions required.

## Phase 1 Complete

Plan 06 closes Phase 1 with all 6 ROADMAP.md Success Criteria met:

| # | Criterion | Requirement | Evidence |
|---|-----------|-------------|----------|
| 1 | backup/original-gsd branch exists | FND-01 | `git branch` shows backup/original-gsd (Plan 01 commit `5b4ac01`) |
| 2 | No removed-agent commands present | FND-02 | Plan 02 removed 56 files (commit `b2c758e`); Plan 06 BLOCKER 1 grep: 0 orphans |
| 3 | /brief-* works; /gsd-* 404s | FND-03 | Plans 03+04+05 renamed everything (commits `312db0b`, `d49f306`, `46b04d9`); Plan 06 BLOCKER 2 grep: test iterates 18 brief-* agents |
| 4 | package.json deps empty | FND-04 | Plan 06 Task 1 verified `Object.keys(deps).length === 0`; logged in `.planning/ASSUMPTIONS.md` A1 entry |
| 5 | Multi-runtime detection works | FND-06 | Plan 06 Task 1 dual-site grep: `INSTRUCTION_FILE` = 8 refs in `brief/workflows/`, `text_mode` = 6 refs in `brief/bin/lib/`, `get-shit-done` residue = 0 in lib; logged in ASSUMPTIONS.md FND-06 entry. Actual cross-runtime smoke = Phase 9 HRD-01. |
| 6 | CLAUDE.md + README.md business-planning language | FND-07 | Biz vocab CLAUDE=25, README=14; dev vocab combined = 2 (both intentional anti-examples); package.json GSD residue = 0; logged in ASSUMPTIONS.md FND-07 entry |

### Phase 1 Plan-Delivery Commits (6)

| Plan | Commit | Message |
|------|--------|---------|
| 01 | `5b4ac01` | chore(01): create backup/original-gsd branch for rollback safety (FND-01) |
| 02 | `b2c758e` | chore(01-remove): drop GSD development surfaces (56 files) (FND-02) |
| 03 | `312db0b` | refactor(01-rename): brief-* prefix for commands, agents, hooks, tests (FND-03 part 1) |
| 04 | `d49f306` | refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2) |
| 05 | `46b04d9` | refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; BLOCKER 1+2 + W3+W4+W5 closure) |
| 06 | `e8b8478` | docs(01): CLAUDE.md + README.md targeted delta, ASSUMPTIONS.md A1+FND-06+FND-07+A-REPO (closes Phase 1) |

### What Remains for Phase 2 (Stable Seam)

Phase 2 (per ROADMAP.md lines 48–57) depends on Phase 1 being closed cleanly and focuses on:

- **A4 verification** — `state.cjs` round-trips `state.brief.*` namespaced fields without loss (inherited file-lock infrastructure survives the rename; needs a smoke test under the new path).
- **Workstream-as-yaml** — declare a new built-in workstream via `workstream-spec.yaml` with zero `.cjs` source change. Design committed up-front (FND-08) before any built-in workstream is written.
- **CLAUDE.md caps** — explicit ≤12 slash commands + ≤8 skills caps with rationale, enforced before any feature work in Phases 3–9.
- **`/brief-status` skeleton** — one-screen summary showing phase / workstream / return-stack depth / last ALIGN finding / last COMPLIANCE finding, even if values are placeholder.

Phase 2 does not need to re-verify FND-04 / FND-06 / FND-07 — those are now anchored in `.planning/ASSUMPTIONS.md` with command evidence for future regression checks.

### Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes introduced by Plan 06. Documentation-only plan closing Phase 1.

## Self-Check: PASSED

### Files exist
- `.planning/ASSUMPTIONS.md` — FOUND (110 lines; sections: A1, FND-06, A-REPO, FND-07)
- `CLAUDE.md` — FOUND (modified; 7 sentinel pairs balanced; dev vocab = 2)
- `README.md` — FOUND (modified; BRIEF hero; Core Value / Who This Is For / Four Phases / Status and Roadmap / Localized READMEs sections present; Commands reflects Phase-1 reality; install = `npx brief-cc@latest`)
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-06-SUMMARY.md` — FOUND (this file)

### Commits exist
- `e8b8478 docs(01): CLAUDE.md + README.md targeted delta, ASSUMPTIONS.md A1+FND-06+FND-07+A-REPO (closes Phase 1)` — FOUND in git log
- All 6 Phase-1 plan-delivery commits present in git log (see table above)

### Automation gates passed
- A1 (deps count = 0): PASS
- FND-06 dual-site (INSTRUCTION_FILE in workflows/ = 8; text_mode in bin/lib/ = 6; get-shit-done in bin/lib/ = 0): PASS
- FND-07 biz vocab (CLAUDE=25 ≥ 2; README=14 ≥ 5): PASS
- FND-07 dev vocab (combined=2 ≤ 3): PASS
- FND-07 package.json residue (spec-driven|get-shit-done-cc|gsd-build/get-shit-done = 0): PASS
- BLOCKER 1 orphan grep (repo-wide, excl documented exclusions) = 0: PASS
- BLOCKER 2 tests/agent-frontmatter.test.cjs (has `startsWith('brief-')` not `'gsd-'`; iterates 18 brief-* agents ≥ 18): PASS
- Lib layer loads (`require('./brief/bin/lib/core.cjs')` exits 0): PASS
- package.json valid JSON: PASS
- Sentinel pairs balanced (7 starts / 7 ends in CLAUDE.md): PASS
