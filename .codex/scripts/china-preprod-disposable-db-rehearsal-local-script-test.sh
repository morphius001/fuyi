#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_host="${CODEX_LOCAL_SCRIPT_TEST_PG_HOST:-127.0.0.1}"
pg_port="${CODEX_LOCAL_SCRIPT_TEST_PG_PORT:-15432}"
pg_user="${CODEX_LOCAL_SCRIPT_TEST_PG_USER:-$USER}"
db_name="${CODEX_LOCAL_SCRIPT_TEST_DB_NAME:-fuyi_preprod_disposable_local_$(date +%Y%m%d%H%M%S)}"
created_db=0

fail() {
  printf 'FAIL %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-local-script-test.sh

This local-only script test creates a disposable localhost database, runs
china-preprod-disposable-db-rehearsal.sh run-local-script-test, verifies the
migration evidence, and drops the database on exit.

It does not satisfy the real disposable preprod launch gate.
USAGE
}

case "${1:-}" in
  -h|--help|help)
    usage
    exit 0
    ;;
  "")
    ;;
  *)
    fail "Unknown argument: $1"
    ;;
esac

case "$pg_host" in
  127.0.0.1|localhost|::1)
    ;;
  *)
    fail "local script test only accepts localhost PostgreSQL hosts."
    ;;
esac

case "$db_name" in
  fuyi_preprod_disposable_local_[0-9]*|fuyi_preprod_disposable_local_manual_*)
    ;;
  *)
    fail "database name must use fuyi_preprod_disposable_local_ prefix."
    ;;
esac

case "$db_name" in
  *[!A-Za-z0-9_]*)
    fail "database name may only contain letters, numbers, and underscores."
    ;;
esac

for cmd in pg_isready createdb dropdb psql; do
  command -v "$cmd" >/dev/null || fail "$cmd is required."
done

cleanup() {
  local status=$?
  if [ "$created_db" = "1" ]; then
    dropdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name" >/dev/null 2>&1 || true
    local remaining
    remaining="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -Atc "select count(*) from pg_database where datname = '$db_name'" 2>/dev/null || printf 'unknown')"
    printf 'CLEANUP local script-test database count after drop: %s\n' "$remaining"
  fi
  exit "$status"
}
trap cleanup EXIT

pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" >/dev/null ||
  fail "PostgreSQL is not ready at ${pg_host}:${pg_port}. Start local dev services first."

if [ "$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d postgres -Atc "select count(*) from pg_database where datname = '$db_name'")" != "0" ]; then
  fail "refusing to reuse existing database: $db_name"
fi

printf 'CREATE local script-test database: %s\n' "$db_name"
createdb -h "$pg_host" -p "$pg_port" -U "$pg_user" "$db_name"
created_db=1

(
  cd "$root"
  CODEX_PREPROD_DISPOSABLE_DATABASE_URL="postgres://${pg_user}@${pg_host}:${pg_port}/${db_name}" \
    CODEX_PREPROD_DISPOSABLE_DB_CONFIRM="I_CONFIRM_THIS_IS_DISPOSABLE_PREPROD_DB" \
    CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM="BACKUP_DONE_OR_NOT_NEEDED" \
    CODEX_PREPROD_DISPOSABLE_DB_OPERATOR="local-script-test" \
    CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER="local-script-test-trap-drop" \
    CODEX_PREPROD_DISPOSABLE_WORKTREE_ACK="I_ACCEPT_CURRENT_LOCAL_WIP_FOR_REHEARSAL" \
    CODEX_PREPROD_DISPOSABLE_DB_LOCAL_SCRIPT_TEST_CONFIRM="I_ACCEPT_LOCALHOST_SCRIPT_TEST_ONLY" \
    ./.codex/scripts/china-preprod-disposable-db-rehearsal.sh run-local-script-test
)

printf 'PASS local preprod rehearsal script test completed for database: %s\n' "$db_name"
