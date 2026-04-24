/**
 * Status — Read-only compact-dashboard renderer for /brief-status (FND-10).
 *
 * D-15 output format (USER-LOCKED, extended by Phase 6 Plan 05 — DSG-14 SC #3):
 *   BRIEF Status
 *   ================================
 *     Phase           2 of 9 (Stable Seam)
 *     Workstream      — (none active)
 *     Return stack    0 / 3
 *     Last ALIGN      — (none yet)
 *     Last AUDIENCE   — (none yet)
 *     Last COMPLIANCE — (none yet)
 *     Gap loop        — | <top-frame triggering_topic>          (Phase 6 Plan 05)
 *     Round-trips     — | <ws>: <count>, <ws2>: <count2>, ...   (Phase 6 Plan 05)
 *   --------------------------------
 *     Next: <stopped_at>
 *
 * D-17 resilience: never throws on missing STATE.md or ROADMAP.md.
 * D-18 read-only: must not mutate any on-disk state; no write-path APIs invoked.
 * D-19 output stream: plain text to stdout via core.output (raw=true path).
 *
 * Phase 6 Plan 05 — D-06 derive-at-read-time discipline: Round-trips count is
 * NEVER stored in any explicit counter field on state.brief.* (anti-pattern,
 * drift risk). Counts are derived at render time from the append-only
 * return_stack_history log. The grep-audit in
 * tests/brief-return-stack-derived-count.test.cjs structurally enforces this
 * across state.cjs, gap-detect.cjs, and this file.
 */

const fs = require('fs');
const path = require('path');
const { planningPaths, output } = require('./core.cjs');
const { extractFrontmatter } = require('./frontmatter.cjs');

function formatGate(gate) {
  if (!gate || typeof gate !== 'object') return '— (none yet)';
  const decision = gate.decision || '—';
  const findings = (gate.findings_count !== undefined && gate.findings_count !== null)
    ? gate.findings_count
    : 0;
  // Phase 4 D-07 + Specific Ideas: ALIGNED-by-override must NEVER collapse
  // into plain ALIGNED display. D-20 serializer may round-trip boolean true
  // as string 'true' (Pitfall #5) — treat both as equivalent here.
  const override = gate.override === true || gate.override === 'true';
  const suffix = override ? ' (override applied)' : '';
  return `${decision} (${findings} findings)${suffix}`;
}

/**
 * Parse ROADMAP.md via direct regex read (Plan 06 W2 deferral — cmdRoadmapAnalyze
 * is print-coupled and cannot be composed from a read-only caller).
 *
 * Returns { phase_count, phase_name_short } with graceful fallback to '—' / '' when
 * ROADMAP.md is missing or unparsable.
 */
