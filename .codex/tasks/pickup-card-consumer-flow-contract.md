# Task: pickup-card-consumer-flow-contract

## 目标

新增消费者提货卡流程只读 TypeScript contract，固化“持卡识别权益 -> 补齐信息 -> 提交提货申请 -> 查看提货进度”的消费者流程。

## 允许修改

- `packages/api/src/modules/china-pickup-card-read-model/**`
- `.codex/tasks/pickup-card-consumer-flow-contract.md`
- `docs/pickup-card-consumer-flow-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不新增 API route。
- 不新增 migration。
- 不注册 runtime module。
- 不修改 `apps/**`。
- 不生成真实卡号、卡密、二维码 token、兑换记录或履约单。
- 不接 payment provider、coupon、promotion、gift card、store credit 或 checkout。
- 不修改 cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment 逻辑。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-pickup-card-read-model/__tests__/pickup-card-consumer-flow-contract.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git restore -- packages/api/.mercur/index.d.ts
git diff --check
```

## 完成标准

- 合同输出 `readOnly: true` 和 `runtimeEnabled: false`。
- 所有消费者步骤都不创建 payment 或 ordinary order。
- 权益不能换目录商品、不能转余额、不能抵扣 cart total。
- payment/coupon/gift card/cart/order paid state/fulfillment creation 均标记为串行阻塞。
