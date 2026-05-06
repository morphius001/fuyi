# Task: api-read-model-skeleton

## 目标

为第十四轮数据跑通准备 API 只读 read model skeleton。只做类型、纯 builder 和现有只读 route 的低风险整理，不新增真实业务行为。

## 允许修改

- `packages/api/src/lib/**`
- `packages/api/src/api/store/china/discovery/route.ts`
- `packages/api/src/lib/__tests__/**`
- `packages/api/.mercur/index.d.ts`，如 build/codegen 需要
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改支付、订单、退款、结算、佣金、权限、履约逻辑
- 禁止新增真实数据库 migration
- 禁止新增真实写 API
- 禁止让模块开关、市场规则、配送规则或草稿商品真实生效
- 禁止新增依赖
- 禁止接入真实 AI、短信、IM、直播、物流或支付服务

## 要求

- 新增只读 read model 类型和纯 builder。
- 覆盖 market discovery、module config capability view、vendor product draft 三类 skeleton。
- 现有 `/store/china/discovery` 行为保持兼容。
- 每个 builder 的输出必须明确 `mode/source`，说明不影响 runtime。

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ../../node_modules/.bin/jest src/lib/__tests__/china-read-models.unit.spec.ts --runInBand
cd packages/api && ../../node_modules/.bin/medusa build
git diff --check -- packages/api/src/lib packages/api/src/api/store/china/discovery/route.ts .codex/queue.md project-ledger
```
