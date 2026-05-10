#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_refund_inbox_real_adapter_dry_run_$(date +%Y%m%d%H%M%S)}"
migration_file="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-refund-inbox-real-adapter-rehearsal"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
created_db=0

mkdir -p "$work_dir"

case "$db_name" in
  fuyi_refund_inbox_real_adapter_dry_run_[0-9]*|fuyi_refund_inbox_real_adapter_dry_run_local_*) ;;
  *)
    echo "Refusing database '$db_name'. Name must use the real-adapter dry-run timestamp or local prefix." >&2
    exit 1
    ;;
esac

case "$db_name" in
  *[!A-Za-z0-9_]*)
    echo "Refusing database '$db_name'. Name may only contain letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

if ! printf "%s" "$db_name" | grep -E '^fuyi_refund_inbox_real_adapter_dry_run_([0-9]{14}|local_[A-Za-z0-9_]+)$' >/dev/null; then
  echo "Refusing database '$db_name'. Expected fuyi_refund_inbox_real_adapter_dry_run_YYYYMMDDHHMMSS or fuyi_refund_inbox_real_adapter_dry_run_local_<safe_suffix>." >&2
  exit 1
fi

case "$pg_host" in
  127.0.0.1|localhost) ;;
  *)
    echo "Refusing non-local PostgreSQL host '$pg_host'." >&2
    exit 1
    ;;
esac

env_hint="$(printf "%s" "${NODE_ENV:-}${MEDUSA_ENV:-}${APP_ENV:-}${CODEX_ENV:-}${DATABASE_URL:-}" | tr '[:upper:]' '[:lower:]')"
case "$env_hint" in
  *production*|*prod*|*preprod*|*staging*)
    echo "Refusing real-adapter rehearsal while environment hints at production, preprod, or staging." >&2
    exit 1
    ;;
esac

if grep -q "china-payment-notification" "$root/packages/api/medusa-config.ts"; then
  echo "Refusing rehearsal: china-payment-notification appears registered in medusa-config.ts." >&2
  exit 1
fi

staged_files="$(git -C "$root" diff --cached --name-only)"
if printf "%s\n" "$staged_files" | grep -E '^(apps/|packages/|package\.json$|bun\.lock$|package-lock\.json$|pnpm-lock\.yaml$|yarn\.lock$|\.env)' >/dev/null; then
  echo "Refusing rehearsal: staged files include runtime/config/lock/env paths." >&2
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
    nvm use >/tmp/fuyi-nvm-use-refund-real-adapter-rehearsal.log
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

echo "CREATE disposable refund inbox real-adapter rehearsal database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

echo "APPLY shared inbox migration skeleton up SQL"
"${psql_base[@]}" -f "$up_sql" >/dev/null

echo "APPLY refund real-adapter rehearsal constraints"
"${psql_base[@]}" >/dev/null <<'SQL'
create or replace function refund_rehearsal_metadata_has_blocked_key(input jsonb)
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
    where key.name in (
      'rawProviderPayload',
      'raw_payload',
      'privateKey',
      'private_key',
      'apiV3Key',
      'certificate',
      'webhookSecret',
      'workflowCommand',
      'providerRefundRequest',
      'refundStateMutation',
      'settlementAdjustment',
      'commissionAdjustment',
      'payoutAdjustment',
      'fullPhone'
    )
  );
$$;

alter table payment_notification_inbox
  add constraint refund_rehearsal_positive_amount_check
  check (amount_value > 0);

alter table payment_notification_event_log
  drop constraint payment_notification_event_log_action_check;

