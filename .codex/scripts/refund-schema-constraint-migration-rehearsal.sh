#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_refund_schema_constraint_dry_run_$(date +%Y%m%d%H%M%S)}"
migration_file="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-refund-schema-constraint-rehearsal"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
created_db=0

mkdir -p "$work_dir"

case "$db_name" in
  fuyi_refund_schema_constraint_dry_run_[0-9]*|fuyi_refund_schema_constraint_dry_run_local_*) ;;
  *)
    echo "Refusing database '$db_name'. Name must use the refund schema constraint dry-run timestamp or local prefix." >&2
    exit 1
    ;;
esac

case "$db_name" in
  *[!A-Za-z0-9_]*)
    echo "Refusing database '$db_name'. Name may only contain letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

if ! printf "%s" "$db_name" | grep -E '^fuyi_refund_schema_constraint_dry_run_([0-9]{14}|local_[A-Za-z0-9_]+)$' >/dev/null; then
  echo "Refusing database '$db_name'. Expected fuyi_refund_schema_constraint_dry_run_YYYYMMDDHHMMSS or fuyi_refund_schema_constraint_dry_run_local_<safe_suffix>." >&2
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
    echo "Refusing schema constraint rehearsal while environment hints at production, preprod, or staging." >&2
    exit 1
    ;;
esac

if grep -q "china-payment-notification" "$root/packages/api/medusa-config.ts"; then
  echo "Refusing schema constraint rehearsal: china-payment-notification appears registered in medusa-config.ts." >&2
  exit 1
fi

staged_files="$(git -C "$root" diff --cached --name-only)"
if printf "%s\n" "$staged_files" | grep -E '^(apps/|packages/|package\.json$|bun\.lock$|package-lock\.json$|pnpm-lock\.yaml$|yarn\.lock$|\.env)' >/dev/null; then
  echo "Refusing schema constraint rehearsal: staged files include runtime/config/lock/env paths." >&2
  printf "%s\n" "$staged_files" >&2
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
    nvm use >/tmp/fuyi-nvm-use-refund-schema-constraint-rehearsal.log
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

if (blocks.length !== 9) {
  throw new Error(`Expected 9 migration SQL blocks, got ${blocks.length}`)
}

const downCount = 2
fs.writeFileSync(upSql, `${blocks.slice(0, -downCount).join("\n\n")}\n`)
fs.writeFileSync(downSql, `${blocks.slice(-downCount).join("\n")}\n`)
NODE

echo "CREATE disposable refund schema constraint rehearsal database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

echo "APPLY shared inbox migration skeleton up SQL"
"${psql_base[@]}" -f "$up_sql" >/dev/null

echo "APPLY refund schema constraint rehearsal SQL"
"${psql_base[@]}" >/dev/null <<'SQL'
create or replace function refund_schema_rehearsal_metadata_has_blocked_key(input jsonb)
returns boolean
language sql
immutable
as $$
  with recursive walk(value) as (
    select input
    union all
    select child.value
    from walk current_node
    cross join lateral (
      select object_child.value
      from jsonb_each(
        case when jsonb_typeof(current_node.value) = 'object' then current_node.value else '{}'::jsonb end
      ) as object_child
      union all
      select array_child.value
      from jsonb_array_elements(
        case when jsonb_typeof(current_node.value) = 'array' then current_node.value else '[]'::jsonb end
      ) as array_child
    ) as child
  )
  select exists (
    select 1
    from walk
    cross join lateral jsonb_object_keys(
      case when jsonb_typeof(walk.value) = 'object' then walk.value else '{}'::jsonb end
    ) as key(name)
    where regexp_replace(lower(key.name), '[^a-z0-9]', '', 'g') in (
      'providerrefundrequest',
      'refundstatemutation',
      'workflowcommand',
      'workflowexecution',
      'providersdkrequest',
      'providerrequest',
      'rawproviderpayload',
      'rawpayload',
      'privatekey',
      'certificate',
      'apiv3key',
      'apiv3secret',
      'webhooksecret',
      'fullphone',
      'identitynumber',
      'bankcardnumber',
      'fulladdress',
      'settlementadjustment',
      'commissionadjustment',
      'payoutadjustment'
    )
  );
$$;

alter table payment_notification_inbox
  drop constraint payment_notification_inbox_processing_status_check;

