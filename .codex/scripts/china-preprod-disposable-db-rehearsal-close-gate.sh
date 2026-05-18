#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
env_file="$root/.codex/private/preprod-disposable-db-rehearsal.env"
mode="plan"
timestamp="$(date +%Y%m%d%H%M%S)"
output_dir="${CODEX_PREPROD_CLOSE_GATE_OUTPUT_DIR:-${TMPDIR:-/tmp}/fuyi-preprod-close-gate-${timestamp}}"

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-close-gate.sh [plan|run] [private-env-file]

Default private env:
  .codex/private/preprod-disposable-db-rehearsal.env

Plan:
  Prints the exact ordered gate chain. No database connection is made.

Run:
  1. Writes redacted discovery and env-status artifacts.
  2. Stops before validation/run unless high-risk approval env is explicit.
  3. Stops before validation/run unless env-status is READY_TO_VALIDATE.
  4. Runs from-env validate. No database connection is made in this step.
  5. Runs guarded from-env run against the disposable preprod DB.
  6. Runs the readiness artifact suite with the preprod DB rehearsal gate confirmed.

This script never prints database URLs. It relies on the lower-level guarded
scripts for target safety and cleanup evidence.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help|help)
      usage
      exit 0
      ;;
    plan|run)
      mode="$1"
      ;;
    *)
      env_file="$1"
      ;;
  esac
  shift
done

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-preprod-close-gate.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v node >/dev/null || {
    echo "FAIL node not found after loading runtime." >&2
    exit 1
  }
}

if [ "$mode" = "plan" ]; then
  cat <<PLAN
PREPROD_DISPOSABLE_DB_CLOSE_GATE_PLAN
env_file=$env_file
output_dir=$output_dir
steps:
  1. ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-discover.sh --json --output <output_dir>/preprod-env-discovery.redacted.json
  2. ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh <env_file> --json --output <output_dir>/preprod-env-status.redacted.json
  3. require PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true
  4. require env-status verdict READY_TO_VALIDATE
  5. ./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh <env_file> validate
  6. ./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh <env_file> run
  7. PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true ./.codex/scripts/china-launch-readiness-artifact-suite.sh
database_connection_attempted=false
PLAN
  exit 0
fi

mkdir -p "$output_dir"
load_runtime

discovery_artifact="$output_dir/preprod-env-discovery.redacted.json"
env_status_artifact="$output_dir/preprod-env-status.redacted.json"
validate_log="$output_dir/from-env-validate.log"
run_log="$output_dir/from-env-run.log"
suite_output_dir="$output_dir/readiness-suite"
suite_log="$output_dir/readiness-suite.log"

echo "PREPROD_DISPOSABLE_DB_CLOSE_GATE_RUN"
echo "env_file=$env_file"
echo "output_dir=$output_dir"

(
  cd "$root"
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-discover.sh \
    --json \
    --output "$discovery_artifact" >/dev/null
)
echo "PASS wrote redacted discovery artifact: $discovery_artifact"

(
  cd "$root"
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh \
    "$env_file" \
    --json \
    --output "$env_status_artifact" >/dev/null
)
echo "PASS wrote redacted env-status artifact: $env_status_artifact"

if [ "${PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED:-false}" != "true" ]; then
  echo "FAIL PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true is required before close-gate run." >&2
  echo "No database connection was attempted." >&2
  exit 1
fi

echo "PASS high-risk runtime approval gate confirmed by env"

env_verdict="$(
  node - "$env_status_artifact" <<'NODE'
const fs = require("fs")
const status = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
process.stdout.write(status.verdict || "UNKNOWN")
NODE
)"

if [ "$env_verdict" != "READY_TO_VALIDATE" ]; then
  placeholder_keys="$(
    node - "$env_status_artifact" <<'NODE'
const fs = require("fs")
const status = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
process.stdout.write(Array.isArray(status.placeholderKeys) && status.placeholderKeys.length ? status.placeholderKeys.join(",") : "none")
NODE
  )"
  echo "FAIL private env is not ready to validate; verdict=$env_verdict placeholder_keys=$placeholder_keys" >&2
  echo "No database connection was attempted." >&2
  exit 1
fi

echo "PASS private env is READY_TO_VALIDATE"

(
  cd "$root"
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh "$env_file" validate
) >"$validate_log" 2>&1
echo "PASS from-env validate completed without database connection: $validate_log"

(
  cd "$root"
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh "$env_file" run
) >"$run_log" 2>&1
echo "PASS guarded disposable preprod DB rehearsal completed"
echo "PASS run log: $run_log"

set +e
(
  cd "$root"
  PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true \
  CODEX_READINESS_SUITE_OUTPUT_DIR="$suite_output_dir" \
    ./.codex/scripts/china-launch-readiness-artifact-suite.sh
) >"$suite_log" 2>&1
suite_status=$?
set -e

echo "PASS readiness suite attempted after real preprod rehearsal: $suite_output_dir"
echo "PASS readiness suite log: $suite_log"

if [ "$suite_status" -ne 0 ]; then
  echo "FAIL readiness suite still has NO-GO items; inspect $suite_output_dir/summary.json" >&2
  exit "$suite_status"
fi

echo "PASS preprod disposable DB close-gate sequence completed"
