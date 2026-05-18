#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mode="quick"
output_format="text"
output_path=""
failures=0
warnings=0
passes=0
pass_items=()
warn_items=()
nogo_items=()
preprod_env_status_json="null"
preprod_env_discovery_json="null"

while [ "$#" -gt 0 ]; do
  case "$1" in
    quick|full|frontend|admin-visual-qa|refund-smoke|refund-smoke-local-db|unit-permission-smoke|platform-module-switch-smoke|runtime-mock-suite|preprod-env-discovery|preprod-env-status|preprod-db-rehearsal|preprod-db-local-script-test|report)
      mode="$1"
      ;;
    json)
      output_format="json"
      ;;
    --json)
      output_format="json"
      ;;
    --output)
      shift
      if [ -z "${1:-}" ]; then
        echo "--output requires a file path." >&2
        exit 2
      fi
      output_path="$1"
      ;;
    -h|--help|help)
      mode="help"
      ;;
    *)
      echo "Unknown argument: $1" >&2
      mode="invalid"
      ;;
  esac
  shift
done

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-launch-readiness.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
}

pass() {
  passes=$((passes + 1))
  pass_items+=("$1")
  if [ "$output_format" != "json" ]; then
    printf 'PASS %s\n' "$1"
  fi
}

warn() {
  warnings=$((warnings + 1))
  warn_items+=("$1")
  if [ "$output_format" != "json" ]; then
    printf 'WARN %s\n' "$1"
  fi
}

nogo() {
  failures=$((failures + 1))
  nogo_items+=("$1")
  if [ "$output_format" != "json" ]; then
    printf 'NO-GO %s\n' "$1"
  fi
}

run_check() {
  local label="$1"
  shift

  if "$@"; then
    pass "$label"
  else
    nogo "$label"
  fi
}

require_file() {
  local path="$1"
  [ -f "$root/$path" ]
}

check_no_real_secret_patterns() {
  local hit_file
  hit_file="$(mktemp)"

  (
    cd "$root"
    find apps packages .codex \
      -path '*/node_modules' -prune -o \
      -path '*/.next' -prune -o \
      -path '*/dist' -prune -o \
      -path '*/__tests__' -prune -o \
      -path '*/fixtures' -prune -o \
      -path '.codex/scripts/china-launch-readiness-check.sh' -prune -o \
      -type f -print0 |
      xargs -0 grep -IEn \
        'sk_live_|pk_live_|-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----|app_secret[[:space:]]*[:=][[:space:]]*["'\''][^"'\'']+|merchant_id[[:space:]]*[:=][[:space:]]*["'\''][^"'\'']+' \
        >"$hit_file" || true
  )

  if [ -s "$hit_file" ]; then
    cat "$hit_file" >&2
    rm -f "$hit_file"
    return 1
  fi

  rm -f "$hit_file"
  return 0
}

check_no_high_risk_mutation_enablements() {
  local hit_file
  hit_file="$(mktemp)"

  (
    cd "$root"
    find packages/api/src apps/admin/src apps/vendor/src apps/storefront/src \
      -path '*/__tests__/*' -prune -o \
      -name '*.spec.ts' -prune -o \
      -name '*.unit.spec.ts' -prune -o \
      -name '*.stories.tsx' -prune -o \
      -type f -print0 |
      xargs -0 grep -IEn \
        'workflowExecutionAllowed:[[:space:]]*true|stateMutationAllowed:[[:space:]]*true|refundSuccessState:[[:space:]]*true|executeWorkflow:[[:space:]]*true' \
        >"$hit_file" || true
  )

  if [ -s "$hit_file" ]; then
    cat "$hit_file" >&2
    rm -f "$hit_file"
    return 1
  fi

  rm -f "$hit_file"
  return 0
}

check_no_storefront_placeholder_links() {
  local hit_file
  hit_file="$(mktemp)"

  (
    cd "$root"
    find apps/storefront/src \
      -name '*.stories.tsx' -prune -o \
      -type f -print0 |
      xargs -0 grep -IEn \
        "support@example.com|path:[[:space:]]*['\"]#|href=[{]?[[:space:]]*['\"]#|ICP备案号占位|京ICP备00000000|示例公司|发布找货需求" \
        >"$hit_file" || true
  )

  if [ -s "$hit_file" ]; then
    cat "$hit_file" >&2
    rm -f "$hit_file"
    return 1
  fi

  rm -f "$hit_file"
  return 0
}

