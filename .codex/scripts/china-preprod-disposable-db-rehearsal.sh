#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mode="${1:-plan}"
log_file="${TMPDIR:-/tmp}/fuyi-preprod-disposable-db-rehearsal-$(date +%Y%m%d%H%M%S).log"

confirm_disposable_token="I_CONFIRM_THIS_IS_DISPOSABLE_PREPROD_DB"
backup_confirm_token="BACKUP_DONE_OR_NOT_NEEDED"
wip_confirm_token="I_ACCEPT_CURRENT_LOCAL_WIP_FOR_REHEARSAL"
custom_regex_confirm_token="I_ACCEPT_CUSTOM_DB_NAME_ALLOW_REGEX"
localhost_preprod_tunnel_confirm_token="I_CONFIRM_LOCALHOST_ENDPOINT_IS_DISPOSABLE_PREPROD_TUNNEL"
local_script_test_confirm_token="I_ACCEPT_LOCALHOST_SCRIPT_TEST_ONLY"

required_tables=(
  payment_notification_inbox
  payment_notification_event_log
  china_refund_state_mutation_approval
  china_refund_state_mutation_approval_event
  china_refund_state_mutation_audit
  china_refund_state_mutation_runtime_attempt
  china_refund_state_mutation_terminal_conflict
  china_unit_permission_config
  china_unit_permission_seller_binding
  china_unit_permission_config_event
  china_platform_module_switch_config
  china_platform_module_switch_config_event
)

fail() {
  printf 'FAIL %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-preprod-disposable-db-rehearsal.sh plan
  ./.codex/scripts/china-preprod-disposable-db-rehearsal.sh run
  ./.codex/scripts/china-preprod-disposable-db-rehearsal.sh run-local-script-test

Default mode is plan and does not connect to any database.

Required environment for run:
  CODEX_PREPROD_DISPOSABLE_DATABASE_URL
  CODEX_PREPROD_DISPOSABLE_DB_CONFIRM=I_CONFIRM_THIS_IS_DISPOSABLE_PREPROD_DB
  CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM=BACKUP_DONE_OR_NOT_NEEDED
  CODEX_PREPROD_DISPOSABLE_DB_OPERATOR=<operator name or ticket>
  CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER=<owner name or ticket>

Optional:
  CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX=^fuyi_preprod_disposable_[A-Za-z0-9_]+$
  CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX_CONFIRM=I_ACCEPT_CUSTOM_DB_NAME_ALLOW_REGEX
  CODEX_PREPROD_DISPOSABLE_WORKTREE_ACK=I_ACCEPT_CURRENT_LOCAL_WIP_FOR_REHEARSAL
  CODEX_PREPROD_DISPOSABLE_DB_LOCALHOST_PREPROD_TUNNEL_CONFIRM=I_CONFIRM_LOCALHOST_ENDPOINT_IS_DISPOSABLE_PREPROD_TUNNEL
  CODEX_PREPROD_DISPOSABLE_DB_LOCAL_SCRIPT_TEST_CONFIRM=I_ACCEPT_LOCALHOST_SCRIPT_TEST_ONLY

This script runs Medusa module migrations only against a disposable preprod
database. It verifies expected tables for the China payment/refund read-only
query surface, operating-unit permission surface, and platform module switch
draft surface. It never runs payment,
refund, settlement, commission, payout, fulfillment, logistics, or workflow
execution paths.
USAGE
}

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-preprod-db-rehearsal.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$root/packages/api/node_modules/.bin:$root/node_modules/.bin:$PATH"
  export NODE_PATH="$root/packages/api/node_modules:$root/node_modules:${NODE_PATH:-}"

  command -v node >/dev/null || fail "node is required."
  command -v medusa >/dev/null || fail "medusa CLI is required under packages/api/node_modules/.bin."
}

