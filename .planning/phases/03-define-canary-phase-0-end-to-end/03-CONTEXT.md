# Phase 3: DEFINE Canary — Phase 0 End-to-End - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning
**Mode:** Interactive — non-technical product owner on home turf (Phase 3 is `/brief-define`, the user-facing entry point of BRIEF itself). Gray-area discussion surfaced 13 implementation decisions + 1 meta-discipline. Phase 3 planner MUST respect the 2-mode structure (D-05) as it reshapes multiple DEF-* requirements.

<domain>
## Phase Boundary

Ship `/brief-define` as BRIEF's first user-facing command — a canary that proves orchestrator-workers + context-injection work end-to-end on a small surface before Phase 5 replicates the pattern at scale.

**What Phase 3 delivers:**

1. **`/brief-define` command** (DEF-01, DEF-02) — conversational intent extractor with two modes:
   - **Mode A (Greenfield / 신규)**: ~20–35 min. Push Twice + Language Precision + Dream State Mapping full session + 4 configuration-value declarations.
   - **Mode B (Amendment / 고도화)**: ~3–10 min. Operates on existing OBJECTIVES.md; immutable section locked; user picks which mutable parts to revisit.
2. **`.planning/OBJECTIVES.md`** (DEF-03) — project-level single anchor with `## Immutable Intent` and `## Mutable Hypotheses` sections. Per-workstream OBJECTIVES.md is NOT in Phase 3 scope — that arrives in Phase 7 via `/brief-add-workstream`.
3. **4 configuration fields written to `.planning/config.json`** (DEF-04) — `brief.business_model`, `brief.region`, `brief.audience_policy`, `brief.compliance_packs`. Captured as `state.brief.*` round-trip targets already provisioned in Phase 2 (D-03 forward-declared schema).
4. **Block-style gate on `/brief-discover`** (DEF-05) — if OBJECTIVES.md missing required fields, block with structured error listing missing fields + recovery path.
5. **Stale-anchor notice** (DEF-06) — OBJECTIVES.md >48h since last amendment triggers an interrupt at new phase/milestone entry with 3 explicit paths.

**What Phase 3 does NOT deliver (explicit non-goals):**

- per-workstream OBJECTIVES.md files — Phase 7 territory (see D-09 re-interpretation of ROADMAP line 74 wording).
- ALIGN/AUDIENCE/COMPLIANCE gates — Phase 4/5/7 respectively.
- Multi-cycle restart (`/brief-new-milestone`) — v2 per PROJECT.md.
- `/brief-discover` itself — only the block-style gate for entry. Actual `/brief-discover` command body is Phase 5.

**Canary semantic:** if `/brief-define` Mode A + OBJECTIVES.md write + config.json update + block gate all work end-to-end on one flow, the orchestrator-workers pattern is proven and Phase 4+ can replicate.

</domain>

<decisions>
## Implementation Decisions

### Area 1 — `/brief-define` Conversational Experience

- **D-01: Dialogue format = mixed (buttons + free-text).** `AskUserQuestion` multi-choice at points where enumeration is clear; free-text at Language Precision and Push Twice depth points. Never pure multiple-choice; never pure free-form. Flow transitions between them as the conversation evolves.

- **D-02: Multiple-choice questions act as seed only.** Any option selection is followed immediately by a free-text follow-up that invites refinement (`"구체적으로 말씀해 주세요"`, `"이 3가지와 다르다면 어떤 부분이 다른가요?"`). Options are never treated as authoritative answers — they are seeds that surface the user's framing. OBJECTIVES.md values come from the free-text responses, not from the button labels.

- **D-03: Push Twice is implicit.** No `[Push Twice]` label, no visible system tag. The second and third follow-up questions arrive naturally as part of the conversation. Rationale: Korean conversational preference for gradual deepening; avoids the "AI is interrogating me" feel that explicit labeling would create; preserves the impression of a thoughtful partner rather than a technique executor.

- **D-04: Dream State Mapping = hybrid format.** Prose description MANDATORY for each time horizon (now / 3-month / 12-month). Quantitative indicators (2–3 slots per horizon, e.g., 사용자 수 / 관찰 발언 / 수익 기준) OPTIONAL and can be left as `(해당없음)` / `(모름)`. Rationale: narrative preserves domain vocabulary; optional metrics give ALIGN gate measurable anchors in Phase 4+ without coercing users who don't yet have numbers.