check_admin_placeholder_actions_disabled() {
  (
    cd "$root"
    awk '
      /<Button/ {
        button = $0
        button_file = FILENAME
        button_line = FNR
      }
      /chinaAdmin\.actions\.export|chinaAdmin\.actions\.batchPlaceholder|chinaAdmin\.actions\.createPlaceholder|chinaAdmin\.operations\.actions\.mockConfigure/ {
        if (button !~ /disabled/) {
          printf "%s:%s placeholder action is not disabled near %s\n", button_file, button_line, $0 > "/dev/stderr"
          found = 1
        }
      }
      END {
        exit found ? 1 : 0
      }
    ' apps/admin/src/components/*.tsx
  )
}

check_refund_query_surface_focused_tests() {
  local log_file
  log_file="$(mktemp)"

  (
    cd "$root/packages/api"
    bun test \
      src/modules/china-payment-notification/__tests__/refund-review-query-surface-repository-registration.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/refund-state-mutation-review-query-surface-composition.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/refund-state-mutation-review-query-surface-repository-resolver.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/refund-state-mutation-review-query-surface-repository-readers-scope.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/refund-state-mutation-review-query-surface-pg-readers.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/service.unit.spec.ts \
      src/api/admin/china/refund-review-query-surface/__tests__/route.unit.spec.ts
  ) >"$log_file" 2>&1

  local result=$?
  if [ "$result" -ne 0 ]; then
    cat "$log_file" >&2
  fi
  rm -f "$log_file"
  return "$result"
}

check_refund_provider_inbox_fail_closed_tests() {
  local log_file
  log_file="$(mktemp)"

  (
    cd "$root/packages/api"
    bun test \
      src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts \
      src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
      src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
  ) >"$log_file" 2>&1

  local result=$?
  if [ "$result" -ne 0 ]; then
    cat "$log_file" >&2
  fi
  rm -f "$log_file"
  return "$result"
}

check_refund_state_mutation_fail_closed_tests() {
  local log_file
  log_file="$(mktemp)"

  (
    cd "$root/packages/api"
    bun test \
      src/modules/china-payment-notification/__tests__/refund-state-mutation-production-feature-flag.unit.spec.ts
  ) >"$log_file" 2>&1

  local result=$?
  if [ "$result" -ne 0 ]; then
    cat "$log_file" >&2
  fi
  rm -f "$log_file"
  return "$result"
}

check_unit_permission_guard_tests() {
  local log_file
  log_file="$(mktemp)"

  (
    cd "$root/packages/api"
    bun test \
      src/lib/__tests__/china-unit-permission-access-guard.unit.spec.ts \
      src/lib/__tests__/china-unit-permission-pg-repository.unit.spec.ts \
      src/api/admin/china/unit-permissions/__tests__/admin-vendor-propagation.unit.spec.ts \
      src/api/vendor/china/unit-permissions/authorize/__tests__/route.unit.spec.ts \
      src/api/vendor/china/module-surfaces/preview/__tests__/route.unit.spec.ts \
      src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
  ) >"$log_file" 2>&1

  local result=$?
  if [ "$result" -ne 0 ]; then
    cat "$log_file" >&2
  fi
  rm -f "$log_file"
  return "$result"
}

check_platform_module_switch_tests() {
  local log_file
  log_file="$(mktemp)"

  (
    cd "$root/packages/api"
    bun test \
      src/lib/__tests__/china-platform-module-switch-pg-repository.unit.spec.ts \
      src/api/admin/china/module-switches/__tests__/route.unit.spec.ts
  ) >"$log_file" 2>&1

  local result=$?
  if [ "$result" -ne 0 ]; then
    cat "$log_file" >&2
  fi
  rm -f "$log_file"
  return "$result"
}

