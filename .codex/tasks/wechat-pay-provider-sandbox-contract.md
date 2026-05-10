# wechat-pay-provider-sandbox-contract

## 目标

定义微信支付 Provider sandbox contract，为后续 contract-only 或 disabled-by-default adapter 做输入输出、验签、解密、通知归一化、错误映射和测试矩阵准备。

## 范围

- 微信支付 create payment / query / close / notify normalize / verify-decrypt 的合同。
- sandbox / production 配置隔离。
- notify_url / return_url 边界。
- APIv3 key、商户证书、平台证书或微信支付公钥 reference 要求。
- fake notify tests。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不接微信支付 SDK。
- 不接 checkout。
- 不写真实 app id、商户号、私钥、APIv3 key、证书、公钥或 token。
- 不执行 payment workflow，不注册 migration，不连接外部 DB。
- 不处理退款、对账、结算、佣金、打款或分账。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/wechat-pay-provider-sandbox-contract.md`
- ledger / queue 更新
