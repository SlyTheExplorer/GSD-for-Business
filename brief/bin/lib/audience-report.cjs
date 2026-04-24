/**
 * Audience Report — {artifact}.audience.md content rendering (Plan 05-04,
 * paired-sibling activated Plan 05-05 D-11).
 *
 * Duplicate-renamed from align-report.cjs (Phase 4). Extracted from audience.cjs
 * to keep audience.cjs under the 400-line discipline (Phase 2 D-18).
 * renderAudienceReport produces the full markdown document (frontmatter + body)
 * that commitAudienceVerdict writes atomically to the paired-sibling path
 * `{artifact-dir}/{artifact-basename}.audience.md` via _siblingReportPath.
 *
 * D-07 override schema (inherited from Phase 4): override=true → decision forced
 * to 'AUDIENCE-OK' + override flag + sanitized override_reason in frontmatter
 * + ## User Override section.
 * D-11 language rule: korea=true → Korean body with bilingual headers; else
 * English body with English-only headers.
 *
 * Zero external runtime deps (A1). Caller sanitizes overrideReason upstream.
 */
const { reconstructFrontmatter } = require('./frontmatter.cjs');

function renderAudienceReport(verdict, opts) {
  const korea = !!(opts && opts.korea);
  const override = !!(opts && opts.override);
  const overrideReason = (opts && opts.overrideReason) || '';
  const now = new Date().toISOString();
  const fm = {
    decision: override ? 'AUDIENCE-OK' : verdict.decision,
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

module.exports = { renderAudienceReport };
