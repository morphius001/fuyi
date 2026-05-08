# template-registry-readonly-contract

## 目标

新增中国本地化 UI 模板注册表只读合同 skeleton，用纯 TypeScript view shape 表达 Storefront、Admin、Vendor 后续可用模板，不接 route、不接 DB、不注册 runtime。

## 允许修改

- `packages/api/src/modules/china-template-registry-read-model/**`
- `docs/template-registry-readonly-contract.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `apps/**`
- 现有支付、订单、退款、结算、佣金、权限、履约 runtime
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥

## 必须满足

- 合同为只读 view shape。
- 覆盖 Storefront、Admin、Vendor 三个 surface。
- 明确模板 registry 不能作为 RBAC、feature flag、支付成功、订单状态、退款、结算、佣金、打款、履约或 provider 配置事实来源。
- 明确消费者端不默认暴露物料供应商、配送供应商和上游供给内部关系。
- 明确提货卡独立入口、直播只作为店铺状态。
- 增加 focused unit tests。

## 验证

```bash
cd packages/api && bun run test:unit -- template-registry-readonly-contract.unit.spec.ts
tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
