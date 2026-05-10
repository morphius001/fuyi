# Refund Inbox Disabled Route Skeleton Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

下一步可以实现 refund inbox disabled route skeleton，但只能做默认关闭的 route 壳。该 skeleton 的唯一职责是明确 refund inbox route 尚未启用，并在任何环境下阻断真实退款 runtime。

本计划仍不新增 route、不修改 `packages/**`。如果后续进入 skeleton PR，也必须保持不读 body、不验签、不 normalize、不连接 DB、不写 inbox、不调用 provider refund API、不执行 workflow。

## 未来文件范围

未来 disabled skeleton PR 只允许小范围文件：

```text
packages/api/src/api/china/refund-inbox/mock/route.ts
packages/api/src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts
docs/refund-inbox-disabled-route-skeleton.md
```

可选：

```text
.codex/scripts/payment-notification-idempotency-harness.sh
```

只有在 harness 需要纳入新 focused route test 时才允许更新。

禁止：

- `packages/api/medusa-config.ts`
- `packages/api/src/modules/**` runtime 变更
- `apps/**`
- `package.json`
- lockfile
- `.env*`
- provider credential / secret templates 之外的密钥材料

## Disabled 行为

默认 response 建议：

```json
{
  "status": "disabled",
  "surface": "refund_inbox",
  "provider": "mock_china_pay",
  "runtime": "disabled",
  "runtimeMutationBlocked": true,
  "reason": "Refund inbox route is disabled."
}
```

要求：

- 不读取 request body。
- 不验证 signature。
- 不 normalize refund payload。
- 不计算 digest。
- 不生成 idempotency key。
- 不连接 DB。
- 不调用 refund inbox repository。
- 不写 inbox 或 event log。
- 不调用 provider refund API。
- 不执行 payment / refund workflow。
- 不修改 order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics。

## Production 行为

Production 必须继续 blocked，即使传入任何 mock env：

```json
{
  "status": "disabled",
  "surface": "refund_inbox",
  "runtime": "production_blocked",
  "runtimeMutationBlocked": true
}
```

Production blocked 分支也必须不读 body、不连接 DB、不调用任何 verifier / repository / provider / workflow。

## Method Handling

建议：

- `POST`: 返回 disabled / production blocked。
- 非 `POST`: 返回 `405 Method Not Allowed`。

非 `POST` 也不得读取 body。

状态码建议：

- `503 Service Unavailable`: runtime disabled / not ready。
- `405 Method Not Allowed`: 非 POST。

不要返回 `200`，避免外部系统误判 refund route 已可用。

## Response Redaction

disabled response 不得包含：

- raw request body
- provider payload
- signature header
- fake secret
- DB URL
- provider credential
- workflow command
- refund state mutation command
- settlement / commission / payout adjustment
- full phone / identity number / bank card / full address

## 测试清单

未来 skeleton PR 应覆盖：

1. 默认 POST 返回 disabled。
2. production POST 返回 production blocked。
3. disabled 时不读取 body。
4. production blocked 时不读取 body。
5. disabled 时不调用 verifier。
6. disabled 时不调用 normalizer。
7. disabled 时不调用 repository。
8. disabled 时不连接 DB。
9. disabled 时不调用 provider refund API。
10. disabled 时不执行 workflow。
11. disabled response 不包含 raw payload、signature、secret、DB URL、workflow command 或 state mutation command。
12. 非 POST 返回 405。
13. runtime grep 确认没有 provider refund request、workflow execution、settlement / commission / payout adjustment。

## 后续拆分

建议顺序：

1. `refund-inbox-disabled-route-skeleton`
   - 新增 disabled route skeleton 和 focused tests。
   - 默认 disabled / production blocked。
   - 不读 body、不接 DB、不调 repository、不执行 workflow。

2. `refund-inbox-disabled-route-validation`
   - 合并后验证 focused tests、API typecheck、payment harness、runtime grep 和 diff check。

3. `refund-inbox-local-inbox-only-route-plan`
   - 规划 fake/local inbox-only route gate。
   - 仍只允许 local disposable DB / in-memory，不接真实 Provider。

## Go / No-Go

Go：

- 进入 disabled route skeleton。
- 只实现 disabled / production blocked response。
- 补充不读 body、不调用依赖、不泄露响应的 focused tests。

No-Go：

- fake payload accepted into inbox。
- 连接 local disposable DB。
- 调用 refund verifier / normalizer / repository。
- 调用 provider refund API。
- 执行 payment / refund workflow。
- 写 refund success state。
- settlement、commission、payout、permission、fulfillment 或 logistics 状态写入。

这些能力需要后续单独 route local inbox-only 计划和验证。

## 验证记录

本轮为 docs-only plan；验证要求：

```bash
git diff --check
git diff --name-only
git status --short --branch
git ls-files --others --exclude-standard
```

提交前需要子智能体只读复核，重点确认没有 `apps/**` / `packages/**` runtime 变更，以及下一步 skeleton 仍保持 disabled-only。
