#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=.codex/scripts/lib/preprod-disposable-env-safe-loader.sh
source "$root/.codex/scripts/lib/preprod-disposable-env-safe-loader.sh"

env_file="${1:-}"
mode="${2:-run}"
confirm_disposable_token="I_CONFIRM_THIS_IS_DISPOSABLE_PREPROD_DB"
backup_confirm_token="BACKUP_DONE_OR_NOT_NEEDED"
custom_regex_confirm_token="I_ACCEPT_CUSTOM_DB_NAME_ALLOW_REGEX"
localhost_preprod_tunnel_confirm_token="I_CONFIRM_LOCALHOST_ENDPOINT_IS_DISPOSABLE_PREPROD_TUNNEL"

fail() {
  printf 'FAIL %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh <private-env-file> [validate|run]

Template:
  .codex/templates/preprod-disposable-db-rehearsal.env.example

The env file must be a local private file. Do not commit real database URLs,
operators, owners, or tunnel details.

Modes:
  validate  Validate the private env file only. No database connection is made.
  run       Validate the private env file, then run the guarded preprod rehearsal.
USAGE
}

case "$env_file" in
  -h|--help|help)
    usage
    exit 0
    ;;
  "")
    usage >&2
    exit 2
    ;;
esac

case "$mode" in
  validate|run)
    ;;
  *)
    fail "unknown mode: $mode. Expected validate or run."
    ;;
esac

[ -f "$env_file" ] || fail "env file does not exist: $env_file"

env_file_dir="$(cd "$(dirname "$env_file")" && pwd)" || fail "cannot resolve env file directory: $env_file"
env_file_abs="${env_file_dir}/$(basename "$env_file")"
env_file_mode="$(stat --printf=%a "$env_file_abs")"

[ "$env_file_mode" = "600" ] || fail "private env file mode must be 600; current mode is $env_file_mode."

case "$env_file_abs" in
  *.example|*.template)
    fail "refusing to run with a template/example env file."
    ;;
esac

case "$env_file_abs" in
  "$root"/*)
    case "$env_file_abs" in
      "$root/.codex/private/"*|"$root/project-ledger/private/"*)
        if ! git -C "$root" check-ignore -q "$env_file_abs"; then
          fail "private env file inside the repo must be git-ignored."
        fi
        ;;
      *)
        fail "env file inside the repo must live under .codex/private/ or project-ledger/private/."
        ;;
    esac
    ;;
esac

require_declared_env() {
  local name="$1"
  if ! grep -Eq "^[[:space:]]*(export[[:space:]]+)?${name}=" "$env_file_abs"; then
    fail "private env file must declare ${name}; do not rely on inherited shell env."
  fi
}

validate_private_env_syntax() {
  local syntax_reason
  if ! codex_preprod_env_validate_syntax "$env_file_abs" syntax_reason; then
    fail "$syntax_reason"
  fi
}

extract_env_value() {
  local name="$1"
  codex_preprod_env_extract_value "$env_file_abs" "$name"
}

load_private_env_values() {
  local name
  local value

  validate_private_env_syntax

  for name in "${codex_preprod_env_allowed_names[@]}"; do
    if value="$(extract_env_value "$name")"; then
      printf -v "$name" '%s' "$value"
      export "$name"
    fi
  done
}

require_no_placeholder_values() {
  local name
  local value
  local placeholder_keys=()

  for name in "${codex_preprod_env_allowed_names[@]}"; do
    value="${!name:-}"
    [ -n "$value" ] || continue

    case "$value" in
      *replace-with*|*placeholder*|*YYYYMMDD*|*preprod-host.example*)
        placeholder_keys+=("$name")
        ;;
    esac
  done

  if [ "${#placeholder_keys[@]}" -gt 0 ]; then
    local joined
    joined="$(IFS=,; printf '%s' "${placeholder_keys[*]}")"
    fail "private env file still contains placeholder values for: ${joined}."
  fi
}

require_env_value() {
  local name="$1"
  local expected="${2:-}"
  local value="${!name:-}"

  [ -n "$value" ] || fail "private env file must provide ${name}."

  if [ -n "$expected" ] && [ "$value" != "$expected" ]; then
    fail "${name} must equal ${expected}."
  fi
}

reject_production_like_token() {
  local value="$1"
  local label="$2"
  local lowered

  lowered="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"

  if [[ "$lowered" =~ (^|[-_.])production($|[-_.]) ]] ||
    [[ "$lowered" =~ (^|[-_.])prod($|[-_.]) ]] ||
    [[ "$lowered" =~ (^|[-_.])(live|master|primary)($|[-_.]) ]]; then
    fail "$label looks production-like."
  fi
}

parse_database_url() {
  local url="$1"
  local scheme
  local rest
  local userinfo
  local hostpath
  local hostport
  local database
  local username
  local host

  case "$url" in
    postgres://*|postgresql://*)
      ;;
    *)
      fail "invalid CODEX_PREPROD_DISPOSABLE_DATABASE_URL: database URL must use postgres or postgresql scheme."
      ;;
  esac

  scheme="${url%%://*}"
  rest="${url#*://}"

  if [ "$rest" = "${rest#*@}" ]; then
    fail "invalid CODEX_PREPROD_DISPOSABLE_DATABASE_URL: database username is required in URL."
  fi

  userinfo="${rest%%@*}"
  hostpath="${rest#*@}"
  username="${userinfo%%:*}"
  [ -n "$username" ] || fail "invalid CODEX_PREPROD_DISPOSABLE_DATABASE_URL: database username is required in URL."

  if [ "$hostpath" = "${hostpath#*/}" ]; then
    fail "invalid CODEX_PREPROD_DISPOSABLE_DATABASE_URL: database name is required in URL path."
  fi

  hostport="${hostpath%%/*}"
  database="${hostpath#*/}"
  database="${database%%\?*}"
  database="${database%%#*}"
  [ -n "$database" ] || fail "invalid CODEX_PREPROD_DISPOSABLE_DATABASE_URL: database name is required in URL path."

  case "$hostport" in
    \[*\]*)
      host="${hostport#\[}"
      host="${host%%\]*}"
      ;;
    *)
      host="${hostport%%:*}"
      ;;
  esac
  [ -n "$host" ] || fail "invalid CODEX_PREPROD_DISPOSABLE_DATABASE_URL: database host is required."

  printf '%s\n%s\n%s\n' "$host" "$database" "$username"
}

