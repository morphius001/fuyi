#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
stamp="$(date +%Y%m%d%H%M%S)"
updown_db="fuyi_market_membership_dry_run_reg_up_${stamp}"
repo_db="fuyi_market_membership_dry_run_reg_repo_${stamp}"
migration_file="$root/packages/api/src/modules/china-market-membership/migrations/Migration20260507000100.ts"
medusa_config="$root/packages/api/medusa-config.ts"

case "$pg_host" in
  127.0.0.1|localhost) ;;
  *)
    echo "Refusing non-local PostgreSQL host '$pg_host'. Registration rehearsal only supports local disposable DBs." >&2
    exit 1
    ;;
esac

command -v psql >/dev/null || {
  echo "psql not found. Install PostgreSQL client tools first." >&2
  exit 1
}

if [ ! -f "$migration_file" ]; then
  echo "Missing migration skeleton: $migration_file" >&2
  exit 1
fi

if grep -q "china-market-membership" "$medusa_config"; then
  echo "Refusing rehearsal because china-market-membership appears registered in medusa-config.ts." >&2
  exit 1
fi

if ! grep -q "class Migration20260507000100" "$migration_file"; then
  echo "Migration class name was not found." >&2
  exit 1
fi

for table_name in \
  china_market \
  china_market_membership \
  china_seller_role \
  china_market_announcement \
  china_market_business_hour \
  china_market_delivery_profile; do
  if ! grep -q "create table if not exists \\\"${table_name}\\\"" "$migration_file"; then
    echo "Migration skeleton is missing expected table: $table_name" >&2
    exit 1
  fi
done

echo "CHECK migration skeleton is present and not registered: passed"

echo "RUN local up/down dry-run rehearsal"
CODEX_PG_HOST="$pg_host" \
  CODEX_PG_PORT="$pg_port" \
  CODEX_PG_USER="$pg_user" \
  CODEX_DRY_RUN_DB="$updown_db" \
  "$root/.codex/scripts/market-membership-local-dry-run.sh"

echo "RUN repository integration rehearsal"
CODEX_PG_HOST="$pg_host" \
  CODEX_PG_PORT="$pg_port" \
  CODEX_PG_USER="$pg_user" \
  CODEX_DRY_RUN_DB="$repo_db" \
  "$root/.codex/scripts/market-membership-repository-integration-test.sh"

leftovers="$(
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -tAc "
    select count(*)
    from pg_database
    where datname in ('$updown_db', '$repo_db');
  "
)"

if [ "$leftovers" != "0" ]; then
  echo "Disposable DB cleanup failed. Leftover count: $leftovers" >&2
  exit 1
fi

echo "CHECK disposable database cleanup: passed"
echo "PASS market membership registration rehearsal completed without runtime registration."
