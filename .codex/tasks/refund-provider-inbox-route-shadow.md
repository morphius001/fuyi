# Refund Provider Inbox Route Shadow

## 任务

新增真实 provider refund notification inbox route 的 disabled shadow skeleton。

## 范围

- 新增支付宝 / 微信支付 refund provider inbox route skeleton。
- 新增 route config parser 和 safe response redaction helper。
- 新增 focused unit tests。
- 更新 docs / queue / ledger。

## 非目标

- 不修改 `apps/**`。
- 不接 SDK。
- 不写真实密钥、证书、公钥、webhook token 或 DB URL。
- 不连接数据库。
- 不注册 module。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- Focused route / config / response tests。
- API typecheck。
- Payment notification harness。
- Runtime grep。
- `git diff --check`。
