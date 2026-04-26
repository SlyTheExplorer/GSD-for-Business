#!/bin/bash
# brief-hook-version: {{BRIEF_VERSION}}
# brief-validate-frontmatter.sh — PreToolUse hook: enforce mandatory frontmatter fields
# Blocks `git commit` commands when staged .planning/**/*.md files miss any of:
#   audience.type, audience.confidentiality, voice.tone, voice.perspective, business_context.model
#
# OPT-IN: no-op unless config.json has hooks.community: true.
# Mirrors hooks/brief-validate-provenance.sh shape + opt-in config gate.
# Layer 4 of 4-layer audience defense (CC-03; Phase 5 D-06 byte-identity inheritance).
#
# Validator implementation: inline 30-line node-eval CJS — preserves A1 zero-runtime-deps
# (no gray-matter / ajv dependency). Handles BOTH nested form (`audience:\n  type: x`) AND
# flat-dotted form (`audience.type: x`).

# Check opt-in config — exit silently if not enabled
if [ -f .planning/config.json ]; then
  ENABLED=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.hooks?.community===true?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)
  if [ "$ENABLED" != "1" ]; then exit 0; fi
else
  exit 0
fi

INPUT=$(cat)

# Extract command from JSON using Node (handles escaping correctly, no jq needed)
CMD=$(echo "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{process.stdout.write(JSON.parse(d).tool_input?.command||'')}catch{}})" 2>/dev/null)

# Only run frontmatter validation for `git commit` commands
if ! [[ "$CMD" =~ ^git[[:space:]]+commit ]]; then
  exit 0
fi

# Enumerate staged files (additions + modifications only)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=AM 2>/dev/null || true)
if [ -z "$STAGED_FILES" ]; then exit 0; fi

VIOLATIONS=""
for F in $STAGED_FILES; do
  # Only validate .planning/**/*.md files — non-.md files (config.json, *.json) are skipped
  [[ ! "$F" =~ ^\.planning/.*\.md$ ]] && continue
  [[ ! -f "$F" ]] && continue

  # Source-validate: reject paths with shell metacharacters as a defense-in-depth measure
  # (already constrained by `^.planning/.*.md$` regex above, but be explicit).
  case "$F" in
    *[\;\&\|\$\`\\\"\']*) continue ;;
  esac

  # Inline node-eval validator: 5 mandatory frontmatter fields. Handles BOTH
  # nested form (`audience:\n  type: x`) AND flat-dotted form (`audience.type: x`).
  # Outputs one of: "OK" | "NO_FRONTMATTER" | "MISSING:<comma-list>".
  #
  # Uses single-quoted bash arg so backslash escapes (\s, \S, \r) reach node literally.
  # File path passed via F_PATH env var to avoid shell-injection-prone interpolation.
  RESULT=$(F_PATH="$F" node -e '
    const fs = require("fs");
    const content = fs.readFileSync(process.env.F_PATH, "utf-8");
    const m = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
    if (!m) { process.stdout.write("NO_FRONTMATTER"); process.exit(0); }
    const yaml = m[1];
    const required = ["audience.type", "audience.confidentiality", "voice.tone", "voice.perspective", "business_context.model"];
    const missing = [];
    for (const fpath of required) {
      const parts = fpath.split(".");
      const topKey = parts[0];
      const subKey = parts[1];
      const lines = yaml.split(/\r?\n/);
      let found = false;
      for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        // Nested form: "audience:" line, then indented "  type: x" below
        if (new RegExp("^" + topKey + ":\\s*$").test(ln)) {
          for (let j = i + 1; j < lines.length; j++) {
            const subLn = lines[j];
            if (/^[a-zA-Z]/.test(subLn)) break;
            if (new RegExp("^\\s+" + subKey + ":\\s*\\S+").test(subLn)) {
              found = true; break;
            }
          }
        }
        // Flat-dotted form: "audience.type: x"
        if (new RegExp("^" + fpath.replace(".", "\\.") + ":\\s*\\S+").test(ln)) {
          found = true;
        }
        if (found) break;
      }
      if (!found) missing.push(fpath);
    }
    process.stdout.write(missing.length === 0 ? "OK" : "MISSING:" + missing.join(","));
  ' 2>/dev/null)

  if [ "$RESULT" = "NO_FRONTMATTER" ]; then
    VIOLATIONS="${VIOLATIONS}${F}: 첫 줄에 frontmatter (---/---) 가 없습니다 (no frontmatter block)"$'\n'
  elif [[ "$RESULT" == MISSING:* ]]; then
    MISSING_FIELDS="${RESULT#MISSING:}"
    VIOLATIONS="${VIOLATIONS}${F}: 필수 frontmatter 항목 누락: ${MISSING_FIELDS}"$'\n'
  fi
done

if [ -n "$VIOLATIONS" ]; then
  KOREA=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.brief?.region==='kr'?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)

  if [ "$KOREA" = "1" ]; then
    REASON="⚠ 커밋이 차단되었습니다. .planning/ artifact frontmatter에 필수 항목이 누락되었습니다.

다음 파일에 audience.type, audience.confidentiality, voice.tone, voice.perspective, business_context.model 5개 필수 항목을 모두 추가해 주세요:
${VIOLATIONS}
이 hook은 .planning/config.json에서 hooks.community: false 로 변경하여 비활성화할 수 있습니다 (권장하지 않음 — Phase 8 audience 방어막 약화)."
  else
    REASON="Commit blocked: .planning/ artifact frontmatter missing mandatory fields.

Add audience.type, audience.confidentiality, voice.tone, voice.perspective, business_context.model to:
${VIOLATIONS}
You can disable this hook by setting hooks.community: false in .planning/config.json (NOT recommended — weakens Phase 8 audience defense)."
  fi

  # Escape for JSON via node (same pattern as brief-validate-provenance.sh)
  REASON_JSON=$(node -e "process.stdout.write(JSON.stringify(process.argv[1]))" "$REASON")
  echo "{\"decision\":\"block\",\"reason\":${REASON_JSON}}"
  exit 2
fi

exit 0
