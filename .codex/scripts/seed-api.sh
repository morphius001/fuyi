#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pg_port="${CODEX_PG_PORT:-15432}"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$NVM_DIR/nvm.sh"
  nvm use >/tmp/fuyi-nvm-use-seed.log
fi

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

command -v node >/dev/null || {
  echo "node not found after loading nvm. Check ~/.nvm and .nvmrc."
  exit 1
}

cd "$root/packages/api"

# Run Medusa through Node rather than `bun run seed`; Bun can trip Medusa/MikroORM
# source-map support before the seed script starts on this WSL setup.
CODEX_DATABASE_URL="${CODEX_DATABASE_URL:-postgres://${USER}@127.0.0.1:${pg_port}/mercur}" \
  ./node_modules/.bin/medusa exec ./src/scripts/seed.ts
