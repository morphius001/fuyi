#!/usr/bin/env bash
set -euo pipefail

api_url="${1:-http://127.0.0.1:19000}"
admin_email="${2:-codex-refund-review-admin@example.com}"
admin_password="${3:-Codex123456!}"
stability_wait_seconds="${CODEX_HTTP_SMOKE_STABILITY_WAIT_SECONDS:-15}"
work_dir="${TMPDIR:-/tmp}/fuyi-refund-review-query-surface-existing-server-smoke"
login_body="$work_dir/login.json"
login_response="$work_dir/login.response.json"
route_response="$work_dir/route.response.json"
route_response_second="$work_dir/route.response.second.json"
route_response_third="$work_dir/route.response.third.json"
route_response_blocked="$work_dir/route.response.blocked.json"

mkdir -p "$work_dir"

export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/code/fuyi/packages/api/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export NODE_PATH="/home/codex/code/fuyi/packages/api/node_modules:/home/codex/code/fuyi/node_modules"

command -v node >/dev/null || {
  echo "node not found in shared toolchain path." >&2
  exit 1
}

cleanup() {
  /home/codex/code/fuyi-pr-bx-workflow-runtime/.codex/scripts/refund-review-query-surface-seed-local-db.sh cleanup >/dev/null 2>&1 || true
}
trap cleanup EXIT

/home/codex/code/fuyi-pr-bx-workflow-runtime/.codex/scripts/refund-review-query-surface-seed-local-db.sh seed >/dev/null

cat >"$login_body" <<JSON
{"email":"$admin_email","password":"$admin_password"}
JSON

login_status="$(
  curl -sS -o "$login_response" \
    -X POST "${api_url}/auth/user/emailpass" \
    -H "content-type: application/json" \
    --data-binary @"$login_body" \
    -w '%{http_code}'
)"

if [ "$login_status" != "200" ]; then
  echo "Admin login failed with HTTP $login_status" >&2
  cat "$login_response" >&2 || true
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

call_route() {
  local output_file="$1"
  local query="$2"
  curl -sS -o "$output_file" \
    -H "authorization: Bearer ${token}" \
    "${api_url}/admin/china/refund-review-query-surface?${query}" \
    -w '%{http_code}'
}

validate_resolved() {
  local file="$1"
  local label="$2"
  node - <<'NODE' "$file" "$label"
const fs = require("fs")
const body = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
const label = process.argv[3]
const assert = (condition, message) => {
  if (!condition) throw new Error(`${label}: ${message}`)
}
assert(body.status === "resolved", `expected resolved: ${JSON.stringify(body)}`)
assert(body.mode === "isolated_preprod_repository", `expected isolated_preprod_repository: ${JSON.stringify(body)}`)
assert(body.runtimeMutationBlocked === true, "expected runtimeMutationBlocked=true")
assert(body.workflowExecutionAllowed === false, "expected workflowExecutionAllowed=false")
assert(body.stateMutationAllowed === false, "expected stateMutationAllowed=false")
assert(body.refundSuccessState === false, "expected refundSuccessState=false")
console.log(`PASS ${label}`)
NODE
}

validate_blocked() {
  local file="$1"
  local label="$2"
  local expected_code="$3"
  node - <<'NODE' "$file" "$label" "$expected_code"
const fs = require("fs")
const body = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
const label = process.argv[3]
const expectedCode = process.argv[4]
const assert = (condition, message) => {
  if (!condition) throw new Error(`${label}: ${message}`)
}
assert(body.status === "blocked", `expected blocked: ${JSON.stringify(body)}`)
assert(body.mode === "isolated_preprod_repository", `expected isolated_preprod_repository: ${JSON.stringify(body)}`)
assert(body.code === expectedCode, `expected ${expectedCode}: ${JSON.stringify(body)}`)
assert(body.runtimeMutationBlocked === true, "expected runtimeMutationBlocked=true")
assert(body.workflowExecutionAllowed === false, "expected workflowExecutionAllowed=false")
assert(body.stateMutationAllowed === false, "expected stateMutationAllowed=false")
assert(body.refundSuccessState === false, "expected refundSuccessState=false")
const serialized = JSON.stringify(body)
assert(!serialized.includes("reviewInput"), "response leaked reviewInput")
assert(!serialized.includes("\"bundle\""), "response leaked bundle")
assert(!serialized.includes("postgres://"), "response leaked postgres URL")
assert(!serialized.includes("db unavailable"), "response leaked low-level DB error")
console.log(`PASS ${label}`)
NODE
}

route_status="$(call_route "$route_response" "query_kind=platform_refund_id&platform_refund_id=refund_platform_001")"
[ "$route_status" = "200" ] || {
  echo "First route call failed with HTTP $route_status" >&2
  cat "$route_response" >&2 || true
  exit 1
}
validate_resolved "$route_response" "refund review query surface existing-server smoke first"

second_route_status="$(call_route "$route_response_second" "query_kind=approval_persistence_idempotency_key&approval_persistence_idempotency_key=approval_persistence_001")"
[ "$second_route_status" = "200" ] || {
  echo "Second route call failed with HTTP $second_route_status" >&2
  cat "$route_response_second" >&2 || true
  exit 1
}
validate_resolved "$route_response_second" "refund review query surface existing-server smoke second"

echo "WAIT ${stability_wait_seconds}s before third authenticated route call"
sleep "$stability_wait_seconds"

third_route_status="$(call_route "$route_response_third" "query_kind=provider_refund_reference&provider_name=wechat_pay&provider_refund_reference=wx_refund_001")"
[ "$third_route_status" = "200" ] || {
  echo "Third route call failed with HTTP $third_route_status" >&2
  cat "$route_response_third" >&2 || true
  exit 1
}
validate_resolved "$route_response_third" "refund review query surface existing-server smoke third"

blocked_route_status="$(call_route "$route_response_blocked" "query_kind=platform_refund_id&platform_refund_id=refund_platform_missing")"
[ "$blocked_route_status" = "400" ] || {
  echo "Blocked route call returned unexpected HTTP $blocked_route_status" >&2
  cat "$route_response_blocked" >&2 || true
  exit 1
}
validate_blocked "$route_response_blocked" "refund review query surface existing-server smoke blocked miss" "review_case_not_found"

echo "PASS refund review query surface existing-server smoke completed against ${api_url}"
