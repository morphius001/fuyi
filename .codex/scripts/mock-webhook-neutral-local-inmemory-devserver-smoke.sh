#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
log_dir="${TMPDIR:-/tmp}/fuyi-dev"
port="${MOCK_WEBHOOK_DEVSERVER_PORT:-9100}"
host="${MOCK_WEBHOOK_DEVSERVER_HOST:-127.0.0.1}"
base_url="http://${host}:${port}"
pg_port="${MOCK_WEBHOOK_POSTGRES_PORT:-15432}"
database_name="${MOCK_WEBHOOK_DATABASE_NAME:-mercur}"
secret="${CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET:-local_neutral_smoke_secret_not_real}"
server_pid=""

mkdir -p "$log_dir"
log_file="$log_dir/mock-webhook-neutral-${port}.log"

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
}
trap cleanup EXIT

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use 24 >/tmp/fuyi-nvm-use-mock-webhook-neutral-devserver.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v node >/dev/null || fail "node not found after loading nvm."
  command -v bun >/dev/null || fail "bun not found after adding ~/.bun/bin to PATH."
  command -v curl >/dev/null || fail "curl not found."
  command -v psql >/dev/null || fail "psql not found."
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

check_local_database() {
  psql -h 127.0.0.1 -p "$pg_port" -U "$USER" -d "$database_name" -tAc "select 1" >/dev/null
}

load_runtime

if port_open "$port"; then
  fail "Port $port is already in use. Refusing to kill or reuse an existing process."
fi

if ! port_open "$pg_port"; then
  fail "Local postgres port $pg_port is not listening. Start local dev services first."
fi

check_local_database || fail "Local database '$database_name' is not reachable on 127.0.0.1:$pg_port."

echo "START temporary neutral mock webhook API on ${base_url}"
(
  cd "$root/packages/api"
  setsid env \
    CODEX_DATABASE_URL="postgres://${USER}@127.0.0.1:${pg_port}/${database_name}" \
    ADMIN_CORS="http://localhost:7000,http://127.0.0.1:7000" \
    AUTH_CORS="http://localhost:7000,http://127.0.0.1:7000,http://localhost:7001,http://127.0.0.1:7001,http://localhost:3101,http://127.0.0.1:3101" \
    STORE_CORS="http://localhost:3101,http://127.0.0.1:3101" \
    VENDOR_CORS="http://localhost:7001,http://127.0.0.1:7001" \
    CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED="true" \
    CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE="mock_inbox_only" \
    CHINA_PAYMENT_NOTIFICATION_PROVIDER="mock_china_pay" \
    CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY="true" \
    CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET="$secret" \
    NODE_ENV="development" \
    "$root/packages/api/node_modules/.bin/medusa" develop -H "$host" -p "$port" --types=false \
      >"$log_file" 2>&1 < /dev/null &
  echo "$!" >"$log_dir/mock-webhook-neutral-${port}.pid"
)

server_pid="$(cat "$log_dir/mock-webhook-neutral-${port}.pid")"

wait_for_health || fail "Temporary API did not become healthy on $base_url."

MOCK_WEBHOOK_BASE_URL="$base_url" \
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET="$secret" \
  "$root/.codex/scripts/mock-webhook-neutral-route-smoke.sh" local-inmemory

echo "PASS temporary neutral mock webhook local-inmemory devserver smoke completed."
