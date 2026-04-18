<div align="center">

# BRIEF

## Business Research, Insight & Execution Framework

**English** · [Português](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md)

**A hard fork of GSD, purpose-built for business and product strategy planning.**

**For business planners, product managers, founders, and strategy consultants — not software developers.**

BRIEF transforms a fuzzy business idea into well-researched, audience-correct, compliance-aware deliverables — before engineering's PRD work begins. Hand the DELIVER outputs to a PM; the PRD they write from BRIEF's briefs feeds cleanly back into GSD itself for execution.

<br>

```bash
npx brief-cc@latest
```

**Works on Mac, Windows, and Linux.**

<br>

**Phase 1 status:** Fork hygiene complete. Dev-specific surfaces removed, identifiers renamed, multi-runtime detection preserved, zero runtime dependencies verified. Domain commands (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`) land in Phases 3–8.

[Core Value](#core-value) · [Four Phases](#four-phases) · [Status and Roadmap](#status-and-roadmap) · [Commands](#commands)

</div>

---

> [!IMPORTANT]
> ### Welcome Back to BRIEF
>
> If you're returning to BRIEF after the recent Anthropic Terms of Service changes — welcome back. We kept building while you were gone.
>
> **To re-import an existing project into BRIEF:**
> 1. Run `/brief-map-codebase` to scan and index your current codebase state
> 2. Run `/brief-new-project` to initialize a fresh BRIEF planning structure using the codebase map as context
> 3. Review [docs/USER-GUIDE.md](docs/USER-GUIDE.md) and the [CHANGELOG](CHANGELOG.md) for updates — a lot has changed since you were last here
>
> Your code is fine. BRIEF just needs its planning context rebuilt. The two commands above handle that.

---

## Core Value

A business planner can transform a fuzzy idea into well-researched, audience-correct, compliance-aware deliverables — *without already knowing what they want when they start*.

BRIEF replaces GSD's software-engineering workflow (plan → execute → verify) with a business-domain workflow (DEFINE → DISCOVER → DESIGN → DELIVER + continuous ALIGN), inherits GSD's multi-agent orchestration, context engineering, and state management, and swaps out the code-review / UI / security-audit surfaces for OBJECTIVES.md anchoring, parallel domain research, business workstreams (BMC, GTM, Financial, Operations, Compliance, Roadmap, Brand, Risk, Tech-Arch), and Type A / Type B deliverables (PRODUCT-BRIEF, SERVICE-POLICY, HIGH-LEVEL-SPEC, FEATURE-MAP + INTERNAL-DECK, PROPOSAL-DECK, EXEC-SUMMARY, DECISION-MEMO).

## Who This Is For

- **Business planners** shaping a new venture or product
- **Product managers** preparing PRD input
- **Founders** building investor and partner material
- **Strategy consultants** producing client-ready deliverables
- **Korea-first** with global support: Korean compliance reference library (PIPA / ISMS-P / MyData) built in

Not for: production-grade software-engineering workflows. For that, use GSD directly — BRIEF outputs hand off cleanly to GSD-driven PRD execution.

## Four Phases

1. **DEFINE** — Extract true intent. Push Twice + Language Precision conversational extraction, Dream State Mapping (now → 3mo → 12mo), OBJECTIVES.md per workstream as the single anchor every downstream phase reads.
2. **DISCOVER** — Broad domain research. 9 default research categories with provenance tags on every quantitative claim. B2B/B2C context injection. AUDIENCE guard on every research artifact.
3. **DESIGN** — Concrete business plan. 9 built-in workstreams (BMC, GTM, Financial, Operations, Compliance, Roadmap, Brand, Risk, Tech-Arch). Continuous ALIGN gate. Dynamic workstream addition via `/brief-add-workstream`. Bidirectional Phase 1 ↔ 2 flow.
4. **DELIVER** — Final artifacts in two modes: Type A (PRD inputs) and Type B (communication decks via Marp). Audience-enforced filenames + watermarks. Mandatory `/brief-export` confirmation before any deck renders.

---

## Getting Started

```bash
npx brief-cc@latest
```

The installer prompts you to choose:
1. **Runtime** — Claude Code, OpenCode, Gemini, Kilo, Codex, Copilot, Cursor, Windsurf, Antigravity, Augment, Trae, Qwen Code, CodeBuddy, Cline, or all (interactive multi-select — pick multiple runtimes in a single install session)
2. **Location** — Global (all projects) or local (current project only)

Verify with:
- Claude Code / Gemini / Copilot / Antigravity / Qwen Code: `/brief-help`
- OpenCode / Kilo / Augment / Trae / CodeBuddy: `/brief-help`
- Codex: `$gsd-help`
- Cline: BRIEF installs via `.clinerules` — verify by checking `.clinerules` exists

> [!NOTE]
> Claude Code 2.1.88+, Qwen Code, and Codex install as skills (`.claude/skills/`, `./.codex/skills/`, or the matching global `~/.claude/skills/` / `~/.codex/skills/` roots). Older Claude Code versions (pre-2.1.88) install BRIEF to `commands/brief/`. Legacy installs that predate the BRIEF fork still have `commands/gsd/` on disk — the installer detects and cleans this. `~/.claude/brief/skills/` is import-only for legacy migration. The installer handles all formats automatically.

The canonical discovery contract is documented in [docs/skills/discovery-contract.md](docs/skills/discovery-contract.md).

> [!TIP]
> For source-based installs or environments where npm is unavailable, see **[docs/manual-update.md](docs/manual-update.md)**.

### Staying Updated

BRIEF evolves fast. Update periodically:

```bash
npx brief-cc@latest
```

<details>
<summary><strong>Non-interactive Install (Docker, CI, Scripts)</strong></summary>

```bash
# Claude Code
npx brief-cc --claude --global   # Install to ~/.claude/
npx brief-cc --claude --local    # Install to ./.claude/

# OpenCode
npx brief-cc --opencode --global # Install to ~/.config/opencode/

# Gemini CLI
npx brief-cc --gemini --global   # Install to ~/.gemini/

# Kilo
npx brief-cc --kilo --global     # Install to ~/.config/kilo/
npx brief-cc --kilo --local      # Install to ./.kilo/

# Codex
npx brief-cc --codex --global    # Install to ~/.codex/
npx brief-cc --codex --local     # Install to ./.codex/

# Copilot
npx brief-cc --copilot --global  # Install to ~/.github/
npx brief-cc --copilot --local   # Install to ./.github/

# Cursor CLI
npx brief-cc --cursor --global      # Install to ~/.cursor/
npx brief-cc --cursor --local       # Install to ./.cursor/

# Windsurf
npx brief-cc --windsurf --global    # Install to ~/.codeium/windsurf/
npx brief-cc --windsurf --local     # Install to ./.windsurf/

# Antigravity
npx brief-cc --antigravity --global # Install to ~/.gemini/antigravity/
npx brief-cc --antigravity --local  # Install to ./.agent/

# Augment
npx brief-cc --augment --global     # Install to ~/.augment/
npx brief-cc --augment --local      # Install to ./.augment/

# Trae
npx brief-cc --trae --global        # Install to ~/.trae/
npx brief-cc --trae --local         # Install to ./.trae/

# Qwen Code
npx brief-cc --qwen --global        # Install to ~/.qwen/
npx brief-cc --qwen --local         # Install to ./.qwen/

# CodeBuddy
npx brief-cc --codebuddy --global   # Install to ~/.codebuddy/
npx brief-cc --codebuddy --local    # Install to ./.codebuddy/

# Cline
npx brief-cc --cline --global       # Install to ~/.cline/
npx brief-cc --cline --local        # Install to ./.clinerules

# All runtimes
npx brief-cc --all --global      # Install to all directories
```

Use `--global` (`-g`) or `--local` (`-l`) to skip the location prompt.
Use `--claude`, `--opencode`, `--gemini`, `--kilo`, `--codex`, `--copilot`, `--cursor`, `--windsurf`, `--antigravity`, `--augment`, `--trae`, `--qwen`, `--codebuddy`, `--cline`, or `--all` to skip the runtime prompt.
Use `--sdk` to also install the BRIEF SDK CLI (`gsd-sdk`) for headless autonomous execution.

</details>

<details>
<summary><strong>Development Installation</strong></summary>

Clone the repository, build hooks, and run the installer locally:

```bash
git clone https://github.com/brief-build/brief.git
cd brief
npm run build:hooks
node bin/install.js --claude --local
```

The `build:hooks` step is required — it compiles hook sources into `hooks/dist/` which the installer copies from. Without it, hooks won't be installed and you'll get hook errors in Claude Code. (The npm release handles this automatically via `prepublishOnly`.)

Installs to `./.claude/` for testing modifications before contributing.

</details>

### Recommended: Skip Permissions Mode

BRIEF is designed for frictionless automation. Run Claude Code with:

```bash
claude --dangerously-skip-permissions
```

> [!TIP]
> This is how BRIEF is intended to be used — stopping to approve `date` and `git commit` 50 times defeats the purpose.

<details>
<summary><strong>Alternative: Granular Permissions</strong></summary>

If you prefer not to use that flag, add this to your project's `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(date:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(grep:*)",
      "Bash(tr:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git tag:*)"
    ]
  }
}
```

</details>

---

## How It Works

> **Already have code?** Run `/brief-map-codebase` first. It spawns parallel agents to analyze your stack, architecture, conventions, and concerns. Then `/brief-new-project` knows your codebase — questions focus on what you're adding, and planning automatically loads your patterns.

### 1. Initialize Project

```
/brief-new-project
```

One command, one flow. The system:

1. **Questions** — Asks until it understands your idea completely (goals, constraints, tech preferences, edge cases)
2. **Research** — Spawns parallel agents to investigate the domain (optional but recommended)
3. **Requirements** — Extracts what's v1, v2, and out of scope
4. **Roadmap** — Creates phases mapped to requirements

You approve the roadmap. Now you're ready to build.

**Creates:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `.planning/research/`

---

### 2. Discuss Phase

```
/brief-discuss-phase 1
```

**This is where you shape the implementation.**

Your roadmap has a sentence or two per phase. That's not enough context to build something the way *you* imagine it. This step captures your preferences before anything gets researched or planned.

The system analyzes the phase and identifies gray areas based on what's being built:

- **Visual features** → Layout, density, interactions, empty states
- **APIs/CLIs** → Response format, flags, error handling, verbosity
- **Content systems** → Structure, tone, depth, flow
- **Organization tasks** → Grouping criteria, naming, duplicates, exceptions

For each area you select, it asks until you're satisfied. The output — `CONTEXT.md` — feeds directly into the next two steps:

1. **Researcher reads it** — Knows what patterns to investigate ("user wants card layout" → research card component libraries)
2. **Planner reads it** — Knows what decisions are locked ("infinite scroll decided" → plan includes scroll handling)

The deeper you go here, the more the system builds what you actually want. Skip it and you get reasonable defaults. Use it and you get *your* vision.

**Creates:** `{phase_num}-CONTEXT.md`

> **Assumptions Mode:** Prefer codebase analysis over questions? Set `workflow.discuss_mode` to `assumptions` in `/brief-settings`. The system reads your code, surfaces what it would do and why, and only asks you to correct what's wrong. See [Discuss Mode](docs/workflow-discuss-mode.md).

---

### 3. Plan Phase

```
/brief-plan-phase 1
```

The system:

1. **Researches** — Investigates how to implement this phase, guided by your CONTEXT.md decisions
2. **Plans** — Creates 2-3 atomic task plans with XML structure
3. **Verifies** — Checks plans against requirements, loops until they pass

Each plan is small enough to execute in a fresh context window. No degradation, no "I'll be more concise now."

**Creates:** `{phase_num}-RESEARCH.md`, `{phase_num}-{N}-PLAN.md`

---

### 4. Execute Phase

```
/brief-execute-phase 1
```

The system:

1. **Runs plans in waves** — Parallel where possible, sequential when dependent
2. **Fresh context per plan** — 200k tokens purely for implementation, zero accumulated garbage
3. **Commits per task** — Every task gets its own atomic commit
4. **Verifies against goals** — Checks the codebase delivers what the phase promised

Walk away, come back to completed work with clean git history.

**How Wave Execution Works:**

Plans are grouped into "waves" based on dependencies. Within each wave, plans run in parallel. Waves run sequentially.

```
┌────────────────────────────────────────────────────────────────────┐
│  PHASE EXECUTION                                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  WAVE 1 (parallel)          WAVE 2 (parallel)          WAVE 3      │
│  ┌─────────┐ ┌─────────┐    ┌─────────┐ ┌─────────┐    ┌─────────┐ │
│  │ Plan 01 │ │ Plan 02 │ →  │ Plan 03 │ │ Plan 04 │ →  │ Plan 05 │ │
│  │         │ │         │    │         │ │         │    │         │ │
│  │ User    │ │ Product │    │ Orders  │ │ Cart    │    │ Checkout│ │
│  │ Model   │ │ Model   │    │ API     │ │ API     │    │ UI      │ │
│  └─────────┘ └─────────┘    └─────────┘ └─────────┘    └─────────┘ │
│       │           │              ↑           ↑              ↑      │
│       └───────────┴──────────────┴───────────┘              │      │
│              Dependencies: Plan 03 needs Plan 01            │      │
│                          Plan 04 needs Plan 02              │      │
│                          Plan 05 needs Plans 03 + 04        │      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Why waves matter:**
- Independent plans → Same wave → Run in parallel
- Dependent plans → Later wave → Wait for dependencies
- File conflicts → Sequential plans or same plan

