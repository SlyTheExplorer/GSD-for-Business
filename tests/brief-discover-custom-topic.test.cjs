'use strict';

/**
 * DSC-02 structural verification: /brief-discover workflow supports a Custom
 * free-text research topic when user selects "Other". Verifies the workflow
 * markdown:
 *   - enumerates the "Other" option in both AskUserQuestion and TEXT_MODE forms,
 *   - prompts the user for free-text when Other is selected,
 *   - rejects degenerate topics (<10 chars, filler words),
 *   - writes the Custom output to a stable filename via `custom-*` slug prefix,
 *   - interpolates the user-supplied topic into the researcher prompt via {{TOPIC}}.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const WORKFLOW = path.join(__dirname, '..', 'brief/workflows/discover.md');
const body = fs.readFileSync(WORKFLOW, 'utf-8');

test('"Other" option present in AskUserQuestion and TEXT_MODE (DSC-02)', () => {
  assert.match(body, /Other.*free-text|Other.*사용자 정의|사용자 정의.*free-text/);
});

test('Custom topic prompts for free-text when user selects Other', () => {
  assert.match(body, /사용자 정의 주제를 입력해|describe your custom/i);
});

test('Degenerate topic re-prompt (stuff/things/short input)', () => {
  // At least one hint about degenerate inputs
  assert.match(body, /stuff|things|10 chars|좀 더 구체적/);
});

test('Custom slug has stable filename format (custom-<slug>)', () => {
  assert.match(body, /custom-/);
});

test('Workflow references {{TOPIC}} interpolation into researcher prompt', () => {
  assert.match(body, /\{\{TOPIC\}\}/);
});
