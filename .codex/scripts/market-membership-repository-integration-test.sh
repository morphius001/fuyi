#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_market_membership_dry_run_repo_$(date +%Y%m%d%H%M%S)}"
migration_file="$root/packages/api/src/modules/china-market-membership/migrations/Migration20260507000100.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-market-membership-repository-integration"
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
    nvm use >/tmp/fuyi-nvm-use-market-repo-integration.log
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

assert_eq() {
  local actual="$1"
  local expected="$2"
  local label="$3"

  if [ "$actual" != "$expected" ]; then
    echo "ASSERT failed: $label expected '$expected' got '$actual'" >&2
    exit 1
  fi
}

echo "CREATE disposable repository integration database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

missing_before="$("${psql_base[@]}" -tAc "select coalesce(to_regclass('china_market_membership')::text, 'missing');")"
assert_eq "$missing_before" "missing" "required table missing before migration"
echo "CHECK missing-table state before migration: passed"

echo "APPLY migration up SQL"
"${psql_base[@]}" -f "$up_sql" >/dev/null

echo "INSERT repository integration fixture"
"${psql_base[@]}" >/dev/null <<'SQL'
insert into china_market (id, name, slug, province, city, district, address, status, service_range_note)
values
  ('market_repo_001', '三门海鲜市场', 'repo-sanmen', '浙江', '台州', '三门', '海润街道 repo dry-run', 'open', '三门城区 repo dry-run'),
  ('market_repo_002', '舟山沈家门市场', 'repo-zhoushan', '浙江', '舟山', '普陀', '沈家门 repo dry-run', 'open', '舟山 repo dry-run');

insert into china_market_membership (
  id, market_id, seller_id, seller_handle, seller_name, booth_no, stall_name,
  is_primary, status, main_category_ids, merchant_type_keys
) values
  (
    'membership_repo_001', 'market_repo_001', 'sel_repo_001',
    'repo-seafood-stall', 'Repo 鲜活档', 'A区18号', 'Repo 一号档',
    true, 'open', '["pcat_repo_crab"]'::jsonb, '["seafood_stall"]'::jsonb
  ),
  (
    'membership_repo_002', 'market_repo_002', 'sel_repo_001',
    'repo-seafood-stall', 'Repo 鲜活档', 'B区06号', 'Repo 联营档',
    false, 'paused', '["pcat_repo_fish"]'::jsonb, '["regional_wholesaler"]'::jsonb
  ),
  (
    'membership_repo_other', 'market_repo_001', 'sel_repo_other',
    'repo-other', 'Repo 其它档', 'C区01号', 'Repo 其它档',
    false, 'open', '[]'::jsonb, '["fruit_vegetable"]'::jsonb
  );

insert into china_seller_role (id, seller_id, market_id, role_key, status)
values
  ('role_repo_seafood', 'sel_repo_001', 'market_repo_001', 'seafood_stall', 'active'),
  ('role_repo_regional', 'sel_repo_001', 'market_repo_002', 'regional_wholesaler', 'active'),
  ('role_repo_other', 'sel_repo_other', 'market_repo_001', 'fruit_vegetable', 'active');

insert into china_market_announcement (id, market_id, audience, title, content, severity, status)
values
  ('ann_repo_merchant', 'market_repo_001', 'merchant', 'Repo 商户公告', '仅用于 repository integration。', 'warning', 'published'),
  ('ann_repo_consumer', 'market_repo_001', 'consumer', 'Repo 消费者公告', '消费者公告用于 adapter 过滤验证。', 'info', 'published');

insert into china_market_business_hour (id, market_id, weekday, opens_at, closes_at, is_closed, note)
values
  ('hours_repo_001', 'market_repo_001', 1, '05:30', '17:30', false, 'repo dry-run'),
  ('hours_repo_002', 'market_repo_002', 2, '06:00', '16:00', false, 'repo dry-run');

