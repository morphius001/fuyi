#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_PG_PORT:-15432}"
pg_user="${CODEX_PG_USER:-$USER}"
db_name="${CODEX_DRY_RUN_DB:-fuyi_refund_review_query_surface_http_smoke_$(date +%Y%m%d%H%M%S)}"
database_url="postgres://${pg_user}@${pg_host}:${pg_port}/${db_name}"
api_port="${CODEX_HTTP_SMOKE_PORT:-19000}"
admin_email="codex-refund-review-admin@example.com"
admin_password="Codex123456!"
work_dir="${TMPDIR:-/tmp}/fuyi-refund-review-query-surface-admin-http-smoke"
server_log="$work_dir/server.log"
login_body="$work_dir/login.json"
login_headers="$work_dir/login.headers"
login_response="$work_dir/login.response.json"
route_headers="$work_dir/route.headers"
route_response="$work_dir/route.response.json"
cookie_jar="$work_dir/cookies.txt"
server_pid=""
created_db=0

mkdir -p "$work_dir"

case "$db_name" in
  fuyi_refund_review_query_surface_http_smoke_[0-9]*|fuyi_refund_review_query_surface_http_smoke_local_*) ;;
  *)
    echo "Refusing database '$db_name'. Name must use the admin-http-smoke timestamp or local prefix." >&2
    exit 1
    ;;
esac

case "$db_name" in
  *[!A-Za-z0-9_]*)
    echo "Refusing database '$db_name'. Name may only contain letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

case "$pg_host" in
  127.0.0.1|localhost|::1) ;;
  *)
    echo "Refusing non-local PostgreSQL host '$pg_host'." >&2
    exit 1
    ;;
esac

cleanup() {
  status=$?
  if [ -n "$server_pid" ] && kill -0 "$server_pid" >/dev/null 2>&1; then
    kill "$server_pid" >/dev/null 2>&1 || true
    wait "$server_pid" >/dev/null 2>&1 || true
  fi
  if [ "$created_db" = "1" ]; then
    dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name" >/dev/null 2>&1 || true
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

if ! grep -Eq 'resolve:\s*["'"'"']\./src/modules/china-payment-notification["'"'"']' "$root/packages/api/medusa-config.ts"; then
  echo "Refusing admin HTTP smoke: china-payment-notification module is not registered in medusa-config.ts." >&2
  exit 1
fi

echo "CREATE disposable refund review query surface admin HTTP smoke database: $db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

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

echo "RUN medusa db:migrate for admin HTTP smoke"
run_medusa medusa db:migrate --execute-safe-links --skip-scripts >/dev/null

echo "CREATE local admin user for authenticated route smoke"
run_medusa medusa user -e "$admin_email" -p "$admin_password" >/dev/null

echo "SEED refund review query surface records"
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

echo "START dedicated medusa develop on :$api_port"
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
  if curl -fsS "http://127.0.0.1:${api_port}/auth/user/emailpass" >/dev/null 2>&1; then
    break
  fi
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

echo "LOGIN local admin user over HTTP"
login_status="$(
  curl -sS -o "$login_response" -D "$login_headers" -c "$cookie_jar" \
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

echo "CALL authenticated admin refund review route"
route_status="$(
  curl -sS -o "$route_response" -D "$route_headers" -b "$cookie_jar" \
    "http://127.0.0.1:${api_port}/admin/china/refund-review-query-surface?query_kind=platform_refund_id&platform_refund_id=refund_platform_001" \
    -w '%{http_code}'
)"

if [ "$route_status" = "401" ] || [ "$route_status" = "403" ]; then
  bearer_token="$(
    node -e 'const fs=require("fs");const body=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));process.stdout.write(body.token || body.access_token || body.jwt || "");' "$login_response"
  )"
  if [ -n "$bearer_token" ]; then
    route_status="$(
      curl -sS -o "$route_response" -D "$route_headers" \
        -H "authorization: Bearer ${bearer_token}" \
        "http://127.0.0.1:${api_port}/admin/china/refund-review-query-surface?query_kind=platform_refund_id&platform_refund_id=refund_platform_001" \
        -w '%{http_code}'
    )"
  fi
fi

if [ "$route_status" != "200" ]; then
  echo "Admin refund review route failed with HTTP $route_status" >&2
  cat "$route_response" >&2 || true
  tail -n 120 "$server_log" >&2 || true
  exit 1
fi

node - <<'NODE' "$route_response"
const fs = require("fs")
const file = process.argv[2]
const body = JSON.parse(fs.readFileSync(file, "utf8"))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

assert(body.status === "resolved", `expected resolved, got ${JSON.stringify(body)}`)
assert(
  body.mode === "isolated_preprod_repository",
  `expected isolated_preprod_repository, got ${JSON.stringify(body)}`,
)
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
  `unexpected evidenceCounts: ${JSON.stringify(body.evidenceCounts)}`,
)
const serialized = JSON.stringify(body)
assert(!serialized.includes("reviewInput"), "response leaked reviewInput")
assert(!serialized.includes("\"bundle\""), "response leaked bundle")
console.log("PASS refund review query surface admin HTTP smoke")
NODE

echo "PASS refund review query surface admin HTTP smoke completed for database: $db_name"
