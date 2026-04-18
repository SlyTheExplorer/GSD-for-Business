# Phase 2: Stable Seam — Anchor Schema, Caps, Workstream-as-Config - Context

**Gathered:** 2026-04-18
**Amended:** 2026-04-19 — post-research A4 fork resolution (D-05 superseded by D-20; D-21 added)
**Status:** Ready for planning
**Mode:** Delegated discussion — non-technical product owner. Claude held implementation decisions; user decided only the surface-visible UX (D-15, `/brief-status` output shape) and the A4 fork (Option A: extend `frontmatter.cjs` — D-20).

<domain>
## Phase Boundary

The architectural seams every later Phase depends on are put in place. Specifically:

1. **State namespace lock** (FND-05): `state.cjs` round-trips `state.brief.*` namespaced fields without loss; the schema for those fields is forward-declared so Phase 4 (ALIGN), Phase 5 (AUDIENCE), Phase 6 (Return Stack), Phase 7 (COMPLIANCE) can write into it without re-litigating shape.
2. **Workstream-as-YAML loader** (FND-08): A new built-in workstream is declared by writing one `spec.yaml` file (no `.cjs` source change required); Phase 7 will populate the 9 built-in workstream specs against this loader.
3. **Surface caps documented** (FND-09): CLAUDE.md states the ≤12 user-facing slash commands and ≤8 skills caps with rationale and a clear definition of "user-facing", before any feature work in subsequent Phases adds new surfaces.
4. **`/brief-status` skeleton** (FND-10): A read-only command renders a one-screen compact dashboard from `state.brief.*`; placeholder values for fields not yet populated by later Phases.

**No new BRIEF features ship in Phase 2.** The deliverables are infrastructure: schema, loader, doc, status reader. Phase 3 (DEFINE Canary) is the first Phase to write into the namespace.

</domain>

<decisions>
## Implementation Decisions

### A4 Verification + state.brief.* Namespace Schema (FND-05)

**Discussion mode:** Delegated to Claude (technical implementation choice).

- **D-01: Verification approach.** A `node:test` smoke file at `tests/state-brief-roundtrip.test.cjs` exercises the round-trip:
  1. Read STATE.md (existing `state.cjs` API)
  2. Inject a representative `state.brief.*` payload (one of each shape: array, object, scalar, nested object)
  3. Write STATE.md back via the same API
  4. Re-read; assert deep-equal to the injected payload
  5. Repeat across two write cycles to catch any normalize-on-write loss

  **Rationale:** Matches BRIEF's existing `node:test` pattern (no new test framework), runs as part of `npm test`, fits the empirical baseline cap policy inherited from Phase 1 (Plan 06/07/08 closure).

- **D-02: Namespace encoding.** `brief:` is a single nested key in STATE.md frontmatter (YAML map), not a flat dot-notation key. So:

  ```yaml
  ---
  gsd_state_version: 1.0   # see D-04 — to be renamed
  brief:
    return_stack: []
    gap_queue: []
    last_gate_results:
      align: null
      audience: null
      compliance: null
    current_workstream: null
  ---
  ```

  **Rationale:** A nested map round-trips cleanly through standard YAML parsers; flat dot keys (`brief.return_stack:`) tend to get lost or mangled by re-serialization. Matches the structure `/brief-status` reads.

- **D-03: Forward-declared schema (locked NOW for downstream Phases).**

  | Field                                 | Shape                                           | Used by    |
  |---------------------------------------|-------------------------------------------------|------------|
  | `brief.return_stack`                  | array of frame objects (LIFO, max depth 3)      | Phase 6    |
  | `brief.gap_queue`                     | array of `{topic, criticality, raised_at}`      | Phase 6    |
  | `brief.last_gate_results.align`       | `{decision, severity, findings_count, at}` \| null | Phase 4 |
  | `brief.last_gate_results.audience`    | same shape \| null                              | Phase 5    |
  | `brief.last_gate_results.compliance`  | same shape \| null                              | Phase 7    |
  | `brief.current_workstream`            | string slug \| null                             | Phase 7    |

  Phase 2 only declares these as null/empty placeholders. Phase 4/5/6/7 populate them — but the keys exist from day one so writers don't need to mutate the schema.

