/**
 * Status — Read-only compact-dashboard renderer for /brief-status (FND-10).
 *
 * D-15 output format (USER-LOCKED):
 *   BRIEF Status
 *   ================================
 *     Phase           2 of 9 (Stable Seam)
 *     Workstream      — (none active)
 *     Return stack    0 / 3
 *     Last ALIGN      — (none yet)
 *     Last COMPLIANCE — (none yet)
 *   --------------------------------
 *     Next: <stopped_at>
 *
 * D-17 resilience: never throws on missing STATE.md or ROADMAP.md.
 * D-18 read-only: must not mutate any on-disk state; no write-path APIs invoked.
 * D-19 output stream: plain text to stdout via core.output (raw=true path).
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
  return `${decision} (${findings} findings)`;
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
  const returnStackDepth = Array.isArray(brief.return_stack) ? brief.return_stack.length : 0;
  const alignLine = formatGate(brief.last_gate_results && brief.last_gate_results.align);
  const complianceLine = formatGate(brief.last_gate_results && brief.last_gate_results.compliance);
  const nextHint = stateFm.stopped_at ? String(stateFm.stopped_at) : '(unknown)';

  const lines = [
    'BRIEF Status',
    '='.repeat(32),
    phaseLine,
    `  Workstream      ${workstream}`,
    `  Return stack    ${returnStackDepth} / 3`,
    `  Last ALIGN      ${alignLine}`,
    `  Last COMPLIANCE ${complianceLine}`,
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
