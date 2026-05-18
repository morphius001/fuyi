#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_HTTP_SMOKE_DB:-fuyi_refund_review_query_surface_http_smoke_$(date +%Y%m%d%H%M%S)}"
database_url="postgres://${pg_user}@${pg_host}:${pg_port}/${db_name}"
api_port="${CODEX_HTTP_SMOKE_PORT:-19000}"
stability_wait_seconds="${CODEX_HTTP_SMOKE_STABILITY_WAIT_SECONDS:-15}"
admin_email="${CODEX_HTTP_SMOKE_ADMIN_EMAIL:-codex-refund-review-admin@example.com}"
admin_password="${CODEX_HTTP_SMOKE_ADMIN_PASSWORD:-Codex123456!}"
allow_shared_db_token="${CODEX_HTTP_SMOKE_ALLOW_SHARED_DB:-}"
created_db=0
disposable_db=0
work_dir="${TMPDIR:-/tmp}/fuyi-refund-review-query-surface-admin-http-smoke-local-db"
server_log="$work_dir/server.log"
login_body="$work_dir/login.json"
login_response="$work_dir/login.response.json"
route_response="$work_dir/route.response.json"
route_response_second="$work_dir/route.response.second.json"
route_response_third="$work_dir/route.response.third.json"
route_response_blocked="$work_dir/route.response.blocked.json"
server_pid=""

mkdir -p "$work_dir"

cleanup() {
  status=$?
  if [ -n "$server_pid" ] && kill -0 "$server_pid" >/dev/null 2>&1; then
    kill "$server_pid" >/dev/null 2>&1 || true
    wait "$server_pid" >/dev/null 2>&1 || true
  fi

  if [ "$created_db" = "1" ]; then
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -v ON_ERROR_STOP=1 >/dev/null <<SQL || true
select pg_terminate_backend(pid)
from pg_stat_activity
where datname = '$db_name'
  and pid <> pg_backend_pid();
SQL
    dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name" >/dev/null 2>&1 || true
    remaining_count="$(
      psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -Atc "select count(*) from pg_database where datname = '$db_name';" 2>/dev/null || printf 'unknown'
    )"
    echo "CLEANUP disposable database remaining count after drop: ${remaining_count}"
  else
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 >/dev/null <<'SQL' || true
delete from china_refund_state_mutation_terminal_conflict where id = 'terminal_conflict_001';
delete from china_refund_state_mutation_runtime_attempt where id = 'runtime_attempt_001';
delete from china_refund_state_mutation_audit where id = 'audit_001';
delete from china_refund_state_mutation_approval where id = 'approval_001';
SQL
    echo "CLEANUP shared local seed records removed from database: $db_name"
  fi

  exit "$status"
}
trap cleanup EXIT

for cmd in psql createdb dropdb pg_isready curl; do
  command -v "$cmd" >/dev/null || {
    echo "$cmd not found. Install required tools first." >&2
    exit 1
  }
done

export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/code/fuyi/packages/api/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export NODE_PATH="/home/codex/code/fuyi/packages/api/node_modules:/home/codex/code/fuyi/node_modules"

for cmd in node medusa; do
  command -v "$cmd" >/dev/null || {
    echo "$cmd not found in shared toolchain path." >&2
    exit 1
  }
done

pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" >/dev/null || {
  echo "PostgreSQL is not ready at ${pg_host}:${pg_port}." >&2
  exit 1
}

case "$pg_host" in
  127.0.0.1|localhost|::1) ;;
  *)
    echo "Refusing non-local PostgreSQL host '$pg_host' for local HTTP smoke." >&2
    exit 1
    ;;
esac