alter table payment_notification_event_log
  add constraint refund_rehearsal_event_log_action_check
  check (
    action in (
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
  add constraint refund_rehearsal_metadata_redacted_check
  check (not refund_rehearsal_metadata_has_blocked_key(metadata));
SQL

echo "CHECK repository real-adapter SQL semantics"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  inbox_rows integer;
  event_rows integer;
  original_digest text;
  forbidden_action text;
begin
  insert into payment_notification_inbox (
    id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
    payment_session_id, provider_refund_id, amount_value, currency,
    signature_status, raw_payload_digest, processing_status, received_at
  ) values (
    'rinbox_real_adapter_001', 'mock_china_pay', 'evt_refund_real_adapter_001',
    'refund.succeeded', 'refund_notify:mock_china_pay:evt_refund_real_adapter_001',
    'pay_mock_refund_order_001', 'payses_mock_refund_001',
    'mock_provider_refund_001', 8800, 'CNY', 'verified',
    'sha256:refundrealadapter001', 'received', now()
  );

  insert into payment_notification_event_log (
    id, inbox_id, action, actor_type, message, metadata
  ) values (
    'rlog_real_adapter_received', 'rinbox_real_adapter_001',
    'refund_notification_received', 'provider',
    'Refund notification received.',
    '{"auditEventId":"raudit_received","route":"repository_real_adapter_rehearsal","provider":"mock_china_pay"}'::jsonb
  );

  update payment_notification_inbox
  set processing_status = 'verified', updated_at = now()
  where id = 'rinbox_real_adapter_001';

  insert into payment_notification_event_log (
    id, inbox_id, action, actor_type, message, metadata
  ) values
    (
      'rlog_real_adapter_verified', 'rinbox_real_adapter_001',
      'refund_notification_verified', 'system',
      'Refund notification signature verified.',
      '{"auditEventId":"raudit_verified","processingStatus":"signature_verified"}'::jsonb
    ),
    (
      'rlog_real_adapter_normalized', 'rinbox_real_adapter_001',
      'refund_notification_normalized', 'system',
      'Refund notification normalized.',
      '{"auditEventId":"raudit_normalized","processingStatus":"normalized"}'::jsonb
    ),
    (
      'rlog_real_adapter_runtime_blocked', 'rinbox_real_adapter_001',
      'refund_runtime_mutation_blocked', 'system',
      'Refund runtime mutation blocked.',
      '{"auditEventId":"raudit_runtime_blocked","stateMutationAllowed":false}'::jsonb
    ),
    (
      'rlog_real_adapter_settlement_blocked', 'rinbox_real_adapter_001',
      'refund_settlement_blocked', 'system',
      'Settlement, commission, and payout remain blocked.',
      '{"auditEventId":"raudit_settlement_blocked","settlementAdjusted":false,"commissionAdjusted":false,"payoutAdjusted":false}'::jsonb
    );

  insert into payment_notification_inbox (
    id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
    payment_session_id, provider_refund_id, amount_value, currency,
    signature_status, raw_payload_digest, processing_status
  ) values (
    'rinbox_real_adapter_duplicate_same', 'mock_china_pay',
    'evt_refund_real_adapter_001', 'refund.succeeded',
    'refund_notify:mock_china_pay:evt_refund_real_adapter_001',
    'pay_mock_refund_order_001', 'payses_mock_refund_001',
    'mock_provider_refund_001', 8800, 'CNY', 'verified',
    'sha256:refundrealadapter001', 'received'
  ) on conflict (provider, idempotency_key) do nothing;

  select count(*) into inbox_rows
  from payment_notification_inbox
  where provider = 'mock_china_pay'
    and idempotency_key = 'refund_notify:mock_china_pay:evt_refund_real_adapter_001';

  if inbox_rows <> 1 then
    raise exception 'same digest duplicate created % rows', inbox_rows;
  end if;

  insert into payment_notification_event_log (
    id, inbox_id, action, actor_type, message, metadata
  ) values (
    'rlog_real_adapter_duplicate_seen', 'rinbox_real_adapter_001',
    'refund_notification_duplicate_seen', 'provider',
    'Duplicate refund notification replayed.',
    '{"auditEventId":"raudit_duplicate_seen","duplicatePolicy":"same_digest_noop"}'::jsonb
  );

  insert into payment_notification_inbox (
    id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
    payment_session_id, provider_refund_id, amount_value, currency,
    signature_status, raw_payload_digest, processing_status
  ) values (
    'rinbox_real_adapter_duplicate_conflict', 'mock_china_pay',
    'evt_refund_real_adapter_001', 'refund.succeeded',
    'refund_notify:mock_china_pay:evt_refund_real_adapter_001',
    'pay_mock_refund_order_001', 'payses_mock_refund_001',
    'mock_provider_refund_001', 8800, 'CNY', 'verified',
    'sha256:differentrealadapterdigest', 'received'
  ) on conflict (provider, idempotency_key) do nothing;

  select raw_payload_digest into original_digest
  from payment_notification_inbox
  where id = 'rinbox_real_adapter_001';

  if original_digest <> 'sha256:refundrealadapter001' then
    raise exception 'digest conflict overwrote original digest: %', original_digest;
  end if;

  insert into payment_notification_event_log (
    id, inbox_id, action, actor_type, message, metadata
  ) values
    (
      'rlog_real_adapter_digest_conflict', 'rinbox_real_adapter_001',
      'refund_notification_digest_conflict', 'provider',
      'Refund notification digest conflict detected.',
      '{"auditEventId":"raudit_digest_conflict","manualReviewRequired":true}'::jsonb
    ),
    (
      'rlog_real_adapter_manual_review', 'rinbox_real_adapter_001',
      'refund_guard_manual_review_required', 'system',
      'Refund manual review required.',
      '{"auditEventId":"raudit_manual_review","severity":"high"}'::jsonb
    );

  begin
    update payment_notification_inbox
    set processing_status = 'normalized'
    where id = 'rinbox_real_adapter_001';
    raise exception 'shared schema accepted unmapped refund processing status';
  exception when check_violation then
    null;
  end;

  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_real_adapter_bad_actor', 'rinbox_real_adapter_001',
      'refund_notification_normalized', 'system_job',
      'bad actor fixture', '{"auditEventId":"raudit_bad_actor"}'::jsonb
    );
    raise exception 'shared schema accepted unmapped system_job actor';
  exception when check_violation then
    null;
  end;

  foreach forbidden_action in array array[
    'refund_state_mutated',
    'refund_workflow_executed',
    'provider_refund_request_sent',
    'settlement_adjusted',
    'commission_adjusted',
    'payout_adjusted'
  ] loop
    begin
      insert into payment_notification_event_log (
        id, inbox_id, action, actor_type, message, metadata
      ) values (
        'rlog_real_adapter_forbidden_' || forbidden_action,
        'rinbox_real_adapter_001', forbidden_action, 'system',
        'forbidden action fixture', '{"auditEventId":"raudit_forbidden"}'::jsonb
      );
      raise exception 'forbidden action % was accepted', forbidden_action;
    exception when check_violation then
      null;
    end;
  end loop;

  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_real_adapter_bad_metadata', 'rinbox_real_adapter_001',
      'refund_notification_received', 'provider',
      'bad metadata fixture',
      '{"auditEventId":"raudit_bad","providerRefundRequest":{"id":"req_1"},"nested":{"workflowCommand":{"type":"mutate"},"fullPhone":"13800138000"}}'::jsonb
    );
    raise exception 'metadata redaction constraint did not reject executable payload';
  exception when check_violation then
    null;
  end;

  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_real_adapter_partial_rollback', 'rinbox_real_adapter_001',
      'refund_notification_verified', 'system',
      'partial rollback fixture', '{"auditEventId":"raudit_partial"}'::jsonb
    );
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'rlog_real_adapter_partial_bad', 'rinbox_real_adapter_001',
      'provider_refund_request_sent', 'system',
      'partial rollback forbidden fixture', '{"auditEventId":"raudit_partial_bad"}'::jsonb
    );
    raise exception 'partial rollback fixture did not fail';
  exception when check_violation then
    null;
  end;

  select count(*) into event_rows
  from payment_notification_event_log
  where id in ('rlog_real_adapter_partial_rollback', 'rlog_real_adapter_partial_bad');

  if event_rows <> 0 then
    raise exception 'failed subtransaction left % partial event rows', event_rows;
  end if;
end $$;
SQL

echo "CHECK row counts"
"${psql_base[@]}" -tAc "
select
  (select count(*) from payment_notification_inbox) as inbox_rows,
  (select count(*) from payment_notification_event_log) as log_rows;
"

echo "APPLY shared inbox migration skeleton down SQL"
"${psql_base[@]}" -f "$down_sql" >/dev/null

echo "CHECK rollback removed rehearsal tables"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'payment_notification_event_log',
    'payment_notification_inbox'
  ] loop
    if to_regclass(table_name) is not null then
      raise exception 'table still exists after down: %', table_name;
    end if;
  end loop;
end $$;
SQL

echo "DROP disposable rehearsal database"
dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=0

if psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -tAc "select 1 from pg_database where datname = '$db_name';" | grep -q 1; then
  echo "Disposable database still exists after cleanup: $db_name" >&2
  exit 1
fi

echo "PASS refund inbox repository real DB adapter rehearsal completed with no residual database."