check_runtime_mock_suite_tests() {
  local log_file
  log_file="$(mktemp)"

  (
    cd "$root/packages/api"
    bun test \
      src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts \
      src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts \
      src/api/admin/china/mock-payment-webhooks/__tests__/route.unit.spec.ts \
      src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/mock-china-payment-provider.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/mock-payment-webhook-composition.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/payment-runtime-gate.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/payment-runtime-preflight.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/payment-workflow-command-adapter-disabled-runtime.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/refund-state-mutation-preprod-dry-run.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/refund-state-mutation-runtime-adapter.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/refund-state-mutation-shadow-command.unit.spec.ts \
      src/modules/china-payment-notification/__tests__/refund-workflow-shadow-command.unit.spec.ts \
      src/modules/china-logistics-read-model/__tests__/logistics-waybill-readonly-contract.unit.spec.ts \
      src/modules/china-live-commerce-read-model/__tests__/live-commerce-readonly-contract.unit.spec.ts \
      src/modules/china-pickup-card-read-model/__tests__/pickup-card-consumer-flow-contract.unit.spec.ts \
      src/modules/china-shop-decoration-read-model/__tests__/shop-decoration-readonly-contract.unit.spec.ts \
      src/modules/china-product-drafts/__tests__/mobile-draft-product-contract.unit.spec.ts \
      src/modules/china-product-drafts/__tests__/vendor-product-draft-service.unit.spec.ts \
      src/modules/china-service-providers/__tests__/mock-service-providers.unit.spec.ts
  ) >"$log_file" 2>&1

  local result=$?
  if [ "$result" -ne 0 ]; then
    cat "$log_file" >&2
  fi
  rm -f "$log_file"
  return "$result"
}

check_admin_visual_qa_gate() {
  [ "${ADMIN_LOGIN_VISUAL_QA_CONFIRMED:-false}" = "true" ]
}

check_admin_logged_in_visual_qa_script() {
  (
    cd "$root"
    ./.codex/scripts/china-admin-logged-in-visual-qa.sh
  )
}

check_preprod_db_gate() {
  [ "${PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED:-false}" = "true" ]
}

check_preprod_db_rehearsal_script() {
  (
    cd "$root"
    ./.codex/scripts/china-preprod-disposable-db-rehearsal.sh run
  )
}

check_preprod_env_ready_to_validate() {
  local log_file
  log_file="$(mktemp)"

  if (
    cd "$root"
    ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh
  ) >"$log_file" 2>&1; then
    if grep -q '^verdict=READY_TO_VALIDATE$' "$log_file"; then
      rm -f "$log_file"
      return 0
    fi
  fi

  cat "$log_file" >&2
  rm -f "$log_file"
  return 1
}

capture_preprod_env_status_json() {
  local status_file
  status_file="$(mktemp)"

  if (
    cd "$root"
    ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh --json --output "$status_file"
  ) >/dev/null 2>&1 && [ -s "$status_file" ]; then
    preprod_env_status_json="$(cat "$status_file")"
  else
    preprod_env_status_json="null"
  fi

  rm -f "$status_file"
}

capture_preprod_env_discovery_json() {
  local discovery_file
  discovery_file="$(mktemp)"

  if (
    cd "$root"
    ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-discover.sh --json --output "$discovery_file"
  ) >/dev/null 2>&1 && [ -s "$discovery_file" ]; then
    preprod_env_discovery_json="$(cat "$discovery_file")"
  else
    preprod_env_discovery_json="null"
  fi

  rm -f "$discovery_file"
}

check_preprod_env_discovery_script() {
  (
    cd "$root"
    ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-discover.sh >/dev/null
  )
}

check_preprod_db_local_script_test() {
  (
    cd "$root"
    ./.codex/scripts/china-preprod-disposable-db-rehearsal-local-script-test.sh
  )
}

check_high_risk_runtime_gate() {
  [ "${PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED:-false}" = "true" ]
}

check_full_builds() {
  (
    cd "$root"
    bun --cwd apps/admin lint
    bun --cwd apps/admin build
    bun --cwd apps/vendor lint
    bun --cwd apps/vendor build
    bun --cwd apps/storefront build
  )
}