function getPhaseInfo(cwd, currentPhase) {
  try {
    const roadmapPath = planningPaths(cwd).roadmap;
    if (!fs.existsSync(roadmapPath)) return { phase_count: '—', phase_name_short: '' };
    const content = fs.readFileSync(roadmapPath, 'utf-8');
    const headers = content.match(/^#{2,4}\s*Phase\s+\d+[A-Z]?(?:\.\d+)*\s*:/gim) || [];
    const phaseCount = headers.length || '—';

    let phaseName = '';
    const phaseNumStr = String(currentPhase || '').replace(/[^0-9.A-Za-z]/g, '');
    if (phaseNumStr) {
      // Strip leading zeros for the regex lookup (`02` → `2`) since ROADMAP headers use `Phase 2:` not `Phase 02:`.
      const strippedZero = phaseNumStr.replace(/^0+(?=\d)/, '');
      const re = new RegExp(`^#{2,4}\\s*Phase\\s+${strippedZero}\\s*:\\s*(.+)$`, 'm');
      const m = content.match(re);
      if (m) {
        // Short name = first 3 words before ` — ` or end of line.
        const full = m[1].trim().split(/\s+—\s+/)[0].trim();
        phaseName = full.split(/\s+/).slice(0, 3).join(' ');
      }
    }
    return { phase_count: phaseCount, phase_name_short: phaseName };
  } catch {
    return { phase_count: '—', phase_name_short: '' };
  }
}

function renderStatus(cwd, raw) {
  const statePath = planningPaths(cwd).state;

  let stateFm = {};
  let stateMissing = false;
  let briefMissing = false;

  if (!fs.existsSync(statePath)) {
    stateMissing = true;
    briefMissing = true;
  } else {
    try {
      stateFm = extractFrontmatter(fs.readFileSync(statePath, 'utf-8')) || {};
    } catch {
      stateFm = {};
    }
    briefMissing = !stateFm.brief || typeof stateFm.brief !== 'object';
  }

  const brief = (stateFm && stateFm.brief && typeof stateFm.brief === 'object') ? stateFm.brief : {};
  const currentPhase = stateFm.current_phase ? String(stateFm.current_phase) : '—';

  const { phase_count, phase_name_short } = getPhaseInfo(cwd, currentPhase);

  const phaseLine = `  Phase           ${currentPhase} of ${phase_count}${phase_name_short ? ' (' + phase_name_short + ')' : ''}`;
  const workstream = brief.current_workstream ? String(brief.current_workstream) : '— (none active)';
  const returnStack = Array.isArray(brief.return_stack) ? brief.return_stack : [];
  const returnStackDepth = returnStack.length;
  const alignLine = formatGate(brief.last_gate_results && brief.last_gate_results.align);
  const audienceLine = formatGate(brief.last_gate_results && brief.last_gate_results.audience);
  const complianceLine = formatGate(brief.last_gate_results && brief.last_gate_results.compliance);
  const nextHint = stateFm.stopped_at ? String(stateFm.stopped_at) : '(unknown)';

  // Phase 6 Plan 05 (DSG-14 SC #3) — Gap loop + Round-trips derivation.
  // D-06 discipline: NEVER read a stored counter field; always derive
  // counts from append-only return_stack_history at render time.
  const history = Array.isArray(brief.return_stack_history) ? brief.return_stack_history : [];
  const topFrame = returnStack.length > 0 ? returnStack[returnStack.length - 1] : null;
  const activeTopic = (topFrame && typeof topFrame.triggering_topic === 'string' && topFrame.triggering_topic.length > 0)
    ? topFrame.triggering_topic
    : '—';

  // Group history by paused_workstream — defensive null-checks (T-06-05-01).
  // STATE.md may be hand-edited or partially corrupted; entries that fail the
  // shape check are silently filtered rather than thrown on (D-17 resilience).
  const byWs = new Map();
  for (const f of history) {
    if (!f || typeof f !== 'object') continue;
    if (typeof f.paused_workstream !== 'string' || f.paused_workstream.length === 0) continue;
    byWs.set(f.paused_workstream, (byWs.get(f.paused_workstream) || 0) + 1);
  }
  const roundTripLine = byWs.size === 0
    ? '—'
    : Array.from(byWs.entries()).map(([ws, count]) => `${ws}: ${count}`).join(', ');

  const lines = [
    'BRIEF Status',
    '='.repeat(32),
    phaseLine,
    `  Workstream      ${workstream}`,
    `  Return stack    ${returnStackDepth} / 3`,
    `  Last ALIGN      ${alignLine}`,
    `  Last AUDIENCE   ${audienceLine}`,
    `  Last COMPLIANCE ${complianceLine}`,
    `  Gap loop        ${activeTopic}`,
    `  Round-trips     ${roundTripLine}`,
    '-'.repeat(32),
    `  Next: ${nextHint}`,
  ];

  // D-17 resilience warning: only when brief: map is missing entirely.
  if (briefMissing) {
    lines.push('');
    lines.push('⚠ state.brief.* not initialized — run /brief-init or check STATE.md');
  }

  const rendered = lines.join('\n');
  // D-19: plain text to stdout. raw=true → rendered string; raw=false → JSON wrapper.
  output({ rendered }, raw, rendered);
  return rendered;
}

module.exports = { renderStatus };
