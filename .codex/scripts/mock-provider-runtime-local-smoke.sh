#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mode="${1:-disabled}"
log_dir="${TMPDIR:-/tmp}/fuyi-dev"
port="${MOCK_PROVIDER_RUNTIME_DEVSERVER_PORT:-9120}"
host="${MOCK_PROVIDER_RUNTIME_DEVSERVER_HOST:-127.0.0.1}"
base_url="http://${host}:${port}"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
app_database_name="${MOCK_PROVIDER_APP_DATABASE_NAME:-mercur}"
db_name="${MOCK_PROVIDER_DRY_RUN_DB:-fuyi_payment_notification_route_dry_run_$(date +%Y%m%d%H%M%S)_$$}"
db_url="postgres://${pg_user}@${pg_host}:${pg_port}/${db_name}"
runtime_enabled="true"
migration_file="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-payment-provider-runtime-smoke"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
secret="local_provider_route_smoke_secret_not_real"
server_pid=""
listener_pid=""
created_db=0
tmpdir=""

mkdir -p "$log_dir" "$work_dir"
log_file="$log_dir/mock-provider-runtime-${port}.log"

fail() {
  echo "FAIL $*" >&2
  if [ "$created_db" = "1" ]; then
    echo "---- disposable DB count summary: $db_name" >&2
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc \
      "select count(*) from payment_notification_inbox" >&2 || true
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc \
      "select count(*) from payment_notification_event_log" >&2 || true
  fi
  if [ -f "$log_file" ]; then
    echo "---- temporary API log retained for local inspection: $log_file" >&2
  fi
  exit 1
}

case "$mode" in
  disabled | accepted | duplicate | rejected) ;;
  *)
    fail "Usage: $0 [disabled|accepted|duplicate|rejected]"
    ;;
esac

if [ "$mode" = "disabled" ]; then
  runtime_enabled="false"
fi

case "$db_name" in
  fuyi_payment_notification_route_dry_run_*) ;;
  *)
    fail "Refusing to use database '$db_name'. Name must start with fuyi_payment_notification_route_dry_run_."
    ;;
esac

if ! [[ "$db_name" =~ ^fuyi_payment_notification_route_dry_run_[A-Za-z0-9_]+$ ]]; then
  fail "Refusing unsafe database name '$db_name'."
fi

if ! [[ "$app_database_name" =~ ^[A-Za-z0-9_]+$ ]]; then
  fail "Refusing unsafe schema source database name."
fi

case "$pg_host" in
  127.0.0.1 | localhost) ;;
  *)
    fail "Refusing non-local PostgreSQL host '$pg_host'."
    ;;
esac

terminate_process_group() {
  local pid="$1"
  local pgid
  local attempt

  if [ -z "$pid" ] || ! kill -0 "$pid" >/dev/null 2>&1; then
    return 0
  fi

  pgid="$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ' || true)"
  if [ -n "$pgid" ]; then
    kill -TERM "-$pgid" >/dev/null 2>&1 || true
  else
    kill -TERM "$pid" >/dev/null 2>&1 || true
  fi

  for attempt in $(seq 1 20); do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.2
  done

  if [ -n "$pgid" ]; then
    kill -KILL "-$pgid" >/dev/null 2>&1 || true
  else
    kill -KILL "$pid" >/dev/null 2>&1 || true
  fi
}

stop_server() {
  if [ -n "$listener_pid" ]; then
    local listener_pgid
    local server_pgid

    listener_pgid="$(ps -o pgid= -p "$listener_pid" 2>/dev/null | tr -d ' ' || true)"
    server_pgid="$(ps -o pgid= -p "$server_pid" 2>/dev/null | tr -d ' ' || true)"
    if [ -n "$listener_pgid" ] && [ "$listener_pgid" = "$server_pgid" ]; then
      terminate_process_group "$listener_pid"
    fi
  fi
  terminate_process_group "$server_pid"
  wait "$server_pid" >/dev/null 2>&1 || true
  listener_pid=""
  server_pid=""
}

drop_disposable_db() {
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -tAc \
    "select pg_terminate_backend(pid) from pg_stat_activity where datname = '$db_name' and pid <> pg_backend_pid()" \
    >/dev/null 2>&1 || true
  dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name" >/dev/null 2>&1 || true
}