validate_database_target_without_connecting() {
  local db_host="$1"
  local db_name="$2"
  local db_user="$3"
  local allow_regex="${CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX:-^fuyi_preprod_disposable_[A-Za-z0-9_]+$}"
  local lowered_name

  reject_production_like_token "$db_host" "database host"
  reject_production_like_token "$db_name" "database name"

  case "$db_host" in
    localhost|127.0.0.1|::1)
      require_env_value CODEX_PREPROD_DISPOSABLE_DB_LOCALHOST_PREPROD_TUNNEL_CONFIRM "$localhost_preprod_tunnel_confirm_token"
      ;;
  esac

  case "$db_name" in
    *[!A-Za-z0-9_]*)
      fail "database name may only contain letters, numbers, and underscores."
      ;;
  esac

  lowered_name="$(printf '%s' "$db_name" | tr '[:upper:]' '[:lower:]')"
  case "$lowered_name" in
    postgres|template0|template1|medusa|mercur|fuyi|production|prod|main|primary|live|master)
      fail "refusing reserved or production-like database name."
      ;;
  esac

  if [ -n "${CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX:-}" ]; then
    require_env_value CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX_CONFIRM "$custom_regex_confirm_token"
  fi

  if ! [[ "$db_name" =~ $allow_regex ]]; then
    fail "database name does not match allow regex."
  fi

  case "$lowered_name" in
    *disposable*|*dry_run*|*dryrun*) ;;
    *)
      fail "database name must clearly indicate disposable or dry-run use."
      ;;
  esac

  case "$db_user" in
    *[!A-Za-z0-9_@.-]*)
      fail "database user contains unsafe characters."
      ;;
  esac
}

require_declared_env CODEX_PREPROD_DISPOSABLE_DATABASE_URL
require_declared_env CODEX_PREPROD_DISPOSABLE_DB_CONFIRM
require_declared_env CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM
require_declared_env CODEX_PREPROD_DISPOSABLE_DB_OPERATOR
require_declared_env CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER

load_private_env_values

require_no_placeholder_values

require_env_value CODEX_PREPROD_DISPOSABLE_DB_CONFIRM "$confirm_disposable_token"
require_env_value CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM "$backup_confirm_token"
require_env_value CODEX_PREPROD_DISPOSABLE_DB_OPERATOR
require_env_value CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER

db_parts="$(parse_database_url "$CODEX_PREPROD_DISPOSABLE_DATABASE_URL")" || exit 1
mapfile -t parsed_db_url <<<"$db_parts"
validate_database_target_without_connecting \
  "${parsed_db_url[0]:-}" \
  "${parsed_db_url[1]:-}" \
  "${parsed_db_url[2]:-}"

if [ "$mode" = "validate" ]; then
  cat <<'VALID'
PASS private preprod rehearsal env file shape is valid.
PASS private preprod rehearsal target passed non-connecting safety preflight.
No database connection was attempted.
This does not satisfy the real disposable preprod DB rehearsal gate.
VALID
  exit 0
fi

(
  cd "$root"
  ./.codex/scripts/china-preprod-disposable-db-rehearsal.sh run
)
