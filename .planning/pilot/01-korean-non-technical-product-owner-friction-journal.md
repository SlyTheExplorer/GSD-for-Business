---
pilot_id: 1
user_role: korean-non-technical-product-owner
logged: 2026-04-27
audience:
  confidentiality: internal
voice:
  languages: [ko, en]
---

# Friction Journal — BRIEF dogfooding session (1 of 3 pilots)

**Pilot scope:** Korean non-technical product owner running BRIEF on BRIEF (dogfooding the framework using itself as the example project from Phase 1 fork through Phase 8 DELIVER).

**Transparency note (B4 revision iteration 1):** Pilot 1 of 3 is the BRIEF build-team vision-keeper — a non-technical Korean product owner who used BRIEF end-to-end on the BRIEF project itself. They are NOT a fully external pilot. They count as pilot 1/3 under D-D01 acceptance because they are non-technical (do not write production code in this project; act as product owner / vision-keeper) and used BRIEF on a real planning project. REQUIREMENTS.md HRD-04 was reworded in revision iteration 1 to match this acceptance. The other 2 pilots (fully external non-developer business planners) are deferred to v1.1 beta per D-D01 + D-D04 — explicitly NOT a v1 launch blocker.

**Coverage:** 1 of 3 non-developer planners per HRD-04 success criterion. Remaining 2/3 deferred to v1.1 beta program per D-D01 (explicit Out of Scope).

**Reading discipline (Pitfall 5):** Each friction row cites a concrete phase where it occurred. severity=high items are triaged below — fixed in Phase 9 OR explicitly logged as v1.1 with rationale.

## Pitfall #9 — Non-developer barriers

| Friction Item | Severity | Frequency | Phase Citation | Mitigation Status |
|---------------|----------|-----------|----------------|-------------------|
| smart_discuss table clutter — gray-area gauntlet load | medium | every phase since Phase 3 (4/4) | Phase 3, 5, 7, 8 | mitigated — batch table with Recommended defaults; user accepts area as-locked-set without per-area discussion |
| agent quota fatigue — Plan 06 agent-spawn limit hit | high | once | Phase 8 Plan 06 | mitigated — single worktree-isolated agent for large plans; Wave parallelism capped at Wave 1 in Phase 9 |
| cwd bug exposure — 3 worktree agents leaked into main | high | once | Phase 8 Wave 1 | mitigated — `<critical_cwd_warning>` block embedded in every executor agent prompt (Plan 08-08 reinforced version) |
| AskUserQuestion fallback gaps — runtime-detection assumed but never end-to-end verified before Phase 9 | medium | latent | Phase 1 FND-06 deferred → Phase 9 HRD-01 | mitigated — stub-driven smoke test verifies text_mode plumbing for all 4 runtimes |
| command surface memorability — 68 inherited commands obscure the 4D phase mental model | high | every session | Phase 1 inherited surface; Phase 2 D-09 cap source; Phase 9 HRD-02 closes | mitigated — surface pruning to locked 12 commands + rich /brief-help with Levenshtein typo suggestion (HRD-03) |
| implementation-seat discomfort — vision-keeper in product owner role surfaces fatigue when forced into code-review seat | medium | every plan-checker iteration | Phase 5/7/8 plan-checker review cycles | partial mitigation — delegated mode (skip 4-gray-area gauntlet on implementation-heavy phases per memory feedback_delegated_mode.md); pilot user can opt out of code-review in v1.1 |

## Severity=high Triage (Pitfall 5 discipline)

All 3 severity=high items above are mitigated within Phase 9 closure or were already mitigated by Phase 8 prior:

1. **agent quota fatigue** — Phase 8 lesson: Plan 06 fallback was inline implementation; Phase 9 plans cap Wave parallelism at Wave 1 (per planning_context recommendation in this plan's parent /brief-plan-phase invocation).
2. **cwd bug exposure** — Plan 08-08 reinforced the `<critical_cwd_warning>` block; Phase 9 plans (this set) embed the same block in any worktree-isolated agent task. Plan 05 (HRD-02 atomic deletion) is the single-agent worktree task in Wave 2.
3. **command surface memorability** — HRD-02 prunes from 68 → 12 (Plan 05); HRD-03 ships rich /brief-help (Plan 02 of this Wave). Both close in Phase 9.

No severity=blocker items found. v1 launch gate prong (i) "0 blocking pilot findings" expected to read PASS at Phase 9 verifier (Plan 06).

## Out of Scope (per D-D01 — v1.1 beta program)

- **2 of 3 remaining non-developer pilots:** Recruit + observe + journal during v1.1 beta. Selection target: one EN business planner (US/EU) + one non-Korean Asian region planner — for cross-region/cross-language friction signal beyond the Korean dogfooding baseline. The launch posture per D-D04 explicitly accepts the partial 1/3 as NOT a launch blocker.

## Appendix — narrative observations (free-form)

### A. Phase shape vs. mental model

The dogfooding session reinforced the Phase 8 lesson that BRIEF's 5-phase shape
(DEFINE → DISCOVER → DESIGN → DELIVER + continuous ALIGN) actually works for the
non-developer audience when each phase has a single canonical entry slash command.

The 4D phase categorization in /brief-help (HRD-03) maps onto the user's existing
mental model from running through 8 prior phases. Ahead of v1 launch the larger UX
risk is the gap between "Korean product owner who has been running BRIEF for 8
phases" and "EN founder running BRIEF for the first time" — the v1.1 beta program
is the right place to surface that signal, not a Phase 9 task.

### B. cwd-bug visceral memory

The Phase 8 cwd-bug remains the most painful single friction event in the journal:
the user's discomfort when 3 worktree agents leaked their changes into main was
visceral. The Plan 08-08 mitigation has held since Plan 09-00 onward.

The pilot user's note for v1.1 is to add a hard pre-flight check (e.g.,
`git rev-parse --show-toplevel` assertion) inside every worktree-isolated agent's
first action, beyond the prompt-level `<critical_cwd_warning>` block. Defense in
depth at the agent boundary is preferable to relying on prompt discipline alone.

### C. Korean honorific + bilingual surface

The pilot user runs BRIEF bilingually (Korean for vision-setting + reflection,
English for code/artifact substrate). The voice-fit honorific guard from Phase 8
Plan 02 caught zero false positives during the dogfooding sessions, but the user
notes that Korean-only frontmatter values were never exercised at runtime — only
the EN-side ban list. The v1.1 beta program should recruit at least one
Korean-only planner to exercise the KO ban list end-to-end.

### D. Memorable feedback signals carried into Phase 9 closure

Three feedback signals from MEMORY.md drove this phase's planning shape and
should be carried forward into v1.1:

1. `feedback_delegated_mode.md` — pivot to delegated mode on implementation-heavy
   phases (Phase 9 was canonical; the gray-area gauntlet collapsed to a 4-area
   batch table accepted in one round).
2. `feedback_area_level_depth.md` — cap each gray area at 2-4 core decisions and
   defer the rest to Claude's Discretion / executor amendment. Phase 9's 4 areas
   honored this discipline (16 decisions total, not 30+).
3. `feedback_checkpoint_at_phase_boundaries.md` — present a Stop/Continue
   checkpoint after verify=ok on a multi-plan phase. Phase 9 has 6 plans;
   the executor must NOT auto-chain into v1.1 beta planning.