usage() {
  cat <<'USAGE'
Usage: ./.codex/scripts/china-launch-readiness-check.sh [quick|full|frontend|admin-visual-qa|refund-smoke|refund-smoke-local-db|unit-permission-smoke|platform-module-switch-smoke|runtime-mock-suite|preprod-env-discovery|preprod-env-status|preprod-db-rehearsal|preprod-db-local-script-test|report] [--json] [--output <file>]

Modes:
  quick        Runs local static gates and focused refund query surface tests.
  full         Runs quick plus Admin/Vendor/Storefront build checks.
  frontend     Runs quick plus Admin/Vendor/Storefront build checks for UI readiness.
  admin-visual-qa
               Runs quick plus logged-in Admin visual QA screenshots/assertions.
  refund-smoke Runs quick plus the main API refund review query surface HTTP smoke.
  refund-smoke-local-db
               Runs quick plus a dedicated disposable local DB, seed, authenticated
               Admin HTTP query surface smoke, blocked miss check, and cleanup check.
  unit-permission-smoke
               Runs quick plus the Admin -> Vendor unit-permission HTTP smoke.
  platform-module-switch-smoke
               Runs quick plus the Admin platform module switch HTTP smoke.
  runtime-mock-suite
               Runs quick plus mock/dry-run/shadow runtime tests, refund HTTP smoke,
               Admin -> Vendor unit-permission HTTP smoke, and localhost disposable DB script-test.
  preprod-env-discovery
               Runs quick plus a redacted discovery of preprod DB env sources.
  preprod-env-status
               Runs quick plus a redacted private preprod env readiness check.
  preprod-db-rehearsal
               Runs quick plus the guarded disposable preprod DB migration rehearsal.
  preprod-db-local-script-test
               Runs quick plus the localhost disposable DB script self-test.
  report       Runs quick gates and prints a grouped launch-readiness report.

Output:
  --json       Print a machine-readable JSON summary for any mode.
  json         Backward-compatible alias for quick --json.
  --output     Also write the JSON summary to a file. Requires --json/json.

Optional gate env:
  ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true
  PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true
  CODEX_PREPROD_DISPOSABLE_DATABASE_URL
  CODEX_PREPROD_DISPOSABLE_DB_CONFIRM=I_CONFIRM_THIS_IS_DISPOSABLE_PREPROD_DB
  CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM=BACKUP_DONE_OR_NOT_NEEDED
  CODEX_PREPROD_DISPOSABLE_DB_OPERATOR=<operator name or ticket>
  CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER=<owner name or ticket>
  PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true

Gate policy:
  Automated local checks can prove local evidence only. Human logged-in QA,
  preprod disposable DB rehearsal, and high-risk payment/refund/settlement
  runtime approval remain explicit NO-GO gates unless the matching env is set
  by the responsible operator after the external gate actually happened.
USAGE
}

case "$mode" in
  quick|full|frontend|admin-visual-qa|refund-smoke|refund-smoke-local-db|unit-permission-smoke|platform-module-switch-smoke|runtime-mock-suite|preprod-env-discovery|preprod-env-status|preprod-db-rehearsal|preprod-db-local-script-test|report)
    ;;
  help)
    usage
    exit 0
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

load_runtime

run_check "git diff has no whitespace errors" \
  bash -lc "cd '$root' && git diff --check"
run_check "release gates document exists" \
  require_file "docs/china-localization-release-gates.md"
run_check "high risk launch sequence plan exists" \
  require_file "docs/china-launch-high-risk-sequence-plan.md"
run_check "Storefront China page coverage document exists" \
  require_file "docs/storefront-china-page-coverage.md"
run_check "refund review query surface handoff exists" \
  require_file "project-ledger/handoff-2026-05-15-refund-review-query-surface-context-reset.md"
run_check "no obvious production secret pattern in reviewed project files" \
  check_no_real_secret_patterns
run_check "no explicit high-risk mutation enablement in reviewed source files" \
  check_no_high_risk_mutation_enablements
run_check "Storefront source has no production placeholder links or fake filing copy" \
  check_no_storefront_placeholder_links
run_check "Admin placeholder action buttons are disabled" \
  check_admin_placeholder_actions_disabled
run_check "refund provider inbox route fail-closed tests pass" \
  check_refund_provider_inbox_fail_closed_tests
run_check "refund state mutation production feature flag fail-closed tests pass" \
  check_refund_state_mutation_fail_closed_tests
run_check "refund review query surface focused tests pass" \
  check_refund_query_surface_focused_tests
run_check "unit permission guard and Vendor route tests pass" \
  check_unit_permission_guard_tests
run_check "platform module switch Admin route and PG tests pass" \
  check_platform_module_switch_tests

