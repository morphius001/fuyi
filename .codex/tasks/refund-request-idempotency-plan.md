# refund-request-idempotency-plan

## 目标

规划退款 provider request idempotency 合同，明确本地 request id、provider refund id、retry / timeout / unknown state 语义；本轮不实现 runtime。

## 范围

- 定义 refund request idempotency key 组成。
- 定义 request state machine 和 retry-safe 规则。
- 定义 provider refund id 和 notification idempotency 的边界。
- 明确下一步 skeleton / pure contract 的 Go / No-Go。
- 更新 ledger / queue。

## 非目标

- 不新增 TypeScript runtime 文件。
- 不新增 refund route。
- 不写 DB，不注册 migration。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API。
- 不读取真实 secret。
- 不改变 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
git status --short
git diff --name-only
git ls-files --others --exclude-standard
```

## 交付

- `docs/refund-request-idempotency-plan.md`
- `.codex/tasks/refund-request-idempotency-plan.md`
- ledger / queue 更新
