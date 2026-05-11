# Refund Provider Inbox Route Disposable DB

## 任务

实现 `refund-provider-inbox-route-disposable-db`：让微信支付 / 支付宝 provider refund inbox route 在严格 local disposable DB gate 下写入 refund inbox / event log。

## 范围

- 允许修改 provider refund inbox routes、local disposable DB resolver、route config、local PG client 和 focused tests。
- 新增 `docs/refund-provider-inbox-route-disposable-db.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。

## 非目标

- 不修改 `apps/**`。
- 不连接预发、生产或普通共享数据库。
- 不注册 module。
- 不接真实支付宝 / 微信支付 SDK。
- 不写真实密钥、证书、公钥、webhook token 或 DB URL。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 必须保持

- 未通过 config / DB gate 前不读取 body。
- DB gate 必须校验 local DB URL、DB name prefix、当前连接库名、server host 和 port。
- 所有 response 保持 `runtimeMutationBlocked: true`、`stateMutationBlocked: true`、`refundSuccessState: false`。
- `accepted`、`duplicate`、`manual_review`、`processed_for_audit_only`、`query_required` 均不代表退款成功。

## 验证

- Focused route / config / response / repository / local PG tests。
- API typecheck。
- Payment notification harness。
- Refund real-adapter rehearsal。
- Runtime grep。
- `git diff --check`。
- 子智能体只读复核。