alter table payment_notification_inbox
  add constraint refund_schema_rehearsal_processing_status_check
  check (
    processing_status in (
      'received',
      'verified',
      'processing',
      'processed',
      'retryable_failed',
      'terminal_failed',
      'ignored_duplicate',
      'signature_verified',
      'normalized',
      'guard_checked',
      'manual_review_required',
      'runtime_mutation_blocked',
      'processed_for_audit_only',
      'terminal_rejected',
      'duplicate_seen',
      'digest_conflict_manual_review'
    )
  );

alter table payment_notification_inbox
  add constraint refund_schema_rehearsal_positive_amount_check
  check (amount_value > 0);

alter table payment_notification_event_log
  drop constraint payment_notification_event_log_action_check;

alter table payment_notification_event_log
  add constraint refund_schema_rehearsal_event_log_action_check
  check (
    action in (
      'received',
      'verified',
      'dedupe_hit',
      'handler_started',
      'command_prepared',
      'command_skipped',
      'command_blocked',
      'workflow_execution_started',
      'workflow_execution_succeeded',
      'workflow_execution_failed',
      'manual_review_required',
      'processed',
      'retry_scheduled',
      'failed',
      'refund_notification_received',
      'refund_notification_verified',
      'refund_notification_normalized',
      'refund_notification_duplicate_seen',
      'refund_notification_digest_conflict',
      'refund_guard_manual_review_required',
      'refund_runtime_mutation_blocked',
      'refund_settlement_blocked'
    )
  );

alter table payment_notification_event_log
  drop constraint payment_notification_event_log_actor_type_check;

alter table payment_notification_event_log
  add constraint refund_schema_rehearsal_actor_type_check
  check (actor_type in ('system', 'provider', 'operator', 'system_job', 'admin', 'vendor'));

alter table payment_notification_event_log
  add constraint refund_schema_rehearsal_metadata_redacted_check
  check (not refund_schema_rehearsal_metadata_has_blocked_key(metadata));

create index if not exists "IDX_refund_schema_rehearsal_provider_refund"
on payment_notification_inbox (provider, provider_refund_id)
where provider_refund_id is not null;
SQL

echo "CHECK expanded payment and refund schema semantics"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  payment_status text;
  refund_status text;
  payment_action text;
  refund_action text;
  actor_value text;
  duplicate_blocked boolean := false;
  rejected boolean := false;
