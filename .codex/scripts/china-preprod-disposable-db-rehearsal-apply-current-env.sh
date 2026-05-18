#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
target="${1:-"$root/.codex/private/preprod-disposable-db-rehearsal.env"}"
template="$root/.codex/templates/preprod-disposable-db-rehearsal.env.example"
loader="$root/.codex/scripts/lib/preprod-disposable-env-safe-loader.sh"

# shellcheck source=.codex/scripts/lib/preprod-disposable-env-safe-loader.sh
source "$loader"

fail() {
  printf 'FAIL %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'USAGE'
Usage:
  CODEX_PREPROD_DISPOSABLE_DATABASE_URL=<redacted> \
    ./.codex/scripts/china-preprod-disposable-db-rehearsal-apply-current-env.sh [private-env-file]

Default:
  .codex/private/preprod-disposable-db-rehearsal.env

This copies approved disposable preprod DB rehearsal values from the current
process environment into a gitignored private env file with mode 600. It never
prints database URLs, credentials, or env values, and it never connects to a
database.

Required current env:
  CODEX_PREPROD_DISPOSABLE_DATABASE_URL

Optional current env overrides:
  CODEX_PREPROD_DISPOSABLE_DB_CONFIRM
  CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM
  CODEX_PREPROD_DISPOSABLE_DB_OPERATOR
  CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER
  CODEX_PREPROD_DISPOSABLE_WORKTREE_ACK
  CODEX_PREPROD_DISPOSABLE_DB_LOCALHOST_PREPROD_TUNNEL_CONFIRM
  CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX
  CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX_CONFIRM
  CODEX_PREPROD_REHEARSAL_OUTPUT_PATH
USAGE
}

case "$target" in
  -h|--help|help)
    usage
    exit 0
    ;;
esac

[ -f "$template" ] || fail "template does not exist: $template"
[ -n "${CODEX_PREPROD_DISPOSABLE_DATABASE_URL:-}" ] || fail "CODEX_PREPROD_DISPOSABLE_DATABASE_URL is not set in the current process."

target_dir="$(cd "$(dirname "$target")" 2>/dev/null && pwd || true)"
if [ -z "$target_dir" ]; then
  mkdir -p "$(dirname "$target")"
  target_dir="$(cd "$(dirname "$target")" && pwd)"
fi
target_abs="${target_dir}/$(basename "$target")"

case "$target_abs" in
  "$root/.codex/private/"*|"$root/project-ledger/private/"*)
    ;;
  *)
    fail "target must live under .codex/private/ or project-ledger/private/."
    ;;
esac

case "$target_abs" in
  *.example|*.template)
    fail "target must not use .example or .template extension."
    ;;
esac

if [ -f "$target_abs" ]; then
  syntax_reason=""
  codex_preprod_env_validate_syntax "$target_abs" syntax_reason || fail "$syntax_reason"
fi

existing_or_default() {
  local name="$1"
  local default="$2"
  local value=""

  if [ -f "$target_abs" ]; then
    value="$(codex_preprod_env_extract_value "$target_abs" "$name" || true)"
  fi

  if [ -z "$value" ] && [ -f "$template" ]; then
    value="$(codex_preprod_env_extract_value "$template" "$name" || true)"
  fi

  case "$value" in
    *replace-with*|*placeholder*|*YYYYMMDD*|*preprod-host.example*)
      value=""
      ;;
  esac

  [ -n "$value" ] || value="$default"
  printf '%s' "$value"
}

current_or_existing_or_default() {
  local name="$1"
  local default="$2"
  local value="${!name:-}"

  if [ -n "$value" ]; then
    printf '%s' "$value"
    return
  fi

  existing_or_default "$name" "$default"
}

append_optional_from_current() {
  local output_file="$1"
  local name="$2"
  local value="${!name:-}"

  [ -n "$value" ] || return 0
  printf '%s=%s\n' "$name" "$value" >>"$output_file"
}

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

cat >"$tmp_file" <<EOF
# Generated from current process env by:
#   ./.codex/scripts/china-preprod-disposable-db-rehearsal-apply-current-env.sh
#
# Values are intentionally not printed by the script. Do not commit this file.

CODEX_PREPROD_DISPOSABLE_DATABASE_URL=${CODEX_PREPROD_DISPOSABLE_DATABASE_URL}
CODEX_PREPROD_DISPOSABLE_DB_CONFIRM=$(current_or_existing_or_default CODEX_PREPROD_DISPOSABLE_DB_CONFIRM I_CONFIRM_THIS_IS_DISPOSABLE_PREPROD_DB)
CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM=$(current_or_existing_or_default CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM BACKUP_DONE_OR_NOT_NEEDED)
CODEX_PREPROD_DISPOSABLE_DB_OPERATOR=$(current_or_existing_or_default CODEX_PREPROD_DISPOSABLE_DB_OPERATOR codex-current-env-operator)
CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER=$(current_or_existing_or_default CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER codex-current-env-cleanup-owner)
CODEX_PREPROD_DISPOSABLE_WORKTREE_ACK=$(current_or_existing_or_default CODEX_PREPROD_DISPOSABLE_WORKTREE_ACK I_ACCEPT_CURRENT_LOCAL_WIP_FOR_REHEARSAL)
EOF

append_optional_from_current "$tmp_file" CODEX_PREPROD_DISPOSABLE_DB_LOCALHOST_PREPROD_TUNNEL_CONFIRM
append_optional_from_current "$tmp_file" CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX
append_optional_from_current "$tmp_file" CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX_CONFIRM
append_optional_from_current "$tmp_file" CODEX_PREPROD_REHEARSAL_OUTPUT_PATH

syntax_reason=""
codex_preprod_env_validate_syntax "$tmp_file" syntax_reason || fail "$syntax_reason"

install -m 600 "$tmp_file" "$target_abs"

cat <<EOF
PASS wrote private preprod rehearsal env from current process env:
  $target_abs

No database URL, credential, or env value was printed.
Next:
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh "$target_abs"
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh "$target_abs" validate
EOF
