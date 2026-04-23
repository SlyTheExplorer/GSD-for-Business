#!/bin/bash
# brief-hook-version: {{BRIEF_VERSION}}
# brief-validate-provenance.sh — PreToolUse hook: enforce provenance tags on quantitative claims
# Blocks `git commit` commands that introduce untagged quantitative claims (exit 2).
# Allows commits that are fully tagged OR only contain false-positive prose.
#
# OPT-IN: no-op unless config.json has hooks.community: true.
# Mirrors hooks/brief-validate-commit.sh shape + opt-in config gate.
#
# Regex portability note: `\b` word-boundary and `\$` literal-dollar are unreliable
# across BSD awk (macOS) vs GNU awk (Linux). We use portable ERE equivalents:
#   `\b(word)\b` → `(^|[^A-Za-z0-9_])(word)([^A-Za-z0-9_]|$)`
#   `\$`         → `[$]`
# Evaluation is delegated to `grep -E` (BSD + GNU both support the constructs below).

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

# Only run provenance scan for `git commit` commands
if ! [[ "$CMD" =~ ^git[[:space:]]+commit ]]; then
  exit 0
fi

# Enumerate staged files (additions + modifications only)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=AM 2>/dev/null || true)
if [ -z "$STAGED_FILES" ]; then exit 0; fi

# Allowlist paths (skip provenance check)
ALLOWLIST_REGEX='^(brief/references/compliance/|brief/references/.*-vocabulary\.md|\.planning/research/|tests/fixtures/)'

# Portable ERE patterns (grep -E compatible).
#   Word-boundary surrogate: (^|[^A-Za-z0-9_]) before, ([^A-Za-z0-9_]|$) after.
#   Literal $: [$]
#
# INCLUDE: currency symbols + %, x/배 multipliers, explicit phrasings (EN + KO).
INCLUDE_PATTERN='(₩|[$]|€|¥)[[:space:]]*[0-9][0-9,.]*|[0-9][0-9,.]*[[:space:]]*%|[0-9][0-9,.]*[[:space:]]*([xX]([^A-Za-z0-9_]|$)|배)|(^|[^A-Za-z0-9_])(시장[[:space:]]*규모|매출|성장률|CAGR|YoY|QoQ|MoM|MRR|ARR|ACV|LTV|CAC|NPS|DAU|MAU|market[[:space:]]*size|TAM|SAM|SOM|revenue|growth[[:space:]]*rate)([^A-Za-z0-9_]|$)'
#
# EXCLUDE: bare year, Article/Section/§ + number, Korean article (제 N 조/항/호/절),
# version strings (v1.2.3), page refs (page N / p. N / line N / L. N),
# English prose quantifiers (first quarter / three principles / etc.),
# Korean prose quantifiers (세 가지 / 두 번째 / 다섯 단계 / etc.),
# BRIEF plan/task IDs (Plan 04 / Task 3 / Cycle 6 / W-2 / T-5 / D-15).
EXCLUDE_PATTERN='(^|[^A-Za-z0-9_])(19|20)[0-9]{2}([^A-Za-z0-9_]|$)|(^|[^A-Za-z0-9_])(Article|Section|§)[[:space:]]*[0-9]+([^A-Za-z0-9_]|$)|제[[:space:]]*[0-9]+[[:space:]]*(조|항|호|절)|(^|[^A-Za-z0-9_])[vV][0-9]+(\.[0-9]+)*([^A-Za-z0-9_]|$)|(^|[^A-Za-z0-9_])(page|p\.|line|L\.)[[:space:]]*[0-9]+|(^|[^A-Za-z0-9_])(first|second|third|one|two|three|four|five|six|seven|eight|nine|ten|First|Second|Third|One|Two|Three|Four|Five)[[:space:]]+(quarter|principle|year|reason|step|phase|item|wave|example|Quarter|Principle|Year|Reason|Step|Phase|Item|Wave|Example|principles)([^A-Za-z0-9_]|$)|(첫|둘째|셋째|첫째|두|세|네|다섯|여섯|일곱|여덟|아홉|열)[[:space:]]*(가지|번째|원칙|단계|항목|분기|년)|(^|[^A-Za-z0-9_])(Plan|Task|Cycle|W-|T-|D-)[[:space:]]*[0-9]+'
#
# TAG: [VERIFIED:url|YYYY-MM-DD] (date required), [ASSUMED:rationale], [FOUNDER-INPUT], or inline escape comment.
TAG_PATTERN='\[VERIFIED:[^]|]+\|[0-9]{4}-[0-9]{2}-[0-9]{2}\]|\[ASSUMED:[^]]+\]|\[FOUNDER-INPUT\]|<!--[[:space:]]*brief-provenance:[[:space:]]*allow[[:space:]]*-->'

