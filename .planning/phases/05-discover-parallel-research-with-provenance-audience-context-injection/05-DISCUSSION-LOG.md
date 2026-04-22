# Phase 5: DISCOVER — Parallel Research with Provenance + AUDIENCE + Context Injection - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `05-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 05-discover-parallel-research-with-provenance-audience-context-injection
**Areas discussed:** A1 Researcher architecture, A2 Provenance tag system, A3 AUDIENCE guard (Phase 4 replica), A5 B2B/B2C context injection

---

## A0 — Gray-Area Selection + Pacing

### Selected areas

| Option | Description | Selected |
|--------|-------------|----------|
| A1: Researcher architecture | Agent file shape, parallel cap, output scheme, custom category | ✓ |
| A2: Provenance tag system | Quantitative scope, hook impl, enforcement layers, confidence bands | ✓ |
| A3: AUDIENCE guard (Phase 4 replica) — HIGH LEVERAGE | 3-output translation, frontmatter schema, filename scheme, ALIGN migration | ✓ |
| A5: B2B/B2C context injection | Mechanism, lib location, divergence location | ✓ |

**User's choice:** All 4 areas.

### Pacing

| Option | Description | Selected |
|--------|-------------|----------|
| Interactive per-area (default) | Walk A1 → A2 → A3 → A5 one at a time | ✓ |
| Delegated recommendations (Phase 4 pattern) | Full recommendation table upfront; scan-and-confirm | |
| Hybrid: delegate A1/A2/A5, interactive on A3 | Drill highest-leverage only | |

**User's choice:** Interactive per-area (default).

**Note:** A4 (Korea compliance reference library) was NOT selected for interactive discussion; routed to Claude's Discretion with a default design documented in CONTEXT.md.

---

## A1 — Researcher Architecture

### Q1 — Agent file shape

| Option | Description | Selected |
|--------|-------------|----------|
| ONE parameterized agent (Recommended) | `brief-domain-researcher.md` parameterized by category + business_model + region at Task-spawn time; one file, one prompt, 9 spawn configs | ✓ |
| 9 separate agent files | Per-category file; violates DRY; 9 files to keep in sync on shared concerns | |
| Reuse `brief-phase-researcher.md` | Extend with "domain research mode" flag; conflates planner-input and business-findings output shapes | |

**User's choice:** ONE parameterized agent.
**Notes:** Phase 4 D-01 "template-friendly over phase-specific" discipline; domain researcher output shape is distinct from existing phase researcher.

### Q2 — Parallel cap of 4 enforcement

| Option | Description | Selected |
|--------|-------------|----------|
| Wave-based queue (Recommended) | Split N categories into ceil(N/4) waves of ≤4; single message spawns; wait → next wave | ✓ |
| Semaphore-like continuous | Up to 4 at any time; spawn as each returns; harder coordination, unclear checkpoint | |
| Sequential (no parallelism) | One at a time; violates DSC-03 | |

**User's choice:** Wave-based queue.
**Notes:** Matches Anthropic's multi-agent best practice (explicit waves, bounded parallelism).

### Q3 — Output file scheme

| Option | Description | Selected |
|--------|-------------|----------|
| Per-category files in `.planning/discover/` (Recommended) | Flat: market-sizing.md, competitor-landscape.md, etc. | ✓ |
| Nested under phase directory | `.planning/phases/05-.../discover/...` — confuses build-phase with runtime-phase | |
| Single consolidated DISCOVER.md | Concurrent-write serialization issues | |

**User's choice:** Per-category files.

### Q4 — Custom category prompt source

