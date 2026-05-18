#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_HTTP_SMOKE_DB:-mercur}"
database_url="postgres://${pg_user}@${pg_host}:${pg_port}/${db_name}"
api_port="${CODEX_HTTP_SMOKE_PORT:-19000}"
log_dir="${TMPDIR:-/tmp}/fuyi-refund-review-query-surface-devserver"
server_log="$log_dir/server.log"
pid_file="$log_dir/server.pid"
admin_email="${CODEX_HTTP_SMOKE_ADMIN_EMAIL:-codex-refund-review-admin@example.com}"
admin_password="${CODEX_HTTP_SMOKE_ADMIN_PASSWORD:-Codex123456!}"

mkdir -p "$log_dir"

port_open() {
  local port="$1"
  ss -ltn "( sport = :$port )" 2>/dev/null | grep -q ":$port"
}

for cmd in curl ss; do
  command -v "$cmd" >/dev/null || {
    echo "$cmd not found. Install required tools first." >&2
    exit 1
  }
done

export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/code/fuyi/packages/api/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export NODE_PATH="/home/codex/code/fuyi/packages/api/node_modules:/home/codex/code/fuyi/node_modules"

for cmd in node medusa; do
  command -v "$cmd" >/dev/null || {
    echo "$cmd not found in shared toolchain path." >&2
    exit 1
  }
done

if port_open "$api_port"; then
  echo "OK existing refund review query surface server on :$api_port"
else
  (
    export NODE_ENV=development
    export APP_ENV=staging
    export MEDUSA_ENV=development
    export CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED=true
    export CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE=isolated_preprod_repository
    export CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV=isolated_preprod
    export CODEX_DATABASE_URL="$database_url"
    setsid "$root/.codex/scripts/run-api-dev.sh" "$api_port" >"$server_log" 2>&1 < /dev/null &
    server_pid="$!"
    disown "$server_pid" 2>/dev/null || true
    echo "$server_pid" >"$pid_file"
  )
fi

for _ in $(seq 1 60); do
  if curl -fsS -X OPTIONS "http://127.0.0.1:${api_port}/auth/user/emailpass" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! port_open "$api_port"; then
  echo "Refund review query surface dev server is not listening on :$api_port" >&2
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

if ! /home/codex/code/fuyi-pr-bx-workflow-runtime/.codex/scripts/admin-login-smoke.sh "http://127.0.0.1:${api_port}" "$admin_email" "$admin_password" >/dev/null 2>&1; then
  echo "Refund review query surface dev server started but admin login smoke failed." >&2
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

echo "PASS refund review query surface dev server ready on http://127.0.0.1:${api_port}"
