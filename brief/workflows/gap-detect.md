<purpose>
Invoke the BRIEF gap-detector as an explicit orchestrator step (NOT a hook).

Invoked by: brief/workflows/align-gate.md Step 8 (added by Plan 06), directly
AFTER the ALIGN verdict is committed. D-02 locked: gap-detect fires after
ALIGN verdict only (ALIGNED, DRIFTED-objective, or DRIFTED-output).

Reads: {{ARTIFACT_PATH}} + {{OBJECTIVES_BASELINE_PATH}} (.planning/OBJECTIVES.md)
       + {{BUSINESS_CONTEXT_BLOCK}} (ctx.promptBlock from context-inject.cjs).
Produces: {artifact}.gaps.md (D-04 paired-sibling) + state.brief.return_stack
          OR state.brief.gap_queue update + atomic git commit.

Contract with caller (align-gate.md Step 8):
- Caller passes {{VERDICT_OUT_PATH}} (defaults to .planning/.gap-detect-verdict.tmp.json).
- Caller passes {{CURRENT_WORKSTREAM}} (e.g., "go-to-market") — for history
  scoping in Pattern 3 iteration counting.
- Caller passes {{PAUSED_PHASE}} (e.g., "07") — frame field D-05.

Phase 7+ gates may invoke this workflow from their own orchestrator step
by supplying the same parameter set. The workflow body is generic.
</purpose>

<process>

## Step 0: Parameter parsing + TEXT_MODE detection

Read invocation parameters:
  - ARTIFACT_PATH (required)
  - OBJECTIVES_BASELINE_PATH (required — usually .planning/OBJECTIVES.md)
  - BUSINESS_CONTEXT_BLOCK (required — from context-inject.cjs)
  - CURRENT_WORKSTREAM (required)
  - PAUSED_PHASE (required)
  - VERDICT_OUT_PATH (optional — default .planning/.gap-detect-verdict.tmp.json)

Verify ARTIFACT_PATH and OBJECTIVES_BASELINE_PATH exist. Emit user-facing
error and exit if missing. Korean error text when brief.region: kr;
English otherwise.

  Korean: "GAP-DETECT 실행 중단: ARTIFACT 또는 OBJECTIVES baseline 파일이 존재하지 않습니다."
  English: "GAP-DETECT aborted: ARTIFACT or OBJECTIVES baseline file not found."

TEXT_MODE detection: `TEXT_MODE=true` if `$ARGUMENTS` contains `--text` OR
`workflow.text_mode` from `.planning/config.json` is `true`. This is the
same detection rule as align-gate.md Step 0 — copied here so the workflow
is self-contained. Under TEXT_MODE the AskUserQuestion blocks in Step 5.1
and Step 5.2 render as plain-text numbered lists.

## Step 1: LLM pass (no deterministic short-circuit in Phase 6)

Unlike align-gate.md, gap-detect has no deterministic-first screen — the
decision ("what's MISSING from the artifact") is inherently semantic.
Always spawn the subagent.

Task spawn contract:
  - Subagent: agents/brief-gap-detector.md
  - Prompt interpolations:
      {{ARTIFACT_PATH}}              → parameter value
      {{OBJECTIVES_BASELINE_PATH}}   → parameter value
      {{BUSINESS_CONTEXT_BLOCK}}     → VERBATIM paste (XML block from context-inject.cjs)
      {{VERDICT_OUT_PATH}}           → parameter value
      {{KOREA_LANGUAGE}}             → "true" if brief.region === 'kr' else "false"
  - Prompt MUST wrap artifact + baseline contents in explicit
    `<artifact>...</artifact>` and `<objectives_baseline>...</objectives_baseline>`
    delimiters (prompt-injection discipline, T-06-02-01).

Timeout handling: if subagent does not complete, emit a fallback
MATERIAL-only verdict with findings describing the timeout (no
auto-retry — Phase 4 D-06 "no auto-retry at gate layer" inheritance;
meta-arbiter is the retry mechanism, not the gate itself).

Fallback verdict:
```json
{
  "decision": "GAPS-MATERIAL-ONLY",
  "severity": "material",
  "findings_count": 1,
  "findings": [{
    "severity": "material",
    "location": "—",
    "description": "Gap-detector subagent timed out; no gap evaluation performed.",
    "topic_fingerprint": "meta-gap-detect-timeout"
  }],
  "rationale": "Subagent timeout (Phase 4 D-06 no-auto-retry discipline)."
}
```

