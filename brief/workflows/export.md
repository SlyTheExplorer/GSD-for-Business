<purpose>
EXPORT — `/brief-export` 9-step gate orchestration with TEXT_MODE detection,
cross-artifact leakage diff, AUDIENCE + COMPLIANCE re-runs with NEW export-run-id,
1-step confirmation UI (Korean/English variant), 3-path BLOCKING interrupt with
force-accept audit trail, Marp render via `npx --yes @marp-team/marp-cli@4.3.1`,
and atomic commit (5 files in 1 commit).

Plan 04 ships brief/bin/lib/export.cjs (the 7-step orchestration core); Plan 08
wires it into the user-facing `/brief-export` slash command via this workflow.

Korean by default (Korea-signal D-11 inheritance); TEXT_MODE fallback FND-06 for
non-Claude-Code runtimes (Codex / Gemini / OpenCode).

Phase 8 D-21 PHASE_8_BRIEF_FIELDS allowlist:
  state.brief.last_export_at — ISO timestamp of most recent /brief-export invocation
  state.brief.deliverable_index[<name>].last_export_at — per-artifact export timestamp
</purpose>

<process>

## Step 0: TEXT_MODE Detection

Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode`
from `.planning/config.json` is true. When TEXT_MODE is active, every
AskUserQuestion call (Step 5 1-step confirm + Step 6 3-path interrupt) renders
as a plain-text numbered list and asks the user to type their choice number.

Detection rule mirrors brief/workflows/discover.md Step 0 byte-identity
(FND-06 multi-runtime parity). NO bypass.

## Step 1: Resolve artifact path (block if missing)

Parse $ARGUMENTS:

  - First positional argument is the artifact name (e.g., `internal-deck`,
    `proposal-deck`, `exec-summary`, `decision-memo`) OR a relative path
    under `.planning/deliverables/`.
  - `--format <fmt>` — pptx (default) | pdf | html
  - `--theme <name>` — Marp theme name or path
  - `--text` — TEXT_MODE force-on

Resolve the artifact source path:

```
RESOLVED_PATH = .planning/deliverables/type-b/<name>.md
```

If `RESOLVED_PATH` does not exist, emit a Korean error message (region: kr) OR
English (otherwise):

  Korean: `❌ Type B artifact가 존재하지 않습니다: <RESOLVED_PATH>. /brief-deliver --type-b <name> 먼저 실행해주세요.`
  English: `❌ Type B artifact not found at <RESOLVED_PATH>. Run /brief-deliver --type-b <name> first.`

Exit non-zero. The path-traversal guard inside export.cjs Step 0
`_resolveSafePath` (audience.cjs lines 336-351 byte-identity) rejects any path
that resolves outside `.planning/`.

## Step 2: Cross-artifact leakage diff (brief-tools leakage-diff scan)

Invoke:

```bash
node brief/bin/brief-tools.cjs leakage-diff scan --artifact <RESOLVED_PATH>
```

Returns JSON `{ findings, rationale }` per Plan 03 contract. The dispatcher
calls `leakageDiff(absPath)` from `brief/bin/lib/leakage-diff.cjs` which:
  - reads the artifact's `audience.confidentiality` field;
  - enumerates same-folder *.md siblings (skipping paired `.audience.md` /
    `.compliance.md` reports — those quote the primary artifact and would
    falsely flag);
  - for each sibling whose confidentiality is STRICTLY STRICTER than current's
    (per STRICTNESS enum: public(0) < partner(1) < internal(2) < confidential(3)),
    extracts top-20 distinctive keywords via Salton-1988 TF-IDF and counts
    case-insensitive substring matches in current body;
  - emits a `material` severity finding when ≥3 keywords overlap.

Findings carry forward into Step 5 confirmation UI display (rendered as
"Cross-artifact leakage diff: N findings ⚠"). The leakage diff is INFORMATIVE
in the export flow — it does not block by itself; the user evaluates the
findings during Step 5 confirmation and chooses to cancel or proceed.

## Step 3: AUDIENCE re-run with NEW run-id

Invoke `audience.runAudience` via export.cjs (Plan 04 Step 2) with a NEW
export-run-id of the form `export-${Date.now()}-${process.pid}`. The export
orchestrator dispatches:

```bash
node brief/bin/brief-tools.cjs export run --artifact <RESOLVED_PATH> --gate audience
```

The `case 'export'` dispatcher invokes `exportLib.exportArtifact(cwd, path,
{ _gate: 'audience', ... })` which short-circuits the render at Step 6 and
returns the AUDIENCE verdict alone (gate-only execution mode for diagnostics).

In the production happy path, the AUDIENCE re-run runs as part of the unified
Step 7 Marp render dispatch. This Step 3 documents the conceptual sequence —
implementation lives inside `exportArtifact`.

On AUDIENCE BLOCKING severity, route to Step 6 (3-path interrupt).

## Step 4: COMPLIANCE re-run with NEW run-id

Sequential after AUDIENCE per Phase 7 D-02 (AUDIENCE BLOCKING → fail-fast skip
COMPLIANCE). When AUDIENCE returns OK, COMPLIANCE re-runs with the same
`export-${timestamp}-${pid}` run-id. Plan 04 export.cjs Step 3 wraps this with
COMPLIANCE.commitComplianceVerdict on AUDIENCE-OK paths.

On COMPLIANCE BLOCKING severity, route to Step 6 (3-path interrupt — same shape
as AUDIENCE BLOCKING with `(COMPLIANCE: <verdict>)` heading).

## Step 5: 1-step confirmation UI (Korean/English variant)

Display the formatConfirmUI (export.cjs lines 282-338) 6-field summary:

  1. Artifact / 산출물 — file basename
  2. Audience / 청중 — frontmatter.audience.type
  3. Confidentiality / 기밀도 — frontmatter.audience.confidentiality
  4. Output / 출력 — `<basename>.<conf>.<format>` Layer 1 filename encoding
  5. Watermark / 워터마크 — Layer 2 watermark text per WATERMARKS_KO/EN map
  6. AUDIENCE gate verdict + COMPLIANCE gate verdict + cross-artifact leakage
     diff finding count

Korean variant (when language === 'ko' from buildBusinessContext) — verbatim from
RESEARCH.md Pattern 8 lines 982-1019:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BRIEF ► EXPORT 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 산출물:    <artifactBase>
 청중:      <audienceType>
 기밀도:    <confidentiality>
 출력:      <outputFilename>
 워터마크: "<watermark>"

 AUDIENCE 게이트: <decision> ✓
 COMPLIANCE 게이트: <decision> ✓
 cross-artifact 누설 검사: <N> finding ⚠

── 이 산출물을 render 하시겠습니까? ──
 [예, render] / [아니오, 취소]
```

