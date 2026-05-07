#!/usr/bin/env bash
set -euo pipefail

pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_payment_notification_inbox_dry_run_$(date +%Y%m%d%H%M%S)}"
created_db=0

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

pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" >/dev/null || {
  echo "PostgreSQL is not ready at ${pg_host}:${pg_port}." >&2
  echo "Start local services with .codex/scripts/start-dev.sh start, then rerun this script." >&2
  exit 1
}

echo "CREATE disposable dry-run database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

psql_base=(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1)

echo "APPLY inbox model up SQL"
"${psql_base[@]}" >/dev/null <<'SQL'
create table payment_notification_inbox (
  id text primary key,
  provider text not null,
  event_id text,
  event_type text not null,
  idempotency_key text not null,
  merchant_order_ref text not null,
  payment_session_id text,
  provider_transaction_id text,
  provider_refund_id text,
  amount_value integer not null,
  currency text not null default 'CNY',
  signature_status text not null,
  raw_payload_digest text not null,
  raw_payload_ref text,
  processing_status text not null,
  retry_count integer not null default 0,
  last_error_code text,
  last_error_message text,
  occurred_at timestamptz,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_notification_inbox_provider_check
    check (provider in ('mock_china_pay', 'alipay', 'wechat_pay')),
  constraint payment_notification_inbox_event_type_check
    check (event_type in (
      'payment.succeeded',
      'payment.closed',
      'payment.failed',
      'refund.succeeded',
      'refund.failed',
      'reconciliation.adjusted'
    )),
  constraint payment_notification_inbox_currency_check
    check (currency = 'CNY'),
  constraint payment_notification_inbox_signature_status_check
    check (signature_status in ('verified', 'invalid', 'missing', 'unsupported')),
  constraint payment_notification_inbox_processing_status_check
    check (processing_status in (
      'received',
      'verified',
      'processing',
      'processed',
      'retryable_failed',
      'terminal_failed',
      'ignored_duplicate'
    )),
  constraint payment_notification_inbox_retry_count_check
    check (retry_count >= 0),
  constraint payment_notification_inbox_unique_idempotency
    unique (provider, idempotency_key)
);

create index payment_notification_inbox_event_idx
  on payment_notification_inbox (provider, event_id);

create index payment_notification_inbox_merchant_ref_idx
  on payment_notification_inbox (merchant_order_ref);

create index payment_notification_inbox_status_received_idx
  on payment_notification_inbox (processing_status, received_at);

create table payment_notification_event_log (
  id text primary key,
  inbox_id text not null references payment_notification_inbox(id) on delete cascade,
  action text not null,
  actor_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint payment_notification_event_log_action_check
    check (action in (
      'received',
      'verified',
      'dedupe_hit',
      'handler_started',
      'processed',
      'retry_scheduled',
      'failed'
    )),
  constraint payment_notification_event_log_actor_type_check
    check (actor_type in ('system', 'provider', 'operator'))
);

create index payment_notification_event_log_inbox_created_idx
  on payment_notification_event_log (inbox_id, created_at);

create index payment_notification_event_log_action_created_idx
  on payment_notification_event_log (action, created_at);
SQL

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

echo "APPLY inbox model down SQL"
"${psql_base[@]}" >/dev/null <<'SQL'
drop table if exists payment_notification_event_log;
drop table if exists payment_notification_inbox;
SQL

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

echo "PASS payment notification inbox local dry-run completed and disposable database will be dropped."