print_plan() {
  cat <<'PLAN'
Preprod disposable DB rehearsal plan

What it does:
- refuses production-like database names and host tokens
- requires explicit disposable DB, backup/no-backup, operator, and cleanup owner confirmations
- runs medusa db:migrate --skip-links --skip-scripts against the supplied disposable DB
- verifies China payment/refund review query surface, operating-unit permission,
  and platform module switch draft tables
- prints only sanitized database identity and stores migration output in a temp log

What it does not do:
- does not connect in plan mode
- does not auto-drop or reset the database
- does not enable payment/refund/settlement runtime approval
- does not execute workflow or write refund success state
- does not touch settlement, commission, payout, fulfillment, or logistics writes

Use run mode only after a disposable, no-production-data preprod database has
been provisioned and cleanup ownership is agreed.

Use run-local-script-test only for a local disposable database that proves this
script works end to end. That mode does not satisfy the preprod launch gate.
PLAN
}

require_env_value() {
  local name="$1"
  local expected="${2:-}"
  local value="${!name:-}"

  [ -n "$value" ] || fail "Missing required environment variable: $name"
  if [ -n "$expected" ] && [ "$value" != "$expected" ]; then
    fail "$name must equal $expected"
  fi
}

reject_cli_secret_args() {
  for arg in "$@"; do
    case "$arg" in
      *postgres://*|*postgresql://*|*PASSWORD*|*password*|*SECRET*|*secret*|*TOKEN*|*token*|*PAYLOAD*|*payload*|*SIGNATURE*|*signature*)
        fail "Forbidden sensitive CLI argument: $arg"
        ;;
    esac
  done
}

reject_production_like_token() {
  local value="$1"
  local label="$2"
  local lowered

  lowered="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"

  if [[ "$lowered" =~ (^|[-_.])production($|[-_.]) ]] ||
    [[ "$lowered" =~ (^|[-_.])prod($|[-_.]) ]] ||
    [[ "$lowered" =~ (^|[-_.])(live|master|primary)($|[-_.]) ]]; then
    fail "$label looks production-like: $value"
  fi
}

parse_database_url() {
  local url="$1"

  node - "$url" <<'NODE'
const raw = process.argv[2]

try {
  const url = new URL(raw)
  const scheme = url.protocol.replace(/:$/, "")
  if (!["postgres", "postgresql"].includes(scheme)) {
    throw new Error("database URL must use postgres or postgresql scheme")
  }
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""))
  if (!database) {
    throw new Error("database name is required in URL path")
  }
  const username = decodeURIComponent(url.username || "")
  if (!username) {
    throw new Error("database username is required in URL")
  }
  const password = decodeURIComponent(url.password || "")
  const host = url.hostname
  const port = url.port || "5432"
  const sslmode = url.searchParams.get("sslmode") || ""
  const sanitized = `${scheme}://${username ? `${username}@` : ""}${host}:${port}/${database}${sslmode ? `?sslmode=${sslmode}` : ""}`
  process.stdout.write([
    scheme,
    host,
    port,
    database,
    username,
    password,
    sslmode,
    sanitized,
  ].join("\n"))
} catch (error) {
  console.error(`FAIL invalid CODEX_PREPROD_DISPOSABLE_DATABASE_URL: ${error.message}`)
  process.exit(1)
}
NODE
}

sanitize_log_tail() {
  local raw_url="$1"
  local sanitized_target="$2"
  local path="$3"

  node - "$raw_url" "$sanitized_target" "$path" <<'NODE'
const fs = require("fs")
const [rawUrl, sanitizedTarget, path] = process.argv.slice(2)
let text = ""
try {
  text = fs.readFileSync(path, "utf8")
} catch {
  process.exit(0)
}
const lines = text.replaceAll(rawUrl, sanitizedTarget).split(/\r?\n/).slice(-160)
process.stdout.write(lines.join("\n"))
NODE
}

