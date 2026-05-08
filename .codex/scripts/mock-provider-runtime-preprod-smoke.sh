#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mode="${1:---print-plan}"
shift || true

fail() {
  echo "FAIL $*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage:
  .codex/scripts/mock-provider-runtime-preprod-smoke.sh --print-plan
  .codex/scripts/mock-provider-runtime-preprod-smoke.sh --validate-inputs-only

This skeleton never connects to preprod or production databases.
It only prints the plan or validates operator-provided environment variables.
EOF
}

case "$mode" in
  --print-plan | --validate-inputs-only) ;;
  -h | --help)
    usage
    exit 0
    ;;
  *)
    usage >&2
    fail "Unsupported mode. Only --print-plan and --validate-inputs-only are enabled."
    ;;
esac

for arg in "$@"; do
  case "$arg" in
    *postgres://* | *postgresql://* | *DATABASE_URL* | *DB_URL* | *PASSWORD* | *password* | *SECRET* | *secret* | *PAYLOAD* | *payload* | *SIGNATURE* | *signature*)
      fail "Forbidden sensitive CLI argument. Use approved environment variables and never pass secrets or raw payloads on the command line."
      ;;
    *)
      fail "Unexpected CLI argument: $arg"
      ;;
  esac
done

print_plan() {
  cat <<'EOF'
Mock provider runtime disposable preprod smoke plan

Enabled modes in this skeleton:
- --print-plan: prints this plan and does not connect to any database.
- --validate-inputs-only: validates environment variables and does not connect to any database.

Future disabled stages, not enabled by this skeleton:
- --preflight: requires explicit disposable preprod DB authorization.
- --smoke: requires preflight success and explicit operator authorization.

Required validation variables:
- MOCK_PROVIDER_PREPROD_DB_HOST
- MOCK_PROVIDER_PREPROD_DB_PORT
- MOCK_PROVIDER_PREPROD_DB_USER
- MOCK_PROVIDER_PREPROD_DB_NAME
- MOCK_PROVIDER_PREPROD_COMMIT_SHA
- MOCK_PROVIDER_PREPROD_OPERATOR
- MOCK_PROVIDER_PREPROD_ROLLBACK_OWNER

Safety:
- No full connection strings.
- No password, provider secret, signature, or raw payload CLI args.
- No production-like DB names.
- No real Alipay or WeChat Pay.
- No payment workflow execution.
EOF
}

require_env() {
  local name="$1"
  local value="${!name:-}"

  [ -n "$value" ] || fail "Missing required environment variable: $name"
}

reject_contains() {
  local value="$1"
  local label="$2"
  local lowered

  lowered="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"
  if [[ "$lowered" =~ (^|[-_.])prod($|[-_.]) ]] ||
    [[ "$lowered" == *production* ]] ||
    [[ "$lowered" == *live* ]] ||
    [[ "$lowered" == *master* ]] ||
    [[ "$lowered" == *primary* ]]; then
    fail "$label looks production-like."
  fi
}

validate_inputs() {
  require_env MOCK_PROVIDER_PREPROD_DB_HOST
  require_env MOCK_PROVIDER_PREPROD_DB_PORT
  require_env MOCK_PROVIDER_PREPROD_DB_USER
  require_env MOCK_PROVIDER_PREPROD_DB_NAME
  require_env MOCK_PROVIDER_PREPROD_COMMIT_SHA
  require_env MOCK_PROVIDER_PREPROD_OPERATOR
  require_env MOCK_PROVIDER_PREPROD_ROLLBACK_OWNER

  case "$MOCK_PROVIDER_PREPROD_DB_HOST" in
    *postgres://* | *postgresql://* | *://*)
      fail "DB host must not be a full connection string."
      ;;
  esac
  reject_contains "$MOCK_PROVIDER_PREPROD_DB_HOST" "DB host"

  if ! [[ "$MOCK_PROVIDER_PREPROD_DB_PORT" =~ ^[0-9]+$ ]]; then
    fail "DB port must be numeric."
  fi

  if ! [[ "$MOCK_PROVIDER_PREPROD_DB_USER" =~ ^[A-Za-z0-9_][-A-Za-z0-9_]*$ ]]; then
    fail "DB user has unsafe characters."
  fi

  if ! [[ "$MOCK_PROVIDER_PREPROD_DB_NAME" =~ ^[A-Za-z0-9_]+$ ]]; then
    fail "DB name has unsafe characters."
  fi
  reject_contains "$MOCK_PROVIDER_PREPROD_DB_NAME" "DB name"

  case "$(printf '%s' "$MOCK_PROVIDER_PREPROD_DB_NAME" | tr '[:upper:]' '[:lower:]')" in
    *disposable* | *dry_run* | *dryrun* | *codex*) ;;
    *)
      fail "DB name must clearly indicate disposable or dry-run use."
      ;;
  esac

  if ! [[ "$MOCK_PROVIDER_PREPROD_COMMIT_SHA" =~ ^[0-9a-f]{40}$ ]]; then
    fail "Commit SHA must be a full 40-character lowercase git SHA."
  fi

  local current_sha
  current_sha="$(cd "$root" && git rev-parse HEAD)"
  [ "$current_sha" = "$MOCK_PROVIDER_PREPROD_COMMIT_SHA" ] ||
    fail "Commit SHA does not match current HEAD."

  for env_name in $(env | cut -d= -f1); do
    case "$env_name" in
      MOCK_PROVIDER_PREPROD_*PASSWORD* | MOCK_PROVIDER_PREPROD_*SECRET* | MOCK_PROVIDER_PREPROD_*TOKEN* | MOCK_PROVIDER_PREPROD_*PAYLOAD* | MOCK_PROVIDER_PREPROD_*SIGNATURE*)
        fail "Forbidden sensitive mock provider preprod environment variable present: $env_name"
        ;;
    esac
  done

  echo "PASS mock provider preprod smoke input validation completed without connecting to any external database."
}

case "$mode" in
  --print-plan)
    print_plan
    ;;
  --validate-inputs-only)
    validate_inputs
    ;;
esac
