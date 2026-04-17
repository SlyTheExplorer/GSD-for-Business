# Phase 1: Foundation — Fork Hygiene, Removal, Rename - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

BRIEF presents itself as a clean fork: GSD-development-specific surfaces are gone, all identifiers (commands, agents, hooks, internal paths, binaries) are renamed `brief-*` aggressively, multi-runtime detection still works, and the zero-runtime-deps property is verified before any new code is written. This phase establishes the architectural foundation; **no features are added** in this phase — only removals, renames, and verifications.

</domain>

<decisions>
## Implementation Decisions

### Removal Scope (FND-02 detail)

- **D-01:** All 28 originally-identified GSD development-specific files are removed. The originally-identified set (per PROJECT.md and research analysis) covers:
  - **Code review/test/debug:** `gsd-code-reviewer`, `gsd-code-fixer`, `gsd-debugger` (agents); `code-review.md`, `code-review-fix.md`, `add-tests.md` (commands); `code-review.md`, `code-review-fix.md`, `add-tests.md` (workflows); `add-tests.md` (templates); `tdd.md` (references)
  - **UI/Frontend:** `gsd-ui-researcher`, `gsd-ui-checker`, `gsd-ui-auditor` (agents); `ui-phase.md`, `ui-review.md` (commands + workflows); `UI-SPEC.md` (template)
  - **AI/LLM integration:** `gsd-ai-researcher`, `gsd-eval-planner`, `gsd-eval-auditor`, `gsd-domain-researcher` (agents); `ai-integration-phase.md`, `eval-review.md` (commands + workflows); `AI-SPEC.md` (template)
  - **Security audit:** `gsd-security-auditor` (agent); `secure-phase.md` (command + workflow)
  - **Integration:** `gsd-integration-checker` (agent)

- **D-02:** Additional borderline removals (user-confirmed):
  - **`gsd-debug` removed** — SW-debugging specific. BRIEF surfaces stuck-workstream issues via ALIGN/COMPLIANCE findings, not a debug session manager.
  - **`gsd-spike` + `gsd-sketch` + `gsd-spike-wrap-up` + `gsd-sketch-wrap-up` removed** — SW experimentation tools. BRIEF's Phase 1 DISCOVER already provides broad exploration via parallel researchers.
  - **`gsd-pr-branch` + `gsd-ship` + `gsd-inbox` removed** — Git PR/issue workflow. BRIEF's planning artifacts are not subject to PR review the same way; deliverables exit the system as PPTX/PDF/Markdown for stakeholders, not as PRs.
  - **`gsd-forensics` + `gsd-graphify` removed** — SW architecture forensics tools. BRIEF's EXEC-SUMMARY/DECISION-MEMO (Phase 8 Type B) serves a similar audit/communication role for the business domain.

- **D-03:** Removal is recursive — for every removed command, the planner MUST also delete:
  - The corresponding agent definition file in `agents/`
  - Any template file the command references in `templates/`
  - Any reference doc the command depends on in `references/` (e.g., `tdd.md`, `code-review-checklists.md`)
  - Any test file in `tests/` that exercises the removed command
  - Any workflow markdown in `get-shit-done/workflows/` that backs the removed command

  **Anti-pattern:** Leaving orphaned files (a command removed but its agent/template/workflow remains) creates confusion. Every removal must be complete.

- **D-04:** Final removal count is approximately 38–45 files (originally 28 + four borderline categories + their associated agent/template/reference/test files). Exact count will be enumerated during plan-phase.

### Rename Strategy (FND-03 detail)

- **D-05:** **Aggressive rename.** Every `gsd-*` identifier — user-facing AND internal — is renamed to `brief-*`. Specifically:
  - **Filenames:** `agents/gsd-*.md` → `agents/brief-*.md`; `commands/gsd/*.md` → `commands/brief/*.md`; `hooks/gsd-*.{js,sh}` → `hooks/brief-*.{js,sh}`; `tests/gsd-*.test.cjs` → `tests/brief-*.test.cjs`
  - **Directory names:** `get-shit-done/` → `brief/`; `commands/gsd/` → `commands/brief/`
  - **Binaries:** `gsd-tools.cjs` → `brief-tools.cjs`; `gsd-sdk` (npm package, if present) → `brief-sdk`
  - **Identifiers and prefixes:** All `gsd-*` slash commands → `/brief-*`; all `gsd-*` agent subagent_type values → `brief-*`; all internal `state.gsd.*` namespaces (if any) → `state.brief.*`
  - **Internal text references:** All `.md` and `.cjs` files that mention "GSD", "Get Shit Done", or paths like `get-shit-done/` are updated to use BRIEF terminology and paths