if [ "$mode" = "admin-visual-qa" ]; then
  run_check "Admin logged-in visual QA script passes" \
    check_admin_logged_in_visual_qa_script
elif check_admin_visual_qa_gate; then
  pass "Admin logged-in visual QA gate confirmed by env"
else
  nogo "Admin logged-in visual QA is not confirmed; set ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true only after human logged-in QA"
fi

if [ "$mode" = "preprod-env-discovery" ]; then
  capture_preprod_env_discovery_json
  run_check "preprod rehearsal env discovery completed" \
    check_preprod_env_discovery_script
  if check_preprod_db_gate; then
    pass "preprod disposable DB rehearsal gate confirmed by env"
  else
    nogo "preprod disposable DB endpoint is not discovered automatically; fill the private DB URL explicitly"
  fi
elif [ "$mode" = "preprod-env-status" ]; then
  capture_preprod_env_status_json
  if check_preprod_env_ready_to_validate; then
    pass "preprod rehearsal private env is ready to validate"
  else
    nogo "preprod rehearsal private env is not ready to validate; fill placeholders and run env-status"
  fi
  if check_preprod_db_gate; then
    pass "preprod disposable DB rehearsal gate confirmed by env"
  else
    nogo "preprod disposable DB rehearsal is still not confirmed; env readiness does not satisfy the preprod launch gate"
  fi
elif [ "$mode" = "preprod-db-rehearsal" ]; then
  if check_preprod_db_rehearsal_script; then
    pass "preprod disposable DB migration rehearsal script passes"
  else
    nogo "preprod disposable DB migration rehearsal did not complete; provide disposable preprod DB env and confirmations"
  fi
elif [ "$mode" = "preprod-db-local-script-test" ]; then
  if check_preprod_db_local_script_test; then
    pass "preprod DB rehearsal local script-test passes"
  else
    nogo "preprod DB rehearsal local script-test failed; local PostgreSQL disposable DB evidence is missing"
  fi
  if check_preprod_db_gate; then
    pass "preprod disposable DB rehearsal gate confirmed by env"
  else
    nogo "preprod disposable DB rehearsal is still not confirmed; local script-test does not satisfy the preprod launch gate"
  fi
elif check_preprod_db_gate; then
  pass "preprod disposable DB rehearsal gate confirmed by env"
else
  nogo "preprod disposable DB rehearsal is not confirmed; real migration registration stays blocked"
fi

if check_high_risk_runtime_gate; then
  pass "payment/refund/settlement runtime approval gate confirmed by env"
else
  nogo "payment/refund/settlement/commission/payout/permission/fulfillment runtime remains blocked; set PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true only after explicit high-risk approval"
fi

if [ "$mode" = "full" ] || [ "$mode" = "frontend" ]; then
  run_check "Admin/Vendor/Storefront build gates pass" check_full_builds
fi

if [ "$mode" = "refund-smoke" ]; then
  run_check "main API refund review query surface HTTP smoke passes" \
    bash -lc "cd '$root' && ./.codex/scripts/refund-review-query-surface-main-api-existing-server-smoke.sh"
fi

if [ "$mode" = "refund-smoke-local-db" ]; then
  run_check "disposable local DB refund review query surface Admin HTTP smoke passes" \
    bash -lc "cd '$root' && CODEX_HTTP_SMOKE_PORT=\"\${CODEX_REFUND_LOCAL_DB_HTTP_SMOKE_PORT:-19100}\" CODEX_HTTP_SMOKE_STABILITY_WAIT_SECONDS=\"\${CODEX_HTTP_SMOKE_STABILITY_WAIT_SECONDS:-3}\" ./.codex/scripts/refund-review-query-surface-admin-http-smoke-local-db.sh"
  warn "refund-smoke-local-db validates seed/query/cleanup against localhost disposable DB only; it does not satisfy real preprod rehearsal"
fi

if [ "$mode" = "unit-permission-smoke" ]; then
  run_check "Admin to Vendor unit permission HTTP smoke passes" \
    bash -lc "cd '$root' && ./.codex/scripts/china-unit-permission-admin-vendor-http-smoke.sh"
fi