This is why "vertical slices" (Plan 01: User feature end-to-end) parallelize better than "horizontal layers" (Plan 01: All models, Plan 02: All APIs).

**Creates:** `{phase_num}-{N}-SUMMARY.md`, `{phase_num}-VERIFICATION.md`

---

### 5. Verify Work

```
/brief-verify-work 1
```

**This is where you confirm it actually works.**

Automated verification checks that code exists and tests pass. But does the feature *work* the way you expected? This is your chance to use it.

The system:

1. **Extracts testable deliverables** — What you should be able to do now
2. **Walks you through one at a time** — "Can you log in with email?" Yes/no, or describe what's wrong
3. **Diagnoses failures automatically** — Spawns debug agents to find root causes
4. **Creates verified fix plans** — Ready for immediate re-execution

If everything passes, you move on. If something's broken, you don't manually debug — you just run `/brief-execute-phase` again with the fix plans it created.

**Creates:** `{phase_num}-UAT.md`, fix plans if issues found

---

### 6. Repeat → Ship → Complete → Next Milestone

```
/brief-discuss-phase 2
/brief-plan-phase 2
/brief-execute-phase 2
/brief-verify-work 2
/brief-ship 2                  # Create PR from verified work
...
/brief-complete-milestone
/brief-new-milestone
```

