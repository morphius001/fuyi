#!/usr/bin/env bash
set -euo pipefail

mode="${1:-seed}"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_HTTP_SMOKE_DB:-mercur}"

for cmd in psql pg_isready; do
  command -v "$cmd" >/dev/null || {
    echo "$cmd not found. Install required tools first." >&2
    exit 1
  }
done

pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" >/dev/null || {
  echo "PostgreSQL is not ready at ${pg_host}:${pg_port}." >&2
  exit 1
}

cleanup_sql() {
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
delete from china_refund_state_mutation_terminal_conflict where id = 'terminal_conflict_001';
delete from china_refund_state_mutation_runtime_attempt where id = 'runtime_attempt_001';
delete from china_refund_state_mutation_audit where id = 'audit_001';
delete from china_refund_state_mutation_approval where id = 'approval_001';
SQL
}

seed_sql() {
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
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
  'runtime attempt prepared for isolated preprod review'
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
SQL
}

case "$mode" in
  seed)
    cleanup_sql
    seed_sql
    echo "PASS refund review query surface local db seed"
    ;;
  cleanup)
    cleanup_sql
    echo "PASS refund review query surface local db cleanup"
    ;;
  *)
    echo "Usage: $0 [seed|cleanup]" >&2
    exit 1
    ;;
esac