- **D-06:** **Trade-off accepted: GSD upstream merge possibility is abandoned.** This is an explicit acceptance of Pitfall #8 (fork drift) risk in exchange for vocabulary cleanliness. Mitigation: the `backup/original-gsd` branch (FND-01) is the only path back to upstream-compatible code.

- **D-07:** **No aliases.** No `gsd-*` command works after Phase 1 completes. `command not found` is the correct response — this is part of FND-03's success criterion.

### Commit Strategy

- **D-08:** **Staged commits in 6 sequential atomic commits** (expanded from an initial 5-commit plan to add a Phase-1-closing documentation + verification commit that writes ASSUMPTIONS.md and rebrands CLAUDE.md/README.md). Revision iteration 2 (2026-04-18) normalized the count to 6 across all plans. The ordering:
  1. **`chore(01): create backup/original-gsd branch for rollback safety (FND-01)`** — `git branch backup/original-gsd` + STATE.md update (Plan 01, commit 1 of 6)
  2. **`chore(01-remove): drop GSD development surfaces (X files) (FND-02)`** — All ~37–44 file removals + audit trail (Plan 02, commit 2 of 6)
  3. **`refactor(01-rename): brief-* prefix for commands, agents, hooks, tests (FND-03 part 1)`** — User-facing identifiers renamed (Plan 03, commit 3 of 6)
  4. **`refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)`** — Aggressive internal rename + descriptive package.json fields (Plan 04, commit 4 of 6)
  5. **`refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; W3/W4/W5 surgical closure)`** — Two-phase (surgical + blanket) string/path replacements (Plan 05, commit 5 of 6)
  6. **`docs(01): CLAUDE.md + README.md targeted delta, ASSUMPTIONS.md A1+FND-06+FND-07 (closes Phase 1)`** — Verification + documentation rewrite closing Phase 1 (Plan 06, commit 6 of 6)

- **D-09:** **Each commit must leave the repo in a buildable state** (i.e., no half-applied rename). If a step would break the repo, split it further. `git revert HEAD` on any of these commits should produce a coherent state.

- **D-10:** Commit messages follow Conventional Commits with `chore`/`refactor`/`docs` prefixes — no `feat` because Phase 1 adds no features.

### npm Package Name

- **D-11:** **`brief-cc`** — Inherits the `-cc` (Claude Code) suffix pattern from GSD's `get-shit-done-cc`. Maintains naming consistency with the GSD lineage in package metadata. Consequence: `package.json` `name` field, `bin` entry, and any references to the install command get updated. Confirm `brief-cc` is available on npm before publishing (do NOT publish in Phase 1 — that's a v1-launch concern).

### CLAUDE.md Targeted Delta (FND-07 detail)

- **D-12:** **Targeted-delta approach** for CLAUDE.md (the just-generated 31KB file). Replace specific sections; reuse general structure. Sections to replace:
  - **Project section** — Replace the GSD project summary with BRIEF's domain summary (pull from PROJECT.md "What This Is" and "Core Value")
  - **Workflow section** — Replace GSD's `plan → execute → verify` cycle description with BRIEF's `DEFINE → DISCOVER → DESIGN → DELIVER + continuous ALIGN` model
  - **Skills/Commands section** — Replace `/gsd-*` command listing with `/brief-*` command listing (excluding the removed dev surfaces)
  - **Stack section** — Add BRIEF-specific notes (Marp via `npx --yes` for deck rendering, zero runtime deps confirmed, multi-runtime preserved)

- **D-13:** Sections to leave unchanged: Conventions, Architecture, Skills (placeholder), generic structure/format.

- **D-14:** **README.md follows the same delta pattern** as CLAUDE.md — replace BRIEF-relevant sections, reuse generic structure. README scope is broader than CLAUDE.md (includes "What is BRIEF", "Quick Start", "Examples", "Roadmap link"); the planner will detail.

### Pre-Verified Items (no discussion needed)