| Option | Description | Selected |
|--------|-------------|----------|
| Generic template with user-supplied topic (Recommended) | User types topic; orchestrator plugs into same brief-domain-researcher.md template | ✓ |
| User provides full prompt | Offloads prompt-engineering to non-technical planner (Pitfall #9) | |
| Interactive prompt builder | Higher polish; defer to v1.x | |

**User's choice:** Generic template.

---

## A2 — Provenance Tag System

### Q1 — "Quantitative claim" scope

| Option | Description | Selected |
|--------|-------------|----------|
| Market/money numbers + percentages (Recommended) | Currency ($, ₩, €, ¥, B/M/K), percentages (23%), multipliers (3x), explicit market/revenue/growth phrasings. Excludes dates, article numbers, version strings | ✓ |
| All numbers including dates/versions | Simpler regex; high false-positive rate (2026, Article 30, v1.2); Pitfall #4 tune-out risk | |
| LLM-classified at agent-output time | Highest accuracy; loses CI-time mechanical gate; complement, not replace regex | |

**User's choice:** Market/money numbers + percentages.

### Q2 — Pre-commit hook implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Shell hook like `brief-validate-commit.sh` (Recommended) | New `hooks/brief-validate-provenance.sh`; PreToolUse on Bash git-commit; opt-in via hooks.community: true; grep+awk; zero Node startup cost | ✓ |
| Node-based hook | Better parsing but ~200ms startup per commit; inconsistent with existing shell hook shape | |
| Inline in `brief-tools.cjs commit` wrapper | Misses direct `git commit` invocations; CC-04 mandates real git hook | |

**User's choice:** Shell hook.

### Q3 — Enforcement layer

| Option | Description | Selected |
|--------|-------------|----------|
| Double layer: agent output + pre-commit (Recommended) | Researcher prompt requires tags; hook verifies at commit. Defense in depth | ✓ |
| Pre-commit only | Skip agent-output discipline; every run produces initial blocked commit (friction) | |
| Agent-output only (no pre-commit) | Violates CC-04 hard block rule | |

**User's choice:** Double layer.

### Q4 — Confidence bands (ranges) vs point estimates

| Option | Description | Selected |
|--------|-------------|----------|
| Hard rule in researcher prompt (Recommended) | Ranges with source count mandatory for market-size; point estimates ONLY with single authoritative source AND [VERIFIED] | ✓ |
| Advisory in researcher prompt only | "Prefer ranges"; Pitfall #6 weakens | |
| Defer to Phase 7 gate | Pitfall #6 says hallucination happens at research time — too late downstream | |

**User's choice:** Hard rule in researcher prompt.

---

## A3 — AUDIENCE Guard (Phase 4 Replica) — HIGH LEVERAGE

### Q1 — 3-output decision translation from ALIGN semantics to AUDIENCE

| Option | Description | Selected |
|--------|-------------|----------|
| Literal preservation of Phase 4 shape (Recommended) | AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content. Phase 7 copy-renames verbatim. Vocabulary-uniform across 3 gates | ✓ |
| 2-output (PASS / BLOCK-with-findings) | Simpler; breaks template uniformity; forces Phase 7 to invent shape | |
| 3-output with AUDIENCE-specific semantics | AUDIENCE-OK / FLAGGED-missing-fields / BLOCKED-content-leak; intuitive but Phase 7 can't literally copy | |

**User's choice:** Literal preservation.

### Q2 — Frontmatter schema strictness

| Option | Description | Selected |
|--------|-------------|----------|
| 3 mandatory + 3 auto-populated via context injection (Recommended) | Mandatory: audience.type, audience.confidentiality, business_context.model. Auto-populated with override: audience.role, voice.tone, voice.perspective | ✓ |
| All 6 fields strictly mandatory | DSG-13 literal reading; 6 fields per artifact = Pitfall #9 friction | |
| All 6 optional, schema-flexible | Permissive; nothing to enforce | |

**User's choice:** 3 mandatory + 3 auto-populated.

### Q3 — Filename scheme for 9+ parallel callers

| Option | Description | Selected |
|--------|-------------|----------|
| Paired sibling: `{artifact}.audience.md` next to source (Recommended) | Co-located with source; grep-able; scales to Phase 7 `{artifact}.compliance.md`; solves Phase 4 deferred filename question | ✓ |
| Aggregated gate directory | `.planning/audience/...` — mental indirection | |
| Single rolling audit log | Concurrent-write serialization; mismatches ALIGN's per-artifact file model | |

**User's choice:** Paired sibling.

### Q4 — Retroactive Phase 4 ALIGN filename migration

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — migrate ALIGN to the new scheme in Phase 5 (Recommended) | `.planning/ALIGN-00.md` → `.planning/OBJECTIVES.align.md`; atomic with Phase 5 plan; zero-risk | ✓ |
| No — keep `ALIGN-00.md`, only new AUDIENCE uses the scheme | Divergent schemes across 3 gates = ongoing confusion | |

**User's choice:** Yes, migrate.
**Notes:** Phase 4 CONTEXT explicitly deferred this to Phase 5 planner.

---

## A5 — B2B/B2C Context Injection (Cross-Cutting CC-02)

### Q1 — Injection mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Orchestrator pre-injects context block into Task prompt (Recommended) | Orchestrator builds `<business_context>` block, embeds in Task prompt BEFORE spawn; works identically across runtimes | ✓ |
| Agent reads state.brief.* at spawn time | Couples every new agent to parsing; inconsistent if agent forgets a field | |
| Env var via Task spawn args | Task tool env-var support unreliable across runtimes | |

**User's choice:** Orchestrator pre-inject.

### Q2 — Injection logic location

| Option | Description | Selected |
|--------|-------------|----------|
| Reusable helper: `brief/bin/lib/context-inject.cjs` (Recommended) | `buildBusinessContext()`; one place to update; Phase 6/7/8 inherit | ✓ |
| Inline in each orchestrator workflow markdown | Duplicated across 9+ workflows; drift risk | |
| `brief-tools.cjs context-block` subcommand | Adds CLI shim with no benefit over direct lib import | |

**User's choice:** Reusable lib helper.

### Q3 — B2B/B2C divergence location

| Option | Description | Selected |
|--------|-------------|----------|
| In agent prompt as conditional blocks (Recommended) | brief-domain-researcher.md applies "if b2b: ...; if b2c: ..." inline; category + model guidance co-located | ✓ |
| In reference file loaded as required_reading | `brief/references/business-context-lens.md`; agent combines lens with category prompt | |
| In lib helper's output | `buildBusinessContext()` pre-templates per model; couples prose to JS | |

**User's choice:** In agent prompt.

---

## Claude's Discretion (A4 + implementation details)

The following areas were NOT interactively discussed; Claude's defaults documented in `05-CONTEXT.md <decisions>` → `### Claude's Discretion`:

- **A4 Korea compliance reference library** — 3 files at `brief/references/compliance/korea/` (pipa-2026.md, isms-p.md, mydata-2026.md); Markdown + YAML frontmatter (region, industry, effective_date, penalty_ceiling, last_reviewed); ~400–800 words per primer; sections (Scope / Key Articles / Common Gotchas / Penalties / Legal-counsel Disclaimer / Sources); auto-attach to researcher when `state.brief.compliance_packs` contains the matching pack; mandatory verbatim disclaimer per primer.
- Exact regex patterns for D-05 quantitative detection (planner ships initial list; extends iteratively).
- Exact Korean + English 3-path interrupt button wording for AUDIENCE DRIFTED paths (semantics locked; prose inherits Phase 3 D-12 tone + Phase 4 D-06 Korean patterns).
- `buildBusinessContext()` block format (inline XML / YAML / JSON; pick one).
- Researcher output file section structure (frontmatter locked; sections are planner's domain).
- Canary scope for Phase 5 (planner picks minimum end-to-end).
- Test fixture granularity.
- State allowlist extensions (if any).
- Internal structure of `brief/bin/lib/audience.cjs` (follow `align.cjs` shape).
- Commit granularity (suggested 8-commit breakdown documented in CONTEXT.md).

---

## Deferred Ideas

(Captured in CONTEXT.md `<deferred>` section; high-level summary here.)

- Semantic "internal-only language" detection refinement → Phase 9 HRD-04 pilot.
- Clause-level Korean compliance content → CC-V2-01 (v2).
- Bilingual `.ko.md` / `.en.md` artifact pairs → Phase 8 DELIVER.
- Cross-artifact leakage diff check → Phase 8 DELIVER.
- Web-search MCP integration → DSC-V2-01 (v2).
- Customer interview transcript analyzer → DSC-V2-02 (v2).
- Researcher failure recovery refinement → Phase 9 HRD-04.
- Provenance tag ban-list creative-avoidance expansion → Phase 9.
- State allowlist extension for new `state.brief.*` fields — flag only if needed.
- `/brief-realign` / `/brief-reaudit` commands → Phase 9 HRD-02.
- `buildBusinessContext()` i18n beyond Korean/English → v1.x.
- `brief-domain-researcher.md` locale coverage beyond Korea/global-en → v1.x.

---

*Discussion log generated: 2026-04-22*