cleanup() {
  stop_server
  if [ -n "$tmpdir" ]; then
    rm -rf "$tmpdir"
  fi

  if [ "$created_db" = "1" ]; then
    drop_disposable_db
  fi
}
trap cleanup EXIT

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use 24 >/tmp/fuyi-nvm-use-mock-provider-runtime-smoke.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v node >/dev/null || fail "node not found after loading nvm."
  command -v bun >/dev/null || fail "bun not found after adding ~/.bun/bin to PATH."
  command -v curl >/dev/null || fail "curl not found."
  command -v psql >/dev/null || fail "psql not found."
  command -v pg_dump >/dev/null || fail "pg_dump not found."
  command -v createdb >/dev/null || fail "createdb not found."
  command -v dropdb >/dev/null || fail "dropdb not found."
}

port_open() {
  local checked_port="$1"
  ss -ltn "( sport = :$checked_port )" 2>/dev/null | grep -q ":$checked_port"
}

port_pid() {
  local checked_port="$1"

  ss -ltnp "( sport = :$checked_port )" 2>/dev/null |
    sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p' |
    head -1
}

wait_for_health() {
  local attempt
  local status

  for attempt in $(seq 1 60); do
    status="$(curl -s -o /dev/null -w "%{http_code}" "$base_url/health" || true)"
    if [ "$status" = "200" ]; then
      return 0
    fi
    sleep 1
  done

  return 1
}

extract_migration_sql() {
  node - "$migration_file" "$up_sql" "$down_sql" <<'NODE'
const fs = require("fs")

const [, , migrationFile, upSql, downSql] = process.argv
const source = fs.readFileSync(migrationFile, "utf8")
const blocks = Array.from(source.matchAll(/this\.addSql\(`([\s\S]*?)`\)/g)).map(
  (match) => match[1].trim(),
)

if (blocks.length !== 9) {
  throw new Error(`Expected 9 migration SQL blocks, got ${blocks.length}`)
}

const downCount = 2
fs.writeFileSync(upSql, `${blocks.slice(0, -downCount).join("\n\n")}\n`)
fs.writeFileSync(downSql, `${blocks.slice(-downCount).join("\n")}\n`)
NODE
}

check_local_database() {
  pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" >/dev/null
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$app_database_name" -tAc "select 1" >/dev/null
}

create_disposable_app_db() {
  echo "CREATE disposable provider runtime database: $db_name"
  createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
  created_db=1

  echo "COPY local app schema into disposable provider runtime database"
  pg_dump -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$app_database_name" \
    --schema-only --no-owner --no-privileges |
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 >/dev/null

  echo "APPLY payment notification inbox up SQL"
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 -f "$up_sql" >/dev/null
  local initial_count
  initial_count="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc "select count(*) from payment_notification_inbox")"
  [ "$initial_count" = "0" ] || fail "Expected empty payment_notification_inbox before smoke, got $initial_count"
}

check_no_route_db_residuals() {
  local residuals

  residuals="$(
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -tAc \
      "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%'"
  )"

  [ -z "$residuals" ] || fail "Route disposable DB residuals found: $residuals"
}

http_post() {
  local output_file="$1"
  shift

  curl --max-time 30 -sS -o "$output_file" -w "%{http_code}" -X POST "${base_url}/china/payment-providers/mock" "$@"
}

json_field() {
  local file="$1"
  local field="$2"

  node - "$file" "$field" 2>/dev/null <<'NODE'
const fs = require("fs")
const file = process.argv[2]
const field = process.argv[3]
let body
try {
  body = JSON.parse(fs.readFileSync(file, "utf8"))
} catch {
  process.exit(3)
}
const value = field.split(".").reduce((acc, key) => acc == null ? undefined : acc[key], body)
if (value === undefined) {
  process.exit(2)
}
process.stdout.write(String(value))
NODE
}

assert_json_field() {
  local file="$1"
  local field="$2"
  local expected="$3"
  local actual

  actual="$(json_field "$file" "$field")" || fail "Missing JSON field: $field"
  [ "$actual" = "$expected" ] || fail "Expected $field=$expected but got $actual"
}

assert_response_absent() {
  local file="$1"
  local needle="$2"
  local label="$3"

  if [ -n "$needle" ] && grep -F "$needle" "$file" >/dev/null; then
    fail "Response leaked $label"
  fi
}

