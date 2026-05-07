#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_payment_notification_repository_dry_run_$(date +%Y%m%d%H%M%S)}"
migration_file="$root/packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts"
work_dir="${TMPDIR:-/tmp}/fuyi-payment-notification-repository-dry-run"
up_sql="$work_dir/up.sql"
down_sql="$work_dir/down.sql"
created_db=0

mkdir -p "$work_dir"

case "$db_name" in
  fuyi_payment_notification_repository_dry_run_*) ;;
  *)
    echo "Refusing to use database '$db_name'. Name must start with fuyi_payment_notification_repository_dry_run_." >&2
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
    nvm use >/tmp/fuyi-nvm-use-payment-repository-dry-run.log
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

echo "APPLY payment notification schema"
"${psql_base[@]}" -f "$up_sql" >/dev/null

echo "RUN repository integration test"
"${psql_base[@]}" >/dev/null <<'SQL'
do $$
begin
  insert into payment_notification_inbox (
    id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
    payment_session_id, provider_transaction_id, amount_value, currency,
    signature_status, raw_payload_digest, processing_status
  ) values (
    'repo_pinbox_verified', 'mock_china_pay', 'repo_evt_verified', 'payment.succeeded',
    'payment_notify:mock_china_pay:repo_evt_verified', 'pay_repo_verified',
    'payses_repo_verified', 'repo_txn_verified', 128560, 'CNY',
    'verified', 'sha256:repo_verified', 'verified'
  );

  insert into payment_notification_event_log (
    id, inbox_id, action, actor_type, message, metadata
  ) values
    (
      'repo_plog_received', 'repo_pinbox_verified', 'received', 'provider',
      'Repository test notification received.',
      '{"provider":"mock_china_pay","event_id":"repo_evt_verified"}'::jsonb
    ),
    (
      'repo_plog_verified', 'repo_pinbox_verified', 'verified', 'system',
      'Repository test notification verified.',
      '{"signature_status":"verified"}'::jsonb
    );
end $$;

do $$
begin
  begin
    insert into payment_notification_inbox (
      id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest, processing_status
    ) values (
      'repo_pinbox_duplicate', 'mock_china_pay', 'repo_evt_verified', 'payment.succeeded',
      'payment_notify:mock_china_pay:repo_evt_verified', 'pay_repo_verified',
      128560, 'CNY', 'verified', 'sha256:repo_duplicate', 'verified'
    );
    raise exception 'duplicate idempotency key was not rejected';
  exception when unique_violation then
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message, metadata
    ) values (
      'repo_plog_dedupe', 'repo_pinbox_verified', 'dedupe_hit', 'system',
      'Repository test duplicate replayed.',
      '{"idempotency_key":"payment_notify:mock_china_pay:repo_evt_verified"}'::jsonb
    );
  end;
end $$;

insert into payment_notification_inbox (
  id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
  amount_value, currency, signature_status, raw_payload_digest, processing_status,
  last_error_code
) values (
  'repo_pinbox_invalid', 'mock_china_pay', 'repo_evt_invalid', 'payment.failed',
  'payment_notify:mock_china_pay:repo_evt_invalid', 'pay_repo_invalid',
  128560, 'CNY', 'invalid', 'sha256:repo_invalid', 'terminal_failed',
  'SIGNATURE_INVALID'
);

insert into payment_notification_event_log (
  id, inbox_id, action, actor_type, message, metadata
) values (
  'repo_plog_invalid_failed', 'repo_pinbox_invalid', 'failed', 'system',
  'Repository test invalid signature rejected.',
  '{"error_code":"SIGNATURE_INVALID"}'::jsonb
);

update payment_notification_inbox
set processing_status = 'retryable_failed',
    retry_count = retry_count + 1,
    last_error_code = 'DB_LOCK_TIMEOUT',
    last_error_message = 'Repository test lock timeout.',
    updated_at = now()
