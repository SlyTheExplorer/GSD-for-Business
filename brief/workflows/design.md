<purpose>
Invoke the BRIEF DESIGN phase as an explicit orchestrator. Parses a single workstream
slug, validates via workstream-loader, runs OBJECTIVES sufficiency precheck, builds
business_context, spawns the workstream's design Task, runs sequential 3-gate threading
(ALIGN → AUDIENCE → COMPLIANCE) on the produced artifact with fail-fast on BLOCKING,
and presents the workstream completion handoff. Phase 7 D-05/D-06/D-07/D-08 lock.

Single-workstream-per-session contract (D-05): /brief-design accepts ONE workstream
slug per invocation. The orchestrator is not a discover-style fan-out and does not
loop over a category list. Re-running the command for the next workstream is the v1
path (the final-step handoff offers a recursive Skill-tool dispatch on Continue).

OBJECTIVES insufficiency directive routing (D-06): when Step 2 detects required
mutable_hypotheses fields are missing for the requested workstream, the workflow
emits a paused-status message instructing the user to run `/brief-define --amend`
and exits cleanly. NO return-stack push for OBJECTIVES gaps — the return-stack is
DISCOVER↔DESIGN only; the DESIGN→DEFINE direction is intentionally not supported.

Sequential 3-gate threading (D-02): inside Step 5 the workflow invokes ALIGN →
AUDIENCE → COMPLIANCE in series, fail-fast on any BLOCKING verdict (no parallel
spawn, no skip flag). FINDINGS-MATERIAL on COMPLIANCE proceeds to Step 6 without
interrupt (Phase 7 D-01 deviation — material findings recorded in the paired-
sibling compliance report; legal-counsel disclaimer footer on every emitted file).

Korean is default voice when state.brief.region == 'kr'; English fallback.
TEXT_MODE numbered-list rendering replaces every AskUserQuestion when --text
is in $ARGUMENTS or workflow.text_mode is true (FND-06).
</purpose>

<process>

## Step 0: TEXT_MODE detection

Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode`
from init JSON is true. When TEXT_MODE is active, replace every AskUserQuestion
call (Steps 1, 7, and the downstream gate 3-path interrupts invoked from Step 5)
with a plain-text numbered list and ask the user to type their choice number.
Detection rule mirrors discover.md / align-gate.md Step 0 (self-contained).

## Step 0.5: Return-stack resume detection (D-10 inheritance from Phase 6)

Before slug parsing, check whether a paused frame on `state.brief.return_stack`
matches the invoked workstream slug. The return-stack is a DISCOVER↔DESIGN
bidirectional construct (Phase 6 D-02): a frame on the stack means a prior
gap-detect run pushed a paused workstream awaiting fresh research output.

Read return_stack:

```
node brief/bin/brief-tools.cjs state json
```

Parse `brief.return_stack` (array). Extract TOP_FRAME = `return_stack[length-1]`
when length > 0. Required frame fields: `triggering_topic`, `topic_fingerprint`,
`paused_artifact`, `paused_workstream`, `paused_phase`, `gap_text`, `pushed_at`.

If `return_stack.length > 0` AND `TOP_FRAME.paused_phase === '07'` AND
`TOP_FRAME.paused_workstream === <invoked-slug>` → print `▶ Resuming workstream
{slug} from paused state.` and route directly to Step 5 (re-run the gates on
the already-written artifact at TOP_FRAME.paused_artifact). The gate workflows'
own commit logic (and gap-detect Step 4.5 frame-pop) handles the resume tail.

Otherwise proceed to Step 1. Skip Step 0.5 entirely if return_stack is empty
or malformed.

## Step 1: Workstream slug parse + validate (D-05)

Parse `$ARGUMENTS` to extract the first non-flag positional token as the
workstream-name. Accept canonical aliases (lowercase-mapped):

```
BMC | bmc        → business-model-canvas
GTM | gtm        → go-to-market
FIN | fin        → financial
OPS | ops        → operations
COMP | comp      → compliance
ROAD | road      → roadmap
BRAND | brand    → brand
RISK | risk      → risk
TECH | tech      → tech-arch
```

If no slug is provided, render the workstream picker via AskUserQuestion (or
TEXT_MODE numbered list) backed by `node brief/bin/brief-tools.cjs design list`:

<askuserquestion>
  <question>어떤 workstream을 작업하시겠어요? / Which workstream would you like to work on?</question>
  <options>
    (one option per slug emitted by `design list`)
  </options>
</askuserquestion>

Korean prompt is default when state.brief.region == 'kr'; English otherwise.

Validate the resolved slug via:

```
node brief/bin/brief-tools.cjs design get-workstream --slug <resolved-slug>
```

The dispatcher emits the spec JSON on success or a JSON `{error, available}`
body on stdout + non-zero exit on unknown slug. On non-zero exit, the workflow
BLOCKS with a structured message (Korean when kr; English otherwise):

```
워크스트림 '{name}'을 찾을 수 없습니다. 사용 가능한 workstream:
  - business-model-canvas (BMC)
  - go-to-market (GTM)
  - ...