case "$db_name" in
  fuyi_refund_review_query_surface_http_smoke_[0-9]*|fuyi_refund_review_query_surface_http_smoke_local_*)
    disposable_db=1
    ;;
  *)
    if [ "$allow_shared_db_token" != "I_ACCEPT_SHARED_LOCAL_DB_SEED_CLEANUP_ONLY" ]; then
      echo "Refusing shared database '$db_name'." >&2
      echo "Use the default disposable database name, or set CODEX_HTTP_SMOKE_ALLOW_SHARED_DB=I_ACCEPT_SHARED_LOCAL_DB_SEED_CLEANUP_ONLY for an explicitly shared local DB." >&2
      exit 1
    fi
    ;;
esac

case "$db_name" in
  *[!A-Za-z0-9_]*)
    echo "Refusing database '$db_name'. Name may only contain letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

if [ "$disposable_db" = "1" ]; then
  if ! printf "%s" "$db_name" | grep -E '^fuyi_refund_review_query_surface_http_smoke_([0-9]{14}|local_[A-Za-z0-9_]+)$' >/dev/null; then
    echo "Refusing database '$db_name'. Expected fuyi_refund_review_query_surface_http_smoke_YYYYMMDDHHMMSS or local suffix." >&2
    exit 1
  fi

  echo "CREATE disposable refund review query surface HTTP smoke database: $db_name"
  createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
  created_db=1
else
  echo "USING explicitly acknowledged shared local database: $db_name"
fi

run_medusa() {
  (
    cd "$root/packages/api"
    export NODE_ENV=development
    export APP_ENV=development
    export MEDUSA_ENV=development
    export CODEX_DATABASE_URL="$database_url"
    export STORE_CORS="http://localhost:3101,http://127.0.0.1:3101"
    export ADMIN_CORS="http://localhost:7000,http://127.0.0.1:7000"
    export AUTH_CORS="http://localhost:7000,http://127.0.0.1:7000,http://localhost:${api_port},http://127.0.0.1:${api_port}"
    export VENDOR_CORS="http://localhost:7001,http://127.0.0.1:7001"
    export JWT_SECRET="supersecret"
    export COOKIE_SECRET="supersecret"
    "$@"
  )
}

echo "RUN medusa db:migrate against local database: $db_name"
run_medusa medusa db:migrate --skip-links --skip-scripts >/dev/null

echo "ENSURE local-only link table needed by Medusa defaults exists"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
create table if not exists publishable_api_key_sales_channel (
  id text primary key,
  publishable_key_id text not null,
  sales_channel_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  unique (publishable_key_id, sales_channel_id)
);

create table if not exists user_rbac_role (
  id text primary key,
  user_id text not null,
  rbac_role_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  unique (user_id, rbac_role_id)
);
SQL

echo "UPSERT local admin user in smoke database if needed"
run_medusa medusa user -e "$admin_email" -p "$admin_password" >/dev/null || true

echo "SEED review query surface records into local database"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$db_name" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
delete from china_refund_state_mutation_terminal_conflict where id = 'terminal_conflict_001';
delete from china_refund_state_mutation_runtime_attempt where id = 'runtime_attempt_001';
delete from china_refund_state_mutation_audit where id = 'audit_001';
delete from china_refund_state_mutation_approval where id = 'approval_001';

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

echo "START dedicated medusa develop on :$api_port using local database"
(
  cd "$root/packages/api"
  export NODE_ENV=development
  export APP_ENV=staging
  export MEDUSA_ENV=development
  export CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED=true
  export CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE=isolated_preprod_repository
  export CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV=isolated_preprod
  export CODEX_DATABASE_URL="$database_url"
  export STORE_CORS="http://localhost:3101,http://127.0.0.1:3101"
  export ADMIN_CORS="http://localhost:7000,http://127.0.0.1:7000"
  export AUTH_CORS="http://localhost:7000,http://127.0.0.1:7000,http://localhost:${api_port},http://127.0.0.1:${api_port}"
  export VENDOR_CORS="http://localhost:7001,http://127.0.0.1:7001"
  export JWT_SECRET="supersecret"
  export COOKIE_SECRET="supersecret"
  nohup medusa develop -H 127.0.0.1 -p "$api_port" >"$server_log" 2>&1 &
  echo $! >"$work_dir/server.pid"
)
server_pid="$(cat "$work_dir/server.pid")"

