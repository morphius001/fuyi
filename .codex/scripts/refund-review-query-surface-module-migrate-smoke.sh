#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_refund_review_query_surface_module_migrate_$(date +%Y%m%d%H%M%S)}"
created_db=0
log_file="${TMPDIR:-/tmp}/fuyi-refund-review-query-surface-module-migrate-smoke.log"

case "$db_name" in
  fuyi_refund_review_query_surface_module_migrate_[0-9]*|fuyi_refund_review_query_surface_module_migrate_local_*) ;;
  *)
    echo "Refusing database '$db_name'. Name must use the module-migrate timestamp or local prefix." >&2
    exit 1
    ;;
esac

case "$db_name" in
  *[!A-Za-z0-9_]*)
    echo "Refusing database '$db_name'. Name may only contain letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

if ! printf "%s" "$db_name" | grep -E '^fuyi_refund_review_query_surface_module_migrate_([0-9]{14}|local_[A-Za-z0-9_]+)$' >/dev/null; then
  echo "Refusing database '$db_name'. Expected fuyi_refund_review_query_surface_module_migrate_YYYYMMDDHHMMSS or local suffix." >&2
  exit 1
fi

case "$pg_host" in
  127.0.0.1|localhost|::1) ;;
  *)
    echo "Refusing non-local PostgreSQL host '$pg_host'." >&2
    exit 1
    ;;
esac

env_hint="$(printf "%s" "${NODE_ENV:-}${MEDUSA_ENV:-}${APP_ENV:-}${CODEX_ENV:-}${DATABASE_URL:-}${CODEX_DATABASE_URL:-}" | tr '[:upper:]' '[:lower:]')"
case "$env_hint" in
  *production*|*prod*|*preprod*|*staging*)
    echo "Refusing module migration smoke while environment hints at production, preprod, or staging." >&2
    exit 1
    ;;
esac

if ! grep -Eq 'resolve:\s*["'"'"']\./src/modules/china-payment-notification["'"'"']' "$root/packages/api/medusa-config.ts"; then
  echo "Refusing module migration smoke: china-payment-notification module is not registered in medusa-config.ts." >&2
  exit 1
fi

cleanup() {
  status=$?
  if [ "$created_db" = "1" ]; then
    dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name" >/dev/null 2>&1 || true
  fi
  exit "$status"
}
trap cleanup EXIT

for cmd in psql createdb dropdb pg_isready; do
  command -v "$cmd" >/dev/null || {
    echo "$cmd not found. Install PostgreSQL client tools first." >&2
    exit 1
  }
done

export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/code/fuyi/packages/api/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export NODE_PATH="/home/codex/code/fuyi/packages/api/node_modules:/home/codex/code/fuyi/node_modules"

command -v node >/dev/null || {
  echo "node not found in expected shared toolchain path." >&2
  exit 1
}

command -v medusa >/dev/null || {
  echo "medusa CLI not found in shared packages/api node_modules/.bin." >&2
  exit 1
}

pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" >/dev/null || {
  echo "PostgreSQL is not ready at ${pg_host}:${pg_port}." >&2
  echo "Start local services with .codex/scripts/start-dev.sh start, then rerun this script." >&2
  exit 1
}

echo "CREATE disposable refund review query surface module migration database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

database_url="postgres://${pg_user}@${pg_host}:${pg_port}/${db_name}"

(
  cd "$root/packages/api"
  export NODE_ENV=development
  export APP_ENV=development
  export MEDUSA_ENV=development
  export CODEX_DATABASE_URL="$database_url"
  export STORE_CORS="http://localhost:3101"
  export ADMIN_CORS="http://localhost:7000"
  export AUTH_CORS="http://localhost:7000"
  export VENDOR_CORS="http://localhost:7001"
  export JWT_SECRET="supersecret"
  export COOKIE_SECRET="supersecret"
  medusa db:migrate --skip-links --skip-scripts >"$log_file" 2>&1
)

tail -n 120 "$log_file"

psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'payment_notification_inbox',
    'china_refund_state_mutation_approval',
    'china_refund_state_mutation_audit',
    'china_refund_state_mutation_runtime_attempt',
    'china_refund_state_mutation_terminal_conflict'
  ] loop
    if to_regclass(table_name) is null then
      raise exception 'missing migrated table %', table_name;
    end if;
  end loop;
end $$;
SQL

echo "PASS refund review query surface module migration smoke completed for database: $db_name"