if [ "$mode" = "platform-module-switch-smoke" ]; then
  run_check "Admin platform module switch HTTP smoke passes" \
    bash -lc "cd '$root' && ./.codex/scripts/china-platform-module-switch-admin-http-smoke.sh"
fi

if [ "$mode" = "runtime-mock-suite" ]; then
  run_check "runtime mock, dry-run, shadow, and read-only contract tests pass" \
    check_runtime_mock_suite_tests
  run_check "Admin platform module switch HTTP smoke passes" \
    bash -lc "cd '$root' && ./.codex/scripts/china-platform-module-switch-admin-http-smoke.sh"
  run_check "main API refund review query surface HTTP smoke passes" \
    bash -lc "cd '$root' && ./.codex/scripts/refund-review-query-surface-main-api-existing-server-smoke.sh"
  run_check "Admin to Vendor unit permission HTTP smoke passes" \
    bash -lc "cd '$root' && ./.codex/scripts/china-unit-permission-admin-vendor-http-smoke.sh"
  if check_preprod_db_local_script_test; then
    pass "preprod DB rehearsal local script-test passes"
  else
    nogo "preprod DB rehearsal local script-test failed; local PostgreSQL disposable DB evidence is missing"
  fi
  warn "runtime mock suite validates broad local behavior without approving production/preprod high-risk state mutations"
fi

if [ "$mode" = "preprod-env-discovery" ] || [ "$mode" = "preprod-env-status" ] || [ "$mode" = "preprod-db-rehearsal" ] || [ "$mode" = "preprod-db-local-script-test" ]; then
  warn "preprod DB rehearsal mode does not approve high-risk payment/refund/settlement runtime writes"
fi

print_items() {
  local title="$1"
  shift

  printf '%s\n' "$title"
  if [ "$#" -eq 0 ]; then
    printf '  - none\n'
    return
  fi

  local item
  for item in "$@"; do
    printf '  - %s\n' "$item"
  done
}

json_array() {
  node -e 'process.stdout.write(JSON.stringify(process.argv.slice(1)))' "$@"
}

print_json_summary() {
  local verdict="GO-FOR-CHECKED-SCOPE"
  if [ "$failures" -gt 0 ]; then
    verdict="NO-GO"
  fi

  local pass_json
  local warn_json
  local nogo_json
  pass_json="$(json_array "${pass_items[@]}")"
  warn_json="$(json_array "${warn_items[@]}")"
  nogo_json="$(json_array "${nogo_items[@]}")"

  node - "$mode" "$verdict" "$passes" "$warnings" "$failures" "$pass_json" "$warn_json" "$nogo_json" "$output_path" "$preprod_env_status_json" "$preprod_env_discovery_json" <<'NODE'
const fs = require("fs")
const [
  mode,
  verdict,
  passCount,
  warningCount,
  noGoCount,
  passItems,
  warningItems,
  noGoItems,
  outputPath,
  preprodEnvStatusValue,
  preprodEnvDiscoveryValue,
] = process.argv.slice(2)

const parseItems = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

const parseOptionalObject = (value) => {
  if (!value || value === "null") {
    return null
  }

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null
  } catch {
    return null
  }
}

const pickPreprodEnvStatus = (status) => {
  if (!status) {
    return null
  }

  return {
    exists: Boolean(status.exists),
    privatePath: Boolean(status.privatePath),
    mode: status.mode ?? null,
    modeOk: Boolean(status.modeOk),
    gitIgnored: Boolean(status.gitIgnored),
    declared: status.declared && typeof status.declared === "object" ? status.declared : {},
    placeholdersPresent: Boolean(status.placeholdersPresent),
    placeholderKeys: Array.isArray(status.placeholderKeys)
      ? status.placeholderKeys.filter((key) => typeof key === "string")
      : [],
    syntaxOk: Boolean(status.syntaxOk),
    syntaxReason: status.syntaxReason ?? null,
    preflightOk: Boolean(status.preflightOk),
    preflightReason: status.preflightReason ?? null,
    verdict: status.verdict ?? null,
    next: status.next ?? null,
  }
}

