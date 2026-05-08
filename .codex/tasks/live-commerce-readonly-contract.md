# Task: live-commerce-readonly-contract

## 目标

新增直播只读 TypeScript contract，固化直播作为店铺/档口状态展示的边界。

## 允许修改

- `packages/api/src/modules/china-live-commerce-read-model/**`
- `.codex/tasks/live-commerce-readonly-contract.md`
- `docs/live-commerce-readonly-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不新增 API route。
- 不新增 migration。
- 不注册 runtime module。
- 不修改 `apps/**`。
- 不调用 MockLiveProvider。
- 不接真实直播、推流、IM、聊天室、礼物、打赏、直播下单、支付、退款、结算、佣金、权限、通知或履约。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-live-commerce-read-model/__tests__/live-commerce-readonly-contract.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git restore -- packages/api/.mercur/index.d.ts
git diff --check
```

## 完成标准

- 合同输出 `readOnly: true` 和 `runtimeEnabled: false`。
- 直播可出现在店铺卡片/店铺主页/Vendor 预览/Admin 审核占位。
- 直播不能作为消费者首页主入口。
- 真实直播、IM、聊天室、直播交易、支付、结算、权限均标记为串行阻塞。
