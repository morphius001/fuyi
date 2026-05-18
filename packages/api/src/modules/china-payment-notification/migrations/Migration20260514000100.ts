import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260514000100 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "china_refund_state_mutation_audit" (
        "id" text not null,
        "audit_persistence_idempotency_key" text not null,
        "approval_persistence_idempotency_key" text not null,
        "approval_candidate_idempotency_key" text null,
        "target_state" text null,
        "status" text not null,
        "audit_action" text not null,
        "audit_reason_redacted" text not null,
        "created_at" timestamptz not null default now(),
        constraint "china_refund_state_mutation_audit_pkey" primary key ("id"),
        constraint "china_refund_state_mutation_audit_idempotency_unique" unique ("audit_persistence_idempotency_key"),
        constraint "china_refund_state_mutation_audit_status_check" check ("status" in ('recorded', 'replayed', 'blocked', 'rejected'))
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_refund_state_mutation_audit_approval_idempotency"
      on "china_refund_state_mutation_audit" ("approval_persistence_idempotency_key");
    `)

    this.addSql(`
      create table if not exists "china_refund_state_mutation_runtime_attempt" (
        "id" text not null,
        "runtime_attempt_persistence_idempotency_key" text not null,
        "workflow_idempotency_key" text not null,
        "platform_refund_id" text not null,
        "provider_name" text not null,
        "provider_refund_reference" text not null,
        "merchant_order_reference" text not null,
        "refund_request_reference" text not null,
        "target_state" text not null,
        "target_state_audit_label" text not null,
        "attempt_status" text not null,
        "attempt_number" integer not null,
        "provider_evidence_digest" text not null,
        "digest_version" text not null,
        "approval_persistence_idempotency_key" text not null,
        "audit_persistence_idempotency_key" text not null,
        "terminal_conflict_decision_key" text not null,
        "feature_flag_snapshot_key" text not null,
        "environment" text not null,
        "failure_code" text null,
        "failure_reason_redacted" text null,
        "operator_visible_reason" text null,
        "created_at" timestamptz not null default now(),
        "started_at" timestamptz null,
        "finished_at" timestamptz null,
        "next_retry_at" timestamptz null,
        constraint "china_refund_state_mutation_runtime_attempt_pkey" primary key ("id"),
        constraint "china_refund_state_mutation_runtime_attempt_idempotency_unique" unique ("runtime_attempt_persistence_idempotency_key"),
        constraint "china_refund_state_mutation_runtime_attempt_provider_name_check" check ("provider_name" in ('mock_china_pay', 'alipay', 'wechat_pay')),
        constraint "china_refund_state_mutation_runtime_attempt_status_check" check ("attempt_status" in ('planned_disabled', 'duplicate_noop_disabled', 'manual_review_disabled', 'retryable_failed', 'blocked')),
        constraint "china_refund_state_mutation_runtime_attempt_number_check" check ("attempt_number" >= 0),
        constraint "china_refund_state_mutation_runtime_attempt_environment_check" check ("environment" in ('development', 'test', 'staging', 'production'))
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_refund_state_mutation_runtime_attempt_platform_refund_id"
      on "china_refund_state_mutation_runtime_attempt" ("platform_refund_id");

      create index if not exists "IDX_china_refund_state_mutation_runtime_attempt_workflow_idempotency"
      on "china_refund_state_mutation_runtime_attempt" ("workflow_idempotency_key");

      create index if not exists "IDX_china_refund_state_mutation_runtime_attempt_provider_ref"
      on "china_refund_state_mutation_runtime_attempt" ("provider_name", "provider_refund_reference");
    `)

    this.addSql(`
      create table if not exists "china_refund_state_mutation_terminal_conflict" (
        "id" text not null,
        "terminal_conflict_persistence_idempotency_key" text not null,
        "terminal_conflict_decision_key" text not null,
        "platform_refund_id" text not null,
        "current_refund_state" text not null,
        "incoming_target_state" text not null,
        "conflict_status" text not null,
        "conflict_code" text not null,
        "terminal_marker_key" text null,
        "terminal_marker_version" text null,
        "provider_evidence_digest" text not null,
        "provider_evidence_digest_version" text null,
        "approval_persistence_idempotency_key" text null,
        "audit_persistence_idempotency_key" text null,
        "workflow_idempotency_key" text null,
        "runtime_attempt_persistence_idempotency_key" text null,
        "feature_flag_snapshot_key" text null,
        "state_owner_evidence_key" text null,
        "actor_reference" text null,
        "reviewer_reference" text null,
        "conflict_detected_at" timestamptz not null,
        "created_at" timestamptz not null default now(),
        constraint "china_refund_state_mutation_terminal_conflict_pkey" primary key ("id"),
        constraint "china_refund_state_mutation_terminal_conflict_idempotency_unique" unique ("terminal_conflict_persistence_idempotency_key"),
        constraint "china_refund_state_mutation_terminal_conflict_status_check" check ("conflict_status" in ('shadow_prepared_disabled', 'duplicate_noop_disabled', 'manual_review_disabled', 'blocked')),
        constraint "china_refund_state_mutation_terminal_conflict_code_check" check ("conflict_code" in ('no_terminal_conflict', 'duplicate_noop', 'manual_review'))
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_refund_state_mutation_terminal_conflict_platform_refund_id"
      on "china_refund_state_mutation_terminal_conflict" ("platform_refund_id");

      create index if not exists "IDX_china_refund_state_mutation_terminal_conflict_terminal_marker_key"
      on "china_refund_state_mutation_terminal_conflict" ("terminal_marker_key");

      create index if not exists "IDX_china_refund_state_mutation_terminal_conflict_approval_idempotency"
      on "china_refund_state_mutation_terminal_conflict" ("approval_persistence_idempotency_key");
    `)
  }

  async down(): Promise<void> {
    this.addSql(`
      drop table if exists "china_refund_state_mutation_terminal_conflict";
      drop table if exists "china_refund_state_mutation_runtime_attempt";
      drop table if exists "china_refund_state_mutation_audit";
    `)
  }
}
