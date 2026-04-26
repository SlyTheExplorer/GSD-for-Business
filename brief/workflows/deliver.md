<purpose>
DELIVER phase — Type A auto-synthesis of 4 PRD-input artifacts (PRODUCT-BRIEF /
SERVICE-POLICY / HIGH-LEVEL-SPEC / FEATURE-MAP) AND Type B single-artifact synthesis
(internal-deck / proposal-deck / exec-summary / decision-memo) with inline ALIGN →
AUDIENCE → COMPLIANCE gate threading.

Plans 01-07 ship the libs (deliver.cjs / voice-fit.cjs / leakage-diff.cjs /
export.cjs), agents (brief-deliver-type-a, brief-deliver-type-b), templates (4 Type
A + 4 Type B + 3 Marp themes), and the CC-03 PreToolUse-on-Bash hook
(brief-validate-frontmatter.sh). Plan 08 wires them into the user-facing
`/brief-deliver` slash command via this workflow.

Korean by default (Korea-signal D-11 inheritance); TEXT_MODE fallback FND-06.
</purpose>

<process>

## Step 0: TEXT_MODE Detection

Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode` from
init JSON is true. When TEXT_MODE is active, every AskUserQuestion call (Steps 3A
artifact-confirmation, downstream AUDIENCE/COMPLIANCE 3-path interrupts, Type B
artifact-name picker) renders as a plain-text numbered list and asks the user to type
their choice number.

## Step 1: Pre-flight guards (Phase 3 inheritance — DEF-05 block-gate, DEF-06 stale-anchor)

### Step 1.1: Block-gate (DEF-05, D-12 — preserved from Phase 3)

Invoke `brief-tools objectives validate` as a child process or via direct lib import.

If validation returns `{ valid: false, missing: [...] }`, the CLI emits the Korean
recovery-oriented block-gate message to stderr AND exits non-zero SILENTLY
(W-6 discipline — no English leakage). The workflow MUST propagate the non-zero
exit back to the caller. No `--force` flag exists.

Canonical block-gate message (verbatim from RESEARCH.md §Pitfall 5 template;
mirrors brief/workflows/discover.md Step 1):

```
⚠ /brief-deliver는 아직 실행할 수 없습니다.

OBJECTIVES.md에 아직 작성되지 않은 필수 항목이 있습니다:
  • 비즈니스 모델 (business_model)
  • 규제 팩 (compliance_packs)

보완 방법:  /brief-define --amend

