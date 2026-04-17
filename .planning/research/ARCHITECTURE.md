# Architecture Research

**Domain:** Meta-prompting framework — slash-command + agent + hook ecosystem layered over forked GSD core, for business/strategy planning workflows
**Researched:** 2026-04-17
**Confidence:** HIGH for component boundaries and Claude Code mechanics; HIGH for fork-overlay strategy; MEDIUM for bidirectional state-machine specifics (no exact prior art — synthesised from state-machine + workflow patterns)

---

## Summary

BRIEF is best architected as a **stable inherited core (GSD)** plus a **business-domain overlay layer** that talks to the core only through three fixed seams: **`.planning/` files** (data contract), **slash commands** (entry-point contract), and **agent frontmatter** (delegation contract). Every business-specific concept — phases (DEFINE/DISCOVER/DESIGN/DELIVER), gates (ALIGN/AUDIENCE/COMPLIANCE), the OBJECTIVES.md anchor doc, the bidirectional Phase 1↔2 flow — lives in the overlay. Nothing in the overlay edits files inside `get-shit-done/` (the inherited core). This keeps the upstream merge surface narrow and well-understood.

The overlay maps cleanly onto Anthropic's published agent patterns: each phase command is **orchestrator-workers** (one orchestrator command spawns multiple parallel domain researchers, planners, drafters), and every cross-cutting gate (ALIGN/AUDIENCE/COMPLIANCE) is **evaluator-optimizer** (gate evaluates an artifact, returns pass/findings; orchestrator either ships or loops back into refinement). The "auto-attach" requirement is solved by orchestrator commands that explicitly invoke gate subagents at every milestone — not by hooking the inherited gsd-executor flow. This is critical: it preserves the GSD core's invariants and avoids the "monkey-patch the parent agent" trap.