- **A1 verified ahead of phase:** `node -e "console.log(require('./package.json').dependencies)"` returned `{}`. The bin layer is empty-deps. This is recorded as success criterion 4 in Phase 1; the planner will codify the verification step in `.planning/ASSUMPTIONS.md`.

- **A4 not in scope:** Verification of `state.cjs` round-trip behavior for namespaced fields is **Phase 2** (Stable Seam), not Phase 1.

### Claude's Discretion

- Exact mechanics of the rename operation (use `git mv` for tracked rename history; use `find/sed` or `Edit` tool for text replacements — planner decides)
- Order of operations within each commit (e.g., which file gets renamed first within commit 3)
- Internal text-reference normalization edge cases (e.g., when "GSD" appears in a comment context vs. a path context — pattern matching strategy)
- Hooks-directory rename details (gsd-prompt-guard.js → brief-prompt-guard.js etc., including any settings.json hook path updates)
- Test-suite update strategy (do existing tests pass after rename? planner verifies)
- README.md exact section-by-section delta (planner determines specifics from current README content)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project decisions and requirements
- `.planning/PROJECT.md` — Full project context, Key Decisions table, Out of Scope rationale
- `.planning/REQUIREMENTS.md` — Phase 1 requirements (FND-01 through FND-07 inclusive; FND-04 already verified)
- `.planning/ROADMAP.md` — Phase 1 success criteria (lines 27–40), ordering rationale, pitfall coverage table

### Research backing the decisions
- `.planning/research/STACK.md` — Assumption A1 details (zero runtime deps), `npx --yes` pattern, dependency policy
- `.planning/research/ARCHITECTURE.md` — Three-layer design (User → BRIEF overlay → GSD core), fork-merge-ability seam discussion (NOTE: Phase 1's Aggressive rename decision DEPARTS from ARCHITECTURE.md's Conservative recommendation — this is an explicit accepted trade-off)
- `.planning/research/PITFALLS.md` — Pitfall #8 (fork drift) accepted explicitly per D-06; Pitfall #1 (skill bloat) reduced by removal scope; Pitfall #2 (cross-runtime fragility) protected by FND-06
- `.planning/research/SUMMARY.md` — Phase 1 ordering rationale (Foundation must be first), HIGH-RISK assumption verification responsibilities

### Files being inspected or modified
- `package.json` — A1 verification target; npm `name`, `bin`, and dependency fields updated in commit 4
- `.gitignore` — Already updated (`.planning/` and `CLAUDE.md` unignored). No further changes expected in Phase 1 unless rename creates new ignore needs
- `CLAUDE.md` — Generated in Step 8 of new-project; targeted-delta rewrite per D-12 to D-14
- `README.md` — Targeted-delta per D-14 (planner reads current content first)

### Inherited GSD core paths (subject to Aggressive rename per D-05)
- `get-shit-done/bin/lib/` — Inherited core (state.cjs, frontmatter.cjs, etc.); directory renamed `brief/bin/lib/`
- `get-shit-done/workflows/` — All workflow markdown; renamed `brief/workflows/`; internal "GSD" references updated per D-05
- `get-shit-done/templates/` — All artifact templates; renamed `brief/templates/`; removed templates per D-03
- `get-shit-done/references/` — Reference guides; renamed `brief/references/`; removed references per D-03

</canonical_refs>

<code_context>
## Existing Code Insights

### File inventory at Phase 1 entry (verified via Bash)
- `agents/gsd-*.md`: 31 files (all subject to rename or removal)
- `commands/gsd/*.md`: 75 files (all subject to rename or removal)
- `hooks/gsd-*`: 11 files (`gsd-check-update-worker.js`, `gsd-check-update.js`, `gsd-context-monitor.js`, `gsd-phase-boundary.sh`, `gsd-prompt-guard.js`, `gsd-read-guard.js`, `gsd-read-injection-scanner.js`, `gsd-session-state.sh`, `gsd-statusline.js`, `gsd-validate-commit.sh`, `gsd-workflow-guard.js`)
- `package.json` `dependencies`: `{}` (verified — Assumption A1 holds)
- `package.json` `devDependencies`: 3 items
- Git branches: `main` only (no `backup/original-gsd` yet — must be created in commit 1)

### Reusable Assets (kept and renamed, NOT removed)