지금 쓰신 내용은 그대로 남아있습니다.
보완이 끝나면 다시 /brief-deliver를 실행해주세요.
```

If OBJECTIVES.md is entirely absent, the CLI emits the dedicated Korean message
`OBJECTIVES.md 파일이 아직 없습니다` with `/brief-define` start hint.

### Step 1.2: Stale-anchor check (DEF-06, D-13)

Invoke `brief-tools objectives stale-check` to get `{ stale, age_hours }`.

D-13 gating: this check runs ONLY because `/brief-deliver` is a qualifying
new-activity entry point (added to `QUALIFYING_ENTRY_POINTS` closed set in
brief/bin/lib/define.cjs). It does NOT run on `/brief-status`, `/brief-help`,
or mid-workflow invocations.

If `stale === true`, present the Phase 3 stale-anchor 3-option AskUserQuestion
(Korean variant when `state.brief.region: kr`):

  1. 잠시 검토에 — /brief-define --amend 로 수정 흐름 진입
  2. 현재 OBJECTIVES를 보고 맞으면 승인 — 내용 확인 후 mtime 갱신
  3. 이제 승인, 빠르게 진행 — 즉시 mtime 갱신하고 다음 단계로

Under TEXT_MODE, render as plain-text numbered list (1/2/3). NO bypass.

## Step 2: Mode parse (--type-a vs --type-b <name>)

Parse $ARGUMENTS:

  - First token is `--type-a` → Type A path (Step 3A).
  - First token is `--type-b` → next positional argument is the artifact name
    (one of `internal-deck` / `proposal-deck` / `exec-summary` / `decision-memo`).
    Route to Type B path (Step 3B).
  - Anything else → emit Korean help message:

    ```
    /brief-deliver 사용법:
      /brief-deliver --type-a              # 4 PRD-입력 artifact 자동 합성
      /brief-deliver --type-b <name>       # 단일 deck/memo 합성
        <name> ∈ {internal-deck, proposal-deck, exec-summary, decision-memo}
      추가 옵션: --en (영문 출력) | --text (TEXT_MODE 강제)
    ```

`--en` flag flips the voice.languages fallback inside deliver.cjs synthesizeTypeA
options (English-only when ctx.language === 'en' OR Korea-bilingual ['ko', 'en']
when ctx.language === 'ko' — see Plan 01 D-D03 derivation).

## Step 3A: Type A path (4-artifact loop)

For each `artifactKey` in `TYPE_A_ARTIFACTS = ['product-brief', 'service-policy',
'high-level-spec', 'feature-map']`:

### Step 3A.1: Synthesize via brief-tools deliver synthesize

Invoke:

```bash
node brief/bin/brief-tools.cjs deliver synthesize --artifact <artifactKey> [--en]
```

Returns JSON `{ outPath, complete, missing }` per Plan 01 contract. Capture
`outPath` for Step 3A.2-3A.5.

If `complete === false`, the synthesizer wrote a placeholder body inline
("> ⚠️ Placeholder — <workstream> not completed."). The synthesis still
produces a file; the orchestrator continues. The user is advised in the
Step 4 summary which artifacts have placeholder sections.

### Step 3A.2: Display synthesized artifact path + AskUserQuestion confirmation

```
✅ Type A synthesized: <outPath>
```

Korean variant: `✅ Type A 합성 완료: <outPath>`.

Note: this single status emoji is permitted in the orchestrator console output —
it is NOT inside the artifact body, so the vocabulary-lock test (which targets
artifact body content + workflow narrative discipline) is not triggered. The ban
on Phase 4·5·7 ban-list tokens applies inside artifact body content + agent
prompts; status emojis in interactive console output are out of scope.

### Step 3A.3: Inline ALIGN → AUDIENCE → COMPLIANCE (3-gate fail-fast on BLOCKING)

For each synthesized artifact, sequentially invoke:

```bash
# ALIGN — re-uses brief/workflows/align-gate.md inheritance pattern
node brief/bin/brief-tools.cjs align run --candidate <outPath> --baseline .planning/OBJECTIVES.md --verdict-out <tmp>
node brief/bin/brief-tools.cjs align commit --verdict <tmp>

# AUDIENCE — re-uses brief/workflows/audience-guard.md (Phase 5 inheritance)
node brief/bin/brief-tools.cjs audience run --artifact <outPath> --baseline .planning/OBJECTIVES.md --verdict-out <tmp2>
node brief/bin/brief-tools.cjs audience commit --verdict <tmp2> --artifact <outPath>

# COMPLIANCE — re-uses brief/workflows/compliance.md (Phase 7 inheritance)
node brief/bin/brief-tools.cjs compliance run --artifact <outPath> --baseline .planning/OBJECTIVES.md --verdict-out <tmp3>
node brief/bin/brief-tools.cjs compliance commit --verdict <tmp3> --artifact <outPath>
```

On BLOCKING from any gate, fail-fast: skip remaining gates per Phase 7 D-02
sequential threading. Route through the gate's existing 3-path interrupt
(audience-guard.md Step 5A/5B/6 OR compliance.md equivalent) — those workflows
already implement frontmatter-fix / rewrite / force-accept paths.

### Step 3A.4: Atomic commit (Plan 04 commit pattern)

After all 3 gates pass (or the user force-accepts), invoke:

```bash
node brief/bin/brief-tools.cjs commit "feat(deliver-typea): synthesize <artifactKey>" \
  --files <outPath> <outPath>.audience.md <outPath>.compliance.md .planning/STATE.md