- **D-05: `/brief-define` has 2 modes selected at entry via first-question user choice.** Regardless of whether OBJECTIVES.md exists, the first interaction is: "새 사업/제품 기획을 처음부터 / 기존 프로젝트를 다듬기" — user picks. Mode detected by user answer, not by file presence. Rationale: non-technical users want to state intent explicitly; avoids "auto-detect guessed wrong" frustration; the 1 extra click is cheap for first-run users (no OBJECTIVES.md exists) and load-bearing for amendment users.
  - **Mode A (Greenfield)**: runs the full Push Twice + Dream State Mapping + 4-config declaration flow. Produces a new `.planning/OBJECTIVES.md`.
  - **Mode B (Amendment)**: asks "어느 부분을 다시 보시겠어요?" with immutable-section-locked options. Only the user-picked mutable sub-sections get revisited. Produces a delta-merge into the existing OBJECTIVES.md.

- **D-06: Target session lengths.** Mode A ≈ 20–35 min. Mode B ≈ 3–10 min. These are soft guides shown in the entry-question preview ("예상 20~35분" / "예상 3~10분") for user expectation-setting — they are NOT hard wall-clock timers or round-count caps.

- **D-07: Mode B immutable-section lock.** In Mode B the `## Immutable Intent` section of OBJECTIVES.md is non-editable via the conversation. A visible footer reads: `immutable 섹션은 잠겨있습니다. 수정하려면 /brief-define --unlock-intent`. The `--unlock-intent` flag is an explicit, named, intentional escape — not hidden. Rationale: #3 OBJECTIVES.md anchor drift (PITFALLS research) is the highest-risk v1 pitfall; making immutable edits rare-by-friction is the primary mitigation.

### Area 2 — OBJECTIVES.md Scope and Layers

- **D-09: Phase 3 ships ONLY project-level `.planning/OBJECTIVES.md`.** No per-workstream OBJECTIVES.md files are created in Phase 3. Reasoning: Phase 3 is a canary — minimal surface proves the pattern. Per-workstream OBJECTIVES.md is Phase 7 scope (created by `/brief-add-workstream` when real workstreams are introduced).
  - **ROADMAP/REQUIREMENTS re-interpretation (load-bearing for planner):** ROADMAP Phase 3 Goal line 72 and REQUIREMENTS DEF-03 both say "per-workstream OBJECTIVES.md". The interpretation locked here is: **Phase 3 + Phase 7 combined** satisfy this requirement. Phase 3 establishes the project-level anchor AND the schema/architecture that allows per-workstream OBJECTIVES.md to be added without re-architecture. Phase 7's `/brief-add-workstream` flow creates the first per-workstream OBJECTIVES.md. If a Phase 3 planner reads DEF-03 literally and tries to ship per-workstream files, they will violate the canary intent — flag this to planner clearly.

- **D-10: immutable/mutable classification = Claude proposes, user approves.** At conversation wrap-up in Mode A, Claude presents a draft OBJECTIVES.md with items pre-classified into `## Immutable Intent` vs `## Mutable Hypotheses`. User responds via a 3-option AskUserQuestion: `승인` / `한 항목씩 검토` / `전체 재분류`. No silent auto-classification; no user-only manual bucketing (too high cognitive load for non-technical users).
  - **Default classification heuristic (Claude reference):** creator identity, core value, problem-statement → `Immutable Intent`. Audience specifics, verification metrics, hypothesized alternative tools, business_model, region, compliance_packs → `Mutable Hypotheses`. Planner MUST document this heuristic in the /brief-define workflow markdown so it is not re-derived per session.

### Area 3 — 4 Configuration-Value Declarations (DEF-04)