**Suggested build order:** (1) Foundation — fork hygiene, frontmatter validator, anchor doc, OBJECTIVES.md template, three gate agents in skeleton form; (2) Phase 0 (DEFINE) end-to-end as the canary; (3) one cross-cutting gate (ALIGN) wired in; (4) Phase 1 (DISCOVER) with parallel researchers; (5) Phase 2 (DESIGN) with bidirectional gap-detector + dynamic workstreams; (6) Phase 3 (DELIVER) with audience guard fully enforced. Wave-by-wave, each phase is shippable on its own.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| File-lock STATE.md, atomic commits, runtime detection | Inherited GSD core (`get-shit-done/bin/lib/*.cjs`) | — | Already-stable infra; do not touch |
| Multi-agent orchestration primitive (Task tool, agent registry) | Claude Code platform | Inherited GSD core (configures it) | Platform mechanic; GSD just consumes |
| `.planning/` directory schema (PROJECT, STATE, MILESTONES, phases/) | Inherited GSD core | BRIEF overlay extends with new sub-files | Stable data contract that the overlay reads/writes additional fields into |
| Slash command dispatch | Claude Code platform | BRIEF overlay (`commands/brief/*.md`) | Each `brief-*` command is a thin wrapper that calls `gsd-tools.cjs` for state ops + spawns BRIEF agents |
| Phase orchestration (DEFINE → DISCOVER → DESIGN → DELIVER) | BRIEF overlay (`commands/brief/*-phase.md`) | Inherited core's phase-state machinery | Business-domain phases are an overlay concept; reuse core's phase counter + STATE.md fields |
| OBJECTIVES.md anchor | BRIEF overlay (`agents/brief-define-extractor.md` writes it; every other brief agent reads it) | Inherited core (treats OBJECTIVES.md as just another `.planning/` file) | Domain-specific anchor doc; analogous to PROJECT.md but more focused |
| Cross-cutting gates (ALIGN, AUDIENCE, COMPLIANCE) | BRIEF overlay (subagents invoked by orchestrator commands) | — | Evaluator-optimizer pattern; gates run AFTER worker agents finish, BEFORE orchestrator declares milestone shipped |
| Frontmatter enforcement on artifacts | BRIEF overlay (validator script + audience-guard agent + post-write check) | Inherited core's `frontmatter.cjs` (reused as-is for parsing) | Core already parses frontmatter; overlay adds the schema + enforcement points |
| Bidirectional Phase 1↔2 flow | BRIEF overlay (`commands/brief/design-phase.md` orchestrator + `agents/brief-gap-detector.md` + new STATE.md fields) | Inherited core (extended STATE.md fields; no schema change to existing fields) | New behavior; lives entirely in overlay |
| Dynamic workstream addition (`/brief-add-workstream`) | BRIEF overlay (`commands/brief/add-workstream.md`) | Inherited core's existing `gsd-new-milestone` flow pattern (copied, not hooked) | Pattern is mature in GSD; cleanest reuse is to copy the prompt template + adapt, not invoke gsd-* commands |
| Compliance reference library | BRIEF overlay (`get-shit-done/references/compliance/{korea,global}/*.md`) | Inherited core's `references/` loader | Core's mechanism for loading reference docs is reusable; overlay just adds new docs |

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION LAYER                              │
│  /brief-define   /brief-discover   /brief-design   /brief-deliver            │
│  /brief-add-workstream   /brief-help   /brief-status                         │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      BRIEF OVERLAY (BUSINESS LAYER)                           │
│                                                                                │
│  ┌──────────────────────┐    ┌──────────────────────┐                         │
│  │  PHASE ORCHESTRATORS │    │  CROSS-CUTTING GATES │                         │
│  │  (commands/brief/)   │    │  (agents/brief-*)     │                         │
│  │                      │    │                       │                         │
│  │  define-phase        │───▶│  align-gate           │  evaluator-            │
│  │  discover-phase      │───▶│  audience-guard       │  optimizer             │
│  │  design-phase        │───▶│  compliance-checker   │  loop                  │
│  │  deliver-phase       │───▶│  context-injector     │  (per milestone)       │
│  │  add-workstream      │    │                       │                         │
│  └─────────┬────────────┘    └──────────┬───────────┘                         │
│            │                             │                                     │
│            ▼  spawns                     │ invoked by orchestrator             │
│  ┌──────────────────────────────────────────────────────────┐                 │
│  │              DOMAIN WORKER AGENTS (agents/brief-*)        │                 │
│  │                                                            │                 │
│  │  Phase 0:  intent-extractor, dream-state-mapper           │                 │
│  │  Phase 1:  market-researcher, competitor-researcher,      │                 │
│  │            customer-researcher, regulation-researcher,    │                 │
│  │            tech-researcher, trends-researcher,            │                 │
│  │            cases-researcher, gap-detector                 │                 │
│  │  Phase 2:  bmc-designer, gtm-strategist, financial-modeler│                 │
│  │            ops-designer, compliance-designer, roadmapper  │                 │
│  │  Phase 3:  product-brief-writer, service-policy-writer,   │                 │
│  │            spec-writer, deck-writer, ir-writer, memo-writer│                │
│  └──────────────────────────────────────────────────────────┘                 │
│                                                                                │
│  ┌────────────────────────┐    ┌────────────────────────┐                     │
│  │  FRONTMATTER ENFORCER  │    │  CONTEXT INJECTOR      │                     │
│  │  (post-write check)    │    │  (prompt template)     │                     │
│  │  - schema validator    │    │  - reads OBJECTIVES.md │                     │
│  │  - audience required   │    │  - reads B2B/B2C model │                     │
│  │  - voice required      │    │  - reads region        │                     │
│  └────────────────────────┘    └────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼  reads/writes via gsd-tools.cjs only
┌──────────────────────────────────────────────────────────────────────────────┐
│                  INHERITED GSD CORE (DO NOT MODIFY)                           │
│                                                                                │
│   get-shit-done/bin/gsd-tools.cjs   ◀── stable CLI surface                    │
│   get-shit-done/bin/lib/state.cjs   ◀── STATE.md file lock                    │
│   get-shit-done/bin/lib/frontmatter.cjs  ◀── reused for parsing               │
│   get-shit-done/bin/lib/init.cjs    ◀── workflow context bootstrapper         │
│   hooks/gsd-*  ◀── runtime hooks (some renamed brief-*, none reworked)        │
│   templates/  references/  contexts/  workflows/                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER (.planning/)                              │
│                                                                                │
│  PROJECT.md        ◀── pre-existing GSD anchor (kept for project metadata)    │
│  OBJECTIVES.md     ◀── NEW BRIEF anchor (every brief-* agent reads this)      │
│  STATE.md          ◀── extended with brief-specific fields (additive only)    │
│  MILESTONES.md     ◀── reused as-is                                           │
│  config.json       ◀── extended with `brief: { ... }` namespaced section      │
│  phases/XX-name/   ◀── reused dir structure; new artifact filenames per phase │
│    *-OBJECTIVES.md, *-MARKET.md, *-COMPETITORS.md, ...                        │
│    *-BMC.md, *-GTM.md, *-FINANCIAL.md, ...                                    │
│    *-PRODUCT-BRIEF.md, *-INTERNAL-DECK.md, ...                                │
│    *-ALIGN.md (gate output), *-AUDIENCE.md, *-COMPLIANCE.md                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Phase orchestrator command** (e.g. `commands/brief/discover-phase.md`) | Owns the lifecycle of one phase: bootstraps via `gsd-tools.cjs init`, spawns parallel worker agents, invokes cross-cutting gates, advances STATE.md on success | Markdown command file with `<orchestration>` instructions; calls `Task` tool to spawn subagents; calls `Bash` to run `gsd-tools.cjs` |
| **Domain worker agent** (e.g. `agents/brief-market-researcher.md`) | Executes one specialized research / design / writing job in its own context window. Reads OBJECTIVES.md + injected business-model context. Writes one or more `.planning/phases/XX-*/` artifacts with mandatory frontmatter | Subagent markdown file with `name`, `description`, `tools` frontmatter and `<role>` body |
| **Cross-cutting gate agent** (`brief-align-gate`, `brief-audience-guard`, `brief-compliance-checker`) | Reads a candidate artifact + OBJECTIVES.md + reference library, returns PASS / FAIL+findings as structured output. Never modifies the artifact directly — returns recommendations to the orchestrator | Subagent markdown file with read-only tools (Read, Grep, Glob); writes a `*-ALIGN.md` / `*-AUDIENCE.md` / `*-COMPLIANCE.md` report file the orchestrator surfaces |
| **Context injector agent / template** (`brief-context-injector`) | Composes the standard prompt prefix that every spawned BRIEF subagent receives — pulls business_model, region, audience, OBJECTIVES.md summary into the `<required_reading>` block | Either (a) a tiny subagent the orchestrator calls first, OR (b) a Bash helper in `gsd-tools.cjs brief-context-block` that returns the YAML/markdown block. Recommend (b) for speed and determinism |
| **Frontmatter enforcer** | Validates that every artifact written under `.planning/phases/` has the required frontmatter fields (`audience`, `business_context`, `voice`) before being committed | Two-layer: (1) `gsd-tools.cjs frontmatter-validate <file>` CLI invoked by orchestrators after each artifact write; (2) optional `pre-commit` hook script under `hooks/brief-frontmatter-validate.sh` for belt-and-suspenders |
| **Gap detector agent** (`brief-gap-detector`) | During Phase 2, when a worker agent flags missing research, this agent decides whether the gap requires returning to Phase 1 (and if so, which researcher to re-spawn). Updates STATE.md `phase_return_stack` field | Subagent invoked by `design-phase.md` orchestrator on every Wave end; reads design artifact, OBJECTIVES.md, and Phase 1 outputs; emits structured "RETURN" / "PROCEED" decision |
| **OBJECTIVES.md** | Single source of truth for "what we're trying to do." Written once at end of Phase 0; read by every downstream agent. Updated only via explicit user-confirmed amendments | Markdown file in `.planning/` root with strict frontmatter and stable section anchors so agents can read specific sections |
| **`gsd-tools.cjs` extensions** | NEW commands added: `brief-context-block`, `frontmatter-validate`, `state-push-return`, `state-pop-return`. Existing commands unchanged | New command handlers added to `commands.cjs` dispatch table; new `lib/brief-*.cjs` files for any logic. NEVER edit `lib/state.cjs`, `lib/frontmatter.cjs`, or `lib/init.cjs` — only extend |

---

## Recommended Project Structure

