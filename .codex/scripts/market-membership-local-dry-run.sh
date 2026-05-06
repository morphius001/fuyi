#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_market_membership_dry_run_$(date +%Y%m%d%H%M%S)}"
migration_file="$root/packages/api/src/modules/china-market-membership/migrations/Migration20260507000100.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-market-membership-dry-run"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
created_db=0

mkdir -p "$work_dir"

case "$db_name" in
  fuyi_market_membership_dry_run_*) ;;
  *)
    echo "Refusing to use database '$db_name'. Name must start with fuyi_market_membership_dry_run_." >&2
    exit 1
    ;;
esac

cleanup() {
  if [ "$created_db" = "1" ]; then
    dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

case "$pg_host" in
  127.0.0.1|localhost) ;;
  *)
    if [ "${CODEX_ALLOW_REMOTE_DRY_RUN:-}" != "1" ]; then
      echo "Refusing non-local PostgreSQL host '$pg_host'. Set CODEX_ALLOW_REMOTE_DRY_RUN=1 only for an approved disposable database." >&2
      exit 1
    fi
    ;;
esac

command -v psql >/dev/null || {
  echo "psql not found. Install PostgreSQL client tools first." >&2
  exit 1
}

command -v createdb >/dev/null || {
  echo "createdb not found. Install PostgreSQL client tools first." >&2
  exit 1
}

command -v dropdb >/dev/null || {
  echo "dropdb not found. Install PostgreSQL client tools first." >&2
  exit 1
}

command -v node >/dev/null || {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-market-dry-run.log
  fi
}

command -v node >/dev/null || {
  echo "node not found after loading nvm. Cannot extract migration SQL." >&2
  exit 1
}

pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" >/dev/null || {
  echo "PostgreSQL is not ready at ${pg_host}:${pg_port}." >&2
  echo "Start local services with .codex/scripts/start-dev.sh start, then rerun this script." >&2
  exit 1
}

node - "$migration_file" "$up_sql" "$down_sql" <<'NODE'
const fs = require("fs")

const [, , migrationFile, upSql, downSql] = process.argv
const source = fs.readFileSync(migrationFile, "utf8")
const blocks = Array.from(source.matchAll(/this\.addSql\(`([\s\S]*?)`\)/g)).map(
  (match) => match[1].trim(),
)

if (blocks.length < 8) {
  throw new Error(`Expected migration SQL blocks, got ${blocks.length}`)
}

const downCount = 6
fs.writeFileSync(upSql, `${blocks.slice(0, -downCount).join("\n\n")}\n`)
fs.writeFileSync(downSql, `${blocks.slice(-downCount).join("\n")}\n`)
NODE

echo "CREATE disposable dry-run database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

echo "APPLY migration up SQL"
"${psql_base[@]}" -f "$up_sql" >/dev/null

echo "CHECK tables and constraints"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  expected_tables text[] := array[
    'china_market',
    'china_market_membership',
    'china_seller_role',
    'china_market_announcement',
    'china_market_business_hour',
    'china_market_delivery_profile'
  ];
  table_name text;
begin
  foreach table_name in array expected_tables loop
    if to_regclass(table_name) is null then
      raise exception 'missing table %', table_name;
    end if;
  end loop;
end $$;

insert into china_market (id, name, slug, province, city, district, address, status, service_range_note)
values ('market_dry_run_001', '三门海鲜市场', 'sanmen-dry-run', '浙江', '台州', '三门', '海润街道 dry-run', 'open', 'dry-run only');

insert into china_market_membership (
  id, market_id, seller_id, seller_handle, seller_name, booth_no, stall_name,
  is_primary, status, main_category_ids, merchant_type_keys
) values (
  'membership_dry_run_001', 'market_dry_run_001', 'sel_dry_run_001',
  'dry-run-seller', 'Dry Run 鲜活档', 'A区18号', 'Dry Run 一号档',
  true, 'open', '["pcat_dry_run"]'::jsonb, '["seafood_stall"]'::jsonb
);

insert into china_seller_role (id, seller_id, market_id, role_key, status)
values ('role_dry_run_001', 'sel_dry_run_001', 'market_dry_run_001', 'seafood_stall', 'active');

insert into china_market_announcement (id, market_id, audience, title, content, severity, status)
values ('ann_dry_run_001', 'market_dry_run_001', 'merchant', 'Dry Run 公告', '仅用于本地 dry-run。', 'info', 'published');

insert into china_market_business_hour (id, market_id, weekday, opens_at, closes_at, is_closed, note)
values ('hours_dry_run_001', 'market_dry_run_001', 1, '05:30', '17:30', false, 'dry-run');

insert into china_market_delivery_profile (
  id, market_id, delivery_type, display_name, enabled, cutoff_time,
  merchant_selectable, runtime_enabled, checkout_impact, service_area_note
) values (
  'delivery_dry_run_001', 'market_dry_run_001', 'market_unified_delivery',
  '市场统一配送 dry-run', true, '15:00', true, false, 'none', 'dry-run only'
);

do $$
begin
  begin
    insert into china_market_delivery_profile (
      id, market_id, delivery_type, display_name, checkout_impact
    ) values (
      'delivery_bad_checkout', 'market_dry_run_001', 'market_pickup', 'bad', 'checkout'
    );
    raise exception 'checkout_impact constraint did not reject bad value';
  exception when check_violation then
    null;
  end;

  begin
    insert into china_market_announcement (id, market_id, audience, title, content)
    values ('ann_bad_audience', 'market_dry_run_001', 'supplier', 'bad', 'bad');
    raise exception 'announcement audience constraint did not reject bad value';
  exception when check_violation then
    null;
  end;
end $$;
SQL

echo "CHECK row counts"
"${psql_base[@]}" -tAc "
select
  (select count(*) from china_market) as markets,
  (select count(*) from china_market_membership) as memberships,
  (select count(*) from china_seller_role) as roles,
  (select count(*) from china_market_announcement) as announcements,
  (select count(*) from china_market_business_hour) as business_hours,
  (select count(*) from china_market_delivery_profile) as delivery_profiles;
"

echo "APPLY migration down SQL"
"${psql_base[@]}" -f "$down_sql" >/dev/null

echo "CHECK rollback removed dry-run tables"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'china_market',
    'china_market_membership',
    'china_seller_role',
    'china_market_announcement',
    'china_market_business_hour',
    'china_market_delivery_profile'
  ] loop
    if to_regclass(table_name) is not null then
      raise exception 'table still exists after down: %', table_name;
    end if;
  end loop;
end $$;
SQL

echo "PASS market membership local dry-run completed and disposable database will be dropped."
