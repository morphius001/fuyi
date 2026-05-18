#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
artifact_dir="${CODEX_PREPROD_CLOSE_GATE_OUTPUT_DIR:-/tmp/fuyi-preprod-close-gate-created-local-disposable-go}"
summary_path=""
scan_output="${TMPDIR:-/tmp}/fuyi-current-worktree-staging-preflight-artifact-secret-scan.json"
scan_log="${TMPDIR:-/tmp}/fuyi-current-worktree-staging-preflight-artifact-secret-scan.log"
expect_staged=0

pass_count=0
warn_count=0
no_go_count=0

pass() {
  pass_count=$((pass_count + 1))
  printf 'PASS %s\n' "$*"
}

warn() {
  warn_count=$((warn_count + 1))
  printf 'WARN %s\n' "$*"
}

no_go() {
  no_go_count=$((no_go_count + 1))
  printf 'NO-GO %s\n' "$*"
}

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/current-worktree-staging-preflight.sh [--artifact-dir <dir>] [--expect-staged]

Read-only staging preflight for the current runtime worktree.
It does not stage, commit, delete files, connect to databases, or read private env values.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --artifact-dir)
      shift
      artifact_dir="${1:-}"
      ;;
    --expect-staged)
      expect_staged=1
      ;;
    -h|--help|help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift || true
done

cd "$root"

summary_path="$artifact_dir/readiness-suite/summary.json"

printf 'Current worktree staging preflight\n'
printf 'root=%s\n' "$root"
printf 'artifact_dir=%s\n' "$artifact_dir"
printf 'summary_path=%s\n' "$summary_path"

modified_count="$(git diff --name-only | wc -l | tr -d ' ')"
untracked_count="$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')"
staged_count="$(git diff --cached --name-only | wc -l | tr -d ' ')"

printf 'modified_tracked=%s\n' "$modified_count"
printf 'untracked_non_ignored=%s\n' "$untracked_count"
printf 'staged=%s\n' "$staged_count"

if [ -f "$summary_path" ]; then
  if command -v bun >/dev/null; then
    if SUMMARY_PATH="$summary_path" bun <<'BUN' >/tmp/fuyi-current-worktree-staging-preflight-summary-check.log 2>&1
const path = process.env.SUMMARY_PATH
const s = require(path)
const required = [
  ["verdict", s.verdict === "GO-FOR-CHECKED-SCOPE"],
  ["externalBlockers", Array.isArray(s.externalBlockers) && s.externalBlockers.length === 0],
  ["adminLoggedInVisualQa", s.derivedGateConfirmations?.adminLoggedInVisualQa === true],
  ["highRiskRuntimeApproval", s.derivedGateConfirmations?.highRiskRuntimeApproval === true],
  ["preprodDisposableDbRehearsal", s.derivedGateConfirmations?.preprodDisposableDbRehearsal === true],
  ["preprodEnvStatus", s.preprodEnvStatus?.verdict === "READY_TO_VALIDATE"],
  ["placeholderKeys", Array.isArray(s.preprodEnvStatus?.placeholderKeys) && s.preprodEnvStatus.placeholderKeys.length === 0],
]
const failed = required.filter(([, ok]) => !ok).map(([name]) => name)
if (failed.length) {
  console.error(`summary check failed: ${failed.join(",")}`)
  process.exit(1)
}
console.log(JSON.stringify({
  verdict: s.verdict,
  externalBlockers: s.externalBlockers,
  derivedGateConfirmations: s.derivedGateConfirmations,
  preprodEnvStatus: {
    verdict: s.preprodEnvStatus?.verdict,
    placeholderKeys: s.preprodEnvStatus?.placeholderKeys,
  },
}))
BUN
    then
      pass "close-gate summary is GO-FOR-CHECKED-SCOPE with confirmed gates"
    else
      no_go "close-gate summary check failed; see /tmp/fuyi-current-worktree-staging-preflight-summary-check.log"
    fi
  else
    warn "bun is unavailable; skipped close-gate summary assertion"
  fi
else
  no_go "close-gate summary missing: $summary_path"
fi

if git diff --check >/tmp/fuyi-current-worktree-staging-preflight-diff-check.log 2>&1; then
  pass "git diff --check"
else
  no_go "git diff --check failed; see /tmp/fuyi-current-worktree-staging-preflight-diff-check.log"
fi

expected_ignored=(
  ".codex/private/preprod-disposable-db-rehearsal.env"
  "project-ledger/private/anything.env"
  ".codex/artifacts/admin-visual-qa-test/summary.json"
  "project-ledger/artifacts/test/summary.json"
)

for path in "${expected_ignored[@]}"; do
  if git check-ignore -q -- "$path"; then
    pass "git ignore protects $path"
  else
    no_go "git ignore does not protect $path"
  fi
done

if [ -d "$artifact_dir" ]; then
  if ./.codex/scripts/china-readiness-artifact-secret-scan.sh "$artifact_dir" --output "$scan_output" --log "$scan_log" >/tmp/fuyi-current-worktree-staging-preflight-artifact-secret-scan.stdout 2>&1; then
    pass "artifact secret scan passed for $artifact_dir"
  else
    no_go "artifact secret scan failed for $artifact_dir; see $scan_log"
  fi
else
  warn "artifact dir missing: $artifact_dir"
fi

staged_private_or_artifact=0
while IFS= read -r staged_path; do
  [ -n "$staged_path" ] || continue
  case "$staged_path" in
    .codex/private/.gitignore|.codex/artifacts/.gitignore|project-ledger/private/.gitignore|project-ledger/artifacts/.gitignore)
      ;;
    .codex/private/*|.codex/artifacts/*|project-ledger/private/*|project-ledger/artifacts/*)
      staged_private_or_artifact=1
      no_go "staged private/artifact path is not allowed: $staged_path"
      ;;
  esac
done < <(git diff --cached --name-only)

if [ "$staged_private_or_artifact" -eq 0 ]; then
  pass "no disallowed private/artifact paths are staged"
fi

if [ "$staged_count" -eq 0 ] && [ "$expect_staged" -eq 1 ]; then
  no_go "no files are staged but --expect-staged was provided"
elif [ "$staged_count" -eq 0 ]; then
  pass "no files are staged yet"
else
  pass "staged file list is non-empty"
fi

if git diff --cached --name-only | grep -E '(^|/)(payment|refund|settlement|commission|payout|fulfillment|logistics|permission|rbac)' >/tmp/fuyi-current-worktree-staging-preflight-high-risk-staged.txt; then
  warn "staged file names include high-risk keywords; review /tmp/fuyi-current-worktree-staging-preflight-high-risk-staged.txt"
else
  pass "staged file names do not include high-risk keywords"
fi

printf 'summary pass=%s warnings=%s no_go=%s\n' "$pass_count" "$warn_count" "$no_go_count"

if [ "$no_go_count" -gt 0 ]; then
  exit 1
fi