재실행: /brief-design <slug-or-alias>
```

The `design list` output drives the available list. NO multi-workstream support
in v1 — the loader returns one spec, the workflow runs one Task, the handoff
offers a single recommended-next.

## Step 2: OBJECTIVES.md sufficiency precheck (D-06)

Read OBJECTIVES.md via `brief-tools objectives validate`. The validator returns
`{valid, missing[]}`. For workstream-relevant fields (heuristic starter map):

| Workstream | Required mutable_hypotheses fields |
|------------|-------------------------------------|
| business-model-canvas | target_audience, value_proposition_hypothesis |
| go-to-market | target_audience, gtm_motion |
| financial | monetization, pricing_hypothesis |
| operations | team_shape, infrastructure_assumptions |
| compliance | regulatory_packs, jurisdiction |
| roadmap | milestone_horizon, sequencing_signal |
| brand | voice, positioning_statement |
| risk | risk_appetite, top_risks |
| tech-arch | tech_stack_preference, integration_surfaces |

If the workstream-relevant fields are absent OR baseline validation reports
`valid: false` with relevant missing entries, the workflow:

1. Records the paused-status to STATE.md via the existing brief.workstream_paused
   allowlist field (Plan 07 Wave 4 ships the allowlist extension; Plan 03
   writes the markdown body — the body is not exercised end-to-end until
   Plan 08 canary, by which time Plan 07's extension is live). The mutation
   uses a Node one-liner that reads STATE.md, merges into the brief.* object,
   and writes back atomically under the existing state lock (same pattern as
   discover.md Step 4 / gap-detect.cjs return-stack writes):

   ```
   node -e "const{readModifyWriteStateMd}=require('./brief/bin/lib/state.cjs');const{extractFrontmatter,reconstructFrontmatter,stripFrontmatter}=require('./brief/bin/lib/frontmatter.cjs');const{planningPaths}=require('./brief/bin/lib/core.cjs');const cwd=process.cwd();const value=JSON.parse(process.argv[1]);readModifyWriteStateMd(planningPaths(cwd).state,(content)=>{const body=stripFrontmatter(content);const fm=extractFrontmatter(content)||{};(fm.brief=fm.brief||{}).workstream_paused=value;return '---\n'+reconstructFrontmatter(fm)+'\n---\n\n'+body;},cwd);" '{"slug":"<name>","reason":"objectives-insufficient","missing":[...]}'
   ```

2. Prints the user-facing directive (Korean default; English fallback):

   ```
   워크스트림 {name} 일시정지. OBJECTIVES.md에 {topic} 정보가 부족합니다.
   다음을 실행: /brief-define --amend → 후 /brief-design {workstream} 재실행.
   ```

   ```
   Workstream {name} paused. OBJECTIVES.md needs more detail on {topic}.
   Run: /brief-define --amend → then re-run /brief-design {workstream}.
   ```

3. Optionally writes `{artifact}.gaps.md` MATERIAL note for audit trail.

4. Exits cleanly with no return-stack push. The DESIGN→DEFINE direction is
   intentionally NOT a return-stack frame (D-06 lock): the return-stack is
   DISCOVER↔DESIGN only. A future OBJECTIVES amendment + re-invocation of
   /brief-design picks up where this run left off via the simpler paused-status
   sentinel — no frame, no fingerprint, no auto-pop.

## Step 3: Build business_context (D-13 inheritance from Phase 5)

Invoke context-inject.cjs via Node one-liner (same pattern as discover.md Step 4):

```
node -e "const { buildBusinessContext } = require('./brief/bin/lib/context-inject.cjs'); const ctx = buildBusinessContext({cwd: process.cwd()}); process.stdout.write(JSON.stringify(ctx));"
```

Capture the JSON as BUSINESS_CONTEXT_JSON. Extract `promptBlock` (XML
`<business_context>...</business_context>` injected verbatim into the spawned
Task), `requiredReading` (compliance-primer paths), `language`, `business_model`,
`region`, `compliance_packs`.

If `business_model` is null OR `region` is null, warn the user (non-blocking)
that the design Task will fall back to neutral B2B defaults; recommend
`/brief-define --amend` for higher-quality output.

## Step 4: Spawn workstream design Task (single — D-05)

Compute OUT_PATH from the spec's `output_artifact_template`:

```
OUT_PATH = .planning/workstreams/${WORKSTREAM_SLUG}/<basename(output_artifact_template)>
```

Read the workstream's `design-prompts.md` (or inline design_prompts list from
the spec) and the `templates/artifact.md` skeleton.

Spawn ONE Task using agents/brief-workstream-designer.md (planner decision per
07-CONTEXT A6 — ONE parameterized agent rather than 9 sibling agents).

CROSS-PLAN DEPENDENCY: agents/brief-workstream-designer.md is shipped by Plan
07-04 (Wave 3) Task 1. Plan 07-03 (Wave 2) only writes the markdown reference
here; the workflow body is not exercised end-to-end until Plan 07-08 (Wave 5)
canary E2E, by which time Plan 04's agent file exists. Tests for Plan 07-03
are grep-based on this workflow markdown; they do NOT spawn the agent.

Exactly one Task spawn — sibling-fan-out and slug-loop patterns are forbidden:

```
<Task>
  <subagent_type>brief-workstream-designer</subagent_type>
  <prompt>
    <!-- ctx.promptBlock VERBATIM from buildBusinessContext -->
    <business_context>...</business_context>
    {{WORKSTREAM_SLUG}} = <resolved-slug>
    {{DESIGN_PROMPT}}   = <body of design-prompts.md or inline prompt>
    {{TEMPLATE}}        = <body of templates/artifact.md>
    {{OUT_PATH}}        = <computed OUT_PATH>
    [agent body from agents/brief-workstream-designer.md]
  </prompt>
