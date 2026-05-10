# Refund Provider Inbox Route Shadow Plan

## 任务

细化未来 `refund-provider-inbox-route-shadow` implementation PR 的文件范围、feature flag、provider wiring、response redaction 和测试门禁。

## 范围

- 新增 `docs/refund-provider-inbox-route-shadow-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做 implementation plan，不新增 route、不修改 runtime。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不新增 route implementation。
- 不连接 DB。
- 不注册 module。
- 不接 SDK。
- 不写真实密钥、证书、公钥、webhook token 或 DB URL。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 必须覆盖

- 后续 implementation PR 的 planned files、feature flags、environment gate、request handling order 和 response shape。
- 微信支付 / 支付宝 route 只能调用已存在 verifier 合同和 inbox repository contract，不能直接写业务状态。
- route disabled 时必须不读 body。
- local / disposable preprod gate、production blocked、state mutation blocked。
- response / audit / event metadata redaction helper 的 denylist。
- focused tests、harness、runtime grep、rollback 和 PR 拆分顺序。

## 验证

- `git diff --check`
- `git status --short --branch`
- 子智能体只读复核。
