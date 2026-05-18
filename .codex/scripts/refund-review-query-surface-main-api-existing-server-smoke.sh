#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
log_dir="${TMPDIR:-/tmp}/fuyi-dev"
api_port="9000"
api_url="http://127.0.0.1:${api_port}"
api_pid_file="$log_dir/api-9000.pid"
api_log_file="$log_dir/api-9000.log"
admin_email="${CODEX_HTTP_SMOKE_ADMIN_EMAIL:-codex-refund-review-admin@example.com}"
admin_password="${CODEX_HTTP_SMOKE_ADMIN_PASSWORD:-Codex123456!}"

if [ "${1:-}" = "--plan" ] || [ "${1:-}" = "plan" ]; then
  cat <<PLAN
PLAN refund review query surface main API existing-server smoke
Base URL: ${api_url}
Target interface: GET ${api_url}/admin/china/refund-review-query-surface
Target queries:
- query_kind=platform_refund_id&platform_refund_id=refund_platform_001
- query_kind=approval_persistence_idempotency_key&approval_persistence_idempotency_key=approval_persistence_001
- query_kind=provider_refund_reference&provider_name=wechat_pay&provider_refund_reference=wx_refund_001
- blocked check: query_kind=platform_refund_id&platform_refund_id=refund_platform_missing
Authentication boundary: would use admin email from CODEX_HTTP_SMOKE_ADMIN_EMAIL or the script default (${admin_email}); password stays in CODEX_HTTP_SMOKE_ADMIN_PASSWORD or the script default and is not printed.
Fixture boundary: default smoke delegates fixture seed/cleanup to refund-review-query-surface-existing-server-smoke.sh; plan mode does not invoke it.
Plan mode side effects: will not restart the API, will not kill any process, will not start any process, will not send HTTP requests, and will not write to the database.
PLAN
  exit 0
fi

mkdir -p "$log_dir"

port_open() {
  local port="$1"
  ss -ltn "( sport = :$port )" 2>/dev/null | grep -q ":$port"
}

stop_existing_api() {
  if [ -f "$api_pid_file" ]; then
    local api_pid
    api_pid="$(cat "$api_pid_file" 2>/dev/null || true)"
    if [ -n "$api_pid" ] && kill -0 "$api_pid" 2>/dev/null; then
      kill "$api_pid" 2>/dev/null || true
    fi
    rm -f "$api_pid_file"
  fi

  for _ in $(seq 1 15); do
    if ! port_open "$api_port"; then
      return 0
    fi
    sleep 1
  done

  if port_open "$api_port"; then
    fuser -k "${api_port}/tcp" >/dev/null 2>&1 || true
  fi

  for _ in $(seq 1 15); do
    if ! port_open "$api_port"; then
      return 0
    fi
    sleep 1
  done

  echo "API :${api_port} did not stop cleanly." >&2
  exit 1
}

start_main_api() {
  (
    export NODE_ENV=development
    export APP_ENV=staging
    export MEDUSA_ENV=development
    export CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED=true
    export CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE=isolated_preprod_repository
    export CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV=isolated_preprod
    setsid "$root/.codex/scripts/run-api-dev.sh" "$api_port" >"$api_log_file" 2>&1 < /dev/null &
    api_pid="$!"
    disown "$api_pid" 2>/dev/null || true
    echo "$api_pid" >"$api_pid_file"
  )
}

wait_for_api() {
  for _ in $(seq 1 60); do
    if "$root/.codex/scripts/admin-login-smoke.sh" "$api_url" "$admin_email" "$admin_password" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done

  echo "Main API refund review query surface smoke server did not become ready." >&2
  tail -n 120 "$api_log_file" >&2 || true
  exit 1
}

stop_existing_api
start_main_api
wait_for_api
"$root/.codex/scripts/refund-review-query-surface-existing-server-smoke.sh" "$api_url" "$admin_email" "$admin_password"
echo "PASS refund review query surface main API existing-server smoke completed against ${api_url}"