</Task>
```

### Step 4.5: FINANCIAL Driver Q&A (D-15) — only when WORKSTREAM_SLUG === 'financial'

Skip for any other workstream. Otherwise: Step 4.5.A pre-flight → Step 4.5.B 12-question Q&A
(Q1-Q12 covering Revenue 3 / Customer 2 / Cost 3 / Capital 2 / Time 2; Korean when region:kr)
→ Step 4.5.C persist drivers.md + set `state.brief.financial_drivers` → Step 4.5.D Step 5
Task gets `<financial_drivers>` → Step 4.5.E TEXT_MODE batches into ONE consolidated numbered list (FND-06). Output: `.planning/workstreams/financial/drivers.md`. Normative: @~/.claude/brief/workflows/design-financial-qa.md (also at brief/workflows/design-financial-qa.md).

## Step 5: Sequential 3-gate threading (D-02)

The artifact emitted by Step 4 passes through the 3 gates IN SERIES:
ALIGN → AUDIENCE → COMPLIANCE. Concurrent gate dispatch is forbidden
here. fail-fast on any BLOCKING verdict — downstream gates are NOT
invoked when an upstream gate exits with a non-override BLOCKING decision.

### Step 5.A: ALIGN gate

Invoke @~/.claude/brief/workflows/align-gate.md (also at brief/workflows/align-gate.md)
with parameters:

```
CANDIDATE_PATH    = {{OUT_PATH}}
BASELINE_PATH     = .planning/OBJECTIVES.md
VERDICT_OUT_PATH  = .planning/.align-verdict-${WORKSTREAM_SLUG}.tmp.json
```

Parse the workflow exit JSON `{decision, override?}`. Branch:
- `ALIGNED`                          → proceed to 5.B
- `DRIFTED-*` with `override: true`  → proceed to 5.B (force-accept audit)
- `DRIFTED-pending-user-action`      → exit (fail-fast, user-deferred)

### Step 5.B: AUDIENCE gate

Invoke @~/.claude/brief/workflows/audience-guard.md (also at brief/workflows/audience-guard.md)
with parameters:

```
ARTIFACT_PATH    = {{OUT_PATH}}
VERDICT_OUT_PATH = .planning/.audience-verdict-${WORKSTREAM_SLUG}.tmp.json
```

Parse exit JSON. Branch:
- `AUDIENCE-OK`                          → proceed to 5.C
- `DRIFTED-*` with `override: true`      → proceed to 5.C (force-accept audit)
- `DRIFTED-pending-user-action`          → exit (fail-fast, user-deferred)

### Step 5.C: COMPLIANCE gate (Phase 7 third gate — Plan 07-01)

Invoke @~/.claude/brief/workflows/compliance.md (also at brief/workflows/compliance.md)
with parameters:

```
ARTIFACT_PATH    = {{OUT_PATH}}
VERDICT_OUT_PATH = .planning/.compliance-verdict-${WORKSTREAM_SLUG}.tmp.json
```

Parse exit JSON. Branch (D-01 deviation locked):
- `COMPLIANCE-OK`                                 → proceed to Step 6
- `FINDINGS-MATERIAL`                             → proceed to Step 6 (NO
  interrupt — material findings are recorded in {{OUT_PATH}}.compliance.md
  and the legal-counsel disclaimer footer renders on every emitted report;
  Phase 7 D-01 deviation from Phase 4/5)
- `FINDINGS-BLOCKING` with `override: true`       → proceed to Step 6
- `FINDINGS-BLOCKING` non-override                 → exit (fail-fast)

The fail-fast routing means: any BLOCKING-class exit at 5.A, 5.B, or 5.C
short-circuits the rest of Step 5. Re-running /brief-design after the user
amends OBJECTIVES or rewrites the artifact resumes from Step 0.5 (return-stack
auto-resume) or Step 1 (fresh invocation).

## Step 6: Update workstream-completion state

Record the now-AUDIENCE-OK + COMPLIANCE-{OK|MATERIAL} workstream in state.
The mutation uses a Node one-liner under the existing state lock (same pattern
as Step 1 paused-status write):

```
node -e "const{readModifyWriteStateMd}=require('./brief/bin/lib/state.cjs');const{extractFrontmatter,reconstructFrontmatter,stripFrontmatter}=require('./brief/bin/lib/frontmatter.cjs');const{planningPaths}=require('./brief/bin/lib/core.cjs');const cwd=process.cwd();const slug=process.argv[1];readModifyWriteStateMd(planningPaths(cwd).state,(content)=>{const body=stripFrontmatter(content);const fm=extractFrontmatter(content)||{};const brief=(fm.brief=fm.brief||{});brief.last_design_workstream=slug;if(!Array.isArray(brief.workstreams_completed))brief.workstreams_completed=[];if(!brief.workstreams_completed.includes(slug))brief.workstreams_completed.push(slug);return '---\n'+reconstructFrontmatter(fm)+'\n---\n\n'+body;},cwd);" "<WORKSTREAM_SLUG>"
```

The same one-liner appends the slug to `brief.workstreams_completed`
(a list — append-only, deduped).

CROSS-PLAN DEPENDENCY: the `brief.last_design_workstream` and
`brief.workstreams_completed` allowlist extensions land in Plan 07-07 Task 2;
end-to-end exercise comes via Plan 07-08 canary. Plan 07-03's tests are
grep-based on this markdown — they do NOT execute the state writes.

## Step 7: Workstream completion handoff (D-08)

Render the 4-element handoff to the user (Korean by default; English fallback):

```
✅ {WORKSTREAM_SLUG} 완료 / completed
  Artifact: {{OUT_PATH}}
  ALIGN:      {align_decision} ({align_findings_count}건)
  AUDIENCE:   {audience_decision} ({audience_findings_count}건)
  COMPLIANCE: {compliance_decision} ({compliance_findings_count}건 — see
              {{OUT_PATH%.md}}.compliance.md)
