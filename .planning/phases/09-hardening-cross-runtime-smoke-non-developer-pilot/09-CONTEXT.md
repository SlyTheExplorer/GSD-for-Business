# Phase 9: Hardening — Cross-Runtime Smoke + Non-Developer Pilot - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous-optimized) — 4 gray areas presented as draft batch table from `09-DISCUSS-DRAFT.md` (prepared 2026-04-26 pre-/clear). All 4 areas accepted as Recommended. 16 decisions (A-D01..A-D04, B-D01..B-D04, C-D01..C-D04, D-D01..D-D04). No area re-opened or "Discuss deeper".

<domain>
## Phase Boundary

Phase 9 ships the **v1 launch hardening layer** — cross-runtime smoke verification, surface count audit + pruning, rich `/brief-help`, non-developer pilot logging, and Phase 1 HALT-ACCEPTED residual test closure (a)+(b). Phase 9 is the LAST phase before v1.0 milestone closure (audit → complete → cleanup).

**In scope:**

1. **HRD-01 — Cross-runtime smoke (stub-driven).** `brief-cli smoke-test` subcommand mocks 4 runtimes (Claude Code / Codex / Gemini / OpenCode) via subprocess + INSTRUCTION_FILE env injection. Verifies Phase 1 FND-06 detection code paths and AskUserQuestion → numbered-list `text_mode` fallback. 5 critical commands tested per runtime: `init`, `define`, `discover`, `design`, `deliver`. Result: `.planning/SMOKE-TEST.md` 4×5 PASS/FAIL/SKIP matrix. CLAUDE.md "Multi-runtime parity" section references it.
2. **HRD-02 — Surface count audit + pruning to ≤12 commands + ≤8 skills.** Lock 12 user-facing commands: BRIEF 8 (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`, `/brief-export`, `/brief-add-workstream`, `/brief-status`, `/brief-help`) + Helpers 4 (`/brief-init`, `/brief-progress`, `/brief-undo`, `/brief-pause-work`). 50+ remaining commands physically deleted from `commands/brief/` + `bin/install.js` cleanup; backup branch preserves them for reference. Skills cap auto-met: `.claude/skills/` is empty → 0/8. Rationale documented in `.planning/SURFACE-AUDIT.md` (one-line per command + per skill).
3. **HRD-03 — Rich `/brief-help` + Levenshtein.** New command `commands/brief/help.md` + `brief/bin/lib/help.cjs` (zero-deps, A1 invariant preserved). Categories: 4D phase grouping (DEFINE / DISCOVER / DESIGN / DELIVER + Helpers). `/brief-help <topic>` partial keyword match (e.g., `/brief-help define` → DEFINE phase commands + define.md body). Typo correction: top-3 Levenshtein suggestions with distance ≤ 3 (e.g., `/brief-defone` → `define`, `deliver`, `export`). Static JSON catalog generated at install/update time.
4. **HRD-04 — Non-developer pilot (partial 1/3 logged).** Current dogfooding session (Korean non-technical product owner) logged in `.planning/pilot/01-{user-id}-friction-journal.md`. Format: Pitfall #9 friction items (gray-area gauntlet load, agent quota fatigue, cwd bug exposure, smart_discuss table clutter, AskUserQuestion fallback gaps) with frequency + severity. Remaining 2/3 planners deferred to v1.1 beta (Out of Scope for v1 launch — explicitly logged). v1 launch gate redefined (see HRD-05 below).
5. **HRD-05 — Phase 1 HALT-ACCEPTED 63 residuals: (a)+(b) closure, (c)+(d) defer.** **(a) 19 missing-file tests:** create the 3 missing files (`pr-branch.md`, `diagnose-issues.md`, `ui-brand.md`) where in-scope OR remove the assertion where the file is intentionally absent. **(b) 14 ARCHITECTURE.md count drift:** sync `docs/ARCHITECTURE.md` to current commands/agents/templates counts (Phase 8 NET +2 cmds + +2 agents counted). **(c) 30 source-behavior drift** (MANAGED_HOOKS / CONV-07 / custom-detection / read-guard) **+ (d) 13 source-content drift** (agents required_reading / commands/brief/*.md frontmatter): deferred to v1.1 (large source diff, launch-non-blocking). Target: ≤ 16 npm test failures after Phase 9 closes (i.e., ≥ 47 of 63 closed).
6. **v1 launch gate redefinition.** Three-prong: (i) zero blocking pilot findings, (ii) smoke test PASS on all 4 runtimes × 5 commands (or documented SKIP rationale), (iii) surface cap compliance (12 cmds + 0 skills, audited). HRD-04 partial 1/3 is NOT a launch blocker (explicitly accepted as v1.1 expansion).

**Out of scope (deferred):**

- Real Codex / Gemini / OpenCode CLI invocation (env-dependent, API-cost-bearing) — stub/mock only in v1; v1.1 may add optional `--live` flag.
- 30 source-behavior + 13 source-content drift fixes (HRD-05 c/d) — v1.1 (estimated 4-6h source diff work).
- Remaining 2/3 non-developer pilots — v1.1 beta program (recruit + observe + journal).
- AUDIENCE/COMPLIANCE/ALIGN gate re-implementation — Phase 4/5/7 patterns inherited unchanged.
- New skills addition — `.claude/skills/` stays empty in v1; the 8-skill cap is reservation, not allocation.
- Marp environment auto-install (Chrome / LibreOffice / Pandoc) — manual user setup per `marp-environment.md`.
- `/brief-new-milestone` multi-cycle restart — v2 (per PROJECT.md Out of Scope).

</domain>

<decisions>
## Implementation Decisions

### Grey Area A — Surface cap pruning (HRD-02)

| ID | Decision | Why |
|---|----------|-----|
| **A-D01** | Lock 12 user-facing commands: BRIEF 8 (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`, `/brief-export`, `/brief-add-workstream`, `/brief-status`, `/brief-help`) + Helpers 4 (`/brief-init`, `/brief-progress`, `/brief-undo`, `/brief-pause-work`) | Mirrors 4D phase model + minimum life-cycle helpers; user explicitly confirmed line-up over Discuss deeper |
| **A-D02** | 50+ remaining commands: physically delete from `commands/brief/` + `bin/install.js` cleanup; backup branch preserves them | Hard fork discipline (PROJECT.md Key Decisions); avoids dual-vocabulary skill-bloat (Pitfall #1) |
| **A-D03** | Skills cap: `.claude/skills/` empty (0/8); HRD-02 audit doc states explicitly | Reservation > allocation; v1.x can add skills as evidence-driven |
| **A-D04** | Rationale documentation: `.planning/SURFACE-AUDIT.md` (alongside Phase 2 D-09 cap source) | Single-source audit doc; CLAUDE.md "Surface Caps" section references it |

### Grey Area B — Cross-runtime smoke test (HRD-01)

| ID | Decision | Why |
|---|----------|-----|
| **B-D01** | Implementation approach: stub-driven (4 mock subprocesses; no real Codex/Gemini/OpenCode CLI calls) | User-environment-independent; A4 multi-runtime claim verifiable without external API costs; v1.1 may add `--live` opt-in |
| **B-D02** | 5 critical commands per runtime: `init`, `define`, `discover`, `design`, `deliver` | ROADMAP success criterion explicit list; `/brief-export` excluded (Marp env-dependent — separate manual verification) |
| **B-D03** | text_mode fallback verification: mock INSTRUCTION_FILE env; capture AskUserQuestion → numbered-list switch | Phase 1 FND-06 invariant validation; runtime detection logic untouched |
| **B-D04** | Result format: `.planning/SMOKE-TEST.md` 4 runtimes × 5 commands = 20-cell PASS/FAIL/SKIP matrix; CLAUDE.md "Multi-runtime parity" section references | Single-page audit; one-line per cell with reason on FAIL/SKIP |

### Grey Area C — Rich `/brief-help` (HRD-03)

| ID | Decision | Why |
|---|----------|-----|
| **C-D01** | Categorization: 4D phase grouping (DEFINE / DISCOVER / DESIGN / DELIVER + Helpers) | Mirrors user mental model + workflow phase taxonomy; alphabetical/frequency lose phase semantics |
| **C-D02** | `/brief-help <topic>` behavior: partial keyword match (e.g., `/brief-help def` → DEFINE phase + define.md body) | Permissive UX; exact-match-only too rigid for fuzzy memory |
| **C-D03** | Typo correction: Levenshtein top-3 suggestions, distance ≤ 3 | Standard CLI affordance; threshold avoids false-positive noise |
| **C-D04** | Implementation location: `commands/brief/help.md` (new command) + `brief/bin/lib/help.cjs` (static JSON catalog + Levenshtein); A1 zero-deps preserved | Inline 50-line Levenshtein avoids `commander`/`fast-levenshtein` dep; lib split mirrors existing brief-tools.cjs pattern |

### Grey Area D — HRD-04 (pilot) + HRD-05 (residual fails) handling

| ID | Decision | Why |
|---|----------|-----|
| **D-D01** | HRD-04 pilot satisfaction: partial 1/3 — current dogfooding session (Korean non-technical product owner) logged; remaining 2/3 deferred to v1.1 beta (Out of Scope explicit) | Realistic: 3-planner observation in v1 not feasible; partial-with-explicit-Out-of-Scope clearer than spec weakening |
| **D-D02** | HRD-05 residual scope: (a) 19 missing-file + (b) 14 ARCH.md drift fixed in Phase 9; (c) 30 source-behavior + (d) 13 source-content deferred to v1.1 | (a)+(b) are surgical; (c)+(d) require ~4-6h source-side diff work; launch non-blocking |
| **D-D03** | Pilot friction measurement: `.planning/pilot/01-{user-id}-friction-journal.md` — Pitfall #9 items × frequency + severity | Structured beats Likert (Pitfall #9 has the right vocabulary already); free-form text optional appendix |
| **D-D04** | v1 launch gate redefinition: (i) 0 blocking pilot findings, (ii) smoke test PASS, (iii) surface cap compliance — HRD-04 partial NOT blocker | 5-criterion 100% unrealistic; gate captures real launch-readiness signals; HRD-04 partial logged as accepted shortfall |

</decisions>

<code_context>
## Existing Code Insights

**Inherited infrastructure (do not re-architect):**
- **Phase 1 FND-06 runtime detection** — `INSTRUCTION_FILE` env + text_mode fallback in `brief/bin/lib/core.cjs` / `config.cjs` / `init.cjs`. Smoke test mocks INSTRUCTION_FILE per runtime.
- **Phase 1 install pipeline** — `bin/install.js` registers `commands/brief/*.md` to runtime-specific paths (`.claude/commands/brief/`, `.codex/commands/brief/`, etc.). Surface pruning (HRD-02) deletes 50+ entries here in addition to the markdown files.
- **Phase 2 surface cap source** — CLAUDE.md "Surface Caps" section states ≤12 cmds + ≤8 skills with Phase 9 HRD-02 audit gate. Phase 9 closes the gate.
- **Phase 7 / 8 NET cmd additions** — `/brief-design`, `/brief-add-workstream`, `/brief-deliver`, `/brief-export`. All 4 stay in the locked 12-cmd line-up (A-D01).
- **brief-tools.cjs lib split pattern** — Phase 8 added `deliver.cjs`, `voice-fit.cjs`, `leakage-diff.cjs`, `export.cjs`. HRD-03 adds `help.cjs` to mirror the pattern.

**Pitfall hooks loaded:**
- **Pitfall #1 — Skill bloat:** HRD-02 surface cap = direct mitigation.
- **Pitfall #9 — Non-developer friction:** HRD-04 pilot journal vocabulary = direct mitigation.
- **Pitfall #12 — Slash-command memorability:** HRD-02 line-up + HRD-03 categorization + Levenshtein = direct mitigation.

**Phase 8 patterns to inherit:**
- smart_discuss → plan-phase (with research + pattern-mapper + plan-checker iter) → wave execution → code review + fix → verifier → mark complete → STATE record.
- Atomic commit per plan; PreToolUse-on-Bash frontmatter validator hook (CC-03) opt-in via `hooks.community: true`.

**Phase 8 cwd bug lesson (mandatory):**
- 3 worktree agents leaked into main during Phase 8 Wave 1. Phase 9 plan-phase MUST embed `<critical_cwd_warning>` block in every executor agent prompt (use Plan 08-08 reinforced version).

**Agent quota guard:**
- Plan 06 in Phase 8 hit agent limit → inline fallback. Phase 9 may have similar load. **Mitigation:** large plans → single worktree-isolated agent; parallel waves capped at Wave 1 only.

</code_context>

<specifics>
## Specific Ideas

1. **Surface audit doc structure (`.planning/SURFACE-AUDIT.md`):** 12-row commands table + 0-row skills table (with header). Each command row: name, 4D category, one-line rationale, Phase introduced. Each removed command (50+) listed in "Removed in v1" appendix with `git log --oneline` reference to backup branch.

2. **Smoke test stub design (`.planning/SMOKE-TEST.md`):**
   ```
   | Runtime    | init | define | discover | design | deliver |
   |------------|------|--------|----------|--------|---------|
   | Claude     | PASS | PASS   | PASS     | PASS   | PASS    |
   | Codex      | PASS | PASS   | PASS     | PASS   | SKIP*   |
   | Gemini     | PASS | PASS   | PASS     | PASS   | SKIP*   |
   | OpenCode   | PASS | PASS   | PASS     | PASS   | SKIP*   |
   ```
   `* SKIP reason: deliver requires Marp env which is OS-dependent — separate manual verification.`

3. **`/brief-help` flow:**
   - `/brief-help` (no arg) → list 12 commands grouped by 4D phase + Helpers, one-line each
   - `/brief-help define` → exact-or-prefix match → DEFINE phase commands + `commands/brief/define.md` body excerpt
   - `/brief-help xyz` (no match) → "No exact match. Did you mean: define, deliver, discover?" (top-3 Levenshtein, distance ≤ 3)
   - `/brief-help` static catalog generated at `bin/install.js` step from frontmatter scan; rebuilt on `brief update`

4. **Pilot friction journal template:**
   ```yaml
   ---
   pilot_id: 01
   user_role: korean-non-technical-product-owner
   logged: 2026-04-27
   ---

   # Friction Items

   ## Pitfall #9 — Non-developer barriers

   - smart_discuss table clutter: severity=medium, frequency=4/4 phases, mitigation=batch-table-with-recommended-defaults (working)
   - agent quota fatigue: severity=high, frequency=Phase 8 once (Plan 06), mitigation=single-worktree-isolated-agent (proposed)
   - cwd bug exposure: severity=high, frequency=Phase 8 Wave 1 (3 agents), mitigation=critical_cwd_warning block (active)
   - ...
   ```

5. **HRD-05 closure approach:**
   - **(a) 19 missing-file:** Each test → judge "does the missing file represent a feature gap or assertion drift?" → create file with placeholder content if feature-real, OR delete the assertion if assertion-drift. Per-test single-line rationale logged.
   - **(b) 14 ARCH.md count drift:** Sync `docs/ARCHITECTURE.md` "Modules" / "Commands" / "Agents" counts to current source state. Single commit.
   - Test count target: from 63 residual fails → ≤ 16 (so ≥ 47 closed). Document remaining 16 in `.planning/RESIDUAL-FAILS-V1.md` with v1.1 remediation plan.

6. **v1 launch gate doc (`.planning/V1-LAUNCH-GATE.md`):** Single page, three-prong checklist with current status. Auto-checked at Phase 9 verifier; published to PROJECT.md "v1 Status" section.

</specifics>

<deferred>
## Deferred Ideas

- **Real Codex / Gemini / OpenCode CLI invocation** — env-dependent, API-cost-bearing. v1.1 `--live` opt-in flag.
- **HRD-05 (c) 30 source-behavior drift + (d) 13 source-content drift** — v1.1 (~4-6h source diff). Target: residual ≤ 16 fails after Phase 9.
- **Remaining 2/3 non-developer pilots** — v1.1 beta program (recruit + observe + journal).
- **Marp environment auto-install** — Chrome / LibreOffice / Pandoc detection + setup helper. v1.x evidence-driven.
- **Skills allocation (0 → up to 8)** — v1.x evidence-driven; cap is reservation in v1.
- **`/brief-new-milestone` multi-cycle restart** — v2 per PROJECT.md.
- **Dynamic surface cap enforcement (pre-commit hook)** — v1.x; Phase 9 enforces via audit doc + manual review only (per Phase 2 D-07).

</deferred>
