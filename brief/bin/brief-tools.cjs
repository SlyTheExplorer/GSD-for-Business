#!/usr/bin/env node

/**
 * GSD Tools — CLI utility for GSD workflow operations
 *
 * Replaces repetitive inline bash patterns across ~50 GSD command/workflow/agent files.
 * Centralizes: config parsing, model resolution, phase lookup, git commits, summary verification.
 *
 * Usage: node brief-tools.cjs <command> [args] [--raw] [--pick <field>]
 *
 * Atomic Commands:
 *   state load                         Load project config + state
 *   state json                         Output STATE.md frontmatter as JSON
 *   state update <field> <value>       Update a STATE.md field
 *   state get [section]                Get STATE.md content or section
 *   state patch --field val ...        Batch update STATE.md fields
 *   state begin-phase --phase N --name S --plans C  Update STATE.md for new phase start
 *   state signal-waiting --type T --question Q --options "A|B" --phase P  Write WAITING.json signal
 *   state signal-resume                Remove WAITING.json signal
 *   resolve-model <agent-type>         Get model for agent based on profile
 *   find-phase <phase>                 Find phase directory by number
 *   commit <message> [--files f1 f2] [--no-verify]   Commit planning docs
 *   commit-to-subrepo <msg> --files f1 f2  Route commits to sub-repos
 *   verify-summary <path>              Verify a SUMMARY.md file
 *   generate-slug <text>               Convert text to URL-safe slug
 *   current-timestamp [format]         Get timestamp (full|date|filename)
 *   list-todos [area]                  Count and enumerate pending todos
 *   verify-path-exists <path>          Check file/directory existence
 *   config-ensure-section              Initialize .planning/config.json
 *   history-digest                     Aggregate all SUMMARY.md data
 *   summary-extract <path> [--fields]  Extract structured data from SUMMARY.md
 *   state-snapshot                     Structured parse of STATE.md
 *   phase-plan-index <phase>           Index plans with waves and status
 *   websearch <query>                  Search web via Brave API (if configured)
 *     [--limit N] [--freshness day|week|month]
 *
 * Phase Operations:
 *   phase next-decimal <phase>         Calculate next decimal phase number
 *   phase add <description> [--id ID]   Append new phase to roadmap + create dir
 *   phase insert <after> <description> Insert decimal phase after existing
 *   phase remove <phase> [--force]     Remove phase, renumber all subsequent
 *   phase complete <phase>             Mark phase done, update state + roadmap
 *
 * Roadmap Operations:
 *   roadmap get-phase <phase>          Extract phase section from ROADMAP.md
 *   roadmap analyze                    Full roadmap parse with disk status
 *   roadmap update-plan-progress <N>   Update progress table row from disk (PLAN vs SUMMARY counts)
 *
 * Requirements Operations:
 *   requirements mark-complete <ids>   Mark requirement IDs as complete in REQUIREMENTS.md
 *                                      Accepts: REQ-01,REQ-02 or REQ-01 REQ-02 or [REQ-01, REQ-02]
 *
 * Milestone Operations:
 *   milestone complete <version>       Archive milestone, create MILESTONES.md
 *     [--name <name>]
 *     [--archive-phases]               Move phase dirs to milestones/vX.Y-phases/
 *
 * Validation:
 *   validate consistency               Check phase numbering, disk/roadmap sync
 *   validate health [--repair]         Check .planning/ integrity, optionally repair
 *   validate agents                    Check GSD agent installation status
 *
 * Progress:
 *   progress [json|table|bar]          Render progress in various formats
 *   status                             Render /brief-status compact dashboard (read-only)
 *
 * Todos:
 *   todo complete <filename>           Move todo from pending to completed
 *
 * UAT Audit:
 *   audit-uat                           Scan all phases for unresolved UAT/verification items
 *   uat render-checkpoint --file <path> Render the current UAT checkpoint block
 *
 * Open Artifact Audit:
 *   audit-open [--json]                 Scan all .planning/ artifact types for unresolved items
 *
 * Intel:
 *   intel query <term>             Query intel files for a term
 *   intel status                   Show intel file freshness
 *   intel update                   Trigger intel refresh (returns agent spawn hint)
 *   intel diff                     Show changed intel entries since last snapshot
 *   intel snapshot                 Save current intel state as diff baseline
 *   intel patch-meta <file>        Update _meta.updated_at in an intel file
 *   intel validate                 Validate intel file structure
 *   intel extract-exports <file>   Extract exported symbols from a source file
 *
 * Scaffolding:
 *   scaffold context --phase <N>       Create CONTEXT.md template
 *   scaffold uat --phase <N>           Create UAT.md template
 *   scaffold verification --phase <N>  Create VERIFICATION.md template
 *   scaffold phase-dir --phase <N>     Create phase directory
 *     --name <name>
 *
 * Frontmatter CRUD:
 *   frontmatter get <file> [--field k] Extract frontmatter as JSON
 *   frontmatter set <file> --field k   Update single frontmatter field
 *     --value jsonVal
 *   frontmatter merge <file>           Merge JSON into frontmatter
 *     --data '{json}'
 *   frontmatter validate <file>        Validate required fields
 *     --schema plan|summary|verification
 *
 * Verification Suite:
 *   verify plan-structure <file>       Check PLAN.md structure + tasks
 *   verify phase-completeness <phase>  Check all plans have summaries
 *   verify references <file>           Check @-refs + paths resolve
 *   verify commits <h1> [h2] ...      Batch verify commit hashes
 *   verify artifacts <plan-file>       Check must_haves.artifacts
 *   verify key-links <plan-file>       Check must_haves.key_links
 *   verify schema-drift <phase> [--skip]  Detect schema file changes without push
 *
 * Template Fill:
 *   template fill summary --phase N    Create pre-filled SUMMARY.md
 *     [--plan M] [--name "..."]
 *     [--fields '{json}']
 *   template fill plan --phase N       Create pre-filled PLAN.md
 *     [--plan M] [--type execute|tdd]
 *     [--wave N] [--fields '{json}']
 *   template fill verification         Create pre-filled VERIFICATION.md
 *     --phase N [--fields '{json}']
 *
 * State Progression:
 *   state advance-plan                 Increment plan counter
 *   state record-metric --phase N      Record execution metrics
 *     --plan M --duration Xmin
 *     [--tasks N] [--files N]
 *   state update-progress              Recalculate progress bar
 *   state add-decision --summary "..."  Add decision to STATE.md
 *     [--phase N] [--rationale "..."]
 *     [--summary-file path] [--rationale-file path]
 *   state add-blocker --text "..."     Add blocker
 *     [--text-file path]
 *   state resolve-blocker --text "..." Remove blocker
 *   state record-session               Update session continuity
 *     --stopped-at "..."
 *     [--resume-file path]
 *
 * Compound Commands (workflow-specific initialization):
 *   init execute-phase <phase>         All context for execute-phase workflow
 *   init plan-phase <phase>            All context for plan-phase workflow
 *   init new-project                   All context for new-project workflow
 *   init new-milestone                 All context for new-milestone workflow
 *   init quick <description>           All context for quick workflow
 *   init resume                        All context for resume-project workflow
 *   init verify-work <phase>           All context for verify-work workflow
 *   init phase-op <phase>              Generic phase operation context
 *   init todos [area]                  All context for todo workflows
 *   init milestone-op                  All context for milestone operations
 *   init map-codebase                  All context for map-codebase workflow
 *   init progress                      All context for progress workflow
 *
 * Documentation:
 *   docs-init                            Project context for docs-update workflow
 *
 * Learnings:
 *   learnings list                       List all global learnings (JSON)
 *   learnings query --tag <tag>          Query learnings by tag
 *   learnings copy                       Copy from current project's LEARNINGS.md
 *   learnings prune --older-than <dur>   Remove entries older than duration (e.g. 90d)
 *   learnings delete <id>                Delete a learning by ID
 *
 * GSD-2 Migration:
 *   from-gsd2 [--path <dir>] [--force] [--dry-run]
 *             Import a GSD-2 (.gsd/) project back to GSD v1 (.planning/) format
 */

const fs = require('fs');
const path = require('path');
const core = require('./lib/core.cjs');
const { error, findProjectRoot, getActiveWorkstream } = core;
const state = require('./lib/state.cjs');
const phase = require('./lib/phase.cjs');
const roadmap = require('./lib/roadmap.cjs');
const verify = require('./lib/verify.cjs');
const config = require('./lib/config.cjs');
const template = require('./lib/template.cjs');
const milestone = require('./lib/milestone.cjs');
const commands = require('./lib/commands.cjs');
const init = require('./lib/init.cjs');
const frontmatter = require('./lib/frontmatter.cjs');
const profilePipeline = require('./lib/profile-pipeline.cjs');
const profileOutput = require('./lib/profile-output.cjs');
const workstream = require('./lib/workstream.cjs');
const docs = require('./lib/docs.cjs');
const learnings = require('./lib/learnings.cjs');

// ─── Arg parsing helpers ──────────────────────────────────────────────────────

/**
 * Extract named --flag <value> pairs from an args array.
 * Returns an object mapping flag names to their values (null if absent).
 * Flags listed in `booleanFlags` are treated as boolean (no value consumed).
 *
 * parseNamedArgs(args, 'phase', 'plan')        → { phase: '3', plan: '1' }
 * parseNamedArgs(args, [], ['amend', 'force'])  → { amend: true, force: false }
 */
function parseNamedArgs(args, valueFlags = [], booleanFlags = []) {
  const result = {};
  for (const flag of valueFlags) {
    const idx = args.indexOf(`--${flag}`);
    result[flag] = idx !== -1 && args[idx + 1] !== undefined && !args[idx + 1].startsWith('--')
      ? args[idx + 1]
      : null;
  }
  for (const flag of booleanFlags) {
    result[flag] = args.includes(`--${flag}`);
  }
  return result;
}

/**
 * Collect all tokens after --flag until the next --flag or end of args.
 * Handles multi-word values like --name Foo Bar Version 1.
 * Returns null if the flag is absent.
 */
function parseMultiwordArg(args, flag) {
  const idx = args.indexOf(`--${flag}`);
  if (idx === -1) return null;
  const tokens = [];
  for (let i = idx + 1; i < args.length; i++) {
    if (args[i].startsWith('--')) break;
    tokens.push(args[i]);
  }
  return tokens.length > 0 ? tokens.join(' ') : null;
}