English variant (when language !== 'ko') — verbatim from RESEARCH.md Pattern 8:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BRIEF ► EXPORT CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Artifact:        <artifactBase>
 Audience:        <audienceType>
 Confidentiality: <confidentiality>
 Output:          <outputFilename>
 Watermark:       "<watermark>"

 AUDIENCE gate:                 <decision> ✓
 COMPLIANCE gate:               <decision> ✓
 Cross-artifact leakage diff:   <N> findings ⚠

── Render this artifact? ──
 [Yes, render] / [No, cancel]
```

Present as AskUserQuestion with 2 options (`[예, render]` / `[아니오, 취소]` for
Korean OR `[Yes, render]` / `[No, cancel]` for English).

TEXT_MODE numbered-list fallback (FND-06 multi-runtime parity):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BRIEF ► EXPORT 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 산출물:    <artifactBase>
 청중:      <audienceType>
 기밀도:    <confidentiality>
 출력:      <outputFilename>
 워터마크: "<watermark>"

 AUDIENCE 게이트: <decision>
 COMPLIANCE 게이트: <decision>
 cross-artifact 누설 검사: <N> finding

이 산출물을 render 하시겠습니까?
  1. 예, render
  2. 아니오, 취소

선택 >
```

On user choice 2 (cancel) — exit non-zero with rationale `user cancelled`.

## Step 6: BLOCKING branch — 3-path interrupt (frontmatter / rewrite / force-accept)

Triggered when AUDIENCE OR COMPLIANCE Step 3/4 returns `severity: 'blocking'`.

