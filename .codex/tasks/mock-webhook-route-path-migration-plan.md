# mock-webhook-route-path-migration-plan

## 目标

规划 mock payment webhook 从 Admin 本地调试入口迁移到 neutral provider callback route 的路径和 PR 拆分。

本任务只写文档，不新增 route、不修改 runtime。

## 背景

当前 mock route 位于：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

该路径可以继续作为本地 Admin 调试入口，但不能作为支付宝、微信支付或未来真实 provider 的异步通知 callback 入口。

真实 provider callback 的安全边界应该是：

- provider signature verification
- idempotency key
- retry-safe inbox
- audit event log

而不是 Admin session 或后台登录态。

## 允许修改

- `.codex/tasks/mock-webhook-route-path-migration-plan.md`
- `docs/mock-webhook-route-path-migration-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `.codex/scripts/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 必须覆盖

- 为什么 `/admin/**` 不适合作为真实 provider callback。
- neutral route 推荐路径。
- Admin mock route 的保留、降级或废弃策略。
- neutral route 默认 disabled 的安全要求。
- 后续 smoke script 必须等待 neutral route 明确后再写。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限。

## 推荐路径

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
packages/api/src/api/china/payment-webhooks/alipay/route.ts
packages/api/src/api/china/payment-webhooks/wechat/route.ts
```

## 验证

```bash
git diff --check
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
git diff --name-only
```

验证期望：

- 本任务不新增 `packages/**` diff。
- runtime grep 只应命中当前已存在的 Admin mock webhook route 和对应测试。
- diff 只包含本任务允许的文档、queue 和 ledger 文件。

## 不自动执行

- 不自动 commit，除非用户明确授权。
- 不自动 push，除非用户明确授权。
- 不自动创建 PR，除非用户明确授权。
