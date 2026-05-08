# Mock Provider Runtime Preprod Smoke Plan

更新时间：2026-05-08 16:08 Asia/Shanghai

## 结论

下一步不能直接连接预发或生产数据库。`POST /china/payment-providers/mock` 已经有本地 disposable DB smoke wrapper，但进入 disposable preprod DB 前，还需要一个独立的 operator plan 和默认不连接外部 DB 的脚本 skeleton。

本文件只规划，不执行外部连接，不写脚本，不修改 runtime。

## 目标

验证 mock provider runtime 的 preprod disposable DB 环境能否安全完成：

- `disabled`: runtime gate 关闭时返回 disabled，不读 body，不写 inbox。
- `accepted`: fake signed mock provider notification 写入 inbox/event log。
- `duplicate`: 同一 fake event 重放命中幂等，不重复写 inbox。
- `rejected`: missing signature / invalid signature 不写 inbox/event log。

所有场景仍然是 inbox-only，不能执行 payment workflow。

## 前置条件

必须同时满足：

- 用户明确提供 disposable preprod DB，且确认可删除。
- DB owner、备份 owner、回滚 owner 明确。
- DB name 必须包含 disposable / dry_run / codex 语义，不允许 production-like 名称。
- 连接 host 不能是生产 host，不能复用生产库名。
- 已有备份或明确说明无需备份，因为 DB 是一次性 disposable。
- 本地 branch HEAD 必须等于计划执行的 commit sha。
- `medusa-config.ts` 未注册 `china-payment-notification` 或 `mock_china_pay` production runtime。

## 禁止输入

未来脚本必须拒绝：

- full connection string CLI 参数。
- password CLI 参数。
- provider secret CLI 参数。
- raw payload CLI 参数。
- production / prod / live / master / primary 等 DB name。
- 未显式声明 disposable 的 DB。
- 非 mock provider。
- 支付宝、微信支付、退款、对账、结算、佣金或权限相关参数。

敏感信息只能来自环境变量，且日志不得回显。

## 建议变量

```bash
MOCK_PROVIDER_PREPROD_DB_HOST=
MOCK_PROVIDER_PREPROD_DB_PORT=
MOCK_PROVIDER_PREPROD_DB_USER=
MOCK_PROVIDER_PREPROD_DB_NAME=
MOCK_PROVIDER_PREPROD_COMMIT_SHA=
MOCK_PROVIDER_PREPROD_OPERATOR=
MOCK_PROVIDER_PREPROD_ROLLBACK_OWNER=
```

如果未来需要密码，应只允许 `PGPASSWORD` 或本地安全 secret store；脚本不得打印。

## 执行阶段

1. `--print-plan`
   - 只输出计划。
   - 不连接数据库。
   - 不启动 API。

2. `--validate-inputs-only`
   - 校验变量格式和禁止输入。
   - 校验 git commit sha。
   - 不连接数据库。

3. `--preflight`
   - 只在明确授权后连接 disposable DB。
   - 校验 DB 当前为空或符合 disposable 预期。
   - 校验 migration skeleton 可 up/down。
   - 不启动 API。

4. `--smoke`
   - 只在 `--preflight` 通过且用户明确授权后执行。
   - 使用临时 API 端口。
   - runtime `CODEX_DATABASE_URL` 指向 disposable preprod DB。
   - 覆盖 disabled / accepted / duplicate / rejected。
   - 不执行 payment workflow。

## 输出与脱敏

脚本不得输出：

- raw payload。
- fake signature。
- mock secret。
- DB password。
- full DB URL。
- authorization/header values。
- raw event metadata。
- 临时 API log 内容。

失败时只输出固定错误码、场景名、计数摘要和日志路径。

## Cleanup 和残留检查

执行后必须检查：

- 临时 API 端口已释放。
- 只清理脚本自己启动的 API 进程。
- disposable DB 是否需要删除，由 operator plan 明确；默认 preprod 阶段不自动删除外部 DB，除非用户明确要求。
- inbox/event log 计数和 action 摘要已记录。
- 没有 payment workflow、order、refund、settlement、commission、payout 或 permission 状态变更。

## Go / No-Go

Go:

- disposable DB 条件满足。
- 输入校验通过。
- 本地 smoke 和 harness 已通过。
- preflight up/down 通过。
- operator / rollback owner 明确。

No-Go:

- DB 名像生产库。
- 无法确认 disposable。
- 有真实 provider 参数。
- 有 payment workflow execution flag。
- `medusa-config.ts` 出现 production runtime 注册。
- 输出会泄漏敏感信息。

## 后续拆分

1. `mock-provider-runtime-preprod-smoke-script`
   - 新增默认不连接外部 DB 的脚本 skeleton。
   - 只支持 `--print-plan` 和 `--validate-inputs-only`。

2. `mock-provider-runtime-preprod-preflight`
   - 用户提供 disposable preprod DB 后，才执行 preflight。

3. `mock-provider-runtime-preprod-smoke-execution`
   - 只有 preflight 通过后，才执行完整 smoke。

支付宝、微信支付、退款、对账和商家结算仍必须继续串行，不能进入本计划。