- **`gsd-planner`, `gsd-executor`, `gsd-verifier`** → renamed to `brief-planner`, `brief-executor`, `brief-verifier` — these are core workflow orchestrators that BRIEF reuses verbatim with only domain-text updates in their prompts
- **`gsd-discuss-phase`, `gsd-plan-phase`, `gsd-execute-phase`, `gsd-verify-work`** → renamed to `/brief-discuss-phase`, `/brief-plan-phase`, etc. — these are the workflow primitives BRIEF inherits
- **`gsd-tools.cjs`** → renamed to `brief-tools.cjs` — the SDK shim that workflow files invoke for `init`, `commit`, `query` operations
- **`get-shit-done/bin/lib/state.cjs`** → renamed to `brief/bin/lib/state.cjs` — STATE.md file lock primitive used by every workflow
- **Hooks (all 11)** → renamed `gsd-*` → `brief-*` prefix; functionality unchanged

### Established Patterns

- **Atomic commits via `gsd-tools.cjs commit`** — already in use throughout the new-project workflow; planner should continue invoking `brief-tools.cjs commit` (after rename) for every Phase 1 commit
- **`init` JSON-driven workflow setup** — every workflow starts with `init` query; this pattern is inherited and renamed
- **Multi-runtime detection** (Claude/Codex/Gemini/OpenCode) — must NOT regress; FND-06 success criterion verifies this

### Integration Points

- **`commands/<runtime>/`** convention — runtime-specific command directories (`commands/claude/`, `commands/copilot/`, etc.); after Aggressive rename these reference `brief/` paths
- **`hooks/` registered via `.claude/settings.json` (or equivalent)** — hook file rename must be matched by settings updates if such settings exist
- **`package.json bin` field** — `get-shit-done-cc` → `brief-cc`; the global install command changes too

</code_context>

<specifics>
## Specific Ideas

- The user explicitly chose **Aggressive over Conservative** despite the research recommendation. Honor that choice — do not reintroduce Conservative behavior in implementation. The trade-off is documented in D-06 and accepted.
- The dogfooding aspect is significant: this Phase 1 transformation is the first BRIEF artifact users will see when comparing BRIEF to GSD on GitHub. A clean break (Aggressive) tells the better story than a half-rename (Conservative or Hybrid).
- The user wants "사업기획에 적합한" identity. After Phase 1, the codebase should not visibly resemble GSD at the directory/filename level.

</specifics>

<deferred>
## Deferred Ideas

(Items that came up during this discussion but belong in other phases — captured here so they're not lost.)

- **`brief-debug` adapted from `gsd-debug` for stuck-workstream cases** — Considered and rejected for v1. If real users report stuck-workstream pain in pilot (Phase 9 / HRD-04), revisit as v2 scope.
- **`brief-update` mechanism for self-updating BRIEF** — `gsd-update` was not in the explicit removal list, but it presupposes upstream GSD as source-of-truth. Either remove (no auto-update for fork) or rewrite (update from BRIEF's own npm). Defer to **Phase 9** (Hardening) when launch decisions are made.
- **README example flow demonstrating BRIEF end-to-end** — Touched on as a CLAUDE.md/README question. The full README example is **Phase 9** scope (after the system is feature-complete).
- **Compatibility shim or migration guide for users coming from GSD** — Explicitly rejected per D-07 (no aliases). If demand emerges post-launch, defer to a future v2.
- **Marp install verification (`npx --yes @marp-team/marp-cli`)** — Belongs in **Phase 8** (DELIVER) where Marp is actually used. No Phase 1 work.
- **`workstream-spec.yaml` schema design** — Belongs in **Phase 2** (Stable Seam). Phase 1 only removes/renames; no new schemas.

</deferred>

---

*Phase: 01-foundation-fork-hygiene-removal-rename*
*Context gathered: 2026-04-18*
*Revised: 2026-04-18 (iteration 2) — D-08 normalized to 6 commits across all plans; orphan-audit scope expanded (BLOCKER 1); surgical-edit coverage extended to bin/install.js, tests/, docs/, CHANGELOG.md (BLOCKER 1); bare-prefix fix for tests/agent-frontmatter.test.cjs line 21 (BLOCKER 2); placeholder URL strategy documented as Phase 9 deferred (W1); EXCLUDE list unified across verbose-brand and acronym substitutions (W3); npm test baseline captured with delta cap (W4)*
