<purpose>
DISCOVER phase — broad parallel domain research with provenance + audience + context-injection.

Preserves Phase 3 pre-flow guards (DEF-05 block-gate D-12 + DEF-06 stale-anchor D-13).
Phase 5 body adds (Plan 05-07): multi-select of 9 default categories + Custom (DSC-01, DSC-02),
context-inject via brief/bin/lib/context-inject.cjs (CC-02, D-13, D-14), wave spawn of
brief-domain-researcher ≤4 concurrent (DSC-03, D-02, D-15), per-artifact AUDIENCE gate via
brief/workflows/audience-guard.md (DSG-13, D-09/D-10/D-11), atomic commit per artifact
(Phase 4 Plan 04-04 pattern). Korean by default (Korea-signal D-11); TEXT_MODE fallback FND-06.
</purpose>

<process>

## Step 0: TEXT_MODE Detection

Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode` from init
JSON is true. When TEXT_MODE is active, replace every AskUserQuestion call (Steps 2, 3,
and the downstream AUDIENCE 3-path interrupts invoked from Step 6) with a plain-text
numbered list and ask the user to type their choice number.

## Step 1: Block-gate (DEF-05, D-12)

Invoke `brief-tools objectives validate` as a child process or via direct lib import.

If validation returns `{ valid: false, missing: [...] }`, the CLI emits the Pitfall 5
Korean recovery-oriented block-gate message to stderr AND exits non-zero SILENTLY (W-6
discipline — no English "validation failed" leakage). The workflow MUST propagate the
non-zero exit back to the caller. No pass-through, no `--force` flag exists.

Canonical block-gate message (verbatim, from RESEARCH.md §Pitfall 5 template):

```
⚠ /brief-discover는 아직 실행할 수 없습니다.

OBJECTIVES.md에 아직 작성되지 않은 필수 항목이 있습니다:
  • 비즈니스 모델 (business_model)
  • 규제 팩 (compliance_packs)

보완 방법:  /brief-define --amend