validate_database_target() {
  local db_host="$1"
  local db_name="$2"
  local db_user="$3"
  local allow_regex="${CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX:-^fuyi_preprod_disposable_[A-Za-z0-9_]+$}"
  local lowered_name

  reject_production_like_token "$db_host" "database host"
  reject_production_like_token "$db_name" "database name"

  case "$db_host" in
    localhost|127.0.0.1|::1)
      if [ "$mode" = "run-local-script-test" ]; then
        require_env_value CODEX_PREPROD_DISPOSABLE_DB_LOCAL_SCRIPT_TEST_CONFIRM "$local_script_test_confirm_token"
      elif [ "${CODEX_PREPROD_DISPOSABLE_DB_LOCALHOST_PREPROD_TUNNEL_CONFIRM:-}" = "$localhost_preprod_tunnel_confirm_token" ]; then
        :
      else
        fail "localhost target cannot satisfy preprod rehearsal run without CODEX_PREPROD_DISPOSABLE_DB_LOCALHOST_PREPROD_TUNNEL_CONFIRM."
      fi
      ;;
  esac

  case "$db_name" in
    *[!A-Za-z0-9_]*)
      fail "database name may only contain letters, numbers, and underscores: $db_name"
      ;;
  esac

  case "$(printf '%s' "$db_name" | tr '[:upper:]' '[:lower:]')" in
    postgres|template0|template1|medusa|mercur|fuyi|production|prod|main|primary|live|master)
      fail "refusing reserved or production-like database name: $db_name"
      ;;
  esac

  if [ -n "${CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX:-}" ]; then
    require_env_value CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX_CONFIRM "$custom_regex_confirm_token"
  fi

  if ! [[ "$db_name" =~ $allow_regex ]]; then
    fail "database name '$db_name' does not match allow regex '$allow_regex'"
  fi

  lowered_name="$(printf '%s' "$db_name" | tr '[:upper:]' '[:lower:]')"
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

validate_worktree_ack() {
  if [ -n "$(cd "$root" && git status --porcelain)" ]; then
    require_env_value CODEX_PREPROD_DISPOSABLE_WORKTREE_ACK "$wip_confirm_token"
  fi
}

verify_module_registration() {
  grep -Eq 'resolve:[[:space:]]*["'\'']\./src/modules/china-payment-notification["'\'']' "$root/packages/api/medusa-config.ts" ||
    fail "china-payment-notification module is not registered in packages/api/medusa-config.ts."

  grep -Eq 'resolve:[[:space:]]*["'\'']\./src/modules/china-platform-ops["'\'']' "$root/packages/api/medusa-config.ts" ||
    fail "china-platform-ops module is not registered in packages/api/medusa-config.ts."
}