```
GSD-for-Business/                 # repo root (the fork)
├── get-shit-done/                # INHERITED CORE — minimize edits here
│   ├── bin/
│   │   ├── gsd-tools.cjs         # entry point; do not rewrite
│   │   └── lib/
│   │       ├── state.cjs         # do not edit
│   │       ├── frontmatter.cjs   # do not edit (reuse via require)
│   │       ├── init.cjs          # do not edit
│   │       ├── commands.cjs      # APPEND brief-* dispatch entries only
│   │       └── brief/            # NEW — overlay-owned helpers
│   │           ├── context-block.cjs    # builds the required_reading prefix
│   │           ├── frontmatter-rules.cjs # BRIEF-specific schema
│   │           ├── return-stack.cjs      # bidirectional flow state ops
│   │           └── gap-queue.cjs         # gap-detector queue ops
│   ├── templates/
│   │   ├── (existing GSD templates — do not edit)
│   │   └── brief/                # NEW — overlay-owned templates
│   │       ├── OBJECTIVES.md
│   │       ├── BMC.md
│   │       ├── GTM.md
│   │       ├── FINANCIAL.md
│   │       ├── PRODUCT-BRIEF.md
│   │       ├── INTERNAL-DECK.md
│   │       ├── INVESTOR-IR.md
│   │       └── ALIGN.md
│   ├── references/
│   │   ├── (existing GSD references — do not edit)
│   │   └── brief/                # NEW — overlay-owned references
│   │       ├── compliance/
│   │       │   ├── korea/        # ISMS-P, PIPA, e-금융업, mydata, 의료기기법
│   │       │   └── global/       # GDPR, CCPA, SOC2, HIPAA, PCI-DSS
│   │       ├── frameworks/       # BMC, JTBD, Porter's Five Forces ...
│   │       └── voice-guides/     # tone-of-voice templates per audience
│   ├── workflows/                # rename gsd-* → brief-* one-shot at fork start
│   └── contexts/                 # rename gsd-* → brief-* one-shot at fork start
│
├── agents/                       # OVERLAY — all agents prefixed brief-*
│   ├── brief-intent-extractor.md          # Phase 0
│   ├── brief-dream-state-mapper.md        # Phase 0
│   ├── brief-market-researcher.md         # Phase 1
│   ├── brief-competitor-researcher.md     # Phase 1
│   ├── brief-customer-researcher.md       # Phase 1
│   ├── brief-regulation-researcher.md     # Phase 1
│   ├── brief-tech-researcher.md           # Phase 1
│   ├── brief-trends-researcher.md         # Phase 1
│   ├── brief-cases-researcher.md          # Phase 1
│   ├── brief-gap-detector.md              # Phase 1↔2 bridge
│   ├── brief-bmc-designer.md              # Phase 2
│   ├── brief-gtm-strategist.md            # Phase 2
│   ├── brief-financial-modeler.md         # Phase 2
│   ├── brief-ops-designer.md              # Phase 2
│   ├── brief-compliance-designer.md       # Phase 2 (formal milestone)
│   ├── brief-roadmapper.md                # Phase 2
│   ├── brief-product-brief-writer.md      # Phase 3 — Type A
│   ├── brief-service-policy-writer.md     # Phase 3 — Type A
│   ├── brief-spec-writer.md               # Phase 3 — Type A
│   ├── brief-feature-mapper.md            # Phase 3 — Type A
│   ├── brief-deck-writer.md               # Phase 3 — Type B
│   ├── brief-investor-ir-writer.md        # Phase 3 — Type B
│   ├── brief-exec-summary-writer.md       # Phase 3 — Type B
│   ├── brief-decision-memo-writer.md      # Phase 3 — Type B
│   ├── brief-align-gate.md                # cross-cutting evaluator
│   ├── brief-audience-guard.md            # cross-cutting evaluator
│   └── brief-compliance-checker.md        # cross-cutting evaluator
│
├── commands/
│   ├── brief/                    # NEW — overlay slash commands
│   │   ├── define-phase.md       # /brief-define
│   │   ├── discover-phase.md     # /brief-discover
│   │   ├── design-phase.md       # /brief-design
│   │   ├── deliver-phase.md      # /brief-deliver
│   │   ├── add-workstream.md     # /brief-add-workstream
│   │   ├── status.md             # /brief-status (wraps gsd-tools status)
│   │   └── help.md               # /brief-help
│   └── (no `gsd/` directory after rename — hard fork)
│
├── hooks/                        # rename gsd-* → brief-* one-shot at fork start
│   ├── brief-workflow-guard.js
│   ├── brief-validate-commit.sh
│   ├── brief-frontmatter-validate.sh   # NEW — validates required frontmatter pre-commit
│   ├── brief-prompt-guard.js
│   ├── brief-read-guard.js
│   └── ... (other inherited hooks renamed)
│
├── bin/install.js                # rename gsd-* → brief-* throughout; package becomes brief-cc
│
├── .planning/                    # dogfooding workspace for BRIEF itself
│   ├── PROJECT.md                # already exists
│   ├── OBJECTIVES.md             # to be created in Phase 0 of this dogfooding
│   ├── STATE.md                  # extended fields documented in BRIEF schema
│   ├── config.json               # contains a "brief": { ... } section
│   ├── research/                 # current location (this file lives here)
│   └── phases/XX-name/           # phase-by-phase artifacts as BRIEF builds itself
│
└── tests/                        # node:test, c8 — same as GSD
    └── brief/                    # new tests for overlay logic
```

### Structure Rationale

- **`get-shit-done/bin/lib/brief/` subfolder** — Every new piece of overlay logic lives in a clearly-namespaced subfolder. When upstream GSD ships a new version of `state.cjs`, the merge conflict is bounded to the dispatch-table append in `commands.cjs`. No surprise edits scattered through inherited files.

- **`agents/brief-*` flat naming** — Claude Code's subagent loader scans `.claude/agents/` and `~/.claude/agents/` flat. Prefixing every BRIEF agent with `brief-` is the only reliable way to namespace within Claude Code's flat agent registry.

- **`commands/brief/` subdirectory** — Claude Code allows nested directories under `commands/`, and the subdirectory becomes part of the slash command path. So `commands/brief/define-phase.md` becomes `/brief:define-phase`. Keeps the overlay's slash-command surface visually distinct.

- **`templates/brief/` and `references/brief/` subfolders** — Same logic: keeps overlay artifacts unambiguously separable from inherited ones, so a future upstream merge doesn't try to reconcile them.

- **`hooks/brief-*` flat naming** — `settings.json` references hooks by exact filename. Renaming once at fork time and writing all new hooks with the `brief-` prefix gives a clean global namespace.

- **`.planning/OBJECTIVES.md` at the same level as PROJECT.md** — OBJECTIVES.md is a peer to PROJECT.md, not a child. PROJECT.md describes "what is this project"; OBJECTIVES.md describes "what is THIS PLANNING CYCLE trying to do." The distinction matters for v2/v3 future cycles where PROJECT.md persists but OBJECTIVES.md is re-derived.

- **`config.json` namespaced under `"brief":`** — The inherited core reads top-level `config.json` keys it knows about. Putting all overlay config under `config.brief.*` (e.g., `config.brief.region`, `config.brief.business_model`, `config.brief.compliance_packs`) means upstream config schema changes never collide.

---

## Architectural Patterns

### Pattern 1: Orchestrator-Workers (every phase command)

**What:** Each `/brief-*-phase` command is an orchestrator that decomposes the phase into N parallel worker subagents, waits for them to finish, then runs evaluator gates against the combined output.

**When to use:** Every phase. This is the dominant pattern. Anthropic explicitly recommends orchestrator-workers when subtasks aren't pre-determined and a central LLM should plan the decomposition based on input. [VERIFIED via Anthropic Building Effective Agents]