for _ in $(seq 1 60); do
  if curl -fsS -X OPTIONS "http://127.0.0.1:${api_port}/auth/user/emailpass" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! kill -0 "$server_pid" >/dev/null 2>&1; then
  echo "Dedicated medusa develop process exited unexpectedly." >&2
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

cat >"$login_body" <<JSON
{"email":"$admin_email","password":"$admin_password"}
JSON

login_status="$(
  curl -sS -o "$login_response" \
    -X POST "http://127.0.0.1:${api_port}/auth/user/emailpass" \
    -H "content-type: application/json" \
    --data-binary @"$login_body" \
    -w '%{http_code}'
)"

if [ "$login_status" != "200" ]; then
  echo "Admin login failed with HTTP $login_status" >&2
  cat "$login_response" >&2 || true
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

token="$(
  node -e 'const fs=require("fs");const body=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));process.stdout.write(body.token || "");' "$login_response"
)"

if [ -z "$token" ]; then
  echo "Admin login response did not return a bearer token." >&2
  cat "$login_response" >&2 || true
  exit 1
fi

route_status="$(
  curl -sS -o "$route_response" \
    -H "authorization: Bearer ${token}" \
    "http://127.0.0.1:${api_port}/admin/china/refund-review-query-surface?query_kind=platform_refund_id&platform_refund_id=refund_platform_001" \
    -w '%{http_code}'
)"

if [ "$route_status" != "200" ]; then
  echo "Admin refund review route failed with HTTP $route_status" >&2
  cat "$route_response" >&2 || true
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

node - <<'NODE' "$route_response"
const fs = require("fs")
const body = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
assert(body.status === "resolved", `expected resolved: ${JSON.stringify(body)}`)
assert(body.mode === "isolated_preprod_repository", `expected isolated_preprod_repository: ${JSON.stringify(body)}`)
assert(body.runtimeMutationBlocked === true, "expected runtimeMutationBlocked=true")
assert(body.workflowExecutionAllowed === false, "expected workflowExecutionAllowed=false")
assert(body.stateMutationAllowed === false, "expected stateMutationAllowed=false")
assert(body.refundSuccessState === false, "expected refundSuccessState=false")
assert(
  body.evidenceCounts &&
    body.evidenceCounts.approvalRecords === 1 &&
    body.evidenceCounts.auditRecords === 1 &&
    body.evidenceCounts.runtimeAttemptRecords === 1 &&
    body.evidenceCounts.terminalConflictSnapshots === 1,
  `unexpected evidence counts: ${JSON.stringify(body.evidenceCounts)}`,
)
const serialized = JSON.stringify(body)
assert(!serialized.includes("reviewInput"), "response leaked reviewInput")
assert(!serialized.includes("\"bundle\""), "response leaked bundle")
console.log("PASS refund review query surface admin HTTP smoke (local db)")
NODE

second_route_status="$(
  curl -sS -o "$route_response_second" \
    -H "authorization: Bearer ${token}" \
    "http://127.0.0.1:${api_port}/admin/china/refund-review-query-surface?query_kind=approval_persistence_idempotency_key&approval_persistence_idempotency_key=approval_persistence_001" \
    -w '%{http_code}'
)"

if [ "$second_route_status" != "200" ]; then
  echo "Second admin refund review route call failed with HTTP $second_route_status" >&2
  cat "$route_response_second" >&2 || true
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

