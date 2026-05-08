#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mode="${1:-disabled}"
log_dir="${TMPDIR:-/tmp}/fuyi-dev"
port="9110"
host="${MOCK_WEBHOOK_DB_DEVSERVER_HOST:-127.0.0.1}"
base_url="http://${host}:${port}"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
app_database_name="${MOCK_WEBHOOK_APP_DATABASE_NAME:-mercur}"
db_name="${MOCK_WEBHOOK_DRY_RUN_DB:-fuyi_payment_notification_route_dry_run_$(date +%Y%m%d%H%M%S)}"
db_url="postgres://${pg_user}@${pg_host}:${pg_port}/${db_name}"
migration_file="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-payment-notification-route-smoke"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
server_pid=""
created_db=0
tmpdir=""

mkdir -p "$log_dir" "$work_dir"
log_file="$log_dir/mock-webhook-db-backed-${port}.log"

fail() {
  echo "FAIL $*" >&2
  if [ "$created_db" = "1" ]; then
    echo "---- disposable DB debug: $db_name" >&2
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc \
      "select count(*) from payment_notification_inbox" >&2 || true
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc \
      "select provider, idempotency_key, processing_status from payment_notification_inbox" >&2 || true
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -tAc \
      "select action, metadata::text from payment_notification_event_log order by created_at" >&2 || true
  fi
  if [ -f "$log_file" ]; then
    echo "---- $log_file" >&2
    tail -80 "$log_file" >&2 || true
  fi
  exit 1
}

case "$mode" in
  disabled | accepted | duplicate) ;;
  *)
    fail "Usage: $0 [disabled|accepted|duplicate]"
    ;;
esac

stop_server() {
  if [ -n "$server_pid" ] && kill -0 "$server_pid" >/dev/null 2>&1; then
    kill -TERM "-$server_pid" >/dev/null 2>&1 || kill -TERM "$server_pid" >/dev/null 2>&1 || true
    wait "$server_pid" >/dev/null 2>&1 || true
  fi
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

case "$db_name" in
  fuyi_payment_notification_route_dry_run_*) ;;
  *)
    fail "Refusing to use database '$db_name'. Name must start with fuyi_payment_notification_route_dry_run_."
    ;;
esac

if ! [[ "$db_name" =~ ^fuyi_payment_notification_route_dry_run_[A-Za-z0-9_]+$ ]]; then
  fail "Refusing unsafe database name '$db_name'."
fi

case "$pg_host" in
  127.0.0.1|localhost) ;;
  *)
    if [ "${CODEX_ALLOW_REMOTE_DRY_RUN:-}" != "1" ]; then
      fail "Refusing non-local PostgreSQL host '$pg_host'."
    fi
    ;;
esac

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use 24 >/tmp/fuyi-nvm-use-mock-webhook-db-backed-smoke.log
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

create_and_verify_disposable_db() {
  echo "CREATE disposable route smoke database: $db_name"
  createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
  created_db=1

  local psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

  echo "APPLY payment notification inbox up SQL"
  "${psql_base[@]}" -f "$up_sql" >/dev/null

  echo "CHECK payment notification route smoke tables"
  "${psql_base[@]}" >/dev/null <<'SQL'
do $$
begin
  if to_regclass('payment_notification_inbox') is null then
    raise exception 'missing payment_notification_inbox';
  end if;

  if to_regclass('payment_notification_event_log') is null then
    raise exception 'missing payment_notification_event_log';
  end if;
end $$;
SQL

  echo "APPLY payment notification inbox down SQL"
  "${psql_base[@]}" -f "$down_sql" >/dev/null

  echo "CHECK rollback removed route smoke tables"
  "${psql_base[@]}" >/dev/null <<'SQL'
do $$
begin
  if to_regclass('payment_notification_inbox') is not null then
    raise exception 'payment_notification_inbox still exists after down';
  end if;

  if to_regclass('payment_notification_event_log') is not null then
    raise exception 'payment_notification_event_log still exists after down';
  end if;
end $$;
SQL
}

create_disposable_app_db() {
  echo "CREATE disposable route smoke database: $db_name"
  createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
  created_db=1

  echo "COPY local app schema into disposable route smoke database"
  pg_dump -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$app_database_name" \
    --schema-only --no-owner --no-privileges \
    | psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 >/dev/null

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

  curl --max-time 30 -sS -o "$output_file" -w "%{http_code}" -X POST "${base_url}/china/payment-webhooks/mock" "$@"
}

json_field() {
  local file="$1"
  local field="$2"

  node - "$file" "$field" <<'NODE'
const fs = require("fs")
const file = process.argv[2]
const field = process.argv[3]
const body = JSON.parse(fs.readFileSync(file, "utf8"))
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

  actual="$(json_field "$file" "$field")" || fail "Missing JSON field: $field in $(cat "$file")"
  [ "$actual" = "$expected" ] || fail "Expected $field=$expected but got $actual in $(cat "$file")"
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

  MOCK_SECRET="local_db_route_smoke_secret_not_real" node - "$file" <<'NODE'
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
      "select count(*) from payment_notification_event_log where metadata::text like '%local_db_route_smoke_secret_not_real%' or metadata::text like '%postgres://%' or metadata::text like '%sha256=%'"
  )"
  [ "$leak_count" = "0" ] || fail "Event log metadata leaked secret, signature, or database URL."
}

