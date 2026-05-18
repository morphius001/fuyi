#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_refund_review_query_surface_dry_run_$(date +%Y%m%d%H%M%S)}"
approval_migration="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260512000300.ts"
review_migration="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260514000100.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-refund-review-query-surface-pg-readers-dry-run"
approval_up_sql="$work_dir/approval-up.sql"
approval_down_sql="$work_dir/approval-down.sql"
review_up_sql="$work_dir/review-up.sql"
review_down_sql="$work_dir/review-down.sql"
created_db=0

mkdir -p "$work_dir"

case "$db_name" in
  fuyi_refund_review_query_surface_dry_run_[0-9]*|fuyi_refund_review_query_surface_dry_run_local_*) ;;
  *)
    echo "Refusing database '$db_name'. Name must use the review-query-surface dry-run timestamp or local prefix." >&2
    exit 1
    ;;
esac

case "$db_name" in
  *[!A-Za-z0-9_]*)
    echo "Refusing database '$db_name'. Name may only contain letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

if ! printf "%s" "$db_name" | grep -E '^fuyi_refund_review_query_surface_dry_run_([0-9]{14}|local_[A-Za-z0-9_]+)$' >/dev/null; then
  echo "Refusing database '$db_name'. Expected fuyi_refund_review_query_surface_dry_run_YYYYMMDDHHMMSS or fuyi_refund_review_query_surface_dry_run_local_<safe_suffix>." >&2
  exit 1
fi

case "$pg_host" in
  127.0.0.1|localhost|::1) ;;
  *)
    echo "Refusing non-local PostgreSQL host '$pg_host'." >&2
    exit 1
    ;;
esac

env_hint="$(printf "%s" "${NODE_ENV:-}${MEDUSA_ENV:-}${APP_ENV:-}${CODEX_ENV:-}${DATABASE_URL:-}" | tr '[:upper:]' '[:lower:]')"
case "$env_hint" in
  *production*|*prod*|*preprod*|*staging*)
    echo "Refusing review query surface dry-run while environment hints at production, preprod, or staging." >&2
    exit 1
    ;;
esac

if ! grep -Eq 'resolve:\s*["'"'"']\./src/modules/china-payment-notification["'"'"']' "$root/packages/api/medusa-config.ts"; then
  echo "Refusing dry-run: china-payment-notification module is not registered in medusa-config.ts." >&2
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
    nvm use >/tmp/fuyi-nvm-use-refund-review-query-surface-dry-run.log
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

node - "$approval_migration" "$approval_up_sql" "$approval_down_sql" 7 2 <<'NODE'
const fs = require("fs")
const [, , migrationFile, upSql, downSql, expectedCountRaw, downCountRaw] = process.argv
const source = fs.readFileSync(migrationFile, "utf8")
const blocks = Array.from(source.matchAll(/this\.addSql\(`([\s\S]*?)`\)/g)).map(
  (match) => match[1].trim(),
)
const expectedCount = Number(expectedCountRaw)
const downCount = Number(downCountRaw)
if (blocks.length !== expectedCount) {
  throw new Error(`Expected ${expectedCount} migration SQL blocks, got ${blocks.length}`)
}
fs.writeFileSync(upSql, `${blocks.slice(0, -downCount).join("\n\n")}\n`)
fs.writeFileSync(downSql, `${blocks.slice(-downCount).join("\n")}\n`)
NODE

node - "$review_migration" "$review_up_sql" "$review_down_sql" 7 1 <<'NODE'
const fs = require("fs")
const [, , migrationFile, upSql, downSql, expectedCountRaw, downCountRaw] = process.argv
const source = fs.readFileSync(migrationFile, "utf8")
const blocks = Array.from(source.matchAll(/this\.addSql\(`([\s\S]*?)`\)/g)).map(
  (match) => match[1].trim(),
)
const expectedCount = Number(expectedCountRaw)
const downCount = Number(downCountRaw)
if (blocks.length !== expectedCount) {
  throw new Error(`Expected ${expectedCount} migration SQL blocks, got ${blocks.length}`)
}
fs.writeFileSync(upSql, `${blocks.slice(0, -downCount).join("\n\n")}\n`)
fs.writeFileSync(downSql, `${blocks.slice(-downCount).join("\n")}\n`)
NODE

echo "CREATE disposable refund review query surface dry-run database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

echo "APPLY approval persistence migration skeleton up SQL"
"${psql_base[@]}" -f "$approval_up_sql" >/dev/null

echo "APPLY refund review query surface migration up SQL"
"${psql_base[@]}" -f "$review_up_sql" >/dev/null

echo "CHECK refund review query surface fixtures and constraints"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'china_refund_state_mutation_approval',
    'china_refund_state_mutation_audit',
    'china_refund_state_mutation_runtime_attempt',
    'china_refund_state_mutation_terminal_conflict'
  ] loop
    if to_regclass(table_name) is null then
      raise exception 'missing table %', table_name;
    end if;
  end loop;
end $$;

