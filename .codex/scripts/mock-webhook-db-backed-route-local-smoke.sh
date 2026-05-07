#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
log_dir="${TMPDIR:-/tmp}/fuyi-dev"
port="${MOCK_WEBHOOK_DB_DEVSERVER_PORT:-9110}"
host="${MOCK_WEBHOOK_DB_DEVSERVER_HOST:-127.0.0.1}"
base_url="http://${host}:${port}"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
app_database_name="${MOCK_WEBHOOK_APP_DATABASE_NAME:-mercur}"
db_name="${MOCK_WEBHOOK_DRY_RUN_DB:-fuyi_payment_notification_route_dry_run_$(date +%Y%m%d%H%M%S)}"
migration_file="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-payment-notification-route-smoke"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
server_pid=""
created_db=0

mkdir -p "$log_dir" "$work_dir"
log_file="$log_dir/mock-webhook-db-backed-${port}.log"

fail() {
  echo "FAIL $*" >&2
  if [ -f "$log_file" ]; then
    echo "---- $log_file" >&2
    tail -80 "$log_file" >&2 || true
  fi
  exit 1
}

cleanup() {
  if [ -n "$server_pid" ] && kill -0 "$server_pid" >/dev/null 2>&1; then
    kill -TERM "-$server_pid" >/dev/null 2>&1 || kill -TERM "$server_pid" >/dev/null 2>&1 || true
    wait "$server_pid" >/dev/null 2>&1 || true
  fi

  if [ "$created_db" = "1" ]; then
    dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

case "$db_name" in
  fuyi_payment_notification_route_dry_run_*) ;;
  *)
    fail "Refusing to use database '$db_name'. Name must start with fuyi_payment_notification_route_dry_run_."
    ;;
esac

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

check_no_route_db_residuals() {
  local residuals

  residuals="$(
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -tAc \
      "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%'"
  )"

  [ -z "$residuals" ] || fail "Route disposable DB residuals found: $residuals"
}

load_runtime

if port_open "$port"; then
  fail "Port $port is already in use. Refusing to kill or reuse an existing process."
fi

check_local_database || fail "Local app database '$app_database_name' is not reachable on ${pg_host}:${pg_port}."

extract_migration_sql
create_and_verify_disposable_db
dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=0
check_no_route_db_residuals

echo "START temporary neutral mock webhook API on ${base_url}"
(
  cd "$root/packages/api"
  setsid env \
    CODEX_DATABASE_URL="postgres://${pg_user}@${pg_host}:${pg_port}/${app_database_name}" \
    ADMIN_CORS="http://localhost:7000,http://127.0.0.1:7000" \
    AUTH_CORS="http://localhost:7000,http://127.0.0.1:7000,http://localhost:7001,http://127.0.0.1:7001,http://localhost:3101,http://127.0.0.1:3101" \
    STORE_CORS="http://localhost:3101,http://127.0.0.1:3101" \
    VENDOR_CORS="http://localhost:7001,http://127.0.0.1:7001" \
    CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED="true" \
    CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE="mock_inbox_only" \
    CHINA_PAYMENT_NOTIFICATION_PROVIDER="mock_china_pay" \
    CHINA_PAYMENT_NOTIFICATION_LOCAL_DB="true" \
    CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET="local_db_route_smoke_secret_not_real" \
    NODE_ENV="development" \
    "$root/packages/api/node_modules/.bin/medusa" develop -H "$host" -p "$port" --types=false \
      >"$log_file" 2>&1 < /dev/null &
  echo "$!" >"$log_dir/mock-webhook-db-backed-${port}.pid"
)

server_pid="$(cat "$log_dir/mock-webhook-db-backed-${port}.pid")"

wait_for_health || fail "Temporary API did not become healthy on $base_url."

MOCK_WEBHOOK_BASE_URL="$base_url" \
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET="local_db_route_smoke_secret_not_real" \
  "$root/.codex/scripts/mock-webhook-neutral-route-smoke.sh" disabled

check_no_route_db_residuals

echo "PASS neutral mock webhook DB-backed local preflight smoke completed."