Or let BRIEF figure out the next step automatically:

```
/brief-next                    # Auto-detect and run next step
```

Loop **discuss → plan → execute → verify → ship** until milestone complete.

If you want faster intake during discussion, use `/brief-discuss-phase <n> --batch` to answer a small grouped set of questions at once instead of one-by-one. Use `--chain` to auto-chain discuss into plan+execute without stopping between steps.

Each phase gets your input (discuss), proper research (plan), clean execution (execute), and human verification (verify). Context stays fresh. Quality stays high.

When all phases are done, `/brief-complete-milestone` archives the milestone and tags the release.

Then `/brief-new-milestone` starts the next version — same flow as `new-project` but for your existing codebase. You describe what you want to build next, the system researches the domain, you scope requirements, and it creates a fresh roadmap. Each milestone is a clean cycle: define → build → ship.

---

### Quick Mode

```
/brief-quick
```

**For ad-hoc tasks that don't need full planning.**

Quick mode gives you BRIEF guarantees (atomic commits, state tracking) with a faster path:

- **Same agents** — Planner + executor, same quality
- **Skips optional steps** — No research, no plan checker, no verifier by default
- **Separate tracking** — Lives in `.planning/quick/`, not phases

**`--discuss` flag:** Lightweight discussion to surface gray areas before planning.

