#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "--plan" ] || [ "${1:-}" = "plan" ]; then
  requested_plan_mode="true"
  api_url="${CHINA_UNIT_PERMISSION_SMOKE_API_URL:-http://127.0.0.1:9000}"
else
  requested_plan_mode="false"
  api_url="${1:-${CHINA_UNIT_PERMISSION_SMOKE_API_URL:-http://127.0.0.1:9000}}"
fi
admin_email="${CODEX_HTTP_SMOKE_ADMIN_EMAIL:-codex-refund-review-admin@example.com}"
admin_password="${CODEX_HTTP_SMOKE_ADMIN_PASSWORD:-Codex123456!}"
vendor_actor="${CODEX_HTTP_SMOKE_VENDOR_ACTOR:-member}"
vendor_email="${CODEX_HTTP_SMOKE_VENDOR_EMAIL:-ahai-seafood@fuyi.local}"
vendor_password="${CODEX_HTTP_SMOKE_VENDOR_PASSWORD:-Codex123456!}"
vendor_seller_id="${CODEX_HTTP_SMOKE_VENDOR_SELLER_ID:-}"
vendor_seller_handle="${CODEX_HTTP_SMOKE_VENDOR_SELLER_HANDLE:-a-hai-xian-huo-dang}"
prepare_vendor_identity="${CODEX_HTTP_SMOKE_PREPARE_VENDOR_IDENTITY:-auto}"
provided_admin_token="${CODEX_HTTP_SMOKE_ADMIN_TOKEN:-}"
provided_vendor_token="${CODEX_HTTP_SMOKE_VENDOR_TOKEN:-}"
pg_host="${CODEX_HTTP_SMOKE_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_HTTP_SMOKE_PG_PORT:-15432}"
pg_user="${CODEX_HTTP_SMOKE_PG_USER:-${USER:-codex}}"
pg_database="${CODEX_HTTP_SMOKE_PG_DATABASE:-mercur}"
work_dir="${TMPDIR:-/tmp}/fuyi-unit-permission-admin-vendor-http-smoke"

admin_login_body="$work_dir/admin-login.json"
admin_login_response="$work_dir/admin-login.response.json"
vendor_login_body="$work_dir/vendor-login.json"
vendor_login_response="$work_dir/vendor-login.response.json"
reset_response="$work_dir/reset.response.json"
admin_open_response="$work_dir/admin-open.response.json"
admin_effective_before_response="$work_dir/admin-effective-before.response.json"
admin_effective_after_response="$work_dir/admin-effective-after.response.json"
effective_before_response="$work_dir/effective-before.response.json"
effective_after_response="$work_dir/effective-after.response.json"
authorize_after_response="$work_dir/authorize-after.response.json"
preview_after_response="$work_dir/preview-after.response.json"

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-unit-permission-http-smoke.log
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
PLAN China unit permission Admin -> Vendor HTTP smoke
Base URL: ${api_url}
Flow:
- Admin login through POST /auth/user/emailpass
- Vendor login through POST /auth/${vendor_actor}/emailpass
- Admin DELETE /admin/china/unit-permissions to reset local config
- Admin GET /admin/china/unit-permissions/effective?unit_key=seafoodStallA12 and confirm livestream hidden
- Vendor GET /vendor/china/unit-permissions/effective and confirm livestream hidden
- Admin POST /admin/china/unit-permissions opening seafoodStallA12/livestream
- Admin GET /admin/china/unit-permissions/effective?unit_key=seafoodStallA12 and confirm livestream visible
- Vendor GET /vendor/china/unit-permissions/effective and confirm livestream visible
- Vendor GET /vendor/china/unit-permissions/authorize?module_key=livestream and confirm allowed
- Vendor GET /vendor/china/module-surfaces/preview?module_key=livestream and confirm read-only livestream preview
- Admin DELETE /admin/china/unit-permissions on exit to reset local config
Authentication boundary:
- Admin credentials come from CODEX_HTTP_SMOKE_ADMIN_EMAIL / CODEX_HTTP_SMOKE_ADMIN_PASSWORD.
- Vendor credentials come from CODEX_HTTP_SMOKE_VENDOR_ACTOR / CODEX_HTTP_SMOKE_VENDOR_EMAIL / CODEX_HTTP_SMOKE_VENDOR_PASSWORD.
- Existing tokens can be supplied through CODEX_HTTP_SMOKE_ADMIN_TOKEN / CODEX_HTTP_SMOKE_VENDOR_TOKEN to skip login.
Side effects:
- Mutates only the local unit-permission menu-visibility draft by toggling seafoodStallA12/livestream.
- Resets the local unit-permission draft in cleanup.
- If CODEX_HTTP_SMOKE_PREPARE_VENDOR_IDENTITY is auto/true, prepares a local-only seller emailpass auth identity, member, and seller_member link in ${pg_host}:${pg_port}/${pg_database}.
- Does not publish products, create orders, print waybills, start livestreams, mutate fulfillment, settlement, commission, payout, refund, payment, or RBAC.
PLAN
  exit 0