run_rehearsal() {
  require_env_value CODEX_PREPROD_DISPOSABLE_DATABASE_URL
  require_env_value CODEX_PREPROD_DISPOSABLE_DB_CONFIRM "$confirm_disposable_token"
  require_env_value CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM "$backup_confirm_token"
  require_env_value CODEX_PREPROD_DISPOSABLE_DB_OPERATOR
  require_env_value CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER

  load_runtime
  verify_module_registration
  validate_worktree_ack

  command -v psql >/dev/null || fail "psql is required."
  command -v pg_isready >/dev/null || fail "pg_isready is required."

  local db_parts
  local parsed_db_url=()
  local scheme
  local db_host
  local db_port
  local db_name
  local db_user
  local db_password
  local db_sslmode
  local sanitized_url
  local sanitized_target
  db_parts="$(parse_database_url "$CODEX_PREPROD_DISPOSABLE_DATABASE_URL")"
  mapfile -t parsed_db_url <<<"$db_parts"
  scheme="${parsed_db_url[0]:-}"
  db_host="${parsed_db_url[1]:-}"
  db_port="${parsed_db_url[2]:-}"
  db_name="${parsed_db_url[3]:-}"
  db_user="${parsed_db_url[4]:-}"
  db_password="${parsed_db_url[5]:-}"
  db_sslmode="${parsed_db_url[6]:-}"
  sanitized_url="${parsed_db_url[7]:-}"
  sanitized_target="host=${db_host} port=${db_port} database=${db_name} user=${db_user}"
  if [ -n "$db_sslmode" ]; then
    sanitized_target="${sanitized_target} sslmode=${db_sslmode}"
  fi

  validate_database_target "$db_host" "$db_name" "$db_user"

  export PGHOST="$db_host"
  export PGPORT="$db_port"
  export PGDATABASE="$db_name"
  export PGUSER="$db_user"
  export PGPASSWORD="$db_password"
  if [ -n "$db_sslmode" ]; then
    export PGSSLMODE="$db_sslmode"
  fi

  pg_isready >/dev/null || fail "PostgreSQL is not ready for sanitized target: $sanitized_target"

  local current_db
  current_db="$(psql -v ON_ERROR_STOP=1 -Atc 'select current_database()')"
  [ "$current_db" = "$db_name" ] || fail "Connected database mismatch. Expected $db_name, got $current_db"

  printf 'RUN preprod disposable DB rehearsal target=%s operator=%s cleanup_owner=%s log=%s\n' \
    "$sanitized_target" \
    "$CODEX_PREPROD_DISPOSABLE_DB_OPERATOR" \
    "$CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER" \
    "$log_file"

  if [ "$mode" = "run-local-script-test" ]; then
    printf 'NOTE local script verification mode; this does not satisfy the preprod launch gate.\n'
  fi

  set +e
  (
    cd "$root/packages/api"
    export NODE_ENV=development
    export APP_ENV=preprod
    export MEDUSA_ENV=development
    export CODEX_DATABASE_URL="$CODEX_PREPROD_DISPOSABLE_DATABASE_URL"
    export DATABASE_URL="$CODEX_PREPROD_DISPOSABLE_DATABASE_URL"
    export STORE_CORS="${STORE_CORS:-http://localhost:3101}"
    export ADMIN_CORS="${ADMIN_CORS:-http://localhost:7000}"
    export AUTH_CORS="${AUTH_CORS:-http://localhost:7000}"
    export VENDOR_CORS="${VENDOR_CORS:-http://localhost:7001}"
    export JWT_SECRET="${JWT_SECRET:-supersecret}"
    export COOKIE_SECRET="${COOKIE_SECRET:-supersecret}"
    medusa db:migrate --skip-links --skip-scripts
  ) >"$log_file" 2>&1
  local migrate_status=$?
  set -e

  if [ "$migrate_status" -ne 0 ]; then
    sanitize_log_tail "$CODEX_PREPROD_DISPOSABLE_DATABASE_URL" "$sanitized_target" "$log_file" >&2
    fail "medusa db:migrate failed for sanitized target: $sanitized_target"
  fi

  local table_name
  for table_name in "${required_tables[@]}"; do
    if [ "$(psql -v ON_ERROR_STOP=1 -Atc "select to_regclass('public.${table_name}') is not null")" != "t" ]; then
      fail "missing migrated table $table_name"
    fi
  done

  printf 'PASS preprod disposable DB rehearsal completed for %s\n' "$sanitized_target"
  printf 'PASS verified migrated tables: %s\n' "$(IFS=,; printf '%s' "${required_tables[*]}")"
  printf 'NOTE cleanup/rollback is operator-owned; script did not drop or reset database. cleanup_owner=%s\n' \
    "$CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER"
}

reject_cli_secret_args "$@"

case "$mode" in
  plan|--print-plan)
    print_plan
    ;;
  run|run-local-script-test)
    shift || true
    if [ "$#" -gt 0 ]; then
      fail "run mode does not accept extra CLI arguments. Use approved environment variables."
    fi
    run_rehearsal
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage >&2
    fail "Unsupported mode: $mode"
    ;;
esac