build_signature() {
  local file="$1"

  MOCK_SECRET="$secret" node - "$file" <<'NODE'
const crypto = require("crypto")
const fs = require("fs")
const rawBody = fs.readFileSync(process.argv[2], "utf8")
const secret = process.env.MOCK_SECRET
const digest = crypto.createHash("sha256").update(`${rawBody}.${secret}`).digest("hex")
process.stdout.write(`sha256=${digest}`)
NODE
}

assert_db_counts() {
  local expected_inbox_count="$1"
  local required_action="$2"
  local inbox_count
  local required_action_count
  local leak_count

  inbox_count="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc "select count(*) from payment_notification_inbox")"
  [ "$inbox_count" = "$expected_inbox_count" ] || fail "Expected inbox count $expected_inbox_count, got $inbox_count"

  required_action_count="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc "select count(*) from payment_notification_event_log where action = '$required_action'")"
  [ "$required_action_count" != "0" ] || fail "Missing event log action: $required_action"

  leak_count="$(
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc \
      "select count(*) from payment_notification_event_log where metadata::text like '%${secret}%' or metadata::text like '%postgres://%' or metadata::text like '%sha256=%'"
  )"
  [ "$leak_count" = "0" ] || fail "Event log metadata leaked secret, signature, or database URL."
}

assert_empty_db() {
  local inbox_count
  local event_log_count

  inbox_count="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc "select count(*) from payment_notification_inbox")"
  [ "$inbox_count" = "0" ] || fail "Expected rejected smoke inbox count 0, got $inbox_count"

  event_log_count="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc "select count(*) from payment_notification_event_log")"
  [ "$event_log_count" = "0" ] || fail "Expected rejected smoke event log count 0, got $event_log_count"
}

run_disabled_case() {
  local body_file
  local status

  tmpdir="$(mktemp -d)"
  body_file="$tmpdir/response.json"

  status="$(http_post "$body_file")"

  [ "$status" = "503" ] || fail "Expected disabled HTTP 503, got $status"
  assert_json_field "$body_file" "status" "disabled"
  assert_json_field "$body_file" "provider" "mock_china_pay"
  assert_json_field "$body_file" "runtime" "disabled"
  assert_response_absent "$body_file" "$secret" "mock secret"
  assert_response_absent "$body_file" "sha256=" "signature"
  assert_response_absent "$body_file" "workflow" "workflow"
  echo "PASS provider runtime disabled case"
}

run_local_db_cases() {
  local payload_file
  local body_file
  local signature
  local status

  tmpdir="$(mktemp -d)"
  payload_file="$tmpdir/payload.json"
  body_file="$tmpdir/response.json"

  printf '%s' '{"event_id":"evt_provider_db_smoke_001","event_type":"payment.succeeded","merchant_order_ref":"pay_provider_db_smoke_001","payment_session_id":"payses_provider_db_smoke_001","provider_transaction_id":"mock_txn_provider_db_smoke_001","amount":128560,"currency":"CNY"}' >"$payload_file"
  signature="$(build_signature "$payload_file")"

  status="$(http_post "$body_file" \
    -H "content-type: application/json" \
    -H "x-mock-payment-signature: $signature" \
    -H "x-mock-payment-event-id: evt_provider_db_smoke_001" \
    --data-binary "@$payload_file")"

  [ "$status" = "202" ] || fail "Expected accepted HTTP 202, got $status"
  assert_json_field "$body_file" "status" "accepted"
  assert_json_field "$body_file" "route" "mock_payment_provider_runtime_local_inbox_only"
  assert_response_absent "$body_file" "$(cat "$payload_file")" "raw payload"
  assert_response_absent "$body_file" "$secret" "mock secret"
  assert_response_absent "$body_file" "$signature" "signature"
  assert_response_absent "$body_file" "x-mock-payment-signature" "signature header name"
  assert_response_absent "$body_file" "$db_url" "database URL"
  assert_db_counts "1" "verified"
  echo "PASS provider runtime local DB accepted case"

  if [ "$mode" = "duplicate" ]; then
    status="$(http_post "$body_file" \
      -H "content-type: application/json" \
      -H "x-mock-payment-signature: $signature" \
      -H "x-mock-payment-event-id: evt_provider_db_smoke_001" \
      --data-binary "@$payload_file")"

    [ "$status" = "200" ] || fail "Expected duplicate HTTP 200, got $status"
    assert_json_field "$body_file" "status" "duplicate"
    assert_json_field "$body_file" "route" "mock_payment_provider_runtime_local_inbox_only"
    assert_response_absent "$body_file" "$(cat "$payload_file")" "raw payload"
    assert_response_absent "$body_file" "$secret" "mock secret"
    assert_response_absent "$body_file" "$signature" "signature"
    assert_response_absent "$body_file" "x-mock-payment-signature" "signature header name"
    assert_response_absent "$body_file" "$db_url" "database URL"
    assert_db_counts "1" "dedupe_hit"
    echo "PASS provider runtime local DB duplicate case"
  fi
}

