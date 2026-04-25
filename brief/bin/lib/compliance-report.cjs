/**
 * Compliance Report — {artifact}.compliance.md content rendering (Plan 07-01).
 * Duplicate-renamed from audience-report.cjs. Phase 7 D-03 LOAD-BEARING:
 * always renders mandatory CEO-personal-liability disclaimer footer (verbatim
 * from brief/references/compliance/korea/pipa-2026.md) regardless of decision.
 * Findings group by severity into 3 sections; CC-01 clause-level extension
 * fields (regulation_clause / required_evidence / found_in_artifact / gap)
 * render as indented sub-bullets when present. Zero runtime deps (A1).
 */
const { reconstructFrontmatter } = require('./frontmatter.cjs');

function _renderFinding(f, korea) {
  const out = [`- **[${f.severity}]** \`${f.location}\` — ${f.description}`];
  const lbl = (ko, en) => korea ? ko : en;
  if (f.regulation_clause) out.push(`  - ${lbl('규정 조항', 'Regulation clause')}: ${f.regulation_clause}`);
  if (f.required_evidence) out.push(`  - ${lbl('필요 증거', 'Required evidence')}: ${f.required_evidence}`);
  if (f.found_in_artifact) out.push(`  - ${lbl('artifact 내 위치', 'Found in artifact')}: ${f.found_in_artifact}`);
  if (f.gap) out.push(`  - ${lbl('공백', 'Gap')}: ${f.gap}`);
  return out.join('\n');
}

function _disclaimerFooter(korea) {
  return korea
    ? '> 본 분석은 법적 자문이 아닙니다. Findings는 자격 있는 한국 법률 자문가와 검토하기 위한 출발점입니다.\n> \n> 2026년 개정 개인정보 보호법(PIPA, 2026-09-11 시행)에 따라, 위반 시 대표이사 개인 책임이 발생할 수 있으며 과징금 상한은 총매출의 10%입니다. 본 findings는 자격 있는 한국 법률 자문가와 검토하기 위한 출발점이며, 법적 자문을 대체하지 않습니다.'
    : '> Not legal advice. Refer to qualified Korean counsel before acting on findings.\n> \n> Under 2026 PIPA amendments (effective 2026-09-11), breaches may result in personal liability for the CEO and administrative fines up to 10% of total turnover. Findings here are starting points for review with qualified Korean counsel — they are not legal advice.';
}

function renderComplianceReport(verdict, opts) {
  const korea = !!(opts && opts.korea);
  const override = !!(opts && opts.override);
  const overrideReason = (opts && opts.overrideReason) || '';
  const packs = Array.isArray(opts && opts.packs) ? opts.packs : [];
  const fm = {
    decision: override ? 'COMPLIANCE-OK' : verdict.decision,
    severity: verdict.severity,
    findings_count: verdict.findings_count,
    at: new Date().toISOString(),
    ...(packs.length > 0 ? { packs } : {}),
    ...(override ? { override: true, override_reason: overrideReason } : {}),
  };
  const lbl = (ko, en) => korea ? ko : en;
  const docHdr = lbl('## 문서화된 의무 사항 중 반영된 것', '## Documented obligations addressed');
  const workHdr = lbl('## 추가 작업이 필요한 의무 사항', '## Obligations needing further work');
  const verifyHdr = lbl('## BRIEF로 확인할 수 없는 의무 사항 (자격 있는 한국 변호사 검토 필요)', '## Obligations BRIEF cannot verify (requires qualified Korean counsel)');
  const rationaleHdr = lbl('## Rationale / 이유', '## Rationale');
  const disclaimerHdr = lbl('## 법적 자문 안내 (Mandatory disclaimer)', '## Mandatory disclaimer');
  const docF = verdict.findings.filter((f) => f.severity === 'nice-to-have');
  const workF = verdict.findings.filter((f) => f.severity === 'material');
  const verifyF = verdict.findings.filter((f) => f.severity === 'blocking');
  const renderGroup = (group, emptyMsg) => group.length > 0 ? group.map((f) => _renderFinding(f, korea)).join('\n') : emptyMsg;
  const parts = [
    docHdr, '', renderGroup(docF, lbl('_(반영된 의무 사항 없음)_', '_(no documented obligations addressed)_')), '',
    workHdr, '', renderGroup(workF, lbl('_(추가 작업 필요 항목 없음)_', '_(no obligations needing further work)_')), '',
    verifyHdr, '', renderGroup(verifyF, lbl('_(BRIEF가 확인할 수 없는 항목 없음)_', '_(no items requiring counsel verification)_')), '',
    rationaleHdr, '', verdict.rationale, '',
  ];
  if (override) {
    parts.push(
      lbl('## User Override / 사용자 승인', '## User Override'), '',
      `Reason: ${overrideReason}`, '',
      lbl("_(이 승인은 /brief-status 에 'override applied'로 계속 표시됩니다.)_", "_(This override will continue to surface in /brief-status as 'override applied'.)_"), '',
    );
  }
  parts.push(disclaimerHdr, '', _disclaimerFooter(korea), '');
  return `---\n${reconstructFrontmatter(fm)}\n---\n\n${parts.join('\n')}`;
}

module.exports = { renderComplianceReport };
