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
const { loadWorkstreams } = require('./workstream-loader.cjs');

// Phase 7 D-07 soft-recommended workstream order. Drives /brief-status
// "Recommended next" line: first workstream in this order whose slug is
// NOT in state.brief.workstreams_completed AND whose depends_on entries
// are all completed wins. Forward-references in depends_on (workstreams
// that haven't been added yet) are skipped gracefully (treated as unsatisfied).
const PHASE_7_SOFT_ORDER = [
  'business-model-canvas',
  'go-to-market',
  'brand',
  'operations',
  'financial',
  'risk',
  'roadmap',
  'tech-arch',
  'compliance',
];

/**
 * computeRecommendedNext — derive the next workstream to suggest at /brief-status
 * render time. Pure read-only derivation per D-07 + D-08:
 *   - reads spec.yaml depends_on via loadWorkstreams(cwd)
 *   - reads state.brief.workstreams_completed (Phase 7 D-21 allowlist extension)
 *   - returns the first slug in PHASE_7_SOFT_ORDER that is NOT completed AND
 *     whose depends_on are all completed; falls back to '—' sentinel.
 *
 * NEVER stored in state — derived every render to keep state slim and to
 * avoid drift when the user runs workstreams out of order.
 */
function computeRecommendedNext(cwd, briefState) {
  try {
    const ws = loadWorkstreams(cwd);
    const completed = new Set(
      Array.isArray(briefState && briefState.workstreams_completed)
        ? briefState.workstreams_completed
        : []
    );
    // Order the loaded workstreams by D-07 soft-order, then append any
    // user-added workstreams (via /brief-add-workstream) that aren't in the
    // canonical 9 — they sort to the end.
    const orderedWs = PHASE_7_SOFT_ORDER
      .map(slug => ws.find(w => (w.slug || w.name) === slug))
      .filter(Boolean)
      .concat(
        ws.filter(w => !PHASE_7_SOFT_ORDER.includes(w.slug || w.name))
      );
    for (const s of orderedWs) {
      const slug = s.slug || s.name;
      if (slug === '_example') continue; // _example is a fixture, not a recommendation
      if (completed.has(slug)) continue;
      const depsOk = (s.depends_on || []).every(d => completed.has(d));
      if (depsOk) return slug;
    }
    return '—';
  } catch {
    // D-17 resilience: never throw on render path.
    return '—';
  }
}

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
  if (!override) return `${decision} (${findings} findings)`;

  // Phase 8 Plan 08-08 Task 3 — Type B force-accept visibility extension
  // (Pitfall #1 mitigation). Display override_count + truncated override_reason
  // alongside the override flag so the operator sees how often the force-accept
  // path has been exercised + the most recent justification. The fields are
  // populated by audience.commitAudienceVerdict (Phase 4 D-07 substrate) +
  // export.cjs Step 2/3 force-accept paths.
  //
  // Field expectations from STATE.md state.brief.last_gate_results.<gate>:
  //   override         — boolean true (Pitfall #5: may be string 'true')
  //   override_count   — integer (Phase 8 — Plan 04 increments per export run-id)
  //                       Falls back to 1 when absent so single-override cases
  //                       still surface a meaningful count.
  //   override_reason  — sanitized free-text from the user (Plan 04 +
  //                       security.cjs sanitizeForPrompt). Truncated to ~80
  //                       chars in the display surface.
  const overrideCount = (typeof gate.override_count === 'number' && gate.override_count > 0)
    ? gate.override_count
    : 1;
  const rawReason = (typeof gate.override_reason === 'string') ? gate.override_reason : '';
  const truncatedReason = rawReason.length > 80
    ? rawReason.slice(0, 80) + '…'
    : rawReason;
  if (!truncatedReason) {
    return `${decision} (${findings} findings) (override applied; total overrides: ${overrideCount})`;
  }
  return `${decision} (${findings} findings) (override applied; total overrides: ${overrideCount}; latest reason: "${truncatedReason}")`;
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

  // Phase 7 D-07 — Recommended next workstream derivation. Read-only at render
  // time; never stored. See computeRecommendedNext above for derivation rules.
  const recommendedNext = computeRecommendedNext(cwd, brief);

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
    `  Recommended next ${recommendedNext}`,
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

module.exports = { renderStatus, computeRecommendedNext };