**`--research` flag:** Spawns a focused researcher before planning. Investigates implementation approaches, library options, and pitfalls. Use when you're unsure how to approach a task.

**`--full` flag:** Enables all phases — discussion + research + plan-checking + verification. The full BRIEF pipeline in quick-task form.

**`--validate` flag:** Enables plan-checking + post-execution verification only (the previous `--full` behavior).

Flags are composable: `--discuss --research --validate` gives discussion + research + plan-checking + verification.

```
/brief-quick
> What do you want to do? "Add dark mode toggle to settings"
```

**Creates:** `.planning/quick/001-add-dark-mode-toggle/PLAN.md`, `SUMMARY.md`

---

## Why It Works

### Context Engineering

Claude Code is incredibly powerful *if* you give it the context it needs. Most people don't.

BRIEF handles it for you:

| File | What it does |
|------|--------------|
| `PROJECT.md` | Project vision, always loaded |
| `research/` | Ecosystem knowledge (stack, features, architecture, pitfalls) |
| `REQUIREMENTS.md` | Scoped v1/v2 requirements with phase traceability |
| `ROADMAP.md` | Where you're going, what's done |
| `STATE.md` | Decisions, blockers, position — memory across sessions |
| `PLAN.md` | Atomic task with XML structure, verification steps |
| `SUMMARY.md` | What happened, what changed, committed to history |
| `todos/` | Captured ideas and tasks for later work |
| `threads/` | Persistent context threads for cross-session work |
| `seeds/` | Forward-looking ideas that surface at the right milestone |