where id = 'repo_pinbox_verified';

insert into payment_notification_event_log (
  id, inbox_id, action, actor_type, message, metadata
) values (
  'repo_plog_retry', 'repo_pinbox_verified', 'retry_scheduled', 'system',
  'Repository test retry scheduled.',
  '{"error_code":"DB_LOCK_TIMEOUT","retry_count":1}'::jsonb
);

insert into payment_notification_inbox (
  id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
  amount_value, currency, signature_status, raw_payload_digest, processing_status,
  last_error_code
) values (
  'repo_pinbox_terminal', 'mock_china_pay', 'repo_evt_terminal', 'payment.failed',
  'payment_notify:mock_china_pay:repo_evt_terminal', 'pay_repo_terminal',
  128560, 'CNY', 'verified', 'sha256:repo_terminal', 'terminal_failed',
  'PAYLOAD_INVALID'
);

insert into payment_notification_event_log (
  id, inbox_id, action, actor_type, message, metadata
) values (
  'repo_plog_terminal_failed', 'repo_pinbox_terminal', 'failed', 'system',
  'Repository test terminal failure recorded.',
  '{"error_code":"PAYLOAD_INVALID"}'::jsonb
);

do $$
begin
  begin
    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message
    ) values (
      'repo_plog_bad_action', 'repo_pinbox_verified', 'state_mutated', 'system', 'bad'
    );
    raise exception 'unknown event log action was not rejected';
  exception when check_violation then
    null;
  end;

  begin
    insert into payment_notification_inbox (
      id, provider, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest, processing_status
    ) values (
      'repo_pinbox_bad_currency', 'mock_china_pay', 'payment.succeeded',
      'payment_notify:mock_china_pay:repo_bad_currency', 'pay_repo_bad_currency',
      100, 'USD', 'verified', 'sha256:repo_bad_currency', 'verified'
    );
    raise exception 'non-CNY currency was not rejected';
  exception when check_violation then
    null;
  end;
end $$;

do $$
begin
  begin
    insert into payment_notification_inbox (
      id, provider, event_id, event_type, idempotency_key, merchant_order_ref,
      amount_value, currency, signature_status, raw_payload_digest, processing_status
    ) values (
      'repo_pinbox_rollback', 'mock_china_pay', 'repo_evt_rollback', 'payment.succeeded',
      'payment_notify:mock_china_pay:repo_evt_rollback', 'pay_repo_rollback',
      128560, 'CNY', 'verified', 'sha256:repo_rollback', 'verified'
    );

    insert into payment_notification_event_log (
      id, inbox_id, action, actor_type, message
    ) values (
      'repo_plog_rollback_bad', 'repo_pinbox_rollback', 'state_mutated', 'system', 'bad'
    );
    raise exception 'rollback fixture unexpectedly succeeded';
  exception when check_violation then
    null;
  end;

  if exists (
    select 1 from payment_notification_inbox where id = 'repo_pinbox_rollback'
  ) then
    raise exception 'failed event log transaction did not roll back inbox insert';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from payment_notification_event_log
    where metadata ?| array['rawPayload', 'raw_payload', 'signature', 'secret', 'phone', 'mobile', 'openid', 'unionid']
  ) then
    raise exception 'event log metadata contains sensitive keys';
  end if;
end $$;
SQL

echo "CHECK repository row counts"
"${psql_base[@]}" -tAc "
select
  (select count(*) from payment_notification_inbox) as inbox_rows,
  (select count(*) from payment_notification_event_log) as log_rows;
"

echo "APPLY rollback"
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

echo "DROP disposable dry-run database"
dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=0

echo "CHECK no residual disposable database"
residual="$(
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -tAc \
    "select datname from pg_database where datname = '$db_name'"
)"

if [ -n "$residual" ]; then
  echo "Disposable database still exists: $residual" >&2
  exit 1
fi

echo "PASS payment notification repository disposable DB test completed."
