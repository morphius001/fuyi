#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "Not inside a git repository."
  exit 1
fi

root="$(git rev-parse --show-toplevel)"
cd "$root"

if [ -n "$(git status --short)" ]; then
  echo "Working tree is not clean. Stop before creating worktrees."
  git status --short --branch
  exit 1
fi

create_worktree() {
  local dir="$1"
  local branch="$2"
  local base="${3:-main}"

  if [ -e "../$dir" ]; then
    echo "Skip ../$dir: directory already exists."
    return 0
  fi

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "Skip $branch: branch already exists."
    return 0
  fi

  echo "Creating ../$dir on $branch from $base"
  git worktree add "../$dir" -b "$branch" "$base"
}

create_worktree "fuyi-admin-cn" "china/admin-i18n-zhcn-baseline"
create_worktree "fuyi-vendor-cn" "china/vendor-i18n-zhcn-baseline"
create_worktree "fuyi-codegen-cn" "china/codegen-baseline"
create_worktree "fuyi-pickup-card-architecture-cn" "china/pickup-card-architecture"
create_worktree "fuyi-service-provider-cn" "china/mock-service-providers"
create_worktree "fuyi-storefront-zhcn-cn" "china/storefront-zhcn-baseline"

git worktree list