Size limits based on where Claude's quality degrades. Stay under, get consistent excellence.

### XML Prompt Formatting

Every plan is structured XML optimized for Claude:

```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    Use jose for JWT (not jsonwebtoken - CommonJS issues).
    Validate credentials against users table.
    Return httpOnly cookie on success.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 + Set-Cookie</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

Precise instructions. No guessing. Verification built in.

### Multi-Agent Orchestration

Every stage uses the same pattern: a thin orchestrator spawns specialized agents, collects results, and routes to the next step.

| Stage | Orchestrator does | Agents do |
|-------|------------------|-----------|
| Research | Coordinates, presents findings | 4 parallel researchers investigate stack, features, architecture, pitfalls |
| Planning | Validates, manages iteration | Planner creates plans, checker verifies, loop until pass |
| Execution | Groups into waves, tracks progress | Executors implement in parallel, each with fresh 200k context |
| Verification | Presents results, routes next | Verifier checks codebase against goals, debuggers diagnose failures |

The orchestrator never does heavy lifting. It spawns agents, waits, integrates results.

**The result:** You can run an entire phase — deep research, multiple plans created and verified, thousands of lines of code written across parallel executors, automated verification against goals — and your main context window stays at 30-40%. The work happens in fresh subagent contexts. Your session stays fast and responsive.

### Atomic Git Commits

Each task gets its own commit immediately after completion:

```bash
abc123f docs(08-02): complete user registration plan
def456g feat(08-02): add email confirmation flow
hij789k feat(08-02): implement password hashing
lmn012o feat(08-02): create registration endpoint
```

> [!NOTE]
> **Benefits:** Git bisect finds exact failing task. Each task independently revertable. Clear history for Claude in future sessions. Better observability in AI-automated workflow.

Every commit is surgical, traceable, and meaningful.

### Modular by Design

- Add phases to current milestone
- Insert urgent work between phases
- Complete milestones and start fresh
- Adjust plans without rebuilding everything

You're never locked in. The system adapts.

---

## Commands

> Phase 1 has renamed the inherited workflow primitives; the BRIEF-domain commands arrive in Phases 3–8. The tables below reflect the current workflow surfaces only.

### Core Workflow (Phase 1)

| Command | What it does |
|---------|--------------|
| `/brief-new-project` | Initialize a new BRIEF project |
| `/brief-discuss-phase [N]` | Capture phase-level decisions before planning |
| `/brief-plan-phase [N]` | Research + plan a phase |
| `/brief-execute-phase <N>` | Run phase plans in parallel waves |
| `/brief-verify-work [N]` | Manual verification of phase outputs |
| `/brief-help` | Categorized command listing (populated in Phase 9) |

### Phases 3–8 (coming)

- `/brief-define` — Phase 0 conversational intent extractor (Phase 3)
- `/brief-discover` — Parallel domain research with provenance (Phase 5)
- `/brief-design` — Workstream orchestration + ALIGN / COMPLIANCE gates (Phases 4, 7)
- `/brief-deliver` — Type A + Type B artifacts with audience enforcement (Phase 8)
- `/brief-add-workstream` — Dynamic workstream addition (Phase 7)
- `/brief-status` — Current phase, active workstream, return-stack depth, gate findings (Phase 2)

Inherited GSD workflow commands (new-milestone, complete-milestone, discuss-phase, plan-phase, execute-phase, verify-work, help, status, and others) are preserved and renamed with the `/brief-` prefix.

## Status and Roadmap

- **Phase 1 (complete):** Fork hygiene, removal of ~38–45 dev-specific files, rename to `brief-*`, A1 zero-deps verified, multi-runtime detection preserved.
- **Phases 2–9:** See `.planning/ROADMAP.md` for the full 9-phase roadmap covering stable seams, DEFINE, ALIGN gate, DISCOVER, bidirectional foundation, DESIGN + COMPLIANCE checker, DELIVER + AUDIENCE enforcement, and cross-runtime hardening.

## Localized READMEs

The Korean, Japanese, Portuguese, and Simplified Chinese READMEs are being rebranded as part of Phase 9 (Hardening). They currently reflect pre-fork GSD content.

---

## Configuration

BRIEF stores project settings in `.planning/config.json`. Configure during `/brief-new-project` or update later with `/brief-settings`. For the full config schema, workflow toggles, git branching options, and per-agent model breakdown, see the [User Guide](docs/USER-GUIDE.md#configuration-reference).

### Core Settings

| Setting | Options | Default | What it controls |
|---------|---------|---------|------------------|
| `mode` | `yolo`, `interactive` | `interactive` | Auto-approve vs confirm at each step |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | Phase granularity — how finely scope is sliced (phases × plans) |
| `project_code` | string | `""` | Prefix phase directories with a project code |

### Model Profiles

Control which Claude model each agent uses. Balance quality vs token spend.

| Profile | Planning | Execution | Verification |
|---------|----------|-----------|--------------|
| `quality` | Opus | Opus | Sonnet |
| `balanced` (default) | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |
| `inherit` | Inherit | Inherit | Inherit |

Switch profiles:
```
/brief-set-profile budget
```

Use `inherit` when using non-Anthropic providers (OpenRouter, local models) or to follow the current runtime model selection (e.g. OpenCode `/model`).

Or configure via `/brief-settings`.

### Workflow Agents

These spawn additional agents during planning/execution. They improve quality but add tokens and time.

| Setting | Default | What it does |
|---------|---------|--------------|
| `workflow.research` | `true` | Researches domain before planning each phase |
| `workflow.plan_check` | `true` | Verifies plans achieve phase goals before execution |
| `workflow.verifier` | `true` | Confirms must-haves were delivered after execution |
| `workflow.auto_advance` | `false` | Auto-chain discuss → plan → execute without stopping |
| `workflow.research_before_questions` | `false` | Run research before discussion questions instead of after |
| `workflow.discuss_mode` | `'discuss'` | Discussion mode: `discuss` (interview), `assumptions` (codebase-first) |
| `workflow.skip_discuss` | `false` | Skip discuss-phase in autonomous mode |
| `workflow.text_mode` | `false` | Text-only mode for remote sessions (no TUI menus) |
| `workflow.use_worktrees` | `true` | Toggle worktree isolation for execution |

Use `/brief-settings` to toggle these, or override per-invocation:
- `/brief-plan-phase --skip-research`
- `/brief-plan-phase --skip-verify`

### Execution

| Setting | Default | What it controls |
|---------|---------|------------------|
| `parallelization.enabled` | `true` | Run independent plans simultaneously |
| `planning.commit_docs` | `true` | Track `.planning/` in git |
| `hooks.context_warnings` | `true` | Show context window usage warnings |

### Agent Skills

Inject project-specific skills into subagents during execution.

| Setting | Type | What it does |
|---------|------|--------------|
| `agent_skills.<agent_type>` | `string[]` | Paths to skill directories loaded into that agent type at spawn time |

Skills are injected as `<agent_skills>` blocks in agent prompts, giving subagents access to project-specific knowledge.

### Git Branching

Control how BRIEF handles branches during execution.

| Setting | Options | Default | What it does |
|---------|---------|---------|--------------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` | Branch creation strategy |
| `git.phase_branch_template` | string | `gsd/phase-{phase}-{slug}` | Template for phase branches |
| `git.milestone_branch_template` | string | `gsd/{milestone}-{slug}` | Template for milestone branches |

