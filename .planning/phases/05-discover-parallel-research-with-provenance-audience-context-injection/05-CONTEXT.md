# Phase 5: DISCOVER — Parallel Research with Provenance + AUDIENCE + Context Injection - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning
**Mode:** Interactive — default per-area pacing. 4 gray areas discussed (A1, A2, A3, A5); A4 (Korea reference library) routed to Claude's Discretion with documented defaults. 15 decisions (D-01..D-15) + 1 meta-discipline (D-16). All recommended options selected; no area re-opened.

<domain>
## Phase Boundary

Phase 5 ships the DISCOVER parallel-research flow with **three new subsystems** plus **one cross-cutting primitive** that every subsequent phase inherits:

1. **Researcher orchestration** — `/brief-discover` runs one parameterized `brief-domain-researcher.md` agent across 9 default categories + user-selectable Custom, gated by a wave-based parallel cap of 4 concurrent spawns.
2. **Provenance tag system** — mandatory `[VERIFIED|ASSUMED|FOUNDER-INPUT]` tags on quantitative claims. Enforced at **agent output time** (researcher prompt) AND at **pre-commit time** via a new shell hook (`hooks/brief-validate-provenance.sh`).
3. **AUDIENCE guard** — the FIRST replication of the Phase 4 ALIGN canonical pattern. 3-output verdict (AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content), paired-sibling filename scheme `{artifact}.audience.md` (this same scheme retroactively migrates Phase 4's `.planning/ALIGN-00.md` → `.planning/OBJECTIVES.align.md`).
4. **B2B/B2C context injection** (cross-cutting primitive CC-02) — reusable helper `brief/bin/lib/context-inject.cjs` that builds a `<business_context>` block the orchestrator embeds in every `Task` spawn. Phase 6/7/8 inherit.

Plus: the Korea-first compliance reference library skeleton (1-page primers for PIPA / ISMS-P / MyData) and replacement of the `/brief-discover` command body (Phase 3 Plan 05 shipped the stub + block-gate + stale-anchor entry).

**What Phase 5 does NOT deliver (explicit non-goals):**

- COMPLIANCE checker (Phase 7 territory — it copy-renames the AUDIENCE pattern Phase 5 lands here).
- Type A / Type B DELIVER artifacts + mandatory `/brief-export` step + filename audience encoding + watermark (Phase 8 territory).
- Per-workstream OBJECTIVES.md (Phase 7 via `/brief-add-workstream`).
- Bidirectional Phase 1 ↔ Phase 2 return-stack + gap-detector + meta-arbiter (Phase 6).
- `/brief-add-workstream` dynamic-workstream addition (Phase 7).
- Full clause-level Korean compliance content (v2 — CC-V2-01).
- Any NEW top-level user-facing slash command beyond the `/brief-discover` body replacement (surface cap — FND-09 + Phase 2 D-06..D-09).
- Cross-artifact leakage diff check between coexisting artifacts (Phase 8 DELIVER concern — multiple Type B artifacts in same folder).

**Why Phase 5 is pivotal:** Phase 4 exercised ALIGN on OBJECTIVES.md self-coherence (candidate = baseline). Phase 5 is the FIRST true cross-artifact gate run: AUDIENCE evaluates research artifacts against their own frontmatter AND against OBJECTIVES.md (`audience_policy`). Whatever 3-output vocabulary, frontmatter strictness, and filename scheme land here become the template Phase 7 COMPLIANCE literally copy-renames. Drift here = Phase 7 re-architects.

</domain>

<decisions>
## Implementation Decisions

### Area A1 — Researcher Architecture

- **D-01: ONE parameterized agent file — `agents/brief-domain-researcher.md`.** Parameterized by `{{CATEGORY}}` + `{{BUSINESS_MODEL}}` + `{{REGION}}` + `{{TOPIC}}` at Task-spawn time. Same agent for all 9 defaults (Market Sizing, Competitor Landscape, Customer Research, Regulation & Compliance, Technology & Feasibility, Distribution Channels, Pricing Benchmarks, Case Studies, Trends & Forecasts) AND for Custom categories. DRY-friendly; matches Phase 4 D-01 "favor template-friendly patterns over phase-specific optimizations" discipline.
  - **Rejected:** 9 separate agent files (DRY violation, shared-concern-drift risk); extending `brief-phase-researcher.md` (different output shape — planner-input RESEARCH.md vs business-domain findings).

- **D-02: Wave-based queue for parallel cap of 4.** User selects N categories; orchestrator splits into `ceil(N/4)` waves of ≤4 each. Wave i spawns up to 4 `Task` calls in a single message; orchestrator waits for all to return before spawning wave i+1. Matches Anthropic's multi-agent best practice (explicit waves, bounded parallelism, clean handoff boundaries). Clean checkpoint/resume semantics.
  - **Rejected:** Semaphore-like continuous (harder coordination, muddled wave boundary for checkpoint/resume); sequential (violates DSC-03 parallelism requirement — 9 sequential ≈ 9× wall time vs 3 waves of 4).

- **D-03: Per-category output files in `.planning/discover/`.** Flat structure: `.planning/discover/market-sizing.md`, `.planning/discover/competitor-landscape.md`, … (+ Custom categories by slug). One file per category. Easy to re-run single category without clobbering others; aligns with "one researcher = one output file" pattern already used by `brief-phase-researcher.md`; Phase 7 DESIGN workstreams read by filename.
  - **Rejected:** Nested under phase directory (confuses build-phase-owns-artifact with runtime-phase-produces-artifact); single consolidated DISCOVER.md (concurrent-write serialization, muddled re-run semantics).

- **D-04: Custom categories use the generic template with user-supplied topic.** User types custom topic (e.g., "Localization infrastructure for Japanese market"); orchestrator plugs it into the same `brief-domain-researcher.md` template via `{{TOPIC}}` — same provenance discipline, same AUDIENCE frontmatter, same B2B/B2C context injection. Zero per-custom prompt engineering; consistent quality.
  - **Rejected:** User-provides-full-prompt (offloads prompt-engineering to non-technical planner, Pitfall #9); interactive prompt builder (defer to v1.x if pilot demands).

### Area A2 — Provenance Tag System

- **D-05: "Quantitative claim" scope = market/money numbers + percentages + multipliers + explicit market/revenue/growth phrasings.** Pre-commit regex matches:
  - Currency symbols: `₩`, `$`, `€`, `¥` (including abbreviations: `B`, `M`, `K`, `조`, `억`, `만`).
  - Percentages: `23%`, `23.4%`, `성장률 23%`, etc.
  - Multipliers: `3x`, `10x`, `3배`, `10배`.
  - Explicit phrasings: market-size / revenue / growth-rate / CAGR / YoY / MRR / ARR.
  - Excludes: dates (`2026`), article / clause numbers (`Article 30`, `제15조`), version strings (`v1.2`), page refs (`page 15`), prose quantifiers (`three principles`, `first quarter`, `세 가지 원칙`).
  - Planner ships the canonical regex list + a ban-list extension policy mirroring Phase 4 ALIGN vocabulary extension discipline.
  - **Rejected:** All-numbers (high false-positive rate; tune-out risk → Pitfall #4 theater); LLM-classified-only (loses the mechanical CI-time gate CC-04 demands; complement but not replace regex).

- **D-06: Pre-commit hook = shell — `hooks/brief-validate-provenance.sh`.** New PreToolUse hook mirroring `brief-validate-commit.sh` shape: opt-in via `hooks.community: true` in `.planning/config.json`; grep + awk for D-05 quantitative patterns in staged files; if pattern found without a nearby `[VERIFIED:...]` | `[ASSUMED:...]` | `[FOUNDER-INPUT]` tag, block commit with structured Korean/English error (Korea-signal detection inherited from Phase 3 D-11). Zero Node startup cost per commit.
  - **Rejected:** Node-based hook (~200 ms startup per commit, inconsistent with existing shell hook shape); inline in `brief-tools.cjs commit` (misses direct `git commit` — CC-04 mandates real git hook).

- **D-07: Double-layer enforcement — agent-output + pre-commit.** The researcher agent prompt (`brief-domain-researcher.md`) REQUIRES `[VERIFIED|ASSUMED|FOUNDER-INPUT]` tags on every quantitative claim it writes (prompt-level discipline; mirrors Phase 4 ALIGN vocabulary-ban-in-prompt pattern). The pre-commit hook verifies at commit time (mechanical safety net). Defense in depth: agent drift → hook catches; user manual edit → hook catches; user-added content in Phase 7+ → hook catches.
  - **Rejected:** Pre-commit only (every run produces an initial blocked commit → friction); agent-output only (no real CI-time gate, violates CC-04 hard block rule).

- **D-08: Confidence bands (ranges) = HARD rule in researcher prompt.** Per Pitfall #6 false-precision risk (27% hallucination rate in earnings predictions; false precision compounds):
  - Researcher MUST emit ranges with source count for market-size / growth-rate claims: `₩4–6T (range from 3 sources, 2025)`, not `₩4.7T`.
  - Point estimates permitted ONLY when from a single authoritative source AND accompanied by `[VERIFIED:url|access-date]`.
  - Non-range claims without single-authoritative-source MUST be tagged `[ASSUMED:reasoning]`.
  - Range format is PROMPTED, not regex-enforced (ranges are hard to regex reliably). Phase 7/8 COMPLIANCE / investor-facing gate enforces at artifact level.
  - **Rejected:** Advisory-only (weakens Pitfall #6 mitigation); defer to Phase 7 (hallucination happens at research time — catching downstream is too late).

### Area A3 — AUDIENCE Guard (Phase 4 Replica) — HIGH LEVERAGE

- **D-09: Literal 3-output preservation of the Phase 4 ALIGN shape.**
  - `AUDIENCE-OK` — all 3 mandatory frontmatter fields present and well-formed, content consistent with declared audience.
  - `DRIFTED-frontmatter` — 1+ mandatory fields missing or malformed; recoverable via inline frontmatter fix OR `/brief-define --amend` for `business_context.model` conflict.
  - `DRIFTED-content` — content contradicts declared audience (e.g., internal-only strategy language in artifact with `audience.type: external`, or hedging vocabulary — "we believe", "TBD", "still proving" — in an external artifact).
  - 3-path user interrupt (Phase 4 D-06) replicated verbatim: `audience 수정하기` / `이 문서 다시 쓰기` / `현재 상태 승인, 계속 진행 (force-accept)`.
  - `force-accept` with user-typed justification + audit trail (Phase 4 D-07) inherited. `state.brief.last_gate_results.audience` stores `{decision, severity, findings_count, at, override?, override_reason?}`.
  - Phase 7 COMPLIANCE copy-renames again — literal preservation keeps all 3 gates vocabulary-uniform.
  - **Rejected:** 2-output PASS/BLOCK (breaks template uniformity; forces Phase 7 to invent new shape — Phase 4 D-01 violation); 3-output with AUDIENCE-specific semantics (FLAGGED vs BLOCKED — intuitive but Phase 7 can't literally copy).

- **D-10: Frontmatter schema = 3 mandatory + 3 auto-populated via context injection.**
  - **Mandatory** (hard block if missing or malformed): `audience.type`, `audience.confidentiality`, `business_context.model`.
  - **Auto-populated** from OBJECTIVES.md + `state.brief.*` at artifact-write time, user override inline: `audience.role`, `voice.tone`, `voice.perspective`.
  - Auto-population uses the `buildBusinessContext()` helper (D-14) so there is one source of truth for business-context field values.
  - Reasoning: 3 hard-required prevents leakage (Pitfall #5); 3 defaulted prevents planner fatigue (Pitfall #9).
  - **Rejected:** All 6 strictly mandatory (non-technical planner fills 6 fields per artifact — Pitfall #9 friction); all 6 optional (nothing to enforce — defeats the purpose).

- **D-11: Paired-sibling filename scheme — `{artifact}.audience.md`.** AUDIENCE output lives NEXT TO the source artifact: `.planning/discover/market-sizing.md` + `.planning/discover/market-sizing.audience.md`. Grep-able by `find -name '*.audience.md'`; scales naturally to 9+ parallel callers in Phase 5 and to Phase 7 COMPLIANCE's `{artifact}.compliance.md`.
  - **Rejected:** Aggregated gate directory (`.planning/audience/...` — mental indirection to find gate output); single rolling audit log (concurrent-write serialization; rolling log muddles per-artifact diffability; mismatch with ALIGN's per-artifact file model).

- **D-12: Phase 4 ALIGN filename migrates atomically within Phase 5 scope.** `.planning/ALIGN-00.md` → `.planning/OBJECTIVES.align.md` in a single commit inside Phase 5. Phase 4 CONTEXT explicitly deferred "multi-orchestrator run-id disambiguation for ALIGN-*.md filenames" to Phase 5 planner. Zero-risk migration (single file rename + 5 code path updates: `align.cjs`, `align-report.cjs`, `status.cjs`, `commands/brief/define.md`, `brief/workflows/define.md`). Uniform scheme across all 3 gates (ALIGN / AUDIENCE / COMPLIANCE).
  - **Rejected:** Keep `ALIGN-00.md` + new scheme for AUDIENCE only (divergent schemes across 3 gates = ongoing confusion; migration cost is trivial now).

### Area A5 — B2B/B2C Context Injection (Cross-Cutting CC-02)

- **D-13: Orchestrator pre-injects `<business_context>` block into Task prompt.** Orchestrator workflow reads `state.brief.*` + OBJECTIVES.md, builds a formatted `<business_context>` block (business_model, region, audience_policy, compliance_packs), and embeds it in the Task prompt BEFORE spawning the subagent. Agent receives the block in-prompt; no file-reading indirection inside the agent. Works identically across Claude Code / Codex / Gemini / OpenCode (FND-06 inheritance). Matches Phase 4 ALIGN's `{{CANDIDATE_PATH}}` / `{{BASELINE_PATH}}` injection pattern.
  - **Rejected:** Agent reads `state.brief.*` at spawn time (couples every new agent to the parsing logic; inconsistent if an agent forgets a field); environment variable via Task spawn args (Task tool env-var support is unreliable across runtimes).

- **D-14: Reusable helper — `brief/bin/lib/context-inject.cjs`.** `buildBusinessContext({ objectivesPath?, statePath? })` reads `.planning/OBJECTIVES.md` + `state.brief.*` + `config.json`, returns a formatted `<business_context>` block plus the 3 auto-populated AUDIENCE frontmatter fields (D-10). Orchestrator workflows call it before every `Task` spawn. Single source of truth for business-context semantics across Phase 5/6/7/8. Matches Phase 2 D-18 workflow-markdown + lib.cjs split.
  - **Rejected:** Inline-in-each-workflow (duplicated across 9+ workflows, drift risk); `brief-tools.cjs context-block` subcommand (CLI shim with no benefit over direct lib import from workflow scripts).

- **D-15: B2B/B2C divergence lives in the researcher agent prompt as conditional blocks.** `brief-domain-researcher.md` reads the injected `<business_context>` block, then applies conditional prose inline in its own prompt. Example skeleton (planner fills in final prose):
  ```
  If business_model=b2b OR enterprise:
    emphasize distribution channels, enterprise buyer journey,
    procurement cycles, pilot→rollout pattern, contract terms.
  If business_model=b2c OR b2b2c:
    emphasize personas, jobs-to-be-done, viral / word-of-mouth
    mechanics, retention cohorts, app-store economics.
  ```
  Category-specific guidance co-located with business-model guidance in one prompt file.
  - **Rejected:** Separate reference file (extra load + reasoning burden on agent to combine lens with category prompt); lib-helper-generated lens text (couples business-lens prose to JS — harder for non-developers to tune).

### Meta-Discipline

- **D-16: "적정선" lock inherited from Phase 3 D-08 / Phase 4 D-10.** 4 areas (A1, A2, A3, A5) resolved interactively with user-confirmed recommended options; A4 (Korea reference library) routed to Claude's Discretion with a default design documented below. Planner, executor, verifier should resolve implementation-level unknowns (specific regex patterns, exact conditional prose, reference-file depth, button wording, test fixture shape) themselves; return to CONTEXT discussion only if a gap surfaces that changes D-01..D-15.

### Claude's Discretion

The planner has flexibility on:

- **A4 — Korea compliance reference library (default design):**
  - **Location:** `brief/references/compliance/korea/` — 3 files: `pipa-2026.md`, `isms-p.md`, `mydata-2026.md`.
  - **Format:** Markdown with YAML frontmatter for queryability:
    ```yaml
    region: kr
    industry: [fintech, healthcare, ecommerce]   # applicable industries
    effective_date: 2026-02-XX                    # regulation effective date
    penalty_ceiling: "10% of total turnover"      # headline penalty
    last_reviewed: 2026-04-22                     # refresh discipline
    ```
  - **Body:** ~400–800 words per primer. Sections: `## Scope`, `## Key Articles / Clauses (high-level)`, `## Common Gotchas`, `## Penalties + CEO Liability`, `## Legal Counsel Disclaimer`, `## Sources (URL + access date)`.
  - **Mandatory disclaimer (verbatim):** `> Not legal advice. Refer to qualified Korean counsel before acting on findings.`
  - **Auto-attach:** When `state.brief.compliance_packs` contains "PIPA" / "ISMS-P" / "MyData", orchestrator loads the matching primer(s) as `required_reading` in the spawned researcher agent via the D-13 injection pattern. Planner implements in `context-inject.cjs`.
  - **v1 scope:** Skeleton only (1-page primer per item). Clause-level expansion is explicitly CC-V2-01 (v2).

- **Exact regex patterns for D-05 quantitative detection.** Planner ships canonical pattern set; extend iteratively from execution-time false-positives/-negatives (Phase 4 ALIGN vocabulary-ban-list extension discipline).
- **Exact Korean + English 3-path interrupt button wording for AUDIENCE DRIFTED paths.** Semantics locked by D-09. Prose follows Phase 3 D-12 tone (recovery-oriented, concrete, never blame) + Phase 4 D-06 Korean patterns.
- **`buildBusinessContext()` block format** — inline XML (`<business_context>...</business_context>`), YAML frontmatter style, JSON block, or delimited prose. Pick one; use consistently across all spawn sites.
- **Researcher output file section structure (Summary / Findings / Sources / Provenance Audit, etc.).** D-10 locks the frontmatter; section structure is planner's domain. Document as a template in the agent prompt.
- **Canary scope** — what "the pattern is proven" means for Phase 5. Planner decides minimum end-to-end: e.g., run 2–3 researcher categories in one wave through the full flow (spawn → output → AUDIENCE pass → provenance regex → commit). Fixture-based tests cover other categories. Keep canary to ≤ 1–2 wall-clock hours for one planner.
- **Test fixture granularity** — 1 test file per subsystem (researcher / provenance / AUDIENCE / context-inject) vs combined. Coverage ≥ 70% (Phase 2 inherited threshold).
- **State allowlist extensions.** D-13 reads existing `state.brief.*` fields; no NEW writes anticipated. If planner finds a need (e.g., `state.brief.discover_wave_status` for mid-wave checkpoints), extend per Phase 2 D-21.
- **Internal structure of `brief/bin/lib/audience.cjs`** — follow `align.cjs` structure (deterministic screen + LLM pass + merged verdict) with AUDIENCE-specific adjustments. Keep < ~400 lines (Phase 2 D-18).
- **Commit granularity.** Suggested atomic commit breakdown (each buildable):
  1. `context-inject.cjs` helper + tests.
  2. `brief-domain-researcher.md` agent + wave orchestration logic.
  3. `brief-validate-provenance.sh` hook + regex fixtures.
  4. `brief-audience-guard.md` + `audience-guard.md` workflow (duplicate-rename from ALIGN) + `audience.cjs` lib + vocabulary reference.
  5. Paired-sibling filename scheme + ALIGN-00.md → OBJECTIVES.align.md migration (atomic).
  6. Korea compliance reference library skeleton (3 primers).
  7. `/brief-discover` body replacing the Phase 3 stub (preserves block-gate + stale-anchor).
  8. Canary E2E test + vocabulary-lock test + provenance-regex test.

### Folded Todos

(No todos matched Phase 5 scope — `brief-tools.cjs todo match-phase 5` returned 0 results.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level decisions and requirements
- `.planning/PROJECT.md` — "Continuous ALIGN at every milestone", "Audience guard: every artifact carries audience/confidentiality/voice frontmatter; leakage is blocked", "B2B/B2C context injector: every spawned agent inherits the right business model lens" key decisions; Korea-first + global compliance scope; non-technical planner persona.
- `.planning/REQUIREMENTS.md` §Phase 1 (DISCOVER) — **DSC-01 through DSC-07** (7 DISCOVER requirements: 9+Custom categories, 4-concurrent cap, provenance tags on every quantitative claim, B2B/B2C injection, Korea reference library, URL+access-date for market data) + **DSG-13** (AUDIENCE guard first-wire on research artifacts) + **CC-02** (B2B/B2C context injector on every spawned agent) + **CC-04** (provenance tag pre-commit enforcer). 10 requirements total — all traceable to D-01..D-15.
- `.planning/ROADMAP.md` lines 111-125 — Phase 5 goal + 7 success criteria + Pitfall coverage (#6 hallucinated market data, #11 Korean cultural gotchas, #4 compliance checkbox theater, #5 audience leakage).
- `.planning/ASSUMPTIONS.md` — A1 VERIFIED (zero runtime dependencies — Phase 5 MUST NOT add `gray-matter` / `ajv` / `js-yaml` / `@marp-team/marp-cli`); A4 VERIFIED (state round-trip works — safe to write `state.brief.last_gate_results.audience`).

### Prior-phase context (locked decisions Phase 5 inherits)
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md` — Phase 1 D-05 (aggressive rename — no `gsd-audience-*` / `gsd-discover-*` / `gsd-provenance-*` residues), D-07 (no aliases), D-09 (atomic buildable commits).
- `.planning/phases/02-stable-seam-anchor-schema-caps-workstream-as-config/02-CONTEXT.md` — Phase 2 **D-03** (forward-declared `state.brief.last_gate_results.audience` schema — Phase 5 is first writer), **D-06..D-09** (Surface Caps — Phase 5 net user-facing commands MUST be 0; `/brief-discover` stub replacement is not a new command), **D-18** (workflow-markdown + lib.cjs split; < ~400 lines/file), **D-20 / D-21** (frontmatter.cjs serializer + state allowlist — AUDIENCE frontmatter and `state.brief.last_gate_results.audience` writes inherit directly).
- `.planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md` — Phase 3 **D-08** ("적정선" lock; carries into Phase 5 D-16), **D-11** (Korea-signal detection — `context-inject.cjs` D-14 reads this), **D-12** (block-style error tone — provenance hook error messages inherit), **D-13** (stale-anchor 3-path interrupt — AUDIENCE DRIFTED D-09 replicates exact shape).
- `.planning/phases/04-first-gate-align-pattern-established/04-CONTEXT.md` — Phase 4 **D-01..D-09** (the ALIGN canonical pattern Phase 5 AUDIENCE literally duplicate-and-renames; D-01 subagent + workflow + lib triad; D-03 hybrid deterministic + LLM decision; D-04 severity vocabulary `blocking/material/nice-to-have`; D-05 findings structure `{severity, location, description}`; D-06 3-path interrupt; D-07 force-accept with audit trail; D-08 canary scope), **D-10** ("적정선" carry-forward), **D-11** (Korea-signal language rule — AUDIENCE output body inherits), deferred item **"multi-orchestrator run-id disambiguation for ALIGN-*.md filenames"** RESOLVED by Phase 5 D-11 / D-12 (paired-sibling scheme, Phase 4 migration atomic).

### Research synthesis (Phase 5-specific)
- `.planning/research/PITFALLS.md` §Pitfall #5 (Audience Leakage in Type B Artifacts) — mandates filename encoding + watermark + cross-artifact diff check + audience/voice as separate guards. Phase 5 D-09..D-12 (AUDIENCE 3-output, frontmatter schema) + D-13 (business_context injection) respond. Cross-artifact diff check deferred to Phase 8.
- `.planning/research/PITFALLS.md` §Pitfall #6 (Hallucinated Market Data and False Precision) — mandates source-mandatory mode, confidence bands, provenance tagging, driver-based bottom-up (Phase 7 territory). Phase 5 D-05..D-08 respond directly.
- `.planning/research/PITFALLS.md` §Pitfall #11 (Korean Cultural Gotchas) — Korea-first reference library, bilingual `.ko.md`/`.en.md` pairs (Phase 8 concern). Phase 5 ships reference-library skeleton (Claude's Discretion A4 default).
- `.planning/research/PITFALLS.md` §Anti-pattern #2 (Hook-spawned gates) — AUDIENCE MUST be explicit orchestrator step; NO PostToolUse / SubagentStop. Direct inheritance from Phase 4.
- `.planning/research/ARCHITECTURE.md` §Pattern 2 (Evaluator-Optimizer) — Phase 4 precedent; Phase 5 AUDIENCE is the first replication.
- `.planning/research/ARCHITECTURE.md` §Pattern 4 (Cross-Cutting Gate Auto-Attach via Orchestrator, NOT Hooks) — AUDIENCE invocation visible in `brief/workflows/discover.md`.
- `.planning/research/ARCHITECTURE.md` orchestrator-workers section — multi-agent parallel spawn best practice (explicit waves, bounded parallelism). Phase 5 D-02 follows.

### External inspiration (patterns, not dependencies)
- **Anthropic "Building Effective Agents"** — orchestrator-workers + evaluator-optimizer patterns. Phase 5 uses both (workers = ≤4 concurrent researchers per wave; evaluator = AUDIENCE guard).
- NOT a runtime dependency — absorbed as pattern.

### Files Phase 5 will create or modify

**NEW files:**
- `agents/brief-domain-researcher.md` — ONE parameterized researcher agent (D-01). Category + business_model + region + topic parameterized at Task-spawn time.
- `agents/brief-audience-guard.md` — **DUPLICATE-RENAMED** from `agents/brief-align-gate.md` with AUDIENCE semantics (D-09 3-output verdict schema, D-10 frontmatter rules, D-11 paired-sibling filename).
- `brief/workflows/audience-guard.md` — **DUPLICATE-RENAMED** from `brief/workflows/align-gate.md` (orchestrator-side gate step).
- `brief/bin/lib/audience.cjs` — **DUPLICATE-BASED** on `brief/bin/lib/align.cjs`. `audience run / commit / verdict` verb set mirroring `align`.
- `brief/bin/lib/context-inject.cjs` — **NEW** reusable helper (D-14). `buildBusinessContext()` + auto-populate for AUDIENCE D-10 frontmatter fields.
- `brief/references/audience-vocabulary.md` — **DUPLICATE-BASED** on `brief/references/align-vocabulary.md`. AUDIENCE-specific preferred vocabulary (Korean/English) + ban-list.
- `brief/references/compliance/korea/pipa-2026.md` — **NEW** 1-page primer (Claude's Discretion A4 default).
- `brief/references/compliance/korea/isms-p.md` — **NEW** 1-page primer.
- `brief/references/compliance/korea/mydata-2026.md` — **NEW** 1-page primer.
- `hooks/brief-validate-provenance.sh` — **NEW** PreToolUse hook (D-06). Shell shape mirroring `hooks/brief-validate-commit.sh`.
- `tests/brief-discover-*.test.cjs` — NEW test fixtures (planner granularity D-16): wave-queue parallelism; provenance regex positive/negative; AUDIENCE 3-output (OK / DRIFTED-frontmatter / DRIFTED-content); context-inject lib round-trip; paired-sibling filename scheme + Phase 4 ALIGN filename migration; vocabulary-lock.

**MODIFIED files:**
- `commands/brief/discover.md` — REPLACE placeholder body ("Phase 5 DISCOVER body — coming in Phase 5") with full DISCOVER flow. PRESERVE block-gate (Phase 3 D-12) + stale-anchor (Phase 3 D-13).
- `brief/workflows/discover.md` — REPLACE placeholder body with wave-based orchestration: category multi-select (DSC-01/DSC-02) → `context-inject.cjs` call → wave spawns of ≤ 4 `brief-domain-researcher.md` → per-category `.planning/discover/{slug}.md` + paired `.audience.md` via AUDIENCE gate.
- `brief/bin/brief-tools.cjs` — register `audience` subcommand (dispatches to `audience.cjs`). `discover` subcommand optional (planner call).
- `brief/bin/lib/status.cjs` — extend `formatGate` to ALSO read `state.brief.last_gate_results.audience`; path update for ALIGN filename migration (D-12).
- `commands/brief/define.md` + `brief/workflows/define.md` — path update for ALIGN filename migration (D-12): `ALIGN-00.md` → `OBJECTIVES.align.md` references.
- `brief/bin/lib/align.cjs` + `brief/bin/lib/align-report.cjs` — path update for ALIGN filename migration (D-12).
- `bin/install.js` — new SRC tuples: `brief-domain-researcher.md`, `brief-audience-guard.md`, `brief-validate-provenance.sh`, workflow + lib + reference files.
- `.planning/STATE.md` — first real write of `state.brief.last_gate_results.audience`.

**RENAMED file:**
- `.planning/ALIGN-00.md` → `.planning/OBJECTIVES.align.md` — atomic with Phase 5 AUDIENCE plan (D-12).

### Inherited primitives Phase 5 must NOT break
- STATE.md file lock (atomic commits) — AUDIENCE commit writes source artifact + sibling `.audience.md` + STATE.md atomically in one `brief-tools.cjs commit` call.
- Multi-runtime detection — `/brief-discover` multi-select category picker (DSC-01 / DSC-02) + AUDIENCE 3-path interrupt MUST work in Claude Code, Codex, Gemini, OpenCode (FND-06). `AskUserQuestion` → numbered-list in text_mode.
- `node:test` + c8 70% line threshold.
- Zero runtime dependencies rule (A1).
- CLAUDE.md Surface Caps — Phase 5 NET user-facing command additions MUST be 0. The `/brief-discover` stub already exists (Phase 3 Plan 05); Phase 5 replaces the body, does not add a new command.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (inheritance from Phase 1-4)

**Phase 4 templates that Phase 5 duplicate-renames (explicit D-01/D-09/D-11 instructions):**
- **`agents/brief-align-gate.md`** (Phase 4) — **TEMPLATE** for `agents/brief-audience-guard.md`. Copy + keyword swap:
  - `ALIGN` → `AUDIENCE`
  - `OBJECTIVES` (as baseline) → `{{ARTIFACT_FRONTMATTER + OBJECTIVES.audience_policy}}`
  - `{{CANDIDATE_PATH}}` → `{{ARTIFACT_PATH}}`
  - `ALIGNED / DRIFTED-objective-needs-update / DRIFTED-output-needs-revision` → `AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content`
  - Vocabulary ban-list token set extended with AUDIENCE-specific items.
- **`brief/workflows/align-gate.md`** (Phase 4) — **TEMPLATE** for `brief/workflows/audience-guard.md`.
- **`brief/bin/lib/align.cjs`** (Phase 4) — **TEMPLATE** for `brief/bin/lib/audience.cjs`. Deterministic screen + LLM pass + merged verdict; write `state.brief.last_gate_results.audience` atomically.
- **`brief/references/align-vocabulary.md`** (Phase 4) — **TEMPLATE** for `brief/references/audience-vocabulary.md`.

**Other reusable assets:**
- **`brief/bin/lib/align-report.cjs`** (Phase 4) — referenced by planner's decision on whether `audience-report.cjs` emerges as a separate file or is absorbed into `audience.cjs`.
- **`brief/bin/lib/state.cjs`** (Phase 2 D-20 / D-21) — `buildStateFrontmatter` preserves `brief:` map; `state.brief.last_gate_results.audience` writes via existing `state json` round-trip. NO state-schema change needed (Phase 2 D-03 forward-declared).
- **`brief/bin/lib/status.cjs:95`** (Phase 2 D-18) — `formatGate(...)` already handles `align`; extension to also read `audience` is mechanical (already schema-provisioned).
- **`brief/bin/lib/objectives.cjs`** (Phase 3) — reader for OBJECTIVES.md + config.json. `context-inject.cjs` (D-14) imports `readObjectives()` + reads `state.brief.business_model` / `region` / `audience_policy` / `compliance_packs`.
- **`brief/bin/lib/frontmatter.cjs`** (Phase 2 D-20) — round-trips nested maps + null + arrays-of-objects. Research artifact 6-field audience schema and AUDIENCE verdict frontmatter fit without further extension.
- **`hooks/brief-validate-commit.sh`** (existing) — **TEMPLATE** for `hooks/brief-validate-provenance.sh`. Same PreToolUse shape; same opt-in config gate (`hooks.community: true`); same Korean/English error format pattern.
- **`agents/brief-phase-researcher.md`** — existing dev-phase researcher. Phase 5 D-01 deliberately does NOT extend this (different output shape — planner-input RESEARCH.md vs domain-findings per category). The two agents coexist: `brief-phase-researcher.md` for tech-phase research, `brief-domain-researcher.md` for business-domain research.
- **`commands/brief/discover.md`** + **`brief/workflows/discover.md`** — Phase 3 stubs (block-gate + stale-anchor + Phase 5 placeholder message). Phase 5 REPLACES the placeholder body; preserves the two guards (Phase 3 D-12/D-13 plumbing).
- **`brief/bin/brief-tools.cjs`** — SDK dispatcher. Register new `audience` subcommand (and optional `discover` if planner splits workflow-vs-lib).

### Established Patterns
- **Workflow markdown + lib.cjs split** (Phase 2 D-18) — Phase 5 applies to `audience-guard.md` + `audience.cjs` and (optionally) `discover.md` + `discover.cjs`.
- **Agent file + workflow file + lib file triad** — Phase 4 precedent for ALIGN; Phase 5 AUDIENCE uses the identical shape; Phase 5 Researcher uses the pair (agent file + workflow, no separate lib needed per researcher).
- **Atomic commit per logical step** (Phase 1 D-09) — planner picks breakdown (see D-16 commit granularity discretion). Each buildable.
- **Fixture-based tests with Korea-first persona** (Phase 3 / 4 precedent) — Phase 5 test fixtures use Korean-first B2C baseline to exercise `buildBusinessContext()` + compliance-pack auto-attach + Korean AUDIENCE output body.
- **`text_mode` fallback** (Phase 1 FND-06) — `/brief-discover` multi-select categories + AUDIENCE 3-path interrupt both render via `AskUserQuestion` OR numbered-list depending on runtime.
- **Wave-based Task parallelism** — NEW pattern in Phase 5 (D-02). Phase 6/7 may inherit for multi-designer or multi-checker spawns.

### Integration Points
- **`commands/brief/discover.md`** — body replacement; preserves Phase 3 block-gate + stale-anchor.
- **`brief-tools.cjs audience`** — new subcommand dispatch.
- **`brief/references/audience-vocabulary.md`** — new reference file; loaded as `required_reading` by `agents/brief-audience-guard.md`.
- **`brief/references/compliance/korea/`** — new folder + 3 primer files; loaded as `required_reading` by `agents/brief-domain-researcher.md` when `state.brief.compliance_packs` contains the matching pack.

### Risk Notes
- **Wave-based Task parallelism is new.** Phase 4 tested single-agent spawn; Phase 5 spawns up to 4 concurrent agents per wave. The multi-Task-in-one-message pattern has not been exercised in prior phases — planner should do a smoke test (spawn 2 dummy tasks in one message; verify both return) BEFORE committing to the full 4-wide pattern. Fallback if spawn pattern fails: sequential execution with a warning — but DSC-03 requires the 4-cap, so sequential degrades the product. Flag HIGH if the smoke fails.
- **Provenance regex is tuning-heavy.** D-05 scope is intentionally narrow (currency + percent + multiplier + explicit market-growth phrasings). Expect both false positives ("first quarter", "three principles") and false negatives (creative LLM phrasing of numbers) during execution. Planner ships an initial pattern list + a ban-list extension procedure (mirrors Phase 4 ALIGN vocabulary extension discipline). Iterative tuning continues through Phase 9 HRD-04 pilot.
- **`buildBusinessContext()` co-serves TWO consumers — spawn-time context block (D-13) AND AUDIENCE auto-populated frontmatter (D-10).** Don't split into 2 helpers; keep single source of truth for business-context block semantics. Test fixture MUST exercise both consumer paths and assert identical underlying values.
- **AUDIENCE DRIFTED-content detection is LLM-reasoning-heavy.** "Internal-only language in external artifact" is a semantic judgment. Deterministic screen catches obvious cases (keyword list: `TBD`, `we believe`, `concerns`, `concern`, `risk we haven't solved`, `still proving` — English; `아직 확정 전`, `우려`, `미해결` — Korean). LLM pass handles subtle leakage. Same hybrid pattern as Phase 4 ALIGN D-03. Expect variance run-to-run on ambiguous cases; test fixtures assert decision category + severity, not verbatim prose.
- **ALIGN filename migration (D-12) is mechanical but touches 5+ files.** `align.cjs`, `align-report.cjs`, `status.cjs`, `commands/brief/define.md`, `brief/workflows/define.md`. Single atomic commit with grep-verified zero residual references to `ALIGN-00.md`. Impact at Phase 4 exit is small: only the canary canonical run touches this filename. Migration is low-risk but must be a single commit to preserve atomic-buildable discipline (Phase 1 D-09).
- **D-07 double-layer enforcement tolerates agent prompt drift by design.** Agent is ASKED to tag; hook VERIFIES. If agent systematically skips tagging, hook blocks; user sees error, fixes inline or re-runs. That's acceptable UX — but systematic agent drift is an agent-prompt BUG worth fixing. Planner should include an agent-output-inspection test asserting tag presence, separate from the commit-time check.
- **Korea-first reference library depth is v1 skeleton only.** Claude's Discretion A4 default is ~400–800 words per primer, NOT clause-level. v2 (CC-V2-01) expands. Planner must NOT over-invest in content; spec says "skeleton". Cite sources with access dates; let v2 / pilot drive depth. Mandatory legal-counsel disclaimer verbatim on each primer.
- **Custom category prompt via D-04 assumes user-supplied topic is well-formed.** Edge case: user types "stuff" or "research things". Generic template should gracefully fall back ("describe the research question more specifically"). Planner includes a fixture for degenerate topics.
- **Paired-sibling filename scheme (D-11) creates 2 files per artifact.** A project with 9 researchers + 9 audience siblings = 18 files in `.planning/discover/`. Accept the noise; alternatives (nested folders) are worse for grep / IDE navigation.
- **NO user-facing command additions — HARD CONSTRAINT.** Phase 5 only replaces the `/brief-discover` stub body; any new top-level command (e.g., `/brief-audience-check`, `/brief-realign`, `/brief-reaudit`) = surface-cap violation. Route AUDIENCE / provenance / context-inject as orchestrator-internal or via existing `brief-tools.cjs` subcommand verbs.

</code_context>

<specifics>
## Specific Ideas

- **Phase 5 is the FIRST cross-artifact gate run.** Phase 4 ALIGN canary ran OBJECTIVES.md against itself (self-coherence mode). Phase 5 AUDIENCE runs research artifacts against their own frontmatter AND against OBJECTIVES.md (`audience_policy`) — true cross-artifact comparison. If the 3-output pattern, findings vocabulary, and paired-sibling filename all hold here, Phase 7 COMPLIANCE is copy-rename-done. If anything wobbles, Phase 7 must re-architect. **HIGH flag if verdict schema or filename scheme needs revision during Phase 5 execution.**
- **Filename migration (D-12) is the bridge between Phase 4 and the 3-gate future.** Phase 4 used a provisional filename (`.planning/ALIGN-00.md`). Phase 5 locks the template filename (`{artifact}.audience.md`, `OBJECTIVES.align.md`) and migrates Phase 4 atomically. Phase 7 COMPLIANCE inherits as `{artifact}.compliance.md`. **No third migration needed — lock now.**
- **`buildBusinessContext()` is a cross-cutting primitive.** Phase 6 / 7 / 8 all inherit. Planner should design it knowing it will be called from 5+ orchestrator workflows across 4 phases; API stability matters. Prefer a stable return shape over terse convenience. Document as an inline contract in the file header.
- **D-07 double-layer enforcement mirrors Phase 4 vocabulary ban (agent prompt + test grep).** Agent prompt = the "soft" layer (pedagogy); hook/regex = the "hard" layer (mechanical). Both are load-bearing. Absolute minimum: shell hook catches the obvious cases; iterative improvement in Phase 9 HRD-04 pilot refines coverage. Don't aim for perfect regex on day one.
- **D-08 confidence bands is user-facing discipline.** Planner should document in the researcher prompt as a side-by-side example: GOOD claim (`₩4-6T, range from 3 sources, 2025 [VERIFIED:url|2026-04-22]`) vs BAD claim (`₩4.7T growing 23.4% YoY`) in the target language (Korean when Korea-signal detected, English otherwise). Phase 4 D-11 Korean-preferred-vocabulary precedent applies.
- **`/brief-discover` command body MUST preserve Phase 3 block-gate + stale-anchor entry.** Phase 3 Plans 05/06 delivered these guards. Phase 5 REPLACES the placeholder body ("Phase 5 DISCOVER body — coming in Phase 5") with the real flow; the block-gate and stale-anchor stay as pre-flow guards. Test fixture asserts both guards still fire when their conditions are met.
- **D-01's deliberate refusal to extend `brief-phase-researcher.md` is a signal to the planner.** `brief-phase-researcher.md` produces `RESEARCH.md` for software-phase PLANNERS (stack + patterns + pitfalls). `brief-domain-researcher.md` produces `{category}.md` for BUSINESS DOWNSTREAM (market data + sources + findings with provenance). Conflating them would muddle two consumer contracts. The two agents coexist — one for tech-phase research, one for business-domain research. No shared file; no DRY trap.
- **AUDIENCE DRIFTED-frontmatter vs DRIFTED-content are USER-OPERATIONAL distinctions.** `DRIFTED-frontmatter` = "you forgot to declare audience fields" → quick inline fix path. `DRIFTED-content` = "what you wrote doesn't match what you declared" → deeper revision path. The 3-path interrupt presents different paths per variant (inline-fix default for frontmatter; re-write / accept default for content). Button wording diverges per variant.
- **The "Korean-first" signal detection (Phase 3 D-11) flows into three Phase 5 subsystems.** (1) `context-inject.cjs` reads `state.brief.region` / body text for signals → injects Korean vocabulary hints into researcher prompt. (2) AUDIENCE output body Korean if Korea-signal (Phase 4 D-11 inherited). (3) Korea compliance primers auto-attach when `compliance_packs` contains a Korea-specific pack. Single signal-detection helper inside `context-inject.cjs` serves all three.

</specifics>

<deferred>
## Deferred Ideas

(Items that came up during this discussion but belong in other Phases — captured here so they're not lost.)

- **Semantic "internal-only language" detection refinement for AUDIENCE DRIFTED-content** — deterministic-screen keyword list (`TBD`, `we believe`, `concerns`, `미해결`, `우려` etc.) ships with Phase 5 D-09; major refinement based on pilot-observed LLM creative avoidance belongs in **Phase 9 HRD-04**.
- **Clause-level Korean compliance content (PIPA / ISMS-P / MyData / e-금융업 / 의료기기법)** — 1-page primer skeleton ships in Phase 5 (Claude's Discretion A4). Clause-level expansion is **CC-V2-01 (v2)**. Legal counsel engagement also deferred to v2.
- **Bilingual `.ko.md` / `.en.md` artifact pairs** — Pitfall #11 recommends for `region: kr` projects. Phase 5 AUDIENCE frontmatter supports `voice.perspective` but actual bilingual emission is **Phase 8 DELIVER territory** (Type B artifacts).
- **Cross-artifact leakage diff check** (Pitfall #5 recommendation) — "if internal language appears in an external artifact, flag" — Phase 5 D-09 AUDIENCE runs per-artifact; cross-artifact diff is an additional pass. **Defer to Phase 8 DELIVER** where multiple Type B artifacts coexist in `.planning/deliverables/`.
- **Web-search MCP integration for researcher agents (DSC-V2-01)** — Phase 5 researcher relies on training-data + [ASSUMED] tagging for non-verifiable quantitative claims. Real-time MCP search is v2.
- **Customer interview transcript analyzer (DSC-V2-02)** — v2.
- **Researcher failure recovery policy refinement** — if a researcher in a wave crashes or returns malformed output: Phase 5 ships simple policy (retry once, then mark `[ASSUMED: auto-generated from retry failure]` and continue). Execution-time refinement via **Phase 9 HRD-04** pilot.
- **Provenance tag creative-avoidance ban-list expansion** — initial regex ships; Phase 9 HRD-04 pilot surfaces LLM creative forms (e.g., `[SOURCE]`, `[EST.]`, `[market data]`); add to ban-list iteratively. Same discipline as Phase 4 ALIGN ban-list.
- **State allowlist extension for new `state.brief.*` fields (if needed)** — D-13 reads existing fields; no NEW writes anticipated in Phase 5. If planner finds a need (e.g., `state.brief.discover_wave_status` for mid-wave checkpoints), extend per Phase 2 D-21 in the same pass. **Flag only if needed.**
- **`/brief-realign` / `/brief-reaudit` user-facing commands** — Phase 4 deferred `/brief-realign`; Phase 5 inherits same discipline — AUDIENCE stays orchestrator-internal. Revisit in **Phase 9 HRD-02** audit if pilot reveals on-demand-re-gate demand.
- **`buildBusinessContext()` i18n beyond Korean / English** — Phase 5 ships Korean + English paths. Non-KR non-EN locales deferred to v1.x if pilot surfaces non-bilingual planners.
- **`brief-domain-researcher.md` locale coverage beyond Korea / global-en** — same as above. Initial shipping prompts are Korean (Korea-signal) + English (otherwise).
- **Reviewed Todos (not folded)** — no Phase 5-matching todos surfaced (0 matches from `todo match-phase 5`).

</deferred>

---

*Phase: 05-discover-parallel-research-with-provenance-audience-context-injection*
*Context gathered: 2026-04-22*
*Discussion mode: Interactive — 4 gray areas (A1, A2, A3, A5) discussed with 2–4 questions each; A4 (Korea reference library) routed to Claude's Discretion with documented default design. 15 decisions (D-01..D-15) + 1 meta-discipline carry-forward (D-16). All recommended options selected; no gray area re-opened.*
