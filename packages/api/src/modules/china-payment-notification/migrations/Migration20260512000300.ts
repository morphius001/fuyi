import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260512000300 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create or replace function "china_refund_state_mutation_metadata_has_blocked_key"(input jsonb)
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
            'rawproviderpayload',
            'rawpayload',
            'signature',
            'secret',
            'privatekey',
            'certificate',
            'apiv3key',
            'webhooksecret',
            'dburl',
            'databaseurl',
            'productiondburl',
            'providerrequest',
            'providerquery',
            'providerrequestpayload',
            'providerquerypayload',
            'providerrefundrequest',
            'providerrefundquery',
            'providerrefundrequestpayload',
            'providerrefundquerypayload',
            'workflowexecution',
            'executeworkflow',
            'refundstatemutation',
            'approvalpersistence',
            'persistenceintent',
            'auditwrite',
            'dbwrite',
            'settlementadjustment',
            'commissionadjustment',
            'payoutadjustment',
            'financialmutation',
            'settlementmutation',
            'commissionmutation',
            'payoutmutation',
            'permissionmutation',
            'fulfillmentmutation',
            'logisticsmutation',
            'fullphone',
            'fulladdress',
            'identitynumber',
            'bankcardnumber'
          )
        );
      $$;
    `)

    this.addSql(`
      create table if not exists "china_refund_state_mutation_approval" (
        "id" text not null,
        "approval_idempotency_key" text not null,
        "platform_refund_id" text not null,
        "provider_name" text not null,
        "provider_refund_reference" text not null,
        "merchant_order_reference" text not null,
        "refund_request_reference" text not null,
        "target_state" text not null,
        "target_state_audit_label" text not null,
        "amount_minor" integer not null,
        "currency" text not null default 'CNY',
        "request_actor_id" text not null,
        "request_actor_type" text not null,
        "reviewer_actor_id" text not null,
        "reviewer_role" text not null,
        "permission_evidence_id" text not null,
        "ownership_evidence_id" text not null,
        "readiness_decision_key" text not null,
        "shadow_command_key" text not null,
        "runtime_adapter_decision_key" text not null,
        "feature_flag_snapshot_key" text not null,
        "status" text not null,
        "decision_reason_redacted" text not null,
        "created_at" timestamptz not null default now(),
        "decided_at" timestamptz null,
        "expires_at" timestamptz null,
        constraint "china_refund_state_mutation_approval_pkey" primary key ("id"),
        constraint "china_refund_state_mutation_approval_idempotency_unique" unique ("approval_idempotency_key"),
        constraint "china_refund_state_mutation_approval_provider_name_check" check ("provider_name" in ('mock_china_pay', 'alipay', 'wechat_pay')),
        constraint "china_refund_state_mutation_approval_amount_positive_check" check ("amount_minor" > 0),
        constraint "china_refund_state_mutation_approval_currency_check" check ("currency" = 'CNY'),
        constraint "china_refund_state_mutation_approval_request_actor_type_check" check ("request_actor_type" in ('admin', 'system_job')),
        constraint "china_refund_state_mutation_approval_reviewer_role_check" check ("reviewer_role" in ('admin_refund_reviewer', 'admin_finance_reviewer')),
        constraint "china_refund_state_mutation_approval_status_check" check ("status" in ('pending_review', 'approved', 'rejected', 'expired', 'replayed')),
        constraint "china_refund_state_mutation_approval_reviewer_separation_check" check ("reviewer_actor_id" <> "request_actor_id")
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_refund_state_mutation_approval_platform_refund_id"
      on "china_refund_state_mutation_approval" ("platform_refund_id");

      create index if not exists "IDX_china_refund_state_mutation_approval_provider_ref"
      on "china_refund_state_mutation_approval" ("provider_name", "provider_refund_reference");
    `)

    this.addSql(`
      create table if not exists "china_refund_state_mutation_approval_event" (
        "id" text not null,
        "approval_id" text not null,
        "action" text not null,
        "actor_id" text not null,
        "actor_type" text not null,
        "metadata_redacted" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        constraint "china_refund_state_mutation_approval_event_pkey" primary key ("id"),
        constraint "china_refund_state_mutation_approval_event_approval_fk" foreign key ("approval_id") references "china_refund_state_mutation_approval" ("id") on delete cascade,
        constraint "china_refund_state_mutation_approval_event_action_check" check ("action" in ('approval_requested', 'approval_approved', 'approval_rejected', 'approval_expired', 'approval_replayed', 'manual_review_handoff')),
        constraint "china_refund_state_mutation_approval_event_actor_type_check" check ("actor_type" in ('admin', 'system_job', 'system', 'operator')),
        constraint "china_refund_state_mut_approval_event_meta_check" check (not "china_refund_state_mutation_metadata_has_blocked_key"("metadata_redacted"))
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_refund_state_mutation_approval_event_approval_created"
      on "china_refund_state_mutation_approval_event" ("approval_id", "created_at");
    `)
  }

  async down(): Promise<void> {
    this.addSql(`
      drop table if exists "china_refund_state_mutation_approval_event";
      drop table if exists "china_refund_state_mutation_approval";
    `)
    this.addSql(`
      drop function if exists "china_refund_state_mutation_metadata_has_blocked_key"(jsonb);
    `)
  }
}
