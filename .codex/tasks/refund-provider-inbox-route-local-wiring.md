# Refund Provider Inbox Route Local Wiring

## 任务

把 provider refund inbox route 从 disabled skeleton 推进到 development/local/in-memory/fixture-only 的 inbox wiring。

## 范围

- Provider route 仅在 local gate 通过后读取 body。
- 调用微信支付 / 支付宝 refund verifier contract。
- 将 verifier result 归一化为 inbox-only envelope。
- 写 local in-memory refund inbox repository。
- 更新 focused tests、docs、queue 和 ledger。

## 非目标

- 不修改 `apps/**`。
- 不连接 DB。
- 不注册 module。
- 不接 SDK。
- 不写真实密钥、证书、公钥、webhook token 或 DB URL。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- Focused route / config / response / local repository / normalizer tests。
- API typecheck。
- Payment notification harness。
- Runtime grep。
- `git diff --check`。
- 子智能体只读复核。