fi

mkdir -p "$work_dir"
load_runtime

write_login_body() {
  local file="$1"
  local email="$2"
  local password="$3"

  node - "$file" "$email" "$password" <<'NODE'
const fs = require("fs")
const [file, email, password] = process.argv.slice(2)
fs.writeFileSync(file, JSON.stringify({ email, password }))
NODE
}

extract_token() {
  local file="$1"
  node - "$file" <<'NODE'
const fs = require("fs")
const file = process.argv[2]
try {
  const body = JSON.parse(fs.readFileSync(file, "utf8"))
  process.stdout.write(body.token || "")
} catch {
  process.stdout.write("")
}
NODE
}

assert_local_pg_target() {
  case "$pg_host" in
    127.0.0.1 | localhost)
      ;;
    *)
      echo "Refusing to prepare Vendor identity against non-local PG host: ${pg_host}" >&2
      exit 1
      ;;
  esac

  case "$pg_database" in
    mercur | mercur_* | fuyi_* | codex_*)
      ;;
    *)
      echo "Refusing to prepare Vendor identity against non-local/smoke database: ${pg_database}" >&2
      exit 1
      ;;
  esac
}

psql_local() {
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$pg_database" "$@"
}

resolve_vendor_seller_id() {
  if [ -n "$vendor_seller_id" ]; then
    printf "%s" "$vendor_seller_id"
    return
  fi

  local seller_id
  seller_id="$(
    psql_local -tAc \
      "select id from seller where deleted_at is null and (handle = '${vendor_seller_handle}' or email = '${vendor_email}') order by case when handle = '${vendor_seller_handle}' then 0 else 1 end limit 1"
  )"

  if [ -z "$seller_id" ]; then
    echo "No local seller found for handle=${vendor_seller_handle} or email=${vendor_email}." >&2
    exit 1
  fi

  printf "%s" "$seller_id"
}

hash_vendor_password() {
  node - "$vendor_password" <<'NODE'
let scrypt
const candidates = [
  "scrypt-kdf",
  "./node_modules/.bun/scrypt-kdf@2.0.1/node_modules/scrypt-kdf",
  "/home/codex/code/fuyi/node_modules/.bun/scrypt-kdf@2.0.1/node_modules/scrypt-kdf",
]

for (const candidate of candidates) {
  try {
    scrypt = require(candidate)
    break
  } catch {
    // Try the next local package resolution path.
  }
}

if (!scrypt) {
  throw new Error("Unable to resolve scrypt-kdf for local Vendor smoke password hashing")
}

async function main() {
  const password = process.argv[2]
  const hash = await scrypt.kdf(password, { logN: 15, r: 8, p: 1 })
  process.stdout.write(hash.toString("base64"))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
NODE
}

prepare_local_vendor_identity() {
  case "$prepare_vendor_identity" in
    auto | true | 1 | yes)
      ;;
    false | 0 | no | never)
      return
      ;;
    *)
      echo "Unknown CODEX_HTTP_SMOKE_PREPARE_VENDOR_IDENTITY=${prepare_vendor_identity}" >&2
      exit 1
      ;;
  esac

  command -v psql >/dev/null || {
    echo "psql not found; cannot prepare local Vendor smoke identity." >&2
    exit 1
  }

  assert_local_pg_target

  vendor_seller_id="$(resolve_vendor_seller_id)"
  local member_id="mem_codex_unit_permission_vendor"
  local auth_identity_id="authid_codex_unit_permission_vendor"
  local provider_identity_id="pi_codex_unit_permission_vendor"
  local seller_member_id="selmem_codex_unit_permission_vendor"
  local password_hash

  password_hash="$(hash_vendor_password)"

  psql_local \
    -v ON_ERROR_STOP=1 \
    -v member_id="$member_id" \
    -v auth_identity_id="$auth_identity_id" \
    -v provider_identity_id="$provider_identity_id" \
    -v seller_member_id="$seller_member_id" \
    -v seller_id="$vendor_seller_id" \
    -v email="$vendor_email" \
    -v password_hash="$password_hash" \
    <<'SQL' >/dev/null