After subagent returns, read the verdict file. If JSON.parse fails OR
validateVerdict from gap-detect.cjs (Plan 03) returns an error, treat as
MATERIAL-only with a parse-failure finding (Pitfall #3 mitigation —
cross-runtime structured-JSON brittleness).

## Step 2: Route on verdict decision

Read the verdict. Branch on decision:

  - GAPS-NONE              → Step 3 (write empty gaps sibling + proceed)
  - GAPS-MATERIAL-ONLY     → Step 4 (write gaps sibling + gap_queue update + proceed)
  - GAPS-BLOCKING          → Step 5 (iteration count + meta-arbiter logic)

## Step 3: GAPS-NONE commit path

Invoke:
```
node brief/bin/brief-tools.cjs gap-detect commit \
  --verdict "{{VERDICT_OUT_PATH}}" \
  --artifact "{{ARTIFACT_PATH}}"
```

The commit path writes `{artifact}.gaps.md` with an empty findings
section + updates `state.brief.last_gate_results.gap_detect` (mirroring
audience D-10 round-trip discipline). No frame push. Orchestrator
proceeds.

## Step 4: GAPS-MATERIAL-ONLY commit path

Invoke:
```
node brief/bin/brief-tools.cjs gap-detect commit \
  --verdict "{{VERDICT_OUT_PATH}}" \
  --artifact "{{ARTIFACT_PATH}}" \
  --workstream "{{CURRENT_WORKSTREAM}}"
```

The commit path writes `{artifact}.gaps.md` + appends each MATERIAL
finding to `state.brief.gap_queue[]` with `{workstream, artifact,
gap_text, topic_fingerprint, detected_at}` (NICE-TO-HAVE findings are
DROPPED per D-03; not even written to gap_queue).

Orchestrator proceeds; caller (align-gate.md) can read
`state.brief.last_gate_results.gap_detect.decision === 'GAPS-MATERIAL-ONLY'`
and surface a caveat in the next artifact's AUDIENCE frontmatter.

## Step 5: GAPS-BLOCKING — iteration count + meta-arbiter

Compute iteration count for the BLOCKING finding's topic_fingerprint:

```
node brief/bin/brief-tools.cjs gap-detect count-iterations \
  --workstream "{{CURRENT_WORKSTREAM}}" \
  --fingerprint "<first blocking finding's topic_fingerprint>"
```

Returns integer N = count of prior pushes for (workstream, fingerprint)
in `state.brief.return_stack_history`.

Branch on N:

### Step 5.0: N === 0 → push directly

Invoke:
```
node brief/bin/brief-tools.cjs gap-detect push-frame \
  --verdict "{{VERDICT_OUT_PATH}}" \
  --artifact "{{ARTIFACT_PATH}}" \
  --workstream "{{CURRENT_WORKSTREAM}}" \
  --paused-phase "{{PAUSED_PHASE}}"
```

Writes frame to return_stack AND return_stack_history. Exits the
workflow with stdout message:

```
RETURNED-TO-DISCOVER
triggering_topic: <topic>
Next: run /brief-discover to resume research on this topic.
```

### Step 5.1: N === 1 → meta-arbiter (D-08)

Render the 3-choice AskUserQuestion (Claude Code) OR numbered-list
(TEXT_MODE):

**AskUserQuestion:**
```
<askuserquestion>
  <header>Gap loop</header>
  <question>We've gone back to research for '{triggering_topic}' twice. Is this gap genuinely blocking, or are we polishing?</question>
  <options>
    <option>Keep researching</option>
    <option>Proceed with assumption</option>
    <option>Cancel workstream</option>
  </options>
</askuserquestion>
```

**Korean (when brief.region: kr):**
```
<askuserquestion>
  <header>반복 루프</header>
  <question>'{triggering_topic}'에 대해 이미 두 번 되돌아 연구했습니다. 이 부분이 정말로 진행을 막고 있나요, 아니면 다듬고 있는 건가요?</question>
  <options>
    <option>계속 연구하기</option>
    <option>가정을 명시하고 진행</option>
    <option>이 워크스트림 취소</option>
  </options>
</askuserquestion>
```

**TEXT_MODE fallback** (numbered list 1/2/3):
```
Gap loop / 반복 루프

'{triggering_topic}' 연구에 두 번째 되돌아갑니다. 이 공백이 정말로 차단인가요, 아니면 다듬고 있는 건가요?
  1. Keep researching / 계속 연구하기
  2. Proceed with assumption / 가정을 명시하고 진행 (≥20자 정당성 필요)
  3. Cancel workstream / 이 워크스트림 취소

선택 > 
```

Action per choice:

1. **Keep researching** → invoke `gap-detect push-frame` (same as Step
   5.0) → exit RETURNED-TO-DISCOVER.