insert into china_market_delivery_profile (
  id, market_id, delivery_type, display_name, enabled, cutoff_time,
  merchant_selectable, runtime_enabled, checkout_impact, service_area_note
) values
  (
    'delivery_repo_pickup', 'market_repo_001', 'market_pickup',
    'Repo 市场自提', true, '16:30', false, false, 'none', 'repo dry-run'
  ),
  (
    'delivery_repo_unified', 'market_repo_001', 'market_unified_delivery',
    'Repo 市场统一配送', true, '15:00', true, false, 'none', 'repo dry-run'
  );
SQL

echo "CHECK repository ready query contract"
ready_counts="$("${psql_base[@]}" -tAc "
with seller_memberships as (
  select * from china_market_membership
  where deleted_at is null and seller_id = 'sel_repo_001'
),
market_ids as (
  select distinct market_id from seller_memberships
)
select
  (select count(*) from china_market where deleted_at is null and id in (select market_id from market_ids)) || '|' ||
  (select count(*) from seller_memberships) || '|' ||
  (select count(*) from china_seller_role where deleted_at is null and seller_id = 'sel_repo_001') || '|' ||
  (select count(*) from china_market_announcement where deleted_at is null and market_id in (select market_id from market_ids)) || '|' ||
  (select count(*) from china_market_business_hour where deleted_at is null and market_id in (select market_id from market_ids)) || '|' ||
  (select count(*) from china_market_delivery_profile where deleted_at is null and market_id in (select market_id from market_ids));
")"
assert_eq "$ready_counts" "2|2|2|2|2|2" "repository ready row counts"

echo "CHECK seller-owned market filter contract"
market_filter_counts="$("${psql_base[@]}" -tAc "
with seller_memberships as (
  select * from china_market_membership
  where deleted_at is null and seller_id = 'sel_repo_001' and market_id = 'market_repo_002'
),
market_ids as (
  select distinct market_id from seller_memberships
)
select
  (select count(*) from china_market where deleted_at is null and id in (select market_id from market_ids)) || '|' ||
  (select count(*) from seller_memberships) || '|' ||
  (select count(*) from china_market_announcement where deleted_at is null and market_id in (select market_id from market_ids)) || '|' ||
  (select count(*) from china_market_delivery_profile where deleted_at is null and market_id in (select market_id from market_ids));
")"
assert_eq "$market_filter_counts" "1|1|0|0" "seller-owned market filter row counts"

echo "CHECK no-membership fallback contract"
empty_counts="$("${psql_base[@]}" -tAc "
with seller_memberships as (
  select * from china_market_membership
  where deleted_at is null and seller_id = 'sel_repo_missing'
),
market_ids as (
  select distinct market_id from seller_memberships
)
select
  (select count(*) from china_market where deleted_at is null and id in (select market_id from market_ids)) || '|' ||
  (select count(*) from seller_memberships);
")"
assert_eq "$empty_counts" "0|0" "no-membership fallback row counts"

checkout_impact="$("${psql_base[@]}" -tAc "select string_agg(distinct checkout_impact, ',') from china_market_delivery_profile;")"
assert_eq "$checkout_impact" "none" "checkout impact remains none"

runtime_enabled="$("${psql_base[@]}" -tAc "select bool_or(runtime_enabled) from china_market_delivery_profile;")"
assert_eq "$runtime_enabled" "f" "runtime enabled remains false"

echo "APPLY migration down SQL"
"${psql_base[@]}" -f "$down_sql" >/dev/null

tables_after_down="$("${psql_base[@]}" -tAc "
select count(*)
from unnest(array[
  'china_market',
  'china_market_membership',
  'china_seller_role',
  'china_market_announcement',
  'china_market_business_hour',
  'china_market_delivery_profile'
]) as table_name
where to_regclass(table_name) is not null;
")"
assert_eq "$tables_after_down" "0" "tables removed after down"

echo "PASS market membership repository integration test completed and disposable database will be dropped."