**Trade-offs:**
- ✅ Each worker has its own context window — domain research doesn't pollute the orchestrator's context
- ✅ Workers are independently testable
- ✅ Maps cleanly to existing GSD `gsd-executor` / `gsd-planner` invocation pattern
- ❌ Orchestrator must explicitly handle worker failure / partial completion (workers can't communicate with each other)
- ❌ Subagents cannot themselves spawn subagents in Claude Code (one-level deep) — design accordingly [VERIFIED via Claude Code subagents docs]

**Example skeleton (`commands/brief/discover-phase.md`):**
```markdown
1. Bootstrap: run `node get-shit-done/bin/gsd-tools.cjs init phase-op discover`
2. Read OBJECTIVES.md to identify which research domains apply
3. Spawn in parallel using Task tool:
   - brief-market-researcher
   - brief-competitor-researcher
   - brief-customer-researcher
   - brief-regulation-researcher  (only if region requires it)
   - brief-tech-researcher
   - brief-trends-researcher
   - brief-cases-researcher
4. Wait for all to complete; collect their `.planning/phases/01-discover/*-RESEARCH.md` outputs
5. Invoke brief-align-gate with all artifacts → if FAIL, loop back to specific researcher
6. Invoke brief-audience-guard on every artifact → block phase advance if any fail
7. Run `node ... gsd-tools.cjs phase advance` only after all gates PASS
```

### Pattern 2: Evaluator-Optimizer (every cross-cutting gate)

**What:** A worker generates a candidate artifact; an evaluator subagent reads it + reference docs + OBJECTIVES.md and emits PASS / FAIL+findings; the orchestrator either ships or sends findings back to the worker for refinement.

**When to use:** ALIGN gate (every milestone), AUDIENCE guard (every Type B artifact), COMPLIANCE checker (every artifact that touches data flow / customer interaction). Anthropic recommends evaluator-optimizer when "clear evaluation criteria exist" — which is precisely the BRIEF gate situation: OBJECTIVES.md and the compliance reference library ARE the evaluation criteria. [VERIFIED via Anthropic Building Effective Agents]

**Trade-offs:**
- ✅ Cleanly separates "produce" from "judge" — the evaluator is read-only and cannot accidentally modify the artifact
- ✅ Evaluator output is structured and human-reviewable (the PROJECT.md spec calls this out as a requirement)
- ✅ Looping is bounded: orchestrator decides max retries (e.g., 2) before escalating to user
- ❌ Each loop costs a full subagent round-trip — keep evaluators focused
- ❌ Cannot "auto-attach" via Claude Code hooks (PostSubagentStop fires after subagent ends but cannot inject another subagent into the orchestrator's flow). Auto-attachment must be implemented in the orchestrator command itself.

**Example skeleton (gate invocation in `design-phase.md`):**
```markdown
After every Wave 2 worker completes:
1. List newly-written artifacts: `find .planning/phases/02-design -name '*.md' -newer ...`
2. For each artifact:
   a. Spawn brief-align-gate with artifact_path + OBJECTIVES.md
   b. Read its emitted ALIGN.md report
   c. If FAIL: re-prompt the original worker with findings, increment retry counter
   d. If PASS: continue
3. If any artifact has retried > 2: STOP, write ESCALATION.md, ask user
```

### Pattern 3: Anchor Document + Context Injection

**What:** OBJECTIVES.md is loaded by every BRIEF subagent via a standard `<required_reading>` block. The block is constructed by a single helper (`gsd-tools.cjs brief-context-block`) so every agent receives identical context.

**When to use:** Every BRIEF subagent prompt. This is the same pattern GSD already uses with PROJECT.md (its existing init.cjs injects PROJECT.md context into agent prompts) — BRIEF just adds OBJECTIVES.md as a second anchor. [VERIFIED via reading `bin/lib/init.cjs`]

**Trade-offs:**
- ✅ Single point of context injection means changing the standard prefix is a one-line change
- ✅ Helper is deterministic — same input always produces same prefix; easy to test
- ✅ Reuses existing GSD machinery (init.cjs already builds context blocks)
- ❌ OBJECTIVES.md must stay readable in full by every agent (token budget). For very long objectives, the helper extracts only the "summary" section.

**Example helper output:**
```yaml
# brief-context-block
required_reading:
  - .planning/OBJECTIVES.md  # full file, ≤ 8KB enforced
  - .planning/PROJECT.md     # for project metadata
business_context:
  business_model: B2B-SaaS    # from config.brief.business_model
  region: KR                  # from config.brief.region
  compliance_packs: [ISMS-P, PIPA, GDPR]
  audience_default: internal
```

### Pattern 4: Cross-Cutting Gate Auto-Attach via Orchestrator (NOT Hooks)

**What:** Cross-cutting gates (ALIGN/AUDIENCE/COMPLIANCE) "auto-attach" by being explicit, mandatory steps inside every phase orchestrator command. No PostToolUse / PostSubagentStop hook is used.

**When to use:** Always. This is the architectural choice that preserves GSD core integrity.

**Why not hooks?** Claude Code hooks fire on tool-level events (Write/Edit/Bash) or subagent-level events (SubagentStop). They CAN return additionalContext or block actions, but they CANNOT spawn another subagent and feed its output back into the parent flow [VERIFIED via Claude Code hooks documentation]. The cleanest way to enforce "every milestone runs the gate" is to make the orchestrator command itself responsible for invoking the gate — making the contract visible in the command markdown rather than hidden in a hook script.

**Trade-offs:**
- ✅ Gate invocation is visible in the orchestrator command file — readable, debuggable, testable
- ✅ Zero changes to inherited GSD core; no hook scripts modified
- ✅ Easy to add new gates: edit one command file, no hook surgery
- ✅ Belt-and-suspenders: the optional `hooks/brief-frontmatter-validate.sh` pre-commit hook still catches anything that bypassed the orchestrator (e.g., user manually edited a file)
- ❌ If a user writes their own ad-hoc command that skips the gate, the gate doesn't run. This is acceptable: the framework's enforcement boundary is the official commands; custom commands are user-owned territory.

**Example: how `design-phase.md` auto-attaches all three gates:**
```markdown
## Wave 2: BMC + GTM + Financial design (parallel)

After all three workers finish, BEFORE marking Wave 2 complete:

1. brief-align-gate    on each of: BMC.md, GTM.md, FINANCIAL.md
2. brief-audience-guard on each artifact (all three are internal voice → check)
3. brief-compliance-checker on FINANCIAL.md (touches PII handling)

If any gate FAILs, refer to "Gate Failure Handling" section below before proceeding.
```

### Pattern 5: Bidirectional Phase 1 ↔ Phase 2 via Return Stack

**What:** STATE.md gains two new fields, `phase_return_stack` and `gap_queue`. When `brief-gap-detector` (invoked by `design-phase.md`) finds a research gap, it pushes a return-frame onto the stack and pauses Phase 2. The orchestrator notices, switches to Phase 1, runs the requested researcher, then pops the stack and resumes Phase 2 from the saved point.

**When to use:** Inside `design-phase.md` only. Other phases do not have bidirectional behavior.

**Trade-offs:**
- ✅ Stack model handles arbitrary depth (gap during Phase 1 re-entry → push another frame)
- ✅ STATE.md remains the single source of truth — no separate state file
- ✅ User-visible: `/brief-status` can list pending gaps, user can approve/reject before re-entry
- ❌ Adds complexity to STATE.md schema. Mitigation: namespace as `state.brief.return_stack` so inherited GSD code never sees it
- ❌ Risk of infinite loops if gap-detector keeps finding new gaps. Mitigation: max stack depth = 3 with explicit user escalation on overflow

**STATE.md schema extension:**
```yaml
# Existing GSD fields preserved exactly as-is
phase: 2
plan: 1
status: in_progress

# NEW BRIEF fields (additive, namespaced)
brief:
  current_phase_id: 02-design
  return_stack:                     # LIFO stack of paused phase frames
    - paused_phase: 02-design
      paused_at_wave: 2
      paused_at_artifact: BMC.md
      reason_to_return: "Customer segment data for SMBs missing"
      requested_researcher: brief-customer-researcher
      requested_focus: "SMBs in Korea fintech, 10-50 employees"
      pushed_at: 2026-04-17T10:32:00Z
  gap_queue: []                     # detected-but-not-yet-acted-on gaps
```

**State machine for Design → Discover → Design:**
```
[Design wave running]
        │
        │ gap detected
        ▼
[brief-gap-detector emits RETURN]
        │
        ├─► push frame onto return_stack
        ├─► state.brief.current_phase_id := 01-discover
        ├─► state.brief.discover_focus := requested_focus
        ▼
[design-phase.md sees state, exits cleanly with "RETURNED-TO-PHASE-1" message]
        │
        │ user runs /brief-discover (or orchestrator auto-resumes if config allows)
        ▼
[discover-phase.md sees return_stack non-empty]
        │
        ├─► spawn ONLY the requested researcher (not full Phase 1)
        ├─► wait for completion + gates pass
        ▼
[discover-phase.md pops top of return_stack]
        │
        ├─► state.brief.current_phase_id := frame.paused_phase
        ▼
[user runs /brief-design (or auto-resume), sees current_phase_id back at 02-design]
        │
        ▼
[design-phase.md resumes from frame.paused_at_wave + frame.paused_at_artifact]
```

This is a textbook **state-machine workflow** with a return-stack — well-established pattern in finite-state-machine literature [CITED: Symfony Workflow + State Machines docs] applied here to AI agent orchestration.

### Pattern 6: Frontmatter Enforcement — Two-Layer Validator

**What:** Required frontmatter (`audience`, `business_context`, `voice`, `confidentiality`) is enforced in two places: (1) the orchestrator command runs `gsd-tools.cjs frontmatter-validate <file>` immediately after a worker writes an artifact; (2) an optional pre-commit hook (`hooks/brief-frontmatter-validate.sh`) catches anything that slipped through (e.g., user-edited files, agent that bypassed orchestrator).

**When to use:** Every artifact under `.planning/phases/`.

**Trade-offs:**
- ✅ Two layers means a bug in one is caught by the other
- ✅ Reuses inherited `frontmatter.cjs` parsing — no new YAML parser needed
- ✅ Schema is centralized in `lib/brief/frontmatter-rules.cjs` — one file to maintain
- ✅ Schema-driven validation tooling well-established (remark-lint, AJV, check-yamlschema) [CITED: remark-lint-frontmatter-schema, ajv]
- ❌ Two layers means a schema change requires updating both. Mitigation: the orchestrator-side check imports the schema from the same file the pre-commit hook uses.

**Required frontmatter schema (initial cut):**
```yaml
---
audience: internal | board | investor | customer | regulator | partner
business_context: B2B | B2C | B2B2C | mixed
voice: analytical | aspirational | conservative | technical | executive
confidentiality: public | internal | restricted | confidential
phase: 0 | 1 | 2 | 3
artifact_type: research | design | policy | communication
created_by: brief-<agent-name>
created_at: ISO-8601
---
```

### Pattern 7: Dynamic Workstream Addition — Pattern Copy, Not Hook

**What:** `/brief-add-workstream` copies the prompt template + flow pattern from the inherited `gsd-new-milestone` workflow but executes its own version under `commands/brief/add-workstream.md`. It does NOT call into the inherited new-milestone command.

**When to use:** When the user mid-DESIGN realizes a workstream was missed (e.g., "we forgot about certifications").

**Trade-offs:**
- ✅ Decouples BRIEF's add-workstream behavior from any future GSD changes to new-milestone
- ✅ User experience is identical to the GSD pattern they already know
- ❌ Some prompt-template duplication. Acceptable cost for decoupling.

---

## Data Flow

### End-to-End Flow: idea → final artifact

```
[user idea]
    │
    │ /brief-define
    ▼
[define-phase.md orchestrator]
    │
    ├─► spawn brief-intent-extractor       ────► emits .planning/phases/00-define/INTENT.md
    ├─► spawn brief-dream-state-mapper     ────► emits .planning/phases/00-define/DREAM-STATE.md
    │   (parallel)
    │
    │ both finished
    ▼
[orchestrator synthesizes OBJECTIVES.md from intent + dream state]
    │
    ├─► invoke brief-align-gate            ────► emits ALIGN-00.md (sanity-check for Phase 0)
    │
    │ PASS
    ▼
[gsd-tools.cjs phase advance to 01-discover]
    │
    │ /brief-discover
    ▼
[discover-phase.md orchestrator]
    │
    ├─► reads OBJECTIVES.md to decide which researchers apply
    ├─► spawn 6-8 researchers in parallel  ────► each emits *-RESEARCH.md with frontmatter
    │
    │ all finished
    ▼
[for each artifact: brief-frontmatter-validator → brief-align-gate → brief-audience-guard]
    │
    │ all PASS
    ▼
[gsd-tools.cjs phase advance to 02-design]
    │
    │ /brief-design
    ▼
[design-phase.md orchestrator]
    │
    │ Wave 1: spawn brief-bmc-designer + brief-gtm-strategist (parallel)
    ▼
[BMC.md + GTM.md emitted; gates run]
    │
    │ assume PASS for now
    ▼
[Wave 2: spawn brief-financial-modeler + brief-ops-designer (parallel)]
    │
    ▼
[brief-gap-detector inspects all Wave 2 outputs]
    │
    ├─► IF gap found:
    │       ├─► push frame onto state.brief.return_stack
    │       ├─► exit with "RETURNED-TO-DISCOVER" message
    │       │
    │       ▼
    │   [user runs /brief-discover]
    │       ├─► sees return_stack, runs ONLY requested researcher
    │       ├─► gates pass, pops stack
    │       │
    │       ▼
    │   [user runs /brief-design — resumes from saved Wave 2 state]
    │
    │ no more gaps
    ▼
[Wave 3: brief-compliance-designer + brief-roadmapper]
    │
    │ all gates pass
    ▼
[gsd-tools.cjs phase advance to 03-deliver]
    │
    │ /brief-deliver
    ▼
[deliver-phase.md orchestrator]
    │
    │ Type A wave: product-brief-writer, service-policy-writer, spec-writer, feature-mapper
    │ Type B wave: deck-writer, ir-writer, exec-summary-writer, decision-memo-writer
    │
    │ AUDIENCE guard runs on every Type B artifact (mandatory, blocking)
    │ COMPLIANCE checker runs on every Type A artifact
    │
    ▼
[final artifacts in .planning/phases/03-deliver/, ready for handoff to PRD/GSD]
```

### State Management

```
[STATE.md] ◄────reads/writes via gsd-tools.cjs (file-locked)──── [orchestrator commands]
    ▲                                                                    │
    │                                                                    │
    │ extends with state.brief.* fields (additive, namespaced)           │
    │                                                                    │
    │  ┌─ phase: 2                          ◄── inherited GSD field      │
    │  ├─ plan: 1                           ◄── inherited GSD field      │
    │  ├─ status: in_progress               ◄── inherited GSD field      │
    │  └─ brief:                            ◄── BRIEF namespace          │
    │       ├─ current_phase_id             (semantic phase name)        │
    │       ├─ return_stack                 (bidirectional flow LIFO)    │
    │       ├─ gap_queue                    (pending detected gaps)      │
    │       ├─ active_workstreams           (e.g., dynamically added)    │
    │       └─ last_gate_results            (PASS/FAIL per gate per file)│
    │                                                                    │
    └────────────────────────── read by ─────────────────────────────────┘
                            (every spawned subagent gets a snapshot
                             via the brief-context-block helper)
```

### Key Data Flows

1. **OBJECTIVES.md → every spawned subagent:** Built once in Phase 0, then loaded into every subagent's `<required_reading>` block via `brief-context-block` helper. Never modified except by explicit user-confirmed amendment command.

2. **Worker → artifact → frontmatter-validator → gate → STATE.md:** Each worker writes an artifact, the orchestrator immediately validates frontmatter, then invokes the relevant gate. The gate emits a `*-ALIGN.md` / `*-AUDIENCE.md` / `*-COMPLIANCE.md` report, the orchestrator reads it, and updates `state.brief.last_gate_results`.

3. **Phase 1 ↔ Phase 2 return stack:** When `brief-gap-detector` emits RETURN, the orchestrator pushes a frame onto `state.brief.return_stack` and exits. The next phase command sees the stack and resumes correctly. Stack depth ≤ 3 enforced.

4. **Compliance reference library → compliance-checker:** The checker's prompt loads ONLY the compliance packs declared in `config.brief.compliance_packs` (e.g., `[ISMS-P, PIPA, GDPR]`). Adding new pack = drop a markdown file into `references/brief/compliance/{region}/`.

5. **Workstream dynamic add:** `/brief-add-workstream` writes a new entry to `state.brief.active_workstreams` and creates `.planning/phases/02-design/{slug}/` with templated artifact stubs. Subsequent `/brief-design` runs see the new workstream and spawn the appropriate designer for it.

---

## Suggested Build Order

The phasing below is the suggested implementation order for BRIEF itself. Each foundation phase produces a shippable surface — even partial BRIEF should be testable via dogfooding.

### Foundation (P0) — must come first
1. **Fork hygiene.** Create `backup/original-gsd` branch. Confirm `get-shit-done/` will not be edited.
2. **Hard rename `gsd-*` → `brief-*`** across `agents/`, `commands/`, `hooks/`, `bin/install.js`, package.json. One-shot, no aliases. Run full test suite post-rename to confirm GSD core still functions.
3. **Add `lib/brief/` directory** with stub helpers: `context-block.cjs`, `frontmatter-rules.cjs`, `return-stack.cjs`, `gap-queue.cjs`. Wire them into `commands.cjs` dispatch.
4. **Create `templates/brief/`** with OBJECTIVES.md template (highest priority; it anchors everything).
5. **Define frontmatter schema** in `lib/brief/frontmatter-rules.cjs`.
6. **Skeleton three gate agents** (`brief-align-gate`, `brief-audience-guard`, `brief-compliance-checker`) with their evaluator behavior but minimal evaluation logic — return PASS for everything initially.
7. **Skeleton `brief-context-injector`** as a Bash helper rather than an agent (faster).

### Phase 0 (DEFINE) end-to-end (canary)
1. Build `agents/brief-intent-extractor.md` and `agents/brief-dream-state-mapper.md`.
2. Build `commands/brief/define-phase.md` orchestrator.
3. Wire ALIGN gate (skeleton from foundation step 6) — make it actually compare candidate OBJECTIVES.md against Phase 0 inputs.
4. Run end-to-end against a real fuzzy idea (dogfood). Iterate.

### Cross-cutting ALIGN gate (proper implementation)
1. Implement real ALIGN logic in `brief-align-gate.md`: read OBJECTIVES.md, read candidate artifact, score alignment on 4-5 axes, emit findings.
2. Add ALIGN gate calls to Phase 0 orchestrator's milestone boundaries.
3. Test gate failure → loop-back behavior.

### Phase 1 (DISCOVER) with parallel researchers
1. Build all 7 researcher agents (or start with 3-4 most critical).
2. Build `commands/brief/discover-phase.md` orchestrator with parallel spawn.
3. Wire AUDIENCE guard for the first time (research artifacts default to `audience: internal`).

### Phase 1 ↔ Phase 2 bidirectional foundation
1. Implement `state.brief.return_stack` operations in `lib/brief/return-stack.cjs`.
2. Build `agents/brief-gap-detector.md`.
3. Update `discover-phase.md` to handle "resume from return frame" mode.

### Phase 2 (DESIGN) workstreams + bidirectional flow
1. Build core 4 designer agents: BMC, GTM, Financial, Ops.
2. Build `commands/brief/design-phase.md` with Wave 1/2/3 structure.
3. Wire gap-detector at every wave end → bidirectional flow comes online.
4. Build `agents/brief-compliance-designer.md` (the formal compliance milestone).
5. Build `agents/brief-roadmapper.md`.
6. Wire COMPLIANCE checker (proper implementation) for the first time.

### Dynamic workstream addition
1. Build `commands/brief/add-workstream.md` (copy from `gsd-new-milestone` pattern).
2. Update STATE.md schema for `state.brief.active_workstreams`.
3. Update `design-phase.md` orchestrator to enumerate active workstreams.

### Phase 3 (DELIVER) with full audience enforcement
1. Build Type A writers (4 agents).
2. Build Type B writers (4 agents).
3. AUDIENCE guard becomes truly blocking (not just advisory) — confidentiality leakage prevents commit.
4. Final integration test: full DEFINE → DISCOVER → DESIGN → DELIVER cycle.

### Hardening
1. Pre-commit hook `hooks/brief-frontmatter-validate.sh` (belt-and-suspenders).
2. `commands/brief/status.md` and `commands/brief/help.md`.
3. Korea-pack compliance references fully populated (ISMS-P, PIPA, e-금융업, mydata, 의료기기법).
4. Global-pack compliance references (GDPR, CCPA, SOC 2, HIPAA, PCI-DSS).
5. Voice guides per audience.

---

## Anti-Patterns

### Anti-Pattern 1: Modifying inherited GSD core files

**What people do:** Edit `get-shit-done/bin/lib/state.cjs` to add `brief.*` field handling directly.

**Why it's wrong:** Every upstream GSD merge becomes a manual-conflict festival. The inherited core is a moving target; the overlay must be additive only.

**Do this instead:** Add a new file `get-shit-done/bin/lib/brief/return-stack.cjs` that operates on STATE.md through the public `state.cjs` API (or via direct read/write inside the namespaced `state.brief.*` subtree). Wire it into the dispatch table in `commands.cjs` with a single appended line.

### Anti-Pattern 2: Using PostToolUse / SubagentStop hooks to enforce gates

**What people do:** Try to make ALIGN/AUDIENCE/COMPLIANCE auto-attach by writing a SubagentStop hook that fires after every brief-* worker.

**Why it's wrong:** Hooks can return additionalContext or block actions, but they cannot spawn another subagent and feed its output back into the parent flow. You'd end up with hidden, undebuggable gate invocations that can't trigger the loop-back behavior the gate is supposed to provide. [VERIFIED via Claude Code hooks docs]

**Do this instead:** Make gate invocation an explicit, mandatory step in every orchestrator command file. Visible. Testable. Loop-able.

### Anti-Pattern 3: One mega "brief-do-everything" agent

**What people do:** Build a single brief-orchestrator agent that handles all phases in one giant prompt.

**Why it's wrong:** Loses all benefits of separate context windows; loses parallelism; loses the ability to test each phase independently; matches none of Anthropic's recommended patterns. [VERIFIED via Anthropic Building Effective Agents — orchestrator-workers explicitly recommends decomposition]

**Do this instead:** One orchestrator command per phase, multiple specialist agents per orchestrator.

### Anti-Pattern 4: OBJECTIVES.md gets mutated mid-cycle by agents

**What people do:** A worker discovers something and "updates" OBJECTIVES.md silently to reflect new understanding.

**Why it's wrong:** OBJECTIVES.md is the alignment baseline. If the baseline shifts, the ALIGN gate becomes meaningless. (Imagine measuring drift while moving the ruler.)

**Do this instead:** OBJECTIVES.md is write-once-by-Phase-0, read-only-everywhere-else. Amendments require an explicit `/brief-amend-objectives` command (deferred to v1.1) with user confirmation.

### Anti-Pattern 5: Frontmatter validated only at write time, not at commit time

**What people do:** Trust the orchestrator's post-write frontmatter check.

**Why it's wrong:** A user editing a file by hand, or an off-pattern agent that bypassed the orchestrator, will produce invalid artifacts that pass into git history.

**Do this instead:** Two-layer enforcement (orchestrator-side + pre-commit hook). The pre-commit hook is opt-in via `config.json` to keep the framework non-intrusive for users who don't want it.

### Anti-Pattern 6: B2B/B2C context inferred per-agent instead of injected

**What people do:** Each agent prompt asks Claude "is this B2B or B2C?" inline.

**Why it's wrong:** Inconsistency across agents — one might infer B2B, another B2C, another mixed. Same advice means radically different things in each case.

**Do this instead:** `config.brief.business_model` is set once at project init; the `brief-context-block` helper injects it into every agent prompt as authoritative input. Agents read, don't infer.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Context7 MCP | `mcp__context7__*` tools (or `npx ctx7` Bash fallback) — already wired in inherited GSD agents | Reuse the existing pattern unchanged; document in agent template |
| Brave Search / Exa / Firecrawl (optional) | `gsd-tools.cjs init` reports availability; agents check and use | Already supported in GSD researcher agents; reuse for brief-* researchers |
| Web search (built-in WebSearch tool) | Default fallback for all researchers | Always available |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Inherited GSD core ↔ BRIEF overlay | One-way: overlay calls `gsd-tools.cjs` CLI; never the reverse | Strict — keeps merge surface minimal |
| Orchestrator command ↔ worker subagent | Task tool spawn with prompt + structured return | Standard Claude Code pattern |
| Orchestrator command ↔ gate subagent | Same Task tool spawn, but read-only tools allowed; structured PASS/FAIL return | Evaluator-optimizer |
| Worker subagent ↔ artifact files | Worker writes; orchestrator reads to validate | Workers do not read other workers' outputs (use orchestrator as broker) |
| BRIEF agents ↔ STATE.md | Always via `gsd-tools.cjs state-*` commands (file-lock honored) | Never raw fs.writeFile against STATE.md |
| BRIEF agents ↔ OBJECTIVES.md | Read-only by all agents except `brief-intent-extractor` (write-once) | Enforced by convention + tooling check |
| `config.brief.*` ↔ inherited config | Namespaced under `brief:` key; inherited core ignores unknown top-level keys (verified: `loadConfig` in core.cjs returns the full object) | Safe additive extension |

---

## Scaling Considerations

(Different "scale" axis than typical SaaS — this is a CLI framework, so scale is "number of agents", "number of compliance packs", "user concurrency on a project".)

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single user, ≤ 30 agents, ≤ 5 phases | Current architecture is fine. Sequential agent spawn for any phase that doesn't benefit from parallelism. |
| Single user, 30-60 agents, dynamic workstreams | Keep current architecture. Wave-based parallel spawn already handles this. Add agent-discovery caching if `gsd-tools.cjs` startup becomes slow. |
| Team usage (multi-user on same `.planning/`) | The inherited STATE.md file lock already handles this. No overlay change needed. Document the lock semantics in user docs. |
| Compliance pack proliferation (≥ 20 packs) | Move from "load all enabled packs into checker prompt" to "checker dynamically requests pack content via Read tool based on artifact type". Token-budget driven. |

### Scaling Priorities

1. **First bottleneck: agent prompt context size.** As OBJECTIVES.md and references grow, every spawned agent loads more. Mitigation: section-extraction in `brief-context-block` (load only relevant sections).
2. **Second bottleneck: gate retry loops.** A poorly-tuned gate that frequently FAILs causes retry storms. Mitigation: hard cap (default 2 retries, then escalation), measurable via STATE.md `last_gate_results`.

---

## Sources

### Primary (HIGH confidence)
- **Anthropic — Building Effective Agents** — https://www.anthropic.com/research/building-effective-agents — orchestrator-workers and evaluator-optimizer pattern definitions, when-to-use guidance.
- **Claude Code — Custom subagents docs** — https://code.claude.com/docs/en/sub-agents — subagent location (`.claude/agents/`), description-driven delegation, one-level-deep nesting limit, frontmatter format.
- **Claude Code — Hooks docs** — https://code.claude.com/docs/en/hooks-guide — hook event types (PreToolUse, PostToolUse, SubagentStop), capabilities (additionalContext, permissionDecision), bypass-mode-immune `deny`, INABILITY to spawn subagents from hooks.
- **Claude Code — Skills docs** — https://code.claude.com/docs/en/skills — SKILL.md frontmatter schema (name ≤ 64 chars, description ≤ 1024 chars), skills vs commands distinction.
- **Inspected source files** — `/Users/agent/GSD-for-Business/get-shit-done/bin/lib/state.cjs`, `frontmatter.cjs`, `init.cjs`; `/Users/agent/GSD-for-Business/agents/gsd-executor.md`, `gsd-verifier.md`, `gsd-planner.md`; `/Users/agent/GSD-for-Business/hooks/gsd-workflow-guard.js`, `gsd-validate-commit.sh`; `/Users/agent/GSD-for-Business/bin/install.js` — confirms exact GSD core boundaries and hook installation pattern.

### Secondary (MEDIUM confidence — verified against multiple sources)
- **Superpowers GitHub repo** — https://github.com/obra/superpowers — skills/commands/agents three-folder pattern; "skills trigger automatically" model.
- **gstack** — https://github.com/garrytan/gstack — role-based governance pattern (referenced for context, not depended on).
- **Skill-stack comparison post** — https://dev.to/imaginex/a-claude-code-skills-stack-how-to-combine-superpowers-gstack-and-gsd-without-the-chaos-44b3 — independent confirmation of GSD/Superpowers/gstack division of concerns.
- **Anthropic agent SDK — Hooks** — https://platform.claude.com/docs/en/agent-sdk/hooks — hook control surface details.
- **Symfony — Workflows and State Machines** — https://symfony.com/doc/current/workflow/workflow-and-state-machine.html — state machine / workflow vocabulary used for the bidirectional return-stack pattern.
- **remark-lint-frontmatter-schema** — https://github.com/JulianCataldo/remark-lint-frontmatter-schema — JSON-Schema validation of YAML frontmatter; the prior art for the two-layer frontmatter validator.
- **check-jsonschema (pre-commit)** — https://check-jsonschema.readthedocs.io/en/latest/precommit_usage.html — pre-commit hook pattern for schema validation.

### Tertiary (LOW confidence — not used as primary basis)
- Various blog posts (DataCamp, ClaudeLog, Pixelmojo, smartscope) on Claude Code hooks — broadly consistent with official docs; cited only where official docs were ambiguous.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Claude Code's subagent registry is flat (one folder, no nesting matters for delegation) — therefore `brief-*` prefix is the right namespace strategy | Recommended Project Structure → `agents/brief-*` flat naming | Low — even if Claude Code adds subdir support, the prefix doesn't break anything |
| A2 | `commands/brief/foo.md` becomes `/brief:foo` (or `/brief-foo`) at the slash-command level | Recommended Project Structure → `commands/brief/` subdirectory | Medium — if slash-command nesting differs, command paths change but the architecture doesn't. Verify on first install. |
| A3 | A user-defined SubagentStop hook cannot spawn another subagent into the parent flow | Anti-Pattern 2; Pattern 4 | Medium — official docs imply this, but I did not find an explicit "can't spawn subagents from hooks" statement. Worst case: gate auto-attach via hook becomes feasible as a secondary mechanism, but the explicit-orchestrator approach is still architecturally cleaner. |
| A4 | The inherited `state.cjs` will preserve unknown namespaced fields (`state.brief.*`) on round-trip read/write | Pattern 5; State Management; Anti-Pattern 1 | High — must verify by writing a test in P0. If `state.cjs` strips unknown fields, the architecture needs a sidecar `state-brief.json` instead of namespaced extension. |
| A5 | The inherited `loadConfig` returns the full config.json object, so `config.brief.*` namespaced extension works without core changes | Internal Boundaries → `config.brief.*` ↔ inherited config | Low — confirmed by reading `init.cjs` which uses `loadConfig` and returns properties as-is, but only verified for known keys. Test in P0. |
| A6 | OBJECTIVES.md ≤ 8KB will fit in every spawned subagent's context budget alongside other required reading | Pattern 3 → Anchor Document + Context Injection | Low — at typical Claude Sonnet/Opus context sizes this is comfortable. Section-extraction is the documented mitigation. |
| A7 | Conventional Commits format (already enforced by inherited `gsd-validate-commit.sh`) is appropriate for BRIEF artifact commits as well | Hooks renaming step | Low — even business-facing commits benefit from machine-parseable history; hook is opt-in anyway |

---

## Open Questions

1. **Should OBJECTIVES.md amendments require a new phase or just a confirmed command?**
   - What we know: it must be amendable (real planning surfaces new objectives).
   - What's unclear: whether amendments should re-trigger ALIGN re-runs against ALL prior artifacts or just future ones.
   - Recommendation: defer to v1.1; for v1, OBJECTIVES.md is locked after Phase 0.

2. **Maximum return-stack depth: 3 enough?**
   - What we know: 1 is too restrictive (Phase 2 → Phase 1 → another Phase 1 nest is plausible).
   - What's unclear: real-world depth observed once dogfooded.
   - Recommendation: start at 3, escalate to user on overflow; instrument it.

3. **Should every BRIEF agent inherit the same Bash command allowlist, or should each agent's frontmatter declare its own?**
   - What we know: GSD's existing agents declare their own (e.g., gsd-executor has Read/Write/Edit/Bash, gsd-verifier has Read/Write/Bash).
   - What's unclear: whether brief-* researchers need Bash at all (they're mostly Read+Write+Web search).
   - Recommendation: minimum-tools per agent (researchers: no Bash; orchestrators-via-Task: not applicable since orchestrators are commands not agents). Reduces accidental damage surface.

4. **Should `brief-context-block` be a Bash helper or a tiny subagent?**
   - What we know: Bash helper is faster, deterministic, and reuses existing init.cjs patterns.
   - What's unclear: whether some context (e.g., voice guide selection per audience) requires LLM judgment.
   - Recommendation: Bash helper for v1. If LLM-judgment context emerges, add a separate `brief-context-injector` subagent later that the orchestrator calls before workers.

5. **How do gates handle artifacts that intentionally violate norms (e.g., a draft artifact tagged as `voice: experimental`)?**
   - What we know: AUDIENCE guard's job is to enforce voice/audience consistency.
   - What's unclear: bypass mechanism for legitimate experimentation.
   - Recommendation: artifact frontmatter can include `gate_overrides: [audience]` — gate skips its check if listed AND emits a warning to STATE.md (visibility, not enforcement).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22+ | Inherited GSD core, all gsd-tools.cjs operations | ✓ (assumed — already running GSD) | — | None — hard requirement |
| Claude Code CLI | Subagent spawning, slash command dispatch | ✓ (assumed — primary runtime) | — | OpenCode/Codex/Gemini fallbacks already wired in inherited core |
| Context7 MCP | Optional library docs lookup in researcher agents | ? (per-user) | — | `npx ctx7` Bash CLI fallback (already documented in inherited agents) |
| Brave Search MCP | Optional enhanced web search in researcher agents | ? (per-user) | — | Built-in WebSearch tool |
| Exa MCP | Optional semantic search | ? (per-user) | — | WebSearch / Brave Search |
| Firecrawl MCP | Optional URL deep-scraping | ? (per-user) | — | WebFetch tool |
| `git` CLI | Atomic commits via `gsd-tools.cjs commit` | ✓ (assumed — required by GSD) | — | None — hard requirement |
| Korea compliance reference texts | Korea-pack compliance checker | Must be authored | — | Compliance checker disables Korea-pack checks if files missing; emits warning |

**Missing dependencies with no fallback:** None — Node 22 + Claude Code + git is the inherited baseline; BRIEF adds no new hard requirements.

**Missing dependencies with fallback:** All MCP integrations are optional; built-in tools are the fallback (already documented pattern in inherited agents).

---

*Architecture research for: BRIEF business-domain layer over GSD core*
*Researched: 2026-04-17*
