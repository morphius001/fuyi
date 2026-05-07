#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_payment_notification_inbox_dry_run_$(date +%Y%m%d%H%M%S)}"
migration_file="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-payment-notification-inbox-dry-run"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
created_db=0

mkdir -p "$work_dir"

case "$db_name" in
  fuyi_payment_notification_inbox_dry_run_*) ;;
  *)
    echo "Refusing to use database '$db_name'. Name must start with fuyi_payment_notification_inbox_dry_run_." >&2
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
    nvm use >/tmp/fuyi-nvm-use-payment-inbox-dry-run.log
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

echo "CREATE disposable dry-run database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

echo "APPLY inbox migration skeleton up SQL"
"${psql_base[@]}" -f "$up_sql" >/dev/null

echo "CHECK tables and fixtures"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'payment_notification_inbox',
    'payment_notification_event_log'
  ] loop
    if to_regclass(table_name) is null then
      raise exception 'missing table %', table_name;
    end if;
  end loop;
end $$;

insert into payment_notification_inbox (
  id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
  payment_session_id, provider_transaction_id, amount_value, currency,
  signature_status, raw_payload_digest, processing_status
) values (
  'pinbox_001', 'mock_china_pay', 'evt_mock_001', 'payment.succeeded',
  'payment_notify:mock_china_pay:evt_mock_001', 'pay_mock_001',
  'payses_mock_001', 'mock_txn_001', 128560, 'CNY',
  'verified', 'sha256:mockdigest001', 'verified'
);

insert into payment_notification_inbox (
  id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
  amount_value, currency, signature_status, raw_payload_digest, processing_status,
  last_error_code
) values (
  'pinbox_002', 'mock_china_pay', 'evt_mock_invalid_001', 'payment.failed',
  'payment_notify:mock_china_pay:evt_mock_invalid_001', 'unknown',
  128560, 'CNY', 'invalid', 'sha256:mockdigest002', 'terminal_failed',
  'MOCK_SIGNATURE_INVALID'
);

insert into payment_notification_event_log (
  id, inbox_id, action, actor_type, message, metadata
) values (
  'plog_001', 'pinbox_001', 'received', 'provider',
  'Mock payment notification received.', '{"safe":true}'::jsonb
);

insert into payment_notification_event_log (
  id, inbox_id, action, actor_type, message, metadata
) values (
  'plog_002', 'pinbox_001', 'verified', 'system',
  'Mock payment notification signature verified.', '{"signature_status":"verified"}'::jsonb
);

insert into payment_notification_event_log (
  id, inbox_id, action, actor_type, message, metadata
) values
  (
    'plog_command_prepared', 'pinbox_001', 'command_prepared', 'system',
    'Mock payment workflow command DTO prepared.',
    '{"command_type":"capture_payment","idempotency_key":"payment_notify:mock_china_pay:evt_mock_001"}'::jsonb
  ),
  (
    'plog_command_skipped', 'pinbox_001', 'command_skipped', 'system',
    'Mock duplicate notification skipped before workflow execution.',
    '{"reason":"duplicate","retryable":false}'::jsonb
  ),
  (
    'plog_command_blocked', 'pinbox_001', 'command_blocked', 'system',
    'Mock payment notification blocked by state guard.',
    '{"block_type":"amount_mismatch","retryable":false}'::jsonb
  ),
  (
    'plog_workflow_started', 'pinbox_001', 'workflow_execution_started', 'system',
    'Mock workflow execution audit marker accepted by skeleton.',
    '{"workflow":"payment_capture","runtime_enabled":false}'::jsonb
  ),
  (
    'plog_workflow_succeeded', 'pinbox_001', 'workflow_execution_succeeded', 'system',
    'Mock workflow success audit marker accepted by skeleton.',
    '{"workflow":"payment_capture","runtime_enabled":false}'::jsonb
  ),
  (
    'plog_workflow_failed', 'pinbox_001', 'workflow_execution_failed', 'system',
    'Mock workflow failure audit marker accepted by skeleton.',
    '{"workflow":"payment_capture","error_code":"MOCK_RUNTIME_DISABLED"}'::jsonb
  ),
  (
    'plog_manual_review', 'pinbox_001', 'manual_review_required', 'operator',
    'Mock manual review audit marker accepted by skeleton.',
    '{"reason":"manual_review","contains_sensitive_payload":false}'::jsonb
  );

do $$
begin
  begin
    insert into payment_notification_inbox (
      id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest, processing_status
    ) values (
      'pinbox_duplicate', 'mock_china_pay', 'evt_mock_001', 'payment.succeeded',
      'payment_notify:mock_china_pay:evt_mock_001', 'pay_mock_001',
      128560, 'CNY', 'verified', 'sha256:duplicate', 'verified'
    );
    raise exception 'unique idempotency constraint did not reject duplicate';
  exception when unique_violation then
    null;
  end;

  begin
    insert into payment_notification_inbox (
      id, provider, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest, processing_status
    ) values (
      'pinbox_bad_currency', 'mock_china_pay', 'payment.succeeded',
      'payment_notify:mock_china_pay:bad_currency', 'pay_mock_bad',
      100, 'USD', 'verified', 'sha256:badcurrency', 'verified'
    );
    raise exception 'currency constraint did not reject non-CNY';
  exception when check_violation then
    null;
  end;

  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message
    ) values (
      'plog_bad_action', 'pinbox_001', 'state_mutated', 'system', 'bad'
    );
    raise exception 'event log action constraint did not reject bad action';
  exception when check_violation then
    null;
  end;
end $$;
SQL

echo "CHECK row counts"
"${psql_base[@]}" -tAc "
select
  (select count(*) from payment_notification_inbox) as inbox_rows,
  (select count(*) from payment_notification_event_log) as log_rows;
"

echo "APPLY inbox migration skeleton down SQL"
"${psql_base[@]}" -f "$down_sql" >/dev/null

echo "CHECK rollback removed dry-run tables"
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

echo "PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped."
