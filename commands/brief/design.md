---
name: brief:design
description: BRIEF DESIGN phase — single-workstream-per-session orchestration over 9 built-in workstreams (BMC, GTM, FINANCIAL, OPERATIONS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH) plus dynamic addition. Each workstream artifact passes ALIGN → AUDIENCE → COMPLIANCE gates in series. Phase 7 D-05/D-06/D-07/D-08.
argument-hint: "<workstream-name> [args] [--text]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - Task
  - Write
---
<objective>
Run a single workstream end-to-end: parse the workstream slug, validate via workstream-loader,
build business_context, spawn the workstream design Task with its design-prompts.md prompt
template, run sequential 3-gate threading (ALIGN → AUDIENCE → COMPLIANCE) on the produced
artifact with fail-fast on BLOCKING, and present the workstream completion handoff (artifact
path + 3-gate verdict summary + recommended next + AskUserQuestion confirmation). OBJECTIVES.md
insufficiency routes through `/brief-define --amend` directive (D-06 — no return-stack push).
Korean is the default voice when state.brief.region == 'kr'.
</objective>

<execution_context>
@~/.claude/brief/workflows/design.md
@~/.claude/brief/workflows/align-gate.md
@~/.claude/brief/workflows/audience-guard.md
@~/.claude/brief/workflows/compliance.md
</execution_context>

<process>
Execute the design workflow: parse the single positional workstream slug (canonical aliases
BMC/GTM/FIN/OPS/COMP/ROAD/BRAND/RISK/TECH supported); resolve via `brief-tools design
get-workstream --slug <name>`; precheck OBJECTIVES.md sufficiency and route OBJECTIVES gaps
through `/brief-define --amend` (D-06, no return-stack push); build business_context;
spawn ONE workstream design Task (single-workstream-per-session, D-05); thread the produced
artifact through ALIGN → AUDIENCE → COMPLIANCE in series with fail-fast on BLOCKING (D-02);
on completion render 4-element handoff: artifact path + 3-gate verdict summary +
recommended-next (derived at read-time from spec.yaml depends_on) + AskUserQuestion 3-option
(Continue / Stop here / Pick different) per D-08.

See brief/workflows/design.md for the full workflow detail.
</process>