- **D-11: 4 configs captured at end-of-conversation as a single confirm step.** Claude infers `business_model / region / audience_policy / compliance_packs` from the full Mode A conversation (not asked directly as separate questions). At wrap-up, Claude displays the inferred settings + rationale sentence, and asks for approval via 4-option AskUserQuestion: `예, 승인` / `규제 팩만 재선택` / `청중 정책만 조정` / `전체 항목씩 검토`.
  - **Korea-first default policy:** compliance_packs pre-checks `PIPA / ISMS-P / MyData` ONLY when Korea signals are detected in the conversation (language = Korean, region = KR, Korean users/market mentioned, Korean company structure references, etc.). Not an unconditional default. If no Korea signals: no compliance_packs pre-checked; user selects explicitly or leaves empty (empty is valid for Phase 3 canary — not all projects need compliance packs).
  - **Write target:** `.planning/config.json` under the `brief.*` namespace (planner: coordinate with Phase 2 D-21 which extended `cmdStateJson` / `buildStateFrontmatter` allowlist — the equivalent config.json extension may need a parallel allowlist decision. If config.json is a simpler JSON file without an allowlist, write directly; if it's generated via a similar serializer, extend allowlist first).

### Area 4 — Block and Stale-Anchor UX

- **D-12: Block-style gate on `/brief-discover` when OBJECTIVES.md incomplete (DEF-05).**
  - Tone: specific, Korean, recovery-oriented. Lists exact missing fields by name (not a generic "incomplete" message). Provides the single concrete recovery command (`/brief-define --amend`). Explicitly reassures that existing content is preserved ("지금 쓰신 내용은 그대로 남아있습니다").
  - The error is a hard block, not a warning. Per REQUIREMENTS DEF-05 ("block-style, not warning"). The message is friendly, but the exit code and control flow must genuinely block — no pass-through.
  - Canonical template (planner reference): see Area 4 preview in DISCUSSION-LOG.md.

- **D-13: Stale-anchor notice fires ONLY on new activity entry, not on every command.**
  - Triggers on: entering `/brief-discover` for the first time in a new milestone, or entering any new phase, when OBJECTIVES.md mtime > 48h.
  - Does NOT trigger on: every `/brief-status` invocation, every `/brief-define --amend` re-entry, or mid-workflow calls.
  - User MUST choose one of 3 explicit paths (no bypass / no skip without choice):
    - `잠시 검토에` → launches `/brief-define --amend` workflow
    - `현재 OBJECTIVES를 보고 맞으면 승인` → updates OBJECTIVES.md mtime, requires reading the current content first
    - `이제 승인, 빠르게 진행` → immediate mtime bump without content review, for users who just checked out-of-band

### Meta-Discipline

- **D-08: Area-level "적정선" lock discipline.** Each gray area in this discussion was locked at the minimum-viable decision set (2–7 decisions per area), not drilled exhaustively. Gaps discovered during Phase 3 execution are handled by: (a) in-phase amendment of this CONTEXT.md by the executor with user sign-off, or (b) deferral to the subsequent phase that naturally surfaces the gap (e.g., exact font/color/UI chrome details deferred to Phase 9 polish). Rationale: user explicitly flagged fatigue-risk of over-deep gray-area drill ("Area 1이 너무 깊어지는 건 사람들이 지치게 할 수 있으니 적정선을 정하는게 무척 중요"). This discipline is durable guidance for Phase 3's planner, executor, and verifier — they should resolve implementation-level unknowns themselves rather than re-opening CONTEXT discussion for minor details.

### Claude's Discretion

The planner has flexibility on:

- **Command surface for `--amend` / `--unlock-intent` / `/brief-confirm-objectives`:** these could be top-level commands, sub-flags of `/brief-define`, or routed through `/brief-status`. Planner should respect CLAUDE.md `## Surface Caps` (Phase 2 D-06: ≤12 user-facing commands). Adding 3 new top-level commands would push Phase 3's net surface additions beyond the implicit "+1 per phase" budget the Phase 2 cap narrative assumes. Recommendation: `--amend` and `--unlock-intent` as flags on `/brief-define`; `/brief-confirm-objectives` routed through `/brief-status` options or absorbed into the stale-anchor 3-choice flow.
- **Exact prompt wording for Push Twice / Language Precision follow-ups:** D-03 locks the implicit-rendering decision; the actual prompt text is planner's domain. Must be in Korean (default) with English template fallback for non-KR projects.
- **Heuristics for Korea-signal detection (D-11):** planner may implement as a simple regex/keyword check, an agent sub-call, or a structured inference at wrap-up. Any approach is fine as long as it is conditional, not unconditional.
- **Internal architecture of `brief-define.cjs` / workflow markdown split:** follow existing `brief/workflows/*.md` + `brief/bin/lib/*.cjs` pattern (per Phase 2 D-18 precedent for `/brief-status`).
- **Mode selection UX exact rendering:** D-05 locks the semantic; rendering (AskUserQuestion preview vs plain text, 2-option vs 3-option including `/brief-help`) is planner call.
- **Test fixture data:** plan the A4-style round-trip test (parallel to Phase 2 D-01 pattern) that exercises OBJECTIVES.md write → read → block-gate → amend → re-read end-to-end. Use a fictional Korea-first B2C persona as the canonical fixture so Korea-signal detection is exercised.
- **How the Mode A vs Mode B branching is implemented internally:** separate workflow markdowns, a single markdown with a mode switch, or shared primitives — pick whichever keeps each file under ~400 lines per Phase 2 discipline.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level decisions and requirements
- `.planning/PROJECT.md` — Vision; "Phase 0 (DEFINE) is mandatory and lightweight (~30 min)" commitment (constrains D-06 Mode A); "OBJECTIVES.md as the anchor document" key decision; Korea-first + global regulatory scope.
- `.planning/REQUIREMENTS.md` §Phase 0 — DEF-01 through DEF-06 (the six Phase 3 requirements). DEF-03's "per-workstream" language requires D-09 re-interpretation (load-bearing for planner).
- `.planning/ROADMAP.md` lines 71–84 — Phase 3 Goal + 6 success criteria + Pitfall coverage (#3 anchor drift, #9 non-developer friction). Line 72 per-workstream wording subject to D-09 re-interpretation.
- `.planning/ASSUMPTIONS.md` — A1 VERIFIED (zero runtime deps — `gray-matter` / `ajv` / `js-yaml` remain forbidden in dependencies); A4 VERIFIED via Phase 2 D-20/D-21 (state.cjs round-trips `state.brief.*` correctly). Phase 3 MUST NOT regress either.

### Prior-phase context (locked decisions Phase 3 inherits)
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md` — Phase 1 D-05 (Aggressive rename), D-07 (no aliases), D-09 (atomic buildable commits).
- `.planning/phases/02-stable-seam-anchor-schema-caps-workstream-as-config/02-CONTEXT.md` — Phase 2 D-03 (forward-declared `state.brief.*` schema — `current_workstream`, `last_gate_results.*` fields Phase 3 may begin writing), D-06–D-09 (Surface Caps definitions, constrains D-07/D-13 command-surface decisions), D-15/D-16 (`/brief-status` compact dashboard format — if Phase 3 surfaces OBJECTIVES.md state in `/brief-status`, it must slot into this format), D-18 (`commands/brief/*.md` + `brief/bin/lib/*.cjs` split pattern), D-20/D-21 (frontmatter.cjs serializer extensions — state.brief.* round-trip prerequisites).

### Research synthesis (Phase 3-specific)
- `.planning/research/SUMMARY.md` — Section "Highest-Leverage Findings" #1 (prompts/templates not infrastructure) and #2 (three gates differentiator). Phase 3 validates the pattern.
- `.planning/research/FEATURES.md` — Differentiator table row "Phase 0 DEFINE: structured intent extraction before any work" (highest-value differentiator; nearest analog is consulting practice, not software — Phase 3 must read more like consulting intake than SaaS form).
- `.planning/research/PITFALLS.md` — Pitfall #3 OBJECTIVES.md Anchor Drift (mandates immutable/mutable layers — D-07, D-10); Pitfall #9 Non-Developer Friction (mandates non-developer-first conversational UX — D-01, D-02, D-03, D-11, D-12 all directly respond).
- `.planning/research/ARCHITECTURE.md` — Pattern 3 (OBJECTIVES.md anchor), Pattern 7 (workstream-as-yaml — already shipped in Phase 2, Phase 3 writes first real value into `state.brief.current_workstream` but NOT per-workstream OBJECTIVES.md per D-09).

### External inspiration (patterns, not dependencies)
- **gstack `office-hours` SKILL.md** — Push Twice, Language Precision, Reframing as Clarification techniques. Phase 3 adapts these for INTERNAL-CLARIFICATION mode (we're helping the user define their intent, not validating product-market fit). Planner should read the upstream SKILL.md once to understand the techniques verbatim, then implement the BRIEF-adapted Korean prose.
  - Source: `github.com/garrytan/gstack/blob/main/office-hours/SKILL.md`
  - NOT a runtime dependency — absorbed as pattern per PROJECT.md "Inspiration absorbed (not depended upon)".

### Files Phase 3 will create or modify
- `commands/brief/define.md` — NEW command file for `/brief-define`.
- `brief/workflows/define.md` — NEW workflow markdown (Mode A path; Mode B path may be same file with a branch or a separate `define-amend.md` per planner choice).
- `brief/bin/lib/define.cjs` or extension of existing lib — NEW logic helper for OBJECTIVES.md write, config.json update, block-gate invocation.
- `brief/bin/lib/objectives.cjs` — NEW (suggested): OBJECTIVES.md read/write/validate (immutable-section lock enforcement lives here).
- `brief/bin/lib/frontmatter.cjs` — POSSIBLY extended for OBJECTIVES.md-specific frontmatter (per Phase 2 D-12 pattern — keep frontmatter.cjs < ~400 lines).
- `bin/install.js` — SRC tuple for the new `/brief-define` command (and any planner-chosen additional commands).
- `.planning/OBJECTIVES.md` — CREATED by `/brief-define` Mode A (the canary artifact).
- `.planning/config.json` — EXTENDED with `brief.business_model`, `brief.region`, `brief.audience_policy`, `brief.compliance_packs` fields.
- `tests/brief-define-*.test.cjs` — NEW (at minimum: Mode A fixture-based smoke, Mode B immutable-lock smoke, block-gate smoke, Korea-signal detection smoke).
- `.planning/STATE.md` — `state.brief.current_workstream` field first gets a real value here (may be empty/null if D-09 scope holds — Phase 3 doesn't create workstreams, so may stay null through end of Phase 3).

### Inherited primitives Phase 3 must NOT break
- STATE.md file lock (atomic commits) — Phase 3 writes to STATE.md + OBJECTIVES.md + config.json in the same atomic boundary where possible.
- Multi-runtime detection — `/brief-define` MUST work in Claude Code, Codex, Gemini, OpenCode. For runtimes without `AskUserQuestion`, the text_mode fallback (Phase 1 ASSUMPTIONS.md FND-06) must produce equivalent interaction via numbered-list prompts. D-01's "mixed (buttons + free-text)" adapts: in text_mode, buttons become numbered lists and free-text remains free-text — semantically identical.
- `node:test` + c8 70% line threshold.
- Zero runtime dependencies rule (A1).
- CLAUDE.md Surface Caps (Phase 2 D-06–D-09) — Phase 3's net command additions must respect the "+1 per phase" implicit cadence until Phase 9 HRD-02 audit.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`brief/bin/lib/frontmatter.cjs`** (Phase 2 D-20-extended) — already round-trips nested maps, arrays-of-objects, `null`. OBJECTIVES.md frontmatter (immutable/mutable layer markers, business_model, region, audience, compliance_packs) fits this serializer without further extension.
- **`brief/bin/lib/state.cjs`** — `cmdStateJson` / `buildStateFrontmatter` allowlist (Phase 2 D-21) includes `brief:` map. `current_workstream` field writable from Phase 3 (may stay null per D-09).
- **`brief/bin/lib/status.cjs`** (Phase 2 D-18) — pattern for a read-only renderer reading `state.brief.*`. If Phase 3 needs to show OBJECTIVES.md state in `/brief-status`, extend status.cjs with a new field, not a parallel renderer.
- **`brief/bin/lib/workstream-loader.cjs`** (Phase 2 D-11/D-13) — the discovery-via-glob pattern is relevant IF planner chooses to treat OBJECTIVES.md per-workstream loading similarly. Phase 3 doesn't invoke this yet (per D-09) but the next reader/writer should follow the same discovery style.
- **`brief/bin/brief-tools.cjs`** — SDK shim pattern. `/brief-define` follows the same dispatch style as `/brief-status` (per Phase 2 D-18).

### Established Patterns
- **Workflow markdown + lib.cjs split** (Phase 2 D-18) — `/brief-define` follows this. Keep each file < ~400 lines per Phase 2 discipline.
- **Init-JSON consumption** — workflows read `brief-tools.cjs init <op>` to get phase context. `/brief-define` may need a new op (e.g., `init.define-op`) or reuse `init.project-op` — planner decides.
- **Atomic commit per logical step** (Phase 1 D-09 + Phase 2 inheritance) — Phase 3 commits should split roughly: (1) OBJECTIVES.md schema + reader/writer + frontmatter discipline, (2) `/brief-define` Mode A flow + workflow markdown, (3) Mode B + immutable-lock flow, (4) config.json 4-field write, (5) block-gate on `/brief-discover` entry, (6) stale-anchor 48h notice.
- **Fixture-based tests** — `tests/` uses `node:test`. Phase 3 test fixtures should include a canonical Korea-first B2C persona to exercise D-11's Korea-signal detection.
- **`text_mode` fallback** (Phase 1 FND-06 + Phase 2 flowdown) — `/brief-define` runs identically under `AskUserQuestion` or `text_mode`. Buttons become numbered lists; free-text is universal.

### Integration Points
- **`bin/install.js` SRC tuples** — add `/brief-define` (and any planner-chosen sub-commands) per Phase 1 Plan 07/08 pattern.
- **`scripts/build-hooks.js`** — unchanged in Phase 3 (no new hooks planned; stale-anchor notice fires in-workflow, not as a hook).
- **`.planning/config.json`** — the 4 configs land here. Verify at planning time whether config.json uses a frontmatter-style allowlist (like STATE.md) or is a straight JSON file. If allowlist-style, extend allowlist BEFORE writing (Phase 2 D-21 precedent).

### Risk Notes
- **D-07 `--unlock-intent` is load-bearing against Pitfall #3 anchor drift.** If planner implements immutable-lock as "soft" (warning only, not actually preventing edit), the whole pitfall mitigation fails. Implement as an actual edit-refuser at the OBJECTIVES.md writer layer.
- **Phase 3 touches three separate on-disk artifacts in one flow (OBJECTIVES.md + config.json + STATE.md).** The atomic-commit discipline requires all three to be written-then-committed as a single transaction or separately across multiple commits with each commit independently valid. Recommend: write all three in one `brief-tools commit` call, per Phase 1 D-09 pattern.
- **Korea-signal detection (D-11) has an edge case: partial signals.** E.g., user writes in English but claims Korean market. Planner should decide the tie-breaker policy. Recommendation: ANY Korea signal → pre-check Korea compliance packs (better to over-suggest than under-suggest for Korea's 2026 PIPA timing); user can uncheck.
- **Mode B immutable-lock must not leak via `/brief-define --amend` UX.** If the amend workflow accidentally shows immutable items as editable and then rejects the edit at commit time, the user experience is terrible. Lock enforcement must be visible at UI time, not at commit time.

</code_context>

<specifics>
## Specific Ideas

- **User signal: "고도화 흐름" is a real use case.** The 2-mode structure (D-05) did NOT appear in ROADMAP or REQUIREMENTS — it surfaced during discussion when the user observed: "기존에 존재하는 것을 고도화하기 위한 작업들도 있을 것 같은데 후자는 이러한 작업들이 매우 짧아야 하지 않을까." This is a design-level insight the planner MUST honor — treating `/brief-define` as a one-shot greenfield-only tool would produce a tool that punishes its own repeat users.
- **User signal: "적정선" discipline (D-08).** "Area 1이 너무 깊어지는 건 사람들이 지치게 할 수 있으니 적정선을 정하는게 무척 중요할 것 같아. 부족한 부분은 나중에 보완해 나갈 수 있지 않을까?" — this applies to BOTH the current gray-area discussion AND the `/brief-define` tool's own conversation. The tool being built should embody the same discipline: don't drill exhaustively on every ambiguity; surface the big things and let execution discover the rest.
- **User signal: "객관식 질문에 대해서는 좀더 고민해 보면 좋겠어" led to D-02 (seed-only role).** Multiple-choice options must never be treated as the user's final answer — they are conversation seeds that surface the user's framing, which then gets refined in free-text. This is a first-class design principle of BRIEF's `/brief-define`, not a micro-decision.
- **`/brief-define` is the user's face of BRIEF.** More than any other Phase, this is where "비개발자 기획자를 위한 도구" lives or dies. All UI copy is Korean by default (with English template fallbacks for non-KR projects). Error messages are recovery-oriented, never blame-oriented. Button labels are concrete, not abstract.
- **Phase 3's "canary" role is load-bearing.** If `/brief-define` ships and the orchestrator-workers pattern (user-visible: Mode A conversation → parallel inference for config values → structured OBJECTIVES.md output) works smoothly, Phases 4/5/6/7/8 can replicate the pattern confidently. If the pattern wobbles at Phase 3, downstream phases must re-architect — flag HIGH if smoke fails.
- **Non-technical product owner mode (user profile).** The user is building BRIEF for non-technical planners, and they are one themselves. Phase 3's design decisions above prioritize "a non-developer who wants structured output without having to learn CLI patterns". The planner should NOT re-optimize for developer-ergonomics (e.g., more flags, terser prompts). The existing decisions are tuned for the target persona.

</specifics>

<deferred>
## Deferred Ideas

(Items that came up during this discussion but belong in other Phases — captured here so they're not lost.)

- **per-workstream OBJECTIVES.md files** — Phase 7 (DESIGN) creates them via `/brief-add-workstream`. D-09 explicitly defers.
- **ALIGN gate on OBJECTIVES.md output** — Phase 4 territory. Phase 3 produces the ALIGN gate's input (OBJECTIVES.md) but does not run the gate itself.
- **AUDIENCE guard on OBJECTIVES.md frontmatter** — Phase 5 first-wires AUDIENCE guard on research artifacts. OBJECTIVES.md itself has `audience_policy` as a field (D-11) but the guard that blocks leakage runs on workstream artifacts starting Phase 5.
- **COMPLIANCE checker on config.json compliance_packs** — Phase 7 COMPLIANCE checker reads `compliance_packs` from config.json. Phase 3 only writes the declaration; Phase 7 acts on it.
- **`/brief-help` for `/brief-define`** — Phase 9 HRD-03 ships the categorized `/brief-help` system. Phase 3 may ship a basic `--help` flag output but the rich help surface is Phase 9.
- **Multi-language support for `/brief-define` prompts beyond Korean/English** — user mentioned "다른 언어 지원" in the Area 1 wrap-up prompt options but explicitly chose not to explore it. Deferred: track as a future requirement if the pilot (Phase 9 HRD-04) surfaces non-KR non-EN planners.
- **Dialogue pause/resume mid-session** — if user runs out of time in Mode A, what happens to partial OBJECTIVES.md state? Not decided here. Suggested planner default: write partial to `.planning/OBJECTIVES.md` with `status: in_progress` frontmatter flag; block-gate treats `in_progress` the same as "missing required fields". Confirm or revise with user if this becomes a friction point in Phase 3 execution.
- **`/brief-confirm-objectives` vs sub-flag** — D-13 stale-anchor flow references this command; whether it's a real command or a sub-flag is planner's call per surface cap discipline.
- **Automatic Korea-signal detection refinement** — D-11 starts with keyword/language detection. If Phase 9 pilot surfaces false positives/negatives, revisit in v1.1.
- **OBJECTIVES.md validation rules beyond "required fields present"** — D-12 block-gate focuses on field presence. Semantic validation (e.g., "3개월 상태가 12개월 상태보다 더 구체적인지") is not in Phase 3 scope; it may appear in Phase 4 ALIGN gate.
- **`/brief-define` output format configurability (Markdown vs YAML-only)** — Phase 3 ships Markdown-with-frontmatter (per BRIEF convention). Alternative formats are not considered.
- **Dream State Mapping horizon customization beyond 3mo/12mo** — some projects may want 6mo/24mo. Phase 3 ships fixed horizons. If pilot reveals demand, add in v1.x.

</deferred>

---

*Phase: 03-define-canary-phase-0-end-to-end*
*Context gathered: 2026-04-19*
*Discussion mode: Interactive — non-technical product owner on home turf. 13 implementation decisions (D-01..D-07, D-09..D-13) + 1 meta-discipline (D-08). No gray area re-opened; each area locked at "적정선" per D-08.*