- **D-04: `gsd_state_version` → `brief_state_version` rename.** Phase 1 D-05 (Aggressive rename) and D-07 (no aliases) require this — Phase 2 closes the residue:
  - `brief/bin/lib/state.cjs:814` writes `brief_state_version: '1.0'` going forward
  - `.planning/STATE.md` frontmatter is migrated in the same atomic commit
  - **No backwards-compat reader for `gsd_state_version`** — the migration is one-shot in this commit (consistent with D-07)
  - This also reduces the Phase 9 HRD-05 source-drift residue by one item

- **D-05: ~~Fallback if A4 fails verification~~ — SUPERSEDED by D-20.** The A4 smoke-test outcome is now *empirically known* from 02-RESEARCH.md R-1: the existing `reconstructFrontmatter` drops/mangles `null`, nested-object leaves, and arrays-of-objects. Sidecar fallback is **abandoned** because D-20 fixes the root cause in-place and preserves D-02's nested-map semantics + Phase 6's STATE.md-as-single-source-of-truth.

  (Historical intent retained for reference: the sidecar path was `.planning/state-brief.json` + a helper module; not pursued.)

- **D-20 (NEW, supersedes D-05): Extend `frontmatter.cjs` so `reconstructFrontmatter` round-trips nested maps, arrays (including arrays-of-objects), and `null` correctly.** Scope:
  1. Fix `reconstructFrontmatter`'s serializer so a YAML value of `null` emits as `null` (not the string `"null"`), nested objects emit as indented YAML maps (not `[object Object]`), and arrays-of-objects emit as YAML sequences with object items.
  2. Preserve existing behavior for flat scalar fields and simple string/number/bool arrays (no regressions).
  3. A4 smoke test (D-01) is rewritten to exercise the D-03 schema shapes in full fidelity — array-of-objects (`return_stack`), nested object map (`last_gate_results.align: {decision, severity, findings_count, at}`), and `null` fields — across two write cycles.
  4. A regression test case is added under `tests/frontmatter-roundtrip.test.cjs` (or extends an existing file) that injects each D-03 shape and asserts deep-strict-equal after one round-trip — catches future normalization drift.

  **Rationale:** Option A chosen over sidecar (B) or JSON-string blob (C) because (1) preserves D-02 human-readable nested YAML; (2) Phase 6/7 writers mutate a single source (no dual-write sidecar); (3) the serializer defect will bite the workstream-spec YAML loader too if left uncorrected (yaml-mini parser is a READER; `reconstructFrontmatter` is the WRITER and must handle the same shapes on re-serialization of STATE.md when `/brief-status` or downstream commands re-emit).

- **D-21 (NEW, load-bearing): Extend `cmdStateJson` + `buildStateFrontmatter` to preserve the `brief:` nested map.** Per 02-RESEARCH.md R-5, the current `cmdStateJson` allowlist covers only `stopped_at / paused_at / status`. Without this fix, the `brief:` map is silently DROPPED on the next `state json` write. Scope:
  1. Add `brief` to `buildStateFrontmatter`'s pass-through allowlist so existing `brief:` content is preserved on rebuild.
  2. Initialize the `brief:` map in this phase's atomic commit (not Phase 3) — a placeholder map with D-03 empty/null values. Rationale: if we defer initialization, `/brief-status` renders warnings between Phase 2 completion and Phase 3 first-write, which contradicts D-17 resilience intent.
  3. Add a regression test that runs `node brief-tools.cjs state json` against a STATE.md containing a populated `brief:` map and asserts the map survives byte-stable through the JSON round-trip AND the subsequent rebuild.

  **Note for planner:** D-20 and D-21 are prerequisites for FND-05. Order them before the A4 smoke test, not after (the smoke test is the *verification*, not the driver).

### Surface Caps — Scope and Enforcement (FND-09)

**Discussion mode:** Delegated to Claude (technical/policy decision; user-experience question deferred to Phase 9 HRD-02 audit).