begin;

insert into member (
  id,
  email,
  is_active,
  metadata,
  created_at,
  updated_at
)
values (
  :'member_id',
  :'email',
  true,
  '{"source":"codex_unit_permission_http_smoke"}'::jsonb,
  now(),
  now()
)
on conflict (id) do update
set
  email = excluded.email,
  is_active = true,
  updated_at = now(),
  deleted_at = null;

insert into auth_identity (
  id,
  app_metadata,
  created_at,
  updated_at
)
values (
  :'auth_identity_id',
  jsonb_build_object('member_id', :'member_id'),
  now(),
  now()
)
on conflict (id) do update
set
  app_metadata = jsonb_build_object('member_id', :'member_id'),
  updated_at = now(),
  deleted_at = null;

insert into provider_identity (
  id,
  entity_id,
  provider,
  auth_identity_id,
  provider_metadata,
  created_at,
  updated_at
)
values (
  :'provider_identity_id',
  :'email',
  'emailpass',
  :'auth_identity_id',
  jsonb_build_object('password', :'password_hash'),
  now(),
  now()
)
on conflict (entity_id, provider) do update
set
  auth_identity_id = excluded.auth_identity_id,
  provider_metadata = excluded.provider_metadata,
  updated_at = now(),
  deleted_at = null;

insert into seller_member (
  id,
  seller_id,
  member_id,
  is_owner,
  metadata,
  created_at,
  updated_at
)
values (
  :'seller_member_id',
  :'seller_id',
  :'member_id',
  true,
  '{"source":"codex_unit_permission_http_smoke"}'::jsonb,
  now(),
  now()
)
on conflict (id) do update
set
  seller_id = excluded.seller_id,
  member_id = excluded.member_id,
  is_owner = true,
  updated_at = now(),
  deleted_at = null;

commit;
SQL

  echo "Prepared local Vendor smoke identity for seller ${vendor_seller_id} (${vendor_email})."
}

assert_json() {
  local file="$1"
  local label="$2"
  local expression="$3"

  node - "$file" "$label" "$expression" <<'NODE'
const fs = require("fs")
const [file, label, expression] = process.argv.slice(2)
const body = JSON.parse(fs.readFileSync(file, "utf8"))
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`${label}: ${message}\n${JSON.stringify(body, null, 2)}`)
  }
}
const visible = body.unitPermissionEffective?.visibleModuleKeys ?? []
const hidden = body.unitPermissionEffective?.hiddenModuleKeys ?? []
const access = body.unitPermissionAccess
const surface = body.moduleSurface
const sellerOptions = body.sellerOptions ?? []
const expectedModule = process.env.EXPECTED_MODULE
const expectedModules = (process.env.EXPECTED_MODULES || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)

switch (expression) {
  case "effective-hidden-livestream":
    assert(hidden.includes("livestream"), "expected livestream in hiddenModuleKeys")
    assert(!visible.includes("livestream"), "expected livestream absent from visibleModuleKeys")
    break
  case "effective-visible-livestream":
    assert(visible.includes("livestream"), "expected livestream in visibleModuleKeys")
    assert(!hidden.includes("livestream"), "expected livestream absent from hiddenModuleKeys")
    break
  case "authorize-livestream-allowed":
    assert(access?.allowed === true, "expected unitPermissionAccess.allowed=true")
    assert(access?.moduleKey === "livestream", "expected moduleKey=livestream")
    assert(access?.unitKey === "seafoodStallA12", "expected unitKey=seafoodStallA12")
    break
  case "preview-livestream-readonly":
    assert(access?.allowed === true, "expected preview access allowed")
    assert(surface?.moduleKey === "livestream", "expected moduleSurface.moduleKey=livestream")
    assert(surface?.runtimeEnabled === false, "expected runtimeEnabled=false")
    assert(surface?.title === "直播工作台预览", "expected livestream preview title")
    break
  case "admin-has-seller-options":
    assert(Array.isArray(sellerOptions), "expected sellerOptions array")
    assert(
      sellerOptions.some((option) => option.sellerHandle === "a-hai-xian-huo-dang" || option.sellerId),
      "expected at least one real or seeded seller option for Admin binding selector"
    )
    break
  case "effective-visible-modules":
    assert(expectedModules.length > 0, "EXPECTED_MODULES is required")
    for (const moduleKey of expectedModules) {
      assert(visible.includes(moduleKey), `expected ${moduleKey} in visibleModuleKeys`)
      assert(!hidden.includes(moduleKey), `expected ${moduleKey} absent from hiddenModuleKeys`)
    }
    break
  case "authorize-module-allowed":
    assert(expectedModule, "EXPECTED_MODULE is required")
    assert(access?.allowed === true, "expected unitPermissionAccess.allowed=true")
    assert(access?.moduleKey === expectedModule, `expected moduleKey=${expectedModule}`)
    break
  case "preview-module-readonly":
    assert(expectedModule, "EXPECTED_MODULE is required")
    assert(access?.allowed === true, "expected preview access allowed")
    assert(surface?.moduleKey === expectedModule, `expected moduleSurface.moduleKey=${expectedModule}`)
    assert(surface?.runtimeEnabled === false, "expected runtimeEnabled=false")
    break
  default:
    throw new Error(`Unknown assertion expression: ${expression}`)
}

