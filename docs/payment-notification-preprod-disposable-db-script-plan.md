# Payment Notification Preprod Disposable DB Script Plan

更新时间：2026-05-08 13:10 Asia/Shanghai

## 目标

规划未来 `.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh` 的输入、输出和安全门禁。

本轮不新增脚本，不连接数据库，不注册 migration，不执行 workflow。

## 脚本定位

未来脚本只用于 disposable preprod DB smoke，不得用于 production。

脚本应验证：

- migration up/down。
- inbox insert。
- duplicate replay。
- rejected path。
- event log action。
- sensitive data leak checks。
- cleanup / rollback。

脚本不得：

- 写真实 payment/order/refund/settlement/commission/permission 状态。
- 使用支付宝或微信支付真实 provider。
- 执行 payment workflow。
- 打印真实 DB URL、password、secret、signature、raw payload。

## 输入参数

建议使用显式 flags，不从 `.env` 自动读取：

```bash
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh \
  --host "<host>" \
  --port "<port>" \
  --database "<disposable-db>" \
  --user "<user>" \
  --sslmode "<require|disable>" \
  --confirm-disposable "<disposable-db>" \
  --commit-sha "<sha>"
```

不接受：

- password CLI 参数。
- URL 形式完整 connection string。
- production-like database name。
- provider secret。

密码如未来必须使用，只能通过交互或外部 secret manager 注入，不写入仓库、不写入日志。

## 安全检查

脚本启动前必须：

1. 检查 `--confirm-disposable` 等于 `--database`。
2. 拒绝 database name 包含 `prod`、`production`、`main`。
3. 拒绝 host 为空。
4. 输出 masked host 和 database name。
5. 要求 operator 输入一次确认。
6. 检查 git 工作区干净，或只允许 docs-only diff。
7. 检查当前 commit sha 等于参数。
8. 检查本地 harness 通过。

## 输出格式

建议输出机器可读 JSON 到临时目录：

```json
{
  "task": "payment-notification-preprod-disposable-db-smoke",
  "executedAt": "ISO-8601",
  "commitSha": "<sha>",
  "target": {
    "hostMasked": "***",
    "database": "<disposable-db>",
    "sslmode": "require"
  },
  "checks": {
    "migrationUp": "passed",
    "accepted": "passed",
    "duplicate": "passed",
    "rejected": "passed",
    "leakCheck": "passed",
    "cleanup": "passed"
  }
}
```

不得输出：

- password。
- full DB URL。
- raw payload。
- signature。
- secret。

## 失败处理

失败时脚本必须：

- 停止继续执行。
- 记录失败阶段。
- 尝试 rollback / cleanup。
- 输出 cleanup 状态。
- 不重试真实 provider。
- 不修改真实订单或支付状态。
- 不自动切换目标数据库。

## Go / No-Go

Go：

- 用户明确提供 disposable preprod DB。
- 用户明确授权连接。
- 目标 DB 非 production。
- 本地 harness 和 smoke 已通过。
- 有 rollback owner。

No-Go：

- 需要真实支付凭据。
- 目标 DB 不可删除。
- 需要 workflow execution。
- 需要注册 production migration。
- 无法确认 commit sha。

## 后续拆分

1. `payment-notification-preprod-disposable-db-script-plan`
   - docs-only，本文件。
2. `payment-notification-preprod-disposable-db-script`
   - 新增脚本，但不执行外部 DB。
3. `payment-notification-preprod-disposable-db-execution`
   - blocked-external，等待用户明确授权和 DB。

## 当前结论

可以下一步写脚本 skeleton，但默认不得执行外部 DB，且必须保持 production refusal。
