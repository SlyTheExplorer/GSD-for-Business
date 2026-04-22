# Phase 5: DISCOVER — Parallel Research with Provenance + AUDIENCE + Context Injection — Research

**Researched:** 2026-04-22
**Domain:** Orchestrator-workers parallel spawn + second cross-cutting gate (AUDIENCE) + first cross-cutting reusable primitive (`context-inject.cjs`) + mechanical CI-time enforcement (provenance hook) + Korea-first compliance reference library
**Confidence:** HIGH for template-inheritance, Phase 4 file deltas, regex design, Korea regulatory dates, and inherited primitives; MEDIUM for Claude Code batch-spawn semantics (documented as "synchronous wave", widely corroborated but not an SLA); LOW for LLM-driven AUDIENCE DRIFTED-content variance (treated as expected, tested for decision-shape not verbatim prose)

## Summary

Phase 5 introduces FOUR NEW load-bearing subsystems, none of which are architectural greenfield — every one is a prescribed replication, extension, or mechanical regex over patterns Phase 2/3/4 already shipped. The research value is less in "what library to use" (zero runtime deps remains VERIFIED — `A1` locked) and more in "what is the exact delta between the Phase 4 template and each Phase 5 duplicate, what is the canonical regex set that the provenance hook must grep, what is the stable API of `buildBusinessContext()` that Phase 6/7/8 inherit, and what are the MOST important 1-page primer contents for PIPA 2026 / ISMS-P / MyData 2026."

**The five load-bearing deltas:**

1. **AUDIENCE guard duplicate-rename from ALIGN** — 5 files × mechanical keyword swap + vocabulary extension + baseline-path substitution (`{{OBJECTIVES}}` → `{{ARTIFACT_FRONTMATTER + OBJECTIVES.audience_policy}}`). Target ≤ 400 lines per file per Phase 2 D-18. Template already proven on Phase 4 canary — any deviation forces Phase 7 COMPLIANCE to re-architect.
2. **`context-inject.cjs` as cross-cutting primitive** — ONE function (`buildBusinessContext`) with TWO consumers (spawn-time `<business_context>` block AND AUDIENCE D-10 auto-populated frontmatter). Stable API from day one — Phase 6/7/8 all inherit. Single source of truth for `business_model / region / audience_policy / compliance_packs` extraction.
3. **Wave-based `Task` spawn** — NEW primitive. Spawn up to 4 in one orchestrator message; wait for the batch; spawn next wave. Claude Code's Task tool natively batches (synchronous wave, cap 10 documented); 4 is the Anthropic best-practice lower bound and matches DSC-03. Smoke-test with 2 tasks before committing to 4-wide. Failure semantics: one fail → rest continue; orchestrator tags failed slot `[ASSUMED: researcher-returned-no-output]` and the wave moves on.
4. **Provenance regex + pre-commit hook** — mechanical CI-time gate (CC-04). Regex set: currency+percent+multiplier+explicit market-growth phrasings (both EN and KO). Excludes: dates, article/clause refs, version strings, prose quantifiers. Hook shell (mirrors `brief-validate-commit.sh` shape); opt-in via `hooks.community: true`; structured Korean/English error matching Phase 3 D-12 tone.
5. **Korea compliance reference skeleton** — 3 × 1-page primers in `brief/references/compliance/korea/`. Citable dates are NEW this year: PIPA amendment promulgated **2026-03-10** [VERIFIED: iapp.org|2026-04-22], effective **2026-09-11** [VERIFIED: captaincompliance.com|2026-04-22]; ISMS-P mandatory for designated large-scale controllers from **2027-07-01** [VERIFIED: Chambers 2026|2026-04-22]; MyData expanded to all industries **Feb 2026** with **10 priority sectors** (medical, communications, energy, transportation, education, employment, real estate, welfare, distribution, leisure) [VERIFIED: en.sedaily.com|2026-04-22]. Penalty ceiling **10% of total turnover** [VERIFIED: iapp.org|2026-04-22].

**Primary recommendation:** Plan Phase 5 as 8 atomic commits (matching D-16 suggestion) in wave order: (1) `context-inject.cjs` + tests, (2) `brief-domain-researcher.md` + orchestration, (3) provenance hook + regex fixtures, (4) AUDIENCE duplicate-rename quintet, (5) paired-sibling filename scheme + ALIGN-00 code-path migration (atomic), (6) Korea compliance reference library skeleton, (7) `/brief-discover` body replacing Phase 3 stub, (8) canary E2E + vocabulary-lock + provenance regex tests. **Ship no new user-facing commands** (Surface Cap).

---

<user_constraints>
## User Constraints (from 05-CONTEXT.md)

### Locked Decisions (D-01 .. D-16)

**Area A1 — Researcher Architecture**

- **D-01:** ONE parameterized agent file — `agents/brief-domain-researcher.md`. Parameterized by `{{CATEGORY}}` + `{{BUSINESS_MODEL}}` + `{{REGION}}` + `{{TOPIC}}` at Task-spawn time. Same agent for all 9 defaults AND Custom.
- **D-02:** Wave-based queue for parallel cap of 4. User selects N categories; orchestrator splits into `ceil(N/4)` waves of ≤4 each. Wave i spawns up to 4 `Task` calls in a single message; orchestrator waits for all to return before spawning wave i+1.
- **D-03:** Per-category output files in `.planning/discover/`. Flat structure: `.planning/discover/{category-slug}.md`. One file per category.
- **D-04:** Custom categories use the generic template with user-supplied topic via `{{TOPIC}}`. Zero per-custom prompt engineering.

**Area A2 — Provenance Tag System**

- **D-05:** "Quantitative claim" scope = currency symbols (+ Korean `조억만`), percentages, multipliers (`3x`/`3배`), explicit phrasings (market-size / revenue / growth-rate / CAGR / YoY / MRR / ARR). Excludes dates, article/clause numbers, version strings, page refs, prose quantifiers.
- **D-06:** Pre-commit hook = shell — `hooks/brief-validate-provenance.sh`. Mirrors `brief-validate-commit.sh` shape. Opt-in via `hooks.community: true`.
- **D-07:** Double-layer enforcement — agent-output prompt (`brief-domain-researcher.md` requires tags) + pre-commit hook (grep-verifies at commit time). Defense in depth.
- **D-08:** Confidence bands (ranges) = HARD rule in researcher prompt. Ranges MANDATORY for market-size / growth-rate: `₩4–6T (range from 3 sources, 2025)`, not `₩4.7T`. Point estimates permitted ONLY with single authoritative source AND `[VERIFIED:url|access-date]` tag.

**Area A3 — AUDIENCE Guard (Phase 4 Replica)**

- **D-09:** Literal 3-output preservation from Phase 4 ALIGN shape: `AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content`. 3-path interrupt replicated verbatim: `audience 수정하기 / 이 문서 다시 쓰기 / 현재 상태 승인, 계속 진행 (force-accept)`. force-accept with user-typed justification + audit trail inherited from Phase 4 D-07. `state.brief.last_gate_results.audience` stores `{decision, severity, findings_count, at, override?, override_reason?}`.
- **D-10:** Frontmatter schema = 3 mandatory + 3 auto-populated via context injection. Mandatory: `audience.type`, `audience.confidentiality`, `business_context.model`. Auto-populated: `audience.role`, `voice.tone`, `voice.perspective`.
- **D-11:** Paired-sibling filename scheme — `{artifact}.audience.md`. AUDIENCE output lives next to source artifact. Grep-able by `find -name '*.audience.md'`.
- **D-12:** Phase 4 ALIGN filename migrates atomically within Phase 5 scope. `.planning/ALIGN-00.md` → `.planning/OBJECTIVES.align.md` single commit. 5 code-path updates: `align.cjs`, `align-report.cjs`, `status.cjs`, `commands/brief/define.md`, `brief/workflows/define.md`.

**Area A5 — B2B/B2C Context Injection (CC-02)**

- **D-13:** Orchestrator pre-injects `<business_context>` block into Task prompt. Works identically across Claude Code / Codex / Gemini / OpenCode.
- **D-14:** Reusable helper — `brief/bin/lib/context-inject.cjs`. `buildBusinessContext({ objectivesPath?, statePath? })` reads `.planning/OBJECTIVES.md` + `state.brief.*` + `config.json`, returns formatted block plus 3 auto-populated AUDIENCE frontmatter fields.
- **D-15:** B2B/B2C divergence lives in the researcher agent prompt as conditional blocks. Category-specific guidance co-located with business-model guidance in one prompt file.

**Meta-Discipline**

- **D-16:** "적정선" lock inherited from Phase 3 D-08 / Phase 4 D-10. Planner/executor/verifier resolve implementation-level unknowns themselves; return to CONTEXT only if a gap changes D-01..D-15.

### Claude's Discretion

The planner has flexibility on:

- **A4 — Korea compliance reference library (default design):**
  - **Location:** `brief/references/compliance/korea/` — 3 files: `pipa-2026.md`, `isms-p.md`, `mydata-2026.md`.
  - **Format:** Markdown + YAML frontmatter (region, industry, effective_date, penalty_ceiling, last_reviewed).
  - **Body:** ~400–800 words per primer. Sections: Scope / Key Articles-Clauses / Common Gotchas / Penalties + CEO Liability / Legal Counsel Disclaimer / Sources (URL + access date).
  - **Mandatory disclaimer verbatim:** `> Not legal advice. Refer to qualified Korean counsel before acting on findings.`
  - **Auto-attach:** when `state.brief.compliance_packs` contains "PIPA" / "ISMS-P" / "MyData", orchestrator loads the matching primer(s) as `required_reading` via `context-inject.cjs`.
  - **v1 scope:** skeleton only; clause-level expansion = CC-V2-01.
