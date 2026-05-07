# Mock Webhook DB-backed Route Resolver Plan

更新时间：2026-05-07 22:55 Asia/Shanghai

## 目标

规划 neutral mock webhook route 的 repository resolver contract。

目标 route：

```text
POST /china/payment-webhooks/mock
```

本计划只定义后续 resolver 的职责和安全边界，不实现 resolver，不接 route，不连接数据库。

## 背景

neutral route 是唯一 mock provider callback 演进路径。

旧 Admin route 已 disabled-only：

```text
POST /admin/china/mock-payment-webhooks
```

后续 DB-backed inbox 只能沿 neutral route 做 mock-only、local-only、inbox-only 演进。

## Resolver 职责

Resolver 只回答一个问题：

```text
当前请求环境是否允许 route 获得一个 PaymentNotificationInboxRepositoryContract？
```

第一版 resolver 的返回值建议为：

```ts
type MockWebhookRepositoryResolution =
  | {
      status: "disabled";
      reason: "runtime_disabled" | "production_disabled" | "local_db_not_enabled";
    }
  | {
      status: "unavailable";
      reason: "repository_not_configured" | "transaction_client_missing";
    }
  | {
      status: "available";
      repository: PaymentNotificationInboxRepositoryContract;
      source: "local_disposable_db";
    };
```

## 默认行为

- 默认返回 `disabled`。
- `NODE_ENV=production` 返回 `disabled`。
- provider 不是 `mock_china_pay` 返回 `disabled`。
- mode 不是 `mock_inbox_only` 返回 `disabled`。
- local DB flag 缺失返回 `disabled`。
- transaction client 缺失返回 `unavailable`。

第一版 route 收到 `disabled` 或 `unavailable` 时建议统一返回 disabled response，避免操作者误以为 DB-backed runtime 已经可用。

## Local Disposable Injection

只有本地 smoke / test harness 可以注入 repository。

建议输入：

```ts
type MockWebhookRepositoryResolverInput = {
  runtimeConfigInput: Record<string, string | undefined>;
  nodeEnv: string | undefined;
  transactionClient?: unknown;
  repositoryFactory?: (client: unknown) => PaymentNotificationInboxRepositoryContract;
};
```

要求：

- `transactionClient` 只能来自 local disposable DB smoke。
- `repositoryFactory` 只能在测试或 local smoke 中注入。
- resolver 不读取 `.env` 里的真实 production database URL。
- resolver 不创建新的 DB connection。
- route 不知道底层 DB 来源，只消费 repository contract。

## 禁止事项

Resolver 不允许：

- import production DB client。
- import Medusa container 并解析 production repository。
- 写 payment、order、refund、settlement、payout、commission 或 permission 表。
- 调用 payment workflow。
- 接真实支付宝或微信支付验签配置。
- 在 production 返回 `available`。

## 测试清单

后续 `mock-webhook-db-backed-route-resolver-contract` PR 至少覆盖：

- 默认 disabled。
- runtime disabled。
- production disabled。
- provider 非 mock disabled。
- mode 非 `mock_inbox_only` disabled。
- local DB flag 缺失 disabled。
- transaction client 缺失 unavailable。
- repository factory 缺失 unavailable。
- local disposable input available。
- response 不包含 database URL、secret、签名、raw payload。

## 后续 PR

1. `mock-webhook-db-backed-route-resolver-contract`
   - 新增 resolver 类型、纯 helper 和 mocked tests。
   - 不接 route。
   - 不接 DB。

2. `mock-webhook-db-backed-route-local-script-plan`
   - 规划 local disposable DB smoke wrapper。
   - 不新增脚本。

3. `mock-webhook-db-backed-route-local-script`
   - 新增本地脚本。
   - 只管理临时 DB 和临时 API。
   - 不修改 `.env`。

4. `mock-webhook-db-backed-route-skeleton`
   - route 在 local DB flag + injected resolver available 下才写 inbox。
   - 仍不执行 workflow。
   - production disabled。

## 停止点

resolver contract 合并后必须先跑 harness、typecheck 和 runtime grep。

在 local disposable DB smoke wrapper 完成前，不应把 resolver 接到 neutral route。

在 migration registration 和 disposable preprod DB dry-run 完成前，production resolver 必须保持 disabled。
