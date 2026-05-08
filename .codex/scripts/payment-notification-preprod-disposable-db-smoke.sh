#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
task="payment-notification-preprod-disposable-db-smoke"
mode=""
host=""
port=""
database=""
db_user=""
sslmode=""
confirm_disposable=""
commit_sha=""
enforce_clean_worktree=0

usage() {
  cat <<'USAGE'
Usage:
  .codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --print-plan
  .codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --validate-inputs-only \
    --host <host> --port <port> --database <disposable-db> --user <user> \
    --sslmode <require|disable> --confirm-disposable <disposable-db> \
    --commit-sha <sha> [--enforce-clean-worktree]

This skeleton does not connect to any external database. External execution is
blocked until a separate task explicitly authorizes a disposable preprod DB.
USAGE
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

mask_host() {
  case "$1" in
    "" )
      printf ''
      ;;
    localhost|127.0.0.1 )
      printf '%s' "$1"
      ;;
    *.* )
      local suffix="${1##*.}"
      printf '***.%s' "$suffix"
      ;;
    * )
      printf '***'
      ;;
  esac
}

current_sha() {
  git -C "$root" rev-parse HEAD
}

contains_connection_string() {
  case "$1" in
    *"://"*|*"@"* )
      return 0
      ;;
    * )
      return 1
      ;;
  esac
}

is_production_like_database() {
  local value
  value="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"

  case "$value" in
    production|production_*|*_production|*_production_*|*-production|*-production-*|prod|prod_*|*_prod|*_prod_*|*-prod|*-prod-*|main|main_*|*_main|*_main_*|primary|primary_*|*_primary|*_primary_*|live|live_*|*_live|*_live_*|master|master_*|*_master|*_master_* )
      return 0
      ;;
    * )
      return 1
      ;;
  esac
}

validate_inputs() {
  [ -n "$host" ] || fail "--host is required."
  [ -n "$port" ] || fail "--port is required."
  [ -n "$database" ] || fail "--database is required."
  [ -n "$db_user" ] || fail "--user is required."
  [ -n "$sslmode" ] || fail "--sslmode is required."
  [ -n "$confirm_disposable" ] || fail "--confirm-disposable is required."
  [ -n "$commit_sha" ] || fail "--commit-sha is required."

  case "$port" in
    ''|*[!0-9]* )
      fail "--port must be numeric."
      ;;
  esac

  case "$sslmode" in
    require|disable )
      ;;
    * )
      fail "--sslmode must be require or disable."
      ;;
  esac

  contains_connection_string "$host" && fail "--host must not be a full connection string."
  contains_connection_string "$database" && fail "--database must not be a full connection string."
  contains_connection_string "$db_user" && fail "--user must not contain connection string syntax."

  [ "$database" = "$confirm_disposable" ] || fail "--confirm-disposable must equal --database."

  case "$database" in
    fuyi_payment_notification_preprod_disposable_* )
      ;;
    * )
      fail "--database must start with fuyi_payment_notification_preprod_disposable_."
      ;;
  esac

  is_production_like_database "$database" && fail "Refusing production-like database name."

  [ "$commit_sha" = "$(current_sha)" ] || fail "--commit-sha does not match current HEAD."

  if [ "$enforce_clean_worktree" = "1" ]; then
    [ -z "$(git -C "$root" status --porcelain)" ] || fail "Worktree is not clean."
  fi
}

print_plan_json() {
  local masked_host
  local current
  masked_host="$(mask_host "$host")"
  current="$(current_sha)"

  cat <<JSON
{
  "task": "$task",
  "mode": "${mode:-print-plan}",
  "externalExecution": "blocked",
  "currentCommitSha": "$(json_escape "$current")",
  "target": {
    "hostMasked": "$(json_escape "$masked_host")",
    "port": "$(json_escape "$port")",
    "database": "$(json_escape "$database")",
    "user": "$(json_escape "$db_user")",
    "sslmode": "$(json_escape "$sslmode")"
  },
  "plannedChecks": [
    "migration_up_down",
    "accepted_insert",
    "duplicate_replay",
    "rejected_path",
    "event_log_action",
    "sensitive_data_leak_check",
    "cleanup_or_rollback"
  ],
  "noGo": [
    "production_database",
    "full_connection_string",
    "password_cli_argument",
    "real_provider_secret",
    "payment_workflow_execution"
  ]
}
JSON
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --print-plan )
      mode="print-plan"
      shift
      ;;
    --validate-inputs-only )
      mode="validate-inputs-only"
      shift
      ;;
    --host )
      host="${2:-}"
      shift 2
      ;;
    --port )
      port="${2:-}"
      shift 2
      ;;
    --database )
      database="${2:-}"
      shift 2
      ;;
    --user )
      db_user="${2:-}"
      shift 2
      ;;
    --sslmode )
      sslmode="${2:-}"
      shift 2
      ;;
    --confirm-disposable )
      confirm_disposable="${2:-}"
      shift 2
      ;;
    --commit-sha )
      commit_sha="${2:-}"
      shift 2
      ;;
    --enforce-clean-worktree )
      enforce_clean_worktree=1
      shift
      ;;
    --password|--db-url|--database-url|--connection-string|--provider-secret|--signature|--raw-payload )
      fail "$1 is not accepted by this script."
      ;;
    -h|--help )
      usage
      exit 0
      ;;
    * )
      fail "Unknown argument: $1"
      ;;
  esac
done

case "$mode" in
  print-plan )
    print_plan_json
    ;;
  validate-inputs-only )
    validate_inputs
    print_plan_json
    ;;
  "" )
    usage
    exit 1
    ;;
  * )
    fail "Unsupported mode: $mode"
    ;;
esac