```

This is the per-artifact atomic commit. The 4-artifact loop produces 4 commits.

### Step 3A.5: Continue to next artifact

After the commit, proceed to the next `artifactKey` in TYPE_A_ARTIFACTS.

## Step 3B: Type B path (single-artifact agent spawn + voice-fit + AUDIENCE + COMPLIANCE)

### Step 3B.1: Build business_context

Invoke the context-inject helper (Plan 5 D-13 inheritance):

```bash
node -e "const { buildBusinessContext } = require('./brief/bin/lib/context-inject.cjs'); const ctx = buildBusinessContext({cwd: process.cwd()}); process.stdout.write(JSON.stringify(ctx));"
```

Parse the JSON output — extract `promptBlock`, `language`, `audienceDefaults`,
`business_model`, `region`. These are injected into the Type B agent spawn.

### Step 3B.2: Spawn brief-deliver-type-b agent via Task

Spawn one Task with subagent_type `brief-deliver-type-b`. Pass:

  - `{{ARTIFACT}}` — the requested artifact name from Step 2 ($ARGUMENTS)
  - `{{OUT_PATH}}` — `.planning/deliverables/type-b/<name>.md`
  - `<business_context>` block (ctx.promptBlock) injected VERBATIM
  - `required_reading` per agents/brief-deliver-type-b.md `<required_reading>` table
    (varies per artifact — internal-deck reads BMC + GTM + ROADMAP + RISK + OPERATIONS
    + DISCOVER market-sizing.md; proposal-deck reads BMC + GTM + ROADMAP + DISCOVER
    market-sizing.md; exec-summary reads OBJECTIVES + PRODUCT-BRIEF + ROADMAP + RISK;
    decision-memo reads OBJECTIVES + caller-supplied <context_focus>)

Orchestrator BLOCKS until the Task returns. Timeout per BRIEF Task default; on
timeout, surface a stderr warning and ROUTE the user to manual artifact creation
under .planning/deliverables/type-b/ (no auto-retry — Pitfall #7).

### Step 3B.2a: Resolve `{{watermark_text}}` placeholder in agent-emitted source (Layer 2 watermark fill)

After the agent writes the artifact at `{{OUT_PATH}}`, the source markdown still
contains the literal placeholder string `{{watermark_text}}` in two load-bearing
locations: the Marp `footer:` directive (frontmatter) and the Cover slide
literal (`> **{{watermark_text}}**`). The placeholder MUST be substituted with
the resolved per-confidentiality watermark string from Plan 04 export.cjs
WATERMARKS_EN/WATERMARKS_KO maps BEFORE Step 3B.3 (voice-fit) — otherwise the
literal `{{watermark_text}}` survives into Marp render and the Layer 2 watermark
defense (DLV-09) silently breaks (08-REVIEW.md WR-01).

Skip this step for `exec-summary` and `decision-memo` (no Marp, no watermark
placeholder). Only `internal-deck` and `proposal-deck` carry the placeholder.

```bash
# Substitute {{watermark_text}} → watermarkFor(confidentiality, language) inline.
# Mirrors voice-fit's read-modify-write dispatch shape; uses the same Plan 04
# WATERMARKS_KO/EN single source-of-truth.
node -e "
  const fs = require('fs');
  const { watermarkFor } = require('./brief/bin/lib/export.cjs');
  const { extractFrontmatter } = require('./brief/bin/lib/frontmatter.cjs');
  const { buildBusinessContext } = require('./brief/bin/lib/context-inject.cjs');
  const p = '$OUT_PATH';
  const content = fs.readFileSync(p, 'utf-8');
  const fm = extractFrontmatter(content) || {};
  const conf = (fm.audience && fm.audience.confidentiality)
    || fm['audience.confidentiality']
    || 'internal';
  const lang = buildBusinessContext({ cwd: process.cwd() }).language || 'en';
  const wm = watermarkFor(conf, lang);
  fs.writeFileSync(p, content.split('{{watermark_text}}').join(wm));