run_local_db_cases() {
  local payload_file
  local body_file
  local signature
  local status

  tmpdir="$(mktemp -d)"
  payload_file="$tmpdir/payload.json"
  body_file="$tmpdir/response.json"

  printf '%s' '{"event_id":"evt_neutral_db_smoke_001","event_type":"payment.succeeded","merchant_order_ref":"pay_neutral_db_smoke_001","payment_session_id":"payses_neutral_db_smoke_001","provider_transaction_id":"mock_txn_neutral_db_smoke_001","amount":128560,"currency":"CNY"}' >"$payload_file"
  signature="$(build_signature "$payload_file")"

  status="$(http_post "$body_file" \
    -H "content-type: application/json" \
    -H "x-mock-payment-signature: $signature" \
    -H "x-mock-payment-event-id: evt_neutral_db_smoke_001" \
    --data-binary "@$payload_file")"

  [ "$status" = "202" ] || fail "Expected accepted HTTP 202, got $status with $(cat "$body_file")"
  assert_json_field "$body_file" "status" "accepted"
  assert_json_field "$body_file" "route" "mock_payment_webhook_neutral_local_db"
  assert_response_absent "$body_file" "$(cat "$payload_file")" "raw payload"
  assert_response_absent "$body_file" "local_db_route_smoke_secret_not_real" "mock secret"
  assert_response_absent "$body_file" "$signature" "signature"
  assert_response_absent "$body_file" "$db_url" "database URL"
  assert_db_counts "1" "verified"
  echo "PASS local DB accepted case"

  if [ "$mode" = "duplicate" ]; then
    status="$(http_post "$body_file" \
      -H "content-type: application/json" \
      -H "x-mock-payment-signature: $signature" \
      -H "x-mock-payment-event-id: evt_neutral_db_smoke_001" \
      --data-binary "@$payload_file")"

    [ "$status" = "200" ] || fail "Expected duplicate HTTP 200, got $status with $(cat "$body_file")"
    assert_json_field "$body_file" "status" "duplicate"
    assert_json_field "$body_file" "route" "mock_payment_webhook_neutral_local_db"
    assert_response_absent "$body_file" "$(cat "$payload_file")" "raw payload"
    assert_response_absent "$body_file" "local_db_route_smoke_secret_not_real" "mock secret"
    assert_response_absent "$body_file" "$signature" "signature"
    assert_response_absent "$body_file" "$db_url" "database URL"
    assert_db_counts "1" "dedupe_hit"
    echo "PASS local DB duplicate case"
  fi

  rm -rf "$tmpdir"
  tmpdir=""
}

load_runtime

if port_open "$port"; then
  fail "Port $port is already in use. Refusing to kill or reuse an existing process."
fi

check_local_database || fail "Local app database '$app_database_name' is not reachable on ${pg_host}:${pg_port}."

extract_migration_sql

if [ "$mode" = "disabled" ]; then
  create_and_verify_disposable_db
  drop_disposable_db
  created_db=0
  check_no_route_db_residuals
else
  create_disposable_app_db
fi

echo "START temporary neutral mock webhook API on ${base_url}"
(
  cd "$root/packages/api"
  setsid env \
    CODEX_DATABASE_URL="$([ "$mode" = "disabled" ] && echo "postgres://${pg_user}@${pg_host}:${pg_port}/${app_database_name}" || echo "$db_url")" \
    ADMIN_CORS="http://localhost:7000,http://127.0.0.1:7000" \
    AUTH_CORS="http://localhost:7000,http://127.0.0.1:7000,http://localhost:7001,http://127.0.0.1:7001,http://localhost:3101,http://127.0.0.1:3101" \
    STORE_CORS="http://localhost:3101,http://127.0.0.1:3101" \
    VENDOR_CORS="http://localhost:7001,http://127.0.0.1:7001" \
    CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED="true" \
    CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE="mock_inbox_only" \
    CHINA_PAYMENT_NOTIFICATION_PROVIDER="mock_china_pay" \
    CHINA_PAYMENT_NOTIFICATION_LOCAL_DB="true" \
    CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL="$db_url" \
    CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME="$db_name" \
    CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET="local_db_route_smoke_secret_not_real" \
    NODE_ENV="development" \
    "$root/packages/api/node_modules/.bin/medusa" develop -H "$host" -p "$port" --types=false \
      >"$log_file" 2>&1 < /dev/null &
  echo "$!" >"$log_dir/mock-webhook-db-backed-${port}.pid"
)

server_pid="$(cat "$log_dir/mock-webhook-db-backed-${port}.pid")"

wait_for_health || fail "Temporary API did not become healthy on $base_url."

if [ "$mode" = "disabled" ]; then
  MOCK_WEBHOOK_BASE_URL="$base_url" \
  CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET="local_db_route_smoke_secret_not_real" \
    "$root/.codex/scripts/mock-webhook-neutral-route-smoke.sh" disabled
else
  run_local_db_cases
  stop_server
  drop_disposable_db
  created_db=0
fi

check_no_route_db_residuals

echo "PASS neutral mock webhook DB-backed local smoke completed in mode: $mode."