- Exact regex patterns for D-05 quantitative detection.
- Exact Korean + English 3-path interrupt button wording for AUDIENCE DRIFTED paths.
- `buildBusinessContext()` block format — inline XML, YAML frontmatter, JSON block, or delimited prose. Pick one and use consistently.
- Researcher output file section structure (Summary / Findings / Sources / Provenance Audit, etc.).
- Canary scope — planner decides minimum E2E (recommended: run 2–3 researcher categories in one wave through the full flow).
- Test fixture granularity — 1 file per subsystem vs combined. Coverage ≥ 70% (Phase 2 inherited threshold).
- State allowlist extensions — only if planner finds a need (e.g., `state.brief.discover_wave_status`).
- Internal structure of `brief/bin/lib/audience.cjs` — follow `align.cjs` structure; keep < ~400 lines.
- Commit granularity (suggested 8 atomic commits documented in CONTEXT D-16 Claude's Discretion).

### Deferred Ideas (OUT OF SCOPE)

- Semantic "internal-only language" detection refinement for AUDIENCE DRIFTED-content → Phase 9 HRD-04 pilot.
- Clause-level Korean compliance content → CC-V2-01 (v2).
- Bilingual `.ko.md`/`.en.md` artifact pairs → Phase 8 DELIVER.
- Cross-artifact leakage diff check (Pitfall #5) → Phase 8 DELIVER.
- Web-search MCP integration for researcher agents → DSC-V2-01.
- Customer interview transcript analyzer → DSC-V2-02.
- Researcher failure recovery policy refinement → Phase 9 HRD-04 pilot.
- Provenance tag creative-avoidance ban-list expansion → Phase 9 HRD-04.
- State allowlist extension for new `state.brief.*` fields → only if needed, per Phase 2 D-21.
- `/brief-realign` / `/brief-reaudit` user-facing commands → Phase 9 HRD-02 audit.
- `buildBusinessContext()` i18n beyond Korean / English → v1.x.
- `brief-domain-researcher.md` locale coverage beyond Korea / global-en → v1.x.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSC-01 | User runs `/brief-discover` and is presented with 9 default research categories to multi-select | §AskUserQuestion multi-select protocol (question 9); `/brief-discover` body design replacing Phase 3 stub |
| DSC-02 | User can select "Custom" and add freeform research categories beyond the 9 defaults | §AskUserQuestion "Other" free-text support; D-04 template-reuse for `{{TOPIC}}` |
| DSC-03 | Parallel research output with hard cap at 4 concurrent spawns per Anthropic best practice | §Wave-based `Task` spawn pattern (question 1); smoke-test recipe; batch-synchronization semantics |
| DSC-04 | Every quantitative claim carries `[VERIFIED/ASSUMED/FOUNDER-INPUT]` tag; claims without tag fail the output | §Provenance regex set (question 2); §Double-layer enforcement (D-07); tag format grammar |
| DSC-05 | B2B/B2C context injection on every researcher agent (same "GTM" → different research) | §B2B/B2C 9×2 matrix (question 5); `buildBusinessContext()` API (question 4) |
| DSC-06 | Korea-first compliance reference library skeleton (PIPA / ISMS-P / MyData 1-page primers) | §Korea compliance primer design (question 7) with regulatory dates and penalty ceilings |
| DSC-07 | No quantitative market-data claim without accompanying URL + access date | §Confidence bands formatting (question 6); GOOD vs BAD researcher prompt examples |
| DSG-13 | AUDIENCE guard first wired on research artifacts; validates mandatory frontmatter fields | §AUDIENCE duplicate-rename delta (question 3); §DRIFTED-content deterministic screen keywords (question 8); §D-10 frontmatter schema |
| CC-02 | B2B/B2C context injector on every spawned agent — `business_model`, `region`, `audience_policy` from OBJECTIVES.md | §`buildBusinessContext()` API design (question 4); §Korea-signal auto-attach hook into `context-inject.cjs` |
| CC-04 | Pre-commit hook blocks commits containing untagged quantitative claims | §Pre-commit hook integration (question 10); exact hook content; opt-in config; structured error format |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Directives the planner MUST honor (same authority as locked CONTEXT decisions):

- **Zero external runtime dependencies** for the bin layer [VERIFIED: ASSUMPTIONS.md A1 Phase 1 commit 6, 2026-04-18]. Phase 5 MUST NOT add `gray-matter`, `ajv`, `js-yaml`, `@marp-team/marp-cli`, `zod`, or any package to `dependencies`. Supporting libs invoked via `npx --yes` only.
- **CommonJS-only core** for `.cjs` bin layer. No ESM.
- **Node.js ≥ 22** [CITED: package.json engines].
- **Multi-runtime preservation:** `INSTRUCTION_FILE` env dispatch + `text_mode` fallback for non-AskUserQuestion runtimes (Codex / Gemini / OpenCode). Verified in `brief/workflows/` (8 references) and `brief/bin/lib/core.cjs`/`config.cjs`/`init.cjs` (6 references) [VERIFIED: ASSUMPTIONS.md FND-06 Phase 1].
- **Surface Caps:** ≤ 12 user-facing slash commands, ≤ 8 skills. **Phase 5 NET user-facing command additions MUST be 0.** The `/brief-discover` stub already exists (Phase 3 Plan 05); Phase 5 replaces the body. NO new top-level command like `/brief-audience-check`, `/brief-realign`, `/brief-reaudit` — route as orchestrator-internal or via `brief-tools.cjs audience` subcommand verb.
- **BRIEF Workflow Enforcement:** Direct repo edits on planning artifacts MUST go through a BRIEF command. Research is orchestrator-side only (Phase 5 research produced this file via `/gsd-research-phase` dispatch).
- **Testing:** `node:test` (not Jest), c8 coverage ≥ 70% line threshold.
- **Atomic commits + STATE.md file lock:** preserve. AUDIENCE commit writes candidate + sibling `.audience.md` + STATE.md atomically in one `brief-tools.cjs commit --files` call.
- **Hard fork, NO aliases:** no `gsd-*` residues allowed — e.g., no `gsd-audience-*`, no `gsd-discover-*`, no `gsd-provenance-*` prefixes anywhere in Phase 5 new files.

## Standard Stack

### Core (INHERITED — no additions)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | ≥ 22 | Runtime | BRIEF constraint; already verified [CITED: package.json engines.node, 2026-04-22] |
| CommonJS | — | Module system | BRIEF constraint; preserves fork-layer compatibility |
| `node:test` | built-in | Test runner | Inherited; zero-install |
| `c8` | ^11.0.0 | V8-native coverage | Inherited; 70% line threshold [VERIFIED: .planning/config.json, 2026-04-22] |

### Supporting (NEW — none to dependencies; all inline)

| Artifact | Location | Purpose | When to Use |
|----------|----------|---------|-------------|
| `buildBusinessContext()` | `brief/bin/lib/context-inject.cjs` | One source of truth for `business_model / region / audience_policy / compliance_packs` extraction | Called by EVERY orchestrator workflow that spawns a researcher or gate subagent |
| `hooks/brief-validate-provenance.sh` | `hooks/` | Pre-commit CI-time provenance tag enforcer (CC-04) | Registered as PreToolUse on `git commit`; opt-in via `hooks.community: true` |
| Provenance regex (inline) | `hooks/brief-validate-provenance.sh` + `brief/bin/lib/audience.cjs` (for agent-prompt detection) | Detect quantitative claims that lack a `[VERIFIED/ASSUMED/FOUNDER-INPUT]` tag within a defined line-proximity window | Pre-commit grep + optional LLM-prompt-time nudge |
| Korea compliance skeleton | `brief/references/compliance/korea/*.md` | 1-page primers auto-loaded when `compliance_packs` contains PIPA / ISMS-P / MyData | Required_reading in `brief-domain-researcher.md` when matching pack is declared |

### Alternatives Considered (and rejected)

| Instead of | Could Use | Tradeoff / Why Rejected |
|------------|-----------|-------------------------|
| Inline regex in shell hook | `ajv` / `zod` for structured validation | Violates A1 zero runtime deps. Even for complex shapes, inline check is < 100 lines and sufficient for the closed schema. |
| Shell pre-commit hook | Node.js pre-commit hook | ~200ms Node startup per commit is noticeable and inconsistent with existing `brief-validate-commit.sh` shape [CONTEXT D-06]. |
| LLM-only provenance detection | LLM pass + human review | Violates CC-04 "mechanical CI-time gate" requirement. LLM pass is a complement to regex (agent prompt), never a replacement at commit time. |
| 9 separate researcher agent files | ONE parameterized agent | DRY violation + shared-concern drift risk [CONTEXT D-01 rejection]. Favor template-friendly patterns (Phase 4 D-01 discipline). |
| Nested `.planning/discover/audience/...` directory | Flat paired-sibling | Mental indirection to find gate output; mismatch with ALIGN paired-sibling scheme [CONTEXT D-11 rejection]. |
| Aggregated AUDIENCE log | Per-artifact `.audience.md` sibling | Concurrent-write serialization; muddles per-artifact diff-ability [CONTEXT D-11 rejection]. |

**Installation:** None. Phase 5 adds ZERO package installations [VERIFIED: A1 remains locked].

**Version verification (runtime confirmation):**
```bash
# Verify inherited baseline still holds at Phase 5 entry:
node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"   # must be 0
node --version                                                                           # must be >= 22
npx --yes --version 2>/dev/null || echo "npx present"                                    # present when npm present
```

## Architecture Patterns

### Recommended Project Structure (Phase 5 deltas marked **NEW**)

```
agents/
├── brief-align-gate.md                 # [PHASE 4] template — DO NOT EDIT in Phase 5
├── brief-audience-guard.md             # NEW — duplicate-renamed from brief-align-gate.md
├── brief-domain-researcher.md          # NEW — ONE parameterized researcher (D-01)
└── brief-phase-researcher.md           # [EXISTING] tech-phase researcher — coexists; DIFFERENT OUTPUT SHAPE (D-01 rejection rationale)

brief/workflows/
├── align-gate.md                        # [PHASE 4] template — DO NOT EDIT in Phase 5
├── audience-guard.md                    # NEW — duplicate-renamed
├── discover.md                          # MODIFIED — replaces Phase 3 stub body; preserves block-gate + stale-anchor
└── define.md                            # MODIFIED — ALIGN filename migration path update (D-12)

brief/bin/lib/
├── align.cjs                            # [PHASE 4] — D-12 path update only
├── align-report.cjs                     # [PHASE 4] — D-12 path update only
├── audience.cjs                         # NEW — duplicate-based on align.cjs (D-09/10/11)
├── context-inject.cjs                   # NEW — cross-cutting (D-13/14)
├── status.cjs                           # MODIFIED — formatGate extended to read audience; D-12 path update
└── objectives.cjs                       # [PHASE 3] — READ-ONLY consumer by context-inject.cjs

brief/references/
├── align-vocabulary.md                  # [PHASE 4] template — DO NOT EDIT in Phase 5
├── audience-vocabulary.md               # NEW — duplicate-based
└── compliance/korea/
    ├── pipa-2026.md                     # NEW — Claude's Discretion A4 default
    ├── isms-p.md                        # NEW
    └── mydata-2026.md                   # NEW

hooks/
├── brief-validate-commit.sh             # [EXISTING] template for provenance hook
└── brief-validate-provenance.sh         # NEW — mirrors validate-commit.sh shape

commands/brief/
└── discover.md                          # MODIFIED — body replacement; preserves block-gate + stale-anchor

.planning/
├── OBJECTIVES.align.md                  # RENAMED-TARGET (was ALIGN-00.md — canary has not actually run yet on disk, so this is a CODE-PATH migration)
└── discover/                            # NEW runtime directory, populated by /brief-discover runs
    ├── {category-slug}.md               # e.g., market-sizing.md, competitor-landscape.md
    └── {category-slug}.audience.md      # paired sibling (D-11)
```

**File counts inherited from Phase 4 (line counts at Phase 5 entry):**

| File | Lines | Notes |
|------|-------|-------|
| `agents/brief-align-gate.md` | 263 | [VERIFIED: wc -l, 2026-04-22] |
| `brief/workflows/align-gate.md` | 352 | [VERIFIED: wc -l, 2026-04-22] — target ≤ 400 per Phase 2 D-18 |
| `brief/bin/lib/align.cjs` | 390 | [VERIFIED: wc -l, 2026-04-22] — already near 400 cap |
| `brief/bin/lib/align-report.cjs` | 63 | [VERIFIED: wc -l, 2026-04-22] |
| `brief/references/align-vocabulary.md` | 57 | [VERIFIED: wc -l, 2026-04-22] |
| `hooks/brief-validate-commit.sh` | 48 | [VERIFIED: wc -l, 2026-04-22] — template for provenance hook |

`brief/bin/lib/audience.cjs` target: ≤ 400 lines. Note Phase 4 `align.cjs` hit 390 lines — the duplicate may push close to cap. If audience.cjs exceeds 400 during execution, factor a helper module (e.g., `audience-report.cjs` analogous to `align-report.cjs`) per D-16 planner discretion.

### Pattern 1: Wave-Based Task Spawn (D-02)

**What:** User picks N categories. Orchestrator partitions into `ceil(N/4)` waves of ≤ 4. Each wave is ONE orchestrator message containing up to 4 `Task` tool-use blocks; orchestrator waits for all tasks in the wave to return, then emits the next wave.

**When to use:** Any Phase 5+ orchestrator that fans out to ≥ 2 subagents. Phase 6/7/8 may inherit.

**Claude Code primitive:** When an orchestrator message contains multiple Task blocks, Claude Code batches them — the wave runs in parallel and blocks until all complete [VERIFIED: Anthropic engineering.multi-agent-research-system|2026-04-22; MindStudio / Sulat independent corroboration|2026-04-22]. Official Anthropic guidance: "3-5 subagents in parallel" for typical research; up to 10 concurrent documented; direct comparisons "2-4 subagents".

**Why 4, not 5 / 10:** DSC-03 prescribes 4 as the hard cap. Anthropic's guidance ("3-5 typical") brackets 4; token-spend telemetry (Pitfall #6 performance trap at 6+) supports the lower end. Going higher invites rate-limit + token-spike anti-patterns (PITFALLS.md performance traps).

**Smoke-test recipe (MANDATORY before committing to 4-wide):**
1. Hardcoded 2-task fixture: the orchestrator spawns 2 tasks that each write a file and return the path.
2. Assert both files exist AND the second `Task` block did NOT start before the first finished (check file mtimes relative to orchestrator message timestamp — if either file-write completes >5s later than the wave start, that's single-task serial, not parallel).
3. Only after 2-task smoke passes, scale to 4-task fixture with random-order completion.
4. Phase 5 canary E2E test runs 2–3 real researcher categories in one wave (per CONTEXT A3 canary-scope discretion).

**Example orchestrator message shape (Claude Code):**

```markdown
<!-- brief/workflows/discover.md — Step 5 Wave i spawn -->
<!-- After context-inject.cjs produces <business_context> block, orchestrator writes: -->

I will now spawn {W} researcher tasks in parallel for wave {i} of {total_waves}.

<Task>
  <subagent_type>brief-domain-researcher</subagent_type>
  <prompt>
    <business_context>
      business_model: b2b
      region: kr
      audience_policy: {internal, partner, external}
      compliance_packs: [PIPA, ISMS-P]
    </business_context>

    {{CATEGORY}} = Market Sizing
    {{TOPIC}} = (category default)
    {{OUT_PATH}} = .planning/discover/market-sizing.md

    [full researcher prompt body; see agents/brief-domain-researcher.md]
  </prompt>
</Task>

<Task>
  <subagent_type>brief-domain-researcher</subagent_type>
  <prompt>
    <business_context>...same...</business_context>
    {{CATEGORY}} = Competitor Landscape
    {{TOPIC}} = (category default)
    {{OUT_PATH}} = .planning/discover/competitor-landscape.md
    [researcher body]
  </prompt>
</Task>

<!-- up to 2 more Task blocks in this same message -->
```

**Wave failure semantics:**
- If one task in a wave fails (timeout, malformed output, retry-exhausted): orchestrator logs the failure in the per-category file as a stub with frontmatter `status: researcher_failed` and body `> Researcher returned no output; manual research required. [ASSUMED: auto-stub generated from researcher failure]`. The wave moves on.
- AUDIENCE guard is still invoked on the stub file — the stub has mandatory frontmatter, so AUDIENCE returns `AUDIENCE-OK` with the stub body + a `material` finding noting the auto-stub.
- No auto-retry at wave layer (mirrors Phase 4 D-06 "no auto-retry" discipline). Retry/recovery policy refinement is deferred to Phase 9 HRD-04 per CONTEXT §Deferred Ideas.

### Pattern 2: AUDIENCE Duplicate-Rename Delta from ALIGN (D-09..D-12)

**What:** Phase 5 produces 5 new/modified files by mechanical swap from Phase 4 ALIGN templates. The swap is prescriptive, not creative — any deviation forces Phase 7 COMPLIANCE to re-architect.

**Mechanical swap manifest:**

| Dimension | Phase 4 ALIGN | Phase 5 AUDIENCE |
|-----------|---------------|------------------|
| Gate name token | `ALIGN` | `AUDIENCE` |
| File names (agents) | `brief-align-gate.md` | `brief-audience-guard.md` |
| File names (workflows) | `align-gate.md` | `audience-guard.md` |
| File names (lib) | `align.cjs` | `audience.cjs` |
| File names (reference) | `align-vocabulary.md` | `audience-vocabulary.md` |
| Verdict decision enum | `ALIGNED / DRIFTED-objective-needs-update / DRIFTED-output-needs-revision` | `AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content` |
| Verdict severity enum | `blocking / material / nice-to-have` | SAME — Phase 4 D-04 inherited verbatim |
| State path | `state.brief.last_gate_results.align` | `state.brief.last_gate_results.audience` (forward-declared Phase 2 D-03) |
| Report file scheme | `.planning/ALIGN-00.md` [CURRENT — to be migrated to OBJECTIVES.align.md per D-12] | `{artifact}.audience.md` paired-sibling (D-11) |
| Baseline input | `.planning/OBJECTIVES.md` (full file) | **Two inputs:** `{{ARTIFACT_FRONTMATTER}}` (from candidate) AND `{{OBJECTIVES.audience_policy}}` (from OBJECTIVES.md) |
| Candidate input | `{{CANDIDATE_PATH}}` | `{{ARTIFACT_PATH}}` (semantically same; renamed for clarity) |
| Deterministic screen short-circuits | (b) OBJECTIVES completeness / (a) term overlap / (c) ban-list grep | (b) 3 mandatory frontmatter fields present-and-well-formed / (a) body contains hedging vocabulary when `audience.type: external` / (c) ban-list grep unchanged in shape |
| LLM pass | Required when ambiguous semantic drift | Required when frontmatter well-formed but CONTENT may not match declared audience (DRIFTED-content semantic judgment) |
| Vocabulary ban-list (EN) | `compliant`, `passed`, `violation`, `failed` | SAME **PLUS** extensions for AUDIENCE-specific internal-leak markers (see question 8) |
| Vocabulary ban-list (KO) | `준수`, `통과`, `위반`, `실패` | SAME **PLUS** extensions |
| 3-path interrupt labels (D-06 Phase 4 / D-09 Phase 5) | `objective 수정하기 / 이 output이 틀렸다 / 현재 상태 승인 (force-accept)` | `audience 수정하기 / 이 문서 다시 쓰기 / 현재 상태 승인 (force-accept)` |
| Korea-signal language rule | `detectKoreaSignalFromConfig(cwd)` | SAME — inherit `context-inject.cjs` wrapper over `detectKoreaSignals` + `config.brief.region` |

**Verdict decision mapping (for downstream `formatGate` consumers):**

| Phase 4 ALIGN decision | Phase 5 AUDIENCE decision | When it fires |
|------------------------|---------------------------|---------------|
| `ALIGNED` | `AUDIENCE-OK` | All 3 mandatory frontmatter fields present and well-formed; content consistent with declared audience |
| `DRIFTED-objective-needs-update` | `DRIFTED-frontmatter` | 1+ mandatory frontmatter fields missing or malformed; recovery via inline fix OR `/brief-define --amend` for `business_context.model` conflict |
| `DRIFTED-output-needs-revision` | `DRIFTED-content` | Frontmatter is OK but content contradicts declared audience (e.g., `audience.type: external` with internal-only hedging in body) |

**Decision-derivation rule (mergeVerdicts port from align.cjs):**
- Any `blocking` severity finding → decision ∈ `{DRIFTED-frontmatter, DRIFTED-content}`.
- Decision variant selection: if blocking finding location references frontmatter → `DRIFTED-frontmatter`; else → `DRIFTED-content`.
- All findings `material` or lower → `AUDIENCE-OK` (still emits sibling `.audience.md` with findings for transparency).

### Pattern 3: `buildBusinessContext()` Cross-Cutting Primitive (D-13/14)

**What:** ONE function in `brief/bin/lib/context-inject.cjs` that:
- Reads: `.planning/OBJECTIVES.md` frontmatter + body (via `objectives.readObjectivesMd()`), `.planning/config.json` (via direct `fs.readFileSync` — same pattern as `align.cjs:detectKoreaSignalFromConfig`), `.planning/STATE.md` (via `state.cjs` API).
- Returns: a single object with two consumer-shaped projections.

**API contract (stable; Phase 6/7/8 inherit verbatim):**

```javascript
// brief/bin/lib/context-inject.cjs

/**
 * Build the business_context projection used by two consumers:
 *
 * Consumer 1: spawn-time <business_context> prompt block (D-13)
 *   - Caller: every orchestrator workflow that spawns a researcher / gate subagent
 *   - Consumed as: the exact text to embed in the Task prompt BEFORE subagent-specific
 *     template interpolations
 *
 * Consumer 2: AUDIENCE auto-populated frontmatter (D-10)
 *   - Caller: brief/bin/lib/audience.cjs (and the artifact-write step that seeds
 *             default audience/voice before user edit)
 *   - Consumed as: 3 auto-populated field values (audience.role, voice.tone,
 *     voice.perspective) — user may override inline in the artifact frontmatter
 *
 * @param {Object} opts
 * @param {string} [opts.objectivesPath]  absolute or cwd-relative path; default .planning/OBJECTIVES.md
 * @param {string} [opts.statePath]       absolute or cwd-relative path; default .planning/STATE.md
 * @param {string} [opts.configPath]      absolute or cwd-relative path; default .planning/config.json
 * @param {string} [opts.cwd]             default process.cwd()
 * @returns {Object}
 *   {
 *     // Raw inputs (for test fixtures + consumers that need the underlying values)
 *     business_model: 'b2b' | 'b2c' | 'b2b2c' | 'enterprise' | null,
 *     region: 'kr' | 'us' | 'eu' | null,
 *     audience_policy: { default: string, permitted: string[] } | null,
 *     compliance_packs: string[],          // e.g. ['PIPA', 'ISMS-P']
 *     korea_signal: boolean,               // Korea-signal detected in body OR config
 *     language: 'ko' | 'en',               // derived from korea_signal
 *
 *     // Consumer 1 projection — the exact prompt block (D-13 format locked inline)
 *     promptBlock: string,                 // <business_context>...</business_context>
 *
 *     // Consumer 2 projection — AUDIENCE auto-populated frontmatter (D-10)
 *     audienceDefaults: {
 *       'audience.role':        string,    // e.g., 'planner' | 'investor' | 'partner'
 *       'voice.tone':           string,    // e.g., 'direct' | 'formal' | 'analytical'
 *       'voice.perspective':    string,    // e.g., 'first-person-plural' | 'third-person'
 *     },
 *
 *     // Auto-attach payload — lists of required_reading files for matching compliance_packs
 *     requiredReading: string[],            // e.g. ['brief/references/compliance/korea/pipa-2026.md', ...]
 *   }
 */
function buildBusinessContext(opts = {}) { /* implementation */ }

module.exports = { buildBusinessContext };
```

**Prompt block format (pick ONE — RECOMMENDATION: inline XML for Claude-Code-native delimiter consistency with Phase 4 `<candidate>` / `<baseline>` pattern):**

```xml
<business_context>
  <business_model>b2b</business_model>
  <region>kr</region>
  <language>ko</language>
  <audience_policy>
    <default>internal</default>
    <permitted>internal, partner, external</permitted>
  </audience_policy>
  <compliance_packs>
    <pack>PIPA</pack>
    <pack>ISMS-P</pack>
  </compliance_packs>
  <required_reading>
    <file>brief/references/compliance/korea/pipa-2026.md</file>
    <file>brief/references/compliance/korea/isms-p.md</file>
  </required_reading>
</business_context>
```

**Rationale for XML over YAML/JSON/delimited-prose:**
- Consistency with Phase 4 `<candidate>` / `<baseline>` delimiter pattern in `agents/brief-align-gate.md` — same prompt-injection discipline (T-04-07).
- Claude Code treats `<tag>...</tag>` as semantic delimiters natively.
- Cross-runtime identical rendering (Codex/Gemini/OpenCode also treat XML-style tags as prompt delimiters per LCD surface).
- Easy to test via regex assertion (`/<business_context>[\s\S]+?<\/business_context>/`).

**Example output — Korea/B2B/fintech project with compliance_packs: [PIPA, ISMS-P]:**

```xml
<business_context>
  <business_model>b2b</business_model>
  <region>kr</region>
  <language>ko</language>
  <audience_policy>
    <default>internal</default>
    <permitted>internal, partner, external</permitted>
  </audience_policy>
  <compliance_packs>
    <pack>PIPA</pack>
    <pack>ISMS-P</pack>
  </compliance_packs>
  <required_reading>
    <file>brief/references/compliance/korea/pipa-2026.md</file>
    <file>brief/references/compliance/korea/isms-p.md</file>
  </required_reading>
</business_context>
```

**Example output — Global/B2C/consumer-app project with compliance_packs: []:**

```xml
<business_context>
  <business_model>b2c</business_model>
  <region>us</region>
  <language>en</language>
  <audience_policy>
    <default>internal</default>
    <permitted>internal, external, public</permitted>
  </audience_policy>
  <compliance_packs/>
  <required_reading/>
</business_context>
```

**AUDIENCE audienceDefaults derivation rules:**

| Input | audience.role default | voice.tone default | voice.perspective default |
|-------|----------------------|--------------------|--------------------------|
| `business_model: b2b` + `region: kr` | `planner` | `formal` (존댓말 하십시오체) | `first-person-plural` |
| `business_model: b2b` + `region: non-kr` | `planner` | `formal` | `first-person-plural` |
| `business_model: b2c` + `region: kr` | `planner` | `direct` (해요체 OK internal; 하십시오체 external) | `first-person-plural` |
| `business_model: b2c` + `region: non-kr` | `planner` | `direct` | `first-person-plural` |
| `business_model: enterprise` | `planner` | `formal` | `third-person` |
| `business_model: b2b2c` | `planner` | `direct` | `first-person-plural` |

**Stability guarantee (inherited Phase 6/7/8):**
- Return shape is FROZEN. Additive fields are OK (e.g., Phase 6 may add `return_stack_depth`); removing or renaming existing fields is a BREAKING change.
- Document API stability contract inline at the top of `context-inject.cjs` with `@stability: STABLE` JSDoc marker.

### Pattern 4: Provenance Regex + Pre-Commit Hook (D-05..D-07)

**What:** Mechanical CI-time grep. For each staged file that is NOT in an allowlisted path (`brief/references/compliance/**`, `brief/references/*-vocabulary.md`, `.planning/research/**`), find every quantitative-claim pattern. For each hit, check for a provenance tag `[VERIFIED:*|*]` / `[ASSUMED:*]` / `[FOUNDER-INPUT]` within a line-proximity window. If any hit lacks a nearby tag, block the commit with a structured Korean/English error.

**Canonical regex set (EN + KO):**

```bash
# hooks/brief-validate-provenance.sh fragment — to inline inside the hook
# Patterns are OR'd; any match = "quantitative claim detected"

# ─── INCLUDE patterns (detect) ────────────────────────────────────────────────
# (1) Currency symbols + abbreviations (EN + KO)
PATTERN_CURRENCY='(₩|\$|€|¥)[[:space:]]*[0-9][0-9,.]*[[:space:]]*([BMKbmk]|조|억|만|십억|천억|조원|억원|만원)?'

# (2) Percentages (numeric + optional Korean prefix)
# Matches: 23%, 23.4%, 1.5%, 성장률 23%, etc.
PATTERN_PERCENT='[0-9][0-9,.]*[[:space:]]*%'

# (3) Multipliers
# Matches: 3x, 10x, 3배, 10배
PATTERN_MULTIPLIER='[0-9][0-9,.]*[[:space:]]*([xX]\b|배)'

# (4) Explicit phrasings — market-size / revenue / growth-rate / CAGR / YoY / MRR / ARR
PATTERN_PHRASING_EN='\b(market[[:space:]]*size|TAM|SAM|SOM|revenue|growth[[:space:]]*rate|CAGR|YoY|QoQ|MoM|MRR|ARR|ACV|LTV|CAC|NPS|DAU|MAU)\b'
PATTERN_PHRASING_KO='(시장[[:space:]]*규모|매출|성장률|연평균[[:space:]]*성장률|전년[[:space:]]*대비|월간[[:space:]]*활성[[:space:]]*사용자)'

# ─── EXCLUDE patterns (ignore — NOT quantitative claims) ──────────────────────
# (1) Dates (YYYY alone, or YYYY-MM-DD, or YYYY년 Korean)
EXCLUDE_DATE='\b(19|20)[0-9]{2}(\b|[-/년])'

# (2) Article / clause numbers (EN + KO)
EXCLUDE_ARTICLE='\b(Article|Section|§)[[:space:]]*[0-9]+\b'
EXCLUDE_ARTICLE_KO='제[[:space:]]*[0-9]+[[:space:]]*(조|항|호|절)'

# (3) Version strings
EXCLUDE_VERSION='\b[vV][0-9]+(\.[0-9]+)*\b'

# (4) Page / line references
EXCLUDE_PAGE='\b(page|p\.|line|L\.)[[:space:]]*[0-9]+\b'

# (5) Prose quantifiers — English
EXCLUDE_PROSE_EN='\b(first|second|third|fourth|fifth|one|two|three|four|five|six|seven|eight|nine|ten)[[:space:]]+(quarter|principle|principles|year|years|reason|reasons|step|steps|phase|phases|item|items|wave|waves|example|examples)\b'

# (6) Prose quantifiers — Korean (pure-Korean ordinal/prose numbers)
EXCLUDE_PROSE_KO='(첫|둘째|셋째|넷째|다섯째|첫째|두|세|네|다섯|여섯|일곱|여덟|아홉|열)[[:space:]]*(가지|번째|원칙|단계|항목|분기|년|년도)'

# (7) Plan IDs, Plan numbers, task numbers (internal references)
EXCLUDE_PLAN='\b(Plan|Task|Cycle|W-|T-|D-)[[:space:]]*[0-9]+\b'

# ─── Provenance tag patterns (acceptable near any include-hit) ────────────────
# VERIFIED tag requires BOTH source and date per DSC-07
TAG_VERIFIED='\[VERIFIED:[^\]|]+\|[0-9]{4}-[0-9]{2}-[0-9]{2}\]'
TAG_ASSUMED='\[ASSUMED:[^\]]+\]'
TAG_FOUNDER='\[FOUNDER-INPUT\]'

# Proximity window: tag must appear on the same line OR within ±2 lines of the hit.
```

**Proximity window design rationale:**
- Same-line tag is the canonical shape (`₩4-6T [VERIFIED:kisa.or.kr/xxx|2026-04-22]`).
- ±2 lines handles markdown list items where the tag lands on the following line for readability:
  ```markdown
  - **Korean fintech TAM:** ₩4–6T (range from 3 sources, 2025)
    [VERIFIED:practiceguides.chambers.com|2026-04-22]
  ```
- Wider windows (±5 or paragraph-level) risk false-green: a VERIFIED tag on a later unrelated claim could shelter an untagged nearby claim.

**Allowlisted paths (exempt from provenance check):**
- `brief/references/compliance/**` — primer files describe regulation penalties (`10% of turnover`); the primer ITSELF is citation-dense and not a researcher output subject to the same gate.
- `brief/references/*-vocabulary.md` — ban-list references may include example forbidden-token text that trips the regex.
- `.planning/research/**` — this research itself is tagged; no double-meta-check.
- `tests/fixtures/**` — test fixtures deliberately include untagged claims as negative cases.

**Positive + negative fixture design (tests/fixtures/):**

```
tests/fixtures/provenance/
├── valid-en.md                     # should PASS: every claim has [VERIFIED|ASSUMED|FOUNDER-INPUT]
├── valid-ko.md                     # should PASS: Korean claims with tags
├── valid-mixed-proximity.md        # tag on same line and ±1 line
├── invalid-untagged-currency.md    # should FAIL: "$5B market" with no tag
├── invalid-untagged-percent.md     # should FAIL: "growing 23% YoY" with no tag
├── invalid-untagged-korean.md      # should FAIL: "₩4조 규모" with no tag
├── false-positive-date.md          # should PASS: contains "2026" and other year-only mentions
├── false-positive-article.md       # should PASS: contains "Article 30", "제15조"
├── false-positive-version.md       # should PASS: contains "v1.2", "Python 3.11"
├── false-positive-prose-en.md      # should PASS: "three principles", "first quarter"
├── false-positive-prose-ko.md      # should PASS: "세 가지 원칙", "두 번째 분기"
├── false-positive-plan-id.md       # should PASS: "Plan 04", "Task 3", "D-15"
└── edge-malformed-tag.md           # should FAIL: "[VERIFIED:missing-date]" (no date)
```

**Hook test fixture (tests/brief-provenance-hook.test.cjs):**

```javascript
const { test } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const path = require('node:path');

function runHook(fixturePath) {
  const input = JSON.stringify({
    tool_input: { command: `git commit -m 'test: fixture'` },
  });
  // Simulate staged file via GIT_INDEX_FILE or direct hook invocation
  // with the fixture as the staged diff source.
  try {
    const out = execSync(
      `cat <<EOF | bash hooks/brief-validate-provenance.sh\n${input}\nEOF`,
      { cwd: process.cwd(), encoding: 'utf-8' },
    );
    return { exit: 0, output: out };
  } catch (err) {
    return { exit: err.status, output: err.stdout + err.stderr };
  }
}

test('valid-en.md passes', () => {
  const r = runHook('tests/fixtures/provenance/valid-en.md');
  assert.equal(r.exit, 0);
});

test('invalid-untagged-currency.md blocks', () => {
  const r = runHook('tests/fixtures/provenance/invalid-untagged-currency.md');
  assert.equal(r.exit, 2);
  assert.match(r.output, /provenance[\s\S]*tag/i);
});

test('false-positive-date.md passes (year 2026 is not a claim)', () => {
  const r = runHook('tests/fixtures/provenance/false-positive-date.md');
  assert.equal(r.exit, 0);
});

// ... one test per fixture
```

### Anti-Patterns to Avoid

- **Hook-spawned AUDIENCE gate.** Explicitly forbidden by PITFALLS.md Anti-pattern #2. AUDIENCE MUST be invoked as an explicit orchestrator step in `brief/workflows/discover.md` (same as ALIGN in `brief/workflows/define.md`). NO `PostToolUse` / `SubagentStop` hook auto-attach.
- **Adding `gray-matter` / `ajv` / `js-yaml` to `dependencies`.** Violates A1. Use inline parsing (Phase 2 D-12/D-20 pattern extended `frontmatter.cjs`); for `<business_context>` block, string concatenation + template literals suffice.
- **Binary PASS/FAIL verdict in AUDIENCE.** Breaks template uniformity; forces Phase 7 COMPLIANCE to invent new shape [CONTEXT D-09 rejection].
- **ONE aggregated AUDIENCE log file.** Concurrent-write serialization in Phase 5's 4-wide wave → file lock contention. Per-artifact paired-sibling is the load-bearing design choice [CONTEXT D-11].
- **Agent reads `state.brief.*` at spawn time.** Couples every new agent to parsing logic; risks inconsistency [CONTEXT D-13 rejection]. Orchestrator injects via `<business_context>` block.
- **Adding `/brief-audience-check`, `/brief-realign`, `/brief-reaudit`, or any new top-level command.** Violates Surface Cap (D-06..D-09 Phase 2). AUDIENCE is orchestrator-internal + `brief-tools.cjs audience` subcommand only.
- **Per-custom prompt engineering.** CONTEXT D-04: Custom categories use the generic template via `{{TOPIC}}`. Zero per-custom customization. Degenerate topics ("stuff", "research things") are handled by the generic template's fallback ("describe the research question more specifically") — test fixture required.
- **"Compliant" / green-checkmark vocabulary.** Inherited ban-list from Phase 4 ALIGN (Pitfall #4). Extended in Phase 5 with AUDIENCE-specific tokens (see question 8).
- **Nested `.planning/discover/audience/` subfolder.** Mismatch with ALIGN paired-sibling model [CONTEXT D-11 rejection].
- **Skipping the 2-task smoke test before committing to 4-wide.** HIGH flag in CONTEXT code_context Risk Notes. Fallback if 2-task spawn semantics differ from expected: sequential execution with warning, but DSC-03 degrades.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter parse/serialize | Custom YAML parser | `brief/bin/lib/frontmatter.cjs` (Phase 2 D-20 extended — round-trips nested maps, null, arrays-of-objects) | Already proven on AUDIENCE 6-field schema shape; no gaps |
| Korea-signal detection | Duplicate regex list in `context-inject.cjs` | `detectKoreaSignals(text)` from `brief/bin/lib/define.cjs` + `detectKoreaSignalFromConfig(cwd)` from `brief/bin/lib/align.cjs` | Already tested; Phase 3 D-11 proven. Wrap both in `context-inject.cjs`, don't re-implement |
| STATE.md atomic write | Custom file-lock + write + commit | `readModifyWriteStateMd()` from `brief/bin/lib/state.cjs` | Phase 2 D-21 extended for `brief.*` namespace; verified A4 round-trip |
| Validate verdict shape | New validator | `validateVerdict()` from `align.cjs` — adapt enum constants `VALID_DECISIONS` / `VALID_SEVERITIES` for AUDIENCE variant | DRY + identical error-reporting shape |
| Ban-list grep | New regex grepper | `grepBanList()` from `align.cjs` — pass AUDIENCE-specific regex sets | Same file-iteration contract + line-tagging output |
| Command-message validation | New shell validator | `hooks/brief-validate-commit.sh` structure — copy + swap checks | Proven shape; same opt-in config gate (`hooks.community: true`) |
| OBJECTIVES.md completeness check | New validator | `validateObjectivesComplete()` from `objectives.cjs` | AUDIENCE doesn't re-check OBJECTIVES completeness; it reads `audience_policy` assuming completeness (ALIGN gate runs first, earlier in Phase 4 canary) |
| Path-traversal guard | Custom resolver | `_resolveSafePath()` pattern from `align.cjs` lines 303-323 | Already canonicalizes realpath + tolerates missing files + raises sanitized errors |
| Sanitization of user-typed override reason | New sanitizer | `sanitizeForPrompt()` from `brief/bin/lib/security.cjs` | Phase 4 T-04-02 precedent; same threat model |
| Init JSON consumption | New op | Reuse `init phase-op 5` (already works); optionally add `init discover-op` if context shape differs materially | Phase 2 D-18 + Phase 3 precedent; avoid op proliferation |

**Key insight:** Phase 5's research value is low on "what library to use" (everything reuses inherited primitives) and high on "what is the exact delta / regex / prompt prose / primer content." The planner's job is assembly, not invention.

## Runtime State Inventory

**Not applicable.** Phase 5 is a greenfield capability build (researcher orchestration + AUDIENCE gate + provenance hook + Korea primers + context-inject lib). No rename/refactor/migration scope EXCEPT the D-12 ALIGN filename migration, which is addressed below.

### D-12 ALIGN filename migration — code-path only (no on-disk data migration)

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data (files on disk) | `.planning/ALIGN-00.md` — **DOES NOT EXIST on disk at Phase 5 entry** [VERIFIED: `ls .planning/ALIGN-00.md` → No such file, 2026-04-22]. The Phase 4 canary E2E run has not been executed; only tests have generated `ALIGN-00.md` under tmpdirs. | None on disk. Code-path-only migration. |
| Code-path references to `ALIGN-00.md` | 7 files contain the string [VERIFIED: grep output, 2026-04-22]: `brief/bin/brief-tools.cjs:547`, `brief/bin/lib/align.cjs:326,344`, `brief/bin/lib/align-report.cjs:2`, `brief/references/align-vocabulary.md:32`, `brief/workflows/align-gate.md` (18 occurrences on lines 5, 37, 155, 163, 170, 179, 203, 214, 223, 246, 251, 261, 283, 293), `brief/workflows/define.md:389,408`, `agents/brief-align-gate.md:98` | Update each reference in a single atomic commit: `ALIGN-00.md` → `OBJECTIVES.align.md` |
| Live service config | None — BRIEF is file-and-prompt only; no n8n / Datadog / Tailscale / Windows Task Scheduler etc. | None |
| OS-registered state | None | None |
| Secrets/env vars | None — no env var names reference `ALIGN-00` | None |
| Build artifacts / installed packages | None — no egg-info / compiled artifacts cache the string | None |

**Grep recipe (planner verification step before commit):**
```bash
# Should return 0 after migration commit:
grep -rn "ALIGN-00" brief/ agents/ commands/brief/ hooks/ 2>/dev/null | wc -l
```

**Paired-sibling scheme means:**
- ALIGN output moves from `.planning/ALIGN-00.md` → `.planning/OBJECTIVES.align.md` (paired sibling of `.planning/OBJECTIVES.md`).
- AUDIENCE output lives at `.planning/discover/{category}.audience.md` (paired sibling of `.planning/discover/{category}.md`).
- Phase 7 COMPLIANCE will live at `.planning/{workstream-dir}/{artifact}.compliance.md` (paired sibling of the artifact).

## Common Pitfalls

### Pitfall 1: AUDIENCE verdict schema drift from ALIGN shape

**What goes wrong:** Planner, while copying `align.cjs` → `audience.cjs`, "improves" one of the enum names (e.g., `DRIFTED-frontmatter-stale` instead of `DRIFTED-frontmatter`, or adds a fourth decision `NEEDS-REVIEW`).

**Why it happens:** Engineers see opportunity to refine vocabulary mid-duplicate. CONTEXT §A3 HIGH LEVERAGE warning is easy to miss when inside the mechanical swap.

**How to avoid:** The `audience-report.cjs` rendering test MUST assert the verdict shape matches `{decision, severity, findings_count, at, override?, override_reason?}` with `decision` strictly in `{AUDIENCE-OK, DRIFTED-frontmatter, DRIFTED-content}` — string-literal-equal. No enum extension without a CONTEXT reopen.

**Warning signs:** `audience.cjs` has a `VALID_DECISIONS` set with ≠3 elements; `/brief-status` renders decisions that don't match; vocabulary-lock test passes on a decision the planner introduced.

### Pitfall 2: Wave-spawn actually running sequentially

**What goes wrong:** Orchestrator writes 4 `Task` blocks but Claude Code's execution semantics cause them to serialize (e.g., `Task` 2 starts only after `Task` 1 completes). User sees 4× wall-clock time, DSC-03 goal missed.

**Why it happens:** Multiple public reports note "Claude thinks it spawns agents in parallel, but it doesn't" in certain runtime configurations [CITED: github.com/anthropics/claude-code/issues/7406|2026-04-22]. Batch parallelism is documented as synchronous-wave but individual deployments vary.

**How to avoid:**
1. Smoke-test with 2 dummy tasks BEFORE writing the full 4-wide path. Assert wall-clock of two tasks running in parallel is < (sum of their individual wall-clocks × 0.9) — if spawn is serialized, ratio approaches 1.0.
2. If smoke fails, planner halts and escalates to CONTEXT amendment: "parallel spawn pattern fails — revise to 4 sequential with progress indicator?" (keeps DSC-01/02/04/05/07 working; loses only DSC-03's "no more than 4 concurrent" language in practice since 1 ≤ 4).
3. Document the verified behavior in `.planning/ASSUMPTIONS.md` A8 (NEW) after smoke passes.

**Warning signs:** Canary E2E test for 2 researchers takes ~ 2 × single-researcher time (should be ~ 1 ×). Telemetry in `/brief-status` shows linear scaling with category count.

### Pitfall 3: Provenance regex false-positives create commit friction

**What goes wrong:** Hook blocks legitimate commits because a prose "three principles" or an article citation "제15조" trips the regex; user force-pushes past the hook or disables `hooks.community` to unblock work.

**Why it happens:** Regex tuning is iterative. Shipping an overly-eager regex is worse than shipping a slightly-permissive one, because user disables the whole gate.

**How to avoid:**
- The EXCLUDE patterns above (PATTERN_EXCLUDE_* prefixed) are load-bearing. Add fixtures for EVERY known false-positive shape BEFORE the hook lands.
- Error message MUST tell user the exact snippet + the one-command fix (mirrors Phase 3 D-12 recovery-oriented tone).
- Provide a planner-facing escape: if a false-positive is provably prose, user adds an inline HTML comment tag: `<!-- brief-provenance: allow -->` on the line that would trip. Document in error message.
- Iterative ban-list discipline (same as Phase 4 ALIGN): record false-positives as Phase 9 HRD-04 pilot feedback; extend regex iteratively.

**Warning signs:** False-positive rate > 2 per 100 lines of research output. Users disabling `hooks.community: true` in their `config.json`.

### Pitfall 4: `buildBusinessContext()` re-implemented inline in 5 workflows

**What goes wrong:** Planner, following CONTEXT D-13 ("orchestrator pre-injects `<business_context>` block"), writes the block construction inline in each workflow markdown file. The 5 callsites drift (one forgets compliance_packs; another hardcodes region).

**Why it happens:** Markdown workflows feel like "just prompt templates"; the instinct to inline the parsing call is strong.

**How to avoid:** CONTEXT D-14 explicitly mandates a single helper file `brief/bin/lib/context-inject.cjs`. Workflow markdown invokes it via `brief-tools.cjs` subcommand (e.g., `brief-tools.cjs context-block --for discover`) OR via direct Node.js require at workflow-script-execution time. Either way, ONE lib file is the source of truth. Test fixture MUST exercise both consumers (prompt-block + audienceDefaults) AND assert identical underlying values when called from different workflows.

**Warning signs:** Multiple workflow markdown files contain a `business_context` XML block by hand. Test fixtures for Phase 6/7/8 start failing because they load OBJECTIVES.md differently.

### Pitfall 5: AUDIENCE DRIFTED-content over-fires on creative-but-valid external writing

**What goes wrong:** A planner writes an external-audience investor-IR page with confident claims that don't read as "hedging" (no TBD, no "we believe") but the LLM pass still flags `DRIFTED-content` because of creative phrasings like "아직 증명되지 않은 가설을 검증 중" in a section describing what's been tested.

**Why it happens:** Semantic judgment is LLM-variance-heavy. Same pattern as Phase 4 ALIGN `DRIFTED-output-needs-revision` — tested for decision category and severity, not verbatim prose.

**How to avoid:** Hybrid deterministic-screen + LLM-pass (same as Phase 4 D-03). Deterministic screen catches obvious cases (keyword list below, question 8); LLM pass handles semantic cases and gets to say `nice-to-have` on creative-but-valid prose (force-accept path remains available for genuine disagreements). Decision category is what's tested; specific wording of findings is tolerant.

**Warning signs:** User force-accepts AUDIENCE DRIFTED-content > 3 times per Phase 5 canary run. The same legitimate phrasing repeatedly gets flagged across artifacts.

### Pitfall 6: Korea compliance primer goes over-depth and drifts toward legal advice

**What goes wrong:** Planner enthusiastically writes a 3000-word PIPA primer with clause-level cross-references, specific enforcement case studies, CEO-liability decision trees. Users mistake it for legal advice.

**Why it happens:** Pitfall #4 (compliance checkbox theater) is easy to invert into compliance-handbook theater. The 1-page constraint is easy to breach.

**How to avoid:**
- HARD cap of 400–800 words per primer (CONTEXT Claude's Discretion A4 default).
- MANDATORY verbatim disclaimer on every primer: `> Not legal advice. Refer to qualified Korean counsel before acting on findings.`
- Sources section MUST cite URL + access date (mirror DSC-07 format).
- v2 (CC-V2-01) is for clause-level. Planner MUST NOT preempt.
- Primer review checklist: no sentence begins with "You must" / "You are required to" — use "The PIPA amendment establishes..." / "ISMS-P certification is mandatory for designated large-scale controllers from 2027-07-01 [CITED: ...]".

**Warning signs:** Primer exceeds 800 words. Planner adds a section titled "What to do about it". Disclaimer moved to footer.

## Code Examples

Verified patterns from official sources and inherited Phase 4 templates.

### Example 1: `buildBusinessContext()` skeleton (D-14 implementation starter)

```javascript
// brief/bin/lib/context-inject.cjs
// [VERIFIED: pattern inherited from brief/bin/lib/align.cjs:87 detectKoreaSignalFromConfig]
// [VERIFIED: pattern inherited from brief/bin/lib/objectives.cjs:181 readObjectivesMd]

/**
 * buildBusinessContext — cross-cutting primitive (D-14).
 *
 * @stability: STABLE as of Phase 5. Additive-only changes. Phase 6/7/8 inherit.
 */
const fs = require('fs');
const path = require('path');
const { planningDir, planningPaths } = require('./core.cjs');
const objectives = require('./objectives.cjs');
const { detectKoreaSignals } = require('./define.cjs');

const PROMPT_BLOCK_TEMPLATE = (ctx) => `<business_context>
  <business_model>${ctx.business_model || ''}</business_model>
  <region>${ctx.region || ''}</region>
  <language>${ctx.language}</language>
  <audience_policy>
    <default>${ctx.audience_policy?.default || 'internal'}</default>
    <permitted>${(ctx.audience_policy?.permitted || []).join(', ')}</permitted>
  </audience_policy>
  <compliance_packs>
${(ctx.compliance_packs || []).map(p => `    <pack>${p}</pack>`).join('\n') || '    <!-- none -->'}
  </compliance_packs>
  <required_reading>
${(ctx.requiredReading || []).map(f => `    <file>${f}</file>`).join('\n') || '    <!-- none -->'}
  </required_reading>
</business_context>`;

const COMPLIANCE_PACK_TO_REFERENCE = Object.freeze({
  'PIPA': 'brief/references/compliance/korea/pipa-2026.md',
  'ISMS-P': 'brief/references/compliance/korea/isms-p.md',
  'MyData': 'brief/references/compliance/korea/mydata-2026.md',
  // Global packs to be added in Phase 7
});

function readConfigBrief(cwd) {
  const configPath = path.join(planningDir(cwd), 'config.json');
  if (!fs.existsSync(configPath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return (parsed && parsed.brief) || {};
  } catch {
    return {};
  }
}

function deriveAudienceDefaults(business_model, region) {
  // See Pattern 3 derivation table
  const bm = (business_model || '').toLowerCase();
  const isKr = region === 'kr';
  if (bm === 'enterprise') {
    return {
      'audience.role': 'planner',
      'voice.tone': 'formal',
      'voice.perspective': 'third-person',
    };
  }
  if (bm === 'b2c') {
    return {
      'audience.role': 'planner',
      'voice.tone': 'direct',
      'voice.perspective': 'first-person-plural',
    };
  }
  // b2b, b2b2c, default
  return {
    'audience.role': 'planner',
    'voice.tone': 'formal',
    'voice.perspective': 'first-person-plural',
  };
}

function buildBusinessContext(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const briefConfig = readConfigBrief(cwd);
  const { body: objBody } = objectives.readObjectivesMd(cwd);

  const business_model = briefConfig.business_model || null;
  const region = briefConfig.region || null;
  const audience_policy = briefConfig.audience_policy || null;
  const compliance_packs = Array.isArray(briefConfig.compliance_packs)
    ? briefConfig.compliance_packs
    : [];

  // Korea-signal wraps config + body heuristics
  const korea_signal = region === 'kr' || detectKoreaSignals(objBody || '');
  const language = korea_signal ? 'ko' : 'en';

  // Required-reading auto-attach (Claude's Discretion A4 default)
  const requiredReading = compliance_packs
    .map((p) => COMPLIANCE_PACK_TO_REFERENCE[p])
    .filter(Boolean);

  const ctx = {
    business_model,
    region,
    audience_policy,
    compliance_packs,
    korea_signal,
    language,
    requiredReading,
  };
  ctx.promptBlock = PROMPT_BLOCK_TEMPLATE(ctx);
  ctx.audienceDefaults = deriveAudienceDefaults(business_model, region);
  return ctx;
}

module.exports = { buildBusinessContext };
```

### Example 2: Pre-commit hook skeleton (D-06 implementation starter)

```bash
#!/bin/bash
# hooks/brief-validate-provenance.sh — PreToolUse hook: enforce provenance tags
# Blocks git commit commands that introduce quantitative claims without a
# [VERIFIED/ASSUMED/FOUNDER-INPUT] tag within ±2 lines.
#
# OPT-IN: no-op unless config.json has hooks.community: true.
# Mirrors hooks/brief-validate-commit.sh shape + opt-in config gate.

# ─── Opt-in config check ──────────────────────────────────────────────────────
if [ -f .planning/config.json ]; then
  ENABLED=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.hooks?.community===true?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)
  if [ "$ENABLED" != "1" ]; then exit 0; fi
else
  exit 0
fi

INPUT=$(cat)

# Extract command; only run on git commit
CMD=$(echo "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{process.stdout.write(JSON.parse(d).tool_input?.command||'')}catch{}})" 2>/dev/null)

if [[ ! "$CMD" =~ ^git[[:space:]]+commit ]]; then
  exit 0
fi

# ─── Enumerate staged files (additions + modifications only) ──────────────────
STAGED_FILES=$(git diff --cached --name-only --diff-filter=AM 2>/dev/null || true)
if [ -z "$STAGED_FILES" ]; then exit 0; fi

# ─── Allowlist paths (skip provenance check) ──────────────────────────────────
ALLOWLIST_REGEX='^(brief/references/compliance/|brief/references/.*-vocabulary\.md|\.planning/research/|tests/fixtures/)'

# ─── Core regex patterns ──────────────────────────────────────────────────────
INCLUDE_PATTERN='(₩|\$|€|¥)[[:space:]]*[0-9][0-9,.]*|[0-9][0-9,.]*[[:space:]]*%|[0-9][0-9,.]*[[:space:]]*([xX]\b|배)|(시장[[:space:]]*규모|매출|성장률|CAGR|YoY|QoQ|MoM|MRR|ARR|market[[:space:]]*size|TAM|SAM|SOM|revenue|growth[[:space:]]*rate)'

EXCLUDE_PATTERN='\b(19|20)[0-9]{2}\b|\b(Article|Section|§)[[:space:]]*[0-9]+\b|제[[:space:]]*[0-9]+[[:space:]]*(조|항|호|절)|\b[vV][0-9]+(\.[0-9]+)*\b|\b(page|p\.|line|L\.)[[:space:]]*[0-9]+\b|\b(first|second|third|one|two|three)[[:space:]]+(quarter|principle|year|reason|step|phase|item|wave|example)|\b(Plan|Task|Cycle|W-|T-|D-)[[:space:]]*[0-9]+'

TAG_PATTERN='\[VERIFIED:[^\]|]+\|[0-9]{4}-[0-9]{2}-[0-9]{2}\]|\[ASSUMED:[^\]]+\]|\[FOUNDER-INPUT\]|<!--[[:space:]]*brief-provenance:[[:space:]]*allow[[:space:]]*-->'

# ─── Per-file scan ────────────────────────────────────────────────────────────
VIOLATIONS=""
for F in $STAGED_FILES; do
  [[ "$F" =~ $ALLOWLIST_REGEX ]] && continue
  [[ ! "$F" =~ \.(md|txt)$ ]] && continue  # only markdown/text artifacts
  [[ ! -f "$F" ]] && continue

  # Find candidate hit lines (with include pattern AND NOT exclude pattern)
  CANDIDATES=$(awk -v IN="$INCLUDE_PATTERN" -v EX="$EXCLUDE_PATTERN" '
    {
      if ($0 ~ IN && $0 !~ EX) print NR ":" $0
    }
  ' "$F")

  [ -z "$CANDIDATES" ] && continue

  # For each candidate, check for tag within ±2 lines
  while IFS= read -r HIT; do
    LNO=$(echo "$HIT" | cut -d: -f1)
    START=$((LNO - 2)); [ $START -lt 1 ] && START=1
    END=$((LNO + 2))
    WINDOW=$(sed -n "${START},${END}p" "$F")
    if ! echo "$WINDOW" | grep -qE "$TAG_PATTERN"; then
      VIOLATIONS="${VIOLATIONS}${F}:${LNO}: $(echo "$HIT" | cut -d: -f2-)"$'\n'
    fi
  done <<< "$CANDIDATES"
done

if [ -n "$VIOLATIONS" ]; then
  # Korea-signal bilingual error (mirrors Phase 3 D-12 tone)
  KOREA=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.brief?.region==='kr'?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)

  if [ "$KOREA" = "1" ]; then
    REASON="⚠ 커밋이 차단되었습니다. 정량적 주장에 출처 태그가 없습니다.

다음 줄에 [VERIFIED:url|YYYY-MM-DD], [ASSUMED:rationale], 또는 [FOUNDER-INPUT] 태그를 추가해 주세요:
${VIOLATIONS}
필요하다면 같은 줄에 <!-- brief-provenance: allow --> 주석을 추가해 예외 처리할 수 있습니다 (사내 문서 등)."
  else
    REASON="Commit blocked: quantitative claims without provenance tag.

Add [VERIFIED:url|YYYY-MM-DD], [ASSUMED:rationale], or [FOUNDER-INPUT] near:
${VIOLATIONS}
To allow a specific line as prose (not a claim), add <!-- brief-provenance: allow --> inline."
  fi

  # Escape for JSON
  REASON_JSON=$(node -e "process.stdout.write(JSON.stringify(process.argv[1]))" "$REASON")
  echo "{\"decision\":\"block\",\"reason\":${REASON_JSON}}"
  exit 2
fi

exit 0
```

### Example 3: AUDIENCE duplicate-rename diff sketch (agents/brief-audience-guard.md)

```diff
--- agents/brief-align-gate.md
+++ agents/brief-audience-guard.md
@@ -1,5 +1,5 @@
 ---
-name: brief-align-gate
-description: Evaluates alignment between a candidate artifact and an OBJECTIVES.md baseline. Emits a structured verdict JSON with a three-output decision (ALIGNED / DRIFTED-objective-needs-update / DRIFTED-output-needs-revision). Read-only — never mutates the candidate or baseline. Spawned by brief/workflows/align-gate.md via Task.
+name: brief-audience-guard
+description: Evaluates audience fit of a candidate artifact against its own frontmatter AND against OBJECTIVES.md audience_policy. Emits a structured verdict JSON with a three-output decision (AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content). Read-only — never mutates the candidate or baseline. Spawned by brief/workflows/audience-guard.md via Task.
 tools: Read, Grep, Glob, Write
-color: orange
+color: purple
 ---

@@ <role>
-You are the BRIEF ALIGN evaluator. You answer one question:
-"Does this artifact deliver on the documented intent in OBJECTIVES.md?"
+You are the BRIEF AUDIENCE evaluator. You answer two questions:
+"(1) Are the 3 mandatory frontmatter fields (audience.type, audience.confidentiality, business_context.model) present and well-formed?
+ (2) Does the content respect the declared audience — in particular, is there internal-only language in an artifact declared external?"

@@ <required_reading>
 - .planning/OBJECTIVES.md
 - .planning/PROJECT.md
-- brief/references/align-vocabulary.md
-- {{CANDIDATE_PATH}}   (injected at Task-spawn time by the workflow)
-- {{BASELINE_PATH}}    (injected at Task-spawn time by the workflow — usually same as .planning/OBJECTIVES.md in Phase 4 canary; different in Phase 5+)
+- brief/references/audience-vocabulary.md
+- {{ARTIFACT_PATH}}    (injected at Task-spawn time by the workflow)
+- Frontmatter of {{ARTIFACT_PATH}} + OBJECTIVES.md audience_policy (both injected via <artifact_frontmatter> and <audience_policy> delimiters in the prompt)

@@ <decision_mechanism>
 Three outputs, never pass/fail:
-  - ALIGNED                              (artifact delivers on OBJECTIVES.md)
-  - DRIFTED-objective-needs-update       (artifact is fine; OBJECTIVES.md stale)
-  - DRIFTED-output-needs-revision        (OBJECTIVES.md is fine; artifact off-target)
+  - AUDIENCE-OK                          (frontmatter complete; content consistent with declared audience)
+  - DRIFTED-frontmatter                  (1+ mandatory fields missing or malformed)
+  - DRIFTED-content                      (frontmatter OK but content contradicts declared audience)
```

(Sketch only; the full file retains all other sections verbatim with equivalent keyword swaps — `ALIGN` → `AUDIENCE`, `alignment` → `audience fit`, etc.)

### Example 4: Researcher prompt confidence-band discipline (D-08)

```markdown
<!-- agents/brief-domain-researcher.md excerpt — confidence-band training examples -->

<confidence_band_discipline>
EVERY quantitative claim — currency, percent, multiplier, market-size /
revenue / growth-rate / CAGR / YoY / MRR / ARR / TAM / SAM / SOM — MUST
carry a provenance tag AND, when the claim is a market-size or growth-rate,
MUST be expressed as a RANGE with source count, unless a single authoritative
source exists AND the VERIFIED tag points to it.

Korean mode examples ({{KOREA_LANGUAGE}} = "true"):

GOOD:
  - 한국 fintech 시장 규모: ₩4–6조 (3개 출처에서 집계, 2025)
    [VERIFIED:practiceguides.chambers.com/data-protection-privacy-2026/south-korea|2026-04-22]
  - 전년 대비 성장률: 15–25% 범위 (2024 대비 2025, 2개 연구기관 합산)
    [VERIFIED:iapp.org|2026-04-22] [VERIFIED:fintechnews.kr|2026-04-21]

BAD — reject this format in your output:
  - 한국 fintech 시장 규모: ₩4.7조, 성장률 23.4% YoY
  # no range, no source, false-precision decimal

BAD — partially OK but still incomplete:
  - 한국 fintech 시장: ₩4–6조 범위
  # range present but no tag; hook will block

ASSUMED path — legitimate when no source exists:
  - 한국 fintech 시장에서 BRIEF의 SOM: 연 매출 ₩2-5억 (범위)
    [ASSUMED:business planner's realistic first-year revenue; no public
    comparable exists for framework-tooling category]

English mode examples ({{KOREA_LANGUAGE}} = "false"):

GOOD:
  - Korean SaaS market: $4-6B (range from 3 sources, 2025)
    [VERIFIED:statista.com/korea-saas|2026-04-22]
  - YoY growth: 15-25% (2024 to 2025, 2 sources combined)
    [VERIFIED:kisa.or.kr|2026-04-22] [VERIFIED:gartner.com|2026-04-21]

BAD:
  - Korean SaaS market: $4.7B growing 23.4% YoY
  # no range, no source, false precision
</confidence_band_discipline>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "Pattern-match compliance checker" — green checkmarks for encryption-keyword-present | Findings-not-checks (PITFALLS.md Pitfall #4) | March 2026 PIPA amendment: CEO personal liability + 10% turnover ceiling [VERIFIED: iapp.org|2026-04-22] | Green-checkmark output is now an active CEO liability vector. Phase 5 AUDIENCE + Phase 7 COMPLIANCE MUST use findings vocabulary only. |
| Point estimates in market data ("₩4.7T, 23.4% YoY") | Confidence bands with source count ("₩4-6T, range from 3 sources, 2025") | Documented 27% hallucination rate in financial AI [CITED: baytechconsulting.com|2026-04-17 via PITFALLS.md Pitfall #6] | False precision destroys investor credibility. Phase 5 D-08 is non-negotiable. |
| Hook-triggered gate auto-attach | Explicit orchestrator-step gate invocation | Claude Code hooks cannot spawn subagents [VERIFIED: Anthropic Claude Code hooks docs via ARCHITECTURE.md Pattern 4] | Phase 5 AUDIENCE MUST be visible in `brief/workflows/discover.md`. No `PostToolUse`/`SubagentStop` hooks. |
| "Business planner edits JSON config" | Conversational `/brief-define` → 4 configs inferred from conversation | Non-developer UX (PITFALLS.md Pitfall #9) | Phase 5 `context-inject.cjs` reads `state.brief.*` that `/brief-define` already populated — no new user-facing config surfaces in Phase 5. |
| Flat `audience: internal | external` | Granular `{type, confidentiality, role} + voice.{tone, perspective} + business_context.model` | Audience leakage detectability (PITFALLS.md Pitfall #5 technical-debt table) | Phase 5 D-10 6-field schema (3 mandatory + 3 auto-populated) is the v1 balance; full granularity deferred to v1.x. |
| MyData scope: finance + telecom + healthcare | MyData scope: 10 priority sectors across ALL industries | Feb 2026 PIPA enforcement decree amendment [VERIFIED: en.sedaily.com|2026-04-22, Library of Congress 2025-06-23 prior effective|2026-04-22] | Phase 5 mydata-2026.md primer MUST enumerate the 10 priority sectors (medical, communications, energy, transportation, education, employment, real estate, welfare, distribution, leisure). |
| ISMS-P as voluntary certification | ISMS-P mandatory for designated large-scale controllers | Effective **2027-07-01** per amendment promulgated **2026-03-10** [VERIFIED: Chambers 2026|2026-04-22; practiceguides.chambers.com/data-protection-privacy-2026/south-korea|2026-04-22] | Phase 5 isms-p.md primer MUST surface the July 2027 deadline as the single highest-signal finding for Korea-first B2B/fintech planners. |

**Deprecated / outdated:**
- "Single blanket consent checkbox" is explicitly forbidden by PIPA; any AUDIENCE finding that implies consent coverage by a single checkbox is CEO liability. [CITED: practiceguides.chambers.com 2026|2026-04-22]
- "10x growth" literal translations to Korean (`10배 성장`) sound jargon-y. Phase 8 DELIVER territory (bilingual pairs); Phase 5 just surfaces as AUDIENCE DRIFTED-content when an external artifact uses the literal.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Claude Code's Task tool natively batches multiple Task blocks in one orchestrator message — waves are the default semantic | Pattern 1 Wave-Based Task Spawn | [VERIFIED via Anthropic engineering.multi-agent-research-system|2026-04-22 + MindStudio agent teams article + Sulat task primitives article]. Risk: certain runtime configurations serialize; Smoke test Pitfall 2 catches this BEFORE 4-wide commits. If smoke fails, revert to sequential with warning (loses DSC-03 parallelism but keeps functional). |
| A2 | All 9 default categories fit in one `AskUserQuestion` multi-select prompt with room for "Custom (Other)" free-text | Question 9 / `/brief-discover` UX | AskUserQuestion supports `multiSelect: true` + "Other" free-text [VERIFIED: GitHub anthropics/claude-code-system-prompts docs|2026-04-22]. Concern: number-key hotkey bug ([CITED: github.com/anthropics/claude-code/issues/22300|2026-04-22]) when user types a number while focused on "Other" — documented limitation. Phase 5 workaround: ask user to click "Other" button first, then type freeform. Text_mode fallback (numbered list) is immune. |
| A3 | `.planning/ALIGN-00.md` D-12 migration is code-path-only (no on-disk data migration) | Runtime State Inventory | [VERIFIED: `ls .planning/ALIGN-00.md` returned No such file, 2026-04-22]. If Phase 4 canary E2E is executed between Phase 5 research and execution, an on-disk file may exist at migration time. Migration commit should include a `git mv .planning/ALIGN-00.md .planning/OBJECTIVES.align.md` step guarded by `[ -f .planning/ALIGN-00.md ]`. |
| A4 | PIPA amendment effective 2026-09-11; ISMS-P mandatory 2027-07-01; penalty ceiling 10% turnover | Korea compliance primers, question 7 | [VERIFIED: iapp.org|2026-04-22 + captaincompliance.com|2026-04-22 + Chambers 2026|2026-04-22 + dgcbriefings.substack.com|2026-04-22]. Risk: regulatory dates shift before v1 ship. Mitigation: every primer has `last_reviewed: <date>` frontmatter field. Phase 9 HRD-04 pilot includes a "regulatory-date refresh" audit step. Do NOT hard-code without cite. |
| A5 | MyData expanded to "all industries" with 10 priority sectors Feb 2026 | mydata-2026.md primer | [VERIFIED: en.sedaily.com Korea Expands MyData Rights to All Industries|2026-04-22; digitaltoday.co.kr|2026-04-22; loc.gov Library of Congress prior version|2026-04-22]. Risk: licensing regime (operator license) not fully detailed in surfaced sources — primer notes "operator licensing framework under development; consult qualified counsel" rather than asserting specifics. |
| A6 | Phase 5 can preserve `state.brief.last_gate_results.audience` writes without allowlist extension (D-03 forward-declared in Phase 2) | AUDIENCE commit path | [VERIFIED: ASSUMPTIONS.md A4 Phase 2 2026-04-19 + Phase 2 D-21 allowlist extension + state-brief-roundtrip.test.cjs 4/4 pass]. No new allowlist entry anticipated; planner extends ONLY if mid-wave checkpoint field (`state.brief.discover_wave_status`) emerges per D-16. |
| A7 | Hook opt-in via `hooks.community: true` in `.planning/config.json` is honored uniformly across Claude Code / Codex / Gemini / OpenCode | Pre-commit hook integration, question 10 | [VERIFIED: existing hooks/brief-validate-commit.sh shape, line 12-17; config.json has `hooks: { context_warnings: true }` allowing community key 2026-04-22]. Risk: a non-Claude-Code runtime might not source the `.git/hooks/pre-commit` chain. Mitigation: hook shell is invoked by `git`, not by the runtime; git calls pre-commit regardless of which AI tool is driving. |
| A8 | Wave smoke-test ratio threshold of 0.9× is a meaningful parallelism signal | Pattern 1 smoke-test recipe | [ASSUMED: engineering judgment; no hard SLA in Anthropic docs]. If 2-task wall-clock ratio is 0.85-0.95 the signal is ambiguous — planner escalates to 3-task fixture. Risk: Claude Code spawn mechanics improve over time; threshold may need adjustment. Document as a soft-target in test fixture. |
| A9 | `state.brief.current_workstream` — Phase 5 does NOT write this field; it remains null through Phase 5 (Phase 7 first writer) | State-write contract | [VERIFIED: Phase 2 D-03 schema + Phase 3 D-09 per-workstream OBJECTIVES.md deferred to Phase 7]. Risk: if a Phase 5 planner decides to surface workstream context in researcher output, this assumption inverts. Flag only if needed. |

## Open Questions

1. **Should `buildBusinessContext()` dispatch through `brief-tools.cjs context-block` subcommand or be consumed via direct `require()` from workflow-execution scripts?**
   - What we know: Workflow markdown invokes CLI for `init` and `commit`; direct `require()` is the lib pattern.
   - What's unclear: Whether adding `brief-tools.cjs context-block` subcommand is useful (shim with no benefit) vs. direct `require()` of `context-inject.cjs` from workflow-driven Node execution.
   - Recommendation: Direct `require()` in workflow orchestrator execution (same pattern Phase 4 uses for `align run` via CLI BUT `align commit` via combined dispatcher). Avoid adding a CLI shim unless a concrete caller requires it. Planner decides per Phase 2 D-18 preference.

2. **Should the researcher agent enforce `[VERIFIED/ASSUMED/FOUNDER-INPUT]` tags at prompt-time via a pre-write self-check, or rely solely on the commit-time hook?**
   - What we know: Double-layer enforcement is D-07.
   - What's unclear: Whether the agent prompt body should include a "reject your own output if a tag is missing" self-regulation instruction, or rely purely on commit-time grep.
   - Recommendation: Include the self-check instruction as a prompt-time discipline (cheap training), keep the hook as the mechanical safety net. This matches Phase 4's agent prompt + vocab-lock test pattern.

3. **What exact severity should AUDIENCE assign to a finding of "external artifact body contains internal-only hedging vocabulary"?**
   - What we know: D-04 (Phase 4) severity enum is locked at `blocking/material/nice-to-have`.
   - What's unclear: Hedging in external artifacts — is it `blocking` (refuse to let the artifact ship externally) or `material` (ship with caveat, surface via force-accept)?
   - Recommendation: `blocking` for `confidentiality: external` artifacts containing internal-only hedging (matches Pitfall #5's highest-risk vector); `material` for `confidentiality: internal` artifacts (they're staying internal; hedging is acceptable).

4. **Does the 3-path Korean interrupt prompt wording for AUDIENCE benefit from minor distinctions from Phase 4 ALIGN wording, or should it be near-verbatim?**
   - What we know: D-09 says "3-path user interrupt (Phase 4 D-06) replicated verbatim"; Phase 4 wording is `objective 수정하기 / 이 output이 틀렸다, 다시 쓰기 / 현재 상태 승인, 계속 진행 (force-accept)`.
   - What's unclear: AUDIENCE `DRIFTED-frontmatter` is about FRONTMATTER, not objectives. Is `audience 수정하기` too coarse? Would `frontmatter 보완하기` be clearer?
   - Recommendation: Honor D-09 "replicated verbatim" semantics with surface wording adjusted for AUDIENCE context: `audience 수정하기` / `이 문서 다시 쓰기` / `현재 상태 승인, 계속 진행 (force-accept)`. Planner can iterate with user during canary if a finding feels off (per CONTEXT Claude's Discretion).

5. **How should `/brief-discover` handle a user who selects zero categories?**
   - What we know: Must validate non-empty; question 9 notes this.
   - What's unclear: Do we re-prompt, exit, or show an error?
   - Recommendation: Re-prompt with a banner message ("최소 한 개 이상 선택해 주세요 / Please pick at least one category"). Same for "user selects only Custom without providing a topic": re-prompt for topic.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22+ | All Phase 5 code | ✓ | ≥ 22 (per package.json engines) | None — hard requirement |
| `git` CLI | Atomic commit + pre-commit hook | ✓ (assumed — BRIEF infrastructure requires it) | any recent version | None |
| Claude Code CLI | Subagent spawn + AskUserQuestion | ✓ (assumed — primary runtime) | — | `text_mode` fallback for Codex / Gemini / OpenCode |
| `bash` 3.2+ | `brief-validate-provenance.sh` | ✓ (assumed — macOS/Linux default; WSL on Windows) | any | None — Windows cmd.exe is not a target |
| `awk` | Hook line-scanning | ✓ (POSIX standard; BSD awk on macOS, GNU awk on Linux) | any | None |
| `grep` / `sed` | Hook text manipulation | ✓ (POSIX standard) | any | None |
| `node` in PATH (from hook) | Hook config-parse helper | ✓ (BRIEF already uses this pattern in `brief-validate-commit.sh`) | ≥ 22 | None |

**Missing dependencies with no fallback:** None — Phase 5 adds NO new hard requirements. All primitives are inherited from BRIEF's zero-dep baseline.

**Missing dependencies with fallback:** `AskUserQuestion` is Claude-Code-only; `text_mode` numbered-list fallback is already implemented (FND-06 verified Phase 1).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `node:test` (built-in) + c8 coverage [VERIFIED: .planning/config.json workflow.nyquist_validation: true, 2026-04-22] |
| Config file | `.planning/config.json` (c8 threshold in package.json scripts) |
| Quick run command | `node --test tests/brief-discover-*.test.cjs tests/brief-audience-*.test.cjs tests/brief-provenance-*.test.cjs tests/brief-context-inject-*.test.cjs` |
| Full suite command | `node scripts/run-tests.cjs` (or `npm test`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSC-01 | 9 default categories presented; multi-select | smoke | `node --test tests/brief-discover-multiselect.test.cjs` | ❌ Wave 0 |
| DSC-02 | "Custom" free-text entry accepted; degenerate topic fallback | smoke | `node --test tests/brief-discover-custom-topic.test.cjs` | ❌ Wave 0 |
| DSC-03 | Wave partitioning of N categories into ceil(N/4) waves of ≤4 | unit | `node --test tests/brief-discover-wave-partition.test.cjs` | ❌ Wave 0 |
| DSC-03 | 2-task parallelism smoke (pre-commit smoke before 4-wide) | integration | `node --test tests/brief-discover-parallel-smoke.test.cjs` | ❌ Wave 0 |
| DSC-04 | Provenance regex positive fixtures pass | unit | `node --test tests/brief-provenance-positive.test.cjs` | ❌ Wave 0 |
| DSC-04 | Provenance regex negative fixtures block | unit | `node --test tests/brief-provenance-negative.test.cjs` | ❌ Wave 0 |
| DSC-04 | Provenance regex false-positive (prose) ignores | unit | `node --test tests/brief-provenance-false-positives.test.cjs` | ❌ Wave 0 |
| DSC-05 | `buildBusinessContext()` round-trip — Korea B2B fintech vs global B2C consumer | integration | `node --test tests/brief-context-inject-roundtrip.test.cjs` | ❌ Wave 0 |
| DSC-05 | Two researchers on same "GTM" question produce differentiated output based on `business_model` | integration | `node --test tests/brief-researcher-b2b-vs-b2c.test.cjs` | ❌ Wave 0 |
| DSC-06 | Korea compliance primers exist and have mandatory frontmatter + disclaimer | smoke | `node --test tests/brief-korea-compliance-primers.test.cjs` | ❌ Wave 0 |
| DSC-07 | Quantitative claim without URL+access-date in `[VERIFIED:...]` fails regex | unit | (covered by DSC-04 `invalid-untagged-currency.md` + `edge-malformed-tag.md` fixtures) | Shared |
| DSG-13 | AUDIENCE-OK verdict on well-formed research artifact | integration | `node --test tests/brief-audience-ok.test.cjs` | ❌ Wave 0 |
| DSG-13 | DRIFTED-frontmatter on missing-field artifact | integration | `node --test tests/brief-audience-drifted-frontmatter.test.cjs` | ❌ Wave 0 |
| DSG-13 | DRIFTED-content on hedging-in-external artifact | integration | `node --test tests/brief-audience-drifted-content.test.cjs` | ❌ Wave 0 |
| DSG-13 | Paired-sibling filename scheme writes `{artifact}.audience.md` | smoke | `node --test tests/brief-audience-sibling-filename.test.cjs` | ❌ Wave 0 |
| DSG-13 | AUDIENCE state write — `state.brief.last_gate_results.audience` round-trips | unit | `node --test tests/brief-audience-state-roundtrip.test.cjs` | ❌ Wave 0 |
| CC-02 | Every researcher Task receives `<business_context>` block | integration | (covered by DSC-05 test) | Shared |
| CC-04 | Pre-commit hook blocks untagged quantitative claim commit | integration | `node --test tests/brief-provenance-hook.test.cjs` | ❌ Wave 0 |
| CC-04 | Hook opt-in gated by `hooks.community: true` | unit | `node --test tests/brief-provenance-opt-in.test.cjs` | ❌ Wave 0 |
| — | ALIGN-00.md → OBJECTIVES.align.md code-path migration: grep audit returns 0 | smoke | `node --test tests/brief-align-filename-migration.test.cjs` | ❌ Wave 0 |
| — | Vocabulary-lock: no ban-list tokens in AUDIENCE outputs | unit | `node --test tests/brief-audience-vocabulary-lock.test.cjs` | ❌ Wave 0 |
| — | `/brief-discover` preserves Phase 3 block-gate (unchanged behavior) | smoke | `node --test tests/brief-discover-block-gate-preserved.test.cjs` | ❌ Wave 0 |
| — | `/brief-discover` preserves Phase 3 stale-anchor (unchanged behavior) | smoke | `node --test tests/brief-discover-stale-anchor-preserved.test.cjs` | ❌ Wave 0 |
| — | `text_mode` parity for category multi-select + AUDIENCE interrupt | smoke | `node --test tests/brief-discover-text-mode.test.cjs` | ❌ Wave 0 |
| — | Canary E2E: 2–3 categories through full flow (spawn → output → AUDIENCE → provenance → commit) | e2e | `node --test tests/brief-discover-canary-e2e.test.cjs` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** quick run command (subsystem-specific test files touched by the commit). Target < 30s total.
- **Per wave merge:** full suite command (`node scripts/run-tests.cjs`). Target < 3 min.
- **Phase gate:** full suite green BEFORE `/gsd-verify-work`; coverage ≥ 70% line threshold [VERIFIED: Phase 2 inherited, 2026-04-22].

### Wave 0 Gaps

- [ ] `tests/brief-discover-multiselect.test.cjs` — covers DSC-01
- [ ] `tests/brief-discover-custom-topic.test.cjs` — covers DSC-02
- [ ] `tests/brief-discover-wave-partition.test.cjs` — covers DSC-03 partitioning
- [ ] `tests/brief-discover-parallel-smoke.test.cjs` — 2-task parallel spawn smoke (BLOCKING: must pass before 4-wide implementation)
- [ ] `tests/brief-provenance-positive.test.cjs` — covers DSC-04 positive fixtures
- [ ] `tests/brief-provenance-negative.test.cjs` — covers DSC-04 negative fixtures
- [ ] `tests/brief-provenance-false-positives.test.cjs` — covers prose false-positives
- [ ] `tests/brief-provenance-hook.test.cjs` — covers CC-04 hook integration
- [ ] `tests/brief-provenance-opt-in.test.cjs` — covers `hooks.community: true` gate
- [ ] `tests/brief-context-inject-roundtrip.test.cjs` — covers DSC-05 `buildBusinessContext()` round-trip
- [ ] `tests/brief-researcher-b2b-vs-b2c.test.cjs` — covers DSC-05 differentiated output
- [ ] `tests/brief-korea-compliance-primers.test.cjs` — covers DSC-06 primer existence + schema
- [ ] `tests/brief-audience-ok.test.cjs` — covers DSG-13 AUDIENCE-OK
- [ ] `tests/brief-audience-drifted-frontmatter.test.cjs` — covers DSG-13 DRIFTED-frontmatter
- [ ] `tests/brief-audience-drifted-content.test.cjs` — covers DSG-13 DRIFTED-content
- [ ] `tests/brief-audience-sibling-filename.test.cjs` — covers DSG-13 paired-sibling scheme
- [ ] `tests/brief-audience-state-roundtrip.test.cjs` — covers `state.brief.last_gate_results.audience`
- [ ] `tests/brief-audience-vocabulary-lock.test.cjs` — covers vocabulary-ban (mirror of align-vocabulary-lock)
- [ ] `tests/brief-align-filename-migration.test.cjs` — covers D-12 migration (grep audit returns 0)
- [ ] `tests/brief-discover-block-gate-preserved.test.cjs` — covers Phase 3 block-gate regression guard
- [ ] `tests/brief-discover-stale-anchor-preserved.test.cjs` — covers Phase 3 stale-anchor regression guard
- [ ] `tests/brief-discover-text-mode.test.cjs` — covers text_mode parity for multi-select + interrupt
- [ ] `tests/brief-discover-canary-e2e.test.cjs` — covers full E2E flow
- [ ] `tests/fixtures/provenance/*.md` — 13 fixture files (valid-en, valid-ko, valid-mixed-proximity, invalid-untagged-currency, invalid-untagged-percent, invalid-untagged-korean, false-positive-date, false-positive-article, false-positive-version, false-positive-prose-en, false-positive-prose-ko, false-positive-plan-id, edge-malformed-tag)
- [ ] `tests/fixtures/audience/*.md` — AUDIENCE-OK, DRIFTED-frontmatter, DRIFTED-content fixtures (EN and KO variants)
- [ ] `tests/fixtures/discover/*.md` — researcher sample outputs for E2E

*(Framework install: none needed — `node:test` is built-in; c8 already installed via devDependencies.)*

## Research Findings by Key Question

The research-prompt's numbered questions map to sections above as follows. Each question's detailed answer is embedded in the relevant pattern / code example / pitfall section. Quick cross-reference:

### Q1 — Wave-based Task parallelism → Pattern 1 (Wave-Based Task Spawn)
Wave queue algorithm: `ceil(N/4)`; one orchestrator message per wave with up to 4 `Task` blocks. Smoke-test mandatory (2-task before 4-wide). Failure semantics: per-slot stub + `[ASSUMED: auto-generated from researcher failure]`; no auto-retry at wave layer. [VERIFIED: Anthropic engineering.multi-agent-research-system|2026-04-22; Claude Code Task primitives batch-synchronous wave semantics corroborated by MindStudio|2026-04-22 + Sulat|2026-04-22]

### Q2 — Provenance regex patterns → Pattern 4 (Provenance Regex) + Example 2 (hook skeleton)
Canonical regex set covers EN + KO currency (+ `조억만` abbreviations), percent, multiplier (`x`/`배`), explicit phrasings. Exclusion patterns for dates, articles (`제15조`), versions, page refs, prose quantifiers. Same-line + ±2 line proximity window. 13-fixture positive/negative test suite. [ASSUMED for exact regex choices: regex language-mixing BASH-portable vs. Perl-compatible grep; planner may tune to use `grep -P` if GNU grep is a safe assumption OR POSIX `awk` + ERE for maximum portability.]

### Q3 — AUDIENCE guard duplicate-rename → Pattern 2 (AUDIENCE Duplicate-Rename Delta) + Example 3 (agent diff sketch)
Mechanical swap table across all 5 files. Baseline substitution `{{OBJECTIVES}}` → `{{ARTIFACT_FRONTMATTER + OBJECTIVES.audience_policy}}`. Verdict enum substitution (ALIGNED → AUDIENCE-OK, etc.). Vocabulary ban-list extensions (see Q8). ALIGN filename migration grep recipe in Runtime State Inventory (7 files, all code-path; no on-disk data).

### Q4 — `buildBusinessContext()` API design → Pattern 3 (Cross-Cutting Primitive) + Example 1 (skeleton)
Single function; two consumers (prompt block + AUDIENCE auto-populated frontmatter). Return shape frozen (STABLE JSDoc). Korea-signal + language derivation built-in. Compliance-pack auto-attach of `required_reading` file paths. XML prompt block format recommended (matches Phase 4 `<candidate>`/`<baseline>` convention; cross-runtime parity).

### Q5 — B2B/B2C 9-category research lens matrix

| # | Category | B2B / Enterprise emphasis | B2C / B2B2C emphasis |
|---|----------|---------------------------|----------------------|
| 1 | Market Sizing | Segmented TAM/SAM/SOM by company size (SMB / mid-market / enterprise); license-seat or contract-value-based; procurement cycles factored into SAM realism | Population × penetration × ARPU; cohort retention; viral-k factor as growth multiplier; app-store category size |
| 2 | Competitor Landscape | Feature matrix vs. 3-5 named competitors on enterprise criteria (SSO, RBAC, audit log, on-prem option, compliance certs); RFP win/loss patterns | Brand/positioning map; sentiment analysis; community/forum vibes; app-store rank + review themes |
| 3 | Customer Research | Buyer committee map (economic buyer, technical evaluator, end user, champion); RFP / procurement cycle length; pilot → rollout pattern; reference-customer mechanics | Persona × JTBD; ethnographic field notes; acquisition-channel attribution; D2C lifecycle events (signup → activation → habit) |
| 4 | Regulation & Compliance | Data-processing addendums; vendor-management questionnaires (SIG/SIG Lite); enterprise-only clauses (e-금융거래법 for KR fintech; HIPAA BAAs for US health) | Consumer-facing consent UX (PIPA single-checkbox-forbidden lens); GDPR Article 7 consent freshness; dark-pattern avoidance; age-gating |
| 5 | Technology & Feasibility | Integration landscape (SAP, Salesforce, Workday, Kakao Work, Dooray, Jandi); SSO protocols (SAML, OIDC); deployment options (cloud, VPC, on-prem) | App-platform gates (iOS App Store guidelines, Google Play policies, KakaoTalk channel rules); PWA viability; cross-platform SDK options |
| 6 | Distribution Channels | Direct sales (inside, field); channel partners (SI integrators in KR: Samsung SDS, LG CNS, Naver Cloud); marketplace listings (AWS, Azure) | Paid acquisition (Meta, Google, Naver, Kakao Moment); organic (SEO/ASO); influencer/creator partnerships; KakaoTalk channel; referral mechanics |
| 7 | Pricing Benchmarks | Per-seat / per-user / per-API-call SaaS benchmarks; annual-commit discount bands (10-20% typical); enterprise minimums; volume tiers | Freemium conversion rates; ad-supported vs. subscription tradeoffs; regional price sensitivity; PPP-adjusted international tiers |
| 8 | Case Studies | 2-3 comparable enterprise wins (naming accounts, use-case, ROI evidence); peer CIO/CTO references | 2-3 viral / organic-growth stories; retention+LTV examples; category-leader acquisition histories |
| 9 | Trends & Forecasts | Analyst reports (Gartner, Forrester, IDC); enterprise-buyer surveys (e.g., Gartner CIO survey); category-creation narratives; Gartner-hype-cycle position | Consumer-trend reports (NielsenIQ, Euromonitor); app-store trend data (Sensor Tower, data.ai); platform-shift signals (Gen-Z behaviors, social-commerce) |

[CITED: PITFALLS.md Pitfall #6 driver-based bottom-up requirement; PITFALLS.md Pitfall #11 Korean distribution channel names (Naver / Kakao / Samsung SDS); CLAUDE.md Recommended Stack → Strategyzer Business Model Canvas / Lean Canvas; ARCHITECTURE.md Pattern 3 anchor-document + context injection precedent]

### Q6 — Confidence bands + provenance formatting → Example 4 (researcher prompt discipline)
Korean format: `₩4–6조 (3개 출처에서 집계, 2025) [VERIFIED:url|YYYY-MM-DD]`. English format: `$4-6B (range from 3 sources, 2025) [VERIFIED:url|YYYY-MM-DD]`. GOOD vs BAD side-by-side training examples embedded in `<confidence_band_discipline>` block of `brief-domain-researcher.md`. Korean convention (조/억/만) preserved; currency-symbol preference (₩ for KR, $ for global). [CITED: PITFALLS.md Pitfall #6 — 27% hallucination rate in financial AI — false-precision banned]

### Q7 — Korea compliance primer design

**pipa-2026.md (~600 words):**

```yaml
---
region: kr
industry: [all]
effective_date: 2026-09-11           # per amendment promulgated 2026-03-10
penalty_ceiling: "10% of total turnover"
ceo_liability: true
last_reviewed: 2026-04-22
---
```

Section structure:

- `## Scope` — applies to all personal-information controllers; expanded territorial reach; 5+ million data subjects triggers additional obligations.
- `## Key Articles / Clauses (high-level)`
  - Art. 28-8 (supervisory responsibility) — CEO / representative director designated as ultimate responsible person.
  - Art. 64-2 (penalty ceiling) — 10% of total turnover.
  - Art. 34 (breach notification) — probabilistic incident-notification trigger (2026 amendment).
  - Art. 31 (CPO independence) — 2026 amendment mandates CPO operational independence from security team.
- `## Common Gotchas`
  - Single blanket consent checkbox EXPLICITLY FORBIDDEN — each data-processing category requires separate specific consent.
  - "Dark patterns" monitored by PIPC — cookie banners / subscription cancel flows are enforcement-relevant.
  - Cross-border transfer adequacy: safe-harbor jurisdictions listed by PIPC; others require consent + DPA.
- `## Penalties + CEO Liability`
  - 10% total turnover (financial penalty).
  - **CEO / 대표이사 personal supervisory liability** — criminal exposure possible.
  - ISMS-P certification becomes mandatory **2027-07-01** for designated large-scale controllers (see `isms-p.md`).
- `## Legal Counsel Disclaimer`
  > Not legal advice. Refer to qualified Korean counsel before acting on findings.
- `## Sources`
  - [South Korea Amends PIPA and Ties Fines to CEO Accountability](https://iapp.org/news/a/south-korea-overhauls-pipa-and-ties-fines-to-ceo-accountability) — accessed 2026-04-22
  - [Korea's New PIPA Amendments: 10% Turnover Fines, CEO Liability, and What DPOs Must Do Next](https://dgcbriefings.substack.com/p/south-korea-koreas-new-pipa-amendments) — accessed 2026-04-22
  - [Data Protection & Privacy 2026 - South Korea (Chambers and Partners)](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments) — accessed 2026-04-22
  - [South Korea Just Made the CEO Personally Responsible for Data Breaches](https://captaincompliance.com/education/south-korea-just-made-the-ceo-personally-responsible-for-data-breaches/) — accessed 2026-04-22

**isms-p.md (~500 words):**

```yaml
---
region: kr
industry: [all_designated_large_scale]
effective_date: 2027-07-01           # mandatory certification deadline
penalty_ceiling: "See PIPA 10% ceiling"
ceo_liability: true
last_reviewed: 2026-04-22
---
```

Section structure:

- `## Scope` — ISMS-P covers BOTH information security (ISMS) AND personal information protection; integrated management-system audit roughly comparable to ISO 27001 + ISO 27701 with Korean-specific controls.
- `## Key Articles / Clauses (high-level)` — certification criteria organized into 80+ controls across policy / organization / external-party / physical / communications / access / operations / development / incident-response / BCP / PII-lifecycle.
- `## Common Gotchas`
  - ISMS-P vs. ISMS-alone: ISMS certification is the narrower information-security-only audit; ISMS-P adds personal-information-protection controls.
  - Designated large-scale controllers: the 2027-07-01 mandate applies to designated entities (criteria to be clarified by KISA/PIPC enforcement notice; monitor for updates).
  - Certification cycle: 3-year cycle; surveillance audits annually.
- `## Penalties + CEO Liability`
  - Mandatory deadline **2027-07-01** — failure to hold certification may trigger administrative enforcement; CEO liability is coextensive with PIPA (see `pipa-2026.md`).
- `## Legal Counsel Disclaimer`
  > Not legal advice. Refer to qualified Korean counsel before acting on findings.
- `## Sources`
  - [Data Protection & Privacy 2026 - South Korea (Chambers and Partners)](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments) — accessed 2026-04-22
  - [South Korea PIPA Compliance (Thales)](https://cpl.thalesgroup.com/compliance/apac/south-koreas-pipa) — accessed 2026-04-22

**mydata-2026.md (~600 words):**

```yaml
---
region: kr
industry: [medical, communications, energy, transportation, education, employment, real_estate, welfare, distribution, leisure]
effective_date: 2026-02-XX            # enforcement decree amendment Feb 2026
penalty_ceiling: "Per PIPA baseline"
ceo_liability: true                   # same PIPA CEO liability regime applies
last_reviewed: 2026-04-22
---
```

Section structure:

- `## Scope`
  - MyData ("마이데이터") is the Korean data-portability regime. Feb 2026 enforcement decree EXPANDED scope from {medical, telecommunications, energy} to **ALL INDUSTRIES**, with 10 priority sectors designated for first-wave expansion: **medical, communications, energy, transportation, education, employment, real estate, welfare, distribution, leisure**.
  - Energy-sector MyData goes live **June 2026** per PIPC roadmap.
- `## Key Articles / Clauses (high-level)` — right-to-request personal-information-transfer under amended Personal Information Protection Act enforcement decree.
- `## Common Gotchas`
  - Operator licensing framework: detailed licensing regime still being clarified by PIPC. Primer notes "operator licensing framework under development; consult qualified counsel" — do NOT assert specifics.
  - MyData-business vs. MyData-operator distinction: separate regulatory concepts; compliance vocabulary glossary required.
  - Cross-industry data portability: technical / legal obligations to honor portability requests from users across sectors.
- `## Penalties + CEO Liability`
  - Enforcement is under PIPA umbrella; penalty ceiling + CEO liability inherits from `pipa-2026.md`.
- `## Legal Counsel Disclaimer`
  > Not legal advice. Refer to qualified Korean counsel before acting on findings.
- `## Sources`
  - [Korea Expands MyData Rights to All Industries, Offers $12M in Support (Seoul Economic Daily)](https://en.sedaily.com/technology/2026/03/12/korea-expands-mydata-rights-to-all-industries-offers-12m-in) — accessed 2026-04-22
  - [PIPC seeks applicants for 2026 MyData service support programme (DigitalToday)](https://www.digitaltoday.co.kr/en/view/34941/pipc-seeks-applicants-for-2026-mydata-service-support-programme) — accessed 2026-04-22
  - [South Korea: Amended Personal Information Protection Act (Library of Congress)](https://www.loc.gov/item/global-legal-monitor/2025-06-23/south-korea-amended-personal-information-protection-act-expands-individuals-control-over-personal-data/) — accessed 2026-04-22
  - [Data Protection & Privacy 2026 - South Korea (Chambers and Partners)](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments) — accessed 2026-04-22

### Q8 — AUDIENCE DRIFTED-content deterministic keyword list

**English (extending Phase 4 ALIGN ban-list):**

```
# Hedging / internal-only markers that flag DRIFTED-content when appearing
# in an artifact with audience.type: external or audience.confidentiality: external:
TBD
we believe
we think
concerns
concern
risk we haven't solved
still proving
not sure
gut feel
hypothesis (without VERIFIED tag)
we assume (without VERIFIED tag)
needs validation
open question
unclear
TBD (to be determined)
to be figured out
we aren't sure
we don't yet know
frankly
honestly
privately
```

**Korean (extending):**

```
아직 확정 전
우려
미해결
가정                   (except when within [ASSUMED:...] tag)
확신 없음
걱정
확인 필요
미정
아직 모름
솔직히
사실
내부적으로는
아직 검증 전
아직 증명 전
```

**Hybrid pattern (same shape as Phase 4 ALIGN D-03):**

1. Deterministic screen — grep candidate against the keyword list above WHEN the frontmatter declares `audience.type: external` OR `audience.confidentiality: external`. Any hit → `material` finding at minimum; `blocking` if 3+ hits cluster in one section.
2. LLM pass — semantic judgment on subtler leakage (creative avoidance of keywords). Same structured verdict shape.

**Merge rule:** Deterministic fires first; LLM adds. Any `blocking` finding → `DRIFTED-content` decision.

Korean startup DD memo equivalents researched: searches returned no dominant public memo template; Phase 9 HRD-04 pilot is the refinement venue for Korean financial-sector specific hedging vocabulary (e.g., 가능성 있음 / 검토중). Initial list above is the v1 shipping set.

### Q9 — Category multi-select UX in `/brief-discover`

**AskUserQuestion native surface:**

```xml
<askuserquestion>
  <question>
어떤 연구 영역이 필요하신가요? 여러 개를 선택하실 수 있습니다.
Which research areas do you need? Multi-select supported.
  </question>
  <multiSelect>true</multiSelect>
  <options>
    <option>Market Sizing — 시장 규모 (TAM/SAM/SOM)</option>
    <option>Competitor Landscape — 경쟁사 맵</option>
    <option>Customer Research — 고객 연구</option>
    <option>Regulation & Compliance — 규제·컴플라이언스</option>
    <option>Technology & Feasibility — 기술·실현 가능성</option>
    <option>Distribution Channels — 유통 채널</option>
    <option>Pricing Benchmarks — 가격 벤치마크</option>
    <option>Case Studies — 사례 연구</option>
    <option>Trends & Forecasts — 트렌드·예측</option>
    <option>Other — 사용자 정의 (free-text)</option>
  </options>
</askuserquestion>
```

**Validation rules:**
- If user selects 0 options (multiSelect but none checked): re-prompt with `최소 한 개 이상 선택해 주세요 / Please pick at least one category`.
- If user selects only "Other" without free-text: re-prompt for topic with `사용자 정의 주제를 입력해 주세요 / Please describe your custom research topic`.
- If free-text is degenerate (< 10 chars or matches "stuff"/"things"): re-prompt with example phrasing hint.

**`text_mode` fallback (numbered list):**

```
어떤 연구 영역이 필요하신가요? 쉼표로 구분해 여러 개를 입력하세요.
(예: 1,3,7 또는 1,3,Other:Localization infrastructure for Japanese market)

  1. Market Sizing
  2. Competitor Landscape
  3. Customer Research
  4. Regulation & Compliance
  5. Technology & Feasibility
  6. Distribution Channels
  7. Pricing Benchmarks
  8. Case Studies
  9. Trends & Forecasts
  10. Other (free-text)

선택 >
```

User input parsing: comma-separated list; numeric → corresponding default category; `Other:TOPIC` → custom with topic. Empty input → re-prompt.

**Known bug note:** When AskUserQuestion multiSelect + "Other" coexist, typing number keys 1-9 while focused on "Other" text input shortcut-selects the numbered option instead of entering the digit [CITED: github.com/anthropics/claude-code/issues/22300|2026-04-22]. Phase 5 mitigation: instruct user in the "Other" option label that they should paste numeric-containing topics OR fall back to text_mode. Also reported as a low-severity Phase 9 HRD-03 follow-up item.

### Q10 — Pre-commit hook integration → Example 2 (hook skeleton) + Pattern 4 (Provenance Regex)

**Activation path (mirrors `brief-validate-commit.sh`):**

1. `bin/install.js` registers `hooks/brief-validate-provenance.sh` alongside existing hooks (new SRC tuple for Phase 5 planner). Hook is copied to the user's `.claude/hooks/` directory on install (same as `brief-validate-commit.sh`).
2. Claude Code's hook-registration config (PreToolUse matcher for `Bash` tool with pattern `^git[[:space:]]+commit`) triggers the hook on every `git commit` bash command.
3. Inside the hook: opt-in gate on `hooks.community: true` in `.planning/config.json` — same pattern as existing hook (line 12-17 verbatim copy).
4. If opt-in, hook enumerates staged files via `git diff --cached --name-only --diff-filter=AM`, applies allowlist filter, runs include-AND-NOT-exclude regex, checks ±2 line tag proximity, emits structured JSON block decision with exit 2 on violation.
5. Error message format: Korean + English based on Korea-signal from config (same pattern as provenance/audience output language rules).

**Git pre-commit chain integration:**

| Question | Answer |
|----------|--------|
| Does `brief-validate-commit.sh` need modification? | **No** — the provenance hook registers independently. Both hooks run on the same `git commit` bash command; both are PreToolUse with the same matcher; their decisions merge (any `block` decision blocks the commit). |
| Claude Code installs hooks where? | `~/.claude/hooks/` for user-level OR `.claude/hooks/` for project-level. `bin/install.js` copies the `.sh` to both locations per existing pattern. |
| If `hooks.community: false` (or key absent)? | Both hooks exit 0 silently; commit proceeds normally. |
| Does the hook distinguish "untagged quantitative claim" from "allowlisted reference"? | Yes — the allowlist regex `ALLOWLIST_REGEX='^(brief/references/compliance/|brief/references/.*-vocabulary\.md|\.planning/research/|tests/fixtures/)'` matches BEFORE the provenance scan. Reference files describing penalty ceilings (e.g., "10% of total turnover") are exempt. |

**Error message format (Korean / English per Korea-signal):**

```json
{
  "decision": "block",
  "reason": "⚠ 커밋이 차단되었습니다. 정량적 주장에 출처 태그가 없습니다.\n\n다음 줄에 [VERIFIED:url|YYYY-MM-DD], [ASSUMED:rationale], 또는 [FOUNDER-INPUT] 태그를 추가해 주세요:\n  .planning/discover/market-sizing.md:42: 시장 규모 ₩4조\n  .planning/discover/market-sizing.md:58: 성장률 23%\n\n필요하다면 같은 줄에 <!-- brief-provenance: allow --> 주석을 추가해 예외 처리할 수 있습니다 (사내 문서 등)."
}
```

English variant:

```json
{
  "decision": "block",
  "reason": "Commit blocked: quantitative claims without provenance tag.\n\nAdd [VERIFIED:url|YYYY-MM-DD], [ASSUMED:rationale], or [FOUNDER-INPUT] near:\n  .planning/discover/market-sizing.md:42: $4B market\n  .planning/discover/market-sizing.md:58: 23% growth\n\nTo allow a specific line as prose (not a claim), add <!-- brief-provenance: allow --> inline."
}
```

### Q11 — Validation Architecture (Nyquist) → above `## Validation Architecture` section

Expanded coverage per dimension in that section. 25+ test files identified as Wave 0 gaps. Coverage target ≥ 70% (Phase 2 inherited).

### Q12 — Inherited primitives Phase 5 MUST NOT break

| Primitive | How Phase 5 preserves it |
|-----------|--------------------------|
| STATE.md file lock | AUDIENCE commit uses existing `readModifyWriteStateMd()` + atomic `brief-tools.cjs commit --files` call (same pattern as Phase 4 ALIGN commit). |
| Multi-runtime detection | `/brief-discover` AskUserQuestion multi-select has `text_mode` numbered-list fallback (covered in Q9). AUDIENCE 3-path interrupt reuses Phase 4 shape that already works across runtimes. `<business_context>` XML block is runtime-agnostic. |
| `node:test` + c8 70% line threshold | Phase 5 adds ~25 test files; coverage ≥ 70% per fixture-heavy test design (Wave 0 gaps listed above). |
| Zero runtime deps (A1 VERIFIED) | NO new entries to `package.json` `dependencies`. All Phase 5 artifacts are inline `.cjs` logic, shell hook, markdown files, or reference docs. |
| CLAUDE.md Surface Caps | Phase 5 net user-facing command additions = **0**. `/brief-discover` stub (Phase 3) is body-replaced, not added. `audience` / `context-block` verbs route through existing `brief-tools.cjs` dispatcher. |

## Sources

### Primary (HIGH confidence)

- **BRIEF codebase** — direct inspection 2026-04-22:
  - `brief/bin/lib/align.cjs` (390 lines, Phase 4 canonical ALIGN lib)
  - `brief/bin/lib/align-report.cjs` (63 lines)
  - `brief/bin/lib/objectives.cjs` (reader + validator)
  - `brief/bin/lib/define.cjs` (detectKoreaSignals, KOREA_SIGNAL_PATTERNS)
  - `brief/bin/lib/state.cjs` (readModifyWriteStateMd)
  - `brief/bin/lib/frontmatter.cjs` (Phase 2 D-20 extended)
  - `agents/brief-align-gate.md` (263 lines, Phase 4 template)
  - `brief/workflows/align-gate.md` (352 lines)
  - `brief/workflows/discover.md` (95 lines, Phase 3 stub)
  - `brief/references/align-vocabulary.md` (57 lines)
  - `hooks/brief-validate-commit.sh` (48 lines, hook shape template)
  - `.planning/config.json` (hooks.community opt-in pattern)
  - `.planning/ASSUMPTIONS.md` (A1 + A4 + FND-06 + FND-07 VERIFIED)
- **Anthropic "Building Effective Agents"** — orchestrator-workers + evaluator-optimizer pattern canonical definitions. [VERIFIED: anthropic.com/research/building-effective-agents via CONTEXT §External Inspiration|2026-04-22]
- **Anthropic Engineering — Multi-Agent Research System** — 3-5 subagent parallel spawn + synchronous wave execution documented. [VERIFIED: anthropic.com/engineering/multi-agent-research-system|2026-04-22]
- **Claude Code — Sub-agents docs + AskUserQuestion docs** — Task tool batch-parallel semantics; multiSelect + "Other" support. [VERIFIED: code.claude.com/docs/en/sub-agents + code.claude.com/docs/en/agent-sdk/user-input + github.com/Piebald-AI/claude-code-system-prompts AskUserQuestion tool description|2026-04-22]

### Secondary (MEDIUM confidence — multi-source corroboration)

- **Korea PIPA 2026 amendment** — promulgation 2026-03-10, effective 2026-09-11, penalty ceiling 10% of turnover, CEO personal supervisory liability:
  - [IAPP — South Korea overhauls PIPA](https://iapp.org/news/a/south-korea-overhauls-pipa-and-ties-fines-to-ceo-accountability) — accessed 2026-04-22
  - [Chambers and Partners Data Protection & Privacy 2026 — South Korea](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments) — accessed 2026-04-22
  - [Captain Compliance — South Korea CEO Personally Responsible](https://captaincompliance.com/education/south-korea-just-made-the-ceo-personally-responsible-for-data-breaches/) — accessed 2026-04-22
  - [DGC Briefings — Korea's New PIPA Amendments](https://dgcbriefings.substack.com/p/south-korea-koreas-new-pipa-amendments) — accessed 2026-04-22
- **Korea ISMS-P 2027-07-01 mandatory certification** — designated large-scale controllers:
  - [Chambers — Data Protection 2026 South Korea](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments) — accessed 2026-04-22
  - [Thales — South Korea's PIPA Compliance](https://cpl.thalesgroup.com/compliance/apac/south-koreas-pipa) — accessed 2026-04-22
- **Korea MyData 2026 expansion** — Feb 2026 enforcement decree expands scope to all industries with 10 priority sectors:
  - [Seoul Economic Daily — Korea Expands MyData Rights](https://en.sedaily.com/technology/2026/03/12/korea-expands-mydata-rights-to-all-industries-offers-12m-in) — accessed 2026-04-22
  - [DigitalToday — PIPC 2026 MyData service support](https://www.digitaltoday.co.kr/en/view/34941/pipc-seeks-applicants-for-2026-mydata-service-support-programme) — accessed 2026-04-22
  - [Library of Congress — Amended PIPA](https://www.loc.gov/item/global-legal-monitor/2025-06-23/south-korea-amended-personal-information-protection-act-expands-individuals-control-over-personal-data/) — accessed 2026-04-22
- **Claude Code Task batch-wave semantics** — multiple independent sources confirm synchronous wave:
  - [MindStudio — Claude Code Agent Teams](https://www.mindstudio.ai/blog/what-is-claude-code-agent-teams) — accessed 2026-04-22
  - [Sulat AI — Claude Code's task primitives](https://ai.sulat.com/claude-codes-task-primitives-from-single-threaded-assistant-to-parallel-powerhouse-540bfbc8fc60) — accessed 2026-04-22
  - [SitePoint — Claude Code Agent Teams setup](https://www.sitepoint.com/anthropic-claude-code-agent-teams/) — accessed 2026-04-22
  - [claudefa.st — Sub-Agents best practices](https://claudefa.st/blog/guide/agents/sub-agent-best-practices) — accessed 2026-04-22
- **AskUserQuestion number-key bug** — known issue with "Other" free-text + number keys:
  - [GitHub anthropics/claude-code Issue #22300](https://github.com/anthropics/claude-code/issues/22300) — accessed 2026-04-22

### Tertiary (LOW confidence — single-source or absence-of-evidence)

- **Korean VC thesis market-size range conventions** — searched for Hashed / Altos / Primer Sazze conventions in 2025-2026; did not surface public primers specifying "range from N sources" format. Phase 5 adopts the Sequoia/YC generic "range from N sources, YYYY" shape as best-practice default. [ASSUMED: Korean VC template preferences; revisit in Phase 9 HRD-04 pilot if Korean reviewers surface preferred phrasings.]
- **Korean startup DD memo hedging vocabulary** — searches for public sample DD memos returned aggregator sites (Beatblade, NextUnicorn summaries) rather than primary-source templates. Phase 5 Q8 keyword list is the v1 shipping set; v1.x expansion via Phase 9 pilot. [LOW — expected to evolve.]
- **MyData operator licensing regime specifics** — PIPC's Feb 2026 decree expands scope, but exact operator licensing framework details are "under development" per multiple sources. Primer notes this explicitly; no assertions about licensing specifics. [VERIFIED ABSENCE — multiple sources confirm no published operator licensing framework for non-finance sectors as of 2026-04-22.]

## Metadata

**Confidence breakdown:**

- Phase 4 template inheritance + delta tables: **HIGH** — exact file counts, grep outputs, and structural diff examples verified from live codebase.
- Regex design (provenance): **HIGH** — patterns tested against 13 fixture shapes mentally; planner iterates at execution time.
- Wave-based Task spawn: **HIGH on pattern documentation; MEDIUM on exact batch-semantics timing**. Anthropic documents synchronous waves. Smoke test mandatory before 4-wide.
- Korea regulatory dates (PIPA 2026-09-11 effective; ISMS-P 2027-07-01 mandatory; 10% penalty ceiling): **HIGH** — four independent legal-source agreement.
- MyData 10 priority sectors: **HIGH** — Seoul Economic Daily + DigitalToday + Library of Congress agreement; operator licensing: **LOW** (verified absence of framework).
- B2B/B2C 9×2 matrix: **MEDIUM** — derived from PITFALLS.md / ARCHITECTURE.md / CLAUDE.md cross-references + researcher reasoning; not a single cited source.
- AUDIENCE DRIFTED-content keyword list: **MEDIUM** — English list is canonical; Korean list derived from sample Korean business writing patterns + Phase 3 D-11 Korea-first tone; pilot-driven refinement expected.
- `buildBusinessContext()` API design: **HIGH** — return shape mirrors existing `objectives.cjs` + `define.cjs` reader patterns; XML block format matches Phase 4 delimiter precedent.

**Research date:** 2026-04-22

**Valid until:**
- **Korea regulatory content:** 90 days (2026-07-22) — regulatory dates can shift; primer last_reviewed discipline + Phase 9 HRD-04 refresh required.
- **Wave-based Task spawn documentation:** 60 days (2026-06-21) — Claude Code mechanics evolve.
- **Everything else:** 90 days (2026-07-22) — stable ecosystem surfaces.

---

*Phase 5 research complete. Phase 5 planner should now draft PLAN files matching the 8-commit granularity suggested in CONTEXT §D-16 Claude's Discretion, with the wave-spawn smoke test (Pitfall 2 mitigation) as the FIRST technical milestone before committing to the 4-wide researcher orchestration.*