console.log(`PASS ${label}`)
NODE
}

http_status() {
  local output_file="$1"
  shift

  curl -sS -o "$output_file" "$@" -w "%{http_code}"
}

login() {
  local actor="$1"
  local email="$2"
  local password="$3"
  local body_file="$4"
  local response_file="$5"

  write_login_body "$body_file" "$email" "$password"

  local status
  status="$(
    http_status "$response_file" \
      -X POST "${api_url}/auth/${actor}/emailpass" \
      -H "content-type: application/json" \
      --data-binary @"$body_file"
  )"

  if [ "$status" != "200" ]; then
    echo "Login failed for actor=${actor} email=${email} with HTTP ${status}." >&2
    cat "$response_file" >&2 || true
    exit 1
  fi

  local token
  token="$(extract_token "$response_file")"

  if [ -z "$token" ]; then
    echo "Login response for actor=${actor} did not return a bearer token." >&2
    cat "$response_file" >&2 || true
    exit 1
  fi

  printf "%s" "$token"
}

admin_token=""
vendor_token=""

cleanup() {
  if [ -n "$admin_token" ]; then
    curl -sS -o /dev/null \
      -X DELETE "${api_url}/admin/china/unit-permissions" \
      -H "authorization: Bearer ${admin_token}" \
      >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if [ -n "$provided_admin_token" ]; then
  admin_token="$provided_admin_token"
else
  admin_token="$(login "user" "$admin_email" "$admin_password" "$admin_login_body" "$admin_login_response")"
fi

if [ -n "$provided_vendor_token" ]; then
  vendor_token="$provided_vendor_token"
  vendor_seller_id="$(resolve_vendor_seller_id)"
else
  prepare_local_vendor_identity
  vendor_token="$(login "$vendor_actor" "$vendor_email" "$vendor_password" "$vendor_login_body" "$vendor_login_response")"
fi

reset_status="$(
  http_status "$reset_response" \
    -X DELETE "${api_url}/admin/china/unit-permissions" \
    -H "authorization: Bearer ${admin_token}"
)"
[ "$reset_status" = "200" ] || {
  echo "Admin unit permission reset failed with HTTP ${reset_status}." >&2
  cat "$reset_response" >&2 || true
  exit 1
}
assert_json "$reset_response" "Admin seller binding selector options" "admin-has-seller-options"

admin_effective_before_status="$(
  http_status "$admin_effective_before_response" \
    -H "authorization: Bearer ${admin_token}" \
    "${api_url}/admin/china/unit-permissions/effective?unit_key=seafoodStallA12"
)"
[ "$admin_effective_before_status" = "200" ] || {
  echo "Admin effective preview before toggle failed with HTTP ${admin_effective_before_status}." >&2
  cat "$admin_effective_before_response" >&2 || true
  exit 1
}
assert_json "$admin_effective_before_response" "Admin effective preview before toggle" "effective-hidden-livestream"