run_rejected_case() {
  local payload_file
  local body_file
  local status

  tmpdir="$(mktemp -d)"
  payload_file="$tmpdir/payload.json"
  body_file="$tmpdir/response.json"

  printf '%s' '{"event_id":"evt_provider_db_rejected_001","event_type":"payment.succeeded","merchant_order_ref":"pay_provider_db_rejected_001","payment_session_id":"payses_provider_db_rejected_001","provider_transaction_id":"mock_txn_provider_db_rejected_001","amount":128560,"currency":"CNY"}' >"$payload_file"

  status="$(http_post "$body_file" \
    -H "content-type: application/json" \
    --data-binary "@$payload_file")"

  [ "$status" = "400" ] || fail "Expected missing signature HTTP 400, got $status"
  assert_json_field "$body_file" "status" "rejected"
  assert_json_field "$body_file" "code" "SIGNATURE_MISSING"
  assert_json_field "$body_file" "route" "mock_payment_provider_runtime_local_inbox_only"
  assert_response_absent "$body_file" "$(cat "$payload_file")" "raw payload"
  assert_response_absent "$body_file" "$secret" "mock secret"
  assert_response_absent "$body_file" "$db_url" "database URL"
  assert_empty_db
  echo "PASS provider runtime local DB missing signature case"
}

load_runtime

if port_open "$port"; then
  fail "Port $port is already in use. Refusing to kill or reuse an existing process."
fi

check_local_database || fail "Local app database '$app_database_name' is not reachable on ${pg_host}:${pg_port}."
extract_migration_sql
create_disposable_app_db

echo "START temporary mock provider runtime API on ${base_url}"
(
  cd "$root/packages/api"
  setsid env \
    CODEX_DATABASE_URL="$db_url" \
    ADMIN_CORS="http://localhost:7000,http://127.0.0.1:7000" \
    AUTH_CORS="http://localhost:7000,http://127.0.0.1:7000,http://localhost:7001,http://127.0.0.1:7001,http://localhost:3101,http://127.0.0.1:3101" \
    STORE_CORS="http://localhost:3101,http://127.0.0.1:3101" \
    VENDOR_CORS="http://localhost:7001,http://127.0.0.1:7001" \
    CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED="$runtime_enabled" \
    CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE="mock_inbox_only" \
    CHINA_PAYMENT_NOTIFICATION_PROVIDER="mock_china_pay" \
    CHINA_PAYMENT_PROVIDER_REGISTRY_MODE="mock_contract_only" \
    CHINA_PAYMENT_NOTIFICATION_LOCAL_DB="true" \
    CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL="$db_url" \
    CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME="$db_name" \
    CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET="$secret" \
    NODE_ENV="development" \
    "$root/packages/api/node_modules/.bin/medusa" develop -H "$host" -p "$port" --types=false \
      >"$log_file" 2>&1 < /dev/null &
  echo "$!" >"$log_dir/mock-provider-runtime-${port}.pid"
)

server_pid="$(cat "$log_dir/mock-provider-runtime-${port}.pid")"
wait_for_health || fail "Temporary API did not become healthy on $base_url."
listener_pid="$(port_pid "$port" || true)"

case "$mode" in
  disabled)
    run_disabled_case
    ;;
  accepted | duplicate)
    run_local_db_cases
    ;;
  rejected)
    run_rejected_case
    ;;
esac

stop_server
drop_disposable_db
created_db=0
check_no_route_db_residuals

echo "PASS mock provider runtime local smoke completed in mode: $mode."
