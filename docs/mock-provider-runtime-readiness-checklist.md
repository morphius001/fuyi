# Mock Provider Runtime Readiness Checklist

更新时间：2026-05-08 15:05 Asia/Shanghai

## 目的

本清单用于判断 mock China PaymentProvider 是否可以从 contract-only 进入下一阶段 runtime 设计。

当前结论：**还不能直接接 runtime**。

## 已具备

- Mock notification skeleton。
- Inbox / event log migration skeleton。
- Local disposable DB dry-run。
- Neutral mock webhook route local-only DB smoke。
- Runtime gate pure function。
- Preprod disposable DB checklist。
- Preprod disposable DB script skeleton。
- Mock China PaymentProvider contract。
- Payment provider registry contract。
- Registry + runtime gate composition tests。
- Readiness report。

## Runtime 前 Go 条件

全部满足才可以创建下一阶段 runtime 设计 PR：

- Harness 通过。
- API typecheck 通过。
- `packages/api/medusa-config.ts` 仍未注册 `china-payment-notification`。
- Local disposable DB 无残留。
- Registry 默认 disabled。
- Registry production blocked。
- Registry 缺显式非生产 `nodeEnv` blocked。
- Registry 只允许 `mock_china_pay`。
- Runtime gate 默认 disabled。
- Runtime gate 缺 DB runtime blocked。
- Runtime gate 缺 migration registration blocked。
- Runtime gate 缺 preprod disposable DB verification blocked。
- Runtime gate 缺 provider adapter verification blocked。
- Workflow execution gate 独立 blocked。
- notify URL 仍以后端异步通知为准。
- return URL 仍只允许展示 pending，不可作为支付成功依据。

## Runtime 前 No-Go

任一命中就不能进入 runtime：

- 需要真实支付宝或微信支付商户号。
- 需要真实 app id、mch id、private key、public key、证书、webhook token 或 provider secret。
- 需要把密钥写入仓库、文档或日志。
- 需要修改 `packages/api/medusa-config.ts` 注册生产 provider。
- 需要连接生产或不可删除 DB。
- 需要跳过 inbox / state guard / command mapper。
- 需要执行 payment workflow。
- 需要改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。
- 需要把退款、对账、结算、佣金或权限混入同一 PR。
- 需要前端 return URL 作为支付成功依据。

## 下一阶段建议拆分

### PR 1: mock-provider-runtime-design

只设计 runtime wiring，不写 runtime code。

必须说明：

- route 输入。
- adapter registry 调用。
- runtime gate 调用。
- inbox write。
- command prepare。
- audit event。
- failure mapping。
- rollback。

### PR 2: mock-provider-runtime-disabled-skeleton

新增 disabled skeleton。

要求：

- 默认 disabled。
- production disabled。
- 不读取 body。
- 不连接 DB。
- 不调用 provider adapter。
- 不执行 workflow。

### PR 3: mock-provider-runtime-local-inbox-only-plan

只规划 local disposable DB inbox-only runtime。

要求：

- 必须依赖 local disposable DB。
- 仍不执行 payment workflow。

### PR 4: preprod-disposable-db-execution

继续 `blocked-external`。

要求：

- 用户明确提供 disposable preprod DB。
- 有备份/回滚 owner。
- 目标 DB 可删除。
- 用户明确授权连接。

## 当前推荐下一项

下一项可做 `mock-provider-runtime-design`，但仍然只能写文档，不写 runtime code。