**Strategies:**
- **`none`** — Commits to current branch (default BRIEF behavior)
- **`phase`** — Creates a branch per phase, merges at phase completion
- **`milestone`** — Creates one branch for entire milestone, merges at completion

At milestone completion, BRIEF offers squash merge (recommended) or merge with history.

---

## Security

### Built-in Security Hardening

BRIEF includes defense-in-depth security since v1.27:

- **Path traversal prevention** — All user-supplied file paths (`--text-file`, `--prd`) are validated to resolve within the project directory
- **Prompt injection detection** — Centralized `security.cjs` module scans for injection patterns in user-supplied text before it enters planning artifacts
- **PreToolUse prompt guard hook** — `gsd-prompt-guard` scans writes to `.planning/` for embedded injection vectors (advisory, not blocking)
- **Safe JSON parsing** — Malformed `--fields` arguments are caught before they corrupt state
- **Shell argument validation** — User text is sanitized before shell interpolation
- **CI-ready injection scanner** — `prompt-injection-scan.test.cjs` scans all agent/workflow/command files for embedded injection vectors

> [!NOTE]
> Because BRIEF generates markdown files that become LLM system prompts, any user-controlled text flowing into planning artifacts is a potential indirect prompt injection vector. These protections are designed to catch such vectors at multiple layers.

