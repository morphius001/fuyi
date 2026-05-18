#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
default_env="${root}/.codex/private/preprod-disposable-db-rehearsal.env"
key_pattern="(PREPROD|DISPOSABLE|DATABASE_URL|DB_URL|POSTGRES)"
output_format="text"
output_path=""

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-discover.sh [--json] [--output <file>]

Redacted discovery for disposable preprod DB rehearsal configuration sources.
It prints candidate key names and file paths only. It never prints env values,
database URLs, credentials, or connection strings, and it never connects to a
database.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --json|json)
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
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

print_current_env_candidates() {
  local count
  count="$(env | awk -F= -v pattern="$key_pattern" '$1 ~ pattern { count += 1 } END { print count + 0 }')"

  printf 'current_env_candidate_count=%s\n' "$count"
  env | awk -F= -v pattern="$key_pattern" '$1 ~ pattern { print "current_env." $1 "=<redacted>" }' | sort
}

print_env_file_candidates() {
  find "$root" -maxdepth 4 -type f \( -name ".env*" -o -name "*.env" \) \
    -not -path "${root}/node_modules/*" \
    -not -path "${root}/.git/*" \
    -not -path "${root}/.codex/artifacts/*" \
    2>/dev/null |
    sort |
    sed "s#^${root}/#env_file.#"
}

print_key_references_for_file() {
  local file="$1"

  awk -v file="${file#"$root"/}" -v pattern="$key_pattern" -F= '
    /^[[:space:]]*(export[[:space:]]+)?[A-Za-z_][A-Za-z0-9_]*=/ {
      key = $1
      sub(/^[[:space:]]*export[[:space:]]+/, "", key)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
      if (key ~ pattern) {
        printf "key_ref.%s:%d:%s=<redacted>\n", file, FNR, key
      }
    }
  ' "$file"
}

print_key_references() {
  find "${root}/.codex/private" "${root}/project-ledger/private" -type f 2>/dev/null |
    sort |
    while IFS= read -r file; do
      print_key_references_for_file "$file"
    done

  find "$root" -maxdepth 4 -type f \( -name ".env*" -o -name "*.env" \) \
    -not -path "${root}/node_modules/*" \
    -not -path "${root}/.git/*" \
    -not -path "${root}/.codex/artifacts/*" \
    -not -path "${root}/.codex/private/*" \
    -not -path "${root}/project-ledger/private/*" \
    2>/dev/null |
    sort |
    while IFS= read -r file; do
      print_key_references_for_file "$file"
    done
}

print_default_private_env_database_url_state() {
  if [ ! -f "$default_env" ]; then
    printf 'default_private_env_database_url=missing\n'
    return
  fi

  if ! grep -q '^CODEX_PREPROD_DISPOSABLE_DATABASE_URL=' "$default_env"; then
    printf 'default_private_env_database_url=missing\n'
    return
  fi

  if grep -q '^CODEX_PREPROD_DISPOSABLE_DATABASE_URL=.*\(replace-with\|placeholder\|YYYYMMDD\|preprod-host.example\)' "$default_env"; then
    printf 'default_private_env_database_url=placeholder\n'
    return
  fi

  printf 'default_private_env_database_url=set_redacted\n'
}

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-preprod-env-discover.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v node >/dev/null || {
    echo "node not found after loading runtime." >&2
    exit 1
  }
}

current_env_candidate_count() {
  env | awk -F= -v pattern="$key_pattern" '$1 ~ pattern { count += 1 } END { print count + 0 }'
}

write_json_summary() {
  local text_file="$1"
  local json

  json="$(node - "$text_file" <<'NODE'
const fs = require("fs")
const text = fs.readFileSync(process.argv[2], "utf8")
const lines = text.split(/\r?\n/).filter(Boolean)

const readScalar = (prefix) => {
  const line = lines.find((item) => item.startsWith(`${prefix}=`))
  return line ? line.slice(prefix.length + 1) : null
}

const section = (start, end) => {
  const startIndex = lines.indexOf(start)
  const endIndex = lines.indexOf(end)
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    return []
  }
  return lines.slice(startIndex + 1, endIndex)
}

const keyReferences = section("key_references_begin", "key_references_end").map((line) => {
  const match = /^key_ref\.([^:]+):(\d+):([^=]+)=<redacted>$/.exec(line)
  if (!match) {
    return { raw: line }
  }

  return {
    file: match[1],
    line: Number(match[2]),
    key: match[3],
  }
})

const summary = {
  root: readScalar("root"),
  defaultPrivateEnvDatabaseUrl: readScalar("default_private_env_database_url"),
  currentEnvCandidateCount: Number(readScalar("current_env_candidate_count") ?? 0),
  currentEnvCandidateKeys: lines
    .filter((line) => line.startsWith("current_env."))
    .map((line) => line.replace(/^current_env\./, "").replace(/=<redacted>$/, "")),
  envFileCandidates: section("env_file_candidates_begin", "env_file_candidates_end")
    .map((line) => line.replace(/^env_file\./, "")),
  keyReferences,
  verdict: readScalar("verdict"),
}

process.stdout.write(`${JSON.stringify(summary)}\n`)
NODE
)"

  if [ -n "$output_path" ]; then
    printf '%s' "$json" >"$output_path"
  fi

  printf '%s' "$json"
}

text_output="$(mktemp)"
trap 'rm -f "$text_output"' EXIT

{
printf 'PREPROD_REHEARSAL_ENV_DISCOVERY\n'
printf 'root=%s\n' "$root"
print_default_private_env_database_url_state
print_current_env_candidates
printf 'env_file_candidates_begin\n'
print_env_file_candidates
printf 'env_file_candidates_end\n'
printf 'key_references_begin\n'
print_key_references
printf 'key_references_end\n'
printf 'verdict=DISCOVERY_ONLY_NO_DATABASE_CONNECTION_ATTEMPTED\n'
} >"$text_output"

if [ "$output_format" = "json" ]; then
  load_runtime
  write_json_summary "$text_output"
else
  if [ -n "$output_path" ]; then
    cp "$text_output" "$output_path"
  fi
  cat "$text_output"
fi