"
```

After substitution, the artifact source has its watermark text resolved per the
4 confidentiality enums × 2 languages = 8 entries map. The export.md workflow
performs an idempotent re-substitution at render time as a defense-in-depth
guard against post-deliver edits that re-introduce the placeholder.

### Step 3B.3: voice-fit dispatch (banned-words density check)

After the agent writes the artifact at `{{OUT_PATH}}`, invoke:

```bash
node brief/bin/brief-tools.cjs voice-fit check --artifact <out_path>
```

Returns JSON `{ density, threshold, exceedsThreshold, hits, pages }` per Plan 02
contract. When `exceedsThreshold === true` AND the artifact's
`audience.confidentiality` is external (`partner` / `public` / `external`), emit
1-shot regenerate signal — re-spawn the Type B agent ONCE with an additional
`<regenerate_reason>` instruction citing the specific banned-word hits. After the
1-shot regenerate, proceed to Step 3B.4 unconditionally (no second retry —
Pitfall #7).

For internal-confidentiality artifacts, voice-fit is warn-only (stderr) — does not
block.

### Step 3B.4: AUDIENCE + COMPLIANCE inline (sequential, fail-fast)

Same as Type A Step 3A.3 — invoke `audience run` + `audience commit`, then
`compliance run` + `compliance commit`. Both gates produce paired-sibling
`.audience.md` / `.compliance.md` reports adjacent to the artifact. BLOCKING
verdicts route through the existing audience-guard.md / compliance.md 3-path
interrupts (frontmatter / rewrite / force-accept).

NOTE: Type B's user-facing `/brief-export` invocation also re-runs AUDIENCE +
COMPLIANCE with a NEW export-run-id (export.cjs Steps 2-3). The Step 3B.4 run
here is the DELIVER-stage gate evaluation; the export-stage re-run guards against
post-deliver edits.

### Step 3B.5: Atomic commit + /brief-export hint

```bash
node brief/bin/brief-tools.cjs commit "feat(deliver-typeb): synthesize <name>" \
  --files <out_path> <out_path>.audience.md <out_path>.compliance.md .planning/STATE.md
```

After the commit, print the user-visible /brief-export hint (Korean when
`state.brief.region: kr`, English otherwise):

  Korean: `다음 단계: /brief-export <name> — Marp PPTX/PDF/HTML 렌더링`
  English: `Next step: /brief-export <name> — Marp render to PPTX/PDF/HTML`

## Step 4: Update state.brief.deliverable_index per Plan 04 PHASE_8_BRIEF_FIELDS

After all artifact(s) commit, mutate `state.brief.deliverable_index` to record
each newly synthesized artifact's `last_synthesized_at` ISO timestamp. The
mutation goes through the brief-namespace state writer (Phase 8 D-21
allowlist):

```bash
# pseudocode — actual invocation goes through brief-tools.cjs state patch
DELIVERABLE_NAME=<key>
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
node -e "
  const stateLib = require('./brief/bin/lib/state.cjs');
  stateLib.readModifyWriteStateMd(process.cwd(), (fm) => {
    fm.brief = fm.brief || {};
    fm.brief.deliverable_index = fm.brief.deliverable_index || {};
    fm.brief.deliverable_index['$DELIVERABLE_NAME'] = {
      last_synthesized_at: '$NOW'
    };
    return fm;
  });
"
```

This update is idempotent — re-running /brief-deliver overwrites the timestamp
without creating drift.

</process>

<no_hooks_assertion>
This workflow is invoked EXPLICITLY from commands/brief/deliver.md. There is NO
PostToolUse, NO SubagentStop, NO UserPromptSubmit, NO Stop hook that
auto-attaches /brief-deliver or its inline gate invocations. AUDIENCE +
COMPLIANCE invocation in Step 3A.3 / 3B.4 are explicit orchestrator steps
(inherited from Phase 4 Anti-pattern #2 + replicated by Phase 5 + 7).

Plan 07 introduces the ONE permitted Phase 8 hook: `brief-validate-frontmatter.sh`
which is a PreToolUse-on-Bash matcher (NOT PostToolUse on Write/Edit) — it intercepts
`git commit` invocations to validate staged frontmatter, an orthogonal concern.

Structural test (Phase 8 Plan 08-08 canary):
  ! grep -rE "brief-deliver|deliver\.cjs|deliver\.md|voice-fit|leakage-diff" hooks/ 2>/dev/null
  MUST return exit 0 (no hook file references this workflow or its dispatcher libs).
</no_hooks_assertion>

<command_surface_assertion>
/brief-deliver is the SINGLE Phase 8 user-facing command for the DELIVER stage.
NET user-facing command additions from Phase 8 Plan 08-08 = +2 (this command +
/brief-export). Both are within the ≤12 surface cap reduction target (Phase 9
HRD-02 audit responsibility).
</command_surface_assertion>
