#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$root"

echo "CHECK payment notification module is not registered in medusa-config.ts"
if grep -R "china-payment-notification" packages/api/medusa-config.ts >/dev/null; then
  echo "Refusing to continue: china-payment-notification is referenced by medusa-config.ts." >&2
  exit 1
fi

echo "CHECK staged files do not include forbidden runtime/config scope"
if git diff --cached --name-only | grep -E '^(apps|packages/api/medusa-config.ts|packages/api/package.json|bun.lock|\.env)' >/dev/null; then
  echo "Forbidden staged file detected." >&2
  git diff --cached --name-only | grep -E '^(apps|packages/api/medusa-config.ts|packages/api/package.json|bun.lock|\.env)' >&2
  exit 1
fi

echo "RUN payment notification unit tests"
(
  cd packages/api
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.nvm/nvm.sh"
    nvm use 24 >/tmp/fuyi-nvm-use-payment-harness.log
  fi
  bun run test:unit --runTestsByPath \
    src/modules/china-payment-notification/__tests__/mock-payment-notification.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-notification-inbox-repository.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-notification-state-guard.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-workflow-command-mapper.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-workflow-command-audit-mapper.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-inbox-repository-contract.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-runtime-config.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-runtime-gate.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/mock-china-payment-provider.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-provider-registry.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/mock-provider-runtime-gate-composition.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/payment-db-inbox-repository.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/mock-payment-webhook-response.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/mock-payment-webhook-request.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/mock-payment-webhook-composition.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/mock-payment-webhook-handler.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/mock-webhook-repository-resolver.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/alipay-provider.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/alipay-test-vectors.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/alipay-notification-verifier.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/alipay-notification-normalizer.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/wechat-pay-provider.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/wechat-pay-test-vectors.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/wechat-pay-notification-verifier.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/wechat-pay-notification-normalizer.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-amount-guard.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-request-idempotency.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-notification-test-vectors.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-notification-verifier.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-notification-normalizer.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-manual-review-audit.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-audit-event-allowlist.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-inbox-state-transition.unit.spec.ts \
    src/modules/china-payment-notification/__tests__/refund-inbox-repository-contract.unit.spec.ts \
    src/api/admin/china/mock-payment-webhooks/__tests__/route.unit.spec.ts \
    src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts \
    src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts
)

echo "RUN payment notification inbox migration skeleton dry-run"
".codex/scripts/payment-notification-inbox-local-dry-run.sh"

echo "PASS payment notification idempotency harness completed."
