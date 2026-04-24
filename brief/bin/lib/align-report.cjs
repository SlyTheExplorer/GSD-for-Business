/**
 * Align Report — OBJECTIVES.align.md content rendering (Plan 04-04 /
 * D-12 migrated Plan 05-05).
 *
 * Extracted from align.cjs to keep align.cjs under the 400-line discipline
 * (Phase 2 D-18). renderAlignReport produces the full markdown document
 * (frontmatter + body) that commitAlignVerdict writes atomically.
 *
 * D-07 override schema: override=true → decision forced to 'ALIGNED' + override
 * flag + sanitized override_reason in frontmatter + ## User Override section.
 * D-11 language rule: korea=true → Korean body with bilingual headers; else
 * English body with English-only headers.
 *
 * Zero external runtime deps (A1). Caller sanitizes overrideReason upstream.
 */
const { reconstructFrontmatter } = require('./frontmatter.cjs');

function renderAlignReport(verdict, opts) {
  const korea = !!(opts && opts.korea);
  const override = !!(opts && opts.override);
  const overrideReason = (opts && opts.overrideReason) || '';
  const now = new Date().toISOString();
  const fm = {
    decision: override ? 'ALIGNED' : verdict.decision,
    severity: verdict.severity,
    findings_count: verdict.findings_count,
    at: now,
    ...(override ? { override: true, override_reason: overrideReason } : {}),
  };
  const fmYaml = reconstructFrontmatter(fm);
  const findingsHeader = korea ? '## Findings / 발견사항' : '## Findings';
  const rationaleHeader = korea ? '## Rationale / 이유' : '## Rationale';
  const overrideHeader = korea ? '## User Override / 사용자 승인' : '## User Override';
  const findingsList = verdict.findings
    .map((f) => `- **[${f.severity}]** \`${f.location}\` — ${f.description}`)
    .join('\n');
  const parts = [
    findingsHeader,
    '',
    verdict.findings.length > 0
      ? findingsList
      : korea ? '_(추가 발견사항 없음)_' : '_(no additional findings)_',
    '',
    rationaleHeader,
    '',
    verdict.rationale,
    '',
  ];
  if (override) {
    parts.push(
      overrideHeader,
      '',
      `Reason: ${overrideReason}`,
      '',
      korea
        ? "_(이 승인은 /brief-status 에 'override applied'로 계속 표시됩니다.)_"
        : "_(This override will continue to surface in /brief-status as 'override applied'.)_",
      '',
    );
  }
  return `---\n${fmYaml}\n---\n\n${parts.join('\n')}`;
}

module.exports = { renderAlignReport };