지금 쓰신 내용은 그대로 남아있습니다.
보완이 끝나면 다시 /brief-discover를 실행해주세요.
```

If OBJECTIVES.md is entirely absent, the CLI emits the dedicated Korean message
`OBJECTIVES.md 파일이 아직 없습니다` with `/brief-define` start hint (20–35 min estimate).

## Step 2: Stale-anchor check (DEF-06, D-13)

Invoke `brief-tools objectives stale-check` to get `{ stale, age_hours }`.

D-13 gating: this check runs ONLY because `/brief-discover` is a qualifying
new-activity entry point. It does NOT run on `/brief-status`, `/brief-help`,
or mid-workflow invocations (that logic lives in `shouldStaleAnchorFire` in
`brief/bin/lib/define.cjs` — `QUALIFYING_ENTRY_POINTS` closed set).

If `stale === true`:

<askuserquestion>
  <question>
⚠ OBJECTIVES.md이 {age_hours}시간 전 마지막으로 수정되었습니다 (48시간 경과).

본격적으로 일을 시작하기 전에 한 번 정비하시는 것을 권장합니다.

어떻게 진행하시겠어요?
  </question>
  <options>
    <option>잠시 검토에 — /brief-define --amend 로 수정 흐름 진입</option>
    <option>현재 OBJECTIVES를 보고 맞으면 승인 — 내용 확인 후 mtime 갱신</option>
    <option>이제 승인, 빠르게 진행 — 즉시 mtime 갱신하고 다음 단계로</option>
  </options>
</askuserquestion>

Under TEXT_MODE, render the three options as a plain-text numbered list (1/2/3)
and prompt the user to type their choice number. NO bypass — the user MUST pick
one of the three options to proceed.

Action per selection:

- **1. 잠시 검토에** — Dispatch to `/brief-define --amend`; flow exits until amend completes.
- **2. 현재 OBJECTIVES를 보고 맞으면 승인** — Show OBJECTIVES.md, ask "내용 확인하셨나요?
  맞으면 승인해 주세요."; on approval, touch mtime and continue.
- **3. 이제 승인, 빠르게 진행** — Immediately touch `.planning/OBJECTIVES.md` mtime; continue.

## Step 3: Category multi-select (DSC-01, DSC-02)

Present the 9 default research categories + "Other (free-text)" as a multi-select prompt.
Under Claude Code, use AskUserQuestion. Under TEXT_MODE (other runtimes), render a numbered list.

AskUserQuestion form:

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

TEXT_MODE numbered-list form (FND-06 multi-runtime parity):

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

Parsing under TEXT_MODE: comma-separated list; numeric 1-9 → default category slug; `Other:<TOPIC>` → custom slug `custom-<hash>` with topic stored separately; empty input → re-prompt.

Validation:
- Zero categories selected → `최소 한 개 이상 선택해 주세요 / Please pick at least one category`
- Only "Other" without topic → `사용자 정의 주제를 입력해 주세요 / Please describe your custom research topic`
- Degenerate topic (<10 chars or \b(stuff|things|research|topic)\b) → `좀 더 구체적으로 적어주세요 / Please describe the research question more specifically`

Category-to-slug mapping (stable filename-on-disk):
  market-sizing / competitor-landscape / customer-research / regulation-and-compliance /
  technology-and-feasibility / distribution-channels / pricing-benchmarks / case-studies /
  trends-and-forecasts. Custom slugs use prefix `custom-` (lowercase-dash-separated).

After validation, the user-selected set becomes `SELECTED_SLUGS` (array).

## Step 4: Build business_context block (CC-02, D-13, D-14)

Invoke `brief/bin/lib/context-inject.cjs` via a Node.js one-liner:

```bash
node -e "const { buildBusinessContext } = require('./brief/bin/lib/context-inject.cjs'); const ctx = buildBusinessContext({cwd: process.cwd()}); process.stdout.write(JSON.stringify(ctx));"
```

Parse the JSON output and extract `promptBlock`, `requiredReading`, `language`,
`audienceDefaults`, `business_model`, `region`. This keeps the helper CJS-only
(no bundling) and avoids runtime dependencies (A1).

Fields used by Step 5:
  - `ctx.promptBlock` — XML `<business_context>...</business_context>` block injected VERBATIM
    into every researcher Task prompt (do NOT re-serialize).
  - `ctx.requiredReading` — compliance-primer paths (e.g., korea/pipa-2026.md) to pass as
    the researcher's required_reading entries.
  - `ctx.language` — 'ko' or 'en' — researcher output body language.
  - `ctx.audienceDefaults` — 3 auto-populated AUDIENCE frontmatter fields (researcher-side).

If `ctx.business_model === null` OR `ctx.region === null`, warn the user (non-blocking) —
researcher falls back to neutral B2B-default lens:

  `⚠ business_model 또는 region이 미설정입니다. Researcher가 중립 기본(B2B) 관점으로 실행됩니다. /brief-define --amend로 정확한 맥락을 설정하시면 결과 품질이 높아집니다.`

## Step 5: Wave partition and researcher Task spawn (DSC-03, D-02)

Partition `SELECTED_SLUGS` into waves of ≤4 via `ceil(N/4)`:

```
const waves = [];
for (let i = 0; i < SELECTED_SLUGS.length; i += 4) {
  waves.push(SELECTED_SLUGS.slice(i, i + 4));
}
```

For each wave, emit ONE orchestrator message containing one `<Task>` block per slug in the wave.
Each Task message includes the full researcher prompt with template interpolations:

  {{CATEGORY}}             → display name (e.g., 'Market Sizing')
  {{TOPIC}}                → category default or user-typed custom topic
  {{OUT_PATH}}             → `.planning/discover/${slug}.md`
  `<business_context>`     → ctx.promptBlock VERBATIM
  required_reading entries → OBJECTIVES.md + PROJECT.md + ctx.requiredReading paths

Example orchestrator message (Claude Code — 2-slug wave, abridged):

```
<Task>
  <subagent_type>brief-domain-researcher</subagent_type>
  <prompt>
    <!-- ctx.promptBlock VERBATIM from context-inject.cjs -->
    <business_context>
      <business_model>b2b</business_model><region>kr</region><language>ko</language>
      <audience_policy><default>internal</default><permitted>internal, partner, external</permitted></audience_policy>
      <compliance_packs><pack>PIPA</pack><pack>ISMS-P</pack></compliance_packs>
      <required_reading>
        <file>brief/references/compliance/korea/pipa-2026.md</file>
        <file>brief/references/compliance/korea/isms-p.md</file>
      </required_reading>
    </business_context>
    {{CATEGORY}} = Market Sizing
    {{TOPIC}} = (category default)
    {{OUT_PATH}} = .planning/discover/market-sizing.md
    [full body copied from agents/brief-domain-researcher.md]
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
```

Orchestrator BLOCKS until all Task results return (synchronous wave per 05-RESEARCH.md §Pattern 1).

Wave-failure policy (05-RESEARCH.md §Pattern 1 lines 285-287):
  If a Task times out or returns malformed output, the orchestrator writes a stub to
  {{OUT_PATH}} with frontmatter `status: researcher_failed` and body:

  ```
  > Researcher returned no output; manual research required.
  > [ASSUMED: auto-stub generated from researcher failure]
  ```

  AUDIENCE is still invoked on the stub (Step 6) — the stub has valid frontmatter so it
  returns AUDIENCE-OK with a material finding noting the auto-stub. NO auto-retry at the
  wave layer (Phase 4 D-06 inheritance).

After all Tasks in the wave return, proceed to Step 6 for each slug in the wave.

## Step 6: AUDIENCE gate per artifact (DSG-13)

For EACH slug in the completed wave, invoke brief/workflows/audience-guard.md sequentially:

```
ARTIFACT_PATH = .planning/discover/${slug}.md
BASELINE_PATH = .planning/OBJECTIVES.md
VERDICT_OUT_PATH = .planning/.audience-verdict-${slug}.tmp.json
```

Invoke the workflow with these parameters. The audience-guard workflow:
  (1) runs deterministic screen (may short-circuit DRIFTED-frontmatter at blocking);
  (2) if no short-circuit, spawns brief-audience-guard subagent for LLM pass;
  (3) merges verdicts; writes sibling `{artifact}.audience.md` + `state.brief.last_gate_results.audience`;
  (4) on DRIFTED, interrupts user with 3-path AskUserQuestion (Plan 04 Task 4);
  (5) on AUDIENCE-OK or force-accept, atomic commit of artifact + sibling + STATE.md.

If the user selects "audience 수정하기 (frontmatter 보완)" at a DRIFTED-frontmatter interrupt,
the workflow exits with resume hint; the user amends and re-runs /brief-discover. Subsequent
runs skip already-AUDIENCE-OK artifacts (idempotency via `state.brief.last_gate_results.audience.at`
vs `fs.statSync(artifact).mtimeMs`). State is OVERWRITTEN per-run; per-artifact history lives in
sibling `.audience.md` files.

## Step 7: Atomic commit + summary

For each AUDIENCE-OK artifact, audience-guard's Step 4 already performs the atomic commit
(artifact + {artifact}.audience.md + STATE.md) via `brief-tools commit --files`. This workflow
does NOT re-commit. After all waves complete, print a Korean/English summary:

```
✅ DISCOVER 완료 / DISCOVER complete

