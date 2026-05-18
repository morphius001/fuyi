#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
api_port="${1:-9000}"
pg_port="${CODEX_PG_PORT:-15432}"
database_name="${CODEX_HTTP_SMOKE_DB:-mercur}"
database_url="${CODEX_DATABASE_URL:-postgres://${USER}@127.0.0.1:${pg_port}/${database_name}}"
local_medusa_bin="$root/packages/api/node_modules/.bin/medusa"
shared_medusa_bin="/home/codex/code/fuyi/packages/api/node_modules/.bin/medusa"

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/dev/null 2>&1 || true
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
  export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/code/fuyi/packages/api/node_modules/.bin:$PATH"
  export NODE_PATH="/home/codex/code/fuyi/packages/api/node_modules:/home/codex/code/fuyi/node_modules${NODE_PATH:+:$NODE_PATH}"

  command -v node >/dev/null 2>&1 || {
    echo "node not found after loading runtime." >&2
    exit 1
  }

  command -v bun >/dev/null 2>&1 || {
    echo "bun not found after loading runtime." >&2
    exit 1
  }
}

export NODE_ENV="${NODE_ENV:-development}"
export APP_ENV="${APP_ENV:-development}"
export MEDUSA_ENV="${MEDUSA_ENV:-development}"
export CODEX_DATABASE_URL="$database_url"
export CODEX_DISABLE_SELLER_VISIBILITY_FILTER="${CODEX_DISABLE_SELLER_VISIBILITY_FILTER:-false}"
export ADMIN_CORS="${ADMIN_CORS:-http://localhost:7000,http://127.0.0.1:7000}"
export AUTH_CORS="${AUTH_CORS:-http://localhost:7000,http://127.0.0.1:7000,http://localhost:7001,http://127.0.0.1:7001,http://localhost:3101,http://127.0.0.1:3101,http://localhost:${api_port},http://127.0.0.1:${api_port}}"
export STORE_CORS="${STORE_CORS:-http://localhost:3101,http://127.0.0.1:3101}"
export VENDOR_CORS="${VENDOR_CORS:-http://localhost:7001,http://127.0.0.1:7001}"

load_runtime

if [ -n "${CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED:-}" ]; then
  export CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED
fi

if [ -n "${CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE:-}" ]; then
  export CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE
fi

if [ -n "${CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV:-}" ]; then
  export CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV
fi

if [ -x "$local_medusa_bin" ]; then
  export PATH="$root/packages/api/node_modules/.bin:$PATH"
elif [ -x "$shared_medusa_bin" ]; then
  export PATH="/home/codex/code/fuyi/packages/api/node_modules/.bin:$PATH"
fi

if ! command -v medusa >/dev/null 2>&1; then
  echo "medusa CLI not found in local node_modules, shared node_modules, or PATH." >&2
  exit 1
fi

cd "$root/packages/api"
exec medusa develop -H 127.0.0.1 -p "$api_port"