Display the BLOCKING title with the gate name + verdict (Korean variant when
region: kr, English otherwise). Then present 3 options:

  Korean (region: kr):
    1. frontmatter 수정
    2. 이 데크 다시 쓰기
    3. force-accept (audit trail)

  English (otherwise):
    1. Edit frontmatter (frontmatter 수정)
    2. Rewrite deck (데크 다시 쓰기)
    3. force-accept (audit trail)

Under TEXT_MODE, render as plain-text numbered list. NO bypass.

### Path 1 — frontmatter 수정

Cleanup the AUDIENCE/COMPLIANCE verdict tmp file. Exit non-zero with
rationale `user chose frontmatter revision`. The user amends the artifact's
frontmatter and re-invokes /brief-export (which re-runs AUDIENCE +
COMPLIANCE on the amended file).

### Path 2 — 이 데크 다시 쓰기

Cleanup the verdict tmp. Exit non-zero with rationale `user chose content
rewrite`. The user re-runs `/brief-deliver --type-b <name>` to regenerate
the artifact, then re-invokes /brief-export.

### Path 3 — force-accept (audit trail)

Prompt the user for the override reason (free text, MANDATORY — not optional):

  Korean: `승인 사유를 한 문장으로 입력해 주세요 (override_reason). 사유는 STATE.md에 기록됩니다.`
  English: `Enter override reason (will be recorded in STATE.md):`

Accept only non-empty, non-whitespace input. On empty input, return to the
3-path interrupt selector — the user must pick a different path.

Once a non-empty reason is captured, invoke:

```bash
node brief/bin/brief-tools.cjs export run --artifact <RESOLVED_PATH> \
  --format <fmt> [--theme <name>] \
  --force-accept --override-reason "<reason>"
```

The `case 'export'` dispatcher passes `_forceAcceptOverrideReason: '<reason>'`
into `exportArtifact` which routes through the FIRST live use of Phase 4 D-07
substrate via `audience.commitAudienceVerdict({override:true, overrideReason})`.

The override path:
  - Sanitizes the user reason via security.cjs sanitizeForPrompt BEFORE
    writing to STATE.md (prompt-injection defense — T-08-08-02).
  - Records `decision`, `override:true`, `override_reason`, `override_at`,
    `at` ISO timestamp in `state.brief.last_gate_results.audience` (D-07
    audit trail).
  - Renders {artifact}.audience.md with a dedicated `## User Override`
    section containing the reason.
  - Status.cjs formatGate displays `(override applied; total overrides: N;
    latest reason: "<truncated>")` in /brief-status output (Pitfall #1
    visibility mitigation, Plan 08 Sub-task B).

After the commit, continue with Step 7 Marp render (the user has accepted
the gate verdict; the artifact still renders).

## Step 7: Marp render via brief-tools export render

### Step 7a: Defensive `{{watermark_text}}` re-substitution (idempotent)

Before invoking Marp render, defensively re-resolve `{{watermark_text}}` in the
source markdown so post-deliver edits that re-introduce the literal placeholder
do NOT survive into the rendered PPTX cover slide (Layer 2 watermark; 08-REVIEW
WR-01). The deliver.md Step 3B.2a already filled the placeholder at synthesis
time; this step is a defense-in-depth idempotent re-substitution.

```bash
node -e "
  const fs = require('fs');
  const { watermarkFor } = require('./brief/bin/lib/export.cjs');
  const { extractFrontmatter } = require('./brief/bin/lib/frontmatter.cjs');
  const { buildBusinessContext } = require('./brief/bin/lib/context-inject.cjs');
  const p = '$RESOLVED_PATH';
  const content = fs.readFileSync(p, 'utf-8');
  if (content.indexOf('{{watermark_text}}') === -1) return;
  const fm = extractFrontmatter(content) || {};
  const conf = (fm.audience && fm.audience.confidentiality)
    || fm['audience.confidentiality']
    || 'internal';
  const lang = buildBusinessContext({ cwd: process.cwd() }).language || 'en';
  const wm = watermarkFor(conf, lang);
  fs.writeFileSync(p, content.split('{{watermark_text}}').join(wm));
"
```

### Step 7b: Marp render

Invoke:

```bash
node brief/bin/brief-tools.cjs export render --artifact <RESOLVED_PATH> \
  --format <fmt> [--theme <name>]
```