run_full_unit_module_matrix() {
  local matrix=(
    "seafoodStallA12|seafoodTrade,storeDecoration,pickupCard,expressPrint,marketMaterials,livestream,seedlingWholesale,aiQuickListing,deliverySuppliers,financeReadOnly"
    "frozenMerchantB08|frozenGoods,storeDecoration,upstreamSupply,remoteWholesalers,pickupCard,expressPrint,livestream,financeReadOnly"
    "deliverySupplierTeam|deliverySuppliers,expressPrint,seafoodTrade,storeDecoration,pickupCard,marketMaterials,aiQuickListing,financeReadOnly"
    "materialSupplierNorth|marketMaterials,storeDecoration,fruitsVegetables,seedlingWholesale,pickupCard,expressPrint,livestream,financeReadOnly"
  )

  for entry in "${matrix[@]}"; do
    local unit_key="${entry%%|*}"
    local modules_csv="${entry#*|}"
    local binding_response="$work_dir/bind-${unit_key}.response.json"
    local effective_response="$work_dir/effective-${unit_key}.response.json"

    local binding_status
    binding_status="$(
      http_status "$binding_response" \
        -X POST "${api_url}/admin/china/unit-permissions" \
        -H "authorization: Bearer ${admin_token}" \
        -H "content-type: application/json" \
        --data-binary "{\"unitKey\":\"${unit_key}\",\"sellerHandle\":\"${vendor_seller_handle}\"}"
    )"
    [ "$binding_status" = "200" ] || {
      echo "Admin unit permission seller binding failed for ${unit_key} with HTTP ${binding_status}." >&2
      cat "$binding_response" >&2 || true
      exit 1
    }

    IFS=',' read -r -a module_keys <<<"$modules_csv"
    for module_key in "${module_keys[@]}"; do
      local open_response="$work_dir/open-${unit_key}-${module_key}.response.json"
      local open_status
      open_status="$(
        http_status "$open_response" \
          -X POST "${api_url}/admin/china/unit-permissions" \
          -H "authorization: Bearer ${admin_token}" \
          -H "content-type: application/json" \
          --data-binary "{\"unitKey\":\"${unit_key}\",\"moduleKey\":\"${module_key}\",\"visible\":true}"
      )"
      [ "$open_status" = "200" ] || {
        echo "Admin unit permission open ${unit_key}/${module_key} failed with HTTP ${open_status}." >&2
        cat "$open_response" >&2 || true
        exit 1
      }
    done

    local admin_effective_matrix_response="$work_dir/admin-effective-${unit_key}.response.json"
    local admin_effective_matrix_status
    admin_effective_matrix_status="$(
      http_status "$admin_effective_matrix_response" \
        -H "authorization: Bearer ${admin_token}" \
        "${api_url}/admin/china/unit-permissions/effective?unit_key=${unit_key}"
    )"
    [ "$admin_effective_matrix_status" = "200" ] || {
      echo "Admin effective full-matrix check failed for ${unit_key} with HTTP ${admin_effective_matrix_status}." >&2
      cat "$admin_effective_matrix_response" >&2 || true
      exit 1
    }
    EXPECTED_MODULES="$modules_csv" assert_json "$admin_effective_matrix_response" "Admin effective full matrix ${unit_key}" "effective-visible-modules"

    local effective_status
    effective_status="$(
      http_status "$effective_response" \
        -H "authorization: Bearer ${vendor_token}" \
        -H "x-seller-id: ${vendor_seller_id}" \
        "${api_url}/vendor/china/unit-permissions/effective"
    )"
    [ "$effective_status" = "200" ] || {
      echo "Vendor effective full-matrix check failed for ${unit_key} with HTTP ${effective_status}." >&2
      cat "$effective_response" >&2 || true
      exit 1
    }
    EXPECTED_MODULES="$modules_csv" assert_json "$effective_response" "Vendor effective full matrix ${unit_key}" "effective-visible-modules"

    for module_key in "${module_keys[@]}"; do
      local authorize_response="$work_dir/authorize-${unit_key}-${module_key}.response.json"
      local preview_response="$work_dir/preview-${unit_key}-${module_key}.response.json"
      local authorize_status
      local preview_status

      authorize_status="$(
        http_status "$authorize_response" \
          -H "authorization: Bearer ${vendor_token}" \
          -H "x-seller-id: ${vendor_seller_id}" \
          "${api_url}/vendor/china/unit-permissions/authorize?module_key=${module_key}"
      )"
      [ "$authorize_status" = "200" ] || {
        echo "Vendor authorize full-matrix check failed for ${unit_key}/${module_key} with HTTP ${authorize_status}." >&2
        cat "$authorize_response" >&2 || true
        exit 1
      }
      EXPECTED_MODULE="$module_key" assert_json "$authorize_response" "Vendor authorize ${unit_key}/${module_key}" "authorize-module-allowed"

      preview_status="$(
        http_status "$preview_response" \
          -H "authorization: Bearer ${vendor_token}" \
          -H "x-seller-id: ${vendor_seller_id}" \
          "${api_url}/vendor/china/module-surfaces/preview?module_key=${module_key}"
      )"
      [ "$preview_status" = "200" ] || {
        echo "Vendor preview full-matrix check failed for ${unit_key}/${module_key} with HTTP ${preview_status}." >&2
        cat "$preview_response" >&2 || true
        exit 1
      }
      EXPECTED_MODULE="$module_key" assert_json "$preview_response" "Vendor preview ${unit_key}/${module_key}" "preview-module-readonly"
    done
  done
}

