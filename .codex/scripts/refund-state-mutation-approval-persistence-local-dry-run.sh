#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_refund_approval_persist_dry_run_$(date +%Y%m%d%H%M%S)}"
migration_file="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260512000300.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-refund-state-mutation-approval-persistence-dry-run"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
created_db=0

mkdir -p "$work_dir"

case "$db_name" in
  fuyi_refund_approval_persist_dry_run_[0-9]*|fuyi_refund_approval_persist_dry_run_local_*) ;;
  *)
    echo "Refusing database '$db_name'. Name must use the approval persistence dry-run timestamp or local prefix." >&2
    exit 1
    ;;
esac

case "$db_name" in
  *[!A-Za-z0-9_]*)
    echo "Refusing database '$db_name'. Name may only contain letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

if ! printf "%s" "$db_name" | grep -E '^fuyi_refund_approval_persist_dry_run_([0-9]{14}|local_[A-Za-z0-9_]+)$' >/dev/null; then
  echo "Refusing database '$db_name'. Expected fuyi_refund_approval_persist_dry_run_YYYYMMDDHHMMSS or fuyi_refund_approval_persist_dry_run_local_<safe_suffix>." >&2
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
    echo "Refusing approval persistence dry-run while environment hints at production, preprod, or staging." >&2
    exit 1
    ;;
esac

if grep -Eq 'Migration20260512000300|china_refund_state_mutation_approval' "$root/packages/api/medusa-config.ts"; then
  echo "Refusing dry-run: approval persistence migration appears registered in medusa-config.ts." >&2
  exit 1
fi

staged_files="$(git -C "$root" diff --cached --name-only)"
if [ -n "$staged_files" ]; then
  unexpected_staged_files="$(
    printf "%s\n" "$staged_files" | grep -Ev '^(\.codex/queue\.md|\.codex/scripts/refund-state-mutation-approval-persistence-local-dry-run\.sh|\.codex/tasks/refund-state-mutation-approval-persistence-migration-skeleton\.md|docs/refund-state-mutation-approval-persistence-migration-skeleton\.md|project-ledger/(changelog|handoff|status)\.md|packages/api/src/modules/china-payment-notification/migrations/Migration20260512000300\.ts)$' || true
  )"

  if [ -n "$unexpected_staged_files" ]; then
    echo "Refusing dry-run: staged files are outside the approval persistence allowlist." >&2
    printf "%s\n" "$unexpected_staged_files" >&2
    exit 1
  fi
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
    nvm use >/tmp/fuyi-nvm-use-refund-approval-dry-run.log
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

if (blocks.length !== 7) {
  throw new Error(`Expected 7 migration SQL blocks, got ${blocks.length}`)
}

const downCount = 2
fs.writeFileSync(upSql, `${blocks.slice(0, -downCount).join("\n\n")}\n`)
fs.writeFileSync(downSql, `${blocks.slice(-downCount).join("\n")}\n`)
NODE

echo "CREATE disposable approval persistence dry-run database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

echo "APPLY approval persistence migration skeleton up SQL"
"${psql_base[@]}" -f "$up_sql" >/dev/null

echo "CHECK approval persistence fixtures and constraints"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'china_refund_state_mutation_approval',
    'china_refund_state_mutation_approval_event'
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
  decision_reason_redacted,
  decided_at,
  expires_at
) values (
  'approval_001',
  'refund_state_mutation_approval_persistence:approval_candidate_001',
  'prefund_001',
  'wechat_pay',
  'wx_refund_approval_001',
  'pay_order_approval_001',
  'refund_cmd_approval_001',
  'succeeded_shadow_reviewed',
  'refund_state_succeeded_shadow_reviewed',
  128560,
  'CNY',
  'admin_refund_reviewer_001',
  'admin',
  'admin_finance_reviewer_001',
  'admin_finance_reviewer',
  'perm_approval_001',
  'owner_approval_001',
  'readiness_decision_001',
  'shadow_command_001',
  'runtime_adapter_decision_001',
  'feature_flag_snapshot_001',
  'approved',
  'shadow only approval persisted for replay',
  now(),
  now() + interval '2 hours'
);

insert into china_refund_state_mutation_approval_event (
  id,
  approval_id,
  action,
  actor_id,
  actor_type,
  metadata_redacted
) values
  (
    'approval_event_requested_001',
    'approval_001',
    'approval_requested',
    'admin_refund_reviewer_001',
    'admin',
    '{"safeNote":"request recorded","provider":"wechat_pay"}'::jsonb
  ),
  (
    'approval_event_approved_001',
    'approval_001',
    'approval_approved',
    'admin_finance_reviewer_001',
    'admin',
    '{"safeNote":"approved","permissionEvidenceId":"perm_approval_001"}'::jsonb
  ),
  (
    'approval_event_handoff_001',
    'approval_001',
    'manual_review_handoff',
    'system_job_refund_review',
    'system_job',
    '{"safeNote":"manual review handoff","targetState":"succeeded_shadow_reviewed"}'::jsonb
  );