- **D-06: Caps are documentation-only in Phase 2.** A new `## Surface Caps` section in CLAUDE.md states:
  - **≤12 user-facing slash commands**
  - **≤8 skills**
  - Rationale: command surface memorability (Pitfall #12) + skill bloat (Pitfall #1)
  - Definition of "user-facing": **what `bin/install.js` registers under `commands/<runtime>/brief/` for end-user invocation**. Internal helpers, sub-commands routed through a parent command, and template files do NOT count.

- **D-07: No pre-commit hook for cap enforcement in Phase 2.** Pre-commit enforcement would block planner work mid-stream and is over-engineering for a single-Phase requirement. The actual count audit is **Phase 9 HRD-02** (v1 launch gate). Phase 2 establishes the policy text only.

- **D-08: Current count discrepancy is acknowledged.** As of Phase 2 entry:
  - `commands/brief/`: 61 files
  - `agents/`: 18 files

  Both exceed the cap. These are **inherited-and-renamed** GSD surfaces, not BRIEF-domain additions. The reduction strategy is:
  - **Phase 2 itself adds 1 command (`/brief-status`).** New count target after Phase 2: 62 commands.
  - **Phase 3–8 add only domain commands** (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`, `/brief-add-workstream`, `/brief-export`, `/brief-help` etc. — net additions tracked).
  - **Phase 9 HRD-02 audits and prunes** down to ≤12. This is the correct scope boundary — Phase 2 cannot pre-decide which 49 inherited commands disappear.

- **D-09: CLAUDE.md `## Surface Caps` text includes a forward-looking pointer:**
  > "As of v1 design, BRIEF inherits 61 renamed `brief-*` commands from GSD. The cap (≤12 user-facing) is enforced at v1 launch via Phase 9 HRD-02. Subsequent Phases (3–8) MUST NOT add new commands beyond their requirement-mapped set."

### workstream-spec.yaml Schema and Loader (FND-08)

**Discussion mode:** Delegated to Claude (technical schema and parsing decisions; field set is dictated by REQUIREMENTS).

- **D-10: Directory layout.** Each workstream owns its directory:
  ```
  brief/workstreams/
    bmc/
      spec.yaml
      templates/
        artifact.md
    gtm/
      spec.yaml
      templates/
        artifact-b2b.md
        artifact-b2c.md
    ...
  ```
  **Rationale:** Co-locates spec + templates + (eventually) reference docs. Enables Phase 7 to add 9 built-in workstreams without source changes elsewhere.

- **D-11: Discovery via glob.** The loader globs `brief/workstreams/*/spec.yaml` at the lib boundary — no explicit registry index file. The directory listing IS the registry.
  - Phase 7's `/brief-add-workstream` flow appends to this directory; subsequent `/brief-design` runs pick up the new workstream automatically (FND-08 success criterion).

- **D-12: YAML parsing — inline mini-parser, no external dependency.**
  - BRIEF already has `brief/bin/lib/frontmatter.cjs` that handles YAML frontmatter (extract / reconstruct). Extend the same module with a `parseYamlDocument(string)` function for full-doc YAML.
  - Constraints: support `string`, `number`, `boolean`, `null`, `list`, `nested map` — enough for the workstream-spec schema. Not full YAML 1.2 (no anchors, tags, multi-doc).
  - **Rationale:** zero-runtime-deps rule (A1) prevents `js-yaml`. `npx --yes` is wrong for a hot path read on every `/brief-design` invocation. The schema is closed and small, so an inline 100–150 line parser fits BRIEF's existing engineering posture.

- **D-13: Schema (locked).**

  ```yaml
  # Required
  name: string                      # slug, kebab-case, matches directory name
  description: string               # one-line human description
  research_prompts:                 # used by Phase 5 DISCOVER on this workstream
    - string
  design_prompts:                   # used by Phase 7 DESIGN on this workstream
    - string
  output_artifact_template: string  # path relative to spec.yaml (e.g. templates/artifact.md)

  # Optional
  business_model_variants:          # template path overrides per business model
    b2b: string                     # e.g. templates/artifact-b2b.md
    b2c: string
  region_overrides:                 # context injection per region
    kr: string                      # e.g. references/kr-supplement.md
    us: string
  audience_default:                 # frontmatter defaults for emitted artifacts
    type: string                    # internal | external | partner | etc.
    confidentiality: string         # internal-only | partner | public
    voice: string                   # formal | direct | etc.
  ```

  Validation rules:
  - `name` MUST equal the parent directory name (loader rejects mismatch with structured error)
  - `output_artifact_template` MUST point to an existing file under the workstream directory (loader rejects with structured error)
  - All other paths in `business_model_variants` and `region_overrides` MUST exist

- **D-14: Phase 2 deliverable scope = loader + schema + ONE example workstream.**
  - Ship the loader + a single example workstream `brief/workstreams/_example/spec.yaml` to prove FND-08 success criterion #2 ("framework picks it up without any .cjs source change").
  - The 9 real built-in workstreams (BMC, GTM, FINANCIAL, ...) are Phase 7 content. Phase 2 does NOT pre-author them.
  - The example workstream is named `_example` (underscore prefix) so it is visible to humans but easy for Phase 7 to remove or replace.

### `/brief-status` Skeleton (FND-10)

**Discussion mode:** USER-DECIDED — output shape (Compact dashboard). All other implementation details delegated to Claude.

- **D-15: Output format = compact dashboard (USER CHOICE).** Fixed-width, two-column layout matching the preview the user selected:

  ```
  BRIEF Status
  ================================
    Phase           2 of 9 (Stable Seam)
    Workstream      — (none active)
    Return stack    0 / 3
    Last ALIGN      — (none yet)
    Last COMPLIANCE — (none yet)
  --------------------------------
    Next: /brief-plan-phase 2
  ```

- **D-16: Field-by-field rendering rules.**
  - **Phase**: `{phase_number} of {total_phases} ({phase_name_short})` — pulled from STATE.md body + ROADMAP.md
  - **Workstream**: `state.brief.current_workstream` value, or `— (none active)` placeholder
  - **Return stack**: `{depth} / 3` — always render, even at 0
  - **Last ALIGN**: `{decision} ({findings_count} findings)` if set, else `— (none yet)`
  - **Last COMPLIANCE**: same pattern
  - **Next** line: derived from STATE.md `stopped_at` field — best-effort hint, not authoritative routing

- **D-17: Resilience — no errors on missing fields.** If `state.brief.*` is absent or malformed:
  - Render the placeholder `— (none yet)`
  - Do NOT raise an error
  - Do NOT auto-create the missing field (read-only command)
  - Single exception: if the entire `brief:` map is missing AND we're past Phase 2 (which initializes it), emit a one-line warning at the bottom: `⚠ state.brief.* not initialized — run /brief-init or check STATE.md`

- **D-18: Implementation location.**
  - Command file: `commands/brief/status.md` (1 of the +1 commands Phase 2 adds)
  - Logic helper: `brief/bin/lib/status.cjs` (NEW)
  - Reads via existing `state.cjs` API + `roadmap.cjs` for total_phases / phase_name lookup
  - Read-only. No state mutation.

- **D-19: Output stream.** Plain text to stdout. No `--json` flag in Phase 2 — that's a Phase 9 HRD-03 (`/brief-help`) consideration if structured output is needed for tooling.

### Claude's Discretion

The planner has flexibility on:

- Internal organization of `brief/bin/lib/status.cjs` (one function vs. helper split)
- Exact field-name casing if any conflict with frontmatter library (D-02 normalized to snake_case lowercase by convention, but the YAML serializer's behavior is final)
- Test file granularity for the loader (one big test or split into `tests/workstream-loader-discovery.test.cjs` + `tests/workstream-loader-validation.test.cjs`)
- Whether the inline YAML parser becomes its own module `brief/bin/lib/yaml-mini.cjs` or extends `frontmatter.cjs` directly — pick whichever keeps `frontmatter.cjs` under ~400 lines
- The exact text of CLAUDE.md `## Surface Caps` section (faithful to D-06–D-09, free in wording)
- Commit ordering within Phase 2 (suggested: 1) state schema + A4 test, 2) brief_state_version rename, 3) workstream loader + example, 4) CLAUDE.md caps, 5) /brief-status — but planner may merge or split)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project decisions and requirements
- `.planning/PROJECT.md` — Vision, constraints (zero runtime deps), Key Decisions table including "Hard rename `gsd-*` → `brief-*` (no aliases)"
- `.planning/REQUIREMENTS.md` §FND — FND-05, FND-08, FND-09, FND-10 (the four Phase 2 requirements)
- `.planning/ROADMAP.md` lines 52–63 — Phase 2 goal + 4 success criteria + Pitfall coverage (#13, #1, #8)
- `.planning/ASSUMPTIONS.md` — A1 VERIFIED (zero deps); the Phase 2 commit will append A4 verification entry (or A4 INVALIDATED + sidecar fallback per D-05)

### Prior phase context (Phase 1)
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md` — Phase 1 D-05 (Aggressive rename, including `state.gsd.*` → `state.brief.*`), D-07 (no aliases), D-09 (atomic buildable commits)
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-VERIFICATION.md` `deferred[2]` — 63 residual source/doc-drift items (Phase 9 HRD-05); Phase 2 D-04 closes ONE of these (`gsd_state_version` rename)
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/10-PARTIAL-AUDIT.md` §4 — Source-side drift catalog; consult before assuming any state.cjs identifier is fully renamed

### Files Phase 2 reads or modifies
- `brief/bin/lib/state.cjs` — Line 814 specifically (`gsd_state_version` write site); plus the round-trip read/write boundary
- `brief/bin/lib/frontmatter.cjs` — Extension target for the inline YAML parser (D-12)
- `brief/bin/lib/workstream.cjs` — Existing helper; the new YAML loader integrates here OR in a new `workstream-loader.cjs` (planner choice)
- `brief/bin/lib/roadmap.cjs` — `/brief-status` reads phase_name/total_phases from here
- `.planning/STATE.md` — Frontmatter migration target (`gsd_state_version` → `brief_state_version`, plus initialize the `brief:` nested map)
- `CLAUDE.md` — New `## Surface Caps` section per D-06–D-09
- `commands/brief/` — New file `status.md` (the only new command in Phase 2)
- `bin/install.js` — Registers the new `/brief-status` command across runtimes

### Inherited GSD primitives Phase 2 must not break
- STATE.md file lock (PROJECT.md constraint: no re-architecture of atomic commit + STATE.md lock primitive)
- Multi-runtime detection (`INSTRUCTION_FILE` + `text_mode`) — Phase 1 ASSUMPTIONS.md FND-06 entry confirms detection survived rename; Phase 2 must not regress
- `node:test` + c8 70% line threshold — new tests under `tests/` MUST keep coverage above this threshold

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`brief/bin/lib/state.cjs`** (1618 lines): Has `extractFrontmatter` / `reconstructFrontmatter` via `frontmatter.cjs`; the `writeStateMd` function (line ~918) is the natural integration point for the `brief:` nested map. Round-trip A4 testing exercises THIS function.
- **`brief/bin/lib/frontmatter.cjs`**: Already handles YAML frontmatter parse/serialize. The inline YAML mini-parser (D-12) extends this module — same engineering posture (regex + state machine, no external deps).
- **`brief/bin/lib/workstream.cjs`**: Existing helper (1 of 23 lib files). The YAML loader integrates here OR as a new sibling `workstream-loader.cjs` — planner decides.
- **`brief/bin/lib/roadmap.cjs`**: Provides phase_name + total_phases lookup; `/brief-status` reads from here for the Phase line.
- **`tests/` directory** (~198 test files): Established pattern for `node:test` files; new tests follow `tests/<feature-name>.test.cjs` naming.

### Established Patterns
- **YAML frontmatter via `extractFrontmatter` / `reconstructFrontmatter`** — already in use throughout `state.cjs`. The Phase 2 nested `brief:` map plugs into this pattern; do not introduce a parallel YAML library.
- **`brief-tools.cjs <command>` SDK shim** — every workflow invokes this CLI for `init`, `commit`, `query`. `/brief-status` follows the same dispatch pattern (a new top-level subcommand, or a `query status` mode).
- **Atomic commit per logical step** — Phase 1 D-09; Phase 2 inherits.
- **Reading prior context via init JSON** — workflows already consume `init.phase-op` output; `/brief-status` should reuse this pattern, not re-parse files independently.

### Integration Points
- **`bin/install.js` SRC tuples** — Each new command registered in `commands/<runtime>/brief/` requires a tuple here (per Phase 1 Plan 07/08 pattern). `/brief-status` adds 1 tuple.
- **`scripts/build-hooks.js`** — Unchanged in Phase 2 (no new hooks).
- **`brief/workflows/` markdown** — `/brief-status` uses a workflow markdown (or a thin command file) consistent with the other read-only commands like `/brief-progress`.

### Risk Notes
- The 63 residual Phase 1 source-drift items (Phase 9 HRD-05) include test assertions on `gsd_state_version`. Renaming the key in D-04 will recover SOME of those failed tests; planner should re-run `npm test` after D-04 commit and quantify the recovery delta.
- Phase 2 adds NEW tests (`state-brief-roundtrip`, workstream loader, status renderer). Track delta cap discipline (Phase 1 inherited): empirical baseline + delta cap of 10 — if new tests push failures past cap, planner must HALT and audit.

</code_context>

<specifics>
## Specific Ideas

- **User signal: non-technical product owner.** The user explicitly stepped back from technical gray areas during this discussion ("이걸 하다보니 비개발자인 내가 이 작업을 하는게 맞나 싶네"). Phase 2 was framed as the most plumbing-heavy of the 9 Phases, and the conversation pivoted to delegated mode where Claude held implementation decisions. **Phase 3 onward (DEFINE / DISCOVER / DESIGN / DELIVER) returns to the user's home turf** — those Phases SHOULD surface gray areas because they shape the BRIEF product UX directly.
- **`/brief-status` output is the user-visible BRIEF surface most likely to be invoked by future non-developer planners.** D-15 locks the compact dashboard format the user saw and approved. Do not re-litigate this in Phase 9 HRD-03 (`/brief-help`) without explicit user re-confirmation.
- **The example workstream (`brief/workstreams/_example/`) doubles as the FND-08 acceptance demo.** Plan-phase MUST verify it loads end-to-end; the test file may even use it as the fixture.
- **Phase 1's HALT-ACCEPTED context applies here.** A4 verification is the BIG remaining HIGH-RISK assumption. If A4 fails, the sidecar fallback (D-05) cascades into Phase 6 architecture. Do not minimize this — the smoke test is the gate.

</specifics>

<deferred>
## Deferred Ideas

(Items that came up during this discussion but belong in other Phases — captured here so they're not lost.)

- **Pre-commit hook for surface cap enforcement** — Considered and rejected for Phase 2 (D-07). Re-evaluate in Phase 9 HRD-02 audit if the count exceeds the cap at launch despite documentation policy.
- **`/brief-status --json` structured output mode** — Out of scope. Reconsider in Phase 9 HRD-03 if tooling needs structured output (e.g. dashboards or CI).
- **The 9 real built-in workstream YAMLs (BMC, GTM, FINANCIAL, OPERATIONS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH)** — Phase 7 content per ROADMAP. Phase 2 ships only the loader + `_example` workstream.
- **Reduction of the 61 inherited renamed commands to ≤12 user-facing** — Phase 9 HRD-02 audit. Phase 2 establishes only the policy text in CLAUDE.md.
- **Reduction of the 18 inherited renamed agents to ≤8 skills** — Phase 9 HRD-02 audit (parallel to command audit).
- **`/brief-init` command for first-run state initialization** — Mentioned in D-17 as a forward-looking warning text, but Phase 2 does NOT implement `/brief-init`. It is implicitly handled by Phase 3 `/brief-define` running the new-project flow. If the user-facing experience needs an explicit init command at v1 launch, defer to Phase 9.
- **`gsd_state_version` reader for backwards-compat with old STATE.md files** — Explicitly rejected per Phase 1 D-07 (no aliases). If a real user-data migration need surfaces post-launch, reconsider as a one-shot migration script in v2.
- **Korean-language `/brief-status` output toggle** — Belongs with Phase 9 HRD-03 `/brief-help` localization decision. Phase 2 ships English-only.
- **Schema validation library (`ajv`) for workstream specs** — Considered and rejected per zero-deps rule. Inline validation (D-13 rules) suffices for the closed schema. Re-evaluate in v2 if the schema grows nested-open-ended.

</deferred>

---

*Phase: 02-stable-seam-anchor-schema-caps-workstream-as-config*
*Context gathered: 2026-04-18*
*Context amended: 2026-04-19 — post-research A4 fork; D-20 + D-21 added, D-05 superseded*
*Discussion mode: Delegated (non-technical product owner) — 2 user decisions (D-15 /brief-status output shape; A4 fork → Option A = D-20) + 19 Claude-discretion implementation decisions (D-01..D-14, D-16..D-19, D-21)*