// ─── CLI Router ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // Optional cwd override for sandboxed subagents running outside project root.
  let cwd = process.cwd();
  const cwdEqArg = args.find(arg => arg.startsWith('--cwd='));
  const cwdIdx = args.indexOf('--cwd');
  if (cwdEqArg) {
    const value = cwdEqArg.slice('--cwd='.length).trim();
    if (!value) error('Missing value for --cwd');
    args.splice(args.indexOf(cwdEqArg), 1);
    cwd = path.resolve(value);
  } else if (cwdIdx !== -1) {
    const value = args[cwdIdx + 1];
    if (!value || value.startsWith('--')) error('Missing value for --cwd');
    args.splice(cwdIdx, 2);
    cwd = path.resolve(value);
  }

  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
    error(`Invalid --cwd: ${cwd}`);
  }

  // Resolve worktree root: in a linked worktree, .planning/ lives in the main worktree.
  // However, in monorepo worktrees where the subdirectory itself owns .planning/,
  // skip worktree resolution — the CWD is already the correct project root.
  const { resolveWorktreeRoot } = require('./lib/core.cjs');
  if (!fs.existsSync(path.join(cwd, '.planning'))) {
    const worktreeRoot = resolveWorktreeRoot(cwd);
    if (worktreeRoot !== cwd) {
      cwd = worktreeRoot;
    }
  }

  // Optional workstream override for parallel milestone work.
  // Priority: --ws flag > GSD_WORKSTREAM env var > session-scoped pointer > shared legacy pointer > null
  const wsEqArg = args.find(arg => arg.startsWith('--ws='));
  const wsIdx = args.indexOf('--ws');
  let ws = null;
  if (wsEqArg) {
    ws = wsEqArg.slice('--ws='.length).trim();
    if (!ws) error('Missing value for --ws');
    args.splice(args.indexOf(wsEqArg), 1);
  } else if (wsIdx !== -1) {
    ws = args[wsIdx + 1];
    if (!ws || ws.startsWith('--')) error('Missing value for --ws');
    args.splice(wsIdx, 2);
  } else if (process.env.GSD_WORKSTREAM) {
    ws = process.env.GSD_WORKSTREAM.trim();
  } else {
    ws = getActiveWorkstream(cwd);
  }
  // Validate workstream name to prevent path traversal attacks.
  if (ws && !/^[a-zA-Z0-9_-]+$/.test(ws)) {
    error('Invalid workstream name: must be alphanumeric, hyphens, and underscores only');
  }
  // Set env var so all modules (planningDir, planningPaths) auto-resolve workstream paths
  if (ws) {
    process.env.GSD_WORKSTREAM = ws;
  }

  const rawIndex = args.indexOf('--raw');
  const raw = rawIndex !== -1;
  if (rawIndex !== -1) args.splice(rawIndex, 1);

  // --pick <name>: extract a single field from JSON output (replaces jq dependency).
  // Supports dot-notation (e.g., --pick workflow.research) and bracket notation
  // for arrays (e.g., --pick directories[-1]).
  const pickIdx = args.indexOf('--pick');
  let pickField = null;
  if (pickIdx !== -1) {
    pickField = args[pickIdx + 1];
    if (!pickField || pickField.startsWith('--')) error('Missing value for --pick');
    args.splice(pickIdx, 2);
  }

  // --default <value>: for config-get, return this value instead of erroring
  // when the key is absent. Allows workflows to express optional config reads
  // without defensive `2>/dev/null || true` boilerplate (#1893).
  const defaultIdx = args.indexOf('--default');
  let defaultValue = undefined;
  if (defaultIdx !== -1) {
    defaultValue = args[defaultIdx + 1];
    if (defaultValue === undefined) defaultValue = '';
    args.splice(defaultIdx, 2);
  }

  const command = args[0];

  if (!command) {
    error('Usage: brief-tools <command> [args] [--raw] [--pick <field>] [--cwd <path>] [--ws <name>]\nCommands: state, resolve-model, find-phase, commit, verify-summary, verify, frontmatter, template, generate-slug, current-timestamp, list-todos, verify-path-exists, config-ensure-section, config-new-project, init, workstream, docs-init');
  }

  // Reject flags that are never valid for any brief-tools command. AI agents
  // sometimes hallucinate --help or --version on tool invocations; silently
  // ignoring them can cause destructive operations to proceed unchecked.
  const NEVER_VALID_FLAGS = new Set(['-h', '--help', '-?', '--h', '--version', '-v', '--usage']);
  for (const arg of args) {
    if (NEVER_VALID_FLAGS.has(arg)) {
      error(`Unknown flag: ${arg}\nbrief-tools does not accept help or version flags. Run "brief-tools" with no arguments for usage.`);
    }
  }

  // Multi-repo guard: resolve project root for commands that read/write .planning/.
  // Skip for pure-utility commands that don't touch .planning/ to avoid unnecessary
  // filesystem traversal on every invocation.
  const SKIP_ROOT_RESOLUTION = new Set([
    'generate-slug', 'current-timestamp', 'verify-path-exists',
    'verify-summary', 'template', 'frontmatter', 'detect-custom-files',
  ]);
  if (!SKIP_ROOT_RESOLUTION.has(command)) {
    cwd = findProjectRoot(cwd);
  }

  // When --pick is active, intercept stdout to extract the requested field.
  if (pickField) {
    const origWriteSync = fs.writeSync;
    const chunks = [];
    fs.writeSync = function (fd, data, ...rest) {
      if (fd === 1) { chunks.push(String(data)); return; }
      return origWriteSync.call(fs, fd, data, ...rest);
    };
    const cleanup = () => {
      fs.writeSync = origWriteSync;
      const captured = chunks.join('');
      let jsonStr = captured;
      if (jsonStr.startsWith('@file:')) {
        jsonStr = fs.readFileSync(jsonStr.slice(6), 'utf-8');
      }
      try {
        const obj = JSON.parse(jsonStr);
        const value = extractField(obj, pickField);
        const result = value === null || value === undefined ? '' : String(value);
        origWriteSync.call(fs, 1, result);
      } catch {
        origWriteSync.call(fs, 1, captured);
      }
    };
    try {
      await runCommand(command, args, cwd, raw, defaultValue);
      cleanup();
    } catch (e) {
      fs.writeSync = origWriteSync;
      throw e;
    }
    return;
  }

  // Intercept stdout to transparently resolve @file: references (#1891).
  // core.cjs output() writes @file:<path> when JSON > 50KB. The --pick path
  // already resolves this, but the normal path wrote @file: to stdout, forcing
  // every workflow to have a bash-specific `if [[ "$INIT" == @file:* ]]` check
  // that breaks on PowerShell and other non-bash shells.
  const origWriteSync2 = fs.writeSync;
  const outChunks = [];
  fs.writeSync = function (fd, data, ...rest) {
    if (fd === 1) { outChunks.push(String(data)); return; }
    return origWriteSync2.call(fs, fd, data, ...rest);
  };
  try {
    await runCommand(command, args, cwd, raw, defaultValue);
  } finally {
    fs.writeSync = origWriteSync2;
  }
  let captured = outChunks.join('');
  if (captured.startsWith('@file:')) {
    captured = fs.readFileSync(captured.slice(6), 'utf-8');
  }
  origWriteSync2.call(fs, 1, captured);
}

/**
 * Extract a field from an object using dot-notation and bracket syntax.
 * Supports: 'field', 'parent.child', 'arr[-1]', 'arr[0]'
 */
function extractField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    const bracketMatch = part.match(/^(.+?)\[(-?\d+)]$/);
    if (bracketMatch) {
      const key = bracketMatch[1];
      const index = parseInt(bracketMatch[2], 10);
      current = current[key];
      if (!Array.isArray(current)) return undefined;
      current = index < 0 ? current[current.length + index] : current[index];
    } else {
      current = current[part];
    }
  }
  return current;
}

