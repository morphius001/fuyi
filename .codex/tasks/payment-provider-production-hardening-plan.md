# payment-provider-production-hardening-plan

## 目标

为真实支付宝 / 微信支付 Provider 进入 sandbox 或 production-disabled 前建立生产加固计划，覆盖密钥、证书、验签、回调、幂等、日志、回滚和发布门禁。

## 范围

- 支付宝 / 微信支付官方文档核验后的高层要求。
- Provider 配置和密钥管理。
- notify_url / return_url 边界。
- sandbox / disabled-by-default / rollback。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不接真实支付宝或微信支付。
- 不写真实 app id、merchant id、私钥、证书或 webhook token。
- 不注册 migration，不连接外部 DB，不执行 payment workflow。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/payment-provider-production-hardening-plan.md`
- ledger / queue 更新