node - <<'NODE' "$route_response_second"
const fs = require("fs")
const body = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
assert(body.status === "resolved", `expected resolved on second request: ${JSON.stringify(body)}`)
assert(body.mode === "isolated_preprod_repository", `expected isolated_preprod_repository on second request: ${JSON.stringify(body)}`)
assert(body.runtimeMutationBlocked === true, "expected runtimeMutationBlocked=true on second request")
assert(body.workflowExecutionAllowed === false, "expected workflowExecutionAllowed=false on second request")
assert(body.stateMutationAllowed === false, "expected stateMutationAllowed=false on second request")
assert(body.refundSuccessState === false, "expected refundSuccessState=false on second request")
console.log("PASS refund review query surface repeated admin HTTP smoke (local db)")
NODE

echo "WAIT ${stability_wait_seconds}s before third authenticated route call"
sleep "$stability_wait_seconds"

if ! kill -0 "$server_pid" >/dev/null 2>&1; then
  echo "Dedicated medusa develop process exited before stability check." >&2
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

third_route_status="$(
  curl -sS -o "$route_response_third" \
    -H "authorization: Bearer ${token}" \
    "http://127.0.0.1:${api_port}/admin/china/refund-review-query-surface?query_kind=provider_refund_reference&provider_name=wechat_pay&provider_refund_reference=wx_refund_001" \
    -w '%{http_code}'
)"

if [ "$third_route_status" != "200" ]; then
  echo "Third admin refund review route call failed with HTTP $third_route_status" >&2
  cat "$route_response_third" >&2 || true
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

node - <<'NODE' "$route_response_third"
const fs = require("fs")
const body = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
assert(body.status === "resolved", `expected resolved on third request: ${JSON.stringify(body)}`)
assert(body.mode === "isolated_preprod_repository", `expected isolated_preprod_repository on third request: ${JSON.stringify(body)}`)
assert(body.runtimeMutationBlocked === true, "expected runtimeMutationBlocked=true on third request")
assert(body.workflowExecutionAllowed === false, "expected workflowExecutionAllowed=false on third request")
assert(body.stateMutationAllowed === false, "expected stateMutationAllowed=false on third request")
assert(body.refundSuccessState === false, "expected refundSuccessState=false on third request")
console.log("PASS refund review query surface delayed admin HTTP smoke (local db)")
NODE

blocked_route_status="$(
  curl -sS -o "$route_response_blocked" \
    -H "authorization: Bearer ${token}" \
    "http://127.0.0.1:${api_port}/admin/china/refund-review-query-surface?query_kind=platform_refund_id&platform_refund_id=refund_platform_missing" \
    -w '%{http_code}'
)"

if [ "$blocked_route_status" != "400" ]; then
  echo "Blocked admin refund review route call returned unexpected HTTP $blocked_route_status" >&2
  cat "$route_response_blocked" >&2 || true
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

node - <<'NODE' "$route_response_blocked"
const fs = require("fs")
const body = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
assert(body.status === "blocked", `expected blocked: ${JSON.stringify(body)}`)
assert(body.mode === "isolated_preprod_repository", `expected isolated_preprod_repository: ${JSON.stringify(body)}`)
assert(body.code === "review_case_not_found", `expected review_case_not_found: ${JSON.stringify(body)}`)
assert(body.runtimeMutationBlocked === true, "expected runtimeMutationBlocked=true")
assert(body.workflowExecutionAllowed === false, "expected workflowExecutionAllowed=false")
assert(body.stateMutationAllowed === false, "expected stateMutationAllowed=false")
assert(body.refundSuccessState === false, "expected refundSuccessState=false")
const serialized = JSON.stringify(body)
assert(!serialized.includes("reviewInput"), "response leaked reviewInput")
assert(!serialized.includes("\"bundle\""), "response leaked bundle")
assert(!serialized.includes("postgres://"), "response leaked postgres URL")
assert(!serialized.includes("db unavailable"), "response leaked low-level DB error")
console.log("PASS refund review query surface blocked admin HTTP smoke (local db)")
NODE

echo "PASS refund review query surface admin HTTP smoke completed against local database: $db_name"
if [ "$created_db" = "1" ]; then
  echo "CLEANUP will drop disposable database: $db_name"
fi