VIOLATIONS=""
for F in $STAGED_FILES; do
  [[ "$F" =~ $ALLOWLIST_REGEX ]] && continue
  [[ ! "$F" =~ \.(md|txt)$ ]] && continue
  [[ ! -f "$F" ]] && continue

  # Find candidate lines that match INCLUDE AND do NOT match EXCLUDE.
  # Use grep -nE (portable; supports line numbers).
  INCLUDES=$(grep -nE "$INCLUDE_PATTERN" "$F" 2>/dev/null || true)
  [ -z "$INCLUDES" ] && continue

  # Filter out lines that also match EXCLUDE (i.e., false positives).
  CANDIDATES=""
  while IFS= read -r HIT; do
    [ -z "$HIT" ] && continue
    LNO=$(echo "$HIT" | cut -d: -f1)
    LINETEXT=$(echo "$HIT" | cut -d: -f2-)
    if ! echo "$LINETEXT" | grep -qE "$EXCLUDE_PATTERN"; then
      CANDIDATES="${CANDIDATES}${LNO}:${LINETEXT}"$'\n'
    fi
  done <<< "$INCLUDES"

  [ -z "$CANDIDATES" ] && continue

  # For each candidate, check for tag within ±2 lines.
  while IFS= read -r HIT; do
    [ -z "$HIT" ] && continue
    LNO=$(echo "$HIT" | cut -d: -f1)
    START=$((LNO - 2)); [ $START -lt 1 ] && START=1
    END=$((LNO + 2))
    WINDOW=$(sed -n "${START},${END}p" "$F")
    if ! echo "$WINDOW" | grep -qE "$TAG_PATTERN"; then
      HITLINE=$(echo "$HIT" | cut -d: -f2-)
      VIOLATIONS="${VIOLATIONS}${F}:${LNO}: ${HITLINE}"$'\n'
    fi
  done <<< "$CANDIDATES"
done

if [ -n "$VIOLATIONS" ]; then
  KOREA=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.brief?.region==='kr'?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)

  if [ "$KOREA" = "1" ]; then
    REASON="⚠ 커밋이 차단되었습니다. 정량적 주장에 출처 태그가 없습니다.

다음 줄에 [VERIFIED:url|YYYY-MM-DD], [ASSUMED:rationale], 또는 [FOUNDER-INPUT] 태그를 추가해 주세요:
${VIOLATIONS}
필요하다면 같은 줄에 <!-- brief-provenance: allow --> 주석을 추가해 예외 처리할 수 있습니다 (사내 문서 등)."
  else
    REASON="Commit blocked: quantitative claims without provenance tag.

Add [VERIFIED:url|YYYY-MM-DD], [ASSUMED:rationale], or [FOUNDER-INPUT] near:
${VIOLATIONS}
To allow a specific line as prose (not a claim), add <!-- brief-provenance: allow --> inline."
  fi

  # Escape for JSON via node (same pattern as brief-validate-commit.sh)
  REASON_JSON=$(node -e "process.stdout.write(JSON.stringify(process.argv[1]))" "$REASON")
  echo "{\"decision\":\"block\",\"reason\":${REASON_JSON}}"
  exit 2
fi

exit 0