```

Compute Recommended next via the dispatcher (derive-at-read, no stored field):

```
node brief/bin/brief-tools.cjs design recommended-next \
  --completed "$(node brief/bin/brief-tools.cjs state json --pick brief.workstreams_completed --raw)"
```

Render AskUserQuestion (or TEXT_MODE numbered list) with 3 options:

<askuserquestion>
  <question>다음 단계를 선택해 주세요 / Choose the next step</question>
  <options>
    <option>1. 추천된 다음 workstream으로 계속 ({recommended_next}) / Continue with recommended next</option>
    <option>2. 여기서 멈추기 / Stop here</option>
    <option>3. 다른 workstream 선택하기 / Pick different workstream</option>
  </options>
</askuserquestion>

Action per selection:

- **1. Continue** → Recursive `/brief-design <recommended-next>` invocation via
  the Skill tool (orchestrator-boundary discipline inherited from Phase 5 D-08
  — Skill-tool recursion respects the parent-orchestrator surface; a child
  Task spawn would conflate parent + child agents and is forbidden here).
  Print `▶ /brief-design ${recommended_next}` so the user sees the dispatch.
- **2. Stop here** → atomic commit of STATE.md (last_design_workstream +
  workstreams_completed) via `brief-tools commit`; exit success.
- **3. Pick different** → render the full workstream picker (multi-choice list
  from `design list`); recurse on user selection via the Skill tool (same
  orchestrator-boundary discipline as option 1).

If `recommended_next` is null (all workstreams completed), option 1 is
disabled — the prompt collapses to 2 options (Stop here / Pick different).

</process>

<no_hooks_assertion>
This workflow is invoked EXPLICITLY from commands/brief/design.md. No PostToolUse,
SubagentStop, or other hook auto-attaches /brief-design. The 3 gate workflow
invocations in Step 5 are similarly explicit orchestrator steps (inherited from
Phase 4 Anti-pattern #2 + Phase 5 audience-guard.md + Phase 7 Plan 07-01
compliance.md).

Load-bearing citations:
  - 07-CONTEXT.md D-02 (sequential threading inside design.md, NOT hook-driven)
  - .planning/research/ARCHITECTURE.md Anti-pattern #2 (no hook-based gates)
  - 07-RESEARCH.md (ALIGN+AUDIENCE precedent inherited; COMPLIANCE same shape)

Structural test (Plan 07-08 canary):
  ! grep -rE "brief/workflows/design|brief-workstream-designer|brief/workflows/add-workstream|agents/brief-compliance-checker" hooks/ 2>/dev/null
  MUST return exit 0 (no hook file references this workflow, the COMPLIANCE
  gate, or the add-workstream surface).
</no_hooks_assertion>

<command_surface_assertion>
/brief-design is the SOLE user-facing command added by Plan 07-03 (NET +1).
Plan 07-04 separately ships /brief-add-workstream (NET +1 in that plan); Plan
07-03 does NOT add a second command.

FORBIDDEN files (must NOT exist post-Plan-07-03 — these would split the surface):
  - commands/brief/recompliance.md            (re-run-compliance is NOT a separate command)
  - commands/brief/realign-workstream.md      (re-run-align is NOT a separate command)
  - commands/brief/design-all.md              (multi-workstream is NOT a separate command)
  - commands/brief/refinancial.md             (financial-rerun is NOT a separate command)
  - commands/brief/design-bmc.md              (per-slug commands violate D-05)
  - commands/brief/compliance.md              (gate is orchestrator-internal)
  - commands/brief/objectives-amend.md        (amend is /brief-define --amend)

The v1 path for re-running a gate is to re-invoke /brief-design <slug> on the
already-written artifact; Step 0.5 auto-detects the resume case via the
return-stack and re-runs the gates without re-spawning the design Task.

Structural test (Plan 07-08):
  [ ! -f commands/brief/recompliance.md ] && \
  [ ! -f commands/brief/realign-workstream.md ] && \
  [ ! -f commands/brief/design-all.md ] && \
  [ ! -f commands/brief/refinancial.md ] && \
  [ ! -f commands/brief/design-bmc.md ] && \
  [ ! -f commands/brief/compliance.md ] && \
  [ ! -f commands/brief/objectives-amend.md ]
  MUST exit 0.
</command_surface_assertion>