effective_before_status="$(
  http_status "$effective_before_response" \
    -H "authorization: Bearer ${vendor_token}" \
    -H "x-seller-id: ${vendor_seller_id}" \
    "${api_url}/vendor/china/unit-permissions/effective"
)"
[ "$effective_before_status" = "200" ] || {
  echo "Vendor effective before toggle failed with HTTP ${effective_before_status}." >&2
  cat "$effective_before_response" >&2 || true
  exit 1
}
assert_json "$effective_before_response" "Vendor effective before Admin toggle" "effective-hidden-livestream"

admin_open_status="$(
  http_status "$admin_open_response" \
    -X POST "${api_url}/admin/china/unit-permissions" \
    -H "authorization: Bearer ${admin_token}" \
    -H "content-type: application/json" \
    --data-binary '{"unitKey":"seafoodStallA12","moduleKey":"livestream","visible":true}'
)"
[ "$admin_open_status" = "200" ] || {
  echo "Admin unit permission open livestream failed with HTTP ${admin_open_status}." >&2
  cat "$admin_open_response" >&2 || true
  exit 1
}

admin_effective_after_status="$(
  http_status "$admin_effective_after_response" \
    -H "authorization: Bearer ${admin_token}" \
    "${api_url}/admin/china/unit-permissions/effective?unit_key=seafoodStallA12"
)"
[ "$admin_effective_after_status" = "200" ] || {
  echo "Admin effective preview after toggle failed with HTTP ${admin_effective_after_status}." >&2
  cat "$admin_effective_after_response" >&2 || true
  exit 1
}
assert_json "$admin_effective_after_response" "Admin effective preview after toggle" "effective-visible-livestream"

effective_after_status="$(
  http_status "$effective_after_response" \
    -H "authorization: Bearer ${vendor_token}" \
    -H "x-seller-id: ${vendor_seller_id}" \
    "${api_url}/vendor/china/unit-permissions/effective"
)"
[ "$effective_after_status" = "200" ] || {
  echo "Vendor effective after toggle failed with HTTP ${effective_after_status}." >&2
  cat "$effective_after_response" >&2 || true
  exit 1
}
assert_json "$effective_after_response" "Vendor effective after Admin toggle" "effective-visible-livestream"

authorize_after_status="$(
  http_status "$authorize_after_response" \
    -H "authorization: Bearer ${vendor_token}" \
    -H "x-seller-id: ${vendor_seller_id}" \
    "${api_url}/vendor/china/unit-permissions/authorize?module_key=livestream"
)"
[ "$authorize_after_status" = "200" ] || {
  echo "Vendor authorize after toggle failed with HTTP ${authorize_after_status}." >&2
  cat "$authorize_after_response" >&2 || true
  exit 1
}
assert_json "$authorize_after_response" "Vendor authorize after Admin toggle" "authorize-livestream-allowed"

preview_after_status="$(
  http_status "$preview_after_response" \
    -H "authorization: Bearer ${vendor_token}" \
    -H "x-seller-id: ${vendor_seller_id}" \
    "${api_url}/vendor/china/module-surfaces/preview?module_key=livestream"
)"
[ "$preview_after_status" = "200" ] || {
  echo "Vendor module surface preview after toggle failed with HTTP ${preview_after_status}." >&2
  cat "$preview_after_response" >&2 || true
  exit 1
}
assert_json "$preview_after_response" "Vendor preview after Admin toggle" "preview-livestream-readonly"

run_full_unit_module_matrix

echo "PASS China unit permission Admin -> Vendor HTTP smoke completed against ${api_url}"
