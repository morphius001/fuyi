import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260507000200 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "payment_notification_inbox" (
        "id" text not null,
        "provider" text not null,
        "event_id" text null,
        "event_type" text not null,
        "idempotency_key" text not null,
        "merchant_order_ref" text not null,
        "payment_session_id" text null,
        "provider_transaction_id" text null,
        "provider_refund_id" text null,
        "amount_value" integer not null,
        "currency" text not null default 'CNY',
        "signature_status" text not null,
        "raw_payload_digest" text not null,
        "raw_payload_ref" text null,
        "processing_status" text not null,
        "retry_count" integer not null default 0,
        "last_error_code" text null,
        "last_error_message" text null,
        "occurred_at" timestamptz null,
        "received_at" timestamptz not null default now(),
        "processed_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        constraint "payment_notification_inbox_pkey" primary key ("id"),
        constraint "payment_notification_inbox_provider_check" check ("provider" in ('mock_china_pay', 'alipay', 'wechat_pay')),
        constraint "payment_notification_inbox_event_type_check" check ("event_type" in ('payment.succeeded', 'payment.closed', 'payment.failed', 'refund.succeeded', 'refund.failed', 'reconciliation.adjusted')),
        constraint "payment_notification_inbox_currency_check" check ("currency" = 'CNY'),
        constraint "payment_notification_inbox_signature_status_check" check ("signature_status" in ('verified', 'invalid', 'missing', 'unsupported')),
        constraint "payment_notification_inbox_processing_status_check" check ("processing_status" in ('received', 'verified', 'processing', 'processed', 'retryable_failed', 'terminal_failed', 'ignored_duplicate', 'signature_verified', 'normalized', 'guard_checked', 'manual_review_required', 'runtime_mutation_blocked', 'processed_for_audit_only', 'terminal_rejected', 'duplicate_seen', 'digest_conflict_manual_review')),
        constraint "payment_notification_inbox_retry_count_check" check ("retry_count" >= 0),
        constraint "payment_notification_inbox_amount_positive_check" check ("amount_value" > 0),
        constraint "payment_notification_inbox_unique_idempotency" unique ("provider", "idempotency_key")
      );
    `)

    this.addSql(`
      create index if not exists "IDX_payment_notification_inbox_event"
      on "payment_notification_inbox" ("provider", "event_id");

      create index if not exists "IDX_payment_notification_inbox_provider_refund"
      on "payment_notification_inbox" ("provider", "provider_refund_id")
      where "provider_refund_id" is not null;
    `)

    this.addSql(`
      create index if not exists "IDX_payment_notification_inbox_merchant_ref"
      on "payment_notification_inbox" ("merchant_order_ref");
    `)

    this.addSql(`
      create index if not exists "IDX_payment_notification_inbox_status_received"
      on "payment_notification_inbox" ("processing_status", "received_at");
    `)

    this.addSql(`
      create or replace function "payment_notification_metadata_has_blocked_key"(input jsonb)
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

      create table if not exists "payment_notification_event_log" (
        "id" text not null,
        "inbox_id" text not null,
        "action" text not null,
        "actor_type" text not null,
        "message" text not null,
        "metadata" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        constraint "payment_notification_event_log_pkey" primary key ("id"),
        constraint "payment_notification_event_log_inbox_fk" foreign key ("inbox_id") references "payment_notification_inbox" ("id") on delete cascade,
        constraint "payment_notification_event_log_action_check" check ("action" in ('received', 'verified', 'dedupe_hit', 'handler_started', 'command_prepared', 'command_skipped', 'command_blocked', 'workflow_execution_started', 'workflow_execution_succeeded', 'workflow_execution_failed', 'manual_review_required', 'processed', 'retry_scheduled', 'failed', 'refund_notification_received', 'refund_notification_verified', 'refund_notification_normalized', 'refund_notification_duplicate_seen', 'refund_notification_digest_conflict', 'refund_guard_manual_review_required', 'refund_runtime_mutation_blocked', 'refund_settlement_blocked')),
        constraint "payment_notification_event_log_actor_type_check" check ("actor_type" in ('system', 'provider', 'operator', 'system_job', 'admin', 'vendor')),
        constraint "payment_notification_event_log_metadata_redacted_check" check (not "payment_notification_metadata_has_blocked_key"("metadata"))
      );
    `)

    this.addSql(`
      create index if not exists "IDX_payment_notification_event_log_inbox_created"
      on "payment_notification_event_log" ("inbox_id", "created_at");
    `)

    this.addSql(`
      create index if not exists "IDX_payment_notification_event_log_action_created"
      on "payment_notification_event_log" ("action", "created_at");
    `)
  }

  async down(): Promise<void> {
    this.addSql(`
      drop table if exists "payment_notification_event_log";
      drop function if exists "payment_notification_metadata_has_blocked_key"(jsonb);
    `)
    this.addSql(`drop table if exists "payment_notification_inbox";`)
  }
}