do $$
begin
  begin
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
      'approval_duplicate_001',
      'refund_state_mutation_approval_persistence:approval_candidate_001',
      'prefund_001',
      'wechat_pay',
      'wx_refund_approval_duplicate',
      'pay_order_approval_duplicate',
      'refund_cmd_approval_duplicate',
      'succeeded_shadow_reviewed',
      'refund_state_succeeded_shadow_reviewed',
      128560,
      'CNY',
      'admin_refund_reviewer_001',
      'admin',
      'admin_finance_reviewer_002',
      'admin_finance_reviewer',
      'perm_approval_duplicate',
      'owner_approval_duplicate',
      'readiness_decision_duplicate',
      'shadow_command_duplicate',
      'runtime_adapter_decision_duplicate',
      'feature_flag_snapshot_duplicate',
      'approved',
      'duplicate idempotency should fail'
    );
    raise exception 'unique approval idempotency constraint did not reject duplicate';
  exception when unique_violation then
    null;
  end;

  begin
    insert into china_refund_state_mutation_approval (
      id, approval_idempotency_key, platform_refund_id, provider_name,
      provider_refund_reference, merchant_order_reference, refund_request_reference,
      target_state, target_state_audit_label, amount_minor, currency,
      request_actor_id, request_actor_type, reviewer_actor_id, reviewer_role,
      permission_evidence_id, ownership_evidence_id, readiness_decision_key,
      shadow_command_key, runtime_adapter_decision_key, feature_flag_snapshot_key,
      status, decision_reason_redacted
    ) values (
      'approval_bad_amount', 'refund_state_mutation_approval_persistence:approval_bad_amount',
      'prefund_bad_amount', 'wechat_pay', 'wx_refund_bad_amount',
      'pay_order_bad_amount', 'refund_cmd_bad_amount', 'succeeded_shadow_reviewed',
      'refund_state_succeeded_shadow_reviewed', 0, 'CNY', 'admin_refund_reviewer_001',
      'admin', 'admin_finance_reviewer_002', 'admin_finance_reviewer',
      'perm_bad_amount', 'owner_bad_amount', 'readiness_bad_amount', 'shadow_bad_amount',
      'runtime_bad_amount', 'feature_bad_amount', 'approved', 'amount check should fail'
    );
    raise exception 'amount constraint did not reject non-positive amount';
  exception when check_violation then
    null;
  end;

  begin
    insert into china_refund_state_mutation_approval (
      id, approval_idempotency_key, platform_refund_id, provider_name,
      provider_refund_reference, merchant_order_reference, refund_request_reference,
      target_state, target_state_audit_label, amount_minor, currency,
      request_actor_id, request_actor_type, reviewer_actor_id, reviewer_role,
      permission_evidence_id, ownership_evidence_id, readiness_decision_key,
      shadow_command_key, runtime_adapter_decision_key, feature_flag_snapshot_key,
      status, decision_reason_redacted
    ) values (
      'approval_bad_currency', 'refund_state_mutation_approval_persistence:approval_bad_currency',
      'prefund_bad_currency', 'wechat_pay', 'wx_refund_bad_currency',
      'pay_order_bad_currency', 'refund_cmd_bad_currency', 'succeeded_shadow_reviewed',
      'refund_state_succeeded_shadow_reviewed', 128560, 'USD', 'admin_refund_reviewer_001',
      'admin', 'admin_finance_reviewer_002', 'admin_finance_reviewer',
      'perm_bad_currency', 'owner_bad_currency', 'readiness_bad_currency', 'shadow_bad_currency',
      'runtime_bad_currency', 'feature_bad_currency', 'approved', 'currency check should fail'
    );
    raise exception 'currency constraint did not reject non-CNY';
  exception when check_violation then
    null;
  end;

  begin
    insert into china_refund_state_mutation_approval (
      id, approval_idempotency_key, platform_refund_id, provider_name,
      provider_refund_reference, merchant_order_reference, refund_request_reference,
      target_state, target_state_audit_label, amount_minor, currency,
      request_actor_id, request_actor_type, reviewer_actor_id, reviewer_role,
      permission_evidence_id, ownership_evidence_id, readiness_decision_key,
      shadow_command_key, runtime_adapter_decision_key, feature_flag_snapshot_key,
      status, decision_reason_redacted
    ) values (
      'approval_bad_status', 'refund_state_mutation_approval_persistence:approval_bad_status',
      'prefund_bad_status', 'wechat_pay', 'wx_refund_bad_status',
      'pay_order_bad_status', 'refund_cmd_bad_status', 'succeeded_shadow_reviewed',
      'refund_state_succeeded_shadow_reviewed', 128560, 'CNY', 'admin_refund_reviewer_001',
      'admin', 'admin_finance_reviewer_002', 'admin_finance_reviewer',
      'perm_bad_status', 'owner_bad_status', 'readiness_bad_status', 'shadow_bad_status',
      'runtime_bad_status', 'feature_bad_status', 'executed', 'status check should fail'
    );
    raise exception 'status constraint did not reject invalid status';
  exception when check_violation then
    null;
  end;

  begin
    insert into china_refund_state_mutation_approval (
      id, approval_idempotency_key, platform_refund_id, provider_name,
      provider_refund_reference, merchant_order_reference, refund_request_reference,
      target_state, target_state_audit_label, amount_minor, currency,
      request_actor_id, request_actor_type, reviewer_actor_id, reviewer_role,
      permission_evidence_id, ownership_evidence_id, readiness_decision_key,
      shadow_command_key, runtime_adapter_decision_key, feature_flag_snapshot_key,
      status, decision_reason_redacted
    ) values (
      'approval_bad_reviewer_role', 'refund_state_mutation_approval_persistence:approval_bad_reviewer_role',
      'prefund_bad_role', 'wechat_pay', 'wx_refund_bad_role',
      'pay_order_bad_role', 'refund_cmd_bad_role', 'succeeded_shadow_reviewed',
      'refund_state_succeeded_shadow_reviewed', 128560, 'CNY', 'admin_refund_reviewer_001',
      'admin', 'admin_finance_reviewer_002', 'vendor_owner',
      'perm_bad_role', 'owner_bad_role', 'readiness_bad_role', 'shadow_bad_role',
      'runtime_bad_role', 'feature_bad_role', 'approved', 'reviewer role check should fail'
    );
    raise exception 'reviewer role constraint did not reject invalid role';
  exception when check_violation then
    null;
  end;

  begin
    insert into china_refund_state_mutation_approval (
      id, approval_idempotency_key, platform_refund_id, provider_name,
      provider_refund_reference, merchant_order_reference, refund_request_reference,
      target_state, target_state_audit_label, amount_minor, currency,
      request_actor_id, request_actor_type, reviewer_actor_id, reviewer_role,
      permission_evidence_id, ownership_evidence_id, readiness_decision_key,
      shadow_command_key, runtime_adapter_decision_key, feature_flag_snapshot_key,
      status, decision_reason_redacted
    ) values (
      'approval_bad_same_actor', 'refund_state_mutation_approval_persistence:approval_bad_same_actor',
      'prefund_bad_same_actor', 'wechat_pay', 'wx_refund_bad_same_actor',
      'pay_order_bad_same_actor', 'refund_cmd_bad_same_actor', 'succeeded_shadow_reviewed',
      'refund_state_succeeded_shadow_reviewed', 128560, 'CNY', 'admin_refund_reviewer_001',
      'admin', 'admin_refund_reviewer_001', 'admin_refund_reviewer',
      'perm_bad_same_actor', 'owner_bad_same_actor', 'readiness_bad_same_actor',
      'shadow_bad_same_actor', 'runtime_bad_same_actor', 'feature_bad_same_actor',
      'approved', 'reviewer separation check should fail'
    );
    raise exception 'reviewer separation constraint did not reject same actor';
  exception when check_violation then
    null;
  end;

  begin
    insert into china_refund_state_mutation_approval_event (
      id, approval_id, action, actor_id, actor_type, metadata_redacted
    ) values (
      'approval_event_bad_action', 'approval_001', 'workflow_executed',
      'admin_finance_reviewer_001', 'admin', '{"safeNote":"bad action"}'::jsonb
    );
    raise exception 'event action constraint did not reject invalid action';
  exception when check_violation then
    null;
  end;

  begin
    insert into china_refund_state_mutation_approval_event (
      id, approval_id, action, actor_id, actor_type, metadata_redacted
    ) values (
      'approval_event_bad_metadata', 'approval_001', 'approval_replayed',
      'admin_finance_reviewer_001', 'admin',
      '{"rawProviderPayload":"must_be_blocked"}'::jsonb
    );
    raise exception 'metadata redaction constraint did not reject blocked key';
  exception when check_violation then
    null;
  end;
end $$;
SQL

echo "CHECK row counts"
"${psql_base[@]}" -tAc "
select
  (select count(*) from china_refund_state_mutation_approval) as approval_rows,
  (select count(*) from china_refund_state_mutation_approval_event) as approval_event_rows;
"

echo "APPLY approval persistence migration skeleton down SQL"
"${psql_base[@]}" -f "$down_sql" >/dev/null

echo "CHECK rollback removed approval persistence tables"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'china_refund_state_mutation_approval_event',
    'china_refund_state_mutation_approval'
  ] loop
    if to_regclass(table_name) is not null then
      raise exception 'table still exists after down: %', table_name;
    end if;
  end loop;
end $$;
SQL

echo "PASS approval persistence migration skeleton local dry-run completed and disposable database will be dropped."