insert into china_refund_state_mutation_approval (
  id,
  approval_idempotency_key,
  platform_refund_id,
  provider_name,
  provider_refund_reference,
  merchant_order_reference,
  refund_request_reference,
  target_state,
  target_state_audit_label,
  amount_minor,
  currency,
  request_actor_id,
  request_actor_type,
  reviewer_actor_id,
  reviewer_role,
  permission_evidence_id,
  ownership_evidence_id,
  readiness_decision_key,
  shadow_command_key,
  runtime_adapter_decision_key,
  feature_flag_snapshot_key,
  status,
  decision_reason_redacted
) values (
  'approval_001',
  'approval_persistence_001',
  'refund_platform_001',
  'wechat_pay',
  'wx_refund_001',
  'merchant_order_001',
  'refund_request_001',
  'succeeded_shadow_reviewed',
  'refund_state_succeeded_shadow_reviewed',
  128560,
  'CNY',
  'admin_refund_reviewer_001',
  'admin',
  'admin_finance_reviewer_001',
  'admin_finance_reviewer',
  'permission_evidence_001',
  'ownership_evidence_001',
  'readiness_decision_001',
  'shadow_command_001',
  'runtime_adapter_decision_001',
  'feature_flag_001',
  'approved',
  'approval captured for isolated preprod review'
);

insert into china_refund_state_mutation_audit (
  id,
  audit_persistence_idempotency_key,
  approval_persistence_idempotency_key,
  approval_candidate_idempotency_key,
  target_state,
  status,
  audit_action,
  audit_reason_redacted
) values (
  'audit_001',
  'audit_persistence_001',
  'approval_persistence_001',
  'approval_candidate_001',
  'succeeded_shadow_reviewed',
  'recorded',
  'refund_state_shadow_review_recorded',
  'audit recorded for isolated preprod review'
);

insert into china_refund_state_mutation_runtime_attempt (
  id,
  runtime_attempt_persistence_idempotency_key,
  workflow_idempotency_key,
  platform_refund_id,
  provider_name,
  provider_refund_reference,
  merchant_order_reference,
  refund_request_reference,
  target_state,
  target_state_audit_label,
  attempt_status,
  attempt_number,
  provider_evidence_digest,
  digest_version,
  approval_persistence_idempotency_key,
  audit_persistence_idempotency_key,
  terminal_conflict_decision_key,
  feature_flag_snapshot_key,
  environment,
  operator_visible_reason
) values (
  'runtime_attempt_001',
  'runtime_attempt_001',
  'workflow_001',
  'refund_platform_001',
  'wechat_pay',
  'wx_refund_001',
  'merchant_order_001',
  'refund_request_001',
  'succeeded_shadow_reviewed',
  'refund_state_succeeded_shadow_reviewed',
  'planned_disabled',
  1,
  'provider_digest_001',
  'sha256',
  'approval_persistence_001',
  'audit_persistence_001',
  'terminal_conflict_decision_001',
  'feature_flag_001',
  'staging',
  'Pending isolated preprod operator review before any runtime can proceed.'
);

insert into china_refund_state_mutation_terminal_conflict (
  id,
  terminal_conflict_persistence_idempotency_key,
  terminal_conflict_decision_key,
  platform_refund_id,
  current_refund_state,
  incoming_target_state,
  conflict_status,
  conflict_code,
  terminal_marker_key,
  terminal_marker_version,
  provider_evidence_digest,
  provider_evidence_digest_version,
  approval_persistence_idempotency_key,
  audit_persistence_idempotency_key,
  workflow_idempotency_key,
  runtime_attempt_persistence_idempotency_key,
  feature_flag_snapshot_key,
  state_owner_evidence_key,
  actor_reference,
  reviewer_reference,
  conflict_detected_at
) values (
  'terminal_conflict_001',
  'terminal_conflict_001',
  'terminal_conflict_decision_001',
  'refund_platform_001',
  'requires_review',
  'succeeded_shadow_reviewed',
  'shadow_prepared_disabled',
  'no_terminal_conflict',
  'terminal_marker_001',
  'v1',
  'provider_digest_001',
  'sha256',
  'approval_persistence_001',
  'audit_persistence_001',
  'workflow_001',
  'runtime_attempt_001',
  'feature_flag_001',
  'state_owner_evidence_001',
  'admin_refund_reviewer_001',
  'admin_finance_reviewer_001',
  now()
);

do $$
declare
  approval_count integer;
  audit_count integer;
  runtime_attempt_count integer;
  terminal_conflict_count integer;
begin
  select count(*) into approval_count from china_refund_state_mutation_approval where platform_refund_id = 'refund_platform_001';
  select count(*) into audit_count from china_refund_state_mutation_audit where approval_persistence_idempotency_key = 'approval_persistence_001';
  select count(*) into runtime_attempt_count from china_refund_state_mutation_runtime_attempt where workflow_idempotency_key = 'workflow_001';
  select count(*) into terminal_conflict_count from china_refund_state_mutation_terminal_conflict where approval_persistence_idempotency_key = 'approval_persistence_001';

  if approval_count <> 1 then
    raise exception 'expected 1 approval record, got %', approval_count;
  end if;
  if audit_count <> 1 then
    raise exception 'expected 1 audit record, got %', audit_count;
  end if;
  if runtime_attempt_count <> 1 then
    raise exception 'expected 1 runtime attempt record, got %', runtime_attempt_count;
  end if;
  if terminal_conflict_count <> 1 then
    raise exception 'expected 1 terminal conflict record, got %', terminal_conflict_count;
  end if;
end $$;
SQL

echo "ROLLBACK refund review query surface migration down SQL"
"${psql_base[@]}" -f "$review_down_sql" >/dev/null

echo "ROLLBACK approval persistence migration down SQL"
"${psql_base[@]}" -f "$approval_down_sql" >/dev/null

echo "PASS refund review query surface local dry-run completed for database: $db_name"
