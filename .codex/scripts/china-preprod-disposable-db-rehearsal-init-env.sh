#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
target="${1:-"$root/.codex/private/preprod-disposable-db-rehearsal.env"}"
template="$root/.codex/templates/preprod-disposable-db-rehearsal.env.example"

fail() {
  printf 'FAIL %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-init-env.sh [private-env-file]

Default:
  .codex/private/preprod-disposable-db-rehearsal.env

This creates a local private env draft from the template with mode 600.
It refuses to overwrite an existing file and does not connect to any database.
USAGE
}

case "$target" in
  -h|--help|help)
    usage
    exit 0
    ;;
esac

[ -f "$template" ] || fail "template does not exist: $template"

target_dir="$(cd "$(dirname "$target")" 2>/dev/null && pwd || true)"
if [ -z "$target_dir" ]; then
  mkdir -p "$(dirname "$target")"
  target_dir="$(cd "$(dirname "$target")" && pwd)"
fi
target_abs="${target_dir}/$(basename "$target")"

case "$target_abs" in
  "$root/.codex/private/"*|"$root/project-ledger/private/"*)
    ;;
  *)
    fail "target must live under .codex/private/ or project-ledger/private/."
    ;;
esac

case "$target_abs" in
  *.example|*.template)
    fail "target must not use .example or .template extension."
    ;;
esac

[ ! -e "$target_abs" ] || fail "target already exists; refusing to overwrite: $target_abs"

install -m 600 "$template" "$target_abs"

cat <<EOF
PASS created private preprod rehearsal env draft:
  $target_abs

Next:
  1. Fill the placeholders in that private file.
  2. Validate without connecting to DB:
     ./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh "$target_abs" validate
  3. Run only after confirming the DB is disposable preprod:
     ./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh "$target_abs" run
EOF
