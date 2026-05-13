# Payment Runtime Inbox Only Route Disposable DB Rehearsal

更新时间：2026-05-14 Asia/Shanghai

## 结论

本轮把 `mock-webhook-db-backed-route-runtime` 的 local disposable DB 路径做成了一次可重复 rehearsal，并补齐了当前实现链进入下一步前需要的运行证据。

rehearsal 结果：通过。当前 route 仍然只停在 inbox-only / audit-only 语义，duplicate、invalid signature、rejected payload、response redaction 和 redacted artifact capture 都有 disposable DB 级别证据，且临时库清理无残留。

## Files Changed

- `.codex/tasks/payment-runtime-inbox-only-route-disposable-db-rehearsal.md`
- `.codex/tasks/payment-workflow-command-adapter-disabled-runtime.md`
- `.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh`
- `packages/api/src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts`
- `docs/payment-runtime-inbox-only-route-disposable-db-rehearsal.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## Rehearsal Evidence

本轮确认了以下路径：

1. `accepted`
   - mock payload 能进入 inbox
   - route 返回 `accepted`
   - response 不泄漏 raw payload、secret、signature、DB URL

2. `duplicate`
   - 重复 payload 被识别为 `duplicate`
   - inbox row count 维持稳定
   - event log 能看到 dedupe hit
   - response 仍不泄漏敏感字段

3. `rejected`
   - missing signature -> `SIGNATURE_MISSING`
   - invalid signature -> `SIGNATURE_INVALID`
   - missing currency -> `PAYLOAD_INVALID`
   - non-CNY payload -> `PAYLOAD_INVALID`
   - rejected 路径不写 inbox / event log
   - response 不泄漏 raw payload、secret、signature、DB URL

4. artifact capture
   - `rehearsal` mode 会输出 redacted response / DB summary artifacts
   - artifact 不包含 raw payload、secret、signature、DB URL
   - 当前本地 artifact 输出目录验证为 `/tmp/fuyi-payment-runtime-rehearsal-artifacts`

5. disposable DB cleanup
   - rehearsal 结束后临时库自动删除
   - 9110 临时 API 进程无残留

## Safety Boundary

本轮仍然明确保持：

- route 仍是 inbox-only
- runtime 默认关闭
- 只允许 mock provider
- 只允许 local / disposable DB
- 不执行 workflow
- 不写 payment success
- 不接 checkout、order、refund、settlement、commission、permission、fulfillment、logistics

## Verification

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
node --experimental-vm-modules ./node_modules/jest/bin/jest.js --runInBand --verbose --runTestsByPath src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts src/modules/china-payment-notification/__tests__/mock-payment-webhook-composition.unit.spec.ts src/modules/china-payment-notification/__tests__/mock-webhook-repository-resolver.unit.spec.ts src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
MOCK_WEBHOOK_ARTIFACT_DIR=/tmp/fuyi-payment-runtime-rehearsal-artifacts ./.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh rehearsal
git diff --check
```

结果：

```text
focused route/module tests passed via node+jest
API typecheck passed
rehearsal local smoke passed
artifact export passed
git diff --check passed
```

## Next Step

建议继续进入 `payment-workflow-command-adapter-disabled-runtime`，但只能做 disabled adapter / release gate，仍不得自动推进 workflow 或写 payment success state。
