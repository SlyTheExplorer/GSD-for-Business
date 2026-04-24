/**
 * Gap-Detect Report — {artifact}.gaps.md content rendering (Plan 06-02,
 * paired-sibling scheme D-04). Mirrors audience-report.cjs + align-report.cjs.
 *
 * Duplicate-renamed from audience-report.cjs (Phase 5). Extracted from
 * gap-detect.cjs to keep gap-detect.cjs under the 400-line discipline
 * (Phase 2 D-18). renderGapDetectReport produces the full markdown document
 * (frontmatter + body) that commitGapDetectVerdict writes atomically to
 * `{artifact-dir}/{artifact-basename}.gaps.md` via _siblingReportPath (Plan 03
 * reuses the helper exported by audience.cjs).
 *
 * D-04 frontmatter shape (Phase 6 specific):
 *   phase: 06-gaps
 *   artifact: <path>
 *   severity_counts: { blocking, material, nice_to_have }
 *   detected_at: <iso>
 *   topic_fingerprints: [fp1, fp2, ...]
 *
 * Body schema (Claude's Discretion): grouped by severity H3 + each finding as
 * **text** / **location** / **evidence** bullets. Korean headers when
 * opts.korea === true (D-11 language rule inherited from Phase 4).
 *
 * Zero external runtime deps (A1). Caller ensures verdict is validated.
 */
const { reconstructFrontmatter } = require('./frontmatter.cjs');

function _countBySeverity(findings) {
  const counts = { blocking: 0, material: 0, nice_to_have: 0 };
  for (const f of findings || []) {
    if (f.severity === 'blocking') counts.blocking += 1;
    else if (f.severity === 'material') counts.material += 1;
    else if (f.severity === 'nice-to-have') counts.nice_to_have += 1;
  }
  return counts;
}

function _uniqueFingerprints(findings) {
  const seen = new Set();
  const out = [];
  for (const f of findings || []) {
    if (f.topic_fingerprint && !seen.has(f.topic_fingerprint)) {
      seen.add(f.topic_fingerprint);
      out.push(f.topic_fingerprint);
    }
  }
  return out;
}

function renderGapDetectReport(verdict, opts) {
  const korea = !!(opts && opts.korea);
  const artifact = (opts && opts.artifact) || '';
  const now = new Date().toISOString();
  const findings = Array.isArray(verdict.findings) ? verdict.findings : [];
  const counts = _countBySeverity(findings);
  const fps = _uniqueFingerprints(findings);

  const fm = {
    phase: '06-gaps',
    artifact,
    severity_counts: counts,
    detected_at: now,
    topic_fingerprints: fps,
    decision: verdict.decision,
  };
  const fmYaml = reconstructFrontmatter(fm);

  const headBlocking = korea ? '### BLOCKING (되돌아가기 필요)' : '### BLOCKING (return-to-discover required)';
  const headMaterial = korea ? '### MATERIAL (기록 후 진행)' : '### MATERIAL (documented; proceed)';
  const headNice = korea ? '### NICE-TO-HAVE (v2 이월)' : '### NICE-TO-HAVE (deferred to v2)';
  const rationaleHeader = korea ? '## Rationale / 이유' : '## Rationale';

  const renderGroup = (sev, header) => {
    const items = findings.filter((f) => f.severity === sev);
    if (items.length === 0) return [];
    const lines = [header, ''];
    for (const f of items) {
      const fp = f.topic_fingerprint ? `\`${f.topic_fingerprint}\`` : '';
      lines.push(`- ${fp}`);
      lines.push(`  - **text:** ${f.description || ''}`);
      lines.push(`  - **location:** \`${f.location || ''}\``);
      if (f.evidence) lines.push(`  - **evidence:** ${f.evidence}`);
    }
    lines.push('');
    return lines;
  };

  const parts = [];
  parts.push(...renderGroup('blocking', headBlocking));
  parts.push(...renderGroup('material', headMaterial));
  parts.push(...renderGroup('nice-to-have', headNice));

  if (parts.length === 0) {
    parts.push(korea ? '_(발견사항 없음)_' : '_(no findings)_');
    parts.push('');
  }

  parts.push(rationaleHeader, '', verdict.rationale || '', '');

  return `---\n${fmYaml}\n---\n\n${parts.join('\n')}`;
}

module.exports = { renderGapDetectReport };
