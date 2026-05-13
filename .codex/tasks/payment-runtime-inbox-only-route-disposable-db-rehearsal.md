# Payment Runtime Inbox Only Route Disposable DB Rehearsal

## 任务

在 `mock-webhook-db-backed-route-runtime` 已落地的前提下，针对 inbox-only、默认关闭、仅限 local/disposable DB 的 payment notification route 做一次可重复的 disposable DB rehearsal。

目标是产出 runtime 证据链，而不是推进 workflow、payment success state 或真实 provider 接入。

## 范围

- 仅限 payment notification inbox-only route 的 runtime rehearsal。
- 仅限 local / disposable DB 环境，不连接 external DB、preprod DB、production DB。
- 可包含：
  - route 开关与环境门禁检查
  - disposable DB 建库、跑练习、清理与残留复查
  - mock/fake payload 注入与响应采集
  - duplicate / invalid signature / rejected payload / redaction 覆盖
  - focused tests、API typecheck、runtime grep / registration check、`git diff --check`
  - rehearsal 结果文档或 operator evidence capture
- 保持 inbox / audit-only 语义，不越过 command adapter / workflow boundary。

## 非目标

- 不接真实支付 provider。
- 不接真实订单支付闭环，不接 checkout、order、payment runtime。
- 不写 payment success，不推进 payment / order state mutation。
- 不启用 workflow execution，不接 command adapter runtime。
- 不连接 preprod / production DB。
- 不引入 settlement、commission、payout、permission、fulfillment、logistics 侧效应。
- 不新增生产凭据、真实签名材料或外部依赖。

## 验证

- focused tests 通过。
- API typecheck 通过。
- rehearsal 覆盖并有证据：
  - 正常 mock payload 入 inbox
  - duplicate payload 被正确识别
  - invalid signature 被拒绝
  - rejected payload 被拒绝
  - response / log redaction 生效
- runtime grep / registration check 证明：
  - route 仍是 inbox-only
  - runtime 默认关闭
  - 未注册真实 provider / workflow execution
- disposable DB rehearsal 完成后，临时库清理成功且无残留。
- `git diff --check` 通过。
- 形成一份简短 rehearsal evidence 记录，供下一步 `payment-workflow-command-adapter-disabled-runtime` 使用。

## 风险

- 最大风险是 rehearsal 被误做成“半个真实 runtime”，越界到 workflow 或 state mutation。
- 其次是环境门禁不严，误连外部 DB 或把 local-only 配置带入后续环境。
- 还要防止 duplicate / invalid signature / redaction 覆盖不完整，导致下一步缺少足够证据。