const pickPreprodEnvDiscovery = (discovery) => {
  if (!discovery) {
    return null
  }

  return {
    root: discovery.root ?? null,
    defaultPrivateEnvDatabaseUrl: discovery.defaultPrivateEnvDatabaseUrl ?? null,
    currentEnvCandidateCount: Number(discovery.currentEnvCandidateCount ?? 0),
    currentEnvCandidateKeys: Array.isArray(discovery.currentEnvCandidateKeys)
      ? discovery.currentEnvCandidateKeys.filter((key) => typeof key === "string")
      : [],
    envFileCandidates: Array.isArray(discovery.envFileCandidates)
      ? discovery.envFileCandidates.filter((item) => typeof item === "string")
      : [],
    keyReferences: Array.isArray(discovery.keyReferences)
      ? discovery.keyReferences.filter((item) => item && typeof item === "object")
      : [],
    verdict: discovery.verdict ?? null,
  }
}

const summary = {
  mode,
  verdict,
  counts: {
    pass: Number(passCount),
    warnings: Number(warningCount),
    noGo: Number(noGoCount),
  },
  passItems: parseItems(passItems),
  warningItems: parseItems(warningItems),
  noGoItems: parseItems(noGoItems),
}

const preprodEnvStatus = pickPreprodEnvStatus(parseOptionalObject(preprodEnvStatusValue))
if (mode === "preprod-env-status" && preprodEnvStatus) {
  summary.preprodEnvStatus = preprodEnvStatus
}

const preprodEnvDiscovery = pickPreprodEnvDiscovery(parseOptionalObject(preprodEnvDiscoveryValue))
if (mode === "preprod-env-discovery" && preprodEnvDiscovery) {
  summary.preprodEnvDiscovery = preprodEnvDiscovery
}

const json = `${JSON.stringify(summary)}\n`

if (outputPath) {
  fs.writeFileSync(outputPath, json)
}

process.stdout.write(json)
NODE
}

if [ -n "$output_path" ] && [ "$output_format" != "json" ]; then
  echo "--output requires --json or json mode." >&2
  exit 2
fi

if [ "$output_format" = "json" ]; then
  print_json_summary
  if [ "$failures" -gt 0 ]; then
    exit 1
  fi
  exit 0
fi

printf '\nREADINESS VERDICT: '
if [ "$failures" -gt 0 ]; then
  printf 'NO-GO\n'
else
  printf 'GO-FOR-CHECKED-SCOPE\n'
fi

printf 'SUMMARY mode=%s pass=%s warnings=%s no_go=%s\n' "$mode" "$passes" "$warnings" "$failures"

if [ "$mode" = "report" ]; then
  printf '\nREPORT SCOPE\n'
  printf '  - quick automated gates plus explicit launch blockers\n'
  printf '  - does not run full frontend builds; use mode=full or mode=frontend for that\n'
  printf '  - does not run Admin logged-in visual QA; use mode=admin-visual-qa for that\n'
  printf '  - does not run refund HTTP smoke; use mode=refund-smoke for that\n'
  printf '  - does not run disposable local DB refund HTTP smoke; use mode=refund-smoke-local-db for that\n'
  printf '  - does not run unit-permission HTTP smoke; use mode=unit-permission-smoke for that\n'
  printf '  - does not run platform module switch HTTP smoke; use mode=platform-module-switch-smoke for that\n'
  printf '  - does not run the broad runtime mock suite; use mode=runtime-mock-suite for that\n'
  printf '  - does not run private preprod env status; use mode=preprod-env-status for that\n'
  printf '  - does not run disposable preprod DB rehearsal; use mode=preprod-db-rehearsal for that\n'
  printf '  - does not run localhost disposable DB script-test; use mode=preprod-db-local-script-test for that\n'

  print_items "AUTOMATED / DOCUMENT EVIDENCE PASSED" "${pass_items[@]}"
  print_items "WARNINGS" "${warn_items[@]}"
  print_items "LAUNCH BLOCKERS" "${nogo_items[@]}"

  printf 'NEXT VERIFICATION COMMANDS\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh quick\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh frontend\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh admin-visual-qa\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh full\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh refund-smoke\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh refund-smoke-local-db\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh unit-permission-smoke\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh platform-module-switch-smoke\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh runtime-mock-suite\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh preprod-env-status\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh preprod-db-rehearsal\n'
  printf '  - ./.codex/scripts/china-launch-readiness-check.sh preprod-db-local-script-test\n'
fi

if [ "$failures" -gt 0 ]; then
  exit 1
fi