### Protecting Sensitive Files

BRIEF's codebase mapping and analysis commands read files to understand your project. **Protect files containing secrets** by adding them to Claude Code's deny list:

1. Open Claude Code settings (`.claude/settings.json` or global)
2. Add sensitive file patterns to the deny list:

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/*)",
      "Read(**/*credential*)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

This prevents Claude from reading these files entirely, regardless of what commands you run.

> [!IMPORTANT]
> BRIEF includes built-in protections against committing secrets, but defense-in-depth is best practice. Deny read access to sensitive files as a first line of defense.

---

## Troubleshooting

**Commands not found after install?**
- Restart your runtime to reload commands/skills
- Verify files exist in `~/.claude/skills/brief-*/SKILL.md` or `~/.codex/skills/brief-*/SKILL.md` for managed global installs
- For local installs, verify `.claude/skills/brief-*/SKILL.md` or `./.codex/skills/brief-*/SKILL.md`
- Legacy Claude Code installs (pre-BRIEF-fork) still have `~/.claude/commands/gsd/` — the installer cleans this directory automatically

**Commands not working as expected?**
- Run `/brief-help` to verify installation
- Re-run `npx brief-cc` to reinstall

**Updating to the latest version?**
```bash
npx brief-cc@latest
```

**Using Docker or containerized environments?**

If file reads fail with tilde paths (`~/.claude/...`), set `CLAUDE_CONFIG_DIR` before installing:
```bash
CLAUDE_CONFIG_DIR=/home/youruser/.claude npx brief-cc --global
```
This ensures absolute paths are used instead of `~` which may not expand correctly in containers.

### Uninstalling

To remove BRIEF completely:

```bash
# Global installs
npx brief-cc --claude --global --uninstall
npx brief-cc --opencode --global --uninstall
npx brief-cc --gemini --global --uninstall
npx brief-cc --kilo --global --uninstall
npx brief-cc --codex --global --uninstall
npx brief-cc --copilot --global --uninstall
npx brief-cc --cursor --global --uninstall
npx brief-cc --windsurf --global --uninstall
npx brief-cc --antigravity --global --uninstall
npx brief-cc --augment --global --uninstall
npx brief-cc --trae --global --uninstall
npx brief-cc --qwen --global --uninstall
npx brief-cc --codebuddy --global --uninstall
npx brief-cc --cline --global --uninstall

# Local installs (current project)
npx brief-cc --claude --local --uninstall
npx brief-cc --opencode --local --uninstall
npx brief-cc --gemini --local --uninstall
npx brief-cc --kilo --local --uninstall
npx brief-cc --codex --local --uninstall
npx brief-cc --copilot --local --uninstall
npx brief-cc --cursor --local --uninstall
npx brief-cc --windsurf --local --uninstall
npx brief-cc --antigravity --local --uninstall
npx brief-cc --augment --local --uninstall
npx brief-cc --trae --local --uninstall
npx brief-cc --qwen --local --uninstall
npx brief-cc --codebuddy --local --uninstall
npx brief-cc --cline --local --uninstall
```

This removes all BRIEF commands, agents, hooks, and settings while preserving your other configurations.

---

## Community Ports

OpenCode, Gemini CLI, Kilo, and Codex are now natively supported via `npx brief-cc`.

These community ports pioneered multi-runtime support:

| Project | Platform | Description |
|---------|----------|-------------|
| [gsd-opencode](https://github.com/rokicool/brief-opencode) | OpenCode | Original OpenCode adaptation |
| gsd-gemini (archived) | Gemini CLI | Original Gemini adaptation by uberfuzzy |

---

## Star History

<a href="https://star-history.com/#gsd-build/brief&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=gsd-build/brief&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=gsd-build/brief&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=gsd-build/brief&type=Date" />
 </picture>
</a>

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Claude Code is powerful. BRIEF makes it reliable.**

</div>
