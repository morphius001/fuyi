#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
scan_dir=""
output_path=""
log_path=""

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-artifact-secret-scan.log
  fi

  command -v node >/dev/null || {
    echo "node is required for artifact secret scan JSON output." >&2
    exit 2
  }
}

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-readiness-artifact-secret-scan.sh <artifact-dir> --output <json-file> --log <log-file>

Scans a readiness artifact directory for database connection URL patterns:
- postgres://
- postgresql://

This script is a redaction regression gate for generated readiness artifacts.
It does not connect to any database and does not read private env files beyond
plain artifact text scanning.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help|help)
      usage
      exit 0
      ;;
    --output)
      shift
      output_path="${1:-}"
      ;;
    --log)
      shift
      log_path="${1:-}"
      ;;
    *)
      if [ -z "$scan_dir" ]; then
        scan_dir="$1"
      else
        echo "Unknown argument: $1" >&2
        usage >&2
        exit 2
      fi
      ;;
  esac
  shift || true
done

if [ -z "$scan_dir" ] || [ -z "$output_path" ] || [ -z "$log_path" ]; then
  usage >&2
  exit 2
fi

case "$scan_dir" in
  "$root"/*|/tmp/*)
    ;;
  *)
    echo "Refusing to scan outside repo or /tmp: $scan_dir" >&2
    exit 2
    ;;
esac

if [ ! -d "$scan_dir" ]; then
  echo "Artifact directory does not exist: $scan_dir" >&2
  exit 2
fi

load_runtime

mkdir -p "$(dirname "$output_path")" "$(dirname "$log_path")"
rm -f "$log_path"

status=0
if grep -R -I -n -E \
  --exclude="$(basename "$log_path")" \
  --exclude="$(basename "$output_path")" \
  'postgres(ql)?://' "$scan_dir" >"$log_path"; then
  status=1
fi

node - "$status" "$output_path" "$log_path" "$scan_dir" <<'NODE'
const fs = require("fs")
const [statusText, outputPath, logPath, scanDir] = process.argv.slice(2)
const hasLeak = Number(statusText) !== 0
const summary = {
  mode: "artifact-secret-scan",
  verdict: hasLeak ? "NO-GO" : "GO-FOR-CHECKED-SCOPE",
  counts: {
    pass: hasLeak ? 0 : 1,
    warnings: 0,
    noGo: hasLeak ? 1 : 0,
  },
  passItems: hasLeak ? [] : ["readiness suite artifacts contain no database connection URL patterns"],
  warningItems: [],
  noGoItems: hasLeak
    ? [`readiness suite artifacts contain database connection URL patterns; see ${logPath}`]
    : [],
  scan: {
    directory: scanDir,
    checkedPatterns: ["postgres URL scheme", "postgresql URL scheme"],
    logPath,
  },
}
fs.writeFileSync(outputPath, `${JSON.stringify(summary)}\n`)
NODE

exit "$status"
