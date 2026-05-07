#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
log_dir="${TMPDIR:-/tmp}/fuyi-dev"
pg_data_dir="${HOME}/.local/share/fuyi/postgres-16"
pg_bin_dir="/usr/lib/postgresql/16/bin"
pg_port="15432"
mkdir -p "$log_dir"

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-dev.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v node >/dev/null || {
    echo "node not found after loading nvm. Check ~/.nvm and .nvmrc."
    exit 1
  }

  command -v bun >/dev/null || {
    echo "bun not found after adding ~/.bun/bin to PATH."
    exit 1
  }
}

port_open() {
  local port="$1"
  ss -ltn "( sport = :$port )" 2>/dev/null | grep -q ":$port"
}

ensure_local_postgres() {
  if port_open "$pg_port"; then
    echo "OK   local postgres already listening on :$pg_port"
  else
    mkdir -p "$(dirname "$pg_data_dir")"

    if [ ! -f "$pg_data_dir/PG_VERSION" ]; then
      echo "INIT local postgres data at $pg_data_dir"
      "$pg_bin_dir/initdb" -D "$pg_data_dir" -A trust -U "$USER" >"$log_dir/postgres-init.log" 2>&1
    fi

    echo "START local postgres on :$pg_port"
    "$pg_bin_dir/pg_ctl" \
      -D "$pg_data_dir" \
      -l "$log_dir/postgres-15432.log" \
      -o "-h 127.0.0.1 -p $pg_port -k $log_dir" \
      start >/dev/null
  fi

  "$pg_bin_dir/createdb" -h 127.0.0.1 -p "$pg_port" -U "$USER" mercur >/dev/null 2>&1 || true
}

get_publishable_key() {
  "$pg_bin_dir/psql" \
    -h 127.0.0.1 \
    -p "$pg_port" \
    -U "$USER" \
    -d mercur \
    -tAc "select token from api_key where type = 'publishable' and revoked_at is null order by created_at asc limit 1" \
    2>/dev/null | tr -d '[:space:]'
}

start_service() {
  local name="$1"
  local port="$2"
  local cwd="$3"
  shift 3

  if port_open "$port"; then
    echo "OK   $name already listening on :$port"
    return 0
  fi

  echo "START $name on :$port"
  (
    cd "$cwd"
    setsid "$@" >"$log_dir/$name.log" 2>&1 < /dev/null &
    echo "$!" >"$log_dir/$name.pid"
  )
}

status_service() {
  local name="$1"
  local port="$2"
  if port_open "$port"; then
    echo "OK   $name http://127.0.0.1:$port"
  else
    echo "MISS $name :$port"
    if [ -f "$log_dir/$name.log" ]; then
      echo "---- $log_dir/$name.log"
      tail -20 "$log_dir/$name.log"
    fi
  fi
}

load_runtime

case "${1:-start}" in
  start)
    ensure_local_postgres
    publishable_key="${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-$(get_publishable_key)}"
    publishable_key="${publishable_key:-pk_mock_visual_qa}"

    start_service "api-9000" "9000" "$root/packages/api" \
      env \
        CODEX_DATABASE_URL="postgres://${USER}@127.0.0.1:${pg_port}/mercur" \
        CODEX_DISABLE_SELLER_VISIBILITY_FILTER="${CODEX_DISABLE_SELLER_VISIBILITY_FILTER:-false}" \
        ADMIN_CORS="${ADMIN_CORS:-http://localhost:7000,http://127.0.0.1:7000}" \
        AUTH_CORS="${AUTH_CORS:-http://localhost:7000,http://127.0.0.1:7000,http://localhost:7001,http://127.0.0.1:7001,http://localhost:3101,http://127.0.0.1:3101}" \
        STORE_CORS="${STORE_CORS:-http://localhost:3101,http://127.0.0.1:3101}" \
        VENDOR_CORS="${VENDOR_CORS:-http://localhost:7001,http://127.0.0.1:7001}" \
        "$root/packages/api/node_modules/.bin/medusa" develop

    start_service "admin-7000" "7000" "$root/apps/admin" \
      env \
        VITE_MEDUSA_BACKEND_URL="http://localhost:9000" \
        "$root/node_modules/.bin/vite" --host 0.0.0.0 --port 7000

    start_service "vendor-7001" "7001" "$root/apps/vendor" \
      env \
        VITE_MEDUSA_BACKEND_URL="http://localhost:9000" \
        VITE_MEDUSA_PUBLISHABLE_KEY="$publishable_key" \
        "$root/node_modules/.bin/vite" --host 0.0.0.0 --port 7001

    start_service "storefront-3101" "3101" "$root/apps/storefront" \
      env \
        MEDUSA_BACKEND_URL="http://127.0.0.1:9000" \
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="$publishable_key" \
        NEXT_PUBLIC_DEFAULT_REGION="${NEXT_PUBLIC_DEFAULT_REGION:-cn}" \
        NEXT_PUBLIC_BASE_URL="http://127.0.0.1:3101" \
        "$root/apps/storefront/node_modules/.bin/next" dev -H 0.0.0.0 -p 3101

    sleep 5
    status_service "api-9000" "9000"
    status_service "admin-7000" "7000"
    status_service "vendor-7001" "7001"
    status_service "storefront-3101" "3101"
    echo "OPEN Admin China home http://localhost:7000/dashboard/cn"
    echo "OPEN Vendor Panel      http://localhost:7001/"
    echo "OPEN Storefront        http://localhost:3101/cn"
    ;;

  status)
    status_service "api-9000" "9000"
    status_service "admin-7000" "7000"
    status_service "vendor-7001" "7001"
    status_service "storefront-3101" "3101"
    echo "OPEN Admin China home http://localhost:7000/dashboard/cn"
    echo "OPEN Vendor Panel      http://localhost:7001/"
    echo "OPEN Storefront        http://localhost:3101/cn"
    ;;

  *)
    echo "Usage: .codex/scripts/start-dev.sh [start|status]"
    exit 1
    ;;
esac
