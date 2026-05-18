#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "--plan" ] || [ "${1:-}" = "plan" ]; then
  requested_plan_mode="true"
  api_url="${CHINA_PLATFORM_MODULE_SWITCH_SMOKE_API_URL:-http://127.0.0.1:9000}"
else
  requested_plan_mode="false"
  api_url="${1:-${CHINA_PLATFORM_MODULE_SWITCH_SMOKE_API_URL:-http://127.0.0.1:9000}}"
fi

admin_email="${CODEX_HTTP_SMOKE_ADMIN_EMAIL:-codex-refund-review-admin@example.com}"
admin_password="${CODEX_HTTP_SMOKE_ADMIN_PASSWORD:-Codex123456!}"
provided_admin_token="${CODEX_HTTP_SMOKE_ADMIN_TOKEN:-}"
work_dir="${TMPDIR:-/tmp}/fuyi-platform-module-switch-admin-http-smoke"

admin_login_body="$work_dir/admin-login.json"
admin_login_response="$work_dir/admin-login.response.json"
before_response="$work_dir/before.response.json"
toggle_response="$work_dir/toggle.response.json"
after_response="$work_dir/after.response.json"
reset_response="$work_dir/reset.response.json"
reset_after_response="$work_dir/reset-after.response.json"

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-platform-module-switch-http-smoke.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v node >/dev/null || {
    echo "node not found after loading runtime." >&2
    exit 1
  }
}

if [ "$requested_plan_mode" = "true" ]; then
  cat <<PLAN
PLAN China platform module switch Admin HTTP smoke
Base URL: ${api_url}
Flow:
- Admin login through POST /auth/user/emailpass
- Admin GET /admin/china/module-switches and confirm livestream is off by default
- Admin POST /admin/china/module-switches opening livestream platform draft switch
- Admin GET /admin/china/module-switches and confirm livestream is on
- Admin DELETE /admin/china/module-switches and confirm defaults are restored
Authentication boundary:
- Admin credentials come from CODEX_HTTP_SMOKE_ADMIN_EMAIL / CODEX_HTTP_SMOKE_ADMIN_PASSWORD.
- Existing token can be supplied through CODEX_HTTP_SMOKE_ADMIN_TOKEN to skip login.
Side effects:
- Mutates only the local platform module switch planning draft.
- Resets the platform module switch draft in cleanup.
- Does not grant RBAC, execute workflows, publish products, create orders, print waybills, start livestreams, mutate fulfillment, settlement, commission, payout, refund, payment, or logistics.
PLAN
  exit 0
fi

mkdir -p "$work_dir"
load_runtime

write_login_body() {
  node - "$admin_login_body" "$admin_email" "$admin_password" <<'NODE'
const fs = require("fs")
const [file, email, password] = process.argv.slice(2)
fs.writeFileSync(file, JSON.stringify({ email, password }))
NODE
}

extract_token() {
  node - "$1" <<'NODE'
const fs = require("fs")
try {
  const body = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
  process.stdout.write(body.token || "")
} catch {
  process.stdout.write("")
}
NODE
}

http_status() {
  local output_file="$1"
  shift

  curl -sS -o "$output_file" "$@" -w "%{http_code}"
}

login_admin() {
  write_login_body

  local status
  status="$(
    http_status "$admin_login_response" \
      -X POST "${api_url}/auth/user/emailpass" \
      -H "content-type: application/json" \
      --data-binary @"$admin_login_body"
  )"

  if [ "$status" != "200" ]; then
    echo "Admin login failed with HTTP ${status}." >&2
    cat "$admin_login_response" >&2 || true
    exit 1
  fi

  local token
  token="$(extract_token "$admin_login_response")"

  if [ -z "$token" ]; then
    echo "Admin login response did not return a bearer token." >&2
    cat "$admin_login_response" >&2 || true
    exit 1
  fi

  printf "%s" "$token"
}

assert_livestream_switch() {
  local file="$1"
  local expected="$2"

  node - "$file" "$expected" <<'NODE'
const fs = require("fs")
const [file, expectedText] = process.argv.slice(2)
const expected = expectedText === "true"
const body = JSON.parse(fs.readFileSync(file, "utf8"))
const items = body.platformModuleSwitches?.items ?? []
const livestream = items.find((item) => item.moduleKey === "livestream")

if (!livestream) {
  throw new Error("livestream platform module switch is missing")
}

if (livestream.switchOn !== expected) {
  throw new Error(`livestream switch expected ${expected} but got ${livestream.switchOn}`)
}

if (!String(body.platformModuleSwitches?.note ?? "").includes("does not grant RBAC")) {
  throw new Error("platform module switch response did not preserve safety note")
}
NODE
}

admin_token="${provided_admin_token:-}"

cleanup() {
  if [ -n "$admin_token" ]; then
    curl -sS -o /dev/null \
      -X DELETE "${api_url}/admin/china/module-switches" \
      -H "authorization: Bearer ${admin_token}" \
      >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if [ -z "$admin_token" ]; then
  admin_token="$(login_admin)"
fi

before_status="$(
  http_status "$before_response" \
    "${api_url}/admin/china/module-switches" \
    -H "authorization: Bearer ${admin_token}"
)"
[ "$before_status" = "200" ] || {
  echo "Admin platform module switch GET failed with HTTP ${before_status}." >&2
  cat "$before_response" >&2 || true
  exit 1
}
assert_livestream_switch "$before_response" "false"
echo "PASS platform module switch livestream default is off"

toggle_body='{"moduleKey":"livestream","switchOn":true}'
toggle_status="$(
  http_status "$toggle_response" \
    -X POST "${api_url}/admin/china/module-switches" \
    -H "authorization: Bearer ${admin_token}" \
    -H "content-type: application/json" \
    --data-binary "$toggle_body"
)"
[ "$toggle_status" = "200" ] || {
  echo "Admin platform module switch POST failed with HTTP ${toggle_status}." >&2
  cat "$toggle_response" >&2 || true
  exit 1
}
assert_livestream_switch "$toggle_response" "true"
echo "PASS platform module switch livestream opened in Admin draft"

after_status="$(
  http_status "$after_response" \
    "${api_url}/admin/china/module-switches" \
    -H "authorization: Bearer ${admin_token}"
)"
[ "$after_status" = "200" ] || {
  echo "Admin platform module switch second GET failed with HTTP ${after_status}." >&2
  cat "$after_response" >&2 || true
  exit 1
}
assert_livestream_switch "$after_response" "true"
echo "PASS platform module switch persisted for subsequent Admin read"

reset_status="$(
  http_status "$reset_response" \
    -X DELETE "${api_url}/admin/china/module-switches" \
    -H "authorization: Bearer ${admin_token}"
)"
[ "$reset_status" = "200" ] || {
  echo "Admin platform module switch reset failed with HTTP ${reset_status}." >&2
  cat "$reset_response" >&2 || true
  exit 1
}
assert_livestream_switch "$reset_response" "false"

reset_after_status="$(
  http_status "$reset_after_response" \
    "${api_url}/admin/china/module-switches" \
    -H "authorization: Bearer ${admin_token}"
)"
[ "$reset_after_status" = "200" ] || {
  echo "Admin platform module switch final GET failed with HTTP ${reset_after_status}." >&2
  cat "$reset_after_response" >&2 || true
  exit 1
}
assert_livestream_switch "$reset_after_response" "false"
echo "PASS platform module switch reset restored livestream default"
echo "PASS China platform module switch Admin HTTP smoke completed against ${api_url}"