생성된 artifact / Generated artifacts:
  - .planning/discover/market-sizing.md (AUDIENCE-OK)
  - .planning/discover/competitor-landscape.md (AUDIENCE-OK)
  - .planning/discover/regulation-and-compliance.md (DRIFTED-frontmatter — override applied)

다음 단계 / Next step:  Phase 7 /brief-design (after Phase 6 bidirectional return stack)
```

If any artifact ended in DRIFTED-pending-user-action, list those with resume hints. Exit 0.

</process>

<no_hooks_assertion>
This workflow is invoked EXPLICITLY from commands/brief/discover.md. No PostToolUse,
SubagentStop, or other hook auto-attaches /brief-discover. The AUDIENCE gate invocation
in Step 6 is similarly an explicit orchestrator step (inherited from Phase 4 Anti-pattern #2).

Structural test (Plan 08 canary):
  ! grep -r "brief-discover\|discover\.md\|brief_discover" hooks/ 2>/dev/null
  MUST return exit 0 (no hook file references this workflow).
</no_hooks_assertion>

<command_surface_assertion>
/brief-discover is the SINGLE user-facing command affected by Phase 5. Its stub existed from
Phase 3 Plan 05; Phase 5 replaces the body. NET user-facing command additions in Phase 5 = 0.

Structural test (Plan 08):
  [ ! -f commands/brief/audience.md ] && [ ! -f commands/brief/audience-check.md ] && [ ! -f commands/brief/reaudit.md ] && [ ! -f commands/brief/realign.md ] && [ ! -f commands/brief/discover-audit.md ]
</command_surface_assertion>
