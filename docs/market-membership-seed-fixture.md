# Market Membership Seed Fixture

更新时间：2026-05-07 Asia/Shanghai

## 目标

为 market membership 后续 DB QA 提供一套可复用的测试 fixture。它只存在于单元测试目录，不是生产 seed，不会写入真实业务数据库。

## 文件

```text
packages/api/src/modules/china-market-read-model/__tests__/market-membership-test-fixture.ts
```

## 覆盖数据

- 市场：三门海鲜市场、舟山沈家门市场。
- 商户：测试鲜活档。
- 档口：主档口 `A区18号`，跨市场档口 `B区06号`。
- 商户类型：鲜活水产、市场物料、外地批发商。
- 公告：商户公告与消费者公告，用于验证商户上下文不会泄露消费者公告。
- 营业时间：周一测试营业时段。
- 配送能力：市场自提、市场统一配送展示。
- 异常行：deleted、缺必填、未知枚举、错误 audience、错误 weekday，用于验证 adapter 会过滤。

## 安全边界

本 fixture 不包含：

- 真实商户、真实手机号、真实证照或真实订单。
- 真实支付、短信、IM、物流、直播或 AI provider credential。
- 生产 seed 写入逻辑。
- route 运行时写入逻辑。
- checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 使用位置

- repository adapter 单元测试复用正常 fixture 和异常行 fixture。
- Vendor market context helper 单元测试复用正常 fixture，验证 repository 数据优先、fallback 保留、runtimeEnabled 仍为 `false`。

## 验证

已验证：

- `bun --cwd packages/api test:unit -- --runTestsByPath src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts`: passed，2 suites / 8 tests.
- `bun --cwd packages/api test:unit -- --runTestsByPath src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts`: passed，1 suite / 4 tests.
- `bunx tsc --noEmit -p packages/api/tsconfig.json`: passed.
- `git diff --check`: passed.
- `prettier --check` for task/doc/queue/test files: passed.