2. **Proceed with assumption** → prompt for justification (min 20
   non-whitespace chars; on <20 re-prompt once, on second <20 re-render
   Step 5.1 menu). Sanitize via security.cjs:sanitizeForPrompt. Write
   assumption to `.planning/OBJECTIVES.md` under `## Assumptions` + log
   audit entry in `state.brief.last_gate_results.gap_detect.assumption_log[]`.
   Orchestrator proceeds WITHOUT pushing frame.

3. **Cancel workstream** → invoke `gap-detect cancel-workstream
   --workstream "{{CURRENT_WORKSTREAM}}"` → clears return_stack frames
   for this workstream + sets
   `state.brief.workstream_status[{workstream}] = 'cancelled-after-loop'`
   + exits workflow.

### Step 5.2: N >= 2 → HARD CAP (no bypass — D-07 exact wording)

Display:
```
We've researched {triggering_topic} 3 times. The loop protection is engaged. Pick:
  (1) Proceed with explicit written assumption [required].
  (2) Cancel workstream.
  (3) Escalate to human (exit with checkpoint for manual review).
```

Korean variant:
```
'{triggering_topic}'에 대해 3번 되돌아 연구했습니다. 루프 보호 장치가 작동합니다. 선택:
  (1) 명시적 서면 가정과 함께 진행 [필수].
  (2) 이 워크스트림 취소.
  (3) 수동 검토를 위해 사람 개입 (체크포인트 종료).
```

No option 4. No force-continue. AskUserQuestion or TEXT_MODE
numbered-list only.

Action per choice (same sanitize + write discipline as Step 5.1):
1. → justification ≥20 chars required; write to
     OBJECTIVES.md#Assumptions; proceed (no frame push).
2. → cancel-workstream (same as Step 5.1.3).
3. → exit with checkpoint resume hint: "Escalated to human review. See
     .planning/.checkpoints/gap-detect-{timestamp}.md for context."

Under NO condition at N >= 2 does the workflow call `gap-detect push-frame`.

## Step 6: Exit

Return control to the caller (align-gate.md Step 8) with one of:
- `{"decision": "GAPS-NONE"}` — caller proceeds normally
- `{"decision": "GAPS-MATERIAL-ONLY", "caveat": true}` — caller surfaces
  caveat in next AUDIENCE frontmatter
- `{"decision": "GAPS-BLOCKING", "pushed": true}` — caller exits with
  RETURNED-TO-DISCOVER
- `{"decision": "GAPS-BLOCKING", "proceed_with_assumption": true}` —
  caller proceeds (user accepted N=1 proceed path)
- `{"decision": "GAPS-BLOCKING", "workstream_cancelled": true}` —
  caller exits (workstream cancelled)

</process>

<no_hooks_assertion>
This workflow is invoked EXPLICITLY from brief/workflows/align-gate.md
Step 8 (added by Plan 06). There is NO PostToolUse, NO SubagentStop, NO
Stop, NO other hook that auto-attaches gap-detect.

Load-bearing citations:
  - 06-CONTEXT.md D-02: "Trigger is after ALIGN verdict only. Zero new
    hook surfaces."
  - 06-RESEARCH.md Anti-Patterns: "Hook-based gap-detect auto-attach
    forbidden (grep hooks/ for gap-detect must return 0)."
  - Phase 4 ROADMAP SC-3 inheritance.
  - .planning/research/ARCHITECTURE.md Anti-pattern #2 forbids
    hook-based gate invocation at the architecture-pattern level.

Structural test (Plan 08):
  ! grep -r "gap-detect\|brief-gap-detector" hooks/ 2>/dev/null
  MUST return exit 0.
</no_hooks_assertion>

<command_surface_assertion>
This workflow file lives under brief/workflows/ — it is an internal
orchestrator step, NOT a user-facing slash command. It is invoked by
another workflow (brief/workflows/align-gate.md Step 8) via an inline
"invoke brief/workflows/gap-detect.md with parameters ..." step.

No new file exists under commands/brief/*.md for this gate (Surface
Cap: Phase 6 net adds = 0 user-facing commands — CLAUDE.md ≤12 cap;
D-10 resume is inside /brief-discover). Phase 2 D-06 command-cap
discipline inherited verbatim.

Structural test (Plan 08):
  [ ! -f commands/brief/gap-detect.md ] && \
    [ ! -f commands/brief/gap.md ] && \
    [ ! -f commands/brief/return-stack.md ] && \
    [ ! -f commands/brief/resume.md ]
  MUST exit 0.
</command_surface_assertion>