async function runCommand(command, args, cwd, raw, defaultValue) {
  switch (command) {
    case 'state': {
      const subcommand = args[1];
      if (subcommand === 'json') {
        state.cmdStateJson(cwd, raw);
      } else if (subcommand === 'update') {
        state.cmdStateUpdate(cwd, args[2], args[3]);
      } else if (subcommand === 'get') {
        state.cmdStateGet(cwd, args[2], raw);
      } else if (subcommand === 'patch') {
        const patches = {};
        for (let i = 2; i < args.length; i += 2) {
          const key = args[i].replace(/^--/, '');
          const value = args[i + 1];
          if (key && value !== undefined) {
            patches[key] = value;
          }
        }
        state.cmdStatePatch(cwd, patches, raw);
      } else if (subcommand === 'advance-plan') {
        state.cmdStateAdvancePlan(cwd, raw);
      } else if (subcommand === 'record-metric') {
        const { phase: p, plan, duration, tasks, files } = parseNamedArgs(args, ['phase', 'plan', 'duration', 'tasks', 'files']);
        state.cmdStateRecordMetric(cwd, { phase: p, plan, duration, tasks, files }, raw);
      } else if (subcommand === 'update-progress') {
        state.cmdStateUpdateProgress(cwd, raw);
      } else if (subcommand === 'add-decision') {
        const { phase: p, summary, 'summary-file': summary_file, rationale, 'rationale-file': rationale_file } = parseNamedArgs(args, ['phase', 'summary', 'summary-file', 'rationale', 'rationale-file']);
        state.cmdStateAddDecision(cwd, { phase: p, summary, summary_file, rationale: rationale || '', rationale_file }, raw);
      } else if (subcommand === 'add-blocker') {
        const { text, 'text-file': text_file } = parseNamedArgs(args, ['text', 'text-file']);
        state.cmdStateAddBlocker(cwd, { text, text_file }, raw);
      } else if (subcommand === 'resolve-blocker') {
        state.cmdStateResolveBlocker(cwd, parseNamedArgs(args, ['text']).text, raw);
      } else if (subcommand === 'record-session') {
        const { 'stopped-at': stopped_at, 'resume-file': resume_file } = parseNamedArgs(args, ['stopped-at', 'resume-file']);
        state.cmdStateRecordSession(cwd, { stopped_at, resume_file: resume_file || 'None' }, raw);
      } else if (subcommand === 'begin-phase') {
        const { phase: p, name, plans } = parseNamedArgs(args, ['phase', 'name', 'plans']);
        state.cmdStateBeginPhase(cwd, p, name, plans !== null ? parseInt(plans, 10) : null, raw);
      } else if (subcommand === 'signal-waiting') {
        const { type, question, options, phase: p } = parseNamedArgs(args, ['type', 'question', 'options', 'phase']);
        state.cmdSignalWaiting(cwd, type, question, options, p, raw);
      } else if (subcommand === 'signal-resume') {
        state.cmdSignalResume(cwd, raw);
      } else if (subcommand === 'planned-phase') {
        const { phase: p, name, plans } = parseNamedArgs(args, ['phase', 'name', 'plans']);
        state.cmdStatePlannedPhase(cwd, p, plans !== null ? parseInt(plans, 10) : null, raw);
      } else if (subcommand === 'validate') {
        state.cmdStateValidate(cwd, raw);
      } else if (subcommand === 'sync') {
        const { verify } = parseNamedArgs(args, [], ['verify']);
        state.cmdStateSync(cwd, { verify }, raw);
      } else if (subcommand === 'prune') {
        const { 'keep-recent': keepRecent, 'dry-run': dryRun } = parseNamedArgs(args, ['keep-recent'], ['dry-run']);
        state.cmdStatePrune(cwd, { keepRecent: keepRecent || '3', dryRun: !!dryRun }, raw);
      } else {
        state.cmdStateLoad(cwd, raw);
      }
      break;
    }

    case 'align': {
      // Phase 4 Plan 04-04 — ALIGN gate dispatcher. Both subcommand branches
      // wrap the align.cjs calls in try/catch that forwards err.message to
      // `error` (core.error). Without this, Node's default uncaught-exception
      // handler prints the full stack trace including absolute paths to
      // align.cjs — which would fail Test 10's doesNotMatch assertion on
      // `/\/Users\/[a-z0-9_-]+\/GSD-for-Business/i`.
      const align = require('./lib/align.cjs');
      const subcommand = args[1];
      const candIdx = args.indexOf('--candidate');
      const baseIdx = args.indexOf('--baseline');
      const outIdx = args.indexOf('--verdict-out');
      const vIdx = args.indexOf('--verdict');
      const reasonIdx = args.indexOf('--override-reason');
      const override = args.includes('--override');

      if (subcommand === 'run') {
        const candidate = candIdx !== -1 ? args[candIdx + 1] : null;
        const baseline = baseIdx !== -1 ? args[baseIdx + 1] : null;
        const verdictOutPath = outIdx !== -1 ? args[outIdx + 1] : null;
        if (!candidate || !baseline) {
          error('align run requires --candidate <path> --baseline <path>');
          break;
        }
        try {
          const screen = align.runDeterministicScreen(cwd, { candidate, baseline });
          const outPath = verdictOutPath
            || path.join(core.planningPaths(cwd).planning, '.align-verdict.tmp.json');
          if (screen.verdict) {
            align.writeVerdict(outPath, screen.verdict);
            core.output(
              { short_circuited: true, verdict: screen.verdict, verdictPath: outPath },
              raw,
              'short_circuited',
            );
          } else {
            core.output(
              { short_circuited: false, deterministic_findings: screen.findings },
              raw,
              'llm_pass_needed',
            );
          }
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (subcommand === 'commit') {
        const verdictPath = vIdx !== -1 ? args[vIdx + 1] : null;
        const overrideReason = reasonIdx !== -1 ? args[reasonIdx + 1] : null;
        if (!verdictPath) {
          error('align commit requires --verdict <path>');
          break;
        }
        try {
          const result = align.commitAlignVerdict(cwd, {
            verdictPath,
            override,
            overrideReason,
          });
          core.output(result, raw, `OBJECTIVES.align.md written at ${result.alignPath}`);
        } catch (err) {
          error(err.message);
        }
        break;
      }

      error(`align: unknown subcommand '${subcommand}'. Valid: run, commit`);
      break;
    }

    case 'audience': {
      // Plan 05-04 Task 5 — AUDIENCE gate dispatcher. Mirrors the `align` case.
      // Both subcommand branches wrap audience.cjs calls in try/catch that
      // forwards err.message to core.error (same defensive discipline as
      // align: no absolute-path stack leakage).
      const audience = require('./lib/audience.cjs');
      const audSubcommand = args[1];
      const audArtIdx = args.indexOf('--artifact');
      const audBaseIdx = args.indexOf('--baseline');
      const audOutIdx = args.indexOf('--verdict-out');
      const audVIdx = args.indexOf('--verdict');
      const audReasonIdx = args.indexOf('--override-reason');
      const audOverride = args.includes('--override');

      if (audSubcommand === 'run') {
        const artifact = audArtIdx !== -1 ? args[audArtIdx + 1] : null;
        const baseline = audBaseIdx !== -1 ? args[audBaseIdx + 1] : null;
        const verdictOutPath = audOutIdx !== -1 ? args[audOutIdx + 1] : null;
        if (!artifact || !baseline) {
          error('audience run requires --artifact <path> --baseline <path>');
          break;
        }
        try {
          const screen = audience.runDeterministicScreen(cwd, { artifact, baseline });
          const outPath = verdictOutPath
            || path.join(core.planningPaths(cwd).planning, '.audience-verdict.tmp.json');
          if (screen.verdict) {
            audience.writeVerdict(outPath, screen.verdict);
            core.output(
              { short_circuited: true, verdict: screen.verdict, verdictPath: outPath },
              raw,
              'short_circuited',
            );
          } else {
            core.output(
              { short_circuited: false, deterministic_findings: screen.findings },
              raw,
              'llm_pass_needed',
            );
          }
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (audSubcommand === 'commit') {
        const verdictPath = audVIdx !== -1 ? args[audVIdx + 1] : null;
        const artifactPath = audArtIdx !== -1 ? args[audArtIdx + 1] : null;
        const overrideReason = audReasonIdx !== -1 ? args[audReasonIdx + 1] : null;
        if (!verdictPath) {
          error('audience commit requires --verdict <path>');
          break;
        }
        if (!artifactPath) {
          error('audience commit requires --artifact <path>');
          break;
        }
        // WARNING-05: Plan 04 ships --artifact-aware dispatcher; Plan 05 Task 1
        // activates the flag inside commitAudienceVerdict (switches from stub
        // path to paired-sibling). Dispatcher signature is stable across both.
        try {
          const result = audience.commitAudienceVerdict(cwd, {
            verdictPath,
            artifactPath,
            override: audOverride,
            overrideReason,
          });
          core.output(result, raw, `audience report written at ${result.audiencePath}`);
        } catch (err) {
          error(err.message);
        }
        break;
      }

      error(`audience: unknown subcommand '${audSubcommand}'. Valid: run, commit`);
      break;
    }

    case 'compliance': {
      // Plan 07-01 Task 3 — COMPLIANCE gate dispatcher. Mirrors the `audience`
      // case (Plan 05-04). Both subcommand branches wrap compliance.cjs calls
      // in try/catch that forwards err.message to core.error (no absolute-path
      // stack leakage). Phase 7 D-01 verdict-enum is COMPLIANCE-OK /
      // FINDINGS-MATERIAL / FINDINGS-BLOCKING.
      const compliance = require('./lib/compliance.cjs');
      const compSubcommand = args[1];
      const compArtIdx = args.indexOf('--artifact');
      const compBaseIdx = args.indexOf('--baseline');
      const compOutIdx = args.indexOf('--verdict-out');
      const compVIdx = args.indexOf('--verdict');
      const compReasonIdx = args.indexOf('--override-reason');
      const compOverride = args.includes('--override');

      if (compSubcommand === 'run') {
        const artifact = compArtIdx !== -1 ? args[compArtIdx + 1] : null;
        const baseline = compBaseIdx !== -1 ? args[compBaseIdx + 1] : null;
        const verdictOutPath = compOutIdx !== -1 ? args[compOutIdx + 1] : null;
        if (!artifact || !baseline) {
          error('compliance run requires --artifact <path> --baseline <path>');
          break;
        }
        try {
          const screen = compliance.runDeterministicScreen(cwd, { artifact, baseline });
          const outPath = verdictOutPath
            || path.join(core.planningPaths(cwd).planning, '.compliance-verdict.tmp.json');
          if (screen.verdict) {
            compliance.writeVerdict(outPath, screen.verdict);
            core.output(
              { short_circuited: true, verdict: screen.verdict, verdictPath: outPath },
              raw,
              'short_circuited',
            );
          } else {
            core.output(
              { short_circuited: false, deterministic_findings: screen.findings },
              raw,
              'llm_pass_needed',
            );
          }
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (compSubcommand === 'commit') {
        const verdictPath = compVIdx !== -1 ? args[compVIdx + 1] : null;
        const artifactPath = compArtIdx !== -1 ? args[compArtIdx + 1] : null;
        const overrideReason = compReasonIdx !== -1 ? args[compReasonIdx + 1] : null;
        if (!verdictPath) {
          error('compliance commit requires --verdict <path>');
          break;
        }
        if (!artifactPath) {
          error('compliance commit requires --artifact <path>');
          break;
        }
        try {
          const result = compliance.commitComplianceVerdict(cwd, {
            verdictPath,
            artifactPath,
            override: compOverride,
            overrideReason,
          });
          core.output(result, raw, `compliance report written at ${result.compliancePath}`);
        } catch (err) {
          error(err.message);
        }
        break;
      }

      error(`compliance: unknown subcommand '${compSubcommand}'. Valid: run, commit`);
      break;
    }

    case 'deliver': {
      // Plan 08-08 Task 3 — DELIVER dispatcher. Mirrors `case 'audience'`
      // (Plan 05-04 lines 558-635) byte-identity pattern: try/catch + core.error
      // + core.output. Spawned by brief/workflows/deliver.md per Type A loop.
      //
      // Subcommands:
      //   deliver synthesize --artifact <key> [--en]
      //     → synthesizeTypeA(cwd, artifactKey, {en}) per Plan 01 contract
      //   deliver list-type-a
      //     → emit TYPE_A_ARTIFACTS frozen list (4 keys)
      //   deliver list-type-b
      //     → emit Type B artifact key list (4 names)
      //
      // Phase 9 CR-01 — `--smoke` text-mode plumbing probe (no-op). Returns
      // a deterministic ok payload so smoke-test.cjs verifies the runtime
      // can route a child invocation through the dispatcher without hitting
      // an interactive precondition. Inserted BEFORE require() to keep the
      // probe cost minimal and free of side effects.
      if (args.includes('--smoke')) {
        core.output({ smoke: 'ok', cmd: 'deliver' }, raw, 'deliver smoke ok\n');
        break;
      }
      const deliver = require('./lib/deliver.cjs');
      const delivSubcommand = args[1];
      const delivArtIdx = args.indexOf('--artifact');
      const delivArtifactKey = delivArtIdx !== -1 ? args[delivArtIdx + 1] : null;
      const delivEn = args.includes('--en');

      if (delivSubcommand === 'synthesize') {
        if (!delivArtifactKey) { error('deliver synthesize: --artifact <key> required'); break; }
        try {
          const result = deliver.synthesizeTypeA(cwd, delivArtifactKey, { en: delivEn });
          core.output(
            result,
            raw,
            `synthesized ${result.outPath}${result.complete ? '' : ' (incomplete: ' + result.missing.join(', ') + ')'}`,
          );
        } catch (err) {
          error(err.message);
        }
        break;
      }
      if (delivSubcommand === 'list-type-a') {
        core.output({ artifacts: deliver.TYPE_A_ARTIFACTS }, raw, deliver.TYPE_A_ARTIFACTS.join('\n'));
        break;
      }
      if (delivSubcommand === 'list-type-b') {
        const TYPE_B = ['internal-deck', 'proposal-deck', 'exec-summary', 'decision-memo'];
        core.output({ artifacts: TYPE_B }, raw, TYPE_B.join('\n'));
        break;
      }
      error(`deliver: unknown subcommand '${delivSubcommand}'. Valid: synthesize, list-type-a, list-type-b`);
      break;
    }

    case 'export': {
      // Plan 08-08 Task 3 — EXPORT dispatcher. Mirrors `case 'audience'`
      // byte-identity pattern. Spawned by brief/workflows/export.md per
      // Plan 04 7-step orchestration.
      //
      // Subcommands:
      //   export run --artifact <path> [--format pptx|pdf|html] [--theme <name>]
      //              [--force-accept --override-reason "<reason>"] [--gate audience|compliance|both]
      //     → exportArtifact(cwd, path, opts) per Plan 04 contract
      //   export render --artifact <path> [--format pptx|pdf|html] [--theme <name>]
      //     → renderMarp helper for direct render dispatch (skips gate stack)
      //
      // For brief-tools dispatch, askUser is provided as a stub returning the
      // value passed via env or option; real workflow uses AskUserQuestion /
      // text_mode in workflows/export.md.
      const exportLib = require('./lib/export.cjs');
      const expSubcommand = args[1];
      const expArtIdx = args.indexOf('--artifact');
      const expArtifactPath = expArtIdx !== -1 ? args[expArtIdx + 1] : null;
      const expFormatIdx = args.indexOf('--format');
      const expFormat = expFormatIdx !== -1 ? args[expFormatIdx + 1] : 'pptx';
      const expThemeIdx = args.indexOf('--theme');
      const expTheme = expThemeIdx !== -1 ? args[expThemeIdx + 1] : null;
      const expForceAccept = args.includes('--force-accept');
      const expReasonIdx = args.indexOf('--override-reason');
      const expOverrideReason = expReasonIdx !== -1 ? args[expReasonIdx + 1] : null;
      const expGateIdx = args.indexOf('--gate');
      const expGate = expGateIdx !== -1 ? args[expGateIdx + 1] : null;

      // 08-REVIEW WR-02: validate --gate against the closed enum at dispatcher
      // entry. Without this guard, a typo (e.g., --gate audiece) silently makes
      // both audience+compliance branches in export.cjs evaluate false (the
      // gating predicate `_gate === 'audience' || _gate === 'both'` rejects
      // unknown values), so NEITHER gate runs and the render proceeds with
      // null verdicts that formatConfirmUI displays as the safe-looking
      // 'AUDIENCE-OK' / 'COMPLIANCE-OK' defaults — silent BYPASS of the gate
      // stack. Reject unknown values with a clear error.
      const VALID_EXPORT_GATES = new Set(['audience', 'compliance', 'both']);
      if (expGate !== null && !VALID_EXPORT_GATES.has(expGate)) {
        error(`export: --gate must be one of ${[...VALID_EXPORT_GATES].join(' | ')} (got: '${expGate}')`);
        break;
      }

      if (expSubcommand === 'run') {
        if (!expArtifactPath) { error('export run: --artifact <path> required'); break; }
        try {
          // brief-tools-dispatch askUser: when --force-accept is set on the
          // command line, return option-2 (force-accept) for any 3-path
          // interrupt. Otherwise return option-0 (frontmatter revision —
          // safer default for unattended dispatch).
          const askUser = (q) => {
            if (expForceAccept && q && Array.isArray(q.paths)) return 2;
            return 0;
          };
          const result = exportLib.exportArtifact(cwd, expArtifactPath, {
            format: expFormat,
            theme: expTheme,
            allowFallback: true,
            askUser,
            _gate: expGate,
            _forceAcceptOverrideReason: expOverrideReason,
          });
          core.output(
            result,
            raw,
            result.ok ? `exported ${result.output}` : `export not completed: ${result.reason}`,
          );
        } catch (err) {
          error(err.message);
        }
        break;
      }
      if (expSubcommand === 'render') {
        if (!expArtifactPath) { error('export render: --artifact <path> required'); break; }
        try {
          const inputMd = path.resolve(cwd, expArtifactPath);
          const fm = require('./lib/frontmatter.cjs').extractFrontmatter(
            require('fs').readFileSync(inputMd, 'utf-8'),
          ) || {};
          const conf = (fm['audience.confidentiality'])
            || (fm.audience && fm.audience.confidentiality)
            || 'internal';
          const baseName = path.basename(expArtifactPath, '.md');
          const outPath = path.join(path.dirname(inputMd), `${baseName}.${conf}.${expFormat}`);
          const result = exportLib.renderMarp(cwd, {
            inputMd,
            outputPath: outPath,
            format: expFormat,
            theme: expTheme,
            allowFallback: true,
          });
          core.output(
            result,
            raw,
            result.ok ? `rendered ${result.outputPath}` : `render did not complete: ${result.error}`,
          );
        } catch (err) {
          error(err.message);
        }
        break;
      }
      error(`export: unknown subcommand '${expSubcommand}'. Valid: run, render`);
      break;
    }

    case 'voice-fit': {
      // Plan 08-08 Task 3 — VOICE-FIT dispatcher. Mirrors `case 'audience'`
      // byte-identity pattern. Spawned by brief/workflows/deliver.md Step 3B.3
      // per Plan 02 banned-words density check + Korean honorific guard.
      //
      // Subcommands:
      //   voice-fit check --artifact <path>
      //     → checkBannedWords(text, {isKorean, isExternal}) per Plan 02 contract
      const voiceFit = require('./lib/voice-fit.cjs');
      const vfSubcommand = args[1];
      const vfArtIdx = args.indexOf('--artifact');
      const vfArtifactPath = vfArtIdx !== -1 ? args[vfArtIdx + 1] : null;

      if (vfSubcommand === 'check') {
        if (!vfArtifactPath) { error('voice-fit check: --artifact <path> required'); break; }
        try {
          const fs2 = require('fs');
          const fm2 = require('./lib/frontmatter.cjs');
          const inputMd = path.resolve(cwd, vfArtifactPath);
          const raw2 = fs2.readFileSync(inputMd, 'utf-8');
          const text = fm2.stripFrontmatter(raw2);
          const fm = fm2.extractFrontmatter(raw2) || {};
          const ctx = require('./lib/context-inject.cjs').buildBusinessContext({ cwd });
          const conf = (fm['audience.confidentiality'])
            || (fm.audience && fm.audience.confidentiality)
            || 'internal';
          const isExternal = ['partner', 'public', 'external'].includes(conf);
          const result = voiceFit.checkBannedWords(text, {
            isKorean: ctx.language === 'ko',
            isExternal,
          });
          core.output(
            result,
            raw,
            `density ${result.density.toFixed(2)}/${result.threshold} pages=${result.pages} hits=${result.hits.length}${result.exceedsThreshold ? ' EXCEEDS' : ''}`,
          );
        } catch (err) {
          error(err.message);
        }
        break;
      }
      error(`voice-fit: unknown subcommand '${vfSubcommand}'. Valid: check`);
      break;
    }

    case 'smoke-test': {
      // Plan 09-01 — SMOKE-TEST dispatcher. Mirrors `case 'voice-fit'`
      // (lines 864-907) byte-identity pattern: try/catch + error +
      // core.output. Stub-driven (B-D01) — never invokes real
      // Codex/Gemini/OpenCode CLIs.
      //
      // Subcommands:
      //   smoke-test run [--out <path>]
      //     → buildMatrix() over RUNTIMES × COMMANDS, renders to SMOKE-TEST.md
      const smoke = require('./lib/smoke-test.cjs');
      const stSubcommand = args[1];
      const stOutIdx = args.indexOf('--out');
      const stOutPath = stOutIdx !== -1
        ? args[stOutIdx + 1]
        : path.join(core.planningPaths(cwd).planning, 'SMOKE-TEST.md');
      try {
        if (stSubcommand === 'run') {
          const matrix = smoke.buildMatrix(cwd);
          const md = smoke.renderMatrixMarkdown(matrix);
          core.atomicWriteFileSync(stOutPath, md);
          core.output({ matrix, outPath: stOutPath }, raw, `SMOKE-TEST.md written: ${stOutPath}`);
          break;
        }
        error(`smoke-test: unknown subcommand '${stSubcommand}'. Valid: run`);
      } catch (err) {
        error(err.message);
      }
      break;
    }

    case 'help': {
      // Plan 09-02 — HELP dispatcher. Mirrors `case 'voice-fit'` byte-identity
      // pattern (lines 864-907): try/catch + error + core.output. Read-only —
      // no writes. Inserted AFTER `case 'smoke-test'` (Plan 09-01) per the
      // canonical brief-tools.cjs case ordering: voice-fit → smoke-test → help
      // → leakage-diff. Spawned by commands/brief/help.md.
      //
      // Subcommands (single-arg form):
      //   help                 → renderCategorized(buildCatalog())
      //   help <topic>         → if substring match: renderTopicMatch
      //                          else: renderTypoSuggestions(suggestTopK(<topic>, slugs, 3, 3))
      const help = require('./lib/help.cjs');
      const subarg = args[1];
      const COMMANDS_DIR = path.join(__dirname, '..', '..', 'commands', 'brief');
      try {
        const catalog = help.buildCatalog(COMMANDS_DIR);
        if (!subarg) {
          core.output({ catalog }, raw, help.renderCategorized(catalog));
          break;
        }
        // partial keyword match (C-D02): case-insensitive substring on slug + description
        const matches = catalog.filter((e) =>
          e.slug.toLowerCase().includes(subarg.toLowerCase()) ||
          (e.description || '').toLowerCase().includes(subarg.toLowerCase())
        );
        if (matches.length > 0) {
          core.output({ matches }, raw, help.renderTopicMatch(matches));
          break;
        }
        // typo correction via Levenshtein (C-D03): distance ≤ 3, top-3
        const slugs = catalog.map((e) => e.slug);
        const suggestions = help.suggestTopK(subarg, slugs, 3, 3);
        core.output({ suggestions }, raw, help.renderTypoSuggestions(subarg, suggestions));
      } catch (err) {
        error(err.message);
      }
      break;
    }

    case 'leakage-diff': {
      // Plan 08-08 Task 3 — LEAKAGE-DIFF dispatcher. Mirrors `case 'audience'`
      // byte-identity pattern. Spawned by brief/workflows/export.md Step 2 per
      // Plan 03 cross-artifact TF-IDF leakage detection.
      //
      // Subcommands:
      //   leakage-diff scan --artifact <path>
      //     → leakageDiff(absPath) per Plan 03 contract
      const leakageLib = require('./lib/leakage-diff.cjs');
      const ldSubcommand = args[1];
      const ldArtIdx = args.indexOf('--artifact');
      const ldArtifactPath = ldArtIdx !== -1 ? args[ldArtIdx + 1] : null;

      if (ldSubcommand === 'scan') {
        if (!ldArtifactPath) { error('leakage-diff scan: --artifact <path> required'); break; }
        try {
          const result = leakageLib.leakageDiff(path.resolve(cwd, ldArtifactPath));
          core.output(
            result,
            raw,
            result.findings.length === 0
              ? `0 findings (${result.rationale})`
              : `${result.findings.length} finding(s) (${result.rationale})`,
          );
        } catch (err) {
          error(err.message);
        }
        break;
      }
      error(`leakage-diff: unknown subcommand '${ldSubcommand}'. Valid: scan`);
      break;
    }

    case 'design': {
      // Plan 07-03 Task 1 — /brief-design orchestrator helper dispatcher.
      // Read-only subcommands consumed by brief/workflows/design.md:
      //   design list                          — emit JSON array of all workstream slugs
      //   design get-workstream --slug <name>  — emit spec JSON; non-zero on unknown slug
      //   design recommended-next --completed "<csv>" — derive next-eligible slug per
      //                                                soft-order (depends_on subset)
      // Aliases (canonical → full slug) per RESOLVED Open Question #2:
      //   BMC → business-model-canvas, GTM → go-to-market, FIN → financial,
      //   OPS → operations, COMP → compliance, ROAD → roadmap, BRAND → brand,
      //   RISK → risk, TECH → tech-arch
      // NEVER throws to caller — all error paths emit JSON or call core.error.
      //
      // Phase 9 CR-01 — `--smoke` text-mode plumbing probe (no-op). See
      // identical handler in `case 'deliver'` for rationale.
      if (args.includes('--smoke')) {
        core.output({ smoke: 'ok', cmd: 'design' }, raw, 'design smoke ok\n');
        break;
      }
      const { loadWorkstreams } = require('./lib/workstream-loader.cjs');
      const designSubcommand = args[1];

      // Slug-alias map (RESOLVED Open Question #2 in 07-RESEARCH.md). The
      // dispatcher resolves aliases case-insensitively before calling the
      // loader; the loader's slugs are dir-name lowercase-dash-separated.
      const SLUG_ALIASES = {
        bmc: 'business-model-canvas',
        gtm: 'go-to-market',
        fin: 'financial',
        ops: 'operations',
        comp: 'compliance',
        road: 'roadmap',
        brand: 'brand',
        risk: 'risk',
        tech: 'tech-arch',
      };

      function resolveSlug(input) {
        if (!input) return null;
        const lower = String(input).toLowerCase();
        return SLUG_ALIASES[lower] || lower;
      }

      if (designSubcommand === 'list') {
        try {
          const specs = loadWorkstreams(cwd);
          const slugs = specs.map((s) => s.slug);
          core.output(slugs, raw);
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (designSubcommand === 'get-workstream') {
        const slugIdx = args.indexOf('--slug');
        const rawSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;
        if (!rawSlug) {
          error('design get-workstream requires --slug <name>');
          break;
        }
        const resolved = resolveSlug(rawSlug);
        try {
          const specs = loadWorkstreams(cwd);
          const match = specs.find((s) => s.slug === resolved);
          if (!match) {
            // Emit JSON-shaped error to stdout for the workflow to grep, AND
            // call core.error to set non-zero exit. core.error writes to
            // stderr + exits — write the JSON FIRST so the workflow can read
            // both streams and reach a deterministic decision.
            process.stdout.write(JSON.stringify({
              error: `unknown workstream ${rawSlug}`,
              resolved_slug: resolved,
              available: specs.map((s) => s.slug),
            }) + '\n');
            error(`unknown workstream ${rawSlug}`);
            break;
          }
          core.output(match, raw);
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (designSubcommand === 'recommended-next') {
        const completedIdx = args.indexOf('--completed');
        const completedRaw = completedIdx !== -1 ? args[completedIdx + 1] : '';
        // Parse CSV; empty or undefined → []. Tolerate JSON-array form too
        // (state.brief.workstreams_completed may render as `["bmc","gtm"]`).
        let completed = [];
        const trimmed = (completedRaw || '').trim();
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) completed = parsed.map(String);
          } catch (_) {
            completed = [];
          }
        } else if (trimmed.length > 0) {
          completed = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
        }
        // Resolve any alias forms in completed list to canonical slugs so
        // depends_on (which uses canonical slugs) compares correctly.
        completed = completed.map(resolveSlug);

        try {
          // Phase 7 D-07 soft-order delegation: defer to status.cjs
          // computeRecommendedNext for the canonical PHASE_7_SOFT_ORDER walk.
          // This keeps the workflow handoff (design.md Step 7) and /brief-status
          // dashboard line in lock-step — both surfaces share the same recommendation
          // semantics. The dispatcher previously used a pure alphabetical
          // loadWorkstreams walk which surfaced the `_example` fixture as a
          // recommendation; computeRecommendedNext skips `_example` and respects
          // the canonical 9-workstream order.
          const { computeRecommendedNext } = require('./lib/status.cjs');
          const candidate = computeRecommendedNext(cwd, { workstreams_completed: completed });
          // computeRecommendedNext returns the literal sentinel '—' when no
          // candidate remains (all completed). Normalize to null for dispatcher
          // contract callers (workflow's `recommended_next is null` branch).
          const recommended = candidate === '—' ? null : candidate;
          core.output({ recommended_next: recommended }, raw);
        } catch (err) {
          // Per contract: NEVER throw — emit null with reason.
          core.output({ recommended_next: null, reason: err.message }, raw);
        }
        break;
      }

      error(
        `design: unknown subcommand '${designSubcommand}'. ` +
          'Valid: list, get-workstream, recommended-next',
      );
      break;
    }

    case 'add-workstream': {
      // Plan 07-04 Task 2 — /brief-add-workstream dispatcher.
      // Phase 7 D-09/D-10/D-11 / DSG-10 — workstream addition without .cjs source change.
      // Three subcommands consumed by brief/workflows/add-workstream.md:
      //   add-workstream check-collision --name <slug>
      //     → JSON {collides: bool, existing_slug?: string}
      //   add-workstream check-overlap --name <slug> --description <desc>
      //     → JSON {overlap: bool, candidates: string[]}
      //     heuristic: word-set overlap > 50% with each existing description
      //     (lowercase + whitespace-split + intersection / union > 0.5)
      //   add-workstream write --name <slug> --spec-json <json>
      //                        --design-prompts-content <content>
      //                        --template-content <content>
      //     → atomic 3-file write via atomicWriteFileSync per file + brief-tools commit
      //     On any throw, unlinks all created files + workstream dir (rollback).
      const { loadWorkstreams } = require('./lib/workstream-loader.cjs');
      const { atomicWriteFileSync } = core;
      const awSubcommand = args[1];

      // Same alias map as the design dispatcher (RESOLVED Open Question #2).
      const SLUG_ALIASES = {
        bmc: 'business-model-canvas',
        gtm: 'go-to-market',
        fin: 'financial',
        ops: 'operations',
        comp: 'compliance',
        road: 'roadmap',
        brand: 'brand',
        risk: 'risk',
        tech: 'tech-arch',
      };

      function slugify(input) {
        if (!input) return null;
        // Underscore is preserved as-is — `_example` (the canonical demo
        // workstream) is a valid existing slug and collision check must
        // match it. Whitespace becomes hyphen; other special chars dropped.
        return String(input)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9_-]/g, '');
      }

      function resolveSlug(input) {
        if (!input) return null;
        const slug = slugify(input);
        return SLUG_ALIASES[slug] || slug;
      }

      if (awSubcommand === 'check-collision') {
        const nameIdx = args.indexOf('--name');
        const rawName = nameIdx !== -1 ? args[nameIdx + 1] : null;
        if (!rawName) {
          error('add-workstream check-collision requires --name <slug>');
          break;
        }
        const resolved = resolveSlug(rawName);
        try {
          const specs = loadWorkstreams(cwd);
          const match = specs.find((s) => s.slug === resolved);
          if (match) {
            core.output(
              { collides: true, existing_slug: match.slug },
              raw,
              'collides',
            );
          } else {
            core.output({ collides: false }, raw, 'no_collision');
          }
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (awSubcommand === 'check-overlap') {
        const nameIdx = args.indexOf('--name');
        const descIdx = args.indexOf('--description');
        const rawName = nameIdx !== -1 ? args[nameIdx + 1] : null;
        const rawDesc = descIdx !== -1 ? args[descIdx + 1] : null;
        if (!rawName || !rawDesc) {
          error(
            'add-workstream check-overlap requires --name <slug> --description <desc>',
          );
          break;
        }
        try {
          const specs = loadWorkstreams(cwd);
          // Word-set overlap heuristic (CONTEXT.md Claude's Discretion):
          // lowercase, whitespace-split, intersection / union > 0.5.
          // Filter empty tokens and very short tokens (< 3 chars) to reduce
          // noise from common particles.
          function tokenize(s) {
            return new Set(
              String(s)
                .toLowerCase()
                .split(/[\s,.:;!?()[\]{}'"`/\\-]+/)
                .map((t) => t.trim())
                .filter((t) => t.length >= 3),
            );
          }
          const userTokens = tokenize(rawDesc);
          const candidates = [];
          for (const spec of specs) {
            const otherTokens = tokenize(spec.description || '');
            const intersection = new Set(
              [...userTokens].filter((t) => otherTokens.has(t)),
            );
            const union = new Set([...userTokens, ...otherTokens]);
            if (union.size === 0) continue;
            const overlap = intersection.size / union.size;
            if (overlap > 0.5) candidates.push(spec.slug);
          }
          core.output(
            { overlap: candidates.length > 0, candidates },
            raw,
            candidates.length > 0 ? 'overlap_detected' : 'no_overlap',
          );
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (awSubcommand === 'write') {
        const nameIdx = args.indexOf('--name');
        const specIdx = args.indexOf('--spec-json');
        const dpIdx = args.indexOf('--design-prompts-content');
        const tplIdx = args.indexOf('--template-content');
        const rawName = nameIdx !== -1 ? args[nameIdx + 1] : null;
        const specJson = specIdx !== -1 ? args[specIdx + 1] : null;
        const dpContent = dpIdx !== -1 ? args[dpIdx + 1] : null;
        const tplContent = tplIdx !== -1 ? args[tplIdx + 1] : null;
        if (!rawName || !specJson || dpContent == null || tplContent == null) {
          error(
            'add-workstream write requires --name <slug> --spec-json <json> ' +
              '--design-prompts-content <content> --template-content <content>',
          );
          break;
        }
        const resolved = resolveSlug(rawName);
        const wsRoot = path.join(cwd, 'brief', 'workstreams', resolved);
        const tplDir = path.join(wsRoot, 'templates');
        const specPath = path.join(wsRoot, 'spec.yaml');
        const dpPath = path.join(wsRoot, 'design-prompts.md');
        const tplPath = path.join(tplDir, 'artifact.md');
        const created = []; // tracks files for rollback

        // TOCTOU guard: defensive collision re-check.
        if (fs.existsSync(wsRoot)) {
          error(
            `add-workstream write: workstream "${resolved}" already exists at ` +
              `brief/workstreams/${resolved}/ (TOCTOU collision guard)`,
          );
          break;
        }

        function rollback() {
          for (const f of created) {
            try { fs.unlinkSync(f); } catch (_) { /* best-effort */ }
          }
          // Remove templates/ if empty, then workstream dir if empty.
          try { fs.rmdirSync(tplDir); } catch (_) { /* may not exist */ }
          try { fs.rmdirSync(wsRoot); } catch (_) { /* may not exist */ }
        }

        // Minimal YAML serializer for the spec object (flat schema with
        // string fields + arrays of strings + 1 boolean-ish arg). We do NOT
        // depend on a generic library — the schema is closed (Phase 7 D-13)
        // and hand-rolled emission is the safest path.
        function emitYaml(spec) {
          const lines = [];
          // Required fields in canonical order (D-13)
          lines.push(`name: ${spec.name}`);
          lines.push(`description: ${JSON.stringify(spec.description || '')}`);
          // research_prompts
          lines.push('research_prompts:');
          const rp = Array.isArray(spec.research_prompts) ? spec.research_prompts : [];
          for (const p of rp) lines.push(`  - ${JSON.stringify(p)}`);
          if (rp.length === 0) lines.push('  - "(no research prompts specified)"');
          // design_prompts
          lines.push('design_prompts:');
          const dp = Array.isArray(spec.design_prompts) && spec.design_prompts.length > 0
            ? spec.design_prompts
            : ['file:design-prompts.md'];
          for (const p of dp) lines.push(`  - ${JSON.stringify(p)}`);
          // output_artifact_template
          lines.push(
            `output_artifact_template: ${spec.output_artifact_template || 'templates/artifact.md'}`,
          );
          // gates_required (D-10 default — we lock the literal here defensively).
          // Values are constrained canonical slugs (validated enum), so unquoted
          // emission is YAML-safe AND the locked-literal test asserts this exact
          // unquoted format (tests/brief-add-workstream-gates.test.cjs:108).
          const gates = Array.isArray(spec.gates_required) && spec.gates_required.length > 0
            ? spec.gates_required
            : ['align', 'audience', 'compliance'];
          lines.push(`gates_required: [${gates.join(', ')}]`);
          // depends_on — values are constrained canonical workstream slugs.
          const deps = Array.isArray(spec.depends_on) ? spec.depends_on : [];
          lines.push(`depends_on: [${deps.join(', ')}]`);
          // Optional extends_workstream (D-11 fork)
          if (spec.extends_workstream && typeof spec.extends_workstream === 'string') {
            lines.push(`extends_workstream: ${spec.extends_workstream}`);
          }
          // Optional compliance_packs (Q4 advisory). Per-element JSON.stringify
          // ensures YAML-safe quoted strings — the workflow Q4 "Other" branch
          // (add-workstream.md Step 3) can flow free-form user text into this
          // array (e.g. "DSL, eIDAS" or "GDPR Art. 5(1)(e)") which would break
          // the next yaml-mini.cjs parseYamlDocument round-trip if unquoted (WR-03).
          if (Array.isArray(spec.compliance_packs) && spec.compliance_packs.length > 0) {
            lines.push(`compliance_packs: [${spec.compliance_packs.map((p) => JSON.stringify(p)).join(', ')}]`);
          }
          return lines.join('\n') + '\n';
        }

        let parsedSpec;
        try {
          parsedSpec = JSON.parse(specJson);
        } catch (err) {
          error(`add-workstream write: invalid --spec-json: ${err.message}`);
          break;
        }
        // Force the slug into spec.name (Phase 2 D-13: name MUST equal directory name)
        parsedSpec.name = resolved;

        try {
          fs.mkdirSync(wsRoot, { recursive: true });
          fs.mkdirSync(tplDir, { recursive: true });

          atomicWriteFileSync(specPath, emitYaml(parsedSpec), 'utf-8');
          created.push(specPath);

          atomicWriteFileSync(dpPath, dpContent, 'utf-8');
          created.push(dpPath);

          atomicWriteFileSync(tplPath, tplContent, 'utf-8');
          created.push(tplPath);

          // brief-tools commit --files (atomic single git commit per Pattern 4).
          // Note: we DO NOT mutate STATE.md here — workstream addition is
          // filesystem-only per CONTEXT.md D-09 (no STATE.md mutation in the
          // skeleton write step).
          commands.cmdCommit(
            cwd,
            `feat(07-04): add workstream ${resolved} via /brief-add-workstream`,
            [
              path.relative(cwd, specPath),
              path.relative(cwd, dpPath),
              path.relative(cwd, tplPath),
            ],
            true, // raw — suppress decorative output; the workflow renders user-facing message
            false,
            true, // noVerify — match parallel executor convention (also tolerates pre-commit hook failures)
          );

          core.output(
            {
              created: true,
              slug: resolved,
              files: [
                path.relative(cwd, specPath),
                path.relative(cwd, dpPath),
                path.relative(cwd, tplPath),
              ],
            },
            raw,
            `workstream ${resolved} created`,
          );
        } catch (err) {
          rollback();
          error(`add-workstream write: ${err.message} (3 files rolled back atomically)`);
        }
        break;
      }

      error(
        `add-workstream: unknown subcommand '${awSubcommand}'. ` +
          'Valid: check-collision, check-overlap, write',
      );
      break;
    }

    case 'gap-detect': {
      // Phase 6 Plan 06-04 — Gap-detect gate dispatcher. Subcommands:
      //   run             — validate-only (agent spawn happens in workflow)
      //   commit          — write {artifact}.gaps.md + STATE.md + route severities
      //   push-frame      — push frame onto return_stack + return_stack_history
      //   count-iterations — read-only count from return_stack_history
      //   cancel-workstream — clear frames for --workstream
      //   write-assumption — sanitize + append assumption + state log
      //   maybe-pop       — D-11 dual-condition pop (called from align-gate.md)
      //
      // Every branch wraps gap-detect.cjs calls in try/catch forwarding
      // err.message to core.error — NO uncaught-exception path (prevents
      // /Users/... absolute-path stack leakage; matches align + audience
      // dispatcher discipline).
      const gapDetect = require('./lib/gap-detect.cjs');
      const sub = args[1];
      const gdArtIdx = args.indexOf('--artifact');
      const gdBasIdx = args.indexOf('--baseline');
      const gdOutIdx = args.indexOf('--verdict-out');
      const gdVIdx = args.indexOf('--verdict');
      const gdWsIdx = args.indexOf('--workstream');
      const gdPpIdx = args.indexOf('--paused-phase');
      const gdFpIdx = args.indexOf('--fingerprint');
      const gdJusIdx = args.indexOf('--justification');
      const gdReasonIdx = args.indexOf('--override-reason');
      const gdPushFrame = args.includes('--push-frame');
      const gdOverride = args.includes('--override');

      if (sub === 'run') {
        const artifact = gdArtIdx !== -1 ? args[gdArtIdx + 1] : null;
        const baseline = gdBasIdx !== -1 ? args[gdBasIdx + 1] : null;
        const verdictOutPath = gdOutIdx !== -1 ? args[gdOutIdx + 1] : null;
        if (!artifact || !baseline) {
          error('gap-detect run requires --artifact <path> --baseline <path>');
          break;
        }
        try {
          const verdict = gapDetect.runGapDetect(cwd, { artifact, baseline, verdictOutPath });
          const outPath = verdictOutPath
            || path.join(core.planningPaths(cwd).planning, '.gap-detect-verdict.tmp.json');
          core.output({ verdict, verdictPath: outPath }, raw, 'gap-detect fallback verdict written');
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (sub === 'commit') {
        const verdictPath = gdVIdx !== -1 ? args[gdVIdx + 1] : null;
        const artifactPath = gdArtIdx !== -1 ? args[gdArtIdx + 1] : null;
        const workstream = gdWsIdx !== -1 ? args[gdWsIdx + 1] : null;
        const pausedPhase = gdPpIdx !== -1 ? args[gdPpIdx + 1] : '07';
        const overrideReason = gdReasonIdx !== -1 ? args[gdReasonIdx + 1] : null;
        if (!verdictPath) { error('gap-detect commit requires --verdict <path>'); break; }
        if (!artifactPath) { error('gap-detect commit requires --artifact <path>'); break; }
        try {
          const result = gapDetect.commitGapDetectVerdict(cwd, {
            verdictPath, artifactPath, workstream, pausedPhase,
            pushFrame: gdPushFrame, override: gdOverride, overrideReason,
          });
          core.output(result, raw, `gaps report written at ${result.gapsPath}`);
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (sub === 'push-frame') {
        const verdictPath = gdVIdx !== -1 ? args[gdVIdx + 1] : null;
        const artifactPath = gdArtIdx !== -1 ? args[gdArtIdx + 1] : null;
        const workstream = gdWsIdx !== -1 ? args[gdWsIdx + 1] : null;
        const pausedPhase = gdPpIdx !== -1 ? args[gdPpIdx + 1] : '07';
        if (!verdictPath || !artifactPath || !workstream) {
          error('gap-detect push-frame requires --verdict --artifact --workstream');
          break;
        }
        try {
          const verdict = JSON.parse(require('fs').readFileSync(verdictPath, 'utf-8'));
          const first = (verdict.findings || []).find((f) => f.severity === 'blocking');
          if (!first) { error('no blocking finding in verdict — push-frame refused'); break; }
          const frame = {
            paused_phase: pausedPhase,
            paused_workstream: workstream,
            paused_artifact: artifactPath,
            gap_text: first.description,
            triggering_topic: first.description.slice(0, 60),
            topic_fingerprint: first.topic_fingerprint,
            pushed_at: new Date().toISOString(),
          };
          gapDetect.pushReturnFrame(cwd, frame);
          core.output(
            {
              framePushed: true,
              topic_fingerprint: frame.topic_fingerprint,
              triggering_topic: frame.triggering_topic,
            },
            raw,
            `RETURNED-TO-DISCOVER\ntriggering_topic: ${frame.triggering_topic}\nNext: run /brief-discover to resume research on this topic.`,
          );
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (sub === 'count-iterations') {
        const workstream = gdWsIdx !== -1 ? args[gdWsIdx + 1] : null;
        const fingerprint = gdFpIdx !== -1 ? args[gdFpIdx + 1] : null;
        if (!workstream || !fingerprint) {
          error('gap-detect count-iterations requires --workstream --fingerprint');
          break;
        }
        try {
          const fs2 = require('fs');
          const statePath = core.planningPaths(cwd).state;
          const content = fs2.existsSync(statePath) ? fs2.readFileSync(statePath, 'utf-8') : '';
          const fm = require('./lib/frontmatter.cjs').extractFrontmatter(content) || {};
          const history = (fm.brief && Array.isArray(fm.brief.return_stack_history))
            ? fm.brief.return_stack_history : [];
          const n = gapDetect.countIterations(history, workstream, fingerprint);
          core.output({ count: n, workstream, fingerprint }, raw, String(n));
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (sub === 'cancel-workstream') {
        const workstream = gdWsIdx !== -1 ? args[gdWsIdx + 1] : null;
        if (!workstream) { error('gap-detect cancel-workstream requires --workstream'); break; }
        try {
          gapDetect.clearReturnStackFor(cwd, workstream);
          core.output({ workstream, cleared: true }, raw, `return_stack cleared for ${workstream}`);
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (sub === 'write-assumption') {
        const workstream = gdWsIdx !== -1 ? args[gdWsIdx + 1] : null;
        const fingerprint = gdFpIdx !== -1 ? args[gdFpIdx + 1] : null;
        const justification = gdJusIdx !== -1 ? args[gdJusIdx + 1] : null;
        if (!workstream || !fingerprint || !justification) {
          error('gap-detect write-assumption requires --workstream --fingerprint --justification');
          break;
        }
        try {
          const result = gapDetect.writeAssumption(cwd, {
            justification, topic_fingerprint: fingerprint, workstream,
          });
          core.output(result, raw, `assumption recorded at ${result.at}`);
        } catch (err) {
          error(err.message);
        }
        break;
      }

      if (sub === 'maybe-pop') {
        try {
          const popped = gapDetect.maybePopTopFrame(cwd);
          core.output(
            { popped },
            raw,
            popped ? `popped frame for ${popped.triggering_topic}` : 'no-op (dual condition not met)',
          );
        } catch (err) {
          error(err.message);
        }
        break;
      }

      error(`gap-detect: unknown subcommand '${sub}'. Valid: run, commit, push-frame, count-iterations, cancel-workstream, write-assumption, maybe-pop`);
      break;
    }

    case 'resolve-model': {
      commands.cmdResolveModel(cwd, args[1], raw);
      break;
    }

    case 'find-phase': {
      phase.cmdFindPhase(cwd, args[1], raw);
      break;
    }

    case 'commit': {
      const amend = args.includes('--amend');
      const noVerify = args.includes('--no-verify');
      const filesIndex = args.indexOf('--files');
      // Collect all positional args between command name and first flag,
      // then join them — handles both quoted ("multi word msg") and
      // unquoted (multi word msg) invocations from different shells
      const endIndex = filesIndex !== -1 ? filesIndex : args.length;
      const messageArgs = args.slice(1, endIndex).filter(a => !a.startsWith('--'));
      const message = messageArgs.join(' ') || undefined;
      const files = filesIndex !== -1 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];
      commands.cmdCommit(cwd, message, files, raw, amend, noVerify);
      break;
    }

    case 'check-commit': {
      commands.cmdCheckCommit(cwd, raw);
      break;
    }

    case 'commit-to-subrepo': {
      const message = args[1];
      const filesIndex = args.indexOf('--files');
      const files = filesIndex !== -1 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];
      commands.cmdCommitToSubrepo(cwd, message, files, raw);
      break;
    }

    case 'verify-summary': {
      const summaryPath = args[1];
      const countIndex = args.indexOf('--check-count');
      const checkCount = countIndex !== -1 ? parseInt(args[countIndex + 1], 10) : 2;
      verify.cmdVerifySummary(cwd, summaryPath, checkCount, raw);
      break;
    }

    case 'template': {
      const subcommand = args[1];
      if (subcommand === 'select') {
        template.cmdTemplateSelect(cwd, args[2], raw);
      } else if (subcommand === 'fill') {
        const templateType = args[2];
        const { phase, plan, name, type, wave, fields: fieldsRaw } = parseNamedArgs(args, ['phase', 'plan', 'name', 'type', 'wave', 'fields']);
        let fields = {};
        if (fieldsRaw) {
          const { safeJsonParse } = require('./lib/security.cjs');
          const result = safeJsonParse(fieldsRaw, { label: '--fields' });
          if (!result.ok) error(result.error);
          fields = result.value;
        }
        template.cmdTemplateFill(cwd, templateType, {
          phase, plan, name, fields,
          type: type || 'execute',
          wave: wave || '1',
        }, raw);
      } else {
        error('Unknown template subcommand. Available: select, fill');
      }
      break;
    }

    case 'frontmatter': {
      const subcommand = args[1];
      const file = args[2];
      if (subcommand === 'get') {
        frontmatter.cmdFrontmatterGet(cwd, file, parseNamedArgs(args, ['field']).field, raw);
      } else if (subcommand === 'set') {
        const { field, value } = parseNamedArgs(args, ['field', 'value']);
        frontmatter.cmdFrontmatterSet(cwd, file, field, value !== null ? value : undefined, raw);
      } else if (subcommand === 'merge') {
        frontmatter.cmdFrontmatterMerge(cwd, file, parseNamedArgs(args, ['data']).data, raw);
      } else if (subcommand === 'validate') {
        frontmatter.cmdFrontmatterValidate(cwd, file, parseNamedArgs(args, ['schema']).schema, raw);
      } else {
        error('Unknown frontmatter subcommand. Available: get, set, merge, validate');
      }
      break;
    }

    case 'verify': {
      const subcommand = args[1];
      if (subcommand === 'plan-structure') {
        verify.cmdVerifyPlanStructure(cwd, args[2], raw);
      } else if (subcommand === 'phase-completeness') {
        verify.cmdVerifyPhaseCompleteness(cwd, args[2], raw);
      } else if (subcommand === 'references') {
        verify.cmdVerifyReferences(cwd, args[2], raw);
      } else if (subcommand === 'commits') {
        verify.cmdVerifyCommits(cwd, args.slice(2), raw);
      } else if (subcommand === 'artifacts') {
        verify.cmdVerifyArtifacts(cwd, args[2], raw);
      } else if (subcommand === 'key-links') {
        verify.cmdVerifyKeyLinks(cwd, args[2], raw);
      } else if (subcommand === 'schema-drift') {
        const skipFlag = args.includes('--skip');
        verify.cmdVerifySchemaDrift(cwd, args[2], skipFlag, raw);
      } else {
        error('Unknown verify subcommand. Available: plan-structure, phase-completeness, references, commits, artifacts, key-links, schema-drift');
      }
      break;
    }

    case 'generate-slug': {
      commands.cmdGenerateSlug(args[1], raw);
      break;
    }

    case 'current-timestamp': {
      commands.cmdCurrentTimestamp(args[1] || 'full', raw);
      break;
    }

    case 'list-todos': {
      commands.cmdListTodos(cwd, args[1], raw);
      break;
    }

    case 'verify-path-exists': {
      commands.cmdVerifyPathExists(cwd, args[1], raw);
      break;
    }

    case 'config-ensure-section': {
      config.cmdConfigEnsureSection(cwd, raw);
      break;
    }

    case 'config-set': {
      config.cmdConfigSet(cwd, args[1], args[2], raw);
      break;
    }

    case "config-set-model-profile": {
      config.cmdConfigSetModelProfile(cwd, args[1], raw);
      break;
    }

    case 'config-get': {
      config.cmdConfigGet(cwd, args[1], raw, defaultValue);
      break;
    }

    case 'config-new-project': {
      config.cmdConfigNewProject(cwd, args[1], raw);
      break;
    }

    case 'config-path': {
      config.cmdConfigPath(cwd, raw);
      break;
    }

    case 'agent-skills': {
      init.cmdAgentSkills(cwd, args[1], raw);
      break;
    }

    case 'skill-manifest': {
      init.cmdSkillManifest(cwd, args, raw);
      break;
    }

    case 'history-digest': {
      commands.cmdHistoryDigest(cwd, raw);
      break;
    }

    case 'phases': {
      const subcommand = args[1];
      if (subcommand === 'list') {
        const typeIndex = args.indexOf('--type');
        const phaseIndex = args.indexOf('--phase');
        const options = {
          type: typeIndex !== -1 ? args[typeIndex + 1] : null,
          phase: phaseIndex !== -1 ? args[phaseIndex + 1] : null,
          includeArchived: args.includes('--include-archived'),
        };
        phase.cmdPhasesList(cwd, options, raw);
      } else if (subcommand === 'clear') {
        milestone.cmdPhasesClear(cwd, raw, args.slice(2));
      } else {
        error('Unknown phases subcommand. Available: list, clear');
      }
      break;
    }

    case 'roadmap': {
      const subcommand = args[1];
      if (subcommand === 'get-phase') {
        roadmap.cmdRoadmapGetPhase(cwd, args[2], raw);
      } else if (subcommand === 'analyze') {
        roadmap.cmdRoadmapAnalyze(cwd, raw);
      } else if (subcommand === 'update-plan-progress') {
        roadmap.cmdRoadmapUpdatePlanProgress(cwd, args[2], raw);
      } else {
        error('Unknown roadmap subcommand. Available: get-phase, analyze, update-plan-progress');
      }
      break;
    }

    case 'requirements': {
      const subcommand = args[1];
      if (subcommand === 'mark-complete') {
        milestone.cmdRequirementsMarkComplete(cwd, args.slice(2), raw);
      } else {
        error('Unknown requirements subcommand. Available: mark-complete');
      }
      break;
    }

    case 'phase': {
      const subcommand = args[1];
      if (subcommand === 'next-decimal') {
        phase.cmdPhaseNextDecimal(cwd, args[2], raw);
      } else if (subcommand === 'add') {
        const idIdx = args.indexOf('--id');
        let customId = null;
        const descArgs = [];
        for (let i = 2; i < args.length; i++) {
          if (args[i] === '--id' && i + 1 < args.length) {
            customId = args[i + 1];
            i++; // skip value
          } else {
            descArgs.push(args[i]);
          }
        }
        phase.cmdPhaseAdd(cwd, descArgs.join(' '), raw, customId);
      } else if (subcommand === 'add-batch') {
        // Accepts JSON array of descriptions via --descriptions '[...]' or positional args
        const descFlagIdx = args.indexOf('--descriptions');
        let descriptions;
        if (descFlagIdx !== -1 && args[descFlagIdx + 1]) {
          try { descriptions = JSON.parse(args[descFlagIdx + 1]); } catch (e) { error('--descriptions must be a JSON array'); }
        } else {
          descriptions = args.slice(2).filter(a => a !== '--raw');
        }
        phase.cmdPhaseAddBatch(cwd, descriptions, raw);
      } else if (subcommand === 'insert') {
        phase.cmdPhaseInsert(cwd, args[2], args.slice(3).join(' '), raw);
      } else if (subcommand === 'remove') {
        const forceFlag = args.includes('--force');
        phase.cmdPhaseRemove(cwd, args[2], { force: forceFlag }, raw);
      } else if (subcommand === 'complete') {
        phase.cmdPhaseComplete(cwd, args[2], raw);
      } else {
        error('Unknown phase subcommand. Available: next-decimal, add, add-batch, insert, remove, complete');
      }
      break;
    }

    case 'milestone': {
      const subcommand = args[1];
      if (subcommand === 'complete') {
        const milestoneName = parseMultiwordArg(args, 'name');
        const archivePhases = args.includes('--archive-phases');
        milestone.cmdMilestoneComplete(cwd, args[2], { name: milestoneName, archivePhases }, raw);
      } else {
        error('Unknown milestone subcommand. Available: complete');
      }
      break;
    }

    case 'validate': {
      const subcommand = args[1];
      if (subcommand === 'consistency') {
        verify.cmdValidateConsistency(cwd, raw);
      } else if (subcommand === 'health') {
        const repairFlag = args.includes('--repair');
        verify.cmdValidateHealth(cwd, { repair: repairFlag }, raw);
      } else if (subcommand === 'agents') {
        verify.cmdValidateAgents(cwd, raw);
      } else {
        error('Unknown validate subcommand. Available: consistency, health, agents');
      }
      break;
    }

    case 'progress': {
      const subcommand = args[1] || 'json';
      commands.cmdProgressRender(cwd, subcommand, raw);
      break;
    }

    case 'status': {
      const status = require('./lib/status.cjs');
      status.renderStatus(cwd, raw);
      break;
    }

    case 'define': {
      // Phase 9 CR-01 — `--smoke` text-mode plumbing probe (no-op). See
      // identical handler in `case 'deliver'` for rationale.
      if (args.includes('--smoke')) {
        core.output({ smoke: 'ok', cmd: 'define' }, raw, 'define smoke ok\n');
        break;
      }
      const subcommand = args[1];
      const define = require('./lib/define.cjs');
      if (subcommand === 'apply') {
        const parsed = parseNamedArgs(args, ['fixture'], ['amend', 'unlock-intent']);
        return define.cmdDefineApply(cwd, {
          fixture: parsed.fixture,
          amend: parsed.amend,
          unlockIntent: parsed['unlock-intent'],
        }, raw);
      }
      error('Unknown define subcommand. Available: apply');
      break;
    }

    case 'objectives': {
      // Plan 05 dispatcher — OBJECTIVES.md gate primitives exposed via CLI.
      //   objectives validate       — DEF-05 block-gate (non-zero exit + Korean
      //                               block message on missing fields, W-6 silent)
      //   objectives stale-check    — DEF-06 mtime-based 48h staleness check (Plan 06 wiring)
      const subcommand = args[1];
      const objectives = require('./lib/objectives.cjs');
      if (subcommand === 'validate') return objectives.cmdValidate(cwd, raw);
      if (subcommand === 'stale-check') return objectives.cmdStaleCheck(cwd, raw);
      error('Unknown objectives subcommand. Available: validate, stale-check');
      break;
    }

    case 'discover': {
      // Phase 3 STUB — block-gate + stale-anchor + Phase 5 placeholder. Real
      // DISCOVER body (parallel domain research flow) arrives in Phase 5. This
      // case wires:
      //   Plan 05 — DEF-05 block-gate (cmdValidate).
      //   Plan 06 — DEF-06 stale-anchor 48h interrupt (shouldStaleAnchorFire
      //             + renderStaleAnchorPrompt), ordered BEFORE the Phase 5
      //             placeholder so W-8 `idxPrompt < idxPlaceholder` holds.
      //
      // Phase 9 CR-01 — `--smoke` text-mode plumbing probe (no-op). Inserted
      // BEFORE validateObjectivesComplete so the smoke matrix can verify the
      // dispatcher routes without tripping the OBJECTIVES.md precondition.
      if (args.includes('--smoke')) {
        core.output({ smoke: 'ok', cmd: 'discover' }, raw, 'discover smoke ok\n');
        break;
      }
      const objectives = require('./lib/objectives.cjs');
      const r = objectives.validateObjectivesComplete(cwd);
      if (!r.valid) {
        // cmdValidate renders the Korean block-gate to stderr and exits
        // non-zero SILENTLY (W-6 — no English "validation failed" leakage).
        return objectives.cmdValidate(cwd, raw);
      }

      // Stale-anchor check (DEF-06, D-13). Qualifying entry point:
      // 'discover-entry'. shouldStaleAnchorFire returns {fire:false} for any
      // non-qualifying entry or fresh OBJECTIVES.md.
      const define = require('./lib/define.cjs');
      const stale = define.shouldStaleAnchorFire(cwd, 'discover-entry');
      if (stale.fire) {
        // W-8 ordering: write the stale-anchor prompt to stdout BEFORE the
        // Phase 5 placeholder so `combined.indexOf('48시간') < combined.indexOf('Phase 5')`.
        process.stdout.write(define.renderStaleAnchorPrompt(stale.age_hours));
      }

      // Pass-through placeholder. Human-readable reminder to stderr so it is
      // visible regardless of --raw mode; structured JSON to stdout follows the
      // status.cjs (D-19) convention — raw=true emits the plain text, raw=false
      // emits a structured wrapper object for machine consumers.
      const placeholderText = 'Phase 5 DISCOVER body — coming in Phase 5. Block-gate is live.';
      fs.writeSync(2, placeholderText + '\n');
      core.output({ phase: 5, status: 'placeholder', message: placeholderText }, raw, placeholderText);
      return;
    }

    case 'audit-uat': {
      const uat = require('./lib/uat.cjs');
      uat.cmdAuditUat(cwd, raw);
      break;
    }

    case 'audit-open': {
      const { auditOpenArtifacts, formatAuditReport } = require('./lib/audit.cjs');
      const includeRaw = args.includes('--json');
      const result = auditOpenArtifacts(cwd);
      if (includeRaw) {
        core.output(result, raw);
      } else {
        core.output(formatAuditReport(result), raw);
      }
      break;
    }

    case 'uat': {
      const subcommand = args[1];
      const uat = require('./lib/uat.cjs');
      if (subcommand === 'render-checkpoint') {
        const options = parseNamedArgs(args, ['file']);
        uat.cmdRenderCheckpoint(cwd, options, raw);
      } else {
        error('Unknown uat subcommand. Available: render-checkpoint');
      }
      break;
    }

    case 'stats': {
      const subcommand = args[1] || 'json';
      commands.cmdStats(cwd, subcommand, raw);
      break;
    }

    case 'todo': {
      const subcommand = args[1];
      if (subcommand === 'complete') {
        commands.cmdTodoComplete(cwd, args[2], raw);
      } else if (subcommand === 'match-phase') {
        commands.cmdTodoMatchPhase(cwd, args[2], raw);
      } else {
        error('Unknown todo subcommand. Available: complete, match-phase');
      }
      break;
    }

    case 'scaffold': {
      const scaffoldType = args[1];
      const scaffoldOptions = {
        phase: parseNamedArgs(args, ['phase']).phase,
        name: parseMultiwordArg(args, 'name'),
      };
      commands.cmdScaffold(cwd, scaffoldType, scaffoldOptions, raw);
      break;
    }

    case 'init': {
      // Phase 9 CR-01 — `--smoke` text-mode plumbing probe (no-op). Inserted
      // BEFORE the inner workflow switch so the smoke matrix can verify the
      // dispatcher routes without supplying a sub-subcommand. See identical
      // handler in `case 'deliver'` for rationale.
      if (args.includes('--smoke')) {
        core.output({ smoke: 'ok', cmd: 'init' }, raw, 'init smoke ok\n');
        break;
      }
      const workflow = args[1];
      switch (workflow) {
        case 'execute-phase': {
          const { validate: epValidate, tdd: epTdd } = parseNamedArgs(args, [], ['validate', 'tdd']);
          init.cmdInitExecutePhase(cwd, args[2], raw, { validate: epValidate, tdd: epTdd });
          break;
        }
        case 'plan-phase': {
          const { validate: ppValidate, tdd: ppTdd } = parseNamedArgs(args, [], ['validate', 'tdd']);
          init.cmdInitPlanPhase(cwd, args[2], raw, { validate: ppValidate, tdd: ppTdd });
          break;
        }
        case 'new-project':
          init.cmdInitNewProject(cwd, raw);
          break;
        case 'new-milestone':
          init.cmdInitNewMilestone(cwd, raw);
          break;
        case 'quick':
          init.cmdInitQuick(cwd, args.slice(2).join(' '), raw);
          break;
        case 'resume':
          init.cmdInitResume(cwd, raw);
          break;
        case 'verify-work':
          init.cmdInitVerifyWork(cwd, args[2], raw);
          break;
        case 'phase-op':
          init.cmdInitPhaseOp(cwd, args[2], raw);
          break;
        case 'todos':
          init.cmdInitTodos(cwd, args[2], raw);
          break;
        case 'milestone-op':
          init.cmdInitMilestoneOp(cwd, raw);
          break;
        case 'map-codebase':
          init.cmdInitMapCodebase(cwd, raw);
          break;
        case 'progress':
          init.cmdInitProgress(cwd, raw);
          break;
        case 'manager':
          init.cmdInitManager(cwd, raw);
          break;
        case 'new-workspace':
          init.cmdInitNewWorkspace(cwd, raw);
          break;
        case 'list-workspaces':
          init.cmdInitListWorkspaces(cwd, raw);
          break;
        case 'remove-workspace':
          init.cmdInitRemoveWorkspace(cwd, args[2], raw);
          break;
        default:
          error(`Unknown init workflow: ${workflow}\nAvailable: execute-phase, plan-phase, new-project, new-milestone, quick, resume, verify-work, phase-op, todos, milestone-op, map-codebase, progress, manager, new-workspace, list-workspaces, remove-workspace`);
      }
      break;
    }

    case 'phase-plan-index': {
      phase.cmdPhasePlanIndex(cwd, args[1], raw);
      break;
    }

    case 'state-snapshot': {
      state.cmdStateSnapshot(cwd, raw);
      break;
    }

    case 'summary-extract': {
      const summaryPath = args[1];
      const fieldsIndex = args.indexOf('--fields');
      const fields = fieldsIndex !== -1 ? args[fieldsIndex + 1].split(',') : null;
      commands.cmdSummaryExtract(cwd, summaryPath, fields, raw);
      break;
    }

    case 'websearch': {
      const query = args[1];
      const limitIdx = args.indexOf('--limit');
      const freshnessIdx = args.indexOf('--freshness');
      await commands.cmdWebsearch(query, {
        limit: limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 10,
        freshness: freshnessIdx !== -1 ? args[freshnessIdx + 1] : null,
      }, raw);
      break;
    }

    // ─── Profiling Pipeline ────────────────────────────────────────────────

    case 'scan-sessions': {
      const pathIdx = args.indexOf('--path');
      const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
      const verboseFlag = args.includes('--verbose');
      const jsonFlag = args.includes('--json');
      await profilePipeline.cmdScanSessions(sessionsPath, { verbose: verboseFlag, json: jsonFlag }, raw);
      break;
    }

    case 'extract-messages': {
      const sessionIdx = args.indexOf('--session');
      const sessionId = sessionIdx !== -1 ? args[sessionIdx + 1] : null;
      const limitIdx = args.indexOf('--limit');
      const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null;
      const pathIdx = args.indexOf('--path');
      const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
      const projectArg = args[1];
      if (!projectArg || projectArg.startsWith('--')) {
        error('Usage: brief-tools extract-messages <project> [--session <id>] [--limit N] [--path <dir>]\nRun scan-sessions first to see available projects.');
      }
      await profilePipeline.cmdExtractMessages(projectArg, { sessionId, limit }, raw, sessionsPath);
      break;
    }

    case 'profile-sample': {
      const pathIdx = args.indexOf('--path');
      const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
      const limitIdx = args.indexOf('--limit');
      const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 150;
      const maxPerIdx = args.indexOf('--max-per-project');
      const maxPerProject = maxPerIdx !== -1 ? parseInt(args[maxPerIdx + 1], 10) : null;
      const maxCharsIdx = args.indexOf('--max-chars');
      const maxChars = maxCharsIdx !== -1 ? parseInt(args[maxCharsIdx + 1], 10) : 500;
      await profilePipeline.cmdProfileSample(sessionsPath, { limit, maxPerProject, maxChars }, raw);
      break;
    }

    // ─── Profile Output ──────────────────────────────────────────────────

    case 'write-profile': {
      const inputIdx = args.indexOf('--input');
      const inputPath = inputIdx !== -1 ? args[inputIdx + 1] : null;
      if (!inputPath) error('--input <analysis-json-path> is required');
      const outputIdx = args.indexOf('--output');
      const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
      profileOutput.cmdWriteProfile(cwd, { input: inputPath, output: outputPath }, raw);
      break;
    }

    case 'profile-questionnaire': {
      const answersIdx = args.indexOf('--answers');
      const answers = answersIdx !== -1 ? args[answersIdx + 1] : null;
      profileOutput.cmdProfileQuestionnaire({ answers }, raw);
      break;
    }

    case 'generate-dev-preferences': {
      const analysisIdx = args.indexOf('--analysis');
      const analysisPath = analysisIdx !== -1 ? args[analysisIdx + 1] : null;
      const outputIdx = args.indexOf('--output');
      const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
      const stackIdx = args.indexOf('--stack');
      const stack = stackIdx !== -1 ? args[stackIdx + 1] : null;
      profileOutput.cmdGenerateDevPreferences(cwd, { analysis: analysisPath, output: outputPath, stack }, raw);
      break;
    }

    case 'generate-claude-profile': {
      const analysisIdx = args.indexOf('--analysis');
      const analysisPath = analysisIdx !== -1 ? args[analysisIdx + 1] : null;
      const outputIdx = args.indexOf('--output');
      const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
      const globalFlag = args.includes('--global');
      profileOutput.cmdGenerateClaudeProfile(cwd, { analysis: analysisPath, output: outputPath, global: globalFlag }, raw);
      break;
    }

    case 'generate-claude-md': {
      const outputIdx = args.indexOf('--output');
      const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
      const autoFlag = args.includes('--auto');
      const forceFlag = args.includes('--force');
      profileOutput.cmdGenerateClaudeMd(cwd, { output: outputPath, auto: autoFlag, force: forceFlag }, raw);
      break;
    }

    case 'workstream': {
      const subcommand = args[1];
      if (subcommand === 'create') {
        const migrateNameIdx = args.indexOf('--migrate-name');
        const noMigrate = args.includes('--no-migrate');
        workstream.cmdWorkstreamCreate(cwd, args[2], {
          migrate: !noMigrate,
          migrateName: migrateNameIdx !== -1 ? args[migrateNameIdx + 1] : null,
        }, raw);
      } else if (subcommand === 'list') {
        workstream.cmdWorkstreamList(cwd, raw);
      } else if (subcommand === 'status') {
        workstream.cmdWorkstreamStatus(cwd, args[2], raw);
      } else if (subcommand === 'complete') {
        workstream.cmdWorkstreamComplete(cwd, args[2], {}, raw);
      } else if (subcommand === 'set') {
        workstream.cmdWorkstreamSet(cwd, args[2], raw);
      } else if (subcommand === 'get') {
        workstream.cmdWorkstreamGet(cwd, raw);
      } else if (subcommand === 'progress') {
        workstream.cmdWorkstreamProgress(cwd, raw);
      } else {
        error('Unknown workstream subcommand. Available: create, list, status, complete, set, get, progress');
      }
      break;
    }

    // ─── Intel ────────────────────────────────────────────────────────────

    case 'intel': {
      const intel = require('./lib/intel.cjs');
      const subcommand = args[1];
      if (subcommand === 'query') {
        const term = args[2];
        if (!term) error('Usage: brief-tools intel query <term>');
        const planningDir = path.join(cwd, '.planning');
        core.output(intel.intelQuery(term, planningDir), raw);
      } else if (subcommand === 'status') {
        const planningDir = path.join(cwd, '.planning');
        const status = intel.intelStatus(planningDir);
        if (!raw && status.files) {
          for (const file of Object.values(status.files)) {
            if (file.updated_at) {
              file.updated_at = core.timeAgo(new Date(file.updated_at));
            }
          }
        }
        core.output(status, raw);
      } else if (subcommand === 'diff') {
        const planningDir = path.join(cwd, '.planning');
        core.output(intel.intelDiff(planningDir), raw);
      } else if (subcommand === 'snapshot') {
        const planningDir = path.join(cwd, '.planning');
        core.output(intel.intelSnapshot(planningDir), raw);
      } else if (subcommand === 'patch-meta') {
        const filePath = args[2];
        if (!filePath) error('Usage: brief-tools intel patch-meta <file-path>');
        core.output(intel.intelPatchMeta(path.resolve(cwd, filePath)), raw);
      } else if (subcommand === 'validate') {
        const planningDir = path.join(cwd, '.planning');
        core.output(intel.intelValidate(planningDir), raw);
      } else if (subcommand === 'extract-exports') {
        const filePath = args[2];
        if (!filePath) error('Usage: brief-tools intel extract-exports <file-path>');
        core.output(intel.intelExtractExports(path.resolve(cwd, filePath)), raw);
      } else if (subcommand === 'update') {
        const planningDir = path.join(cwd, '.planning');
        core.output(intel.intelUpdate(planningDir), raw);
      } else {
        error('Unknown intel subcommand. Available: query, status, update, diff, snapshot, patch-meta, validate, extract-exports');
      }
      break;
    }

    // ─── Graphify ──────────────────────────────────────────────────────────

    case 'graphify': {
      const graphify = require('./lib/graphify.cjs');
      const subcommand = args[1];
      if (subcommand === 'query') {
        const term = args[2];
        if (!term) error('Usage: brief-tools graphify query <term>');
        const budgetIdx = args.indexOf('--budget');
        const budget = budgetIdx !== -1 ? parseInt(args[budgetIdx + 1], 10) : null;
        core.output(graphify.graphifyQuery(cwd, term, { budget }), raw);
      } else if (subcommand === 'status') {
        core.output(graphify.graphifyStatus(cwd), raw);
      } else if (subcommand === 'diff') {
        core.output(graphify.graphifyDiff(cwd), raw);
      } else if (subcommand === 'build') {
        if (args[2] === 'snapshot') {
          core.output(graphify.writeSnapshot(cwd), raw);
        } else {
          core.output(graphify.graphifyBuild(cwd), raw);
        }
      } else {
        error('Unknown graphify subcommand. Available: build, query, status, diff');
      }
      break;
    }

    // ─── Documentation ────────────────────────────────────────────────────

    case 'docs-init': {
      docs.cmdDocsInit(cwd, raw);
      break;
    }

    // ─── Learnings ─────────────────────────────────────────────────────────

    case 'learnings': {
      const subcommand = args[1];
      if (subcommand === 'list') {
        learnings.cmdLearningsList(raw);
      } else if (subcommand === 'query') {
        const tagIdx = args.indexOf('--tag');
        const tag = tagIdx !== -1 ? args[tagIdx + 1] : null;
        if (!tag) error('Usage: brief-tools learnings query --tag <tag>');
        learnings.cmdLearningsQuery(tag, raw);
      } else if (subcommand === 'copy') {
        learnings.cmdLearningsCopy(cwd, raw);
      } else if (subcommand === 'prune') {
        const olderIdx = args.indexOf('--older-than');
        const olderThan = olderIdx !== -1 ? args[olderIdx + 1] : null;
        if (!olderThan) error('Usage: brief-tools learnings prune --older-than <duration>');
        learnings.cmdLearningsPrune(olderThan, raw);
      } else if (subcommand === 'delete') {
        const id = args[2];
        if (!id) error('Usage: brief-tools learnings delete <id>');
        learnings.cmdLearningsDelete(id, raw);
      } else {
        error('Unknown learnings subcommand. Available: list, query, copy, prune, delete');
      }
      break;
    }

    // ─── detect-custom-files ───────────────────────────────────────────────
    // Detect user-added files inside GSD-managed directories that are not
    // tracked in gsd-file-manifest.json. Used by the update workflow to back
    // up custom files before the installer wipes those directories.
    //
    // This replaces the fragile bash pattern:
    //   MANIFEST_FILES=$(node -e "require('$RUNTIME_DIR/...')" 2>/dev/null)
    //   ${filepath#$RUNTIME_DIR/}   # unreliable path stripping
    // which silently returns CUSTOM_COUNT=0 when $RUNTIME_DIR is unset or
    // when the stripped path does not match the manifest key format (#1997).

    case 'detect-custom-files': {
      const configDirIdx = args.indexOf('--config-dir');
      const configDir = configDirIdx !== -1 ? args[configDirIdx + 1] : null;
      if (!configDir) {
        error('Usage: brief-tools detect-custom-files --config-dir <path>');
      }
      const resolvedConfigDir = path.resolve(configDir);
      if (!fs.existsSync(resolvedConfigDir)) {
        error(`Config directory not found: ${resolvedConfigDir}`);
      }

      const manifestPath = path.join(resolvedConfigDir, 'gsd-file-manifest.json');
      if (!fs.existsSync(manifestPath)) {
        // No manifest — cannot determine what is custom. Return empty list
        // (same behaviour as saveLocalPatches in install.js when no manifest).
        const out = { custom_files: [], custom_count: 0, manifest_found: false };
        process.stdout.write(JSON.stringify(out, null, 2));
        break;
      }

      let manifest;
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch {
        const out = { custom_files: [], custom_count: 0, manifest_found: false, error: 'manifest parse error' };
        process.stdout.write(JSON.stringify(out, null, 2));
        break;
      }

      const manifestKeys = new Set(Object.keys(manifest.files || {}));

      // GSD-managed directories to scan for user-added files.
      // These are the directories the installer wipes on update.
      const GSD_MANAGED_DIRS = [
        'brief',
        'agents',
        path.join('commands', 'gsd'),
        'hooks',
        // OpenCode/Kilo flat command dir
        'command',
        // Codex/Copilot skills dir
        'skills',
      ];

      function walkDir(dir, baseDir) {
        const results = [];
        if (!fs.existsSync(dir)) return results;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results.push(...walkDir(fullPath, baseDir));
          } else {
            // Use forward slashes for cross-platform manifest key compatibility
            const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            results.push(relPath);
          }
        }
        return results;
      }

      const customFiles = [];
      for (const managedDir of GSD_MANAGED_DIRS) {
        const absDir = path.join(resolvedConfigDir, managedDir);
        if (!fs.existsSync(absDir)) continue;
        for (const relPath of walkDir(absDir, resolvedConfigDir)) {
          if (!manifestKeys.has(relPath)) {
            customFiles.push(relPath);
          }
        }
      }

      const out = {
        custom_files: customFiles,
        custom_count: customFiles.length,
        manifest_found: true,
        manifest_version: manifest.version || null,
      };
      process.stdout.write(JSON.stringify(out, null, 2));
      break;
    }

    // ─── GSD-2 Reverse Migration ───────────────────────────────────────────

    case 'from-gsd2': {
      const gsd2Import = require('./lib/gsd2-import.cjs');
      gsd2Import.cmdFromGsd2(args.slice(1), cwd, raw);
      break;
    }

    default:
      error(`Unknown command: ${command}`);
  }
}

main();