The `case 'export'` render subcommand calls `exportLib.renderMarp(cwd, opts)`
(Plan 04 lines 153-218) which:
  - Detects browser via detectBrowser() — Chrome / Edge / Firefox per OS.
  - When PPTX/PDF requested but NO browser found AND `allowFallback: true`:
      ladder PPTX → PDF (re-call with format='pdf');
      then PDF → HTML (re-call with format='html').
  - Builds Marp args: `['--yes', '@marp-team/marp-cli@4.3.1', input, '-o',
    output, '--<fmt>']`. The `--local-file-access` flag is NEVER added
    (Pitfall 8 mitigation per RESEARCH.md line 1145).
  - Spawns `npx <args>` with 2-min hard timeout (`timeout: 120000`).
  - Returns `{ ok, ranFormat, outputPath, fallbackReason?, error? }`.

First invocation downloads marp-cli + puppeteer-core (~50MB, 30-60s); cached
thereafter (~2-5s).

On render failure, propagate the error to the user with a Korean / English
diagnostic message AND a link to `brief/references/marp-environment.md` for
install instructions (Plan 07 Marp env reference).

## Step 8: Atomic commit (source.md + .audience.md + .compliance.md + .{conf}.{ext} + STATE.md)

After successful render, commit all 5 artifacts in 1 atomic commit per
Plan 04 commit pattern:

```bash
node brief/bin/brief-tools.cjs commit "feat(export): render <name>.<conf>.<fmt>" \
  --files <RESOLVED_PATH> \
          <RESOLVED_PATH>.audience.md \
          <RESOLVED_PATH>.compliance.md \
          <outputPath> \
          .planning/STATE.md
```

This is the single export commit. Re-running /brief-export overwrites the
rendered output and adds a new commit with the same shape.

## Step 9: Update state.brief.last_export_at + deliverable_index per Plan 04 PHASE_8_BRIEF_FIELDS

After the commit lands, update both Phase 8-allowlisted state fields:

```bash
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
node -e "
  const stateLib = require('./brief/bin/lib/state.cjs');
  stateLib.readModifyWriteStateMd(process.cwd(), (fm) => {
    fm.brief = fm.brief || {};
    fm.brief.last_export_at = '$NOW';
    fm.brief.deliverable_index = fm.brief.deliverable_index || {};
    fm.brief.deliverable_index['<name>'] = fm.brief.deliverable_index['<name>'] || {};
    fm.brief.deliverable_index['<name>'].last_export_at = '$NOW';
    return fm;
  });
"
```

PHASE_8_BRIEF_FIELDS allowlist (state.cjs lines 60-63) documents these as the
ONLY new state.brief.* fields added in Phase 8. The schema-documentation
allowlist is enforced by convention; round-trip tests in
tests/brief-export-force-accept-audit.test.cjs (Plan 04) and the canary E2E
test in tests/brief-deliver-canary-e2e.test.cjs (this plan, Task 1) verify
the substrate.

</process>

<no_hooks_assertion>
This workflow is invoked EXPLICITLY from commands/brief/export.md. There is NO
PostToolUse, NO SubagentStop, NO UserPromptSubmit, NO Stop hook that
auto-attaches /brief-export or any of its inline gate invocations
(leakage-diff / AUDIENCE / COMPLIANCE re-runs). Each is an orchestrator step
(inherited from Phase 4 Anti-pattern #2; Phase 5 + 7 replication).

Plan 07 introduces the ONE permitted Phase 8 hook: `brief-validate-frontmatter.sh`
which is a PreToolUse-on-Bash matcher (NOT PostToolUse on Write/Edit) — it
intercepts `git commit` invocations to validate staged frontmatter, an orthogonal
concern to the export gate stack here.

Structural test (Phase 8 Plan 08-08 canary):
  ! grep -rE "brief-export|export\.cjs|export\.md" hooks/ 2>/dev/null
  MUST return exit 0 (no hook file references this workflow or its dispatcher libs).
</no_hooks_assertion>

<command_surface_assertion>
/brief-export is the SINGLE Phase 8 user-facing command for the EXPORT stage.
NET user-facing command additions from Phase 8 Plan 08-08 = +2 (this command +
/brief-deliver). Both within the ≤12 surface cap (Phase 9 HRD-02 audit
responsibility).
</command_surface_assertion>
