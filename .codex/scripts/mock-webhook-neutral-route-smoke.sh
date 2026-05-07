#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root"

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/tmp/fuyi-nvm-use-mock-webhook-neutral-smoke.log
fi

mode="${1:-auto}"
base_url="${MOCK_WEBHOOK_BASE_URL:-http://localhost:9000}"
route_url="${base_url%/}/china/payment-webhooks/mock"
secret="${CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET:-local_neutral_smoke_secret_not_real}"
tmpdir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

body_file="$tmpdir/response.json"
payload_file="$tmpdir/payload.json"
malformed_file="$tmpdir/malformed.txt"

fail() {
  echo "FAIL $*" >&2
  exit 1
}

assert_mode() {
  case "$mode" in
    auto | disabled | local-inmemory | production-disabled) ;;
    *)
      fail "Usage: $0 [auto|disabled|local-inmemory|production-disabled]"
      ;;
  esac
}

http_post() {
  local output_file="$1"
  shift

  curl -sS -o "$output_file" -w "%{http_code}" -X POST "$route_url" "$@"
}

json_field() {
  local file="$1"
  local field="$2"

  node - "$file" "$field" <<'NODE'
const fs = require("fs")
const file = process.argv[2]
const field = process.argv[3]
const body = JSON.parse(fs.readFileSync(file, "utf8"))
const value = field.split(".").reduce((acc, key) => acc == null ? undefined : acc[key], body)
if (value === undefined) {
  process.exit(2)
}
process.stdout.write(String(value))
NODE
}

assert_json_field() {
  local file="$1"
  local field="$2"
  local expected="$3"
  local actual

  actual="$(json_field "$file" "$field")" || fail "Missing JSON field: $field in $(cat "$file")"
  [ "$actual" = "$expected" ] || fail "Expected $field=$expected but got $actual in $(cat "$file")"
}

assert_response_absent() {
  local file="$1"
  local needle="$2"
  local label="$3"

  if [ -n "$needle" ] && grep -F "$needle" "$file" >/dev/null; then
    fail "Response leaked $label"
  fi
}

build_signature() {
  local file="$1"

  MOCK_SECRET="$secret" node - "$file" <<'NODE'
const crypto = require("crypto")
const fs = require("fs")
const rawBody = fs.readFileSync(process.argv[2], "utf8")
const secret = process.env.MOCK_SECRET
const digest = crypto.createHash("sha256").update(`${rawBody}.${secret}`).digest("hex")
process.stdout.write(`sha256=${digest}`)
NODE
}

check_no_payment_db_residuals() {
  local residuals

  residuals="$(
    psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
      "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
  )"

  [ -z "$residuals" ] || fail "Payment notification disposable DB residuals found: $residuals"
}

run_disabled_case() {
  local status

  status="$(http_post "$body_file")"

  [ "$status" = "503" ] || fail "Expected disabled HTTP 503, got $status with $(cat "$body_file")"
  assert_json_field "$body_file" "status" "disabled"
  assert_json_field "$body_file" "code" "RUNTIME_DISABLED"
  assert_json_field "$body_file" "route" "mock_payment_webhook_neutral_disabled_only"
  assert_response_absent "$body_file" "$secret" "mock secret"
  assert_response_absent "$body_file" "sha256=" "signature"
  assert_response_absent "$body_file" "workflowResult" "workflow result"

  echo "PASS disabled case"
}

write_valid_payload() {
  printf '%s' '{"event_id":"evt_neutral_smoke_001","event_type":"payment.succeeded","merchant_order_ref":"pay_neutral_smoke_001","payment_session_id":"payses_neutral_smoke_001","provider_transaction_id":"mock_txn_neutral_smoke_001","amount":128560,"currency":"CNY"}' >"$payload_file"
}

run_local_inmemory_cases() {
  local signature
  local status

  write_valid_payload
  signature="$(build_signature "$payload_file")"

  status="$(http_post "$body_file" \
    -H "content-type: application/json" \
    -H "x-mock-payment-signature: $signature" \
    -H "x-mock-payment-event-id: evt_neutral_smoke_001" \
    --data-binary "@$payload_file")"

  [ "$status" = "202" ] || fail "Expected accepted HTTP 202, got $status with $(cat "$body_file")"
  assert_json_field "$body_file" "status" "accepted"
  assert_json_field "$body_file" "mode" "mock_inbox_only"
  assert_json_field "$body_file" "route" "mock_payment_webhook_neutral_local_inmemory"
  assert_response_absent "$body_file" "$(cat "$payload_file")" "raw payload"
  assert_response_absent "$body_file" "$secret" "mock secret"
  assert_response_absent "$body_file" "$signature" "signature"
  assert_response_absent "$body_file" "workflowResult" "workflow result"
  echo "PASS local in-memory accepted case"

  status="$(http_post "$body_file" \
    -H "content-type: application/json" \
    --data-binary "@$payload_file")"

  [ "$status" = "400" ] || fail "Expected missing signature HTTP 400, got $status with $(cat "$body_file")"
  assert_json_field "$body_file" "status" "rejected"
  assert_json_field "$body_file" "code" "SIGNATURE_MISSING"
  assert_json_field "$body_file" "route" "mock_payment_webhook_neutral_local_inmemory"
  assert_response_absent "$body_file" "$secret" "mock secret"
  assert_response_absent "$body_file" "$(cat "$payload_file")" "raw payload"
  echo "PASS missing signature case"

  printf '{"event_id":' >"$malformed_file"
  signature="$(build_signature "$malformed_file")"
  status="$(http_post "$body_file" \
    -H "content-type: text/plain" \
    -H "x-mock-payment-signature: $signature" \
    --data-binary "@$malformed_file")"

  [ "$status" = "400" ] || fail "Expected malformed payload HTTP 400, got $status with $(cat "$body_file")"
  assert_json_field "$body_file" "status" "rejected"
  assert_json_field "$body_file" "code" "PAYLOAD_INVALID"
  assert_json_field "$body_file" "route" "mock_payment_webhook_neutral_local_inmemory"
  assert_response_absent "$body_file" "$secret" "mock secret"
  assert_response_absent "$body_file" "$(cat "$malformed_file")" "raw malformed payload"
  echo "PASS malformed payload case"
}

run_auto() {
  local status

  status="$(http_post "$body_file")"

  if [ "$status" = "503" ]; then
    assert_json_field "$body_file" "status" "disabled"
    assert_json_field "$body_file" "route" "mock_payment_webhook_neutral_disabled_only"
    echo "PASS auto detected disabled route"
    return
  fi

  if [ "$status" = "400" ]; then
    echo "INFO auto detected local in-memory route; running local-inmemory cases"
    run_local_inmemory_cases
    return
  fi

  fail "Unexpected auto probe HTTP $status with $(cat "$body_file")"
}

assert_mode

case "$mode" in
  auto)
    run_auto
    ;;
  disabled)
    run_disabled_case
    ;;
  local-inmemory)
    run_local_inmemory_cases
    ;;
  production-disabled)
    run_disabled_case
    ;;
esac

check_no_payment_db_residuals

echo "PASS neutral mock webhook route smoke completed in mode: $mode"