begin
  insert into payment_notification_inbox (
    id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
    payment_session_id, provider_transaction_id, amount_value, currency,
    signature_status, raw_payload_digest, processing_status
  ) values (
    'pinbox_schema_payment_001', 'mock_china_pay', 'evt_payment_schema_001',
    'payment.succeeded', 'payment_notify:mock_china_pay:evt_payment_schema_001',
    'pay_order_schema_001', 'payses_schema_001', 'mock_txn_schema_001',
    9900, 'CNY', 'verified', 'sha256:paymentschema001', 'received'
  );

  foreach payment_status in array array[
    'verified',
    'processing',
    'processed',
    'retryable_failed',
    'terminal_failed',
    'ignored_duplicate'
  ] loop
    update payment_notification_inbox
    set processing_status = payment_status
    where id = 'pinbox_schema_payment_001';
  end loop;

  foreach payment_action in array array[
    'received',
    'verified',
    'dedupe_hit',
    'handler_started',
    'command_prepared',
    'command_skipped',
    'command_blocked',
    'manual_review_required',
    'processed',
    'retry_scheduled',
    'failed'
  ] loop
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'plog_' || payment_action,
      'pinbox_schema_payment_001',
      payment_action,
      'system',
      'Payment action compatibility rehearsal.',
      jsonb_build_object('fixture', 'payment_action', 'action', payment_action)
    );
  end loop;

  insert into payment_notification_inbox (
    id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
    payment_session_id, provider_refund_id, amount_value, currency,
    signature_status, raw_payload_digest, processing_status
  ) values (
    'rinbox_schema_refund_001', 'mock_china_pay', 'evt_refund_schema_001',
    'refund.succeeded', 'refund_notify:mock_china_pay:evt_refund_schema_001',
    'pay_refund_order_schema_001', 'payses_refund_schema_001',
    'mock_provider_refund_schema_001', 8800, 'CNY', 'verified',
    'sha256:refundschema001', 'received'
  );

  foreach refund_status in array array[
    'signature_verified',
    'normalized',
    'guard_checked',
    'manual_review_required',
    'runtime_mutation_blocked',
    'processed_for_audit_only',
    'terminal_rejected',
    'duplicate_seen',
    'digest_conflict_manual_review'
  ] loop
    update payment_notification_inbox
    set processing_status = refund_status
    where id = 'rinbox_schema_refund_001';
  end loop;

  foreach refund_action in array array[
    'refund_notification_received',
    'refund_notification_verified',
    'refund_notification_normalized',
    'refund_notification_duplicate_seen',
    'refund_notification_digest_conflict',
    'refund_guard_manual_review_required',
    'refund_runtime_mutation_blocked',
    'refund_settlement_blocked'
  ] loop
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_' || refund_action,
      'rinbox_schema_refund_001',
      refund_action,
      'system_job',
      'Refund audit action compatibility rehearsal.',
      jsonb_build_object('fixture', 'refund_action', 'action', refund_action, 'runtimeMutationBlocked', true)
    );
  end loop;

  foreach actor_value in array array['system', 'provider', 'operator', 'system_job', 'admin', 'vendor'] loop
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_actor_' || actor_value,
      'rinbox_schema_refund_001',
      'refund_runtime_mutation_blocked',
      actor_value,
      'Refund actor compatibility rehearsal.',
      jsonb_build_object('fixture', 'actor', 'actorType', actor_value)
    );
  end loop;

  begin
    insert into payment_notification_inbox (
      id, provider, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest,
      processing_status
    ) values (
      'rinbox_schema_forbidden_status', 'mock_china_pay', 'refund.succeeded',
      'refund_notify:mock_china_pay:forbidden_status', 'pay_forbidden_status',
      100, 'CNY', 'verified', 'sha256:forbiddenstatus',
      'refund_state_mutated'
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'forbidden refund processing status was accepted';
  end if;

  rejected := false;
  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_forbidden_action', 'rinbox_schema_refund_001',
      'provider_refund_request_sent', 'system_job',
      'Forbidden action should be rejected.', '{}'::jsonb
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'forbidden refund runtime action was accepted';
  end if;

  rejected := false;
  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_unknown_actor', 'rinbox_schema_refund_001',
      'refund_runtime_mutation_blocked', 'guest',
      'Unknown actor should be rejected.', '{}'::jsonb
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'unknown actor was accepted';
  end if;

  rejected := false;
  begin
    insert into payment_notification_inbox (
      id, provider, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest,
      processing_status
    ) values (
      'rinbox_schema_zero_amount', 'mock_china_pay', 'refund.succeeded',
      'refund_notify:mock_china_pay:zero_amount', 'pay_zero_amount',
      0, 'CNY', 'verified', 'sha256:zeroamount', 'received'
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'zero amount was accepted';
  end if;

  rejected := false;
  begin
    insert into payment_notification_inbox (
      id, provider, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest,
      processing_status
    ) values (
      'rinbox_schema_negative_amount', 'mock_china_pay', 'refund.succeeded',
      'refund_notify:mock_china_pay:negative_amount', 'pay_negative_amount',
      -1, 'CNY', 'verified', 'sha256:negativeamount', 'received'
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'negative amount was accepted';
  end if;

  rejected := false;
  begin
    insert into payment_notification_inbox (
      id, provider, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest,
      processing_status
    ) values (
      'rinbox_schema_non_cny', 'mock_china_pay', 'refund.succeeded',
      'refund_notify:mock_china_pay:non_cny', 'pay_non_cny',
      100, 'USD', 'verified', 'sha256:noncny', 'received'
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'non-CNY currency was accepted';
  end if;

  begin
    insert into payment_notification_inbox (
      id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest,
      processing_status
    ) values (
      'rinbox_schema_duplicate', 'mock_china_pay', 'evt_refund_schema_001',
      'refund.succeeded', 'refund_notify:mock_china_pay:evt_refund_schema_001',
      'pay_duplicate', 8800, 'CNY', 'verified', 'sha256:refundschema001',
      'received'
    );
  exception
    when unique_violation then
      duplicate_blocked := true;
  end;

  if duplicate_blocked is not true then
    raise exception 'provider + idempotency duplicate was accepted';
  end if;

  rejected := false;
  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_top_level_secret', 'rinbox_schema_refund_001',
      'refund_runtime_mutation_blocked', 'system_job',
      'Top-level sensitive metadata should be rejected.',
      '{"providerRefundRequest":{"amount":8800}}'::jsonb
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'top-level blocked metadata key was accepted';
  end if;

  rejected := false;
  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_nested_secret', 'rinbox_schema_refund_001',
      'refund_runtime_mutation_blocked', 'system_job',
      'Nested sensitive metadata should be rejected.',
      '{"safe":{"workflowCommand":{"name":"executeRefund"}}}'::jsonb
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'nested blocked metadata key was accepted';
  end if;
end $$;
SQL

echo "RESTORE base constraints in disposable DB and verify rollback semantics"
"${psql_base[@]}" >/dev/null <<'SQL'
truncate table payment_notification_event_log;
truncate table payment_notification_inbox cascade;

drop index if exists "IDX_refund_schema_rehearsal_provider_refund";

alter table payment_notification_event_log
  drop constraint refund_schema_rehearsal_metadata_redacted_check;

alter table payment_notification_event_log
  drop constraint refund_schema_rehearsal_actor_type_check;

alter table payment_notification_event_log
  add constraint payment_notification_event_log_actor_type_check
  check (actor_type in ('system', 'provider', 'operator'));

alter table payment_notification_event_log
  drop constraint refund_schema_rehearsal_event_log_action_check;

alter table payment_notification_event_log
  add constraint payment_notification_event_log_action_check
  check (
    action in (
      'received',
      'verified',
      'dedupe_hit',
      'handler_started',
      'command_prepared',
      'command_skipped',
      'command_blocked',
      'workflow_execution_started',
      'workflow_execution_succeeded',
      'workflow_execution_failed',
      'manual_review_required',
      'processed',
      'retry_scheduled',
      'failed'
    )
  );

alter table payment_notification_inbox
  drop constraint refund_schema_rehearsal_positive_amount_check;

alter table payment_notification_inbox
  drop constraint refund_schema_rehearsal_processing_status_check;

alter table payment_notification_inbox
  add constraint payment_notification_inbox_processing_status_check
  check (
    processing_status in (
      'received',
      'verified',
      'processing',
      'processed',
      'retryable_failed',
      'terminal_failed',
      'ignored_duplicate'
    )
  );

drop function refund_schema_rehearsal_metadata_has_blocked_key(jsonb);

do $$
declare
  rejected boolean := false;
begin
  insert into payment_notification_inbox (
    id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
    amount_value, currency, signature_status, raw_payload_digest,
    processing_status
  ) values (
    'pinbox_schema_down_payment', 'mock_china_pay', 'evt_payment_down',
    'payment.succeeded', 'payment_notify:mock_china_pay:evt_payment_down',
    'pay_down_order', 100, 'CNY', 'verified', 'sha256:paymentdown',
    'processed'
  );

  insert into payment_notification_event_log (
    id, inbox_id, action, actor_type, message, metadata
  ) values (
    'plog_schema_down_payment', 'pinbox_schema_down_payment',
    'received', 'system', 'Base payment event action accepted after rollback.',
    '{}'::jsonb
  );

  begin
    insert into payment_notification_inbox (
      id, provider, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest,
      processing_status
    ) values (
      'rinbox_schema_down_refund_status', 'mock_china_pay', 'refund.succeeded',
      'refund_notify:mock_china_pay:down_refund_status', 'pay_down_refund',
      100, 'CNY', 'verified', 'sha256:downrefund', 'normalized'
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'refund-only status still accepted after rollback';
  end if;

  rejected := false;
  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_schema_down_refund_action', 'pinbox_schema_down_payment',
      'refund_notification_received', 'system',
      'Refund action should be rejected after rollback.', '{}'::jsonb
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'refund-only action still accepted after rollback';
  end if;

  rejected := false;
  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_schema_down_system_job', 'pinbox_schema_down_payment',
      'received', 'system_job',
      'system_job actor should be rejected after rollback.', '{}'::jsonb
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if rejected is not true then
    raise exception 'system_job actor still accepted after rollback';
  end if;
end $$;
SQL

echo "APPLY shared inbox migration skeleton down SQL"
"${psql_base[@]}" -f "$down_sql" >/dev/null

remaining_tables="$("${psql_base[@]}" -Atc "select count(*) from information_schema.tables where table_schema='public' and table_name in ('payment_notification_inbox', 'payment_notification_event_log');")"
if [ "$remaining_tables" != "0" ]; then
  echo "Expected down SQL to remove rehearsal tables, found $remaining_tables." >&2
  exit 1
fi

echo "DROP disposable refund schema constraint rehearsal database: $db_name"
dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=0

residual="$(
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -Atc "select count(*) from pg_database where datname = '$db_name';"
)"

if [ "$residual" != "0" ]; then
  echo "Disposable database '$db_name' still exists after drop." >&2
  exit 1
fi

echo "refund schema constraint migration rehearsal passed: 0 residual DB"
