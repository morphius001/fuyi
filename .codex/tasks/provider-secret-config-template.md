# provider-secret-config-template

## 目标

整理中国本地支付 Provider 的 secret/config key 模板，作为后续 disabled-by-default adapter、sandbox rehearsal 和生产门禁的配置索引。

## 范围

- 支付 Provider registry / runtime gate 的开关 key 名。
- 支付宝和微信支付 sandbox / production-disabled 的 secret reference key 名。
- notify_url / return_url base 的非密钥配置 key 名。
- 本地、sandbox、production 三类环境的允许状态。
- 日志脱敏、轮换、回滚和上线 No-Go。

## 非目标

- 不修改 `.env`、`.env.template` 或任何真实部署配置文件。
- 不写真实 app id、商户号、私钥、APIv3 key、证书、公钥、token 或 DB URL。
- 不接支付宝 / 微信支付 SDK。
- 不接 checkout。
- 不执行 payment workflow，不注册 migration，不连接外部 DB。
- 不处理退款、对账、结算、佣金、打款或分账。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/provider-secret-config-template.md`
- ledger / queue 更新
