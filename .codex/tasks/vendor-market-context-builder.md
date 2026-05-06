# vendor-market-context-builder

## 目标

实现 Vendor market context builder 和单元测试，不注册 route。

## 允许修改

- `packages/api/src/modules/china-market-read-model/**`
- `.codex/tasks/vendor-market-context-builder.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/api/src/api/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts
cd packages/api && bun run build
git diff --check
```

## 完成边界

- Builder 只能输出只读 view model。
- `runtimeEnabled` 必须固定为 `false`。
- `deliveryProfiles` 必须声明 `checkoutImpact: "none"`。
- 不新增 Vendor route，route 放到后续 `vendor-market-context-readonly-route`。
